import { watch, type Ref } from 'vue';
import { saveToStorage, getStorageKey } from '../utils/storage';

export function useLocalPersistence(
    days: Ref<any[]>,
    expenses: Ref<any[]>,
    personalExpenses: Ref<any[]>,
    exchangeRate: Ref<number>,
    participantsStr: Ref<string>,
    isPersonalMode: Ref<boolean>,
    currentTripId: Ref<string | null>,
    resetNewExpenseSplits: () => void
) {
    // Auto-save core data
    watch(
        [days, expenses, exchangeRate, participantsStr],
        () => {
            if (!currentTripId.value) return;
            saveToStorage(currentTripId.value, 'days', days.value);
            saveToStorage(currentTripId.value, 'exp', expenses.value);
            localStorage.setItem(getStorageKey(currentTripId.value, 'rate'), exchangeRate.value.toString());
            localStorage.setItem(getStorageKey(currentTripId.value, 'users'), participantsStr.value);
        },
        { deep: true }
    );

    // Personal expenses
    watch(
        personalExpenses,
        () => {
            if (!currentTripId.value) return;
            saveToStorage(currentTripId.value, 'personal_exp', personalExpenses.value);
        },
        { deep: true }
    );

    // Reset splits when participants change
    watch(
        participantsStr,
        () => {
            if (!isPersonalMode.value) resetNewExpenseSplits();
        },
        { deep: true }
    );

    // Reset splits when switch to多人模式
    watch(isPersonalMode, (val) => {
        if (!val) resetNewExpenseSplits();
    });
}

