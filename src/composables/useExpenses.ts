/**
 * 分帳功能 Composable
 * 處理分帳的新增、刪除、計算和自動同步
 */
import { computed, type Ref } from 'vue';
import { AUTO_SYNC_DELAY, useFirebase } from '../constants/index';
import {
    addExpenseToCloud,
    addPersonalExpenseToCloud,
    deleteExpenseFromCloud,
    deletePersonalExpenseFromCloud,
} from '../services/cloudTripService';
import type { Expense, SettlementPlan } from '../types/index';
import { formatExpenseTime } from '../utils/expense';
import { saveToStorage } from '../utils/storage';

/**
 * 分帳功能
 */
export function useExpenses(
    expenses: Ref<Expense[]>,
    personalExpenses: Ref<Expense[]>,
    isPersonalMode: Ref<boolean>,
    participants: Ref<string[]>,
    currentTripId: Ref<string | null>,
    cloudTripId: Ref<string | null>,
    isCloudTrip: Ref<boolean>,
    newExpense: Ref<{
        item: string;
        amount: string;
        payer: string;
        time: string;
        splitParticipants: string[];
    }>,
    resetNewExpenseSplits: () => void,
    setIsLocalUpdate: (value: boolean) => void,
    handleUploadToCloud: (tripId: string, silent: boolean) => Promise<void>,
    expensesSyncInProgress: Ref<boolean>,
    expensesSyncAbortFlag: Ref<boolean>
) {
    let expensesAutoSyncTimer: ReturnType<typeof setTimeout> | null = null;

    /**
     * 分帳自動同步（只針對雲端旅程），1 秒內多次操作會合併成一次同步
     */
    const scheduleExpensesAutoSync = () => {
        if (!isCloudTrip.value || !cloudTripId.value || !currentTripId.value) {
            return;
        }

        // 取消上一次排程的同步
        if (expensesAutoSyncTimer) {
            clearTimeout(expensesAutoSyncTimer);
            expensesAutoSyncTimer = null;
        }

        // 如果有正在進行的同步，標記為取消
        if (expensesSyncInProgress.value) {
            console.log('⚠️ 取消正在進行的分帳同步');
            expensesSyncAbortFlag.value = true;
        }

        // 延遲後再執行同步，期間的新增/刪除會被合併
        expensesAutoSyncTimer = setTimeout(async () => {
            expensesAutoSyncTimer = null;

            // 檢查是否應該取消
            if (expensesSyncAbortFlag.value) {
                console.log('⚠️ 同步已被取消，跳過此次同步');
                expensesSyncAbortFlag.value = false;
                return;
            }

            try {
                expensesSyncInProgress.value = true;
                expensesSyncAbortFlag.value = false;

                // 使用既有的上傳流程（silent = true 背景靜默同步）
                if (!currentTripId.value) return;
                await handleUploadToCloud(currentTripId.value, true);
            } catch (e) {
                if (!expensesSyncAbortFlag.value) {
                    console.error('自動同步分帳失敗：', e);
                } else {
                    console.log('⚠️ 同步已被取消');
                }
            } finally {
                expensesSyncInProgress.value = false;
                if (!expensesSyncAbortFlag.value) {
                    expensesSyncAbortFlag.value = false;
                }
            }
        }, AUTO_SYNC_DELAY);
    };

    /**
     * 新增支出
     */
    const addExpense = async () => {
        if (newExpense.value.item) {
            // 建立唯一的 order 值
            const payer = isPersonalMode.value ? 'personal' : newExpense.value.payer || 'payer';
            const order = `${Date.now()}_${payer}`;

            // 如果有設定時間，將時間格式化並加到 item 前面
            let itemWithTime = newExpense.value.item;
            if (newExpense.value.time) {
                const timePrefix = formatExpenseTime(newExpense.value.time);
                itemWithTime = timePrefix + itemWithTime;
            }

            // 確認分攤對象
            const selectedSplits =
                !isPersonalMode.value &&
                    newExpense.value.splitParticipants &&
                    newExpense.value.splitParticipants.length > 0
                    ? newExpense.value.splitParticipants
                    : isPersonalMode.value
                        ? []
                        : [...participants.value];

            const expense: Expense = {
                item: itemWithTime,
                amount: Number(newExpense.value.amount) || 0,
                payer: isPersonalMode.value ? '個人' : payer,
                order,
                splitParticipants: selectedSplits,
            };

            if (isPersonalMode.value) {
                // 個人記帳模式
                personalExpenses.value.unshift(expense);
                saveToStorage(currentTripId.value, 'personal_exp', personalExpenses.value);
                // 上傳到 Firebase
                if (useFirebase && isCloudTrip.value && cloudTripId.value) {
                    await addPersonalExpenseToCloud(cloudTripId.value, expense);
                }
            } else {
                // 多人記帳模式
                if (isCloudTrip.value && cloudTripId.value) {
                    setIsLocalUpdate(true);
                }
                expenses.value.unshift(expense);
                // 新增上傳至 Firestore
                if (useFirebase && isCloudTrip.value && cloudTripId.value) {
                    await addExpenseToCloud(cloudTripId.value, expense, participants.value);
                }
                // 觸發自動同步
                scheduleExpensesAutoSync();
            }

            // 只清空項目和金額，保留時間與付款人
            newExpense.value.item = '';
            newExpense.value.amount = '';
            if (!isPersonalMode.value) {
                resetNewExpenseSplits();
            }
        }
    };

    /**
     * 刪除支出
     */
    const removeExpense = async (idx: number) => {
        if (isPersonalMode.value) {
            // 個人記帳模式
            const target = personalExpenses.value[idx];
            if (!target) return;

            personalExpenses.value.splice(idx, 1);
            saveToStorage(currentTripId.value, 'personal_exp', personalExpenses.value);

            // 刪除 Firebase 中的記錄
            if (useFirebase && isCloudTrip.value && cloudTripId.value && target.order) {
                await deletePersonalExpenseFromCloud(cloudTripId.value, target.order);
            }
        } else {
            // 多人記帳模式
            const target = expenses.value[idx];
            if (!target) return;

            // 如果是雲端旅程，標記為本地更新，避免觸發監聽器
            if (isCloudTrip.value && cloudTripId.value) {
                setIsLocalUpdate(true);
                if (target.order && useFirebase) {
                    await deleteExpenseFromCloud(cloudTripId.value, target.order);
                }
            }

            expenses.value.splice(idx, 1);
            // 觸發自動同步
            scheduleExpensesAutoSync();
        }
    };

    /**
     * 計算總支出
     */
    const totalExpense = computed(() => {
        const expenseList = isPersonalMode.value ? personalExpenses.value : expenses.value;
        return expenseList.reduce((sum, item) => sum + item.amount, 0);
    });

    /**
     * 每人實際支付的金額
     */
    const paidByPerson = computed(() => {
        const map: Record<string, number> = {};
        participants.value.forEach((p) => (map[p] = 0));
        expenses.value.forEach((e) => {
            if (map[e.payer] === undefined) map[e.payer] = 0;
            map[e.payer] += e.amount;
        });
        return map;
    });

    /**
     * 每人應分攤的金額（只計多人模式）
     */
    const owedByPerson = computed(() => {
        const map: Record<string, number> = {};
        participants.value.forEach((p) => (map[p] = 0));
        if (isPersonalMode.value) return map;
        expenses.value.forEach((e) => {
            const splits =
                e.splitParticipants && e.splitParticipants.length > 0
                    ? e.splitParticipants
                    : participants.value;
            if (splits.length === 0) return;
            const share = e.amount / splits.length;
            splits.forEach((p) => {
                if (map[p] === undefined) map[p] = 0;
                map[p] += share;
            });
        });
        return map;
    });

    /**
     * 結算建議
     */
    const settlementPlan = computed((): SettlementPlan[] => {
        if (isPersonalMode.value) return [];
        if (totalExpense.value === 0) return [];
        // 改為「實際支付 - 應分攤」的差額
        const balances = participants.value.map((p) => ({
            name: p,
            val: (paidByPerson.value[p] || 0) - (owedByPerson.value[p] || 0),
        }));
        const debtors = balances.filter((b) => b.val < -1).sort((a, b) => a.val - b.val);
        const creditors = balances.filter((b) => b.val > 1).sort((a, b) => b.val - a.val);
        const result: SettlementPlan[] = [];
        let i = 0;
        let j = 0;
        while (i < debtors.length && j < creditors.length) {
            const debtor = debtors[i];
            const creditor = creditors[j];
            let amount = Math.min(Math.abs(debtor.val), creditor.val);
            amount = Math.round(amount);
            if (amount > 0)
                result.push({
                    from: debtor.name,
                    to: creditor.name,
                    amount: amount,
                });
            debtor.val += amount;
            creditor.val -= amount;
            if (Math.abs(debtor.val) < 1) i++;
            if (creditor.val < 1) j++;
        }
        return result;
    });

    /**
     * 當前支出列表（根據模式返回對應列表）
     */
    const currentExpenses = computed(() => {
        return isPersonalMode.value ? personalExpenses.value : expenses.value;
    });

    return {
        addExpense,
        removeExpense,
        scheduleExpensesAutoSync,
        totalExpense,
        paidByPerson,
        owedByPerson,
        settlementPlan,
        currentExpenses,
    };
}

