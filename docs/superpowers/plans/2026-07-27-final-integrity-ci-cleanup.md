# PR #2 Final Integrity and CI Cleanup Plan

## Safety model

- Canonical publication remains API-first and atomic.
- Reviewed partner data can enter canonical output only through the committed registry and schema-valid internal model.
- Raw PDF extraction remains audit-only.
- A previously published SSR-only record cannot disappear merely because SSR parsing unexpectedly returns no records.
- Raw hashes cover the exact HTTP response text; semantic hashes cover stable, normalized content and exclude volatile evidence.
- A v3 baseline must contain complete integrity metadata. Older or absent metadata is accepted only through an explicit one-shot legacy migration flag.
- CI derives its immutable baseline from the pull request base commit and never writes repository data.
- Scheduled publication may write only through an ordinary, non-force push to `main`.

## Implementation

1. Add regression tests for explicit legacy baseline handling and strict v3 integrity enforcement.
2. Upgrade metadata to schema version 3 and make regression-gate inputs explicit.
3. Add missing-address derivation provenance and source-specific publication gates.
4. Expand the integrity verifier to independently recalculate API, SSR, reviewed-registry, PDF-text, and canonical hashes.
5. Remove redundant stored aggregate API records and metadata record-hash maps; centralize PDF document evidence.
6. Guarantee exactly one trailing newline for every generated JSON and Markdown artifact.
7. Harden pull-request and scheduled workflows, including immutable base selection and concurrency.
8. Regenerate fixture artifacts and validate them against the actual merge-base.
9. Run the complete local verification matrix, inspect the final diff, commit, and push only the PR branch.
10. Wait for and report a visible green GitHub Actions run for the exact final commit; leave PR #2 unmerged.

## Required verification

- `npm test`
- fixture sync dry-run using the actual merge-base baseline
- full source-integrity verifier with snapshot, metadata, locations, and reviewed registry
- schema validation
- forbidden-source scan
- exact trailing-newline validation
- clean-tree check
- GitHub Actions success for the final pushed SHA
