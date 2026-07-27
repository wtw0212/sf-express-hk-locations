import test from 'node:test';
import assert from 'node:assert/strict';
import { generateQualityFlags } from '../scripts/lib/quality-flags.js';

test('detects MISSING_ENGLISH_RECORD when enItem is null', () => {
  const flags = generateQualityFlags(
    { address: '香港', serviceTime: '' },
    null,
    { code: '852TEST', location: { latitude: 22.3, longitude: 114.2 }, address: '', address_en: null, name_en: null, sub_district: '', district_en: null }
  );
  assert.ok(flags.some(f => f.type === 'MISSING_ENGLISH_RECORD'));
});

test('detects MISSING_COORDINATES', () => {
  const flags = generateQualityFlags(null, null, {
    code: '852TEST', location: { latitude: null, longitude: null },
    address: '', address_en: null, name_en: null, sub_district: '', district_en: null
  });
  assert.ok(flags.some(f => f.type === 'MISSING_COORDINATES'));
});

test('detects COORDINATES_OUTSIDE_HK', () => {
  const flags = generateQualityFlags(null, null, {
    code: '852TEST', location: { latitude: 39.9, longitude: 116.4 },
    address: '', address_en: null, name_en: null, sub_district: '', district_en: null
  });
  assert.ok(flags.some(f => f.type === 'COORDINATES_OUTSIDE_HK'));
});

test('852PC: detects street number conflict 6號 vs 6A', () => {
  const flags = generateQualityFlags(
    { address: '阿公岩村道6號新高聲工業大廈', serviceTime: '' },
    { address: '6A A Kung Ngam Village Road', serviceTime: '' },
    {
      code: '852PC',
      location: { latitude: 22.28, longitude: 114.23 },
      address: '阿公岩村道6號新高聲工業大廈',
      address_en: '6A A Kung Ngam Village Road',
      name_en: 'Test', sub_district: '', district_en: null
    }
  );
  assert.ok(flags.some(f => f.type === 'SOURCE_TC_EN_STREET_NUMBER_CONFLICT'),
    'Should detect street number conflict between 6號 and 6A');
});

test('852NLL: detects business hours conflict', () => {
  const tcHours = '星期一至星期五,12:00-21:00;星期日及公眾假期,12:00-20:00';
  const enHours = 'Mon to Fri 11:00-20:30; Sun & Public Holidays 12:00-20:00';

  const flags = generateQualityFlags(
    { address: '', serviceTime: tcHours },
    { address: '', serviceTime: enHours },
    {
      code: '852NLL',
      location: { latitude: 22.45, longitude: 114.17 },
      address: '', address_en: '', name_en: 'Test', sub_district: '', district_en: null
    }
  );
  assert.ok(flags.some(f => f.type === 'SOURCE_TC_EN_BUSINESS_HOURS_CONFLICT'),
    'Should detect weekday hours mismatch (12:00-21:00 vs 11:00-20:30)');
});

test('detects DUPLICATE_ADDRESS_SUFFIX for multiple Hong Kong', () => {
  const flags = generateQualityFlags(null, null, {
    code: '852TEST',
    location: { latitude: 22.3, longitude: 114.2 },
    address: '',
    address_en: 'Shop 1, Wan Chai, Hong Kong Island, Hong Kong',
    name_en: 'Test', sub_district: '', district_en: null
  });
  assert.ok(flags.some(f => f.type === 'DUPLICATE_ADDRESS_SUFFIX'));
});

test('detects ENGLISH_FIELD_CONTAINS_CJK', () => {
  const flags = generateQualityFlags(null, null, {
    code: '852TEST',
    location: { latitude: 22.3, longitude: 114.2 },
    address: '',
    address_en: 'Shop 1, 旺角 Street',
    name_en: 'Test EN', sub_district: '', district_en: null
  });
  assert.ok(flags.some(f => f.type === 'ENGLISH_FIELD_CONTAINS_CJK'));
});

test('detects SOURCE_FORMATTING_ARTIFACT for caret', () => {
  const flags = generateQualityFlags(null, null, {
    code: '852TEST',
    location: { latitude: 22.3, longitude: 114.2 },
    address: 'test^address',
    address_en: '', name_en: 'Test', sub_district: '', district_en: null
  });
  assert.ok(flags.some(f => f.type === 'SOURCE_FORMATTING_ARTIFACT'));
});

test('852Z152: detects subdistrict/address conflict (Sau Mau Ping vs Yau Tong)', () => {
  const flags = generateQualityFlags(null, null, {
    code: '852Z152',
    location: { latitude: 22.32, longitude: 114.24 },
    address: '香港觀塘區油塘秀茂坪寶達邨寶達商場P1樓108號鋪',
    address_en: '', name_en: 'Test',
    sub_district: '油塘',
    district_en: 'Kwun Tong District'
  });
  assert.ok(flags.some(f => f.type === 'SUBDISTRICT_ADDRESS_CONFLICT'),
    'Should detect that address mentions 秀茂坪 but sub_district is 油塘');
});
