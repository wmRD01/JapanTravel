import { ref, type Ref } from 'vue';
import type { Setup } from '../types/index';

// 匯率自動偵測 Composable
export function useRateDetection(setup: Ref<Setup>) {
    const isRateLoading = ref<boolean>(false);

    interface CountryInfo {
        c: string;
        l: string;
        n: string;
    }

    const countryInfoMap: Record<string, CountryInfo> = {
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
            if (geoData?.[0]?.address?.country_code) {
                const info = countryInfoMap[geoData[0].address.country_code.toLowerCase()] || {
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
                    if (rData?.rates?.TWD) setup.value.rate = rData.rates.TWD;
                }
            }
        } catch (e) {
            console.error('匯率偵測失敗', e);
        } finally {
            isRateLoading.value = false;
        }
    };

    return {
        isRateLoading,
        detectRate,
    };
}

