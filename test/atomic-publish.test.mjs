import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { atomicPublish } from '../scripts/lib/atomic-publish.js';
import { buildRawSnapshot } from '../scripts/lib/raw-snapshot.js';
import {
  calculateCanonicalDatasetHash,
  calculatePdfTextSnapshotHash,
  calculateReviewedRegistryHash,
  calculateSsrHash,
  sha256
} from '../scripts/lib/source-hashes.js';

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

const tcRaw = '{"success":true,"result":[{"serviceCode":"852A","name":"Test","address":"Address"}]}';
const enRaw = '{"success":true,"result":[{"serviceCode":"852A","name":"Test EN","address":"Address EN"}]}';
const mockRawSnapshot = buildRawSnapshot({
  tcResults: [{
    area: { sourceRegion: '香港', district: '灣仔' },
    language: 'tc', ok: true, status: 200, attempts: 1, error: null,
    rawText: tcRaw, raw_sha256: sha256(tcRaw), records: JSON.parse(tcRaw).result
  }],
  enResults: [{
    area: { sourceRegion: 'Hong Kong', district: 'Wan Chai' },
    language: 'en', ok: true, status: 200, attempts: 1, error: null,
    rawText: enRaw, raw_sha256: sha256(enRaw), records: JSON.parse(enRaw).result
  }],
  ssrRecords: [],
  ssrErrors: [],
  pdfDocuments: [],
  pdfRecords: [],
  quarantinedRecords: [],
  pdfDetails: [],
  pdfErrors: [],
  pdfTotal: 0,
  pdfSuccessCount: 0,
  pdfFailCount: 0,
  pdfStatus: 'success'
}, '2026-07-27');

const mockMetadata = {
  schema_version: 3,
  source_retrieved_at: '2026-07-27',
  generated_at: '2026-07-27',
  retrieved_at: '2026-07-27',
  counts: { total: 1, stores: 1, lockers: 0, partners: 0 },
  count_deltas: {
    total: { previous: 1, current: 1, delta: 0, delta_pct: 0, baseline_available: true, baseline_source: 'test', gate_result: 'pass' },
    stores: { previous: 1, current: 1, delta: 0, delta_pct: 0, baseline_available: true, baseline_source: 'test', gate_result: 'pass' },
    lockers: { previous: 0, current: 0, delta: 0, delta_pct: 0, baseline_available: true, baseline_source: 'test', gate_result: 'pass' },
    partners: { previous: 0, current: 0, delta: 0, delta_pct: 0, baseline_available: true, baseline_source: 'test', gate_result: 'pass' },
    tcCodes: { previous: 1, current: 1, delta: 0, delta_pct: 0, baseline_available: true, baseline_source: 'test', gate_result: 'pass' },
    enCodes: { previous: 1, current: 1, delta: 0, delta_pct: 0, baseline_available: true, baseline_source: 'test', gate_result: 'pass' }
  },
  source_status: {
    api_tc: { areas_total: 1, areas_success: 1, areas_failed: 0 },
    api_en: { areas_total: 1, areas_success: 1, areas_failed: 0 },
    ssr: { count: 0, errors: [] },
    partner_pdf: {
      pdf_total: 0,
      http_success_count: 0,
      parse_success_count: 0,
      semantic_success_count: 0,
      partial_quality_failure_count: 0,
      failed_count: 0,
      valid_record_count: 0,
      quarantined_record_count: 0,
      quarantine_ratio: 0,
      cross_pdf_duplicate_conflict_count: 0,
      status: 'success',
      errors: [],
      details: []
    }
  },
  source_policy: {
    canonical_priority: ['api_tc', 'api_en', 'ssr', 'reviewed_pdf_partner'],
    audit_only_sources: ['pdf_partner'],
    counts: {
      api_canonical_count: 1,
      ssr_only_count: 0,
      reviewed_pdf_supplement_count: 0,
      unreviewed_pdf_candidate_count: 0
    }
  },
  coverage: { tc_record_count: 1, en_record_count: 1, bilingual_match_rate: 1, district_resolved_count: 1, district_unresolved_count: 0 },
  quality: {
    pipeline_blocking_errors: 0,
    pipeline_warnings: 0,
    record_flag_counts_by_severity: { info: 0, warning: 0, error: 0 },
    flag_counts_by_type: {}
  },
  source_integrity: {
    api_tc: {
      raw_snapshot_sha256: mockRawSnapshot.sources.api_tc.raw_snapshot_sha256,
      semantic_sha256: mockRawSnapshot.sources.api_tc.semantic_sha256,
      record_count: mockRawSnapshot.sources.api_tc.record_count,
      duplicate_codes: mockRawSnapshot.sources.api_tc.duplicate_codes,
      record_hashes_ref: '/sources/api_tc/record_hashes'
    },
    api_en: {
      raw_snapshot_sha256: mockRawSnapshot.sources.api_en.raw_snapshot_sha256,
      semantic_sha256: mockRawSnapshot.sources.api_en.semantic_sha256,
      record_count: mockRawSnapshot.sources.api_en.record_count,
      duplicate_codes: mockRawSnapshot.sources.api_en.duplicate_codes,
      record_hashes_ref: '/sources/api_en/record_hashes'
    },
    ssr: compact(calculateSsrHash([])),
    reviewed_registry: compact(calculateReviewedRegistryHash([])),
    canonical: compact(calculateCanonicalDatasetHash([mockRecord])),
    partner_pdf: calculatePdfTextSnapshotHash([])
  }
};

