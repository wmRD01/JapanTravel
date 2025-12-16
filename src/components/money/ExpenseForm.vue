<template>
    <div class="bg-white rounded-xl shadow-sm p-4 mb-6 border border-slate-100">
        <div class="flex gap-2 mb-2">
            <input
                :value="newExpense.item"
                @input="$emit('update:newExpense', { ...newExpense, item: ($event.target as HTMLInputElement).value })"
                placeholder="項目"
                class="flex-1 bg-slate-50 border-none rounded-lg text-sm px-3 py-2"
            />
            <select
                v-if="!isPersonalMode"
                :value="newExpense.payer"
                @change="$emit('update:newExpense', { ...newExpense, payer: ($event.target as HTMLSelectElement).value })"
                class="w-[120px] bg-slate-50 border-none rounded-lg text-sm px-2 py-2 min-w-0"
            >
                <option v-for="p in participants" :key="p" :value="p">{{ p }}</option>
            </select>
        </div>
        <div class="flex gap-2 mb-2">
            <input
                :value="newExpense.time"
                @input="$emit('update:newExpense', { ...newExpense, time: ($event.target as HTMLInputElement).value })"
                type="datetime-local"
                placeholder="時間（選填）"
                class="flex-1 bg-slate-50 border-none rounded-lg text-sm px-3 py-2"
            />
        </div>
        <div class="flex gap-2">
            <input
                :value="newExpense.amount"
                @input="$emit('update:newExpense', { ...newExpense, amount: parseFloat(($event.target as HTMLInputElement).value) || 0 })"
                type="number"
                :placeholder="currencySymbol + ' 金額'"
                class="w-full bg-slate-50 border-none rounded-lg text-sm pl-3 pr-3 py-2 font-mono"
            />
            <button
                v-if="!isPersonalMode"
                @click="$emit('select-all-splits')"
                class="bg-slate-100 text-slate-600 px-3 py-2 rounded-lg text-xs font-bold border border-slate-200"
                title="全選分攤成員"
            >
                全選
            </button>
            <button @click="$emit('add-expense')" class="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-bold">
                <i class="ph-bold ph-plus"></i>
            </button>
        </div>
        <div v-if="!isPersonalMode" class="bg-slate-50 rounded-lg border border-slate-200 p-3 mt-2">
            <div class="text-[11px] text-slate-500 font-bold mb-2">分攤成員</div>
            <div class="flex flex-wrap gap-2">
                <label
                    v-for="p in participants"
                    :key="p"
                    class="flex items-center gap-1 bg-white border border-slate-200 rounded-full px-3 py-1 text-xs text-slate-700 shadow-sm"
                >
                    <input
                        type="checkbox"
                        :checked="newExpense.splitParticipants?.includes(p)"
                        @change="handleSplitParticipantChange(p, ($event.target as HTMLInputElement).checked)"
                        class="accent-teal-600"
                    />
                    {{ p }}
                </label>
            </div>
            <div v-if="!newExpense.splitParticipants || newExpense.splitParticipants.length === 0" class="text-[10px] text-red-500 mt-2">
                若未選擇，將自動使用全體成員分攤
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
interface Props {
    isPersonalMode: boolean;
    participants: string[];
    currencySymbol: string;
    newExpense: {
        item: string;
        amount: number;
        payer: string;
        time: string;
        splitParticipants: string[];
    };
}

const props = defineProps<Props>();

const emit = defineEmits<{
    'update:newExpense': [value: any];
    'select-all-splits': [];
    'add-expense': [];
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

