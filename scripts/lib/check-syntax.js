// @ts-check
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const rootDir = join(fileURLToPath(import.meta.url), '..', '..', '..');
const dirsToCheck = ['scripts', 'test'];

async function getJsFiles(dir) {
  const files = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await getJsFiles(fullPath));
    } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.mjs'))) {
      files.push(fullPath);
    }
  }

  return files;
}

async function runSyntaxCheck() {
  let allFiles = [];
  for (const dir of dirsToCheck) {
    const fullDir = join(rootDir, dir);
    allFiles.push(...await getJsFiles(fullDir));
  }

  console.log(`Checking syntax for ${allFiles.length} JavaScript files...`);

  let failed = 0;
  for (const file of allFiles) {
    const res = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
    if (res.status !== 0) {
      console.error(`Syntax error in ${file}:\n${res.stderr}`);
      failed++;
    }
  }

  if (failed > 0) {
    console.error(`Syntax check failed for ${failed} file(s).`);
    process.exit(1);
  }

  console.log(`Syntax check passed cleanly for all ${allFiles.length} files.`);
}

runSyntaxCheck().catch(err => {
  console.error('Syntax check runner error:', err);
  process.exit(1);
});
