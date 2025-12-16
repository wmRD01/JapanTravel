<template>
    <div class="bg-teal-600 text-white rounded-2xl p-6 shadow-lg mb-6 text-center relative">
        <div class="absolute top-4 right-4 flex flex-col items-end gap-2 z-10">
            <!-- 個人/多人記帳切換按鈕 -->
            <button
                @click="$emit('toggle-personal-mode')"
                :class="isPersonalMode ? 'bg-white text-teal-600' : 'bg-teal-500/30 text-white'"
                class="relative z-20 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm hover:bg-teal-500/50 flex items-center gap-1.5 cursor-pointer"
                title="切換個人/多人記帳模式"
            >
                <i :class="isPersonalMode ? 'ph-bold ph-user' : 'ph-bold ph-users'"></i>
                <span>{{ isPersonalMode ? '個人' : '多人' }}</span>
            </button>
            <!-- 匯率輸入 -->
            <div class="flex flex-col items-end relative z-10 gap-2">
                <div class="flex items-center gap-2">
                    <label class="text-[10px] text-teal-200 mb-0.5">幣別</label>
                    <select
                        :value="currency"
                        @change="$emit('currency-change', ($event.target as HTMLSelectElement).value)"
                        class="bg-white/90 text-xs text-teal-900 rounded px-2 py-1 border border-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-300"
                    >
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
                    <input
                        :value="exchangeRate"
                        @input="$emit('update:exchangeRate', parseFloat(($event.target as HTMLInputElement).value) || 0)"
                        type="number"
                        step="0.001"
                        class="w-20 text-right text-xs text-teal-900 rounded px-2 py-1 border border-teal-200"
                    />
                </div>
            </div>
        </div>
        <div class="text-sm opacity-80 mb-1">{{ isPersonalMode ? '個人總支出' : '總支出 Total' }}</div>
        <div class="text-4xl font-bold font-mono">{{ currencySymbol }} {{ totalExpense.toLocaleString() }}</div>
        <div class="text-lg font-bold text-teal-200 mt-1">≈ NT$ {{ totalExpenseInTWD.toLocaleString() }}</div>
    </div>
</template>

<script setup lang="ts">
interface Props {
    isPersonalMode: boolean;
    currency: string;
    exchangeRate: number;
    currencyLabel: string;
    currencySymbol: string;
    totalExpense: number;
    totalExpenseInTWD: number;
}

defineProps<Props>();

defineEmits<{
    'toggle-personal-mode': [];
    'currency-change': [value: string];
    'update:exchangeRate': [value: number];
}>();
</script>

