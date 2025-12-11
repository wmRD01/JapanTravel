<template src="./App.template.html"></template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { JP_EXPENSES, JP_TRIP_DATA, JP_TRIP_ID } from '../data/trip-data';
import { useCloudExpenses } from './composables/useCloudExpenses';
import { useCloudSync } from './composables/useCloudSync';
import { useExpenses } from './composables/useExpenses';
import { useInviteCode } from './composables/useInviteCode';
import { useLocalPersistence } from './composables/useLocalPersistence';
import { useMapView } from './composables/useMapView';
import { useRecommendations } from './composables/useRecommendations';
import { useTripManagement } from './composables/useTripManagement';
import { useViewState } from './composables/useViewState';
import { useWeatherRate } from './composables/useWeatherRate';
import { DEFAULT_EXCHANGE_RATE, DEFAULT_PARTICIPANTS, DEFAULT_PARTICIPANTS_STR } from './constants';
import type { Day, Expense, TripMeta } from './types';
import { formatDate } from './utils/date';
import { getExpenseSplitAmount } from './utils/expense';
import { getStorageKey } from './utils/storage';

// 基礎狀態
const days = ref<Day[]>([]);
const expenses = ref<Expense[]>([]);
const personalExpenses = ref<Expense[]>([]);
const isPersonalMode = ref(false);
const participants = ref<string[]>([...DEFAULT_PARTICIPANTS]);
const participantsStr = ref(DEFAULT_PARTICIPANTS_STR);
const exchangeRate = ref(DEFAULT_EXCHANGE_RATE);
const newExpense = ref({
    item: '',
    amount: '',
    payer: '我',
    time: '',
    splitParticipants: [] as string[]
});
const timeInputRefs = ref<Record<string, HTMLInputElement>>({});
const tripList = ref<TripMeta[]>([]);
const currentTripId = ref<string | null>(null);
const setup = ref({
    title: '旅遊計畫',
    destination: 'Tokyo',
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
    isEditingDestination,
    editingDestinationValue,
    destinationInputRef,
    startEditDestination,
    saveDestination,
    cancelEditDestination,
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

// 地圖與定位
const { isMapLoading, userLocation, initMap, centerOnUser } = useMapView(
    currentDay,
    viewMode,
    currentDayIdx,
    newExpense
);

// 推薦系統
const {
    recommendationsMap,
    isSearchingRecs,
    searchTargetIndex,
    searchNearby: searchNearbyRec,
    applyRecommendation,
} = useRecommendations();

// searchNearby 包裝
const searchNearby = (item: any, idx: number) => searchNearbyRec(item, idx, currentDayIdx.value);

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
        .map((s) => s.trim())
        .filter((s) => s);
    if (!isPersonalMode.value) {
        resetNewExpenseSplits();
    }
    if (currentTripId.value) {
        localStorage.setItem(getStorageKey(currentTripId.value, 'users'), participantsStr.value);
    }
};

const updateDate = (e: any, day: any) => {
    const val = e.target.value;
    if (!val) return;
    const formatted = formatDate(val);
    if (!formatted) return;
    Object.assign(day, formatted);
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
watch(cloudSyncComposable.isUploading, (val) => {
    isUploading.value = val;
}, { immediate: true });
watch(cloudSyncComposable.isSyncing, (val) => {
    isSyncing.value = val;
}, { immediate: true });
watch(inviteCodeComposable.inviteCode, (val) => {
    inviteCode.value = val;
}, { immediate: true });

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
    if (copyInviteLinkFn) {
        await copyInviteLinkFn();
    }
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
        destination: '',
        startDate: new Date().toISOString().split('T')[0],
        days: 5,
        rate: DEFAULT_EXCHANGE_RATE,
        currency: 'JPY',
        langCode: 'ja',
        langName: '日文',
        title: '旅遊計畫',
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
            ? tripList.value.find((t) => t.id === lastSelectedTripId)
            : null;
        if (lastSelectedTrip) {
            await switchTrip(lastSelectedTripId!);
        } else {
            const jpTrip = tripList.value.find((t) => t.id === JP_TRIP_ID);
            if (jpTrip) await switchTrip(JP_TRIP_ID);
            else await switchTrip(tripList.value[0].id);
        }
    } else {
        showSetupModal.value = true;
    }
});
</script>
