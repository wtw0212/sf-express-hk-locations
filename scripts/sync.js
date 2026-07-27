#!/usr/bin/env node
// @ts-check

/**
 * SF Express HK Location Data Sync — Main Orchestrator
 *
 * API-First Source Architecture:
 *   1. Read previous dataset & metadata from baselinePaths (fail-closed)
 *   2. Load reviewed PDF partner registry (fail-closed)
 *   3. Fetch all current sources (or load snapshot fixtures)
 *   4. Save raw snapshot
 *   5. Normalize canonical sources (TC API > SSR > Reviewed PDF Registry)
 *   6. Audit live PDF records against canonical sources (generate pdf-audit.json)
 *   7. Run completeness gates & compute count deltas
 *   8. Compute diff against baseline dataset
 *   9. Generate diff report
 *  10. Generate metadata object with separate pipeline vs record quality metrics
 *  11. validateReleaseArtifacts() -> Always runs (Ajv schema, cross-file, domain checks)
 *  12. publishReleaseArtifacts() -> Transactional publication to outputPaths
 */

import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { fetchDistrictTree, fetchTcApi, fetchEnApi, fetchSsrPages, fetchPartnerPdfs, parsePartnerPdfDocuments, buildRecordMap } from './lib/source-fetchers.js';
import { saveRawSnapshot } from './lib/raw-snapshot.js';
import { normalizeRecords } from './lib/normalize.js';
import { validateRecords, validatePreviousDataset, checkCompletenessGates, validateCrossFile } from './lib/validate.js';
import { computeDiff } from './lib/diff.js';
import { generateMarkdownReport } from './lib/report.js';
import { atomicPublish } from './lib/atomic-publish.js';
import { validateAllReleaseArtifactsSchemas } from './lib/schema-validator.js';
import { loadReviewedPdfRegistry } from './lib/reviewed-pdf-registry.js';
import { auditPartnerPdfRecords } from './lib/pdf-audit.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = resolve(__dirname, '..');

/**
 * Get current time as HKT string.
 */
export function getHKTDateString() {
  const now = new Date();
  const hktOffset = 8 * 60 * 60 * 1000;
  const hktDate = new Date(now.getTime() + hktOffset);

  const YYYY = hktDate.getUTCFullYear();
  const MM = String(hktDate.getUTCMonth() + 1).padStart(2, '0');
  const DD = String(hktDate.getUTCDate()).padStart(2, '0');
  const hh = String(hktDate.getUTCHours()).padStart(2, '0');
  const mm = String(hktDate.getUTCMinutes()).padStart(2, '0');

  return `${YYYY}-${MM}-${DD} ${hh}:${mm} (HKT UTC+8)`;
}

