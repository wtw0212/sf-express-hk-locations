// @ts-check

/**
 * Classify a location as store, locker, or partner.
 *
 * Priority:
 *   1. Code prefix: H852 → locker (very reliable)
 *   2. Name keywords: 智能櫃/自助櫃/自助柜 → locker
 *   3. Explicit isPartner flag from PDF source → partner
 *   4. Partner name keywords: OK便利店, 便利店, 合作點 → partner
 *   5. API serviceContent field: '2' → partner
 *   6. Store name keyword: 順豐站 → store
 *   7. Fallback: store with PARSER_SUSPECTED flag
 *
 * Does NOT use broad code regex patterns for classification.
 *
 * @param {string} code - Service code
 * @param {string} name - Location name
 * @param {object} [item] - Raw API item (for serviceContent, isPartner, etc.)
 * @returns {{ type: string, type_name: string, type_name_en: string, flags: Array }}
 */
export function classifyLocation(code, name, item = {}) {
  const flags = [];

  // 1. Code prefix — H852 = locker (very reliable)
  if (code.startsWith('H852')) {
    return { type: 'locker', type_name: '順豐智能櫃', type_name_en: 'SF Locker', flags };
  }

  // 2. Name keyword checks for lockers
  if (name.includes('智能櫃') || name.includes('自助櫃') || name.includes('自助柜')) {
    return { type: 'locker', type_name: '順豐智能櫃', type_name_en: 'SF Locker', flags };
  }

  // 3. Explicit partner flag from PDF source
  if (item.isPartner === true) {
    return { type: 'partner', type_name: '順豐合作點', type_name_en: 'Service Partner', flags };
  }

  // 4. Partner name keywords
  if (name.includes('OK便利店') || name.includes('便利店') || name.includes('合作點')) {
    return { type: 'partner', type_name: '順豐合作點', type_name_en: 'Service Partner', flags };
  }

  // 5. API serviceContent field: '2' typically indicates partner/convenience store
  const serviceContent = String(item.serviceContent || '');
  if (serviceContent === '2') {
    return { type: 'partner', type_name: '順豐合作點', type_name_en: 'Service Partner', flags };
  }

  // 6. Store name keyword
  if (name.includes('順豐站')) {
    return { type: 'store', type_name: '順豐站', type_name_en: 'SF Store', flags };
  }

  // 7. Fallback — classify as store but flag as heuristic
  flags.push({
    type: 'PARSER_SUSPECTED',
    severity: 'warning',
    fields: ['type'],
    details: { code, name, reason: 'Classification fell through to heuristic fallback' }
  });

  return { type: 'store', type_name: '順豐站', type_name_en: 'SF Store', flags };
}
