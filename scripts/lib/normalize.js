// @ts-check
import { SOURCES } from './constants.js';
import { resolveAdminDistrict } from './district-resolver.js';
import { classifyLocation } from './classify.js';
import { generateQualityFlags } from './quality-flags.js';

/**
 * Normalize and merge records from all sources.
 * Source priority: TC API > SSR > PDF
 * English data comes from EN API and is merged by service code.
 *
 * No cleanAndConvert, no convertObjectProperties, no global character replacement.
 * The only mutation is ^ removal from EN addresses (display-safe cleanup).
 *
 * @param {Map<string, object>} tcMap - TC API records keyed by service code
 * @param {Map<string, object>} enMap - EN API records keyed by service code
 * @param {Array} ssrList - SSR supplementary records
 * @param {Array} pdfList - PDF partner records
 * @param {string} retrievedAt - HKT timestamp
 * @returns {{ records: Array, stats: object }}
 */
export function normalizeRecords(tcMap, enMap, ssrList, pdfList, retrievedAt) {
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

  // Priority 3: PDF partners (only if not already present)
  for (const item of pdfList) {
    const code = item.serviceCode || item.code;
    if (code && !mergedMap.has(code)) {
      mergedMap.set(code, { item, source: SOURCES.PDF_PARTNER });
    }
  }

  const records = [];
  let missingEnCount = 0;

  for (const [code, { item, source }] of mergedMap) {
    const name = (item.name || '').trim();
    const address = (item.address || '').trim();

    // Resolve district
    const districtResult = resolveAdminDistrict(item);

    // Classify
    const classification = classifyLocation(code, name, item);

    // English fields from EN API
    const enItem = enMap.get(code) ?? null;
    if (!enItem) missingEnCount++;

    const nameEn = enItem ? (enItem.name || '').trim() || null : null;
    const subDistrictEn = enItem ? (enItem.district || '').trim() || null : null;
    let addressEn = enItem ? (enItem.address || '').trim() || null : null;
    // Remove caret separators from EN address (display-safe cleanup only)
    if (addressEn) {
      addressEn = addressEn.replace(/\*\^/g, '*').replace(/\^/g, '').trim();
    }
    const businessHoursEn = enItem ? (enItem.serviceTime || '').trim() || null : null;

    const businessHours = (item.serviceTime || '').trim() || null;

    // Build normalized record — preserve source values, no character conversion
    const normalized = {
      id: code,
      code,
      type: classification.type,
      type_name: classification.type_name,
      type_name_en: classification.type_name_en,
      name: name || null,
      name_en: nameEn,
      region: districtResult.region,
      region_en: districtResult.region_en,
      district: districtResult.district,
      district_en: districtResult.district_en,
      sub_district: districtResult.sub_district,
      sub_district_en: subDistrictEn ?? districtResult.sub_district_en,
      address: address || null,
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
        name_en: enItem ? SOURCES.API_EN : null,
        address: source,
        address_en: enItem ? SOURCES.API_EN : null,
        district: districtResult.flags.some(f => f.type === 'ADMIN_DISTRICT_ALIAS_APPLIED')
          ? SOURCES.DERIVED : source,
        business_hours: source,
        business_hours_en: enItem ? SOURCES.API_EN : null
      },
      retrieved_at: retrievedAt
    };

    // Generate quality flags (bilingual checks, formatting checks, etc.)
    const bilingualFlags = generateQualityFlags(item, enItem, normalized);
    normalized.quality_flags = [
      ...districtResult.flags,
      ...classification.flags,
      ...bilingualFlags
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
