import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseOkPartnerPdfText } from '../scripts/lib/pdf-parsers/ok-partner-parser.js';
import { parseAspPartnerPdfText } from '../scripts/lib/pdf-parsers/asp-partner-parser.js';
import { checkCompletenessGates } from '../scripts/lib/validate.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

test('pdf-parsers: parseOkPartnerPdfText correctly parses multiline wrapped OK PDF fixture', async () => {
  const text = await readFile(resolve(__dirname, 'fixtures/pdf/ok-hk-page-sample.txt'), 'utf8');
  const res = parseOkPartnerPdfText({ text, sourceUrl: 'https://hk.sf-express.com/uploads/OK_HK_TC.pdf' });

  assert.equal(res.metrics.quarantineCount, 0, 'Fixture quarantine count must be 0');
  assert.equal(res.validRecords.length, 5);

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

test('pdf-parsers: parseAspPartnerPdfText handles ASP HK fixture & regression code pairs', async () => {
  const text = await readFile(resolve(__dirname, 'fixtures/pdf/asp-hk-page-sample.txt'), 'utf8');
  const res = parseAspPartnerPdfText({ text, sourceUrl: 'https://hk.sf-express.com/uploads/ASP_HK_TC.pdf' });

  assert.equal(res.metrics.quarantineCount, 0);
  assert.equal(res.validRecords.length, 4);

  // Check 852PC3002 regression pair (raw text contained typo 852PC3004 before address)
  const pc3002 = res.validRecords.find(r => r.serviceCode === '852PC3002');
  assert.ok(pc3002, '852PC3002 must be extracted cleanly');
  assert.equal(pc3002.name, '筲箕灣愛蝶灣自提點');
  assert.equal(pc3002.address, '筲箕湾愛禮街2號愛蝶灣25號地下');
  assert.ok(!pc3002.name.includes('852PC3004'), '852PC3004 must not leak into 852PC3002 name');
  assert.ok(!pc3002.address.includes('852PC3004'), '852PC3004 must not leak into 852PC3002 address');
  assert.ok(pc3002.serviceTime.includes('12:00-21:00'));

  // Check 852MA3003 regression pair
  const ma3003 = res.validRecords.find(r => r.serviceCode === '852MA3003');
  assert.ok(ma3003, '852MA3003 must be extracted cleanly');
  assert.equal(ma3003.name, '西營盤港大自提點');
  assert.equal(ma3003.address, '石塘咀皇后大道西425Z永華大廈後座地舖');
  assert.ok(!ma3003.name.includes('852MA3017'));
});

test('pdf-parsers: parseAspPartnerPdfText preserves business hours for 852GC2003, 852FE3012, 852G3004, 852G3008', async () => {
  const text = await readFile(resolve(__dirname, 'fixtures/pdf/asp-nt-page-sample.txt'), 'utf8');
  const res = parseAspPartnerPdfText({ text, sourceUrl: 'https://hk.sf-express.com/uploads/ASP_NT_TC.pdf' });

  assert.equal(res.metrics.quarantineCount, 0);

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
        quarantine_ratio: 0.10 // 10% quarantine ratio > 5% block threshold
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
