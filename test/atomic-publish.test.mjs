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
  region: '香港島',
  district: '灣仔區',
  address: 'Address',
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
    ssr: { count: 0 },
    partner_pdf: { pdf_total: 0, pdf_success: 0, pdf_failed: 0, records: 0, errors: [] }
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

test('atomicPublish: failure injection causes complete rollback to original state', async () => {
  const rootDir = join(tmpdir(), `test-pub-fail-${Date.now()}`);
  const dataDir = join(rootDir, 'data');
  const reportsDir = join(rootDir, 'reports');

  await mkdir(dataDir, { recursive: true });
  await mkdir(reportsDir, { recursive: true });

  // Pre-existing published dataset ("v1")
  const origContent = JSON.stringify([{ code: 'ORIGINAL_V1' }]);
  await writeFile(join(dataDir, 'locations.json'), origContent, 'utf8');
  await writeFile(join(dataDir, 'stores.json'), origContent, 'utf8');
  await writeFile(join(dataDir, 'lockers.json'), origContent, 'utf8');
  await writeFile(join(dataDir, 'partners.json'), origContent, 'utf8');
  await writeFile(join(dataDir, 'locations-by-district.json'), origContent, 'utf8');
  await writeFile(join(dataDir, 'metadata.json'), origContent, 'utf8');
  await writeFile(join(reportsDir, 'latest-diff.md'), 'ORIGINAL REPORT', 'utf8');

  // Inject failure at 4th file replacement ('partners.json')
  await assert.rejects(
    atomicPublish({
      records: [mockRecord],
      metadata: mockMetadata,
      reportMarkdown: '# New Report',
      dataDir,
      reportsDir,
      rootDir,
      options: { failAtFile: 'partners.json' }
    }),
    /Atomic publish failed with rollback executed/
  );

  // Verify EVERY file was rolled back to original content
  assert.equal(await readFile(join(dataDir, 'locations.json'), 'utf8'), origContent);
  assert.equal(await readFile(join(dataDir, 'stores.json'), 'utf8'), origContent);
  assert.equal(await readFile(join(dataDir, 'lockers.json'), 'utf8'), origContent);
  assert.equal(await readFile(join(dataDir, 'partners.json'), 'utf8'), origContent);
  assert.equal(await readFile(join(dataDir, 'locations-by-district.json'), 'utf8'), origContent);
  assert.equal(await readFile(join(dataDir, 'metadata.json'), 'utf8'), origContent);
  assert.equal(await readFile(join(reportsDir, 'latest-diff.md'), 'utf8'), 'ORIGINAL REPORT');

  // Verify temporary and backup directories were cleaned up
  assert.equal(existsSync(join(rootDir, '.tmp-output')), false);
  assert.equal(existsSync(join(rootDir, '.tmp-backup')), false);

  await rm(rootDir, { recursive: true, force: true });
});

test('atomicPublish: failure injection before report replacement rolls back data files', async () => {
  const rootDir = join(tmpdir(), `test-pub-fail-report-${Date.now()}`);
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
      dataDir,
      reportsDir,
      rootDir,
      options: { failAtFile: 'latest-diff.md' }
    }),
    /Atomic publish failed with rollback executed/
  );

  assert.equal(await readFile(join(dataDir, 'locations.json'), 'utf8'), origContent);
  assert.equal(await readFile(join(reportsDir, 'latest-diff.md'), 'utf8'), 'ORIGINAL REPORT');

  await rm(rootDir, { recursive: true, force: true });
});
