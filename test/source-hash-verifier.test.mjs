import test from 'node:test';
import assert from 'node:assert/strict';

import { buildRawSnapshot } from '../scripts/lib/raw-snapshot.js';
import { verifyReleaseIntegrity, verifySourceHashes } from '../scripts/lib/source-hash-verifier.js';
import {
  calculateCanonicalDatasetHash,
  calculatePdfTextSnapshotHash,
  calculateReviewedRegistryHash,
  calculateSsrHash,
  sha256
} from '../scripts/lib/source-hashes.js';
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

function compact(value) {
  const { record_hashes: _recordHashes, ...result } = value;
  return result;
}

function releaseFixture() {
  const snapshot = fixtureSnapshot();
  const locations = [{
    code: '852A',
    type: 'store',
    type_name: '順豐站',
    type_name_en: 'SF Store',
    name: '甲',
    name_en: 'A',
    region: '香港島',
    region_en: 'Hong Kong Island',
    district: '中西區',
    district_en: 'Central and Western District',
    sub_district: '中環',
    sub_district_en: 'Central',
    address: '地址',
    address_en: 'Address',
    telephone: null,
    business_hours: null,
    business_hours_en: null,
    location: { latitude: null, longitude: null },
    source: 'api_tc',
    quality_flags: [],
    provenance: { name: 'api_tc', address: 'api_tc', district: 'api_tc' }
  }];
  const reviewedRegistryRecords = [];
  const metadata = {
    counts: { total: 1 },
    source_integrity: {
      api_tc: {
        raw_snapshot_sha256: snapshot.sources.api_tc.raw_snapshot_sha256,
        semantic_sha256: snapshot.sources.api_tc.semantic_sha256,
        record_count: snapshot.sources.api_tc.record_count,
        duplicate_codes: snapshot.sources.api_tc.duplicate_codes,
        record_hashes_ref: '/sources/api_tc/record_hashes'
      },
      api_en: {
        raw_snapshot_sha256: snapshot.sources.api_en.raw_snapshot_sha256,
        semantic_sha256: snapshot.sources.api_en.semantic_sha256,
        record_count: snapshot.sources.api_en.record_count,
        duplicate_codes: snapshot.sources.api_en.duplicate_codes,
        record_hashes_ref: '/sources/api_en/record_hashes'
      },
      ssr: compact(calculateSsrHash([])),
      reviewed_registry: compact(calculateReviewedRegistryHash([])),
      canonical: compact(calculateCanonicalDatasetHash(locations)),
      partner_pdf: calculatePdfTextSnapshotHash([])
    }
  };
  return { snapshot, metadata, locations, reviewedRegistryRecords };
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

test('source hash verifier independently recalculates extracted PDF text hashes', () => {
  const snapshot = fixtureSnapshot();
  snapshot.sources.partner_pdf.documents = [{
    source_key: 'OK_TEST_TC',
    url: 'https://example.test/test.pdf',
    http_ok: true,
    parse_ok: true,
    attempts: 1,
    text: 'exact extracted text',
    document_binary_sha256: 'a'.repeat(64),
    extracted_text_sha256: sha256('exact extracted text')
  }];
  assert.doesNotThrow(() => verifySourceHashes(snapshot));

  snapshot.sources.partner_pdf.documents[0].text += 'tampered';
  assert.throws(() => verifySourceHashes(snapshot), /extracted text hash mismatch/i);
});

test('full verifier detects SSR, reviewed registry, canonical, and metadata tampering', () => {
  assert.doesNotThrow(() => verifyReleaseIntegrity(releaseFixture()));

  const ssrTampered = releaseFixture();
  ssrTampered.snapshot.sources.ssr.records.push({ serviceCode: '852SSR', name: 'SSR' });
  assert.throws(() => verifyReleaseIntegrity(ssrTampered), /ssr.*semantic_sha256 mismatch/i);

  const registryTampered = releaseFixture();
  registryTampered.reviewedRegistryRecords.push({
    code: '852PDF',
    name: 'Partner',
    address: 'Address'
  });
  assert.throws(() => verifyReleaseIntegrity(registryTampered), /reviewed_registry.*semantic_sha256 mismatch/i);

  const canonicalTampered = releaseFixture();
  canonicalTampered.locations[0].name = 'tampered';
  assert.throws(() => verifyReleaseIntegrity(canonicalTampered), /canonical.*semantic_sha256 mismatch/i);

  const metadataTampered = releaseFixture();
  metadataTampered.metadata.source_integrity.partner_pdf.semantic_sha256 = '0'.repeat(64);
  assert.throws(() => verifyReleaseIntegrity(metadataTampered), /partner_pdf.*semantic_sha256 mismatch/i);

  for (const section of ['ssr', 'reviewed_registry', 'canonical']) {
    const tampered = releaseFixture();
    tampered.metadata.source_integrity[section].semantic_sha256 = '0'.repeat(64);
    assert.throws(
      () => verifyReleaseIntegrity(tampered),
      new RegExp(`${section}.*semantic_sha256 mismatch`, 'i')
    );
  }

  const apiMetadataTampered = releaseFixture();
  apiMetadataTampered.metadata.source_integrity.api_tc.record_hashes_ref =
    '/sources/api_en/record_hashes';
  assert.throws(() => verifyReleaseIntegrity(apiMetadataTampered), /api_tc.*record_hashes_ref mismatch/i);
});
