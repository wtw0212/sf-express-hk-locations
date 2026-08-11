# SF Express HK Location Sync Report

> **Last Updated**: `2026-08-11 09:52 (HKT UTC+8)`

---

## Summary

| Metric | Count |
| :--- | :--- |
| **Previous total** | 1667 |
| **Current total** | 1666 |
| **Stores** | 137 |
| **Lockers** | 1049 |
| **Partners** | 480 |
| **Added** | 0 |
| **Removed** | 1 |
| **Updated** | 1 |
| **Unchanged** | 1665 |

---

## Count Deltas

| Category | Previous | Current | Delta | Delta % | Baseline Source | Gate Result |
| :--- | ---: | ---: | ---: | ---: | :--- | :--- |
| total | 1667 | 1666 | -1 | -0.06% | previous_locations_feed | ✅ PASS |
| stores | 137 | 137 | +0 | +0% | previous_locations_feed | ✅ PASS |
| lockers | 1049 | 1049 | +0 | +0% | previous_locations_feed | ✅ PASS |
| partners | 481 | 480 | -1 | -0.21% | previous_locations_feed | ✅ PASS |
| tcCodes | 1661 | 1660 | -1 | -0.06% | previous_metadata.coverage.tc_record_count | ✅ PASS |
| enCodes | 1660 | 1659 | -1 | -0.06% | previous_metadata.coverage.en_record_count | ✅ PASS |

---

## Source Coverage & Status

| Metric | Value |
| :--- | :--- |
| TC API areas | 112/112 succeeded |
| EN API areas | 112/112 succeeded |
| TC unique codes | 1660 |
| EN unique codes | 1659 |
| Partner PDF HTTP Success | 8/8 |
| Partner PDF Parser Completed | 8/8 |
| Partner PDF Semantic Success | 5/8 |
| Partner PDF Quality Failures | 3 |
| Valid Partner PDF Records | 443 |
| Quarantined PDF Records | 12 |
| PDF Quarantine Ratio | 2.6% |
| SSR records | 186 |
| Bilingual match rate | 99.9% |
| District resolved | 1666 |
| District unresolved | 0 |
| With English data | 1659 |
| Missing English | 7 |

---

## Pipeline Execution Status

| Metric | Count |
| :--- | :--- |
| **Pipeline Blocking Errors** | 0 |
| **Pipeline Execution Warnings** | 5 |
| **Record Quality Warnings** | 270 |
| **Record Quality Info Flags** | 57 |
| **Record Quality Errors** | 0 |

---

## Record Quality Flags Summary

| Flag Type | Count |
| :--- | :--- |
| ENGLISH_FIELD_CONTAINS_CJK | 104 |
| SOURCE_TC_EN_STREET_NUMBER_CONFLICT | 98 |
| ADMIN_DISTRICT_ALIAS_APPLIED | 41 |
| SOURCE_TC_EN_UNIT_CONFLICT | 38 |
| SOURCE_TC_EN_BUSINESS_HOURS_CONFLICT | 21 |
| DUPLICATE_ADDRESS_SUFFIX | 9 |
| MISSING_ENGLISH_RECORD | 7 |
| MISSING_COORDINATES | 6 |
| SUBDISTRICT_ADDRESS_CONFLICT | 2 |
| SOURCE_FORMATTING_ARTIFACT | 1 |

---

## Pipeline Execution Warnings (5)

- ⚠️ Partner PDF overall quarantine ratio 2.6% exceeds warning threshold 1% (12/455 quarantined)
- ⚠️ Partner PDF 'OK_KLN_TC' quarantine ratio 6.7% exceeds warning threshold 1%
- ⚠️ Partner PDF 'ASP_HK_TC' quarantine ratio 8.0% exceeds warning threshold 1%
- ⚠️ Partner PDF 'ASP_NT_TC' quarantine ratio 4.1% exceeds warning threshold 1%
- ⚠️ Quarantined 5 corrupted or ambiguous partner PDF records (reasons: SERVICE_CODE_MISMATCH)

---

## Added Locations (0)

*(No added locations)*

---

## Removed Locations (1)

- `852K3011` [順豐合作點] 合作店 FoodieGo -- 九龍紅磡灣紅鸞道8號海灣軒地下3號鋪 FoodieGo*

---

## Updated Locations (1)

- `852BD2001` 便利店 奧運港鐵站OK便利店
  - business_hours: `"06:00-23:30"` -> `"06:00-23:00"`
  - business_hours_en: `"06:00-23:30"` -> `"06:00-23:00"`
