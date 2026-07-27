// @ts-check
import { fetchWithRetry, withConcurrency } from './api-client.js';

const TC_API_URL = 'https://hk.sf-express.com/sf-service-core-web/service/serviceSupport/queryServiceNetworkList?lang=tc&region=hk&translate=tc';
const EN_API_URL = 'https://hk.sf-express.com/sf-service-core-web/service/serviceSupport/queryServiceNetworkList?lang=en&region=hk&translate=en';
const DISTRICT_VERSION_URL = 'https://ucmp-static.sf-express.com/proxy/ccspBase/cxDistrictData/queryDistrictActiveVersionData?area=hkmotw';

const API_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Referer': 'https://hk.sf-express.com/hk/tc/store',
  'Origin': 'https://hk.sf-express.com'
};

const API_CONCURRENCY = 5;

/**
 * Fetch the district tree from SF Express to get all queryable areas.
 * @returns {Promise<{ tcAreas: Array, enAreas: Array }>}
 */
export async function fetchDistrictTree() {
  const versionResult = await fetchWithRetry(DISTRICT_VERSION_URL);
  if (!versionResult.ok) {
    throw new Error(`Failed to fetch district version: ${versionResult.error}`);
  }

  const fileTcUrl = versionResult.data?.obj?.fileTcUrl;
  const fileEnUrl = versionResult.data?.obj?.fileEnUrl;
  if (!fileTcUrl || !fileEnUrl) {
    throw new Error('SF district version response did not include file URLs');
  }

  const [tcTreeResult, enTreeResult] = await Promise.all([
    fetchWithRetry(fileTcUrl),
    fetchWithRetry(fileEnUrl)
  ]);

  if (!tcTreeResult.ok) throw new Error(`Failed to fetch TC district tree: ${tcTreeResult.error}`);
  if (!enTreeResult.ok) throw new Error(`Failed to fetch EN district tree: ${enTreeResult.error}`);

  const extractAreas = (data, rootName) => {
    const hk = data.find(region => region?.f === rootName);
    const city = hk?.city?.find(item => item?.f === rootName);
    const counties = city?.county || [];

    const list = [];
    for (const county of counties) {
      for (const town of (county.town || [])) {
        list.push({
          sourceRegion: (county.f || '').trim(),
          district: (town.f || '').trim()
        });
      }
    }
    return list;
  };

  const tcAreas = extractAreas(tcTreeResult.data, '香港');
  const enAreas = extractAreas(enTreeResult.data, 'Hong Kong');

  return { tcAreas, enAreas };
}

/**
 * Fetch all TC API records by querying each sub-district area.
 * Returns per-area results with success/failure tracking.
 *
 * @param {Array<{sourceRegion: string, district: string}>} tcAreas
 * @returns {Promise<Array<{area: object, language: string, ok: boolean, status: number|null, attempts: number, error: string|null, records: Array}>>}
 */
