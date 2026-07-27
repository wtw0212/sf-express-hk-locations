import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyLocation } from '../scripts/lib/classify.js';

test('H852 prefix classifies as locker', () => {
  const result = classifyLocation('H852AA01P', '順豐智能櫃 大埔', {});
  assert.equal(result.type, 'locker');
  assert.equal(result.type_name, '順豐智能櫃');
  assert.equal(result.type_name_en, 'SF Locker');
});

test('智能櫃 in name classifies as locker', () => {
  const result = classifyLocation('852TEST', '商場順豐智能櫃', {});
  assert.equal(result.type, 'locker');
});

test('自助櫃 in name classifies as locker', () => {
  const result = classifyLocation('852TEST', '自助櫃 某地', {});
  assert.equal(result.type, 'locker');
});

test('順豐站 in name classifies as store', () => {
  const result = classifyLocation('852AA', '大埔同茂坊順豐站', {});
  assert.equal(result.type, 'store');
  assert.equal(result.type_name, '順豐站');
  assert.equal(result.type_name_en, 'SF Store');
});

test('OK便利店 in name classifies as partner', () => {
  const result = classifyLocation('852PA2004', '便利店 康山花園OK便利店', {});
  assert.equal(result.type, 'partner');
  assert.equal(result.type_name, '順豐合作點');
});

test('isPartner flag classifies as partner', () => {
  const result = classifyLocation('852TEST', '某某店', { isPartner: true });
  assert.equal(result.type, 'partner');
});

test('serviceContent=2 classifies as partner', () => {
  const result = classifyLocation('852PA2004', '便利店 某某', { serviceContent: '2' });
  assert.equal(result.type, 'partner');
});

test('合作點 in name classifies as partner', () => {
  const result = classifyLocation('852TEST', '合作點 利興隆', {});
  assert.equal(result.type, 'partner');
});

test('fallback classification adds PARSER_SUSPECTED flag', () => {
  const result = classifyLocation('852UNKNOWN', '某某地方', {});
  assert.equal(result.type, 'store');
  assert.ok(result.flags.some(f => f.type === 'PARSER_SUSPECTED'));
});

test('petrol station should NOT be classified as store by name alone', () => {
  // A petrol station name that doesn't contain 順豐站
  const result = classifyLocation('852GAS01', '中油加油站', {});
  // Should get PARSER_SUSPECTED since it doesn't match any known pattern
  assert.ok(result.flags.some(f => f.type === 'PARSER_SUSPECTED'));
});

test('convenience store classified as partner not store', () => {
  const result = classifyLocation('852PA5001', '便利店 7-11某某分店', {});
  assert.equal(result.type, 'partner');
});
