<template>
    <div>
        <!-- 成員設定 -->
        <div class="mb-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <div class="text-xs font-bold text-slate-400 mb-2">分帳成員 (用逗號分隔)</div>
            <input
                :value="participantsStr"
                @change="$emit('update-participants', ($event.target as HTMLInputElement).value)"
                class="w-full text-sm bg-slate-50 rounded px-2 py-1 border border-slate-200"
                placeholder="例如: 我, 朋友A, 朋友B"
            />
        </div>
        <!-- 成員卡片 -->
        <div class="grid grid-cols-2 gap-2 mb-6">
            <div
                v-for="p in participants"
                :key="p"
                class="bg-white p-3 rounded-xl border border-slate-100 text-center shadow-sm"
            >
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
                    <div
                        :class="
                            (paidByPerson[p] || 0) - (owedByPerson[p] || 0) > 0
                                ? 'text-red-600 font-bold'
                                : (paidByPerson[p] || 0) - (owedByPerson[p] || 0) < 0
                                  ? 'text-teal-600 font-bold'
                                  : 'text-slate-500 font-bold'
                        "
                        class="text-sm"
                    >
                        <template v-if="(paidByPerson[p] || 0) - (owedByPerson[p] || 0) > 0">+</template>
                        {{ currencySymbol
                        }}{{ Math.abs(Math.round((paidByPerson[p] || 0) - (owedByPerson[p] || 0))).toLocaleString() }}
                    </div>
                    <div
                        v-if="(paidByPerson[p] || 0) - (owedByPerson[p] || 0) > 0"
                        class="text-[9px] text-red-500 mt-0.5"
                    >
                        應收
                    </div>
                    <div
                        v-else-if="(paidByPerson[p] || 0) - (owedByPerson[p] || 0) < 0"
                        class="text-[9px] text-teal-500 mt-0.5"
                    >
                        應付
                    </div>
                    <div v-else class="text-[9px] text-slate-400 mt-0.5">已結清</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
interface Props {
    participantsStr: string;
    participants: string[];
    paidByPerson: Record<string, number>;
    owedByPerson: Record<string, number>;
    currencySymbol: string;
}

defineProps<Props>();

defineEmits<{
    'update-participants': [value: string];
}>();
</script>

