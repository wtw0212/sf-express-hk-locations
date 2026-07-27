import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

import {
  sha256,
  stableStringify,
  canonicalizeApiRecord,
  canonicalizeApiRecords,
  calculateApiSnapshotHashes,
  calculateCanonicalDatasetHash,
  calculateSsrHash,
  diffRecordHashes
} from '../scripts/lib/source-hashes.js';

const apiRecord = {
  serviceCode: '852A1001',
  name: '測試順豐站',
  address: '香港測試道1號',
  city: '灣仔區',
  district: '灣仔',
  serviceTime: '09:00-18:00',
  latitude: 22.28,
  longitude: 114.17,
  serviceType: '1',
  telephone: '12345678',
  serviceContent: '1'
};

test('sha256 hashes exact raw text bytes', () => {
  const compact = '{"a":1}';
  const spaced = '{ "a": 1 }';
  const reordered = '{"b":2,"a":1}';

  assert.equal(
    sha256(compact),
    createHash('sha256').update(compact).digest('hex')
  );
  assert.notEqual(sha256(compact), sha256(spaced));
  assert.notEqual(sha256('{"a":1,"b":2}'), sha256(reordered));
});

test('stableStringify recursively sorts keys and rejects unsupported values', () => {
  assert.equal(
    stableStringify({ z: [3, { b: 2, a: 1 }], a: null }),
    '{"a":null,"z":[3,{"a":1,"b":2}]}'
  );

  for (const unsupported of [undefined, () => {}, Symbol('x'), NaN, Infinity]) {
    assert.throws(() => stableStringify(unsupported), /Unsupported value/);
  }
  assert.throws(() => stableStringify({ missing: undefined }), /Unsupported value/);
});

test('API semantic record contract excludes volatile and irrelevant fields', () => {
  assert.deepEqual(canonicalizeApiRecord({
    ...apiRecord,
    distance: 12,
    requestTimestamp: 'volatile',
    attempts: 3,
    temporaryUiLabel: 'ignore'
  }), apiRecord);
});

test('API semantic hashes ignore object key order and record order', () => {
  const second = { ...apiRecord, serviceCode: '852A1002', name: '第二站' };
  const reorderedKeys = {
    serviceType: apiRecord.serviceType,
    serviceContent: apiRecord.serviceContent,
    telephone: apiRecord.telephone,
    longitude: apiRecord.longitude,
    latitude: apiRecord.latitude,
    serviceTime: apiRecord.serviceTime,
    district: apiRecord.district,
    city: apiRecord.city,
    address: apiRecord.address,
    name: apiRecord.name,
    serviceCode: apiRecord.serviceCode
  };

  const firstOrder = canonicalizeApiRecords([apiRecord, second]);
  const reverseOrder = canonicalizeApiRecords([second, reorderedKeys]);

  assert.equal(firstOrder.semantic_sha256, reverseOrder.semantic_sha256);
  assert.deepEqual(Object.keys(firstOrder.record_hashes), ['852A1001', '852A1002']);
});

test('global API hashes ignore area completion order but raw hash remains area-aware', () => {
  const second = { ...apiRecord, serviceCode: '852A1002', name: '第二站' };
  const areaA = {
    area: { sourceRegion: '灣仔區', district: '灣仔' },
    status: 200,
    raw_sha256: 'a'.repeat(64),
    records: [apiRecord]
  };
  const areaB = {
    area: { sourceRegion: '中西區', district: '中環' },
    status: 200,
    raw_sha256: 'b'.repeat(64),
    records: [second]
  };

  const forward = calculateApiSnapshotHashes([areaA, areaB]);
  const reverse = calculateApiSnapshotHashes([areaB, areaA]);

  assert.equal(forward.raw_snapshot_sha256, reverse.raw_snapshot_sha256);
  assert.equal(forward.semantic_sha256, reverse.semantic_sha256);
  assert.equal(forward.record_count, 2);

  const changedAreaEvidence = calculateApiSnapshotHashes([
    { ...areaA, status: 206 },
    areaB
  ]);
  assert.notEqual(forward.raw_snapshot_sha256, changedAreaEvidence.raw_snapshot_sha256);
  assert.equal(forward.semantic_sha256, changedAreaEvidence.semantic_sha256);
});

test('true API field changes alter record and global semantic hashes while volatile changes do not', () => {
  const original = calculateApiSnapshotHashes([{ records: [apiRecord] }]);
  const volatile = calculateApiSnapshotHashes([{
    records: [{ ...apiRecord, distance: 999, attempts: 9 }]
  }]);
  const changed = calculateApiSnapshotHashes([{
    records: [{ ...apiRecord, address: '香港測試道2號' }]
  }]);

  assert.equal(original.semantic_sha256, volatile.semantic_sha256);
  assert.equal(
    original.record_hashes['852A1001'],
    volatile.record_hashes['852A1001']
  );
  assert.notEqual(original.semantic_sha256, changed.semantic_sha256);
  assert.notEqual(
    original.record_hashes['852A1001'],
    changed.record_hashes['852A1001']
  );
});

test('duplicate API service codes are selected and reported deterministically', () => {
  const addressA = { ...apiRecord, address: 'A地址' };
  const addressB = { ...apiRecord, address: 'B地址' };

  const forward = canonicalizeApiRecords([addressB, addressA, addressA]);
  const reverse = canonicalizeApiRecords([addressA, addressB, addressA]);

  assert.equal(forward.semantic_sha256, reverse.semantic_sha256);
  assert.deepEqual(forward.records, reverse.records);
  assert.equal(forward.records[0].address, 'A地址');
  assert.deepEqual(forward.duplicate_codes, [{
    serviceCode: '852A1001',
    occurrences: 3,
    conflicting: true
  }]);
});

test('record-level hash diff identifies added, removed, changed, and unchanged records', () => {
  const previous = {
    '852CHANGED': 'old',
    '852OLD': 'removed',
    '852SAME': 'same'
  };
  const current = {
    '852CHANGED': 'new',
    '852NEW': 'added',
    '852SAME': 'same'
  };

  assert.deepEqual(diffRecordHashes(previous, current), {
    added: ['852NEW'],
    removed: ['852OLD'],
    changed: ['852CHANGED'],
    unchanged: ['852SAME']
  });
});

test('canonical dataset hash excludes volatile timestamps and quality flag order', () => {
  const first = {
    code: '852A1001',
    type: 'store',
    name: '測試站',
    source: 'api_tc',
    retrieved_at: '2026-07-27 10:00',
    quality_flags: [
      { type: 'B', severity: 'warning', fields: ['b'] },
      { type: 'A', severity: 'info', fields: ['a'] }
    ]
  };
  const reordered = {
    ...first,
    retrieved_at: '2026-07-27 11:00',
    quality_flags: [...first.quality_flags].reverse()
  };

  assert.equal(
    calculateCanonicalDatasetHash([first]).semantic_sha256,
    calculateCanonicalDatasetHash([reordered]).semantic_sha256
  );
});

test('SSR semantic hashing reports duplicate service codes deterministically', () => {
  const result = calculateSsrHash([
    { serviceCode: '852SSR', name: 'B' },
    { serviceCode: '852SSR', name: 'A' }
  ]);
  assert.deepEqual(result.duplicate_codes, [{
    serviceCode: '852SSR',
    occurrences: 2,
    conflicting: true
  }]);
  assert.equal(result.record_count, 1);
});
