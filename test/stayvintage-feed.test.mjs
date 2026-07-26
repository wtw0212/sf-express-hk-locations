import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

test("publishes the complete StayVintage locations feed", async () => {
  const snapshot = JSON.parse(
    await readFile(
      new URL("../data/locations.json", import.meta.url),
      "utf8"
    )
  )

  assert.equal(snapshot.schema_version, 1)
  assert.equal(snapshot.counts.total, snapshot.locations.length)
  assert.ok(snapshot.counts.total >= 1_000)

  for (const type of ["station", "locker", "partner"]) {
    assert.ok(snapshot.counts[type] > 0)
  }
})
