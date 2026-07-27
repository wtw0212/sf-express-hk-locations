import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

import { normalizeRecords } from '../scripts/lib/normalize.js';
import { loadReviewedPdfRegistry } from '../scripts/lib/reviewed-pdf-registry.js';
import { auditPartnerPdfRecords } from '../scripts/lib/pdf-audit.js';
import { checkCompletenessGates, checkPipelineRegression, validatePreviousDataset } from '../scripts/lib/validate.js';
import { parsePartnerPdfDocuments } from '../scripts/lib/source-fetchers.js';
import { runSync } from '../scripts/sync.js';
import { sha256 } from '../scripts/lib/source-hashes.js';

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

test('reviewed registry carries immutable document evidence', async () => {
  const registry = await loadReviewedPdfRegistry(reviewedPath);
  const okRecord = registry.records.find(record => record.code === '852GC2003');
  const aspRecord = registry.records.find(record => record.code === '852LA3007');

  assert.equal(okRecord._registry_evidence.reviewed_source_url, 'https://hk.sf-express.com/uploads/OK_NT_TC_6df1516024.pdf');
  assert.equal(okRecord._registry_evidence.reviewed_document_binary_sha256, 'a83821a509d042762210c85544959a0e2936afbd3406c8f7d66e79aade50f520');
  assert.equal(okRecord._registry_evidence.reviewed_extracted_text_sha256, '8c9fd67e2458bcca149b7556c71a2d0908b5fc9e0c930ec01bbcc5e5baa7695d');
  assert.equal(aspRecord._registry_evidence.reviewed_source_url, 'https://hk.sf-express.com/uploads/ASP_NT_TC_307f591507.pdf');
  assert.equal(aspRecord._registry_evidence.reviewed_document_binary_sha256, '9b13d21f52e855eecb23de5f6a024be0cfaf0f897850f32ab0ff2ce6e4a3854a');
  assert.equal(aspRecord._registry_evidence.reviewed_extracted_text_sha256, 'c0f4ffc4d15d126151195450d0d91fc89dbc64f0281c281eb07f92e51a979432');
  assert.equal(aspRecord._registry_evidence.reviewed_source_retrieved_at, '2026-07-27T11:28:51.007Z');
});

test('reviewed registry rejects extracted-text hash substitution for the PDF binary hash', async () => {
  const root = await mkdtemp(join(tmpdir(), 'sf-registry-hash-substitution-'));
  const registry = JSON.parse(await readFile(reviewedPath, 'utf8'));
  registry[0].reviewed_document_binary_sha256 =
    registry[0].reviewed_extracted_text_sha256;
  const path = join(root, 'reviewed.json');
  await writeFile(path, JSON.stringify(registry), 'utf8');

  await assert.rejects(
    loadReviewedPdfRegistry(path),
    /cannot use the extracted-text hash as its binary hash/
  );
  await rm(root, { recursive: true, force: true });
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
        _document_retrieved_at: '2026-07-27T00:00:00.000Z',
        _document_binary_sha256: 'a'.repeat(64), _extracted_text_sha256: 'c'.repeat(64),
        _parser_location: { row_index: 7, raw_row: 'raw PDF row' }
      },
      {
        serviceCode: '852SEM1', name: 'PDF名稱', address: 'PDF地址', serviceTime: '10:00-19:00',
        _source_key: 'ASP_HK_TC', _source_url: 'https://example.test/asp.pdf',
        _document_retrieved_at: '2026-07-27T00:00:00.000Z',
        _document_binary_sha256: 'b'.repeat(64), _extracted_text_sha256: 'd'.repeat(64),
        _parser_location: { row_index: 8, raw_row: 'other raw PDF row' }
      }
    ]
  });

  const formatting = audit.api_pdf_conflicts.find(item => item.code === '852FMT1');
  assert.equal(formatting.comparison.name.classification, 'formatting_difference');
  assert.equal(formatting.comparison.address.classification, 'formatting_difference');
  assert.equal(formatting.comparison.business_hours.classification, 'equivalent_difference');
  assert.equal(formatting.document_id, 'OK_HK_TC');
  assert.equal(audit.documents.OK_HK_TC.document_binary_sha256, 'a'.repeat(64));
  assert.equal(audit.documents.OK_HK_TC.extracted_text_sha256, 'c'.repeat(64));
  assert.equal(formatting.parser_location.raw_row, 'raw PDF row');

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

