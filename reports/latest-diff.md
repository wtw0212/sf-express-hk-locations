# SF Express HK Location Sync Report

> **Last Updated**: `2026-08-28 18:10 (HKT UTC+8)`

---

## Summary

| Metric | Count |
| :--- | :--- |
| **Previous total** | 1701 |
| **Current total** | 1699 |
| **Stores** | 137 |
| **Lockers** | 1090 |
| **Partners** | 472 |
| **Added** | 0 |
| **Removed** | 2 |
| **Updated** | 0 |
| **Unchanged** | 1699 |

---

## Count Deltas

| Category | Previous | Current | Delta | Delta % | Baseline Source | Gate Result |
| :--- | ---: | ---: | ---: | ---: | :--- | :--- |
| total | 1701 | 1699 | -2 | -0.12% | previous_locations_feed | ✅ PASS |
| stores | 137 | 137 | +0 | +0% | previous_locations_feed | ✅ PASS |
| lockers | 1092 | 1090 | -2 | -0.18% | previous_locations_feed | ✅ PASS |
| partners | 472 | 472 | +0 | +0% | previous_locations_feed | ✅ PASS |
| tcCodes | 1695 | 1693 | -2 | -0.12% | previous_metadata.coverage.tc_record_count | ✅ PASS |
| enCodes | 1694 | 1692 | -2 | -0.12% | previous_metadata.coverage.en_record_count | ✅ PASS |

---

## Source Coverage & Status

| Metric | Value |
| :--- | :--- |
| TC API areas | 112/112 succeeded |
| EN API areas | 112/112 succeeded |
| TC unique codes | 1693 |
| EN unique codes | 1692 |
| Partner PDF HTTP Success | 8/8 |
| Partner PDF Parser Completed | 8/8 |
| Partner PDF Semantic Success | 5/8 |
| Partner PDF Quality Failures | 3 |
| Valid Partner PDF Records | 433 |
| Quarantined PDF Records | 12 |
| PDF Quarantine Ratio | 2.7% |
| SSR records | 188 |
| Bilingual match rate | 99.9% |
| District resolved | 1699 |
| District unresolved | 0 |
| With English data | 1692 |
| Missing English | 7 |

---

## Pipeline Execution Status

| Metric | Count |
| :--- | :--- |
| **Pipeline Blocking Errors** | 0 |
| **Pipeline Execution Warnings** | 5 |
| **Record Quality Warnings** | 266 |
| **Record Quality Info Flags** | 59 |
| **Record Quality Errors** | 0 |

---

## Record Quality Flags Summary

| Flag Type | Count |
| :--- | :--- |
| ENGLISH_FIELD_CONTAINS_CJK | 101 |
| SOURCE_TC_EN_STREET_NUMBER_CONFLICT | 96 |
| ADMIN_DISTRICT_ALIAS_APPLIED | 43 |
| SOURCE_TC_EN_UNIT_CONFLICT | 38 |
| SOURCE_TC_EN_BUSINESS_HOURS_CONFLICT | 21 |
| DUPLICATE_ADDRESS_SUFFIX | 9 |
| MISSING_ENGLISH_RECORD | 7 |
| MISSING_COORDINATES | 6 |
| SUBDISTRICT_ADDRESS_CONFLICT | 3 |
| SOURCE_FORMATTING_ARTIFACT | 1 |

---

## Pipeline Execution Warnings (5)

- ⚠️ Partner PDF overall quarantine ratio 2.7% exceeds warning threshold 1% (12/445 quarantined)
- ⚠️ Partner PDF 'OK_KLN_TC' quarantine ratio 6.7% exceeds warning threshold 1%
- ⚠️ Partner PDF 'ASP_HK_TC' quarantine ratio 8.3% exceeds warning threshold 1%
- ⚠️ Partner PDF 'ASP_NT_TC' quarantine ratio 4.3% exceeds warning threshold 1%
- ⚠️ Quarantined 5 corrupted or ambiguous partner PDF records (reasons: SERVICE_CODE_MISMATCH)

---

## Added Locations (0)

*(No added locations)*

---

## Removed Locations (2)

- `H852CB16P` [順豐智能櫃] 自助櫃 觀塘裕民薈 -- 觀塘裕民中心裕民薈1樓145號鋪(開放時間至晚上10時)
- `H852J080P` [順豐智能櫃] 自助櫃 慈雲山慈雲山中心(順豐站)(六號櫃) -- 慈雲山中心四樓410B鋪順豐站六號櫃(入門口中間位置第一列)*

---

## Updated Locations (0)

*(No updated locations)*
