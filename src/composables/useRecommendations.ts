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
            if (!geo) {
                recommendationsMap[key] = [
                    { name: '找不到地點，請改用更明確地址', location: item.location, note: '' },
                ];
                return;
            }

            const places = await searchRestaurantsNearby(geo.lat, geo.lon, 1200, 6);
            if (!places.length) {
                recommendationsMap[key] = [
                    { name: '找不到推薦，請嘗試更精確地點', location: item.location, note: '' },
                ];
                return;
            }

            recommendationsMap[key] = places.map((p) => ({
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

    const applyRecommendation = (item: DayItem, rec: Recommendation): void => {
        item.activity = rec.name;
        item.location = rec.location;
    };

    return {
        recommendationsMap,
        isSearchingRecs,
        searchTargetIndex,
        searchNearby,
        applyRecommendation,
    };
}


