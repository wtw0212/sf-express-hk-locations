# SF Express HK Location Sync Report

> **Last Updated**: `2026-11-06 13:37 (HKT UTC+8)`

---

## Summary

| Metric | Count |
| :--- | :--- |
| **Previous total** | 1643 |
| **Current total** | 1645 |
| **Stores** | 140 |
| **Lockers** | 1049 |
| **Partners** | 456 |
| **Added** | 2 |
| **Removed** | 0 |
| **Updated** | 0 |
| **Unchanged** | 1643 |

---

## Count Deltas

| Category | Previous | Current | Delta | Delta % | Baseline Source | Gate Result |
| :--- | ---: | ---: | ---: | ---: | :--- | :--- |
| total | 1643 | 1645 | +2 | +0.12% | previous_locations_feed | ✅ PASS |
| stores | 140 | 140 | +0 | +0% | previous_locations_feed | ✅ PASS |
| lockers | 1047 | 1049 | +2 | +0.19% | previous_locations_feed | ✅ PASS |
| partners | 456 | 456 | +0 | +0% | previous_locations_feed | ✅ PASS |
| tcCodes | 1639 | 1641 | +2 | +0.12% | previous_metadata.coverage.tc_record_count | ✅ PASS |
| enCodes | 1637 | 1639 | +2 | +0.12% | previous_metadata.coverage.en_record_count | ✅ PASS |

---

## Source Coverage & Status

| Metric | Value |
| :--- | :--- |
| TC API areas | 112/112 succeeded |
| EN API areas | 112/112 succeeded |
| TC unique codes | 1641 |
| EN unique codes | 1639 |
| Partner PDF HTTP Success | 8/8 |
| Partner PDF Parser Completed | 8/8 |
| Partner PDF Semantic Success | 5/8 |
| Partner PDF Quality Failures | 3 |
| Valid Partner PDF Records | 420 |
| Quarantined PDF Records | 11 |
| PDF Quarantine Ratio | 2.6% |
| SSR records | 190 |
| Bilingual match rate | 99.9% |
| District resolved | 1645 |
| District unresolved | 0 |
| With English data | 1639 |
| Missing English | 6 |

---

## Pipeline Execution Status

| Metric | Count |
| :--- | :--- |
| **Pipeline Blocking Errors** | 0 |
| **Pipeline Execution Warnings** | 5 |
| **Record Quality Warnings** | 250 |
| **Record Quality Info Flags** | 60 |
| **Record Quality Errors** | 0 |

---

## Record Quality Flags Summary

| Flag Type | Count |
| :--- | :--- |
| SOURCE_TC_EN_STREET_NUMBER_CONFLICT | 94 |
| ENGLISH_FIELD_CONTAINS_CJK | 90 |
| ADMIN_DISTRICT_ALIAS_APPLIED | 42 |
| SOURCE_TC_EN_UNIT_CONFLICT | 38 |
| SOURCE_TC_EN_BUSINESS_HOURS_CONFLICT | 20 |
| DUPLICATE_ADDRESS_SUFFIX | 10 |
| MISSING_ENGLISH_RECORD | 6 |
| SOURCE_FORMATTING_ARTIFACT | 4 |
| MISSING_COORDINATES | 4 |
| SUBDISTRICT_ADDRESS_CONFLICT | 2 |

---

## Pipeline Execution Warnings (5)

- ⚠️ Partner PDF overall quarantine ratio 2.6% exceeds warning threshold 1% (11/431 quarantined)
- ⚠️ Partner PDF 'OK_KLN_TC' quarantine ratio 6.7% exceeds warning threshold 1%
- ⚠️ Partner PDF 'ASP_HK_TC' quarantine ratio 4.3% exceeds warning threshold 1%
- ⚠️ Partner PDF 'ASP_NT_TC' quarantine ratio 4.9% exceeds warning threshold 1%
- ⚠️ Quarantined 4 corrupted or ambiguous partner PDF records (reasons: SERVICE_CODE_MISMATCH)

---

## Added Locations (2)

- `H852G099P` [順豐智能櫃] 自助櫃 東涌迎東邨迎悅樓 -- 東涌迎東邨迎悅樓地下*
- `H852GH23P` [順豐智能櫃] 自助櫃 青衣職業訓練局青衣學生舍堂 -- 青衣職業訓練局青衣學生舍堂地下(只供職員及學生使用)

---

## Removed Locations (0)

*(No removed locations)*

---

## Updated Locations (0)

*(No updated locations)*
