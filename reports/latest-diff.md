# SF Express HK Location Sync Report

> **Last Updated**: `2026-10-10 12:53 (HKT UTC+8)`

---

## Summary

| Metric | Count |
| :--- | :--- |
| **Previous total** | 1656 |
| **Current total** | 1656 |
| **Stores** | 139 |
| **Lockers** | 1052 |
| **Partners** | 465 |
| **Added** | 1 |
| **Removed** | 1 |
| **Updated** | 1 |
| **Unchanged** | 1654 |

---

## Count Deltas

| Category | Previous | Current | Delta | Delta % | Baseline Source | Gate Result |
| :--- | ---: | ---: | ---: | ---: | :--- | :--- |
| total | 1656 | 1656 | +0 | +0% | previous_locations_feed | ✅ PASS |
| stores | 139 | 139 | +0 | +0% | previous_locations_feed | ✅ PASS |
| lockers | 1052 | 1052 | +0 | +0% | previous_locations_feed | ✅ PASS |
| partners | 465 | 465 | +0 | +0% | previous_locations_feed | ✅ PASS |
| tcCodes | 1651 | 1651 | +0 | +0% | previous_metadata.coverage.tc_record_count | ✅ PASS |
| enCodes | 1650 | 1650 | +0 | +0% | previous_metadata.coverage.en_record_count | ✅ PASS |

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
| SSR records | 190 |
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
| **Pipeline Execution Warnings** | 5 |
| **Record Quality Warnings** | 257 |
| **Record Quality Info Flags** | 61 |
| **Record Quality Errors** | 0 |

---

## Record Quality Flags Summary

| Flag Type | Count |
| :--- | :--- |
| ENGLISH_FIELD_CONTAINS_CJK | 95 |
| SOURCE_TC_EN_STREET_NUMBER_CONFLICT | 95 |
| ADMIN_DISTRICT_ALIAS_APPLIED | 43 |
| SOURCE_TC_EN_UNIT_CONFLICT | 38 |
| SOURCE_TC_EN_BUSINESS_HOURS_CONFLICT | 21 |
| DUPLICATE_ADDRESS_SUFFIX | 10 |
| MISSING_ENGLISH_RECORD | 6 |
| MISSING_COORDINATES | 5 |
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

## Added Locations (1)

- `852M3002` [順豐合作點] 合作點 潮點集運 -- 香港長洲大新後街122號地下潮點集運*

---

## Removed Locations (1)

- `852J3027` [順豐合作點] 合作店 點拎貳 -- 九龍翠竹街8號翠竹花園商場3樓307號鋪(點拎貳)*

---

## Updated Locations (1)

- `H852U001S` 冷凍櫃 屯門欣田邨欣田商場地下
  - address: `"屯門欣田邨欣田商場地下19號鋪"` -> `"屯門欣田邨欣田商場地下19號鋪冷凍櫃"`
