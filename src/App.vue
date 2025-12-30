<template>
    <div id="app"
        class="flex flex-col min-h-screen max-w-md mx-auto w-full bg-white shadow-2xl relative sm:rounded-xl sm:my-4 sm:min-h-[95vh] sm:max-h-[95vh] sm:overflow-hidden sm:border-4 sm:border-slate-100">
        <!-- Header -->
        <AppHeader :title="setup.title" :view-mode="viewMode" :current-day-idx="currentDayIdx" :days="days"
            :is-cloud-trip="isCloudTrip" :invite-code="inviteCode" :get-day-key="getDayKey"
            @show-trip-menu="showTripMenu = true" @start-edit-title="startEditTitle" @copy-invite-code="copyInviteCode"
            @update:viewMode="viewMode = $event" @update:currentDayIdx="currentDayIdx = $event" @add-day="addDay" />

        <!-- 編輯標題 Modal -->
        <EditTitleModal :open="isEditingTitle" :editing-value="editingTitleValue"
            @update:editingValue="editingTitleValue = $event" @close="closeEditModal" @save="saveTitle" />

        <!-- 編輯備註 Modal -->
        <NoteEditModal :open="isEditingNote" :value="editingNoteValue" @update:value="editingNoteValue = $event"
            @close="closeEditNote" @save="saveNote" />

        <!-- 新增/插入國家分隔區塊模態框 -->
        <CountryDividerModal :open="isEditingCountryDivider || insertCountryDividerIndex >= 0"
            :is-editing="!!editingCountryDivider" :country-name="editingCountryName" :country-code="editingCountryCode"
            :show-insert-position="insertCountryDividerIndex >= 0" :items="currentDay.items"
            :selected-insert-index="insertCountryDividerIndex" :get-item-key="getItemKey"
            @update:countryName="editingCountryName = $event" @update:countryCode="editingCountryCode = $event"
            @select-insert-position="insertCountryDividerIndex = $event" @close="closeCountryDividerModal"
            @save="saveCountryDivider" />

        <!-- 初始設定視窗 / 建立新旅程 -->
        <div v-if="showSetupModal"
            class="fixed inset-0 bg-teal-800/90 backdrop-blur-sm z-[80] flex items-center justify-center p-6">
            <div class="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl relative">
                <div class="text-center mb-6">
                    <div class="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <i class="ph-duotone ph-airplane-tilt text-3xl text-teal-600"></i>
                    </div>
                    <h2 class="text-2xl font-bold text-slate-800">建立新旅程</h2>
                    <p class="text-sm text-slate-400">簡單幾步，開始規劃您的冒險！</p>
                </div>
                <div class="space-y-4">
                    <div>
                        <label class="block text-xs font-bold text-slate-400 mb-1 ml-1">旅遊標題</label>
                        <input v-model="setup.title" type="text" placeholder="例如: 日本東京自由行"
                            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:ring-2 focus:ring-teal-500 font-bold" />
                    </div>
                    <div class="grid grid-cols-3 gap-3">
                        <div class="col-span-2">
                            <label class="block text-xs font-bold text-slate-400 mb-1 ml-1">開始日期</label>
                            <input v-model="setup.startDate" type="date"
                                class="h-12 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 text-slate-700 focus:ring-2 focus:ring-teal-500 text-sm" />
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-400 mb-1 ml-1">天數</label>
                            <input v-model.number="setup.days" type="number" min="1" max="30"
                                class="h-12 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 text-slate-700 focus:ring-2 focus:ring-teal-500 text-center font-bold" />
                        </div>
                    </div>
                    <button @click="initTrip"
                        class="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 rounded-xl shadow-lg transform active:scale-95 transition flex items-center justify-center gap-2 mt-2">
                        開始規劃 <i class="ph-bold ph-arrow-right"></i>
                    </button>
                    <button v-if="tripList.length > 0" @click="showSetupModal = false"
                        class="w-full text-slate-400 text-xs py-2 hover:text-slate-600">
                        取消
                    </button>
                </div>
            </div>
        </div>

        <!-- Main Content -->
        <main class="flex-1 relative main-surface sm:overflow-y-auto sm:overflow-x-hidden min-h-0 hide-scrollbar">
            <!-- 行程表 (Plan View) -->
            <transition name="fade" mode="out-in">
                <!-- 美食推薦相關 props - 已移除前端功能，保留程式碼 -->
                <!-- :is-searching-recs="isSearchingRecs" -->
                <!-- :search-target-index="searchTargetIndex" -->
                <!-- :recommendations-map="recommendationsMap" -->
                <PlanView v-if="viewMode === 'plan'" :current-day="currentDay" :current-day-idx="currentDayIdx"
                    :is-day-weather-loading="isDayWeatherLoading" :is-item-weather-loading="isItemWeatherLoading"
                    :item-weather-display="(item) => itemWeatherDisplay(item, currentDay)"
                    :get-time-period="getTimePeriod" :get-google-map-link="getGoogleMapLink"
                    :get-dot-color="getDotColor" :get-item-key="getItemKey" @toggle-flight-card="toggleFlightCard"
                    @update:flight="(flight) => currentDay.flight = flight" @reload-day-weather="reloadDayWeather"
                    @show-insert-country-divider-modal="showInsertCountryDividerModal" @move-item-up="moveItemUp"
                    @move-item-down="moveItemDown" @start-edit-country-divider="startEditCountryDivider"
                    @remove-country-divider="removeCountryDivider"
                    @update:item="({ idx, field, value }) => { currentDay.items[idx][field] = value; }"
                    @start-edit-note="startEditNote"
                    @item-region-change="(item) => onItemRegionChange(item, currentDay)"
                    @clear-item-region="clearItemRegion" @remove-item="removeItem" @add-item="addItem"
                    @remove-current-day="removeCurrentDay" />
                <!-- 美食推薦相關事件 - 已移除前端功能，保留程式碼 -->
                <!-- @search-nearby="searchNearby" -->
                <!-- @apply-recommendation="applyRecommendation" -->
            </transition>

            <!-- 地圖視圖 -->
            <MapView v-if="viewMode === 'map'" :is-map-loading="isMapLoading" :location-count="currentDayLocationCount"
                @reload-map="initMap" @center-on-user="centerOnUser" />

            <!-- 分帳視圖 -->
            <MoneyView v-if="viewMode === 'money'" :is-personal-mode="isPersonalMode" :currency="setup.currency"
                :exchange-rate="exchangeRate" :currency-label="currencyLabel" :currency-symbol="currencySymbol"
                :total-expense="totalExpense" :total-expense-in-t-w-d="totalExpenseInTWD"
                :participants-str="participantsStr" :participants="participants" :paid-by-person="paidByPerson"
                :owed-by-person="owedByPerson" :settlement-plan="settlementPlan" :new-expense="newExpense"
                :current-expenses="currentExpenses" :get-settlement-key="getSettlementKey"
                :get-expense-key="getExpenseKey" @toggle-personal-mode="isPersonalMode = !isPersonalMode"
                @currency-change="fetchRateByCurrency"
                @update:exchangeRate="(value: number) => { exchangeRate = value; setup.rate = value; }"
                @update-participants="(value: string) => { participantsStr = value; updateParticipants(); }"
                @update:newExpense="newExpense = $event" @select-all-splits="selectAllSplits" @add-expense="addExpense"
                @remove-expense="removeExpense" />

            <!-- 翻譯功能 -->
            <TranslateView v-if="viewMode === 'translate'" :lang-code="setup.langCode" :lang-name="setup.langName" />
        </main>

        <!-- 側邊欄 (旅程選單) -->
        <TripSidebar :open="showTripMenu" :trip-list="tripList" :current-trip-id="currentTripId"
            :is-uploading="isUploading" :is-syncing="isSyncing" :get-trip-cloud-status="getTripCloudStatus"
            @close="showTripMenu = false" @create-trip="createNewTrip" @show-template="showTemplatePreview = true"
            @switch-trip="switchTrip" @upload="handleUploadToCloud" @sync="handleSyncFromCloud"
            @invite="handleShowInviteModal" @delete-trip="handleDeleteTrip" @clear-local="handleClearAllLocalStorage" />

        <!-- 預設行程模板預覽模態框 -->
        <div v-if="showTemplatePreview"
            class="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in">
            <div
                class="bg-white w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl relative flex flex-col overflow-hidden">
                <!-- 標題區 -->
                <div
                    class="bg-gradient-to-r from-pink-500 via-orange-500 to-yellow-500 p-6 text-white relative overflow-hidden">
                    <div class="absolute inset-0 opacity-20">
                        <div class="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -mr-32 -mt-32"></div>
                        <div class="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full -ml-24 -mb-24"></div>
                    </div>
                    <div class="relative z-10 flex justify-between items-start">
                        <div>
                            <h2 class="text-2xl font-bold mb-1 flex items-center gap-2">
                                <i class="ph-bold ph-sparkle"></i>
                                日本東京富士行程模板
                            </h2>
                            <p class="text-white/90 text-sm">{{ JP_TRIP_DATA.length }} 天精彩行程</p>
                        </div>
                        <button @click="showTemplatePreview = false"
                            class="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-1 transition">
                            <i class="ph-bold ph-x text-xl"></i>
                        </button>
                    </div>
                </div>

                <!-- 內容區（可滾動） -->
                <div class="flex-1 overflow-y-auto p-6 space-y-4 hide-scroll">
                    <!-- 行程概覽 -->
                    <div>
                        <h3 class="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <i class="ph-bold ph-calendar-check text-teal-600"></i>
                            行程概覽
                        </h3>
                        <div class="grid grid-cols-1 gap-3">
                            <div v-for="(day, idx) in JP_TRIP_DATA" :key="idx"
                                class="bg-gradient-to-r from-slate-50 to-white p-4 rounded-xl border border-slate-200 hover:border-teal-300 transition-all">
                                <div class="flex items-start justify-between mb-2">
                                    <div>
                                        <div class="font-bold text-slate-800">{{ day.date }}</div>
                                        <div class="text-sm text-teal-600 font-medium">{{ day.title }}</div>
                                    </div>
                                    <div class="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                                        {{ day.items.length }} 個活動
                                    </div>
                                </div>
                                <div class="text-xs text-slate-500 mt-2 line-clamp-2">
                                    {{day.items.slice(0, 2).map(i => i.activity).join(' • ')}}
                                    <span v-if="day.items.length > 2">...</span>
                                </div>
                                <div v-if="day.flight" class="mt-2 flex items-center gap-1 text-xs text-blue-600">
                                    <i class="ph-bold ph-airplane"></i>
                                    <span>{{ day.flight.type === 'arrival' ? '抵達' : '出發' }}航班</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 預設支出 -->
                    <div>
                        <h3 class="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <i class="ph-bold ph-currency-dollar text-green-600"></i>
                            預設支出項目
                        </h3>
                        <div class="bg-slate-50 rounded-xl p-4 space-y-2">
                            <div v-for="(exp, idx) in JP_EXPENSES" :key="idx"
                                class="flex justify-between items-center text-sm">
                                <span class="text-slate-700">{{ exp.item }}</span>
                                <span class="font-bold text-slate-800">¥{{ exp.amount.toLocaleString() }}</span>
                            </div>
                            <div
                                class="pt-2 border-t border-slate-200 mt-2 flex justify-between items-center font-bold">
                                <span class="text-slate-800">總計</span>
                                <span class="text-teal-600">
                                    ¥{{JP_EXPENSES.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 操作按鈕區 -->
                <div class="border-t border-slate-200 p-6 bg-slate-50 space-y-3">
                    <div class="flex gap-3">
                        <button @click="loadTemplateAsNew" :disabled="isLoadingTemplate"
                            class="flex-1 bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white font-bold py-3 rounded-xl shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2">
                            <i v-if="isLoadingTemplate" class="ph-bold ph-spinner animate-spin"></i>
                            <i v-else class="ph-bold ph-plus-circle"></i>
                            創建新行程
                        </button>
                        <button v-if="currentTripId" @click="loadTemplateToCurrent" :disabled="isLoadingTemplate"
                            class="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2">
                            <i v-if="isLoadingTemplate" class="ph-bold ph-spinner animate-spin"></i>
                            <i v-else class="ph-bold ph-arrow-down"></i>
                            載入到當前行程
                        </button>
                    </div>
                    <button @click="showTemplatePreview = false"
                        class="w-full text-slate-400 text-sm py-2 hover:text-slate-600 transition">
                        取消
                    </button>
                </div>
            </div>
            <div class="absolute inset-0 bg-black/50 backdrop-blur-sm -z-10" @click="showTemplatePreview = false"></div>
        </div>

        <!-- 邀請碼模態框 -->
        <InviteModal :open="showInviteModal" :invite-code="inviteCode" :invite-link="inviteLink"
            @close="showInviteModal = false" @copy-invite-code="copyInviteCode" @copy-invite-link="copyInviteLink" />

        <!-- 全局 Loading Overlay -->
        <LoadingOverlay :show="overlayShow" :title="loadingTitle" :message="loadingMessage" :icon="loadingIcon" />
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { JP_EXPENSES, JP_TRIP_DATA, JP_TRIP_ID } from '../data/trip-data';
import AppHeader from './components/layout/AppHeader.vue';
import CountryDividerModal from './components/modals/CountryDividerModal.vue';
import EditTitleModal from './components/modals/EditTitleModal.vue';
import InviteModal from './components/modals/InviteModal.vue';
import NoteEditModal from './components/modals/NoteEditModal.vue';
import MoneyView from './components/money/MoneyView.vue';
import MapView from './components/plan/MapView.vue';
import PlanView from './components/plan/PlanView.vue';
import TripSidebar from './components/sidebar/TripSidebar.vue';
import TranslateView from './components/translate/TranslateView.vue';
import LoadingOverlay from './components/ui/LoadingOverlay.vue';
import { useCloudExpenses } from './composables/useCloudExpenses';
import { useCloudSync } from './composables/useCloudSync';
import { useDayPlan } from './composables/useDayPlan';
import { useExpenses } from './composables/useExpenses';
import { useInviteCode } from './composables/useInviteCode';
import { useLocalPersistence } from './composables/useLocalPersistence';
import { useMapView } from './composables/useMapView';
import { useRecommendations } from './composables/useRecommendations';
import { useTranslate } from './composables/useTranslate';
import { useTripManagement } from './composables/useTripManagement';
import { useViewState } from './composables/useViewState';
import { useWeather } from './composables/useWeather';
import { useWeatherRate } from './composables/useWeatherRate';
import { DEFAULT_EXCHANGE_RATE, DEFAULT_PARTICIPANTS, DEFAULT_PARTICIPANTS_STR } from './constants/index';
import type { Day, DayItem, Expense, SettlementPlan, TripMeta } from './types/index';
import { formatDate } from './utils/date';
import { getExpenseSplitAmount } from './utils/expense';
import { getStorageKey } from './utils/storage';
import { getWeatherIcon } from './utils/weather';

// 基礎狀態
const days = ref<Day[]>([]);
const expenses = ref<Expense[]>([]);
const personalExpenses = ref<Expense[]>([]);
const isPersonalMode = ref(false);
const participants = ref<string[]>([...DEFAULT_PARTICIPANTS]);
const participantsStr = ref(DEFAULT_PARTICIPANTS_STR);
const exchangeRate = ref(DEFAULT_EXCHANGE_RATE);

// 天氣相關邏輯已移至 useWeather composable
const newExpense = ref({
    item: '',
    amount: '',
    payer: '我',
    time: '',
    splitParticipants: [] as string[]
});
const timeInputRefs = ref<Record<string, HTMLInputElement>>({});
// Note 和國家區塊編輯狀態已移至 useDayPlan composable
const tripList = ref<TripMeta[]>([]);
const currentTripId = ref<string | null>(null);
const setup = ref({
    title: '',
    startDate: new Date().toISOString().split('T')[0],
    days: 5,
    rate: 0.215,
    currency: 'JPY',
    langCode: 'ja',
    langName: '日文',
});
const isCloudTrip = ref(false);
const cloudTripId = ref<string | null>(null);
const inviteCode = ref('');
const isUploading = ref(false);
const isSyncing = ref(false);
const expensesSyncInProgress = ref(false);
const expensesSyncAbortFlag = ref(false);
const showInviteModal = ref(false);
let isLocalUpdate = false;
let expensesUnsubscribe: (() => void) | null = null;

// 臨時定義 detectRate、fetchWeather 和 saveTripList（稍後會被替換）
const detectRateRef = ref<() => Promise<void>>(async () => { });
const fetchWeatherRef = ref<(dest: string) => Promise<void>>(async () => { });
const saveTripListRef = ref<() => void>(() => { });

// UI 狀態（使用臨時的 detectRate、fetchWeather 和 saveTripList）
const {
    viewMode,
    currentDayIdx,
    showSetupModal,
    showTripMenu,
    showTemplatePreview,
    isLoadingTemplate,
    isEditingTitle,
    editingTitleValue,
    titleInputRef,
    titleTextRef,
    startEditTitle,
    saveTitle,
    cancelEditTitle,
    adjustTitleFontSize,
    closeEditModal,
} = useViewState(
    setup,
    currentTripId,
    tripList,
    () => saveTripListRef.value(),
    () => detectRateRef.value(),
    (dest: string) => fetchWeatherRef.value(dest)
);

// 計算屬性
const currentDay = computed<Day>(() =>
    days.value[currentDayIdx.value] || {
        date: '',
        shortDate: '',
        fullDate: '',
        title: '',
        items: [],
        flight: null,
    }
);

// 天氣與匯率
const {
    weather,
    weatherDisplay,
    fetchWeather,
    detectRate,
    isRateLoading,
    currencyLabel,
    currencySymbol,
} = useWeatherRate(setup, currentDay);

// 更新真實的 detectRate 和 fetchWeather
detectRateRef.value = detectRate;
fetchWeatherRef.value = fetchWeather;

// 匯率：依幣別自動抓取（用於分帳設定）
// 選擇幣別後：
// 1. 自動抓取「該幣別 → TWD」的匯率
// 2. 更新整個頁面的幣別顯示（currencyLabel / currencySymbol）
// 3. 僅更新匯率與顯示，不修改任何既有記帳金額
const fetchRateByCurrency = async (currencyCode: string) => {
    if (!currencyCode) return;

    // 先更新旅程的幣別設定，讓畫面上的符號與標籤立刻切換
    setup.value.currency = currencyCode;

    isRateLoading.value = true;
    try {
        if (currencyCode === 'TWD') {
            // 新台幣作為基準，不需要換算，1:1
            exchangeRate.value = 1;
            setup.value.rate = 1;
            return;
        }

        const rRes = await fetch(`https://api.exchangerate-api.com/v4/latest/${currencyCode}`);
        const rData = await rRes.json();
        const rateToTWD = rData && rData.rates && rData.rates.TWD;

        if (rateToTWD && typeof rateToTWD === 'number') {
            // 僅更新匯率，用於將目前金額換算成 TWD 顯示
            exchangeRate.value = rateToTWD;
            setup.value.rate = rateToTWD;
        } else {
            console.warn('找不到對 TWD 的匯率，保留原本匯率');
        }
    } catch (e) {
        console.error('匯率抓取失敗', e);
        // 失敗時保留原本的 exchangeRate，不動既有顯示
    } finally {
        isRateLoading.value = false;
    }
};

// 地圖與定位
const { isMapLoading, userLocation, initMap, centerOnUser } = useMapView(
    currentDay,
    viewMode,
    currentDayIdx,
    newExpense
);

// 推薦系統（Geoapify）- 已移除前端功能，保留程式碼
const {
    recommendationsMap,
    isSearchingRecs,
    searchTargetIndex,
    searchNearby: searchNearbyRec,
    applyRecommendation,
} = useRecommendations();

// const searchNearby = (item: any, idx: number) => searchNearbyRec(item, idx, currentDayIdx.value);

// 使用 useDayPlan composable
const dayPlan = useDayPlan(days, currentDayIdx);

// 從 dayPlan 獲取所有相關狀態和函數
const {
    isEditingNote,
    editingNoteValue,
    startEditNote,
    closeEditNote,
    saveNote,
    isEditingCountryDivider,
    editingCountryDivider,
    editingCountryName,
    editingCountryCode,
    insertCountryDividerIndex,
    addDay,
    removeCurrentDay,
    addItem,
    removeItem,
    moveItemUp,
    moveItemDown,
    showInsertCountryDividerModal,
    startEditCountryDivider,
    closeCountryDividerModal,
    saveCountryDivider,
    removeCountryDivider,
    toggleFlightCard,
    getTimePeriod,
    getGoogleMapLink,
    getDotColor,
    getItemKey,
} = dayPlan;

// 使用 useWeather composable
const {
    isItemWeatherLoading,
    isDayWeatherLoading,
    onItemRegionChange,
    clearItemRegion,
    loadDayItemsWeather,
    reloadDayWeather,
    itemWeatherDisplay,
} = useWeather(days, currentDayIdx, dayPlan.getCountryDividerAbove);

// 使用 useTranslate composable
const translate = useTranslate();

// Helper 函數
const resetNewExpenseSplits = () => {
    newExpense.value.splitParticipants = [...participants.value];
};

const selectAllSplits = () => {
    resetNewExpenseSplits();
};

const updateParticipants = () => {
    participants.value = participantsStr.value
        .split(',')
        .map((s: string) => s.trim())
        .filter((s: string) => s);
    if (!isPersonalMode.value) {
        resetNewExpenseSplits();
    }
    if (currentTripId.value) {
        localStorage.setItem(getStorageKey(currentTripId.value, 'users'), participantsStr.value);
    }
};

// v-for key / 重複計算最佳化 --------------------------------

// Day / DayItem / Expense / SettlementPlan 的穩定 key 生成
const getDayKey = (day: Day, index: number) => day.fullDate || day.date || `day-${index}`;

// getItemKey 已移至 useDayPlan composable

const getSettlementKey = (plan: SettlementPlan, idx: number) =>
    `${plan.from}-${plan.to}-${plan.amount}-${idx}`;

const getExpenseKey = (exp: Expense, idx: number) => exp.order || `exp-${idx}`;

// 金額相關重複運算抽成 computed
const totalExpenseInTWD = computed(() => Math.round(totalExpense.value * exchangeRate.value));

const jpExpensesTotal = computed(() =>
    JP_EXPENSES.reduce((sum, e) => sum + e.amount, 0)
);

// 當前天的地點數量（用於地圖視圖）
const currentDayLocationCount = computed(() =>
    currentDay.value.items.filter((i) => i.location).length
);

const updateDate = (e: any, day: any) => {
    const val = e.target.value;
    if (!val) return;
    const formatted = formatDate(val);
    if (!formatted) return;
    Object.assign(day, formatted);
};

// 編輯備註相關函數已移至 useDayPlan composable，使用 dayPlan 的函數

// toggleFlightCard 已移至 useDayPlan composable

// fetchDayWeather 已移至 useWeather composable，此處保留用於向後兼容（如果需要）

// 處理行程地區變更（已移至 useWeather composable，此處保留用於向後兼容）
const onDayRegionChange = async (day: Day) => {
    const location = day.region?.trim();
    if (location) {
        // 使用 useWeatherRate 的 fetchWeather
        await fetchWeather(location);
    } else {
        day.weather = undefined;
    }
};

// 清除行程地區
const clearDayRegion = (day: Day) => {
    day.region = undefined;
    day.weather = undefined;
};

// 取得行程天氣顯示資料
const dayWeatherDisplay = (day: Day) => {
    if (!day.weather) {
        return null;
    }

    // 優先使用天氣資料中儲存的地區，否則使用 day.region
    const location = day.weather.location || day.region?.trim() || '當地';

    // 如果有當日預報資料
    if (day.fullDate && day.weather.daily && day.weather.daily.time.length > 0) {
        const idx = day.weather.daily.time.indexOf(day.fullDate);
        if (idx !== -1) {
            const max = Math.round(day.weather.daily.temperature_2m_max[idx]);
            const min = Math.round(day.weather.daily.temperature_2m_min[idx]);
            return {
                temp: `${min}° - ${max}°`,
                icon: getWeatherIcon(day.weather.daily.weathercode[idx]),
                label: `${location} (預報)`,
                isForecast: true,
            };
        }
    }

    // 使用目前天氣
    return {
        temp: day.weather.temp !== null ? `${day.weather.temp}°` : '--',
        icon: day.weather.icon || 'ph-sun',
        label: `${location} (目前)`,
        isForecast: false,
    };
};

// 天氣相關函數已移至 useWeather composable

// 國家代碼轉換為國家名稱（簡化版）
const getCountryName = (countryCode: string): string => {
    const countryMap: Record<string, string> = {
        'JP': '日本',
        'TW': '台灣',
        'VN': '越南',
        'KR': '韓國',
        'CN': '中國',
        'US': '美國',
        'TH': '泰國',
        'SG': '新加坡',
        'MY': '馬來西亞',
        'ID': '印尼',
        'PH': '菲律賓',
        'HK': '香港',
        'MO': '澳門',
    };
    return countryMap[countryCode.toUpperCase()] || countryCode;
};

// 獲取國旗 emoji
const getCountryFlag = (countryCode: string | undefined): string => {
    if (!countryCode) return '🏳️';
    const code = countryCode.toUpperCase();
    // 使用 Unicode 區域指示符號生成國旗
    const flagMap: Record<string, string> = {
        'JP': '🇯🇵',
        'TW': '🇹🇼',
        'VN': '🇻🇳',
        'KR': '🇰🇷',
        'CN': '🇨🇳',
        'US': '🇺🇸',
        'TH': '🇹🇭',
        'SG': '🇸🇬',
        'MY': '🇲🇾',
        'ID': '🇮🇩',
        'PH': '🇵🇭',
        'HK': '🇭🇰',
        'MO': '🇲🇴',
    };
    return flagMap[code] || '🏳️';
};

// 國家區塊相關函數已從 dayPlan 解構獲取

// 天氣相關函數已移至 useWeather composable

// getDotColor 已移至 useDayPlan composable

const openTimePicker = (refKey: string) => {
    const timeInput = timeInputRefs.value[refKey];
    if (timeInput) {
        timeInput.click();
    }
};

const openTimePickerFromEvent = (event: Event) => {
    const container = (event.currentTarget as HTMLElement)?.closest('.relative');
    const timeInput = container?.querySelector('input[type="time"]') as HTMLInputElement;
    if (timeInput) {
        if (timeInput.showPicker) {
            timeInput.showPicker();
        } else {
            timeInput.click();
        }
    }
};

// addItem, removeItem 已移至 useDayPlan composable

// ========== 國家區塊相關功能 ==========

// 國家區塊相關函數已從 dayPlan 解構獲取

// moveItemUp, moveItemDown 已移至 useDayPlan composable

// 檢查是否需要插入國家區塊（自動插入邏輯）
const checkAndInsertCountryDivider = async (item: DayItem, itemIndex: number, day: Day, country: string, countryCode: string) => {
    // 檢查上方是否有相同國家的區塊
    const dividerAbove = dayPlan.getCountryDividerAbove(itemIndex, day);

    if (!dividerAbove || dividerAbove.countryCode !== countryCode) {
        // 如果沒有國家區塊或國家不同，自動插入
        dayPlan.insertCountryDivider(day, itemIndex, country, countryCode);
        return true; // 已插入
    }

    return false; // 不需要插入
};

// addDay, removeCurrentDay 已移至 useDayPlan composable

const getExpenseSplitAmountWrapper = (expense: any) => {
    return getExpenseSplitAmount(expense, isPersonalMode.value, participants.value);
};

// 初始化雲端相關（先創建臨時函數）
let setupExpensesRealtimeListener: (() => Promise<void>) | null = null;
let syncFromCloudFn: (() => Promise<void>) | null = null;
let uploadToCloudFn: ((silent?: boolean) => Promise<void>) | null = null;
let generateInviteCodeFn: (() => string) | null = null;
let copyInviteLinkFn: (() => Promise<void>) | null = null;
let copyInviteCodeFn: (() => Promise<void>) | null = null;
let checkInviteCodeFromUrlFn: (() => Promise<void>) | null = null;
let inviteLinkComputed: any = null;

// 臨時 syncFromCloud 函數（稍後會被替換）
const tempSyncFromCloud = async () => {
    if (syncFromCloudFn) {
        await syncFromCloudFn();
    }
};

// useCloudExpenses
const cloudExpensesComposable = useCloudExpenses(
    cloudTripId,
    expenses,
    participants,
    currentTripId,
    (value: boolean) => {
        isLocalUpdate = value;
    },
    () => isLocalUpdate
);
setupExpensesRealtimeListener = cloudExpensesComposable.setupExpensesRealtimeListener;
expensesUnsubscribe = cloudExpensesComposable.unsubscribe;

// useTripManagement（使用臨時 syncFromCloud）
const {
    loadTripList,
    saveTripList,
    isLoadingTrip,
    createNewTrip,
    initTrip,
    deleteTrip,
    switchTrip,
    loadTemplateAsNew,
    loadTemplateToCurrent,
} = useTripManagement(
    days,
    expenses,
    personalExpenses,
    setup,
    participantsStr,
    exchangeRate,
    currentTripId,
    cloudTripId,
    inviteCode,
    isCloudTrip,
    isPersonalMode,
    showSetupModal,
    showTripMenu,
    showTemplatePreview,
    isLoadingTemplate,
    tripList,
    updateParticipants,
    resetNewExpenseSplits,
    fetchWeather,
    tempSyncFromCloud,
    setupExpensesRealtimeListener || (async () => { }),
    currentDayIdx,
    JP_TRIP_ID,
    JP_TRIP_DATA,
    JP_EXPENSES
);

// Loading Overlay 的動態內容
// 規則：
// - 讀取旅程 / 上傳雲端 / 從雲端同步 時顯示 Loading
// - 但在「分帳視圖」(viewMode === 'money') 下，不顯示 Loading
const overlayShow = computed(
    () =>
        viewMode.value !== 'money' &&
        (isUploading.value || isSyncing.value || isLoadingTrip.value)
);
const loadingTitle = computed(() => {
    if (isUploading.value) return '上傳資料中';
    if (isSyncing.value || isLoadingTrip.value) return '資料同步中';
    return '處理中';
});
const loadingMessage = computed(() => {
    if (isUploading.value) return '正在將旅程資料上傳到雲端，請稍候...';
    if (isSyncing.value || isLoadingTrip.value) return '正在同步旅程資料，請稍候...';
    return '請稍候...';
});
const loadingIcon = computed(() => {
    if (isUploading.value) return 'ph-bold ph-cloud-arrow-up text-xl animate-bounce';
    if (isSyncing.value || isLoadingTrip.value) return 'ph-bold ph-arrows-clockwise text-xl animate-spin';
    return 'ph-bold ph-spinner text-xl animate-spin';
});

// 更新 saveTripListRef
saveTripListRef.value = saveTripList;

// useInviteCode（需要 switchTrip）
const inviteCodeComposable = useInviteCode(cloudTripId, currentTripId, tripList, switchTrip);
generateInviteCodeFn = inviteCodeComposable.generateInviteCode;
copyInviteLinkFn = inviteCodeComposable.copyInviteLink;
copyInviteCodeFn = inviteCodeComposable.copyInviteCode;
// 創建包裝函數來調用 checkInviteCodeFromUrl
checkInviteCodeFromUrlFn = async () => {
    await inviteCodeComposable.checkInviteCodeFromUrl(
        setup,
        days,
        expenses,
        participantsStr,
        exchangeRate,
        updateParticipants,
        saveTripList,
        DEFAULT_PARTICIPANTS_STR,
        DEFAULT_EXCHANGE_RATE
    );
};
inviteLinkComputed = inviteCodeComposable.inviteLink;

// useCloudSync
const cloudSyncComposable = useCloudSync(
    cloudTripId,
    inviteCodeComposable.inviteCode,
    isCloudTrip,
    currentTripId,
    days,
    expenses,
    setup,
    participants,
    participantsStr,
    exchangeRate,
    tripList,
    generateInviteCodeFn || (() => ''),
    (value: boolean) => {
        isLocalUpdate = value;
    },
    setupExpensesRealtimeListener || (async () => { }),
    copyInviteLinkFn || (async () => { }),
    updateParticipants,
    saveTripList,
    expensesSyncAbortFlag,
    DEFAULT_PARTICIPANTS_STR
);
syncFromCloudFn = cloudSyncComposable.syncFromCloud;
uploadToCloudFn = cloudSyncComposable.uploadToCloud;

// 更新狀態同步
watch(cloudSyncComposable.isUploading, (val: boolean) => {
    isUploading.value = val;
}, { immediate: true });
watch(cloudSyncComposable.isSyncing, (val: boolean) => {
    isSyncing.value = val;
}, { immediate: true });
watch(inviteCodeComposable.inviteCode, (val: string) => {
    inviteCode.value = val;
}, { immediate: true });

// 監聽日期與天數變化，自動載入當日所有旅程項目的天氣（初始也觸發）
watch(
    [() => days.value, () => currentDayIdx.value],
    async ([allDays, idx]) => {
        if (idx >= 0 && allDays[idx]) {
            await loadDayItemsWeather(allDays[idx]);
        }
    },
    { immediate: true }
);

// 創建包裝函數以匹配 useExpenses 的期望
const handleUploadToCloudForExpenses = async (tripId: string, silent: boolean) => {
    if (currentTripId.value !== tripId) {
        await switchTrip(tripId);
        await new Promise((resolve) => setTimeout(resolve, 300));
    }
    if (uploadToCloudFn) {
        await uploadToCloudFn(silent);
    }
};

// useExpenses
const {
    addExpense,
    removeExpense,
    scheduleExpensesAutoSync,
    totalExpense,
    paidByPerson,
    owedByPerson,
    settlementPlan,
    currentExpenses,
} = useExpenses(
    expenses,
    personalExpenses,
    isPersonalMode,
    participants,
    currentTripId,
    cloudTripId,
    isCloudTrip,
    newExpense,
    resetNewExpenseSplits,
    (value: boolean) => {
        isLocalUpdate = value;
    },
    handleUploadToCloudForExpenses,
    expensesSyncInProgress,
    expensesSyncAbortFlag
);

// useLocalPersistence
useLocalPersistence(
    days,
    expenses,
    personalExpenses,
    exchangeRate,
    participantsStr,
    isPersonalMode,
    currentTripId,
    resetNewExpenseSplits
);

// 雲端 UI 功能
const getTripCloudStatus = (tripId: string) => {
    const cloudData = localStorage.getItem(`${tripId}_cloud`);
    if (!cloudData) return false;
    try {
        const cloud = JSON.parse(cloudData);
        return cloud.isCloudTrip === true && cloud.cloudTripId;
    } catch {
        return false;
    }
};

const handleUploadToCloud = async (tripId: string, silent = false) => {
    // 如果當前不是這個旅程，先切換過去
    if (currentTripId.value !== tripId) {
        await switchTrip(tripId);
        // 等待一下讓資料載入
        await new Promise((resolve) => setTimeout(resolve, 300));
    }

    if (uploadToCloudFn) {
        await uploadToCloudFn(silent);
    }
};

const handleSyncFromCloud = async (tripId: string) => {
    // 如果當前不是這個旅程，先切換過去
    if (currentTripId.value !== tripId) {
        await switchTrip(tripId);
        // 等待一下讓資料載入
        await new Promise((resolve) => setTimeout(resolve, 300));
    }

    if (syncFromCloudFn) {
        await syncFromCloudFn();
    } else {
        // 回退到舊的實現
        await syncFromCloud();
    }
};

const handleShowInviteModal = async (tripId: string) => {
    if (currentTripId.value !== tripId) {
        await switchTrip(tripId);
        await new Promise((resolve) => setTimeout(resolve, 300));
    }
    showInviteModal.value = true;
};

const handleDeleteTrip = (tripId: string) => {
    deleteTrip(tripId);
};

const handleClearAllLocalStorage = () => {
    if (!confirm('確定要清除所有本地端資料嗎？\n\n注意：\n- 將清除所有旅程的本地端資料（包括旅程列表）\n- 雲端旅程可以透過邀請碼重新載入\n- 此操作無法復原')) {
        return;
    }
    localStorage.clear();
    tripList.value = [];
    currentTripId.value = null;
    days.value = [];
    expenses.value = [];
    personalExpenses.value = [];
    participants.value = [...DEFAULT_PARTICIPANTS];
    participantsStr.value = DEFAULT_PARTICIPANTS_STR;
    exchangeRate.value = DEFAULT_EXCHANGE_RATE;
    isCloudTrip.value = false;
    cloudTripId.value = null;
    inviteCode.value = '';
    setup.value = {
        title: '旅遊計畫',
        startDate: new Date().toISOString().split('T')[0],
        days: 5,
        rate: DEFAULT_EXCHANGE_RATE,
        currency: 'JPY',
        langCode: 'ja',
        langName: '日文',
    };
    showTripMenu.value = false;
    showSetupModal.value = true;
    alert('所有本地端資料已完全清除！');
};

const uploadToCloud = uploadToCloudFn || (async () => { });
const syncFromCloud = syncFromCloudFn || (async () => { });
const copyInviteLink = copyInviteLinkFn || (async () => { });
const copyInviteCode = copyInviteCodeFn || (async () => { });
const inviteLink = inviteLinkComputed;

// 初始化（使用 onMounted）
onMounted(async () => {
    loadTripList();
    if (checkInviteCodeFromUrlFn) {
        await checkInviteCodeFromUrlFn();
    }
    if (tripList.value.length > 0) {
        const lastSelectedTripId = localStorage.getItem('last_selected_trip_id');
        const lastSelectedTrip = lastSelectedTripId
            ? tripList.value.find((t: TripMeta) => t.id === lastSelectedTripId)
            : null;
        if (lastSelectedTrip) {
            await switchTrip(lastSelectedTripId!);
        } else {
            const jpTrip = tripList.value.find((t: TripMeta) => t.id === JP_TRIP_ID);
            if (jpTrip) await switchTrip(JP_TRIP_ID);
            else await switchTrip(tripList.value[0].id);
        }
    } else {
        showSetupModal.value = true;
    }
});
</script>

<style scoped>
.hide-scrollbar {
    -ms-overflow-style: none;
    /* IE & Edge */
    scrollbar-width: none;
    /* Firefox */
}

.hide-scrollbar::-webkit-scrollbar {
    display: none;
    /* Chrome, Safari */
}
</style>
