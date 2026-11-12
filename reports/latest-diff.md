# SF Express HK Location Sync Report

> **Last Updated**: `2026-11-12 14:16 (HKT UTC+8)`

---

## Summary

| Metric | Count |
| :--- | :--- |
| **Previous total** | 1638 |
| **Current total** | 1638 |
| **Stores** | 140 |
| **Lockers** | 1046 |
| **Partners** | 452 |
| **Added** | 2 |
| **Removed** | 2 |
| **Updated** | 0 |
| **Unchanged** | 1636 |

---

## Count Deltas

| Category | Previous | Current | Delta | Delta % | Baseline Source | Gate Result |
| :--- | ---: | ---: | ---: | ---: | :--- | :--- |
| total | 1638 | 1638 | +0 | +0% | previous_locations_feed | ✅ PASS |
| stores | 140 | 140 | +0 | +0% | previous_locations_feed | ✅ PASS |
| lockers | 1044 | 1046 | +2 | +0.19% | previous_locations_feed | ✅ PASS |
| partners | 454 | 452 | -2 | -0.44% | previous_locations_feed | ✅ PASS |
| tcCodes | 1634 | 1634 | +0 | +0% | previous_metadata.coverage.tc_record_count | ✅ PASS |
| enCodes | 1632 | 1632 | +0 | +0% | previous_metadata.coverage.en_record_count | ✅ PASS |

---

## Source Coverage & Status

| Metric | Value |
| :--- | :--- |
| TC API areas | 112/112 succeeded |
| EN API areas | 112/112 succeeded |
| TC unique codes | 1634 |
| EN unique codes | 1632 |
| Partner PDF HTTP Success | 8/8 |
| Partner PDF Parser Completed | 8/8 |
| Partner PDF Semantic Success | 5/8 |
| Partner PDF Quality Failures | 3 |
| Valid Partner PDF Records | 420 |
| Quarantined PDF Records | 11 |
| PDF Quarantine Ratio | 2.6% |
| SSR records | 190 |
| Bilingual match rate | 99.9% |
| District resolved | 1638 |
| District unresolved | 0 |
| With English data | 1632 |
| Missing English | 6 |

---

## Pipeline Execution Status

| Metric | Count |
| :--- | :--- |
| **Pipeline Blocking Errors** | 0 |
| **Pipeline Execution Warnings** | 5 |
| **Record Quality Warnings** | 247 |
| **Record Quality Info Flags** | 60 |
| **Record Quality Errors** | 0 |

---

## Record Quality Flags Summary

| Flag Type | Count |
| :--- | :--- |
| SOURCE_TC_EN_STREET_NUMBER_CONFLICT | 93 |
| ENGLISH_FIELD_CONTAINS_CJK | 88 |
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

- `H852GC02P` [順豐智能櫃] 自助櫃 青衣順豐大廈地下 -- 青衣航運路36號順豐大廈地下*
- `H852LA07P` [順豐智能櫃] 自助櫃 葵涌石蔭商場地下 -- 葵涌石蔭商場G/F(近寧峰苑出入口)*

---

## Removed Locations (2)

- `852HC3002` [順豐合作點] 合作點 彩淘自提點 -- 九龍九龍灣彩福邨街市CF21號鋪 彩淘自提點*
- `852U3023` [順豐合作點] 合作店 富運 -- 新界屯門紫田路欣田邨欣田街市D23鋪（富運）*

---

## Updated Locations (0)

*(No updated locations)*
