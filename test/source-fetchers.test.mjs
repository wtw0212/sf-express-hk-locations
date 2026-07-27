import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractLineSegments,
  validateParsedPartnerRecord
} from '../scripts/lib/source-fetchers.js';

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
