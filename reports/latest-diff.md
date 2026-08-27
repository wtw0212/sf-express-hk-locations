# SF Express HK Location Sync Report

> **Last Updated**: `2026-08-27 16:07 (HKT UTC+8)`

---

## Summary

| Metric | Count |
| :--- | :--- |
| **Previous total** | 1702 |
| **Current total** | 1701 |
| **Stores** | 137 |
| **Lockers** | 1092 |
| **Partners** | 472 |
| **Added** | 2 |
| **Removed** | 3 |
| **Updated** | 0 |
| **Unchanged** | 1699 |

---

## Count Deltas

| Category | Previous | Current | Delta | Delta % | Baseline Source | Gate Result |
| :--- | ---: | ---: | ---: | ---: | :--- | :--- |
| total | 1702 | 1701 | -1 | -0.06% | previous_locations_feed | ✅ PASS |
| stores | 137 | 137 | +0 | +0% | previous_locations_feed | ✅ PASS |
| lockers | 1092 | 1092 | +0 | +0% | previous_locations_feed | ✅ PASS |
| partners | 473 | 472 | -1 | -0.21% | previous_locations_feed | ✅ PASS |
| tcCodes | 1696 | 1695 | -1 | -0.06% | previous_metadata.coverage.tc_record_count | ✅ PASS |
| enCodes | 1695 | 1694 | -1 | -0.06% | previous_metadata.coverage.en_record_count | ✅ PASS |

---

## Source Coverage & Status

| Metric | Value |
| :--- | :--- |
| TC API areas | 112/112 succeeded |
| EN API areas | 112/112 succeeded |
| TC unique codes | 1695 |
| EN unique codes | 1694 |
| Partner PDF HTTP Success | 8/8 |
| Partner PDF Parser Completed | 8/8 |
| Partner PDF Semantic Success | 5/8 |
| Partner PDF Quality Failures | 3 |
| Valid Partner PDF Records | 433 |
| Quarantined PDF Records | 12 |
| PDF Quarantine Ratio | 2.7% |
| SSR records | 188 |
| Bilingual match rate | 99.9% |
| District resolved | 1701 |
| District unresolved | 0 |
| With English data | 1694 |
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

## Added Locations (2)

- `H852MC54P` [順豐智能櫃] 自助櫃 半山區花園台 -- 半山區花園台3座地下(近管理處)(只供住戶使用)*
- `H852Z004P` [順豐智能櫃] 自助櫃 順豐大廈9樓IT簡版櫃(只限指定人仕使用) -- 123青衣航運路36號順豐大廈9樓IT簡版櫃(只限指定人仕使用)*

---

## Removed Locations (3)

- `852UA3018` [順豐合作點] 合作店 概念數碼 -- 天水圍天耀廣場LG1層LG05鋪（概念數碼）*
- `H852HB03P` [順豐智能櫃] 自助櫃 九龍灣港鐵總部大樓 -- 九龍灣港鐵總部大樓電梯大堂(只供職員使用)
- `H852Z007P` [順豐智能櫃] 自助櫃 香港 -- 順豐大廈9樓

---

## Updated Locations (0)

*(No updated locations)*
