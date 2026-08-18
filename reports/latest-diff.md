# SF Express HK Location Sync Report

> **Last Updated**: `2026-08-18 09:18 (HKT UTC+8)`

---

## Summary

| Metric | Count |
| :--- | :--- |
| **Previous total** | 1668 |
| **Current total** | 1669 |
| **Stores** | 137 |
| **Lockers** | 1054 |
| **Partners** | 478 |
| **Added** | 2 |
| **Removed** | 1 |
| **Updated** | 1 |
| **Unchanged** | 1666 |

---

## Count Deltas

| Category | Previous | Current | Delta | Delta % | Baseline Source | Gate Result |
| :--- | ---: | ---: | ---: | ---: | :--- | :--- |
| total | 1668 | 1669 | +1 | +0.06% | previous_locations_feed | ✅ PASS |
| stores | 137 | 137 | +0 | +0% | previous_locations_feed | ✅ PASS |
| lockers | 1052 | 1054 | +2 | +0.19% | previous_locations_feed | ✅ PASS |
| partners | 479 | 478 | -1 | -0.21% | previous_locations_feed | ✅ PASS |
| tcCodes | 1662 | 1663 | +1 | +0.06% | previous_metadata.coverage.tc_record_count | ✅ PASS |
| enCodes | 1661 | 1662 | +1 | +0.06% | previous_metadata.coverage.en_record_count | ✅ PASS |

---

## Source Coverage & Status

| Metric | Value |
| :--- | :--- |
| TC API areas | 112/112 succeeded |
| EN API areas | 112/112 succeeded |
| TC unique codes | 1663 |
| EN unique codes | 1662 |
| Partner PDF HTTP Success | 8/8 |
| Partner PDF Parser Completed | 8/8 |
| Partner PDF Semantic Success | 5/8 |
| Partner PDF Quality Failures | 3 |
| Valid Partner PDF Records | 441 |
| Quarantined PDF Records | 12 |
| PDF Quarantine Ratio | 2.6% |
| SSR records | 188 |
| Bilingual match rate | 99.9% |
| District resolved | 1669 |
| District unresolved | 0 |
| With English data | 1662 |
| Missing English | 7 |

---

## Pipeline Execution Status

| Metric | Count |
| :--- | :--- |
| **Pipeline Blocking Errors** | 0 |
| **Pipeline Execution Warnings** | 5 |
| **Record Quality Warnings** | 270 |
| **Record Quality Info Flags** | 58 |
| **Record Quality Errors** | 0 |

---

## Record Quality Flags Summary

| Flag Type | Count |
| :--- | :--- |
| ENGLISH_FIELD_CONTAINS_CJK | 104 |
| SOURCE_TC_EN_STREET_NUMBER_CONFLICT | 98 |
| ADMIN_DISTRICT_ALIAS_APPLIED | 42 |
| SOURCE_TC_EN_UNIT_CONFLICT | 38 |
| SOURCE_TC_EN_BUSINESS_HOURS_CONFLICT | 21 |
| DUPLICATE_ADDRESS_SUFFIX | 9 |
| MISSING_ENGLISH_RECORD | 7 |
| MISSING_COORDINATES | 6 |
| SUBDISTRICT_ADDRESS_CONFLICT | 2 |
| SOURCE_FORMATTING_ARTIFACT | 1 |

---

## Pipeline Execution Warnings (5)

- ⚠️ Partner PDF overall quarantine ratio 2.6% exceeds warning threshold 1% (12/453 quarantined)
- ⚠️ Partner PDF 'OK_KLN_TC' quarantine ratio 6.7% exceeds warning threshold 1%
- ⚠️ Partner PDF 'ASP_HK_TC' quarantine ratio 8.0% exceeds warning threshold 1%
- ⚠️ Partner PDF 'ASP_NT_TC' quarantine ratio 4.1% exceeds warning threshold 1%
- ⚠️ Quarantined 5 corrupted or ambiguous partner PDF records (reasons: SERVICE_CODE_MISMATCH)

---

## Added Locations (2)

- `H852M053P` [順豐智能櫃] 自助櫃 中環誠利商業大廈(順豐站) -- 中環誠利商業大廈地下15號鋪
- `H852Z004P` [順豐智能櫃] 自助櫃 順豐大廈9樓IT簡版櫃(只限指定人仕使用) -- 123青衣航運路36號順豐大廈9樓IT簡版櫃(只限指定人仕使用)*

---

## Removed Locations (1)

- `852GH3009` [順豐合作點] 合作店 長青傢具平台 -- 新界青衣長青邨長青商場10號（長青傢具平台）*

---

## Updated Locations (1)

- `H852Q011P` 自助櫃 大嶼山航空飛行訓練中心
  - address: `"大嶼山航空飛行訓練中心地下(只供職員使用)*"` -> `"大嶼山航空飛行訓練中心地下(只供大廈內部員工使用)*"`
  - address_en: `"Lobby, G/F, Hong Kong Airlines Training Centre, Lantau Island(Only for staff)*"` -> `"Lobby, G/F, Hong Kong Airlines Training Centre, Lantau Island(HKA Tower staff only)*"`
