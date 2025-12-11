import { computed, ref, type Ref } from 'vue';
import type { Day, Setup } from '../types';
import { getWeatherIcon } from '../utils/weather';

// 併攏天氣與匯率偵測相關邏輯
export function useWeatherRate(setup: Ref<Setup>, currentDay: Ref<Day>) {
    const isRateLoading = ref(false);
    const weather = ref<any>({
        temp: null,
        icon: 'ph-sun',
        code: 0,
        location: '',
        daily: [],
    });

    const countryInfoMap: Record<string, { c: string; l: string; n: string }> = {
        jp: { c: 'JPY', l: 'ja', n: '日文' },
        kr: { c: 'KRW', l: 'ko', n: '韓文' },
        us: { c: 'USD', l: 'en', n: '英文' },
        cn: { c: 'CNY', l: 'zh-CN', n: '簡中' },
        th: { c: 'THB', l: 'th', n: '泰文' },
    };

    const detectRate = async (): Promise<void> => {
        if (!setup.value.destination) return;
        isRateLoading.value = true;
        try {
            const geoRes = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                    setup.value.destination
                )}&limit=1&addressdetails=1`
            );
            const geoData = await geoRes.json();
            if (geoData && geoData[0] && geoData[0].address && geoData[0].address.country_code) {
                const info =
                    countryInfoMap[geoData[0].address.country_code.toLowerCase()] || {
                        c: 'USD',
                        l: 'en',
                        n: '英文',
                    };
                setup.value.currency = info.c;
                setup.value.langCode = info.l;
                setup.value.langName = info.n;
                if (info.c === 'TWD') setup.value.rate = 1;
                else {
                    const rRes = await fetch(`https://api.exchangerate-api.com/v4/latest/${info.c}`);
                    const rData = await rRes.json();
                    if (rData && rData.rates && rData.rates.TWD) setup.value.rate = rData.rates.TWD;
                }
            }
        } catch (e) {
            // ignore
        } finally {
            isRateLoading.value = false;
        }
    };

    const fetchWeather = async (locName: string): Promise<void> => {
        try {
            weather.value.location = locName;
            const geoRes = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locName)}&limit=1`
            );
            const geoData = await geoRes.json();
            if (geoData && geoData[0]) {
                const { lat, lon } = geoData[0];
                const wRes = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto&forecast_days=16`
                );
                const wData = await wRes.json();
                weather.value.temp = Math.round(wData.current_weather.temperature);
                weather.value.icon = getWeatherIcon(wData.current_weather.weathercode);
                if (wData.daily) weather.value.daily = wData.daily;
            }
        } catch (e) {
            weather.value.temp = '--';
        }
    };

    const currencyLabel = computed(() => (setup.value && setup.value.currency) || '外幣');
    const currencySymbol = computed(() => {
        const map: Record<string, string> = {
            JPY: '¥',
            CNY: '¥',
            USD: '$',
            EUR: '€',
            KRW: '₩',
            GBP: '£',
            TWD: 'NT$',
            HKD: 'HK$',
            THB: '฿',
            VND: '₫',
        };
        return map[(setup.value && setup.value.currency) as string] || '$';
    });

    const weatherDisplay = computed(() => {
        const destination = (setup.value && setup.value.destination) || '當地';
        if (!currentDay.value || !currentDay.value.fullDate || weather.value.daily.length === 0) {
            return {
                temp: weather.value.temp !== null ? `${weather.value.temp}°` : '--',
                icon: weather.value.icon || 'ph-sun',
                label: `${destination} (目前)`,
                isForecast: false,
            };
        }
        const targetDate = currentDay.value.fullDate;
        const idx = weather.value.daily.time.indexOf(targetDate);
        if (idx !== -1) {
            const max = Math.round(weather.value.daily.temperature_2m_max[idx]);
            const min = Math.round(weather.value.daily.temperature_2m_min[idx]);
            return {
                temp: `${min}° - ${max}°`,
                icon: getWeatherIcon(weather.value.daily.weathercode[idx]),
                label: `${destination} (預報)`,
                isForecast: true,
            };
        }
        return {
            temp: weather.value.temp !== null ? `${weather.value.temp}°` : '--',
            icon: weather.value.icon || 'ph-sun',
            label: `${destination} (目前)`,
            isForecast: false,
        };
    });

    return {
        isRateLoading,
        weather,
        weatherDisplay,
        detectRate,
        fetchWeather,
        currencyLabel,
        currencySymbol,
    };
}

