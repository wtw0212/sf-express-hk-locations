# SF Express HK Location Sync Report

> **Last Updated**: `2026-09-08 11:35 (HKT UTC+8)`

---

## Summary

| Metric | Count |
| :--- | :--- |
| **Previous total** | 1661 |
| **Current total** | 1660 |
| **Stores** | 137 |
| **Lockers** | 1054 |
| **Partners** | 469 |
| **Added** | 0 |
| **Removed** | 1 |
| **Updated** | 0 |
| **Unchanged** | 1660 |

---

## Count Deltas

| Category | Previous | Current | Delta | Delta % | Baseline Source | Gate Result |
| :--- | ---: | ---: | ---: | ---: | :--- | :--- |
| total | 1661 | 1660 | -1 | -0.06% | previous_locations_feed | ✅ PASS |
| stores | 138 | 137 | -1 | -0.72% | previous_locations_feed | ✅ PASS |
| lockers | 1054 | 1054 | +0 | +0% | previous_locations_feed | ✅ PASS |
| partners | 469 | 469 | +0 | +0% | previous_locations_feed | ✅ PASS |
| tcCodes | 1655 | 1654 | -1 | -0.06% | previous_metadata.coverage.tc_record_count | ✅ PASS |
| enCodes | 1654 | 1653 | -1 | -0.06% | previous_metadata.coverage.en_record_count | ✅ PASS |

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
| Quarantined PDF Records | 12 |
| PDF Quarantine Ratio | 2.7% |
| SSR records | 188 |
| Bilingual match rate | 99.9% |
| District resolved | 1660 |
| District unresolved | 0 |
| With English data | 1653 |
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

## Added Locations (0)

*(No added locations)*

---

## Removed Locations (1)

- `852UAB` [順豐站] 元朗雄偉工業大廈順豐站 -- 香港元朗區元朗喜業街1-5號雄偉工業大廈地下F室*

---

## Updated Locations (0)

*(No updated locations)*
