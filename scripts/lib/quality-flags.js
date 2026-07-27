// @ts-check
import { HK_BOUNDING_BOX } from './constants.js';

/**
 * Normalize street range separators to canonical '-'
 * @param {string} str
 * @returns {string}
 */
export function canonicalizeRange(str) {
  if (!str) return '';
  return str.replace(/[\u81f3\u2013\u2014~]/g, '-').replace(/\s*to\s*/gi, '-').trim();
}

/**
 * Extract street numbers from address text.
 * Chinese patterns: 數字(含範圍/字母)+號 (excluding 號鋪/號舖 which are shop numbers)
 * English patterns: No. X, or number before road/street/way/lane (e.g. 6A A Kung Ngam Village Road)
 * @param {string} text
 * @returns {string[]}
 */
export function extractStreetNumbers(text) {
  if (!text) return [];
  const matches = [];

  // Chinese: 數字(含範圍/字母)+號 (excluding 號鋪 / 號舖)
  for (const m of text.matchAll(/(\d+(?:\s*(?:[\u81f3\u2013\u2014~-]|to)\s*\d+)?[A-Za-z]?)號(?!鋪|舖)/g)) {
    matches.push(canonicalizeRange(m[1]));
  }

  // English: No. X or No X
  for (const m of text.matchAll(/No\.?\s*(\d+(?:\s*(?:[\u81f3\u2013\u2014~-]|to)\s*\d+)?[A-Za-z]?)/gi)) {
    matches.push(canonicalizeRange(m[1]));
  }

  // English: standalone number+letter/range before capitalized street/road names
  for (const m of text.matchAll(/(?:,\s*|\b)(\d+(?:\s*(?:[\u81f3\u2013\u2014~-]|to)\s*\d+)?[A-Za-z]?)\s+(?:[A-Z][a-zA-Z]*\s+)+(?:Road|Street|Avenue|Drive|Way|Lane|Path|Boulevard|Court|Circuit|Terrace|Crescent|Hwy|Highway)\b/g)) {
    matches.push(canonicalizeRange(m[1]));
  }

  return [...new Set(matches)];
}

/**
 * Canonicalize unit token (upper-case, trim).
 * E.g., 'a5' -> 'A5', 'F122B' -> 'F122B'
 * @param {string} token
 * @returns {string}
 */
export function canonicalizeUnitToken(token) {
  if (!token) return '';
  return token.trim().toUpperCase();
}

/**
 * Check if a string is a valid unit token:
 * - Must contain at least one digit
 * - Must not be a time range, floor number, street pattern, or building term
 * @param {string} str
 * @returns {boolean}
 */
function isValidUnitToken(str) {
  if (!str) return false;
  const s = str.trim();

  // Must contain at least one digit
  if (!/\d/.test(s)) return false;

  // Must not contain colon (e.g. time range 09:00-20:00)
  if (s.includes(':')) return false;

  // Must not be a floor pattern like 1/F, G/F, B1/F
  if (/^(?:\d+|G|LG\d*|B\d*)\/[Ff]$/.test(s)) return false;
  if (/^(?:1st|2nd|3rd|\d+th)$/i.test(s)) return false;

  // Must not be a building term or reserved word
  const reservedWords = new Set([
    'FORTUNE', 'PLAZA', 'FLOOR', 'BLOCK', 'TOWER', 'ROAD', 'STREET', 'AVENUE',
    'DRIVE', 'WAY', 'LANE', 'BUILDING', 'HOUSE', 'CENTRE', 'CENTER', 'COURT', 'MANSION'
  ]);
  if (reservedWords.has(s.toUpperCase())) return false;

  // Must match valid unit token format: e.g. A5, F122B, B1, 7, 8B, 40-6, 40-7
  return /^[A-Z0-9]+(?:-[A-Z0-9]+)?$/i.test(s);
}

/**
 * Extract shop/unit numbers from address text.
 * Enforces digit requirement, strict unit connectors (&, and, 及, 至, –, —, space-dash-space), and excludes building/floor words.
 *
 * @param {string} text
 * @returns {string[]}
 */
export function extractShopNumbers(text) {
  if (!text) return [];

  const rawMatches = [];
  const connectorRegex = /\s*(?:&|and|及|至|–|—|\s+-\s+)\s*/i;

  // Chinese patterns: X號鋪, X號舖, N及N號鋪, N至N號鋪
  for (const m of text.matchAll(/([A-Za-z0-9-]+(?:\s*(?:&|and|及|至|–|—|\s+-\s+)\s*[A-Za-z0-9-]+)*)\s*號[鋪舖]/gi)) {
    const raw = m[1];
    const parts = raw.split(connectorRegex).map(s => s.trim()).filter(Boolean);
    for (const p of parts) {
      if (isValidUnitToken(p)) rawMatches.push(canonicalizeUnitToken(p));
    }
  }

  // English patterns: Shop(s) X / Room(s) X / Unit(s) X
  for (const m of text.matchAll(/(?:Shop|Shops|Room|Rooms|Unit|Units)\s+([A-Za-z0-9-]+(?:\s*(?:&|and|及|至|–|—|\s+-\s+)\s*[A-Za-z0-9-]+)*)/gi)) {
    const raw = m[1];
    const parts = raw.split(connectorRegex).map(s => s.trim()).filter(Boolean);
    for (const p of parts) {
      if (isValidUnitToken(p)) rawMatches.push(canonicalizeUnitToken(p));
    }
  }

  // 地下X及Y舖 / 地舖 / 地鋪
  for (const m of text.matchAll(/(?:地下|地舖|地鋪)\s*([A-Za-z0-9-]+(?:\s*(?:&|and|及|至|–|—|\s+-\s+)\s*[A-Za-z0-9-]+)*)\s*號?[鋪舖]?/gi)) {
    const raw = m[1];
    const parts = raw.split(connectorRegex).map(s => s.trim()).filter(Boolean);
    for (const p of parts) {
      if (isValidUnitToken(p)) rawMatches.push(canonicalizeUnitToken(p));
    }
  }

  return [...new Set(rawMatches)].sort();
}

/**
 * Check if structured English address components contain duplicate suffix components.
 * "Wan Chai, Hong Kong Island, Hong Kong" -> false (valid)
 * "Wan Chai, Hong Kong, Hong Kong" -> true (duplicate)
 * @param {string} enAddr
 * @returns {boolean}
 */
export function hasDuplicateAddressComponents(enAddr) {
  if (!enAddr) return false;
  const components = enAddr
    .split(',')
    .map(c => c.trim().toLowerCase())
    .filter(Boolean);

  const seen = new Set();
  for (const comp of components) {
    if (seen.has(comp)) {
      return true;
    }
    seen.add(comp);
  }

  if (components.length >= 4) {
    for (let len = 2; len <= Math.floor(components.length / 2); len++) {
      const lastSeq = components.slice(-len).join(',');
      const prevSeq = components.slice(-2 * len, -len).join(',');
      if (lastSeq === prevSeq) return true;
    }
  }

  return false;
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

  // Duplicated address component check
  if (hasDuplicateAddressComponents(enAddr)) {
    flags.push({
      type: 'DUPLICATE_ADDRESS_SUFFIX',
      severity: 'info',
      fields: ['address_en'],
      details: { pattern: 'Duplicate address component found' }
    });
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
