// ID 生成工具
export const generateId = (): string =>
    'trip_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

