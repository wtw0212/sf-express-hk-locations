# SF Express HK Location Sync Report

> **Last Updated**: `2026-10-23 11:49 (HKT UTC+8)`

---

## Summary

| Metric | Count |
| :--- | :--- |
| **Previous total** | 1656 |
| **Current total** | 1652 |
| **Stores** | 140 |
| **Lockers** | 1049 |
| **Partners** | 463 |
| **Added** | 0 |
| **Removed** | 4 |
| **Updated** | 0 |
| **Unchanged** | 1652 |

---

## Count Deltas

| Category | Previous | Current | Delta | Delta % | Baseline Source | Gate Result |
| :--- | ---: | ---: | ---: | ---: | :--- | :--- |
| total | 1656 | 1652 | -4 | -0.24% | previous_locations_feed | ✅ PASS |
| stores | 140 | 140 | +0 | +0% | previous_locations_feed | ✅ PASS |
| lockers | 1051 | 1049 | -2 | -0.19% | previous_locations_feed | ✅ PASS |
| partners | 465 | 463 | -2 | -0.43% | previous_locations_feed | ✅ PASS |
| tcCodes | 1651 | 1647 | -4 | -0.24% | previous_metadata.coverage.tc_record_count | ✅ PASS |
| enCodes | 1650 | 1646 | -4 | -0.24% | previous_metadata.coverage.en_record_count | ✅ PASS |

---

## Source Coverage & Status

| Metric | Value |
| :--- | :--- |
| TC API areas | 112/112 succeeded |
| EN API areas | 112/112 succeeded |
| TC unique codes | 1647 |
| EN unique codes | 1646 |
| Partner PDF HTTP Success | 8/8 |
| Partner PDF Parser Completed | 8/8 |
| Partner PDF Semantic Success | 5/8 |
| Partner PDF Quality Failures | 3 |
| Valid Partner PDF Records | 429 |
| Quarantined PDF Records | 11 |
| PDF Quarantine Ratio | 2.5% |
| SSR records | 190 |
| Bilingual match rate | 99.9% |
| District resolved | 1652 |
| District unresolved | 0 |
| With English data | 1646 |
| Missing English | 6 |

---

## Pipeline Execution Status

| Metric | Count |
| :--- | :--- |
| **Pipeline Blocking Errors** | 0 |
| **Pipeline Execution Warnings** | 5 |
| **Record Quality Warnings** | 256 |
| **Record Quality Info Flags** | 62 |
| **Record Quality Errors** | 0 |

---

## Record Quality Flags Summary

| Flag Type | Count |
| :--- | :--- |
| SOURCE_TC_EN_STREET_NUMBER_CONFLICT | 96 |
| ENGLISH_FIELD_CONTAINS_CJK | 93 |
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

- ⚠️ Partner PDF overall quarantine ratio 2.5% exceeds warning threshold 1% (11/440 quarantined)
- ⚠️ Partner PDF 'OK_KLN_TC' quarantine ratio 6.7% exceeds warning threshold 1%
- ⚠️ Partner PDF 'ASP_HK_TC' quarantine ratio 4.3% exceeds warning threshold 1%
- ⚠️ Partner PDF 'ASP_NT_TC' quarantine ratio 4.5% exceeds warning threshold 1%
- ⚠️ Quarantined 4 corrupted or ambiguous partner PDF records (reasons: SERVICE_CODE_MISMATCH)

---

## Added Locations (0)

*(No added locations)*

---

## Removed Locations (4)

- `852BA3009` [順豐合作點] 合作店 車迷店 -- 九龍深水埗鴨寮街地下256號（車迷店）*
- `852TA3003` [順豐合作點] 合作店 揚壹物流統一中心 -- 金鐘道95號統一中心2樓2041鋪 揚壹物流統一中心 (15:00-16:00午休)*
- `H852CH13P` [順豐智能櫃] 自助櫃 將軍澳Savannah地下 -- 將軍澳Savannah地下近商場電梯大堂*
- `H852PB27P` [順豐智能櫃] 自助櫃 柴灣興華(二)邨 -- 香港柴灣興華II邨安興樓平台719號鋪對出*

---

## Updated Locations (0)

*(No updated locations)*
