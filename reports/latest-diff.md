# SF Express HK Location Sync Report

> **Last Updated**: `2026-08-20 09:20 (HKT UTC+8)`

---

## Summary

| Metric | Count |
| :--- | :--- |
| **Previous total** | 1669 |
| **Current total** | 1668 |
| **Stores** | 137 |
| **Lockers** | 1054 |
| **Partners** | 477 |
| **Added** | 0 |
| **Removed** | 1 |
| **Updated** | 1 |
| **Unchanged** | 1667 |

---

## Count Deltas

| Category | Previous | Current | Delta | Delta % | Baseline Source | Gate Result |
| :--- | ---: | ---: | ---: | ---: | :--- | :--- |
| total | 1669 | 1668 | -1 | -0.06% | previous_locations_feed | ✅ PASS |
| stores | 137 | 137 | +0 | +0% | previous_locations_feed | ✅ PASS |
| lockers | 1055 | 1054 | -1 | -0.09% | previous_locations_feed | ✅ PASS |
| partners | 477 | 477 | +0 | +0% | previous_locations_feed | ✅ PASS |
| tcCodes | 1663 | 1662 | -1 | -0.06% | previous_metadata.coverage.tc_record_count | ✅ PASS |
| enCodes | 1662 | 1661 | -1 | -0.06% | previous_metadata.coverage.en_record_count | ✅ PASS |

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
| Valid Partner PDF Records | 441 |
| Quarantined PDF Records | 12 |
| PDF Quarantine Ratio | 2.6% |
| SSR records | 188 |
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
| **Record Quality Warnings** | 268 |
| **Record Quality Info Flags** | 58 |
| **Record Quality Errors** | 0 |

---

## Record Quality Flags Summary

| Flag Type | Count |
| :--- | :--- |
| ENGLISH_FIELD_CONTAINS_CJK | 103 |
| SOURCE_TC_EN_STREET_NUMBER_CONFLICT | 97 |
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

- ⚠️ Partner PDF overall quarantine ratio 2.6% exceeds warning threshold 1% (12/453 quarantined)
- ⚠️ Partner PDF 'OK_KLN_TC' quarantine ratio 6.7% exceeds warning threshold 1%
- ⚠️ Partner PDF 'ASP_HK_TC' quarantine ratio 8.0% exceeds warning threshold 1%
- ⚠️ Partner PDF 'ASP_NT_TC' quarantine ratio 4.1% exceeds warning threshold 1%
- ⚠️ Quarantined 5 corrupted or ambiguous partner PDF records (reasons: SERVICE_CODE_MISMATCH)

---

## Added Locations (0)

*(No added locations)*

---

## Removed Locations (1)

- `H852MC54P` [順豐智能櫃] 自助櫃 半山區花園台 -- 半山區花園台3座地下(近管理處)(只供住戶使用)

---

## Updated Locations (1)

- `H852Q011P` 自助櫃 大嶼山香港航空飛行訓練中心
  - name: `"自助櫃 大嶼山航空飛行訓練中心"` -> `"自助櫃 大嶼山香港航空飛行訓練中心"`
  - address: `"大嶼山航空飛行訓練中心地下(只供大廈內部員工使用)*"` -> `"大嶼山香港航空飛行訓練中心地下(只供大廈內部員工使用)*"`
