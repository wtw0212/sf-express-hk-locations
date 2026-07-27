// @ts-check
import * as nodeFs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { validateCrossFile } from './validate.js';
import {
  validateAllReleaseArtifactsSchemas,
  validateRawSnapshotSchema
} from './schema-validator.js';

export function serializeJsonArtifact(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export function serializeTextArtifact(value) {
  return `${String(value).replace(/\s+$/u, '')}\n`;
}

/**
 * Real Atomic Release Publication (All-or-Nothing with Atomic Rename and Journaled Rollback).
 *
 * 1. Generates all release outputs in a versioned staging directory `.tmp-output/release-<runId>/`.
 * 2. Validates JSON Schemas and cross-file domain constraints.
 * 3. Backs up existing published files into `.tmp-backup/backup-<runId>/`.
 * 4. Writes complete temporary files `${dest}.new-${runId}` in destination directories.
 * 5. Journals destination status BEFORE calling atomic `rename()`.
 * 6. Atomically renames temporary files over destinations.
 * 7. If ANY step fails, rolls back all replaced files from backup journal.
 * 8. If rollback fails, PRESERVES backup files for manual recovery.
 *
 * @param {object} params
 * @param {Array} params.records - Normalized location records
 * @param {object} params.metadata - Dataset metadata object
 * @param {string} params.reportMarkdown - The diff report markdown
 * @param {string} params.dataDir - Path to data/ directory
 * @param {string} params.reportsDir - Path to reports/ directory
 * @param {string} params.rootDir - Repository root
 * @param {object} [params.options] - Optional flags & dependency injections
 * @param {object} [params.options.fs] - Custom FS implementation for failure injection testing
 * @param {string} [params.options.failAtStep] - Injected failure step name
 * @param {string} [params.options.failAtFile] - Injected failure target file
 * @returns {Promise<void>}
 */
export async function atomicPublish({
  records,
  metadata,
  pdfAudit,
  rawSnapshot,
  reportMarkdown,
  dataDir,
  rawDir,
  reportsDir,
  rootDir,
  options = {}
}) {
  const fs = options.fs || nodeFs;
  const runId = Date.now().toString(36) + Math.random().toString(36).substring(2, 6);

  const releaseDir = join(rootDir, '.tmp-output', `release-${runId}`);
  const backupDir = join(rootDir, '.tmp-backup', `backup-${runId}`);

  let publicationSucceeded = false;
  let rollbackExecuted = false;
  let rollbackFailed = false;
  const journal = [];

  try {
    // ─── Step 1: Create release directory ─────────────────────────────
    await fs.mkdir(releaseDir, { recursive: true });

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

    if (pdfAudit) {
      dataFiles.push({ name: 'pdf-audit.json', data: pdfAudit, targetDir: dataDir });
    }
    if (rawSnapshot) {
      if (!rawDir) throw new Error('rawDir is required when rawSnapshot is published');
      dataFiles.push({ name: 'latest-fetch.json', data: rawSnapshot, targetDir: rawDir });
    }

    // ─── Step 2: Write release files to staging ───────────────────────
    for (const file of dataFiles) {
      const content = serializeJsonArtifact(file.data);
      const filePath = join(releaseDir, file.name);
      await fs.writeFile(filePath, content, 'utf8');
    }

    const reportPath = join(releaseDir, 'latest-diff.md');
    await fs.writeFile(reportPath, serializeTextArtifact(reportMarkdown), 'utf8');

    // ─── Step 3: Validate Schemas & Cross-File Constraints ─────────────
    await validateAllReleaseArtifactsSchemas({
      records, stores, lockers, partners, byDistrict, metadata, pdfAudit
    });
    if (rawSnapshot) {
      const rawSchemaResult = await validateRawSnapshotSchema(rawSnapshot);
      if (!rawSchemaResult.valid) {
        throw new Error(`Raw snapshot schema validation failed:\n${rawSchemaResult.errors.join('\n')}`);
      }
    }
    validateCrossFile(records, stores, lockers, partners, byDistrict, metadata);

    // ─── Step 4: Prepare backups & journal ────────────────────────────
    if (options.failAtStep === 'backup') {
      throw new Error('Injected failure during backup creation');
    }

    await fs.mkdir(backupDir, { recursive: true });
    await fs.mkdir(dataDir, { recursive: true });
    if (rawSnapshot) await fs.mkdir(rawDir, { recursive: true });
    await fs.mkdir(reportsDir, { recursive: true });

    const publishTasks = [
      ...dataFiles.map(f => ({ name: f.name, src: join(releaseDir, f.name), dest: join(f.targetDir, f.name) })),
      { name: 'latest-diff.md', src: reportPath, dest: join(reportsDir, 'latest-diff.md') }
    ];

    for (const task of publishTasks) {
      const existedBefore = existsSync(task.dest);
      let backupPath = null;

      if (existedBefore) {
        backupPath = join(backupDir, task.name);
        await fs.copyFile(task.dest, backupPath);
      }

      journal.push({
        name: task.name,
        dest: task.dest,
        existedBefore,
        backupPath,
        replaced: false
      });
    }

    // ─── Step 5: Sequential atomic replacement (temp file + rename) ──
    for (let i = 0; i < publishTasks.length; i++) {
      const task = publishTasks[i];
      const entry = journal[i];

      if (options.failAtStep === 'tempCopy' || (options.failAtFile === task.name && options.failAtStep === 'tempCopy')) {
        throw new Error(`Injected failure during temp copy of ${task.name}`);
      }

      const tempDestPath = `${task.dest}.new-${runId}`;
      await fs.copyFile(task.src, tempDestPath);

      if (
        options.failAtFile === task.name ||
        (options.failAtStep === 'firstRename' && i === 0) ||
        (options.failAtStep === 'middleRename' && i === 2) ||
        (options.failAtStep === 'reportRename' && task.name === 'latest-diff.md')
      ) {
        // Clean temp file before throwing injected error
        await fs.rm(tempDestPath, { force: true }).catch(() => {});
        throw new Error(`Injected failure before rename of ${task.name}`);
      }

      // Atomic rename completed temp file over destination
      await fs.rename(tempDestPath, task.dest);
      entry.replaced = true;
    }

    publicationSucceeded = true;

    // ─── Step 6: Clean up temporary release directory on success ─────
    if (options.failAtStep === 'cleanup') {
      throw new Error('Injected failure during cleanup');
    }

    await fs.rm(releaseDir, { recursive: true, force: true }).catch(() => {});
    await fs.rm(backupDir, { recursive: true, force: true }).catch(() => {});

  } catch (err) {
    // ─── Step 7: Journaled Rollback on Failure ────────────────────────
    console.error(`\nAtomic publication failed (${err.message}). Initiating journaled rollback...`);
    rollbackExecuted = true;

    const rollbackErrors = [];
    try {
      if (options.failAtStep === 'rollback') {
        throw new Error('Injected failure during rollback execution');
      }

      // Rollback journal entries in reverse order
      const journalToRollback = [...journal].reverse();
      for (const entry of journalToRollback) {
        if (entry.existedBefore && entry.backupPath && existsSync(entry.backupPath)) {
          await fs.copyFile(entry.backupPath, entry.dest);
        } else if (!entry.existedBefore && existsSync(entry.dest)) {
          await fs.rm(entry.dest, { force: true });
        }
      }
    } catch (rbErr) {
      rollbackFailed = true;
      rollbackErrors.push(rbErr.message);
      console.error(`CRITICAL: Rollback failed! Backups preserved at '${backupDir}'. Error: ${rbErr.message}`);
    }

    if (rollbackFailed) {
      throw new Error(`CRITICAL_ROLLBACK_FAILURE: Publication failed (${err.message}) AND rollback failed (${rollbackErrors.join('; ')}). Backup files preserved at '${backupDir}'.`);
    }

    throw new Error(`Atomic publish failed with full rollback executed: ${err.message}`);
  } finally {
    // Preserves backupDir if rollback failed, ensuring recovery copies are never lost
    if (publicationSucceeded || (rollbackExecuted && !rollbackFailed)) {
      if (existsSync(releaseDir)) await fs.rm(releaseDir, { recursive: true, force: true }).catch(() => {});
      if (existsSync(backupDir)) await fs.rm(backupDir, { recursive: true, force: true }).catch(() => {});
    }
  }
}
