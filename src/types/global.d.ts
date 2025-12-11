// 全局類型聲明

// Leaflet 全局類型（如果沒有安裝 @types/leaflet）
declare global {
    interface Window {
        L: any;
    }
}

// Vue 3 類型已由安裝的 vue 包提供，無需額外聲明

// 數據文件類型
declare module '../data/trip-data.js' {
    export const JP_TRIP_ID: string;
    export const JP_TRIP_DATA: any[];
    export const JP_EXPENSES: any[];
    export const FirebaseConfig: {
        apiKey: string;
        authDomain: string;
        projectId: string;
        storageBucket: string;
        messagingSenderId: string;
        appId: string;
    };
}

export {};

