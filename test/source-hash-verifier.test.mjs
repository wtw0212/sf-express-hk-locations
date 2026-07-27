import test from 'node:test';
import assert from 'node:assert/strict';

import { buildRawSnapshot } from '../scripts/lib/raw-snapshot.js';
import { verifySourceHashes } from '../scripts/lib/source-hash-verifier.js';
import { sha256 } from '../scripts/lib/source-hashes.js';
import { validateRawSnapshotSchema } from '../scripts/lib/schema-validator.js';

function apiResult(language, serviceCode, rawText) {
  return {
    area: { sourceRegion: 'Hong Kong', district: 'Central' },
    language,
    ok: true,
    status: 200,
    attempts: 1,
    error: null,
    rawText,
    raw_sha256: sha256(rawText),
    records: JSON.parse(rawText).result
  };
}

function fixtureSnapshot() {
  const tcRaw = '{ "success": true, "result": [{"serviceCode":"852A","name":"甲","address":"地址"}] }\n';
  const enRaw = '{"result":[{"address":"Address","name":"A","serviceCode":"852A"}],"success":true}';
  return buildRawSnapshot({
    tcResults: [apiResult('tc', '852A', tcRaw)],
    enResults: [apiResult('en', '852A', enRaw)],
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
    pdfStatus: 'no_pdfs_discovered'
  }, '2026-07-27 12:00 (HKT UTC+8)');
}

test('source hash verifier independently accepts a valid snapshot', () => {
  assert.doesNotThrow(() => verifySourceHashes(fixtureSnapshot()));
});

test('raw snapshot schema accepts complete hash evidence and rejects missing raw text', async () => {
  const valid = await validateRawSnapshotSchema(fixtureSnapshot());
  assert.equal(valid.valid, true, valid.errors.join('\n'));

  const invalidSnapshot = fixtureSnapshot();
  delete invalidSnapshot.sources.api_tc.results[0].raw_response_text;
  const invalid = await validateRawSnapshotSchema(invalidSnapshot);
  assert.equal(invalid.valid, false);
});

test('source hash verifier rejects raw text tampering even when records are unchanged', () => {
  const snapshot = fixtureSnapshot();
  snapshot.sources.api_tc.results[0].raw_response_text += ' ';
  assert.throws(() => verifySourceHashes(snapshot), /api_tc.*raw hash mismatch/i);
});

test('source hash verifier rejects record tampering independently of stored hashes', () => {
  const snapshot = fixtureSnapshot();
  snapshot.sources.api_tc.results[0].records[0].name = '被修改';
  assert.throws(() => verifySourceHashes(snapshot), /api_tc.*raw payload records mismatch/i);
});

test('source hash verifier rejects forged per-area and global semantic hashes', () => {
  const areaTampered = fixtureSnapshot();
  areaTampered.sources.api_tc.results[0].semantic_sha256 = '0'.repeat(64);
  assert.throws(() => verifySourceHashes(areaTampered), /api_tc.*area semantic hash mismatch/i);

  const globalTampered = fixtureSnapshot();
  globalTampered.sources.api_en.semantic_sha256 = '0'.repeat(64);
  assert.throws(() => verifySourceHashes(globalTampered), /api_en.*global semantic hash mismatch/i);
});
