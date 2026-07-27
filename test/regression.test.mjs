import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeRecords } from '../scripts/lib/normalize.js';
import { resolveAdminDistrict } from '../scripts/lib/district-resolver.js';
import { generateQualityFlags } from '../scripts/lib/quality-flags.js';

// ─── Regression fixtures based on known records ─────────────────────

test('852TC: preserves official address for Tung Wai Commercial Mansion / Fleming Road', () => {
  const tcMap = new Map([['852TC', {
    serviceCode: '852TC',
    name: '灣仔東惠商業大廈順豐站',
    address: '香港灣仔區灣仔灣仔菲林明道22-26號東惠商業大廈地下6號鋪*',
    city: '灣仔區',
    district: '灣仔',
    serviceTime: '星期一至星期六,09:00-20:00;星期日及勞工假期,休息',
    telephone: '64785647',
    latitude: 22.27897,
    longitude: 114.174459
  }]]);
  const enMap = new Map([['852TC', {
    serviceCode: '852TC',
    name: 'Jaffe Road, Wan Chai',
    address: 'Shop 6, G/F, Tung Wai Commercial Mansion, 22-26 Fleming Road, Wan Chai, Hong Kong Island, Hong Kong*,Wan Chai,Wan Chai District,Hong Kong',
    district: 'Wan Chai',
    serviceTime: 'Mon to Sat 09:00-20:00; Sun & Statutory Holidays Closed'
  }]]);

  const { records } = normalizeRecords({ tcMap, enMap, generatedAt: '2024-01-01' });
  const r = records[0];

  // Address must NOT be replaced with Jaffe Road
  assert.ok(r.address.includes('菲林明道'), '852TC address must preserve Fleming Road (菲林明道)');
  assert.ok(r.address.includes('東惠商業大廈'), '852TC address must preserve Tung Wai Commercial Mansion');
  assert.equal(r.district, '灣仔區');
  assert.equal(r.region, '香港島');
  assert.equal(r.name_en, 'Jaffe Road, Wan Chai');
});

test('852Z351: resolves 大嶼山區 to 離島區 via alias, not null', () => {
  const item = {
    serviceCode: '852Z351',
    name: '東涌東薈城順豐站(只限寄件)',
    address: '香港大嶼山區東涌達東路20號東薈城2樓',
    city: '大嶼山區',
    district: '東涌'
  };

  const districtResult = resolveAdminDistrict(item);
  assert.equal(districtResult.district, '離島區', '852Z351 district should be 離島區');
  assert.equal(districtResult.region, '新界', '852Z351 region should be 新界');
  assert.equal(districtResult.district_en, 'Islands District');
  assert.ok(districtResult.flags.some(f => f.type === 'ADMIN_DISTRICT_ALIAS_APPLIED'),
    'Should have ADMIN_DISTRICT_ALIAS_APPLIED flag');

  // Also test via normalize
  const tcMap = new Map([['852Z351', item]]);
  const { records } = normalizeRecords({ tcMap, enMap: new Map(), generatedAt: '2024-01-01' });
  assert.equal(records[0].district, '離島區');
  assert.equal(records[0].region, '新界');
  assert.notEqual(records[0].district, null);
  assert.notEqual(records[0].region, null);
});

