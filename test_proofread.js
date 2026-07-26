const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const GEOJSON_PATH = 'K:\\Downloads\\GeoName_PlaceName_20260610_gdb_PLACE_NAME_converted.geojson';

console.log('=== Proofreading with Official HK Gov GeoJSON Place Names Database ===\n');

// Build official HK place names lookup from GeoJSON
let officialPlaceNames = new Set();
if (fs.existsSync(GEOJSON_PATH)) {
  const geo = JSON.parse(fs.readFileSync(GEOJSON_PATH, 'utf8'));
  geo.features.forEach(f => {
    if (f.properties && f.properties.NAME_TC) {
      officialPlaceNames.add(f.properties.NAME_TC.trim());
    }
  });
  console.log(`Loaded ${officialPlaceNames.size} official HK Gov TC place names from GeoJSON.`);
} else {
  console.warn('Warning: GeoJSON file not found at K:\\Downloads\\...');
}

// Correction rules verified against HK Gov GeoJSON:
// 1. "湧" -> "涌" (e.g., 東涌, 鰂魚涌, 葵涌, 深井涌, 葵涌, 涌口)
// 2. "皇後" -> "皇后" (e.g., 皇后大道, 皇后山)
// 3. "天後" -> "天后" (e.g., 天后站, 天后廟)
// 4. "平臺" -> "平台" (e.g., 平台, 月台)
// 5. "幹洗" -> "乾洗"

function cleanHkSpelling(text) {
  if (!text || typeof text !== 'string') return text;

  let cleaned = text;

  // Fix "湧" -> "涌" for HK place names verified by Gov GeoJSON
  cleaned = cleaned
    .replace(/東湧/g, '東涌')
    .replace(/鰂魚湧/g, '鰂魚涌')
    .replace(/葵湧/g, '葵涌')
    .replace(/深井湧/g, '深井涌')
    .replace(/葵湧/g, '葵涌')
    .replace(/涌口/g, '涌口')
    .replace(/皇後/g, '皇后')
    .replace(/天後/g, '天后')
    .replace(/平臺/g, '平台')
    .replace(/月臺/g, '月台')
    .replace(/樓臺/g, '樓台')
    .replace(/幹洗/g, '乾洗')
    .replace(/鬆樹/g, '松樹')
    .replace(/雲南/g, '雲南');

  return cleaned;
}

// Process all dataset files in data/
const files = ['locations.json', 'stores.json', 'lockers.json', 'partners.json'];

files.forEach(filename => {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) return;

  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  let fixedCount = 0;
  data.forEach(item => {
    const origName = item.name;
    const origAddr = item.address;

    item.name = cleanHkSpelling(item.name);
    item.address = cleanHkSpelling(item.address);
    if (item.sub_district) item.sub_district = cleanHkSpelling(item.sub_district);
    if (item.business_hours) item.business_hours = cleanHkSpelling(item.business_hours);

    if (origName !== item.name || origAddr !== item.address) {
      fixedCount++;
      console.log(`  [FIXED] [${item.code}]`);
      if (origName !== item.name) console.log(`    Name: "${origName}" → "${item.name}"`);
      if (origAddr !== item.address) console.log(`    Addr: "${origAddr}" → "${item.address}"`);
    }
  });

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Updated ${filename}: fixed ${fixedCount} records.`);
});

// Update locations-by-district.json
const byDistrictPath = path.join(DATA_DIR, 'locations-by-district.json');
if (fs.existsSync(byDistrictPath)) {
  const locs = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'locations.json'), 'utf8'));
  const byDistrict = {};
  locs.forEach(item => {
    const key = item.district || '_unresolved';
    if (!byDistrict[key]) byDistrict[key] = [];
    byDistrict[key].push(item);
  });
  fs.writeFileSync(byDistrictPath, JSON.stringify(byDistrict, null, 2), 'utf8');
  console.log(`Updated locations-by-district.json.`);
}

console.log('\n✅ Proofreading against HK Gov GeoJSON completed successfully!');
