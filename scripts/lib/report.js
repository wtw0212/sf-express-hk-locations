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
 * @param {string[]} [params.gateErrors] - Blocking errors from gates
 * @param {string[]} [params.gateWarnings] - Warnings from gates
 * @param {object} [params.ssrResult] - SSR fetch result
 * @param {object} [params.pdfResult] - PDF fetch result
 * @returns {string} Markdown report
 */
export function generateMarkdownReport({
  hktDateStr,
  diff,
  stats,
  metrics,
  records,
  gateErrors = [],
  gateWarnings = [],
  ssrResult = { errors: [] },
  pdfResult = { pdfTotal: 0, pdfSuccessCount: 0, pdfFailCount: 0, status: 'success', errors: [] }
}) {
  const { added, removed, updated, unchanged, isMigration } = diff;

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

  // Updated locations with field-level changes & quality flags diffs
  const updatedLines = updated.length === 0
    ? '*(No updated locations)*'
    : updated.map(u => {
        const changeDetails = Object.entries(u.changes)
          .map(([field, val]) => {
            if (field === 'quality_flags') {
              const qAdded = (val.added || []).map(f => `+${f.type}`).join(', ');
              const qRemoved = (val.removed || []).map(f => `-${f.type}`).join(', ');
              const qMod = (val.modified || []).map(f => `~${f.type}`).join(', ');
              const parts = [qAdded, qRemoved, qMod].filter(Boolean).join(' ');
              return `  - quality_flags: ${parts}`;
            }
            return `  - ${field}: \`${JSON.stringify(val.old)}\` -> \`${JSON.stringify(val.new)}\``;
          })
          .join('\n');
        return `- \`${u.code}\` ${u.next?.name || u.prev?.name || ''}\n${changeDetails}`;
      }).join('\n');

  // Source fetch summary
  const pdfTotal = pdfResult?.pdfTotal ?? metrics?.pdf_total ?? 0;
  const pdfSuccess = pdfResult?.pdfSuccessCount ?? metrics?.pdf_success ?? 0;
  const pdfFail = pdfResult?.pdfFailCount ?? metrics?.pdf_failed ?? 0;
  const pdfStatusStr = `${pdfSuccess}/${pdfTotal} succeeded (${pdfFail} failed)`;

  const sourceSummary = metrics
    ? `| TC API areas | ${metrics.tc_areas_success}/${metrics.tc_areas_total} succeeded |
| EN API areas | ${metrics.en_areas_success}/${metrics.en_areas_total} succeeded |
| TC unique codes | ${metrics.tc_unique_codes} |
| EN unique codes | ${metrics.en_unique_codes} |
| Partner PDFs | ${pdfStatusStr} |
| SSR records | ${ssrResult.records?.length ?? 0} |
| Bilingual match rate | ${(metrics.en_match_rate * 100).toFixed(1)}% |`
    : '| Source metrics | unavailable |';

  const prevCount = metrics?.previous_count ?? 0;

  const pdfErrorList = (pdfResult.errors || [])
    .map(e => `- ${e}`)
    .join('\n');

  const ssrErrorList = (ssrResult.errors || [])
    .map(e => `- ${e}`)
    .join('\n');

  const migrationHeader = isMigration
    ? `> [!NOTE]\n> **Schema Migration Notice**: This dataset sync represents a Schema v1 -> v2 migration. Field additions and source identifier updates are demarcated.\n\n`
    : '';

  return `# SF Express HK Location Sync Report

> **Last Updated**: \`${hktDateStr}\`

${migrationHeader}---

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

## Source Coverage & Status

| Metric | Value |
| :--- | :--- |
${sourceSummary}
| District resolved | ${stats.district_resolved} |
| District unresolved | ${stats.district_unresolved} |
| With English data | ${stats.with_english} |
| Missing English | ${stats.missing_english} |

${pdfErrorList || ssrErrorList ? `### Supplementary Source Failures / Warnings\n\n${pdfErrorList ? `#### Partner PDF Errors:\n${pdfErrorList}\n` : ''}${ssrErrorList ? `#### SSR Errors:\n${ssrErrorList}\n` : ''}\n` : ''}---

## Quality Flags Summary

| Flag | Count |
| :--- | :--- |
${flagCountLines || '| (none) | 0 |'}

---

${gateErrors.length > 0 ? `## Blocking Errors (${gateErrors.length})\n\n${gateErrors.map(e => `- ${e}`).join('\n')}\n\n---\n\n` : ''}${gateWarnings.length > 0 ? `## Warnings (${gateWarnings.length})\n\n${gateWarnings.map(w => `- ${w}`).join('\n')}\n\n---\n\n` : ''}## Added Locations (${added.length})

${addedLines}

---

## Removed Locations (${removed.length})

${removedLines}

---

## Updated Locations (${updated.length})

${updatedLines}
`;
}
