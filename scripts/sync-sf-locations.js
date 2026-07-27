const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const RAW_DIR = path.join(ROOT_DIR, 'raw');
const REPORTS_DIR = path.join(ROOT_DIR, 'reports');
const README_PATH = path.join(ROOT_DIR, 'README.md');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(RAW_DIR)) fs.mkdirSync(RAW_DIR, { recursive: true });
if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });

// ─── Fixed 18-district → region lookup table ───────────────────────────
const DISTRICT_TO_REGION = {
  '中西區': '香港島', '灣仔區': '香港島', '東區': '香港島', '南區': '香港島',
  '油尖旺區': '九龍', '深水埗區': '九龍', '九龍城區': '九龍', '黃大仙區': '九龍', '觀塘區': '九龍',
  '葵青區': '新界', '荃灣區': '新界', '屯門區': '新界', '元朗區': '新界',
  '北區': '新界', '大埔區': '新界', '沙田區': '新界', '西貢區': '新界', '離島區': '新界'
};

const REGION_EN_MAP = {
  '香港島': 'Hong Kong Island',
  '九龍': 'Kowloon',
  '新界': 'New Territories',
  '離島': 'Outlying Islands'
};

const DISTRICT_EN_MAP = {
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

const VALID_DISTRICTS = new Set(Object.keys(DISTRICT_TO_REGION));

// API city field often has the district name without 區 suffix — build a lookup
const CITY_TO_DISTRICT = {};
for (const d of VALID_DISTRICTS) {
  CITY_TO_DISTRICT[d] = d;
  CITY_TO_DISTRICT[d.replace('區', '')] = d;
}

// ─── Helpers ────────────────────────────────────────────────────────────
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

function cleanAndConvert(str, preserveAsterisk = true) {
  if (!str) return '';

  const hasAsterisk = preserveAsterisk && String(str).includes('*');

  let result = String(str).replace(/\*/g, '').trim();

  result = result
    .replace(/周一/g, '星期一')
    .replace(/周二/g, '星期二')
    .replace(/周三/g, '星期三')
    .replace(/周四/g, '星期四')
    .replace(/周五/g, '星期五')
    .replace(/周六/g, '星期六')
    .replace(/周日/g, '星期日')
    .replace(/节假日/g, '公眾假期')
    .replace(/劳工假期/g, '勞工假期')
    .replace(/自助櫃/g, '順豐智能櫃')
    .replace(/自助柜/g, '順豐智能櫃');

  if (hasAsterisk) {
    result += '*';
  }

  return result;
}

function convertObjectProperties(obj) {
  if (typeof obj === 'string') return cleanAndConvert(obj, true);
  if (Array.isArray(obj)) return obj.map(convertObjectProperties);
  if (obj && typeof obj === 'object') {
    const newObj = {};
    for (const key of Object.keys(obj)) {
      newObj[key] = convertObjectProperties(obj[key]);
    }
    return newObj;
  }
  return obj;
}

// ─── District / Region normalization (review fix #1) ────────────────────
//
// For API items: use item.city directly as district (it already contains
// values like "大埔區", "油尖旺區", "觀塘區").
// For PDF/SSR items without city: attempt full-name matching only.
// Never match single characters like "北", "東", "南".
//
function resolveDistrict(item) {
  // 1. Try API city field first (authoritative)
  const city = cleanAndConvert(item.city || '', false).trim();
  if (city && CITY_TO_DISTRICT[city]) {
    return CITY_TO_DISTRICT[city];
  }

  // 2. Try API district field
  const dist = cleanAndConvert(item.district || '', false).trim();
  if (dist && CITY_TO_DISTRICT[dist]) {
    return CITY_TO_DISTRICT[dist];
  }

  // 3. For non-API items, try matching full district names in address
  //    Match ONLY complete district names (e.g. "大埔區", "大埔"), never "北", "東"
  const address = cleanAndConvert(item.address || '', false);
  for (const [key, district] of Object.entries(CITY_TO_DISTRICT)) {
    // Only match keys with at least 2 characters to avoid single-char false positives
    if (key.length >= 2 && address.includes(key)) {
      return district;
    }
  }

  return null; // Unknown — don't guess
}

function resolveRegion(district) {
  if (district && DISTRICT_TO_REGION[district]) {
    return DISTRICT_TO_REGION[district];
  }
  return null; // Unknown — don't default to 新界
}

// ─── Data sources ───────────────────────────────────────────────────────
async function fetchDistrictTreeAreas() {
  const versionUrl = "https://ucmp-static.sf-express.com/proxy/ccspBase/cxDistrictData/queryDistrictActiveVersionData?area=hkmotw";
  const vRes = await fetch(versionUrl).then(r => r.json());
  const fileUrl = vRes?.obj?.fileTcUrl;
  if (!fileUrl) throw new Error("SF district version response did not include fileTcUrl");

  const regionData = await fetch(fileUrl).then(r => r.json());
  const hongKong = regionData.find((region) => region?.f === "香港");
  const city = hongKong?.city?.find((item) => item?.f === "香港");
  const counties = city?.county || [];

  const areas = [];
  for (const county of counties) {
    for (const town of (county.town || [])) {
      areas.push({
        sourceRegion: (county.f || '').trim(),
        district: (town.f || '').trim()
      });
    }
  }
  return areas;
}

async function fetchFromOfficialApiHk(areas) {
  console.log(`Fetching locations from SF Express official API by sub-districts (${areas.length} areas, lang=tc)...`);
  const url = 'https://hk.sf-express.com/sf-service-core-web/service/serviceSupport/queryServiceNetworkList?lang=tc&region=hk&translate=tc';

  const hkMap = new Map();
  const chunkSize = 10;
  for (let i = 0; i < areas.length; i += chunkSize) {
    const chunk = areas.slice(i, i + chunkSize);
    await Promise.all(chunk.map(async (area) => {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': 'https://hk.sf-express.com/hk/tc/store',
            'Origin': 'https://hk.sf-express.com'
          },
          body: JSON.stringify({
            province: '香港',
            city: area.sourceRegion,
            district: area.district,
            serviceType: '',
            locationCode: '852',
            keyWord: '',
            bizTypeCodes: ''
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.result)) {
            data.result.forEach(item => {
              const code = item.serviceCode || item.code;
              if (code) hkMap.set(code, item);
            });
          }
        }
      } catch (err) {}
    }));
  }

  console.log(`Fetched ${hkMap.size} unique HK locations via sub-district queries.`);
  return Array.from(hkMap.values());
}

