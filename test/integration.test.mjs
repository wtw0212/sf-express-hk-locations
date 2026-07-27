import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir, rm, mkdtemp } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

import {
  runSync,
  buildReleaseArtifacts,
  validateReleaseArtifacts,
  publishReleaseArtifacts
} from '../scripts/sync.js';
import { checkCompletenessGates } from '../scripts/lib/validate.js';
import { computeDiff } from '../scripts/lib/diff.js';

const execFileAsync = promisify(execFile);

test('integration: runSync with isFixture defaults to publish=false and does not modify repo paths', async () => {
  const repoDataStat = existsSync('data/locations.json') ? await readFile('data/locations.json', 'utf8') : null;

  // Run in fixture mode without explicit publish -> dry-run only
  await assert.doesNotReject(runSync({
    isFixture: true,
    allowLegacyIntegrityBaseline: true
  }));

  // Verify repo data/locations.json remained unchanged
  if (repoDataStat) {
    const currentRepoData = await readFile('data/locations.json', 'utf8');
    assert.equal(currentRepoData, repoDataStat, 'Fixture mode must NOT overwrite repository data/locations.json');
  }
});

test('integration: baselinePaths vs outputPaths separation in dry-run mode', async () => {
  const tempOutputDir = await mkdtemp(join(tmpdir(), 'sf-test-out-'));
  const baselineDataDir = resolve('data');

  const baselineBefore = await readFile(join(baselineDataDir, 'locations.json'), 'utf8');

  await runSync({
    isFixture: true,
    publish: false,
    baselineDir: baselineDataDir,
    outputDir: tempOutputDir,
    allowLegacyIntegrityBaseline: true
  });

  // Baseline data/locations.json must remain 100% unchanged
  const baselineAfter = await readFile(join(baselineDataDir, 'locations.json'), 'utf8');
  assert.equal(baselineBefore, baselineAfter, 'Baseline data must not be mutated by dry-run sync');

  // Dry-run output files were written inside tempOutputDir
  assert.ok(existsSync(join(tempOutputDir, 'data', 'locations.json')));
  assert.ok(existsSync(join(tempOutputDir, 'data', 'metadata.json')));
  assert.ok(existsSync(join(tempOutputDir, 'raw', 'latest-fetch.json')));
  assert.ok(existsSync(join(tempOutputDir, 'reports', 'latest-diff.md')));

  await rm(tempOutputDir, { recursive: true, force: true });
});

test('integration: verifier CLI independently validates fixture output hashes', async () => {
  const tempOutputDir = await mkdtemp(join(tmpdir(), 'sf-verifier-cli-'));
  await runSync({
    isFixture: true,
    publish: false,
    baselineDir: resolve('data'),
    outputDir: tempOutputDir,
    allowLegacyIntegrityBaseline: true
  });

  const { stdout } = await execFileAsync(process.execPath, [
    resolve('scripts/verify-source-hashes.js'),
    '--snapshot',
    join(tempOutputDir, 'raw', 'latest-fetch.json'),
    '--metadata',
    join(tempOutputDir, 'data', 'metadata.json'),
    '--locations',
    join(tempOutputDir, 'data', 'locations.json'),
    '--reviewed-registry',
    resolve('data/reviewed-pdf-partners.json')
  ]);
  assert.match(stdout, /Full release integrity verification passed/);
  await rm(tempOutputDir, { recursive: true, force: true });
});

test('integration: dry-run executes Ajv schema validation and rejects invalid metadata', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'sf-test-schema-fail-'));

  const validRecord = {
    id: '852A', code: '852A', type: 'store', type_name: '順豐站', type_name_en: 'SF Store',
    name: 'Test', region: '香港島', region_en: 'Hong Kong Island', district: '灣仔區', district_en: 'Wan Chai District',
    address: 'Address', location: { latitude: 22.28, longitude: 114.17 }, source: 'api_tc', quality_flags: [],
    provenance: { name: 'api_tc', address: 'api_tc', district: 'api_tc' }, retrieved_at: '2026-07-27'
  };

  const invalidMetadata = {
    schema_version: 2,
    retrieved_at: '2026-07-27',
    counts: { total: 1, stores: 1, lockers: 0, partners: 0 },
    count_deltas: {},
    source_status: {
      api_tc: { areas_total: 1, areas_success: 1, areas_failed: 0 },
      api_en: { areas_total: 1, areas_success: 1, areas_failed: 0 },
      ssr: { count: 0, errors: [] },
      partner_pdf: { pdf_total: 0, pdf_success: 0, pdf_failed: 0, status: 'success', records: 0, errors: [] }
    },
    coverage: {
      tc_record_count: 1, en_record_count: 1,
      bilingual_match_rate: 1.5, // INVALID: must be <= 1
      district_resolved_count: 1, district_unresolved_count: 0
    },
    quality: {
      pipeline_blocking_errors: 0, pipeline_warnings: 0,
      record_flag_counts_by_severity: { info: 0, warning: 0, error: 0 },
      flag_counts_by_type: {}
    }
  };

  const artifacts = buildReleaseArtifacts({
    records: [validRecord],
    metadata: invalidMetadata,
    reportMarkdown: '# Report'
  });

  // Verify validateReleaseArtifacts throws in dry-run when metadata is invalid
  await assert.rejects(
    validateReleaseArtifacts(artifacts),
    /JSON Schema validation failed for release artifacts/
  );

  await rm(tempDir, { recursive: true, force: true });
});

test('integration: source failure propagation blocks publication', () => {
  const gateResult = checkCompletenessGates({
    tcResults: [{ ok: false, area: { sourceRegion: 'Central', district: 'Central' }, error: 'HTTP 500' }],
    enResults: [{ ok: true, records: [] }],
    records: Array(1100).fill({ code: '852A' }),
    previousRecords: Array(1100).fill({ code: '852A' })
  });

  assert.equal(gateResult.pass, false);
  assert.ok(gateResult.errors.some(e => e.includes('TC API areas failed')));
});

test('integration: migration-aware diff identifies legacy source tags', () => {
  const legacyPrev = [{ code: '852A', type: 'store', name: 'Store A', source: 'api' }];
  const next = [{ code: '852A', type: 'store', name: 'Store A', source: 'api_tc' }];

  const diff = computeDiff(legacyPrev, next);
  assert.equal(diff.isMigration, true, 'Diff should auto-detect schema v1 to v2 migration');
  assert.equal(diff.updated.length, 1);
  assert.deepEqual(diff.updated[0].changes.source, { old: 'api', new: 'api_tc' });
});

test('integration: on-disk malformed previous dataset blocks runSync startup', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'sf-test-corrupt-'));
  const tempDataDir = join(tempDir, 'data');
  await mkdir(tempDataDir, { recursive: true });

  await writeFile(join(tempDataDir, 'locations.json'), '{ malformed_json: ', 'utf8');

  await assert.rejects(
    runSync({
      isFixture: true,
      publish: false,
      baselineDir: tempDataDir,
      outputDir: tempDir
    }),
    /Published locations.json is malformed JSON/
  );

  await rm(tempDir, { recursive: true, force: true });
});
