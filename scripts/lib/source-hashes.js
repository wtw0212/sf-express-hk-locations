// @ts-check
import { createHash } from 'node:crypto';

/**
 * Hash exact bytes. Strings are hashed as UTF-8 without normalization.
 *
 * @param {string|Buffer|ArrayBuffer|ArrayBufferView} value
 * @returns {string}
 */
export function sha256(value) {
  if (
    typeof value !== 'string' &&
    !Buffer.isBuffer(value) &&
    !(value instanceof ArrayBuffer) &&
    !ArrayBuffer.isView(value)
  ) {
    throw new TypeError('sha256 requires a string or byte buffer');
  }

  const bytes = value instanceof ArrayBuffer
    ? Buffer.from(value)
    : ArrayBuffer.isView(value) && !Buffer.isBuffer(value)
      ? Buffer.from(value.buffer, value.byteOffset, value.byteLength)
      : value;

  return createHash('sha256').update(bytes).digest('hex');
}

/**
 * Serialize supported JSON values with recursively sorted object keys.
 * Unsupported and non-finite values fail closed rather than disappearing.
 *
 * @param {unknown} value
 * @returns {string}
 */
export function stableStringify(value) {
  const ancestors = new WeakSet();

  const serialize = input => {
    if (
      input === undefined ||
      typeof input === 'function' ||
      typeof input === 'symbol' ||
      typeof input === 'bigint' ||
      (typeof input === 'number' && !Number.isFinite(input))
    ) {
      throw new TypeError(`Unsupported value in stable serialization: ${String(input)}`);
    }

    if (input === null || typeof input !== 'object') {
      return JSON.stringify(input);
    }

    if (ancestors.has(input)) {
      throw new TypeError('Unsupported value in stable serialization: cyclic object');
    }
    ancestors.add(input);

    let serialized;
    if (Array.isArray(input)) {
      serialized = `[${input.map(serialize).join(',')}]`;
    } else {
      const prototype = Object.getPrototypeOf(input);
      if (prototype !== Object.prototype && prototype !== null) {
        throw new TypeError(
          `Unsupported value in stable serialization: ${prototype?.constructor?.name || 'object'}`
        );
      }
      const keys = Object.keys(input).sort();
      serialized = `{${keys.map(key =>
        `${JSON.stringify(key)}:${serialize(input[key])}`
      ).join(',')}}`;
    }

    ancestors.delete(input);
    return serialized;
  };

  return serialize(value);
}

/**
 * @param {object} record
 * @returns {object}
 */
export function canonicalizeApiRecord(record) {
  return {
    serviceCode: record?.serviceCode ?? null,
    name: record?.name ?? null,
    address: record?.address ?? null,
    city: record?.city ?? null,
    district: record?.district ?? null,
    serviceTime: record?.serviceTime ?? null,
    latitude: record?.latitude ?? null,
    longitude: record?.longitude ?? null,
    serviceType: record?.serviceType ?? null
  };
}

/**
 * Deterministically deduplicate API records and calculate global/record hashes.
 * If duplicate variants conflict, the lexicographically smallest canonical
 * serialization is selected so arrival order cannot change the result.
 *
 * @param {Array<object>} records
 * @returns {{
 *   records: Array<object>,
 *   semantic_sha256: string,
 *   record_hashes: Record<string,string>,
 *   duplicate_codes: Array<{serviceCode:string, occurrences:number, conflicting:boolean}>
 * }}
 */
