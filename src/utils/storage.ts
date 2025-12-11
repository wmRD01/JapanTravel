// LocalStorage 工具函數
export const getStorageKey = (tripId: string, suffix: string): string => `${tripId}_${suffix}`;

export const saveToStorage = (tripId: string | null, suffix: string, data: any): void => {
    if (!tripId) return;
    localStorage.setItem(getStorageKey(tripId, suffix), JSON.stringify(data));
};

export const loadFromStorage = <T = any>(tripId: string | null, suffix: string, defaultValue: T | null = null): T | null => {
    if (!tripId) return defaultValue;
    const item = localStorage.getItem(getStorageKey(tripId, suffix));
    return item ? JSON.parse(item) : defaultValue;
};

