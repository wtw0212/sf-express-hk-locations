// @ts-check
import {
  VALID_DISTRICTS, DISTRICT_TO_REGION, VALID_TYPES,
  HK_BOUNDING_BOX, MIN_LOCATION_COUNT,
  COUNT_DROP_THRESHOLD_PCT, COUNT_INCREASE_THRESHOLD_PCT,
  EN_MATCH_RATE_THRESHOLD
} from './constants.js';

/**
 * Validate all normalized records against the schema.
 *
 * @param {Array} records
 * @returns {{ errors: string[], warnings: string[] }}
 */
export function validateRecords(records) {
  const errors = [];
  const warnings = [];

  // 1. All codes must be non-empty and unique
  const seen = new Set();
  const duplicates = [];
  for (const r of records) {
    if (!r.code) {
      errors.push('Record has empty code');
      continue;
    }
    if (seen.has(r.code)) duplicates.push(r.code);
    seen.add(r.code);
  }
  if (duplicates.length > 0) {
    errors.push(`Duplicate codes found: ${duplicates.slice(0, 5).join(', ')}`);
  }

  // 2. Type must be valid
  const invalidTypes = records.filter(r => !VALID_TYPES.includes(r.type));
  if (invalidTypes.length > 0) {
    errors.push(`${invalidTypes.length} records have invalid type`);
  }

  // 3. Coordinates: both present or both null, and numeric
  for (const r of records) {
    const lat = r.location?.latitude;
    const lon = r.location?.longitude;
    if ((lat == null) !== (lon == null)) {
      warnings.push(`${r.code}: latitude and longitude must both be present or both null`);
    }
    if (lat != null && typeof lat !== 'number') {
      errors.push(`${r.code}: latitude is not numeric: ${lat}`);
    }
    if (lon != null && typeof lon !== 'number') {
      errors.push(`${r.code}: longitude is not numeric: ${lon}`);
    }
  }

  // 4. District and region consistency
  const inconsistent = records.filter(r =>
    r.district && r.region && DISTRICT_TO_REGION[r.district] && DISTRICT_TO_REGION[r.district] !== r.region
  );
  if (inconsistent.length > 0) {
    errors.push(`${inconsistent.length} records have district/region mismatch`);
  }

  // 5. quality_flags must be an array
  const badFlags = records.filter(r => !Array.isArray(r.quality_flags));
  if (badFlags.length > 0) {
    errors.push(`${badFlags.length} records missing quality_flags array`);
  }

  // 6. Coordinates outside HK bounding box
  const badCoords = records.filter(r => {
    const lat = r.location?.latitude;
    const lon = r.location?.longitude;
    if (lat == null || lon == null) return false;
    return lat < HK_BOUNDING_BOX.latMin || lat > HK_BOUNDING_BOX.latMax ||
           lon < HK_BOUNDING_BOX.lonMin || lon > HK_BOUNDING_BOX.lonMax;
  });
  if (badCoords.length > 0) {
    warnings.push(`${badCoords.length} records have coordinates outside HK bounding box`);
  }

  // 7. Invalid district values
  const invalidDistricts = records.filter(r => r.district && !VALID_DISTRICTS.has(r.district));
  if (invalidDistricts.length > 0) {
    warnings.push(`${invalidDistricts.length} records have non-standard district values`);
  }

  // 8. Null district ratio
  const nullDistrictCount = records.filter(r => !r.district).length;
  if (records.length > 0) {
    const nullDistrictPct = (nullDistrictCount / records.length) * 100;
    if (nullDistrictPct > 40) {
      warnings.push(`${nullDistrictPct.toFixed(1)}% of records have null district`);
    }
  }

  return { errors, warnings };
}

/**
 * Check source completeness gates before publication.
 * Blocks publication if any required gate fails.
 *
 * @param {object} params
 * @param {Array} params.tcResults - Per-area TC API results
 * @param {Array} params.enResults - Per-area EN API results
 * @param {Array} params.records - Normalized records
 * @param {Array|null} params.previousRecords - Previous dataset records
 * @param {object} [params.config] - Configurable thresholds
 * @returns {{ pass: boolean, errors: string[], warnings: string[], metrics: object }}
 */
