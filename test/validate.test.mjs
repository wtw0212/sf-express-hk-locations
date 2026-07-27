import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateRecords,
  validatePreviousDataset,
  checkCompletenessGates,
  validateCrossFile
} from '../scripts/lib/validate.js';

const validRecord = {
  id: '852A',
  code: '852A',
  type: 'store',
  type_name: '順豐站',
  type_name_en: 'SF Store',
  name: 'Test Store',
  name_en: 'Test Store EN',
  region: '香港島',
  region_en: 'Hong Kong Island',
  district: '灣仔區',
  district_en: 'Wan Chai District',
  sub_district: '灣仔',
  sub_district_en: 'Wan Chai',
  address: '灣仔軒尼詩道1號',
  address_en: '1 Hennessy Road, Wan Chai',
  telephone: '12345678',
  business_hours: '09:00-20:00',
  business_hours_en: '09:00-20:00',
  location: { latitude: 22.28, longitude: 114.17 },
  source: 'api_tc',
  quality_flags: [],
  provenance: { name: 'api_tc', name_en: 'api_en', address: 'api_tc', address_en: 'api_en', district: 'api_tc' },
  retrieved_at: '2026-07-27 10:00 (HKT UTC+8)'
};

test('validateRecords: passes for valid records', () => {
  const res = validateRecords([validRecord]);
  assert.equal(res.errors.length, 0);
});

test('validateRecords: rejects empty code or mismatching id', () => {
  const badId = { ...validRecord, id: '852DIFFERENT' };
  const res = validateRecords([badId]);
  assert.ok(res.errors.some(e => e.includes('does not match code')));
});

test('validateRecords: rejects invalid type', () => {
  const badType = { ...validRecord, type: 'invalid_type' };
  const res = validateRecords([badType]);
  assert.ok(res.errors.some(e => e.includes('invalid type')));
});

test('validateRecords: rejects missing required name or type_name', () => {
  const badName = { ...validRecord, name: '' };
  const res = validateRecords([badName]);
  assert.ok(res.errors.some(e => e.includes('missing required name')));
});

test('validateRecords: rejects store or locker missing address', () => {
  const badAddr = { ...validRecord, address: '' };
  const res = validateRecords([badAddr]);
  assert.ok(res.errors.some(e => e.includes('missing required address')));
});

test('validateRecords: rejects missing quality_flags array', () => {
  const badFlags = { ...validRecord, quality_flags: null };
  const res = validateRecords([badFlags]);
  assert.ok(res.errors.some(e => e.includes('missing quality_flags array')));
});

test('validateRecords: rejects invalid source or provenance', () => {
  const badSource = { ...validRecord, source: 'unknown_source' };
  const res = validateRecords([badSource]);
  assert.ok(res.errors.some(e => e.includes('invalid source identifier')));

  const badProv = { ...validRecord, provenance: { name: 'invalid', address: 'api_tc', district: 'api_tc' } };
  const resProv = validateRecords([badProv]);
  assert.ok(resProv.errors.some(e => e.includes('invalid provenance.name')));
});

test('validateRecords: rejects non-finite or single coordinate or outside HK coordinates', () => {
  const singleCoord = { ...validRecord, location: { latitude: 22.28, longitude: null } };
  const resSingle = validateRecords([singleCoord]);
  assert.ok(resSingle.errors.some(e => e.includes('must both be present or both null')));

  const nonFinite = { ...validRecord, location: { latitude: NaN, longitude: 114.17 } };
  const resNonFinite = validateRecords([nonFinite]);
  assert.ok(resNonFinite.errors.some(e => e.includes('non-finite latitude')));

  const outsideHK = { ...validRecord, location: { latitude: 39.9, longitude: 116.4 } };
  const resOutside = validateRecords([outsideHK]);
  assert.ok(resOutside.errors.some(e => e.includes('outside HK bounding box')));
});

