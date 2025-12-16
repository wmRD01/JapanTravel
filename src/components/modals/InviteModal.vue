<template>
    <transition name="fade">
        <div
            v-if="open"
            class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            @click.self="$emit('close')"
        >
            <div class="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-bold">分享旅程</h3>
                    <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600">
                        <i class="ph-bold ph-x text-xl"></i>
                    </button>
                </div>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">邀請碼</label>
                        <div class="flex gap-2">
                            <input
                                :value="inviteCode"
                                readonly
                                class="flex-1 border border-slate-300 rounded-lg px-3 py-2 bg-slate-50"
                            />
                            <button
                                @click="$emit('copy-invite-code')"
                                class="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition"
                            >
                                複製
                            </button>
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">邀請連結</label>
                        <div class="flex gap-2">
                            <input
                                :value="inviteLink"
                                readonly
                                class="flex-1 border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 text-xs"
                            />
                            <button
                                @click="$emit('copy-invite-link')"
                                class="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition"
                            >
                                複製
                            </button>
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
    inviteCode: string;
    inviteLink: string;
}

defineProps<Props>();

defineEmits<{
    close: [];
    'copy-invite-code': [];
    'copy-invite-link': [];
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

