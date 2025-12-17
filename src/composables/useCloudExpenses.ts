/**
 * 分帳雲端同步 Composable
 * 處理分帳功能的即時監聽和同步
 */
import { type Ref } from 'vue';
import { checkCloudFirebaseReady } from '../services/cloudTripService';
import { getFirestoreModule } from '../services/firebase';
import type { Expense } from '../types/index';

/**
 * 分帳雲端同步功能
 */
export function useCloudExpenses(
    cloudTripId: Ref<string | null>,
    expenses: Ref<Expense[]>,
    participants: Ref<string[]>,
    currentTripId: Ref<string | null>,
    setIsLocalUpdate: (value: boolean) => void,
    getIsLocalUpdate: () => boolean
) {
    let expensesUnsubscribe: (() => void) | null = null;

    /**
     * 設定 sharedExpenses 的即時監聽器
     */
    const setupExpensesRealtimeListener = async () => {
        const firestoreDb = await checkCloudFirebaseReady(cloudTripId.value);
        if (!firestoreDb) {
            console.warn('⚠️ Firebase 連線失敗，無法設定即時監聽');
            return;
        }

        try {
            const firestoreModule = await getFirestoreModule();
            const { collection, onSnapshot, query, orderBy } = firestoreModule;

            // 取消舊的監聽器
            if (expensesUnsubscribe) {
                expensesUnsubscribe();
            }

            const expensesCollection = collection(
                firestoreDb,
                `trips/${cloudTripId.value}/sharedExpenses`
            );
            const expensesQuery = query(expensesCollection, orderBy('createdAt', 'desc'));

            console.log('👂 開始監聽 sharedExpenses 變更...', {
                cloudTripId: cloudTripId.value,
            });

            // 設定即時監聽
            expensesUnsubscribe = onSnapshot(
                expensesQuery,
                async (snapshot: any) => {
                    // 如果是本地更新，忽略監聽器的觸發（避免上傳時清空資料）
                    if (getIsLocalUpdate()) {
                        console.log('⚠️ 忽略監聽器觸發（本地更新中）');
                        return;
                    }

                    console.log('📢 偵測到 sharedExpenses 變更:', {
                        size: snapshot.size,
                        changes: snapshot.docChanges().map((change: any) => ({
                            type: change.type,
                            docId: change.doc.id,
                            data: change.doc.data(),
                        })),
                    });

                    // 從 Firestore 取得最新的 expenses
                    const remoteExpenses: Expense[] = [];
                    snapshot.forEach((docSnap: any) => {
                        const data = docSnap.data();
                        let splitParts = data.splitParticipants;
                        if (!splitParts || !Array.isArray(splitParts) || splitParts.length === 0) {
                            splitParts = [...participants.value];
                        }
                        remoteExpenses.push({
                            item: data.item,
                            amount: data.amount,
                            payer: data.payerName,
                            order: data.order || null,
                            splitParticipants: splitParts,
                        });
                    });

                    // 比對並合併本地和遠端資料
                    mergeExpenses(remoteExpenses);
                },
                (error: any) => {
                    console.error('❌ 監聽 sharedExpenses 時發生錯誤:', error);
                }
            );

            console.log('✅ 即時監聽器設定完成');
        } catch (error) {
            console.error('❌ 設定即時監聽器失敗:', error);
        }
    };

    /**
     * 比對並合併本地和遠端的 expenses（以 order 為唯一識別）
     */
    const mergeExpenses = (remoteExpenses: Expense[]) => {
        // 先將遠端資料轉成本地格式
        const remoteFormatted = remoteExpenses.map((exp) => {
            let splitParts = exp.splitParticipants;
            if (!splitParts || !Array.isArray(splitParts) || splitParts.length === 0) {
                splitParts = [...participants.value];
            }
            // 確保 order 不是 null（如果為 null，生成一個臨時的）
            const order = exp.order || `${Date.now()}_${exp.payer || 'unknown'}`;
            return {
                item: exp.item,
                amount: exp.amount,
                payer: exp.payer,
                order: order,
                splitParticipants: splitParts,
            };
        });

        // 建立本地的 map（key 為 order）
        const localByOrder = new Map();
        expenses.value.forEach((exp, index) => {
            if (exp.order) {
                localByOrder.set(exp.order, { exp, index });
            }
        });

        // 建立 Firestore 的 order set
        const remoteOrderSet = new Set(
            remoteFormatted.filter((e) => e.order).map((e) => e.order)
        );

        let hasChanges = false;
        const updatedExpenses = [...expenses.value];

        // 情境 1 & 3：Firestore 有的 order、本地沒有 -> 新增；兩邊都有 -> 以 Firestore 為準更新
        remoteFormatted.forEach((remoteExp) => {
            // order 已經在 map 中確保不是 null，所以這裡不需要檢查
            const localEntry = localByOrder.get(remoteExp.order);
            if (!localEntry) {
                updatedExpenses.push({ ...remoteExp } as Expense);
                hasChanges = true;
            } else {
                const { exp, index } = localEntry;
                if (
                    exp.item !== remoteExp.item ||
                    exp.amount !== remoteExp.amount ||
                    exp.payer !== remoteExp.payer ||
                    JSON.stringify(exp.splitParticipants || []) !==
                    JSON.stringify(remoteExp.splitParticipants || [])
                ) {
                    updatedExpenses[index] = { ...remoteExp } as Expense;
                    hasChanges = true;
                }
            }
        });

        // 情境 2：Firestore 沒有，但本地有的 order -> 從本地刪除
        const indexesToRemove: number[] = [];
        updatedExpenses.forEach((exp, index) => {
            if (!exp.order) return;
            if (!remoteOrderSet.has(exp.order)) {
                indexesToRemove.push(index);
            }
        });
        if (indexesToRemove.length > 0) {
            hasChanges = true;
            indexesToRemove
                .sort((a, b) => b - a)
                .forEach((idx) => {
                    updatedExpenses.splice(idx, 1);
                });
        }

        if (!hasChanges) {
            console.log('✅ Expenses 無變更，無需更新');
            return;
        }

        console.log('🔄 偵測到 expenses 變更，開始依據 order 與 Firestore 合併:', {
            localCount: expenses.value.length,
            remoteCount: remoteFormatted.length,
        });

        // 這裡是「遠端 → 本地」更新：
        // - 先暫時標記為本地更新，避免我們自己寫入 expenses 時又觸發 onSnapshot 的遞迴更新
        // - 完成後一定要還原，否則後續真正來自遠端的更新會被永遠忽略
        setIsLocalUpdate(true);
        try {
            expenses.value = updatedExpenses;

            // 儲存到 localStorage
            if (currentTripId.value) {
                localStorage.setItem(
                    `${currentTripId.value}_exp`,
                    JSON.stringify(expenses.value)
                );
            }

            console.log('✅ Expenses 已依據 Firestore 最新資料完成合併:', {
                total: expenses.value.length,
            });
        } finally {
            setIsLocalUpdate(false);
        }
    };

    /**
     * 取消監聽器
     */
    const unsubscribe = () => {
        if (expensesUnsubscribe) {
            expensesUnsubscribe();
            expensesUnsubscribe = null;
        }
    };

    return {
        setupExpensesRealtimeListener,
        unsubscribe,
    };
}

