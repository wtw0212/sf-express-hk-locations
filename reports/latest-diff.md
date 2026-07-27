# SF Express HK Location Sync Report

> **Last Updated**: `2026-07-27 14:29 (HKT UTC+8)`

---

## Summary

| Metric | Count |
| :--- | :--- |
| **Previous total** | 1678 |
| **Current total** | 1673 |
| **Stores** | 137 |
| **Lockers** | 1056 |
| **Partners** | 480 |
| **Added** | 0 |
| **Removed** | 5 |
| **Updated** | 1 |
| **Unchanged** | 1672 |

---

## Count Deltas

| Category | Previous | Current | Delta | Delta % | Baseline Source | Gate Result |
| :--- | ---: | ---: | ---: | ---: | :--- | :--- |
| total | 1678 | 1673 | -5 | -0.3% | previous_locations_feed | ✅ PASS |
| stores | 137 | 137 | +0 | +0% | previous_locations_feed | ✅ PASS |
| lockers | 1056 | 1056 | +0 | +0% | previous_locations_feed | ✅ PASS |
| partners | 485 | 480 | -5 | -1.03% | previous_locations_feed | ✅ PASS |
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
| Partner PDF Semantic Success | 7/8 |
| Partner PDF Quality Failures | 3 |
| Valid Partner PDF Records | 449 |
| Quarantined PDF Records | 6 |
| PDF Quarantine Ratio | 1.3% |
| SSR records | 186 |
| Bilingual match rate | 99.9% |
| District resolved | 1670 |
| District unresolved | 3 |
| With English data | 1666 |
| Missing English | 7 |

---

## Pipeline Execution Status

| Metric | Count |
| :--- | :--- |
| **Pipeline Blocking Errors** | 0 |
| **Pipeline Execution Warnings** | 5 |
| **Record Quality Warnings** | 274 |
| **Record Quality Info Flags** | 58 |
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
| DUPLICATE_ADDRESS_SUFFIX | 9 |
| MISSING_ENGLISH_RECORD | 7 |
| MISSING_COORDINATES | 7 |
| UNRESOLVED_ADMIN_DISTRICT | 3 |
| SUBDISTRICT_ADDRESS_CONFLICT | 2 |
| SOURCE_FORMATTING_ARTIFACT | 1 |

---

## Pipeline Execution Warnings (5)

- ⚠️ Partner PDF overall quarantine ratio 1.3% exceeds warning threshold 1% (6/455 quarantined)
- ⚠️ Partner PDF 'ASP_HK_TC' quarantine ratio 8.3% exceeds warning threshold 1%
- ⚠️ Partner PDF 'ASP_KLN_TC' quarantine ratio 2.2% exceeds warning threshold 1%
- ⚠️ Partner PDF 'ASP_NT_TC' quarantine ratio 4.1% exceeds warning threshold 1%
- ⚠️ Quarantined 6 corrupted or ambiguous partner PDF records (reasons: SERVICE_CODE_MISMATCH, NAME_EQUALS_ADDRESS)

---

## Added Locations (0)

*(No added locations)*

---

## Removed Locations (5)

- `852PC3002` [順豐合作點] 筲箕灣愛蝶灣自提點 -- 筲箕湾愛禮街2號愛蝶灣25號地下
- `852MA3003` [順豐合作點] 西營盤港大自提點 -- 石塘咀皇后大道西425Z永華大廈後座地舖
- `852FE3018` [順豐合作點] 馬鞍山富寶花園百寶袋 -- 新界馬鞍山富寶花園商場一樓F42
- `852G3006` [順豐合作點] 荃灣荃取營自取點 -- 荃灣沙咀道108號美華樓C2地舖
- `852F3017` [順豐合作點] 西貢西徑士多 -- 新界西貢西徑村32F地下

---

## Updated Locations (1)

- `852LA3007` 順豐合作點
  - name: `"葵涌康力達環保貿易公 司"` -> `"順豐合作點"`
  - sub_district: `"葵涌"` -> `null`
  - business_hours: `"星期一至六:12:00-18:00 星期日及公眾假期:休息"` -> `"星期一至六:12:00-18:00 星期日及公眾假期:休息 葵涌 GS集運王（瑞景大 廈）"`
  - quality_flags: ~UNRESOLVED_ADMIN_DISTRICT
