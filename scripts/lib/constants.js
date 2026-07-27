// @ts-check

/**
 * Shared constants for the SF Express HK locations pipeline.
 * All lookup tables, thresholds, and configuration values live here.
 */

// ─── 18-district → region mapping ───────────────────────────────────────

/** @type {Record<string, string>} */
export const DISTRICT_TO_REGION = {
  '中西區': '香港島', '灣仔區': '香港島', '東區': '香港島', '南區': '香港島',
  '油尖旺區': '九龍', '深水埗區': '九龍', '九龍城區': '九龍', '黃大仙區': '九龍', '觀塘區': '九龍',
  '葵青區': '新界', '荃灣區': '新界', '屯門區': '新界', '元朗區': '新界',
  '北區': '新界', '大埔區': '新界', '沙田區': '新界', '西貢區': '新界', '離島區': '新界'
};

/** @type {Record<string, string>} */
export const REGION_EN_MAP = {
  '香港島': 'Hong Kong Island',
  '九龍': 'Kowloon',
  '新界': 'New Territories'
};

/** @type {Record<string, string>} */
export const DISTRICT_EN_MAP = {
  '中西區': 'Central and Western District',
  '灣仔區': 'Wan Chai District',
  '東區': 'Eastern District',
  '南區': 'Southern District',
  '油尖旺區': 'Yau Tsim Mong District',
  '深水埗區': 'Sham Shui Po District',
  '九龍城區': 'Kowloon City District',
  '黃大仙區': 'Wong Tai Sin District',
  '觀塘區': 'Kwun Tong District',
  '葵青區': 'Kwai Tsing District',
  '荃灣區': 'Tsuen Wan District',
  '屯門區': 'Tuen Mun District',
  '元朗區': 'Yuen Long District',
  '北區': 'North District',
  '大埔區': 'Tai Po District',
  '沙田區': 'Sha Tin District',
  '西貢區': 'Sai Kung District',
  '離島區': 'Islands District'
};

// ─── SF Express non-standard area names → official 18-district ────────

/** @type {Record<string, string>} */
export const ADMIN_DISTRICT_ALIASES = {
  '大嶼山區': '離島區',
  '南丫島區': '離島區',
  '坪洲區': '離島區',
  '長洲區': '離島區',
  'Lantau District': 'Islands District',
  'Lamma Island District': 'Islands District',
  'Peng Chau District': 'Islands District',
  'Cheung Chau District': 'Islands District'
};

export const VALID_DISTRICTS = new Set(Object.keys(DISTRICT_TO_REGION));

// Build CITY_TO_DISTRICT lookup (with and without 區 suffix)
/** @type {Record<string, string>} */
export const CITY_TO_DISTRICT = {};
for (const d of VALID_DISTRICTS) {
  CITY_TO_DISTRICT[d] = d;
  CITY_TO_DISTRICT[d.replace('區', '')] = d;
}

// ─── Diff comparison fields (excludes volatile fields like retrieved_at) ─

export const DIFF_COMPARE_FIELDS = [
  'type', 'type_name', 'type_name_en',
  'name', 'name_en',
  'region', 'region_en',
  'district', 'district_en',
  'sub_district', 'sub_district_en',
  'address', 'address_en',
  'telephone',
  'business_hours', 'business_hours_en',
  'source'
];

// ─── Configurable thresholds ────────────────────────────────────────────

/** Default per-category anomaly threshold configuration */
export const CATEGORY_ANOMALY_CONFIG = {
  total: { dropBlockPct: 5, increaseWarnPct: 5, increaseBlockPct: 15 },
  stores: { dropBlockPct: 5, increaseWarnPct: 5, increaseBlockPct: 15 },
  lockers: { dropBlockPct: 5, increaseWarnPct: 5, increaseBlockPct: 15 },
  partners: { dropBlockPct: 5, increaseWarnPct: 5, increaseBlockPct: 15 },
  tcCodes: { dropBlockPct: 5, increaseWarnPct: 5, increaseBlockPct: 15 },
  enCodes: { dropBlockPct: 5, increaseWarnPct: 5, increaseBlockPct: 15 }
};

/** Default Partner PDF parse quality threshold configuration */
export const PDF_PARSE_QUALITY_CONFIG = {
  overallQuarantineWarnPct: 1,
  overallQuarantineBlockPct: 5,
  perPdfQuarantineWarnPct: 1,
  perPdfQuarantineBlockPct: 10,
  validCountDropWarnPct: 5,
  validCountDropBlockPct: 15
};

/** Minimum English match rate (fraction 0-1) required for publication */
export const EN_MATCH_RATE_THRESHOLD = 0.80;

/** Minimum total record count to consider dataset valid */
export const MIN_LOCATION_COUNT = 1000;

// ─── HK bounding box for coordinate validation ─────────────────────────

export const HK_BOUNDING_BOX = {
  latMin: 22.1, latMax: 22.6,
  lonMin: 113.8, lonMax: 114.5
};

// ─── Source identifiers ─────────────────────────────────────────────────

export const SOURCES = {
  API_TC: 'api_tc',
  API_EN: 'api_en',
  SSR: 'ssr',
  PDF_PARTNER: 'pdf_partner',
  DERIVED: 'derived'
};

export const VALID_SOURCES = [
  SOURCES.API_TC,
  SOURCES.API_EN,
  SOURCES.SSR,
  SOURCES.PDF_PARTNER,
  SOURCES.DERIVED
];

// ─── Valid location types ───────────────────────────────────────────────

export const VALID_TYPES = ['store', 'locker', 'partner'];
