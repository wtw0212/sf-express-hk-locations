# SF Express HK Location Sync Report

> **Last Updated**: `2026-09-05 11:30 (HKT UTC+8)`

---

## Summary

| Metric | Count |
| :--- | :--- |
| **Previous total** | 1660 |
| **Current total** | 1661 |
| **Stores** | 138 |
| **Lockers** | 1054 |
| **Partners** | 469 |
| **Added** | 1 |
| **Removed** | 0 |
| **Updated** | 2 |
| **Unchanged** | 1658 |

---

## Count Deltas

| Category | Previous | Current | Delta | Delta % | Baseline Source | Gate Result |
| :--- | ---: | ---: | ---: | ---: | :--- | :--- |
| total | 1660 | 1661 | +1 | +0.06% | previous_locations_feed | ✅ PASS |
| stores | 138 | 138 | +0 | +0% | previous_locations_feed | ✅ PASS |
| lockers | 1053 | 1054 | +1 | +0.09% | previous_locations_feed | ✅ PASS |
| partners | 469 | 469 | +0 | +0% | previous_locations_feed | ✅ PASS |
| tcCodes | 1654 | 1655 | +1 | +0.06% | previous_metadata.coverage.tc_record_count | ✅ PASS |
| enCodes | 1653 | 1654 | +1 | +0.06% | previous_metadata.coverage.en_record_count | ✅ PASS |

---

## Source Coverage & Status

| Metric | Value |
| :--- | :--- |
| TC API areas | 112/112 succeeded |
| EN API areas | 112/112 succeeded |
| TC unique codes | 1655 |
| EN unique codes | 1654 |
| Partner PDF HTTP Success | 8/8 |
| Partner PDF Parser Completed | 8/8 |
| Partner PDF Semantic Success | 5/8 |
| Partner PDF Quality Failures | 3 |
| Valid Partner PDF Records | 432 |
| Quarantined PDF Records | 12 |
| PDF Quarantine Ratio | 2.7% |
| SSR records | 188 |
| Bilingual match rate | 99.9% |
| District resolved | 1661 |
| District unresolved | 0 |
| With English data | 1654 |
| Missing English | 7 |

---

## Pipeline Execution Status

| Metric | Count |
| :--- | :--- |
| **Pipeline Blocking Errors** | 0 |
| **Pipeline Execution Warnings** | 5 |
| **Record Quality Warnings** | 263 |
| **Record Quality Info Flags** | 60 |
| **Record Quality Errors** | 0 |

---

## Record Quality Flags Summary

| Flag Type | Count |
| :--- | :--- |
| ENGLISH_FIELD_CONTAINS_CJK | 98 |
| SOURCE_TC_EN_STREET_NUMBER_CONFLICT | 97 |
| ADMIN_DISTRICT_ALIAS_APPLIED | 43 |
| SOURCE_TC_EN_UNIT_CONFLICT | 38 |
| SOURCE_TC_EN_BUSINESS_HOURS_CONFLICT | 21 |
| DUPLICATE_ADDRESS_SUFFIX | 9 |
| MISSING_ENGLISH_RECORD | 7 |
| MISSING_COORDINATES | 6 |
| SOURCE_FORMATTING_ARTIFACT | 2 |
| SUBDISTRICT_ADDRESS_CONFLICT | 2 |

---

## Pipeline Execution Warnings (5)

- ⚠️ Partner PDF overall quarantine ratio 2.7% exceeds warning threshold 1% (12/444 quarantined)
- ⚠️ Partner PDF 'OK_KLN_TC' quarantine ratio 6.7% exceeds warning threshold 1%
- ⚠️ Partner PDF 'ASP_HK_TC' quarantine ratio 8.0% exceeds warning threshold 1%
- ⚠️ Partner PDF 'ASP_NT_TC' quarantine ratio 4.5% exceeds warning threshold 1%
- ⚠️ Quarantined 5 corrupted or ambiguous partner PDF records (reasons: SERVICE_CODE_MISMATCH)

---

## Added Locations (1)

- `H852FEC7P` [順豐智能櫃] 自助櫃 馬鞍山樂和‧東寓 -- 馬鞍山樂和‧東寓C區地下(只供住戶使用)*

---

## Removed Locations (0)

*(No removed locations)*

---

## Updated Locations (2)

- `852A3021` 合作店 小小世界
  - district: `"大埔區"` -> `"北區"`
  - district_en: `"Tai Po District"` -> `"North District"`
  - sub_district: `"大埔"` -> `"粉嶺"`
  - sub_district_en: `"Tai Po"` -> `"Fanling"`
- `852TB2016` 便利店 鴨脷洲大街85號OK
  - district: `"灣仔區"` -> `"南區"`
  - district_en: `"Wan Chai District"` -> `"Southern District"`
  - sub_district: `"灣仔"` -> `"鴨脷洲"`
  - sub_district_en: `"Wan Chai"` -> `"Ap Lei Chau"`
