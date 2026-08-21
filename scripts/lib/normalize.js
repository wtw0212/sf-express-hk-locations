// @ts-check
import { SOURCES, GEOGRAPHIC_TYPO_MAP, HK_BOUNDING_BOX } from './constants.js';
import { resolveAdminDistrict } from './district-resolver.js';
import { classifyLocation } from './classify.js';
import { generateQualityFlags } from './quality-flags.js';

/**
 * Apply geographic typo corrections (controlled replacement map).
 * @param {string|null} str
 * @returns {string|null}
 */
function fixGeographicTypos(str) {
  if (!str) return str;
  let fixed = str;
  for (const [wrong, right] of Object.entries(GEOGRAPHIC_TYPO_MAP)) {
    if (fixed.includes(wrong)) {
      fixed = fixed.replaceAll(wrong, right);
    }
  }
  return fixed;
}
import { getReviewedPdfRegistryRecords } from './reviewed-pdf-registry.js';

/**
 * Check if a coordinate input value is considered absent (null, undefined, or empty/whitespace string).
 * @param {any} val
 * @returns {boolean}
 */
function isCoordinateAbsent(val) {
  if (val == null) return true;
  if (typeof val === 'string' && val.trim() === '') return true;
  return false;
}

/**
 * Parse a coordinate input into a finite number, or NaN if malformed/non-finite, or null if absent.
 * @param {any} val
 * @returns {number|null}
 */
function parseCoordinateValue(val) {
  if (isCoordinateAbsent(val)) return null;
  const num = typeof val === 'number' ? val : Number(val);
  return Number.isFinite(num) ? num : NaN;
}

/**
 * Sanitize upstream coordinates and classify into one of 4 states:
 * 1. Valid HK coordinates -> published as-is, no quality flag
 * 2. Both missing -> published as null/null, MISSING_COORDINATES info flag
 * 3. Finite but outside HK -> published as null/null, COORDINATES_OUTSIDE_HK warning flag preserving source values
 * 4. Malformed/partial/non-finite -> published as null/null, INVALID_SOURCE_COORDINATES warning flag preserving source values
 *
 * @param {any} latRaw - Raw latitude from source
 * @param {any} lonRaw - Raw longitude from source
 * @param {string} [code] - Record code
 * @returns {{ location: { latitude: number|null, longitude: number|null }, qualityFlags: Array<{ type: string, severity: string, fields: string[], details: object }> }}
 */
export function sanitizeCoordinates(latRaw, lonRaw, code = '') {
  const isLatAbsent = isCoordinateAbsent(latRaw);
  const isLonAbsent = isCoordinateAbsent(lonRaw);

  // Case 2: Both absent
  if (isLatAbsent && isLonAbsent) {
    return {
      location: { latitude: null, longitude: null },
      qualityFlags: [{
        type: 'MISSING_COORDINATES',
        severity: 'info',
        fields: ['location'],
        details: { code }
      }]
    };
  }

  const latNum = parseCoordinateValue(latRaw);
  const lonNum = parseCoordinateValue(lonRaw);

  // Case 4: Malformed / partial / non-finite
  if (
    latNum === null || lonNum === null ||
    Number.isNaN(latNum) || Number.isNaN(lonNum)
  ) {
    return {
      location: { latitude: null, longitude: null },
      qualityFlags: [{
        type: 'INVALID_SOURCE_COORDINATES',
        severity: 'warning',
        fields: ['location'],
        details: {
          source_latitude: latRaw ?? null,
          source_longitude: lonRaw ?? null,
          reason: 'malformed_or_partial_coordinates'
        }
      }]
    };
  }

  // Both are finite numbers. Check HK bounding box.
  const isOutsideHk =
    latNum < HK_BOUNDING_BOX.latMin || latNum > HK_BOUNDING_BOX.latMax ||
    lonNum < HK_BOUNDING_BOX.lonMin || lonNum > HK_BOUNDING_BOX.lonMax;

  // Case 3: Finite but outside HK
  if (isOutsideHk) {
    return {
      location: { latitude: null, longitude: null },
      qualityFlags: [{
        type: 'COORDINATES_OUTSIDE_HK',
        severity: 'warning',
        fields: ['location'],
        details: {
          source_latitude: latNum,
          source_longitude: lonNum,
          reason: 'outside_hk_bounding_box'
        }
      }]
    };
  }

  // Case 1: Valid HK coordinates
  return {
    location: { latitude: latNum, longitude: lonNum },
    qualityFlags: []
  };
}

/**
 * Get current time as HKT string.
 */
function getHKTDateString() {
  const now = new Date();
  const hktOffset = 8 * 60 * 60 * 1000;
  const hktDate = new Date(now.getTime() + hktOffset);

  const YYYY = hktDate.getUTCFullYear();
  const MM = String(hktDate.getUTCMonth() + 1).padStart(2, '0');
  const DD = String(hktDate.getUTCDate()).padStart(2, '0');
  const hh = String(hktDate.getUTCHours()).padStart(2, '0');
  const mm = String(hktDate.getUTCMinutes()).padStart(2, '0');

  return `${YYYY}-${MM}-${DD} ${hh}:${mm} (HKT UTC+8)`;
}

/**
 * Normalize and merge records from canonical sources in order:
 * 1. TC API
 * 2. SSR (supplementary only)
 * 3. Reviewed PDF partner registry (supplementary only)
 *
 * Live parsed PDF records are audit-only and are NEVER passed to normalizeRecords.
 *
 * @param {object} options
 * @returns {{ records: Array, stats: object }}
 */
