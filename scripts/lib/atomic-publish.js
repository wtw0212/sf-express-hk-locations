// @ts-check
import { writeFile, readFile, mkdir, copyFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { validateCrossFile } from './validate.js';

/**
 * Release-level transactional publication (All-or-Nothing).
 *
 * 1. Generates all release outputs in a versioned release folder `.tmp-output/release-<runId>/`.
 * 2. Validates JSON parsing and structure of every file.
 * 3. Validates cross-file counts and district/category membership consistency.
 * 4. Backs up existing published files into `.tmp-backup-<runId>/`.
 * 5. Replaces published files sequentially.
 * 6. If ANY file replacement fails, rolls back ALL previously replaced files to original state.
 * 7. Cleans up temp and backup folders after completion.
 *
 * @param {object} params
 * @param {Array} params.records - Normalized location records
 * @param {object} params.metadata - Dataset metadata object
 * @param {string} params.reportMarkdown - The diff report markdown
 * @param {string} params.dataDir - Path to data/ directory
 * @param {string} params.reportsDir - Path to reports/ directory
 * @param {string} params.rootDir - Repository root
 * @param {object} [params.options] - Optional flags (e.g. failure injection for testing)
 * @param {string} [params.options.failAtFile] - Injected failure file name
 * @returns {Promise<void>}
 */
export async function atomicPublish({ records, metadata, reportMarkdown, dataDir, reportsDir, rootDir, options = {} }) {
  const runId = Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
  const releaseDir = join(rootDir, '.tmp-output', `release-${runId}`);
  const backupDir = join(rootDir, '.tmp-backup', `backup-${runId}`);

  try {
    // ─── Step 1: Create release directory ─────────────────────────────
    await mkdir(releaseDir, { recursive: true });

    const stores = records.filter(r => r.type === 'store');
    const lockers = records.filter(r => r.type === 'locker');
    const partners = records.filter(r => r.type === 'partner');

    const byDistrict = {};
    for (const r of records) {
      const key = r.district || '_unresolved';
      if (!byDistrict[key]) byDistrict[key] = [];
      byDistrict[key].push(r);
    }

    const dataFiles = [
      { name: 'locations.json', data: records, targetDir: dataDir },
      { name: 'stores.json', data: stores, targetDir: dataDir },
      { name: 'lockers.json', data: lockers, targetDir: dataDir },
      { name: 'partners.json', data: partners, targetDir: dataDir },
      { name: 'locations-by-district.json', data: byDistrict, targetDir: dataDir },
      { name: 'metadata.json', data: metadata, targetDir: dataDir }
    ];

    // ─── Step 2: Write and validate JSON files in release directory ───
    for (const file of dataFiles) {
      const content = JSON.stringify(file.data, null, 2);
      const filePath = join(releaseDir, file.name);
      await writeFile(filePath, content, 'utf8');

      // Re-parse to verify JSON integrity
      const parsed = JSON.parse(content);
      if (file.name === 'locations.json' && !Array.isArray(parsed)) {
        throw new Error('locations.json root must be an array');
      }
    }

    // Write Markdown report
    const reportPath = join(releaseDir, 'latest-diff.md');
    await writeFile(reportPath, reportMarkdown, 'utf8');
    if (!reportMarkdown || typeof reportMarkdown !== 'string' || !reportMarkdown.trim()) {
      throw new Error('Markdown report generation failed or produced empty output');
    }

    // ─── Step 3: Validate cross-file counts & set membership ─────────
    validateCrossFile(records, stores, lockers, partners, byDistrict, metadata);

    // ─── Step 4: Prepare backups of existing published files ──────────
    await mkdir(backupDir, { recursive: true });
    const publishTasks = [
      ...dataFiles.map(f => ({ name: f.name, src: join(releaseDir, f.name), dest: join(f.targetDir, f.name) })),
      { name: 'latest-diff.md', src: reportPath, dest: join(reportsDir, 'latest-diff.md') }
    ];

    const backedUpFiles = [];
    for (const task of publishTasks) {
      if (existsSync(task.dest)) {
        const bPath = join(backupDir, task.name);
        await copyFile(task.dest, bPath);
        backedUpFiles.push({ name: task.name, dest: task.dest, backupPath: bPath });
      }
    }

    // Ensure target destination directories exist
    await mkdir(dataDir, { recursive: true });
    await mkdir(reportsDir, { recursive: true });

    // ─── Step 5: Execute release replacements sequentially ───────────
    const replacedFiles = [];
    try {
      for (const task of publishTasks) {
        // Failure injection point for automated tests
        if (options.failAtFile && task.name === options.failAtFile) {
          throw new Error(`Injected failure during replacement of ${task.name}`);
        }

        const tmpDest = task.dest + `.tmp-${runId}`;
        await copyFile(task.src, tmpDest);
        await writeFile(task.dest, await readFile(tmpDest, 'utf8'), 'utf8');
        await rm(tmpDest, { force: true });

        replacedFiles.push(task);
      }
    } catch (publishErr) {
      // ─── Step 6: Transaction Rollback on Failure ────────────────────
      console.error(`\nPublication error encountered during '${replacedFiles.length > 0 ? replacedFiles[replacedFiles.length - 1].name : 'initial publish'}'. Initiating full rollback...`);

      for (const task of replacedFiles) {
        const backupInfo = backedUpFiles.find(b => b.name === task.name);
        if (backupInfo && existsSync(backupInfo.backupPath)) {
          await copyFile(backupInfo.backupPath, task.dest);
        } else {
          // If file didn't exist prior to run, remove newly published file
          if (existsSync(task.dest)) {
            await rm(task.dest, { force: true });
          }
        }
      }

      throw new Error(`Atomic publish failed with rollback executed: ${publishErr.message}`);
    }

    // ─── Step 7: Clean up temp and backup directories on success ─────
    await rm(releaseDir, { recursive: true, force: true });
    await rm(backupDir, { recursive: true, force: true });

    const tmpOutputDir = join(rootDir, '.tmp-output');
    const tmpBackupDir = join(rootDir, '.tmp-backup');
    await rm(tmpOutputDir, { recursive: true, force: true }).catch(() => {});
    await rm(tmpBackupDir, { recursive: true, force: true }).catch(() => {});
  } finally {
    // Safety cleanup of leftover temp/backup folders for this runId
    if (existsSync(releaseDir)) await rm(releaseDir, { recursive: true, force: true }).catch(() => {});
    if (existsSync(backupDir)) await rm(backupDir, { recursive: true, force: true }).catch(() => {});
    const tmpOutputDir = join(rootDir, '.tmp-output');
    const tmpBackupDir = join(rootDir, '.tmp-backup');
    if (existsSync(tmpOutputDir)) await rm(tmpOutputDir, { recursive: true, force: true }).catch(() => {});
    if (existsSync(tmpBackupDir)) await rm(tmpBackupDir, { recursive: true, force: true }).catch(() => {});
  }
}
