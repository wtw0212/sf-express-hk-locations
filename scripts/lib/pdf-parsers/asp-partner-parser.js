// @ts-check

import { groupPdfLinesIntoRows, cleanBusinessHours, validateRawRow, SUBDISTRICT_PREFIXES } from './common.js';

/**
 * Extract subdistrict and shop name from ASP partner string (e.g. "北角名豐大藥房" -> subdistrict: "北角", name: "名豐大藥房").
 *
 * @param {string} rawPrefix
 * @returns {{ subdistrict: string, name: string }}
 */
export function extractSubdistrictAndShopName(rawPrefix) {
  let text = (rawPrefix || '').replace(/^服務時間[^\n]*\)\s*/, '').replace(/[\^&]/g, '').trim();

  // Strip any embedded service codes if present
  text = text.replace(/\b852[A-Z][A-Z0-9]*\d+\b/g, '').trim();

  let matchedSub = '';
  for (const sub of SUBDISTRICT_PREFIXES) {
    if (text.startsWith(sub)) {
      matchedSub = sub;
      text = text.slice(sub.length).trim();
      break;
    }
  }

  const name = text || (matchedSub ? `${matchedSub}合作點` : '順豐合作點');
  return { subdistrict: matchedSub, name };
}

/**
 * Parse ASP (Authorized Service Partner) PDF text into structured records.
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
export function parseAspPartnerPdfText({ text, sourceUrl }) {
  const validRecords = [];
  const quarantinedRecords = [];
  const seenCodesMap = new Map();

  let rawCodeCount = 0;
  let duplicateCodeCount = 0;
  let duplicateConflictCount = 0;

  const grouped = groupPdfLinesIntoRows(text, { isAsp: true });

  for (let idx = 0; idx < grouped.length; idx++) {
    const { rawRow } = grouped[idx];
    const codesInRow = [...rawRow.matchAll(/\b(852[A-Z][A-Z0-9]*\d+)\b/g)].map(m => m[1]);
    rawCodeCount += codesInRow.length;

    if (codesInRow.length === 0) continue;

    // Prefer primary service code inside ^code^ delimiter if present
    const caretMatch = rawRow.match(/[\^&]?(852[A-Z][A-Z0-9]*\d+)[\^&]?/);
    const primaryCaretMatch = rawRow.match(/\^(852[A-Z][A-Z0-9]*\d+)\^/);
    const serviceCode = primaryCaretMatch ? primaryCaretMatch[1] : (caretMatch ? caretMatch[1] : codesInRow[0]);

    const rawValidation = validateRawRow(rawRow, serviceCode);

    let subdistrict = '';
    let name = '';
    let address = '';
    let businessHours = null;

    if (primaryCaretMatch) {
      const caretDelim = `^${serviceCode}^`;
      const parts = rawRow.split(caretDelim);

      const beforeCaret = parts[0] || '';
      businessHours = cleanBusinessHours(parts.slice(1).join(caretDelim));

      // Extract subdistrict, shop name, and address from beforeCaret
      const codeMatchesInBefore = [...beforeCaret.matchAll(/\b(852[A-Z][A-Z0-9]*\d+)\b/g)];
      if (codeMatchesInBefore.length > 0) {
        const firstCodeMatch = codeMatchesInBefore[0];
        const fc = firstCodeMatch[1];
        const fcPos = firstCodeMatch.index ?? beforeCaret.indexOf(fc);

        const prefixStr = beforeCaret.slice(0, fcPos);
        const extracted = extractSubdistrictAndShopName(prefixStr);
        subdistrict = extracted.subdistrict;
        name = extracted.name;

        address = beforeCaret.slice(fcPos + fc.length).replace(/[\^&]/g, '').trim();
      } else {
        const extracted = extractSubdistrictAndShopName(beforeCaret);
        subdistrict = extracted.subdistrict;
        name = extracted.name;
        address = beforeCaret.replace(/[\^&]/g, '').trim();
      }
    } else {
      // Fallback split around serviceCode
      const parts = rawRow.split(serviceCode);
      const prefixStr = parts[0] || '';
      const extracted = extractSubdistrictAndShopName(prefixStr);
      subdistrict = extracted.subdistrict;
      name = extracted.name;

      const rest = parts.slice(1).join(serviceCode);
      const addrAndHours = rest.split('^').map(s => s.trim());
      address = (addrAndHours[0] || '').replace(/[\^&]/g, '').trim();
      businessHours = cleanBusinessHours(addrAndHours.slice(1).join('^'));
    }

    // Clean address & name of any leftover embedded service codes from official PDF typo pairs
    for (const c of codesInRow) {
      address = address.replace(c, '').trim();
      name = name.replace(c, '').trim();
    }

    address = address.replace(/^[\s\^&]+/, '').replace(/[\s\^&]+$/, '');
    name = name.replace(/^[\s\^&]+/, '').replace(/[\s\^&]+$/, '');

    // Ensure subdistrict prefix is included in shop name if missing for clarity (e.g., "筲箕灣愛蝶灣自提點")
    if (subdistrict && name && !name.startsWith(subdistrict)) {
      name = `${subdistrict}${name}`;
    }
    if (!name) name = subdistrict ? `${subdistrict}順豐合作點` : '順豐合作點';

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

    // Check placeholder addresses
    if (['順豐合作點', 'OK便利店', '合作點', '自取點', '^'].includes(address) || address.startsWith('852')) {
      reasonCodes.push('PLACEHOLDER_ADDRESS');
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
