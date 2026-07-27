// @ts-check

import {
  groupPdfLinesIntoRows,
  cleanBusinessHours,
  extractRowCodeEvidence,
  validateParsedPartnerRecord,
  extractSubdistrictAndShopName,
  createQuarantineEntry
} from './common.js';

export { extractSubdistrictAndShopName };

/**
 * Parse OK Convenience Store PDF text into structured records.
 *
 * @param {object} params
 * @param {string} params.text - Extracted text from pdf-parse
 * @param {string} params.sourceUrl - Source URL of the PDF
 * @returns {{
 *   validRecords: Array,
 *   quarantinedRecords: Array,
 *   metrics: {
 *     rawCodeCount: number,
 *     candidateCount: number,
 *     validCount: number,
 *     quarantineCount: number,
 *     duplicateCodeCount: number,
 *     duplicateConflictCount: number
 *   }
 * }}
 */
export function parseOkPartnerPdfText({ text, sourceUrl }) {
  const validRecords = [];
  const quarantinedRecords = [];
  const seenCodesMap = new Map();

  let rawCodeCount = 0;
  let duplicateCodeCount = 0;
  let duplicateConflictCount = 0;

  const grouped = groupPdfLinesIntoRows(text);

  for (let idx = 0; idx < grouped.length; idx++) {
    const { rawRow, incomplete } = grouped[idx];
    const codeEvidence = extractRowCodeEvidence(rawRow);
    rawCodeCount += codeEvidence.allCodes.length;

    const provenance = {
      source_url: sourceUrl,
      row_index: idx + 1,
      raw_row: rawRow,
      parsed_fields: null
    };

    if (incomplete) {
      quarantinedRecords.push(createQuarantineEntry({
        rawRow,
        candidateRecord: null,
        reasonCodes: ['INCOMPLETE_RECORD_PREFIX'],
        provenance,
        codeEvidence
      }));
      continue;
    }

    const serviceCode = codeEvidence.visibleCode ?? codeEvidence.caretCode;

    if (!serviceCode) {
      quarantinedRecords.push(createQuarantineEntry({
        rawRow,
        candidateRecord: null,
        reasonCodes: ['INVALID_SERVICE_CODE'],
        provenance,
        codeEvidence
      }));
      continue;
    }

    const delimiterCode = codeEvidence.caretCode ?? serviceCode;
    const delimiter = `^${delimiterCode}^`;

    let subdistrict = '';
    let name = '';
    let address = '';
    let businessHours = null;

    if (rawRow.includes(delimiter)) {
      const [beforeDelimiter, ...afterParts] = rawRow.split(delimiter);
      const afterDelimiter = afterParts.join(delimiter);

      const visibleIndex = beforeDelimiter.indexOf(serviceCode);
      if (visibleIndex >= 0) {
        const prefix = beforeDelimiter.slice(0, visibleIndex);
        const suffix = beforeDelimiter.slice(visibleIndex + serviceCode.length);
        const extracted = extractSubdistrictAndShopName(prefix);
        subdistrict = extracted.subdistrict;
        name = `OK便利店${subdistrict ? ` (${subdistrict})` : ''}`;
        address = suffix.trim();
        businessHours = cleanBusinessHours(afterDelimiter);
      } else {
        const extracted = extractSubdistrictAndShopName(beforeDelimiter);
        subdistrict = extracted.subdistrict;
        name = `OK便利店${subdistrict ? ` (${subdistrict})` : ''}`;
        address = beforeDelimiter.replace(serviceCode, '').replace(/[\^&]/g, '').trim();
        businessHours = cleanBusinessHours(afterDelimiter);
      }
    } else {
      const parts = rawRow.split(serviceCode);
      const prefixStr = parts[0] || '';
      const extracted = extractSubdistrictAndShopName(prefixStr);
      subdistrict = extracted.subdistrict;
      name = `OK便利店${subdistrict ? ` (${subdistrict})` : ''}`;

      const rest = parts.slice(1).join(serviceCode);
      const addrAndHours = rest.split('^').map(s => s.trim());
      address = (addrAndHours[0] || '').replace(/[\^&]/g, '').trim();
      businessHours = cleanBusinessHours(addrAndHours.slice(1).join('^'));
    }

    address = address.replace(/^[\s\^&]+/, '').replace(/[\s\^&]+$/, '');

    const candidateRecord = {
      serviceCode,
      name,
      address,
      district: subdistrict || null,
      city: subdistrict || null,
      serviceTime: businessHours,
      isPartner: true,
      _source: 'pdf_partner',
      _source_url: sourceUrl
    };

    provenance.parsed_fields = {
      name,
      code: serviceCode,
      address,
      business_hours: businessHours
    };

    const validation = validateParsedPartnerRecord(candidateRecord, rawRow, codeEvidence);

    if (!validation.valid) {
      quarantinedRecords.push(createQuarantineEntry({
        rawRow,
        candidateRecord,
        reasonCodes: validation.reasonCodes,
        provenance,
        codeEvidence
      }));
      continue;
    }

    if (seenCodesMap.has(serviceCode)) {
      duplicateCodeCount++;
      const existing = seenCodesMap.get(serviceCode);
      const isIdentical =
        existing.record.name === candidateRecord.name &&
        existing.record.address === candidateRecord.address &&
        existing.record.serviceTime === candidateRecord.serviceTime;

      if (!isIdentical) {
        duplicateConflictCount++;
        quarantinedRecords.push(createQuarantineEntry({
          rawRow,
          candidateRecord,
          reasonCodes: ['DUPLICATE_CODE_CONFLICT'],
          provenance,
          codeEvidence
        }));
      }
      continue;
    }

    seenCodesMap.set(serviceCode, { record: candidateRecord, provenance });
    validRecords.push(candidateRecord);
  }

  const candidateCount = validRecords.length + quarantinedRecords.length;

  return {
    validRecords,
    quarantinedRecords,
    metrics: {
      rawCodeCount,
      candidateCount,
      validCount: validRecords.length,
      quarantineCount: quarantinedRecords.length,
      duplicateCodeCount,
      duplicateConflictCount
    }
  };
}
