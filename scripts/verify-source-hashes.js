#!/usr/bin/env node
// @ts-check
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { verifyReleaseIntegrity } from './lib/source-hash-verifier.js';
import { loadReviewedPdfRegistry } from './lib/reviewed-pdf-registry.js';
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
  const locationsPath = valueAfter('--locations');
  const reviewedRegistryPath = valueAfter('--reviewed-registry');
  if (!snapshotPath || !metadataPath || !locationsPath || !reviewedRegistryPath) {
    throw new Error(
      'Usage: verify-source-hashes.js --snapshot <path> --metadata <path> --locations <path> --reviewed-registry <path>'
    );
  }

  const snapshot = JSON.parse(await readFile(resolve(snapshotPath), 'utf8'));
  const metadata = JSON.parse(await readFile(resolve(metadataPath), 'utf8'));
  const locations = JSON.parse(await readFile(resolve(locationsPath), 'utf8'));
  const reviewedRegistry = await loadReviewedPdfRegistry(resolve(reviewedRegistryPath));

  const rawSchema = await validateRawSnapshotSchema(snapshot);
  if (!rawSchema.valid) {
    throw new Error(`Raw snapshot schema validation failed:\n${rawSchema.errors.join('\n')}`);
  }
  const metadataSchema = await validateMetadataSchema(metadata);
  if (!metadataSchema.valid) {
    throw new Error(`Metadata schema validation failed:\n${metadataSchema.errors.join('\n')}`);
  }

  verifyReleaseIntegrity({
    snapshot,
    metadata,
    locations,
    reviewedRegistryRecords: reviewedRegistry.records
  });
  console.log('Full release integrity verification passed.');
}

main().catch(error => {
  console.error(error.message || error);
  process.exit(1);
});
