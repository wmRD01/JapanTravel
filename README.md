# GoJapan - 日本旅遊行程管理系統

> 一個基於 Vue 3 + TypeScript + Vite 的現代化旅遊行程規劃與支出管理應用程式

## 📋 專案概述

GoJapan 是一個功能完整的旅遊行程管理系統，支援行程規劃、支出分帳、地圖定位、天氣查詢、匯率換算等功能。採用 Vue 3 Composition API 架構，提供本地儲存與 Firebase 雲端同步功能。

## 🛠️ 技術棧

- **前端框架**: Vue 3.5.25 (Composition API)
- **程式語言**: TypeScript 5.9.3
- **建置工具**: Vite 7.2.4
- **樣式框架**: Tailwind CSS 4.1.17
- **後端服務**: Firebase Firestore (v10.7.1)
- **地圖服務**: Leaflet
- **圖示庫**: Phosphor Icons

## 📁 專案結構

```
GoJapan/
├── data/                    # 資料檔案
│   └── trip-data.ts        # 預設行程資料與 Firebase 設定
├── src/
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
- 建立、刪除、切換旅程
- 載入旅程列表
- 支援模板載入（預設日本行程）
- 處理旅程的本地與雲端狀態同步

**主要函數**:
- `loadTripList()` - 從 localStorage 載入旅程列表
- `createNewTrip()` - 建立新旅程
- `switchTrip(id)` - 切換到指定旅程
- `deleteTrip(id)` - 刪除旅程
- `loadTemplateAsNew()` - 載入模板作為新旅程

---

#### 💰 `useExpenses.ts`
**功能**: 支出管理與分帳計算
- 新增、刪除支出
- 支援個人記帳模式與共同分帳模式
- 自動計算每人應付/應收金額
- 結算方案計算
- 自動同步到雲端（背景執行）

**主要函數**:
- `addExpense()` - 新增支出
- `removeExpense()` - 刪除支出
- `totalExpense` - 總支出（計算屬性）
- `paidByPerson` - 每人已付金額（計算屬性）
- `owedByPerson` - 每人應付金額（計算屬性）
- `settlementPlan` - 結算方案（計算屬性）

---

#### ☁️ `useCloudSync.ts`
**功能**: 雲端同步管理
- 上傳旅程資料到 Firebase
- 從 Firebase 同步旅程資料
- 處理上傳/同步狀態管理
- 支援背景自動同步

**主要函數**:
- `uploadToCloud(silent?)` - 上傳到雲端
- `syncFromCloud()` - 從雲端同步

---

#### 📡 `useCloudExpenses.ts`
**功能**: 雲端支出即時監聽
- 監聽 Firestore 的支出變更
- 自動合併本地與雲端資料（以 `order` 為依據）
- 避免本地更新時的循環觸發

**主要函數**:
- `setupExpensesRealtimeListener()` - 設定即時監聽器
- `unsubscribe()` - 取消監聽器

---

#### 🔗 `useInviteCode.ts`
**功能**: 邀請碼管理
- 生成邀請碼
- 複製邀請連結/邀請碼
- 從 URL 參數載入邀請旅程
- 透過邀請碼查詢旅程

**主要函數**:
- `generateInviteCode()` - 生成邀請碼
- `copyInviteLink()` - 複製邀請連結
- `copyInviteCode()` - 複製邀請碼
- `checkInviteCodeFromUrl()` - 從 URL 載入邀請旅程

---

#### 💾 `useLocalPersistence.ts`
**功能**: 本地持久化儲存
- 自動儲存旅程資料到 localStorage
- 監聽資料變更並自動儲存
- 支援多旅程獨立儲存

**監聽項目**:
- `days` - 行程資料
- `expenses` - 支出資料
- `personalExpenses` - 個人支出
- `exchangeRate` - 匯率
- `participantsStr` - 分帳成員

---

#### 🌤️ `useWeatherRate.ts`
**功能**: 天氣與匯率管理
- 整合 `useWeather` 和 `useRateDetection`
- 提供統一的介面管理天氣與匯率資料
- 計算屬性格式化顯示

**主要屬性**:
- `weather` - 天氣資料
- `weatherDisplay` - 格式化天氣顯示
- `fetchWeather(dest)` - 取得天氣資料
- `detectRate()` - 偵測匯率
- `currencyLabel` - 貨幣標籤
- `currencySymbol` - 貨幣符號

---

#### 🗺️ `useMapView.ts`
**功能**: 地圖與定位
- 初始化 Leaflet 地圖
- 取得使用者地理位置
- 顯示當天行程地點
- 定位到使用者位置

**主要函數**:
- `initMap()` - 初始化地圖
- `centerOnUser()` - 定位到使用者

---

#### 🎯 `useViewState.ts`
**功能**: UI 狀態管理
- 管理視圖模式（地圖/列表）
- 管理當前日期索引
- 管理各種 Modal 開關狀態
- 管理標題與目的地的編輯狀態

**主要狀態**:
- `viewMode` - 視圖模式
- `currentDayIdx` - 當前日期索引
- `showSetupModal` - 設定 Modal
- `showTripMenu` - 旅程選單
- `isEditingTitle` - 編輯標題狀態

---

#### 🔍 `useRecommendations.ts`
**功能**: 地點推薦
- 搜尋附近推薦地點
- 應用推薦到行程中
- 管理搜尋狀態

**主要函數**:
- `searchNearby(item, idx, dayIdx)` - 搜尋附近地點
- `applyRecommendation(idx)` - 應用推薦

---

#### 🌡️ `useWeather.ts`
**功能**: 天氣資料取得
- 從 Open-Meteo API 取得天氣資料
- 格式化天氣顯示

---

#### 💱 `useRateDetection.ts`
**功能**: 匯率偵測
- 從 Exchangerate-API 取得匯率資料
- 根據貨幣代碼自動偵測匯率

---

### 2. Services（服務層）

#### 🔥 `firebase.ts`
**功能**: Firebase 初始化與連接管理
- 動態載入 Firebase SDK（從 CDN）
- 初始化 Firebase App 與 Firestore
- 提供連接狀態檢查
- Firebase 連接驗證工具

**主要函數**:
- `loadFirebaseApp()` - 載入 Firebase App 模組
- `loadFirebaseFirestore()` - 載入 Firestore 模組
- `getFirestoreModule()` - 取得 Firestore 模組
- `waitForDb()` - 等待資料庫連接
- `checkFirebaseReady()` - 檢查 Firebase 是否就緒
- `verifyFirebaseConnection()` - 驗證 Firebase 連接

---

#### ☁️ `cloudTripService.ts`
**功能**: Firestore CRUD 操作
- 上傳旅程主文件
- 上傳/刪除行程天數資料
- 上傳/刪除支出資料
- 同步旅程資料
- 根據邀請碼查詢旅程

**主要函數**:
- `uploadTripDocument()` - 上傳/更新旅程主文件
- `uploadDays()` - 上傳行程天數
- `uploadSharedExpenses()` - 上傳共同支出
- `deleteOldDays()` - 刪除舊的行程天數
- `deleteOldSharedExpenses()` - 刪除舊的共同支出
- `addExpenseToCloud()` - 新增支出到雲端
- `deleteExpenseFromCloud()` - 從雲端刪除支出
- `syncTripFromCloud()` - 同步旅程資料
- `findTripByInviteCode()` - 根據邀請碼查詢旅程

---

### 3. Utils（工具函數）

#### 📅 `date.ts`
**功能**: 日期格式化與處理
- `formatDate()` - 格式化日期字串
- `getTodayDateStr()` - 取得今天日期字串
- `getTimePeriod()` - 取得時段（上午/下午等）

---

#### 💵 `expense.ts`
**功能**: 支出相關計算
- `formatExpenseTime()` - 格式化支出時間
- `getExpenseSplitAmount()` - 計算每人分攤金額

---

#### 🗺️ `url.ts`
**功能**: URL 相關工具
- `getGoogleMapLink()` - 產生 Google Maps 連結

---

#### 💾 `storage.ts`
**功能**: localStorage 工具
- `getStorageKey()` - 產生儲存鍵值
- `saveToStorage()` - 儲存資料
- `loadFromStorage()` - 載入資料

---

#### 🆔 `id.ts`
**功能**: ID 生成
- `generateId()` - 生成唯一 ID

---

#### 🌤️ `weather.ts`
**功能**: 天氣相關工具
- `getWeatherIcon()` - 根據天氣代碼取得圖示

---

### 4. Constants（常數定義）

#### `constants/index.ts`
**功能**: 全域常數定義
- 預設分帳成員
- 預設匯率
- Firebase 設定
- 自動同步延遲時間

---

### 5. Types（型別定義）

#### `types/index.d.ts`
**功能**: TypeScript 型別定義
- `Day` - 行程天數型別
- `Expense` - 支出型別
- `Setup` - 設定型別
- `TripMeta` - 旅程元資料型別
- `FirebaseConfig` - Firebase 設定型別

---

## 🔄 核心功能流程

### 旅程建立流程
1. 使用者點擊「新增旅程」
2. `useTripManagement.createNewTrip()` 建立新旅程
3. 生成唯一旅程 ID
4. 初始化預設資料
5. `useLocalPersistence` 自動儲存到 localStorage

### 支出新增流程
1. 使用者輸入支出資訊
2. `useExpenses.addExpense()` 新增支出
3. 自動計算每人分攤金額
4. `useLocalPersistence` 自動儲存
5. 如果是雲端旅程，`useCloudExpenses` 自動上傳到 Firestore

### 雲端同步流程
1. 使用者點擊「上傳到雲端」
2. `useCloudSync.uploadToCloud()` 執行上傳
3. `cloudTripService.uploadTripDocument()` 上傳主文件
4. `cloudTripService.uploadDays()` 上傳行程資料
5. `cloudTripService.uploadSharedExpenses()` 上傳支出資料
6. 儲存雲端資訊到 localStorage
7. 設定即時監聽器（`useCloudExpenses`）

### 邀請碼載入流程
1. 使用者透過邀請連結進入
2. URL 中包含 `inviteCode` 參數
3. `useInviteCode.checkInviteCodeFromUrl()` 檢查參數
4. `cloudTripService.findTripByInviteCode()` 查詢旅程
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
  items: Item[];          // 行程項目
  flight: Flight | null;  // 航班資訊（可選）
}
```

