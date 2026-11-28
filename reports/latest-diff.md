# SF Express HK Location Sync Report

> **Last Updated**: `2026-11-28 14:49 (HKT UTC+8)`

---

## Summary

| Metric | Count |
| :--- | :--- |
| **Previous total** | 1628 |
| **Current total** | 1629 |
| **Stores** | 139 |
| **Lockers** | 1039 |
| **Partners** | 451 |
| **Added** | 2 |
| **Removed** | 1 |
| **Updated** | 0 |
| **Unchanged** | 1627 |

---

## Count Deltas

| Category | Previous | Current | Delta | Delta % | Baseline Source | Gate Result |
| :--- | ---: | ---: | ---: | ---: | :--- | :--- |
| total | 1628 | 1629 | +1 | +0.06% | previous_locations_feed | ✅ PASS |
| stores | 139 | 139 | +0 | +0% | previous_locations_feed | ✅ PASS |
| lockers | 1039 | 1039 | +0 | +0% | previous_locations_feed | ✅ PASS |
| partners | 450 | 451 | +1 | +0.22% | previous_locations_feed | ✅ PASS |
| tcCodes | 1624 | 1625 | +1 | +0.06% | previous_metadata.coverage.tc_record_count | ✅ PASS |
| enCodes | 1622 | 1623 | +1 | +0.06% | previous_metadata.coverage.en_record_count | ✅ PASS |

---

## Source Coverage & Status

| Metric | Value |
| :--- | :--- |
| TC API areas | 112/112 succeeded |
| EN API areas | 112/112 succeeded |
| TC unique codes | 1625 |
| EN unique codes | 1623 |
| Partner PDF HTTP Success | 8/8 |
| Partner PDF Parser Completed | 8/8 |
| Partner PDF Semantic Success | 5/8 |
| Partner PDF Quality Failures | 3 |
| Valid Partner PDF Records | 417 |
| Quarantined PDF Records | 11 |
| PDF Quarantine Ratio | 2.6% |
| SSR records | 190 |
| Bilingual match rate | 99.9% |
| District resolved | 1629 |
| District unresolved | 0 |
| With English data | 1623 |
| Missing English | 6 |

---

## Pipeline Execution Status

| Metric | Count |
| :--- | :--- |
| **Pipeline Blocking Errors** | 0 |
| **Pipeline Execution Warnings** | 5 |
| **Record Quality Warnings** | 245 |
| **Record Quality Info Flags** | 60 |
| **Record Quality Errors** | 0 |

---

## Record Quality Flags Summary

| Flag Type | Count |
| :--- | :--- |
| SOURCE_TC_EN_STREET_NUMBER_CONFLICT | 93 |
| ENGLISH_FIELD_CONTAINS_CJK | 87 |
| ADMIN_DISTRICT_ALIAS_APPLIED | 42 |
| SOURCE_TC_EN_UNIT_CONFLICT | 38 |
| SOURCE_TC_EN_BUSINESS_HOURS_CONFLICT | 19 |
| DUPLICATE_ADDRESS_SUFFIX | 10 |
| MISSING_ENGLISH_RECORD | 6 |
| SOURCE_FORMATTING_ARTIFACT | 4 |
| MISSING_COORDINATES | 4 |
| SUBDISTRICT_ADDRESS_CONFLICT | 2 |

---

## Pipeline Execution Warnings (5)

- ⚠️ Partner PDF overall quarantine ratio 2.6% exceeds warning threshold 1% (11/428 quarantined)
- ⚠️ Partner PDF 'OK_KLN_TC' quarantine ratio 6.7% exceeds warning threshold 1%
- ⚠️ Partner PDF 'ASP_HK_TC' quarantine ratio 4.5% exceeds warning threshold 1%
- ⚠️ Partner PDF 'ASP_NT_TC' quarantine ratio 4.9% exceeds warning threshold 1%
- ⚠️ Quarantined 4 corrupted or ambiguous partner PDF records (reasons: SERVICE_CODE_MISMATCH)

---

## Added Locations (2)

- `852GA3014` [順豐合作點] 合作店 荃豐自提點 -- 新界荃灣西樓角路138-168號荃豐中心商場地下A10*荃豐自提點（14:00-15:00午休）
- `H852FE86P` [順豐智能櫃] 自助櫃 馬鞍山恆安邨巴士總站(二號櫃) -- 香港馬鞍山恆安邨巴士總站對出位置(二號櫃)*

---

## Removed Locations (1)

- `H852FE04P` [順豐智能櫃] 自助櫃 大圍新翠商場 -- 大圍新翠商場2樓(稻香酒樓轉彎,診所對面)*

---

## Updated Locations (0)

*(No updated locations)*
