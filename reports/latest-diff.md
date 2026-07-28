# SF Express HK Location Sync Report

> **Last Updated**: `2026-07-28 10:46 (HKT UTC+8)`

---

## Summary

| Metric | Count |
| :--- | :--- |
| **Previous total** | 1673 |
| **Current total** | 1673 |
| **Stores** | 137 |
| **Lockers** | 1054 |
| **Partners** | 482 |
| **Added** | 0 |
| **Removed** | 0 |
| **Updated** | 4 |
| **Unchanged** | 1669 |

---

## Count Deltas

| Category | Previous | Current | Delta | Delta % | Baseline Source | Gate Result |
| :--- | ---: | ---: | ---: | ---: | :--- | :--- |
| total | 1673 | 1673 | +0 | +0% | previous_locations_feed | ✅ PASS |
| stores | 137 | 137 | +0 | +0% | previous_locations_feed | ✅ PASS |
| lockers | 1054 | 1054 | +0 | +0% | previous_locations_feed | ✅ PASS |
| partners | 482 | 482 | +0 | +0% | previous_locations_feed | ✅ PASS |
| tcCodes | 1666 | 1666 | +0 | +0% | previous_metadata.coverage.tc_record_count | ✅ PASS |
| enCodes | 1666 | 1666 | +0 | +0% | previous_metadata.coverage.en_record_count | ✅ PASS |

---

## Source Coverage & Status

| Metric | Value |
| :--- | :--- |
| TC API areas | 112/112 succeeded |
| EN API areas | 112/112 succeeded |
| TC unique codes | 1666 |
| EN unique codes | 1666 |
| Partner PDF HTTP Success | 8/8 |
| Partner PDF Parser Completed | 8/8 |
| Partner PDF Semantic Success | 5/8 |
| Partner PDF Quality Failures | 3 |
| Valid Partner PDF Records | 444 |
| Quarantined PDF Records | 12 |
| PDF Quarantine Ratio | 2.6% |
| SSR records | 186 |
| Bilingual match rate | 99.9% |
| District resolved | 1673 |
| District unresolved | 0 |
| With English data | 1666 |
| Missing English | 7 |

---

## Pipeline Execution Status

| Metric | Count |
| :--- | :--- |
| **Pipeline Blocking Errors** | 0 |
| **Pipeline Execution Warnings** | 5 |
| **Record Quality Warnings** | 272 |
| **Record Quality Info Flags** | 58 |
| **Record Quality Errors** | 0 |

---

## Record Quality Flags Summary

| Flag Type | Count |
| :--- | :--- |
| ENGLISH_FIELD_CONTAINS_CJK | 106 |
| SOURCE_TC_EN_STREET_NUMBER_CONFLICT | 98 |
| ADMIN_DISTRICT_ALIAS_APPLIED | 41 |
| SOURCE_TC_EN_UNIT_CONFLICT | 38 |
| SOURCE_TC_EN_BUSINESS_HOURS_CONFLICT | 21 |
| DUPLICATE_ADDRESS_SUFFIX | 9 |
| MISSING_ENGLISH_RECORD | 7 |
| MISSING_COORDINATES | 7 |
| SUBDISTRICT_ADDRESS_CONFLICT | 2 |
| SOURCE_FORMATTING_ARTIFACT | 1 |

---

## Pipeline Execution Warnings (5)

- ⚠️ Partner PDF overall quarantine ratio 2.6% exceeds warning threshold 1% (12/456 quarantined)
- ⚠️ Partner PDF 'OK_KLN_TC' quarantine ratio 6.7% exceeds warning threshold 1%
- ⚠️ Partner PDF 'ASP_HK_TC' quarantine ratio 8.0% exceeds warning threshold 1%
- ⚠️ Partner PDF 'ASP_NT_TC' quarantine ratio 4.1% exceeds warning threshold 1%
- ⚠️ Quarantined 5 corrupted or ambiguous partner PDF records (reasons: SERVICE_CODE_MISMATCH)

---

## Added Locations (0)

*(No added locations)*

---

## Removed Locations (0)

*(No removed locations)*

---

## Updated Locations (4)

- `852P2008` 便利店 僑興大廈OK便利店
  - sub_district: `"天後"` -> `"天后"`
  - address: `"香港天後英皇道14號僑興大廈地下1H號鋪"` -> `"香港天后英皇道14號僑興大廈地下1H號鋪"`
- `H852P022P` 自助櫃 天后木星街1號(LaundrYup洗衣店)
  - name: `"自助櫃 天後木星街1號(LaundrYup洗衣店)"` -> `"自助櫃 天后木星街1號(LaundrYup洗衣店)"`
  - sub_district: `"天後"` -> `"天后"`
  - address: `"天後木星街1號地下1A號鋪(洗衣店內)*"` -> `"天后木星街1號地下1A號鋪(洗衣店內)*"`
- `H852P090P` 自助櫃 天后金山閣(自洗王國)
  - name: `"自助櫃 天後金山閣(自洗王國)"` -> `"自助櫃 天后金山閣(自洗王國)"`
  - sub_district: `"天後"` -> `"天后"`
  - address: `"香港天後英皇道37號金山閣地下2鋪自洗王國*"` -> `"香港天后英皇道37號金山閣地下2鋪自洗王國*"`
- `H852P095P` 自助櫃 天后柏傲山
  - name: `"自助櫃 天後柏傲山"` -> `"自助櫃 天后柏傲山"`
  - sub_district: `"天後"` -> `"天后"`
  - address: `"天後柏傲山2樓會所(只供住戶使用)*"` -> `"天后柏傲山2樓會所(只供住戶使用)*"`
