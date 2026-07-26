> 📅 **最後更新時間 (Last Updated)**: `2026-07-26 23:17 (HKT UTC+8)`

# 🚚 香港順豐速運自提點 / 順豐站 / 智能櫃資料集
# SF Express Hong Kong Stores & Lockers Dataset

[中文] | [English]

一個自動化更新的香港順豐速運（SF Express HK）自提點、順豐站及智能櫃公開資料集與搜尋網站。提供結構化的 JSON 資料以及 GitHub Raw 直接存取。

An automated, up-to-date dataset and lookup website for SF Express Hong Kong Stores, Lockers, and Service Partners. Provides clean JSON files and GitHub Raw direct access.

🌐 **GitHub Pages 門市搜尋網站 (Online Lookup Website)**:  
👉 [https://wtw0212.github.io/sf-express-hk-locations/](https://wtw0212.github.io/sf-express-hk-locations/)

---

## 📦 GitHub Direct Raw 存取 (Direct Access URLs in `data/`)

您可以直接在您的網店（如 Next.js, StayVintage, Shopify, WooCommerce, iOS/Android App）中透過 **GitHub Raw** 存取所有位於 `data/` 資料夾內的分類 JSON：

| 內容 (Content) | GitHub Raw 網址 (URL) |
| :--- | :--- |
| **完整資料集 (All Locations)** | `https://raw.githubusercontent.com/wtw0212/sf-express-hk-locations/main/data/locations.json` |
| **純 順豐站 (Stores Only)** | `https://raw.githubusercontent.com/wtw0212/sf-express-hk-locations/main/data/stores.json` |
| **純 順豐智能櫃 (Lockers Only)** | `https://raw.githubusercontent.com/wtw0212/sf-express-hk-locations/main/data/lockers.json` |
| **純 合作點 (Partners Only)** | `https://raw.githubusercontent.com/wtw0212/sf-express-hk-locations/main/data/partners.json` |
| **按地區分組 (By District)** | `https://raw.githubusercontent.com/wtw0212/sf-express-hk-locations/main/data/locations-by-district.json` |

---

## 💻 代碼調用範例 (Usage Examples)

### JavaScript / TypeScript / Next.js
```javascript
// 透過 GitHub Raw 取得所有順豐點位清單
async function getSFLocations() {
  const url = 'https://raw.githubusercontent.com/wtw0212/sf-express-hk-locations/main/data/locations.json';
  const response = await fetch(url);
  const locations = await response.json();
  return locations;
}
```

---

## 📄 JSON Schema 結構說明 (Data Schema)

```json
{
  "id": "852AA",
  "code": "852AA",
  "type": "store",
  "type_name": "順豐站",
  "name": "大埔同茂坊順豐站",
  "region": "新界",
  "district": "大埔區",
  "sub_district": "大埔",
  "address": "香港大埔區大埔同茂坊1及3號北翼地鋪*",
  "telephone": "98160449",
  "business_hours": "週一至週六,09:00-20:00;週日及勞工假期,09:00-18:00",
  "location": {
    "latitude": 22.449009,
    "longitude": 114.167336
  },
  "source": "api",
  "retrieved_at": "2026-07-26 22:59 (HKT UTC+8)"
}
```

---

## 🤖 自動更新機制 (Automated Sync)

本 Repository 使用 **GitHub Actions** 每天定時（每日 00:07 HKT）自動執行抓取、動態 PDF 解析、18區校正與 Quality Gate 驗證腳本，自動更新 `data/` 資料夾下的所有 JSON 檔，並同步更新 README 最頂部的最後更新時間。

---

## 📜 聲明 (Disclaimer)

本專案資料來自順豐速運官方公開管道，版權歸順豐速運所有。本專案僅作開源數據整理與社群方便使用。
