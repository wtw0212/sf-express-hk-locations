import test from 'node:test';
import assert from 'node:assert/strict';
import { computeDiff } from '../scripts/lib/diff.js';

test('detects added records', () => {
  const prev = [{ code: '852A', type: 'store', name: 'Test', address: 'Addr' }];
  const next = [
    { code: '852A', type: 'store', name: 'Test', address: 'Addr' },
    { code: '852B', type: 'locker', name: 'New', address: 'New Addr' }
  ];
  const diff = computeDiff(prev, next);
  assert.equal(diff.added.length, 1);
  assert.equal(diff.added[0].code, '852B');
  assert.equal(diff.removed.length, 0);
  assert.equal(diff.unchanged, 1);
});

test('detects removed records', () => {
  const prev = [
    { code: '852A', type: 'store', name: 'Test', address: 'Addr' },
    { code: '852B', type: 'locker', name: 'Old', address: 'Old Addr' }
  ];
  const next = [{ code: '852A', type: 'store', name: 'Test', address: 'Addr' }];
  const diff = computeDiff(prev, next);
  assert.equal(diff.removed.length, 1);
  assert.equal(diff.removed[0].code, '852B');
  assert.equal(diff.added.length, 0);
});

test('detects updated records with field-level changes', () => {
  const prev = [{ code: '852A', type: 'store', name: 'Old Name', address: 'Old Addr', address_en: 'Old EN' }];
  const next = [{ code: '852A', type: 'store', name: 'New Name', address: 'New Addr', address_en: 'Old EN' }];
  const diff = computeDiff(prev, next);
  assert.equal(diff.updated.length, 1);
  assert.equal(diff.updated[0].code, '852A');
  assert.deepEqual(diff.updated[0].changes.name, { old: 'Old Name', new: 'New Name' });
  assert.deepEqual(diff.updated[0].changes.address, { old: 'Old Addr', new: 'New Addr' });
  assert.equal(diff.updated[0].changes.address_en, undefined, 'Unchanged field should not appear in changes');
});

test('ignores retrieved_at (volatile field)', () => {
  const prev = [{ code: '852A', type: 'store', name: 'Test', retrieved_at: '2024-01-01' }];
  const next = [{ code: '852A', type: 'store', name: 'Test', retrieved_at: '2024-01-02' }];
  const diff = computeDiff(prev, next);
  assert.equal(diff.updated.length, 0);
  assert.equal(diff.unchanged, 1);
});

test('handles empty previous list (first run)', () => {
  const next = [
    { code: '852A', type: 'store', name: 'Test' },
    { code: '852B', type: 'locker', name: 'Test2' }
  ];
  const diff = computeDiff([], next);
  assert.equal(diff.added.length, 2);
  assert.equal(diff.removed.length, 0);
  assert.equal(diff.unchanged, 0);
});

test('handles empty next list', () => {
  const prev = [{ code: '852A', type: 'store', name: 'Test' }];
  const diff = computeDiff(prev, []);
  assert.equal(diff.removed.length, 1);
  assert.equal(diff.added.length, 0);
});

test('detects coordinate changes', () => {
  const prev = [{ code: '852A', type: 'store', name: 'Test', location: { latitude: 22.3, longitude: 114.2 } }];
  const next = [{ code: '852A', type: 'store', name: 'Test', location: { latitude: 22.31, longitude: 114.2 } }];
  const diff = computeDiff(prev, next);
  assert.equal(diff.updated.length, 1);
  assert.ok(diff.updated[0].changes['location.latitude']);
});
