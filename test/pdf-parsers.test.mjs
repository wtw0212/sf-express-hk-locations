import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseOkPartnerPdfText } from '../scripts/lib/pdf-parsers/ok-partner-parser.js';
import { parseAspPartnerPdfText } from '../scripts/lib/pdf-parsers/asp-partner-parser.js';
import { findServiceCodes, validateBusinessHours } from '../scripts/lib/pdf-parsers/common.js';
import { parsePartnerPdfDocuments } from '../scripts/lib/source-fetchers.js';
import { checkCompletenessGates } from '../scripts/lib/validate.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

test('pdf-parsers: parseOkPartnerPdfText correctly parses multiline wrapped OK PDF fixture', async () => {
  const text = await readFile(resolve(__dirname, 'fixtures/pdf/ok-hk-page-sample.txt'), 'utf8');
  const res = parseOkPartnerPdfText({ text, sourceUrl: 'https://hk.sf-express.com/uploads/OK_HK_TC.pdf' });

  const tb2011 = res.validRecords.find(r => r.serviceCode === '852TB2011');
  assert.ok(tb2011, '852TB2011 record must exist');
  assert.equal(tb2011.name, 'OK便利店 (黃竹坑)');
  assert.equal(tb2011.address, '香港海洋公園港鐵站OCP 5 號舖');
  assert.equal(tb2011.serviceTime, '07:00-16:00 星期日及公眾假期: 08:00-16:00');

  const ma2013 = res.validRecords.find(r => r.serviceCode === '852MA2013');
  assert.ok(ma2013, '852MA2013 record must exist');
  assert.equal(ma2013.name, 'OK便利店 (堅尼地城)');
  assert.equal(ma2013.address, '香港爹核士街7 & 7A號，卑路乍街136、136A、138、140及142號，聯威新樓 地下A號舖');
  assert.equal(ma2013.serviceTime, '24小時');
});

test('pdf-parsers: ASP parser quarantines conflicting visible and caret service codes', async () => {
  const text = await readFile(resolve(__dirname, 'fixtures/pdf/asp-hk-page-sample.txt'), 'utf8');
  const result = parseAspPartnerPdfText({ text, sourceUrl: 'https://hk.sf-express.com/uploads/ASP_HK_TC.pdf' });

  for (const code of ['852PC3002', '852MA3003']) {
    assert.ok(
      !result.validRecords.some(record => record.serviceCode === code),
      `${code} must not be published from an unresolved code mismatch`
    );
  }

  assert.ok(
    result.quarantinedRecords.some(record => record.reasonCodes.includes('SERVICE_CODE_MISMATCH'))
  );
});

test('pdf-parsers: no published PDF field contains another service code', async () => {
  const text = await readFile(resolve(__dirname, 'fixtures/pdf/asp-nt-page-sample.txt'), 'utf8');
  const result = parseAspPartnerPdfText({ text, sourceUrl: 'https://hk.sf-express.com/uploads/ASP_NT_TC.pdf' });

  for (const record of result.validRecords) {
    for (const value of [record.name, record.address, record.serviceTime]) {
      const foreignCodes = findServiceCodes(value).filter(code => code !== record.serviceCode);
      assert.deepEqual(
        foreignCodes,
        [],
        `${record.serviceCode} contains foreign code(s): ${foreignCodes.join(', ')}`
      );
    }
  }
});