export function checkCompletenessGates({
  tcResults,
  enResults,
  records,
  previousRecords,
  config = {}
}) {
  const errors = [];
  const warnings = [];

  const countDropThreshold = config.countDropThreshold ?? COUNT_DROP_THRESHOLD_PCT;
  const countIncreaseThreshold = config.countIncreaseThreshold ?? COUNT_INCREASE_THRESHOLD_PCT;
  const enMatchRateThreshold = config.enMatchRateThreshold ?? EN_MATCH_RATE_THRESHOLD;
  const minCount = config.minCount ?? MIN_LOCATION_COUNT;

  // ─── TC API gate ────────────────────────────────────────────────
  const tcTotal = tcResults?.length ?? 0;
  const tcSuccess = tcResults?.filter(r => r.ok).length ?? 0;
  const tcFailed = tcTotal - tcSuccess;

  if (tcFailed > 0) {
    const failedAreas = tcResults.filter(r => !r.ok).map(r =>
      `${r.area?.sourceRegion}/${r.area?.district} (${r.error})`
    );
    errors.push(`${tcFailed} TC API areas failed: ${failedAreas.join('; ')}`);
  }

  // ─── EN API gate ────────────────────────────────────────────────
  const enTotal = enResults?.length ?? 0;
  const enSuccess = enResults?.filter(r => r.ok).length ?? 0;
  const enFailed = enTotal - enSuccess;

  if (enFailed > 0) {
    const failedAreas = enResults.filter(r => !r.ok).map(r =>
      `${r.area?.sourceRegion}/${r.area?.district} (${r.error})`
    );
    errors.push(`${enFailed} EN API areas failed: ${failedAreas.join('; ')}`);
  }

  // ─── EN match rate ──────────────────────────────────────────────
  const tcCodes = new Set();
  for (const r of (tcResults ?? [])) {
    for (const item of (r.records ?? [])) {
      const code = item.serviceCode || item.code;
      if (code) tcCodes.add(code);
    }
  }
  const enCodes = new Set();
  for (const r of (enResults ?? [])) {
    for (const item of (r.records ?? [])) {
      const code = item.serviceCode || item.code;
      if (code) enCodes.add(code);
    }
  }

  const matchedCodes = [...tcCodes].filter(c => enCodes.has(c)).length;
  const enMatchRate = tcCodes.size > 0 ? matchedCodes / tcCodes.size : 0;

  if (enMatchRate < enMatchRateThreshold) {
    errors.push(
      `EN match rate ${(enMatchRate * 100).toFixed(1)}% is below threshold ${(enMatchRateThreshold * 100).toFixed(1)}%`
    );
  }

  // ─── Count anomaly gate ─────────────────────────────────────────
  const currentCount = records.length;

  if (currentCount < minCount) {
    errors.push(`Record count ${currentCount} is below minimum ${minCount}`);
  }

  if (previousRecords && previousRecords.length > 0) {
    const prevCount = previousRecords.length;
    const dropPct = ((prevCount - currentCount) / prevCount) * 100;
    const increasePct = ((currentCount - prevCount) / prevCount) * 100;

    if (dropPct > countDropThreshold) {
      errors.push(
        `Count dropped by ${dropPct.toFixed(1)}% (${prevCount} -> ${currentCount}), threshold: ${countDropThreshold}%`
      );
    }
    if (increasePct > countIncreaseThreshold) {
      warnings.push(
        `Count increased by ${increasePct.toFixed(1)}% (${prevCount} -> ${currentCount}), threshold: ${countIncreaseThreshold}%`
      );
    }
  }

  const metrics = {
    tc_areas_total: tcTotal,
    tc_areas_success: tcSuccess,
    tc_areas_failed: tcFailed,
    en_areas_total: enTotal,
    en_areas_success: enSuccess,
    en_areas_failed: enFailed,
    tc_unique_codes: tcCodes.size,
    en_unique_codes: enCodes.size,
    en_match_rate: enMatchRate,
    current_count: currentCount,
    previous_count: previousRecords?.length ?? 0
  };

  return { pass: errors.length === 0, errors, warnings, metrics };
}
