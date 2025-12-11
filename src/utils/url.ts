// URL 相關工具函數
export const getGoogleMapLink = (loc: string): string =>
    loc ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc)}` : '#';

