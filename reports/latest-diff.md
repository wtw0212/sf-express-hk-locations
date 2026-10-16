# SF Express HK Location Sync Report

> **Last Updated**: `2026-10-16 11:38 (HKT UTC+8)`

---

## Summary

| Metric | Count |
| :--- | :--- |
| **Previous total** | 1654 |
| **Current total** | 1655 |
| **Stores** | 139 |
| **Lockers** | 1052 |
| **Partners** | 464 |
| **Added** | 1 |
| **Removed** | 0 |
| **Updated** | 1 |
| **Unchanged** | 1653 |

---

## Count Deltas

| Category | Previous | Current | Delta | Delta % | Baseline Source | Gate Result |
| :--- | ---: | ---: | ---: | ---: | :--- | :--- |
| total | 1654 | 1655 | +1 | +0.06% | previous_locations_feed | ✅ PASS |
| stores | 139 | 139 | +0 | +0% | previous_locations_feed | ✅ PASS |
| lockers | 1052 | 1052 | +0 | +0% | previous_locations_feed | ✅ PASS |
| partners | 463 | 464 | +1 | +0.22% | previous_locations_feed | ✅ PASS |
| tcCodes | 1648 | 1650 | +2 | +0.12% | previous_metadata.coverage.tc_record_count | ✅ PASS |
| enCodes | 1647 | 1649 | +2 | +0.12% | previous_metadata.coverage.en_record_count | ✅ PASS |

---

## Source Coverage & Status

| Metric | Value |
| :--- | :--- |
| TC API areas | 112/112 succeeded |
| EN API areas | 112/112 succeeded |
| TC unique codes | 1650 |
| EN unique codes | 1649 |
| Partner PDF HTTP Success | 8/8 |
| Partner PDF Parser Completed | 8/8 |
| Partner PDF Semantic Success | 5/8 |
| Partner PDF Quality Failures | 3 |
| Valid Partner PDF Records | 429 |
| Quarantined PDF Records | 11 |
| PDF Quarantine Ratio | 2.5% |
| SSR records | 190 |
| Bilingual match rate | 99.9% |
| District resolved | 1655 |
| District unresolved | 0 |
| With English data | 1649 |
| Missing English | 6 |

---

## Pipeline Execution Status

| Metric | Count |
| :--- | :--- |
| **Pipeline Blocking Errors** | 0 |
| **Pipeline Execution Warnings** | 6 |
| **Record Quality Warnings** | 256 |
| **Record Quality Info Flags** | 61 |
| **Record Quality Errors** | 0 |

---

## Record Quality Flags Summary

| Flag Type | Count |
| :--- | :--- |
| SOURCE_TC_EN_STREET_NUMBER_CONFLICT | 95 |
| ENGLISH_FIELD_CONTAINS_CJK | 94 |
| ADMIN_DISTRICT_ALIAS_APPLIED | 43 |
| SOURCE_TC_EN_UNIT_CONFLICT | 38 |
| SOURCE_TC_EN_BUSINESS_HOURS_CONFLICT | 21 |
| DUPLICATE_ADDRESS_SUFFIX | 10 |
| MISSING_ENGLISH_RECORD | 6 |
| MISSING_COORDINATES | 5 |
| SOURCE_FORMATTING_ARTIFACT | 3 |
| SUBDISTRICT_ADDRESS_CONFLICT | 2 |

---

## Pipeline Execution Warnings (6)

- ⚠️ Partner PDF overall quarantine ratio 2.5% exceeds warning threshold 1% (11/440 quarantined)
- ⚠️ Partner PDF 'OK_KLN_TC' quarantine ratio 6.7% exceeds warning threshold 1%
- ⚠️ Partner PDF 'ASP_HK_TC' quarantine ratio 4.3% exceeds warning threshold 1%
- ⚠️ Partner PDF 'ASP_NT_TC' quarantine ratio 4.5% exceeds warning threshold 1%
- ⚠️ [Audit warning] Partner PDF 'ASP_ISLANDS_TC' valid record count dropped by 16.7% (6 -> 5), threshold: 15%
- ⚠️ Quarantined 4 corrupted or ambiguous partner PDF records (reasons: SERVICE_CODE_MISMATCH)

---

## Added Locations (1)

- `852GH3011` [順豐合作點] 合作店 梅窩集運店 -- 新界梅窩鄉事會路14號(梅窩集運店)*

---

## Removed Locations (0)

*(No removed locations)*

---

## Updated Locations (1)

- `H852GC01S` 冷凍櫃 青衣順豐大廈九樓(只供大廈員工使用)
  - name: `"順豐智能櫃 青衣"` -> `"冷凍櫃 青衣順豐大廈九樓(只供大廈員工使用)"`
  - name_en: `null` -> `"Next to Lift, 9/F,Asia Logistics Hub SFCentre,Tsing Yi"`
  - sub_district_en: `null` -> `"Tsing Yi"`
  - address: `"香港新界葵青區青衣航運路36號順豐大廈九樓電梯旁順豐冷凍櫃(只供住戶使用)"` -> `"青衣順豐大廈九樓電梯旁(只供大廈員工使用)"`
  - address_en: `null` -> `"Next to Lift, 9/F,Asia Logistics Hub SFCentre,Tsing Yi (Only for staff)"`
  - business_hours: `"24小時"` -> `"00:00-23:59 周六:00:00-23:59 周日:00:00-23:59 節假日:00:00-23:59"`
  - business_hours_en: `null` -> `"00:00-23:59"`
  - source: `"ssr"` -> `"api_tc"`
  - location.latitude: `null` -> `22.33543`
  - location.longitude: `null` -> `114.11069`
  - quality_flags: -MISSING_COORDINATES, -MISSING_ENGLISH_RECORD
