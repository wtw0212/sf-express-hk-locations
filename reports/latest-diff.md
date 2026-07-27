# SF Express HK Location Sync Report

> **Last Updated**: `2026-07-27 14:04 (HKT UTC+8)`

---

## Summary

| Metric | Count |
| :--- | :--- |
| **Previous total** | 1672 |
| **Current total** | 1678 |
| **Stores** | 137 |
| **Lockers** | 1056 |
| **Partners** | 485 |
| **Added** | 6 |
| **Removed** | 0 |
| **Updated** | 4 |
| **Unchanged** | 1668 |

---

## Count Deltas

| Category | Previous | Current | Delta | Delta % | Baseline Source | Gate Result |
| :--- | ---: | ---: | ---: | ---: | :--- | :--- |
| total | 1672 | 1678 | +6 | +0.36% | previous_locations_feed | ✅ PASS |
| stores | 137 | 137 | +0 | +0% | previous_locations_feed | ✅ PASS |
| lockers | 1056 | 1056 | +0 | +0% | previous_locations_feed | ✅ PASS |
| partners | 479 | 485 | +6 | +1.25% | previous_locations_feed | ✅ PASS |
| tcCodes | 1666 | 1666 | +0 | +0% | previous_metadata.coverage.tc_record_count | ✅ PASS |
| enCodes | 1666 | 1666 | +0 | +0% | previous_metadata.coverage.en_record_count | ✅ PASS |

---

## Source Coverage & Status

| Metric | Value |
| :--- | :--- |
| TC API areas | 112/112 succeeded |
| EN API areas | 112/112 succeeded |
| TC unique codes | 1666 |
| EN unique codes | 1666 |
| Partner PDF HTTP Success | 8/8 |
| Partner PDF Parser Completed | 8/8 |
| Partner PDF Semantic Success | 8/8 |
| Partner PDF Quality Failures | 0 |
| Valid Partner PDF Records | 451 |
| Quarantined PDF Records | 0 |
| PDF Quarantine Ratio | 0.0% |
| SSR records | 186 |
| Bilingual match rate | 99.9% |
| District resolved | 1672 |
| District unresolved | 6 |
| With English data | 1666 |
| Missing English | 12 |

---

## Pipeline Execution Status

| Metric | Count |
| :--- | :--- |
| **Pipeline Blocking Errors** | 0 |
| **Pipeline Execution Warnings** | 0 |
| **Record Quality Warnings** | 282 |
| **Record Quality Info Flags** | 63 |
| **Record Quality Errors** | 0 |

---

## Record Quality Flags Summary

| Flag Type | Count |
| :--- | :--- |
| ENGLISH_FIELD_CONTAINS_CJK | 105 |
| SOURCE_TC_EN_STREET_NUMBER_CONFLICT | 98 |
| ADMIN_DISTRICT_ALIAS_APPLIED | 41 |
| SOURCE_TC_EN_UNIT_CONFLICT | 38 |
| SOURCE_TC_EN_BUSINESS_HOURS_CONFLICT | 21 |
| MISSING_ENGLISH_RECORD | 12 |
| MISSING_COORDINATES | 12 |
| DUPLICATE_ADDRESS_SUFFIX | 9 |
| UNRESOLVED_ADMIN_DISTRICT | 6 |
| SUBDISTRICT_ADDRESS_CONFLICT | 2 |
| SOURCE_FORMATTING_ARTIFACT | 1 |

---

## Added Locations (6)

- `852PC3002` [順豐合作點] 筲箕灣愛蝶灣自提點 -- 筲箕湾愛禮街2號愛蝶灣25號地下
- `852MA3003` [順豐合作點] 西營盤港大自提點 -- 石塘咀皇后大道西425Z永華大廈後座地舖
- `852LA3007` [順豐合作點] 葵涌康力達環保貿易公 司 -- 葵涌和宜合道167-175號金威工業大廈一期低層地下B7室
- `852FE3018` [順豐合作點] 馬鞍山富寶花園百寶袋 -- 新界馬鞍山富寶花園商場一樓F42
- `852G3006` [順豐合作點] 荃灣荃取營自取點 -- 荃灣沙咀道108號美華樓C2地舖
- `852F3017` [順豐合作點] 西貢西徑士多 -- 新界西貢西徑村32F地下

---

## Removed Locations (0)

*(No removed locations)*

---

## Updated Locations (4)

- `852GC2003` OK便利店 (青衣)
  - business_hours: `null` -> `"24小時"`
  - quality_flags: ~UNRESOLVED_ADMIN_DISTRICT
- `852FE3012` 馬鞍山錦英苑自提點
  - sub_district: `null` -> `"馬鞍山"`
  - business_hours: `null` -> `"星期一至六:12:00-20:00 星期日及公眾假期:12:00-18:00"`
  - quality_flags: ~UNRESOLVED_ADMIN_DISTRICT
- `852G3004` 荃灣提點坪有限公司
  - sub_district: `null` -> `"荃灣"`
  - business_hours: `null` -> `"星期一至六: 12:00-20:30 星期日、公眾假期: 休息 服務時間 (星期一至日及公眾假期)"`
- `852G3008` 荃灣星羽便利店
  - sub_district: `null` -> `"荃灣"`
  - business_hours: `null` -> `"星期一至六:10:00-21:00 星期日:10:00-21:00 公眾假期:休息"`
