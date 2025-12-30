# GoJapan - 日本旅遊行程管理系統

> 一個基於 Vue 3 + TypeScript + Vite 的現代化旅遊行程規劃與支出管理應用程式

**版本**: 2.0.0

## 📋 專案概述

GoJapan 是一個功能完整的旅遊行程管理系統，支援行程規劃、支出分帳、地圖定位、天氣查詢、匯率換算、翻譯功能等。採用 Vue 3 Composition API 架構，提供本地儲存與 Firebase 雲端同步功能，支援多人協作與即時同步。

## 🛠️ 技術棧

-   **前端框架**: Vue 3.5.25 (Composition API)
-   **程式語言**: TypeScript 5.9.3
-   **建置工具**: Vite 7.2.4
-   **樣式框架**: Tailwind CSS 4.1.17
-   **後端服務**: Firebase Firestore (v10.7.1)
-   **地圖服務**: Leaflet
-   **圖示庫**: Phosphor Icons
-   **拖曳功能**: vue-draggable-plus

## 📁 專案結構

```
GoJapan/
├── data/                    # 資料檔案
│   └── trip-data.ts        # 預設行程資料與 Firebase 設定
├── src/
│   ├── components/         # Vue 元件
│   │   ├── layout/         # 佈局元件（Header, Tabs, Toggle）
│   │   ├── modals/         # 模態框元件（設定、編輯、邀請等）
│   │   ├── money/          # 分帳相關元件
│   │   ├── plan/           # 行程規劃元件
│   │   ├── sidebar/        # 側邊欄元件
│   │   ├── translate/      # 翻譯功能元件
│   │   └── ui/             # 通用 UI 元件
│   ├── composables/        # Vue 3 Composables（業務邏輯層）
│   ├── services/           # 服務層（外部 API 整合）
│   ├── utils/              # 工具函數
│   ├── types/              # TypeScript 型別定義
│   ├── constants/          # 常數定義
│   ├── App.vue             # 主應用元件
│   ├── App.template.html   # 模板檔案
│   └── main.ts             # 應用程式入口
├── index.html              # HTML 入口檔案
├── vite.config.ts          # Vite 設定檔
├── tsconfig.json           # TypeScript 設定檔
└── tailwind.config.js      # Tailwind CSS 設定檔
```

## 🎯 核心功能模組

### 1. Composables（業務邏輯層）

#### 📦 `useTripManagement.ts`

**功能**: 旅程管理

-   建立、刪除、切換旅程
-   載入旅程列表
-   支援模板載入（預設日本行程）
-   處理旅程的本地與雲端狀態同步
-   **匯率同步**: 雲端旅程同步時優先使用 Firebase 匯率，避免被本地舊值覆蓋

**主要函數**:

-   `loadTripList()` - 從 localStorage 載入旅程列表
-   `createNewTrip()` - 建立新旅程
-   `switchTrip(id)` - 切換到指定旅程（支援雲端同步）
-   `deleteTrip(id)` - 刪除旅程
-   `loadTemplateAsNew()` - 載入模板作為新旅程

---

#### 💰 `useExpenses.ts`

**功能**: 支出管理與分帳計算

-   新增、刪除支出
-   支援個人記帳模式與共同分帳模式
-   自動計算每人應付/應收金額
-   結算方案計算
-   自動同步到雲端（背景執行，1 秒內多次操作會合併）
-   支援分攤對象選擇

**主要函數**:

-   `addExpense()` - 新增支出（自動上傳到雲端）
-   `removeExpense()` - 刪除支出（自動從雲端刪除）
-   `scheduleExpensesAutoSync()` - 排程自動同步（防抖處理）
-   `totalExpense` - 總支出（計算屬性）
-   `paidByPerson` - 每人已付金額（計算屬性）
-   `owedByPerson` - 每人應付金額（計算屬性）
-   `settlementPlan` - 結算方案（計算屬性）

---

#### ☁️ `useCloudSync.ts`

**功能**: 雲端同步管理

-   上傳旅程資料到 Firebase
-   從 Firebase 同步旅程資料
-   處理上傳/同步狀態管理
-   支援背景自動同步（silent 模式）
-   **匯率同步**: 同步時會更新 `exchangeRate` 和 `setup.rate`

**主要函數**:

-   `uploadToCloud(silent?)` - 上傳到雲端（silent 模式不顯示成功提示）
-   `syncFromCloud()` - 從雲端同步（單向拉取，覆蓋本地資料）

**同步內容**:

-   旅程主文件（標題、日期、設定等）
-   行程天數資料（days）
-   共同支出資料（sharedExpenses）
-   設定資料（包含匯率、貨幣、語言等）

