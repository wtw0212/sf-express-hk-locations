# SF Express HK Location Sync Report

> **Last Updated**: `2026-08-25 09:20 (HKT UTC+8)`

---

## Summary

| Metric | Count |
| :--- | :--- |
| **Previous total** | 1703 |
| **Current total** | 1703 |
| **Stores** | 137 |
| **Lockers** | 1093 |
| **Partners** | 473 |
| **Added** | 1 |
| **Removed** | 1 |
| **Updated** | 1 |
| **Unchanged** | 1701 |

---

## Count Deltas

| Category | Previous | Current | Delta | Delta % | Baseline Source | Gate Result |
| :--- | ---: | ---: | ---: | ---: | :--- | :--- |
| total | 1703 | 1703 | +0 | +0% | previous_locations_feed | ✅ PASS |
| stores | 137 | 137 | +0 | +0% | previous_locations_feed | ✅ PASS |
| lockers | 1092 | 1093 | +1 | +0.09% | previous_locations_feed | ✅ PASS |
| partners | 474 | 473 | -1 | -0.21% | previous_locations_feed | ✅ PASS |
| tcCodes | 1697 | 1697 | +0 | +0% | previous_metadata.coverage.tc_record_count | ✅ PASS |
| enCodes | 1696 | 1696 | +0 | +0% | previous_metadata.coverage.en_record_count | ✅ PASS |

---

## Source Coverage & Status

| Metric | Value |
| :--- | :--- |
| TC API areas | 112/112 succeeded |
| EN API areas | 112/112 succeeded |
| TC unique codes | 1697 |
| EN unique codes | 1696 |
| Partner PDF HTTP Success | 8/8 |
| Partner PDF Parser Completed | 8/8 |
| Partner PDF Semantic Success | 5/8 |
| Partner PDF Quality Failures | 3 |
| Valid Partner PDF Records | 434 |
| Quarantined PDF Records | 12 |
| PDF Quarantine Ratio | 2.7% |
| SSR records | 188 |
| Bilingual match rate | 99.9% |
| District resolved | 1703 |
| District unresolved | 0 |
| With English data | 1696 |
| Missing English | 7 |

---

## Pipeline Execution Status

| Metric | Count |
| :--- | :--- |
| **Pipeline Blocking Errors** | 0 |
| **Pipeline Execution Warnings** | 5 |
| **Record Quality Warnings** | 267 |
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
| COORDINATES_OUTSIDE_HK | 1 |

---

## Pipeline Execution Warnings (5)

- ⚠️ Partner PDF overall quarantine ratio 2.7% exceeds warning threshold 1% (12/446 quarantined)
- ⚠️ Partner PDF 'OK_KLN_TC' quarantine ratio 6.7% exceeds warning threshold 1%
- ⚠️ Partner PDF 'ASP_HK_TC' quarantine ratio 8.3% exceeds warning threshold 1%
- ⚠️ Partner PDF 'ASP_NT_TC' quarantine ratio 4.3% exceeds warning threshold 1%
- ⚠️ Quarantined 5 corrupted or ambiguous partner PDF records (reasons: SERVICE_CODE_MISMATCH)

---

## Added Locations (1)

- `H852Z004P` [順豐智能櫃] 自助櫃 順豐大廈9樓IT簡版櫃(只限指定人仕使用) -- 123青衣航運路36號順豐大廈9樓IT簡版櫃(只限指定人仕使用)*

---

## Removed Locations (1)

- `852LB3001` [順豐合作點] 合作點 AMI自提點 -- 香港葵青區葵涌葵涌中心A12 AMI 葵興自提點*

---

## Updated Locations (1)

- `H852AB07P` 自助櫃 大埔林海山城
  - location.latitude: `22.462558` -> `22.462655`
  - location.longitude: `114.19751` -> `114.196196`
