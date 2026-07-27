import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveAdminDistrict } from '../scripts/lib/district-resolver.js';

test('resolves standard district from city field', () => {
  const result = resolveAdminDistrict({ city: '大埔區', district: '大埔', address: '' });
  assert.equal(result.district, '大埔區');
  assert.equal(result.region, '新界');
  assert.equal(result.region_en, 'New Territories');
  assert.equal(result.district_en, 'Tai Po District');
  assert.equal(result.sub_district, '大埔');
  assert.equal(result.flags.length, 0);
});

test('resolves district from city field without 區 suffix', () => {
  const result = resolveAdminDistrict({ city: '油尖旺', district: '旺角', address: '' });
  assert.equal(result.district, '油尖旺區');
  assert.equal(result.region, '九龍');
});

test('applies alias for 大嶼山區 → 離島區', () => {
  const result = resolveAdminDistrict({ city: '大嶼山區', district: '東涌', address: '' });
  assert.equal(result.district, '離島區');
  assert.equal(result.region, '新界');
  assert.equal(result.district_en, 'Islands District');
  assert.equal(result.sub_district, '東涌');

  const aliasFlag = result.flags.find(f => f.type === 'ADMIN_DISTRICT_ALIAS_APPLIED');
  assert.ok(aliasFlag, 'Should have ADMIN_DISTRICT_ALIAS_APPLIED flag');
  assert.equal(aliasFlag.details.original, '大嶼山區');
  assert.equal(aliasFlag.details.resolved, '離島區');
});

test('applies alias for 南丫島區 → 離島區', () => {
  const result = resolveAdminDistrict({ city: '南丫島區', district: '南丫島', address: '' });
  assert.equal(result.district, '離島區');
  assert.ok(result.flags.some(f => f.type === 'ADMIN_DISTRICT_ALIAS_APPLIED'));
});

test('applies alias for 坪洲區 → 離島區', () => {
  const result = resolveAdminDistrict({ city: '坪洲區', district: '坪洲', address: '' });
  assert.equal(result.district, '離島區');
});

test('applies alias for 長洲區 → 離島區', () => {
  const result = resolveAdminDistrict({ city: '長洲區', district: '長洲', address: '' });
  assert.equal(result.district, '離島區');
});

test('does NOT match single characters like 北, 東, 南, 西', () => {
  const result = resolveAdminDistrict({ city: '', district: '', address: '北角測試街' });
  // Should not match '北' alone to '北區' — must match at least 2 chars
  // '北角' does not appear in CITY_TO_DISTRICT, so it should be unresolved
  // unless the address contains a full district name
  assert.equal(result.flags.some(f => f.type === 'UNRESOLVED_ADMIN_DISTRICT'), true);
});

test('returns null for unresolved — does NOT default to 新界', () => {
  const result = resolveAdminDistrict({ city: '', district: '某個新地方', address: '沒有區名的地址' });
  assert.equal(result.district, null);
  assert.equal(result.region, null);
  assert.ok(result.flags.some(f => f.type === 'UNRESOLVED_ADMIN_DISTRICT'));
});

test('resolves from address when city and district fail', () => {
  const result = resolveAdminDistrict({ city: '', district: '', address: '香港大埔區大埔墟鄉事會街' });
  assert.equal(result.district, '大埔區');
  assert.equal(result.region, '新界');
});

test('city field takes priority over address matching', () => {
  // Address mentions 大埔 but city says 觀塘區
  const result = resolveAdminDistrict({ city: '觀塘區', district: '油塘', address: '香港大埔區某某路' });
  assert.equal(result.district, '觀塘區');
  assert.equal(result.region, '九龍');
});
