// @ts-check

/**
 * Generate the Markdown diff/sync report.
 *
 * @param {object} params
 * @param {string} params.hktDateStr - HKT timestamp
 * @param {object} params.diff - Diff result from computeDiff
 * @param {object} params.stats - Normalization stats
 * @param {object} params.metrics - Completeness gate metrics
 * @param {Array} params.records - Normalized records
 * @param {string[]} params.gateErrors - Blocking errors from gates
 * @param {string[]} params.gateWarnings - Warnings from gates
 * @returns {string} Markdown report
 */
export function generateMarkdownReport({
  hktDateStr,
  diff,
  stats,
  metrics,
  records,
  gateErrors = [],
  gateWarnings = []
}) {
  const { added, removed, updated, unchanged } = diff;

  // Count quality flags by category
  const flagCounts = {};
  for (const r of records) {
    for (const f of (r.quality_flags || [])) {
      flagCounts[f.type] = (flagCounts[f.type] || 0) + 1;
    }
  }
  const flagCountLines = Object.entries(flagCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([type, count]) => `| ${type} | ${count} |`)
    .join('\n');

  // Added locations
  const addedLines = added.length === 0
    ? '*(No added locations)*'
    : added.map(i => `- \`${i.code}\` [${i.type_name}] ${i.name || ''} -- ${i.address || ''}`).join('\n');

  // Removed locations
  const removedLines = removed.length === 0
    ? '*(No removed locations)*'
    : removed.map(i => `- \`${i.code}\` [${i.type_name}] ${i.name || ''} -- ${i.address || ''}`).join('\n');

  // Updated locations with field-level changes
  const updatedLines = updated.length === 0
    ? '*(No updated locations)*'
    : updated.map(u => {
        const changeDetails = Object.entries(u.changes)
          .map(([field, { old: o, new: n }]) => `  - ${field}: \`${JSON.stringify(o)}\` -> \`${JSON.stringify(n)}\``)
          .join('\n');
        return `- \`${u.code}\` ${u.next?.name || u.prev?.name || ''}\n${changeDetails}`;
      }).join('\n');

  // Source fetch summary
  const sourceSummary = metrics
    ? `| TC API areas | ${metrics.tc_areas_success}/${metrics.tc_areas_total} succeeded |
| EN API areas | ${metrics.en_areas_success}/${metrics.en_areas_total} succeeded |
| TC unique codes | ${metrics.tc_unique_codes} |
| EN unique codes | ${metrics.en_unique_codes} |
| Bilingual match rate | ${(metrics.en_match_rate * 100).toFixed(1)}% |`
    : '| Source metrics | unavailable |';

  const prevCount = metrics?.previous_count ?? 0;

  return `# SF Express HK Location Sync Report

> **Last Updated**: \`${hktDateStr}\`

---

## Summary

| Metric | Count |
| :--- | :--- |
| **Previous total** | ${prevCount} |
| **Current total** | ${stats.total} |
| **Stores** | ${stats.stores} |
| **Lockers** | ${stats.lockers} |
| **Partners** | ${stats.partners} |
| **Added** | ${added.length} |
| **Removed** | ${removed.length} |
| **Updated** | ${updated.length} |
| **Unchanged** | ${unchanged} |

---

## Source Coverage

| Metric | Value |
| :--- | :--- |
${sourceSummary}
| District resolved | ${stats.district_resolved} |
| District unresolved | ${stats.district_unresolved} |
| With English data | ${stats.with_english} |
| Missing English | ${stats.missing_english} |

---

## Quality Flags

| Flag | Count |
| :--- | :--- |
${flagCountLines || '| (none) | 0 |'}

---

${gateErrors.length > 0 ? `## Blocking Errors\n\n${gateErrors.map(e => `- ${e}`).join('\n')}\n\n---\n\n` : ''}${gateWarnings.length > 0 ? `## Warnings\n\n${gateWarnings.map(w => `- ${w}`).join('\n')}\n\n---\n\n` : ''}## Added Locations (${added.length})

${addedLines}

---

## Removed Locations (${removed.length})

${removedLines}

---

## Updated Locations (${updated.length})

${updatedLines}
`;
}
