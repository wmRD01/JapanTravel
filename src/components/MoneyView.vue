<template>
    <div class="p-4 pb-24 plan-surface">
        <div class="bg-teal-600 text-white rounded-2xl p-6 shadow-lg mb-6 text-center relative">
            <div class="absolute top-4 right-4 flex flex-col items-end gap-2 z-10">
                <!-- 個人/多人記帳切換按鈕 -->
                <button @click="$emit('toggle-personal-mode')"
                    :class="isPersonalMode ? 'bg-white text-teal-600' : 'bg-teal-500/30 text-white'"
                    class="relative z-20 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm hover:bg-teal-500/50 flex items-center gap-1.5 cursor-pointer"
                    title="切換個人/多人記帳模式">
                    <i :class="isPersonalMode ? 'ph-bold ph-user' : 'ph-bold ph-users'"></i>
                    <span>{{ isPersonalMode ? '個人' : '多人' }}</span>
                </button>
                <!-- 匯率輸入 -->
                <div class="flex flex-col items-end relative z-10 gap-2">
                    <div class="flex items-center gap-2">
                        <label class="text-[10px] text-teal-200 mb-0.5">幣別</label>
                        <select :value="currency"
                            @change="$emit('currency-change', ($event.target as HTMLSelectElement).value)"
                            class="bg-white/90 text-xs text-teal-900 rounded px-2 py-1 border border-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-300">
                            <option value="TWD">TWD</option>
                            <option value="JPY">JPY</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="KRW">KRW</option>
                            <option value="CNY">CNY</option>
                            <option value="HKD">HKD</option>
                            <option value="THB">THB</option>
                            <option value="VND">VND</option>
                        </select>
                    </div>
                    <div class="flex items-center gap-2">
                        <label class="text-[10px] text-teal-200 mb-0.5">匯率 ({{ currencyLabel }})</label>
                        <input :value="exchangeRate"
                            @input="$emit('update:exchangeRate', parseFloat(($event.target as HTMLInputElement).value) || 0)"
                            type="number" step="0.001"
                            class="w-20 text-right text-xs text-teal-900 rounded px-2 py-1 border border-teal-200" />
                    </div>
                </div>
            </div>
            <div class="text-sm opacity-80 mb-1">{{ isPersonalMode ? '個人總支出' : '總支出 Total' }}</div>
            <div class="text-4xl font-bold font-mono">{{ currencySymbol }} {{ totalExpense.toLocaleString() }}</div>
            <div class="text-lg font-bold text-teal-200 mt-1">≈ NT$ {{ totalExpenseInTWD.toLocaleString() }}</div>
        </div>
        <!-- 成員設定（僅多人記帳模式顯示） -->
        <div v-if="!isPersonalMode" class="mb-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <div class="text-xs font-bold text-slate-400 mb-2">分帳成員 (用逗號分隔)</div>
            <input :value="participantsStr"
                @change="$emit('update-participants', ($event.target as HTMLInputElement).value)"
                class="w-full text-sm bg-slate-50 rounded px-2 py-1 border border-slate-200"
                placeholder="例如: 我, 朋友A, 朋友B" />
        </div>
        <div v-if="!isPersonalMode" class="grid grid-cols-2 gap-2 mb-6">
            <div v-for="p in participants" :key="p"
                class="bg-white p-3 rounded-xl border border-slate-100 text-center shadow-sm">
                <div class="text-xs text-slate-400 mb-1">{{ p }}</div>
                <!-- 墊付金額 -->
                <div class="text-xs text-slate-500 mb-0.5">墊付</div>
                <div class="text-sm font-bold text-teal-600 mb-1">
                    {{ currencySymbol }}{{ paidByPerson[p]?.toLocaleString() || 0 }}
                </div>
                <!-- 應付金額 -->
                <div class="text-xs text-slate-500 mb-0.5">應付</div>
                <div class="text-sm font-bold text-slate-600 mb-1">
                    {{ currencySymbol }}{{ Math.round(owedByPerson[p] || 0).toLocaleString() }}
                </div>
                <!-- 淨額（墊付 - 應付） -->
                <div class="border-t border-slate-200 pt-1 mt-1">
                    <div class="text-[10px] text-slate-400 mb-0.5">淨額</div>
                    <div :class="(paidByPerson[p] || 0) - (owedByPerson[p] || 0) > 0
                            ? 'text-red-600 font-bold'
                            : (paidByPerson[p] || 0) - (owedByPerson[p] || 0) < 0
                                ? 'text-teal-600 font-bold'
                                : 'text-slate-500 font-bold'
                        " class="text-sm">
                        <template v-if="(paidByPerson[p] || 0) - (owedByPerson[p] || 0) > 0">+</template>
                        {{ currencySymbol }}{{ Math.abs(Math.round((paidByPerson[p] || 0) - (owedByPerson[p] ||
                            0))).toLocaleString() }}
                    </div>
                    <div v-if="(paidByPerson[p] || 0) - (owedByPerson[p] || 0) > 0"
                        class="text-[9px] text-red-500 mt-0.5">
                        應收
                    </div>
                    <div v-else-if="(paidByPerson[p] || 0) - (owedByPerson[p] || 0) < 0"
                        class="text-[9px] text-teal-500 mt-0.5">
                        應付
                    </div>
                    <div v-else class="text-[9px] text-slate-400 mt-0.5">已結清</div>
                </div>
            </div>
        </div>
        <div v-if="!isPersonalMode && settlementPlan.length > 0"
            class="bg-teal-50 rounded-xl p-4 mb-6 border border-teal-100">
            <h3 class="text-xs font-bold text-teal-400 uppercase tracking-wide mb-3">結帳建議</h3>
            <div class="space-y-2">
                <div v-for="(plan, idx) in settlementPlan" :key="getSettlementKey(plan, idx)"
                    class="flex items-center justify-between text-sm bg-white p-2 rounded-lg shadow-sm">
                    <span class="font-bold text-slate-600">{{ plan.from }} <i
                            class="ph-bold ph-arrow-right text-xs"></i> {{
                        plan.to }}</span>
                    <span class="font-mono font-bold text-teal-600">{{ currencySymbol }}{{ plan.amount.toLocaleString()
                        }}</span>
                </div>
            </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-4 mb-6 border border-slate-100">
            <div class="flex gap-2 mb-2">
                <input :value="newExpense.item"
                    @input="$emit('update:newExpense', { ...newExpense, item: ($event.target as HTMLInputElement).value })"
                    placeholder="項目" class="flex-1 bg-slate-50 border-none rounded-lg text-sm px-3 py-2" />
                <select v-if="!isPersonalMode" :value="newExpense.payer"
                    @change="$emit('update:newExpense', { ...newExpense, payer: ($event.target as HTMLSelectElement).value })"
                    class="w-[120px] bg-slate-50 border-none rounded-lg text-sm px-2 py-2 min-w-0">
                    <option v-for="p in participants" :key="p" :value="p">{{ p }}</option>
                </select>
            </div>
            <div class="flex gap-2 mb-2">
                <input :value="newExpense.time"
                    @input="$emit('update:newExpense', { ...newExpense, time: ($event.target as HTMLInputElement).value })"
                    type="datetime-local" placeholder="時間（選填）"
                    class="flex-1 bg-slate-50 border-none rounded-lg text-sm px-3 py-2" />
            </div>
            <div class="flex gap-2">
                <input :value="newExpense.amount"
                    @input="$emit('update:newExpense', { ...newExpense, amount: parseFloat(($event.target as HTMLInputElement).value) || 0 })"
                    type="number" :placeholder="currencySymbol + ' 金額'"
                    class="w-full bg-slate-50 border-none rounded-lg text-sm pl-3 pr-3 py-2 font-mono" />
                <button v-if="!isPersonalMode" @click="$emit('select-all-splits')"
                    class="bg-slate-100 text-slate-600 px-3 py-2 rounded-lg text-xs font-bold border border-slate-200"
                    title="全選分攤成員">
                    全選
                </button>
                <button @click="$emit('add-expense')"
                    class="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-bold">
                    <i class="ph-bold ph-plus"></i>
                </button>
            </div>
            <div v-if="!isPersonalMode" class="bg-slate-50 rounded-lg border border-slate-200 p-3 mt-2">
                <div class="text-[11px] text-slate-500 font-bold mb-2">分攤成員</div>
                <div class="flex flex-wrap gap-2">
                    <label v-for="p in participants" :key="p"
                        class="flex items-center gap-1 bg-white border border-slate-200 rounded-full px-3 py-1 text-xs text-slate-700 shadow-sm">
                        <input type="checkbox" :checked="newExpense.splitParticipants?.includes(p)"
                            @change="handleSplitParticipantChange(p, ($event.target as HTMLInputElement).checked)"
                            class="accent-teal-600" />
                        {{ p }}
                    </label>
                </div>
                <div v-if="!newExpense.splitParticipants || newExpense.splitParticipants.length === 0"
                    class="text-[10px] text-red-500 mt-2">
                    若未選擇，將自動使用全體成員分攤
                </div>
            </div>
        </div>
        <div class="space-y-3">
            <div v-for="(exp, idx) in currentExpenses" :key="getExpenseKey(exp, idx)"
                class="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                <div class="flex items-center gap-3">
                    <div v-if="!isPersonalMode"
                        class="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 text-xs font-bold">
                        {{ exp.payer.charAt(0) }}
                    </div>
                    <div v-else
                        class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold">
                        <i class="ph-bold ph-user"></i>
                    </div>
                    <div>
                        <div class="font-bold text-slate-700 text-sm">{{ exp.item }}</div>
                        <div v-if="!isPersonalMode && exp.splitParticipants && exp.splitParticipants.length > 0"
                            class="text-[11px] text-slate-400 mt-0.5">
                            分攤：{{ exp.splitParticipants.join('、') }}
                        </div>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <span class="font-mono font-bold text-slate-700">{{ currencySymbol }}{{ exp.amount.toLocaleString()
                        }}</span>
                    <button @click="$emit('remove-expense', idx)" class="text-slate-300 hover:text-red-400">
                        <i class="ph-fill ph-x-circle"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Expense, SettlementPlan } from '../types/index';

