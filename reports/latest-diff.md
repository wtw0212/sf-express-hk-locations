# SF Express HK Location Sync Report

> **Last Updated**: `2026-10-21 11:46 (HKT UTC+8)`

---

## Summary

| Metric | Count |
| :--- | :--- |
| **Previous total** | 1655 |
| **Current total** | 1655 |
| **Stores** | 140 |
| **Lockers** | 1051 |
| **Partners** | 464 |
| **Added** | 1 |
| **Removed** | 1 |
| **Updated** | 0 |
| **Unchanged** | 1654 |

---

## Count Deltas

| Category | Previous | Current | Delta | Delta % | Baseline Source | Gate Result |
| :--- | ---: | ---: | ---: | ---: | :--- | :--- |
| total | 1655 | 1655 | +0 | +0% | previous_locations_feed | ✅ PASS |
| stores | 139 | 140 | +1 | +0.72% | previous_locations_feed | ✅ PASS |
| lockers | 1052 | 1051 | -1 | -0.1% | previous_locations_feed | ✅ PASS |
| partners | 464 | 464 | +0 | +0% | previous_locations_feed | ✅ PASS |
| tcCodes | 1650 | 1650 | +0 | +0% | previous_metadata.coverage.tc_record_count | ✅ PASS |
| enCodes | 1649 | 1649 | +0 | +0% | previous_metadata.coverage.en_record_count | ✅ PASS |

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
| Valid Partner PDF Records | 430 |
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
| **Pipeline Execution Warnings** | 5 |
| **Record Quality Warnings** | 257 |
| **Record Quality Info Flags** | 62 |
| **Record Quality Errors** | 0 |

---

## Record Quality Flags Summary

| Flag Type | Count |
| :--- | :--- |
| SOURCE_TC_EN_STREET_NUMBER_CONFLICT | 96 |
| ENGLISH_FIELD_CONTAINS_CJK | 94 |
| ADMIN_DISTRICT_ALIAS_APPLIED | 43 |
| SOURCE_TC_EN_UNIT_CONFLICT | 38 |
| SOURCE_TC_EN_BUSINESS_HOURS_CONFLICT | 21 |
| DUPLICATE_ADDRESS_SUFFIX | 10 |
| MISSING_ENGLISH_RECORD | 6 |
| MISSING_COORDINATES | 5 |
| SOURCE_FORMATTING_ARTIFACT | 4 |
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

- `852AB` [順豐站] 大埔美新里順豐站 -- 香港大埔區大埔汀角路51A號太平工業大廈二座8樓A室*^

---

## Removed Locations (1)

- `H852K031P` [順豐智能櫃] 自助櫃 九龍城啟德道83號(LaundrYup洗衣店) -- 香港啟德道83號地下(洗衣店內)*

---

## Updated Locations (0)

*(No updated locations)*
