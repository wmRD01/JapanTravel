<template>
    <div class="p-4 pb-24 plan-surface">
        <MoneySummaryCard
            :is-personal-mode="isPersonalMode"
            :currency="currency"
            :exchange-rate="exchangeRate"
            :currency-label="currencyLabel"
            :currency-symbol="currencySymbol"
            :total-expense="totalExpense"
            :total-expense-in-t-w-d="totalExpenseInTWD"
            @toggle-personal-mode="$emit('toggle-personal-mode')"
            @currency-change="$emit('currency-change', $event)"
            @update:exchangeRate="$emit('update:exchangeRate', $event)"
        />
        <!-- 成員設定（僅多人記帳模式顯示） -->
        <ParticipantsSection
            v-if="!isPersonalMode"
            :participants-str="participantsStr"
            :participants="participants"
            :paid-by-person="paidByPerson"
            :owed-by-person="owedByPerson"
            :currency-symbol="currencySymbol"
            @update-participants="$emit('update-participants', $event)"
        />
        <SettlementPlanCard
            v-if="!isPersonalMode"
            :settlement-plan="settlementPlan"
            :currency-symbol="currencySymbol"
            :get-settlement-key="getSettlementKey"
        />
        <ExpenseForm
            :is-personal-mode="isPersonalMode"
            :participants="participants"
            :currency-symbol="currencySymbol"
            :new-expense="newExpense"
            @update:newExpense="$emit('update:newExpense', $event)"
            @select-all-splits="$emit('select-all-splits')"
            @add-expense="$emit('add-expense')"
        />
        <ExpenseList
            :is-personal-mode="isPersonalMode"
            :currency-symbol="currencySymbol"
            :current-expenses="currentExpenses"
            :get-expense-key="getExpenseKey"
            @remove-expense="$emit('remove-expense', $event)"
        />
    </div>
</template>

<script setup lang="ts">
import type { Expense, SettlementPlan } from '../types/index';
import MoneySummaryCard from './MoneySummaryCard.vue';
import ParticipantsSection from './ParticipantsSection.vue';
import SettlementPlanCard from './SettlementPlanCard.vue';
import ExpenseForm from './ExpenseForm.vue';
import ExpenseList from './ExpenseList.vue';

defineProps<{
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

defineEmits<{
    'toggle-personal-mode': [];
    'currency-change': [value: string];
    'update:exchangeRate': [value: number];
    'update-participants': [value: string];
    'update:newExpense': [value: any];
    'select-all-splits': [];
    'add-expense': [];
    'remove-expense': [idx: number];
}>();
</script>