async function fetchFromOfficialApiEn() {
  console.log('Fetching English locations from SF Express official API (lang=en)...');
  const url = 'https://hk.sf-express.com/sf-service-core-web/service/serviceSupport/queryServiceNetworkList?lang=en&region=hk&translate=en';

  const enMap = new Map();
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://hk.sf-express.com/hk/en/store',
        'Origin': 'https://hk.sf-express.com'
      },
      body: JSON.stringify({ locationCode: '852' })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && Array.isArray(data.result)) {
        data.result.forEach(item => {
          const code = item.serviceCode || item.code;
          if (code) enMap.set(code, item);
        });
      }
    }
  } catch (e) {
    console.warn('Warning: Could not fetch EN API:', e.message);
  }

  console.log(`Fetched ${enMap.size} EN locations via API.`);
  return enMap;
}

async function fetchFromSsrPages() {
  console.log('Fetching & parsing supplementary SSR HTML tables...');
  const supplementary = [];

  try {
    const lockerRes = await fetch('https://hk.sf-express.com/hk/tc/more/sf-locker');
    const lockerHtml = await lockerRes.text();
    const lockerUnescaped = lockerHtml.replace(/\\u003c/g, '<').replace(/\\u003e/g, '>').replace(/\\u0022/g, '"').replace(/\\"/g, '"');
    const lockerRows = lockerUnescaped.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) || [];

    for (const row of lockerRows) {
      const text = row.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      // Match both HH:MM-HH:MM and "24小時" patterns
      const match = text.match(/([^\s]+)\s+(H852[A-Z0-9]+)\s+([^\s]+(?:\s+[^\s]+)*?)\s+(\d{2}:\d{2}-\d{2}:\d{2}|24小時)/);
      if (match) {
        supplementary.push({
          serviceCode: match[2],
          name: `順豐智能櫃 ${match[1]}`,
          address: match[3],
          district: match[1],
          city: '',
          serviceTime: match[4],
          _source: 'ssr_locker'
        });
      }
    }
  } catch (e) {
    console.warn('Warning: Could not fetch SSR pages:', e.message);
  }

  return supplementary;
}

