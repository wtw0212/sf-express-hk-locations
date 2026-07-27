// @ts-check
import {
  VALID_DISTRICTS, DISTRICT_TO_REGION, VALID_TYPES, VALID_SOURCES,
  HK_BOUNDING_BOX, MIN_LOCATION_COUNT,
  CATEGORY_ANOMALY_CONFIG, PDF_PARSE_QUALITY_CONFIG, EN_MATCH_RATE_THRESHOLD
} from './constants.js';

/**
 * Validate normalized records against strict dataset schema rules.
 *
 * @param {Array} records
 * @returns {{ errors: string[], warnings: string[] }}
 */
export function validateRecords(records) {
  const errors = [];
  const warnings = [];

  if (!Array.isArray(records)) {
    return { errors: ['Records payload must be an array'], warnings: [] };
  }

  const seenCodes = new Set();
  const duplicateCodes = [];

  for (const r of records) {
    if (!r || typeof r !== 'object') {
      errors.push('Malformed location record object');
      continue;
    }

    // 1. Mandatory code and id equality
    if (!r.code || typeof r.code !== 'string') {
      errors.push('Record has empty or invalid code');
      continue;
    }
    if (!r.id || r.id !== r.code) {
      errors.push(`Record id (${r.id}) does not match code (${r.code})`);
    }
    if (seenCodes.has(r.code)) {
      duplicateCodes.push(r.code);
    }
    seenCodes.add(r.code);

    // 2. Type validation
    if (!VALID_TYPES.includes(r.type)) {
      errors.push(`${r.code}: invalid type '${r.type}'`);
    }
    if (!r.type_name || typeof r.type_name !== 'string') {
      errors.push(`${r.code}: missing required type_name`);
    }
    if (!r.name || typeof r.name !== 'string') {
      errors.push(`${r.code}: missing required name`);
    }

    // 3. Address requirement (stores and lockers must have non-empty address)
    if ((r.type === 'store' || r.type === 'locker') && (!r.address || typeof r.address !== 'string' || !r.address.trim())) {
      errors.push(`${r.code} (${r.type}): missing required address`);
    }

    // 4. Quality flags array requirement
    if (!Array.isArray(r.quality_flags)) {
      errors.push(`${r.code}: missing quality_flags array`);
    }

    // 5. Source & Provenance validation
    if (!VALID_SOURCES.includes(r.source)) {
      errors.push(`${r.code}: invalid source identifier '${r.source}'`);
    }
    if (!r.provenance || typeof r.provenance !== 'object') {
      errors.push(`${r.code}: missing provenance object`);
    } else {
      if (!VALID_SOURCES.includes(r.provenance.name)) {
        errors.push(`${r.code}: invalid provenance.name '${r.provenance.name}'`);
      }
      if (!VALID_SOURCES.includes(r.provenance.address)) {
        errors.push(`${r.code}: invalid provenance.address '${r.provenance.address}'`);
      }
      if (!VALID_SOURCES.includes(r.provenance.district)) {
        errors.push(`${r.code}: invalid provenance.district '${r.provenance.district}'`);
      }
    }

    // 6. Coordinates validation
    if (!r.location || typeof r.location !== 'object') {
      errors.push(`${r.code}: malformed location object`);
    } else {
      const lat = r.location.latitude;
      const lon = r.location.longitude;

      if ((lat == null) !== (lon == null)) {
        errors.push(`${r.code}: latitude and longitude must both be present or both null`);
      }

      if (lat != null) {
        if (typeof lat !== 'number' || !Number.isFinite(lat)) {
          errors.push(`${r.code}: non-finite latitude value: ${lat}`);
        }
      }
      if (lon != null) {
        if (typeof lon !== 'number' || !Number.isFinite(lon)) {
          errors.push(`${r.code}: non-finite longitude value: ${lon}`);
        }
      }

      if (lat != null && lon != null && Number.isFinite(lat) && Number.isFinite(lon)) {
        if (lat < HK_BOUNDING_BOX.latMin || lat > HK_BOUNDING_BOX.latMax ||
            lon < HK_BOUNDING_BOX.lonMin || lon > HK_BOUNDING_BOX.lonMax) {
          errors.push(`${r.code}: coordinates (${lat}, ${lon}) outside HK bounding box`);
        }
      }
    }

    // 7. District and region consistency
    if (r.district && r.region && DISTRICT_TO_REGION[r.district] && DISTRICT_TO_REGION[r.district] !== r.region) {
      errors.push(`${r.code}: district/region mismatch (${r.district} -> ${r.region})`);
    }

    // 8. Non-standard district warning
    if (r.district && !VALID_DISTRICTS.has(r.district)) {
      warnings.push(`${r.code}: non-standard district value '${r.district}'`);
    }
  }

  if (duplicateCodes.length > 0) {
    errors.push(`Duplicate codes found: ${[...new Set(duplicateCodes)].slice(0, 10).join(', ')}`);
  }

  // Check null district ratio
  if (records.length > 0) {
    const nullDistrictCount = records.filter(r => !r.district).length;
    const nullDistrictPct = (nullDistrictCount / records.length) * 100;
    if (nullDistrictPct > 40) {
      warnings.push(`${nullDistrictPct.toFixed(1)}% of records have null district`);
    }
  }

  return { errors, warnings };
}

