/**
 * 邀請碼功能 Composable
 * 處理邀請碼的生成、複製和查詢
 */
import { computed, ref, type Ref } from 'vue';
import { useFirebase } from '../constants/index';
import { findTripByInviteCode } from '../services/cloudTripService';
import { waitForDb } from '../services/firebase';
import type { TripMeta } from '../types/index';
import { generateId } from '../utils/id';
import { getStorageKey, saveToStorage } from '../utils/storage';

/**
 * 邀請碼功能
 */
export function useInviteCode(
    cloudTripId: Ref<string | null>,
    currentTripId: Ref<string | null>,
    tripList: Ref<TripMeta[]>,
    switchTrip: (id: string) => Promise<void>
) {
    const inviteCode = ref<string>('');
    const isUploading = ref(false);

    /**
     * 產生邀請碼
     */
    const generateInviteCode = (): string => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    };

    /**
     * 計算邀請連結
     */
    const inviteLink = computed(() => {
        if (!inviteCode.value) return '';
        return `${window.location.origin}${window.location.pathname}?code=${inviteCode.value}`;
    });

    /**
     * 複製邀請碼連結
     */
    const copyInviteLink = async (): Promise<void> => {
        if (!inviteLink.value) {
            alert('沒有可分享的連結');
            return;
        }
        try {
            await navigator.clipboard.writeText(inviteLink.value);
            const message =
                '✅ 已複製邀請連結！\n\n' +
                inviteLink.value +
                '\n\n請將此連結分享給旅伴，他們就能一起編輯這個行程了！';
            alert(message);
        } catch (error) {
            // 降級方案：使用傳統方法
            const textArea = document.createElement('textarea');
            textArea.value = inviteLink.value;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                const message =
                    '✅ 已複製邀請連結！\n\n' +
                    inviteLink.value +
                    '\n\n請將此連結分享給旅伴，他們就能一起編輯這個行程了！';
                alert(message);
            } catch (err) {
                alert('複製失敗，請手動複製：\n\n' + inviteLink.value);
            }
            document.body.removeChild(textArea);
        }
    };

    /**
     * 複製邀請碼
     */
    const copyInviteCode = async (): Promise<void> => {
        if (!inviteCode.value) {
            alert('沒有邀請碼');
            return;
        }
        try {
            await navigator.clipboard.writeText(inviteCode.value);
            alert('已複製邀請碼！');
        } catch (error) {
            const textArea = document.createElement('textarea');
            textArea.value = inviteCode.value;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                alert('已複製邀請碼！');
            } catch (err) {
                alert('複製失敗，請手動複製：' + inviteCode.value);
            }
            document.body.removeChild(textArea);
        }
    };

    /**
     * 檢查 URL 參數中的邀請碼並載入旅程
     */
    const checkInviteCodeFromUrl = async (
        setup: any,
        days: Ref<any[]>,
        expenses: Ref<any[]>,
        participantsStr: Ref<string>,
        exchangeRate: Ref<number>,
        updateParticipants: () => void,
        saveTripList: () => void,
        DEFAULT_PARTICIPANTS_STR: string,
        DEFAULT_EXCHANGE_RATE: number
    ): Promise<void> => {
        if (!useFirebase) return;

        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        if (!code) return;

        const firestoreDb = await waitForDb();
        if (!firestoreDb) {
            console.warn('Firebase 連線失敗，無法載入邀請旅程');
            return;
        }

        try {
            const result = await findTripByInviteCode(code);
            if (!result) {
                alert('找不到對應的旅程，邀請碼可能已失效');
                return;
            }

            const { tripId: foundTripId, tripData } = result;

            // 檢查是否已存在於 tripList
            let existingTrip = tripList.value.find((t) => {
                const cloud = localStorage.getItem(`${t.id}_cloud`);
                if (cloud) {
                    const cloudData = JSON.parse(cloud);
                    return cloudData.cloudTripId === foundTripId;
                }
                return false;
            });

            if (existingTrip) {
                // 已存在，確保 cloudData 中的 inviteCode 是最新的，然後切換
                const existingCloudData = {
                    cloudTripId: foundTripId,
                    inviteCode: code,
                    isCloudTrip: true,
                };
                saveToStorage(existingTrip.id, 'cloud', existingCloudData);
                await switchTrip(existingTrip.id);
            } else {
                // 不存在，建立新的本地旅程並連結到雲端
                const newLocalId = generateId();
                const newTripMeta: TripMeta = {
                    id: newLocalId,
                    destination: tripData.title || tripData.destination || '雲端旅程',
                    startDate: tripData.startDate || new Date().toISOString().split('T')[0],
                    daysCount: tripData.daysCount || 0,
                    isCloudTrip: true,
                };

                // 儲存雲端資訊
                const cloudData = {
                    cloudTripId: foundTripId,
                    inviteCode: code,
                    isCloudTrip: true,
                };
                saveToStorage(newLocalId, 'cloud', cloudData);

                // 初始化空的資料
                saveToStorage(newLocalId, 'days', []);
                saveToStorage(newLocalId, 'exp', []);
                const participantsFromCloud = tripData.participants || DEFAULT_PARTICIPANTS_STR;
                localStorage.setItem(getStorageKey(newLocalId, 'users'), participantsFromCloud);
                localStorage.setItem(
                    getStorageKey(newLocalId, 'rate'),
                    ((tripData.config && tripData.config.rate) || DEFAULT_EXCHANGE_RATE).toString()
                );

                // 確保 config 包含 title 和 destination
                const syncedTitle =
                    tripData.title ||
                    (tripData.config && tripData.config.title) ||
                    tripData.destination ||
                    '雲端旅程';
                const syncedDestination =
                    tripData.destination || (tripData.config && tripData.config.destination) || 'Tokyo';
                const defaultConfig = {
                    ...tripData.config,
                    title: syncedTitle,
                    destination: syncedDestination,
                };
                saveToStorage(newLocalId, 'config', defaultConfig);

                tripList.value.unshift(newTripMeta);
                saveTripList();

                // 切換到新旅程並同步
                await switchTrip(newLocalId);
            }

            // 清除 URL 參數
            window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error: any) {
            console.error('載入邀請旅程失敗:', error);
            alert('載入失敗：' + error.message);
        }
    };

    return {
        inviteCode,
        isUploading,
        inviteLink,
        generateInviteCode,
        copyInviteLink,
        copyInviteCode,
        checkInviteCodeFromUrl,
    };
}

