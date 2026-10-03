# SF Express HK Location Sync Report

> **Last Updated**: `2026-10-03 12:20 (HKT UTC+8)`

---

## Summary

| Metric | Count |
| :--- | :--- |
| **Previous total** | 1654 |
| **Current total** | 1654 |
| **Stores** | 138 |
| **Lockers** | 1050 |
| **Partners** | 466 |
| **Added** | 1 |
| **Removed** | 1 |
| **Updated** | 2 |
| **Unchanged** | 1651 |

---

## Count Deltas

| Category | Previous | Current | Delta | Delta % | Baseline Source | Gate Result |
| :--- | ---: | ---: | ---: | ---: | :--- | :--- |
| total | 1654 | 1654 | +0 | +0% | previous_locations_feed | ✅ PASS |
| stores | 138 | 138 | +0 | +0% | previous_locations_feed | ✅ PASS |
| lockers | 1049 | 1050 | +1 | +0.1% | previous_locations_feed | ✅ PASS |
| partners | 467 | 466 | -1 | -0.21% | previous_locations_feed | ✅ PASS |
| tcCodes | 1649 | 1649 | +0 | +0% | previous_metadata.coverage.tc_record_count | ✅ PASS |
| enCodes | 1648 | 1648 | +0 | +0% | previous_metadata.coverage.en_record_count | ✅ PASS |

---

## Source Coverage & Status

| Metric | Value |
| :--- | :--- |
| TC API areas | 112/112 succeeded |
| EN API areas | 112/112 succeeded |
| TC unique codes | 1649 |
| EN unique codes | 1648 |
| Partner PDF HTTP Success | 8/8 |
| Partner PDF Parser Completed | 8/8 |
| Partner PDF Semantic Success | 5/8 |
| Partner PDF Quality Failures | 3 |
| Valid Partner PDF Records | 431 |
| Quarantined PDF Records | 11 |
| PDF Quarantine Ratio | 2.5% |
| SSR records | 188 |
| Bilingual match rate | 99.9% |
| District resolved | 1654 |
| District unresolved | 0 |
| With English data | 1648 |
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

- ⚠️ Partner PDF overall quarantine ratio 2.5% exceeds warning threshold 1% (11/442 quarantined)
- ⚠️ Partner PDF 'OK_KLN_TC' quarantine ratio 6.7% exceeds warning threshold 1%
- ⚠️ Partner PDF 'ASP_HK_TC' quarantine ratio 4.3% exceeds warning threshold 1%
- ⚠️ Partner PDF 'ASP_NT_TC' quarantine ratio 4.5% exceeds warning threshold 1%
- ⚠️ Quarantined 4 corrupted or ambiguous partner PDF records (reasons: SERVICE_CODE_MISMATCH)

---

## Added Locations (1)

- `H852UV22P` [順豐智能櫃] 自助櫃 元朗爾巒H1座 -- 元朗爾巒H1座休閑空間(只供住戶使用)*

---

## Removed Locations (1)

- `852PA3012` [順豐合作點] 合作店 海光自提點 -- 香港鰂魚涌海光商場2A3號鋪 (海光自提點)*

---

## Updated Locations (2)

- `852BDL` 太子大南街順豐站
  - business_hours: `"周一至周五,10:00-22:00;周日及公眾假期,12:00-20:00;周六,12:00-20:00"` -> `"周一至周五,10:00-22:00"`
- `852Z051` 九龍塘又一城順豐站
  - telephone: `null` -> `"63297806"`