test('pdf-parsers: parseAspPartnerPdfText preserves business hours for valid records & quarantines code mismatches', async () => {
  const text = await readFile(resolve(__dirname, 'fixtures/pdf/asp-nt-page-sample.txt'), 'utf8');
  const res = parseAspPartnerPdfText({ text, sourceUrl: 'https://hk.sf-express.com/uploads/ASP_NT_TC.pdf' });

  const gc2003 = res.validRecords.find(r => r.serviceCode === '852GC2003');
  assert.ok(gc2003);
  assert.equal(gc2003.serviceTime, '24小時');

  const fe3012 = res.validRecords.find(r => r.serviceCode === '852FE3012');
  assert.ok(fe3012);
  assert.equal(fe3012.serviceTime, '星期一至六:12:00-20:00 星期日及公眾假期:12:00-18:00');

  const g3004 = res.validRecords.find(r => r.serviceCode === '852G3004');
  assert.ok(g3004);
  assert.equal(g3004.serviceTime, '星期一至六: 12:00-20:30 星期日、公眾假期: 休息');

  const g3008 = res.validRecords.find(r => r.serviceCode === '852G3008');
  assert.ok(g3008);
  assert.equal(g3008.serviceTime, '星期一至六:10:00-21:00 星期日:10:00-21:00 公眾假期:休息');

  assert.ok(res.quarantinedRecords.some(q => q.reasonCodes.includes('SERVICE_CODE_MISMATCH')));
});

test('pdf-parsers: quarantine quality threshold gates block > 5% quarantine ratio', () => {
  const mockPdfResult = {
    pdfTotal: 1,
    httpSuccessCount: 1,
    parseSuccessCount: 1,
    semanticSuccessCount: 0,
    partialQualityFailureCount: 1,
    failedCount: 0,
    records: Array(90).fill({ serviceCode: '852A' }),
    quarantinedRecords: Array(10).fill({ extractedCode: '852B', reasonCodes: ['EMPTY_ADDRESS'] }),
    pdfDetails: [
      {
        source_key: 'OK_HK_TC',
        url: 'https://hk.sf-express.com/uploads/OK_HK_TC.pdf',
        status: 'partial_parse_quality_failure',
        http_ok: true,
        parse_ok: true,
        semantic_ok: false,
        attempts: 1,
        raw_code_count: 100,
        candidate_count: 100,
        valid_record_count: 90,
        quarantined_record_count: 10,
        duplicate_code_count: 0,
        duplicate_conflict_count: 0,
        quarantine_ratio: 0.10
      }
    ]
  };

  const gateResult = checkCompletenessGates({
    tcResults: [{ ok: true, records: [] }],
    enResults: [{ ok: true, records: [] }],
    pdfResult: mockPdfResult,
    records: Array(1100).fill({ code: '852A' }),
    previousRecords: Array(1100).fill({ code: '852A' })
  });

  assert.equal(gateResult.pass, false);
  assert.ok(gateResult.errors.some(e => e.includes('quarantine ratio 10.0% exceeds blocking threshold 5%')));
});

test('ASP parser does not append the next prefix to 852LA3007 hours', () => {
  const result = parseAspPartnerPdfText({
    text: `
葵涌康力達環保貿易公司852LA3007葵涌和宜合道167-175號金威工業大廈一期低層地下B7室^852LA3007^取件
星期一至六:12:00-18:00
星期日及公眾假期:休息
葵涌 GS集運王（瑞景大廈）
852LA3008葵涌下一個地址^852LA3008^取件
星期一至六:12:00-20:00
`,
    sourceUrl: 'fixture://ASP_NT_TC'
  });

  const la3007 = result.validRecords.find(record => record.serviceCode === '852LA3007');
  assert.ok(la3007);
  assert.equal(la3007.name, '葵涌康力達環保貿易公司');
  assert.equal(la3007.district, '葵涌');
  assert.equal(la3007.serviceTime, '星期一至六:12:00-18:00 星期日及公眾假期:休息');
  assert.ok(!la3007.serviceTime.includes('GS集運王'));

  const la3008 = result.validRecords.find(record => record.serviceCode === '852LA3008');
  assert.ok(la3008);
  assert.ok(la3008.name.includes('GS集運王'));
});

test('business-hours validation rejects mixed hours and location text', () => {
  const result = validateBusinessHours(
    '星期一至六:12:00-18:00 星期日及公眾假期:休息 葵涌 GS集運王（瑞景大廈）'
  );

  assert.equal(result.valid, false);
  assert.ok(result.reasonCodes.includes('NEXT_RECORD_PREFIX_LEAK'));
});

