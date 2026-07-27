// @ts-check

/**
 * Pure audit function for live partner PDF records against canonical sources.
 *
 * @param {object} params
 * @param {Map<string, object>} [params.tcMap] - TC API records map
 * @param {Array<object>} [params.ssrList] - SSR records list
 * @param {Array<object>} [params.reviewedPdfList] - Reviewed PDF partner registry list
 * @param {Array<object>} [params.parsedPdfRecords] - Valid parsed live PDF records
 * @param {Array<object>} [params.quarantinedRecords] - Quarantined PDF records
 * @param {string} [params.sourceRetrievedAt] - Source retrieval HKT timestamp
 * @param {string} [params.generatedAt] - Audit artifact generation HKT timestamp
 * @returns {object} PDF audit artifact data
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
  const reviewedMap = new Map(reviewedPdfList.map(item => [item.code, item]));

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

    // Case A — Code exists in TC API
    if (apiItem) {
      const differingFields = [];
      if ((apiItem.name || '').trim() !== (pdfRec.name || '').trim()) differingFields.push('name');
      if ((apiItem.address || '').trim() !== (pdfRec.address || '').trim()) differingFields.push('address');
      if ((apiItem.serviceTime || '').trim() !== (pdfRec.serviceTime || '').trim()) differingFields.push('business_hours');

      if (differingFields.length > 0) {
        apiPdfConflicts.push({
          code,
          api_name: apiItem.name || null,
          pdf_name: pdfRec.name || null,
          api_address: apiItem.address || null,
          pdf_address: pdfRec.address || null,
          api_business_hours: apiItem.serviceTime || null,
          pdf_business_hours: pdfRec.serviceTime || null,
          differing_fields: differingFields
        });
      }
      continue;
    }

    // Case B — Code exists in reviewed registry
    if (reviewedItem) {
      const differingFields = [];
      if ((reviewedItem.name || '').trim() !== (pdfRec.name || '').trim()) differingFields.push('name');
      if ((reviewedItem.address || '').trim() !== (pdfRec.address || '').trim()) differingFields.push('address');
      if ((reviewedItem.business_hours || '').trim() !== (pdfRec.serviceTime || '').trim()) differingFields.push('business_hours');

      if (differingFields.length > 0) {
        reviewedPdfDrift.push({
          code,
          reviewed_name: reviewedItem.name || null,
          pdf_name: pdfRec.name || null,
          reviewed_address: reviewedItem.address || null,
          pdf_address: pdfRec.address || null,
          reviewed_business_hours: reviewedItem.business_hours || null,
          pdf_business_hours: pdfRec.serviceTime || null,
          differing_fields: differingFields
        });
      }
      continue;
    }

    // Case C — Code is absent from API, SSR and reviewed registry
    if (!ssrCodes.has(code)) {
      newPdfOnlyCandidates.push({
        code,
        name: pdfRec.name || '順豐合作點',
        address: pdfRec.address || null,
        district: pdfRec.district || null,
        sub_district: pdfRec.city || pdfRec.district || null,
        business_hours: pdfRec.serviceTime || null,
        source_url: pdfRec._source_url || null
      });
    }
  }

  // Case D — Reviewed record is not present in current live PDF
  const missingReviewedRecords = [];
  for (const reviewedItem of reviewedPdfList) {
    if (!livePdfCodes.has(reviewedItem.code)) {
      missingReviewedRecords.push({
        code: reviewedItem.code,
        name: reviewedItem.name || null,
        address: reviewedItem.address || null
      });
    }
  }

  // Case E — Quarantined records formatting
  const formattedQuarantine = quarantinedRecords.map(q => ({
    extractedCode: q.extractedCode ?? null,
    involvedCodes: q.involvedCodes?.length > 0 ? q.involvedCodes : [q.extractedCode].filter(Boolean),
    rawSegment: q.rawSegment || q.provenance?.raw_row || '',
    candidateRecord: q.candidateRecord || null,
    reasonCodes: q.reasonCodes || [],
    provenance: q.provenance || {}
  }));

  return {
    source_retrieved_at: sourceRetrievedAt,
    generated_at: generatedAt,
    summary: {
      parsed_pdf_record_count: parsedPdfRecords.length,
      api_pdf_conflict_count: apiPdfConflicts.length,
      reviewed_pdf_drift_count: reviewedPdfDrift.length,
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
