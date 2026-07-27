# Source Hash Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make PR #2 fail closed on silent SSR loss and provide independently verifiable raw, semantic, PDF, and canonical integrity hashes without changing API-first precedence.

**Architecture:** Add one pure hashing/canonicalization module and one verifier module, then thread their calculated evidence through HTTP fetch results, the raw snapshot, metadata, fixture validation, and atomic publication. Keep live PDFs audit-only, split PDF binary and extracted-text evidence, and make CI exercise the same verifier against an isolated output directory.

**Tech Stack:** Node.js 20 ESM, built-in `node:crypto`, `node:test`, Ajv JSON Schema, GitHub Actions.

## Global Constraints

- Work only on `refactor/pipeline-hardening`; do not merge the PR and do not push to `main`.
- Preserve canonical priority `api_tc`, `api_en`, `ssr`, `reviewed_pdf_partner`.
- Raw `pdf_partner` records remain audit-only and never enter canonical output.
- Raw hashes come from exact stored HTTP response text, never reserialized parsed JSON.
- Semantic hashes exclude volatile transport and timestamp fields.
- All new structures remain deterministic under area, record, and object-key reordering.
- Fixture verification independently recalculates hashes from stored content.
- Publication remains schema-validated and atomic.

---

### Task 1: Fail closed on every SSR-only removal

**Files:**
- Modify: `scripts/lib/validate.js`
- Modify: `test/migration-safety.test.mjs`

**Interfaces:**
- Consumes: `checkCompletenessGates({ ssrResult, records, previousRecords, ... })`
- Produces: a blocking error whenever a previous `source === "ssr"` code is absent from final canonical records.

- [x] **Step 1: Add the silent-success regression cases**

```js
assert.equal(checkCompletenessGates({
  ...validSources,
  ssrResult: { ok: true, errors: [], records: [] },
  previousRecords: [{ code: 'H852SSR1', source: 'ssr', type: 'locker' }],
  records: []
}).pass, false);
```

- [x] **Step 2: Run the focused test and verify RED**

Run: `node --test --test-name-pattern='SSR' test/migration-safety.test.mjs`

Expected: the silent zero-record case fails because removal is currently conditional on `errors`.

- [x] **Step 3: Move removal comparison outside the SSR error branch**

```js
const removedSsrCodes = [...previousSsrCodes]
  .filter(code => !finalCodes.has(code))
  .sort();
if (removedSsrCodes.length) {
  errors.push(`Previously published SSR-only records were removed: ${removedSsrCodes.join(', ')}`);
}
```

- [x] **Step 4: Run focused SSR tests and verify GREEN**

Run: `node --test --test-name-pattern='SSR' test/migration-safety.test.mjs`

- [x] **Step 5: Commit**

```bash
git add scripts/lib/validate.js test/migration-safety.test.mjs
git commit -m "Block silent SSR-only removals"
```

### Task 2: Deterministic source and canonical hashing

**Files:**
- Create: `scripts/lib/source-hashes.js`
- Create: `test/source-hashes.test.mjs`

**Interfaces:**
- Produces: `sha256`, `stableStringify`, `canonicalizeApiRecord`, `canonicalizeApiRecords`, `calculateApiSnapshotHashes`, `calculateCanonicalDatasetHash`, `diffRecordHashes`.
- Duplicate result: `{ records, record_hashes, duplicate_codes }`, where duplicate selection is based on sorted canonical serialization rather than arrival order.

- [x] **Step 1: Add raw, stable serialization, ordering, volatile-field, duplicate, and record-diff tests**

```js
assert.notEqual(sha256('{"a":1}'), sha256('{ "a": 1 }'));
assert.equal(stableStringify({ b: 2, a: 1 }), '{"a":1,"b":2}');
assert.equal(
  calculateApiSnapshotHashes(areaOrderA).semantic_sha256,
  calculateApiSnapshotHashes(areaOrderB).semantic_sha256
);
assert.deepEqual(diffRecordHashes(previous, current), {
  added: ['852NEW'], removed: ['852OLD'], changed: ['852CHANGED'], unchanged: ['852SAME']
});
```

- [x] **Step 2: Run the new test and verify RED**

