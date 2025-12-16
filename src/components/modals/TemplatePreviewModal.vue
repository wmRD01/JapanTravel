<template>
    <transition name="fade">
        <div
            v-if="open"
            class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            @click.self="$emit('close')"
        >
            <div class="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-xl max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-bold">預設模板</h3>
                    <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600">
                        <i class="ph-bold ph-x text-xl"></i>
                    </button>
                </div>
                <div class="space-y-4">
                    <div
                        class="border border-slate-200 rounded-lg p-4 hover:border-teal-400 hover:shadow-md transition cursor-pointer"
                        @click="$emit('load-template', templateId)"
                    >
                        <div class="flex justify-between items-start">
                            <div>
                                <h4 class="font-bold text-slate-800 mb-1">{{ templateTitle }}</h4>
                                <p class="text-sm text-slate-600 mb-2">{{ templateDays }} 天</p>
                                <p class="text-xs text-slate-500">
                                    總支出：{{ templateExpensesTotal.toLocaleString() }} {{ currency }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </transition>
</template>

<script setup lang="ts">
interface Props {
    open: boolean;
    templateId: string;
    templateTitle: string;
    templateDays: number;
    templateExpensesTotal: number;
    currency: string;
}

defineProps<Props>();

defineEmits<{
    close: [];
    'load-template': [templateId: string];
}>();
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>

