// 天氣相關工具函數
export const getWeatherIcon = (c: number): string => {
    if (c === 0) return 'ph-sun';
    if (c < 4) return 'ph-cloud-sun';
    if (c < 50) return 'ph-cloud-fog';
    if (c < 70) return 'ph-cloud-rain';
    return 'ph-cloud';
};

