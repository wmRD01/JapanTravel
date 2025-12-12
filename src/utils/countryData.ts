// 國家、州/省、城市資料載入工具
// 使用 REST Countries API (https://restcountries.com)

// REST Countries API 回應格式
interface RestCountryResponse {
    name: {
        common: string;
        official: string;
        nativeName?: {
            [key: string]: {
                official: string;
                common: string;
            };
        };
    };
    cca2: string; // ISO 3166-1 alpha-2
    cca3: string; // ISO 3166-1 alpha-3
    translations?: {
        [key: string]: {
            official: string;
            common: string;
        };
    };
    altSpellings?: string[];
}

export interface Country {
    id: number;
    name: string;
    iso2: string;
    iso3: string;
    native?: string;
    translations?: {
        'zh-CN'?: string;
        'zh-TW'?: string;
    };
}

export interface State {
    id: number;
    name: string;
    state_code: string;
    country_id: number;
    country_code: string;
    latitude?: string;
    longitude?: string;
}

export interface City {
    id: number;
    name: string;
    state_id: number;
    state_code: string;
    country_id: number;
    country_code: string;
    latitude?: string;
    longitude?: string;
}

// REST Countries API 端點
const REST_COUNTRIES_API = 'https://restcountries.com/v3.1';
const REST_COUNTRIES_ALL = `${REST_COUNTRIES_API}/all?fields=name,cca2,cca3,translations,altSpellings`;

// 快取
let countriesCache: Country[] | null = null;
let statesCache: State[] | null = null;
let citiesCache: City[] | null = null;
let isLoadingCountries = false;
let loadCountriesPromise: Promise<Country[]> | null = null;

// 將 REST Countries API 資料轉換為我們的 Country 格式
function transformRestCountryToCountry(restCountry: RestCountryResponse, index: number): Country {
    // 取得原生名稱（優先使用中文，其次使用第一個可用的原生名稱）
    let nativeName = '';
    if (restCountry.name.nativeName) {
        // 優先使用繁體中文
        if (restCountry.name.nativeName['zho'] || restCountry.name.nativeName['zh-Hant']) {
            nativeName = restCountry.name.nativeName['zho']?.common ||
                restCountry.name.nativeName['zh-Hant']?.common || '';
        } else {
            // 使用第一個可用的原生名稱
            const firstNative = Object.values(restCountry.name.nativeName)[0];
            nativeName = firstNative?.common || '';
        }
    }

    // 取得翻譯（優先繁體中文）
    const translations: { 'zh-CN'?: string; 'zh-TW'?: string } = {};
    if (restCountry.translations) {
        // 繁體中文翻譯（嘗試多種可能的鍵值）
        const zhTW = restCountry.translations['zho']?.common ||
            restCountry.translations['zh-Hant']?.common ||
            restCountry.translations['zh']?.common || '';
        if (zhTW) {
            translations['zh-TW'] = zhTW;
        }

        // 簡體中文翻譯
        const zhCN = restCountry.translations['zho-CN']?.common ||
            restCountry.translations['zh-Hans']?.common ||
            restCountry.translations['zh-CN']?.common || '';
        if (zhCN) {
            translations['zh-CN'] = zhCN;
        }
    }

    // 如果沒有翻譯但有原生中文名稱，使用原生名稱作為繁體中文
    if (!translations['zh-TW'] && nativeName && /[\u4e00-\u9fa5]/.test(nativeName)) {
        translations['zh-TW'] = nativeName;
    }

    return {
        id: index + 1, // 使用索引作為 ID
        name: restCountry.name.common,
        iso2: restCountry.cca2,
        iso3: restCountry.cca3,
        native: nativeName || undefined,
        translations: Object.keys(translations).length > 0 ? translations : undefined,
    };
}

// 載入國家列表（從 REST Countries API）
export async function loadCountries(): Promise<Country[]> {
    // 如果已有快取，直接返回
    if (countriesCache) return countriesCache;

    // 如果正在載入，返回同一個 Promise
    if (isLoadingCountries && loadCountriesPromise) {
        return loadCountriesPromise;
    }

    // 開始載入
    isLoadingCountries = true;
    loadCountriesPromise = (async () => {
        try {
            console.log('開始從 REST Countries API 載入國家資料...');
            const response = await fetch(REST_COUNTRIES_ALL);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: RestCountryResponse[] = await response.json();
            console.log(`成功載入 ${data.length} 個國家資料`);

            // 轉換資料格式
            const transformedData = data.map((country, index) =>
                transformRestCountryToCountry(country, index)
            );

            // 按繁體中文名稱排序（如果有的話），否則按英文名稱排序
            transformedData.sort((a, b) => {
                const nameA = getCountryDisplayName(a).toLowerCase();
                const nameB = getCountryDisplayName(b).toLowerCase();
                return nameA.localeCompare(nameB, 'zh-TW');
            });

            countriesCache = transformedData;
            return transformedData;
        } catch (error) {
            console.error('載入國家資料失敗:', error);
            // 回退到基本列表
            const fallback = getFallbackCountries();
            countriesCache = fallback;
            return fallback;
        } finally {
            isLoadingCountries = false;
            loadCountriesPromise = null;
        }
    })();

    return loadCountriesPromise;
}


