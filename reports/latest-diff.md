# SF Express HK Location Sync Report

> **Last Updated**: `2026-10-07 12:54 (HKT UTC+8)`

---

## Summary

| Metric | Count |
| :--- | :--- |
| **Previous total** | 1654 |
| **Current total** | 1654 |
| **Stores** | 139 |
| **Lockers** | 1051 |
| **Partners** | 464 |
| **Added** | 2 |
| **Removed** | 2 |
| **Updated** | 1 |
| **Unchanged** | 1651 |

---

## Count Deltas

| Category | Previous | Current | Delta | Delta % | Baseline Source | Gate Result |
| :--- | ---: | ---: | ---: | ---: | :--- | :--- |
| total | 1654 | 1654 | +0 | +0% | previous_locations_feed | ✅ PASS |
| stores | 139 | 139 | +0 | +0% | previous_locations_feed | ✅ PASS |
| lockers | 1050 | 1051 | +1 | +0.1% | previous_locations_feed | ✅ PASS |
| partners | 465 | 464 | -1 | -0.22% | previous_locations_feed | ✅ PASS |
| tcCodes | 1649 | 1649 | +0 | +0% | previous_metadata.coverage.tc_record_count | ✅ PASS |
| enCodes | 1648 | 1648 | +0 | +0% | previous_metadata.coverage.en_record_count | ✅ PASS |

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
| Valid Partner PDF Records | 431 |
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
| **Record Quality Warnings** | 257 |
| **Record Quality Info Flags** | 60 |
| **Record Quality Errors** | 0 |

---

## Record Quality Flags Summary

| Flag Type | Count |
| :--- | :--- |
| ENGLISH_FIELD_CONTAINS_CJK | 95 |
| SOURCE_TC_EN_STREET_NUMBER_CONFLICT | 95 |
| ADMIN_DISTRICT_ALIAS_APPLIED | 42 |
| SOURCE_TC_EN_UNIT_CONFLICT | 38 |
| SOURCE_TC_EN_BUSINESS_HOURS_CONFLICT | 21 |
| DUPLICATE_ADDRESS_SUFFIX | 10 |
| MISSING_ENGLISH_RECORD | 6 |
| MISSING_COORDINATES | 5 |
| SOURCE_FORMATTING_ARTIFACT | 3 |
| SUBDISTRICT_ADDRESS_CONFLICT | 2 |

---

## Pipeline Execution Warnings (5)

- ⚠️ Partner PDF overall quarantine ratio 2.5% exceeds warning threshold 1% (11/442 quarantined)
- ⚠️ Partner PDF 'OK_KLN_TC' quarantine ratio 6.7% exceeds warning threshold 1%
- ⚠️ Partner PDF 'ASP_HK_TC' quarantine ratio 4.3% exceeds warning threshold 1%
- ⚠️ Partner PDF 'ASP_NT_TC' quarantine ratio 4.5% exceeds warning threshold 1%
- ⚠️ Quarantined 4 corrupted or ambiguous partner PDF records (reasons: SERVICE_CODE_MISMATCH)

---

## Added Locations (2)

- `H852BD94P` [順豐智能櫃] 自助櫃 大角咀利奧坊．凱岸 -- 大角咀利奧坊．凱岸會所室內位置只供住戶使用*
- `H852TF01P` [順豐智能櫃] 自助櫃 天后銅鑼灣道134號地下順豐站 -- 天后銅鑼灣道134號地下順豐站*

---

## Removed Locations (2)

- `852M3002` [順豐合作點] 合作點 潮點集運 -- 香港長洲大新後街122號地下潮點集運*
- `H852FE27P` [順豐智能櫃] 自助櫃 馬鞍山欣安邨欣悅樓 -- 香港馬鞍山欣安邨欣悅樓地下*

---

## Updated Locations (1)

- `852AAL` 將軍澳茵怡花園順豐站
  - business_hours: `"周一至周五,10:30-22:00;周日及公眾假期,12:00-20:00; 周六, 12:00-20:00"` -> `"周一至周五,10:30-22:00"`
  - quality_flags: ~SOURCE_TC_EN_BUSINESS_HOURS_CONFLICT
