import { mkdir, readFile, rename, writeFile } from "node:fs/promises"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import {
  extractHongKongAreas,
  normalizeLocations,
  validateSnapshot,
} from "./locations.mjs"

const VERSION_URL =
  "https://ucmp-static.sf-express.com/proxy/ccspBase/cxDistrictData/queryDistrictActiveVersionData?area=hkmotw"
const LOCATIONS_URL =
  "https://hk.sf-express.com/sf-service-core-web/service/serviceSupport/queryServiceNetworkList?lang=tc&region=hk&translate=tc"
const OUTPUT_PATH = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../data/locations.json"
)

const fetchJson = async (url, init, attempts = 3) => {
  let lastError

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        ...init,
        signal: AbortSignal.timeout(20_000),
      })

      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      lastError = error
    }
  }

  throw lastError
}

const readExistingSnapshot = async () => {
  try {
    return JSON.parse(await readFile(OUTPUT_PATH, "utf8"))
  } catch {
    return null
  }
}

const versionResponse = await fetchJson(VERSION_URL)
const regionFileUrl = versionResponse?.obj?.fileTcUrl

if (!regionFileUrl) {
  throw new Error("SF district version response did not include fileTcUrl")
}

const regionData = await fetchJson(regionFileUrl)
const areas = extractHongKongAreas(regionData)
const rawLocations = []

for (const area of areas) {
  const response = await fetchJson(LOCATIONS_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      province: "香港",
      city: area.sourceRegion,
      district: area.district,
      serviceType: "",
      locationCode: "852",
      keyWord: "",
      bizTypeCodes: "",
    }),
  })

  if (!response?.success || !Array.isArray(response?.result)) {
    throw new Error(
      `Invalid SF location response for ${area.sourceRegion}/${area.district}`
    )
  }

  rawLocations.push(...response.result)
}

const locations = normalizeLocations(rawLocations)
const counts = {
  total: locations.length,
  station: locations.filter((location) => location.type === "station").length,
  locker: locations.filter((location) => location.type === "locker").length,
  partner: locations.filter((location) => location.type === "partner").length,
}
const snapshot = validateSnapshot({
  schema_version: 1,
  generated_at: new Date().toISOString(),
  source: {
    district_version: versionResponse.obj.version,
    district_url: regionFileUrl,
    locations_url: LOCATIONS_URL,
  },
  counts,
  locations,
})
const existing = await readExistingSnapshot()
const unchanged =
  existing &&
  JSON.stringify(existing.locations) === JSON.stringify(snapshot.locations)

if (unchanged) {
  console.log(`No location changes (${snapshot.counts.total} records)`)
  process.exit(0)
}

await mkdir(dirname(OUTPUT_PATH), { recursive: true })
const temporaryPath = `${OUTPUT_PATH}.tmp`
await writeFile(temporaryPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8")
await rename(temporaryPath, OUTPUT_PATH)

console.log(
  `Updated ${OUTPUT_PATH}: ${counts.total} locations ` +
    `(${counts.station} stations, ${counts.locker} lockers, ${counts.partner} partners)`
)
