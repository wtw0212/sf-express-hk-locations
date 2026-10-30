# SF Express HK Location Sync Report

> **Last Updated**: `2026-10-30 12:51 (HKT UTC+8)`

---

## Summary

| Metric | Count |
| :--- | :--- |
| **Previous total** | 1647 |
| **Current total** | 1648 |
| **Stores** | 140 |
| **Lockers** | 1048 |
| **Partners** | 460 |
| **Added** | 2 |
| **Removed** | 1 |
| **Updated** | 0 |
| **Unchanged** | 1646 |

---

## Count Deltas

| Category | Previous | Current | Delta | Delta % | Baseline Source | Gate Result |
| :--- | ---: | ---: | ---: | ---: | :--- | :--- |
| total | 1647 | 1648 | +1 | +0.06% | previous_locations_feed | ✅ PASS |
| stores | 140 | 140 | +0 | +0% | previous_locations_feed | ✅ PASS |
| lockers | 1048 | 1048 | +0 | +0% | previous_locations_feed | ✅ PASS |
| partners | 459 | 460 | +1 | +0.22% | previous_locations_feed | ✅ PASS |
| tcCodes | 1642 | 1643 | +1 | +0.06% | previous_metadata.coverage.tc_record_count | ✅ PASS |
| enCodes | 1641 | 1642 | +1 | +0.06% | previous_metadata.coverage.en_record_count | ✅ PASS |

---

## Source Coverage & Status

| Metric | Value |
| :--- | :--- |
| TC API areas | 112/112 succeeded |
| EN API areas | 112/112 succeeded |
| TC unique codes | 1643 |
| EN unique codes | 1642 |
| Partner PDF HTTP Success | 8/8 |
| Partner PDF Parser Completed | 8/8 |
| Partner PDF Semantic Success | 5/8 |
| Partner PDF Quality Failures | 3 |
| Valid Partner PDF Records | 427 |
| Quarantined PDF Records | 11 |
| PDF Quarantine Ratio | 2.5% |
| SSR records | 190 |
| Bilingual match rate | 99.9% |
| District resolved | 1648 |
| District unresolved | 0 |
| With English data | 1642 |
| Missing English | 6 |

---

## Pipeline Execution Status

| Metric | Count |
| :--- | :--- |
| **Pipeline Blocking Errors** | 0 |
| **Pipeline Execution Warnings** | 5 |
| **Record Quality Warnings** | 253 |
| **Record Quality Info Flags** | 61 |
| **Record Quality Errors** | 0 |

---

## Record Quality Flags Summary

| Flag Type | Count |
| :--- | :--- |
| SOURCE_TC_EN_STREET_NUMBER_CONFLICT | 96 |
| ENGLISH_FIELD_CONTAINS_CJK | 91 |
| ADMIN_DISTRICT_ALIAS_APPLIED | 42 |
| SOURCE_TC_EN_UNIT_CONFLICT | 38 |
| SOURCE_TC_EN_BUSINESS_HOURS_CONFLICT | 20 |
| DUPLICATE_ADDRESS_SUFFIX | 10 |
| MISSING_ENGLISH_RECORD | 6 |
| MISSING_COORDINATES | 5 |
| SOURCE_FORMATTING_ARTIFACT | 4 |
| SUBDISTRICT_ADDRESS_CONFLICT | 2 |

---

## Pipeline Execution Warnings (5)

- ⚠️ Partner PDF overall quarantine ratio 2.5% exceeds warning threshold 1% (11/438 quarantined)
- ⚠️ Partner PDF 'OK_KLN_TC' quarantine ratio 6.7% exceeds warning threshold 1%
- ⚠️ Partner PDF 'ASP_HK_TC' quarantine ratio 4.3% exceeds warning threshold 1%
- ⚠️ Partner PDF 'ASP_NT_TC' quarantine ratio 4.6% exceeds warning threshold 1%
- ⚠️ Quarantined 4 corrupted or ambiguous partner PDF records (reasons: SERVICE_CODE_MISMATCH)

---

## Added Locations (2)

- `852CAD3001` [順豐合作點] 合作店 速豹物流順利街市 -- 觀塘利安道15號順利邨順利街市56B檔位（速豹物流順利街市）*
- `H852AB11P` [順豐智能櫃] 自助櫃 大埔大元村泰民樓地下2號鋪三號櫃 -- 大埔大元邨泰民樓地下2號鋪三號櫃*

---

## Removed Locations (1)

- `H852A066P` [順豐智能櫃] 自助櫃 粉嶺聯昌街(365 Laundry) -- 粉嶺聯昌街31號地下(洗衣店內)*

---

## Updated Locations (0)

*(No updated locations)*