export async function fetchTcApi(tcAreas) {
  console.log(`Fetching TC API locations (${tcAreas.length} areas, concurrency=${API_CONCURRENCY})...`);

  const results = await withConcurrency(tcAreas, async (area) => {
    const result = await fetchWithRetry(TC_API_URL, {
      method: 'POST',
      headers: API_HEADERS,
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

    if (result.ok && result.data?.success && Array.isArray(result.data.result)) {
      return {
        area,
        language: 'tc',
        ok: true,
        status: result.status,
        attempts: result.attempts,
        error: null,
        records: result.data.result
      };
    }

    const error = result.error || 'API returned success=false or no result array';
    console.warn(`  TC API failed: ${area.sourceRegion}/${area.district} — ${error}`);

    return {
      area,
      language: 'tc',
      ok: false,
      status: result.status,
      attempts: result.attempts,
      error,
      records: []
    };
  }, API_CONCURRENCY);

  const totalRecords = results.reduce((sum, r) => sum + r.records.length, 0);
  const successCount = results.filter(r => r.ok).length;
  console.log(`  TC API: ${successCount}/${results.length} areas succeeded, ${totalRecords} total records`);

  return results;
}

/**
 * Fetch all EN API records by querying each sub-district area.
 * Returns per-area results with success/failure tracking.
 *
 * @param {Array<{sourceRegion: string, district: string}>} enAreas
 * @returns {Promise<Array<{area: object, language: string, ok: boolean, status: number|null, attempts: number, error: string|null, records: Array}>>}
 */
export async function fetchEnApi(enAreas) {
  console.log(`Fetching EN API locations (${enAreas.length} areas, concurrency=${API_CONCURRENCY})...`);

  const results = await withConcurrency(enAreas, async (area) => {
    const result = await fetchWithRetry(EN_API_URL, {
      method: 'POST',
      headers: {
        ...API_HEADERS,
        'Referer': 'https://hk.sf-express.com/hk/en/store'
      },
      body: JSON.stringify({
        province: 'Hong Kong',
        city: area.sourceRegion,
        district: area.district,
        serviceType: '',
        locationCode: '852',
        keyWord: '',
        bizTypeCodes: ''
      })
    });

    if (result.ok && result.data?.success && Array.isArray(result.data.result)) {
      return {
        area,
        language: 'en',
        ok: true,
        status: result.status,
        attempts: result.attempts,
        error: null,
        records: result.data.result
      };
    }

    const error = result.error || 'API returned success=false or no result array';
    console.warn(`  EN API failed: ${area.sourceRegion}/${area.district} — ${error}`);

    return {
      area,
      language: 'en',
      ok: false,
      status: result.status,
      attempts: result.attempts,
      error,
      records: []
    };
  }, API_CONCURRENCY);

  const totalRecords = results.reduce((sum, r) => sum + r.records.length, 0);
  const successCount = results.filter(r => r.ok).length;
  console.log(`  EN API: ${successCount}/${results.length} areas succeeded, ${totalRecords} total records`);

  return results;
}

/**
 * Build a Map of unique records from per-area results, keyed by service code.
 * @param {Array} results - Per-area fetch results
 * @returns {Map<string, object>}
 */
export function buildRecordMap(results) {
  const map = new Map();
  for (const r of results) {
    for (const item of r.records) {
      const code = item.serviceCode || item.code;
      if (code) map.set(code, item);
    }
  }
  return map;
}

/**
 * Fetch supplementary records from SSR HTML pages.
 * Non-blocking — errors are collected, not thrown.
 *
 * @returns {Promise<{ records: Array, errors: string[], ok: boolean }>}
 */
export async function fetchSsrPages() {
  console.log('Fetching supplementary SSR HTML tables...');
  const records = [];
  const errors = [];

  const res = await fetchWithRetry('https://hk.sf-express.com/hk/tc/more/sf-locker', {}, { responseType: 'text' });
  if (!res.ok) {
    errors.push(`SSR fetch error: HTTP ${res.status || 'NET_ERR'} (${res.error})`);
    console.warn('  Warning: Could not fetch SSR pages:', res.error);
    return { records, errors, ok: false };
  }

  try {
    const lockerHtml = res.data || '';
    const lockerUnescaped = lockerHtml
      .replace(/\\u003c/g, '<').replace(/\\u003e/g, '>')
      .replace(/\\u0022/g, '"').replace(/\\"/g, '"');
    const lockerRows = lockerUnescaped.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) || [];

    for (const row of lockerRows) {
      const text = row.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      const match = text.match(/([^\s]+)\s+(H852[A-Z0-9]+)\s+([^\s]+(?:\s+[^\s]+)*?)\s+(\d{2}:\d{2}-\d{2}:\d{2}|24小時)/);
      if (match) {
        records.push({
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
    errors.push(`SSR parse error: ${e.message}`);
    console.warn('  Warning: Could not parse SSR content:', e.message);
  }

  console.log(`  SSR: ${records.length} records`);
  return { records, errors, ok: errors.length === 0 };
}

/**
 * Fetch and parse partner PDF records.
 * Non-blocking — errors are collected, not thrown.
 *
 * @returns {Promise<{ records: Array, pdfTotal: number, pdfSuccessCount: number, pdfFailCount: number, status: string, errors: string[], pdfDetails: Array }>}
 */
export async function fetchPartnerPdfs() {
  console.log('Fetching official Service Partner PDFs...');
  const errors = [];
  const pdfDetails = [];

  // Dynamically discover PDF URLs from the official partner page
  let partnerPdfs = [];
  const discoveryRes = await fetchWithRetry('https://hk.sf-express.com/hk/tc/more/sf-service-partner-address', {}, { responseType: 'text' });
  if (discoveryRes.ok) {
    const pageHtml = discoveryRes.data || '';
    const pdfPaths = pageHtml.match(/uploads\/(?:OK|ASP)_[^"'\\\s]+\.pdf/gi) || [];
    const uniquePaths = [...new Set(pdfPaths)];
    partnerPdfs = uniquePaths
      .filter(p => !p.includes('_MAC_'))
      .map(p => `https://hk.sf-express.com/${p}`);
    console.log(`  Discovered ${partnerPdfs.length} HK partner PDFs.`);
  } else {
    errors.push(`PDF discovery error: HTTP ${discoveryRes.status || 'NET_ERR'} (${discoveryRes.error})`);
    console.warn('  Warning: Could not discover PDFs dynamically:', discoveryRes.error);
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

  // pdf-parse library import: target lib file directly to avoid index.js test file bug
  let pdf;
  try {
    pdf = (await import('pdf-parse/lib/pdf-parse.js')).default;
  } catch {
    try {
      pdf = (await import('pdf-parse')).default;
    } catch {
      const errMsg = 'pdf-parse dependency not available';
      errors.push(errMsg);
      console.warn('  Warning: pdf-parse not available. Skipping partner PDFs.');
      return {
        records: [],
        pdfTotal: partnerPdfs.length,
        pdfSuccessCount: 0,
        pdfFailCount: partnerPdfs.length,
        status: partnerPdfs.length > 0 ? 'all_pdfs_failed' : 'no_pdfs_discovered',
        errors,
        pdfDetails: partnerPdfs.map(url => ({ url, ok: false, error: errMsg }))
      };
    }
  }

  const partnerMap = new Map();
  let pdfSuccessCount = 0;
  let pdfFailCount = 0;

  for (const url of partnerPdfs) {
    const isOkStore = url.includes('OK_');
    const pdfRes = await fetchWithRetry(url, {}, { responseType: 'arrayBuffer' });

    if (!pdfRes.ok) {
      const errMsg = `PDF fetch failed (HTTP ${pdfRes.status || 'NET_ERR'}): ${url} - ${pdfRes.error}`;
      errors.push(errMsg);
      pdfFailCount++;
      pdfDetails.push({ url, ok: false, status: pdfRes.status, attempts: pdfRes.attempts, error: pdfRes.error, recordCount: 0 });
      continue;
    }

    try {
      const buffer = pdfRes.data;
      const data = await pdf(Buffer.from(buffer));
      const lines = (data.text || '').split('\n').map(l => l.trim()).filter(Boolean);

      let parsedCountForPdf = 0;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const allMatches = [...line.matchAll(/\b(852[A-Z][A-Z0-9]*\d+)\b/g)];
        const lineCodes = [...new Set(allMatches.map(m => m[1]))];

        for (const code of lineCodes) {
          if (partnerMap.has(code)) continue;

          let subDistrict = '';
          let name = isOkStore ? 'OK便利店' : '順豐合作點';
          let address = '';
          let hours = null;

          if (isOkStore) {
            const parts = line.split(code);
            subDistrict = parts[0] || '';
            const rest = parts.slice(1).join(code);
            const addrAndHours = rest.split('^');
            address = addrAndHours[0] || '';
            const rawHours = (addrAndHours[2] || '').trim();
            hours = rawHours || null;
            name = `OK便利店 (${subDistrict.trim()})`;
          } else {
            const parts = line.split(code);
            name = parts[0] || '順豐合作點';
            const rest = parts.slice(1).join(code);
            const addrParts = rest.split('^');
            address = addrParts[0] || '';

            const hoursLines = [];
            let j = i + 1;
            while (j < lines.length) {
              const curLine = lines[j];
              if (curLine.includes('體積:') || curLine.includes('重量:') || curLine.match(/\b852[A-Z][A-Z0-9]*\d+\b/)) break;
              if (curLine.includes('星期') || curLine.includes('公眾假期') || curLine.includes('午休') ||
                  curLine.includes('休息') || curLine.includes('OFF') || curLine.match(/^\d{2}:\d{2}/) ||
                  (hoursLines.length > 0 && curLine.match(/^\d{2}:\d{2}\)/))) {
                hoursLines.push(curLine);
              } else if (hoursLines.length > 0) {
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
          parsedCountForPdf++;
        }
      }
      pdfSuccessCount++;
      pdfDetails.push({ url, ok: true, status: pdfRes.status, attempts: pdfRes.attempts, error: null, recordCount: parsedCountForPdf });
    } catch (e) {
      const errMsg = `PDF parse error (${url}): ${e.message}`;
      errors.push(errMsg);
      pdfFailCount++;
      pdfDetails.push({ url, ok: false, status: pdfRes.status, attempts: pdfRes.attempts, error: e.message, recordCount: 0 });
    }
  }

  const records = Array.from(partnerMap.values());

  // Determine categorical status
  let status = 'success';
  if (partnerPdfs.length === 0) {
    status = 'no_pdfs_discovered';
  } else if (pdfSuccessCount === 0) {
    status = 'all_pdfs_failed';
  } else if (pdfFailCount > 0) {
    status = 'partial_pdf_failures';
  } else if (records.length === 0) {
    status = 'zero_records_parsed';
  }

  console.log(`  PDF: ${pdfSuccessCount}/${partnerPdfs.length} succeeded (${status}), ${pdfFailCount} failed, ${records.length} records`);

  return {
    records,
    pdfTotal: partnerPdfs.length,
    pdfSuccessCount,
    pdfFailCount,
    status,
    errors,
    pdfDetails
  };
}