test('severe-removal gate checks all involvedCodes when caret code was previously published', () => {
  const pdfResult = {
    records: [],
    quarantinedRecords: [
      {
        extractedCode: '852PC3004',
        involvedCodes: ['852PC3004', '852PC3002'],
        reasonCodes: ['SERVICE_CODE_MISMATCH']
      }
    ],
    documents: [{ source_key: 'OK_HK_TC' }]
  };
  const prevRecords = [{ code: '852PC3002' }];
  const currentRecords = [];

  const gateResult = checkCompletenessGates({
    tcResults: [{ ok: true, records: [] }],
    enResults: [{ ok: true, records: [] }],
    pdfResult,
    records: currentRecords,
    previousRecords: prevRecords
  });

  assert.ok(gateResult.errors.some(e => e.includes('Severe PDF parser quarantines would remove previously published records')));
});

test('parsePartnerPdfDocuments sets semantic_ok = false when quarantine count > 0', () => {
  const documents = [
    {
      source_key: 'ASP_HK_TC',
      url: 'https://example.com/test.pdf',
      http_ok: true,
      parse_ok: true,
      text: `
852PC3004 柴灣安興樓101號鋪^852PC3002^
星期一至六:10:00-20:00
`
    }
  ];

  const result = parsePartnerPdfDocuments(documents);
  assert.equal(result.pdfDetails[0].semantic_ok, false);
});

test('sticky cross-PDF duplicate conflict keeps third occurrence quarantined', () => {
  const documents = [
    {
      source_key: 'PDF_1',
      url: 'https://example.com/pdf1.pdf',
      http_ok: true,
      parse_ok: true,
      text: '店鋪1 852DUP1001 柴灣1號^852DUP1001^\n星期一:10:00-18:00\n'
    },
    {
      source_key: 'PDF_2',
      url: 'https://example.com/pdf2.pdf',
      http_ok: true,
      parse_ok: true,
      text: '店鋪2 852DUP1001 柴灣2號^852DUP1001^\n星期一:10:00-19:00\n'
    },
    {
      source_key: 'PDF_3',
      url: 'https://example.com/pdf3.pdf',
      http_ok: true,
      parse_ok: true,
      text: '店鋪3 852DUP1001 柴灣3號^852DUP1001^\n星期一:10:00-20:00\n'
    }
  ];

  const result = parsePartnerPdfDocuments(documents);
  assert.equal(result.records.find(r => r.serviceCode === '852DUP1001'), undefined);
  const quarantinedDupes = result.quarantinedRecords.filter(q => q.extractedCode === '852DUP1001');
  assert.equal(quarantinedDupes.length, 3);
});

test('required invariant holds for all parsed PDF records', async () => {
  const aspText = await readFile(resolve(__dirname, 'fixtures/pdf/asp-nt-page-sample.txt'), 'utf8');
  const result = parseAspPartnerPdfText({ text: aspText, sourceUrl: 'https://hk.sf-express.com/uploads/ASP_NT_TC.pdf' });

  for (const record of result.validRecords) {
    assert.ok(record.name && record.name !== '順豐合作點', `Record ${record.serviceCode} must have valid name`);

    const hoursValidation = validateBusinessHours(record.serviceTime);
    assert.ok(
      !hoursValidation.reasonCodes.includes('NEXT_RECORD_PREFIX_LEAK'),
      `Record ${record.serviceCode} must not leak next prefix in hours`
    );

    for (const value of [record.name, record.address, record.serviceTime]) {
      if (!value) continue;
      const foreignCodes = findServiceCodes(value).filter(code => code !== record.serviceCode);
      assert.deepEqual(foreignCodes, [], `Record ${record.serviceCode} must not contain foreign code in ${value}`);
    }
  }
});
