<template>
    <div class="flex overflow-x-auto hide-scroll px-2 pt-1 pb-3 space-x-3 snap-x">
        <div v-for="(day, index) in days" :key="getDayKey(day, index)" @click="$emit('change', index)"
            class="snap-center shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-xl cursor-pointer transition-all border-2 camp-day"
            :class="currentDayIdx === index ? 'camp-day-active scale-105 translate-y-[1px]' : 'camp-day-inactive'">
            <span class="text-xs font-medium opacity-80">{{ day.shortDate }}</span>
            <span class="text-lg font-bold">D{{ index + 1 }}</span>
        </div>
        <button @click="$emit('add-day')"
            class="shrink-0 w-12 h-16 rounded-xl flex items-center justify-center border-2 border-dashed camp-day-add transition"
            title="新增一天">
            <i class="ph-bold ph-plus"></i>
        </button>
    </div>
</template>

<script setup lang="ts">
import type { Day } from '../types/index';

interface Props {
    days: Day[];
    currentDayIdx: number;
    getDayKey: (day: Day, index: number) => string | number;
}

defineProps<Props>();

defineEmits<{
    change: [index: number];
    'add-day': [];
}>();
</script>

<style scoped>
.hide-scroll {
    -ms-overflow-style: none;
    scrollbar-width: none;
}

.hide-scroll::-webkit-scrollbar {
    display: none;
}
</style>