export function canonicalizeApiRecords(records = []) {
  const grouped = new Map();

  for (const sourceRecord of records) {
    const record = canonicalizeApiRecord(sourceRecord);
    if (typeof record.serviceCode !== 'string' || record.serviceCode.length === 0) {
      throw new Error('API semantic record is missing serviceCode');
    }
    if (!grouped.has(record.serviceCode)) grouped.set(record.serviceCode, []);
    grouped.get(record.serviceCode).push(record);
  }

  const selectedRecords = [];
  const duplicateCodes = [];
  const recordHashes = {};

  for (const code of [...grouped.keys()].sort()) {
    const candidates = grouped.get(code);
    const serializedCandidates = candidates.map(record => ({
      record,
      serialized: stableStringify(record)
    })).sort((a, b) => a.serialized.localeCompare(b.serialized));

    const selected = serializedCandidates[0];
    selectedRecords.push(selected.record);
    recordHashes[code] = sha256(selected.serialized);

    if (candidates.length > 1) {
      duplicateCodes.push({
        serviceCode: code,
        occurrences: candidates.length,
        conflicting: new Set(serializedCandidates.map(item => item.serialized)).size > 1
      });
    }
  }

  return {
    records: selectedRecords,
    semantic_sha256: sha256(stableStringify(selectedRecords)),
    record_hashes: recordHashes,
    duplicate_codes: duplicateCodes
  };
}

function stableAreaIdentity(area = {}) {
  return {
    sourceRegion: area?.sourceRegion ?? null,
    district: area?.district ?? null
  };
}

/**
 * @param {Array<object>} results
 * @returns {{
 *   raw_snapshot_sha256:string,
 *   semantic_sha256:string,
 *   record_count:number,
 *   record_hashes:Record<string,string>,
 *   duplicate_codes:Array<{serviceCode:string, occurrences:number, conflicting:boolean}>
 * }}
 */
export function calculateApiSnapshotHashes(results = []) {
  const rawAreaEvidence = results.map(result => ({
    area: stableAreaIdentity(result.area),
    raw_sha256: result.raw_sha256 ?? null,
    status: result.status ?? null
  })).sort((a, b) => stableStringify(a.area).localeCompare(stableStringify(b.area)));

  const semantic = canonicalizeApiRecords(
    results.flatMap(result => result.records || [])
  );

  return {
    raw_snapshot_sha256: sha256(stableStringify(rawAreaEvidence)),
    semantic_sha256: semantic.semantic_sha256,
    record_count: semantic.records.length,
    record_hashes: semantic.record_hashes,
    duplicate_codes: semantic.duplicate_codes
  };
}

function canonicalizeQualityFlag(flag) {
  return {
    type: flag?.type ?? null,
    severity: flag?.severity ?? null,
    fields: Array.isArray(flag?.fields) ? [...flag.fields].sort() : [],
    details: flag?.details ?? null
  };
}

/**
 * @param {object} record
 * @returns {object}
 */
export function canonicalizeCanonicalRecord(record) {
  return {
    code: record?.code ?? null,
    type: record?.type ?? null,
    type_name: record?.type_name ?? null,
    type_name_en: record?.type_name_en ?? null,
    name: record?.name ?? null,
    name_en: record?.name_en ?? null,
    region: record?.region ?? null,
    region_en: record?.region_en ?? null,
    district: record?.district ?? null,
    district_en: record?.district_en ?? null,
    sub_district: record?.sub_district ?? null,
    sub_district_en: record?.sub_district_en ?? null,
    address: record?.address ?? null,
    address_en: record?.address_en ?? null,
    telephone: record?.telephone ?? null,
    business_hours: record?.business_hours ?? null,
    business_hours_en: record?.business_hours_en ?? null,
    location: {
      latitude: record?.location?.latitude ?? null,
      longitude: record?.location?.longitude ?? null
    },
    source: record?.source ?? null,
    quality_flags: (record?.quality_flags || [])
      .map(canonicalizeQualityFlag)
      .sort((a, b) => stableStringify(a).localeCompare(stableStringify(b))),
    provenance: record?.provenance ?? null
  };
}

/**
 * @param {Array<object>} records
 * @returns {{semantic_sha256:string, record_count:number, record_hashes:Record<string,string>}}
 */