test('validatePreviousDataset: fails closed on invalid previous dataset', () => {
  // 1. Non-array
  assert.throws(() => validatePreviousDataset({ obj: true }), /root must be an array/);

  // 2. Duplicate codes in previous dataset
  assert.throws(() => validatePreviousDataset([validRecord, validRecord]), /Previous published dataset is invalid/);

  // 3. Malformed record schema in previous dataset
  assert.throws(() => validatePreviousDataset([{ code: '852A' }]), /Previous published dataset is invalid/);
});

test('checkCompletenessGates: PDF failure scenarios', () => {
  const records = Array(1100).fill(validRecord).map((r, i) => ({ ...r, id: `852${i}`, code: `852${i}` }));

  // All PDFs failed -> blocking gate
  const resAllFailed = checkCompletenessGates({
    tcResults: [{ ok: true, records: [] }],
    enResults: [{ ok: true, records: [] }],
    pdfResult: { pdfTotal: 8, pdfSuccessCount: 0, pdfFailCount: 8, status: 'all_pdfs_failed', errors: ['HTTP 500'] },
    records
  });
  assert.equal(resAllFailed.pass, false);
  assert.ok(resAllFailed.errors.some(e => e.includes('All partner PDFs failed')));

  // Partial PDF failure -> warning generated
  const resPartial = checkCompletenessGates({
    tcResults: [{ ok: true, records: [] }],
    enResults: [{ ok: true, records: [] }],
    pdfResult: { pdfTotal: 8, pdfSuccessCount: 7, pdfFailCount: 1, status: 'partial_pdf_failures', errors: ['HTTP 404'] },
    records
  });
  assert.ok(resPartial.warnings.some(w => w.includes('Partial partner PDF failures')));

  // All PDFs succeeded but zero records parsed -> blocking
  const resZeroRecs = checkCompletenessGates({
    tcResults: [{ ok: true, records: [] }],
    enResults: [{ ok: true, records: [] }],
    pdfResult: { pdfTotal: 8, pdfSuccessCount: 8, pdfFailCount: 0, status: 'zero_records_parsed', records: [], errors: [] },
    records
  });
  assert.equal(resZeroRecs.pass, false);
  assert.ok(resZeroRecs.errors.some(e => e.includes('parsed zero records')));
});

test('checkCompletenessGates: partner subset unexpectedly drops -> blocked', () => {
  const records = Array(1100).fill(validRecord).map((r, i) => ({ ...r, id: `852${i}`, code: `852${i}` }));
  // 100 previous partner records
  const prevPartnerRecord = { ...validRecord, type: 'partner' };
  const prevRecords = [
    ...records,
    ...Array(100).fill(prevPartnerRecord).map((r, i) => ({ ...r, id: `P852${i}`, code: `P852${i}` }))
  ];

  // Current records has 0 partners (or dropped partner count)
  const resPartnerDrop = checkCompletenessGates({
    tcResults: [{ ok: true, records: [] }],
    enResults: [{ ok: true, records: [] }],
    records, // 0 partners
    previousRecords: prevRecords
  });
  assert.equal(resPartnerDrop.pass, false);
  assert.ok(resPartnerDrop.errors.some(e => e.includes("Category 'partners' count dropped")));
});

test('validateCrossFile: validates cross-file consistency', () => {
  const store = { ...validRecord, type: 'store' };
  const locker = { ...validRecord, id: '852B', code: '852B', type: 'locker' };
  const partner = { ...validRecord, id: '852C', code: '852C', type: 'partner' };
  const allRecords = [store, locker, partner];

  const stores = [store];
  const lockers = [locker];
  const partners = [partner];
  const byDistrict = { '灣仔區': allRecords };
  const metadata = { counts: { total: 3, stores: 1, lockers: 1, partners: 1 } };

  // Valid
  assert.doesNotThrow(() => validateCrossFile(allRecords, stores, lockers, partners, byDistrict, metadata));

  // Count mismatch
  const badMetadata = { counts: { total: 4, stores: 1, lockers: 1, partners: 1 } };
  assert.throws(() => validateCrossFile(allRecords, stores, lockers, partners, byDistrict, badMetadata), /Metadata total count/);
});
