# SF Express HK Location Sync Report

> **Last Updated**: `2026-11-25 15:31 (HKT UTC+8)`

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
| **Updated** | 1 |
| **Unchanged** | 1626 |

---

## Count Deltas

| Category | Previous | Current | Delta | Delta % | Baseline Source | Gate Result |
| :--- | ---: | ---: | ---: | ---: | :--- | :--- |
| total | 1628 | 1629 | +1 | +0.06% | previous_locations_feed | ✅ PASS |
| stores | 139 | 139 | +0 | +0% | previous_locations_feed | ✅ PASS |
| lockers | 1040 | 1039 | -1 | -0.1% | previous_locations_feed | ✅ PASS |
| partners | 449 | 451 | +2 | +0.45% | previous_locations_feed | ✅ PASS |
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
| **Record Quality Warnings** | 244 |
| **Record Quality Info Flags** | 60 |
| **Record Quality Errors** | 0 |

---

## Record Quality Flags Summary

| Flag Type | Count |
| :--- | :--- |
| SOURCE_TC_EN_STREET_NUMBER_CONFLICT | 93 |
| ENGLISH_FIELD_CONTAINS_CJK | 86 |
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

- `852A3017` [順豐合作點] 合作店 路卡斯士多 -- 粉嶺粉嶺圍14號地下(路卡斯士多)*
- `852PB3006` [順豐合作點] 合作店 CK SHOP -- 香港柴灣道333號永利中心G34鋪（CK SHOP）*

---

## Removed Locations (1)

- `H852FE12P` [順豐智能櫃] 自助櫃 馬鞍山翠擁華庭11座 -- 香港馬鞍山翠擁華庭11座地下車場升降機大堂*

---

## Updated Locations (1)

- `852MA3011` 合作店 田園坊
  - address: `"香港堅尼地城吉席街30號吉豐大廈地下A鋪 田園坊*"` -> `"香港堅尼地城吉席街46至60號吉豐大廈地下A鋪 田園坊*"`
  - address_en: `"Shop A ,G/F,Kuk Fung Building,30 Catchick Street,Kennedy Town*"` -> `"Shop A ,G/F,Kuk Fung Building,46-60 Catchick Street,Kennedy Town*"`
  - location.latitude: `22.2831362` -> `22.2831166`
  - location.longitude: `114.12683689` -> `114.127717`
