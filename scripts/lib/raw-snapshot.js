// @ts-check
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import {
  calculateApiSnapshotHashes,
  canonicalizeApiRecords,
  sha256
} from './source-hashes.js';

function buildApiSource(results = []) {
  const normalizedResults = results.map(result => {
    const records = result.records || [];
    const semantic = canonicalizeApiRecords(records);
    const rawResponseText = result.rawText ?? result.raw_response_text ?? null;
    const rawSha256 = rawResponseText === null
      ? (result.raw_sha256 ?? null)
      : sha256(rawResponseText);

    return {
      area: result.area,
      language: result.language,
      ok: Boolean(result.ok),
      status: result.status ?? null,
      attempts: result.attempts ?? 0,
      error: result.error ?? null,
      record_count: records.length,
      raw_response_text: rawResponseText,
      raw_sha256: rawSha256,
      semantic_sha256: semantic.semantic_sha256,
      records
    };
  });
  const hashes = calculateApiSnapshotHashes(normalizedResults);

  return {
    area_count: normalizedResults.length,
    success_count: normalizedResults.filter(result => result.ok).length,
    failure_count: normalizedResults.filter(result => !result.ok).length,
    record_count: hashes.record_count,
    raw_snapshot_sha256: hashes.raw_snapshot_sha256,
    semantic_sha256: hashes.semantic_sha256,
    record_hashes: hashes.record_hashes,
    duplicate_codes: hashes.duplicate_codes,
    results: normalizedResults,
    records: normalizedResults.flatMap(result => result.records)
  };
}

/**
 * Build genuinely unmodified source evidence in memory. API raw response text
 * is retained byte-for-byte as decoded UTF-8 before JSON parsing.
 */
export function buildRawSnapshot(sources, retrievedAt) {
  return {
    schema_version: 3,
    retrieved_at: retrievedAt,
    sources: {
      api_tc: buildApiSource(sources.tcResults ?? []),
      api_en: buildApiSource(sources.enResults ?? []),
      ssr: {
        records: sources.ssrRecords ?? [],
        errors: sources.ssrErrors ?? []
      },
      partner_pdf: {
        documents: sources.pdfDocuments ?? [],
        pdf_total: sources.pdfTotal ?? 0,
        pdf_success_count: sources.pdfSuccessCount ?? 0,
        pdf_failure_count: sources.pdfFailCount ?? 0,
        status: sources.pdfStatus ?? 'success',
        details: sources.pdfDetails ?? [],
        records: sources.pdfRecords ?? [],
        quarantined_records: sources.quarantinedRecords ?? [],
        errors: sources.pdfErrors ?? []
      }
    }
  };
}

/**
 * Save the supplied or newly-built snapshot to raw/latest-fetch.json.
 */
export async function saveRawSnapshot(rawDir, sources, retrievedAt) {
  await mkdir(rawDir, { recursive: true });
  const snapshot = sources?.schema_version === 3
    ? sources
    : buildRawSnapshot(sources, retrievedAt);
  await writeFile(join(rawDir, 'latest-fetch.json'), JSON.stringify(snapshot, null, 2), 'utf8');
  return snapshot;
}
