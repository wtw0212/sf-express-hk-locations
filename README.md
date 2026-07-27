> **最後更新時間 (Last Updated)**: `2026-07-27 09:28 (HKT UTC+8)`

> 📅 **最後更新時間 (Last Updated)**: `2026-07-27 09:18 (HKT UTC+8)`

# 🚚 香港順豐速運自提點 / 順豐站 / 智能櫃資料集
# SF Express Hong Kong Stores & Lockers Dataset (Bilingual 中英雙語)

[中文] | [English]

一個自動化更新的香港順豐速運（SF Express HK）自提點、順豐站及智能櫃公開資料集與搜尋網站。提供結構化的雙語（繁體中文 / English）JSON 資料以及 GitHub Raw 直接存取。

An automated, up-to-date bilingual dataset (Traditional Chinese & English) and lookup website for SF Express Hong Kong Stores, Lockers, and Service Partners. Provides clean JSON files and GitHub Raw direct access.

🌐 **GitHub Pages 門市搜尋網站 (Online Lookup Website)**:  
👉 [https://wtw0212.github.io/sf-express-hk-locations/](https://wtw0212.github.io/sf-express-hk-locations/)

📊 **最新每日網點異動報告 (Latest Daily Sync Report)**:  
👉 [檢視最新每日更新報告 (View Latest Report)](reports/latest-diff.md)

---

## 📦 GitHub Direct Raw 存取 (Direct Access URLs in `data/`)

您可以直接在您的網店（如 Next.js, Shopify, WooCommerce, iOS/Android App）中透過 **GitHub Raw** 存取所有位於 `data/` 資料夾內的雙語分類 JSON：

| 內容 (Content) | GitHub Raw 網址 (URL) |
| :--- | :--- |
| **完整雙語資料集 (All Locations)** | `https://raw.githubusercontent.com/wtw0212/sf-express-hk-locations/main/data/locations.json` |
| **純 順豐站 (Stores Only)** | `https://raw.githubusercontent.com/wtw0212/sf-express-hk-locations/main/data/stores.json` |
| **純 順豐智能櫃 (Lockers Only)** | `https://raw.githubusercontent.com/wtw0212/sf-express-hk-locations/main/data/lockers.json` |
| **純 合作點 (Partners Only)** | `https://raw.githubusercontent.com/wtw0212/sf-express-hk-locations/main/data/partners.json` |
| **按地區分組 (By District)** | `https://raw.githubusercontent.com/wtw0212/sf-express-hk-locations/main/data/locations-by-district.json` |

---

## 💻 代碼調用範例 (Usage Examples)

### JavaScript / TypeScript / Next.js
```javascript
// 透過 GitHub Raw 取得中英雙語順豐點位清單
async function getSFLocations() {
  const url = 'https://raw.githubusercontent.com/wtw0212/sf-express-hk-locations/main/data/locations.json';
  const response = await fetch(url);
  const locations = await response.json();
  return locations;
}
```

---

## 📄 JSON Schema 雙語結構說明 (Bilingual Data Schema)

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
  "source": "api",
  "retrieved_at": "2026-07-26 23:35 (HKT UTC+8)"
}
```

---

## 🤖 自動更新機制 (Automated Sync)

本 Repository 使用 **GitHub Actions** 每天定時（每日 00:07 HKT）自動執行雙語 API 抓取、動態 PDF 解析、18區校正與 Quality Gate 驗證腳本，自動更新 `data/` 資料夾下的所有雙語 JSON 檔，並同步更新 README 最頂部的最後更新時間。

---

## 📜 聲明 (Disclaimer)

本專案資料來自順豐速運官方公開管道，版權歸順豐速運所有。本專案僅作開源數據整理與社群方便使用。
