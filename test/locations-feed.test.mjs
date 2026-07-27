import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

test("publishes the complete locations feed", async () => {
  const locations = JSON.parse(
    await readFile(
      new URL("../data/locations.json", import.meta.url),
      "utf8"
    )
  )

  assert.ok(Array.isArray(locations))
  assert.ok(locations.length >= 1_000)

  const types = new Set(locations.map((l) => l.type))
  assert.ok(types.has("store"))
  assert.ok(types.has("locker"))
  assert.ok(types.has("partner"))
})
