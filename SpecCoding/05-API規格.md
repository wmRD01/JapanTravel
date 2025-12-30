# API 規格

## 1. Firebase Firestore API

### 1.1 上傳旅程主文件

**函數**: `uploadTripDocument()`

**參數**:

```typescript
{
    cloudTripId: string | null; // 雲端旅程 ID（更新時提供）
    setup: Setup; // 設定資料
    daysCount: number; // 天數
    participantsStr: string; // 分帳成員（逗號分隔）
    inviteCode: string; // 邀請碼
    isUpdate: boolean; // 是否為更新
}
```

**處理流程**:

1. 檢查 Firebase 連線
2. 如果是更新：使用 `setDoc` 更新現有文件
3. 如果是新建：使用 `addDoc` 建立新文件
4. 返回 trip ID

**錯誤處理**:

-   Firebase 連線失敗 → 拋出錯誤
-   缺少必要函數 → 拋出錯誤

---

### 1.2 上傳行程天數

**函數**: `uploadDays()`

**參數**:

```typescript
{
  cloudTripId: string;
  days: Day[];
}
```

**處理流程**:

1. 過濾 items 中的 weather 欄位
2. 清理 undefined 欄位
3. 對每個 day 使用 `addDoc` 新增到 `days` 子集合

**注意**:

-   不上傳 weather 資料
-   確保 region 欄位存在

---

### 1.3 上傳共同支出

**函數**: `uploadSharedExpenses()`

**參數**:

```typescript
{
  cloudTripId: string;
  expenses: Expense[];
  defaultParticipants: string[];
}
```

**處理流程**:

1. 確保每筆支出都有 order
2. 確保 splitParticipants 有值（無則使用預設成員）
3. 對每個 expense 使用 `addDoc` 新增到 `sharedExpenses` 子集合

---

### 1.4 新增單筆支出

**函數**: `addExpenseToCloud()`

**參數**:

```typescript
{
  cloudTripId: string;
  expense: Expense;
  defaultParticipants: string[];
}
```

**處理流程**:

1. 使用 `order` 作為文件 ID
2. 使用 `setDoc` 建立或更新文件
3. 確保 splitParticipants 有值

**特點**:

-   使用 `setDoc` 而非 `addDoc`（因為使用 order 作為 ID）
-   立即上傳，不等待批次同步

---

### 1.5 刪除支出

**函數**: `deleteExpenseFromCloud()`

**參數**:

```typescript
{
    cloudTripId: string;
    order: string;
}
```

**處理流程**:

1. 使用 `where('order', '==', order)` 查詢
2. 刪除找到的文件

---

### 1.6 刪除舊的行程天數

**函數**: `deleteOldDays()`

**參數**:

```typescript
{
    cloudTripId: string;
}
```

**處理流程**:

1. 取得所有 `days` 子集合文件
2. 使用 `writeBatch` 批次刪除

---

### 1.7 刪除舊的共同支出

**函數**: `deleteOldSharedExpenses()`

**參數**:

```typescript
{
    cloudTripId: string;
}
```

**處理流程**:

1. 取得所有 `sharedExpenses` 子集合文件
2. 使用 `writeBatch` 批次刪除

---

### 1.8 同步旅程資料

**函數**: `syncTripFromCloud()`

**參數**:

```typescript
{
    cloudTripId: string;
}
```

**返回值**:

```typescript
{
  tripData: any;        // 主文件資料
  days: Day[];          // 行程天數陣列
  expenses: Expense[];  // 支出陣列
}
```

**處理流程**:

1. 讀取主文件
2. 讀取 `days` 子集合，按 order 排序
3. 讀取 `sharedExpenses` 子集合
4. 轉換資料格式（Firestore → 本地）
5. 返回資料

---

### 1.9 根據邀請碼查詢旅程

**函數**: `findTripByInviteCode()`

**參數**:

```typescript
{
    inviteCode: string;
}
```

**返回值**:

```typescript
{
  tripId: string;
  tripData: any;
} | null
```