Run: `node --test test/source-hashes.test.mjs`

Expected: module-not-found failure.

- [x] **Step 3: Implement strict stable serialization and semantic contracts**

```js
export function canonicalizeApiRecord(record) {
  return {
    serviceCode: record.serviceCode ?? null,
    name: record.name ?? null,
    address: record.address ?? null,
    city: record.city ?? null,
    district: record.district ?? null,
    serviceTime: record.serviceTime ?? null,
    latitude: record.latitude ?? null,
    longitude: record.longitude ?? null,
    serviceType: record.serviceType ?? null
  };
}
```

- [x] **Step 4: Run the source-hash tests and verify GREEN**

Run: `node --test test/source-hashes.test.mjs`

- [x] **Step 5: Commit**

```bash
git add scripts/lib/source-hashes.js test/source-hashes.test.mjs
git commit -m "Add deterministic source hashing"
```

### Task 3: Preserve exact API response text and build verifiable raw snapshots

**Files:**
- Modify: `scripts/lib/api-client.js`
- Modify: `scripts/lib/source-fetchers.js`
- Modify: `scripts/lib/raw-snapshot.js`
- Modify: `scripts/sync.js`
- Create: `schema/raw-snapshot.schema.json`
- Modify: `scripts/lib/schema-validator.js`
- Modify: `test/source-fetchers.test.mjs`
- Create: `test/source-hash-verifier.test.mjs`

**Interfaces:**
- HTTP JSON result adds `rawText` and `raw_sha256`.
- Each raw area adds `raw_response_text`, `raw_sha256`, and `semantic_sha256`.
- API source summaries add `record_count`, `raw_snapshot_sha256`, `semantic_sha256`, `record_hashes`, and `duplicate_codes`.

- [x] **Step 1: Add an HTTP test proving raw hash uses exact text**

```js
const exact = '{ "success": true, "result": [] }\n';
assert.equal(result.rawText, exact);
assert.equal(result.raw_sha256, createHash('sha256').update(exact).digest('hex'));
```

- [x] **Step 2: Add fixture-verifier tests that mutate raw text, records, and stored hashes**

```js
const tampered = structuredClone(snapshot);
tampered.sources.api_tc.results[0].raw_response_text += ' ';
assert.throws(() => verifySourceHashes({ snapshot: tampered, metadata }), /raw hash mismatch/);
```

- [x] **Step 3: Run the focused tests and verify RED**

Run: `node --test test/source-fetchers.test.mjs test/source-hash-verifier.test.mjs`

- [x] **Step 4: Read JSON responses as text first and build the hash-rich snapshot in memory**

```js
const rawText = await response.text();
const raw_sha256 = sha256(rawText);
const data = JSON.parse(rawText);
return { ok: true, status: response.status, attempts: attempt, error: null, data, rawText, raw_sha256 };
```

- [x] **Step 5: Validate fixture hashes before normalization and validate raw-snapshot schema**

```js
verifySourceHashes({ snapshot: rawSnap });
await validateRawSnapshotSchema(rawSnap);
```

- [x] **Step 6: Run focused tests and verify GREEN**

Run: `node --test test/source-fetchers.test.mjs test/source-hash-verifier.test.mjs`

- [x] **Step 7: Commit**

```bash
git add scripts/lib/api-client.js scripts/lib/source-fetchers.js scripts/lib/raw-snapshot.js scripts/sync.js schema/raw-snapshot.schema.json scripts/lib/schema-validator.js test/source-fetchers.test.mjs test/source-hash-verifier.test.mjs
git commit -m "Preserve and verify raw API responses"
```

### Task 4: Metadata integrity and pipeline-regression gate

**Files:**
- Modify: `scripts/lib/source-hashes.js`
- Modify: `scripts/lib/validate.js`
- Modify: `scripts/sync.js`
- Modify: `schema/metadata.schema.json`
- Modify: `test/migration-safety.test.mjs`
- Modify: `test/schema-validator.test.mjs`

**Interfaces:**
- Metadata adds `source_integrity.api_tc`, `source_integrity.api_en`, `source_integrity.canonical`, `source_integrity.ssr`, and `source_integrity.reviewed_registry`.
- Produces: `checkPipelineRegression({ previousIntegrity, currentIntegrity, migrationApproved })`.