---

#### 📡 `useCloudExpenses.ts`

**功能**: 雲端支出即時監聽

-   監聽 Firestore 的支出變更（使用 `onSnapshot`）
-   自動合併本地與雲端資料（以 `order` 為唯一識別）
-   避免本地更新時的循環觸發（使用 `isLocalUpdate` 標記）
-   支援多人即時協作

**主要函數**:

-   `setupExpensesRealtimeListener()` - 設定即時監聽器
-   `unsubscribe()` - 取消監聽器

**資料合併邏輯**:

-   以 `order` 作為唯一識別碼
-   Firestore 有的、本地沒有的 → 新增
-   兩邊都有的 → 以 Firestore 為準更新
-   Firestore 沒有的、本地有的 → 從本地刪除

---

#### 🔗 `useInviteCode.ts`

**功能**: 邀請碼管理

-   生成 6 位邀請碼
-   複製邀請連結/邀請碼
-   從 URL 參數載入邀請旅程
-   透過邀請碼查詢旅程
-   自動建立本地旅程並連結到雲端

**主要函數**:

-   `generateInviteCode()` - 生成邀請碼
-   `copyInviteLink()` - 複製邀請連結
-   `copyInviteCode()` - 複製邀請碼
-   `checkInviteCodeFromUrl()` - 從 URL 載入邀請旅程

---

#### 💾 `useLocalPersistence.ts`

**功能**: 本地持久化儲存

-   自動儲存旅程資料到 localStorage
-   監聽資料變更並自動儲存
-   支援多旅程獨立儲存

**監聽項目**:

-   `days` - 行程資料
-   `expenses` - 支出資料
-   `personalExpenses` - 個人支出
-   `exchangeRate` - 匯率
-   `participantsStr` - 分帳成員

---

#### 📅 `useDayPlan.ts`

**功能**: 行程天數管理

-   新增、刪除行程天數
-   新增、刪除、移動行程項目
-   管理國家分隔區塊（Country Divider）
-   管理備註（Note）編輯狀態
-   支援項目上下移動

**主要函數**:

-   `addDay()` - 新增行程天數
-   `removeCurrentDay()` - 刪除當前行程天數
-   `addItem()` - 新增行程項目
-   `removeItem(idx)` - 刪除行程項目
-   `moveItemUp(idx)` - 項目上移
-   `moveItemDown(idx)` - 項目下移
-   `showInsertCountryDividerModal(idx)` - 顯示插入國家分隔區塊
-   `saveCountryDivider()` - 儲存國家分隔區塊
-   `removeCountryDivider(item)` - 刪除國家分隔區塊
-   `startEditNote(item)` - 開始編輯備註
-   `saveNote()` - 儲存備註

---

#### 🌤️ `useWeatherRate.ts`

**功能**: 天氣與匯率管理

-   整合 `useWeather` 和 `useRateDetection`
-   提供統一的介面管理天氣與匯率資料
-   計算屬性格式化顯示

**主要屬性**:

-   `weather` - 天氣資料
-   `weatherDisplay` - 格式化天氣顯示
-   `fetchWeather(dest)` - 取得天氣資料
-   `detectRate()` - 偵測匯率
-   `currencyLabel` - 貨幣標籤
-   `currencySymbol` - 貨幣符號

---

#### 🌡️ `useWeather.ts`

**功能**: 天氣資料取得

-   從 Open-Meteo API 取得天氣資料
-   格式化天氣顯示
-   支援多天預報

---

#### 💱 `useRateDetection.ts`

**功能**: 匯率偵測

-   從 Exchangerate-API 取得匯率資料
-   根據貨幣代碼自動偵測匯率
-   支援 TWD 基準換算

---

#### 🔍 `useTranslate.ts`

**功能**: 翻譯功能管理

-   管理翻譯目標國家和語言代碼
-   產生 Google Translate 連結
-   支援中文與目標語言雙向翻譯

**主要屬性**:

-   `myTranslateCountry` - 翻譯目標國家
-   `myTranslateLangCode` - 翻譯目標語言代碼
-   `translateFromChToMy` - 中文 → 目標語言連結
-   `translateFromMyToCh` - 目標語言 → 中文連結

---

#### 🗺️ `useMapView.ts`

**功能**: 地圖與定位

-   初始化 Leaflet 地圖
-   取得使用者地理位置
-   顯示當天行程地點
-   定位到使用者位置

**主要函數**:

-   `initMap()` - 初始化地圖
-   `centerOnUser()` - 定位到使用者

---

