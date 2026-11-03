# SF Express HK Location Sync Report

> **Last Updated**: `2026-11-03 13:46 (HKT UTC+8)`

---

## Summary

| Metric | Count |
| :--- | :--- |
| **Previous total** | 1649 |
| **Current total** | 1645 |
| **Stores** | 140 |
| **Lockers** | 1048 |
| **Partners** | 457 |
| **Added** | 0 |
| **Removed** | 4 |
| **Updated** | 1 |
| **Unchanged** | 1644 |

---

## Count Deltas

| Category | Previous | Current | Delta | Delta % | Baseline Source | Gate Result |
| :--- | ---: | ---: | ---: | ---: | :--- | :--- |
| total | 1649 | 1645 | -4 | -0.24% | previous_locations_feed | ✅ PASS |
| stores | 140 | 140 | +0 | +0% | previous_locations_feed | ✅ PASS |
| lockers | 1048 | 1048 | +0 | +0% | previous_locations_feed | ✅ PASS |
| partners | 461 | 457 | -4 | -0.87% | previous_locations_feed | ✅ PASS |
| tcCodes | 1644 | 1641 | -3 | -0.18% | previous_metadata.coverage.tc_record_count | ✅ PASS |
| enCodes | 1642 | 1639 | -3 | -0.18% | previous_metadata.coverage.en_record_count | ✅ PASS |

---

## Source Coverage & Status

| Metric | Value |
| :--- | :--- |
| TC API areas | 112/112 succeeded |
| EN API areas | 112/112 succeeded |
| TC unique codes | 1641 |
| EN unique codes | 1639 |
| Partner PDF HTTP Success | 8/8 |
| Partner PDF Parser Completed | 8/8 |
| Partner PDF Semantic Success | 5/8 |
| Partner PDF Quality Failures | 3 |
| Valid Partner PDF Records | 423 |
| Quarantined PDF Records | 11 |
| PDF Quarantine Ratio | 2.5% |
| SSR records | 190 |
| Bilingual match rate | 99.9% |
| District resolved | 1645 |
| District unresolved | 0 |
| With English data | 1639 |
| Missing English | 6 |

---

## Pipeline Execution Status

| Metric | Count |
| :--- | :--- |
| **Pipeline Blocking Errors** | 0 |
| **Pipeline Execution Warnings** | 5 |
| **Record Quality Warnings** | 251 |
| **Record Quality Info Flags** | 60 |
| **Record Quality Errors** | 0 |

---

## Record Quality Flags Summary

| Flag Type | Count |
| :--- | :--- |
| SOURCE_TC_EN_STREET_NUMBER_CONFLICT | 94 |
| ENGLISH_FIELD_CONTAINS_CJK | 91 |
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

- ⚠️ Partner PDF overall quarantine ratio 2.5% exceeds warning threshold 1% (11/434 quarantined)
- ⚠️ Partner PDF 'OK_KLN_TC' quarantine ratio 6.7% exceeds warning threshold 1%
- ⚠️ Partner PDF 'ASP_HK_TC' quarantine ratio 4.3% exceeds warning threshold 1%
- ⚠️ Partner PDF 'ASP_NT_TC' quarantine ratio 4.7% exceeds warning threshold 1%
- ⚠️ Quarantined 4 corrupted or ambiguous partner PDF records (reasons: SERVICE_CODE_MISMATCH)

---

## Added Locations (0)

*(No added locations)*

---

## Removed Locations (4)

- `852A3017` [順豐合作點] 合作店 路卡斯士多 -- 粉嶺粉嶺圍14號地下(路卡斯士多)*
- `852J3019` [順豐合作點] 合作店 大新工程 -- 慈雲山崇華街22B號地下(大新工程)*
- `852U3009` [順豐合作點] 合作點 啟豐自提點 -- 新界屯門啟豐商場地下32號鋪(14:00-15:00午休) 啟豐自提點*
- `852UA3010` [順豐合作點] 合作點 幸福美妝藥店 -- 新界元朗青山公路68-76號榮光大廈地下3號鋪(幸福美妝藥店)*

---

## Updated Locations (1)

- `852FE3012` 合作店 錦英苑自提點
  - name: `"馬鞍山錦英苑自提點"` -> `"合作店 錦英苑自提點"`
  - name_en: `null` -> `"錦英苑自提點"`
  - sub_district_en: `null` -> `"Ma On Shan"`
  - address: `"馬鞍山錦英苑街市16號"` -> `"馬鞍山錦英苑街市3A（錦英苑自提點）*"`
  - address_en: `null` -> `"Shop 3A ,Kam Ying Court Market,Ma On Shan*"`
  - business_hours: `"星期一至六:12:00-20:00 星期日及公眾假期:12:00-18:00"` -> `"12:00-20:00 周六:12:00-20:00 周日:12：00-18:00 節假日:12:00-18:00"`
  - business_hours_en: `null` -> `"12:00-20:00"`
  - source: `"reviewed_pdf_partner"` -> `"api_tc"`
  - location.latitude: `null` -> `22.422989`
  - location.longitude: `null` -> `114.236216`
  - quality_flags: +ENGLISH_FIELD_CONTAINS_CJK -MISSING_COORDINATES, -MISSING_ENGLISH_RECORD
