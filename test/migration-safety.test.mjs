import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

import { normalizeRecords } from '../scripts/lib/normalize.js';
import { loadReviewedPdfRegistry } from '../scripts/lib/reviewed-pdf-registry.js';
import { auditPartnerPdfRecords } from '../scripts/lib/pdf-audit.js';
import { checkCompletenessGates, validatePreviousDataset } from '../scripts/lib/validate.js';
import { runSync } from '../scripts/sync.js';

const reviewedPath = resolve('data/reviewed-pdf-partners.json');

test('reviewed registry records retain every reviewed fallback field and provenance', async () => {
  const reviewedPdfRegistry = await loadReviewedPdfRegistry(reviewedPath);
  const { records } = normalizeRecords({
    tcMap: new Map(),
    enMap: new Map(),
    ssrList: [],
    reviewedPdfRegistry,
    generatedAt: '2026-07-27',
    sourceRetrievedAt: '2026-07-27'
  });

  const expected = new Map([
    ['852GC2003', { name_en: 'Conv. Store Shop 6, G/F, Carpark Building Phase I, Tsing Yi Estate, Tsing Yi, N.T.', address_en: 'Shop 6, G/F, Carpark Building Phase I, Tsing Yi Estate, Tsing Yi, N.T.', sub_district: '青衣', business_hours: '24小時', business_hours_en: '00:00-23:59' }],
    ['852LA3007', { name_en: null, address_en: null, sub_district: '葵涌', business_hours: '星期一至六:12:00-18:00 星期日及公眾假期:休息', business_hours_en: null }],
    ['852FE3012', { name_en: null, address_en: null, sub_district: '馬鞍山', business_hours: '星期一至六:12:00-20:00 星期日及公眾假期:12:00-18:00', business_hours_en: null }],
    ['852G3004', { name_en: null, address_en: null, sub_district: '荃灣', business_hours: '星期一至六: 12:00-20:30 星期日、公眾假期: 休息', business_hours_en: null }],
    ['852G3008', { name_en: null, address_en: null, sub_district: '荃灣', business_hours: '星期一至六:10:00-21:00 星期日:10:00-21:00 公眾假期:休息', business_hours_en: null }]
  ]);

  for (const [code, fields] of expected) {
    const record = records.find(item => item.code === code);
    assert.ok(record, `${code} must be canonical`);
    assert.deepEqual(
      Object.fromEntries(Object.keys(fields).map(field => [field, record[field]])),
      fields,
      `${code} must preserve reviewed fields`
    );
    assert.equal(record.source, 'reviewed_pdf_partner');
    assert.equal(record.provenance.name, 'reviewed_pdf_partner');
    assert.equal(record.provenance.address, 'reviewed_pdf_partner');
    assert.equal(record.provenance.business_hours, 'reviewed_pdf_partner');
    assert.equal(record.provenance.name_en, fields.name_en == null ? null : 'reviewed_pdf_partner');
  }
});

test('normalization rejects an arbitrary reviewed PDF array', () => {
  assert.throws(
    () => normalizeRecords({
      tcMap: new Map(),
      reviewedPdfList: [{ code: '852ATTACK1', name: 'Injected', address: 'Injected' }]
    }),
    /reviewedPdfRegistry must be loaded by loadReviewedPdfRegistry/
  );
});

