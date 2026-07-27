import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';

test('committed artifacts follow the documented deduplication policy', async () => {
  const raw = JSON.parse(await readFile('raw/latest-fetch.json', 'utf8'));
  const metadata = JSON.parse(await readFile('data/metadata.json', 'utf8'));
  const audit = JSON.parse(await readFile('data/pdf-audit.json', 'utf8'));

  assert.equal(Object.hasOwn(raw.sources.api_tc, 'records'), false);
  assert.equal(Object.hasOwn(raw.sources.api_en, 'records'), false);
  for (const section of Object.values(metadata.source_integrity)) {
    assert.equal(Object.hasOwn(section, 'record_hashes'), false);
  }
  assert.ok(audit.documents && typeof audit.documents === 'object');
  for (const collection of [
    audit.api_pdf_conflicts,
    audit.reviewed_pdf_drift,
    audit.new_pdf_only_candidates,
    audit.missing_reviewed_records,
    audit.quarantined_records
  ]) {
    for (const entry of collection) {
      assert.equal(Object.hasOwn(entry, 'evidence'), false);
      assert.equal(typeof entry.document_id, 'string');
    }
  }
});

test('committed evidence artifacts remain within retention budgets', async () => {
  assert.ok((await stat('raw/latest-fetch.json')).size < 7_000_000);
  assert.ok((await stat('data/metadata.json')).size < 100_000);
  assert.ok((await stat('data/pdf-audit.json')).size < 700_000);
});

test('every committed JSON and Markdown artifact has exactly one trailing newline', async () => {
  for (const path of [
    'data/locations.json',
    'data/stores.json',
    'data/lockers.json',
    'data/partners.json',
    'data/locations-by-district.json',
    'data/metadata.json',
    'data/pdf-audit.json',
    'data/reviewed-pdf-partners.json',
    'raw/latest-fetch.json',
    'reports/latest-diff.md'
  ]) {
    const content = await readFile(path, 'utf8');
    assert.match(content, /[^\n]\n$/u, `${path} must have exactly one trailing newline`);
  }
});