test('852Z152: detects subdistrict/address conflict and preserves source values', () => {
  const tcItem = {
    serviceCode: '852Z152',
    name: '秀茂坪寶達商場順豐站',
    address: '香港觀塘區油塘秀茂坪寶達邨寶達商場P1樓108號鋪*',
    city: '觀塘區',
    district: '油塘',
    serviceTime: '星期一至星期五,12:00-21:00',
    latitude: 22.317409,
    longitude: 114.236184
  };
  const enItem = {
    serviceCode: '852Z152',
    name: 'Sau Mau Ping, Po Tat shopping CTR',
    address: 'Shop No. 108, P1 Floor, Po Tat Shopping Centre, Po tat Estate, Kwun Tong, Kwun Tong District, Kowloon, Hong Kong*,Yau Tong,Kwun Tong District,Hong Kong',
    district: 'Yau Tong',
    serviceTime: 'Mon - Fri: 11:00-21:00'
  };

  const tcMap = new Map([['852Z152', tcItem]]);
  const enMap = new Map([['852Z152', enItem]]);

  const { records } = normalizeRecords({ tcMap, enMap, generatedAt: '2024-01-01' });
  const r = records[0];

  // Source values preserved
  assert.ok(r.address.includes('秀茂坪'), 'Address must preserve 秀茂坪');
  assert.ok(r.address.includes('寶達'), 'Address must preserve 寶達');
  assert.equal(r.sub_district, '油塘');

  // Should detect conflict
  assert.ok(r.quality_flags.some(f => f.type === 'SUBDISTRICT_ADDRESS_CONFLICT'),
    '852Z152 should have SUBDISTRICT_ADDRESS_CONFLICT flag');
});

test('852NLL: detects business hours conflict between TC and EN', () => {
  const tcItem = {
    serviceCode: '852NLL',
    address: '香港大埔區大埔安埔路12號富善商場',
    serviceTime: '星期一至星期五,12:00-21:00;星期日及公眾假期,12:00-20:00, 星期六, 12:00-20:00'
  };
  const enItem = {
    serviceCode: '852NLL',
    address: 'Shop F122B on 1/F., Fu Shin Shopping Centre',
    serviceTime: 'Mon to Fri 11:00-20:30; Sun & Public Holidays 12:00-20:00; Sat 12:00-20:00'
  };

  const flags = generateQualityFlags(tcItem, enItem, {
    code: '852NLL',
    location: { latitude: 22.45, longitude: 114.17 },
    address: tcItem.address,
    address_en: enItem.address,
    name_en: 'Test',
    sub_district: '大埔',
    district_en: 'Tai Po District'
  });

  assert.ok(flags.some(f => f.type === 'SOURCE_TC_EN_BUSINESS_HOURS_CONFLICT'),
    '852NLL should detect hours conflict (12:00-21:00 vs 11:00-20:30)');
});

test('852PC: detects street number conflict 6號 vs 6A', () => {
  const tcItem = {
    serviceCode: '852PC',
    address: '香港東區筲箕灣阿公岩村道6號新高聲工業大廈地下1號鋪*',
    serviceTime: '09:00-20:00'
  };
  const enItem = {
    serviceCode: '852PC',
    address: 'Shop 1, G/F, Centro-Sound Industrial Building ,6A A Kung Ngam Village Road*',
    serviceTime: 'Mon to Sat 09:00-20:00'
  };

  const flags = generateQualityFlags(tcItem, enItem, {
    code: '852PC',
    location: { latitude: 22.28, longitude: 114.23 },
    address: tcItem.address,
    address_en: enItem.address,
    name_en: 'Test',
    sub_district: '筲箕灣',
    district_en: 'Eastern District'
  });

  assert.ok(flags.some(f => f.type === 'SOURCE_TC_EN_STREET_NUMBER_CONFLICT'),
    '852PC should detect street number conflict (6號 vs 6A)');
});

test('852PAL: preserves 天悅 without character conversion', () => {
  const tcMap = new Map([['852PAL', {
    serviceCode: '852PAL',
    name: '筲箕灣天悅廣場順豐站',
    address: '香港東區筲箕灣南康街17號天悅筲箕灣廣場1樓1142及1143號鋪*',
    city: '東區',
    district: '筲箕灣',
    serviceTime: '12:00-21:00',
    latitude: 22.2776522,
    longitude: 114.226465
  }]]);

  const { records } = normalizeRecords({ tcMap, enMap: new Map(), generatedAt: '2024-01-01' });
  const r = records[0];

  assert.ok(r.name.includes('天悅'), '852PAL must preserve 天悅 in name');
  assert.ok(r.address.includes('天悅'), '852PAL must preserve 天悅 in address');
});
