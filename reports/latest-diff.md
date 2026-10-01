# SF Express HK Location Sync Report

> **Last Updated**: `2026-10-01 12:46 (HKT UTC+8)`

---

## Summary

| Metric | Count |
| :--- | :--- |
| **Previous total** | 1656 |
| **Current total** | 1654 |
| **Stores** | 138 |
| **Lockers** | 1049 |
| **Partners** | 467 |
| **Added** | 0 |
| **Removed** | 2 |
| **Updated** | 1 |
| **Unchanged** | 1653 |

---

## Count Deltas

| Category | Previous | Current | Delta | Delta % | Baseline Source | Gate Result |
| :--- | ---: | ---: | ---: | ---: | :--- | :--- |
| total | 1656 | 1654 | -2 | -0.12% | previous_locations_feed | ✅ PASS |
| stores | 138 | 138 | +0 | +0% | previous_locations_feed | ✅ PASS |
| lockers | 1051 | 1049 | -2 | -0.19% | previous_locations_feed | ✅ PASS |
| partners | 467 | 467 | +0 | +0% | previous_locations_feed | ✅ PASS |
| tcCodes | 1651 | 1649 | -2 | -0.12% | previous_metadata.coverage.tc_record_count | ✅ PASS |
| enCodes | 1650 | 1648 | -2 | -0.12% | previous_metadata.coverage.en_record_count | ✅ PASS |

---

## Source Coverage & Status

| Metric | Value |
| :--- | :--- |
| TC API areas | 112/112 succeeded |
| EN API areas | 112/112 succeeded |
| TC unique codes | 1649 |
| EN unique codes | 1648 |
| Partner PDF HTTP Success | 8/8 |
| Partner PDF Parser Completed | 8/8 |
| Partner PDF Semantic Success | 5/8 |
| Partner PDF Quality Failures | 3 |
| Valid Partner PDF Records | 432 |
| Quarantined PDF Records | 11 |
| PDF Quarantine Ratio | 2.5% |
| SSR records | 188 |
| Bilingual match rate | 99.9% |
| District resolved | 1654 |
| District unresolved | 0 |
| With English data | 1648 |
| Missing English | 6 |

---

## Pipeline Execution Status

| Metric | Count |
| :--- | :--- |
| **Pipeline Blocking Errors** | 0 |
| **Pipeline Execution Warnings** | 5 |
| **Record Quality Warnings** | 259 |
| **Record Quality Info Flags** | 59 |
| **Record Quality Errors** | 0 |

---

## Record Quality Flags Summary

| Flag Type | Count |
| :--- | :--- |
| ENGLISH_FIELD_CONTAINS_CJK | 97 |
| SOURCE_TC_EN_STREET_NUMBER_CONFLICT | 95 |
| ADMIN_DISTRICT_ALIAS_APPLIED | 43 |
| SOURCE_TC_EN_UNIT_CONFLICT | 38 |
| SOURCE_TC_EN_BUSINESS_HOURS_CONFLICT | 21 |
| DUPLICATE_ADDRESS_SUFFIX | 9 |
| MISSING_ENGLISH_RECORD | 6 |
| MISSING_COORDINATES | 5 |
| SOURCE_FORMATTING_ARTIFACT | 2 |
| SUBDISTRICT_ADDRESS_CONFLICT | 2 |

---

## Pipeline Execution Warnings (5)

- ⚠️ Partner PDF overall quarantine ratio 2.5% exceeds warning threshold 1% (11/443 quarantined)
- ⚠️ Partner PDF 'OK_KLN_TC' quarantine ratio 6.7% exceeds warning threshold 1%
- ⚠️ Partner PDF 'ASP_HK_TC' quarantine ratio 4.2% exceeds warning threshold 1%
- ⚠️ Partner PDF 'ASP_NT_TC' quarantine ratio 4.5% exceeds warning threshold 1%
- ⚠️ Quarantined 4 corrupted or ambiguous partner PDF records (reasons: SERVICE_CODE_MISMATCH)

---

## Added Locations (0)

*(No added locations)*

---

## Removed Locations (2)

- `H852BD94P` [順豐智能櫃] 自助櫃 大角咀利奧坊．凱岸 -- 大角咀利奧坊．凱岸會所室內位置只供住戶使用*
- `H852TF01P` [順豐智能櫃] 自助櫃 天后銅鑼灣道134號 -- 天后銅鑼灣道134號地下

---

## Updated Locations (1)

- `852UA3013` 合作點 法靈自提點
  - name: `"合作點 小虎士多"` -> `"合作點 法靈自提點"`
  - name_en: `"Indiv. Store Shop A, G/F, Ma Tin Tsuen, 172 Kung Um Rd, Yuen Long, NT"` -> `"法靈自提點"`
  - address: `"新界元朗公庵路馬田村172號A地下 小虎士多*"` -> `"新界元朗公庵路馬田村122號 法靈自提點*"`
  - address_en: `"Shop A, G/F, Ma Tin Tsuen, 172 Kung Um Rd, Yuen Long, NT*"` -> `"Shop A, G/F, Ma Tin Tsuen, 122 Kung Um Rd, Yuen Long, NT*"`
  - location.latitude: `22.4394573` -> `22.44012209`
  - location.longitude: `114.025686` -> `114.0240116`
  - quality_flags: +ENGLISH_FIELD_CONTAINS_CJK
