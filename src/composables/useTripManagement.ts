/**
 * 旅程管理 Composable
 * 處理旅程的建立、刪除、切換和模板載入
 */
import { ref, type Ref } from 'vue';
import { DEFAULT_EXCHANGE_RATE, DEFAULT_PARTICIPANTS_STR, WEEKDAY_ZH } from '../constants/index';
import type { Day, Expense, Setup, TripMeta } from '../types/index';
import { formatDate, getTodayDateStr } from '../utils/date';
import { generateId } from '../utils/id';
import { getStorageKey, loadFromStorage, saveToStorage } from '../utils/storage';

/**
 * 旅程管理功能
 */
export function useTripManagement(
    days: Ref<Day[]>,
    expenses: Ref<Expense[]>,
    personalExpenses: Ref<Expense[]>,
    setup: Ref<Setup>,
    participantsStr: Ref<string>,
    exchangeRate: Ref<number>,
    currentTripId: Ref<string | null>,
    cloudTripId: Ref<string | null>,
    inviteCode: Ref<string>,
    isCloudTrip: Ref<boolean>,
    isPersonalMode: Ref<boolean>,
    showSetupModal: Ref<boolean>,
    showTripMenu: Ref<boolean>,
    showTemplatePreview: Ref<boolean>,
    isLoadingTemplate: Ref<boolean>,
    tripList: Ref<TripMeta[]>,
    updateParticipants: () => void,
    resetNewExpenseSplits: () => void,
    fetchWeather: (destination: string) => Promise<void>,
    syncFromCloud: () => Promise<void>,
    setupExpensesRealtimeListener: () => Promise<void>,
    currentDayIdx: Ref<number>,
    JP_TRIP_ID: string,
    JP_TRIP_DATA: Day[],
    JP_EXPENSES: Expense[]
) {
    // 讀取旅程的載入狀態（用於 Loading 畫面）
    const isLoadingTrip = ref(false);
    /**
     * 載入旅程列表
     */
    const loadTripList = () => {
        // 從 localStorage 載入旅程清單，並加上防呆避免 JSON 解析失敗造成整個初始化中斷
        const raw = localStorage.getItem('travel_app_index');
        if (raw) {
            try {
                const parsed = JSON.parse(raw);
                tripList.value = Array.isArray(parsed) ? parsed : [];
            } catch (e) {
                console.error('讀取 travel_app_index 失敗，已重置為空陣列:', e);
                tripList.value = [];
            }
        } else {
            tripList.value = [];
        }

        // 自動載入日本預設行程 (如果尚未存在)
        const hasDefault = tripList.value.find((t) => t.id === JP_TRIP_ID);
        if (!hasDefault && tripList.value.length === 0) {
            const defaultTrip: TripMeta = {
                id: JP_TRIP_ID,
                destination: '日本東京富士山',
                startDate: '2025-02-17',
                daysCount: 7,
            };
            tripList.value.push(defaultTrip);
            saveToStorage(JP_TRIP_ID, 'days', JP_TRIP_DATA);
            saveToStorage(JP_TRIP_ID, 'exp', JP_EXPENSES);
            localStorage.setItem(getStorageKey(JP_TRIP_ID, 'users'), DEFAULT_PARTICIPANTS_STR);
            localStorage.setItem(getStorageKey(JP_TRIP_ID, 'rate'), String(DEFAULT_EXCHANGE_RATE));
            saveToStorage(JP_TRIP_ID, 'config', {
                title: '日本東京富士山',
                destination: 'Japan',
                startDate: '2025-02-17',
                days: 7,
                rate: DEFAULT_EXCHANGE_RATE,
                currency: 'JPY',
                langCode: 'ja',
                langName: '日文',
            });
            saveTripList();
        }
    };

    /**
     * 儲存旅程列表
     */
    const saveTripList = () => {
        localStorage.setItem('travel_app_index', JSON.stringify(tripList.value));
    };

    /**
     * 建立新旅程（打開設定視窗）
     */
    const createNewTrip = () => {
        setup.value = {
            title: '',
            startDate: getTodayDateStr(),
            days: 5,
            rate: DEFAULT_EXCHANGE_RATE,
            currency: 'JPY',
            langCode: 'ja',
            langName: '日文',
        };
        showSetupModal.value = true;
        showTripMenu.value = false;
    };

    /**
     * 初始化旅程（建立新旅程並保存）
     */
    const initTrip = () => {
        // 如果沒有輸入標題，給預設名稱
        if (!setup.value.title || !setup.value.title.trim()) {
            setup.value.title = '未命名旅程';
        }
        const newId = generateId();
        const newTripMeta: TripMeta = {
            id: newId,
            destination: setup.value.title, // 兼容列表顯示，不再代表國家/天氣
            startDate: setup.value.startDate,
            daysCount: setup.value.days,
        };

        const newDays: Day[] = [];
        const start = new Date(setup.value.startDate);
        for (let i = 0; i < setup.value.days; i++) {
            const curr = new Date(start);
            curr.setDate(start.getDate() + i);
            const yyyy = curr.getFullYear();
            const mm = String(curr.getMonth() + 1).padStart(2, '0');
            const dd = String(curr.getDate()).padStart(2, '0');
            const fullDate = `${yyyy}-${mm}-${dd}`;
            const formatted = formatDate(fullDate);

            newDays.push({
                date: (formatted && formatted.date) || `${mm}/${dd} (${WEEKDAY_ZH[curr.getDay()]})`,
                shortDate: (formatted && formatted.shortDate) || `${mm}/${dd}`,
                fullDate: fullDate,
                title: i === 0 ? '抵達 & 探索' : '行程規劃',
                items: [],
                flight: null,
            });
        }

        saveToStorage(newId, 'days', newDays);
        saveToStorage(newId, 'exp', []);
        localStorage.setItem(getStorageKey(newId, 'users'), DEFAULT_PARTICIPANTS_STR);
        localStorage.setItem(getStorageKey(newId, 'rate'), setup.value.rate.toString());
        saveToStorage(newId, 'config', setup.value);

        tripList.value.unshift(newTripMeta);
        saveTripList();

        switchTrip(newId);
        showSetupModal.value = false;
    };

    /**
     * 刪除旅程
     */
    const deleteTrip = (id: string) => {
        if (!confirm('確定刪除此行程？無法復原。')) return;
        tripList.value = tripList.value.filter((t) => t.id !== id);
        saveTripList();

        // 清除所有相關的 localStorage 資料
        ['days', 'exp', 'personal_exp', 'users', 'rate', 'config', 'cloud', 'synced'].forEach(
            (suffix) => {
                localStorage.removeItem(getStorageKey(id, suffix));
            }
        );

        if (currentTripId.value === id) {
            if (tripList.value.length > 0) switchTrip(tripList.value[0].id);
            else {
                days.value = [];
                expenses.value = [];
                personalExpenses.value = [];
                currentTripId.value = null;
                showSetupModal.value = true;
            }
        }
    };

    /**
     * 切換旅程
     */
    const switchTrip = async (id: string) => {
        isLoadingTrip.value = true;
        try {
            currentTripId.value = id;
            // 保存當前選擇的旅程 ID 到 localStorage
            localStorage.setItem('last_selected_trip_id', id);
            showTripMenu.value = false;
            // 重置到第一天
            currentDayIdx.value = 0;

            // 載入本地資料
            days.value = loadFromStorage<Day[]>(id, 'days', []) || [];
            expenses.value = loadFromStorage<Expense[]>(id, 'exp', []) || [];
            personalExpenses.value = loadFromStorage<Expense[]>(id, 'personal_exp', []) || [];

            // 安全防呆：如果是預設日本行程，但本地 days 為空，重新寫入預設資料
            if (id === JP_TRIP_ID && (!days.value || days.value.length === 0)) {
                console.warn('偵測到預設日本行程資料遺失，重新載入內建行程資料。');
                days.value = [...JP_TRIP_DATA];
                saveToStorage(JP_TRIP_ID, 'days', JP_TRIP_DATA);
            }

            const lUsers = localStorage.getItem(getStorageKey(id, 'users'));
            const lRate = localStorage.getItem(getStorageKey(id, 'rate'));
            const lConf = loadFromStorage(id, 'config');
            const lCloud = loadFromStorage(id, 'cloud');

            // 檢查是否為雲端旅程
            let cloudSyncSuccess = false;
            if (lCloud) {
                cloudTripId.value = lCloud.cloudTripId || null;
                inviteCode.value = lCloud.inviteCode || '';
                isCloudTrip.value =
                    lCloud.isCloudTrip !== undefined ? lCloud.isCloudTrip : !!cloudTripId.value;

                // 如果是雲端旅程，自動同步資料並設定即時監聽
                if (isCloudTrip.value && cloudTripId.value) {
                    try {
                        await syncFromCloud();
                        cloudSyncSuccess = true;
                        await setupExpensesRealtimeListener();
                    } catch (error) {
                        console.error('雲端同步失敗，將使用本地資料:', error);
                        cloudSyncSuccess = false;
                    }
                } else {
                    // 如果不是雲端旅程，使用本地資料
                    if (lUsers) {
                        participantsStr.value = lUsers;
                        updateParticipants();
                    }
                }
            } else {
                isCloudTrip.value = false;
                cloudTripId.value = null;
                inviteCode.value = '';
                // 非雲端旅程，使用本地資料
                if (lUsers) {
                    participantsStr.value = lUsers;
                    updateParticipants();
                }
            }
            if (lRate) exchangeRate.value = parseFloat(lRate);

            // 載入本地 config（僅在非雲端旅程，或雲端旅程同步失敗時使用）
            if (lConf && !cloudSyncSuccess) {
                setup.value = lConf;
            }

            if (!isPersonalMode.value) {
                resetNewExpenseSplits();
            }
        } finally {
            isLoadingTrip.value = false;
        }
    };

    /**
     * 載入模板作為新旅程
     */
    const loadTemplateAsNew = async () => {
        isLoadingTemplate.value = true;
        try {
            // 檢查是否已存在相同 ID 的行程
            const existingTrip = tripList.value.find((t) => t.id === JP_TRIP_ID);
            if (existingTrip) {
                if (!confirm('已存在相同名稱的行程，是否要覆蓋？')) {
                    isLoadingTemplate.value = false;
                    return;
                }
                // 刪除舊行程
                tripList.value = tripList.value.filter((t) => t.id !== JP_TRIP_ID);
                ['days', 'exp', 'personal_exp', 'users', 'rate', 'config', 'cloud', 'synced'].forEach(
                    (suffix) => {
                        localStorage.removeItem(getStorageKey(JP_TRIP_ID, suffix));
                    }
                );
            }

            // 創建新行程
            const newTripMeta: TripMeta = {
                id: JP_TRIP_ID,
                destination: '日本東京富士山',
                startDate: (JP_TRIP_DATA[0] && JP_TRIP_DATA[0].fullDate) || '2025-02-17',
                daysCount: JP_TRIP_DATA.length,
            };

            // 保存資料
            saveToStorage(JP_TRIP_ID, 'days', JP_TRIP_DATA);
            saveToStorage(JP_TRIP_ID, 'exp', JP_EXPENSES);
            localStorage.setItem(getStorageKey(JP_TRIP_ID, 'users'), DEFAULT_PARTICIPANTS_STR);
            localStorage.setItem(getStorageKey(JP_TRIP_ID, 'rate'), String(DEFAULT_EXCHANGE_RATE));
            saveToStorage(JP_TRIP_ID, 'config', {
                title: '日本東京富士山',
                destination: 'Japan',
                startDate: (JP_TRIP_DATA[0] && JP_TRIP_DATA[0].fullDate) || '2025-02-17',
                days: JP_TRIP_DATA.length,
                rate: DEFAULT_EXCHANGE_RATE,
                currency: 'JPY',
                langCode: 'ja',
                langName: '日文',
            });

            tripList.value.unshift(newTripMeta);
            saveTripList();

            // 切換到新行程
            await switchTrip(JP_TRIP_ID);
            showTemplatePreview.value = false;
            showTripMenu.value = false;
        } catch (error) {
            console.error('載入模板失敗:', error);
            alert('載入模板時發生錯誤，請稍後再試');
        } finally {
            isLoadingTemplate.value = false;
        }
    };

    /**
     * 載入模板到當前旅程
     */
    const loadTemplateToCurrent = async () => {
        if (!currentTripId.value) {
            alert('請先選擇一個行程');
            return;
        }
        if (!confirm('確定要將模板資料載入到當前行程嗎？這會覆蓋現有的行程資料。')) {
            return;
        }
        isLoadingTemplate.value = true;
        try {
            // 載入模板資料到當前行程
            saveToStorage(currentTripId.value, 'days', JP_TRIP_DATA);

            // 合併支出（保留現有支出，添加模板支出）
            const currentExp = loadFromStorage<Expense[]>(currentTripId.value, 'exp', []) || [];
            const templateExpIds = new Set(JP_EXPENSES.map((e) => e.item));
            const filteredCurrentExp = currentExp.filter((e) => !templateExpIds.has(e.item));
            const mergedExp = [...filteredCurrentExp, ...JP_EXPENSES];
            saveToStorage(currentTripId.value, 'exp', mergedExp);

            // 更新行程元數據
            const tripIndex = tripList.value.findIndex((t) => t.id === currentTripId.value);
            if (tripIndex !== -1) {
                tripList.value[tripIndex].daysCount = JP_TRIP_DATA.length;
                tripList.value[tripIndex].startDate =
                    (JP_TRIP_DATA[0] && JP_TRIP_DATA[0].fullDate) || tripList.value[tripIndex].startDate;
                saveTripList();
            }

            // 重新載入行程
            await switchTrip(currentTripId.value);
            showTemplatePreview.value = false;
            showTripMenu.value = false;
        } catch (error) {
            console.error('載入模板失敗:', error);
            alert('載入模板時發生錯誤，請稍後再試');
        } finally {
            isLoadingTemplate.value = false;
        }
    };

    return {
        loadTripList,
        saveTripList,
        isLoadingTrip,
        createNewTrip,
        initTrip,
        deleteTrip,
        switchTrip,
        loadTemplateAsNew,
        loadTemplateToCurrent,
    };
}

