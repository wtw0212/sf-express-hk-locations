# SF Express HK Location Sync Report

> **Last Updated**: `2026-09-16 11:52 (HKT UTC+8)`

---

## Summary

| Metric | Count |
| :--- | :--- |
| **Previous total** | 1661 |
| **Current total** | 1663 |
| **Stores** | 138 |
| **Lockers** | 1056 |
| **Partners** | 469 |
| **Added** | 2 |
| **Removed** | 0 |
| **Updated** | 2 |
| **Unchanged** | 1659 |

---

## Count Deltas

| Category | Previous | Current | Delta | Delta % | Baseline Source | Gate Result |
| :--- | ---: | ---: | ---: | ---: | :--- | :--- |
| total | 1661 | 1663 | +2 | +0.12% | previous_locations_feed | ✅ PASS |
| stores | 137 | 138 | +1 | +0.73% | previous_locations_feed | ✅ PASS |
| lockers | 1056 | 1056 | +0 | +0% | previous_locations_feed | ✅ PASS |
| partners | 468 | 469 | +1 | +0.21% | previous_locations_feed | ✅ PASS |
| tcCodes | 1655 | 1657 | +2 | +0.12% | previous_metadata.coverage.tc_record_count | ✅ PASS |
| enCodes | 1654 | 1656 | +2 | +0.12% | previous_metadata.coverage.en_record_count | ✅ PASS |

---

## Source Coverage & Status

| Metric | Value |
| :--- | :--- |
| TC API areas | 112/112 succeeded |
| EN API areas | 112/112 succeeded |
| TC unique codes | 1657 |
| EN unique codes | 1656 |
| Partner PDF HTTP Success | 8/8 |
| Partner PDF Parser Completed | 8/8 |
| Partner PDF Semantic Success | 5/8 |
| Partner PDF Quality Failures | 3 |
| Valid Partner PDF Records | 431 |
| Quarantined PDF Records | 12 |
| PDF Quarantine Ratio | 2.7% |
| SSR records | 188 |
| Bilingual match rate | 99.9% |
| District resolved | 1663 |
| District unresolved | 0 |
| With English data | 1656 |
| Missing English | 7 |

---

## Pipeline Execution Status

| Metric | Count |
| :--- | :--- |
| **Pipeline Blocking Errors** | 0 |
| **Pipeline Execution Warnings** | 5 |
| **Record Quality Warnings** | 264 |
| **Record Quality Info Flags** | 60 |
| **Record Quality Errors** | 0 |

---

## Record Quality Flags Summary

| Flag Type | Count |
| :--- | :--- |
| ENGLISH_FIELD_CONTAINS_CJK | 99 |
| SOURCE_TC_EN_STREET_NUMBER_CONFLICT | 96 |
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

- ⚠️ Partner PDF overall quarantine ratio 2.7% exceeds warning threshold 1% (12/443 quarantined)
- ⚠️ Partner PDF 'OK_KLN_TC' quarantine ratio 6.7% exceeds warning threshold 1%
- ⚠️ Partner PDF 'ASP_HK_TC' quarantine ratio 8.0% exceeds warning threshold 1%
- ⚠️ Partner PDF 'ASP_NT_TC' quarantine ratio 4.5% exceeds warning threshold 1%
- ⚠️ Quarantined 5 corrupted or ambiguous partner PDF records (reasons: SERVICE_CODE_MISMATCH)

---

## Added Locations (2)

- `852BA3015` [順豐合作點] 合作店 潮豐葯妝 -- 香港深水埗北河街165-167號太利樓地下C2號鋪 潮豐葯妝*
- `852Z503` [順豐站] 中環環球大廈順豐站 -- 香港中西區中環德輔道中19號環球大廈1樓131號鋪*

---

## Removed Locations (0)

*(No removed locations)*

---

## Updated Locations (2)

- `852J3038` 合作店 采頤自提點
  - name: `"合作店 FIREFLY"` -> `"合作店 采頤自提點"`
  - name_en: `"FIREFLY"` -> `"採頤自提點"`
  - address: `"新蒲崗采頤花園購物商場751鋪地下(FIREFLY)*"` -> `"新蒲崗采頤花園購物商場751鋪地下(采頤自提點)*"`
  - quality_flags: +ENGLISH_FIELD_CONTAINS_CJK
- `852UAA` 元朗麗新元朗中心順豐站
  - name_en: `"Lai Sun Yuen Long Centre, Yuen Long"` -> `"Hung Wai Industrial Building,Yuen Long"`
  - address: `"香港元朗區元朗宏業東街26號麗新元朗中心地下12C*"` -> `"香港元朗區元朗喜業街1-5號雄偉工業大廈地下F室*"`
  - address_en: `"Unit 12C, G/F, Lai Sun Yuen Long Centre, No.27 Wang Yip Street East*,Yuen Long,Yuen Long District,Hong Kong"` -> `"Unit no. F, G/F, Hung Wai Industrial Building,Nos.1-5 Hi Yip Street West*,Yuen Long,Yuen Long District,Hong Kong"`
  - location.latitude: `22.448287` -> `22.449805`
  - location.longitude: `114.029522` -> `114.028084`
  - quality_flags: -SOURCE_TC_EN_STREET_NUMBER_CONFLICT
