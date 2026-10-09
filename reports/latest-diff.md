# SF Express HK Location Sync Report

> **Last Updated**: `2026-10-09 13:07 (HKT UTC+8)`

---

## Summary

| Metric | Count |
| :--- | :--- |
| **Previous total** | 1655 |
| **Current total** | 1656 |
| **Stores** | 139 |
| **Lockers** | 1052 |
| **Partners** | 465 |
| **Added** | 2 |
| **Removed** | 1 |
| **Updated** | 0 |
| **Unchanged** | 1654 |

---

## Count Deltas

| Category | Previous | Current | Delta | Delta % | Baseline Source | Gate Result |
| :--- | ---: | ---: | ---: | ---: | :--- | :--- |
| total | 1655 | 1656 | +1 | +0.06% | previous_locations_feed | ✅ PASS |
| stores | 139 | 139 | +0 | +0% | previous_locations_feed | ✅ PASS |
| lockers | 1052 | 1052 | +0 | +0% | previous_locations_feed | ✅ PASS |
| partners | 464 | 465 | +1 | +0.22% | previous_locations_feed | ✅ PASS |
| tcCodes | 1650 | 1651 | +1 | +0.06% | previous_metadata.coverage.tc_record_count | ✅ PASS |
| enCodes | 1649 | 1650 | +1 | +0.06% | previous_metadata.coverage.en_record_count | ✅ PASS |

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
| Valid Partner PDF Records | 430 |
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
| **Pipeline Execution Warnings** | 6 |
| **Record Quality Warnings** | 258 |
| **Record Quality Info Flags** | 60 |
| **Record Quality Errors** | 0 |

---

## Record Quality Flags Summary

| Flag Type | Count |
| :--- | :--- |
| ENGLISH_FIELD_CONTAINS_CJK | 96 |
| SOURCE_TC_EN_STREET_NUMBER_CONFLICT | 95 |
| ADMIN_DISTRICT_ALIAS_APPLIED | 42 |
| SOURCE_TC_EN_UNIT_CONFLICT | 38 |
| SOURCE_TC_EN_BUSINESS_HOURS_CONFLICT | 21 |
| DUPLICATE_ADDRESS_SUFFIX | 10 |
| MISSING_ENGLISH_RECORD | 6 |
| MISSING_COORDINATES | 5 |
| SOURCE_FORMATTING_ARTIFACT | 3 |
| SUBDISTRICT_ADDRESS_CONFLICT | 2 |

---

## Pipeline Execution Warnings (6)

- ⚠️ Partner PDF overall quarantine ratio 2.5% exceeds warning threshold 1% (11/441 quarantined)
- ⚠️ Partner PDF 'OK_KLN_TC' quarantine ratio 6.7% exceeds warning threshold 1%
- ⚠️ Partner PDF 'ASP_HK_TC' quarantine ratio 4.3% exceeds warning threshold 1%
- ⚠️ Partner PDF 'ASP_NT_TC' quarantine ratio 4.5% exceeds warning threshold 1%
- ⚠️ [Audit warning] Partner PDF 'ASP_ISLANDS_TC' valid record count dropped by 16.7% (6 -> 5), threshold: 15%
- ⚠️ Quarantined 4 corrupted or ambiguous partner PDF records (reasons: SERVICE_CODE_MISMATCH)

---

## Added Locations (2)

- `852PA3012` [順豐合作點] 合作店 海光自提點 -- 香港鰂魚涌海光商場2A3號鋪 (海光自提點)*
- `H852U001S` [順豐智能櫃] 冷凍櫃 屯門欣田邨欣田商場地下 -- 屯門欣田邨欣田商場地下19號鋪

---

## Removed Locations (1)

- `H852MC55P` [順豐智能櫃] 自助櫃 薄扶林職業訓練局薄扶林學生宿舍 -- 薄扶林職業訓練局薄扶林學生宿舍地下入口位置(只供職員及學生使用)

---

## Updated Locations (0)

*(No updated locations)*
