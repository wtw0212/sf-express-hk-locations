# SF Express HK Location Sync Report

> **Last Updated**: `2026-08-16 09:24 (HKT UTC+8)`

---

## Summary

| Metric | Count |
| :--- | :--- |
| **Previous total** | 1668 |
| **Current total** | 1668 |
| **Stores** | 137 |
| **Lockers** | 1052 |
| **Partners** | 479 |
| **Added** | 0 |
| **Removed** | 0 |
| **Updated** | 1 |
| **Unchanged** | 1667 |

---

## Count Deltas

| Category | Previous | Current | Delta | Delta % | Baseline Source | Gate Result |
| :--- | ---: | ---: | ---: | ---: | :--- | :--- |
| total | 1668 | 1668 | +0 | +0% | previous_locations_feed | ✅ PASS |
| stores | 137 | 137 | +0 | +0% | previous_locations_feed | ✅ PASS |
| lockers | 1052 | 1052 | +0 | +0% | previous_locations_feed | ✅ PASS |
| partners | 479 | 479 | +0 | +0% | previous_locations_feed | ✅ PASS |
| tcCodes | 1662 | 1662 | +0 | +0% | previous_metadata.coverage.tc_record_count | ✅ PASS |
| enCodes | 1661 | 1661 | +0 | +0% | previous_metadata.coverage.en_record_count | ✅ PASS |

---

## Source Coverage & Status

| Metric | Value |
| :--- | :--- |
| TC API areas | 112/112 succeeded |
| EN API areas | 112/112 succeeded |
| TC unique codes | 1662 |
| EN unique codes | 1661 |
| Partner PDF HTTP Success | 8/8 |
| Partner PDF Parser Completed | 8/8 |
| Partner PDF Semantic Success | 5/8 |
| Partner PDF Quality Failures | 3 |
| Valid Partner PDF Records | 442 |
| Quarantined PDF Records | 12 |
| PDF Quarantine Ratio | 2.6% |
| SSR records | 186 |
| Bilingual match rate | 99.9% |
| District resolved | 1668 |
| District unresolved | 0 |
| With English data | 1661 |
| Missing English | 7 |

---

## Pipeline Execution Status

| Metric | Count |
| :--- | :--- |
| **Pipeline Blocking Errors** | 0 |
| **Pipeline Execution Warnings** | 5 |
| **Record Quality Warnings** | 270 |
| **Record Quality Info Flags** | 58 |
| **Record Quality Errors** | 0 |

---

## Record Quality Flags Summary

| Flag Type | Count |
| :--- | :--- |
| ENGLISH_FIELD_CONTAINS_CJK | 104 |
| SOURCE_TC_EN_STREET_NUMBER_CONFLICT | 98 |
| ADMIN_DISTRICT_ALIAS_APPLIED | 42 |
| SOURCE_TC_EN_UNIT_CONFLICT | 38 |
| SOURCE_TC_EN_BUSINESS_HOURS_CONFLICT | 21 |
| DUPLICATE_ADDRESS_SUFFIX | 9 |
| MISSING_ENGLISH_RECORD | 7 |
| MISSING_COORDINATES | 6 |
| SUBDISTRICT_ADDRESS_CONFLICT | 2 |
| SOURCE_FORMATTING_ARTIFACT | 1 |

---

## Pipeline Execution Warnings (5)

- ⚠️ Partner PDF overall quarantine ratio 2.6% exceeds warning threshold 1% (12/454 quarantined)
- ⚠️ Partner PDF 'OK_KLN_TC' quarantine ratio 6.7% exceeds warning threshold 1%
- ⚠️ Partner PDF 'ASP_HK_TC' quarantine ratio 8.0% exceeds warning threshold 1%
- ⚠️ Partner PDF 'ASP_NT_TC' quarantine ratio 4.1% exceeds warning threshold 1%
- ⚠️ Quarantined 5 corrupted or ambiguous partner PDF records (reasons: SERVICE_CODE_MISMATCH)

---

## Added Locations (0)

*(No added locations)*

---

## Removed Locations (0)

*(No removed locations)*

---

## Updated Locations (1)

- `H852CD27P` 自助櫃 油塘曦台
  - address: `"油塘曦台三樓升降機穿梭大堂(只供住戶使用)"` -> `"油塘曦台三樓升降機穿梭大堂(只供住戶使用)*"`
  - address_en: `"Lift Lobby, 3/F, Maya, Yau Tong(Residentsonly)"` -> `"Lift Lobby, 3/F, Maya, Yau Tong(Residents only)*"`