const props = defineProps<{
    isPersonalMode: boolean;
    currency: string;
    exchangeRate: number;
    currencyLabel: string;
    currencySymbol: string;
    totalExpense: number;
    totalExpenseInTWD: number;
    participantsStr: string;
    participants: string[];
    paidByPerson: Record<string, number>;
    owedByPerson: Record<string, number>;
    settlementPlan: SettlementPlan[];
    newExpense: {
        item: string;
        amount: number;
        payer: string;
        time: string;
        splitParticipants: string[];
    };
    currentExpenses: Expense[];
    getSettlementKey: (plan: SettlementPlan, idx: number) => string;
    getExpenseKey: (exp: Expense, idx: number) => string;
}>();

const emit = defineEmits<{
    'toggle-personal-mode': [];
    'currency-change': [value: string];
    'update:exchangeRate': [value: number];
    'update-participants': [value: string];
    'update:newExpense': [value: any];
    'select-all-splits': [];
    'add-expense': [];
    'remove-expense': [idx: number];
}>();

const handleSplitParticipantChange = (participant: string, checked: boolean) => {
    const current = props.newExpense.splitParticipants || [];
    if (checked) {
        emit('update:newExpense', {
            ...props.newExpense,
            splitParticipants: [...current, participant],
        });
    } else {
        emit('update:newExpense', {
            ...props.newExpense,
            splitParticipants: current.filter((p) => p !== participant),
        });
    }
};
</script>
