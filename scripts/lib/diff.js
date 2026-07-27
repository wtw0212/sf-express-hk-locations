// @ts-check
import { DIFF_COMPARE_FIELDS } from './constants.js';

/**
 * Canonicalize quality flags for stable comparison.
 * Sorts flags by type, severity, fields, and serialized details.
 *
 * @param {Array} flags
 * @returns {Array<{type: string, severity: string, fields: string[], details: any}>}
 */
export function canonicalizeQualityFlags(flags) {
  if (!Array.isArray(flags)) return [];
  const normalized = flags.map(f => {
    const fields = Array.isArray(f.fields) ? [...f.fields].sort() : [];
    const details = f.details && typeof f.details === 'object'
      ? Object.keys(f.details).sort().reduce((acc, k) => {
          acc[k] = f.details[k];
          return acc;
        }, {})
      : f.details ?? null;

    return {
      type: String(f.type || ''),
      severity: String(f.severity || ''),
      fields,
      details
    };
  });

  normalized.sort((a, b) => {
    if (a.type !== b.type) return a.type.localeCompare(b.type);
    if (a.severity !== b.severity) return a.severity.localeCompare(b.severity);
    const fieldsA = a.fields.join(',');
    const fieldsB = b.fields.join(',');
    if (fieldsA !== fieldsB) return fieldsA.localeCompare(fieldsB);
    return JSON.stringify(a.details || {}).localeCompare(JSON.stringify(b.details || {}));
  });

  return normalized;
}

/**
 * Compute differences between two quality flag arrays.
 * @param {Array} oldFlags
 * @param {Array} newFlags
 * @returns {{ added: Array, removed: Array, modified: Array }}
 */
export function computeQualityFlagsDiff(oldFlags = [], newFlags = []) {
  const oldCanon = canonicalizeQualityFlags(oldFlags);
  const newCanon = canonicalizeQualityFlags(newFlags);

  const oldMap = new Map(oldCanon.map(f => [f.type, f]));
  const newMap = new Map(newCanon.map(f => [f.type, f]));

  const added = [];
  const removed = [];
  const modified = [];

  for (const [type, nFlag] of newMap) {
    if (!oldMap.has(type)) {
      added.push(nFlag);
    } else {
      const oFlag = oldMap.get(type);
      if (JSON.stringify(oFlag) !== JSON.stringify(nFlag)) {
        modified.push({ type, old: oFlag, new: nFlag });
      }
    }
  }

  for (const [type, oFlag] of oldMap) {
    if (!newMap.has(type)) {
      removed.push(oFlag);
    }
  }

  return { added, removed, modified };
}

/**
 * Compare two location records field-by-field.
 * Returns null if no meaningful changes, or an object with field-level changes.
 *
 * @param {object} prev - Previous record
 * @param {object} next - Next record
 * @returns {object|null} Changes object or null if unchanged
 */
function compareRecords(prev, next) {
  const changes = {};
  let hasChanges = false;

  for (const field of DIFF_COMPARE_FIELDS) {
    const oldVal = prev[field];
    const newVal = next[field];

    const oldStr = JSON.stringify(oldVal ?? null);
    const newStr = JSON.stringify(newVal ?? null);

    if (oldStr !== newStr) {
      changes[field] = { old: oldVal ?? null, new: newVal ?? null };
      hasChanges = true;
    }
  }

  // Compare coordinates
  const oldLat = prev.location?.latitude ?? null;
  const newLat = next.location?.latitude ?? null;
  const oldLon = prev.location?.longitude ?? null;
  const newLon = next.location?.longitude ?? null;

  if (oldLat !== newLat) {
    changes['location.latitude'] = { old: oldLat, new: newLat };
    hasChanges = true;
  }
  if (oldLon !== newLon) {
    changes['location.longitude'] = { old: oldLon, new: newLon };
    hasChanges = true;
  }

  // Compare quality_flags
  const oldFlags = canonicalizeQualityFlags(prev.quality_flags);
  const newFlags = canonicalizeQualityFlags(next.quality_flags);
  if (JSON.stringify(oldFlags) !== JSON.stringify(newFlags)) {
    const flagDiff = computeQualityFlagsDiff(prev.quality_flags, next.quality_flags);
    changes['quality_flags'] = {
      old: oldFlags,
      new: newFlags,
      added: flagDiff.added,
      removed: flagDiff.removed,
      modified: flagDiff.modified
    };
    hasChanges = true;
  }

  return hasChanges ? changes : null;
}

/**
 * Compute diff between previous and next location lists.
 * Ignores volatile fields like retrieved_at.
 * Reports field-level changes for every updated record.
 *
 * @param {Array} previousList
 * @param {Array} nextList
 * @param {object} [options]
 * @param {boolean} [options.isMigration] - Whether this run is a schema migration run
 * @returns {{ added: Array, removed: Array, updated: Array<{code: string, changes: object, prev: object, next: object}>, unchanged: number, isMigration: boolean }}
 */
export function computeDiff(previousList, nextList, options = {}) {
  const prevMap = new Map((previousList || []).map(item => [item.code, item]));
  const nextMap = new Map((nextList || []).map(item => [item.code, item]));

  const added = [];
  const removed = [];
  const updated = [];
  let unchanged = 0;

  // Auto-detect schema v1 -> v2 migration if previous dataset used legacy 'source: api'
  let isMigration = options.isMigration ?? false;
  if (!isMigration && previousList && previousList.length > 0) {
    const legacySourceCount = previousList.filter(r => r.source === 'api').length;
    if (legacySourceCount > previousList.length * 0.5) {
      isMigration = true;
    }
  }

  for (const [code, next] of nextMap) {
    if (!prevMap.has(code)) {
      added.push(next);
    } else {
      const prev = prevMap.get(code);
      const changes = compareRecords(prev, next);
      if (changes) {
        updated.push({ code, changes, prev, next });
      } else {
        unchanged++;
      }
    }
  }

  for (const [code] of prevMap) {
    if (!nextMap.has(code)) {
      removed.push(prevMap.get(code));
    }
  }

  return { added, removed, updated, unchanged, isMigration };
}