test('canonical source and count anomalies remain publication gates', () => {
  const result = checkCompletenessGates({
    tcResults: [{ ok: false, area: { sourceRegion: 'Hong Kong', district: 'Central' }, error: 'HTTP 500' }],
    enResults: [{ ok: true, records: [] }],
    records: [],
    previousRecords: [{ code: '852PARENT1', type: 'store' }]
  });

  assert.equal(result.pass, false);
  assert.ok(result.errors.some(item => item.includes('TC API areas failed')));
  assert.ok(result.errors.some(item => item.includes('Record count')));
});

test('SSR failure blocks publication only when it would remove a previously published SSR record', () => {
  const previousRecords = [
    { code: '852API1', source: 'api_tc', type: 'store' },
    { code: 'H852SSR1', source: 'ssr', type: 'locker' }
  ];
  const common = {
    tcResults: [{ ok: true, records: [{ serviceCode: '852API1' }] }],
    enResults: [{ ok: true, records: [{ serviceCode: '852API1' }] }],
    ssrResult: { ok: false, records: [], errors: ['temporary SSR outage'] },
    previousRecords,
    config: { minCount: 1 }
  };

  const destructive = checkCompletenessGates({
    ...common,
    records: [{ code: '852API1', source: 'api_tc', type: 'store' }]
  });
  assert.equal(destructive.pass, false);
  assert.ok(destructive.errors.some(error =>
    error.includes('Previously published SSR-only records were removed: H852SSR1')
  ));

  const preserved = checkCompletenessGates({
    ...common,
    records: previousRecords
  });
  assert.equal(preserved.errors.some(error => error.includes('SSR-only records were removed')), false);
  assert.ok(preserved.warnings.some(warning => warning.includes('[SSR Source] temporary SSR outage')));
});

test('SSR silent zero-record parse cannot remove a previously published SSR-only record', () => {
  const result = checkCompletenessGates({
    tcResults: [{ ok: true, records: [{ serviceCode: '852API1' }] }],
    enResults: [{ ok: true, records: [{ serviceCode: '852API1' }] }],
    ssrResult: { ok: true, records: [], errors: [] },
    previousRecords: [
      { code: '852API1', source: 'api_tc', type: 'store' },
      { code: 'H852SSR1', source: 'ssr', type: 'locker' }
    ],
    records: [{ code: '852API1', source: 'api_tc', type: 'store' }],
    config: { minCount: 1 }
  });

  assert.equal(result.pass, false);
  assert.ok(result.errors.some(error =>
    error.includes('Previously published SSR-only records were removed: H852SSR1')
  ));
});

test('SSR zero records do not create a removal blocker without previous SSR-only records', () => {
  const result = checkCompletenessGates({
    tcResults: [{ ok: true, records: [{ serviceCode: '852API1' }] }],
    enResults: [{ ok: true, records: [{ serviceCode: '852API1' }] }],
    ssrResult: { ok: true, records: [], errors: [] },
    previousRecords: [{ code: '852API1', source: 'api_tc', type: 'store' }],
    records: [{ code: '852API1', source: 'api_tc', type: 'store' }],
    config: { minCount: 1 }
  });

  assert.equal(result.errors.some(error => error.includes('SSR-only records were removed')), false);
});

