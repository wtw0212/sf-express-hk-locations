const ISLAND_REGIONS = new Set([
  "大嶼山區",
  "南丫島區",
  "坪洲區",
  "長洲區",
])

const LOCATION_TYPES = ["station", "locker", "partner"]
const MIN_LOCATION_COUNT = 1000

const normalizeRegion = (region) =>
  ISLAND_REGIONS.has(region) ? "離島區" : region

const cleanText = (value) => {
  if (typeof value === "string") {
    return value.replace(/\s+/g, " ").trim().replaceAll("天後", "天后")
  }

  if (value === null || value === undefined) {
    return ""
  }

  return JSON.stringify(value)
}

export const extractHongKongAreas = (regionData) => {
  const hongKong = regionData.find((region) => region?.f === "香港")
  const city = hongKong?.city?.find((item) => item?.f === "香港")

  return (city?.county || []).flatMap((county) =>
    (county?.town || []).map((town) => ({
      sourceRegion: cleanText(county?.f),
      region: normalizeRegion(cleanText(county?.f)),
      district: cleanText(town?.f),
    }))
  )
}

const classifyLocation = (code, name) => {
  if (code.startsWith("H852") || name.includes("順豐自助櫃")) {
    return "locker"
  }

  if (name.includes("順豐站")) {
    return "station"
  }

  return "partner"
}

const toCoordinate = (value) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

const isPickupLocation = (location) => {
  const code = cleanText(location?.serviceCode)
  const searchableText = [
    location?.name,
    location?.address,
    location?.note,
    location?.hot,
  ]
    .map(cleanText)
    .join(" ")

  return (
    code.startsWith("852") ||
    code.startsWith("H852")
  ) &&
    !searchableText.includes("澳門") &&
    !/(只提供寄件|只供寄件|不設取件|暫停服務|已停止服務|已結業)/.test(
      searchableText
    )
}

export const normalizeLocations = (rawLocations) => {
  const byCode = new Map()

  for (const raw of rawLocations) {
    if (!isPickupLocation(raw)) {
      continue
    }

    const code = cleanText(raw.serviceCode)
    const name = cleanText(raw.name)
    const address = cleanText(raw.address)

    if (!code || !name || !address) {
      continue
    }

    byCode.set(code, {
      code,
      type: classifyLocation(code, name),
      name,
      address,
      region: normalizeRegion(cleanText(raw.city)),
      district: cleanText(raw.district),
      service_time: cleanText(raw.serviceTime),
      note: cleanText(raw.note || raw.hot),
      latitude: toCoordinate(raw.latitude),
      longitude: toCoordinate(raw.longitude),
    })
  }

  return [...byCode.values()].sort(
    (left, right) =>
      left.region.localeCompare(right.region, "zh-Hant-HK") ||
      left.district.localeCompare(right.district, "zh-Hant-HK") ||
      left.type.localeCompare(right.type) ||
      left.code.localeCompare(right.code)
  )
}

export const validateSnapshot = (snapshot) => {
  if (snapshot?.schema_version !== 1 || !Array.isArray(snapshot?.locations)) {
    throw new Error("Invalid snapshot schema")
  }

  const seenCodes = new Set()
  const typeCounts = Object.fromEntries(
    LOCATION_TYPES.map((type) => [type, 0])
  )

  for (const location of snapshot.locations) {
    if (
      !location?.code ||
      !location?.name ||
      !location?.address ||
      !location?.region ||
      !location?.district ||
      !LOCATION_TYPES.includes(location?.type)
    ) {
      throw new Error("Location is missing required fields")
    }

    if (seenCodes.has(location.code)) {
      throw new Error(`Duplicate location code: ${location.code}`)
    }

    seenCodes.add(location.code)
    typeCounts[location.type] += 1
  }

  if (LOCATION_TYPES.some((type) => typeCounts[type] === 0)) {
    throw new Error("Every location category must contain records")
  }

  if (snapshot.locations.length < MIN_LOCATION_COUNT) {
    throw new Error(
      `Location snapshot appears truncated: ${snapshot.locations.length}`
    )
  }

  if (
    snapshot?.counts?.total !== snapshot.locations.length ||
    LOCATION_TYPES.some(
      (type) => snapshot?.counts?.[type] !== typeCounts[type]
    )
  ) {
    throw new Error("Snapshot counts do not match locations")
  }

  return snapshot
}
