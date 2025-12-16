import { computed, ref } from 'vue';
import type { Day, DayItem } from '../types/index';

/**
 * 管理當前 day 的行程操作
 * - addDay, removeCurrentDay
 * - addItem, removeItem, moveItemUp, moveItemDown
 * - showInsertCountryDividerModal, saveCountryDivider, removeCountryDivider
 * - 管理 note 編輯狀態暨內容
 */
export function useDayPlan(
    days: { value: Day[] },
    currentDayIdx: { value: number }
) {
    // Note 編輯狀態
    const isEditingNote = ref(false);
    const editingNoteValue = ref('');
    const editingNoteTarget = ref<DayItem | null>(null);

    // 國家區塊編輯/插入狀態
    const isEditingCountryDivider = ref(false);
    const editingCountryDivider = ref<DayItem | null>(null);
    const editingCountryName = ref('');
    const editingCountryCode = ref('');
    const insertCountryDividerIndex = ref(-1);

    // 當前 day
    const currentDay = computed(() => days.value[currentDayIdx.value] || days.value[0]);

    // ========== Day 操作 ==========
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

    // ========== Item 操作 ==========
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

    const moveItemUp = (idx: number) => {
        if (idx <= 0) return;
        const items = currentDay.value.items;
        [items[idx - 1], items[idx]] = [items[idx], items[idx - 1]];
    };

    const moveItemDown = (idx: number) => {
        const items = currentDay.value.items;
        if (idx >= items.length - 1) return;
        [items[idx], items[idx + 1]] = [items[idx + 1], items[idx]];
    };

    // ========== Note 編輯 ==========
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

    // ========== 國家區塊操作 ==========
    // 獲取項目上方最近的國家區塊
    const getCountryDividerAbove = (itemIndex: number, day: Day): DayItem | null => {
        for (let i = itemIndex - 1; i >= 0; i--) {
            const item = day.items[i];
            if (item.type === 'country-divider' || item.isCountryDivider) {
                return item;
            }
        }
        return null;
    };

    // 創建國家區塊
    const createCountryDivider = (country: string, countryCode: string): DayItem => {
        return {
            time: '',
            type: 'country-divider',
            activity: country,
            location: '',
            note: '',
            country: country,
            countryCode: countryCode,
            isCountryDivider: true,
        };
    };

    // 插入國家區塊到指定位置
    const insertCountryDivider = (day: Day, index: number, country: string, countryCode: string) => {
        const divider = createCountryDivider(country, countryCode);
        day.items.splice(index, 0, divider);
    };

    // 編輯國家區塊
    const editCountryDivider = (item: DayItem, country: string, countryCode: string) => {
        item.country = country;
        item.countryCode = countryCode;
        item.activity = country;
    };

    // 刪除國家區塊
    const removeCountryDivider = (idx: number) => {
        currentDay.value.items.splice(idx, 1);
    };

    // 顯示插入國家區塊模態框
    const showInsertCountryDividerModal = (index: number) => {
        insertCountryDividerIndex.value = index;
        editingCountryName.value = '';
        editingCountryCode.value = '';
        isEditingCountryDivider.value = true;
    };

    // 開始編輯國家區塊
    const startEditCountryDivider = (item: DayItem) => {
        editingCountryDivider.value = item;
        editingCountryName.value = item.country || item.activity;
        editingCountryCode.value = item.countryCode || '';
        isEditingCountryDivider.value = true;
    };

    // 關閉編輯模態框
    const closeCountryDividerModal = () => {
        isEditingCountryDivider.value = false;
        editingCountryDivider.value = null;
        editingCountryName.value = '';
        editingCountryCode.value = '';
        insertCountryDividerIndex.value = -1;
    };

    // 儲存國家區塊（編輯或插入）
    const saveCountryDivider = () => {
        if (!editingCountryName.value) return;

        if (editingCountryDivider.value) {
            editCountryDivider(editingCountryDivider.value, editingCountryName.value, editingCountryCode.value || '');
        } else if (insertCountryDividerIndex.value >= 0) {
            insertCountryDivider(
                currentDay.value,
                insertCountryDividerIndex.value,
                editingCountryName.value,
                editingCountryCode.value || ''
            );
        }

        closeCountryDividerModal();
    };

    // 檢查是否需要插入國家區塊（自動插入邏輯）
    const checkAndInsertCountryDivider = async (
        item: DayItem,
        itemIndex: number,
        day: Day,
        country: string,
        countryCode: string
    ) => {
        const dividerAbove = getCountryDividerAbove(itemIndex, day);

        if (!dividerAbove || dividerAbove.countryCode !== countryCode) {
            insertCountryDivider(day, itemIndex, country, countryCode);
            return true;
        }

        return false;
    };

    // 切換航班卡片
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

    return {
        // Day 操作
        currentDay,
        addDay,
        removeCurrentDay,
        // Item 操作
        addItem,
        removeItem,
        moveItemUp,
        moveItemDown,
        // Note 編輯
        isEditingNote,
        editingNoteValue,
        startEditNote,
        closeEditNote,
        saveNote,
        // 國家區塊操作
        isEditingCountryDivider,
        editingCountryDivider,
        editingCountryName,
        editingCountryCode,
        insertCountryDividerIndex,
        getCountryDividerAbove,
        createCountryDivider,
        insertCountryDivider,
        editCountryDivider,
        removeCountryDivider,
        showInsertCountryDividerModal,
        startEditCountryDivider,
        closeCountryDividerModal,
        saveCountryDivider,
        checkAndInsertCountryDivider,
        // 航班操作
        toggleFlightCard,
    };
}

