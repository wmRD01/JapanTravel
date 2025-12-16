<template>
    <transition name="fade">
        <div v-if="open" class="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="$emit('close')"></div>
            <div
                class="relative bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 space-y-4 animate-fade-in"
                @click.stop
            >
                <div class="space-y-1">
                    <p class="text-lg font-bold text-orange-500">編輯備註</p>
                    <p class="text-xs text-slate-500">點擊右上角關閉或下方儲存</p>
                </div>
                <div>
                    <textarea
                        :value="value"
                        @input="$emit('update:value', ($event.target as HTMLTextAreaElement).value)"
                        @keyup.esc="$emit('close')"
                        class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-300 min-h-[140px] max-h-[260px] overflow-y-auto leading-relaxed"
                        placeholder="輸入備註..."
                    ></textarea>
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
                        class="flex-1 h-11 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 shadow-sm transition"
                    >
                        儲存
                    </button>
                </div>
            </div>
        </div>
    </transition>
</template>

<script setup lang="ts">
interface Props {
    open: boolean;
    value: string;
}

defineProps<Props>();

defineEmits<{
    'update:value': [value: string];
    close: [];
    save: [];
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

@keyframes fade-in {
    from {
        opacity: 0;
        transform: scale(0.95);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}

.animate-fade-in {
    animation: fade-in 0.2s ease-out;
}
</style>

