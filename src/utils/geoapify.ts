const getApiKey = (): string | null => {
    // 直接使用 API key
    return '9eb20c1436304d44933f80cae813deb3';
};

export interface GeocodeResult {
    lat: number;
    lon: number;
    countryCode?: string;
    formatted?: string;
}

export interface PlaceResult {
    name: string;
    address?: string;
    lat: number;
    lon: number;
}

// 文字地理編碼：地址 → 座標
export async function geocodeText(text: string): Promise<GeocodeResult | null> {
    const key = getApiKey();
    if (!key || !text) {
        console.warn('Geoapify geocode: API key 或 text 為空', { key: !!key, text });
        return null;
    }

    // 移除 lang 參數，讓 API 自動判斷語言，這樣可以支援日文、中文、英文等多種語言的地名
    const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
        text
    )}&limit=1&apiKey=${key}`;

    try {
        console.log('Geoapify geocode 請求:', { text, url });
        const res = await fetch(url);

        if (!res.ok) {
            console.error('Geoapify geocode API 回應錯誤:', { status: res.status, statusText: res.statusText });
            return null;
        }

        const data = await res.json();
        console.log('Geoapify geocode 回應:', data);

        if (!data || !data.features || data.features.length === 0) {
            console.warn('Geoapify geocode: 沒有找到結果', { text, data });
            return null;
        }

        const feature = data.features[0];
        const p = feature?.properties;

        if (!p) {
            console.warn('Geoapify geocode: feature 沒有 properties', { feature });
            return null;
        }

        if (typeof p.lat !== 'number' || typeof p.lon !== 'number') {
            console.warn('Geoapify geocode: lat 或 lon 不是數字', { lat: p.lat, lon: p.lon, type: { lat: typeof p.lat, lon: typeof p.lon } });
            return null;
        }

        const result = {
            lat: p.lat,
            lon: p.lon,
            countryCode: p.country_code,
            formatted: p.formatted,
        };

        console.log('Geoapify geocode 成功:', result);
        return result;
    } catch (e) {
        console.error('Geoapify geocode 失敗:', e);
        return null;
    }
}

// 餐廳搜尋：依座標尋找周邊餐廳
export async function searchRestaurantsNearby(
    lat: number,
    lon: number,
    radius = 1200,
    limit = 100
): Promise<PlaceResult[]> {
    const key = getApiKey();
    if (!key || !lat || !lon) return [];
    const url = `https://api.geoapify.com/v2/places?categories=catering.restaurant&filter=circle:${lon},${lat},${radius}&bias=proximity:${lon},${lat}&limit=${limit}&lang=zh&apiKey=${key}`;
    try {

        const res = await fetch(url);
        const data = await res.json();
        const features = data?.features || [];
        return features
            .map((f: any) => {
                const p = f.properties;
                return {
                    name: p.name || p.address_line1 || p.formatted || '未命名餐廳',
                    address: p.formatted || p.address_line1,
                    lat: p.lat,
                    lon: p.lon,
                } as PlaceResult;
            })
            .filter((p: PlaceResult) => p.lat && p.lon);
    } catch (e) {
        console.warn('Geoapify places 失敗', e);
        return [];
    }
}

