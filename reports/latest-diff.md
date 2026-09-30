# SF Express HK Location Sync Report

> **Last Updated**: `2026-09-30 13:39 (HKT UTC+8)`

---

## Summary

| Metric | Count |
| :--- | :--- |
| **Previous total** | 1657 |
| **Current total** | 1656 |
| **Stores** | 138 |
| **Lockers** | 1051 |
| **Partners** | 467 |
| **Added** | 0 |
| **Removed** | 1 |
| **Updated** | 1 |
| **Unchanged** | 1655 |

---

## Count Deltas

| Category | Previous | Current | Delta | Delta % | Baseline Source | Gate Result |
| :--- | ---: | ---: | ---: | ---: | :--- | :--- |
| total | 1657 | 1656 | -1 | -0.06% | previous_locations_feed | ✅ PASS |
| stores | 138 | 138 | +0 | +0% | previous_locations_feed | ✅ PASS |
| lockers | 1051 | 1051 | +0 | +0% | previous_locations_feed | ✅ PASS |
| partners | 468 | 467 | -1 | -0.21% | previous_locations_feed | ✅ PASS |
| tcCodes | 1652 | 1651 | -1 | -0.06% | previous_metadata.coverage.tc_record_count | ✅ PASS |
| enCodes | 1651 | 1650 | -1 | -0.06% | previous_metadata.coverage.en_record_count | ✅ PASS |

---

## Source Coverage & Status

| Metric | Value |
| :--- | :--- |
| TC API areas | 112/112 succeeded |
| EN API areas | 112/112 succeeded |
| TC unique codes | 1651 |
| EN unique codes | 1650 |
| Partner PDF HTTP Success | 8/8 |
| Partner PDF Parser Completed | 8/8 |
| Partner PDF Semantic Success | 5/8 |
| Partner PDF Quality Failures | 3 |
| Valid Partner PDF Records | 432 |
| Quarantined PDF Records | 11 |
| PDF Quarantine Ratio | 2.5% |
| SSR records | 188 |
| Bilingual match rate | 99.9% |
| District resolved | 1656 |
| District unresolved | 0 |
| With English data | 1650 |
| Missing English | 6 |

---

## Pipeline Execution Status

| Metric | Count |
| :--- | :--- |
| **Pipeline Blocking Errors** | 0 |
| **Pipeline Execution Warnings** | 5 |
| **Record Quality Warnings** | 258 |
| **Record Quality Info Flags** | 59 |
| **Record Quality Errors** | 0 |

---

## Record Quality Flags Summary

| Flag Type | Count |
| :--- | :--- |
| ENGLISH_FIELD_CONTAINS_CJK | 96 |
| SOURCE_TC_EN_STREET_NUMBER_CONFLICT | 95 |
| ADMIN_DISTRICT_ALIAS_APPLIED | 43 |
| SOURCE_TC_EN_UNIT_CONFLICT | 38 |
| SOURCE_TC_EN_BUSINESS_HOURS_CONFLICT | 21 |
| DUPLICATE_ADDRESS_SUFFIX | 9 |
| MISSING_ENGLISH_RECORD | 6 |
| MISSING_COORDINATES | 5 |
| SOURCE_FORMATTING_ARTIFACT | 2 |
| SUBDISTRICT_ADDRESS_CONFLICT | 2 |

---

## Pipeline Execution Warnings (5)

- ⚠️ Partner PDF overall quarantine ratio 2.5% exceeds warning threshold 1% (11/443 quarantined)
- ⚠️ Partner PDF 'OK_KLN_TC' quarantine ratio 6.7% exceeds warning threshold 1%
- ⚠️ Partner PDF 'ASP_HK_TC' quarantine ratio 4.2% exceeds warning threshold 1%
- ⚠️ Partner PDF 'ASP_NT_TC' quarantine ratio 4.5% exceeds warning threshold 1%
- ⚠️ Quarantined 4 corrupted or ambiguous partner PDF records (reasons: SERVICE_CODE_MISMATCH)

---

## Added Locations (0)

*(No added locations)*

---

## Removed Locations (1)

- `852PB3009` [順豐合作點] 合作店 家的方便站 -- 柴灣祥利街18號祥達中心地下4a鋪 家的方便站*

---

## Updated Locations (1)

- `852FBL` 天水圍天瑞商場順豐站
  - business_hours: `"周一至周五,10:30-22:00;周日及公眾假期,12:00-20:00；周六:12:00-20:00"` -> `"周一至周五,11:00-22:00;周日及公眾假期,12:00-20:00; 周六,12:00-20:00"`
  - quality_flags: -SOURCE_TC_EN_BUSINESS_HOURS_CONFLICT
