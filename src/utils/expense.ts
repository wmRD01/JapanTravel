import type { Expense, ExpenseSplit } from '../types/index';

// 分帳相關工具函數
export const formatExpenseTime = (timeString: string): string => {
    if (!timeString) return '';
    // datetime-local 格式為 "YYYY-MM-DDTHH:mm"，轉換為 "YYYY-MM-DD HH:mm"
    const formatted = timeString.replace('T', ' ');
    return formatted + '→';
};

export const getExpenseSplitAmount = (
    expense: Expense,
    isPersonalMode: boolean,
    participants: string[]
): ExpenseSplit[] => {
    if (isPersonalMode) return [];
    const splits =
        expense.splitParticipants && expense.splitParticipants.length > 0
            ? expense.splitParticipants
            : participants;
    if (splits.length === 0) return [];
    const sharePerPerson = expense.amount / splits.length;
    const result: ExpenseSplit[] = [];
    splits.forEach((person) => {
        if (person === expense.payer) {
            // 付款人：墊付金額 - 應付金額 = 應收金額（負數表示應收）
            result.push({
                person: person,
                amount: expense.amount - sharePerPerson,
            });
        } else {
            // 非付款人：應付金額（正數表示應付）
            result.push({
                person: person,
                amount: sharePerPerson,
            });
        }
    });
    return result;
};

