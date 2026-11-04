# SF Express HK Location Sync Report

> **Last Updated**: `2026-11-04 13:20 (HKT UTC+8)`

---

## Summary

| Metric | Count |
| :--- | :--- |
| **Previous total** | 1645 |
| **Current total** | 1644 |
| **Stores** | 140 |
| **Lockers** | 1048 |
| **Partners** | 456 |
| **Added** | 1 |
| **Removed** | 2 |
| **Updated** | 2 |
| **Unchanged** | 1641 |

---

## Count Deltas

| Category | Previous | Current | Delta | Delta % | Baseline Source | Gate Result |
| :--- | ---: | ---: | ---: | ---: | :--- | :--- |
| total | 1645 | 1644 | -1 | -0.06% | previous_locations_feed | ✅ PASS |
| stores | 140 | 140 | +0 | +0% | previous_locations_feed | ✅ PASS |
| lockers | 1048 | 1048 | +0 | +0% | previous_locations_feed | ✅ PASS |
| partners | 457 | 456 | -1 | -0.22% | previous_locations_feed | ✅ PASS |
| tcCodes | 1641 | 1640 | -1 | -0.06% | previous_metadata.coverage.tc_record_count | ✅ PASS |
| enCodes | 1639 | 1638 | -1 | -0.06% | previous_metadata.coverage.en_record_count | ✅ PASS |

---

## Source Coverage & Status

| Metric | Value |
| :--- | :--- |
| TC API areas | 112/112 succeeded |
| EN API areas | 112/112 succeeded |
| TC unique codes | 1640 |
| EN unique codes | 1638 |
| Partner PDF HTTP Success | 8/8 |
| Partner PDF Parser Completed | 8/8 |
| Partner PDF Semantic Success | 5/8 |
| Partner PDF Quality Failures | 3 |
| Valid Partner PDF Records | 420 |
| Quarantined PDF Records | 11 |
| PDF Quarantine Ratio | 2.6% |
| SSR records | 190 |
| Bilingual match rate | 99.9% |
| District resolved | 1644 |
| District unresolved | 0 |
| With English data | 1638 |
| Missing English | 6 |

---

## Pipeline Execution Status

| Metric | Count |
| :--- | :--- |
| **Pipeline Blocking Errors** | 0 |
| **Pipeline Execution Warnings** | 5 |
| **Record Quality Warnings** | 250 |
| **Record Quality Info Flags** | 60 |
| **Record Quality Errors** | 0 |

---

## Record Quality Flags Summary

| Flag Type | Count |
| :--- | :--- |
| SOURCE_TC_EN_STREET_NUMBER_CONFLICT | 94 |
| ENGLISH_FIELD_CONTAINS_CJK | 90 |
| ADMIN_DISTRICT_ALIAS_APPLIED | 42 |
| SOURCE_TC_EN_UNIT_CONFLICT | 38 |
| SOURCE_TC_EN_BUSINESS_HOURS_CONFLICT | 20 |
| DUPLICATE_ADDRESS_SUFFIX | 10 |
| MISSING_ENGLISH_RECORD | 6 |
| SOURCE_FORMATTING_ARTIFACT | 4 |
| MISSING_COORDINATES | 4 |
| SUBDISTRICT_ADDRESS_CONFLICT | 2 |

---

## Pipeline Execution Warnings (5)

- ⚠️ Partner PDF overall quarantine ratio 2.6% exceeds warning threshold 1% (11/431 quarantined)
- ⚠️ Partner PDF 'OK_KLN_TC' quarantine ratio 6.7% exceeds warning threshold 1%
- ⚠️ Partner PDF 'ASP_HK_TC' quarantine ratio 4.3% exceeds warning threshold 1%
- ⚠️ Partner PDF 'ASP_NT_TC' quarantine ratio 4.9% exceeds warning threshold 1%
- ⚠️ Quarantined 4 corrupted or ambiguous partner PDF records (reasons: SERVICE_CODE_MISMATCH)

---

## Added Locations (1)

- `H852D056P` [順豐智能櫃] 自助櫃 荔枝角順昌工業大廈(順豐站) -- 荔枝角順昌工業大廈地下A鋪(順豐站)*

---

## Removed Locations (2)

- `852UC3006` [順豐合作點] 合作店 有嘢攞 -- 屯門屯貴路9號富泰街市44號鋪 (有嘢攞)*
- `H852DA26P` [順豐智能櫃] 自助櫃 深水埗怡閣苑怡康閣 -- 深水埗怡閣苑怡康閣地下*

---

## Updated Locations (2)

- `852AB3005` 合作店 新興自提點
  - address: `"大埔安埔里2號新興花園商場地下32A‎‬‬‎‎‎（新興自提點）*"` -> `"大埔安埔里2號新興花園商場地下30A‎‬‬‎‎‎（新興自提點）*"`
  - address_en: `"Shop 32A,G/F，Sun Hing Shopping Mall，Sun Hing Garden，Tai Po*"` -> `"Shop 30A,G/F，Sun Hing Shopping Mall，Sun Hing Garden，Tai Po*"`
- `852Z358` 東涌逸東商場順豐站
  - location.latitude: `22.278447` -> `22.28145`
  - location.longitude: `113.939371` -> `113.93452`
