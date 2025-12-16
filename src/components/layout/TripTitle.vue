<template>
    <div class="overflow-hidden flex-1">
        <h1 class="text-xl font-bold tracking-wide flex items-center gap-2 truncate">
            <button
                @click="$emit('start-edit')"
                class="flex items-center gap-2 truncate min-w-0 text-left text-teal-50 hover:text-white transition focus:outline-none"
            >
                <span class="destination-text camp-title" ref="titleTextRef">
                    {{ displayTitle }}
                </span>
            </button>
            <i class="ph-fill ph-airplane-tilt text-sm opacity-70"></i>
            <!-- 複製邀請碼按鈕（僅雲端旅程顯示） -->
            <button
                v-if="isCloudTrip && inviteCode"
                @click="$emit('copy-invite-code')"
                class="ml-1 w-6 h-6 flex items-center justify-center text-teal-100 hover:text-white hover:bg-white/20 rounded transition-all cursor-pointer shrink-0"
                title="複製邀請碼"
            >
                <i class="ph-bold ph-copy text-sm"></i>
            </button>
        </h1>
    </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

interface Props {
    title: string;
    isCloudTrip?: boolean;
    inviteCode?: string;
}

const props = defineProps<Props>();

defineEmits<{
    'start-edit': [];
    'copy-invite-code': [];
}>();

const titleTextRef = ref<HTMLElement | null>(null);

const displayTitle = computed(() => {
    return (props.title && props.title.trim()) || '你的旅程?';
});

const adjustTitleFontSize = () => {
    nextTick(() => {
        if (!titleTextRef.value) return;
        const element = titleTextRef.value as HTMLElement;
        const maxWidth = window.innerWidth <= 400 ? 100 : 140;
        element.style.maxWidth = `${maxWidth}px`;
        element.style.fontSize = '1.25rem';
        const scrollWidth = element.scrollWidth;
        const clientWidth = element.clientWidth || maxWidth;
        if (scrollWidth > clientWidth) {
            const ratio = clientWidth / scrollWidth;
            const baseSize = 20;
            const newSize = Math.max(baseSize * ratio * 0.95, 12);
            element.style.fontSize = `${newSize}px`;
        } else {
            element.style.fontSize = '1.25rem';
        }
    });
};

watch(
    () => props.title,
    () => {
        adjustTitleFontSize();
    }
);

onMounted(() => {
    window.addEventListener('resize', adjustTitleFontSize);
    adjustTitleFontSize();
});

onBeforeUnmount(() => {
    window.removeEventListener('resize', adjustTitleFontSize);
});
</script>

