# SF Express HK Location Sync Report

> **Last Updated**: `2026-11-14 13:27 (HKT UTC+8)`

---

## Summary

| Metric | Count |
| :--- | :--- |
| **Previous total** | 1639 |
| **Current total** | 1638 |
| **Stores** | 139 |
| **Lockers** | 1047 |
| **Partners** | 452 |
| **Added** | 2 |
| **Removed** | 3 |
| **Updated** | 0 |
| **Unchanged** | 1636 |

---

## Count Deltas

| Category | Previous | Current | Delta | Delta % | Baseline Source | Gate Result |
| :--- | ---: | ---: | ---: | ---: | :--- | :--- |
| total | 1639 | 1638 | -1 | -0.06% | previous_locations_feed | ✅ PASS |
| stores | 140 | 139 | -1 | -0.71% | previous_locations_feed | ✅ PASS |
| lockers | 1046 | 1047 | +1 | +0.1% | previous_locations_feed | ✅ PASS |
| partners | 453 | 452 | -1 | -0.22% | previous_locations_feed | ✅ PASS |
| tcCodes | 1635 | 1634 | -1 | -0.06% | previous_metadata.coverage.tc_record_count | ✅ PASS |
| enCodes | 1633 | 1632 | -1 | -0.06% | previous_metadata.coverage.en_record_count | ✅ PASS |

---

## Source Coverage & Status

| Metric | Value |
| :--- | :--- |
| TC API areas | 112/112 succeeded |
| EN API areas | 112/112 succeeded |
| TC unique codes | 1634 |
| EN unique codes | 1632 |
| Partner PDF HTTP Success | 8/8 |
| Partner PDF Parser Completed | 8/8 |
| Partner PDF Semantic Success | 5/8 |
| Partner PDF Quality Failures | 3 |
| Valid Partner PDF Records | 419 |
| Quarantined PDF Records | 11 |
| PDF Quarantine Ratio | 2.6% |
| SSR records | 190 |
| Bilingual match rate | 99.9% |
| District resolved | 1638 |
| District unresolved | 0 |
| With English data | 1632 |
| Missing English | 6 |

---

## Pipeline Execution Status

| Metric | Count |
| :--- | :--- |
| **Pipeline Blocking Errors** | 0 |
| **Pipeline Execution Warnings** | 5 |
| **Record Quality Warnings** | 244 |
| **Record Quality Info Flags** | 60 |
| **Record Quality Errors** | 0 |

---

## Record Quality Flags Summary

| Flag Type | Count |
| :--- | :--- |
| SOURCE_TC_EN_STREET_NUMBER_CONFLICT | 93 |
| ENGLISH_FIELD_CONTAINS_CJK | 86 |
| ADMIN_DISTRICT_ALIAS_APPLIED | 42 |
| SOURCE_TC_EN_UNIT_CONFLICT | 38 |
| SOURCE_TC_EN_BUSINESS_HOURS_CONFLICT | 19 |
| DUPLICATE_ADDRESS_SUFFIX | 10 |
| MISSING_ENGLISH_RECORD | 6 |
| SOURCE_FORMATTING_ARTIFACT | 4 |
| MISSING_COORDINATES | 4 |
| SUBDISTRICT_ADDRESS_CONFLICT | 2 |

---

## Pipeline Execution Warnings (5)

- ⚠️ Partner PDF overall quarantine ratio 2.6% exceeds warning threshold 1% (11/430 quarantined)
- ⚠️ Partner PDF 'OK_KLN_TC' quarantine ratio 6.7% exceeds warning threshold 1%
- ⚠️ Partner PDF 'ASP_HK_TC' quarantine ratio 4.5% exceeds warning threshold 1%
- ⚠️ Partner PDF 'ASP_NT_TC' quarantine ratio 4.9% exceeds warning threshold 1%
- ⚠️ Quarantined 4 corrupted or ambiguous partner PDF records (reasons: SERVICE_CODE_MISMATCH)

---

## Added Locations (2)

- `852U3009` [順豐合作點] 合作點 啟豐自提點 -- 新界屯門啟豐商場地下32號鋪(14:00-15:00午休) 啟豐自提點*
- `H852TE02P` [順豐智能櫃] 自助櫃 香港仔香港仔市政大廈 -- 香港仔市政大廈2樓洗手間外*

---

## Removed Locations (3)

- `852BAL` [順豐站] 旺角富榮花園順豐站 -- 香港油尖旺區旺角海庭道8號富榮花園2期地下38號鋪*
- `852HB3004` [順豐合作點] 合作店 在時有限公司 -- 九龍灣淘大商場2期1樓F161號鋪（歡迎自提淘大店）*
- `852KA3001` [順豐合作點] 合作店 長旺辦館 -- 馬頭圍村玫瑰樓地下111號鋪（長旺辦館）*

---

## Updated Locations (0)

*(No updated locations)*
