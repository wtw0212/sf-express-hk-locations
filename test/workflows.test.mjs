import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('PR CI uses only pull_request and the immutable event base SHA', async () => {
  const workflow = await readFile('.github/workflows/ci.yml', 'utf8');
  assert.match(workflow, /pull_request:/);
  assert.doesNotMatch(workflow, /^\s+push:/m);
  assert.match(workflow, /\$\{\{\s*github\.event\.pull_request\.base\.sha\s*\}\}/);
  assert.doesNotMatch(workflow, /9b6a14e24116da9973052d6bfff7ae07b793e025/);
  assert.match(workflow, /--locations/);
  assert.match(workflow, /--reviewed-registry/);
  assert.doesNotMatch(workflow, /contents:\s*write/);
});

test('scheduled sync serializes publication and uses a normal explicit main push', async () => {
  const workflow = await readFile('.github/workflows/sync.yml', 'utf8');
  assert.match(workflow, /group:\s*sf-location-sync-main/);
  assert.match(workflow, /cancel-in-progress:\s*false/);
  assert.match(workflow, /git push origin HEAD:main/);
  assert.doesNotMatch(workflow, /--force/);
});