export async function runSync(options = {}) {
  const isFixtureMode = options.fixture || options.isFixture || process.argv.includes('--fixture');
  const isDryRunCli = process.argv.includes('--dry-run');

  const customBaselineDirCli = process.argv.find(arg => arg.startsWith('--baseline-dir='))?.split('=')[1] ||
    (process.argv.indexOf('--baseline-dir') >= 0 ? process.argv[process.argv.indexOf('--baseline-dir') + 1] : null);

  const customOutputDirCli = process.argv.find(arg => arg.startsWith('--output-dir='))?.split('=')[1] ||
    (process.argv.indexOf('--output-dir') >= 0 ? process.argv[process.argv.indexOf('--output-dir') + 1] : null);

  const customReviewedRegistryCli = process.argv.find(arg => arg.startsWith('--reviewed-registry='))?.split('=')[1] ||
    (process.argv.indexOf('--reviewed-registry') >= 0 ? process.argv[process.argv.indexOf('--reviewed-registry') + 1] : null);

  const shouldPublish = options.publish !== undefined
    ? options.publish
    : (isFixtureMode || isDryRunCli ? false : true);

  const baselineDir = options.baselinePaths?.dataDir || options.baselineDir || (customBaselineDirCli ? resolve(customBaselineDirCli) : resolve(ROOT_DIR, 'data'));
  const customOutDir = customOutputDirCli || options.outputDir;
  const baseRootDir = options.outputPaths?.rootDir || options.paths?.rootDir || options.rootDir || (customOutDir ? resolve(customOutDir) : ROOT_DIR);

  const targetDataDir = options.outputPaths?.dataDir || options.paths?.dataDir || options.dataDir || (customOutDir ? resolve(customOutDir, 'data') : resolve(baseRootDir, 'data'));
  const targetRawDir = options.outputPaths?.rawDir || options.paths?.rawDir || options.rawDir || (customOutDir ? resolve(customOutDir, 'raw') : resolve(baseRootDir, 'raw'));
  const targetReportsDir = options.outputPaths?.reportsDir || options.paths?.reportsDir || options.reportsDir || (customOutDir ? resolve(customOutDir, 'reports') : resolve(baseRootDir, 'reports'));

  // A sync may read an existing publication as its baseline, but it must never
  // publish over that same directory. Callers must snapshot the baseline first
  // and provide a distinct output directory, preserving a stable diff input.
  if (shouldPublish && resolve(baselineDir) === resolve(targetDataDir)) {
    throw new Error('baseline data directory must be distinct from the publication data directory');
  }

  console.log(`Starting SF Express HK Location Data Sync... (${isFixtureMode ? 'FIXTURE MODE' : 'LIVE MODE'}, publish=${shouldPublish})`);
  const hktDateStr = getHKTDateString();
  console.log(`Baseline Dir: ${baselineDir}`);
  console.log(`Output Dir: ${targetDataDir}`);

  // ─── 1. Read & validate previous dataset & metadata from baseline ──
  let previousList = [];
  let previousMetadata = null;

  const prevDataPath = resolve(baselineDir, 'locations.json');
  const prevMetadataPath = resolve(baselineDir, 'metadata.json');

  if (existsSync(prevDataPath)) {
    let prevRaw;
    try {
      prevRaw = await readFile(prevDataPath, 'utf8');
    } catch (e) {
      throw new Error(`Failed to read published locations.json at ${prevDataPath}: ${e.message}`);
    }

    try {
      previousList = JSON.parse(prevRaw);
    } catch (e) {
      throw new Error(`Published locations.json is malformed JSON: ${e.message}`);
    }

    const isLegacyMigrationBaseline = previousList.length > 0 && previousList.every(record =>
      record &&
      !record.provenance &&
      ['api', 'pdf_partner', 'ssr_locker'].includes(record.source)
    );
    validatePreviousDataset(previousList, { allowLegacyMigrationBaseline: isLegacyMigrationBaseline });
    if (isLegacyMigrationBaseline) {
      console.log('Loaded immutable legacy migration baseline (diff-only validation).');
    }
    console.log(`Loaded previous baseline dataset: ${previousList.length} records`);

    if (existsSync(prevMetadataPath)) {
      try {
        previousMetadata = JSON.parse(await readFile(prevMetadataPath, 'utf8'));
        console.log(`Loaded previous baseline metadata (schema v${previousMetadata.schema_version})`);
      } catch {
        console.warn('Warning: Previous metadata.json could not be parsed.');
      }
    }
  } else {
    console.log(`No previous baseline dataset found at ${prevDataPath}. First run.`);
  }

  // Load reviewed PDF partner registry
  const reviewedRegistryPath = options.reviewedRegistryPath || customReviewedRegistryCli || resolve(baselineDir, 'reviewed-pdf-partners.json');
  if (!existsSync(reviewedRegistryPath)) {
    throw new Error(`Reviewed registry missing: ${reviewedRegistryPath}`);
  }

  let reviewedPdfRegistry = null;
  let reviewedPdfList = [];
  try {
    reviewedPdfRegistry = await loadReviewedPdfRegistry(reviewedRegistryPath);
    reviewedPdfList = reviewedPdfRegistry.records;
    console.log(`Loaded reviewed PDF registry: ${reviewedPdfList.length} records`);
  } catch (e) {
    throw new Error(`Failed to load reviewed PDF registry: ${e.message}`);
  }

  // ─── 2. Fetch current sources (or load fixtures) ───────────────────
  let tcResults, enResults, ssrResult, pdfResult;
  let sourceRetrievedAt = hktDateStr;

  if (isFixtureMode) {
    console.log('Loading source data from raw snapshot fixture...');
    const snapshotPath = options.fixturePath || resolve(targetRawDir, 'latest-fetch.json');
    const fallbackPath = resolve(ROOT_DIR, 'raw', 'latest-fetch.json');
    const pathToRead = existsSync(snapshotPath) ? snapshotPath : fallbackPath;

    if (!existsSync(pathToRead)) {
      throw new Error(`Fixture file not found at ${snapshotPath} or ${fallbackPath}`);
    }
    const rawSnap = JSON.parse(await readFile(pathToRead, 'utf8'));
    sourceRetrievedAt = rawSnap.retrieved_at || rawSnap.created_at || hktDateStr;

    const rawTcResults = rawSnap.sources.api_tc?.results || [];
    tcResults = rawTcResults.map(r => ({
      ...r,
      records: r.records || []
    }));

    const rawEnResults = rawSnap.sources.api_en?.results || [];
    enResults = rawEnResults.map(r => ({
      ...r,
      records: r.records || []
    }));

    ssrResult = {
      records: rawSnap.sources.ssr?.records || [],
      errors: rawSnap.sources.ssr?.errors || [],
      ok: true
    };

    const pdfDocs = rawSnap.sources.partner_pdf?.documents;
    if (Array.isArray(pdfDocs) && pdfDocs.length > 0) {
      pdfResult = parsePartnerPdfDocuments(pdfDocs);
    } else if (Array.isArray(rawSnap.sources.partner_pdf?.records) && rawSnap.sources.partner_pdf.records.length > 0) {
      throw new Error(
        'Current fixture snapshot is missing partner_pdf.documents; refusing to trust pre-parsed PDF records'
      );
    } else {
      pdfResult = {
        records: [],
        documents: [],
        pdfTotal: 0,
        httpSuccessCount: 0,
        parseSuccessCount: 0,
        semanticSuccessCount: 0,
        partialQualityFailureCount: 0,
        failedCount: 0,
        pdfSuccessCount: 0,
        pdfFailCount: 0,
        status: 'no_pdfs_discovered',
        errors: [],
        pdfDetails: [],
        quarantinedRecords: []
      };
    }
  } else {
    const { tcAreas, enAreas } = await fetchDistrictTree();
    tcResults = await fetchTcApi(tcAreas);
    enResults = await fetchEnApi(enAreas);
    ssrResult = await fetchSsrPages();
    pdfResult = await fetchPartnerPdfs();
  }

  // Build record maps for normalization
  const tcMap = buildRecordMap(tcResults);
  const enMap = buildRecordMap(enResults);

  console.log(`\nSource summary: TC=${tcMap.size}, EN=${enMap.size}, SSR=${ssrResult.records.length}, ReviewedPDF=${reviewedPdfList.length}, LivePDFParsed=${pdfResult.records.length} (status: ${pdfResult.status})`);

  // ─── 3. Save raw snapshot ──────────────────────────────────────────
  if (!isFixtureMode && shouldPublish) {
    await saveRawSnapshot(targetRawDir, {
      tcResults,
      enResults,
      ssrRecords: ssrResult.records,
      pdfDocuments: pdfResult.documents,
      pdfRecords: pdfResult.records,
      pdfTotal: pdfResult.pdfTotal,
      pdfSuccessCount: pdfResult.pdfSuccessCount,
      pdfFailCount: pdfResult.pdfFailCount,
      pdfStatus: pdfResult.status,
      pdfErrors: pdfResult.errors,
      ssrErrors: ssrResult.errors,
      pdfDetails: pdfResult.pdfDetails,
      quarantinedRecords: pdfResult.quarantinedRecords
    }, sourceRetrievedAt);
    console.log('Saved raw snapshot.');
  }

  // ─── 4. Normalize Canonical Sources (TC API > SSR > Reviewed PDF Registry) ──
  const { records: nextList, stats } = normalizeRecords({
    tcMap,
    enMap,
    ssrList: ssrResult.records,
    reviewedPdfRegistry,
    generatedAt: hktDateStr,
    sourceRetrievedAt
  });
  console.log(`\nNormalized: Total=${stats.total}, Stores=${stats.stores}, Lockers=${stats.lockers}, Partners=${stats.partners}`);

  // ─── 5. Audit Live PDF Records ──────────────────────────────────────
  const pdfAudit = auditPartnerPdfRecords({
    tcMap,
    ssrList: ssrResult.records,
    reviewedPdfList,
    parsedPdfRecords: pdfResult.records,
    quarantinedRecords: pdfResult.quarantinedRecords,
    sourceRetrievedAt,
    generatedAt: hktDateStr
  });

  // ─── 6. Validate next records & Completeness gates ──────────────────
  const { errors: validationErrors, warnings: validationWarnings } = validateRecords(nextList);

  const gateResult = checkCompletenessGates({
    tcResults,
    enResults,
    ssrResult,
    pdfResult,
    records: nextList,
    previousRecords: previousList,
    config: { previousMetadata }
  });

  const allErrors = [...validationErrors, ...gateResult.errors];
  const allWarnings = [...validationWarnings, ...gateResult.warnings];

  if (allWarnings.length > 0) {
    console.log('\nPipeline warnings:');
    allWarnings.forEach(w => console.log(`  - ${w}`));
  }

  if (allErrors.length > 0) {
    console.error('\nPipeline blocking errors:');
    allErrors.forEach(e => console.error(`  - ${e}`));
    throw new Error('Pipeline execution failed due to blocking errors. Baseline dataset preserved.');
  }

  // ─── 7. Diff against baseline ──────────────────────────────────────
  const diff = computeDiff(previousList, nextList);
  console.log(`\nDiff against baseline: +${diff.added.length} added, -${diff.removed.length} removed, ~${diff.updated.length} updated, =${diff.unchanged} unchanged`);

  // ─── 8. Generate report ────────────────────────────────────────────
  const reportMarkdown = generateMarkdownReport({
    hktDateStr,
    diff,
    stats,
    metrics: gateResult.metrics,
    records: nextList,
    gateErrors: allErrors,
    gateWarnings: allWarnings,
    ssrResult,
    pdfResult
  });

  if (process.env.GITHUB_STEP_SUMMARY && shouldPublish) {
    await writeFile(process.env.GITHUB_STEP_SUMMARY, reportMarkdown, 'utf8').catch(() => {});
  }

  // ─── 9. Generate metadata ─────────────────────────────────────────
  const flagCounts = {};
  const flagSeverityCounts = { info: 0, warning: 0, error: 0 };
  for (const r of nextList) {
    for (const f of (r.quality_flags || [])) {
      flagCounts[f.type] = (flagCounts[f.type] || 0) + 1;
      if (f.severity === 'error') flagSeverityCounts.error++;
      else if (f.severity === 'warning') flagSeverityCounts.warning++;
      else flagSeverityCounts.info++;
    }
  }

  const ssrCodesInMap = new Set();
  for (const item of ssrResult.records) {
    const code = item.serviceCode || item.code;
    if (code && !tcMap.has(code)) ssrCodesInMap.add(code);
  }
  const reviewedCodesInMap = new Set();
  for (const item of reviewedPdfList) {
    const code = item.serviceCode || item.code;
    if (code && !tcMap.has(code) && !ssrCodesInMap.has(code)) reviewedCodesInMap.add(code);
  }

  const metadata = {
    schema_version: 2,
    source_retrieved_at: sourceRetrievedAt,
    generated_at: hktDateStr,
    retrieved_at: sourceRetrievedAt,
    counts: {
      total: stats.total,
      stores: stats.stores,
      lockers: stats.lockers,
      partners: stats.partners
    },
    count_deltas: gateResult.metrics.count_deltas,
    source_status: {
      api_tc: {
        areas_total: gateResult.metrics.tc_areas_total,
        areas_success: gateResult.metrics.tc_areas_success,
        areas_failed: gateResult.metrics.tc_areas_failed
      },
      api_en: {
        areas_total: gateResult.metrics.en_areas_total,
        areas_success: gateResult.metrics.en_areas_success,
        areas_failed: gateResult.metrics.en_areas_failed
      },
      ssr: {
        count: ssrResult.records.length,
        errors: ssrResult.errors || []
      },
      partner_pdf: {
        pdf_total: pdfResult.pdfTotal ?? 0,
        http_success_count: pdfResult.httpSuccessCount ?? pdfResult.pdfSuccessCount ?? 0,
        parse_success_count: pdfResult.parseSuccessCount ?? pdfResult.pdfSuccessCount ?? 0,
        semantic_success_count: pdfResult.semanticSuccessCount ?? 0,
        partial_quality_failure_count: pdfResult.partialQualityFailureCount ?? 0,
        failed_count: pdfResult.failedCount ?? pdfResult.pdfFailCount ?? 0,
        valid_record_count: pdfResult.records?.length ?? 0,
        quarantined_record_count: pdfResult.quarantinedRecords?.length ?? 0,
        quarantine_ratio: Number((pdfResult.records?.length + (pdfResult.quarantinedRecords?.length || 0)) > 0
          ? ((pdfResult.quarantinedRecords?.length || 0) / (pdfResult.records.length + (pdfResult.quarantinedRecords?.length || 0))).toFixed(4)
          : 0),
        cross_pdf_duplicate_conflict_count: pdfResult.cross_pdf_duplicate_conflict_count ?? 0,
        status: pdfResult.status,
        errors: pdfResult.errors || [],
        details: pdfResult.pdfDetails || []
      }
    },
    source_policy: {
      canonical_priority: ['api_tc', 'api_en', 'ssr', 'reviewed_pdf_partner'],
      audit_only_sources: ['pdf_partner'],
      counts: {
        api_canonical_count: tcMap.size,
        ssr_only_count: ssrCodesInMap.size,
        reviewed_pdf_supplement_count: reviewedCodesInMap.size,
        unreviewed_pdf_candidate_count: pdfAudit.summary.new_pdf_only_candidate_count
      }
    },
    coverage: {
      tc_record_count: gateResult.metrics.tc_unique_codes,
      en_record_count: gateResult.metrics.en_unique_codes,
      bilingual_match_rate: gateResult.metrics.en_match_rate,
      district_resolved_count: stats.district_resolved,
      district_unresolved_count: stats.district_unresolved
    },
    quality: {
      pipeline_blocking_errors: allErrors.length,
      pipeline_warnings: allWarnings.length,
      record_flag_counts_by_severity: flagSeverityCounts,
      flag_counts_by_type: flagCounts
    }
  };

  // ─── 10 & 11. Build, Validate & Publish Release Artifacts ─────────
  const stores = nextList.filter(r => r.type === 'store');
  const lockers = nextList.filter(r => r.type === 'locker');
  const partners = nextList.filter(r => r.type === 'partner');

  const byDistrict = {};
  for (const r of nextList) {
    const key = r.district || '_unresolved';
    if (!byDistrict[key]) byDistrict[key] = [];
    byDistrict[key].push(r);
  }

  const releaseArtifacts = {
    records: nextList,
    stores,
    lockers,
    partners,
    byDistrict,
    metadata,
    pdfAudit,
    reportMarkdown
  };

  // Always run release validation in BOTH dry-run and live modes
  await validateAllReleaseArtifactsSchemas(releaseArtifacts);
  validateCrossFile(
    nextList,
    stores,
    lockers,
    partners,
    byDistrict,
    metadata
  );
  console.log('Full release artifacts validation (Ajv JSON Schema & Cross-File) passed.');

  if (shouldPublish) {
    await atomicPublish({
      records: nextList,
      metadata,
      pdfAudit,
      reportMarkdown,
      dataDir: targetDataDir,
      reportsDir: targetReportsDir,
      rootDir: baseRootDir
    });
    console.log(`\nAll output files published atomically to ${targetDataDir}.`);
  } else if (customOutDir || options.outputPaths?.dataDir || options.outputDir) {
    await atomicPublish({
      records: nextList,
      metadata,
      pdfAudit,
      reportMarkdown,
      dataDir: targetDataDir,
      reportsDir: targetReportsDir,
      rootDir: baseRootDir
    });
    console.log(`\nDry-run output files written to temporary directory: ${baseRootDir}`);
  } else {
    console.log('\n[Dry-Run Mode] Validation, diff, and report generation completed. No files published.');
  }
}