#### 🎯 `useViewState.ts`

**功能**: UI 狀態管理

-   管理視圖模式（地圖/列表/分帳/翻譯）
-   管理當前日期索引
-   管理各種 Modal 開關狀態
-   管理標題與目的地的編輯狀態

**主要狀態**:

-   `viewMode` - 視圖模式（plan/map/money/translate）
-   `currentDayIdx` - 當前日期索引
-   `showSetupModal` - 設定 Modal
-   `showTripMenu` - 旅程選單
-   `isEditingTitle` - 編輯標題狀態

---

#### 🔍 `useRecommendations.ts`

**功能**: 地點推薦

-   搜尋附近推薦地點（使用 Geoapify API）
-   應用推薦到行程中
-   管理搜尋狀態

**主要函數**:

-   `searchNearby(item, idx, dayIdx)` - 搜尋附近地點
-   `applyRecommendation(idx)` - 應用推薦

---

### 2. Services（服務層）

#### 🔥 `firebase.ts`

**功能**: Firebase 初始化與連接管理

-   動態載入 Firebase SDK（從 CDN）
-   初始化 Firebase App 與 Firestore
-   提供連接狀態檢查
-   Firebase 連接驗證工具

**主要函數**:

-   `loadFirebaseApp()` - 載入 Firebase App 模組
-   `loadFirebaseFirestore()` - 載入 Firestore 模組
-   `getFirestoreModule()` - 取得 Firestore 模組
-   `waitForDb()` - 等待資料庫連接
-   `checkFirebaseReady()` - 檢查 Firebase 是否就緒
-   `verifyFirebaseConnection()` - 驗證 Firebase 連接

---

#### ☁️ `cloudTripService.ts`

**功能**: Firestore CRUD 操作

-   上傳/更新旅程主文件
-   上傳/刪除行程天數資料
-   上傳/刪除支出資料（批次與單筆）
-   同步旅程資料
-   根據邀請碼查詢旅程

**主要函數**:

-   `uploadTripDocument()` - 上傳/更新旅程主文件（包含 config.rate）
-   `uploadDays()` - 上傳行程天數
-   `uploadSharedExpenses()` - 批次上傳共同支出
-   `deleteOldDays()` - 刪除舊的行程天數
-   `deleteOldSharedExpenses()` - 刪除舊的共同支出
-   `addExpenseToCloud()` - 新增單筆支出到雲端（使用 order 作為文件 ID）
-   `deleteExpenseFromCloud()` - 從雲端刪除支出（根據 order）
-   `addPersonalExpenseToCloud()` - 新增個人記帳到雲端
-   `deletePersonalExpenseFromCloud()` - 刪除個人記帳
-   `syncTripFromCloud()` - 同步旅程資料（單向拉取）
-   `findTripByInviteCode()` - 根據邀請碼查詢旅程

**Firestore 資料結構**:

```
trips/{tripId}
  ├── title, startDate, daysCount, inviteCode, participants
  ├── config: { currency, rate, langCode, langName }
  ├── days/{dayId} - 行程天數子集合
  ├── sharedExpenses/{order} - 共同支出子集合
  └── personalExpenses/{order} - 個人記帳子集合
```

---

### 3. Utils（工具函數）

#### 📅 `date.ts`

**功能**: 日期格式化與處理

-   `formatDate()` - 格式化日期字串
-   `getTodayDateStr()` - 取得今天日期字串
-   `getTimePeriod()` - 取得時段（上午/下午等）

---

#### 💵 `expense.ts`

**功能**: 支出相關計算

-   `formatExpenseTime()` - 格式化支出時間
-   `getExpenseSplitAmount()` - 計算每人分攤金額

---

#### 🗺️ `url.ts`

**功能**: URL 相關工具

-   `getGoogleMapLink()` - 產生 Google Maps 連結

---

#### 💾 `storage.ts`

**功能**: localStorage 工具

-   `getStorageKey()` - 產生儲存鍵值（格式：`{tripId}_{suffix}`）
-   `saveToStorage()` - 儲存資料（JSON 序列化）
-   `loadFromStorage()` - 載入資料（JSON 反序列化）

---

#### 🆔 `id.ts`

**功能**: ID 生成

-   `generateId()` - 生成唯一 ID（基於時間戳）

---

#### 🌤️ `weather.ts`

**功能**: 天氣相關工具

-   `getWeatherIcon()` - 根據天氣代碼取得圖示

---

#### 🌍 `countryData.ts`

**功能**: 國家資料管理

-   從 REST Countries API 載入國家資料
-   提供國家列表與搜尋功能
-   支援國家名稱、ISO 代碼查詢

