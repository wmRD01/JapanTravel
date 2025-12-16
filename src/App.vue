<template src="./App.template.html"></template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { JP_EXPENSES, JP_TRIP_DATA, JP_TRIP_ID } from '../data/trip-data';
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
import PlanView from './components/PlanView.vue';
import MoneyView from './components/MoneyView.vue';
import TranslateView from './components/TranslateView.vue';
import TripSidebar from './components/TripSidebar.vue';

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
const isEditingNote = ref(false);
const editingNoteValue = ref('');
const editingNoteTarget = ref<DayItem | null>(null);

// 國家區塊編輯/插入狀態
const isEditingCountryDivider = ref(false);
const editingCountryDivider = ref<DayItem | null>(null);
const editingCountryName = ref('');
const editingCountryCode = ref('');
const insertCountryDividerIndex = ref(-1); // 插入位置索引
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
const fetchRateByCurrency = async (currencyCode: string) => {
    if (!currencyCode) return;
    isRateLoading.value = true;
    try {
        if (currencyCode === 'TWD') {
            setup.value.rate = 1;
            return;
        }
        const rRes = await fetch(`https://api.exchangerate-api.com/v4/latest/${currencyCode}`);
        const rData = await rRes.json();
        if (rData && rData.rates && rData.rates.TWD) {
            setup.value.rate = rData.rates.TWD;
        }
    } catch (e) {
        console.error('匯率抓取失敗', e);
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

// 推薦系統（Geoapify）
const {
    recommendationsMap,
    isSearchingRecs,
    searchTargetIndex,
    searchNearby: searchNearbyRec,
    applyRecommendation,
} = useRecommendations();

const searchNearby = (item: any, idx: number) => searchNearbyRec(item, idx, currentDayIdx.value);

// 使用 useDayPlan composable
const dayPlan = useDayPlan(days, currentDayIdx);

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

const getItemKey = (item: DayItem, idx: number) =>
    `${item.time || 'no-time'}-${item.activity || 'item'}-${idx}`;

const getSettlementKey = (plan: SettlementPlan, idx: number) =>
    `${plan.from}-${plan.to}-${plan.amount}-${idx}`;

const getExpenseKey = (exp: Expense, idx: number) => exp.order || `exp-${idx}`;

// 金額相關重複運算抽成 computed
const totalExpenseInTWD = computed(() => Math.round(totalExpense.value * exchangeRate.value));

const jpExpensesTotal = computed(() =>
    JP_EXPENSES.reduce((sum, e) => sum + e.amount, 0)
);

const updateDate = (e: any, day: any) => {
    const val = e.target.value;
    if (!val) return;
    const formatted = formatDate(val);
    if (!formatted) return;
    Object.assign(day, formatted);
};

// 編輯備註
const startEditNote = (item: DayItem) => {
    editingNoteTarget.value = item;
    editingNoteValue.value = item.note || '';
    isEditingNote.value = true;
};

const closeEditNote = () => {
    isEditingNote.value = false;
    editingNoteTarget.value = null;
    editingNoteValue.value = '';
};

const saveNote = () => {
    if (editingNoteTarget.value) {
        editingNoteTarget.value.note = editingNoteValue.value?.trim() || '';
    }
    closeEditNote();
};

const toggleFlightCard = () => {
    if (currentDay.value.flight) {
        if (confirm('移除航班?')) currentDay.value.flight = null;
    } else {
        currentDay.value.flight = {
            type: 'arrival',
            startTime: '10:00',
            startAirport: 'TPE',
            number: 'FLIGHT',
            endTime: '14:00',
            endAirport: 'DEST',
            arrivalOffset: 0,
        };
    }
};

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

// 國家區塊相關函數已移至 useDayPlan composable，使用 dayPlan 的函數
const showInsertCountryDividerModal = dayPlan.showInsertCountryDividerModal;
const startEditCountryDivider = dayPlan.startEditCountryDivider;
const closeCountryDividerModal = dayPlan.closeCountryDividerModal;
const saveCountryDivider = dayPlan.saveCountryDivider;

// 天氣相關函數已移至 useWeather composable

const getDotColor = (t: string) =>
    t === 'food'
        ? 'bg-orange-400'
        : t === 'shop'
            ? 'bg-pink-400'
            : t === 'flight'
                ? 'bg-blue-500'
                : 'bg-teal-500';

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

const addItem = () => {
    currentDay.value.items.push({
        time: '',
        type: 'spot',
        activity: '',
        location: '',
        note: '',
    });
};

const removeItem = (idx: number) => {
    currentDay.value.items.splice(idx, 1);
};

// ========== 國家區塊相關功能 ==========

// 國家區塊相關函數已移至 useDayPlan composable

// 刪除國家區塊已移至 useDayPlan composable
const removeCountryDivider = dayPlan.removeCountryDivider;

// 移動項目（上移）
const moveItemUp = (idx: number) => {
    if (idx <= 0) return; // 已經是最上面，無法上移
    const items = currentDay.value.items;
    // 交換位置
    [items[idx - 1], items[idx]] = [items[idx], items[idx - 1]];
};

// 移動項目（下移）
const moveItemDown = (idx: number) => {
    const items = currentDay.value.items;
    if (idx >= items.length - 1) return; // 已經是最下面，無法下移
    // 交換位置
    [items[idx], items[idx + 1]] = [items[idx + 1], items[idx]];
};

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

const addDay = () => {
    days.value.push({
        date: `Day ${days.value.length + 1}`,
        shortDate: '',
        fullDate: '',
        title: '',
        items: [],
        flight: null,
    });
};

const removeCurrentDay = () => {
    if (days.value.length > 1 && confirm('刪除?')) {
        days.value.splice(currentDayIdx.value, 1);
    }
};

const getExpenseSplitAmountWrapper = (expense: any) => {
    return getExpenseSplitAmount(expense, isPersonalMode.value, participants.value);
};

// 工具函數：暴露給模板使用
const getTimePeriod = (t: string): string => {
    if (!t) return '';
    const h = parseInt(t.split(':')[0]);
    return h < 5 ? '凌晨' : h < 11 ? '上午' : h < 14 ? '中午' : h < 18 ? '下午' : '晚上';
};

const getGoogleMapLink = (loc: string): string =>
    loc ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc)}` : '#';

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
    alert('同步完成！');
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
