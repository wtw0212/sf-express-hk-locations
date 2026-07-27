import test from 'node:test';
import assert from 'node:assert/strict';
import { validateRecords, checkCompletenessGates } from '../scripts/lib/validate.js';

// ─── validateRecords tests ──────────────────────────────────────────

test('validates records with no issues', () => {
  const records = [{
    code: '852A', type: 'store', district: '大埔區', region: '新界',
    location: { latitude: 22.45, longitude: 114.17 },
    quality_flags: []
  }];
  const { errors, warnings } = validateRecords(records);
  assert.equal(errors.length, 0);
});

test('rejects duplicate codes', () => {
  const records = [
    { code: '852A', type: 'store', location: {}, quality_flags: [] },
    { code: '852A', type: 'locker', location: {}, quality_flags: [] }
  ];
  const { errors } = validateRecords(records);
  assert.ok(errors.some(e => e.includes('Duplicate')));
});

test('rejects empty codes', () => {
  const records = [
    { code: '', type: 'store', location: {}, quality_flags: [] }
  ];
  const { errors } = validateRecords(records);
  assert.ok(errors.some(e => e.includes('empty code')));
});

test('rejects invalid type', () => {
  const records = [
    { code: '852A', type: 'station', location: {}, quality_flags: [] }
  ];
  const { errors } = validateRecords(records);
  assert.ok(errors.some(e => e.includes('invalid type')));
});

test('rejects non-numeric coordinates', () => {
  const records = [{
    code: '852A', type: 'store',
    location: { latitude: 'not-a-number', longitude: 114.2 },
    quality_flags: []
  }];
  const { errors } = validateRecords(records);
  assert.ok(errors.some(e => e.includes('not numeric')));
});

test('rejects district/region mismatch', () => {
  const records = [{
    code: '852A', type: 'store', district: '大埔區', region: '九龍',
    location: {}, quality_flags: []
  }];
  const { errors } = validateRecords(records);
  assert.ok(errors.some(e => e.includes('district/region mismatch')));
});

test('rejects missing quality_flags array', () => {
  const records = [{ code: '852A', type: 'store', location: {} }];
  const { errors } = validateRecords(records);
  assert.ok(errors.some(e => e.includes('quality_flags')));
});

// ─── checkCompletenessGates tests ───────────────────────────────────

test('passes when all gates succeed', () => {
  const tcResults = [
    { area: { sourceRegion: '大埔區', district: '大埔' }, ok: true, records: [{ serviceCode: '852A' }] }
  ];
  const enResults = [
    { area: { sourceRegion: 'Tai Po', district: 'Tai Po' }, ok: true, records: [{ serviceCode: '852A' }] }
  ];
  const records = new Array(1001).fill({ code: '852A' });

  const result = checkCompletenessGates({
    tcResults, enResults, records,
    previousRecords: new Array(1000).fill({}),
    config: { minCount: 100 }
  });

  assert.equal(result.pass, true);
});

test('blocks on TC API area failure', () => {
  const tcResults = [
    { area: { sourceRegion: '大埔區', district: '大埔' }, ok: false, error: 'timeout', records: [] }
  ];
  const result = checkCompletenessGates({
    tcResults, enResults: [], records: new Array(1001).fill({}),
    previousRecords: null, config: { minCount: 100, enMatchRateThreshold: 0 }
  });
  assert.equal(result.pass, false);
  assert.ok(result.errors.some(e => e.includes('TC API areas failed')));
});

test('blocks on low EN match rate', () => {
  const tcResults = [
    { area: {}, ok: true, records: [{ serviceCode: '852A' }, { serviceCode: '852B' }] }
  ];
  const enResults = [
    { area: {}, ok: true, records: [{ serviceCode: '852A' }] }
  ];
  const result = checkCompletenessGates({
    tcResults, enResults, records: new Array(1001).fill({}),
    previousRecords: null, config: { minCount: 100, enMatchRateThreshold: 0.90 }
  });
  assert.equal(result.pass, false);
  assert.ok(result.errors.some(e => e.includes('EN match rate')));
});

test('blocks on count drop exceeding threshold', () => {
  const result = checkCompletenessGates({
    tcResults: [], enResults: [],
    records: new Array(900).fill({}),
    previousRecords: new Array(1000).fill({}),
    config: { minCount: 100, countDropThreshold: 5, enMatchRateThreshold: 0 }
  });
  assert.equal(result.pass, false);
  assert.ok(result.errors.some(e => e.includes('Count dropped')));
});

test('warns on count increase exceeding threshold', () => {
  const result = checkCompletenessGates({
    tcResults: [], enResults: [],
    records: new Array(1200).fill({}),
    previousRecords: new Array(1000).fill({}),
    config: { minCount: 100, countIncreaseThreshold: 15, enMatchRateThreshold: 0 }
  });
  assert.ok(result.warnings.some(w => w.includes('Count increased')));
});

test('blocks when count below minimum', () => {
  const result = checkCompletenessGates({
    tcResults: [], enResults: [],
    records: new Array(5).fill({}),
    previousRecords: null,
    config: { minCount: 1000, enMatchRateThreshold: 0 }
  });
  assert.equal(result.pass, false);
  assert.ok(result.errors.some(e => e.includes('below minimum')));
});
