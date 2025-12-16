<template>
    <header class="camp-header text-white shrink-0 z-20 shadow-md">
        <div class="p-4 flex justify-between items-center">
            <div class="flex items-center gap-3">
                <!-- 側邊欄選單按鈕 -->
                <button @click="$emit('show-trip-menu')" class="text-teal-100 hover:text-white transition">
                    <i class="ph-bold ph-list text-2xl"></i>
                </button>
                <TripTitle
                    :title="title"
                    :is-cloud-trip="isCloudTrip"
                    :invite-code="inviteCode"
                    @start-edit="$emit('start-edit-title')"
                    @copy-invite-code="$emit('copy-invite-code')"
                />
            </div>
            <ViewModeToggle :view-mode="viewMode" @change="$emit('update:viewMode', $event)" />
        </div>
        <DayTabs
            :days="days"
            :current-day-idx="currentDayIdx"
            :get-day-key="getDayKey"
            @change="$emit('update:currentDayIdx', $event)"
            @add-day="$emit('add-day')"
        />
    </header>
</template>

<script setup lang="ts">
import type { Day } from '../types/index';
import DayTabs from './DayTabs.vue';
import TripTitle from './TripTitle.vue';
import ViewModeToggle from './ViewModeToggle.vue';

interface Props {
    title: string;
    viewMode: 'plan' | 'map' | 'money' | 'translate';
    currentDayIdx: number;
    days: Day[];
    isCloudTrip?: boolean;
    inviteCode?: string;
    getDayKey: (day: Day, index: number) => string | number;
}

defineProps<Props>();

defineEmits<{
    'show-trip-menu': [];
    'start-edit-title': [];
    'copy-invite-code': [];
    'update:viewMode': [mode: 'plan' | 'map' | 'money' | 'translate'];
    'update:currentDayIdx': [index: number];
    'add-day': [];
}>();
</script>

