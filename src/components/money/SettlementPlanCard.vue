<template>
    <div v-if="settlementPlan.length > 0" class="bg-teal-50 rounded-xl p-4 mb-6 border border-teal-100">
        <h3 class="text-xs font-bold text-teal-400 uppercase tracking-wide mb-3">結帳建議</h3>
        <div class="space-y-2">
            <div
                v-for="(plan, idx) in settlementPlan"
                :key="getSettlementKey(plan, idx)"
                class="flex items-center justify-between text-sm bg-white p-2 rounded-lg shadow-sm"
            >
                <span class="font-bold text-slate-600">
                    {{ plan.from }} <i class="ph-bold ph-arrow-right text-xs"></i> {{ plan.to }}
                </span>
                <span class="font-mono font-bold text-teal-600">{{ currencySymbol }}{{ plan.amount.toLocaleString() }}</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { SettlementPlan } from '../types/index';

interface Props {
    settlementPlan: SettlementPlan[];
    currencySymbol: string;
    getSettlementKey: (plan: SettlementPlan, idx: number) => string;
}

defineProps<Props>();
</script>

