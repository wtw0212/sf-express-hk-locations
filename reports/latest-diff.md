# SF Express HK Location Sync Report

> **Last Updated**: `2026-11-24 19:09 (HKT UTC+8)`

---

## Summary

| Metric | Count |
| :--- | :--- |
| **Previous total** | 1632 |
| **Current total** | 1628 |
| **Stores** | 139 |
| **Lockers** | 1040 |
| **Partners** | 449 |
| **Added** | 0 |
| **Removed** | 4 |
| **Updated** | 2 |
| **Unchanged** | 1626 |

---

## Count Deltas

| Category | Previous | Current | Delta | Delta % | Baseline Source | Gate Result |
| :--- | ---: | ---: | ---: | ---: | :--- | :--- |
| total | 1632 | 1628 | -4 | -0.25% | previous_locations_feed | ✅ PASS |
| stores | 139 | 139 | +0 | +0% | previous_locations_feed | ✅ PASS |
| lockers | 1042 | 1040 | -2 | -0.19% | previous_locations_feed | ✅ PASS |
| partners | 451 | 449 | -2 | -0.44% | previous_locations_feed | ✅ PASS |
| tcCodes | 1627 | 1624 | -3 | -0.18% | previous_metadata.coverage.tc_record_count | ✅ PASS |
| enCodes | 1625 | 1622 | -3 | -0.18% | previous_metadata.coverage.en_record_count | ✅ PASS |

---

## Source Coverage & Status

| Metric | Value |
| :--- | :--- |
| TC API areas | 112/112 succeeded |
| EN API areas | 112/112 succeeded |
| TC unique codes | 1624 |
| EN unique codes | 1622 |
| Partner PDF HTTP Success | 8/8 |
| Partner PDF Parser Completed | 8/8 |
| Partner PDF Semantic Success | 5/8 |
| Partner PDF Quality Failures | 3 |
| Valid Partner PDF Records | 417 |
| Quarantined PDF Records | 11 |
| PDF Quarantine Ratio | 2.6% |
| SSR records | 190 |
| Bilingual match rate | 99.9% |
| District resolved | 1628 |
| District unresolved | 0 |
| With English data | 1622 |
| Missing English | 6 |

---

## Pipeline Execution Status

| Metric | Count |
| :--- | :--- |
| **Pipeline Blocking Errors** | 0 |
| **Pipeline Execution Warnings** | 6 |
| **Record Quality Warnings** | 243 |
| **Record Quality Info Flags** | 60 |
| **Record Quality Errors** | 0 |

---

## Record Quality Flags Summary

| Flag Type | Count |
| :--- | :--- |
| SOURCE_TC_EN_STREET_NUMBER_CONFLICT | 93 |
| ENGLISH_FIELD_CONTAINS_CJK | 85 |
| ADMIN_DISTRICT_ALIAS_APPLIED | 42 |
| SOURCE_TC_EN_UNIT_CONFLICT | 38 |
| SOURCE_TC_EN_BUSINESS_HOURS_CONFLICT | 19 |
| DUPLICATE_ADDRESS_SUFFIX | 10 |
| MISSING_ENGLISH_RECORD | 6 |
| SOURCE_FORMATTING_ARTIFACT | 4 |
| MISSING_COORDINATES | 4 |
| SUBDISTRICT_ADDRESS_CONFLICT | 2 |

---

## Pipeline Execution Warnings (6)

- ⚠️ Partner PDF overall quarantine ratio 2.6% exceeds warning threshold 1% (11/428 quarantined)
- ⚠️ Partner PDF 'OK_KLN_TC' quarantine ratio 6.7% exceeds warning threshold 1%
- ⚠️ Partner PDF 'ASP_HK_TC' quarantine ratio 4.5% exceeds warning threshold 1%
- ⚠️ Partner PDF 'ASP_NT_TC' quarantine ratio 4.9% exceeds warning threshold 1%
- ⚠️ Quarantined 4 corrupted or ambiguous partner PDF records (reasons: SERVICE_CODE_MISMATCH)
- ⚠️ Previously published SSR-only records were removed upstream: H852FE34P

---

## Added Locations (0)

*(No added locations)*

---

## Removed Locations (4)

- `852A2014` [順豐合作點] 便利店 暉明邨OK便利店 -- 粉嶺暉明邨升暉樓地下1號鋪OK #590*
- `852A3017` [順豐合作點] 合作店 路卡斯士多 -- 粉嶺粉嶺圍14號地下(路卡斯士多)*
- `H852PA84P` [順豐智能櫃] 自助櫃 筲箕灣愛東商場2樓 -- 香港筲箕灣愛東商場2樓*
- `H852FE34P` [順豐智能櫃] 順豐智能櫃 沙田 -- 香港新界沙田區沙田水泉澳邨水泉澳廣場2樓210號鋪順豐自助櫃

---

## Updated Locations (2)

- `852UA3021` 合作店 LUCKY STAR
  - business_hours: `"14:00-20:30 周六:14:00-20:30"` -> `"14:00-20:00 周六:14:00-20:00"`
  - business_hours_en: `"14:00-20:30"` -> `"14:00-20:00"`
- `852UB3007` 合作點 NET MEAT SHOP
  - business_hours: `"11:00-20:00"` -> `"11:00-20:00 周六:11:00-19:30"`
