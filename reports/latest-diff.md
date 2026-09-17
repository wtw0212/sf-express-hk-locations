# SF Express HK Location Sync Report

> **Last Updated**: `2026-09-17 11:58 (HKT UTC+8)`

---

## Summary

| Metric | Count |
| :--- | :--- |
| **Previous total** | 1663 |
| **Current total** | 1662 |
| **Stores** | 138 |
| **Lockers** | 1056 |
| **Partners** | 468 |
| **Added** | 1 |
| **Removed** | 2 |
| **Updated** | 4 |
| **Unchanged** | 1657 |

---

## Count Deltas

| Category | Previous | Current | Delta | Delta % | Baseline Source | Gate Result |
| :--- | ---: | ---: | ---: | ---: | :--- | :--- |
| total | 1663 | 1662 | -1 | -0.06% | previous_locations_feed | ✅ PASS |
| stores | 138 | 138 | +0 | +0% | previous_locations_feed | ✅ PASS |
| lockers | 1056 | 1056 | +0 | +0% | previous_locations_feed | ✅ PASS |
| partners | 469 | 468 | -1 | -0.21% | previous_locations_feed | ✅ PASS |
| tcCodes | 1657 | 1656 | -1 | -0.06% | previous_metadata.coverage.tc_record_count | ✅ PASS |
| enCodes | 1656 | 1655 | -1 | -0.06% | previous_metadata.coverage.en_record_count | ✅ PASS |

---

## Source Coverage & Status

| Metric | Value |
| :--- | :--- |
| TC API areas | 112/112 succeeded |
| EN API areas | 112/112 succeeded |
| TC unique codes | 1656 |
| EN unique codes | 1655 |
| Partner PDF HTTP Success | 8/8 |
| Partner PDF Parser Completed | 8/8 |
| Partner PDF Semantic Success | 5/8 |
| Partner PDF Quality Failures | 3 |
| Valid Partner PDF Records | 432 |
| Quarantined PDF Records | 12 |
| PDF Quarantine Ratio | 2.7% |
| SSR records | 188 |
| Bilingual match rate | 99.9% |
| District resolved | 1662 |
| District unresolved | 0 |
| With English data | 1655 |
| Missing English | 7 |

---

## Pipeline Execution Status

| Metric | Count |
| :--- | :--- |
| **Pipeline Blocking Errors** | 0 |
| **Pipeline Execution Warnings** | 5 |
| **Record Quality Warnings** | 261 |
| **Record Quality Info Flags** | 60 |
| **Record Quality Errors** | 0 |

---

## Record Quality Flags Summary

| Flag Type | Count |
| :--- | :--- |
| ENGLISH_FIELD_CONTAINS_CJK | 97 |
| SOURCE_TC_EN_STREET_NUMBER_CONFLICT | 95 |
| ADMIN_DISTRICT_ALIAS_APPLIED | 43 |
| SOURCE_TC_EN_UNIT_CONFLICT | 38 |
| SOURCE_TC_EN_BUSINESS_HOURS_CONFLICT | 22 |
| DUPLICATE_ADDRESS_SUFFIX | 9 |
| MISSING_ENGLISH_RECORD | 7 |
| MISSING_COORDINATES | 6 |
| SOURCE_FORMATTING_ARTIFACT | 2 |
| SUBDISTRICT_ADDRESS_CONFLICT | 2 |

---

## Pipeline Execution Warnings (5)

- ⚠️ Partner PDF overall quarantine ratio 2.7% exceeds warning threshold 1% (12/444 quarantined)
- ⚠️ Partner PDF 'OK_KLN_TC' quarantine ratio 6.7% exceeds warning threshold 1%
- ⚠️ Partner PDF 'ASP_HK_TC' quarantine ratio 8.0% exceeds warning threshold 1%
- ⚠️ Partner PDF 'ASP_NT_TC' quarantine ratio 4.5% exceeds warning threshold 1%
- ⚠️ [Audit warning] Severe PDF parser quarantines would remove previously published records: 852PC3004

---

## Added Locations (1)

- `H852FH27P` [順豐智能櫃] 自助櫃 沙田麗豪酒店 -- 沙田麗豪酒店地下大堂門口旁(只供酒店住戶使用)*

---

## Removed Locations (2)

- `852PC3004` [順豐合作點] 合作店 愛蝶灣自提點 -- 筲箕灣愛禮街2號愛蝶灣25號地下 愛蝶灣自提點*
- `H852UV11P` [順豐智能櫃] 自助櫃 元朗溱柏十座平台 -- 元朗溱柏十座平台(只供住戶使用)*

---

## Updated Locations (4)

- `852G3004` 合作點 石圍角提點坪
  - name: `"荃灣提點坪有限公司"` -> `"合作點 石圍角提點坪"`
  - name_en: `null` -> `"Indiv. Store G/F, 20 Lam Kam Rd, Fong Ma Po, Tai Po, NT"`
  - sub_district_en: `null` -> `"Tsuen Wan"`
  - address: `"新界荃灣石圍角邨石芳樓210號舖"` -> `"新界荃灣石圍角邨石芳樓210號鋪 石圍角提點坪*"`
  - address_en: `null` -> `"G/F, 20 Lam Kam Rd, Fong Ma Po, Tai Po, NT*"`
  - business_hours: `"星期一至六: 12:00-20:30 星期日、公眾假期: 休息"` -> `"12:00-20:30"`
  - business_hours_en: `null` -> `"12:00-20:30"`
  - source: `"reviewed_pdf_partner"` -> `"api_tc"`
  - location.latitude: `null` -> `22.3747808`
  - location.longitude: `null` -> `114.1241165`
  - quality_flags: -MISSING_COORDINATES, -MISSING_ENGLISH_RECORD
- `852UAA` 元朗雄偉工業大廈順豐站
  - name: `"元朗麗新元朗中心順豐站"` -> `"元朗雄偉工業大廈順豐站"`
- `852Z503` 中環環球大廈順豐站
  - business_hours: `"周一至周五,11:00-20:00;周日及公眾假期,休息;周六及公眾假期,12:00-20:00"` -> `"周一至周五,11:00-20:00;周日及公眾假期,休息; 周六:12:00-20:00"`
- `H852AA26P` 順豐智能櫃 大埔
  - name: `"自助櫃 大埔大日子廣場2樓"` -> `"順豐智能櫃 大埔"`
  - name_en: `"SF Locker 2/F, Big Day Mall, Tai Po"` -> `null`
  - sub_district_en: `"Tai Po"` -> `null`
  - address: `"香港大埔大日子廣場2樓*"` -> `"香港新界大埔區大埔鄉事會街9號大日子廣場2樓順豐自助櫃"`
  - address_en: `"2/F, Big Day Mall, Tai Po*"` -> `null`
  - business_hours: `"09:30-21:30 周六:09:30-21:30 周日:09:30-21:30 節假日:09:30-21:30"` -> `"09:30-21:30"`
  - business_hours_en: `"09:30-21:30"` -> `null`
  - source: `"api_tc"` -> `"ssr"`
  - location.latitude: `22.44689` -> `null`
  - location.longitude: `114.166257` -> `null`
  - quality_flags: +MISSING_COORDINATES, +MISSING_ENGLISH_RECORD
