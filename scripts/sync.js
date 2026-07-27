#!/usr/bin/env node
// @ts-check

/**
 * SF Express HK Location Data Sync — Main Orchestrator
 *
 * Modular pipeline phases:
 *   1. Read previous dataset & metadata from baselinePaths (fail-closed)
 *   2. Fetch all current sources (or load snapshot fixtures)
 *   3. Save raw snapshot (including per-PDF diagnostics & quarantined records)
 *   4. Normalize into nextList
 *   5. Run completeness gates & compute count deltas
 *   6. Compute diff against baseline dataset
 *   7. Generate diff report
 *   8. Generate metadata object with separate pipeline vs record quality metrics
 *   9. buildReleaseArtifacts()
 *  10. validateReleaseArtifacts() -> Always runs (Ajv schema, cross-file, domain checks)
 *  11. publishReleaseArtifacts() -> Transactional publication to outputPaths
 */

import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { fetchDistrictTree, fetchTcApi, fetchEnApi, fetchSsrPages, fetchPartnerPdfs, buildRecordMap } from './lib/source-fetchers.js';
import { saveRawSnapshot } from './lib/raw-snapshot.js';
import { normalizeRecords } from './lib/normalize.js';
import { validateRecords, validatePreviousDataset, checkCompletenessGates, validateCrossFile } from './lib/validate.js';
import { computeDiff } from './lib/diff.js';
import { generateMarkdownReport } from './lib/report.js';
import { atomicPublish } from './lib/atomic-publish.js';
import { validateAllReleaseArtifactsSchemas } from './lib/schema-validator.js';

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

/**
 * Phase 1: Build release artifacts in memory.
 */
export function buildReleaseArtifacts({ records, metadata, reportMarkdown }) {
  const stores = records.filter(r => r.type === 'store');
  const lockers = records.filter(r => r.type === 'locker');
  const partners = records.filter(r => r.type === 'partner');

  const byDistrict = {};
  for (const r of records) {
    const key = r.district || '_unresolved';
    if (!byDistrict[key]) byDistrict[key] = [];
    byDistrict[key].push(r);
  }

  return {
    records,
    stores,
    lockers,
    partners,
    byDistrict,
    metadata,
    reportMarkdown
  };
}

/**
 * Phase 2: Validate release artifacts (Ajv Schemas, Cross-File, Domain).
 * MUST execute in BOTH dry-run mode and live mode.
 */
export async function validateReleaseArtifacts(artifacts) {
  const { records, stores, lockers, partners, byDistrict, metadata } = artifacts;

  const { errors: recordErrors } = validateRecords(records);
  if (recordErrors.length > 0) {
    throw new Error(`Domain record validation failed:\n${recordErrors.join('\n')}`);
  }

  await validateAllReleaseArtifactsSchemas({
    records, stores, lockers, partners, byDistrict, metadata
  });

  validateCrossFile(records, stores, lockers, partners, byDistrict, metadata);
}

/**
 * Phase 3: Transactional atomic publication to output paths.
 */
export async function publishReleaseArtifacts(artifacts, outputPaths) {
  const { records, metadata, reportMarkdown } = artifacts;
  await atomicPublish({
    records,
    metadata,
    reportMarkdown,
    dataDir: outputPaths.dataDir,
    reportsDir: outputPaths.reportsDir,
    rootDir: outputPaths.rootDir
  });
}

/**
 * Main Sync Orchestrator
 */
