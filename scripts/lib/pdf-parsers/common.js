// @ts-check

export const SERVICE_CODE_SOURCE = String.raw`852[A-Z][A-Z0-9]*\d+`;
export const SERVICE_CODE_REGEX = new RegExp(`\\b(${SERVICE_CODE_SOURCE})\\b`, 'g');

export const SUBDISTRICT_PREFIXES = [
  '薄扶林', '堅尼地城', '北角', '柴灣', '黃竹坑', '金鐘', '跑馬地', '炮臺山', '西營盤', '中環', '上環', '灣仔', '銅鑼灣', '太古', '鰂魚涌', '鰂魚湧', '小西灣', '石塘咀', '香港仔', '鴨脷洲', '數碼港',
  '尖沙咀', '旺角', '油麻地', '深水埗', '長沙灣', '荔枝角', '九龍城', '土瓜灣', '新蒲崗', '黃大仙', '慈雲山', '觀塘', '九龍灣', '牛頭角', '油塘', '藍田', '秀茂坪', '紅磡', '佐敦', '大角咀', '石硤尾', '美孚', '太子',
  '荃灣', '葵涌', '青衣', '屯門', '元朗', '天水圍', '沙田', '大圍', '火炭', '馬鞍山', '大埔', '粉嶺', '上水', '將軍澳', '西貢', '東涌', '深井', '長洲', '坪洲', '南丫島', '梅窩', '愉景灣', '大嶼山', '藍地'
];

const BUSINESS_HOURS_LINE = /(?:星期|周[一二三四五六日]|公眾假期|節假日|24小時|\b\d{1,2}:\d{2}\s*[-至]\s*\d{1,2}:\d{2}\b|休息|OFF)/i;

/**
 * Check if a text line resembles business hours.
 *
 * @param {string} [line='']
 * @returns {boolean}
 */
export function looksLikeBusinessHours(line = '') {
  return BUSINESS_HOURS_LINE.test(String(line).trim());
}

/**
 * Check if a line resembles a shop name or location prefix.
 *
 * @param {string} [line='']
 * @returns {boolean}
 */
export function looksLikeRecordPrefix(line = '') {
  const value = String(line).trim();
  if (!value || findServiceCodes(value).length > 0) return false;
  if (looksLikeBusinessHours(value)) return false;
  if (isPdfHeaderLine(value)) return false;

  return (
    SUBDISTRICT_PREFIXES.some(prefix => value.startsWith(prefix)) ||
    /(?:自提點|自取點|便利店|合作點|士多|集運|商店|公司|店)$/.test(value)
  );
}

/**
 * Extract subdistrict and shop name from a raw prefix string.
 *
 * @param {string} rawPrefix
 * @returns {{ subdistrict: string, name: string }}
 */
export function extractSubdistrictAndShopName(rawPrefix) {
  let text = (rawPrefix || '').replace(/^服務時間[^\n]*\)\s*/, '').replace(/[\^&]/g, '').trim();

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
 * Find all valid 852... service codes inside a text value.
 *
 * @param {string} [value='']
 * @returns {string[]}
 */
export function findServiceCodes(value = '') {
  return [...String(value).matchAll(new RegExp(`\\b(${SERVICE_CODE_SOURCE})\\b`, 'g'))].map(match => match[1]);
}

/**
 * Extract visible service code, caret service code, and mismatch evidence from a raw PDF row segment.
 *
 * @param {string} rawRow
 * @returns {{ visibleCode: string|null, caretCode: string|null, allCodes: string[], mismatch: boolean }}
 */
export function extractRowCodeEvidence(rawRow) {
  const visibleMatch = String(rawRow || '').match(new RegExp(`\\b(${SERVICE_CODE_SOURCE})\\b`));
  const caretMatch = String(rawRow || '').match(new RegExp(`\\^(${SERVICE_CODE_SOURCE})\\^`));
  const visibleCode = visibleMatch?.[1] ?? null;
  const caretCode = caretMatch?.[1] ?? null;
  return {
    visibleCode,
    caretCode,
    allCodes: [...new Set(findServiceCodes(rawRow))],
    mismatch: Boolean(visibleCode && caretCode && visibleCode !== caretCode)
  };
}

/**
 * Clean up business hours strings from PDF continuation lines.
 *
 * @param {string} rawHours
 * @returns {string|null}
 */
export function cleanBusinessHours(rawHours) {
  if (!rawHours) return null;
  let h = rawHours.trim();

  h = h.replace(/(?:最大體積|體積|重量限制|重量):\s*[\s\S]*/gi, '').trim();
  h = h.replace(/取件\s*/g, '').trim();
  h = h.replace(/\^/g, '').trim();

  if (!h || h === '^' || h === '取件') return null;
  return h;
}

/**
 * Validate semantic correctness of business hours.
 *
 * @param {string} value
 * @returns {{ valid: boolean, reasonCodes: string[] }}
 */
