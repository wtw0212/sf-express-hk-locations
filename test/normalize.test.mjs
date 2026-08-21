import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeRecords, sanitizeCoordinates } from '../scripts/lib/normalize.js';
import { validateRecords } from '../scripts/lib/validate.js';

test('preserves official source values without character conversion', () => {
  const tcMap = new Map([['852PAL', {
    serviceCode: '852PAL',
    name: '筲箕灣天悅廣場順豐站',
    address: '香港東區筲箕灣南康街17號天悅筲箕灣廣場1樓1142及1143號鋪*',
    city: '東區',
    district: '筲箕灣',
    serviceTime: '12:00-21:00',
    latitude: 22.28,
    longitude: 114.23
  }]]);
  const enMap = new Map();

  const { records } = normalizeRecords({ tcMap, enMap, generatedAt: '2024-01-01' });

  assert.equal(records.length, 1);
  const r = records[0];
  // Must preserve 天悅 exactly — no global character conversion
  assert.ok(r.name.includes('天悅'), 'Name must preserve 天悅 without character conversion');
  assert.ok(r.address.includes('天悅'), 'Address must preserve 天悅 without character conversion');
});

test('removes caret ^ from EN address but preserves TC address', () => {
  const tcMap = new Map([['852TEST', {
    serviceCode: '852TEST',
    name: '測試順豐站',
    address: '地址^有^caret',
    city: '大埔區',
    district: '大埔',
    serviceTime: '',
    latitude: 22.45,
    longitude: 114.17
  }]]);
  const enMap = new Map([['852TEST', {
    serviceCode: '852TEST',
    name: 'Test Store',
    address: 'Address^with^carets',
    district: 'Tai Po',
    serviceTime: ''
  }]]);

  const { records } = normalizeRecords({ tcMap, enMap, generatedAt: '2024-01-01' });
  const r = records[0];
  assert.ok(!r.address_en.includes('^'), 'EN address should have carets removed');
  assert.ok(r.address.includes('^'), 'TC address should preserve carets (source value)');
});

test('includes provenance on every record', () => {
  const tcMap = new Map([['852AA', {
    serviceCode: '852AA',
    name: '大埔同茂坊順豐站',
    address: '香港大埔區大埔',
    city: '大埔區',
    district: '大埔',
    serviceTime: '09:00-20:00',
    latitude: 22.45,
    longitude: 114.17
  }]]);
  const enMap = new Map([['852AA', {
    serviceCode: '852AA',
    name: 'Tung Mau Square, Tai Po',
    address: 'G/F, 1 Tung Mau Square',
    district: 'Tai Po',
    serviceTime: 'Mon to Sat 09:00-20:00'
  }]]);

  const { records } = normalizeRecords({ tcMap, enMap, generatedAt: '2024-01-01' });
  const r = records[0];

  assert.ok(r.provenance, 'Record should have provenance');
  assert.equal(r.provenance.name, 'api_tc');
  assert.equal(r.provenance.name_en, 'api_en');
  assert.equal(r.provenance.address, 'api_tc');
  assert.equal(r.provenance.address_en, 'api_en');
});

test('quality_flags is always an array', () => {
  const tcMap = new Map([['852AA', {
    serviceCode: '852AA', name: '測試順豐站', address: '香港大埔區', city: '大埔區', district: '大埔',
    serviceTime: '', latitude: 22.45, longitude: 114.17
  }]]);
  const { records } = normalizeRecords({ tcMap, enMap: new Map(), generatedAt: '2024-01-01' });
  assert.ok(Array.isArray(records[0].quality_flags));
});

test('missing source address is explicitly derived and flagged', () => {
  const tcMap = new Map([['852PARTNER', {
    serviceCode: '852PARTNER',
    name: '合作點',
    address: '',
    city: '灣仔區',
    district: '灣仔',
    isPartner: true
  }]]);
  const { records } = normalizeRecords({ tcMap, enMap: new Map(), generatedAt: '2024-01-01' });
  const record = records[0];

  assert.equal(record.address, '灣仔');
  assert.equal(record.provenance.address, 'derived');
  assert.ok(record.quality_flags.some(flag => flag.type === 'MISSING_SOURCE_ADDRESS'));
  assert.ok(record.quality_flags.some(flag => flag.type === 'ADDRESS_DERIVED_FROM_LOCATION'));
});

