import { reactive, ref } from 'vue';
import type { DayItem, Recommendation } from '../types/index';
import { geocodeText, searchRestaurantsNearby } from '../utils/geoapify';

// 智慧推薦系統（Geoapify 版）
export function useRecommendations() {
    const recommendationsMap = reactive<Record<string, Recommendation[]>>({});
    const isSearchingRecs = ref<boolean>(false);
    const searchTargetIndex = ref<string>('');

    const searchNearby = async (item: DayItem, idx: number, currentDayIdx: number): Promise<void> => {
        if (!item.location || item.type !== 'food') return;

        const key = `${currentDayIdx}-${idx}`;
        searchTargetIndex.value = key;
        isSearchingRecs.value = true;
        recommendationsMap[key] = [];

        try {
            const geo = await geocodeText(item.location);
            console.log(geo);

            if (!geo) {
                recommendationsMap[key] = [
                    { name: '找不到地點，請改用更明確地址', location: item.location, note: '' },
                ];
                return;
            }

            const places = await searchRestaurantsNearby(geo.lat, geo.lon, 1200, 100);
            if (!places.length) {
                recommendationsMap[key] = [
                    { name: '找不到推薦，請嘗試更精確地點', location: item.location, note: '' },
                ];
                return;
            }
            const randomPlaces = places.sort(() => Math.random() - 0.5).slice(0, 10);


            recommendationsMap[key] = randomPlaces.map((p) => ({
                name: p.name,
                location: p.address || p.name,
                note: '推薦地點',
            }));
        } catch (e) {
            console.error('推薦搜尋失敗', e);
            recommendationsMap[key] = [{ name: '搜尋失敗，稍後再試', location: item.location, note: '' }];
        } finally {
            isSearchingRecs.value = false;
            searchTargetIndex.value = '';
        }
    };

    const applyRecommendation = (_item: DayItem, rec: Recommendation): void => {
        // 點擊推薦時，不再直接修改行程項目內容
        // 僅開啟 Google Maps 讓使用者查看店家位置
        const query = encodeURIComponent(rec.location || rec.name);
        const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
        window.open(url, '_blank');
    };

    return {
        recommendationsMap,
        isSearchingRecs,
        searchTargetIndex,
        searchNearby,
        applyRecommendation,
    };
}


