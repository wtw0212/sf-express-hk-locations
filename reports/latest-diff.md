# SF Express HK Location Sync Report

> **Last Updated**: `2026-10-24 11:44 (HKT UTC+8)`

---

## Summary

| Metric | Count |
| :--- | :--- |
| **Previous total** | 1652 |
| **Current total** | 1653 |
| **Stores** | 140 |
| **Lockers** | 1050 |
| **Partners** | 463 |
| **Added** | 1 |
| **Removed** | 0 |
| **Updated** | 1 |
| **Unchanged** | 1651 |

---

## Count Deltas

| Category | Previous | Current | Delta | Delta % | Baseline Source | Gate Result |
| :--- | ---: | ---: | ---: | ---: | :--- | :--- |
| total | 1652 | 1653 | +1 | +0.06% | previous_locations_feed | ✅ PASS |
| stores | 140 | 140 | +0 | +0% | previous_locations_feed | ✅ PASS |
| lockers | 1049 | 1050 | +1 | +0.1% | previous_locations_feed | ✅ PASS |
| partners | 463 | 463 | +0 | +0% | previous_locations_feed | ✅ PASS |
| tcCodes | 1647 | 1648 | +1 | +0.06% | previous_metadata.coverage.tc_record_count | ✅ PASS |
| enCodes | 1646 | 1647 | +1 | +0.06% | previous_metadata.coverage.en_record_count | ✅ PASS |

---

## Source Coverage & Status

| Metric | Value |
| :--- | :--- |
| TC API areas | 112/112 succeeded |
| EN API areas | 112/112 succeeded |
| TC unique codes | 1648 |
| EN unique codes | 1647 |
| Partner PDF HTTP Success | 8/8 |
| Partner PDF Parser Completed | 8/8 |
| Partner PDF Semantic Success | 5/8 |
| Partner PDF Quality Failures | 3 |
| Valid Partner PDF Records | 429 |
| Quarantined PDF Records | 11 |
| PDF Quarantine Ratio | 2.5% |
| SSR records | 190 |
| Bilingual match rate | 99.9% |
| District resolved | 1653 |
| District unresolved | 0 |
| With English data | 1647 |
| Missing English | 6 |

---

## Pipeline Execution Status

| Metric | Count |
| :--- | :--- |
| **Pipeline Blocking Errors** | 0 |
| **Pipeline Execution Warnings** | 5 |
| **Record Quality Warnings** | 255 |
| **Record Quality Info Flags** | 62 |
| **Record Quality Errors** | 0 |

---

## Record Quality Flags Summary

| Flag Type | Count |
| :--- | :--- |
| SOURCE_TC_EN_STREET_NUMBER_CONFLICT | 96 |
| ENGLISH_FIELD_CONTAINS_CJK | 93 |
| ADMIN_DISTRICT_ALIAS_APPLIED | 43 |
| SOURCE_TC_EN_UNIT_CONFLICT | 38 |
| SOURCE_TC_EN_BUSINESS_HOURS_CONFLICT | 20 |
| DUPLICATE_ADDRESS_SUFFIX | 10 |
| MISSING_ENGLISH_RECORD | 6 |
| MISSING_COORDINATES | 5 |
| SOURCE_FORMATTING_ARTIFACT | 4 |
| SUBDISTRICT_ADDRESS_CONFLICT | 2 |

---

## Pipeline Execution Warnings (5)

- ⚠️ Partner PDF overall quarantine ratio 2.5% exceeds warning threshold 1% (11/440 quarantined)
- ⚠️ Partner PDF 'OK_KLN_TC' quarantine ratio 6.7% exceeds warning threshold 1%
- ⚠️ Partner PDF 'ASP_HK_TC' quarantine ratio 4.3% exceeds warning threshold 1%
- ⚠️ Partner PDF 'ASP_NT_TC' quarantine ratio 4.5% exceeds warning threshold 1%
- ⚠️ Quarantined 4 corrupted or ambiguous partner PDF records (reasons: SERVICE_CODE_MISMATCH)

---

## Added Locations (1)

- `H852CH13P` [順豐智能櫃] 自助櫃 將軍澳Savannah地下 -- 將軍澳Savannah地下近商場電梯大堂*

---

## Removed Locations (0)

*(No removed locations)*

---

## Updated Locations (1)

- `852Z152` 秀茂坪寶達商場順豐站
  - business_hours_en: `"Mon - Fri: 11:00-21:00, Sat, Sun and Public Holiday: 12:00-20:00"` -> `"Mon - Fri: 12:00-21:00, Sat, Sun and Public Holiday: 12:00-20:00"`
  - quality_flags: -SOURCE_TC_EN_BUSINESS_HOURS_CONFLICT
