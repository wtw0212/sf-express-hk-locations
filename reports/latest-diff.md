# SF Express HK Location Sync Report

> **Last Updated**: `2026-07-27 16:25 (HKT UTC+8)`

---

## Summary

| Metric | Count |
| :--- | :--- |
| **Previous total** | 1673 |
| **Current total** | 1673 |
| **Stores** | 137 |
| **Lockers** | 1056 |
| **Partners** | 480 |
| **Added** | 0 |
| **Removed** | 0 |
| **Updated** | 5 |
| **Unchanged** | 1668 |

---

## Count Deltas

| Category | Previous | Current | Delta | Delta % | Baseline Source | Gate Result |
| :--- | ---: | ---: | ---: | ---: | :--- | :--- |
| total | 1673 | 1673 | +0 | +0% | previous_locations_feed | ✅ PASS |
| stores | 137 | 137 | +0 | +0% | previous_locations_feed | ✅ PASS |
| lockers | 1056 | 1056 | +0 | +0% | previous_locations_feed | ✅ PASS |
| partners | 480 | 480 | +0 | +0% | previous_locations_feed | ✅ PASS |
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
| Valid Partner PDF Records | 443 |
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
| **Record Quality Warnings** | 271 |
| **Record Quality Info Flags** | 58 |
| **Record Quality Errors** | 0 |

---

## Record Quality Flags Summary

| Flag Type | Count |
| :--- | :--- |
| ENGLISH_FIELD_CONTAINS_CJK | 105 |
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

- ⚠️ Partner PDF overall quarantine ratio 2.6% exceeds warning threshold 1% (12/455 quarantined)
- ⚠️ Partner PDF 'OK_KLN_TC' quarantine ratio 6.7% exceeds warning threshold 1%
- ⚠️ Partner PDF 'ASP_HK_TC' quarantine ratio 8.3% exceeds warning threshold 1%
- ⚠️ Partner PDF 'ASP_NT_TC' quarantine ratio 4.1% exceeds warning threshold 1%
- ⚠️ Quarantined 5 corrupted or ambiguous partner PDF records (reasons: SERVICE_CODE_MISMATCH)

---

## Added Locations (0)

*(No added locations)*

---

## Removed Locations (0)

*(No removed locations)*

---

## Updated Locations (5)

- `852GC2003` OK便利店 (青衣)
  - sub_district: `"葵青區"` -> `"青衣"`
  - business_hours: `null` -> `"24小時"`
- `852LA3007` 葵涌康力達環保貿易公司
  - sub_district: `"葵青區"` -> `"葵涌"`
  - business_hours: `null` -> `"星期一至六:12:00-18:00 星期日及公眾假期:休息"`
- `852FE3012` 馬鞍山錦英苑自提點
  - sub_district: `"沙田區"` -> `"馬鞍山"`
  - business_hours: `null` -> `"星期一至六:12:00-20:00 星期日及公眾假期:12:00-18:00"`
- `852G3004` 荃灣提點坪有限公司
  - sub_district: `"荃灣區"` -> `"荃灣"`
  - business_hours: `null` -> `"星期一至六: 12:00-20:30 星期日、公眾假期: 休息"`
- `852G3008` 荃灣星羽便利店
  - sub_district: `"荃灣區"` -> `"荃灣"`
  - business_hours: `null` -> `"星期一至六:10:00-21:00 星期日:10:00-21:00 公眾假期:休息"`