test('SSR and Reviewed PDF records used only when not in TC API', () => {
  const tcMap = new Map([['852AA', {
    serviceCode: '852AA', name: 'API Version', address: 'API Addr', city: '大埔區', district: '大埔',
    serviceTime: '', latitude: 22.45, longitude: 114.17
  }]]);
  const ssrList = [{ serviceCode: '852AA', name: 'SSR Version', address: 'SSR Addr', district: '', city: '' }];
  const { records } = normalizeRecords({ tcMap, enMap: new Map(), ssrList, generatedAt: '2024-01-01' });

  const aaRecord = records.find(r => r.code === '852AA');
  assert.equal(aaRecord.name, 'API Version', 'TC API should take priority over SSR');
  assert.equal(aaRecord.source, 'api_tc');

  assert.equal(records.find(r => r.code === '852BB'), undefined);
});

test('no OpenCC or global character conversion exists', () => {
  // Test with characters that might be globally converted
  const tcMap = new Map([['852CHAR', {
    serviceCode: '852CHAR',
    name: '順豐站 有舖有湧有裏', // characters that should NOT be converted
    address: '某某舖某某湧某某裏',
    city: '大埔區', district: '大埔',
    serviceTime: '', latitude: 22.45, longitude: 114.17
  }]]);

  const { records } = normalizeRecords({ tcMap, enMap: new Map(), generatedAt: '2024-01-01' });
  const r = records[0];
  assert.ok(r.name.includes('舖'), 'Should preserve 舖 (not convert to 鋪)');
  assert.ok(r.name.includes('湧'), 'Should preserve 湧 (not convert to 涌)');
  assert.ok(r.name.includes('裏'), 'Should preserve 裏 (not convert to 里)');
});

test('corrects controlled geographic typos like 天後 -> 天后 in name, address, and sub_district', () => {
  const tcMap = new Map([['852P2008', {
    serviceCode: '852P2008',
    name: '便利店 僑興大廈OK便利店',
    address: '香港天後英皇道14號僑興大廈地下1H號鋪',
    city: '東區',
    district: '天後'
  }]]);

  const { records } = normalizeRecords({ tcMap, enMap: new Map(), generatedAt: '2026-07-28' });
  const rec = records.find(r => r.code === '852P2008');

  assert.ok(rec);
  assert.equal(rec.sub_district, '天后');
  assert.equal(rec.address, '香港天后英皇道14號僑興大廈地下1H號鋪');
});

test('sanitizeCoordinates: H852Z007P outside HK coordinates are quarantined to null and flagged', () => {
  const result = sanitizeCoordinates(23.12134, 110.13114, 'H852Z007P');
  assert.deepEqual(result.location, { latitude: null, longitude: null });
  assert.equal(result.qualityFlags.length, 1);
  const flag = result.qualityFlags[0];
  assert.equal(flag.type, 'COORDINATES_OUTSIDE_HK');
  assert.equal(flag.severity, 'warning');
  assert.deepEqual(flag.fields, ['location']);
  assert.equal(flag.details.source_latitude, 23.12134);
  assert.equal(flag.details.source_longitude, 110.13114);
  assert.equal(flag.details.reason, 'outside_hk_bounding_box');
});

test('sanitizeCoordinates: valid HK coordinates are preserved without quality flags', () => {
  const result = sanitizeCoordinates(22.3, 114.2, '852TEST');
  assert.deepEqual(result.location, { latitude: 22.3, longitude: 114.2 });
  assert.deepEqual(result.qualityFlags, []);
});

test('sanitizeCoordinates: both missing coordinates produce null/null and MISSING_COORDINATES info flag', () => {
  const result = sanitizeCoordinates(null, null, '852TEST');
  assert.deepEqual(result.location, { latitude: null, longitude: null });
  assert.equal(result.qualityFlags.length, 1);
  assert.equal(result.qualityFlags[0].type, 'MISSING_COORDINATES');
  assert.equal(result.qualityFlags[0].severity, 'info');
  assert.equal(result.qualityFlags[0].details.code, '852TEST');
});

test('sanitizeCoordinates: partial coordinates produce null/null and INVALID_SOURCE_COORDINATES warning flag', () => {
  const result = sanitizeCoordinates(22.3, null, '852TEST');
  assert.deepEqual(result.location, { latitude: null, longitude: null });
  assert.equal(result.qualityFlags.length, 1);
  assert.equal(result.qualityFlags[0].type, 'INVALID_SOURCE_COORDINATES');
  assert.equal(result.qualityFlags[0].severity, 'warning');
  assert.equal(result.qualityFlags[0].details.source_latitude, 22.3);
  assert.equal(result.qualityFlags[0].details.source_longitude, null);
});

