# SF Express HK Location Sync Report

> **Last Updated**: `2026-09-01 12:06 (HKT UTC+8)`

---

## Summary

| Metric | Count |
| :--- | :--- |
| **Previous total** | 1699 |
| **Current total** | 1695 |
| **Stores** | 138 |
| **Lockers** | 1088 |
| **Partners** | 469 |
| **Added** | 0 |
| **Removed** | 4 |
| **Updated** | 4 |
| **Unchanged** | 1691 |

---

## Count Deltas

| Category | Previous | Current | Delta | Delta % | Baseline Source | Gate Result |
| :--- | ---: | ---: | ---: | ---: | :--- | :--- |
| total | 1699 | 1695 | -4 | -0.24% | previous_locations_feed | ✅ PASS |
| stores | 138 | 138 | +0 | +0% | previous_locations_feed | ✅ PASS |
| lockers | 1089 | 1088 | -1 | -0.09% | previous_locations_feed | ✅ PASS |
| partners | 472 | 469 | -3 | -0.64% | previous_locations_feed | ✅ PASS |
| tcCodes | 1693 | 1689 | -4 | -0.24% | previous_metadata.coverage.tc_record_count | ✅ PASS |
| enCodes | 1692 | 1688 | -4 | -0.24% | previous_metadata.coverage.en_record_count | ✅ PASS |

---

## Source Coverage & Status

| Metric | Value |
| :--- | :--- |
| TC API areas | 112/112 succeeded |
| EN API areas | 112/112 succeeded |
| TC unique codes | 1689 |
| EN unique codes | 1688 |
| Partner PDF HTTP Success | 8/8 |
| Partner PDF Parser Completed | 8/8 |
| Partner PDF Semantic Success | 5/8 |
| Partner PDF Quality Failures | 3 |
| Valid Partner PDF Records | 431 |
| Quarantined PDF Records | 12 |
| PDF Quarantine Ratio | 2.7% |
| SSR records | 188 |
| Bilingual match rate | 99.9% |
| District resolved | 1695 |
| District unresolved | 0 |
| With English data | 1688 |
| Missing English | 7 |

---

## Pipeline Execution Status

| Metric | Count |
| :--- | :--- |
| **Pipeline Blocking Errors** | 0 |
| **Pipeline Execution Warnings** | 5 |
| **Record Quality Warnings** | 264 |
| **Record Quality Info Flags** | 61 |
| **Record Quality Errors** | 0 |

---

## Record Quality Flags Summary

| Flag Type | Count |
| :--- | :--- |
| ENGLISH_FIELD_CONTAINS_CJK | 98 |
| SOURCE_TC_EN_STREET_NUMBER_CONFLICT | 97 |
| ADMIN_DISTRICT_ALIAS_APPLIED | 44 |
| SOURCE_TC_EN_UNIT_CONFLICT | 38 |
| SOURCE_TC_EN_BUSINESS_HOURS_CONFLICT | 21 |
| DUPLICATE_ADDRESS_SUFFIX | 9 |
| MISSING_ENGLISH_RECORD | 7 |
| MISSING_COORDINATES | 6 |
| SUBDISTRICT_ADDRESS_CONFLICT | 3 |
| SOURCE_FORMATTING_ARTIFACT | 2 |

---

## Pipeline Execution Warnings (5)

- ⚠️ Partner PDF overall quarantine ratio 2.7% exceeds warning threshold 1% (12/443 quarantined)
- ⚠️ Partner PDF 'OK_KLN_TC' quarantine ratio 6.7% exceeds warning threshold 1%
- ⚠️ Partner PDF 'ASP_HK_TC' quarantine ratio 8.3% exceeds warning threshold 1%
- ⚠️ Partner PDF 'ASP_NT_TC' quarantine ratio 4.5% exceeds warning threshold 1%
- ⚠️ Quarantined 5 corrupted or ambiguous partner PDF records (reasons: SERVICE_CODE_MISMATCH)

---

## Added Locations (0)

*(No added locations)*

---

## Removed Locations (4)

- `852AB3011` [順豐合作點] 合作店 彩禧生活百貨 -- 大埔區富蝶商場地下14號鋪 彩禧生活百貨*
- `852CH3005` [順豐合作點] 合作店 自由速遞 -- 新界將軍澳慧安商場A74-75號鋪自由速遞*
- `852FH3012` [順豐合作點] 合作店 咪咪公社 -- 大圍大圍村第一街4號D1鋪 咪咪公社*
- `H852BA98P` [順豐智能櫃] 自助櫃 深水埗楓華樓(你的自助洗衣) -- 深水埗楓樹街23-23B號楓華樓地下4號鋪(你的自助洗衣)*

---

## Updated Locations (4)

- `H852GC80P` 自助櫃 青衣翠怡花園7座至8座
  - name: `"自助櫃 青衣翠怡花園7座至8座(一號櫃)"` -> `"自助櫃 青衣翠怡花園7座至8座"`
  - name_en: `"SF Locker Locker No.1, Block 7 and 8, Greedfield Garden, Tsing Yi"` -> `"SF Locker Block 7 and 8, Greenfield Garden, Tsing Yi"`
  - address_en: `"Locker No.1, Block 7 and 8, Greedfield Garden, Tsing Yi*"` -> `"Locker No.1, Block 7 and 8, Greenfield Garden, Tsing Yi*"`
- `H852GC81P` 自助櫃 青衣翠怡花園7座至8座(二號櫃)
  - name_en: `"SF Locker Locker No.2, Block 7 and 8, Greedfield Garden, Tsing Yi"` -> `"SF Locker Locker No.2, Block 7 and 8, Greenfield Garden, Tsing Yi"`
  - address_en: `"Locker No.2, Block 7 and 8, Greedfield Garden, Tsing Yi*"` -> `"Locker No.2, Block 7 and 8, Greenfield Garden, Tsing Yi*"`
- `H852UB19P` 自助櫃 天水圍天澤商場
  - business_hours: `"11:00-20:30 周六:12:00-20:00 周日:12:00-20:00 節假日:12:00-20:00"` -> `"06:00-23:59 周六:06:00-23:59 周日:06:00-23:59 節假日:06:00-23:59"`
  - business_hours_en: `"11:00-20:30"` -> `"06:00-23:59"`
- `H852UB54P` 自助櫃 天水圍天澤商場(二號櫃)
  - business_hours: `"11:00-20:30 周六:12:00-20:00 周日:12:00-20:00 節假日:12:00-20:00"` -> `"06:00-23:59 周六:06:00-23:59 周日:06:00-23:59 節假日:06:00-23:59"`
  - business_hours_en: `"11:00-20:30"` -> `"06:00-23:59"`
