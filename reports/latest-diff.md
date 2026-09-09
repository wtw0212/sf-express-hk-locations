# SF Express HK Location Sync Report

> **Last Updated**: `2026-09-09 11:40 (HKT UTC+8)`

---

## Summary

| Metric | Count |
| :--- | :--- |
| **Previous total** | 1660 |
| **Current total** | 1661 |
| **Stores** | 137 |
| **Lockers** | 1055 |
| **Partners** | 469 |
| **Added** | 1 |
| **Removed** | 0 |
| **Updated** | 1 |
| **Unchanged** | 1659 |

---

## Count Deltas

| Category | Previous | Current | Delta | Delta % | Baseline Source | Gate Result |
| :--- | ---: | ---: | ---: | ---: | :--- | :--- |
| total | 1660 | 1661 | +1 | +0.06% | previous_locations_feed | ✅ PASS |
| stores | 137 | 137 | +0 | +0% | previous_locations_feed | ✅ PASS |
| lockers | 1054 | 1055 | +1 | +0.09% | previous_locations_feed | ✅ PASS |
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
| **Record Quality Warnings** | 264 |
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
| SOURCE_TC_EN_BUSINESS_HOURS_CONFLICT | 22 |
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

- `H852UB59P` [順豐智能櫃] 自助櫃 元朗PARK YOHO 2B期 -- 元朗PARK YOHO 2B期23座地下(只供住戶使用)*

---

## Removed Locations (0)

*(No removed locations)*

---

## Updated Locations (1)

- `852PCL` 柴灣國貿中心順豐站
  - business_hours: `"周一至周五,11:00-21:00;周日及公眾假期,休息;周六,12:00-20:00"` -> `"周一至周五,12:00-21:00;周日及公眾假期,休息;周六及公眾假期,12:00-20:00"`
  - quality_flags: +SOURCE_TC_EN_BUSINESS_HOURS_CONFLICT