export async function runSync(options = {}) {
  const args = process.argv;
  const isFixtureCli = args.includes('--fixture');
  const isDryRunCli = args.includes('--dry-run');

  const baselineDirCliIdx = args.indexOf('--baseline-dir');
  const customBaselineDirCli = baselineDirCliIdx !== -1 && args[baselineDirCliIdx + 1] ? args[baselineDirCliIdx + 1] : null;

  const outputDirIdx = args.indexOf('--output-dir');
  const customOutputDirCli = outputDirIdx !== -1 && args[outputDirIdx + 1] ? args[outputDirIdx + 1] : null;

  const isFixtureMode = options.mode === 'fixture' || options.isFixture || isFixtureCli;
  const shouldPublish = options.publish !== undefined
    ? options.publish
    : (isFixtureMode || isDryRunCli ? false : true);

  // Baseline input paths vs Output generated paths
  const baselineDir = options.baselinePaths?.dataDir || options.baselineDir || (customBaselineDirCli ? resolve(customBaselineDirCli) : resolve(ROOT_DIR, 'data'));
  const customOutDir = customOutputDirCli || options.outputDir;
  const baseRootDir = options.outputPaths?.rootDir || options.paths?.rootDir || options.rootDir || (customOutDir ? resolve(customOutDir) : ROOT_DIR);

  const targetDataDir = options.outputPaths?.dataDir || options.paths?.dataDir || options.dataDir || (customOutDir ? resolve(customOutDir, 'data') : resolve(baseRootDir, 'data'));
  const targetRawDir = options.outputPaths?.rawDir || options.paths?.rawDir || options.rawDir || (customOutDir ? resolve(customOutDir, 'raw') : resolve(baseRootDir, 'raw'));
  const targetReportsDir = options.outputPaths?.reportsDir || options.paths?.reportsDir || options.reportsDir || (customOutDir ? resolve(customOutDir, 'reports') : resolve(baseRootDir, 'reports'));

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

    validatePreviousDataset(previousList);
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

  // ─── 2. Fetch current sources (or load fixtures) ───────────────────
  let tcResults, enResults, ssrResult, pdfResult;

  if (isFixtureMode) {
    console.log('Loading source data from raw snapshot fixture...');
    const snapshotPath = options.fixturePath || resolve(targetRawDir, 'latest-fetch.json');
    const fallbackPath = resolve(ROOT_DIR, 'raw', 'latest-fetch.json');
    const pathToRead = existsSync(snapshotPath) ? snapshotPath : fallbackPath;

    if (!existsSync(pathToRead)) {
      throw new Error(`Fixture file not found at ${snapshotPath} or ${fallbackPath}`);
    }
    const rawSnap = JSON.parse(await readFile(pathToRead, 'utf8'));

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

    pdfResult = {
      records: rawSnap.sources.partner_pdf?.records || [],
      pdfTotal: rawSnap.sources.partner_pdf?.pdf_total ?? 8,
      httpSuccessCount: rawSnap.sources.partner_pdf?.http_success_count ?? 8,
      parseSuccessCount: rawSnap.sources.partner_pdf?.parse_success_count ?? 8,
      semanticSuccessCount: rawSnap.sources.partner_pdf?.semantic_success_count ?? 8,
      partialQualityFailureCount: rawSnap.sources.partner_pdf?.partial_quality_failure_count ?? 0,
      failedCount: rawSnap.sources.partner_pdf?.failed_count ?? 0,
      pdfSuccessCount: rawSnap.sources.partner_pdf?.http_success_count ?? 8,
      pdfFailCount: rawSnap.sources.partner_pdf?.failed_count ?? 0,
      status: rawSnap.sources.partner_pdf?.status || 'success',
      errors: rawSnap.sources.partner_pdf?.errors || [],
      pdfDetails: rawSnap.sources.partner_pdf?.details || [],
      quarantinedRecords: rawSnap.sources.partner_pdf?.quarantined_records || []
    };
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

  console.log(`\nSource summary: TC=${tcMap.size}, EN=${enMap.size}, SSR=${ssrResult.records.length}, PDF=${pdfResult.records.length} (status: ${pdfResult.status})`);

  // ─── 3. Save raw snapshot ──────────────────────────────────────────
  if (!isFixtureMode && shouldPublish) {
    await saveRawSnapshot(targetRawDir, {
      tcResults,
      enResults,
      ssrRecords: ssrResult.records,
      pdfRecords: pdfResult.records,
      pdfTotal: pdfResult.pdfTotal,
      pdfSuccessCount: pdfResult.pdfSuccessCount,
      pdfFailCount: pdfResult.pdfFailCount,
      pdfStatus: pdfResult.status,
      pdfErrors: pdfResult.errors,
      ssrErrors: ssrResult.errors,
      pdfDetails: pdfResult.pdfDetails,
      quarantinedRecords: pdfResult.quarantinedRecords
    }, hktDateStr);
    console.log('Saved raw snapshot.');
  }

  // ─── 4. Normalize ──────────────────────────────────────────────────
  const { records: nextList, stats } = normalizeRecords(
    tcMap, enMap, ssrResult.records, pdfResult.records, hktDateStr
  );
  console.log(`\nNormalized: Total=${stats.total}, Stores=${stats.stores}, Lockers=${stats.lockers}, Partners=${stats.partners}`);

  // ─── 5. Validate next records ──────────────────────────────────────
  const { errors: validationErrors, warnings: validationWarnings } = validateRecords(nextList);

  // ─── 6. Completeness gates & Count deltas ──────────────────────────
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

  const metadata = {
    schema_version: 2,
    retrieved_at: hktDateStr,
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
        status: pdfResult.status,
        errors: pdfResult.errors || [],
        details: pdfResult.pdfDetails || []
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
  const releaseArtifacts = buildReleaseArtifacts({
    records: nextList,
    metadata,
    reportMarkdown
  });

  // Always run release validation (Ajv JSON Schema, Cross-File, Domain) in BOTH dry-run and live modes
  await validateReleaseArtifacts(releaseArtifacts);
  console.log('Full release artifacts validation (Ajv JSON Schema & Cross-File) passed.');

  if (shouldPublish) {
    await publishReleaseArtifacts(releaseArtifacts, {
      dataDir: targetDataDir,
      reportsDir: targetReportsDir,
      rootDir: baseRootDir
    });
    console.log(`\nAll output files published atomically to ${targetDataDir}.`);
  } else if (customOutDir || options.outputPaths?.dataDir || options.outputDir) {
    await publishReleaseArtifacts(releaseArtifacts, {
      dataDir: targetDataDir,
      reportsDir: targetReportsDir,
      rootDir: baseRootDir
    });
    console.log(`\nDry-run output files written to temporary directory: ${baseRootDir}`);
  } else {
    console.log('\n[Dry-Run Mode] Validation, diff, and report generation completed. No files published.');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runSync().catch(error => {
    console.error('\nSync failed:', error.message || error);
    process.exit(1);
  });
}