export function calculateCanonicalDatasetHash(records = []) {
  const canonical = records
    .map(canonicalizeCanonicalRecord)
    .sort((a, b) => String(a.code).localeCompare(String(b.code)));
  const recordHashes = {};
  for (const record of canonical) {
    if (typeof record.code !== 'string' || record.code.length === 0) {
      throw new Error('Canonical semantic record is missing code');
    }
    if (recordHashes[record.code]) {
      throw new Error(`Duplicate canonical code '${record.code}'`);
    }
    recordHashes[record.code] = sha256(stableStringify(record));
  }
  return {
    semantic_sha256: sha256(stableStringify(canonical)),
    record_count: canonical.length,
    record_hashes: recordHashes
  };
}

function calculateNamedRecordSetHash(records, canonicalize, codeField = 'code') {
  const grouped = new Map();
  for (const sourceRecord of records || []) {
    const record = canonicalize(sourceRecord);
    const code = record[codeField];
    if (typeof code !== 'string' || code.length === 0) {
      throw new Error('Semantic source record is missing code');
    }
    if (!grouped.has(code)) grouped.set(code, []);
    grouped.get(code).push(record);
  }

  const selected = [];
  const recordHashes = {};
  for (const code of [...grouped.keys()].sort()) {
    const variants = grouped.get(code)
      .map(record => ({ record, serialized: stableStringify(record) }))
      .sort((a, b) => a.serialized.localeCompare(b.serialized));
    selected.push(variants[0].record);
    recordHashes[code] = sha256(variants[0].serialized);
  }
  return {
    semantic_sha256: sha256(stableStringify(selected)),
    record_count: selected.length,
    record_hashes: recordHashes
  };
}

export function calculateSsrHash(records = []) {
  return calculateNamedRecordSetHash(records, record => ({
    code: record?.serviceCode ?? record?.code ?? null,
    name: record?.name ?? null,
    name_en: record?.name_en ?? null,
    address: record?.address ?? null,
    address_en: record?.address_en ?? null,
    city: record?.city ?? null,
    district: record?.district ?? null,
    sub_district: record?.sub_district ?? null,
    serviceTime: record?.serviceTime ?? record?.business_hours ?? null,
    business_hours_en: record?.business_hours_en ?? null,
    latitude: record?.latitude ?? record?.location?.latitude ?? null,
    longitude: record?.longitude ?? record?.location?.longitude ?? null
  }));
}

export function calculateReviewedRegistryHash(records = []) {
  return calculateNamedRecordSetHash(records, record => ({
    code: record?.code ?? record?.serviceCode ?? null,
    name: record?.name ?? null,
    name_en: record?.name_en ?? null,
    address: record?.address ?? null,
    address_en: record?.address_en ?? null,
    district: record?.district ?? null,
    district_en: record?.district_en ?? null,
    sub_district: record?.sub_district ?? null,
    sub_district_en: record?.sub_district_en ?? null,
    business_hours: record?.business_hours ?? null,
    business_hours_en: record?.business_hours_en ?? null,
    source_key: record?._source_key ?? record?.source_key ?? null,
    source_url: record?._source_url ?? record?.source_url ?? null,
    evidence: record?._registry_evidence ?? null
  }));
}

/**
 * @param {Record<string,string>} previous
 * @param {Record<string,string>} current
 * @returns {{added:string[], removed:string[], changed:string[], unchanged:string[]}}
 */
export function diffRecordHashes(previous = {}, current = {}) {
  const previousCodes = new Set(Object.keys(previous));
  const currentCodes = new Set(Object.keys(current));
  const shared = [...previousCodes].filter(code => currentCodes.has(code)).sort();

  return {
    added: [...currentCodes].filter(code => !previousCodes.has(code)).sort(),
    removed: [...previousCodes].filter(code => !currentCodes.has(code)).sort(),
    changed: shared.filter(code => previous[code] !== current[code]),
    unchanged: shared.filter(code => previous[code] === current[code])
  };
}