async function fetchFromPartnerPdfs() {
  console.log('Fetching & parsing official Service Partner PDFs (OK便利店 + 小型連鎖店)...');

  // Dynamically discover PDF URLs from the official partner page
  let partnerPdfs = [];
  try {
    console.log('  Discovering PDF links from official partner page...');
    const pageRes = await fetch('https://hk.sf-express.com/hk/tc/more/sf-service-partner-address');
    const pageHtml = await pageRes.text();
    const pdfPaths = pageHtml.match(/uploads\/(?:OK|ASP)_[^"'\\\s]+\.pdf/gi) || [];
    const uniquePaths = [...new Set(pdfPaths)];
    partnerPdfs = uniquePaths
      .filter(p => !p.includes('_MAC_'))
      .map(p => `https://hk.sf-express.com/${p}`);
    console.log(`  Discovered ${partnerPdfs.length} HK partner PDFs dynamically.`);
  } catch (e) {
    console.warn('  Warning: Could not discover PDFs dynamically:', e.message);
  }

  if (partnerPdfs.length === 0) {
    console.log('  Using fallback hardcoded PDF URLs...');
    partnerPdfs = [
      'https://hk.sf-express.com/uploads/OK_HK_TC_810b70d735.pdf',
      'https://hk.sf-express.com/uploads/OK_KLN_TC_fb9d070cdb.pdf',
      'https://hk.sf-express.com/uploads/OK_NT_TC_6df1516024.pdf',
      'https://hk.sf-express.com/uploads/OK_IL_TC_78edfa0b85.pdf',
      'https://hk.sf-express.com/uploads/ASP_HK_TC_974ad5c1ba.pdf',
      'https://hk.sf-express.com/uploads/ASP_KLN_TC_8c8e57432f.pdf',
      'https://hk.sf-express.com/uploads/ASP_NT_TC_307f591507.pdf',
      'https://hk.sf-express.com/uploads/ASP_Islands_TC_aa3d66b729.pdf'
    ];
  }

  const partnerMap = new Map();
  let pdfSuccessCount = 0;
  let pdfFailCount = 0;

  for (const url of partnerPdfs) {
    try {
      const isOkStore = url.includes('OK_');
      const res = await fetch(url);
      if (!res.ok) {
        console.warn(`  Warning: PDF fetch failed (HTTP ${res.status}): ${url}`);
        pdfFailCount++;
        continue;
      }
      const buffer = await res.arrayBuffer();
      const data = await pdf(Buffer.from(buffer));
      const lines = (data.text || '').split('\n').map(l => l.trim()).filter(Boolean);

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const allMatches = [...line.matchAll(/\b(852[A-Z][A-Z0-9]*\d+)\b/g)];
        const lineCodes = [...new Set(allMatches.map(m => m[1]))];

        for (const code of lineCodes) {
          if (partnerMap.has(code)) continue;

          let subDistrict = '';
          let name = isOkStore ? 'OK便利店' : '順豐合作點';
          let address = '';
          let hours = null; // null instead of assuming "24小時"

          if (isOkStore) {
            const parts = line.split(code);
            subDistrict = parts[0] || '';
            const rest = parts.slice(1).join(code);
            const addrAndHours = rest.split('^');
            address = addrAndHours[0] || '';
            const rawHours = (addrAndHours[2] || '').trim();
            hours = rawHours || null; // null if empty, not "24小時"
            name = `OK便利店 (${subDistrict.trim()})`;
          } else {
            const parts = line.split(code);
            name = parts[0] || '順豐合作點';
            const rest = parts.slice(1).join(code);
            const addrParts = rest.split('^');
            address = addrParts[0] || '';

            // Collect all consecutive hours lines until encountering next store or specs (體積/重量)
            const hoursLines = [];
            let j = i + 1;
            while (j < lines.length) {
              const curLine = lines[j];
              // Stop if encountering specs or a new store code line
              if (curLine.includes('體積:') || curLine.includes('重量:') || curLine.match(/\b852[A-Z][A-Z0-9]*\d+\b/)) {
                break;
              }
              // If line contains hours info or continues previous line (e.g. "16:00)")
              if (
                curLine.includes('星期') ||
                curLine.includes('公眾假期') ||
                curLine.includes('午休') ||
                curLine.includes('休息') ||
                curLine.includes('OFF') ||
                curLine.match(/^\d{2}:\d{2}/) ||
                (hoursLines.length > 0 && curLine.match(/^\d{2}:\d{2}\)/))
              ) {
                hoursLines.push(curLine);
              } else if (hoursLines.length > 0) {
                // Continuation line (e.g. "16:00)")
                hoursLines.push(curLine);
              } else {
                break;
              }
              j++;
            }
            hours = hoursLines.length > 0 ? hoursLines.join(' ') : null;
          }

          partnerMap.set(code, {
            serviceCode: code,
            name: name.trim(),
            address: address.trim(),
            district: subDistrict.trim(),
            city: '',
            serviceTime: hours,
            isPartner: true,
            _source: 'pdf_partner',
            _source_url: url
          });
        }
      }
      pdfSuccessCount++;
    } catch (e) {
      console.warn(`  Warning: Could not parse partner PDF ${url}:`, e.message);
      pdfFailCount++;
    }
  }

  const partners = Array.from(partnerMap.values());
  console.log(`  PDF results: ${pdfSuccessCount} succeeded, ${pdfFailCount} failed.`);
  console.log(`  Extracted ${partners.length} unique Service Partner locations from official PDFs.`);

  return { partners, pdfSuccessCount, pdfFailCount, pdfTotal: partnerPdfs.length };
}

