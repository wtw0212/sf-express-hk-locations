# SF Express HK Location Sync Report

> **Last Updated**: `2026-10-15 11:42 (HKT UTC+8)`

---

## Summary

| Metric | Count |
| :--- | :--- |
| **Previous total** | 1655 |
| **Current total** | 1654 |
| **Stores** | 139 |
| **Lockers** | 1052 |
| **Partners** | 463 |
| **Added** | 0 |
| **Removed** | 1 |
| **Updated** | 1 |
| **Unchanged** | 1653 |

---

## Count Deltas

| Category | Previous | Current | Delta | Delta % | Baseline Source | Gate Result |
| :--- | ---: | ---: | ---: | ---: | :--- | :--- |
| total | 1655 | 1654 | -1 | -0.06% | previous_locations_feed | ✅ PASS |
| stores | 139 | 139 | +0 | +0% | previous_locations_feed | ✅ PASS |
| lockers | 1052 | 1052 | +0 | +0% | previous_locations_feed | ✅ PASS |
| partners | 464 | 463 | -1 | -0.22% | previous_locations_feed | ✅ PASS |
| tcCodes | 1650 | 1648 | -2 | -0.12% | previous_metadata.coverage.tc_record_count | ✅ PASS |
| enCodes | 1649 | 1647 | -2 | -0.12% | previous_metadata.coverage.en_record_count | ✅ PASS |

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
| Valid Partner PDF Records | 430 |
| Quarantined PDF Records | 11 |
| PDF Quarantine Ratio | 2.5% |
| SSR records | 190 |
| Bilingual match rate | 99.9% |
| District resolved | 1654 |
| District unresolved | 0 |
| With English data | 1647 |
| Missing English | 7 |

---

## Pipeline Execution Status

| Metric | Count |
| :--- | :--- |
| **Pipeline Blocking Errors** | 0 |
| **Pipeline Execution Warnings** | 5 |
| **Record Quality Warnings** | 256 |
| **Record Quality Info Flags** | 61 |
| **Record Quality Errors** | 0 |

---

## Record Quality Flags Summary

| Flag Type | Count |
| :--- | :--- |
| SOURCE_TC_EN_STREET_NUMBER_CONFLICT | 95 |
| ENGLISH_FIELD_CONTAINS_CJK | 93 |
| ADMIN_DISTRICT_ALIAS_APPLIED | 42 |
| SOURCE_TC_EN_UNIT_CONFLICT | 38 |
| SOURCE_TC_EN_BUSINESS_HOURS_CONFLICT | 21 |
| DUPLICATE_ADDRESS_SUFFIX | 10 |
| MISSING_ENGLISH_RECORD | 7 |
| MISSING_COORDINATES | 6 |
| SOURCE_FORMATTING_ARTIFACT | 3 |
| SUBDISTRICT_ADDRESS_CONFLICT | 2 |

---

## Pipeline Execution Warnings (5)

- ⚠️ Partner PDF overall quarantine ratio 2.5% exceeds warning threshold 1% (11/441 quarantined)
- ⚠️ Partner PDF 'OK_KLN_TC' quarantine ratio 6.7% exceeds warning threshold 1%
- ⚠️ Partner PDF 'ASP_HK_TC' quarantine ratio 4.3% exceeds warning threshold 1%
- ⚠️ Partner PDF 'ASP_NT_TC' quarantine ratio 4.5% exceeds warning threshold 1%
- ⚠️ Quarantined 4 corrupted or ambiguous partner PDF records (reasons: SERVICE_CODE_MISMATCH)

---

## Added Locations (0)

*(No added locations)*

---

## Removed Locations (1)

- `852GH3011` [順豐合作點] 合作店 梅窩集運店 -- 新界梅窩鄉事會路14號(梅窩集運店)*

---

## Updated Locations (1)

- `H852GC01S` 順豐智能櫃 青衣
  - name: `"冷凍櫃 青衣順豐大廈九樓(只供大廈員工使用)"` -> `"順豐智能櫃 青衣"`
  - name_en: `"Next to Lift, 9/F,Asia Logistics Hub SFCentre,Tsing Yi"` -> `null`
  - sub_district_en: `"Tsing Yi"` -> `null`
  - address: `"青衣順豐大廈九樓電梯旁(只供大廈員工使用)"` -> `"香港新界葵青區青衣航運路36號順豐大廈九樓電梯旁順豐冷凍櫃(只供住戶使用)"`
  - address_en: `"Next to Lift, 9/F,Asia Logistics Hub SFCentre,Tsing Yi (Only for staff)"` -> `null`
  - business_hours: `"00:00-23:59 周六:00:00-23:59 周日:00:00-23:59 節假日:00:00-23:59"` -> `"24小時"`
  - business_hours_en: `"00:00-23:59"` -> `null`
  - source: `"api_tc"` -> `"ssr"`
  - location.latitude: `22.33543` -> `null`
  - location.longitude: `114.11069` -> `null`
  - quality_flags: +MISSING_COORDINATES, +MISSING_ENGLISH_RECORD
