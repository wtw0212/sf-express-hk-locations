// @ts-check

import { groupPdfLinesIntoRows, cleanBusinessHours, validateRawRow } from './common.js';

/**
 * Parse OK Convenience Store partner PDF text into structured records.
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

  const grouped = groupPdfLinesIntoRows(text, { isOk: true });

  for (let idx = 0; idx < grouped.length; idx++) {
    const { rawRow } = grouped[idx];
    const codesInRow = [...rawRow.matchAll(/\b(852[A-Z][A-Z0-9]*\d+)\b/g)].map(m => m[1]);
    rawCodeCount += codesInRow.length;

    if (codesInRow.length === 0) continue;

    // Determine primary service code (prefer code inside ^code^ delimiter if present)
    const caretMatch = rawRow.match(/\^(852[A-Z][A-Z0-9]*\d+)\^/);
    const serviceCode = caretMatch ? caretMatch[1] : codesInRow[0];

    const rawValidation = validateRawRow(rawRow, serviceCode);

    // Split around ^serviceCode^ or serviceCode
    let subDistrict = '';
    let address = '';
    let businessHours = null;

    if (caretMatch) {
      const caretDelim = `^${serviceCode}^`;
      const parts = rawRow.split(caretDelim);

      const beforeCaret = parts[0] || '';
      businessHours = cleanBusinessHours(parts.slice(1).join(caretDelim));

      // Extract subdistrict and address from beforeCaret
      const codeIndex = beforeCaret.indexOf(serviceCode);
      if (codeIndex !== -1) {
        subDistrict = beforeCaret.slice(0, codeIndex).replace(/^服務時間[^\n]*\)\s*/, '').trim();
        address = beforeCaret.slice(codeIndex + serviceCode.length).replace(/\^/g, '').trim();
      } else {
        // Fallback if first code was different
        const firstCode = codesInRow[0];
        const fcIdx = beforeCaret.indexOf(firstCode);
        if (fcIdx !== -1) {
          subDistrict = beforeCaret.slice(0, fcIdx).replace(/^服務時間[^\n]*\)\s*/, '').trim();
          address = beforeCaret.slice(fcIdx + firstCode.length).replace(/\^/g, '').trim();
        } else {
          address = beforeCaret.replace(/\^/g, '').trim();
        }
      }
    } else {
      const parts = rawRow.split(serviceCode);
      subDistrict = (parts[0] || '').replace(/^服務時間[^\n]*\)\s*/, '').replace(/\^/g, '').trim();
      const rest = parts.slice(1).join(serviceCode);
      const addrAndHours = rest.split('^').map(s => s.trim());
      address = (addrAndHours[0] || '').replace(/\^/g, '').trim();
      businessHours = cleanBusinessHours(addrAndHours.slice(1).join('^'));
    }

    // Clean address of any residual leading/trailing noise
    address = address.replace(/^[\s\^]+/, '').replace(/[\s\^]+$/, '');

    // Construct candidate record
    const name = `OK便利店${subDistrict ? ` (${subDistrict})` : ''}`;
    const candidateRecord = {
      serviceCode,
      name,
      address,
      district: subDistrict || null,
      city: subDistrict || null,
      serviceTime: businessHours,
      isPartner: true,
      _source: 'pdf_partner',
      _source_url: sourceUrl
    };

    const provenance = {
      source_url: sourceUrl,
      row_index: idx + 1,
      raw_row: rawRow,
      parsed_fields: {
        name,
        code: serviceCode,
        address,
        business_hours: businessHours
      }
    };

    // Candidate validation
    const reasonCodes = [];
    if (!rawValidation.valid) reasonCodes.push(...rawValidation.errors);
    if (!address) reasonCodes.push('EMPTY_ADDRESS');
    if (!name) reasonCodes.push('EMPTY_NAME');
    if (address && address.includes('^')) reasonCodes.push('RESIDUAL_SEPARATOR');
    if (name && name.includes('^')) reasonCodes.push('RESIDUAL_SEPARATOR');

    // Embedded code check
    const otherCodes = codesInRow.filter(c => c !== serviceCode);
    if (otherCodes.length > 0) {
      if (address && otherCodes.some(c => address.includes(c))) {
        reasonCodes.push('EMBEDDED_SERVICE_CODE');
      }
    }

    const isValid = reasonCodes.length === 0;

    if (!isValid) {
      quarantinedRecords.push({
        extractedCode: serviceCode,
        rawSegment: rawRow,
        candidateRecord,
        reasonCodes: [...new Set(reasonCodes)],
        provenance
      });
      continue;
    }

    // Duplicate detection and conflict resolution
    if (seenCodesMap.has(serviceCode)) {
      duplicateCodeCount++;
      const existing = seenCodesMap.get(serviceCode);
      const isIdentical =
        existing.record.name === candidateRecord.name &&
        existing.record.address === candidateRecord.address &&
        existing.record.serviceTime === candidateRecord.serviceTime;

      if (!isIdentical) {
        duplicateConflictCount++;
        quarantinedRecords.push({
          extractedCode: serviceCode,
          rawSegment: rawRow,
          candidateRecord,
          reasonCodes: ['DUPLICATE_CODE_CONFLICT'],
          provenance
        });
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
