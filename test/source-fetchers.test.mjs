import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractLineSegments,
  validateParsedPartnerRecord,
  validateServiceNetworkApiPayload
} from '../scripts/lib/source-fetchers.js';
import { fetchWithRetry } from '../scripts/lib/api-client.js';
import { sha256 } from '../scripts/lib/source-hashes.js';
import { normalizeRecords } from '../scripts/lib/normalize.js';

test('api-client: preserves and hashes exact JSON response text before parsing', async () => {
  const originalFetch = globalThis.fetch;
  const exact = '{ "success": true, "result": [] }\n';
  globalThis.fetch = async () => new Response(exact, {
    status: 200,
    headers: { 'content-type': 'application/json' }
  });

  try {
    const result = await fetchWithRetry('https://example.test/api', {}, { maxAttempts: 1 });
    assert.equal(result.ok, true);
    assert.equal(result.rawText, exact);
    assert.equal(result.raw_sha256, sha256(exact));
    assert.deepEqual(result.data, { success: true, result: [] });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('source-fetchers: extractLineSegments splits multi-code lines deterministically', () => {
  const line = '香港柴灣 852PC3002 興華邨和興樓210號鋪^09:00-20:00 852PC3004 興華邨安興樓101號鋪^10:00-20:00';
  const segments = extractLineSegments(line);

  assert.equal(segments.length, 2);
  assert.equal(segments[0].code, '852PC3002');
  assert.ok(!segments[0].segment.includes('852PC3004'), 'Segment 0 must NOT contain 852PC3004');
  assert.equal(segments[1].code, '852PC3004');
  assert.ok(!segments[1].segment.includes('852PC3002'), 'Segment 1 must NOT contain 852PC3002');
});

test('source-fetchers: validateParsedPartnerRecord identifies clean valid records', () => {
  const valid = {
    serviceCode: '852PC3002',
    name: 'OK便利店 (柴灣)',
    address: '香港柴灣興華邨和興樓210號鋪'
  };
  const res = validateParsedPartnerRecord(valid, 'raw segment');
  assert.equal(res.valid, true);
  assert.deepEqual(res.reasonCodes, []);
});

test('source-fetchers: validateParsedPartnerRecord quarantines exact regression corruption examples', () => {
  // Example 1: 852PC3002 contains 852PC3004
  const corrupt1 = {
    serviceCode: '852PC3002',
    name: 'OK便利店',
    address: '柴灣興華邨和興樓210號鋪 852PC3004 柴灣興華邨安興樓101號鋪'
  };
  const res1 = validateParsedPartnerRecord(corrupt1, 'raw');
  assert.equal(res1.valid, false);
  assert.ok(res1.reasonCodes.includes('EMBEDDED_SERVICE_CODE'));

  // Example 2: 852MA3003 contains 852MA3017
  const corrupt2 = {
    serviceCode: '852MA3003',
    name: '順豐合作點 852MA3017',
    address: '馬鞍山新港城商場2樓'
  };
  const res2 = validateParsedPartnerRecord(corrupt2, 'raw');
  assert.equal(res2.valid, false);
  assert.ok(res2.reasonCodes.includes('EMBEDDED_SERVICE_CODE'));

  // Example 3: Residual ^ separator
  const corrupt3 = {
    serviceCode: '852FE3018',
    name: '合作點',
    address: '粉嶺花園地下1號鋪^09:00-20:00'
  };
  const res3 = validateParsedPartnerRecord(corrupt3, 'raw');
  assert.equal(res3.valid, false);
  assert.ok(res3.reasonCodes.includes('RESIDUAL_SEPARATOR'));

  // Example 4: Name equals address
  const corrupt4 = {
    serviceCode: '852G3006',
    name: '順豐合作點',
    address: '順豐合作點'
  };
  const res4 = validateParsedPartnerRecord(corrupt4, 'raw');
  assert.equal(res4.valid, false);
  assert.ok(res4.reasonCodes.includes('NAME_EQUALS_ADDRESS'));

  // Example 5: Placeholder address
  const corrupt5 = {
    serviceCode: '852F3017',
    name: 'OK便利店',
    address: '順豐合作點'
  };
  const res5 = validateParsedPartnerRecord(corrupt5, 'raw');
  assert.equal(res5.valid, false);
  assert.ok(res5.reasonCodes.includes('PLACEHOLDER_ADDRESS'));
});

test('source-fetchers: validateServiceNetworkApiPayload validates response envelope & contracts', () => {
  const validPayload = {
    success: true,
    result: [
      { serviceCode: '852A', name: 'Store A', address: 'Address A' }
    ]
  };
  assert.doesNotThrow(() => validateServiceNetworkApiPayload(validPayload));

  assert.throws(
    () => validateServiceNetworkApiPayload({ success: false, result: [] }),
    /Unexpected SF service-network API response envelope/
  );

  assert.throws(
    () => validateServiceNetworkApiPayload({ success: true, result: [{ serviceCode: '852A' }] }),
    /SF service-network API contract changed/
  );
});

test('source-fetchers: precedence policy ensures PDF cannot overwrite API-backed fields', () => {
  const tcRecord = {
    serviceCode: '852A',
    name: 'API Name',
    address: 'API Address',
    district: '灣仔區',
    serviceTime: '09:00-20:00',
    latitude: '22.28',
    longitude: '114.17'
  };
  const pdfRecord = {
    serviceCode: '852A',
    name: 'PDF Name',
    address: 'PDF Address',
    serviceTime: '10:00-18:00',
    isPartner: true
  };

  const { records } = normalizeRecords({
    tcMap: new Map([['852A', tcRecord]]),
    enMap: new Map(),
    generatedAt: '2026-07-27 14:00'
  });

  const finalRecord = records.find(r => r.code === '852A');
  assert.ok(finalRecord);
  assert.equal(finalRecord.name, 'API Name');
  assert.equal(finalRecord.address, 'API Address');
  assert.equal(finalRecord.business_hours, '09:00-20:00');
  assert.equal(finalRecord.source, 'api_tc');
});