/**
 * Validate a previously published dataset before allowing pipeline to proceed.
 * Fail closed if previous dataset is invalid or corrupted.
 *
 * @param {Array} previousList
 */
export function validatePreviousDataset(previousList) {
  if (!Array.isArray(previousList)) {
    throw new Error('Published locations.json root must be an array');
  }

  const { errors } = validateRecords(previousList);
  if (errors.length > 0) {
    throw new Error(`Previous published dataset is invalid: ${errors[0]}`);
  }
}

/**
 * Calculate count delta metrics with division-by-zero protection.
 * @param {number} previous
 * @param {number} current
 * @returns {{ previous: number, current: number, delta: number, delta_pct: number }}
 */
function computeCategoryDelta(previous = 0, current = 0) {
  const delta = current - previous;
  const delta_pct = previous > 0 ? (delta / previous) * 100 : 0;
  return {
    previous,
    current,
    delta,
    delta_pct: Number(delta_pct.toFixed(2))
  };
}

/**
 * Check source completeness and category-specific count anomaly gates before publication.
 * Blocks publication if any required gate fails.
 *
 * @param {object} params
 * @param {Array} [params.tcResults] - Per-area TC API results
 * @param {Array} [params.enResults] - Per-area EN API results
 * @param {object} [params.ssrResult] - SSR result object
 * @param {object} [params.pdfResult] - PDF result object
 * @param {Array} params.records - Normalized next records
 * @param {Array|null} params.previousRecords - Previous dataset records
 * @param {object} [params.config] - Configurable category thresholds
 * @returns {{ pass: boolean, errors: string[], warnings: string[], metrics: object }}
 */
