import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { runSync } from '../scripts/sync.js';
import { validateRecords, validatePreviousDataset, checkCompletenessGates } from '../scripts/lib/validate.js';
import { computeDiff } from '../scripts/lib/diff.js';

test('integration: complete orchestrator pipeline run in fixture mode', async () => {
  // Execute runSync in fixture mode
  await assert.doesNotReject(runSync({ isFixture: true }));

  // Verify published output files exist and are valid JSON
  const locationsRaw = await readFile('data/locations.json', 'utf8');
  const metadataRaw = await readFile('data/metadata.json', 'utf8');
  const reportRaw = await readFile('reports/latest-diff.md', 'utf8');

  const locations = JSON.parse(locationsRaw);
  const metadata = JSON.parse(metadataRaw);

  assert.ok(Array.isArray(locations));
  assert.ok(locations.length > 1000, 'Pipeline output should contain >1000 locations');
  assert.equal(metadata.schema_version, 2);
  assert.ok(metadata.counts.total > 0);
  assert.ok(reportRaw.includes('SF Express HK Location Sync Report'));
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

test('integration: corrupted previous dataset blocks pipeline startup', async () => {
  const tempDir = join(tmpdir(), `test-corrupt-prev-${Date.now()}`);
  const dataDir = join(tempDir, 'data');
  await mkdir(dataDir, { recursive: true });

  // 1. Invalid JSON
  await writeFile(join(dataDir, 'locations.json'), '{ invalid_json: ', 'utf8');
  assert.throws(
    () => validatePreviousDataset('{ invalid_json: '),
    /Published locations.json root must be an array/
  );

  // 2. Object instead of array
  assert.throws(
    () => validatePreviousDataset({ root: 'not_an_array' }),
    /root must be an array/
  );

  // 3. Duplicate codes in previous data
  const dupRec = { code: '852DUP', type: 'store', name: 'Store', location: { latitude: 22.3, longitude: 114.2 }, quality_flags: [], source: 'api_tc', provenance: { name: 'api_tc', address: 'api_tc', district: 'api_tc' } };
  assert.throws(
    () => validatePreviousDataset([dupRec, dupRec]),
    /Previous published dataset is invalid/
  );

  await rm(tempDir, { recursive: true, force: true });
});
