// @ts-check

export const SERVICE_CODE_REGEX = /\b(852[A-Z][A-Z0-9]*\d+)\b/g;

export const SUBDISTRICT_PREFIXES = [
  '薄扶林', '堅尼地城', '北角', '柴灣', '黃竹坑', '金鐘', '跑馬地', '炮臺山', '西營盤', '中環', '上環', '灣仔', '銅鑼灣', '太古', '鰂魚涌', '鰂魚湧', '小西灣', '石塘咀', '香港仔', '鴨脷洲', '數碼港',
  '尖沙咀', '旺角', '油麻地', '深水埗', '長沙灣', '荔枝角', '九龍城', '土瓜灣', '新蒲崗', '黃大仙', '慈雲山', '觀塘', '九龍灣', '牛頭角', '油塘', '藍田', '秀茂坪', '紅磡', '佐敦', '大角咀', '石硤尾', '美孚', '太子',
  '荃灣', '葵涌', '青衣', '屯門', '元朗', '天水圍', '沙田', '大圍', '火炭', '馬鞍山', '大埔', '粉嶺', '上水', '將軍澳', '西貢', '東涌', '深井', '長洲', '坪洲', '南丫島', '梅窩', '愉景灣', '大嶼山', '藍地'
];

/**
 * Clean up business hours strings from PDF continuation lines.
 *
 * @param {string} rawHours
 * @returns {string|null}
 */
export function cleanBusinessHours(rawHours) {
  if (!rawHours) return null;
  let h = rawHours.trim();

  // Strip trailing size/weight limit text if attached
  h = h.replace(/(?:最大體積|體積|重量限制|重量):\s*[\s\S]*/gi, '').trim();
  h = h.replace(/取件\s*/g, '').trim();
  h = h.replace(/\^/g, '').trim();

  if (!h || h === '^' || h === '取件') return null;
  return h;
}

/**
 * Validate a raw PDF row segment before destructive cleanup.
 *
 * @param {string} rawRow
 * @param {string} code
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateRawRow(rawRow, code) {
  const errors = [];
  if (!rawRow || typeof rawRow !== 'string') {
    errors.push('RAW_ROW_EMPTY');
    return { valid: false, errors };
  }

  if (!code || !rawRow.includes(code)) {
    errors.push('RAW_ROW_MISSING_CODE');
  }

  if (rawRow.trim().length < 10) {
    errors.push('RAW_ROW_TOO_SHORT');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Check if a text line marks the beginning of a new PDF table row.
 *
 * @param {string} line
 * @returns {boolean}
 */
export function isRowStart(line) {
  if (!line) return false;
  if (SUBDISTRICT_PREFIXES.some(sub => line.startsWith(sub))) return true;
  if (/^(?:香港|九龍|新界)?[A-Z0-9\u4e00-\u9fa5]{1,15}\b852[A-Z][A-Z0-9]*\d+\b/.test(line)) return true;
  return false;
}

/**
 * Group PDF lines into logical table rows anchored by service codes.
 *
 * @param {string} text
 * @param {{ isOk?: boolean, isAsp?: boolean }} [options]
 * @returns {Array<{ rawRow: string, lineStart: number }>}
 */
export function groupPdfLinesIntoRows(text, options = {}) {
  if (!text) return [];

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const rows = [];
  let currentLines = [];

  for (const line of lines) {
    if (
      line.includes('順豐速運') ||
      line.includes('服務範圍') ||
      line.includes('地區點碼地址') ||
      line.includes('地區店鋪名稱') ||
      line.includes('快件限制') ||
      line.startsWith('頁 ') ||
      line.startsWith('Page ')
    ) {
      continue;
    }

    if (
      line.includes('最大體積') ||
      line.includes('重量限制') ||
      line.includes('體積:') ||
      line.includes('重量:')
    ) {
      continue;
    }

    if (currentLines.length > 0) {
      const currentText = currentLines.join(' ');
      const currentCodes = [...currentText.matchAll(/\b852[A-Z][A-Z0-9]*\d+\b/g)].map(m => m[0]);
      const hasCode = currentCodes.length > 0;
      const hasFinishedCode = currentText.includes('^') || currentCodes.length >= 2 || /\d{2}:\d{2}|24小時/.test(currentText);

      const isSameCodeContinuation = hasCode && currentCodes.some(c => line.includes(c));

      const startNewRow = hasFinishedCode && !isSameCodeContinuation && isRowStart(line);

      if (hasCode && startNewRow) {
        rows.push({ rawRow: currentText, lineStart: rows.length + 1 });
        currentLines = [];
      }
    }

    currentLines.push(line);
  }

  if (currentLines.length > 0) {
    rows.push({ rawRow: currentLines.join(' '), lineStart: rows.length + 1 });
  }

  return rows;
}
