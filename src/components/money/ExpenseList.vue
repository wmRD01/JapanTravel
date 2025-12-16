<template>
    <div class="space-y-3">
        <div
            v-for="(exp, idx) in currentExpenses"
            :key="getExpenseKey(exp, idx)"
            class="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm"
        >
            <div class="flex items-center gap-3">
                <div
                    v-if="!isPersonalMode"
                    class="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 text-xs font-bold"
                >
                    {{ exp.payer.charAt(0) }}
                </div>
                <div v-else class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold">
                    <i class="ph-bold ph-user"></i>
                </div>
                <div>
                    <div class="font-bold text-slate-700 text-sm">{{ exp.item }}</div>
                    <div v-if="!isPersonalMode && exp.splitParticipants && exp.splitParticipants.length > 0" class="text-[11px] text-slate-400 mt-0.5">
                        分攤：{{ exp.splitParticipants.join('、') }}
                    </div>
                </div>
            </div>
            <div class="flex items-center gap-3">
                <span class="font-mono font-bold text-slate-700">{{ currencySymbol }}{{ exp.amount.toLocaleString() }}</span>
                <button @click="$emit('remove-expense', idx)" class="text-slate-300 hover:text-red-400">
                    <i class="ph-fill ph-x-circle"></i>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Expense } from '../types/index';

interface Props {
    isPersonalMode: boolean;
    currencySymbol: string;
    currentExpenses: Expense[];
    getExpenseKey: (exp: Expense, idx: number) => string;
}

defineProps<Props>();

defineEmits<{
    'remove-expense': [idx: number];
}>();
</script>