test('pipeline regression gate blocks unexplained canonical drift when all semantic sources are unchanged', () => {
  const previousIntegrity = {
    api_tc: { semantic_sha256: 'a' },
    api_en: { semantic_sha256: 'b' },
    ssr: { semantic_sha256: 'c' },
    reviewed_registry: { semantic_sha256: 'd' },
    canonical: { semantic_sha256: 'old' }
  };
  const currentIntegrity = structuredClone(previousIntegrity);
  currentIntegrity.canonical.semantic_sha256 = 'new';

  const result = checkPipelineRegression({
    previousIntegrity,
    currentIntegrity,
    baselineSchemaVersion: 3
  });
  assert.equal(result.pass, false);
  assert.match(result.errors[0], /canonical output changed.*source semantic hashes remained unchanged/i);
});

test('pipeline regression gate accepts source-explained drift or an explicit migration approval', () => {
  const previousIntegrity = {
    api_tc: { semantic_sha256: 'a' },
    api_en: { semantic_sha256: 'b' },
    ssr: { semantic_sha256: 'c' },
    reviewed_registry: { semantic_sha256: 'd' },
    canonical: { semantic_sha256: 'old' }
  };
  const changedSsr = structuredClone(previousIntegrity);
  changedSsr.ssr.semantic_sha256 = 'new-ssr';
  changedSsr.canonical.semantic_sha256 = 'new-canonical';
  assert.equal(checkPipelineRegression({
    previousIntegrity,
    currentIntegrity: changedSsr,
    baselineSchemaVersion: 3
  }).pass, true);

  const approved = structuredClone(previousIntegrity);
  approved.canonical.semantic_sha256 = 'new-canonical';
  assert.equal(checkPipelineRegression({
    previousIntegrity,
    currentIntegrity: approved,
    baselineSchemaVersion: 3,
    migrationApproved: true
  }).pass, true);
});

test('pipeline regression gate permits incomplete legacy integrity only with explicit approval', () => {
  const currentIntegrity = {
    api_tc: { semantic_sha256: 'a' },
    api_en: { semantic_sha256: 'b' },
    ssr: { semantic_sha256: 'c' },
    reviewed_registry: { semantic_sha256: 'd' },
    canonical: { semantic_sha256: 'e' }
  };

  const blocked = checkPipelineRegression({
    previousIntegrity: null,
    currentIntegrity,
    baselineSchemaVersion: 2
  });
  assert.equal(blocked.pass, false);
  assert.match(blocked.errors[0], /legacy integrity baseline requires explicit approval/i);

  const approved = checkPipelineRegression({
    previousIntegrity: null,
    currentIntegrity,
    baselineSchemaVersion: 2,
    allowLegacyIntegrityBaseline: true
  });
  assert.equal(approved.pass, true);
  assert.match(approved.warnings[0], /explicitly approved legacy integrity baseline/i);
});

test('pipeline regression gate treats even complete v2 integrity as legacy', () => {
  const integrity = {
    api_tc: { semantic_sha256: 'a' },
    api_en: { semantic_sha256: 'b' },
    ssr: { semantic_sha256: 'c' },
    reviewed_registry: { semantic_sha256: 'd' },
    canonical: { semantic_sha256: 'e' }
  };
  assert.equal(checkPipelineRegression({
    previousIntegrity: integrity,
    currentIntegrity: integrity,
    baselineSchemaVersion: 2
  }).pass, false);
  assert.equal(checkPipelineRegression({
    previousIntegrity: integrity,
    currentIntegrity: integrity,
    baselineSchemaVersion: 2,
    allowLegacyIntegrityBaseline: true
  }).pass, true);
});

test('pipeline regression gate always blocks incomplete v3 integrity', () => {
  const incomplete = {
    api_tc: { semantic_sha256: 'a' }
  };
  const result = checkPipelineRegression({
    previousIntegrity: incomplete,
    currentIntegrity: incomplete,
    baselineSchemaVersion: 3,
    allowLegacyIntegrityBaseline: true
  });
  assert.equal(result.pass, false);
  assert.match(result.errors[0], /schema v3.*missing or incomplete/i);
});