test('sanitizeCoordinates: non-finite or garbage coordinates produce null/null and INVALID_SOURCE_COORDINATES warning flag', () => {
  const result = sanitizeCoordinates('abc', 114.2, '852TEST');
  assert.deepEqual(result.location, { latitude: null, longitude: null });
  assert.equal(result.qualityFlags.length, 1);
  assert.equal(result.qualityFlags[0].type, 'INVALID_SOURCE_COORDINATES');
  assert.equal(result.qualityFlags[0].severity, 'warning');
  assert.equal(result.qualityFlags[0].details.source_latitude, 'abc');
  assert.equal(result.qualityFlags[0].details.source_longitude, 114.2);
});

test('sanitizeCoordinates: empty and whitespace-only strings are treated as absent (MISSING_COORDINATES)', () => {
  const result = sanitizeCoordinates('', '   ', '852TEST');
  assert.deepEqual(result.location, { latitude: null, longitude: null });
  assert.equal(result.qualityFlags.length, 1);
  assert.equal(result.qualityFlags[0].type, 'MISSING_COORDINATES');
  assert.equal(result.qualityFlags[0].severity, 'info');
});

test('normalizeRecords integration: bad upstream coordinates are sanitized and pass validateRecords cleanly', () => {
  const tcMap = new Map([
    ['H852Z007P', {
      serviceCode: 'H852Z007P',
      name: '自助櫃 香港',
      address: '順豐大廈9樓',
      city: '葵青區',
      district: '青衣',
      serviceTime: '00:00-23:55',
      latitude: 23.12134,
      longitude: 110.13114
    }],
    ['852VALID', {
      serviceCode: '852VALID',
      name: '正常順豐站',
      address: '香港大埔區大埔安埔路12號',
      city: '大埔區',
      district: '大埔',
      serviceTime: '09:00-20:00',
      latitude: 22.45,
      longitude: 114.17
    }],
    ['852NOCOORD', {
      serviceCode: '852NOCOORD',
      name: '無座標順豐站',
      address: '香港大埔區大埔安埔路12號',
      city: '大埔區',
      district: '大埔',
      serviceTime: '09:00-20:00',
      latitude: null,
      longitude: null
    }],
    ['852EMPTYCOORD', {
      serviceCode: '852EMPTYCOORD',
      name: '空字串座標順豐站',
      address: '香港大埔區大埔安埔路12號',
      city: '大埔區',
      district: '大埔',
      serviceTime: '09:00-20:00',
      latitude: '',
      longitude: '   '
    }],
    ['852PARTIAL', {
      serviceCode: '852PARTIAL',
      name: '單邊座標順豐站',
      address: '香港大埔區大埔安埔路12號',
      city: '大埔區',
      district: '大埔',
      serviceTime: '09:00-20:00',
      latitude: 22.45,
      longitude: null
    }],
    ['852GARBAGE', {
      serviceCode: '852GARBAGE',
      name: '無效字串座標順豐站',
      address: '香港大埔區大埔安埔路12號',
      city: '大埔區',
      district: '大埔',
      serviceTime: '09:00-20:00',
      latitude: 'abc',
      longitude: 114.17
    }]
  ]);

  const { records } = normalizeRecords({ tcMap, enMap: new Map(), generatedAt: '2026-08-21' });
  assert.equal(records.length, 6);

  // 1. H852Z007P has null location and COORDINATES_OUTSIDE_HK flag
  const h852 = records.find(r => r.code === 'H852Z007P');
  assert.ok(h852);
  assert.deepEqual(h852.location, { latitude: null, longitude: null });
  const h852Flag = h852.quality_flags.find(f => f.type === 'COORDINATES_OUTSIDE_HK');
  assert.ok(h852Flag, 'H852Z007P should have COORDINATES_OUTSIDE_HK flag');
  assert.equal(h852Flag.details.source_latitude, 23.12134);
  assert.equal(h852Flag.details.source_longitude, 110.13114);
  assert.ok(!h852.quality_flags.some(f => f.type === 'MISSING_COORDINATES'), 'H852Z007P must not have MISSING_COORDINATES flag');

  // 2. Validate all normalized records through strict Tier 2 validator
  const validationResult = validateRecords(records);
  assert.deepEqual(validationResult.errors, [], 'validateRecords must pass with zero blocking errors');
});