export function validateBusinessHours(value) {
  const text = String(value ?? '').trim();
  if (!text) return { valid: true, reasonCodes: [] };

  const reasons = [];
  const hasHoursSignal = looksLikeBusinessHours(text);
  const suspiciousLeakText = SUBDISTRICT_PREFIXES.some(sub => text.includes(sub)) &&
    /(?:自提點|自取點|便利店|合作點|士多|集運|有限公司|公司|店)/.test(text) &&
    !hasHoursSignal;

  if (suspiciousLeakText) {
    reasons.push('NEXT_RECORD_PREFIX_LEAK');
  }

  return {
    valid: reasons.length === 0,
    reasonCodes: reasons
  };
}

/**
 * Validate a parsed partner location record against quality standards.
 *
 * @param {object} record
 * @param {string} rawRow
 * @param {object} [codeEvidence]
 * @returns {{ valid: boolean, reasonCodes: string[] }}
 */
export function validateParsedPartnerRecord(record, rawRow, codeEvidence) {
  const reasonCodes = [];
  const serviceCode = record?.serviceCode;

  if (!serviceCode || !new RegExp(`^${SERVICE_CODE_SOURCE}$`).test(serviceCode)) {
    reasonCodes.push('INVALID_SERVICE_CODE');
  }

  if (codeEvidence?.mismatch) {
    reasonCodes.push('SERVICE_CODE_MISMATCH');
  }

  const name = String(record?.name ?? '').trim();
  const fields = {
    name,
    address: String(record?.address ?? '').trim(),
    serviceTime: String(record?.serviceTime ?? '').trim()
  };

  if (!fields.name) reasonCodes.push('EMPTY_NAME');

  if (!fields.address) reasonCodes.push('EMPTY_ADDRESS');
  if (fields.name && fields.address && fields.name === fields.address) {
    reasonCodes.push('NAME_EQUALS_ADDRESS');
  }

  const placeholders = new Set(['順豐合作點', 'OK便利店', '合作點', '自取點', '^']);
  if (placeholders.has(fields.address) || fields.address.startsWith('852')) {
    reasonCodes.push('PLACEHOLDER_ADDRESS');
  }

  for (const [fieldName, value] of Object.entries(fields)) {
    const foreignCodes = findServiceCodes(value).filter(code => code !== serviceCode);
    if (foreignCodes.length > 0) {
      reasonCodes.push('EMBEDDED_SERVICE_CODE');
      reasonCodes.push(`EMBEDDED_SERVICE_CODE_IN_${fieldName.toUpperCase()}`);
    }
    if (value.includes('^')) {
      reasonCodes.push('RESIDUAL_SEPARATOR');
    }
  }

  const hoursValidation = validateBusinessHours(record?.serviceTime);
  reasonCodes.push(...hoursValidation.reasonCodes);

  if (!rawRow || !rawRow.includes(serviceCode ?? '')) {
    reasonCodes.push('RAW_ROW_MISSING_CODE');
  }

  return {
    valid: reasonCodes.length === 0,
    reasonCodes: [...new Set(reasonCodes)]
  };
}

/**
 * Check if a line is a header line in PDF.
 *
 * @param {string} line
 * @returns {boolean}
 */
export function isPdfHeaderLine(line) {
  return (
    line.includes('順豐速運') ||
    line.includes('服務範圍') ||
    line.includes('地區點碼地址') ||
    line.includes('地區店鋪名稱') ||
    line.startsWith('頁 ') ||
    line.startsWith('Page ')
  );
}

/**
 * Group PDF lines into logical table rows using a precise code & limit boundary state machine.
 *
 * @param {string} text
 * @returns {Array<{ rawRow: string, lineStart: number }>}
 */
export function groupPdfLinesIntoRows(text) {
  if (!text) return [];

  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  const rows = [];
  let currentLines = [];
  let lineNumber = 0;

  const flushCurrent = () => {
    if (currentLines.length === 0) return;
    rows.push({
      rawRow: currentLines.join(' '),
      lineStart: lineNumber - currentLines.length + 1
    });
    currentLines = [];
  };

  for (const line of lines) {
    lineNumber++;
    if (isPdfHeaderLine(line)) continue;

    const currentText = currentLines.join(' ');
    const currentCodes = findServiceCodes(currentText);
    const lineCodes = findServiceCodes(line);

    const isSameCodeContinuation =
      currentCodes.length > 0 &&
      lineCodes.length > 0 &&
      lineCodes.every(c => currentCodes.includes(c));

    if (currentCodes.length > 0 && lineCodes.length > 0 && !isSameCodeContinuation) {
      flushCurrent();
    } else if (
      currentCodes.length > 0 &&
      (currentText.includes('體積:') || currentText.includes('重量:') || currentText.includes('重量限制')) &&
      (looksLikeRecordPrefix(line) || SUBDISTRICT_PREFIXES.some(s => line.startsWith(s)))
    ) {
      flushCurrent();
    }

    currentLines.push(line);
  }

  flushCurrent();
  return rows;
}
