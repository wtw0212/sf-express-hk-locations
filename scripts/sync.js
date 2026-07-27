#!/usr/bin/env node
// @ts-check

/**
 * SF Express HK Location Data Sync — Main Orchestrator
 *
 * Execution order:
 *   1. Read & validate previous published dataset (fail-closed)
 *   2. Fetch all current sources (or use fixtures if --fixture)
 *   3. Save raw source snapshot
 *   4. Normalize into nextList
 *   5. Validate nextList against schema rules
 *   6. Run completeness gates (including partner PDF and count anomaly gates)
 *   7. Diff previousList vs nextList (canonicalized quality flags & migration aware)
 *   8. Generate diff report
 *   9. Generate metadata
 *   10. Transactional atomic publish (all-or-nothing with rollback)
 */

import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { fetchDistrictTree, fetchTcApi, fetchEnApi, fetchSsrPages, fetchPartnerPdfs, buildRecordMap } from './lib/source-fetchers.js';
import { saveRawSnapshot } from './lib/raw-snapshot.js';
import { normalizeRecords } from './lib/normalize.js';
import { validateRecords, validatePreviousDataset, checkCompletenessGates } from './lib/validate.js';
import { computeDiff } from './lib/diff.js';
import { generateMarkdownReport } from './lib/report.js';
import { atomicPublish } from './lib/atomic-publish.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = resolve(__dirname, '..');
const DATA_DIR = resolve(ROOT_DIR, 'data');
const RAW_DIR = resolve(ROOT_DIR, 'raw');
const REPORTS_DIR = resolve(ROOT_DIR, 'reports');

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
  const isFixtureMode = options.isFixture || process.argv.includes('--fixture');
  console.log(`Starting SF Express HK Location Data Sync... (${isFixtureMode ? 'FIXTURE MODE' : 'LIVE MODE'})`);
  const hktDateStr = getHKTDateString();
  console.log(`Current HKT Time: ${hktDateStr}`);

  // ─── 1. Read & validate previous published dataset (fail closed) ────
  let previousList = [];
  const prevDataPath = resolve(DATA_DIR, 'locations.json');
  if (existsSync(prevDataPath)) {
    let prevRaw;
    try {
      prevRaw = await readFile(prevDataPath, 'utf8');
    } catch (e) {
      throw new Error(`Failed to read published locations.json: ${e.message}`);
    }

    try {
      previousList = JSON.parse(prevRaw);
    } catch (e) {
      throw new Error(`Published locations.json is malformed JSON: ${e.message}`);
    }

    validatePreviousDataset(previousList);
    console.log(`Loaded previous dataset: ${previousList.length} records`);
  } else {
    console.log('No previous dataset found. First run.');
  }

  // ─── 2. Fetch current sources (or load fixtures) ───────────────────
  let tcResults, enResults, ssrResult, pdfResult;

  if (isFixtureMode) {
    console.log('Loading source data from raw snapshot fixture...');
    const snapshotPath = resolve(RAW_DIR, 'latest-fetch.json');
    if (!existsSync(snapshotPath)) {
      throw new Error(`Fixture file not found at ${snapshotPath}`);
    }
    const rawSnap = JSON.parse(await readFile(snapshotPath, 'utf8'));

    const rawTcResults = rawSnap.sources.api_tc?.results || [];
    const flatTcRecords = rawSnap.sources.api_tc?.records || [];
    tcResults = rawTcResults.map(r => ({
      ...r,
      records: r.records && r.records.length > 0
        ? r.records
        : (r.ok ? flatTcRecords.filter(rec => rec.district === r.area?.district) : [])
    }));

    const rawEnResults = rawSnap.sources.api_en?.results || [];
    const flatEnRecords = rawSnap.sources.api_en?.records || [];
    enResults = rawEnResults.map(r => ({
      ...r,
      records: r.records && r.records.length > 0
        ? r.records
        : (r.ok ? flatEnRecords.filter(rec => rec.district === r.area?.district) : [])
    }));

    ssrResult = {
      records: rawSnap.sources.ssr?.records || [],
      errors: rawSnap.sources.ssr?.errors || [],
      ok: true
    };
    pdfResult = {
      records: rawSnap.sources.partner_pdf?.records || [],
      pdfTotal: rawSnap.sources.partner_pdf?.pdf_total ?? 8,
      pdfSuccessCount: rawSnap.sources.partner_pdf?.pdf_success_count ?? 8,
      pdfFailCount: rawSnap.sources.partner_pdf?.pdf_failure_count ?? 0,
      status: rawSnap.sources.partner_pdf?.status || 'success',
      errors: rawSnap.sources.partner_pdf?.errors || [],
      pdfDetails: []
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
  if (!isFixtureMode) {
    await saveRawSnapshot(RAW_DIR, {
      tcResults,
      enResults,
      ssrRecords: ssrResult.records,
      pdfRecords: pdfResult.records,
      pdfTotal: pdfResult.pdfTotal,
      pdfSuccessCount: pdfResult.pdfSuccessCount,
      pdfFailCount: pdfResult.pdfFailCount,
      pdfStatus: pdfResult.status,
      pdfErrors: pdfResult.errors,
      ssrErrors: ssrResult.errors
    }, hktDateStr);
    console.log('Saved raw snapshot.');
  }

  // ─── 4. Normalize ──────────────────────────────────────────────────
  const { records: nextList, stats } = normalizeRecords(
    tcMap, enMap, ssrResult.records, pdfResult.records, hktDateStr
  );
  console.log(`\nNormalized: Total=${stats.total}, Stores=${stats.stores}, Lockers=${stats.lockers}, Partners=${stats.partners}`);
  console.log(`District: ${stats.district_resolved} resolved, ${stats.district_unresolved} unresolved`);
  console.log(`English: ${stats.with_english} with EN data, ${stats.missing_english} missing`);

  // ─── 5. Validate next records ──────────────────────────────────────
  const { errors: validationErrors, warnings: validationWarnings } = validateRecords(nextList);

  if (validationWarnings.length > 0) {
    console.log('\nValidation warnings:');
    validationWarnings.forEach(w => console.log(`  - ${w}`));
  }

  if (validationErrors.length > 0) {
    console.error('\nValidation errors (blocking):');
    validationErrors.forEach(e => console.error(`  - ${e}`));
    throw new Error('Dataset validation failed. Previous data preserved.');
  }

  // ─── 6. Completeness gates ─────────────────────────────────────────
  const gateResult = checkCompletenessGates({
    tcResults,
    enResults,
    ssrResult,
    pdfResult,
    records: nextList,
    previousRecords: previousList
  });

  if (gateResult.warnings.length > 0) {
    console.log('\nGate warnings:');
    gateResult.warnings.forEach(w => console.log(`  - ${w}`));
  }

  if (!gateResult.pass) {
    console.error('\nCompleteness gate failures (blocking):');
    gateResult.errors.forEach(e => console.error(`  - ${e}`));
    throw new Error('Completeness gates failed. Previous data preserved.');
  }

  // ─── 7. Diff ───────────────────────────────────────────────────────
  const diff = computeDiff(previousList, nextList);
  console.log(`\nDiff: +${diff.added.length} added, -${diff.removed.length} removed, ~${diff.updated.length} updated, =${diff.unchanged} unchanged`);

  // ─── 8. Generate report ────────────────────────────────────────────
  const allErrors = [...validationErrors, ...gateResult.errors];
  const allWarnings = [...validationWarnings, ...gateResult.warnings];

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

  // Write GitHub Step Summary if running in Actions environment
  if (process.env.GITHUB_STEP_SUMMARY) {
    await writeFile(process.env.GITHUB_STEP_SUMMARY, reportMarkdown, 'utf8').catch(() => {});
  }

  // ─── 9. Generate metadata ─────────────────────────────────────────
  const flagCounts = {};
  for (const r of nextList) {
    for (const f of (r.quality_flags || [])) {
      flagCounts[f.type] = (flagCounts[f.type] || 0) + 1;
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
        pdf_total: pdfResult.pdfTotal,
        pdf_success: pdfResult.pdfSuccessCount,
        pdf_failed: pdfResult.pdfFailCount,
        status: pdfResult.status,
        records: pdfResult.records.length,
        errors: pdfResult.errors || []
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
      blocking_errors: allErrors.length,
      warnings: allWarnings.length,
      flag_counts: flagCounts
    }
  };

  // ─── 10. Atomic publish (release-level transactional) ─────────────
  await atomicPublish({
    records: nextList,
    metadata,
    reportMarkdown,
    dataDir: DATA_DIR,
    reportsDir: REPORTS_DIR,
    rootDir: ROOT_DIR
  });

  console.log('\nAll output files published atomically.');
  console.log('Sync completed successfully!');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runSync().catch(error => {
    console.error('\nSync failed:', error.message || error);
    process.exit(1);
  });
}
