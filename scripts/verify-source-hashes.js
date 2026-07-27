#!/usr/bin/env node
// @ts-check
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { verifySourceHashes } from './lib/source-hash-verifier.js';
import {
  validateMetadataSchema,
  validateRawSnapshotSchema
} from './lib/schema-validator.js';

function valueAfter(flag) {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : null;
}

async function main() {
  const snapshotPath = valueAfter('--snapshot');
  const metadataPath = valueAfter('--metadata');
  if (!snapshotPath || !metadataPath) {
    throw new Error('Usage: verify-source-hashes.js --snapshot <path> --metadata <path>');
  }

  const snapshot = JSON.parse(await readFile(resolve(snapshotPath), 'utf8'));
  const metadata = JSON.parse(await readFile(resolve(metadataPath), 'utf8'));

  const rawSchema = await validateRawSnapshotSchema(snapshot);
  if (!rawSchema.valid) {
    throw new Error(`Raw snapshot schema validation failed:\n${rawSchema.errors.join('\n')}`);
  }
  const metadataSchema = await validateMetadataSchema(metadata);
  if (!metadataSchema.valid) {
    throw new Error(`Metadata schema validation failed:\n${metadataSchema.errors.join('\n')}`);
  }

  verifySourceHashes(snapshot, metadata);
  console.log('Source hash verification passed.');
}

main().catch(error => {
  console.error(error.message || error);
  process.exit(1);
});
