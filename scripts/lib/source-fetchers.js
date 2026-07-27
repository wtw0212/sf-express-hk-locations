import { fetchWithRetry, withConcurrency } from './api-client.js';
import { sha256 } from './source-hashes.js';
import { PDF_PARSE_QUALITY_CONFIG } from './constants.js';
import { parseOkPartnerPdfText } from './pdf-parsers/ok-partner-parser.js';
import { parseAspPartnerPdfText } from './pdf-parsers/asp-partner-parser.js';

const TC_API_URL = 'https://hk.sf-express.com/sf-service-core-web/service/serviceSupport/queryServiceNetworkList?lang=tc&region=hk&translate=tc';
const EN_API_URL = 'https://hk.sf-express.com/sf-service-core-web/service/serviceSupport/queryServiceNetworkList?lang=en&region=hk&translate=en';
const DISTRICT_VERSION_URL = 'https://ucmp-static.sf-express.com/proxy/ccspBase/cxDistrictData/queryDistrictActiveVersionData?area=hkmotw';
const PARTNER_PDF_DIRECTORY_URL = 'https://hk.sf-express.com/hk/tc/more/sf-service-partner-address';

function extractPdfUrlsFromHtml(html = '') {
  const pdfPaths = html.match(/uploads\/(?:OK|ASP)_[^"'\\\s]+\.pdf/gi) || [];
  const uniquePaths = [...new Set(pdfPaths)];
  return uniquePaths
    .filter(p => !p.includes('_MAC_'))
    .map(p => `https://hk.sf-express.com/${p}`);
}

async function parsePdfBuffer(buffer) {
  let pdf;
  try {
    pdf = (await import('pdf-parse/lib/pdf-parse.js')).default;
  } catch {
    pdf = (await import('pdf-parse')).default;
  }
  return await pdf(Buffer.from(buffer));
}

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
 * Validate SF service-network API response payload envelope and field structure.
 *
 * @param {object} payload
 * @throws {Error} If API payload envelope or record contracts are invalid
 */
export function validateServiceNetworkApiPayload(payload) {
  if (!payload || payload.success !== true || !Array.isArray(payload.result)) {
    throw new Error('Unexpected SF service-network API response envelope');
  }

  for (const record of payload.result) {
    if (typeof record !== 'object' || record === null) {
      throw new Error('SF service-network API returned a non-object record');
    }

    if (!record.serviceCode || typeof record.serviceCode !== 'string') {
      throw new Error('SF service-network API record is missing serviceCode');
    }

    if (!('address' in record) || !('name' in record)) {
      throw new Error(
        `SF service-network API contract changed for ${record.serviceCode}`
      );
    }
  }
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

    if (result.ok && result.data) {
      try {
        validateServiceNetworkApiPayload(result.data);
        return {
          area,
          language: 'tc',
          ok: true,
          status: result.status,
          attempts: result.attempts,
          error: null,
          rawText: result.rawText,
          raw_sha256: result.raw_sha256,
          records: result.data.result
        };
      } catch (err) {
        console.warn(`  TC API contract check failed: ${area.sourceRegion}/${area.district} — ${err.message}`);
        return {
          area,
          language: 'tc',
          ok: false,
          status: result.status,
          attempts: result.attempts,
          error: err.message,
          rawText: result.rawText,
          raw_sha256: result.raw_sha256,
          records: []
        };
      }
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
      rawText: result.rawText,
      raw_sha256: result.raw_sha256,
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

    if (result.ok && result.data) {
      try {
        validateServiceNetworkApiPayload(result.data);
        return {
          area,
          language: 'en',
          ok: true,
          status: result.status,
          attempts: result.attempts,
          error: null,
          rawText: result.rawText,
          raw_sha256: result.raw_sha256,
          records: result.data.result
        };
      } catch (err) {
        console.warn(`  EN API contract check failed: ${area.sourceRegion}/${area.district} — ${err.message}`);
        return {
          area,
          language: 'en',
          ok: false,
          status: result.status,
          attempts: result.attempts,
          error: err.message,
          rawText: result.rawText,
          raw_sha256: result.raw_sha256,
          records: []
        };
      }
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
      rawText: result.rawText,
      raw_sha256: result.raw_sha256,
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

const SERVICE_CODE_REGEX = /\b(852[A-Z][A-Z0-9]*\d+)\b/g;

/**
 * Split a single PDF text line into isolated single-code segments.
 * Prevents subsequent service codes/addresses from bleeding into earlier records.
 *
 * @param {string} line
 * @returns {Array<{ code: string, segment: string }>}
 */
export function extractLineSegments(line) {
  if (!line) return [];
  const matches = [...line.matchAll(SERVICE_CODE_REGEX)];
  if (matches.length === 0) return [];

  const segments = [];
  for (let idx = 0; idx < matches.length; idx++) {
    const match = matches[idx];
    const code = match[1];

    const startPos = idx === 0 ? 0 : match.index;
    const endPos = idx + 1 < matches.length ? matches[idx + 1].index : line.length;

    const segment = line.slice(startPos, endPos);
    segments.push({ code, segment });
  }

  return segments;
}

/**
 * Validate a candidate partner record extracted from PDF.
 * Checks for embedded service codes, residual '^' separators, placeholder addresses, etc.
 *
 * @param {object} record
 * @param {string} rawSegment
 * @returns {{ valid: boolean, reasonCodes: string[] }}
 */
export function validateParsedPartnerRecord(record, rawSegment) {
  const reasonCodes = [];
  const { serviceCode, name, address } = record;

  if (!serviceCode || !/^852[A-Z][A-Z0-9]*\d+$/.test(serviceCode)) {
    reasonCodes.push('INVALID_SERVICE_CODE');
  }

  const trimmedName = (name || '').trim();
  const trimmedAddr = (address || '').trim();

  if (!trimmedName) reasonCodes.push('EMPTY_NAME');
  if (!trimmedAddr) reasonCodes.push('EMPTY_ADDRESS');

  if (trimmedName && trimmedAddr && trimmedName === trimmedAddr) {
    reasonCodes.push('NAME_EQUALS_ADDRESS');
  }

  const placeholders = ['順豐合作點', 'OK便利店', '合作點', '自取點', '^'];
  if (placeholders.includes(trimmedAddr) || trimmedAddr.startsWith('852')) {
    reasonCodes.push('PLACEHOLDER_ADDRESS');
  }

  const otherCodeRegex = /\b852[A-Z][A-Z0-9]*\d+\b/g;
  if (trimmedName) {
    const nameCodes = [...trimmedName.matchAll(otherCodeRegex)].map(m => m[0]);
    if (nameCodes.some(c => c !== serviceCode)) {
      reasonCodes.push('EMBEDDED_SERVICE_CODE');
    }
  }
  if (trimmedAddr) {
    const addrCodes = [...trimmedAddr.matchAll(otherCodeRegex)].map(m => m[0]);
    if (addrCodes.some(c => c !== serviceCode)) {
      reasonCodes.push('EMBEDDED_SERVICE_CODE');
    }
  }

  if ((trimmedName && trimmedName.includes('^')) || (trimmedAddr && trimmedAddr.includes('^'))) {
    reasonCodes.push('RESIDUAL_SEPARATOR');
  }

  return {
    valid: reasonCodes.length === 0,
    reasonCodes: [...new Set(reasonCodes)]
  };
}

/**
 * Fetch and parse partner PDF records.
 * Non-blocking — errors are collected, not thrown.
 *
 * @returns {Promise<{ records: Array, pdfTotal: number, pdfSuccessCount: number, pdfFailCount: number, status: string, errors: string[], pdfDetails: Array }>}
 */
/**
 * Parse raw PDF documents (text, URLs, and metadata) into structured partner records.
 *
 * @param {Array<{ source_key: string, url: string, http_ok: boolean, attempts: number, text?: string, error?: string, parse_ok?: boolean, parse_error?: string }>} documents
 * @returns {object}
 */
export function parsePartnerPdfDocuments(documents = []) {
  const pdfDetails = [];
  const quarantinedRecords = [];
  const partnerMap = new Map();
  const conflictedCodes = new Set();
  const errors = [];

  let httpSuccessCount = 0;
  let parseSuccessCount = 0;
  let semanticSuccessCount = 0;
  let partialQualityFailureCount = 0;
  let pdfFailCount = 0;
  let crossPdfDuplicateConflictCount = 0;

  const normalizedDocuments = documents.map(doc => ({
    ...doc,
    document_binary_sha256: doc.document_binary_sha256 ?? null,
    extracted_text_sha256: typeof doc.text === 'string' ? sha256(doc.text) : null
  }));

  for (const doc of normalizedDocuments) {
    const { source_key: sourceKey, url, http_ok: httpOk, parse_ok: parseOk, attempts, text, error: docErr, parse_error: parseErr } = doc;
    const documentRetrievedAt = doc.document_retrieved_at || doc.retrieved_at || null;
    const documentBinarySha256 = doc.document_binary_sha256;
    const extractedTextSha256 = doc.extracted_text_sha256;
    if (!httpOk) {
      errors.push(`PDF fetch failed for ${url}: ${docErr || 'HTTP Error'}`);
      pdfFailCount++;
      pdfDetails.push({
        source_key: sourceKey,
        url,
        status: 'http_failure',
        http_ok: false,
        parse_ok: false,
        semantic_ok: false,
        within_quality_threshold: false,
        attempts: attempts || 1,
        raw_code_count: 0,
        candidate_count: 0,
        valid_record_count: 0,
        quarantined_record_count: 0,
        duplicate_code_count: 0,
        duplicate_conflict_count: 0,
        quarantine_ratio: 0
      });
      continue;
    }

    httpSuccessCount++;

    if (parseOk === false || text === null) {
      pdfFailCount++;
      errors.push(`PDF parse failed for ${url}: ${parseErr || docErr || 'Unknown parse error'}`);
      pdfDetails.push({
        source_key: sourceKey,
        url,
        status: 'parse_failure',
        http_ok: true,
        parse_ok: false,
        semantic_ok: false,
        within_quality_threshold: false,
        attempts: attempts || 1,
        raw_code_count: 0,
        candidate_count: 0,
        valid_record_count: 0,
        quarantined_record_count: 0,
        duplicate_code_count: 0,
        duplicate_conflict_count: 0,
        quarantine_ratio: 0
      });
      continue;
    }

    const isOkStore = (url || '').includes('OK_');

    try {
      parseSuccessCount++;
      const parseResult = isOkStore
        ? parseOkPartnerPdfText({ text: text || '', sourceUrl: url })
        : parseAspPartnerPdfText({ text: text || '', sourceUrl: url });

      const { validRecords, quarantinedRecords: fileQuarantined, metrics } = parseResult;
      quarantinedRecords.push(...fileQuarantined.map(record => ({
        ...record,
        provenance: {
          ...(record.provenance || {}),
          source_key: sourceKey,
          source_url: url,
          document_retrieved_at: documentRetrievedAt,
          document_binary_sha256: documentBinarySha256,
          extracted_text_sha256: extractedTextSha256
        }
      })));

      for (const rec of validRecords) {
        rec._source_key = sourceKey;
        rec._source_url = url;
        rec._document_retrieved_at = documentRetrievedAt;
        rec._document_binary_sha256 = documentBinarySha256;
        rec._extracted_text_sha256 = extractedTextSha256;
        if (conflictedCodes.has(rec.serviceCode)) {
          quarantinedRecords.push({
            extractedCode: rec.serviceCode,
            involvedCodes: [rec.serviceCode],
            candidateRecord: rec,
            reasonCodes: ['DUPLICATE_CODE_CONFLICT'],
            provenance: {
              source_key: sourceKey,
              source_url: url,
              document_retrieved_at: documentRetrievedAt,
              document_binary_sha256: documentBinarySha256,
              extracted_text_sha256: extractedTextSha256
            }
          });
          continue;
        }

        const existing = partnerMap.get(rec.serviceCode);
        if (!existing) {
          partnerMap.set(rec.serviceCode, { record: rec, sourceKey, sourceUrl: url });
          continue;
        }

        if (
          existing.record.name === rec.name &&
          existing.record.address === rec.address &&
          existing.record.serviceTime === rec.serviceTime
        ) {
          continue;
        }

        partnerMap.delete(rec.serviceCode);
        conflictedCodes.add(rec.serviceCode);
        crossPdfDuplicateConflictCount++;

        quarantinedRecords.push(
          {
            extractedCode: rec.serviceCode,
            involvedCodes: [rec.serviceCode],
            candidateRecord: existing.record,
            reasonCodes: ['DUPLICATE_CODE_CONFLICT'],
            provenance: {
              source_key: existing.sourceKey,
              source_url: existing.sourceUrl,
              document_retrieved_at: existing.record._document_retrieved_at || null,
              document_binary_sha256: existing.record._document_binary_sha256 || null,
              extracted_text_sha256: existing.record._extracted_text_sha256 || null
            }
          },
          {
            extractedCode: rec.serviceCode,
            involvedCodes: [rec.serviceCode],
            candidateRecord: rec,
            reasonCodes: ['DUPLICATE_CODE_CONFLICT'],
            provenance: {
              source_key: sourceKey,
              source_url: url,
              document_retrieved_at: documentRetrievedAt,
              document_binary_sha256: documentBinarySha256,
              extracted_text_sha256: extractedTextSha256
            }
          }
        );
      }

      const totalFileCandidates = metrics.validCount + metrics.quarantineCount;
      const fileQuarantineRatio = totalFileCandidates > 0 ? metrics.quarantineCount / totalFileCandidates : 0;

      const semanticClean = metrics.quarantineCount === 0;
      const withinQualityThreshold = fileQuarantineRatio <=
        PDF_PARSE_QUALITY_CONFIG.perPdfQuarantineBlockPct / 100;

      let pdfStatus = 'success';

      if (metrics.validCount === 0 && metrics.rawCodeCount === 0) {
        pdfStatus = 'zero_records_parsed';
      } else if (metrics.quarantineCount > 0) {
        pdfStatus = 'partial_parse_quality_failure';
        partialQualityFailureCount++;
      }

      if (semanticClean) {
        semanticSuccessCount++;
      }

      pdfDetails.push({
        source_key: sourceKey,
        url,
        status: pdfStatus,
        http_ok: true,
        parse_ok: true,
        semantic_ok: semanticClean,
        within_quality_threshold: withinQualityThreshold,
        attempts: attempts || 1,
        raw_code_count: metrics.rawCodeCount,
        candidate_count: totalFileCandidates,
        valid_record_count: metrics.validCount,
        quarantined_record_count: metrics.quarantineCount,
        duplicate_code_count: metrics.duplicateCodeCount,
        duplicate_conflict_count: metrics.duplicateConflictCount,
        quarantine_ratio: Number(fileQuarantineRatio.toFixed(4))
      });
    } catch (e) {
      const errMsg = `PDF parse error (${url}): ${e.message}`;
      errors.push(errMsg);
      pdfFailCount++;
      pdfDetails.push({
        source_key: sourceKey,
        url,
        status: 'parse_failure',
        http_ok: true,
        parse_ok: false,
        semantic_ok: false,
        within_quality_threshold: false,
        attempts: attempts || 1,
        raw_code_count: 0,
        candidate_count: 0,
        valid_record_count: 0,
        quarantined_record_count: 0,
        duplicate_code_count: 0,
        duplicate_conflict_count: 0,
        quarantine_ratio: 0
      });
    }
  }

  const validPartnerRecords = [...partnerMap.values()].map(v => v.record);
  const totalQuarantined = quarantinedRecords.length;

  let overallStatus = 'success';
  if (documents.length === 0) {
    overallStatus = 'no_pdfs_discovered';
  } else if (httpSuccessCount === 0) {
    overallStatus = 'all_pdfs_failed';
  } else if (pdfFailCount > 0) {
    overallStatus = 'partial_pdf_failures';
  } else if (validPartnerRecords.length === 0) {
    overallStatus = 'zero_records_parsed';
  } else if (totalQuarantined > 0) {
    overallStatus = 'partial_parse_quality_failure';
  }

  return {
    records: validPartnerRecords,
    documents: normalizedDocuments,
    pdfTotal: documents.length,
    httpSuccessCount,
    parseSuccessCount,
    semanticSuccessCount,
    partialQualityFailureCount,
    failedCount: pdfFailCount,
    pdfSuccessCount: httpSuccessCount,
    pdfFailCount,
    cross_pdf_duplicate_conflict_count: crossPdfDuplicateConflictCount,
    status: overallStatus,
    errors,
    pdfDetails,
    quarantinedRecords
  };
}

/**
 * Discover and parse official SF Express HK partner location PDFs.
 *
 * @returns {Promise<object>}
 */
export async function fetchPartnerPdfs() {
  const discoveryRes = await fetchWithRetry(PARTNER_PDF_DIRECTORY_URL, {}, { responseType: 'text' });
  const partnerPdfs = discoveryRes.ok ? extractPdfUrlsFromHtml(discoveryRes.data) : [];

  console.log(`Fetching official Service Partner PDFs...`);
  console.log(`  Discovered ${partnerPdfs.length} HK partner PDFs.`);

  const pdfDocuments = [];

  for (const url of partnerPdfs) {
    const filename = url.split('/').pop() || '';
    const sourceKeyMatch = filename.match(/^(OK_[A-Z]+_TC|ASP_[A-Z]+_TC)/i);
    const sourceKey = sourceKeyMatch ? sourceKeyMatch[1].toUpperCase() : filename.replace(/\.pdf$/i, '');

    const pdfRes = await fetchWithRetry(url, {}, { responseType: 'arrayBuffer' });

    if (!pdfRes.ok) {
      pdfDocuments.push({
        source_key: sourceKey,
        url,
        http_ok: false,
        attempts: pdfRes.attempts,
        error: pdfRes.error
      });
      continue;
    }

    try {
      const buffer = pdfRes.data;
      const data = await parsePdfBuffer(buffer);
      pdfDocuments.push({
        source_key: sourceKey,
        url,
        http_ok: true,
        parse_ok: true,
        attempts: pdfRes.attempts,
        text: data.text || '',
        document_retrieved_at: new Date().toISOString(),
        document_binary_sha256: sha256(Buffer.from(buffer)),
        extracted_text_sha256: sha256(data.text || '')
      });
    } catch (e) {
      pdfDocuments.push({
        source_key: sourceKey,
        url,
        http_ok: true,
        parse_ok: false,
        attempts: pdfRes.attempts,
        parse_error: e.message,
        text: null,
        document_retrieved_at: new Date().toISOString(),
        document_binary_sha256: sha256(Buffer.from(pdfRes.data)),
        extracted_text_sha256: null
      });
    }
  }

  const result = parsePartnerPdfDocuments(pdfDocuments);
  const totalQuarantined = result.quarantinedRecords.length;
  const totalCandidates = result.records.length + totalQuarantined;
  const overallQuarantineRatio = totalCandidates > 0 ? totalQuarantined / totalCandidates : 0;

  console.log(`  PDF: ${result.httpSuccessCount}/${result.pdfTotal} HTTP OK, ${result.parseSuccessCount}/${result.pdfTotal} parsed, ${result.semanticSuccessCount}/${result.pdfTotal} semantic OK (${result.status}), ${result.records.length} valid records, ${totalQuarantined} quarantined (${(overallQuarantineRatio * 100).toFixed(1)}%)`);

  return result;
}
