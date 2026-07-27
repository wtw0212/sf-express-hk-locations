// @ts-check
import { SOURCES } from './constants.js';
import { resolveAdminDistrict } from './district-resolver.js';
import { classifyLocation } from './classify.js';
import { generateQualityFlags } from './quality-flags.js';
import { getReviewedPdfRegistryRecords } from './reviewed-pdf-registry.js';

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
    const name = (item.name || '').trim();
    const sourceAddress = (item.address || '').trim();

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
    const subDistrict = reviewedFallback
      ? (item.sub_district || '').trim() || districtResult.sub_district
      : districtResult.sub_district;
    const derivedAddress =
      districtResult.sub_district || districtResult.district || name || '香港';
    const address = sourceAddress || derivedAddress;

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
      location: {
        latitude: toCoordinate(item.latitude),
        longitude: toCoordinate(item.longitude)
      },
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

/**
 * Parse a coordinate value to a finite number or null.
 * @param {any} value
 * @returns {number|null}
 */
function toCoordinate(value) {
  if (value == null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}
