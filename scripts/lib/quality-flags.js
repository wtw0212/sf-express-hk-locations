// @ts-check
import { HK_BOUNDING_BOX } from './constants.js';

/**
 * Extract street numbers from address text.
 * Chinese patterns: 數字+號 (excluding 號鋪/號舖 which are shop numbers)
 * English patterns: No. X, or number before road/street/way/lane (e.g. 6A A Kung Ngam Village Road)
 * @param {string} text
 * @returns {string[]}
 */
function extractStreetNumbers(text) {
  if (!text) return [];
  const matches = [];

  // Chinese: 數字+號 (excluding 號鋪 / 號舖)
  for (const m of text.matchAll(/(\d+[A-Za-z]?)號(?!鋪|舖)/g)) {
    matches.push(m[1]);
  }

  // English: No. X or No X
  for (const m of text.matchAll(/No\.?\s*(\d+[A-Za-z]?)/gi)) {
    matches.push(m[1]);
  }

  // English: standalone number+letter before capitalized street/road names (e.g., "6A A Kung Ngam Village Road", "22-26 Fleming Road")
  for (const m of text.matchAll(/(?:,\s*|\b)(\d+[A-Za-z]?)\s+(?:[A-Z][a-zA-Z]*\s+)+(?:Road|Street|Avenue|Drive|Way|Lane|Path|Boulevard|Court|Circuit|Terrace|Crescent|Hwy|Highway)\b/g)) {
    matches.push(m[1]);
  }

  return [...new Set(matches)];
}

/**
 * Extract shop/unit numbers from address.
 * @param {string} text
 * @returns {string[]}
 */
function extractShopNumbers(text) {
  if (!text) return [];
  const matches = [];
  for (const m of text.matchAll(/(?:Shop|鋪|舖)\s*(\d+[A-Za-z]?(?:\s*(?:&|及|and|,)\s*\d+[A-Za-z]?)*)/gi)) {
    matches.push(m[1].trim());
  }
  for (const m of text.matchAll(/(\d+[A-Za-z]?)號鋪/g)) matches.push(m[1]);
  for (const m of text.matchAll(/(\d+[A-Za-z]?)號舖/g)) matches.push(m[1]);
  return [...new Set(matches)];
}

/**
 * Check if text contains CJK characters.
 * @param {string} text
 * @returns {boolean}
 */
function containsCJK(text) {
  if (!text) return false;
  return /[\u4e00-\u9fff\u3400-\u4dbf]/.test(text);
}

/**
 * Extract time ranges (HH:MM-HH:MM) from business hours text.
 * @param {string} text
 * @returns {string[]}
 */
function extractHourRanges(text) {
  if (!text) return [];
  const ranges = [];
  for (const m of text.matchAll(/(\d{2}:\d{2})-(\d{2}:\d{2})/g)) {
    ranges.push(`${m[1]}-${m[2]}`);
  }
  return ranges;
}

/**
 * Generate quality flags by comparing TC and EN records and checking formatting.
 * Quality flags identify issues without modifying source values.
 *
 * @param {object|null} tcItem - Raw TC API item
 * @param {object|null} enItem - Raw EN API item
 * @param {object} normalized - The normalized record being built
 * @returns {Array<{type: string, severity: string, fields: string[], details: object}>}
 */
