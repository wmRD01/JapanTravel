import { computed, ref, type Ref } from 'vue';
import type { Day, Setup, Weather, WeatherDisplay } from '../types/index';
import { getWeatherIcon } from '../utils/weather.js';

// 天氣功能 Composable
export function useWeather(setup: Ref<Setup>) {
    const weather = ref<Weather>({
        temp: null,
        icon: 'ph-sun',
        code: 0,
        location: '',
        daily: {
            time: [],
            temperature_2m_max: [],
            temperature_2m_min: [],
            weathercode: [],
        },
    });

    const weatherDisplay = computed<WeatherDisplay>(() => {
        const destination = setup.value?.destination || '當地';
        if (!weather.value.daily || weather.value.daily.time.length === 0) {
            return {
                temp: weather.value.temp !== null ? `${weather.value.temp}°` : '--',
                icon: weather.value.icon || 'ph-sun',
                label: `${destination} (目前)`,
                isForecast: false,
            };
        }
        // 如果有 currentDay，可以根據日期顯示預報
        return {
            temp: weather.value.temp !== null ? `${weather.value.temp}°` : '--',
            icon: weather.value.icon || 'ph-sun',
            label: `${destination} (目前)`,
            isForecast: false,
        };
    });

    const fetchWeather = async (locName: string, currentDay: Day | null = null): Promise<void> => {
        try {
            weather.value.location = locName;
            const geoRes = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                    locName
                )}&limit=1`
            );
            const geoData = await geoRes.json();
            if (geoData?.[0]) {
                const { lat, lon } = geoData[0];
                const wRes = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto&forecast_days=16`
                );
                const wData = await wRes.json();
                weather.value.temp = Math.round(wData.current_weather.temperature);
                weather.value.icon = getWeatherIcon(wData.current_weather.weathercode);
                if (wData.daily) {
                    weather.value.daily = {
                        time: wData.daily.time || [],
                        temperature_2m_max: wData.daily.temperature_2m_max || [],
                        temperature_2m_min: wData.daily.temperature_2m_min || [],
                        weathercode: wData.daily.weathercode || [],
                    };
                }

                // 如果有 currentDay 且有 fullDate，更新為預報
                if (currentDay?.fullDate && weather.value.daily.time.length > 0) {
                    const idx = weather.value.daily.time.indexOf(currentDay.fullDate);
                    if (idx !== -1) {
                        const max = Math.round(weather.value.daily.temperature_2m_max[idx]);
                        const min = Math.round(weather.value.daily.temperature_2m_min[idx]);
                        // 注意：這裡不能直接賦值給 computed，需要更新 weather.value
                        weather.value.temp = `${min}° - ${max}°`;
                        weather.value.icon = getWeatherIcon(weather.value.daily.weathercode[idx]);
                    }
                }
            }
        } catch (e) {
            weather.value.temp = '--';
        }
    };

    return {
        weather,
        weatherDisplay,
        fetchWeather,
    };
}

