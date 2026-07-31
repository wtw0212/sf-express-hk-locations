# SF Express HK Location Sync Report

> **Last Updated**: `2026-07-31 10:57 (HKT UTC+8)`

---

## Summary

| Metric | Count |
| :--- | :--- |
| **Previous total** | 1670 |
| **Current total** | 1670 |
| **Stores** | 137 |
| **Lockers** | 1051 |
| **Partners** | 482 |
| **Added** | 1 |
| **Removed** | 1 |
| **Updated** | 28 |
| **Unchanged** | 1641 |

---

## Count Deltas

| Category | Previous | Current | Delta | Delta % | Baseline Source | Gate Result |
| :--- | ---: | ---: | ---: | ---: | :--- | :--- |
| total | 1670 | 1670 | +0 | +0% | previous_locations_feed | ✅ PASS |
| stores | 137 | 137 | +0 | +0% | previous_locations_feed | ✅ PASS |
| lockers | 1051 | 1051 | +0 | +0% | previous_locations_feed | ✅ PASS |
| partners | 482 | 482 | +0 | +0% | previous_locations_feed | ✅ PASS |
| tcCodes | 1664 | 1664 | +0 | +0% | previous_metadata.coverage.tc_record_count | ✅ PASS |
| enCodes | 1663 | 1663 | +0 | +0% | previous_metadata.coverage.en_record_count | ✅ PASS |

---

## Source Coverage & Status

| Metric | Value |
| :--- | :--- |
| TC API areas | 112/112 succeeded |
| EN API areas | 112/112 succeeded |
| TC unique codes | 1664 |
| EN unique codes | 1663 |
| Partner PDF HTTP Success | 8/8 |
| Partner PDF Parser Completed | 8/8 |
| Partner PDF Semantic Success | 5/8 |
| Partner PDF Quality Failures | 3 |
| Valid Partner PDF Records | 444 |
| Quarantined PDF Records | 12 |
| PDF Quarantine Ratio | 2.6% |
| SSR records | 186 |
| Bilingual match rate | 99.9% |
| District resolved | 1670 |
| District unresolved | 0 |
| With English data | 1663 |
| Missing English | 7 |

---

## Pipeline Execution Status

| Metric | Count |
| :--- | :--- |
| **Pipeline Blocking Errors** | 0 |
| **Pipeline Execution Warnings** | 5 |
| **Record Quality Warnings** | 272 |
| **Record Quality Info Flags** | 57 |
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
| MISSING_COORDINATES | 6 |
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

## Added Locations (1)

- `H852BD37P` [順豐智能櫃] 自助櫃 大角咀凱帆軒 -- 大角咀凱帆軒地下近穿巴上車位只供住戶使用*

---

## Removed Locations (1)

- `H852BD65P` [順豐智能櫃] 自助櫃 旺角海富苑海嵐閣 -- 大角咀海富苑海嵐閣地下*

---

## Updated Locations (28)

- `852A3012` 合作點 藝蓓音樂中心
  - address: `"新界大埔廣場地下麗晶廊40-6至40-7鋪*"` -> `"新界大埔廣場地下麗晶廊40-6至40-7鋪 藝蓓音樂中心*"`
- `852A3013` 合作店 皇后自提點
  - address: `"新界粉嶺馬料水新村926號DD83, A3-B*"` -> `"新界粉嶺馬料水新村926號DD83, A3-B 皇后自提點*"`
- `852AA3003` 合作點 小人國
  - address: `"香港新界大埔廣福邨廣福街市地下65號鋪(小人國)*"` -> `"新界大埔廣福邨廣福街市地下65號鋪(小人國)*"`
- `852AB3012` 合作店 俊筠速遞
  - address: `"大埔富蝶邨富蝶商場7號鋪 富蝶自提點（14:00-15:00午休）*"` -> `"大埔富蝶邨富蝶商場7號鋪 （14:00-15:00午休）俊筠速遞*"`
- `852B3001` 合作點 淘寶集運自提點
  - address: `"九龍大角咀鐵樹街7號金旺閣11號鋪(富多來商場一期公園仔對面)*"` -> `"九龍大角咀鐵樹街7號金旺閣11號鋪(富多來商場一期公園仔對面) 淘寶集運自提點**"`
- `852BA3001` 合作點 源泰文具(石硤尾邨)
  - address: `"九龍石硤尾邨美薈樓地下7號鋪*"` -> `"九龍石硤尾邨美薈樓地下7號鋪 源泰文具*"`
- `852BB3004` 合作點 業誠藥行
  - address: `"九龍旺角廣東道991號地下(業誠藥行)*"` -> `"九龍旺角廣東道991號地下(業誠藥行) *"`
