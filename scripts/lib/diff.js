// @ts-check
import { DIFF_COMPARE_FIELDS } from './constants.js';

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

    // Deep compare via JSON serialization (handles null, arrays, objects)
    const oldStr = JSON.stringify(oldVal ?? null);
    const newStr = JSON.stringify(newVal ?? null);

    if (oldStr !== newStr) {
      changes[field] = { old: oldVal ?? null, new: newVal ?? null };
      hasChanges = true;
    }
  }

  // Also compare coordinates
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

  return hasChanges ? changes : null;
}

/**
 * Compute diff between previous and next location lists.
 * Ignores volatile fields like retrieved_at.
 * Reports field-level changes for every updated record.
 *
 * @param {Array} previousList
 * @param {Array} nextList
 * @returns {{ added: Array, removed: Array, updated: Array<{code: string, changes: object, prev: object, next: object}>, unchanged: number }}
 */
export function computeDiff(previousList, nextList) {
  const prevMap = new Map(previousList.map(item => [item.code, item]));
  const nextMap = new Map(nextList.map(item => [item.code, item]));

  const added = [];
  const removed = [];
  const updated = [];
  let unchanged = 0;

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

  return { added, removed, updated, unchanged };
}
