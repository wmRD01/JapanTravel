import { ref, type Ref } from 'vue';
import type { Day, DayItem } from '../types/index';
import { geocodeText } from '../utils/geoapify';
import { getWeatherIcon } from '../utils/weather';

/**
 * 集中天氣相關邏輯
 * - reloadDayWeather
 * - onItemRegionChange, clearItemRegion
 * - isItemWeatherLoading, isDayWeatherLoading
 * - itemWeatherDisplay
 * - 將 API 呼叫、錯誤處理、節流/防抖（如需）都放在這裡
 */
export function useWeather(
    days: Ref<Day[]>,
    currentDayIdx: Ref<number>,
    getCountryDividerAbove: (itemIndex: number, day: Day) => DayItem | null
) {
    // 天氣載入狀態追蹤
    const weatherLoadingItems = ref<Set<DayItem>>(new Set());
    const isDayWeatherLoading = ref(false);

    // 檢查某個項目是否正在載入天氣
    const isItemWeatherLoading = (item: DayItem): boolean => {
        return weatherLoadingItems.value.has(item);
    };

    // 天氣快取系統
    interface WeatherCache {
        weather: any;
        timestamp: number;
    }

    const weatherCache = ref<Map<string, WeatherCache>>(new Map());
    const CACHE_DURATION = 10 * 60 * 1000; // 10分鐘

    // 生成快取 key：日期 + 地區
    const getWeatherCacheKey = (day: Day, location: string): string => {
        const dateKey = day.fullDate || 'default';
        return `${dateKey}_${location.trim().toLowerCase()}`;
    };

    // 檢查快取是否有效
    const isCacheValid = (cache: WeatherCache): boolean => {
        const now = Date.now();
        return (now - cache.timestamp) < CACHE_DURATION;
    };

    // 從快取獲取天氣資料
    const getWeatherFromCache = (day: Day, location: string): any | null => {
        const key = getWeatherCacheKey(day, location);
        const cache = weatherCache.value.get(key);

        if (cache && isCacheValid(cache)) {
            return cache.weather;
        }

        if (cache) {
            weatherCache.value.delete(key);
        }

        return null;
    };

    // 儲存天氣到快取
    const setWeatherCache = (day: Day, location: string, weather: any): void => {
        const key = getWeatherCacheKey(day, location);
        weatherCache.value.set(key, {
            weather: { ...weather },
            timestamp: Date.now(),
        });
    };

    // 清除特定地區的快取
    const clearWeatherCache = (day: Day, location: string): void => {
        const key = getWeatherCacheKey(day, location);
        weatherCache.value.delete(key);
    };

    // 載入單個旅程項目的天氣資料
    const fetchItemWeather = async (item: DayItem, day: Day, location: string): Promise<void> => {
        if (!location) {
            item.weather = undefined;
            return;
        }

        // 先檢查快取
        const cachedWeather = getWeatherFromCache(day, location);
        if (cachedWeather) {
            item.weather = {
                ...cachedWeather,
                location: location,
            };
            return;
        }

        // 標記為載入中
        weatherLoadingItems.value.add(item);

        try {
            // 使用 Geoapify 取得座標
            const geo = await geocodeText(location);

            if (!geo) {
                item.weather = undefined;
                return;
            }

            const { lat, lon } = geo;

            // 初始化天氣資料結構
            item.weather = {
                temp: null,
                icon: 'ph-sun',
                location: location,
            };

            // 載入天氣資料
            const wRes = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto&forecast_days=16`
            );

            if (!wRes.ok) {
                throw new Error(`天氣 API 回應錯誤: ${wRes.status}`);
            }

            const wData = await wRes.json();

            // 設置當前天氣
            if (wData.current_weather) {
                item.weather.temp = Math.round(wData.current_weather.temperature);
                item.weather.icon = getWeatherIcon(wData.current_weather.weathercode);
            }

            // 設置預報天氣
            if (wData.daily) {
                item.weather.daily = {
                    time: wData.daily.time || [],
                    temperature_2m_max: wData.daily.temperature_2m_max || [],
                    temperature_2m_min: wData.daily.temperature_2m_min || [],
                    weathercode: wData.daily.weathercode || [],
                };
            }

            // 儲存到快取
            setWeatherCache(day, location, item.weather);
        } catch (error) {
            console.error('載入旅程項目天氣失敗:', error);
            item.weather = undefined;
        } finally {
            weatherLoadingItems.value.delete(item);
        }
    };

    // 處理旅程項目地區變更
    const onItemRegionChange = async (item: DayItem, day: Day) => {
        const region = item.region?.trim();

        if (region) {
            const itemIndex = day.items.indexOf(item);
            if (itemIndex === -1) return;

            // 往上面欄位尋找國家欄位
            const countryDivider = getCountryDividerAbove(itemIndex, day);

            let weatherLocation = region;

            if (countryDivider && countryDivider.country) {
                weatherLocation = `${countryDivider.country} ${region}`;
            }

            await fetchItemWeather(item, day, weatherLocation);
        } else {
            item.weather = undefined;
        }
    };

    // 清除旅程項目地區
    const clearItemRegion = (item: DayItem) => {
        item.region = undefined;
        item.weather = undefined;
    };

    // 載入當日所有旅程項目的天氣
    const loadDayItemsWeather = async (day: Day) => {
        if (!day || !day.items || day.items.length === 0) return;

        isDayWeatherLoading.value = true;

        try {
            const weatherPromises = day.items
                .filter(item => item.region?.trim())
                .map(async (item) => {
                    if (!item.region) return;

                    const region = item.region.trim();
                    const itemIndex = day.items.indexOf(item);

                    const countryDivider = getCountryDividerAbove(itemIndex, day);

                    let weatherLocation = region;

                    if (countryDivider && countryDivider.country) {
                        weatherLocation = `${countryDivider.country} ${region}`;
                    }

                    await fetchItemWeather(item, day, weatherLocation);
                });

            await Promise.all(weatherPromises);
        } finally {
            isDayWeatherLoading.value = false;
        }
    };

    // 重新同步當天所有行程的天氣
    const reloadDayWeather = async () => {
        const currentDay = days.value[currentDayIdx.value];
        if (!currentDay || !currentDay.items || currentDay.items.length === 0) return;

        // 清除當天的天氣快取
        const itemsWithRegion = currentDay.items.filter(item => item.region?.trim());
        for (const item of itemsWithRegion) {
            if (!item.region) continue;
            const location = item.region.trim();
            const itemIndex = currentDay.items.indexOf(item);
            const countryDivider = getCountryDividerAbove(itemIndex, currentDay);
            let weatherLocation = location;

            if (countryDivider && countryDivider.country) {
                weatherLocation = `${countryDivider.country} ${location}`;
            }

            clearWeatherCache(currentDay, weatherLocation);
        }

        // 重新載入所有天氣
        await loadDayItemsWeather(currentDay);
    };

    // 取得旅程項目天氣顯示資料
    const itemWeatherDisplay = (item: DayItem, day: Day) => {
        if (!item.weather) {
            return null;
        }

        const region = item.region?.trim() || '當地';

        // 如果有當日預報資料
        if (day.fullDate && item.weather.daily && item.weather.daily.time.length > 0) {
            const idx = item.weather.daily.time.indexOf(day.fullDate);
            if (idx !== -1) {
                const max = Math.round(item.weather.daily.temperature_2m_max[idx]);
                const min = Math.round(item.weather.daily.temperature_2m_min[idx]);
                return {
                    temp: `${min}° - ${max}°`,
                    icon: getWeatherIcon(item.weather.daily.weathercode[idx]),
                    label: `${region} (預報)`,
                    isForecast: true,
                };
            }
        }

        // 使用目前天氣
        return {
            temp: item.weather.temp !== null ? `${item.weather.temp}°` : '--',
            icon: item.weather.icon || 'ph-sun',
            label: `${region} (目前)`,
            isForecast: false,
        };
    };

    return {
        // 載入狀態
        isItemWeatherLoading,
        isDayWeatherLoading,
        // 天氣操作
        onItemRegionChange,
        clearItemRegion,
        loadDayItemsWeather,
        reloadDayWeather,
        itemWeatherDisplay,
        // 快取操作（內部使用，但可能需要暴露）
        clearWeatherCache,
    };
}

