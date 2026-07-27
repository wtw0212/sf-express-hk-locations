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
 * @param {string[]} [params.gateErrors] - Blocking errors from pipeline execution
 * @param {string[]} [params.gateWarnings] - Pipeline execution warnings
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
  pdfResult = { pdfTotal: 0, pdfSuccessCount: 0, pdfFailCount: 0, status: 'success', errors: [], pdfDetails: [] }
}) {
  const { added, removed, updated, unchanged, isMigration } = diff;

  // Count record quality flags by category & severity
  const flagCounts = {};
  let recordWarningCount = 0;
  let recordInfoCount = 0;
  let recordErrorCount = 0;

  for (const r of records) {
    for (const f of (r.quality_flags || [])) {
      flagCounts[f.type] = (flagCounts[f.type] || 0) + 1;
      if (f.severity === 'error') recordErrorCount++;
      else if (f.severity === 'warning') recordWarningCount++;
      else recordInfoCount++;
    }
  }

  const flagCountLines = Object.entries(flagCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([type, count]) => `| ${type} | ${count} |`)
    .join('\n');

  // Count Deltas Table
  const deltas = metrics?.count_deltas || {};
  const deltaLines = Object.entries(deltas)
    .map(([cat, info]) => {
      const prevStr = info.baseline_available && info.previous !== null ? info.previous : 'N/A';
      const pctStr = info.baseline_available ? `${info.delta_pct >= 0 ? '+' : ''}${info.delta_pct}%` : 'N/A';
      const deltaStr = info.baseline_available ? `${info.delta >= 0 ? '+' : ''}${info.delta}` : 'N/A';
      const resStr = info.gate_result === 'block' ? '❌ BLOCK' : (info.gate_result === 'warn' ? '⚠️ WARN' : '✅ PASS');
      return `| ${cat} | ${prevStr} | ${info.current} | ${deltaStr} | ${pctStr} | ${info.baseline_source} | ${resStr} |`;
    })
    .join('\n');

  // Added locations
  const addedLines = added.length === 0
    ? '*(No added locations)*'
    : added.map(i => `- \`${i.code}\` [${i.type_name}] ${i.name || ''} -- ${i.address || ''}`).join('\n');

  // Removed locations
  const removedLines = removed.length === 0
    ? '*(No removed locations)*'
    : removed.map(i => `- \`${i.code}\` [${i.type_name}] ${i.name || ''} -- ${i.address || ''}`).join('\n');

  // Updated locations
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
  const pdfTotal = pdfResult?.pdfTotal ?? 0;
  const httpSuccessCount = pdfResult?.httpSuccessCount ?? pdfResult?.pdfSuccessCount ?? 0;
  const parseSuccessCount = pdfResult?.parseSuccessCount ?? pdfResult?.pdfSuccessCount ?? 0;
  const semanticSuccessCount = pdfResult?.semanticSuccessCount ?? 0;
  const partialQualityFailureCount = pdfResult?.partialQualityFailureCount ?? 0;
  const validRecordCount = pdfResult?.records?.length ?? 0;
  const quarantinedRecordCount = pdfResult?.quarantinedRecords?.length ?? 0;
  const totalPdfCandidates = validRecordCount + quarantinedRecordCount;
  const quarantineRatioPct = totalPdfCandidates > 0 ? (quarantinedRecordCount / totalPdfCandidates) * 100 : 0;

  const sourceSummary = metrics
    ? `| TC API areas | ${metrics.tc_areas_success}/${metrics.tc_areas_total} succeeded |
| EN API areas | ${metrics.en_areas_success}/${metrics.en_areas_total} succeeded |
| TC unique codes | ${metrics.tc_unique_codes} |
| EN unique codes | ${metrics.en_unique_codes} |
| Partner PDF HTTP Success | ${httpSuccessCount}/${pdfTotal} |
| Partner PDF Parser Completed | ${parseSuccessCount}/${pdfTotal} |
| Partner PDF Semantic Success | ${semanticSuccessCount}/${pdfTotal} |
| Partner PDF Quality Failures | ${partialQualityFailureCount} |
| Valid Partner PDF Records | ${validRecordCount} |
| Quarantined PDF Records | ${quarantinedRecordCount} |
| PDF Quarantine Ratio | ${quarantineRatioPct.toFixed(1)}% |
| SSR records | ${ssrResult.records?.length ?? 0} |
| Bilingual match rate | ${(metrics.en_match_rate * 100).toFixed(1)}% |`
    : '| Source metrics | unavailable |';

  const pdfErrorList = (pdfResult.errors || []).map(e => `- ${e}`).join('\n');
  const ssrErrorList = (ssrResult.errors || []).map(e => `- ${e}`).join('\n');

  const migrationHeader = isMigration
    ? `> [!NOTE]\n> **Schema Migration Notice**: This dataset sync compares the current canonical schema with an immutable legacy baseline. Field additions and source identifier updates are demarcated.\n\n`
    : '';

  return `# SF Express HK Location Sync Report

> **Last Updated**: \`${hktDateStr}\`

${migrationHeader}---

## Summary

| Metric | Count |
| :--- | :--- |
| **Previous total** | ${metrics?.previous_count ?? 'N/A'} |
| **Current total** | ${stats.total} |
| **Stores** | ${stats.stores} |
| **Lockers** | ${stats.lockers} |
| **Partners** | ${stats.partners} |
| **Added** | ${added.length} |
| **Removed** | ${removed.length} |
| **Updated** | ${updated.length} |
| **Unchanged** | ${unchanged} |

---

## Count Deltas

| Category | Previous | Current | Delta | Delta % | Baseline Source | Gate Result |
| :--- | ---: | ---: | ---: | ---: | :--- | :--- |
${deltaLines || '| (none) | | | | | | |'}

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

## Pipeline Execution Status

| Metric | Count |
| :--- | :--- |
| **Pipeline Blocking Errors** | ${gateErrors.length} |
| **Pipeline Execution Warnings** | ${gateWarnings.length} |
| **Record Quality Warnings** | ${recordWarningCount} |
| **Record Quality Info Flags** | ${recordInfoCount} |
| **Record Quality Errors** | ${recordErrorCount} |

---

## Record Quality Flags Summary

| Flag Type | Count |
| :--- | :--- |
${flagCountLines || '| (none) | 0 |'}

---

${gateErrors.length > 0 ? `## Pipeline Blocking Errors (${gateErrors.length})\n\n${gateErrors.map(e => `- ❌ ${e}`).join('\n')}\n\n---\n\n` : ''}${gateWarnings.length > 0 ? `## Pipeline Execution Warnings (${gateWarnings.length})\n\n${gateWarnings.map(w => `- ⚠️ ${w}`).join('\n')}\n\n---\n\n` : ''}## Added Locations (${added.length})

${addedLines}

---

## Removed Locations (${removed.length})

${removedLines}

---

## Updated Locations (${updated.length})

${updatedLines}
`;
}