---

#### 🗺️ `geoapify.ts`

**功能**: 地理編碼服務

-   文字地理編碼（地址 → 座標）
-   地點搜尋（使用 Geoapify API）
-   支援多語言地名（日文、中文、英文等）

**主要函數**:

-   `geocodeText(text)` - 文字地理編碼
-   `searchPlaces(text, lat?, lon?)` - 搜尋地點

---

### 4. Constants（常數定義）

#### `constants/index.ts`

**功能**: 全域常數定義

-   `DEFAULT_PARTICIPANTS` - 預設分帳成員
-   `DEFAULT_PARTICIPANTS_STR` - 預設分帳成員字串
-   `DEFAULT_EXCHANGE_RATE` - 預設匯率
-   `useFirebase` - 是否啟用 Firebase
-   `FIREBASE_VERSION` - Firebase 版本
-   `AUTO_SYNC_DELAY` - 自動同步延遲時間（毫秒）

---

### 5. Types（型別定義）

#### `types/index.d.ts`

**功能**: TypeScript 型別定義

-   `Day` - 行程天數型別
-   `DayItem` - 行程項目型別
-   `Expense` - 支出型別
-   `Setup` - 設定型別
-   `TripMeta` - 旅程元資料型別
-   `FirebaseConfig` - Firebase 設定型別
-   `SettlementPlan` - 結算方案型別
-   `Flight` - 航班資訊型別

---

## 🔄 核心功能流程

### 旅程建立流程

1. 使用者點擊「新增旅程」
2. `useTripManagement.createNewTrip()` 建立新旅程
3. 生成唯一旅程 ID
4. 初始化預設資料
5. `useLocalPersistence` 自動儲存到 localStorage

### 支出新增流程

1. 使用者輸入支出資訊（項目、金額、付款人、分攤對象）
2. `useExpenses.addExpense()` 新增支出
3. 自動計算每人分攤金額
4. `useLocalPersistence` 自動儲存到 localStorage
5. 如果是雲端旅程：
    - 立即上傳單筆到 Firestore（`addExpenseToCloud`）
    - 排程背景自動同步（`scheduleExpensesAutoSync`，1 秒防抖）

### 匯率同步流程

1. **修改匯率時**:

    - 使用者修改分帳頁面的匯率
    - 同時更新 `exchangeRate` 和 `setup.rate`
    - `useLocalPersistence` 自動儲存到 localStorage

2. **上傳到雲端時**:

    - `uploadTripDocument` 將 `setup.rate` 上傳到 Firestore 的 `config.rate`

3. **從雲端同步時**:
    - `syncFromCloud` 讀取 `tripData.config.rate`
    - 更新 `exchangeRate.value` 和 `setup.value.rate`
    - 如果是雲端旅程且同步成功，優先使用雲端匯率（不會被本地舊值覆蓋）

### 雲端同步流程

1. **上傳流程**:

    - 使用者點擊「上傳到雲端」或自動背景同步
    - `useCloudSync.uploadToCloud()` 執行上傳
    - `cloudTripService.uploadTripDocument()` 上傳/更新主文件
    - `cloudTripService.deleteOldDays()` 刪除舊的行程資料
    - `cloudTripService.uploadDays()` 上傳新的行程資料
    - `cloudTripService.deleteOldSharedExpenses()` 刪除舊的支出資料
    - `cloudTripService.uploadSharedExpenses()` 上傳新的支出資料
    - 儲存雲端資訊到 localStorage
    - 設定即時監聽器（`useCloudExpenses`）

2. **同步流程**:

    - 使用者點擊「從雲端同步」或自動初始化同步
    - `useCloudSync.syncFromCloud()` 執行同步
    - `cloudTripService.syncTripFromCloud()` 從 Firestore 讀取資料
    - 更新本地資料（覆蓋模式）
    - 儲存到 localStorage

3. **即時監聽**:
    - `useCloudExpenses.setupExpensesRealtimeListener()` 設定監聽器
    - 使用 Firestore `onSnapshot` 監聽 `sharedExpenses` 變更
    - 自動合併本地與雲端資料（以 `order` 為依據）
    - 使用 `isLocalUpdate` 標記避免循環觸發

### 邀請碼載入流程

1. 使用者透過邀請連結進入（URL 包含 `?code=XXXXXX`）
2. `useInviteCode.checkInviteCodeFromUrl()` 檢查 URL 參數
3. `cloudTripService.findTripByInviteCode()` 查詢旅程
4. 檢查是否已存在本地旅程：
    - 已存在：更新雲端資訊並切換
    - 不存在：建立新本地旅程並連結到雲端
