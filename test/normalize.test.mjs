import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeRecords } from '../scripts/lib/normalize.js';

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
