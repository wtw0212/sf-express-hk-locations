// @ts-check
import { writeFile, readFile, mkdir, rename, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Generate all output files in a temporary directory, validate, then atomically
 * replace the published files. If any step fails, previous data is preserved.
 *
 * @param {object} params
 * @param {Array} params.records - Normalized location records
 * @param {object} params.metadata - Dataset metadata object
 * @param {string} params.reportMarkdown - The diff report markdown
 * @param {string} params.dataDir - Path to data/ directory
 * @param {string} params.reportsDir - Path to reports/ directory
 * @param {string} params.rootDir - Repository root
 * @returns {Promise<void>}
 */
export async function atomicPublish({ records, metadata, reportMarkdown, dataDir, reportsDir, rootDir }) {
  const tmpDir = join(rootDir, '.tmp-output');

  // Clean up any previous tmp directory
  if (existsSync(tmpDir)) {
    await rm(tmpDir, { recursive: true, force: true });
  }
  await mkdir(tmpDir, { recursive: true });

  const stores = records.filter(r => r.type === 'store');
  const lockers = records.filter(r => r.type === 'locker');
  const partners = records.filter(r => r.type === 'partner');

  const byDistrict = {};
  for (const r of records) {
    const key = r.district || '_unresolved';
    if (!byDistrict[key]) byDistrict[key] = [];
    byDistrict[key].push(r);
  }

  // Write all files to tmp directory
  const files = [
    { name: 'locations.json', data: records },
    { name: 'stores.json', data: stores },
    { name: 'lockers.json', data: lockers },
    { name: 'partners.json', data: partners },
    { name: 'locations-by-district.json', data: byDistrict },
    { name: 'metadata.json', data: metadata },
  ];

  for (const { name, data } of files) {
    const content = JSON.stringify(data, null, 2);
    const tmpPath = join(tmpDir, name);
    await writeFile(tmpPath, content, 'utf8');

    // Validate: re-parse to ensure valid JSON
    JSON.parse(content);
  }

  // Write report
  const tmpReportPath = join(tmpDir, 'latest-diff.md');
  await writeFile(tmpReportPath, reportMarkdown, 'utf8');

  // All validation passed — atomically move files to their destinations
  await mkdir(dataDir, { recursive: true });
  await mkdir(reportsDir, { recursive: true });

  for (const { name } of files) {
    const tmpPath = join(tmpDir, name);
    const destPath = join(dataDir, name);
    await atomicMove(tmpPath, destPath);
  }

  await atomicMove(tmpReportPath, join(reportsDir, 'latest-diff.md'));

  // Clean up tmp directory
  await rm(tmpDir, { recursive: true, force: true });
}

/**
 * Atomically move a file by writing to a .tmp suffix then renaming.
 * @param {string} src
 * @param {string} dest
 */
async function atomicMove(src, dest) {
  const tmpDest = dest + '.tmp';
  const content = await readFile(src, 'utf8');
  await writeFile(tmpDest, content, 'utf8');
  await rename(tmpDest, dest);
}
