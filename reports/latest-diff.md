# SF Express HK Location Sync Report

> **Last Updated**: `2026-09-24 11:42 (HKT UTC+8)`

---

## Summary

| Metric | Count |
| :--- | :--- |
| **Previous total** | 1661 |
| **Current total** | 1659 |
| **Stores** | 138 |
| **Lockers** | 1053 |
| **Partners** | 468 |
| **Added** | 0 |
| **Removed** | 2 |
| **Updated** | 0 |
| **Unchanged** | 1659 |

---

## Count Deltas

| Category | Previous | Current | Delta | Delta % | Baseline Source | Gate Result |
| :--- | ---: | ---: | ---: | ---: | :--- | :--- |
| total | 1661 | 1659 | -2 | -0.12% | previous_locations_feed | ✅ PASS |
| stores | 138 | 138 | +0 | +0% | previous_locations_feed | ✅ PASS |
| lockers | 1055 | 1053 | -2 | -0.19% | previous_locations_feed | ✅ PASS |
| partners | 468 | 468 | +0 | +0% | previous_locations_feed | ✅ PASS |
| tcCodes | 1656 | 1654 | -2 | -0.12% | previous_metadata.coverage.tc_record_count | ✅ PASS |
| enCodes | 1655 | 1653 | -2 | -0.12% | previous_metadata.coverage.en_record_count | ✅ PASS |

---

## Source Coverage & Status

| Metric | Value |
| :--- | :--- |
| TC API areas | 112/112 succeeded |
| EN API areas | 112/112 succeeded |
| TC unique codes | 1654 |
| EN unique codes | 1653 |
| Partner PDF HTTP Success | 8/8 |
| Partner PDF Parser Completed | 8/8 |
| Partner PDF Semantic Success | 5/8 |
| Partner PDF Quality Failures | 3 |
| Valid Partner PDF Records | 432 |
| Quarantined PDF Records | 11 |
| PDF Quarantine Ratio | 2.5% |
| SSR records | 188 |
| Bilingual match rate | 99.9% |
| District resolved | 1659 |
| District unresolved | 0 |
| With English data | 1653 |
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

- `H852TB55P` [順豐智能櫃] 自助櫃 鴨脷洲利東商場二期三樓(二號櫃) -- 鴨脷洲利東商場二期三樓LK03(二號櫃)*
- `H852UA95P` [順豐智能櫃] 自助櫃 元朗路德會雙魚薈 -- 元朗路德會雙魚薈二座地下信箱旁(只供住戶使用)*

---

## Updated Locations (0)

*(No updated locations)*
