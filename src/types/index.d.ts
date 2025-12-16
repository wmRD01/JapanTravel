// 類型定義文件

// Vue 3 類型（從 CDN 導入時使用）
// 注意：實際的類型聲明在 global.d.ts 中，這裡只是為了兼容性

// 行程相關類型
export interface Day {
    date: string;
    shortDate: string;
    fullDate: string;
    title: string;
    items: DayItem[];
    flight: Flight | null;
    order?: number;
    region?: string; // 該行程的地區設定
    weather?: DayWeather; // 該行程的天氣資料
}

export interface DayWeather {
    temp: number | string | null;
    icon: string;
    location: string;
    daily?: {
        time: string[];
        temperature_2m_max: number[];
        temperature_2m_min: number[];
        weathercode: number[];
    };
}

export interface DayItem {
    time: string;
    type: 'spot' | 'food' | 'shop' | 'transport' | 'flight' | 'country-divider';
    activity: string;
    location: string;
    note: string;
    region?: string; // 該旅程項目的地區設定
    weather?: DayWeather; // 該旅程項目的天氣資料
    // 國家區塊專用欄位
    country?: string; // 國家名稱（如：日本）
    countryCode?: string; // 國家代碼（如：JP）
    isCountryDivider?: boolean; // 標記為國家區塊
}

export interface Flight {
    type: 'arrival' | 'departure';
    startTime: string;
    startAirport: string;
    number: string;
    endTime: string;
    endAirport: string;
    arrivalOffset: number;
}

// 分帳相關類型
export interface Expense {
    item: string;
    amount: number;
    payer: string;
    order: string;
    splitParticipants: string[];
    time?: string;
}

export interface ExpenseSplit {
    person: string;
    amount: number;
}

export interface SettlementPlan {
    from: string;
    to: string;
    amount: number;
}

// 設定相關類型
export interface Setup {
    title: string;
    startDate: string;
    days: number;
    rate: number;
    currency: string;
    langCode: string;
    langName: string;
}

// 天氣相關類型
export interface Weather {
    temp: number | string | null;
    icon: string;
    code: number;
    location: string;
    daily: WeatherDaily;
}

export interface WeatherDaily {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weathercode: number[];
}

export interface WeatherDisplay {
    temp: string;
    icon: string;
    label: string;
    isForecast: boolean;
}

// 推薦相關類型（Geoapify 餐廳）
export interface Recommendation {
    name: string;
    location: string;
    note: string;
}

// 行程列表類型
export interface TripMeta {
    id: string;
    destination: string;
    startDate: string;
    daysCount: number;
    isCloudTrip?: boolean;
}

// 雲端相關類型
export interface CloudData {
    cloudTripId: string | null;
    inviteCode: string;
    isCloudTrip: boolean;
    lastSyncedAt?: string;
}

// Firebase 相關類型
export interface FirebaseConfig {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
}

export interface FirebaseReadyResult {
    ready: boolean;
    db?: any;
    error?: string;
}

// 用戶位置類型
export interface UserLocation {
    lat: number;
    lng: number;
}

// 日期格式化結果
export interface FormattedDate {
    date: string;
    shortDate: string;
    fullDate: string;
}