function compact(value) {
  const { record_hashes: _recordHashes, ...result } = value;
  return result;
}

test('atomicPublish: successful publication updates all files atomically', async () => {
  const rootDir = join(tmpdir(), `test-pub-success-${Date.now()}`);
  const dataDir = join(rootDir, 'data');
  const reportsDir = join(rootDir, 'reports');
  const rawDir = join(rootDir, 'raw');

  await mkdir(dataDir, { recursive: true });
  await mkdir(reportsDir, { recursive: true });

  await atomicPublish({
    records: [mockRecord],
    metadata: mockMetadata,
    rawSnapshot: mockRawSnapshot,
    reportMarkdown: '# Test Report',
    dataDir, rawDir,
    reportsDir,
    rootDir
  });

  assert.ok(existsSync(join(dataDir, 'locations.json')));
  assert.ok(existsSync(join(dataDir, 'stores.json')));
  assert.ok(existsSync(join(dataDir, 'lockers.json')));
  assert.ok(existsSync(join(dataDir, 'partners.json')));
  assert.ok(existsSync(join(dataDir, 'locations-by-district.json')));
  assert.ok(existsSync(join(dataDir, 'metadata.json')));
  for (const path of [
    join(dataDir, 'locations.json'),
    join(dataDir, 'stores.json'),
    join(dataDir, 'lockers.json'),
    join(dataDir, 'partners.json'),
    join(dataDir, 'locations-by-district.json'),
    join(dataDir, 'metadata.json'),
    join(rawDir, 'latest-fetch.json'),
    join(reportsDir, 'latest-diff.md')
  ]) {
    const content = await readFile(path, 'utf8');
    assert.match(content, /[^\n]\n$/u, `${path} must have exactly one trailing newline`);
  }
  assert.ok(existsSync(join(rawDir, 'latest-fetch.json')));
  assert.ok(existsSync(join(reportsDir, 'latest-diff.md')));

  await rm(rootDir, { recursive: true, force: true });
});

test('atomicPublish failure injection: raw snapshot rename rolls back data and raw evidence', async () => {
  const rootDir = join(tmpdir(), `test-pub-raw-rename-${Date.now()}`);
  const dataDir = join(rootDir, 'data');
  const rawDir = join(rootDir, 'raw');
  const reportsDir = join(rootDir, 'reports');
  await mkdir(dataDir, { recursive: true });
  await mkdir(rawDir, { recursive: true });
  await mkdir(reportsDir, { recursive: true });

  const originalLocations = JSON.stringify([{ code: 'ORIGINAL' }]);
  const originalRaw = JSON.stringify({ original: true });
  await writeFile(join(dataDir, 'locations.json'), originalLocations, 'utf8');
  await writeFile(join(rawDir, 'latest-fetch.json'), originalRaw, 'utf8');

  await assert.rejects(
    atomicPublish({
      records: [mockRecord],
      metadata: mockMetadata,
      rawSnapshot: mockRawSnapshot,
      reportMarkdown: '# New',
      dataDir,
      rawDir,
      reportsDir,
      rootDir,
      options: { failAtFile: 'latest-fetch.json' }
    }),
    /Atomic publish failed with full rollback executed/
  );

  assert.equal(await readFile(join(dataDir, 'locations.json'), 'utf8'), originalLocations);
  assert.equal(await readFile(join(rawDir, 'latest-fetch.json'), 'utf8'), originalRaw);
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