export function generateQualityFlags(tcItem, enItem, normalized) {
  const flags = [];

  // ─── Missing data flags ───────────────────────────────────────────

  if (!enItem) {
    flags.push({
      type: 'MISSING_ENGLISH_RECORD',
      severity: 'warning',
      fields: ['name_en', 'address_en', 'business_hours_en'],
      details: { code: normalized.code }
    });
  }

  // Missing coordinates
  const lat = normalized.location?.latitude;
  const lon = normalized.location?.longitude;
  if (lat == null && lon == null) {
    flags.push({
      type: 'MISSING_COORDINATES',
      severity: 'info',
      fields: ['location'],
      details: { code: normalized.code }
    });
  } else if (lat != null && lon != null) {
    if (lat < HK_BOUNDING_BOX.latMin || lat > HK_BOUNDING_BOX.latMax ||
        lon < HK_BOUNDING_BOX.lonMin || lon > HK_BOUNDING_BOX.lonMax) {
      flags.push({
        type: 'COORDINATES_OUTSIDE_HK',
        severity: 'warning',
        fields: ['location'],
        details: { latitude: lat, longitude: lon }
      });
    }
  }

  // ─── Bilingual checks (only when both TC and EN exist) ────────────

  if (tcItem && enItem) {
    const tcAddr = (tcItem.address || '').trim();
    const enAddr = (enItem.address || '').trim();
    const tcHours = (tcItem.serviceTime || '').trim();
    const enHours = (enItem.serviceTime || '').trim();

    // Street number conflict (e.g. 6號 vs 6A)
    const tcStreetNums = extractStreetNumbers(tcAddr);
    const enStreetNums = extractStreetNumbers(enAddr);
    if (tcStreetNums.length > 0 && enStreetNums.length > 0) {
      const tcSet = new Set(tcStreetNums);
      const enSet = new Set(enStreetNums);
      const hasConflict = [...enSet].some(n => !tcSet.has(n)) || [...tcSet].some(n => !enSet.has(n));
      if (hasConflict) {
        flags.push({
          type: 'SOURCE_TC_EN_STREET_NUMBER_CONFLICT',
          severity: 'warning',
          fields: ['address', 'address_en'],
          details: { tc: tcStreetNums.join(', '), en: enStreetNums.join(', ') }
        });
      }
    }

    // Shop/unit number conflict
    const tcShops = extractShopNumbers(tcAddr);
    const enShops = extractShopNumbers(enAddr);
    if (tcShops.length > 0 && enShops.length > 0) {
      const tcShopStr = tcShops.sort().join(',');
      const enShopStr = enShops.sort().join(',');
      if (tcShopStr !== enShopStr) {
        flags.push({
          type: 'SOURCE_TC_EN_UNIT_CONFLICT',
          severity: 'warning',
          fields: ['address', 'address_en'],
          details: { tc: tcShopStr, en: enShopStr }
        });
      }
    }

    // Business hours conflict — compare first (weekday) time range
    if (tcHours && enHours) {
      const tcRanges = extractHourRanges(tcHours);
      const enRanges = extractHourRanges(enHours);
      if (tcRanges.length > 0 && enRanges.length > 0 && tcRanges[0] !== enRanges[0]) {
        flags.push({
          type: 'SOURCE_TC_EN_BUSINESS_HOURS_CONFLICT',
          severity: 'warning',
          fields: ['business_hours', 'business_hours_en'],
          details: { tc: tcHours, en: enHours }
        });
      }
    }
  }

  // ─── Formatting flags ─────────────────────────────────────────────

  const enAddr = normalized.address_en || '';
  const tcAddr = normalized.address || '';

  // Duplicated 'Hong Kong' in English address
  if ((enAddr.match(/Hong Kong/gi) || []).length > 1) {
    flags.push({
      type: 'DUPLICATE_ADDRESS_SUFFIX',
      severity: 'info',
      fields: ['address_en'],
      details: { pattern: 'Hong Kong appears multiple times' }
    });
  }

  // Duplicated district suffix in EN address
  if (normalized.district_en && enAddr.includes(normalized.district_en)) {
    const count = enAddr.split(normalized.district_en).length - 1;
    if (count > 1) {
      flags.push({
        type: 'DUPLICATE_ADDRESS_SUFFIX',
        severity: 'info',
        fields: ['address_en'],
        details: { pattern: `${normalized.district_en} appears ${count} times` }
      });
    }
  }

  // CJK in English fields
  if (containsCJK(normalized.name_en)) {
    flags.push({
      type: 'ENGLISH_FIELD_CONTAINS_CJK',
      severity: 'warning',
      fields: ['name_en'],
      details: { value: normalized.name_en }
    });
  }
  if (containsCJK(enAddr)) {
    flags.push({
      type: 'ENGLISH_FIELD_CONTAINS_CJK',
      severity: 'warning',
      fields: ['address_en'],
      details: { value: enAddr }
    });
  }

  // Residual formatting artifacts (^ separator)
  if (enAddr.includes('^') || tcAddr.includes('^')) {
    flags.push({
      type: 'SOURCE_FORMATTING_ARTIFACT',
      severity: 'info',
      fields: ['address', 'address_en'],
      details: { pattern: 'Contains caret (^) separator' }
    });
  }

  // Subdistrict vs address conflict
  const subDist = normalized.sub_district || '';
  const name = normalized.name || '';
  const fullText = `${name} ${tcAddr}`;
  if (subDist && fullText) {
    const areaKeywords = [
      { keyword: '秀茂坪', area: '秀茂坪' },
      { keyword: '寶達', area: '秀茂坪' },
      { keyword: 'Sau Mau Ping', area: '秀茂坪' },
      { keyword: 'Po Tat', area: '秀茂坪' },
      { keyword: '東涌', area: '東涌' },
      { keyword: 'Tung Chung', area: '東涌' },
      { keyword: '馬灣', area: '馬灣' },
      { keyword: 'Ma Wan', area: '馬灣' },
    ];
    for (const { keyword, area } of areaKeywords) {
      if (fullText.includes(keyword) && subDist !== area && subDist !== keyword) {
        flags.push({
          type: 'SUBDISTRICT_ADDRESS_CONFLICT',
          severity: 'warning',
          fields: ['sub_district', 'address'],
          details: { sub_district: subDist, address_contains: keyword }
        });
        break;
      }
    }
  }

  return flags;
}
