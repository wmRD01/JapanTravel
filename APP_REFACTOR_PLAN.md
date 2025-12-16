## GoJapen Vue 重構與最佳化建議

這份文件整理目前 `App.template.html` 的觀察結果，並提供「如何拆解元件」與「最佳化方向」的建議，未來可當成重構的路線圖使用。

---

## 一、元件拆解規劃

目前整個畫面幾乎集中在單一 template 中，建議先從「畫面區塊」切分，再視邏輯複雜度拆出 composable。

- **App Layout / 外層結構**
  - 職責：只負責最外層框架與 viewMode 切換，不處理細節。
  - 建議拆出：
    - `AppHeader`（標題、模式切換、日期 Tab）
    - `AppMain`（承載各個 View：Plan / Map / Money / Translate）
    - `TripSidebar`（旅程列表 & 雲端操作）

- **Header 區塊**
  - **AppHeader**
    - 顯示旅程標題、編輯標題 Modal。
    - 顯示 `viewMode` 切換按鈕（plan / map / money / translate）。
    - 顯示日期 / Day Tabs。
  - 可以將以下拆為子元件：
    - `TripTitle`（負責標題顯示與編輯邏輯）
    - `ViewModeToggle`
    - `DayTabs`

- **Plan 行程視圖**
  - 主元件：`PlanView`
    - 負責當日行程的整體呈現與操作。
  - 建議子元件：
    - `FlightCard`：當日航班卡片（出發 / 抵達時間、機場、+/-1 天選擇）。
    - `CountryDivider`：國家分隔區塊及其編輯 Modal。
    - `ScheduleItem`：單一行程項目（時間、類型、地點、備註、天氣、美食推薦）。
    - `NoteModal`：編輯備註的共用 Modal。
  - Modal 建議集中處理：
    - `EditTitleModal`
    - `EditNoteModal`
    - `EditCountryDividerModal`
  - 優點：每個元件模板長度變短、職責清楚，也利於單元測試。

- **Map / Money / Translate 視圖**
  - `MapView`
    - 負責地圖初始化、loading 狀態、目前 day 的地點計數與操作按鈕（重新 init / 定位使用者）。
  - `MoneyView`
    - 分帳與匯率邏輯較多，建議再拆：
      - `MoneySummaryCard`：總支出與匯率顯示。
      - `ParticipantsSection`：多人模式成員設定與各成員淨額。
      - `SettlementPlan`：結帳建議列表。
      - `ExpenseForm`：新增支出表單。
      - `ExpenseList`：當日支出列表。
  - `TranslateView`
    - 邏輯較單純，可視需要再拆：
      - `TranslateShortcutButtons`：各種 Google 翻譯捷徑。
      - `MyLanguageSettings`：國家與語言代碼設定。

- **側邊欄與初始設定**
  - `TripSidebar`
    - 顯示旅程列表、建立新旅程、載入模板、上傳/同步/分享、清除本地資料。
  - `SetupModal`
    - 初次建立旅程的設定流程。
  - `TemplatePreviewModal`
    - 顯示預設行程模板與預設支出。

---

## 二、Composition API / Composable 拆分建議

將「資料與邏輯」集中在 composable，可大幅減少單一元件的複雜度：

- **`useTrip()`**
  - 管理旅程列表、當前旅程 ID、建立/刪除/切換旅程。
  - 初始化旅程 (`initTrip`)、天數 `days` 與每天的 `items` 結構。

- **`useDayPlan()`**
  - 管理當前 day (`currentDayIdx`, `currentDay`) 的行程：
    - `addDay`, `removeCurrentDay`
    - `addItem`, `removeItem`, `moveItemUp`, `moveItemDown`
    - `showInsertCountryDividerModal`, `saveCountryDivider`, `removeCountryDivider`
  - 管理 note 編輯狀態暨內容。

- **`useWeather()`**
  - 集中天氣相關邏輯：
    - `reloadDayWeather`
    - `onItemRegionChange`, `clearItemRegion`
    - `isItemWeatherLoading`, `isDayWeatherLoading`
    - `itemWeatherDisplay`
  - 將 API 呼叫、錯誤處理、節流/防抖（如需）都放在這裡。

- **`useMoney()`**
  - 集中記帳與分帳邏輯：
    - `isPersonalMode`, `participants`, `participantsStr` 與 `updateParticipants`
    - `expenses`, `addExpense`, `removeExpense`
    - `paidByPerson`, `owedByPerson`, `settlementPlan`
    - 匯率 `exchangeRate`, `currencySymbol`, `currencyLabel`, `fetchRateByCurrency`
  - 將 `totalExpense`、`totalExpenseInNTD` 等金額計算做成 computed。

- **`useTranslate()`**
  - 管理翻譯捷徑所需的狀態與連結：
    - `myTranslateCountry`, `myTranslateLangCode`
    - `translateFromChToMy`, `translateFromMyToCh`

- **`useCloudSync()`**
  - 管理雲端相關：
    - `handleUploadToCloud`, `handleSyncFromCloud`, `handleShowInviteModal`
    - 雲端同步狀態：`isUploading`, `isSyncing`, `inviteCode`, `getTripCloudStatus`
  - 未來若切換後端（例如換 Firebase 封裝）時，只需動到這一處。

---

## 三、Template 效能與可讀性最佳化

