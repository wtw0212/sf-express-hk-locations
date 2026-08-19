# SF Express HK Location Sync Report

> **Last Updated**: `2026-08-19 09:20 (HKT UTC+8)`

---

## Summary

| Metric | Count |
| :--- | :--- |
| **Previous total** | 1669 |
| **Current total** | 1669 |
| **Stores** | 137 |
| **Lockers** | 1055 |
| **Partners** | 477 |
| **Added** | 1 |
| **Removed** | 1 |
| **Updated** | 1 |
| **Unchanged** | 1667 |

---

## Count Deltas

| Category | Previous | Current | Delta | Delta % | Baseline Source | Gate Result |
| :--- | ---: | ---: | ---: | ---: | :--- | :--- |
| total | 1669 | 1669 | +0 | +0% | previous_locations_feed | ✅ PASS |
| stores | 137 | 137 | +0 | +0% | previous_locations_feed | ✅ PASS |
| lockers | 1054 | 1055 | +1 | +0.09% | previous_locations_feed | ✅ PASS |
| partners | 478 | 477 | -1 | -0.21% | previous_locations_feed | ✅ PASS |
| tcCodes | 1663 | 1663 | +0 | +0% | previous_metadata.coverage.tc_record_count | ✅ PASS |
| enCodes | 1662 | 1662 | +0 | +0% | previous_metadata.coverage.en_record_count | ✅ PASS |

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
| **Record Quality Warnings** | 268 |
| **Record Quality Info Flags** | 58 |
| **Record Quality Errors** | 0 |

---

## Record Quality Flags Summary

| Flag Type | Count |
| :--- | :--- |
| ENGLISH_FIELD_CONTAINS_CJK | 103 |
| SOURCE_TC_EN_STREET_NUMBER_CONFLICT | 97 |
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

## Added Locations (1)

- `H852MC54P` [順豐智能櫃] 自助櫃 半山區花園台 -- 半山區花園台3座地下(近管理處)(只供住戶使用)

---

## Removed Locations (1)

- `852BF3003` [順豐合作點] 合作店 悟空開門自提點 -- 太子西洋菜北街157-163A號地下7(163)號鋪 悟空開門自提點（逢星期三休息）*

---

## Updated Locations (1)

- `H852M053P` 自助櫃 中環誠利商業大廈
  - name: `"自助櫃 中環誠利商業大廈(順豐站)"` -> `"自助櫃 中環誠利商業大廈"`
  - name_en: `"G/F, Shing Lee Commerical Building, Central"` -> `"SF Locker Shing Lee Commerical Building, Central"`
  - address: `"中環誠利商業大廈地下15號鋪"` -> `"中環永和街3-5號誠利商業大廈地下15號*"`
  - address_en: `"Unit 15, G/F, Shing Lee Commerical Building, Central"` -> `"Unit 15, G/F, Shing Lee Commerical Building, Central*"`