test('sync rejects an explicit missing reviewed registry instead of falling back', async () => {
  const root = await mkdtemp(join(tmpdir(), 'sf-registry-missing-'));
  const baselineDir = join(root, 'baseline');
  await mkdir(baselineDir, { recursive: true });
  await writeFile(join(baselineDir, 'locations.json'), '[]');

  await assert.rejects(
    runSync({
      isFixture: true,
      publish: false,
      baselineDir,
      reviewedRegistryPath: join(root, 'does-not-exist.json')
    }),
    /Reviewed registry missing/
  );

  await rm(root, { recursive: true, force: true });
});

test('audit projects API district fields and skips unavailable PDF administrative district', () => {
  const audit = auditPartnerPdfRecords({
    tcMap: new Map([['852DIST1', {
      serviceCode: '852DIST1',
      name: '測試店',
      address: '香港地址',
      city: '灣仔區',
      district: '灣仔',
      serviceTime: '09:00-18:00'
    }]]),
    parsedPdfRecords: [{
      serviceCode: '852DIST1',
      name: '測試店',
      address: '香港地址',
      district: '中環',
      city: null,
      serviceTime: '09:00-18:00'
    }]
  });

  const conflict = audit.api_pdf_conflicts[0];
  assert.equal(conflict.comparison.district, undefined);
  assert.equal(conflict.comparison.sub_district.classification, 'semantic_conflict');
  assert.deepEqual(conflict.differing_fields, ['sub_district']);
  assert.equal(audit.summary.api_pdf_difference_count, 1);
  assert.equal(audit.summary.api_pdf_conflict_count, 1);
});

test('audit reports entry and field classifications independently', () => {
  const audit = auditPartnerPdfRecords({
    tcMap: new Map([['852MIX1', {
      serviceCode: '852MIX1',
      name: '置富南區廣場OK便利店',
      address: '香港 灣仔道 1 號',
      city: '灣仔區',
      district: '灣仔',
      serviceTime: '09:00-18:00'
    }]]),
    parsedPdfRecords: [{
      serviceCode: '852MIX1',
      name: 'OK便利店 (灣仔)',
      address: '香港灣仔道1號',
      district: '灣仔',
      city: '灣仔',
      serviceTime: '10:00-19:00'
    }]
  });

  assert.equal(audit.api_pdf_conflicts[0].classification, 'semantic_conflict');
  assert.equal(audit.summary.api_pdf_difference_count, 1);
  assert.equal(audit.summary.api_pdf_conflict_count, 1);
  assert.deepEqual(audit.summary.entry_classification_counts, {
    semantic_conflict: 1,
    name_specificity_difference: 0,
    formatting_difference: 0,
    equivalent_difference: 0
  });
  assert.deepEqual(audit.summary.field_classification_counts, {
    semantic_conflict: 1,
    name_specificity_difference: 1,
    formatting_difference: 1,
    equivalent_difference: 0
  });
});

test('audit classifies shared retailer names with differing specificity separately', () => {
  const audit = auditPartnerPdfRecords({
    tcMap: new Map([['852NAME1', {
      serviceCode: '852NAME1',
      name: '置富南區廣場OK便利店',
      address: '香港薄扶林地址',
      district: '薄扶林',
      serviceTime: '09:00-18:00'
    }]]),
    parsedPdfRecords: [{
      serviceCode: '852NAME1',
      name: 'OK便利店 (薄扶林)',
      address: '香港薄扶林地址',
      district: '薄扶林',
      city: '薄扶林',
      serviceTime: '09:00-18:00'
    }]
  });

  assert.equal(audit.api_pdf_conflicts[0].comparison.name.classification, 'name_specificity_difference');
  assert.equal(audit.api_pdf_conflicts[0].classification, 'name_specificity_difference');
  assert.equal(audit.summary.entry_classification_counts.name_specificity_difference, 1);
  assert.equal(audit.summary.field_classification_counts.name_specificity_difference, 1);
});

