# SF Express HK Location Sync Report

> **Last Updated**: `2026-10-31 12:36 (HKT UTC+8)`

---

## Summary

| Metric | Count |
| :--- | :--- |
| **Previous total** | 1648 |
| **Current total** | 1649 |
| **Stores** | 140 |
| **Lockers** | 1048 |
| **Partners** | 461 |
| **Added** | 2 |
| **Removed** | 1 |
| **Updated** | 1 |
| **Unchanged** | 1646 |

---

## Count Deltas

| Category | Previous | Current | Delta | Delta % | Baseline Source | Gate Result |
| :--- | ---: | ---: | ---: | ---: | :--- | :--- |
| total | 1648 | 1649 | +1 | +0.06% | previous_locations_feed | ✅ PASS |
| stores | 140 | 140 | +0 | +0% | previous_locations_feed | ✅ PASS |
| lockers | 1048 | 1048 | +0 | +0% | previous_locations_feed | ✅ PASS |
| partners | 460 | 461 | +1 | +0.22% | previous_locations_feed | ✅ PASS |
| tcCodes | 1643 | 1644 | +1 | +0.06% | previous_metadata.coverage.tc_record_count | ✅ PASS |
| enCodes | 1642 | 1642 | +0 | +0% | previous_metadata.coverage.en_record_count | ✅ PASS |

---

## Source Coverage & Status

| Metric | Value |
| :--- | :--- |
| TC API areas | 112/112 succeeded |
| EN API areas | 112/112 succeeded |
| TC unique codes | 1644 |
| EN unique codes | 1642 |
| Partner PDF HTTP Success | 8/8 |
| Partner PDF Parser Completed | 8/8 |
| Partner PDF Semantic Success | 5/8 |
| Partner PDF Quality Failures | 3 |
| Valid Partner PDF Records | 424 |
| Quarantined PDF Records | 11 |
| PDF Quarantine Ratio | 2.5% |
| SSR records | 190 |
| Bilingual match rate | 99.9% |
| District resolved | 1649 |
| District unresolved | 0 |
| With English data | 1642 |
| Missing English | 7 |

---

## Pipeline Execution Status

| Metric | Count |
| :--- | :--- |
| **Pipeline Blocking Errors** | 0 |
| **Pipeline Execution Warnings** | 6 |
| **Record Quality Warnings** | 254 |
| **Record Quality Info Flags** | 61 |
| **Record Quality Errors** | 0 |

---

## Record Quality Flags Summary

| Flag Type | Count |
| :--- | :--- |
| SOURCE_TC_EN_STREET_NUMBER_CONFLICT | 95 |
| ENGLISH_FIELD_CONTAINS_CJK | 92 |
| ADMIN_DISTRICT_ALIAS_APPLIED | 42 |
| SOURCE_TC_EN_UNIT_CONFLICT | 38 |
| SOURCE_TC_EN_BUSINESS_HOURS_CONFLICT | 20 |
| DUPLICATE_ADDRESS_SUFFIX | 10 |
| MISSING_ENGLISH_RECORD | 7 |
| MISSING_COORDINATES | 5 |
| SOURCE_FORMATTING_ARTIFACT | 4 |
| SUBDISTRICT_ADDRESS_CONFLICT | 2 |

---

## Pipeline Execution Warnings (6)

- ⚠️ Partner PDF overall quarantine ratio 2.5% exceeds warning threshold 1% (11/435 quarantined)
- ⚠️ Partner PDF 'OK_KLN_TC' quarantine ratio 6.7% exceeds warning threshold 1%
- ⚠️ Partner PDF 'ASP_HK_TC' quarantine ratio 4.3% exceeds warning threshold 1%
- ⚠️ Partner PDF 'ASP_NT_TC' quarantine ratio 4.6% exceeds warning threshold 1%
- ⚠️ [Audit warning] Partner PDF 'ASP_ISLANDS_TC' valid record count dropped by 16.7% (6 -> 5), threshold: 15%
- ⚠️ Quarantined 4 corrupted or ambiguous partner PDF records (reasons: SERVICE_CODE_MISMATCH)

---

## Added Locations (2)

- `852FE3017` [順豐合作點] 合作店 西徑士多 -- 西貢西徑村32F地下 西徑士多（14：00-16：00午休時段）*
- `H852A066P` [順豐智能櫃] 自助櫃 粉嶺聯昌街(365 Laundry) -- 粉嶺聯昌街31號地下(洗衣店內)*

---

## Removed Locations (1)

- `H852GC02P` [順豐智能櫃] 自助櫃 青衣順豐大廈地下 -- 青衣航運路36號順豐大廈地下*

---

## Updated Locations (1)

- `852AB` 大埔美新里順豐站
  - address: `"香港大埔區大埔汀角路51A號太平工業大廈二座8樓A室*^"` -> `"香港大埔區大埔美新里5號地下A鋪*^"`
  - address_en: `"Shop A, G/F, No.5 Mei San Lane, Tai Po*,Tai Po,Tai Po District,Hong Kong"` -> `"Shop A, G/F, No.5 Mei San Lane*,Tai Po,Tai Po District,Hong Kong"`
  - quality_flags: -SOURCE_TC_EN_STREET_NUMBER_CONFLICT