// 載入州/省列表（待實作新的資料來源）
export async function loadStates(): Promise<State[]> {
    if (statesCache) return statesCache;

    // TODO: 實作新的資料載入邏輯
    // 目前返回空陣列
    statesCache = [];
    return statesCache;
}

// 載入城市列表（待實作新的資料來源）
export async function loadCities(): Promise<City[]> {
    if (citiesCache) return citiesCache;

    // TODO: 實作新的資料載入邏輯
    // 目前返回空陣列
    citiesCache = [];
    return citiesCache;
}

// 根據國家代碼取得州/省列表
export async function getStatesByCountry(countryCode: string): Promise<State[]> {
    const states = await loadStates();
    // 如果有翻譯映射，可以從映射表生成州縣市列表
    // TODO: 實作新的資料載入邏輯
    return states.filter(state =>
        state.country_code.toLowerCase() === countryCode.toLowerCase()
    );
}

// 根據國家代碼和州代碼取得城市列表
export async function getCitiesByState(countryCode: string, stateCode: string): Promise<City[]> {
    const cities = await loadCities();
    return cities.filter(city =>
        city.country_code.toLowerCase() === countryCode.toLowerCase() &&
        city.state_code.toLowerCase() === stateCode.toLowerCase()
    );
}

// 根據國家名稱搜尋國家（支援中文）
export function findCountryByName(name: string, countries: Country[]): Country | null {
    const lowerName = name.toLowerCase().trim();

    // 先嘗試精確匹配
    let found = countries.find(c =>
        c.name.toLowerCase() === lowerName ||
        c.native?.toLowerCase() === lowerName ||
        c.translations?.['zh-CN']?.toLowerCase() === lowerName ||
        c.translations?.['zh-TW']?.toLowerCase() === lowerName
    );

    if (found) return found;

    // 嘗試部分匹配
    found = countries.find(c =>
        c.name.toLowerCase().includes(lowerName) ||
        c.native?.toLowerCase().includes(lowerName) ||
        c.translations?.['zh-CN']?.toLowerCase().includes(lowerName) ||
        c.translations?.['zh-TW']?.toLowerCase().includes(lowerName)
    );

    return found || null;
}

// 取得國家顯示名稱（優先使用中文翻譯）
export function getCountryDisplayName(country: Country): string {
    return country.translations?.['zh-TW'] ||
        country.translations?.['zh-CN'] ||
        country.native ||
        country.name;
}

// 取得州縣市顯示名稱
export function getStateDisplayName(state: State): string {
    return state.name;
}

// 回退國家列表（當無法載入資料時使用）
function getFallbackCountries(): Country[] {
    return [
        { id: 109, name: 'Japan', iso2: 'JP', iso3: 'JPN', native: '日本', translations: { 'zh-CN': '日本', 'zh-TW': '日本' } },
        { id: 216, name: 'Taiwan', iso2: 'TW', iso3: 'TWN', native: '臺灣', translations: { 'zh-CN': '中国台湾', 'zh-TW': '台灣' } },
        { id: 116, name: 'South Korea', iso2: 'KR', iso3: 'KOR', native: '대한민국', translations: { 'zh-CN': '韩国', 'zh-TW': '韓國' } },
        { id: 199, name: 'Singapore', iso2: 'SG', iso3: 'SGP', native: 'Singapore', translations: { 'zh-CN': '新加坡', 'zh-TW': '新加坡' } },
        { id: 219, name: 'Thailand', iso2: 'TH', iso3: 'THA', native: 'ประเทศไทย', translations: { 'zh-CN': '泰国', 'zh-TW': '泰國' } },
        { id: 233, name: 'United States', iso2: 'US', iso3: 'USA', native: 'United States', translations: { 'zh-CN': '美国', 'zh-TW': '美國' } },
        { id: 232, name: 'United Kingdom', iso2: 'GB', iso3: 'GBR', native: 'United Kingdom', translations: { 'zh-CN': '英国', 'zh-TW': '英國' } },
        { id: 75, name: 'France', iso2: 'FR', iso3: 'FRA', native: 'France', translations: { 'zh-CN': '法国', 'zh-TW': '法國' } },
        { id: 107, name: 'Italy', iso2: 'IT', iso3: 'ITA', native: 'Italia', translations: { 'zh-CN': '意大利', 'zh-TW': '義大利' } },
        { id: 14, name: 'Australia', iso2: 'AU', iso3: 'AUS', native: 'Australia', translations: { 'zh-CN': '澳大利亚', 'zh-TW': '澳洲' } },
        { id: 39, name: 'Canada', iso2: 'CA', iso3: 'CAN', native: 'Canada', translations: { 'zh-CN': '加拿大', 'zh-TW': '加拿大' } },
    ];
}