test('PDF comparison treats 平台/平臺, 鋪/舖, and 葵湧/葵涌 as formatting only', () => {
  const audit = auditPartnerPdfRecords({
    tcMap: new Map([['852ADDR1', {
      serviceCode: '852ADDR1',
      name: '測試店',
      address: '葵湧商場平台1號鋪',
      serviceTime: '09:00-18:00'
    }]]),
    parsedPdfRecords: [{
      serviceCode: '852ADDR1',
      name: '測試店',
      address: '葵涌商場平臺1號舖',
      serviceTime: '09:00-18:00'
    }]
  });

  assert.equal(
    audit.api_pdf_conflicts[0].comparison.address.classification,
    'formatting_difference'
  );
});

test('PDF hours comparison equates 24:00 with 00:00 only when all other content matches', () => {
  const audit = auditPartnerPdfRecords({
    tcMap: new Map([
      ['852HOUR1', {
        serviceCode: '852HOUR1',
        name: '測試店一',
        address: '地址一',
        serviceTime: '06:30-24:00'
      }],
      ['852HOUR2', {
        serviceCode: '852HOUR2',
        name: '測試店二',
        address: '地址二',
        serviceTime: '06:30-23:00'
      }]
    ]),
    parsedPdfRecords: [
      {
        serviceCode: '852HOUR1',
        name: '測試店一',
        address: '地址一',
        serviceTime: '06:30-00:00'
      },
      {
        serviceCode: '852HOUR2',
        name: '測試店二',
        address: '地址二',
        serviceTime: '06:30-00:00'
      }
    ]
  });

  const equivalent = audit.api_pdf_conflicts.find(item => item.code === '852HOUR1');
  const semantic = audit.api_pdf_conflicts.find(item => item.code === '852HOUR2');
  assert.equal(equivalent.comparison.business_hours.classification, 'equivalent_difference');
  assert.equal(semantic.comparison.business_hours.classification, 'semantic_conflict');
});

test('committed reviewed evidence matches the immutable raw snapshot and artifact chronology', async () => {
  const registry = JSON.parse(await readFile(reviewedPath, 'utf8'));
  const rawSnapshot = JSON.parse(await readFile(resolve('raw/latest-fetch.json'), 'utf8'));
  const metadata = JSON.parse(await readFile(resolve('data/metadata.json'), 'utf8'));
  const documentsByUrl = new Map(
    rawSnapshot.sources.partner_pdf.documents.map(document => [document.url, document])
  );

  for (const record of registry) {
    const document = documentsByUrl.get(record.reviewed_source_url);
    assert.ok(document, `${record.code} reviewed source must exist in raw snapshot`);
    assert.equal(record.reviewed_document_binary_sha256, document.document_binary_sha256);
    assert.equal(record.reviewed_extracted_text_sha256, sha256(document.text));
    assert.equal(record.reviewed_extracted_text_sha256, document.extracted_text_sha256);
    assert.notEqual(document.document_binary_sha256, document.extracted_text_sha256);
    assert.equal(record.reviewed_source_retrieved_at, document.document_retrieved_at);
    assert.ok(
      Date.parse(metadata.generated_at.replace(' (HKT UTC+8)', '+08:00')) >=
        Date.parse(record.reviewed_source_retrieved_at.replace(' (HKT UTC+8)', '+08:00')),
      `${record.code} review evidence cannot be newer than generated artifacts`
    );
  }
});

test('PDF parser quality detail uses the shared ten-percent threshold', () => {
  const validRows = Array.from({ length: 15 }, (_, index) => {
    const code = `852A${String(1000 + index)}`;
    return `測試店${index}${code}香港測試道${index}號^${code}^星期一至六:10:00-18:00`;
  });
  const documents = [{
    source_key: 'ASP_TEST_TC',
    url: 'https://example.test/ASP_TEST_TC.pdf',
    http_ok: true,
    parse_ok: true,
    text: `${validRows.join('\n')}\n損壞店852A1999香港地址^852A1888^星期一至六:10:00-18:00`
  }];

  const result = parsePartnerPdfDocuments(documents);
  assert.equal(result.pdfDetails[0].quarantine_ratio > 0.05, true);
  assert.equal(result.pdfDetails[0].quarantine_ratio < 0.1, true);
  assert.equal(result.pdfDetails[0].within_quality_threshold, true);
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
