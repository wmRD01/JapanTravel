import { WEEKDAY_ZH } from '../constants/index.js';
import type { FormattedDate } from '../types';

// 日期格式化工具
export const formatDate = (date: string): FormattedDate | null => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const w = WEEKDAY_ZH[d.getDay()];
    return {
        date: `${mm}/${dd} (${w})`,
        shortDate: `${mm}/${dd}`,
        fullDate: date,
    };
};

export const getTodayDateStr = (): string => new Date().toISOString().split('T')[0];

export const getTimePeriod = (t: string): string => {
    if (!t) return '';
    const h = parseInt(t.split(':')[0]);
    return h < 5 ? '凌晨' : h < 11 ? '上午' : h < 14 ? '中午' : h < 18 ? '下午' : '晚上';
};