5. `useCloudSync.syncFromCloud()` 同步旅程資料
6. 切換到該旅程

---

## 📦 資料結構

### Day（行程天數）

```typescript
{
  date: string;           // 日期顯示字串
  shortDate: string;      // 簡短日期
  fullDate: string;       // 完整日期
  title: string;          // 標題
  items: DayItem[];       // 行程項目
  flight: Flight | null;  // 航班資訊（可選）
  region: string;         // 地區
}
```

### DayItem（行程項目）

```typescript
{
  type: string;              // 類型（spot/country-divider 等）
  name: string;              // 名稱
  time: string;              // 時間
  region: string;            // 地區
  country?: string;          // 國家
  countryCode?: string;       // 國家代碼
  isCountryDivider?: boolean; // 是否為國家分隔區塊
  note?: string;             // 備註
  // ... 其他欄位
}
```

### Expense（支出）

```typescript
{
  item: string;                    // 項目名稱
  amount: number;                  // 金額
  payer: string;                   // 付款人
  order: string;                   // 唯一識別碼（用於雲端同步）
  splitParticipants: string[];     // 分攤對象
}
```

### Setup（設定）

```typescript
{
    title: string; // 旅程標題
    startDate: string; // 開始日期
    days: number; // 天數
    rate: number; // 匯率（會同步到雲端）
    currency: string; // 貨幣代碼
    langCode: string; // 語言代碼
    langName: string; // 語言名稱
}
```

---

## 🔧 開發指令

```bash
# 安裝依賴
npm install

# 開發模式
npm run dev

# 建置生產版本
npm run build

# 預覽生產版本
npm run preview
```

---

## ⚙️ 環境設定

### Firebase 設定

1. 在 `data/trip-data.ts` 中設定 Firebase 設定檔
2. 確保 `src/constants/index.ts` 中 `useFirebase = true`
3. 在 Firebase Console 設定 Firestore 安全規則

### Firestore 安全規則範例

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /trips/{tripId} {
      allow read, write: if true; // 測試用，生產環境需加強安全
      match /{document=**} {
        allow read, write: if true;
      }
    }
  }
}
```

### Geoapify API Key

-   在 `src/utils/geoapify.ts` 中設定 API Key
-   用於地理編碼和地點搜尋功能

---

## 📝 重要功能說明

### 匯率同步機制

-   **修改匯率**: 在分帳頁面修改匯率時，會同時更新 `exchangeRate` 和 `setup.rate`
-   **上傳到雲端**: `setup.rate` 會儲存到 Firestore 的 `config.rate`
-   **從雲端同步**: 同步時會讀取 `config.rate` 並更新本地匯率
-   **初始化同步**: 雲端旅程初始化時，優先使用雲端匯率，不會被本地舊值覆蓋

### 支出同步機制

-   **即時上傳**: 新增/刪除支出時立即上傳到 Firestore
-   **背景同步**: 1 秒內多次操作會合併成一次同步（防抖處理）
-   **即時監聽**: 使用 Firestore `onSnapshot` 監聽變更，支援多人即時協作
-   **資料合併**: 以 `order` 為唯一識別碼，自動合併本地與雲端資料

### 本地儲存機制

-   所有資料預設儲存在 localStorage，支援多旅程管理
-   使用 `{tripId}_{suffix}` 格式作為儲存鍵值
-   `useLocalPersistence` 自動監聽資料變更並儲存

### 雲端同步機制

-   **上傳**: 覆蓋模式，刪除舊資料後上傳新資料
-   **同步**: 單向拉取，Firebase → 本地，覆蓋本地資料
-   **即時監聽**: 僅監聽支出資料，其他資料需手動同步

---

## 🎉 專案特色

-   ✅ **純 Vue 3**: 採用 Composition API，程式碼結構清晰
-   ✅ **TypeScript**: 完整的型別定義，提供更好的開發體驗
-   ✅ **模組化設計**: 使用 Composables 將功能模組化，易於維護
-   ✅ **雲端同步**: 支援 Firebase 即時同步，多人協作
-   ✅ **本地優先**: 本地儲存優先，離線也可使用
-   ✅ **響應式設計**: 使用 Tailwind CSS，支援各種螢幕尺寸
-   ✅ **即時協作**: 支援多人即時編輯支出資料
-   ✅ **自動同步**: 背景自動同步，無需手動操作
-   ✅ **匯率同步**: 完整的匯率同步機制，確保多裝置一致性

---

## 📄 授權

此專案為個人專案，僅供學習與參考使用。