test('PDF audit distinguishes formatting, equivalent hours, and semantic conflicts with evidence', () => {
  const audit = auditPartnerPdfRecords({
    tcMap: new Map([
      ['852FMT1', { serviceCode: '852FMT1', name: '測試 店', address: '香港 灣仔道 1 號', serviceTime: '24小時' }],
      ['852SEM1', { serviceCode: '852SEM1', name: '官方名稱', address: '官方地址', serviceTime: '09:00-18:00' }]
    ]),
    parsedPdfRecords: [
      {
        serviceCode: '852FMT1', name: '測試店', address: '香港灣仔道1號', serviceTime: '00:00-23:59',
        _source_key: 'OK_HK_TC', _source_url: 'https://example.test/ok.pdf',
        _document_retrieved_at: '2026-07-27T00:00:00.000Z', _document_sha256: 'a'.repeat(64),
        _parser_location: { row_index: 7, raw_row: 'raw PDF row' }
      },
      {
        serviceCode: '852SEM1', name: 'PDF名稱', address: 'PDF地址', serviceTime: '10:00-19:00',
        _source_key: 'ASP_HK_TC', _source_url: 'https://example.test/asp.pdf',
        _document_retrieved_at: '2026-07-27T00:00:00.000Z', _document_sha256: 'b'.repeat(64),
        _parser_location: { row_index: 8, raw_row: 'other raw PDF row' }
      }
    ]
  });

  const formatting = audit.api_pdf_conflicts.find(item => item.code === '852FMT1');
  assert.equal(formatting.comparison.name.classification, 'formatting_difference');
  assert.equal(formatting.comparison.address.classification, 'formatting_difference');
  assert.equal(formatting.comparison.business_hours.classification, 'equivalent_difference');
  assert.equal(formatting.evidence.source_key, 'OK_HK_TC');
  assert.equal(formatting.evidence.document_sha256, 'a'.repeat(64));
  assert.equal(formatting.evidence.parser_location.raw_row, 'raw PDF row');

  const semantic = audit.api_pdf_conflicts.find(item => item.code === '852SEM1');
  assert.equal(semantic.comparison.name.classification, 'semantic_conflict');
  assert.equal(semantic.comparison.business_hours.classification, 'semantic_conflict');
});

test('PDF audit failures are warnings only and do not become publication gates', () => {
  const result = checkCompletenessGates({
    tcResults: [{ ok: true, records: [{ serviceCode: '852A' }] }],
    enResults: [{ ok: true, records: [{ serviceCode: '852A' }] }],
    pdfResult: {
      pdfTotal: 8,
      pdfSuccessCount: 0,
      pdfFailCount: 8,
      status: 'all_pdfs_failed',
      errors: ['offline'],
      documents: [],
      records: [],
      quarantinedRecords: []
    },
    records: Array.from({ length: 1100 }, (_, index) => ({ code: `852${index}` })),
    previousRecords: Array.from({ length: 1100 }, (_, index) => ({ code: `852${index}` }))
  });

  assert.equal(result.pass, true);
  assert.equal(result.errors.length, 0);
  assert.ok(result.warnings.some(item => item.includes('All partner PDFs failed')));
});

test('operational source and count anomalies remain visible without becoming publication gates', () => {
  const result = checkCompletenessGates({
    tcResults: [{ ok: false, area: { sourceRegion: 'Hong Kong', district: 'Central' }, error: 'HTTP 500' }],
    enResults: [{ ok: true, records: [] }],
    records: [],
    previousRecords: [{ code: '852PARENT1', type: 'store' }]
  });

  assert.equal(result.errors.length, 0);
  assert.ok(result.warnings.some(item => item.includes('TC API areas failed')));
  assert.ok(result.warnings.some(item => item.includes('Record count')));
});

test('sync rejects a publication target that overlaps its read-only baseline', async () => {
  const root = await mkdtemp(join(tmpdir(), 'sf-baseline-overlap-'));
  const dataDir = join(root, 'data');
  await mkdir(dataDir, { recursive: true });
  await writeFile(join(dataDir, 'locations.json'), '[]');
  await writeFile(join(dataDir, 'reviewed-pdf-partners.json'), await readFile(reviewedPath, 'utf8'));

  await assert.rejects(
    runSync({ isFixture: true, publish: true, baselineDir: dataDir, outputDir: root }),
    /baseline data directory must be distinct from the publication data directory/
  );

  await rm(root, { recursive: true, force: true });
});

test('a legacy parent dataset is accepted as a diff-only migration baseline', () => {
  assert.doesNotThrow(() => validatePreviousDataset([
    { id: '852PARENT1', code: '852PARENT1', source: 'api', name: 'Parent record' }
  ], { allowLegacyMigrationBaseline: true }));
});
