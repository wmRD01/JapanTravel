import { reactive, ref } from 'vue';
import type { DayItem, Recommendation } from '../types/index';

// 智慧推薦系統 Composable
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
            const geoRes = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                    item.location
                )}&limit=1`
            );
            const geoData = await geoRes.json();

            if (geoData && geoData.length > 0) {
                const lat = geoData[0].lat;
                const lon = geoData[0].lon;

                let query = 'restaurant';
                const finalQuery = `${query} near ${item.location}`;
                const searchRes = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                        finalQuery
                    )}&limit=4`
                );
                const searchData = await searchRes.json();

                recommendationsMap[key] = searchData.map((place: any) => ({
                    name: place.name || place.display_name.split(',')[0],
                    location: place.name || place.display_name.split(',')[0],
                    note: '推薦地點',
                }));

                if (recommendationsMap[key].length === 0) {
                    recommendationsMap[key] = [
                        {
                            name: '找不到推薦，請嘗試更精確地點',
                            location: item.location,
                            note: '',
                        },
                    ];
                }
            }
        } catch (e) {
            console.error('推薦搜尋失敗', e);
        } finally {
            isSearchingRecs.value = false;
            searchTargetIndex.value = '';
        }
    };

    const applyRecommendation = (item: DayItem, rec: Recommendation): void => {
        item.activity = rec.name;
        item.location = rec.name;
    };

    return {
        recommendationsMap,
        isSearchingRecs,
        searchTargetIndex,
        searchNearby,
        applyRecommendation,
    };
}

