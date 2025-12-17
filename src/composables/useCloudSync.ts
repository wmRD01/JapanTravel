/**
 * 雲端同步 Composable
 * 處理旅程的上傳和同步功能
 */
import { ref, type Ref } from 'vue';
import { useFirebase } from '../constants/index';
import {
    checkCloudFirebaseReady,
    deleteOldDays,
    deleteOldSharedExpenses,
    syncTripFromCloud,
    uploadDays,
    uploadSharedExpenses,
    uploadTripDocument,
} from '../services/cloudTripService';
import { waitForDb } from '../services/firebase';
import type { Day, Expense, Setup, TripMeta } from '../types/index';
import { getStorageKey, loadFromStorage, saveToStorage } from '../utils/storage';

/**
 * 雲端同步功能
 */
export function useCloudSync(
    cloudTripId: Ref<string | null>,
    inviteCode: Ref<string>,
    isCloudTrip: Ref<boolean>,
    currentTripId: Ref<string | null>,
    days: Ref<Day[]>,
    expenses: Ref<Expense[]>,
    setup: Ref<Setup>,
    participants: Ref<string[]>,
    participantsStr: Ref<string>,
    exchangeRate: Ref<number>,
    tripList: Ref<TripMeta[]>,
    generateInviteCode: () => string,
    setIsLocalUpdate: (value: boolean) => void,
    setupExpensesRealtimeListener: () => Promise<void>,
    copyInviteLink: () => Promise<void>,
    updateParticipants: () => void,
    saveTripList: () => void,
    expensesSyncAbortFlag: Ref<boolean>,
    DEFAULT_PARTICIPANTS_STR: string
) {
    const isUploading = ref(false);
    const isSyncing = ref(false);

    /**
     * 上傳到雲端
     * @param silent - true 時不顯示「上傳成功」提示（用於背景自動同步）
     */
    const uploadToCloud = async (silent = false): Promise<void> => {
        // 如果是背景自動同步且被標記為取消，直接返回
        if (silent && expensesSyncAbortFlag.value) {
            console.log('⚠️ 同步已被取消，停止上傳');
            return;
        }

        if (!useFirebase) {
            if (!silent) alert('Firebase 未啟用');
            return;
        }

        const firestoreDb = await waitForDb();
        if (!firestoreDb) {
            if (!silent) alert('Firebase 連線失敗，請稍後再試');
            return;
        }

        if (days.value.length === 0) {
            if (!silent) alert('請先建立行程');
            return;
        }

        // 再次檢查是否被取消
        if (silent && expensesSyncAbortFlag.value) {
            console.log('⚠️ 同步已被取消，停止上傳');
            return;
        }

        isUploading.value = true;

        try {
            let tripId: string;
            let inviteCodeToUse: string;
            const wasFirstUpload = !cloudTripId.value;

            // 檢查是否已經上傳過
            if (cloudTripId.value) {
                // 已上傳過，更新現有文件
                tripId = cloudTripId.value;
                inviteCodeToUse = inviteCode.value || generateInviteCode();

                // 標記為本地更新，避免任何監聽器觸發
                setIsLocalUpdate(true);

                // 更新 trips 主文件
                await uploadTripDocument(
                    tripId,
                    setup.value,
                    days.value.length,
                    participantsStr.value,
                    inviteCodeToUse,
                    true // isUpdate
                );

                // 檢查是否被取消
                if (silent && expensesSyncAbortFlag.value) {
                    console.log('⚠️ 同步已被取消，停止上傳');
                    setIsLocalUpdate(false);
                    return;
                }

                // 刪除舊的 days 子集合
                await deleteOldDays(tripId);

                // 檢查是否被取消
                if (silent && expensesSyncAbortFlag.value) {
                    console.log('⚠️ 同步已被取消，停止上傳');
                    setIsLocalUpdate(false);
                    return;
                }

                // 只有在本地有 expenses 時才刪除舊的 sharedExpenses
                if (expenses.value.length > 0) {
                    if (silent && expensesSyncAbortFlag.value) {
                        console.log('⚠️ 同步已被取消，停止上傳');
                        setIsLocalUpdate(false);
                        return;
                    }
                    await deleteOldSharedExpenses(tripId);
                }
            } else {
                // 第一次上傳，建立新文件
                inviteCodeToUse = generateInviteCode();
                tripId = await uploadTripDocument(
                    null,
                    setup.value,
                    days.value.length,
                    participantsStr.value,
                    inviteCodeToUse,
                    false // isUpdate
                );
            }

            // 檢查是否被取消（在上傳 days 前）
            if (silent && expensesSyncAbortFlag.value) {
                console.log('⚠️ 同步已被取消，停止上傳');
                return;
            }

            // 上傳 days 子集合
            await uploadDays(tripId, days.value);

            // 檢查是否被取消（在上傳 sharedExpenses 前）
            if (silent && expensesSyncAbortFlag.value) {
                console.log('⚠️ 同步已被取消，停止上傳');
                return;
            }

            // 上傳 sharedExpenses 子集合
            if (expenses.value.length > 0) {
                await uploadSharedExpenses(tripId, expenses.value, participants.value);
            }

            // 儲存雲端資訊到 localStorage
            const cloudData = {
                cloudTripId: tripId,
                inviteCode: inviteCodeToUse,
                isCloudTrip: true,
            };
            saveToStorage(currentTripId.value!, 'cloud', cloudData);

            // 更新 Vue 狀態
            isCloudTrip.value = true;
            cloudTripId.value = tripId;
            inviteCode.value = inviteCodeToUse;

            // 更新 tripList 中的標記
            const trip = tripList.value.find((t) => t.id === currentTripId.value);
            if (trip) {
                trip.isCloudTrip = true;
                saveTripList();
            }

            // 等待一小段時間確保所有上傳操作完成，然後重置標記
            await new Promise((resolve) => setTimeout(resolve, 500));
            setIsLocalUpdate(false);
            console.log('✅ 上傳完成，重置 isLocalUpdate 標記');

            // 設定即時監聽器
            await setupExpensesRealtimeListener();

            // 前景手動上傳時，如果是第一次上傳，自動複製邀請連結（不彈成功提示，僅錯誤時提示）
            if (!silent && wasFirstUpload) {
                await copyInviteLink();
            }
        } catch (error: any) {
            // 如果是因為取消而失敗，不顯示錯誤訊息
            if (silent && expensesSyncAbortFlag.value) {
                console.log('⚠️ 同步已被取消');
            } else {
                console.error('上傳失敗:', error);
                if (!silent) alert('上傳失敗：' + error.message);
            }
        } finally {
            // 確保無論如何都會重置 loading 狀態
            isUploading.value = false;
            setIsLocalUpdate(false);
            // 如果是背景自動同步，確保重置同步狀態
            if (silent) {
                // 只有在不是因為取消而結束時才重置標記
                if (!expensesSyncAbortFlag.value) {
                    expensesSyncAbortFlag.value = false;
                }
            }
        }
    };

    /**
     * 從雲端同步資料（單向拉取：Firebase → 本地，覆蓋本地資料）
     */
    const syncFromCloud = async (): Promise<void> => {
        if (!cloudTripId.value) {
            console.log('❌ 無法同步：沒有 cloudTripId');
            return;
        }

        console.log('🔄 開始從 Firebase 同步資料...', {
            cloudTripId: cloudTripId.value,
        });

        const firestoreDb = await checkCloudFirebaseReady(cloudTripId.value);
        if (!firestoreDb) {
            console.warn('❌ Firebase 連線失敗，無法同步');
            // 檢查是否有本地已同步的資料可以使用
            if (currentTripId.value) {
                const hasLocalData =
                    localStorage.getItem(getStorageKey(currentTripId.value, 'synced')) === 'true';
                if (hasLocalData) {
                    console.log('✅ 使用本地已儲存的資料（最後一次同步的資料）');
                }
            }
            return;
        }

        console.log('✅ Firebase 連線成功');

        isSyncing.value = true;
        setIsLocalUpdate(true);

        try {
            const { tripData, days: syncedDays, expenses: syncedExpenses } =
                await syncTripFromCloud(cloudTripId.value);

            if (tripData) {
                // 優先同步 title（不再使用 destination）
                const syncedTitle = tripData.title || (tripData.config && tripData.config.title) || '';
                if (syncedTitle) {
                    setup.value.title = syncedTitle;
                    console.log('✅ Title 已更新（優先同步）:', syncedTitle);
                }

                // 更新 tripList 中的顯示
                const trip = tripList.value.find((t) => t.id === currentTripId.value);
                if (trip) {
                    trip.destination = setup.value.title || trip.destination;
                    saveTripList();
                }
            }

            // 同步 days
            days.value = syncedDays;
            console.log('✅ 行程資料載入完成:', {
                daysCount: syncedDays.length,
            });

            // 同步 sharedExpenses（處理舊資料的 splitParticipants）
            const processedExpenses = syncedExpenses.map((exp) => {
                let splitParts = exp.splitParticipants;
                if (!splitParts || !Array.isArray(splitParts) || splitParts.length === 0) {
                    splitParts = [...participants.value];
                }
                return {
                    ...exp,
                    splitParticipants: splitParts,
                };
            });
            expenses.value = processedExpenses;
            console.log('✅ 支出資料載入完成:', {
                expensesCount: processedExpenses.length,
            });

            // 同步 config 中的其他設定（忽略 destination）
            if (tripData) {
                if (tripData.config) {
                    const currentTitle = setup.value.title || '';
                    // 從 config 中排除 destination，避免讀取舊資料
                    const { destination: _, ...configWithoutDestination } = tripData.config;
                    setup.value = {
                        ...setup.value,
                        ...configWithoutDestination,
                        title: currentTitle || configWithoutDestination.title || '',
                    };
                    if (tripData.config.rate !== undefined) {
                        exchangeRate.value = tripData.config.rate;
                    }
                    console.log('✅ 設定資料已更新:', {
                        title: setup.value.title,
                        currency: setup.value.currency,
                    });
                }

                if (tripData.inviteCode) {
                    inviteCode.value = tripData.inviteCode;
                    console.log('✅ 邀請碼已更新:', inviteCode.value);
                }

                // 同步分帳成員
                if (tripData.participants) {
                    participantsStr.value = tripData.participants;
                    updateParticipants();
                    console.log('✅ 分帳成員已更新:', participantsStr.value);
                } else {
                    const localUsers = localStorage.getItem(
                        getStorageKey(currentTripId.value!, 'users')
                    );
                    if (localUsers) {
                        participantsStr.value = localUsers;
                        updateParticipants();
                        console.log('⚠️ Firestore 中沒有 participants，使用本地資料:', participantsStr.value);
                    } else {
                        participantsStr.value = DEFAULT_PARTICIPANTS_STR;
                        updateParticipants();
                        console.log('⚠️ 使用預設分帳成員:', participantsStr.value);
                    }
                }
            }

            // 完整更新 localStorage
            if (currentTripId.value) {
                saveToStorage(currentTripId.value, 'days', days.value);
                saveToStorage(currentTripId.value, 'exp', expenses.value);
                saveToStorage(currentTripId.value, 'config', setup.value);
                localStorage.setItem(
                    getStorageKey(currentTripId.value, 'rate'),
                    exchangeRate.value.toString()
                );
                localStorage.setItem(
                    getStorageKey(currentTripId.value, 'users'),
                    participantsStr.value
                );

                // 更新雲端資訊，加上最後同步時間
                const cloudData = loadFromStorage(currentTripId.value, 'cloud');
                if (cloudData) {
                    cloudData.lastSyncedAt = new Date().toISOString();
                    saveToStorage(currentTripId.value, 'cloud', cloudData);
                }

                // 標記資料已從雲端同步
                localStorage.setItem(getStorageKey(currentTripId.value, 'synced'), 'true');
            }

            console.log('🎉 同步完成！');
        } catch (error: any) {
            console.error('❌ 同步失敗:', error);

            // 檢查 localStorage 是否有之前同步的資料
            if (currentTripId.value) {
                const hasLocalData = localStorage.getItem(`${currentTripId.value}_synced`) === 'true';
                if (hasLocalData) {
                    console.warn('同步失敗，但可使用本地已儲存的資料');
                } else {
                    alert('同步失敗：' + error.message + '\n\n如果持續無法連線，請檢查網路設定。');
                }
            } else {
                alert('同步失敗：' + error.message);
            }
        } finally {
            isSyncing.value = false;
            setIsLocalUpdate(false);
            console.log('✅ 同步完成，重置 isLocalUpdate 標記');
        }
    };

    return {
        isUploading,
        isSyncing,
        uploadToCloud,
        syncFromCloud,
    };
}

