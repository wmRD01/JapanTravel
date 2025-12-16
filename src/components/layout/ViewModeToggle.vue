<template>
    <div class="flex items-center gap-2 shrink-0">
        <div class="flex camp-toggle p-1 rounded-xl">
            <button
                @click="$emit('change', 'plan')"
                :class="viewMode === 'plan' ? 'camp-toggle-btn-active' : 'camp-toggle-btn'"
                class="p-2 rounded-lg transition-all"
                title="行程"
            >
                <i class="ph-bold ph-calendar-check text-lg"></i>
            </button>
            <button
                @click="$emit('change', 'map')"
                :class="viewMode === 'map' ? 'camp-toggle-btn-active' : 'camp-toggle-btn'"
                class="p-2 rounded-lg transition-all"
                title="地圖"
            >
                <i class="ph-bold ph-map-trifold text-lg"></i>
            </button>
            <button
                @click="$emit('change', 'money')"
                :class="viewMode === 'money' ? 'camp-toggle-btn-active' : 'camp-toggle-btn'"
                class="p-2 rounded-lg transition-all"
                title="分帳"
            >
                <i class="ph-bold ph-currency-dollar text-lg"></i>
            </button>
            <button
                @click="$emit('change', 'translate')"
                :class="viewMode === 'translate' ? 'camp-toggle-btn-active' : 'camp-toggle-btn'"
                class="p-2 rounded-lg transition-all"
                title="翻譯"
            >
                <i class="ph-bold ph-translate text-xl"></i>
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
interface Props {
    viewMode: 'plan' | 'map' | 'money' | 'translate';
}

defineProps<Props>();

defineEmits<{
    change: [mode: 'plan' | 'map' | 'money' | 'translate'];
}>();
</script>

