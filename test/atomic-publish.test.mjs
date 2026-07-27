import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { atomicPublish } from '../scripts/lib/atomic-publish.js';

const mockRecord = {
  id: '852A',
  code: '852A',
  type: 'store',
  type_name: '順豐站',
  type_name_en: 'SF Store',
  name: 'Test',
  name_en: 'Test EN',
  region: '香港島',
  region_en: 'Hong Kong Island',
  district: '灣仔區',
  district_en: 'Wan Chai District',
  sub_district: '灣仔',
  sub_district_en: 'Wan Chai',
  address: 'Address',
  address_en: 'Address EN',
  telephone: null,
  business_hours: null,
  business_hours_en: null,
  location: { latitude: 22.28, longitude: 114.17 },
  source: 'api_tc',
  quality_flags: [],
  provenance: { name: 'api_tc', address: 'api_tc', district: 'api_tc' },
  retrieved_at: '2026-07-27'
};

const mockMetadata = {
  schema_version: 2,
  retrieved_at: '2026-07-27',
  counts: { total: 1, stores: 1, lockers: 0, partners: 0 },
  source_status: {
    api_tc: { areas_total: 1, areas_success: 1, areas_failed: 0 },
    api_en: { areas_total: 1, areas_success: 1, areas_failed: 0 },
    ssr: { count: 0, errors: [] },
    partner_pdf: { pdf_total: 0, pdf_success: 0, pdf_failed: 0, status: 'success', records: 0, errors: [] }
  },
  coverage: { tc_record_count: 1, en_record_count: 1, bilingual_match_rate: 1, district_resolved_count: 1, district_unresolved_count: 0 },
  quality: { blocking_errors: 0, warnings: 0, flag_counts: {} }
};

test('atomicPublish: successful publication updates all files atomically', async () => {
  const rootDir = join(tmpdir(), `test-pub-success-${Date.now()}`);
  const dataDir = join(rootDir, 'data');
  const reportsDir = join(rootDir, 'reports');

  await mkdir(dataDir, { recursive: true });
  await mkdir(reportsDir, { recursive: true });

  await atomicPublish({
    records: [mockRecord],
    metadata: mockMetadata,
    reportMarkdown: '# Test Report',
    dataDir,
    reportsDir,
    rootDir
  });

  assert.ok(existsSync(join(dataDir, 'locations.json')));
  assert.ok(existsSync(join(dataDir, 'stores.json')));
  assert.ok(existsSync(join(dataDir, 'lockers.json')));
  assert.ok(existsSync(join(dataDir, 'partners.json')));
  assert.ok(existsSync(join(dataDir, 'locations-by-district.json')));
  assert.ok(existsSync(join(dataDir, 'metadata.json')));
  assert.ok(existsSync(join(reportsDir, 'latest-diff.md')));

  await rm(rootDir, { recursive: true, force: true });
});

test('atomicPublish failure injection: backup step failure', async () => {
  const rootDir = join(tmpdir(), `test-pub-backup-fail-${Date.now()}`);
  const dataDir = join(rootDir, 'data');
  const reportsDir = join(rootDir, 'reports');
  await mkdir(dataDir, { recursive: true });
  await mkdir(reportsDir, { recursive: true });

  await assert.rejects(
    atomicPublish({
      records: [mockRecord],
      metadata: mockMetadata,
      reportMarkdown: '# Report',
      dataDir, reportsDir, rootDir,
      options: { failAtStep: 'backup' }
    }),
    /Injected failure during backup creation/
  );

  await rm(rootDir, { recursive: true, force: true });
});

test('atomicPublish failure injection: first rename failure rolls back', async () => {
  const rootDir = join(tmpdir(), `test-pub-first-rename-${Date.now()}`);
  const dataDir = join(rootDir, 'data');
  const reportsDir = join(rootDir, 'reports');
  await mkdir(dataDir, { recursive: true });
  await mkdir(reportsDir, { recursive: true });

  const origContent = JSON.stringify([{ code: 'ORIGINAL_V1' }]);
  await writeFile(join(dataDir, 'locations.json'), origContent, 'utf8');

  await assert.rejects(
    atomicPublish({
      records: [mockRecord],
      metadata: mockMetadata,
      reportMarkdown: '# Report',
      dataDir, reportsDir, rootDir,
      options: { failAtStep: 'firstRename' }
    }),
    /Atomic publish failed with full rollback executed/
  );

  assert.equal(await readFile(join(dataDir, 'locations.json'), 'utf8'), origContent);
  await rm(rootDir, { recursive: true, force: true });
});

