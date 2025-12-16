<template>
    <transition name="fade">
        <div v-if="open" class="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="$emit('close')"></div>
            <div
                class="relative bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 space-y-4 animate-fade-in"
                @click.stop
            >
                <div class="space-y-1">
                    <p class="text-lg font-bold text-teal-600">請輸入旅程標題</p>
                    <p class="text-xs text-slate-500">讓旅程擁有專屬名稱</p>
                </div>
                <div>
                    <input
                        :value="editingValue"
                        @input="$emit('update:editingValue', ($event.target as HTMLInputElement).value)"
                        @keyup.enter="$emit('save')"
                        @keyup.esc="$emit('close')"
                        ref="inputRef"
                        class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="你的旅程?"
                        autofocus
                    />
                </div>
                <div class="flex gap-3 pt-1">
                    <button
                        @click="$emit('close')"
                        class="flex-1 h-11 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition"
                    >
                        取消
                    </button>
                    <button
                        @click="$emit('save')"
                        class="flex-1 h-11 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 shadow-sm transition"
                    >
                        修改
                    </button>
                </div>
            </div>
        </div>
    </transition>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';

interface Props {
    open: boolean;
    editingValue: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    'update:editingValue': [value: string];
    close: [];
    save: [];
}>();

const inputRef = ref<HTMLInputElement | null>(null);

watch(
    () => props.open,
    (newVal) => {
        if (newVal) {
            nextTick(() => {
                inputRef.value?.focus();
                inputRef.value?.select();
            });
        }
    }
);
</script>

