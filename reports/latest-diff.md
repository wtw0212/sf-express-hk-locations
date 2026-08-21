# SF Express HK Location Sync Report

> **Last Updated**: `2026-08-21 10:20 (HKT UTC+8)`

---

## Summary

| Metric | Count |
| :--- | :--- |
| **Previous total** | 1668 |
| **Current total** | 1665 |
| **Stores** | 137 |
| **Lockers** | 1054 |
| **Partners** | 474 |
| **Added** | 1 |
| **Removed** | 4 |
| **Updated** | 0 |
| **Unchanged** | 1664 |

---

## Count Deltas

| Category | Previous | Current | Delta | Delta % | Baseline Source | Gate Result |
| :--- | ---: | ---: | ---: | ---: | :--- | :--- |
| total | 1668 | 1665 | -3 | -0.18% | previous_locations_feed | ✅ PASS |
| stores | 137 | 137 | +0 | +0% | previous_locations_feed | ✅ PASS |
| lockers | 1054 | 1054 | +0 | +0% | previous_locations_feed | ✅ PASS |
| partners | 477 | 474 | -3 | -0.63% | previous_locations_feed | ✅ PASS |
| tcCodes | 1662 | 1659 | -3 | -0.18% | previous_metadata.coverage.tc_record_count | ✅ PASS |
| enCodes | 1661 | 1658 | -3 | -0.18% | previous_metadata.coverage.en_record_count | ✅ PASS |

---

## Source Coverage & Status

| Metric | Value |
| :--- | :--- |
| TC API areas | 112/112 succeeded |
| EN API areas | 112/112 succeeded |
| TC unique codes | 1659 |
| EN unique codes | 1658 |
| Partner PDF HTTP Success | 8/8 |
| Partner PDF Parser Completed | 8/8 |
| Partner PDF Semantic Success | 5/8 |
| Partner PDF Quality Failures | 3 |
| Valid Partner PDF Records | 435 |
| Quarantined PDF Records | 12 |
| PDF Quarantine Ratio | 2.7% |
| SSR records | 188 |
| Bilingual match rate | 99.9% |
| District resolved | 1665 |
| District unresolved | 0 |
| With English data | 1658 |
| Missing English | 7 |

---

## Pipeline Execution Status

| Metric | Count |
| :--- | :--- |
| **Pipeline Blocking Errors** | 0 |
| **Pipeline Execution Warnings** | 5 |
| **Record Quality Warnings** | 266 |
| **Record Quality Info Flags** | 58 |
| **Record Quality Errors** | 0 |

---

## Record Quality Flags Summary

| Flag Type | Count |
| :--- | :--- |
| ENGLISH_FIELD_CONTAINS_CJK | 101 |
| SOURCE_TC_EN_STREET_NUMBER_CONFLICT | 96 |
| ADMIN_DISTRICT_ALIAS_APPLIED | 42 |
| SOURCE_TC_EN_UNIT_CONFLICT | 38 |
| SOURCE_TC_EN_BUSINESS_HOURS_CONFLICT | 21 |
| DUPLICATE_ADDRESS_SUFFIX | 9 |
| MISSING_ENGLISH_RECORD | 7 |
| MISSING_COORDINATES | 6 |
| SUBDISTRICT_ADDRESS_CONFLICT | 2 |
| SOURCE_FORMATTING_ARTIFACT | 1 |
| COORDINATES_OUTSIDE_HK | 1 |

---

## Pipeline Execution Warnings (5)

- ⚠️ Partner PDF overall quarantine ratio 2.7% exceeds warning threshold 1% (12/447 quarantined)
- ⚠️ Partner PDF 'OK_KLN_TC' quarantine ratio 6.7% exceeds warning threshold 1%
- ⚠️ Partner PDF 'ASP_HK_TC' quarantine ratio 8.0% exceeds warning threshold 1%
- ⚠️ Partner PDF 'ASP_NT_TC' quarantine ratio 4.3% exceeds warning threshold 1%
- ⚠️ Quarantined 5 corrupted or ambiguous partner PDF records (reasons: SERVICE_CODE_MISMATCH)

---

## Added Locations (1)

- `H852Z007P` [順豐智能櫃] 自助櫃 香港 -- 順豐大廈9樓

---

## Removed Locations (4)

- `852MA3013` [順豐合作點] 合作店 士美菲自提點 -- 士美菲路47號聯興新樓地下H鋪(近地鐵站C出口)士美菲自提點(15:00-16:00午休)*
- `852UA3008` [順豐合作點] 合作點 淘點易取站(好順泰) -- 新界元朗西菁街10號好順泰大廈46號地鋪 淘點易取站*
- `852UA3031` [順豐合作點] 合作店 淘點易取站 -- 元朗十八鄉路659號地鋪尚悅方惠康旁 淘點易取站*
- `H852RE08P` [順豐智能櫃] 回收櫃 鴨脷洲利是大廈(順豐站) -- 鴨脷洲利是大廈地下A鋪(回收櫃)

---

## Updated Locations (0)

*(No updated locations)*