test('atomicPublish failure injection: middle rename failure rolls back previous replaced files', async () => {
  const rootDir = join(tmpdir(), `test-pub-mid-rename-${Date.now()}`);
  const dataDir = join(rootDir, 'data');
  const reportsDir = join(rootDir, 'reports');
  await mkdir(dataDir, { recursive: true });
  await mkdir(reportsDir, { recursive: true });

  const origContent = JSON.stringify([{ code: 'ORIGINAL_V1' }]);
  await writeFile(join(dataDir, 'locations.json'), origContent, 'utf8');
  await writeFile(join(dataDir, 'stores.json'), origContent, 'utf8');
  await writeFile(join(dataDir, 'lockers.json'), origContent, 'utf8');

  await assert.rejects(
    atomicPublish({
      records: [mockRecord],
      metadata: mockMetadata,
      reportMarkdown: '# Report',
      dataDir, reportsDir, rootDir,
      options: { failAtStep: 'middleRename' } // Fails at lockers.json (3rd file)
    }),
    /Atomic publish failed with full rollback executed/
  );

  // Locations and Stores were replaced before Lockers failed, but rollback restored ALL
  assert.equal(await readFile(join(dataDir, 'locations.json'), 'utf8'), origContent);
  assert.equal(await readFile(join(dataDir, 'stores.json'), 'utf8'), origContent);
  assert.equal(await readFile(join(dataDir, 'lockers.json'), 'utf8'), origContent);

  await rm(rootDir, { recursive: true, force: true });
});

test('atomicPublish failure injection: report rename failure rolls back all data files', async () => {
  const rootDir = join(tmpdir(), `test-pub-report-rename-${Date.now()}`);
  const dataDir = join(rootDir, 'data');
  const reportsDir = join(rootDir, 'reports');
  await mkdir(dataDir, { recursive: true });
  await mkdir(reportsDir, { recursive: true });

  const origContent = JSON.stringify([{ code: 'ORIGINAL_V1' }]);
  await writeFile(join(dataDir, 'locations.json'), origContent, 'utf8');
  await writeFile(join(reportsDir, 'latest-diff.md'), 'ORIGINAL REPORT', 'utf8');

  await assert.rejects(
    atomicPublish({
      records: [mockRecord],
      metadata: mockMetadata,
      reportMarkdown: '# New Report',
      dataDir, reportsDir, rootDir,
      options: { failAtStep: 'reportRename' }
    }),
    /Atomic publish failed with full rollback executed/
  );

  assert.equal(await readFile(join(dataDir, 'locations.json'), 'utf8'), origContent);
  assert.equal(await readFile(join(reportsDir, 'latest-diff.md'), 'utf8'), 'ORIGINAL REPORT');

  await rm(rootDir, { recursive: true, force: true });
});

test('atomicPublish failure injection: rollback failure preserves recovery backups', async () => {
  const rootDir = join(tmpdir(), `test-pub-rollback-fail-${Date.now()}`);
  const dataDir = join(rootDir, 'data');
  const reportsDir = join(rootDir, 'reports');
  await mkdir(dataDir, { recursive: true });
  await mkdir(reportsDir, { recursive: true });

  const origContent = JSON.stringify([{ code: 'ORIGINAL_V1' }]);
  await writeFile(join(dataDir, 'locations.json'), origContent, 'utf8');

  await assert.rejects(
    atomicPublish({
      records: [mockRecord],
      metadata: mockMetadata,
      reportMarkdown: '# Report',
      dataDir, reportsDir, rootDir,
      options: { failAtFile: 'stores.json', failAtStep: 'rollback' }
    }),
    /CRITICAL_ROLLBACK_FAILURE/
  );

  // Check that .tmp-backup directory exists and was NOT deleted
  assert.ok(existsSync(join(rootDir, '.tmp-backup')), 'Backup folder must be preserved when rollback fails');

  await rm(rootDir, { recursive: true, force: true });
});
