# SF Express HK Location Sync Report

> **Last Updated**: `2026-11-21 14:03 (HKT UTC+8)`

---

## Summary

| Metric | Count |
| :--- | :--- |
| **Previous total** | 1636 |
| **Current total** | 1632 |
| **Stores** | 139 |
| **Lockers** | 1042 |
| **Partners** | 451 |
| **Added** | 0 |
| **Removed** | 4 |
| **Updated** | 1 |
| **Unchanged** | 1631 |

---

## Count Deltas

| Category | Previous | Current | Delta | Delta % | Baseline Source | Gate Result |
| :--- | ---: | ---: | ---: | ---: | :--- | :--- |
| total | 1636 | 1632 | -4 | -0.24% | previous_locations_feed | ✅ PASS |
| stores | 139 | 139 | +0 | +0% | previous_locations_feed | ✅ PASS |
| lockers | 1046 | 1042 | -4 | -0.38% | previous_locations_feed | ✅ PASS |
| partners | 451 | 451 | +0 | +0% | previous_locations_feed | ✅ PASS |
| tcCodes | 1632 | 1627 | -5 | -0.31% | previous_metadata.coverage.tc_record_count | ✅ PASS |
| enCodes | 1630 | 1625 | -5 | -0.31% | previous_metadata.coverage.en_record_count | ✅ PASS |

---

## Source Coverage & Status

| Metric | Value |
| :--- | :--- |
| TC API areas | 112/112 succeeded |
| EN API areas | 112/112 succeeded |
| TC unique codes | 1627 |
| EN unique codes | 1625 |
| Partner PDF HTTP Success | 8/8 |
| Partner PDF Parser Completed | 8/8 |
| Partner PDF Semantic Success | 5/8 |
| Partner PDF Quality Failures | 3 |
| Valid Partner PDF Records | 418 |
| Quarantined PDF Records | 11 |
| PDF Quarantine Ratio | 2.6% |
| SSR records | 190 |
| Bilingual match rate | 99.9% |
| District resolved | 1632 |
| District unresolved | 0 |
| With English data | 1625 |
| Missing English | 7 |

---

## Pipeline Execution Status

| Metric | Count |
| :--- | :--- |
| **Pipeline Blocking Errors** | 0 |
| **Pipeline Execution Warnings** | 6 |
| **Record Quality Warnings** | 245 |
| **Record Quality Info Flags** | 61 |
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
| MISSING_ENGLISH_RECORD | 7 |
| MISSING_COORDINATES | 5 |
| SOURCE_FORMATTING_ARTIFACT | 4 |
| SUBDISTRICT_ADDRESS_CONFLICT | 2 |

---

## Pipeline Execution Warnings (6)

- ⚠️ Partner PDF overall quarantine ratio 2.6% exceeds warning threshold 1% (11/429 quarantined)
- ⚠️ Partner PDF 'OK_KLN_TC' quarantine ratio 6.7% exceeds warning threshold 1%
- ⚠️ Partner PDF 'ASP_HK_TC' quarantine ratio 4.5% exceeds warning threshold 1%
- ⚠️ Partner PDF 'ASP_KLN_TC' valid record count dropped by 5.1% (39 -> 37), warning threshold: 5%
- ⚠️ Partner PDF 'ASP_NT_TC' quarantine ratio 4.8% exceeds warning threshold 1%
- ⚠️ Quarantined 4 corrupted or ambiguous partner PDF records (reasons: SERVICE_CODE_MISMATCH)

---

## Added Locations (0)

*(No added locations)*

---

## Removed Locations (4)

- `H852FE32P` [順豐智能櫃] 自助櫃 沙田水泉澳廣場210號鋪(二號櫃) -- 沙田水泉澳廣場二樓210鋪(二號櫃)(入門口右二排)*
- `H852FE86P` [順豐智能櫃] 自助櫃 馬鞍山恆安邨巴士總站(二號櫃) -- 香港馬鞍山恆安邨巴士總站對出位置(二號櫃)*
- `H852FH12P` [順豐智能櫃] 自助櫃 沙田水泉澳廣場210號鋪(三號櫃) -- 沙田水泉澳廣場二樓210鋪(三號櫃)(入門口左二排)*
- `H852FH13P` [順豐智能櫃] 自助櫃 沙田水泉澳廣場210號鋪(四號櫃) -- 沙田水泉澳廣場二樓210鋪(四號櫃)(入門口左一排)*

---

## Updated Locations (1)

- `H852FE34P` 順豐智能櫃 沙田
  - name: `"自助櫃 沙田水泉澳廣場210號鋪(一號櫃)"` -> `"順豐智能櫃 沙田"`
  - name_en: `"SF Locker Locker No.1 Shui Chuen O Plaza Sha Tin"` -> `null`
  - sub_district_en: `"Sha Tin"` -> `null`
  - address: `"沙田水泉澳廣場二樓210鋪(一號櫃)(入門口右一排)*"` -> `"香港新界沙田區沙田水泉澳邨水泉澳廣場2樓210號鋪順豐自助櫃"`
  - address_en: `"Locker No.1, Shop 210, 2/F, Shui Chuen O Plaza, Sha Tin*"` -> `null`
  - business_hours: `"00:00-23:59 周六:00:00-23:59 周日:00:00-23:59 節假日:00:00-23:59"` -> `"24小時"`
  - business_hours_en: `"00:00-23:59"` -> `null`
  - source: `"api_tc"` -> `"ssr"`
  - location.latitude: `22.373426` -> `null`
  - location.longitude: `114.196906` -> `null`
  - quality_flags: +MISSING_COORDINATES, +MISSING_ENGLISH_RECORD