### Expense（支出）
```typescript
{
  item: string;                    // 項目名稱
  amount: number;                  // 金額
  payer: string;                   // 付款人
  time: string;                    // 時間
  order: string;                   // 唯一識別碼
  splitParticipants: string[];     // 分攤對象
}
```

### Setup（設定）
```typescript
{
  title: string;        // 旅程標題
  destination: string;  // 目的地
  startDate: string;    // 開始日期
  days: number;         // 天數
  rate: number;         // 匯率
  currency: string;     // 貨幣代碼
  langCode: string;     // 語言代碼
  langName: string;     // 語言名稱
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

---

## 📝 注意事項

1. **本地儲存**: 所有資料預設儲存在 localStorage，支援多旅程管理
2. **雲端同步**: 需設定 Firebase 專案並開啟 Firestore
3. **匯率 API**: 使用 Exchangerate-API，可能需要 API Key
4. **天氣 API**: 使用 Open-Meteo，免費且無需 API Key
5. **地圖服務**: 使用 Leaflet，需連網才能顯示地圖

---

## 🎉 專案特色

- ✅ **純 Vue 3**: 採用 Composition API，程式碼結構清晰
- ✅ **TypeScript**: 完整的型別定義，提供更好的開發體驗
- ✅ **模組化設計**: 使用 Composables 將功能模組化，易於維護
- ✅ **雲端同步**: 支援 Firebase 即時同步，多人協作
- ✅ **本地優先**: 本地儲存優先，離線也可使用
- ✅ **響應式設計**: 使用 Tailwind CSS，支援各種螢幕尺寸

---

## 📄 授權

此專案為個人專案，僅供學習與參考使用。

