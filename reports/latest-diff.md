# SF Express HK Location Sync Report

> **Last Updated**: `2026-10-06 13:25 (HKT UTC+8)`

---

## Summary

| Metric | Count |
| :--- | :--- |
| **Previous total** | 1654 |
| **Current total** | 1654 |
| **Stores** | 139 |
| **Lockers** | 1050 |
| **Partners** | 465 |
| **Added** | 1 |
| **Removed** | 1 |
| **Updated** | 1 |
| **Unchanged** | 1652 |

---

## Count Deltas

| Category | Previous | Current | Delta | Delta % | Baseline Source | Gate Result |
| :--- | ---: | ---: | ---: | ---: | :--- | :--- |
| total | 1654 | 1654 | +0 | +0% | previous_locations_feed | ✅ PASS |
| stores | 138 | 139 | +1 | +0.72% | previous_locations_feed | ✅ PASS |
| lockers | 1050 | 1050 | +0 | +0% | previous_locations_feed | ✅ PASS |
| partners | 466 | 465 | -1 | -0.21% | previous_locations_feed | ✅ PASS |
| tcCodes | 1649 | 1649 | +0 | +0% | previous_metadata.coverage.tc_record_count | ✅ PASS |
| enCodes | 1648 | 1648 | +0 | +0% | previous_metadata.coverage.en_record_count | ✅ PASS |

---

## Source Coverage & Status

| Metric | Value |
| :--- | :--- |
| TC API areas | 112/112 succeeded |
| EN API areas | 112/112 succeeded |
| TC unique codes | 1649 |
| EN unique codes | 1648 |
| Partner PDF HTTP Success | 8/8 |
| Partner PDF Parser Completed | 8/8 |
| Partner PDF Semantic Success | 5/8 |
| Partner PDF Quality Failures | 3 |
| Valid Partner PDF Records | 431 |
| Quarantined PDF Records | 11 |
| PDF Quarantine Ratio | 2.5% |
| SSR records | 188 |
| Bilingual match rate | 99.9% |
| District resolved | 1654 |
| District unresolved | 0 |
| With English data | 1648 |
| Missing English | 6 |

---

## Pipeline Execution Status

| Metric | Count |
| :--- | :--- |
| **Pipeline Blocking Errors** | 0 |
| **Pipeline Execution Warnings** | 5 |
| **Record Quality Warnings** | 257 |
| **Record Quality Info Flags** | 61 |
| **Record Quality Errors** | 0 |

---

## Record Quality Flags Summary

| Flag Type | Count |
| :--- | :--- |
| ENGLISH_FIELD_CONTAINS_CJK | 95 |
| SOURCE_TC_EN_STREET_NUMBER_CONFLICT | 95 |
| ADMIN_DISTRICT_ALIAS_APPLIED | 43 |
| SOURCE_TC_EN_UNIT_CONFLICT | 38 |
| SOURCE_TC_EN_BUSINESS_HOURS_CONFLICT | 21 |
| DUPLICATE_ADDRESS_SUFFIX | 10 |
| MISSING_ENGLISH_RECORD | 6 |
| MISSING_COORDINATES | 5 |
| SOURCE_FORMATTING_ARTIFACT | 3 |
| SUBDISTRICT_ADDRESS_CONFLICT | 2 |

---

## Pipeline Execution Warnings (5)

- ⚠️ Partner PDF overall quarantine ratio 2.5% exceeds warning threshold 1% (11/442 quarantined)
- ⚠️ Partner PDF 'OK_KLN_TC' quarantine ratio 6.7% exceeds warning threshold 1%
- ⚠️ Partner PDF 'ASP_HK_TC' quarantine ratio 4.3% exceeds warning threshold 1%
- ⚠️ Partner PDF 'ASP_NT_TC' quarantine ratio 4.5% exceeds warning threshold 1%
- ⚠️ Quarantined 4 corrupted or ambiguous partner PDF records (reasons: SERVICE_CODE_MISMATCH)

---

## Added Locations (1)

- `852TF` [順豐站] 大坑銅鑼灣道順豐站 -- 香港灣仔區大坑香港大坑銅鑼灣道134號地下*^

---

## Removed Locations (1)

- `852GA3007` [順豐合作點] 合作店 聚寶店 -- 大窩口荃灣花園第一期商場LG 48鋪(如意閣地下) 聚寶店*

---

## Updated Locations (1)

- `852MA` 西營盤兆祥坊順豐站
  - business_hours: `"周一至周六,09:00-20:00;周日及勞工假期,休息"` -> `"周一至周六,09:00-20:00"`