- [x] **Step 1: Add unchanged-source/changed-canonical and approved-migration tests**

```js
assert.equal(checkPipelineRegression({
  previousIntegrity: { api_tc: { semantic_sha256: 'a' }, api_en: { semantic_sha256: 'b' }, canonical: { semantic_sha256: 'old' }, ssr: { semantic_sha256: 's' }, reviewed_registry: { semantic_sha256: 'r' } },
  currentIntegrity: { api_tc: { semantic_sha256: 'a' }, api_en: { semantic_sha256: 'b' }, canonical: { semantic_sha256: 'new' }, ssr: { semantic_sha256: 's' }, reviewed_registry: { semantic_sha256: 'r' } }
}).pass, false);
```

- [x] **Step 2: Run focused tests and verify RED**

Run: `node --test --test-name-pattern='pipeline regression|source_integrity' test/migration-safety.test.mjs test/schema-validator.test.mjs`

- [x] **Step 3: Calculate metadata hashes and gate unexplained canonical drift**

```js
const explained =
  migrationApproved ||
  previousIntegrity.ssr.semantic_sha256 !== currentIntegrity.ssr.semantic_sha256 ||
  previousIntegrity.reviewed_registry.semantic_sha256 !== currentIntegrity.reviewed_registry.semantic_sha256;
```

- [x] **Step 4: Run focused tests and verify GREEN**

Run: `node --test --test-name-pattern='pipeline regression|source_integrity' test/migration-safety.test.mjs test/schema-validator.test.mjs`

- [x] **Step 5: Commit**

```bash
git add scripts/lib/source-hashes.js scripts/lib/validate.js scripts/sync.js schema/metadata.schema.json test/migration-safety.test.mjs test/schema-validator.test.mjs
git commit -m "Gate unexplained canonical drift"
```

### Task 5: Split and independently verify PDF evidence hashes

**Files:**
- Modify: `scripts/lib/source-fetchers.js`
- Modify: `scripts/lib/reviewed-pdf-registry.js`
- Modify: `scripts/lib/pdf-audit.js`
- Modify: `data/reviewed-pdf-partners.json`
- Modify: `schema/reviewed-pdf-partners.schema.json`
- Modify: `schema/pdf-audit.schema.json`
- Modify: `test/migration-safety.test.mjs`
- Modify: `test/pdf-parsers.test.mjs`

**Interfaces:**
- PDF documents expose `document_binary_sha256` and `extracted_text_sha256`.
- Reviewed entries expose `reviewed_document_binary_sha256` and `reviewed_extracted_text_sha256`.
- Fixture verification recalculates extracted-text hashes and never derives binary hashes from text.

- [x] **Step 1: Add binary/text separation and reviewed-evidence recalculation tests**

```js
assert.equal(record.reviewed_extracted_text_sha256, sha256(rawDocument.text));
assert.notEqual(rawDocument.document_binary_sha256, rawDocument.extracted_text_sha256);
```

- [x] **Step 2: Run focused tests and verify RED**

Run: `node --test --test-name-pattern='binary|extracted|reviewed evidence' test/migration-safety.test.mjs test/pdf-parsers.test.mjs`

- [x] **Step 3: Split live, fixture, registry, audit, and schema fields**

```js
const document_binary_sha256 = sha256(Buffer.from(buffer));
const extracted_text_sha256 = sha256(data.text || '');
```

- [x] **Step 4: Run focused tests and verify GREEN**

Run: `node --test --test-name-pattern='binary|extracted|reviewed evidence' test/migration-safety.test.mjs test/pdf-parsers.test.mjs`

- [x] **Step 5: Commit**

```bash
git add scripts/lib/source-fetchers.js scripts/lib/reviewed-pdf-registry.js scripts/lib/pdf-audit.js data/reviewed-pdf-partners.json schema/reviewed-pdf-partners.schema.json schema/pdf-audit.schema.json test/migration-safety.test.mjs test/pdf-parsers.test.mjs
git commit -m "Split PDF binary and text evidence"
```

### Task 6: Conservative PDF comparison equivalence

