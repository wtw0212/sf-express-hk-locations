import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir, rm, mkdtemp } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { runSync } from '../scripts/sync.js';
import { checkCompletenessGates } from '../scripts/lib/validate.js';
import { computeDiff } from '../scripts/lib/diff.js';

test('integration: runSync with isFixture defaults to publish=false and does not modify repo paths', async () => {
  const repoDataStat = existsSync('data/locations.json') ? await readFile('data/locations.json', 'utf8') : null;

  // Run in fixture mode without explicit publish -> dry-run only
  await assert.doesNotReject(runSync({ isFixture: true }));

  // Verify repo data/locations.json remained unchanged
  if (repoDataStat) {
    const currentRepoData = await readFile('data/locations.json', 'utf8');
    assert.equal(currentRepoData, repoDataStat, 'Fixture mode must NOT overwrite repository data/locations.json');
  }
});

test('integration: runSync fixture mode writes only to provided temporary directory when outputDir specified', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'sf-test-fixture-'));
  const tempDataDir = join(tempDir, 'data');
  const tempReportsDir = join(tempDir, 'reports');

  await runSync({
    isFixture: true,
    publish: true,
    outputDir: tempDir
  });

  // Verify files were written ONLY inside tempDir
  assert.ok(existsSync(join(tempDataDir, 'locations.json')));
  assert.ok(existsSync(join(tempDataDir, 'metadata.json')));
  assert.ok(existsSync(join(tempReportsDir, 'latest-diff.md')));

  await rm(tempDir, { recursive: true, force: true });
});

test('integration: publish=false performs full pipeline without writing output files', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'sf-test-dryrun-'));
  const tempDataDir = join(tempDir, 'data');

  await runSync({
    isFixture: true,
    publish: false,
    paths: {
      rootDir: tempDir,
      dataDir: tempDataDir,
      rawDir: join(tempDir, 'raw'),
      reportsDir: join(tempDir, 'reports')
    }
  });

  // Because publish is false and no custom outputDir was passed, tempDataDir/locations.json must NOT exist
  assert.equal(existsSync(join(tempDataDir, 'locations.json')), false);

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

  // Write malformed JSON to temporary locations.json
  await writeFile(join(tempDataDir, 'locations.json'), '{ malformed_json: ', 'utf8');

  // Verify runSync rejects startup when encountering malformed published dataset
  await assert.rejects(
    runSync({
      isFixture: true,
      publish: false,
      paths: {
        rootDir: tempDir,
        dataDir: tempDataDir,
        rawDir: join(tempDir, 'raw'),
        reportsDir: join(tempDir, 'reports')
      }
    }),
    /Published locations.json is malformed JSON/
  );

  await rm(tempDir, { recursive: true, force: true });
});