export function checkCompletenessGates({
  tcResults = [],
  enResults = [],
  ssrResult = { records: [], errors: [] },
  pdfResult = { records: [], pdfTotal: 0, pdfSuccessCount: 0, pdfFailCount: 0, status: 'success', errors: [] },
  records,
  previousRecords,
  config = {}
}) {
  const errors = [];
  const warnings = [];

  const anomalyConfig = {
    ...CATEGORY_ANOMALY_CONFIG,
    ...config
  };

  const minCount = config.minCount ?? MIN_LOCATION_COUNT;
  const enMatchRateThreshold = config.enMatchRateThreshold ?? EN_MATCH_RATE_THRESHOLD;

  // ─── 1. Partner PDF Gates ───────────────────────────────────────────────
  const pdfConfig = {
    ...PDF_PARSE_QUALITY_CONFIG,
    ...(config.pdfQualityConfig || {})
  };

  const pdfTotal = pdfResult.pdfTotal ?? 0;
  const pdfSuccess = pdfResult.pdfSuccessCount ?? pdfResult.httpSuccessCount ?? 0;
  const pdfFail = pdfResult.pdfFailCount ?? 0;
  const pdfRecordsCount = pdfResult.records?.length ?? 0;

  if (pdfTotal > 0 && pdfSuccess === 0) {
    errors.push(`All partner PDFs failed (${pdfFail}/${pdfTotal} failed)`);
  } else if (pdfTotal > 0 && pdfFail > 0) {
    warnings.push(`Partial partner PDF failures: ${pdfFail}/${pdfTotal} failed`);
  }

  if (pdfTotal > 0 && pdfSuccess > 0 && pdfRecordsCount === 0) {
    errors.push('Partner PDFs succeeded but parsed zero valid records');
  }

  // Quarantine ratio checks
  const quarantinedRecords = pdfResult.quarantinedRecords || [];
  const totalCandidates = pdfRecordsCount + quarantinedRecords.length;
  const overallQuarantineRatioPct = totalCandidates > 0 ? (quarantinedRecords.length / totalCandidates) * 100 : 0;

  if (totalCandidates > 0) {
    if (overallQuarantineRatioPct > pdfConfig.overallQuarantineBlockPct) {
      errors.push(`Partner PDF overall quarantine ratio ${overallQuarantineRatioPct.toFixed(1)}% exceeds blocking threshold ${pdfConfig.overallQuarantineBlockPct}% (${quarantinedRecords.length}/${totalCandidates} quarantined)`);
    } else if (overallQuarantineRatioPct > pdfConfig.overallQuarantineWarnPct) {
      warnings.push(`Partner PDF overall quarantine ratio ${overallQuarantineRatioPct.toFixed(1)}% exceeds warning threshold ${pdfConfig.overallQuarantineWarnPct}% (${quarantinedRecords.length}/${totalCandidates} quarantined)`);
    }
  }

  // Check individual per-PDF status, quarantine ratio, and historical count drop
  const previousMetadata = config.previousMetadata || null;
  const prevPdfDetailsMap = new Map();
  if (previousMetadata?.source_status?.partner_pdf?.details) {
    for (const d of previousMetadata.source_status.partner_pdf.details) {
      if (d.source_key) prevPdfDetailsMap.set(d.source_key, d);
    }
  }

  if (pdfResult.pdfDetails && pdfResult.pdfDetails.length > 0) {
    for (const detail of pdfResult.pdfDetails) {
      if (detail.status === 'zero_records_parsed') {
        errors.push(`Partner PDF parsed zero records: ${detail.url}`);
      }

      const qRatioPct = (detail.quarantine_ratio ?? 0) * 100;
      if (qRatioPct > pdfConfig.perPdfQuarantineBlockPct) {
        errors.push(`Partner PDF '${detail.source_key}' quarantine ratio ${qRatioPct.toFixed(1)}% exceeds blocking threshold ${pdfConfig.perPdfQuarantineBlockPct}%`);
      } else if (qRatioPct > pdfConfig.perPdfQuarantineWarnPct) {
        warnings.push(`Partner PDF '${detail.source_key}' quarantine ratio ${qRatioPct.toFixed(1)}% exceeds warning threshold ${pdfConfig.perPdfQuarantineWarnPct}%`);
      }

      // Per-PDF historical baseline check
      const prevDetail = prevPdfDetailsMap.get(detail.source_key);
      if (prevDetail && prevDetail.valid_record_count > 0) {
        const prevCount = prevDetail.valid_record_count;
        const currCount = detail.valid_record_count ?? 0;
        const dropPct = ((prevCount - currCount) / prevCount) * 100;

        if (dropPct > pdfConfig.validCountDropBlockPct) {
          errors.push(`Partner PDF '${detail.source_key}' valid record count dropped by ${dropPct.toFixed(1)}% (${prevCount} -> ${currCount}), blocking threshold: ${pdfConfig.validCountDropBlockPct}%`);
        } else if (dropPct > pdfConfig.validCountDropWarnPct) {
          warnings.push(`Partner PDF '${detail.source_key}' valid record count dropped by ${dropPct.toFixed(1)}% (${prevCount} -> ${currCount}), warning threshold: ${pdfConfig.validCountDropWarnPct}%`);
        }
      }
    }
  }

  // Quarantine checks: block publication if severe corrupted or duplicate conflict records were quarantined
  if (quarantinedRecords.length > 0) {
    const severeReasons = ['EMBEDDED_SERVICE_CODE', 'RESIDUAL_SEPARATOR', 'PLACEHOLDER_ADDRESS', 'NAME_EQUALS_ADDRESS', 'DUPLICATE_CODE_CONFLICT'];
    const severeQuarantined = quarantinedRecords.filter(q => q.reasonCodes.some(r => severeReasons.includes(r)));

    if (severeQuarantined.length > 0) {
      errors.push(`Publication blocked due to ${severeQuarantined.length} corrupted partner PDF records in quarantine (reasons: ${[...new Set(severeQuarantined.flatMap(q => q.reasonCodes))].join(', ')})`);
    }
  }

  // Append supplementary errors to gate warnings/errors
  if (pdfResult.errors && pdfResult.errors.length > 0) {
    pdfResult.errors.forEach(e => warnings.push(`[PDF Source] ${e}`));
  }
  if (ssrResult.errors && ssrResult.errors.length > 0) {
    ssrResult.errors.forEach(e => warnings.push(`[SSR Source] ${e}`));
  }

  // ─── 2. TC API Gate ─────────────────────────────────────────────────────
  const tcTotal = tcResults?.length ?? 0;
  const tcSuccess = tcResults?.filter(r => r.ok).length ?? 0;
  const tcFailed = tcTotal - tcSuccess;

  if (tcFailed > 0) {
    const failedAreas = tcResults.filter(r => !r.ok).map(r =>
      `${r.area?.sourceRegion}/${r.area?.district} (${r.error})`
    );
    errors.push(`${tcFailed} TC API areas failed: ${failedAreas.join('; ')}`);
  }

  // ─── 3. EN API Gate ─────────────────────────────────────────────────────
  const enTotal = enResults?.length ?? 0;
  const enSuccess = enResults?.filter(r => r.ok).length ?? 0;
  const enFailed = enTotal - enSuccess;

  if (enFailed > 0) {
    const failedAreas = enResults.filter(r => !r.ok).map(r =>
      `${r.area?.sourceRegion}/${r.area?.district} (${r.error})`
    );
    errors.push(`${enFailed} EN API areas failed: ${failedAreas.join('; ')}`);
  }

  // ─── 4. EN Match Rate ───────────────────────────────────────────────────
  const tcCodes = new Set();
  for (const r of (tcResults ?? [])) {
    for (const item of (r.records ?? [])) {
      const code = item.serviceCode || item.code;
      if (code) tcCodes.add(code);
    }
  }
  const enCodes = new Set();
  for (const r of (enResults ?? [])) {
    for (const item of (r.records ?? [])) {
      const code = item.serviceCode || item.code;
      if (code) enCodes.add(code);
    }
  }

  const matchedCodes = [...tcCodes].filter(c => enCodes.has(c)).length;
  const enMatchRate = tcCodes.size > 0 ? matchedCodes / tcCodes.size : 0;

  if (enMatchRate < enMatchRateThreshold) {
    errors.push(
      `EN match rate ${(enMatchRate * 100).toFixed(1)}% is below threshold ${(enMatchRateThreshold * 100).toFixed(1)}%`
    );
  }

  // ─── 5. Category-Specific Anomaly Gates ─────────────────────────────
  const currentCount = records.length;
  if (currentCount < minCount) {
    errors.push(`Record count ${currentCount} is below minimum required ${minCount}`);
  }

  const currCounts = {
    total: currentCount,
    stores: records.filter(r => r.type === 'store').length,
    lockers: records.filter(r => r.type === 'locker').length,
    partners: records.filter(r => r.type === 'partner').length,
    tcCodes: tcCodes.size,
    enCodes: enCodes.size
  };

  const baselineAvailable = previousRecords != null && previousRecords.length > 0;

  const prevCounts = {
    total: baselineAvailable ? previousRecords.length : 0,
    stores: baselineAvailable ? previousRecords.filter(r => r.type === 'store').length : 0,
    lockers: baselineAvailable ? previousRecords.filter(r => r.type === 'locker').length : 0,
    partners: baselineAvailable ? previousRecords.filter(r => r.type === 'partner').length : 0,
    tcCodes: previousMetadata?.coverage?.tc_record_count ?? null,
    enCodes: previousMetadata?.coverage?.en_record_count ?? null
  };

  const countDeltas = {};
  for (const cat of ['total', 'stores', 'lockers', 'partners', 'tcCodes', 'enCodes']) {
    const prevVal = prevCounts[cat];
    const currVal = currCounts[cat];
    const isCatAvailable = (cat === 'tcCodes' || cat === 'enCodes')
      ? (prevVal !== null && prevVal !== undefined)
      : baselineAvailable;

    const sourceInfo = (cat === 'tcCodes' || cat === 'enCodes')
      ? (prevVal !== null ? `previous_metadata.coverage.${cat === 'tcCodes' ? 'tc_record_count' : 'en_record_count'}` : 'unavailable')
      : (baselineAvailable ? 'previous_locations_feed' : 'unavailable');

    const deltaInfo = computeCategoryDelta(isCatAvailable ? prevVal : 0, currVal);
    deltaInfo.baseline_available = isCatAvailable;
    deltaInfo.baseline_source = sourceInfo;
    deltaInfo.gate_result = 'pass';

    if (isCatAvailable && prevVal > 0) {
      const cfg = anomalyConfig[cat] || anomalyConfig.total;
      const dropPct = -deltaInfo.delta_pct;
      if (dropPct > cfg.dropBlockPct) {
        deltaInfo.gate_result = 'block';
        errors.push(`Category '${cat}' count dropped by ${dropPct.toFixed(1)}% (${prevVal} -> ${currVal}), blocking threshold: ${cfg.dropBlockPct}%`);
      } else if (deltaInfo.delta_pct > cfg.increaseBlockPct) {
        deltaInfo.gate_result = 'block';
        errors.push(`Category '${cat}' count increased by ${deltaInfo.delta_pct.toFixed(1)}% (${prevVal} -> ${currVal}), blocking threshold: ${cfg.increaseBlockPct}%`);
      } else if (deltaInfo.delta_pct > cfg.increaseWarnPct) {
        deltaInfo.gate_result = 'warn';
        warnings.push(`Category '${cat}' count increased by ${deltaInfo.delta_pct.toFixed(1)}% (${prevVal} -> ${currVal}), warning threshold: ${cfg.increaseWarnPct}%`);
      }
    } else if (!isCatAvailable && (cat === 'tcCodes' || cat === 'enCodes')) {
      warnings.push(`Category '${cat}' baseline comparison skipped: previous metadata unavailable`);
    }

    countDeltas[cat] = deltaInfo;
  }

  const metrics = {
    tc_areas_total: tcTotal,
    tc_areas_success: tcSuccess,
    tc_areas_failed: tcFailed,
    en_areas_total: enTotal,
    en_areas_success: enSuccess,
    en_areas_failed: enFailed,
    pdf_total: pdfTotal,
    pdf_success: pdfSuccess,
    pdf_failed: pdfFail,
    tc_unique_codes: tcCodes.size,
    en_unique_codes: enCodes.size,
    en_match_rate: enMatchRate,
    current_count: currentCount,
    previous_count: previousRecords?.length ?? 0,
    count_deltas: countDeltas
  };

  return { pass: errors.length === 0, errors, warnings, metrics };
}

