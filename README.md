> **最後更新時間與動態元數據 (Last Updated & Metadata)**: 請參考 [`data/metadata.json`](data/metadata.json) 中的 `retrieved_at` 欄位。 (Refer to `retrieved_at` in `data/metadata.json`).

# 香港順豐速運自提點 / 順豐站 / 智能櫃資料集
# SF Express Hong Kong Stores & Lockers Dataset

一個自動化更新的香港順豐速運（SF Express HK）自提點、順豐站及智能櫃公開資料集與搜尋網站。提供結構化的 JSON 資料以及 GitHub Raw 直接存取。

An automated dataset and lookup web interface for SF Express Hong Kong Stores, Lockers, and Service Partners. Provides structured JSON data via GitHub Raw.

**GitHub Pages 門市搜尋網站 (Online Lookup Website)**:  
[https://wtw0212.github.io/sf-express-hk-locations/](https://wtw0212.github.io/sf-express-hk-locations/)

**最新每日網點異動報告 (Latest Daily Sync Report)**:  
[檢視最新每日更新報告 (View Latest Report)](reports/latest-diff.md)

---

## 數據來源與政策 (Data Policy & Source Hierarchy)

1. **官方 Traditional Chinese API** 為中文欄位的主要來源。
2. **官方 English API** 為英文欄位的主要來源。
3. **SSR 頁面**可補充 API 未提供的記錄；只有經 schema 驗證及人工審核的 PDF registry 記錄才可補充 canonical dataset。
4. **即時 PDF 解析結果只供 audit 比對**，不會直接進入 canonical output。
5. **來源衝突處理原則**：
   - 官方中英文資料若有歧異（如門牌號碼、營業時間、店名 mismatch），本資料集**完整保留雙方官方原值**，絕不依據第三方或單一方隨意覆蓋。
   - 衝突資訊會記錄於紀錄內的 `quality_flags` 機器可讀陣列中。
   - 不使用任何 OpenCC 或全域繁簡/字符自動替換規則。

---

## 原始快照與正規化資料 (Raw vs Normalized Data)

- **`raw/latest-fetch.json`**：保存每個 TC/EN area 在 JSON parsing 前取得的 exact HTTP response text、raw SHA-256、deterministic semantic SHA-256、record-level hashes，以及 SSR/PDF audit evidence。
- **`data/locations.json`**：正規化後的發布資料集。針對行政區劃進行標準18區對應與品質檢測，並附帶 `quality_flags` 與 `provenance`。
- **`data/metadata.json`**：保存 TC、EN、SSR、reviewed registry 與 canonical dataset 的 semantic integrity hashes。
- **`data/pdf-audit.json`**：只記錄比較結果；PDF binary hash (`document_binary_sha256`) 與 extracted-text hash (`extracted_text_sha256`) 分開保存。

Repository 未保存 PDF binary，所以 fixture/offline verification 會從 committed extracted text 獨立重算 `extracted_text_sha256`；`document_binary_sha256` 是 live fetch 時按實際 PDF bytes 計算的 evidence，不會由 extracted text 代替。

---

## GitHub Direct Raw 存取 (Direct Access URLs in `data/`)

| 內容 (Content) | GitHub Raw 網址 (URL) |
| :--- | :--- |
| **完整資料集 (All Locations)** | `https://raw.githubusercontent.com/wtw0212/sf-express-hk-locations/main/data/locations.json` |
| **純 順豐站 (Stores Only)** | `https://raw.githubusercontent.com/wtw0212/sf-express-hk-locations/main/data/stores.json` |
| **純 順豐智能櫃 (Lockers Only)** | `https://raw.githubusercontent.com/wtw0212/sf-express-hk-locations/main/data/lockers.json` |
| **純 合作點 (Partners Only)** | `https://raw.githubusercontent.com/wtw0212/sf-express-hk-locations/main/data/partners.json` |
| **按地區分組 (By District)** | `https://raw.githubusercontent.com/wtw0212/sf-express-hk-locations/main/data/locations-by-district.json` |
| **元數據與覆蓋率 (Metadata & Coverage)** | `https://raw.githubusercontent.com/wtw0212/sf-express-hk-locations/main/data/metadata.json` |

---

## 品質標籤說明 (Quality Flags)

每筆紀錄皆包含 `quality_flags` 陣列，標示潛在的資料差異或格式特徵：

- `SOURCE_TC_EN_STREET_NUMBER_CONFLICT`: 中英文地址門牌號碼不一致 (例如 6號 vs 6A)
- `SOURCE_TC_EN_UNIT_CONFLICT`: 中英文鋪號不一致
- `SOURCE_TC_EN_BUSINESS_HOURS_CONFLICT`: 中英文營業時間不一致
- `SUBDISTRICT_ADDRESS_CONFLICT`: 搜尋小區與地址記載地名有差異 (例如 秀茂坪 vs 油塘)
- `ADMIN_DISTRICT_ALIAS_APPLIED`: 已套用官方非標準地區別名 (例如 大嶼山區 → 離島區)
- `MISSING_ENGLISH_RECORD`: 官方英文 API 尚無對應紀錄
- `MISSING_COORDINATES`: 缺少經緯度座標
- `COORDINATES_OUTSIDE_HK`: 座標超出香港邊界範圍

---

## 局限性與注意事項 (Limitations)

1. **英文覆蓋率與官方差異**：順豐官方 Traditional Chinese 與 English API 在部分新網點上可能存在更新時間差或拼寫差異，具體中英匹配率請參考 `data/metadata.json`。
2. **合作點 PDF 解析局限**：即時 PDF 解析只供 audit；只有經審核 registry 記錄可進入 canonical dataset。PDF 排版變動不會直接改寫已發布記錄。

---

## JSON Schema 結構說明 (Data Schema)

```json
{
  "id": "852AA",
  "code": "852AA",
  "type": "store",
  "type_name": "順豐站",
  "type_name_en": "SF Store",
  "name": "大埔同茂坊順豐站",
  "name_en": "Tung Mau Square, Tai Po",
  "region": "新界",
  "region_en": "New Territories",
  "district": "大埔區",
  "district_en": "Tai Po District",
  "sub_district": "大埔",
  "sub_district_en": "Tai Po",
  "address": "香港大埔區大埔同茂坊1及3號北翼地鋪*",
  "address_en": "G/F, North Wing ,1 & 3 Tung Mau Square*,Tai Po,Tai Po District,Hong Kong",
  "telephone": "98160449",
  "business_hours": "週一至週六,09:00-20:00;週日及勞工假期,09:00-18:00",
  "business_hours_en": "Mon to Sat 09:00-20:00; Sun & Statutory Holidays 09:00-18:00",
  "location": {
    "latitude": 22.449009,
    "longitude": 114.167336
  },
  "source": "api_tc",
  "quality_flags": [],
  "provenance": {
    "name": "api_tc",
    "name_en": "api_en",
    "address": "api_tc",
    "address_en": "api_en",
    "district": "api_tc"
  },
  "retrieved_at": "2026-07-27 09:31 (HKT UTC+8)"
}
```

---

## 自動更新機制 (Automated Sync Schedule)

本 Repository 使用 **GitHub Actions** 每日自動執行完整同步管線：
- 單元測試與閘門驗證 (`npm test`)
- 抓取 TC/EN API, SSR 與 Partner PDF
- 備份真實 Raw 數據 (`raw/latest-fetch.json`)
- 正規化與比對 (產生 `reports/latest-diff.md`)
- 原子化發布 (Atomic publish) 至 `data/`

---

## 聲明 (Disclaimer)

本專案資料來自順豐速運官方公開管道，版權歸順豐速運所有。本專案僅作開源數據整理與社群方便使用。
