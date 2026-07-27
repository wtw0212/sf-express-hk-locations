// @ts-check
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * Save genuinely unmodified source data to raw/latest-fetch.json.
 * No cleanAndConvert, no convertObjectProperties, no character replacement.
 *
 * @param {string} rawDir - Path to raw/ directory
 * @param {object} sources - Raw source data from all fetchers
 * @param {string} retrievedAt - HKT timestamp string
 * @returns {Promise<object>} The saved snapshot object
 */
export async function saveRawSnapshot(rawDir, sources, retrievedAt) {
  await mkdir(rawDir, { recursive: true });

  const snapshot = {
    retrieved_at: retrievedAt,
    sources: {
      api_tc: {
        area_count: sources.tcResults?.length ?? 0,
        success_count: sources.tcResults?.filter(r => r.ok).length ?? 0,
        failure_count: sources.tcResults?.filter(r => !r.ok).length ?? 0,
        results: (sources.tcResults ?? []).map(r => ({
          area: r.area,
          ok: r.ok,
          status: r.status,
          attempts: r.attempts,
          error: r.error,
          record_count: r.records?.length ?? 0
        })),
        records: (sources.tcResults ?? []).flatMap(r => r.records ?? [])
      },
      api_en: {
        area_count: sources.enResults?.length ?? 0,
        success_count: sources.enResults?.filter(r => r.ok).length ?? 0,
        failure_count: sources.enResults?.filter(r => !r.ok).length ?? 0,
        results: (sources.enResults ?? []).map(r => ({
          area: r.area,
          ok: r.ok,
          status: r.status,
          attempts: r.attempts,
          error: r.error,
          record_count: r.records?.length ?? 0
        })),
        records: (sources.enResults ?? []).flatMap(r => r.records ?? [])
      },
      ssr: {
        records: sources.ssrRecords ?? []
      },
      partner_pdf: {
        pdf_total: sources.pdfTotal ?? 0,
        pdf_success_count: sources.pdfSuccessCount ?? 0,
        pdf_failure_count: sources.pdfFailCount ?? 0,
        records: sources.pdfRecords ?? []
      }
    }
  };

  await writeFile(
    join(rawDir, 'latest-fetch.json'),
    JSON.stringify(snapshot, null, 2),
    'utf8'
  );

  return snapshot;
}