export function buildReleaseArtifacts({ records, metadata, pdfAudit, reportMarkdown }) {
  return { records, metadata, pdfAudit, reportMarkdown };
}

export async function validateReleaseArtifacts(artifacts) {
  const { records, metadata, pdfAudit } = artifacts;
  const stores = records.filter(r => r.type === 'store');
  const lockers = records.filter(r => r.type === 'locker');
  const partners = records.filter(r => r.type === 'partner');
  const byDistrict = {};
  for (const r of records) {
    const key = r.district || '_unresolved';
    if (!byDistrict[key]) byDistrict[key] = [];
    byDistrict[key].push(r);
  }

  await validateAllReleaseArtifactsSchemas({
    records, stores, lockers, partners, byDistrict, metadata, pdfAudit
  });
  validateCrossFile(records, stores, lockers, partners, byDistrict, metadata);
}

export async function publishReleaseArtifacts(artifacts, options) {
  const { records, metadata, pdfAudit, reportMarkdown } = artifacts;
  await atomicPublish({
    records,
    metadata,
    pdfAudit,
    reportMarkdown,
    dataDir: options.dataDir,
    reportsDir: options.reportsDir,
    rootDir: options.rootDir,
    options
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runSync().catch(error => {
    console.error('\nSync failed:', error.message || error);
    process.exit(1);
  });
}