**處理流程**:

1. 使用 `where('inviteCode', '==', inviteCode)` 查詢
2. 返回第一個找到的旅程

---

## 2. 外部 API

### 2.1 Open-Meteo API（天氣）

**端點**: `https://api.open-meteo.com/v1/forecast`

**參數**:

```
latitude: number
longitude: number
daily: string[]  // ['temperature_2m_max', 'temperature_2m_min', 'weathercode']
timezone: string
```

**回應格式**:

```typescript
{
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weathercode: number[];
  }
}
```

**使用場景**: 查詢行程地點的天氣預報

---

### 2.2 Exchangerate-API（匯率）

**端點**: `https://api.exchangerate-api.com/v4/latest/{currencyCode}`

**參數**:

```
currencyCode: string  // 如 "JPY", "USD"
```

**回應格式**:

```typescript
{
    rates: {
        TWD: number; // 對台幣的匯率
        // ... 其他貨幣
    }
}
```

**使用場景**: 根據貨幣代碼自動偵測匯率

---

### 2.3 Geoapify API（地理編碼）

**端點**: `https://api.geoapify.com/v1/geocode/search`

**參數**:

```
text: string      // 地址或地點名稱
apiKey: string    // API Key
```

**回應格式**:

```typescript
{
  features: [{
    properties: {
      lat: number;
      lon: number;
      country_code: string;
      formatted: string;
    }
  }]
}
```

**使用場景**:

-   將地點名稱轉換為座標（用於地圖標記）
-   地點搜尋（未來功能）

---

### 2.4 Google Translate（翻譯連結）

**格式**: `https://translate.google.com/?sl={sourceLang}&tl={targetLang}&op=translate`

**參數**:

```
sl: string  // 來源語言代碼
tl: string  // 目標語言代碼
```

**使用場景**: 產生翻譯連結（不直接呼叫 API）

---

## 3. Composables API

### 3.1 useTripManagement

**主要函數**:

-   `loadTripList()`: 載入旅程列表
-   `createNewTrip()`: 建立新旅程
-   `switchTrip(id)`: 切換旅程
-   `deleteTrip(id)`: 刪除旅程
-   `loadTemplateAsNew()`: 載入模板

---

### 3.2 useExpenses

**主要函數**:

-   `addExpense()`: 新增支出
-   `removeExpense(idx)`: 刪除支出
-   `scheduleExpensesAutoSync()`: 排程自動同步

**計算屬性**:

-   `totalExpense`: 總支出
-   `paidByPerson`: 每人已付金額
-   `owedByPerson`: 每人應付金額
-   `settlementPlan`: 結算方案

---

### 3.3 useCloudSync

**主要函數**:

-   `uploadToCloud(silent?)`: 上傳到雲端
-   `syncFromCloud()`: 從雲端同步

**狀態**:

-   `isUploading`: 是否上傳中
-   `isSyncing`: 是否同步中

---

### 3.4 useCloudExpenses

**主要函數**:

-   `setupExpensesRealtimeListener()`: 設定即時監聽器
-   `unsubscribe()`: 取消監聽器

---

### 3.5 useDayPlan

**主要函數**:

-   `addDay()`: 新增天數
-   `removeCurrentDay()`: 刪除當前天數
-   `addItem()`: 新增項目
-   `removeItem(idx)`: 刪除項目
-   `moveItemUp(idx)`: 項目上移
-   `moveItemDown(idx)`: 項目下移
-   `saveCountryDivider()`: 儲存國家分隔
-   `saveNote()`: 儲存備註

---

## 4. 服務層 API

### 4.1 firebase.ts

**主要函數**:

-   `loadFirebaseApp()`: 載入 Firebase App
-   `loadFirebaseFirestore()`: 載入 Firestore
-   `getFirestoreModule()`: 取得 Firestore 模組
-   `waitForDb()`: 等待資料庫連線
-   `checkFirebaseReady()`: 檢查 Firebase 是否就緒
-   `verifyFirebaseConnection()`: 驗證連線

