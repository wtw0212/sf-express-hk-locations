// @ts-check

/**
 * These normalizers are comparison-only. They must never be used to mutate
 * canonical values or reviewed registry entries.
 */
function normalizeTextForComparison(value) {
  return String(value || '')
    .normalize('NFKC')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/[\s]/g, '')
    .replace(/[，、,;；:：()（）\[\]【】「」『』'".]/g, '');
}

function normalizeAddressForComparison(value) {
  return normalizeTextForComparison(value)
    .replace(/[－–—-]/g, '')
    .replace(/平台/g, '平臺')
    .replace(/鋪/g, '舖')
    .replace(/葵湧/g, '葵涌');
}

function normalizeBusinessHoursForComparison(value) {
  return normalizeTextForComparison(value)
    .replace(/24小時|24hours?/gi, '0000-2359')
    .replace(/00:00[-至到]23:59/g, '0000-2359')
    .replace(/[－–—至到]/g, '-')
    .replace(/-2400(?=$|星期|公眾|假期)/g, '-0000');
}

function isRetailerNameSpecificityDifference(canonical, pdf) {
  return ['OK便利店'].some(retailer => canonical.includes(retailer) && pdf.includes(retailer));
}

function compareField(field, canonicalValue, pdfValue) {
  const canonical = canonicalValue || null;
  const pdf = pdfValue || null;
  if (canonical === pdf) return null;

  const normalize = field === 'address'
    ? normalizeAddressForComparison
    : field === 'business_hours'
      ? normalizeBusinessHoursForComparison
      : normalizeTextForComparison;

  const normalizedCanonical = normalize(canonical);
  const normalizedPdf = normalize(pdf);
  const classification = normalizedCanonical === normalizedPdf
    ? (field === 'business_hours' ? 'equivalent_difference' : 'formatting_difference')
    : (field === 'name' && isRetailerNameSpecificityDifference(canonical, pdf)
      ? 'name_specificity_difference'
      : 'semantic_conflict');

  return {
    canonical,
    pdf,
    classification
  };
}

function compareOptionalField(field, canonicalValue, evidenceValue) {
  if (evidenceValue == null || evidenceValue === '') return null;
  return compareField(field, canonicalValue, evidenceValue);
}

function projectApiLocation(item) {
  return {
    district: item.city ?? null,
    sub_district: item.district ?? null
  };
}

function projectReviewedLocation(item) {
  return {
    district: item.district ?? null,
    sub_district: item.sub_district ?? null
  };
}

function projectPdfLocation(item) {
  return {
    // The partner PDF parser does not provide a reliable administrative
    // district. Its city/district fields both represent a sub-district label.
    district: null,
    sub_district: item.city ?? item.district ?? null
  };
}

function classifyEntry(comparison) {
  const values = Object.values(comparison);
  if (values.some(value => value.classification === 'semantic_conflict')) return 'semantic_conflict';
  if (values.some(value => value.classification === 'name_specificity_difference')) return 'name_specificity_difference';
  if (values.some(value => value.classification === 'equivalent_difference')) return 'equivalent_difference';
  return 'formatting_difference';
}

function getPdfEvidence(pdfRec, sourceRetrievedAt) {
  const parserLocation = pdfRec._parser_location || pdfRec._provenance || pdfRec.provenance || null;
  return {
    source_key: pdfRec._source_key || parserLocation?.source_key || null,
    source_url: pdfRec._source_url || parserLocation?.source_url || null,
    document_retrieved_at: pdfRec._document_retrieved_at || sourceRetrievedAt || null,
    document_binary_sha256: pdfRec._document_binary_sha256 || null,
    extracted_text_sha256: pdfRec._extracted_text_sha256 || null,
    parser_location: parserLocation
      ? {
          row_index: parserLocation.row_index ?? null,
          raw_row: parserLocation.raw_row ?? null
        }
      : null
  };
}

function compareCanonicalToPdf(canonicalItem, pdfRec, canonicalHours, canonicalSource) {
  const comparison = {};
  const name = compareField('name', canonicalItem.name, pdfRec.name);
  const address = compareField('address', canonicalItem.address, pdfRec.address);
  const businessHours = compareField('business_hours', canonicalHours, pdfRec.serviceTime);
  const canonicalLocation = canonicalSource === 'reviewed'
    ? projectReviewedLocation(canonicalItem)
    : projectApiLocation(canonicalItem);
  const pdfLocation = projectPdfLocation(pdfRec);
  const district = compareOptionalField('district', canonicalLocation.district, pdfLocation.district);
  const subDistrict = compareOptionalField(
    'sub_district',
    canonicalLocation.sub_district,
    pdfLocation.sub_district
  );
  if (name) comparison.name = name;
  if (address) comparison.address = address;
  if (businessHours) comparison.business_hours = businessHours;
  if (district) comparison.district = district;
  if (subDistrict) comparison.sub_district = subDistrict;
  return comparison;
}

/**
 * Pure audit function for live partner PDF records against canonical sources.
 * PDF records remain audit evidence and never enter canonical normalization.
 */
export function auditPartnerPdfRecords({
  tcMap = new Map(),
  ssrList = [],
  reviewedPdfList = [],
  parsedPdfRecords = [],
  quarantinedRecords = [],
  sourceRetrievedAt = '',
  generatedAt = ''
}) {
  const ssrCodes = new Set(ssrList.map(item => item.serviceCode || item.code).filter(Boolean));
  const reviewedMap = new Map(reviewedPdfList.map(item => [item.code || item.serviceCode, item]));

  const apiPdfConflicts = [];
  const reviewedPdfDrift = [];
  const newPdfOnlyCandidates = [];
  const livePdfCodes = new Set();

  for (const pdfRec of parsedPdfRecords) {
    const code = pdfRec.serviceCode || pdfRec.code;
    if (!code) continue;
    livePdfCodes.add(code);

    const apiItem = tcMap.get(code);
    const reviewedItem = reviewedMap.get(code);
    const evidence = getPdfEvidence(pdfRec, sourceRetrievedAt);

    if (apiItem) {
      const comparison = compareCanonicalToPdf(apiItem, pdfRec, apiItem.serviceTime, 'api');
      if (Object.keys(comparison).length > 0) {
        apiPdfConflicts.push({
          code,
          api_name: apiItem.name || null,
          pdf_name: pdfRec.name || null,
          api_address: apiItem.address || null,
          pdf_address: pdfRec.address || null,
          api_business_hours: apiItem.serviceTime || null,
          pdf_business_hours: pdfRec.serviceTime || null,
          differing_fields: Object.keys(comparison),
          classification: classifyEntry(comparison),
          comparison,
          evidence
        });
      }
      continue;
    }

    if (reviewedItem) {
      const comparison = compareCanonicalToPdf(
        reviewedItem,
        pdfRec,
        reviewedItem.business_hours || reviewedItem.serviceTime,
        'reviewed'
      );
      if (Object.keys(comparison).length > 0) {
        reviewedPdfDrift.push({
          code,
          reviewed_name: reviewedItem.name || null,
          pdf_name: pdfRec.name || null,
          reviewed_address: reviewedItem.address || null,
          pdf_address: pdfRec.address || null,
          reviewed_business_hours: reviewedItem.business_hours || reviewedItem.serviceTime || null,
          pdf_business_hours: pdfRec.serviceTime || null,
          differing_fields: Object.keys(comparison),
          classification: classifyEntry(comparison),
          comparison,
          evidence
        });
      }
      continue;
    }

    if (!ssrCodes.has(code)) {
      newPdfOnlyCandidates.push({
        code,
        name: pdfRec.name || '順豐合作點',
        address: pdfRec.address || null,
        district: projectPdfLocation(pdfRec).district,
        sub_district: projectPdfLocation(pdfRec).sub_district,
        business_hours: pdfRec.serviceTime || null,
        source_url: evidence.source_url,
        evidence
      });
    }
  }

  const missingReviewedRecords = [];
  for (const reviewedItem of reviewedPdfList) {
    const code = reviewedItem.code || reviewedItem.serviceCode;
    if (!livePdfCodes.has(code)) {
      const registryEvidence = reviewedItem._registry_evidence || {};
      missingReviewedRecords.push({
        code,
        name: reviewedItem.name || null,
        address: reviewedItem.address || null,
        evidence: {
          source_key: registryEvidence.source_key || reviewedItem._source_key || null,
          source_url: registryEvidence.reviewed_source_url || reviewedItem._source_url || null,
          document_retrieved_at:
            registryEvidence.reviewed_source_retrieved_at || reviewedItem._reviewed_at || null,
          document_binary_sha256: registryEvidence.reviewed_document_binary_sha256 || null,
          extracted_text_sha256: registryEvidence.reviewed_extracted_text_sha256 || null,
          parser_location: null
        }
      });
    }
  }

  const formattedQuarantine = quarantinedRecords.map(q => ({
    extractedCode: q.extractedCode ?? null,
    involvedCodes: q.involvedCodes?.length > 0 ? q.involvedCodes : [q.extractedCode].filter(Boolean),
    rawSegment: q.rawSegment || q.provenance?.raw_row || '',
    candidateRecord: q.candidateRecord || null,
    reasonCodes: q.reasonCodes || [],
    provenance: q.provenance || {},
    evidence: {
      source_key: q.provenance?.source_key || null,
      source_url: q.provenance?.source_url || null,
      document_retrieved_at: q.provenance?.document_retrieved_at || sourceRetrievedAt || null,
      document_binary_sha256: q.provenance?.document_binary_sha256 || null,
      extracted_text_sha256: q.provenance?.extracted_text_sha256 || null,
      parser_location: q.provenance
        ? { row_index: q.provenance.row_index ?? null, raw_row: q.provenance.raw_row ?? null }
        : null
    }
  }));

  const classifiedDifferences = [...apiPdfConflicts, ...reviewedPdfDrift];
  const entryClassificationCounts = Object.fromEntries(
    ['semantic_conflict', 'name_specificity_difference', 'formatting_difference', 'equivalent_difference'].map(classification => [
      classification,
      classifiedDifferences.filter(item => item.classification === classification).length
    ])
  );
  const fieldClassificationCounts = Object.fromEntries(
    ['semantic_conflict', 'name_specificity_difference', 'formatting_difference', 'equivalent_difference'].map(classification => [
      classification,
      classifiedDifferences.reduce(
        (count, item) => count + Object.values(item.comparison)
          .filter(field => field.classification === classification).length,
        0
      )
    ])
  );
  const apiSemanticConflicts = apiPdfConflicts.filter(
    item => item.classification === 'semantic_conflict'
  );

  return {
    source_retrieved_at: sourceRetrievedAt,
    generated_at: generatedAt,
    summary: {
      parsed_pdf_record_count: parsedPdfRecords.length,
      api_pdf_conflict_count: apiSemanticConflicts.length,
      api_pdf_difference_count: apiPdfConflicts.length,
      reviewed_pdf_drift_count: reviewedPdfDrift.length,
      entry_classification_counts: entryClassificationCounts,
      field_classification_counts: fieldClassificationCounts,
      new_pdf_only_candidate_count: newPdfOnlyCandidates.length,
      missing_reviewed_record_count: missingReviewedRecords.length,
      quarantined_record_count: formattedQuarantine.length
    },
    api_pdf_conflicts: apiPdfConflicts,
    reviewed_pdf_drift: reviewedPdfDrift,
    new_pdf_only_candidates: newPdfOnlyCandidates,
    missing_reviewed_records: missingReviewedRecords,
    quarantined_records: formattedQuarantine
  };
}
