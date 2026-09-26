# SF Express HK Location Sync Report

> **Last Updated**: `2026-09-26 12:03 (HKT UTC+8)`

---

## Summary

| Metric | Count |
| :--- | :--- |
| **Previous total** | 1659 |
| **Current total** | 1657 |
| **Stores** | 138 |
| **Lockers** | 1051 |
| **Partners** | 468 |
| **Added** | 0 |
| **Removed** | 2 |
| **Updated** | 0 |
| **Unchanged** | 1657 |

---

## Count Deltas

| Category | Previous | Current | Delta | Delta % | Baseline Source | Gate Result |
| :--- | ---: | ---: | ---: | ---: | :--- | :--- |
| total | 1659 | 1657 | -2 | -0.12% | previous_locations_feed | ✅ PASS |
| stores | 138 | 138 | +0 | +0% | previous_locations_feed | ✅ PASS |
| lockers | 1053 | 1051 | -2 | -0.19% | previous_locations_feed | ✅ PASS |
| partners | 468 | 468 | +0 | +0% | previous_locations_feed | ✅ PASS |
| tcCodes | 1654 | 1652 | -2 | -0.12% | previous_metadata.coverage.tc_record_count | ✅ PASS |
| enCodes | 1653 | 1651 | -2 | -0.12% | previous_metadata.coverage.en_record_count | ✅ PASS |

---

## Source Coverage & Status

| Metric | Value |
| :--- | :--- |
| TC API areas | 112/112 succeeded |
| EN API areas | 112/112 succeeded |
| TC unique codes | 1652 |
| EN unique codes | 1651 |
| Partner PDF HTTP Success | 8/8 |
| Partner PDF Parser Completed | 8/8 |
| Partner PDF Semantic Success | 5/8 |
| Partner PDF Quality Failures | 3 |
| Valid Partner PDF Records | 432 |
| Quarantined PDF Records | 11 |
| PDF Quarantine Ratio | 2.5% |
| SSR records | 188 |
| Bilingual match rate | 99.9% |
| District resolved | 1657 |
| District unresolved | 0 |
| With English data | 1651 |
| Missing English | 6 |

---

## Pipeline Execution Status

| Metric | Count |
| :--- | :--- |
| **Pipeline Blocking Errors** | 0 |
| **Pipeline Execution Warnings** | 5 |
| **Record Quality Warnings** | 260 |
| **Record Quality Info Flags** | 59 |
| **Record Quality Errors** | 0 |

---

## Record Quality Flags Summary

| Flag Type | Count |
| :--- | :--- |
| ENGLISH_FIELD_CONTAINS_CJK | 97 |
| SOURCE_TC_EN_STREET_NUMBER_CONFLICT | 95 |
| ADMIN_DISTRICT_ALIAS_APPLIED | 43 |
| SOURCE_TC_EN_UNIT_CONFLICT | 38 |
| SOURCE_TC_EN_BUSINESS_HOURS_CONFLICT | 22 |
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

## Removed Locations (2)

- `H852AA60P` [順豐智能櫃] 自助櫃 大埔太和邨福和樓 -- 香港大埔區太和邨福和樓地下*
- `H852BD82P` [順豐智能櫃] 自助櫃 大角咀瓏璽 -- 大角咀瓏璽8座B2層升降機大堂只供住戶使用*

---

## Updated Locations (0)

*(No updated locations)*
