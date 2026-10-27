# SF Express HK Location Sync Report

> **Last Updated**: `2026-10-27 12:09 (HKT UTC+8)`

---

## Summary

| Metric | Count |
| :--- | :--- |
| **Previous total** | 1653 |
| **Current total** | 1648 |
| **Stores** | 140 |
| **Lockers** | 1047 |
| **Partners** | 461 |
| **Added** | 0 |
| **Removed** | 5 |
| **Updated** | 2 |
| **Unchanged** | 1646 |

---

## Count Deltas

| Category | Previous | Current | Delta | Delta % | Baseline Source | Gate Result |
| :--- | ---: | ---: | ---: | ---: | :--- | :--- |
| total | 1653 | 1648 | -5 | -0.3% | previous_locations_feed | ✅ PASS |
| stores | 140 | 140 | +0 | +0% | previous_locations_feed | ✅ PASS |
| lockers | 1050 | 1047 | -3 | -0.29% | previous_locations_feed | ✅ PASS |
| partners | 463 | 461 | -2 | -0.43% | previous_locations_feed | ✅ PASS |
| tcCodes | 1648 | 1643 | -5 | -0.3% | previous_metadata.coverage.tc_record_count | ✅ PASS |
| enCodes | 1647 | 1642 | -5 | -0.3% | previous_metadata.coverage.en_record_count | ✅ PASS |

---

## Source Coverage & Status

| Metric | Value |
| :--- | :--- |
| TC API areas | 112/112 succeeded |
| EN API areas | 112/112 succeeded |
| TC unique codes | 1643 |
| EN unique codes | 1642 |
| Partner PDF HTTP Success | 8/8 |
| Partner PDF Parser Completed | 8/8 |
| Partner PDF Semantic Success | 5/8 |
| Partner PDF Quality Failures | 3 |
| Valid Partner PDF Records | 428 |
| Quarantined PDF Records | 11 |
| PDF Quarantine Ratio | 2.5% |
| SSR records | 190 |
| Bilingual match rate | 99.9% |
| District resolved | 1648 |
| District unresolved | 0 |
| With English data | 1642 |
| Missing English | 6 |

---

## Pipeline Execution Status

| Metric | Count |
| :--- | :--- |
| **Pipeline Blocking Errors** | 0 |
| **Pipeline Execution Warnings** | 5 |
| **Record Quality Warnings** | 253 |
| **Record Quality Info Flags** | 62 |
| **Record Quality Errors** | 0 |

---

## Record Quality Flags Summary

| Flag Type | Count |
| :--- | :--- |
| SOURCE_TC_EN_STREET_NUMBER_CONFLICT | 96 |
| ENGLISH_FIELD_CONTAINS_CJK | 91 |
| ADMIN_DISTRICT_ALIAS_APPLIED | 43 |
| SOURCE_TC_EN_UNIT_CONFLICT | 38 |
| SOURCE_TC_EN_BUSINESS_HOURS_CONFLICT | 20 |
| DUPLICATE_ADDRESS_SUFFIX | 10 |
| MISSING_ENGLISH_RECORD | 6 |
| MISSING_COORDINATES | 5 |
| SOURCE_FORMATTING_ARTIFACT | 4 |
| SUBDISTRICT_ADDRESS_CONFLICT | 2 |

---

## Pipeline Execution Warnings (5)

- ⚠️ Partner PDF overall quarantine ratio 2.5% exceeds warning threshold 1% (11/439 quarantined)
- ⚠️ Partner PDF 'OK_KLN_TC' quarantine ratio 6.7% exceeds warning threshold 1%
- ⚠️ Partner PDF 'ASP_HK_TC' quarantine ratio 4.3% exceeds warning threshold 1%
- ⚠️ Partner PDF 'ASP_NT_TC' quarantine ratio 4.5% exceeds warning threshold 1%
- ⚠️ [Audit warning] Severe PDF parser quarantines would remove previously published records: 852FE3017

---

## Added Locations (0)

*(No added locations)*

---

## Removed Locations (5)

- `852CH3008` [順豐合作點] 合作店 牛虹安寧花園 -- 新界將軍澳常寧路10號安寧花園第一座地下G3號鋪 牛虹安寧花園*
- `852FE3017` [順豐合作點] 合作店 西徑士多 -- 西貢西徑村32F地下 西徑士多（14：00-16：00午休時段）*
- `H852AB09P` [順豐智能櫃] 自助櫃 大埔大元邨泰民樓地下2號鋪(一號櫃) -- 大埔大元邨泰民樓地下2號鋪一號櫃*
- `H852AB11P` [順豐智能櫃] 自助櫃 大埔大元村泰民樓地下2號鋪三號櫃 -- 大埔大元邨泰民樓地下2號鋪三號櫃*
- `H852AB12P` [順豐智能櫃] 自助櫃 大埔大元邨泰民樓地下2號鋪(四號櫃) -- 大埔大元邨泰民樓地下2號鋪四號櫃*

---

## Updated Locations (2)

- `H852G100P` 自助櫃 荃灣麗城花園三期
  - address: `"香港荃灣麗城花園三期3座平台只供住戶使用*"` -> `"香港荃灣麗城花園三期3座平台(只供住戶使用)*"`
- `H852GE06P` 自助櫃 荃灣海之戀
  - address: `"荃灣海之戀停車埸5樓第三中轉大堂住戶使用*"` -> `"荃灣海之戀停車埸5樓第三中轉大堂(只供住戶使用)*"`
