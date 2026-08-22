# SF Express HK Location Sync Report

> **Last Updated**: `2026-08-22 09:18 (HKT UTC+8)`

---

## Summary

| Metric | Count |
| :--- | :--- |
| **Previous total** | 1665 |
| **Current total** | 1704 |
| **Stores** | 137 |
| **Lockers** | 1093 |
| **Partners** | 474 |
| **Added** | 39 |
| **Removed** | 0 |
| **Updated** | 1 |
| **Unchanged** | 1664 |

---

## Count Deltas

| Category | Previous | Current | Delta | Delta % | Baseline Source | Gate Result |
| :--- | ---: | ---: | ---: | ---: | :--- | :--- |
| total | 1665 | 1704 | +39 | +2.34% | previous_locations_feed | ✅ PASS |
| stores | 137 | 137 | +0 | +0% | previous_locations_feed | ✅ PASS |
| lockers | 1054 | 1093 | +39 | +3.7% | previous_locations_feed | ✅ PASS |
| partners | 474 | 474 | +0 | +0% | previous_locations_feed | ✅ PASS |
| tcCodes | 1659 | 1698 | +39 | +2.35% | previous_metadata.coverage.tc_record_count | ✅ PASS |
| enCodes | 1658 | 1697 | +39 | +2.35% | previous_metadata.coverage.en_record_count | ✅ PASS |

---

## Source Coverage & Status

| Metric | Value |
| :--- | :--- |
| TC API areas | 112/112 succeeded |
| EN API areas | 112/112 succeeded |
| TC unique codes | 1698 |
| EN unique codes | 1697 |
| Partner PDF HTTP Success | 8/8 |
| Partner PDF Parser Completed | 8/8 |
| Partner PDF Semantic Success | 5/8 |
| Partner PDF Quality Failures | 3 |
| Valid Partner PDF Records | 435 |
| Quarantined PDF Records | 12 |
| PDF Quarantine Ratio | 2.7% |
| SSR records | 188 |
| Bilingual match rate | 99.9% |
| District resolved | 1704 |
| District unresolved | 0 |
| With English data | 1697 |
| Missing English | 7 |

---

## Pipeline Execution Status

| Metric | Count |
| :--- | :--- |
| **Pipeline Blocking Errors** | 0 |
| **Pipeline Execution Warnings** | 5 |
| **Record Quality Warnings** | 267 |
| **Record Quality Info Flags** | 59 |
| **Record Quality Errors** | 0 |

---

## Record Quality Flags Summary

| Flag Type | Count |
| :--- | :--- |
| ENGLISH_FIELD_CONTAINS_CJK | 101 |
| SOURCE_TC_EN_STREET_NUMBER_CONFLICT | 96 |
| ADMIN_DISTRICT_ALIAS_APPLIED | 43 |
| SOURCE_TC_EN_UNIT_CONFLICT | 38 |
| SOURCE_TC_EN_BUSINESS_HOURS_CONFLICT | 21 |
| DUPLICATE_ADDRESS_SUFFIX | 9 |
| MISSING_ENGLISH_RECORD | 7 |
| MISSING_COORDINATES | 6 |
| SUBDISTRICT_ADDRESS_CONFLICT | 3 |
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

## Added Locations (39)

