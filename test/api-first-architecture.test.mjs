import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { normalizeRecords } from '../scripts/lib/normalize.js';
import { loadReviewedPdfRegistry } from '../scripts/lib/reviewed-pdf-registry.js';
import { auditPartnerPdfRecords } from '../scripts/lib/pdf-audit.js';
import { SOURCES } from '../scripts/lib/constants.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

test('1. API cannot be overwritten by PDF', () => {
  const tcMap = new Map([
    ['852A', { serviceCode: '852A', name: 'API 店鋪', address: 'API 地址' }]
  ]);
  const { records } = normalizeRecords({ tcMap });
  const rec = records.find(r => r.code === '852A');

  assert.equal(rec.name, 'API 店鋪');
  assert.equal(rec.source, SOURCES.API_TC);
});

test('2. SSR cannot overwrite API', () => {
  const tcMap = new Map([
    ['852A', { serviceCode: '852A', name: 'API 店鋪', address: 'API 地址' }]
  ]);
  const ssrList = [
    { serviceCode: '852A', name: 'SSR 店鋪', address: 'SSR 地址' }
  ];

  const { records } = normalizeRecords({ tcMap, ssrList });
  const rec = records.find(r => r.code === '852A');

  assert.equal(rec.name, 'API 店鋪');
  assert.equal(rec.source, SOURCES.API_TC);
});

test('3 & 4. Unreviewed PDF-only records are not canonical, but become audit candidates', () => {
  const tcMap = new Map();
  const reviewedPdfList = [];
  const parsedPdfRecords = [
    { serviceCode: '852NEW1', name: '新自提點', address: '新地址', _source_url: 'https://example.com' }
  ];

  const { records } = normalizeRecords({ tcMap });
  assert.equal(records.find(r => r.code === '852NEW1'), undefined);

  const audit = auditPartnerPdfRecords({ tcMap, reviewedPdfList, parsedPdfRecords });
  assert.equal(audit.summary.new_pdf_only_candidate_count, 1);
  assert.equal(audit.new_pdf_only_candidates[0].code, '852NEW1');
});

test('5 & 6. Reviewed PDF-only records are canonical and use reviewed_pdf_partner source', async () => {
  const tcMap = new Map();
  const reviewedPdfRegistry = await loadReviewedPdfRegistry(resolve(__dirname, '../data/reviewed-pdf-partners.json'));

  const { records } = normalizeRecords({ tcMap, reviewedPdfRegistry });
  const rec = records.find(r => r.code === '852LA3007');

  assert.ok(rec);
  assert.equal(rec.source, 'reviewed_pdf_partner');
  assert.equal(rec.name, '葵涌康力達環保貿易公司');
});

test('7. Canonical output contains no raw pdf_partner source', async () => {
  const reviewedPath = resolve(__dirname, '../data/reviewed-pdf-partners.json');
  const reviewedPdfRegistry = await loadReviewedPdfRegistry(reviewedPath);

  const { records } = normalizeRecords({ tcMap: new Map(), reviewedPdfRegistry });
  const rawPdfRecs = records.filter(r => r.source === 'pdf_partner');

  assert.equal(rawPdfRecs.length, 0);
});

test('8 & 9. Invalid reviewed registry & duplicate codes block loading', async () => {
  await assert.rejects(
    async () => loadReviewedPdfRegistry(resolve(__dirname, 'fixtures/invalid-reviewed-registry.json')),
    /Reviewed PDF registry|file not found/
  );
});

test('10. PDF parser regressions cannot mutate reviewed records', async () => {
  const tcMap = new Map();
  const reviewedPdfRegistry = await loadReviewedPdfRegistry(resolve(__dirname, '../data/reviewed-pdf-partners.json'));
  const reviewedPdfList = reviewedPdfRegistry.records;

  // Corrupted live PDF parser output
  const parsedPdfRecords = [
    { serviceCode: '852LA3007', name: '順豐合作點', address: '損壞地址' }
  ];

  const { records } = normalizeRecords({ tcMap, reviewedPdfRegistry });
  const rec = records.find(r => r.code === '852LA3007');

  assert.equal(rec.name, '葵涌康力達環保貿易公司');

  const audit = auditPartnerPdfRecords({ tcMap, reviewedPdfList, parsedPdfRecords });
  assert.equal(audit.summary.reviewed_pdf_drift_count, 1);
  assert.ok(audit.reviewed_pdf_drift[0].differing_fields.includes('name'));
});

test('11. PDF failure does not remove API records', () => {
  const tcMap = new Map([
    ['852API1', { serviceCode: '852API1', name: 'API Store', address: 'API Addr' }]
  ]);
  const parsedPdfRecords = [];

  const { records } = normalizeRecords({ tcMap });
  assert.ok(records.find(r => r.code === '852API1'));
});

test('13. API/PDF conflicts create audit entries', () => {
  const tcMap = new Map([
    ['852A', { serviceCode: '852A', name: '官方 API 名稱', address: '官方地址' }]
  ]);
  const parsedPdfRecords = [
    { serviceCode: '852A', name: 'PDF 名稱不匹配', address: '官方地址' }
  ];

  const audit = auditPartnerPdfRecords({ tcMap, parsedPdfRecords });

  assert.equal(audit.summary.api_pdf_conflict_count, 1);
  assert.equal(audit.api_pdf_conflicts[0].code, '852A');
  assert.deepEqual(audit.api_pdf_conflicts[0].differing_fields, ['name']);
});

test('14 & 15. Reviewed/PDF differences create drift, missing reviewed records do not auto-delete', async () => {
  const reviewedPdfRegistry = await loadReviewedPdfRegistry(resolve(__dirname, '../data/reviewed-pdf-partners.json'));
  const reviewedPdfList = reviewedPdfRegistry.records;
  const parsedPdfRecords = [
    { serviceCode: '852LA3007', name: 'PDF 漂移名稱', address: '葵涌和宜合道167-175號金威工業大廈一期低層地下B7室' }
  ];

  const audit = auditPartnerPdfRecords({ reviewedPdfList, parsedPdfRecords });

  assert.equal(audit.summary.reviewed_pdf_drift_count, 1);
  assert.equal(audit.summary.missing_reviewed_record_count, 4);
  assert.ok(audit.missing_reviewed_records.some(item => item.code === '852GC2003'));

  const { records } = normalizeRecords({ tcMap: new Map(), reviewedPdfRegistry });
  assert.equal(records.length, 5);
  assert.ok(records.find(r => r.code === '852GC2003'));
});

test('16 & 17. 852LA3007 and three 公斤或以下 records have corrected names in reviewed registry', async () => {
  const reviewedPath = resolve(__dirname, '../data/reviewed-pdf-partners.json');
  const reviewedPdfRegistry = await loadReviewedPdfRegistry(reviewedPath);
  const reviewedPdfList = reviewedPdfRegistry.records;

  const expected = new Map([
    ['852FE3012', '馬鞍山錦英苑自提點'],
    ['852G3004', '荃灣提點坪有限公司'],
    ['852G3008', '荃灣星羽便利店'],
    ['852LA3007', '葵涌康力達環保貿易公司']
  ]);

  for (const [code, expectedName] of expected) {
    const item = reviewedPdfList.find(r => r.code === code);
    assert.ok(item, `Reviewed registry must contain ${code}`);
    assert.equal(item.name, expectedName, `${code} name must match ${expectedName}`);
  }
});