// ─── Validation (review fix #5) ─────────────────────────────────────────
function validateDataset(normalizedList, prevDataPath) {
  const errors = [];
  const warnings = [];

  // 1. All codes must be non-empty and unique
  const codes = normalizedList.map(i => i.code);
  const emptyCodes = codes.filter(c => !c);
  if (emptyCodes.length > 0) errors.push(`${emptyCodes.length} records have empty code`);

  const duplicates = codes.filter((c, i) => codes.indexOf(c) !== i);
  if (duplicates.length > 0) errors.push(`${duplicates.length} duplicate codes found`);

  // 2. District must be a valid 18-district or null
  const invalidDistricts = normalizedList.filter(i => i.district && !VALID_DISTRICTS.has(i.district));
  if (invalidDistricts.length > 0) {
    warnings.push(`${invalidDistricts.length} records have non-standard district values`);
  }

  // 3. District and region must be consistent
  const inconsistent = normalizedList.filter(i =>
    i.district && i.region && DISTRICT_TO_REGION[i.district] && DISTRICT_TO_REGION[i.district] !== i.region
  );
  if (inconsistent.length > 0) errors.push(`${inconsistent.length} records have district/region mismatch`);

  // 4. Stores and lockers should have addresses
  const storeLockerNoAddr = normalizedList.filter(
    i => (i.type === 'store' || i.type === 'locker') && !i.address
  );
  if (storeLockerNoAddr.length > 0) {
    warnings.push(`${storeLockerNoAddr.length} store/locker records have empty address`);
  }

  // 5. Coordinates sanity check (HK bounding box)
  const badCoords = normalizedList.filter(i => {
    const lat = i.location?.latitude;
    const lon = i.location?.longitude;
    if (lat == null && lon == null) return false;
    return lat < 22.1 || lat > 22.6 || lon < 113.8 || lon > 114.5;
  });
  if (badCoords.length > 0) {
    warnings.push(`${badCoords.length} records have coordinates outside HK bounding box`);
  }

  // 6. Count anomaly detection vs previous dataset
  if (fs.existsSync(prevDataPath)) {
    try {
      const prevData = JSON.parse(fs.readFileSync(prevDataPath, 'utf8'));
      const prevCount = prevData.length;
      const dropPct = ((prevCount - normalizedList.length) / prevCount) * 100;
      if (dropPct > 5) {
        errors.push(`Dataset count dropped by ${dropPct.toFixed(1)}% (${prevCount} → ${normalizedList.length}). Aborting.`);
      }
    } catch (e) {
      // First run, no previous data — OK
    }
  }

  // 7. Empty address ratio
  const emptyAddrCount = normalizedList.filter(i => !i.address).length;
  const emptyAddrPct = (emptyAddrCount / normalizedList.length) * 100;
  if (emptyAddrPct > 10) {
    warnings.push(`${emptyAddrPct.toFixed(1)}% of records have empty address`);
  }

  // 8. Null district ratio
  const nullDistrictCount = normalizedList.filter(i => !i.district).length;
  const nullDistrictPct = (nullDistrictCount / normalizedList.length) * 100;
  if (nullDistrictPct > 40) {
    warnings.push(`${nullDistrictPct.toFixed(1)}% of records have null district`);
  }

  return { errors, warnings };
}

