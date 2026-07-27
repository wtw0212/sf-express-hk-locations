// @ts-check
import {
  DISTRICT_TO_REGION, REGION_EN_MAP, DISTRICT_EN_MAP,
  ADMIN_DISTRICT_ALIASES, CITY_TO_DISTRICT, VALID_DISTRICTS
} from './constants.js';

/**
 * Resolve administrative district, region, and sub-district from an API item.
 *
 * Resolution order:
 *   1. item.city → CITY_TO_DISTRICT (direct match)
 *   2. item.city → ADMIN_DISTRICT_ALIASES (alias match, e.g. 大嶼山區 → 離島區)
 *   3. item.district → CITY_TO_DISTRICT
 *   4. item.district → ADMIN_DISTRICT_ALIASES
 *   5. Full district name search in address (min 2 chars — never single-char 北/南/東/西)
 *
 * Never defaults to 新界 for unresolved records.
 * Preserves original source values.
 *
 * @param {object} item - Raw API item with city, district, address fields
 * @param {object} [queryContext] - The query area context { sourceRegion, district }
 * @returns {{ region: string|null, region_en: string|null, district: string|null, district_en: string|null, sub_district: string|null, sub_district_en: string|null, flags: Array }}
 */
export function resolveAdminDistrict(item, queryContext = null) {
  const flags = [];
  let adminDistrict = null;

  const city = (item.city || '').trim();
  const itemDistrict = (item.district || '').trim();
  const address = (item.address || '').trim();

  // 1. Try city field directly (most authoritative from API)
  if (city && CITY_TO_DISTRICT[city]) {
    adminDistrict = CITY_TO_DISTRICT[city];
  }
  // 2. Try city field via alias mapping (e.g. 大嶼山區 → 離島區)
  else if (city && ADMIN_DISTRICT_ALIASES[city]) {
    const aliasTarget = ADMIN_DISTRICT_ALIASES[city];
    adminDistrict = VALID_DISTRICTS.has(aliasTarget)
      ? aliasTarget
      : (CITY_TO_DISTRICT[aliasTarget] ?? null);

    if (adminDistrict) {
      flags.push({
        type: 'ADMIN_DISTRICT_ALIAS_APPLIED',
        severity: 'info',
        fields: ['district'],
        details: { original: city, resolved: adminDistrict }
      });
    }
  }
  // 3. Try item.district field directly
  else if (itemDistrict && CITY_TO_DISTRICT[itemDistrict]) {
    adminDistrict = CITY_TO_DISTRICT[itemDistrict];
  }
  // 4. Try item.district via alias
  else if (itemDistrict && ADMIN_DISTRICT_ALIASES[itemDistrict]) {
    const aliasTarget = ADMIN_DISTRICT_ALIASES[itemDistrict];
    adminDistrict = VALID_DISTRICTS.has(aliasTarget)
      ? aliasTarget
      : (CITY_TO_DISTRICT[aliasTarget] ?? null);

    if (adminDistrict) {
      flags.push({
        type: 'ADMIN_DISTRICT_ALIAS_APPLIED',
        severity: 'info',
        fields: ['district'],
        details: { original: itemDistrict, resolved: adminDistrict }
      });
    }
  }
  // 5. Address-based matching — full district names only (min 2 chars)
  else if (address) {
    for (const [key, district] of Object.entries(CITY_TO_DISTRICT)) {
      if (key.length >= 2 && address.includes(key)) {
        adminDistrict = district;
        break;
      }
    }
  }

  // Flag unresolved districts
  if (!adminDistrict) {
    flags.push({
      type: 'UNRESOLVED_ADMIN_DISTRICT',
      severity: 'warning',
      fields: ['district', 'region'],
      details: { city, district: itemDistrict }
    });
  }

  const region = adminDistrict ? (DISTRICT_TO_REGION[adminDistrict] ?? null) : null;
  const regionEn = region ? (REGION_EN_MAP[region] ?? null) : null;
  const districtEn = adminDistrict ? (DISTRICT_EN_MAP[adminDistrict] ?? null) : null;

  // Sub-district comes from the API's district field (town/sub-district level)
  const subDistrict = itemDistrict || null;

  return {
    region,
    region_en: regionEn,
    district: adminDistrict,
    district_en: districtEn,
    sub_district: subDistrict,
    sub_district_en: null, // filled from EN API separately
    flags
  };
}