- `H852A035P` [順豐智能櫃] 自助櫃 上水中心二樓 -- 上水中心2樓(2028號鋪對面)
- `H852A068P` [順豐智能櫃] 自助櫃 粉嶺碧湖商場AEON -- 粉嶺碧湖商場AEON高層地下(家品區)
- `H852A078P` [順豐智能櫃] 自助櫃 粉嶺花都廣場 -- 粉嶺花都廣場地下
- `H852BA06P` [順豐智能櫃] 自助櫃 太子荔枝角道178號(LaundrYup洗衣店) -- 香港油尖旺區太子荔枝角道178號5鋪洗衣店*
- `H852BB87P` [順豐智能櫃] 自助櫃 旺角渡船街301號(廣安玻璃)(二號櫃) -- 香港旺角渡船街301地下廣安玻璃二號櫃
- `H852BD91P` [順豐智能櫃] 自助櫃 九龍塘學生宿舍北座 -- 香港九龍塘學生宿舍北座地下只供職員學生使用*
- `H852CB16P` [順豐智能櫃] 自助櫃 觀塘裕民薈 -- 觀塘裕民中心裕民薈1樓145號鋪(開放時間至晚上10時)
- `H852CC28P` [順豐智能櫃] 自助櫃 觀塘秀茂坪安達商場 -- 秀茂坪安達商場LG層(商場服務台前面)
- `H852CC64P` [順豐智能櫃] 自助櫃 將軍澳調景嶺都會駅商場(一號櫃) -- 香港西貢區調景嶺都會駅商場2樓028鋪一櫃
- `H852DA18P` [順豐智能櫃] 自助櫃 長沙灣福華街544號(你的自助洗衣坊洗衣店) -- 深水埗福華街544號地下B鋪(洗衣店內)
- `H852DA19P` [順豐智能櫃] 自助櫃 長沙灣幸福商場(一號櫃) -- 長沙灣幸福商場地下6號鋪一號櫃*
- `H852DA47P` [順豐智能櫃] 自助櫃 長沙灣青山道143號(順豐站) -- 長沙灣青山道143號地下(順豐站)
- `H852E031P` [順豐智能櫃] 自助櫃 尖沙咀The Austin -- 尖沙咀The Austin 1座地下
- `H852EA35P` [順豐智能櫃] 自助櫃 佐敦文苑街35A號(你的自助洗衣坊) -- 佐敦文苑街35A號地下(你的自助洗衣坊)*
- `H852FE01P` [順豐智能櫃] 自助櫃 大圍美林商場 -- 大圍美林商場1樓(郵政局旁)*
- `H852FE05P` [順豐智能櫃] 自助櫃 馬鞍山錦英商場(近惠康) -- 香港馬鞍山錦英商場2樓(惠康超級市場對出)*
- `H852FE23P` [順豐智能櫃] 自助櫃 馬鞍山翠擁華庭6座地下 -- 香港馬鞍山翠擁華庭6座地下對面L1停車場*
- `H852FE65P` [順豐智能櫃] 自助櫃 沙田沙角商場 -- 沙田沙角商場2樓
- `H852FE88P` [順豐智能櫃] 自助櫃 馬鞍山聽濤雅苑停車場入口(第4座旁) -- 香港馬鞍山聽濤雅苑停車場入口地下住戶使用
- `H852G030P` [順豐智能櫃] 自助櫃 荃灣麗城花園第二期第2座 -- 香港荃灣麗城花園第二期第2座3樓平台(只供住戶使用)
- `H852GC56P` [順豐智能櫃] 自助櫃 深井海韻花園 -- 深井海韻花園地下管理處對面(只供住戶使用)
- `H852HB03P` [順豐智能櫃] 自助櫃 九龍灣港鐵總部大樓 -- 九龍灣港鐵總部大樓電梯大堂(只供職員使用)
- `H852J046P` [順豐智能櫃] 黃大仙竹園廣場2樓 -- 黃大仙竹園廣場2樓
- `H852J057P` [順豐智能櫃] 自助櫃 慈雲山華麗樓(順豐站)(一號櫃) -- 慈雲山華麗樓地下2號鋪順豐站(一號櫃)*
- `H852J060P` [順豐智能櫃] 自助櫃 牛池灣海港花園地下(二號櫃) -- 牛池灣海港花園地下大堂二號櫃只供住戶使用
- `H852M006P` [順豐智能櫃] 自助櫃 長洲新興街53號地下(橫店百貨) -- 長洲新興街53號地下(橫店百貨)*
- `H852M009P` [順豐智能櫃] 自助櫃 上環文咸東街50號(LaundrYup洗衣店) -- 香港上環文咸東街50號G18號鋪洗衣店內*
- `H852MA50P` [順豐智能櫃] 自助櫃 西環恆裕大廈(順豐站)(一號櫃) -- 西環加多近街恆裕大廈地下3及4號鋪順豐站(一號櫃)*
- `H852P066P` [順豐智能櫃] 智能櫃 北角尚譽 -- 北角尚譽三樓休憩處(只供住戶使用)
- `H852PB46P` [順豐智能櫃] 自助櫃 小西灣富怡花園5座 -- 小西灣富怡花園5座地下(只供住戶使用)
- `H852U005P` [順豐智能櫃] 自助櫃 屯門利寶商場(全日洗洗衣店) -- 屯門利寶商場地下99號鋪(全日洗洗衣店)*
- `H852U055P` [順豐智能櫃] 自助櫃 屯門大興花園第二期商場AEON -- 香港屯門大興花園第二期商場AEON二樓*
- `H852U068P` [順豐智能櫃] 自助櫃 屯門新屯門中心廣場(三號櫃) -- 新屯門商場L2 32B號鋪三號櫃*
- `H852U071P` [順豐智能櫃] 自助櫃 屯門時代廣場 -- 香港屯門時代廣場L4層平台星巴克電梯大堂上
- `H852U121P` [順豐智能櫃] 自助櫃 屯門華都花園商場(順豐站)(一號櫃) -- 屯門華都花園商場地下36號鋪順豐站一號櫃
- `H852UA23P` [順豐智能櫃] 自助櫃 元朗四季豪園 -- 香港元朗區錦田四季豪園屋苑入口旁(只供住戶使用)
- `H852UA47P` [順豐智能櫃] 元朗YoHo midtown1座(二號櫃) -- 元朗YOHO Midtown1座前5樓二號櫃(只供住戶使用)
- `H852UA75P` [順豐智能櫃] 自助櫃 元朗東頭村 -- 香港元朗朗日路東頭村(牌坊前)*
- `H852UB12P` [順豐智能櫃] 自助櫃 元朗大旗領747號 -- 香港元朗區大棠大棠路大旗領747號(名御對面)

---

## Removed Locations (0)

*(No removed locations)*

---

## Updated Locations (1)

- `H852MA12P` 自助櫃 西營盤均益大廈三期(一號櫃)
  - name: `"自助櫃 西營盤均益大廈三期(LaundrYup洗衣店)(一號櫃)"` -> `"自助櫃 西營盤均益大廈三期(一號櫃)"`