// ─── Main ───────────────────────────────────────────────────────────────
async function run() {
  console.log('Starting SF Express HK Location Data Sync...');
  const hktDateStr = getHKTDateString();
  console.log(`Current HKT Time: ${hktDateStr}`);

  try {
    const areas = await fetchDistrictTreeAreas();
    const rawApiList = await fetchFromOfficialApiHk(areas);
    const rawApiEnMap = await fetchFromOfficialApiEn();
    const rawSsrList = await fetchFromSsrPages();
    const { partners: rawPartnerList, pdfSuccessCount, pdfFailCount, pdfTotal } = await fetchFromPartnerPdfs();

    console.log(`Fetched ${rawApiList.length} items from HK API (${rawApiEnMap.size} EN API matches), ${rawSsrList.length} items from SSR pages, ${rawPartnerList.length} items from Partner PDFs.`);

    // Source failure check: if ALL partner PDFs failed, abort
    if (pdfTotal > 0 && pdfSuccessCount === 0) {
      throw new Error(`All ${pdfTotal} partner PDFs failed to fetch/parse. Aborting to prevent data loss.`);
    }

    // Merge with source priority: API > SSR > PDF
    const mergedMap = new Map();

    rawApiList.forEach((item) => {
      const code = item.serviceCode || item.code;
      if (code) {
        item._source = 'api';
        mergedMap.set(code, item);
      }
    });

    rawSsrList.forEach((item) => {
      const code = item.serviceCode || item.code;
      if (code && !mergedMap.has(code)) {
        mergedMap.set(code, item);
      }
    });

    rawPartnerList.forEach((item) => {
      const code = item.serviceCode || item.code;
      if (code && !mergedMap.has(code)) {
        mergedMap.set(code, item);
      }
    });

    const mergedList = Array.from(mergedMap.values());
    console.log(`Total Unique Locations Merged: ${mergedList.length}`);

    // Save raw snapshot
    const convertedRawList = convertObjectProperties(mergedList);
    fs.writeFileSync(
      path.join(RAW_DIR, 'latest-fetch.json'),
      JSON.stringify({ retrieved_at: hktDateStr, count: convertedRawList.length, data: convertedRawList }, null, 2),
      'utf8'
    );

    // Normalize
    const normalizedList = mergedList.map((item) => {
      const code = item.serviceCode || item.code || '';
      const rawName = (item.name || '').trim();
      const rawAddress = (item.address || '').trim();

      const name = cleanAndConvert(rawName, false);
      const address = cleanAndConvert(rawAddress, true);

      // District/region
      const district = resolveDistrict(item);
      const region = resolveRegion(district);

      const districtEn = district ? (DISTRICT_EN_MAP[district] || null) : null;
      const regionEn = region ? (REGION_EN_MAP[region] || null) : null;

      // English fields from EN API
      const enItem = rawApiEnMap.get(code);
      const nameEn = enItem ? (enItem.name || '').trim() : null;
      const subDistrictEn = enItem ? (enItem.district || '').trim() : null;
      let addressEn = enItem ? (enItem.address || '').trim() : null;
      if (addressEn) {
        addressEn = addressEn.replace(/\*\^/g, '*').replace(/\^/g, '').trim();
      }
      const businessHoursEn = enItem ? (enItem.serviceTime || '').trim() : null;

      let type = 'store';
      let type_name = '順豐站';
      let type_name_en = 'SF Store';

      if (code.startsWith('H852') || name.includes('智能櫃') || rawName.includes('自助櫃') || rawName.includes('自助柜')) {
        type = 'locker';
        type_name = '順豐智能櫃';
        type_name_en = 'SF Locker';
      } else if (item.isPartner || name.includes('OK便利店') || name.includes('合作點') || name.includes('便利店') || code.match(/852[A-Z]{1,2}[23]\d{3}/)) {
        type = 'partner';
        type_name = '順豐合作點';
        type_name_en = 'Service Partner';
      }

      const rawHours = item.serviceTime;
      const businessHours = rawHours ? cleanAndConvert(rawHours, false) : null;

      return {
        id: code,
        code: code,
        type: type,
        type_name: type_name,
        type_name_en: type_name_en,
        name: name,
        name_en: nameEn,
        region: region,
        region_en: regionEn,
        district: district,
        district_en: districtEn,
        sub_district: cleanAndConvert(item.district || '', false) || null,
        sub_district_en: subDistrictEn,
        address: address || null,
        address_en: addressEn,
        telephone: item.telephone || null,
        business_hours: businessHours,
        business_hours_en: businessHoursEn,
        location: {
          latitude: item.latitude || null,
          longitude: item.longitude || null
        },
        source: item._source || null,
        retrieved_at: hktDateStr
      };
    });

    // Validate before publishing
    const prevDataPath = path.join(DATA_DIR, 'locations.json');
    const { errors, warnings } = validateDataset(normalizedList, prevDataPath);

    if (warnings.length > 0) {
      console.log('\n⚠️  Validation warnings:');
      warnings.forEach(w => console.log(`  - ${w}`));
    }

    if (errors.length > 0) {
      console.error('\n❌ Validation errors (blocking publish):');
      errors.forEach(e => console.error(`  - ${e}`));
      throw new Error('Dataset validation failed. Previous data preserved.');
    }

    // Separate lists for categorized datasets inside data/
    const stores = normalizedList.filter((item) => item.type === 'store');
    const lockers = normalizedList.filter((item) => item.type === 'locker');
    const partners = normalizedList.filter((item) => item.type === 'partner');

    const byDistrict = {};
    normalizedList.forEach((item) => {
      const key = item.district || '_unresolved';
      if (!byDistrict[key]) byDistrict[key] = [];
      byDistrict[key].push(item);
    });

    console.log(`\nNormalized Summary: Total=${normalizedList.length}, Stores=${stores.length}, Lockers=${lockers.length}, Partners=${partners.length}`);

    const resolvedDistricts = normalizedList.filter(i => i.district).length;
    const unresolvedDistricts = normalizedList.filter(i => !i.district).length;
    console.log(`District resolution: ${resolvedDistricts} resolved, ${unresolvedDistricts} unresolved (null)`);

    // Write all output files into data/ folder
    fs.writeFileSync(path.join(DATA_DIR, 'locations.json'), JSON.stringify(normalizedList, null, 2), 'utf8');
    fs.writeFileSync(path.join(DATA_DIR, 'stores.json'), JSON.stringify(stores, null, 2), 'utf8');
    fs.writeFileSync(path.join(DATA_DIR, 'lockers.json'), JSON.stringify(lockers, null, 2), 'utf8');
    fs.writeFileSync(path.join(DATA_DIR, 'partners.json'), JSON.stringify(partners, null, 2), 'utf8');
    fs.writeFileSync(path.join(DATA_DIR, 'locations-by-district.json'), JSON.stringify(byDistrict, null, 2), 'utf8');

    // Calculate diff between prevList and normalizedList
    let prevList = [];
    if (fs.existsSync(prevDataPath)) {
      try {
        prevList = JSON.parse(fs.readFileSync(prevDataPath, 'utf8'));
      } catch (e) {}
    }

    const prevMap = new Map(prevList.map(item => [item.code, item]));
    const nextMap = new Map(normalizedList.map(item => [item.code, item]));

    const addedList = [];
    const removedList = [];
    const updatedList = [];

    for (const [code, item] of nextMap.entries()) {
      if (!prevMap.has(code)) {
        addedList.push(item);
      } else {
        const prev = prevMap.get(code);
        if (
          prev.name !== item.name ||
          prev.address !== item.address ||
          prev.district !== item.district ||
          prev.business_hours !== item.business_hours
        ) {
          updatedList.push({ code, old: prev, new: item });
        }
      }
    }

    for (const [code, item] of prevMap.entries()) {
      if (!nextMap.has(code)) {
        removedList.push(item);
      }
    }

    const reportMarkdown = generateReportMarkdown({
      hktDateStr,
      totalCount: normalizedList.length,
      storesCount: stores.length,
      lockersCount: lockers.length,
      partnersCount: partners.length,
      addedList,
      removedList,
      updatedList,
    });

    const reportPath = path.join(REPORTS_DIR, 'latest-diff.md');
    fs.writeFileSync(reportPath, reportMarkdown, 'utf8');
    console.log(`Generated sync report at ${reportPath}`);

    // Update README timestamp
    if (fs.existsSync(README_PATH)) {
      let readmeContent = fs.readFileSync(README_PATH, 'utf8');
      const timestampLine = `> 📅 **最後更新時間 (Last Updated)**: \`${hktDateStr}\`\n\n`;

      if (readmeContent.startsWith('> 📅 **最後更新時間')) {
        readmeContent = readmeContent.replace(/^> 📅 \*\*最後更新時間[^\n]*\n+/m, timestampLine);
      } else {
        readmeContent = timestampLine + readmeContent;
      }

      fs.writeFileSync(README_PATH, readmeContent, 'utf8');
      console.log('Updated README.md timestamp.');
    }

    console.log('\n✅ Sync completed successfully!');
  } catch (error) {
    console.error('\n❌ Sync failed:', error.message || error);
    process.exit(1);
  }
}