### 1. 避免在 template 中重複計算

- 範例問題（概念）：
  - `currentDay.items.filter(i => i.location).length`
  - `itemWeatherDisplay(item, currentDay)` 同一個 item 被呼叫多次（判斷 / icon / 溫度 / 文案）。
  - `JP_EXPENSES.reduce((sum, e) => sum + e.amount, 0)`
  - 多處 `Math.round(totalExpense * exchangeRate).toLocaleString()`
- 建議做法：
  - 在 `computed` 或 composable 中先算好：
    - `locationCount`：目前 day 有幾個有 `location` 的 item。
    - `computedWeather = itemWeatherDisplay(item, currentDay)`：template 內只使用一次計算結果。
    - `jpExpensesTotal`、`totalExpenseNTD` 等。
  - 好處：
    - 減少不必要的重複計算，避免 render 期間多次執行相同邏輯。
    - 程式更易讀，方便以後維護與修改。

### 2. `v-for` 的 `key` 改用穩定 ID

- 目前許多地方使用 index：
  - `v-for="(day, index) in days" :key="index"`
  - `v-for="(item, idx) in currentDay.items" :key="idx"`
- 風險：
  - 插入 / 刪除項目時，Vue 會錯誤重用 DOM 元素，可能造成表單內容或動畫狀態錯亂。
- 建議：
  - 在資料結構中加入 `id` 欄位（例如以 `Date.now()` + random 或後端提供 id）。
  - 改為 `:key="day.id"`、`:key="item.id"`。
  - 對 `tripList` 已使用 `trip.id` 是好的示範，可比照辦理。

### 3. class 綁定與條件邏輯整理

- 現況：
  - 許多元素同時擁有很長的 `class="..."` 與 `:class="..."`，還包含條件運算子。
  - 例如國家區塊、天氣輸入框、按鈕 loading/disabled 狀態等。
- 建議：
  - 固定樣式用 `class`，狀態相關樣式抽成 computed 或 method：
    - `:class="countryDividerClass(idx)"`、`dayTabClass(index)` 等。
  - 把共用的按鈕樣式（primary / secondary / danger / ghost / loading）定義成一組 Tailwind utility 組合，方便重用。

### 4. 重複字串與 key 組合抽出

- 現況：
  - 像 `recommendationsMap[`${currentDayIdx}-${idx}`]` 這類 key 組合在 template 內重複出現。
- 建議：
  - 在 script/composable 中提供：
    - `getRecommendationKey(dayIdx, itemIdx)` 或在 item 結構上直接存 `recKey`。
  - template 只使用 `recommendationsMap[getRecommendationKey(currentDayIdx, idx)]` 或直接 `item.recKey`。

---

## 四、UX / 結構細節建議

- **避免巢狀互相包裹的互動元素**
  - 檢查是否有 `button` 包 `a` 或 `a` 包 `button` 的狀況，容易造成點擊/焦點行為不一致與 a11y 問題。
  - 建議：使用一種互動元素為主，另一種改為純區塊或使用 `role`/`@click` 輔助。

- **Loading / Disabled 狀態統一風格**
  - 目前已經有不少 `:disabled="isDayWeatherLoading"` 與 spinner 圖示，建議整理成共用樣式：
    - 例如：`btn`, `btn--primary`, `btn--loading` 這樣的 class 組合（Tailwind 可用 `@apply` 或抽出組件）。

- **色彩與樣式集中管理**
  - 現在有少量 inline style（例如 `style="background: #666666"`），建議全部改為 class，並在 Tailwind 設定或 CSS 中統一管理色碼。

---

## 五、重構執行順序建議

為避免一次改動太大難以驗證，建議分階段進行：

1. **安全性調整**
   - 把 `v-for` 的 `key` 全部改為穩定 ID。
   - 將 template 中最明顯且重複的計算移到 computed（例如天氣顯示與 totalExpense）。

2. **元件拆分（UI 為主）**
   - 先從視覺最獨立的區塊開始：`TripSidebar`、`TranslateView`、`MapView`。
   - 再拆 `PlanView`、`MoneyView` 等較複雜的部分。

3. **邏輯抽成 composable**
   - 將行程、天氣、分帳、翻譯、雲端等邏輯逐步搬進 `useXXX()` composable。
   - 元件中只保留 `props`、`emit` 與簡單的 UI 狀態。

4. **樣式與共用元件整理**
   - 統一按鈕、卡片、Modal 等 UI 元素的結構與樣式。
   - 把 icon + 文字的常見 pattern 抽成小元件（例如 `IconLabelRow`）。

---

## 六、後續可考慮的進階優化

- **TypeScript 導入**
  - 為 `Day`, `Item`, `Flight`, `Expense`, `Trip` 等資料結構定義型別。
  - 降低欄位拼字錯誤造成的 runtime bug。

- **單元測試與 e2e 測試**
  - 對關鍵邏輯（分帳計算、結帳建議、天氣資料 mapping、雲端同步）撰寫單元測試。
  - 使用 Cypress / Playwright 等工具驗證關鍵使用流程（新增旅程、切換 view、記帳與結帳）。

---

以上建議可視專案節奏分階段實作。若之後你決定先從某個區塊開始（例如 `PlanView` 或 `MoneyView`），可以再進一步細化該區塊對應的 refactor 任務清單。 