/**
 * Validate cross-file record consistency before publication.
 *
 * @param {Array} records - All locations
 * @param {Array} stores - Stores array
 * @param {Array} lockers - Lockers array
 * @param {Array} partners - Partners array
 * @param {object} byDistrict - By district mapping
 * @param {object} metadata - Metadata object
 */
export function validateCrossFile(records, stores, lockers, partners, byDistrict, metadata) {
  const errors = [];

  // 1. Total length equation
  if (records.length !== stores.length + lockers.length + partners.length) {
    errors.push(`Cross-file count mismatch: locations (${records.length}) != stores (${stores.length}) + lockers (${lockers.length}) + partners (${partners.length})`);
  }

  // 2. All categorized records must be in main records set
  const recordCodeSet = new Set(records.map(r => r.code));
  for (const s of stores) {
    if (!recordCodeSet.has(s.code)) errors.push(`Store ${s.code} missing from locations.json`);
  }
  for (const l of lockers) {
    if (!recordCodeSet.has(l.code)) errors.push(`Locker ${l.code} missing from locations.json`);
  }
  for (const p of partners) {
    if (!recordCodeSet.has(p.code)) errors.push(`Partner ${p.code} missing from locations.json`);
  }

  // 3. By-district membership consistency
  let districtRecordCount = 0;
  const seenInDistrict = new Set();
  for (const [district, list] of Object.entries(byDistrict)) {
    for (const r of list) {
      if (seenInDistrict.has(r.code)) {
        errors.push(`Record ${r.code} appears multiple times across by-district lists`);
      }
      seenInDistrict.add(r.code);
      districtRecordCount++;
    }
  }
  if (districtRecordCount !== records.length) {
    errors.push(`By-district record count (${districtRecordCount}) does not match total locations count (${records.length})`);
  }

  // 4. Metadata counts match
  if (metadata.counts.total !== records.length) {
    errors.push(`Metadata total count (${metadata.counts.total}) does not match locations count (${records.length})`);
  }
  if (metadata.counts.stores !== stores.length) {
    errors.push(`Metadata stores count (${metadata.counts.stores}) does not match stores count (${stores.length})`);
  }
  if (metadata.counts.lockers !== lockers.length) {
    errors.push(`Metadata lockers count (${metadata.counts.lockers}) does not match lockers count (${lockers.length})`);
  }
  if (metadata.counts.partners !== partners.length) {
    errors.push(`Metadata partners count (${metadata.counts.partners}) does not match partners count (${partners.length})`);
  }

  if (errors.length > 0) {
    throw new Error(`Cross-file validation failed:\n${errors.join('\n')}`);
  }
}