function generateReportMarkdown({
  hktDateStr,
  totalCount,
  storesCount,
  lockersCount,
  partnersCount,
  addedList,
  removedList,
  updatedList,
}) {
  const addedLines = addedList.length === 0
    ? '*（無新增網點 / No added locations）*'
    : addedList.map(i => `- **\`${i.code}\`** [${i.type_name}] ${i.name || ''} — ${i.address || ''}`).join('\n');

  const removedLines = removedList.length === 0
    ? '*（無下架網點 / No removed locations）*'
    : removedList.map(i => `- **\`${i.code}\`** [${i.type_name}] ${i.name || ''} — ${i.address || ''}`).join('\n');

  const updatedLines = updatedList.length === 0
    ? '*（無更動網點 / No updated locations）*'
    : updatedList.map(u => {
        const changes = [];
        if (u.old.name !== u.new.name) changes.push(`店名: \`${u.old.name}\` ➔ \`${u.new.name}\``);
        if (u.old.address !== u.new.address) changes.push(`地址: \`${u.old.address}\` ➔ \`${u.new.address}\``);
        if (u.old.district !== u.new.district) changes.push(`地區: \`${u.old.district}\` ➔ \`${u.new.district}\``);
        if (u.old.business_hours !== u.new.business_hours) changes.push(`營業時間變更`);
        return `- **\`${u.code}\`** ${u.new.name || u.old.name}\n  - ${changes.join('\n  - ')}`;
      }).join('\n');

  return `# 📊 最新每日順豐網點同步報告 (Latest SF Location Sync Report)

> 🕒 **最後更新時間 (Last Updated)**: \`${hktDateStr}\`  
> 🔗 **異動報告連結 (Report Link)**: [reports/latest-diff.md](https://github.com/wtw0212/sf-express-hk-locations/blob/main/reports/latest-diff.md)

---

### 📈 數據變動總覽 (Summary Overview)

| 統計項目 (Metric) | 數量 (Count) |
| :--- | :--- |
| **總網點數 (Total Locations)** | \`${totalCount.toLocaleString()}\` |
| **順豐站 (Stores)** | \`${storesCount.toLocaleString()}\` |
| **順豐智能櫃 (Lockers)** | \`${lockersCount.toLocaleString()}\` |
| **合作點 (Partners)** | \`${partnersCount.toLocaleString()}\` |
| ➕ **新增網點 (Added)** | \`${addedList.length}\` |
| ➖ **下架網點 (Removed)** | \`${removedList.length}\` |
| ✏️ **內容變異 (Updated)** | \`${updatedList.length}\` |

---

### 🆕 新增網點 (Added Locations - ${addedList.length})

${addedLines}

---

### ❌ 下架網點 (Removed Locations - ${removedList.length})

${removedLines}

---

### ✏️ 內容更動網點 (Updated Locations - ${updatedList.length})

${updatedLines}
`;
}

run();