---

### 4.2 cloudTripService.ts

**主要函數**:

-   `checkCloudFirebaseReady()`: 檢查雲端 Firebase 是否就緒
-   `uploadTripDocument()`: 上傳旅程主文件
-   `uploadDays()`: 上傳行程天數
-   `uploadSharedExpenses()`: 上傳共同支出
-   `deleteOldDays()`: 刪除舊的行程天數
-   `deleteOldSharedExpenses()`: 刪除舊的共同支出
-   `addExpenseToCloud()`: 新增支出到雲端
-   `deleteExpenseFromCloud()`: 從雲端刪除支出
-   `addPersonalExpenseToCloud()`: 新增個人記帳
-   `deletePersonalExpenseFromCloud()`: 刪除個人記帳
-   `syncTripFromCloud()`: 同步旅程資料
-   `findTripByInviteCode()`: 根據邀請碼查詢

---

## 5. 工具函數 API

### 5.1 storage.ts

**函數**:

-   `getStorageKey(tripId, suffix)`: 產生儲存鍵值
-   `saveToStorage(tripId, suffix, data)`: 儲存資料
-   `loadFromStorage(tripId, suffix)`: 載入資料

---

### 5.2 date.ts

**函數**:

-   `formatDate(dateStr)`: 格式化日期
-   `getTodayDateStr()`: 取得今天日期字串
-   `getTimePeriod(time)`: 取得時段

---

### 5.3 expense.ts

**函數**:

-   `formatExpenseTime(time)`: 格式化支出時間
-   `getExpenseSplitAmount(expense, isPersonalMode, participants)`: 計算分攤金額

---

### 5.4 geoapify.ts

**函數**:

-   `geocodeText(text)`: 文字地理編碼
-   `searchPlaces(text, lat?, lon?)`: 搜尋地點

---

### 5.5 weather.ts

**函數**:

-   `getWeatherIcon(code)`: 根據天氣代碼取得圖示

---

### 5.6 id.ts

**函數**:

-   `generateId()`: 生成唯一 ID

---

## 6. API 錯誤處理

### 6.1 Firebase 錯誤

-   **連線失敗**: 顯示錯誤提示，使用本地資料
-   **權限錯誤**: 顯示錯誤提示，檢查安全規則
-   **資料錯誤**: 使用預設值或提示使用者

### 6.2 外部 API 錯誤

-   **網路錯誤**: 顯示錯誤提示，保留上次結果
-   **API 限制**: 顯示錯誤提示，建議稍後再試
-   **資料格式錯誤**: 使用預設值

### 6.3 本地操作錯誤

-   **localStorage 滿**: 提示使用者清理資料
-   **資料格式錯誤**: 使用預設值或提示使用者

---

## 7. API 使用限制

### 7.1 Firebase

-   **免費方案**:
    -   讀取: 50,000/天
    -   寫入: 20,000/天
    -   儲存: 1 GB

### 7.2 外部 API

-   **Open-Meteo**: 無限制（公開 API）
-   **Exchangerate-API**: 無限制（公開 API）
-   **Geoapify**: 需 API Key，有使用限制

---

## 8. API 最佳實踐

### 8.1 錯誤處理

-   所有 API 呼叫都應該有錯誤處理
-   顯示使用者友善的錯誤訊息
-   保留本地資料作為降級方案

### 8.2 效能優化

-   使用防抖處理（自動同步）
-   背景執行（不阻塞 UI）
-   快取結果（天氣、匯率）

### 8.3 安全性

-   API Key 不應該暴露在前端（目前 Geoapify Key 在前端，需改進）
-   使用 Firebase 安全規則保護資料
-   驗證輸入資料

---

## 9. API 測試（未來）

### 9.1 單元測試

-   測試工具函數
-   測試資料轉換

### 9.2 整合測試

-   測試 Firebase 操作
-   測試外部 API 呼叫

### 9.3 Mock 測試

-   Mock Firebase
-   Mock 外部 API