- `852CH3002` 合作店 東源自提
  - address: `"The Parkside mall一樓B5B鋪東源自提*"` -> `"The Parkside mall一樓B5B鋪 東源自提*"`
- `852D3001` 合作點 港聯葯業
  - address: `"新界荔景麗瑤邨富瑤樓6號鋪*（13:30-14:30午休）*"` -> `"新界荔景麗瑤邨富瑤樓6號鋪*（13:30-14:30午休）港聯葯業*"`
- `852D3002` 合作點 豪由仔士多
  - address: `"新界念祖街1號祖堯坊A座1樓104號鋪*"` -> `"新界念祖街1號祖堯坊A座1樓104號鋪 豪由仔士多*"`
- `852FE3017` 合作店 西徑士多
  - address: `"西貢西徑村32F地下西徑士多（14：00-16：00午休時段）*"` -> `"西貢西徑村32F地下 西徑士多（14：00-16：00午休時段）*"`
- `852FH3004` 合作點 穎翹公司
  - address: `"新田圍村新田圍商場4樓28號鋪*"` -> `"新田圍村新田圍商場4樓28號鋪 穎翹公司*"`
- `852G3003` 合作點 康美創造實業
  - address: `"新界青衣涌美老屋村20號地下*"` -> `"新界青衣涌美老屋村20號地下 康美創造實業*"`
- `852G3009` 合作店 荃取營自提點
  - address: `"荃灣沙咀道108號美華樓C2地鋪（荃取營自提點）*"` -> `"荃灣沙咀道108號美華樓C2地鋪 荃取營自提點*"`
- `852J3005` 合作點 裕豐藥行
  - address: `"鑽石山斧山道185號宏景花園停車場1樓E鋪藥房*"` -> `"鑽石山斧山道185號宏景花園停車場1樓E鋪藥房 裕豐藥行*"`
- `852J3009` 合作點 東頭邨自提點
  - address: `"九龍東頭邨熟食檔地下CF6號鋪*"` -> `"九龍東頭邨熟食檔地下CF6號鋪 東頭邨自提點*"`
- `852J3012` 合作點 新利加士多
  - address: `"九龍牛池灣龍池徑12A地下*"` -> `"九龍牛池灣龍池徑12A地下 新利加士多*"`
- `852LA3004` 合作點 佳佳超市
  - address: `"新界葵涌石籬村石寧樓地下3&4號鋪*"` -> `"新界葵涌石籬村石寧樓地下3&4號鋪 佳佳超市*"`
- `852LB3008` 合作店 星通貿易
  - address: `"新界葵涌葵盛圍63號葵盛東商場114C（集運天下）*"` -> `"新界葵涌葵盛圍63號葵盛東商場114C 集運天下*"`
- `852NC3001` 合作點 弘嶺
  - address: `"長沙灣保安道383號麗寶商場31號G鋪(14:30-15:30午休)*"` -> `"長沙灣保安道383號麗寶商場31號G鋪(14:30-15:30午休) 弘嶺*"`
- `852P3005` 合作點 名豐大藥房
  - address: `"香港北角春秧街107號仁德大廈地下*"` -> `"香港北角春秧街107號仁德大廈地下 名豐大藥房*"`
- `852PA3006` 合作點 平記工程
  - address: `"香港西灣河大石街20號地鋪*"` -> `"香港西灣河大石街20號地鋪 平記工程*"`
- `852Q3005` 合作點 利興隆
  - address: `"香港大嶼山區梅窩銀運路3號梅窩中心地下16號鋪*"` -> `"香港大嶼山梅窩銀運路3號梅窩中心地下16號鋪 利興隆*"`
- `852T3003` 合作點 藝舍洗衣專門店
  - address: `"香港灣仔灣仔道177-179地下4號鋪*"` -> `"香港灣仔灣仔道177-179地下4號鋪 藝舍洗衣專門店**"`
- `852U3009` 合作點 啟豐自提點
  - address: `"新界屯門啟豐商場地下32號鋪(14:00-15:00午休)*"` -> `"新界屯門啟豐商場地下32號鋪(14:00-15:00午休) 啟豐自提點*"`
- `852U3017` 合作點 大師藥房
  - address: `"屯門石排頭徑1號卓爾廣場2樓215&216號鋪*"` -> `"屯門石排頭徑1號卓爾廣場2樓215&216號鋪 大師藥房*"`
- `852U3019` 合作點 新界屯門澤豐花園商場LG30號鋪
  - address: `"新界屯門澤豐花園商場LG30號鋪*"` -> `"新界屯門澤豐花園商場LG30號鋪 HKMAMISHOP B*"`
- `852UA3013` 合作點 小虎士多
  - address: `"新界元朗公庵路馬田村172號A地下*"` -> `"新界元朗公庵路馬田村172號A地下 小虎士多*"`
