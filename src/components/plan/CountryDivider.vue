<template>
    <div class="relative group">
        <div
            class="absolute -left-[21px] top-3 w-3 h-3 rounded-full border-2 border-white shadow-sm bg-gradient-to-br from-blue-500 to-purple-500"
        ></div>
        <div
            class="bg-gradient-to-r from-blue-50 to-purple-50 px-3 rounded-xl shadow-md border-2 border-blue-200 hover:shadow-lg transition-shadow"
        >
            <div class="flex items-center gap-1">
                <!-- 上下移動按鈕 -->
                <div class="flex flex-col gap-0">
                    <button
                        @click="$emit('move-up')"
                        :disabled="isFirst"
                        :class="[
                            'rounded transition',
                            isFirst
                                ? 'text-slate-300 cursor-not-allowed'
                                : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50'
                        ]"
                        title="上移"
                    >
                        <i class="ph-bold ph-caret-up text-xs"></i>
                    </button>
                    <button
                        @click="$emit('move-down')"
                        :disabled="isLast"
                        :class="[
                            'rounded transition',
                            isLast
                                ? 'text-slate-300 cursor-not-allowed'
                                : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50'
                        ]"
                        title="下移"
                    >
                        <i class="ph-bold ph-caret-down text-xs"></i>
                    </button>
                </div>
                <!-- 國家資訊 -->
                <div class="flex-1 flex items-center gap-3">
                    <span class="text-lg font-bold text-slate-800 ml-3">{{ country || activity }}</span>
                </div>
                <!-- 操作按鈕 -->
                <div class="flex items-center gap-2">
                    <button
                        @click="$emit('edit')"
                        class="text-blue-500 hover:text-blue-700 p-1 rounded transition"
                        title="編輯國家"
                    >
                        <i class="ph-bold ph-pencil"></i>
                    </button>
                    <button
                        @click="$emit('remove')"
                        class="text-red-400 hover:text-red-600 p-1 rounded transition"
                        title="刪除國家區塊"
                    >
                        <i class="ph-bold ph-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
interface Props {
    country?: string;
    activity?: string;
    isFirst: boolean;
    isLast: boolean;
}

defineProps<Props>();

defineEmits<{
    'move-up': [];
    'move-down': [];
    edit: [];
    remove: [];
}>();
</script>