**Files:**
- Modify: `scripts/lib/pdf-audit.js`
- Modify: `test/migration-safety.test.mjs`

**Interfaces:**
- Address comparison treats `平台/平臺`, `鋪/舖`, and `葵湧/葵涌` as formatting-only.
- Hours comparison treats an end time of `24:00` and `00:00` as equivalent only when all other content matches.

- [x] **Step 1: Add exact positive and negative equivalence tests**

```js
assert.equal(compare('06:30-24:00', '06:30-00:00'), 'equivalent_difference');
assert.equal(compare('06:30-23:00', '06:30-00:00'), 'semantic_conflict');
```

- [x] **Step 2: Run focused audit tests and verify RED**

Run: `node --test --test-name-pattern='平台|鋪|24:00|23:00' test/migration-safety.test.mjs`

- [x] **Step 3: Extend comparison-only normalizers**

```js
return normalizeTextForComparison(value)
  .replace(/平台/g, '平臺')
  .replace(/鋪/g, '舖')
  .replace(/葵湧/g, '葵涌');
```

- [x] **Step 4: Run focused tests and verify GREEN**

Run: `node --test --test-name-pattern='平台|鋪|24:00|23:00' test/migration-safety.test.mjs`

- [x] **Step 5: Commit**

```bash
git add scripts/lib/pdf-audit.js test/migration-safety.test.mjs
git commit -m "Normalize PDF audit equivalences"
```

### Task 7: Atomic raw publication, verifier CLI, artifacts, CI, and final evidence

**Files:**
- Create: `scripts/verify-source-hashes.js`
- Modify: `scripts/lib/atomic-publish.js`
- Modify: `scripts/sync.js`
- Modify: `scripts/lib/check-syntax.js`
- Modify: `.github/workflows/ci.yml`
- Modify: `README.md`
- Regenerate: `raw/latest-fetch.json`
- Regenerate: `data/metadata.json`
- Regenerate: `data/pdf-audit.json`
- Regenerate: `reports/latest-diff.md`
- Modify: `test/atomic-publish.test.mjs`
- Modify: `test/integration.test.mjs`

**Interfaces:**
- Atomic publication includes `raw/latest-fetch.json`.
- CLI: `node scripts/verify-source-hashes.js --snapshot <path> --metadata <path>`.
- CI supports PR and PR-branch push events with read-only permissions and event-safe immutable baseline selection.

- [x] **Step 1: Add atomic raw rollback and verifier CLI integration tests**

```js
await assert.rejects(
  atomicPublish({ ...artifacts, rawSnapshot, failAtFile: 'latest-fetch.json' }),
  /full rollback/
);
```

- [x] **Step 2: Run integration tests and verify RED**

Run: `node --test test/atomic-publish.test.mjs test/integration.test.mjs`

- [x] **Step 3: Include raw snapshot in release artifacts and atomic publication**

```js
dataFiles.push({ name: 'latest-fetch.json', data: rawSnapshot, targetDir: rawDir });
```

- [x] **Step 4: Implement verifier CLI and CI steps**

```yaml
- name: Verify Source Hashes
  run: node scripts/verify-source-hashes.js --snapshot "$RUNNER_TEMP/sf-fixture-output/raw/latest-fetch.json" --metadata "$RUNNER_TEMP/sf-fixture-output/data/metadata.json"
```

- [x] **Step 5: Generate a live non-publishing snapshot with exact API response text, then regenerate committed artifacts against an immutable baseline**

Run: `npm run sync -- --dry-run --baseline-dir "$PWD/data" --reviewed-registry "$PWD/data/reviewed-pdf-partners.json" --output-dir /tmp/sf-live-verification`

- [x] **Step 6: Run the complete local verification contract**

```bash
npm ci
npm run check:syntax
npm test
node scripts/verify-source-hashes.js --snapshot /tmp/sf-final-output/raw/latest-fetch.json --metadata /tmp/sf-final-output/data/metadata.json
git diff --check
```

- [ ] **Step 7: Commit, push only the PR branch, and monitor the final Actions run**

```bash
git add .github README.md data raw reports schema scripts test docs
git commit -m "Complete source integrity hardening"
git push origin refactor/pipeline-hardening
gh run watch --exit-status
```
