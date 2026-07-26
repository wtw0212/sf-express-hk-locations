import test from "node:test"
import assert from "node:assert/strict"

import {
  extractHongKongAreas,
  normalizeLocations,
  validateSnapshot,
} from "../scripts/locations.mjs"

test("extractHongKongAreas exposes the official 18 districts", () => {
  const regionData = [
    {
      f: "香港",
      city: [
        {
          f: "香港",
          county: [
            { f: "中西區", town: [{ f: "中環" }] },
            { f: "大嶼山區", town: [{ f: "東涌" }] },
            { f: "南丫島區", town: [{ f: "南丫島" }] },
            { f: "坪洲區", town: [{ f: "坪洲" }] },
            { f: "長洲區", town: [{ f: "長洲" }] },
          ],
        },
      ],
    },
  ]

  assert.deepEqual(extractHongKongAreas(regionData), [
    { sourceRegion: "中西區", region: "中西區", district: "中環" },
    { sourceRegion: "大嶼山區", region: "離島區", district: "東涌" },
    { sourceRegion: "南丫島區", region: "離島區", district: "南丫島" },
    { sourceRegion: "坪洲區", region: "離島區", district: "坪洲" },
    { sourceRegion: "長洲區", region: "離島區", district: "長洲" },
  ])
})

test("normalizeLocations classifies pickup points and removes unusable entries", () => {
  const raw = [
    {
      name: "旺角黑布街順豐站",
      serviceCode: "852BE",
      address: "香港九龍油尖旺區旺角黑布街15號",
      serviceTime: "09:00-20:00",
      city: "油尖旺區",
      district: "旺角",
      longitude: "114.17",
      latitude: "22.32",
      note: "",
    },
    {
      name: "商場順豐自助櫃",
      serviceCode: "H852AA01P",
      address: "香港新界大埔區大埔測試街1號",
      serviceTime: "24小時",
      city: "大埔區",
      district: "大埔",
      note: "只供住戶使用",
    },
    {
      name: "OK便利店合作點",
      serviceCode: "852P123",
      address: "香港香港島東區北角測試街2號",
      city: "東區",
      district: "北角",
      note: "",
    },
    {
      name: "機場寄件服務",
      serviceCode: "852NOPE",
      address: "香港國際機場",
      city: "大嶼山區",
      district: "香港國際機場",
      note: "只提供寄件服務，不設取件服務",
    },
    {
      name: "澳門順豐站",
      serviceCode: "853A",
      address: "澳門",
      city: "澳門",
      district: "澳門",
      note: "",
    },
  ]

  assert.deepEqual(
    normalizeLocations(raw).map((location) => ({
      code: location.code,
      type: location.type,
      region: location.region,
      district: location.district,
    })),
    [
      {
        code: "H852AA01P",
        type: "locker",
        region: "大埔區",
        district: "大埔",
      },
      {
        code: "852P123",
        type: "partner",
        region: "東區",
        district: "北角",
      },
      {
        code: "852BE",
        type: "station",
        region: "油尖旺區",
        district: "旺角",
      },
    ]
  )
})

test("normalizeLocations uses official Hong Kong place-name orthography", () => {
  const [location] = normalizeLocations([
    {
      name: "自助櫃 天後木星街",
      serviceCode: "H852TIH01P",
      address: "香港天後木星街1號",
      city: "東區",
      district: "天後",
    },
  ])

  assert.equal(location.name, "自助櫃 天后木星街")
  assert.equal(location.address, "香港天后木星街1號")
  assert.equal(location.district, "天后")
})

test("validateSnapshot rejects truncated or duplicate datasets", () => {
  const baseLocation = {
    code: "852A",
    type: "station",
    name: "測試順豐站",
    address: "香港測試地址",
    region: "中西區",
    district: "中環",
    service_time: "",
    note: "",
    latitude: null,
    longitude: null,
  }

  assert.throws(
    () =>
      validateSnapshot({
        schema_version: 1,
        generated_at: new Date().toISOString(),
        counts: { total: 3, station: 1, locker: 1, partner: 1 },
        locations: [
          baseLocation,
          { ...baseLocation, type: "locker" },
          { ...baseLocation, type: "partner" },
        ],
      }),
    /duplicate/i
  )

  assert.throws(
    () =>
      validateSnapshot({
        schema_version: 1,
        generated_at: new Date().toISOString(),
        counts: { total: 2, station: 1, locker: 1, partner: 0 },
        locations: [
          baseLocation,
          { ...baseLocation, code: "H852A", type: "locker" },
        ],
      }),
    /category/i
  )
})