export function normalizeRecords(options = {}) {
  if (!options || typeof options !== 'object' || options instanceof Map) {
    throw new TypeError('normalizeRecords requires an options object');
  }

  if (Object.hasOwn(options, 'reviewedPdfList')) {
    throw new TypeError('reviewedPdfRegistry must be loaded by loadReviewedPdfRegistry');
  }

  const {
    tcMap = new Map(),
    enMap = new Map(),
    ssrList = [],
    reviewedPdfRegistry = null,
    generatedAt = getHKTDateString(),
    sourceRetrievedAt = generatedAt
  } = options;

  const reviewedPdfList = reviewedPdfRegistry == null
    ? []
    : getReviewedPdfRegistryRecords(reviewedPdfRegistry);

  const mergedMap = new Map();

  // Priority 1: TC API records
  for (const [code, item] of tcMap) {
    mergedMap.set(code, { item, source: SOURCES.API_TC });
  }

  // Priority 2: SSR supplementary (only if not already in API)
  for (const item of ssrList) {
    const code = item.serviceCode || item.code;
    if (code && !mergedMap.has(code)) {
      mergedMap.set(code, { item, source: SOURCES.SSR });
    }
  }

  // Priority 3: Reviewed PDF partner registry (only if not already present)
  for (const item of reviewedPdfList) {
    const code = item.serviceCode || item.code;
    if (code && !mergedMap.has(code)) {
      mergedMap.set(code, { item, source: SOURCES.REVIEWED_PDF_PARTNER });
    }
  }

  const records = [];
  let missingEnCount = 0;

  for (const [code, { item, source }] of mergedMap) {
    const name = fixGeographicTypos((item.name || '').trim());
    const sourceAddress = fixGeographicTypos((item.address || '').trim());

    // Resolve district
    const districtResult = resolveAdminDistrict(item);

    // Classify
    const classification = classifyLocation(code, name, item);

    // English fields from EN API
    const enItem = enMap.get(code) ?? null;
    if (!enItem) missingEnCount++;

    const reviewedFallback = source === SOURCES.REVIEWED_PDF_PARTNER;
    const nameEn = enItem
      ? (enItem.name || '').trim() || null
      : (reviewedFallback ? (item.name_en || '').trim() || null : null);
    const subDistrictEn = enItem
      ? (enItem.district || '').trim() || null
      : (reviewedFallback ? (item.sub_district_en || '').trim() || null : null);
    let addressEn = enItem
      ? (enItem.address || '').trim() || null
      : (reviewedFallback ? (item.address_en || '').trim() || null : null);
    if (addressEn) {
      addressEn = addressEn.replace(/\*\^/g, '*').replace(/\^/g, '').trim();
    }
    const businessHoursEn = enItem
      ? (enItem.serviceTime || '').trim() || null
      : (reviewedFallback ? (item.business_hours_en || '').trim() || null : null);
    const businessHours = (item.serviceTime || item.business_hours || '').trim() || null;
    const rawSubDistrict = reviewedFallback
      ? (item.sub_district || '').trim() || districtResult.sub_district
      : districtResult.sub_district;
    const subDistrict = fixGeographicTypos(rawSubDistrict);
    const derivedAddress =
      subDistrict || districtResult.district || name || '香港';
    const address = sourceAddress || derivedAddress;

    // Coordinate sanitization & quality flags
    const coordResult = sanitizeCoordinates(item.latitude, item.longitude, code);

    const normalized = {
      id: code,
      code,
      type: classification.type,
      type_name: classification.type_name,
      type_name_en: classification.type_name_en,
      name: name || '順豐點',
      name_en: nameEn,
      region: districtResult.region,
      region_en: districtResult.region_en,
      district: districtResult.district,
      district_en: districtResult.district_en,
      sub_district: subDistrict,
      sub_district_en: subDistrictEn ?? districtResult.sub_district_en,
      address,
      address_en: addressEn,
      telephone: item.telephone || null,
      business_hours: businessHours,
      business_hours_en: businessHoursEn,
      location: coordResult.location,
      source,
      quality_flags: [],
      provenance: {
        name: source,
        name_en: enItem ? SOURCES.API_EN : (nameEn ? source : null),
        address: sourceAddress ? source : SOURCES.DERIVED,
        address_en: enItem ? SOURCES.API_EN : (addressEn ? source : null),
        district: districtResult.flags.some(f => f.type === 'ADMIN_DISTRICT_ALIAS_APPLIED')
          ? SOURCES.DERIVED : source,
        business_hours: source,
        business_hours_en: enItem ? SOURCES.API_EN : (businessHoursEn ? source : null)
      },
      retrieved_at: sourceRetrievedAt
    };

    const bilingualFlags = generateQualityFlags(item, enItem, normalized);
    normalized.quality_flags = [
      ...coordResult.qualityFlags,
      ...districtResult.flags,
      ...classification.flags,
      ...bilingualFlags,
      ...(!sourceAddress ? [
        {
          type: 'MISSING_SOURCE_ADDRESS',
          severity: classification.type === 'partner' ? 'warning' : 'error',
          fields: ['address'],
          details: { source }
        },
        {
          type: 'ADDRESS_DERIVED_FROM_LOCATION',
          severity: 'warning',
          fields: ['address'],
          details: { derived_from: districtResult.sub_district ? 'sub_district' : districtResult.district ? 'district' : name ? 'name' : 'country' }
        }
      ] : [])
    ];

    records.push(normalized);
  }

  const stats = {
    total: records.length,
    stores: records.filter(r => r.type === 'store').length,
    lockers: records.filter(r => r.type === 'locker').length,
    partners: records.filter(r => r.type === 'partner').length,
    with_english: records.length - missingEnCount,
    missing_english: missingEnCount,
    district_resolved: records.filter(r => r.district != null).length,
    district_unresolved: records.filter(r => r.district == null).length
  };

  return { records, stats };
}
