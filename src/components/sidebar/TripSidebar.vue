<template>
    <transition name="slide">
        <div v-if="open" class="fixed inset-0 z-50 flex">
            <!-- 側邊欄本體 -->
            <div class="bg-white w-4/5 max-w-xs h-full shadow-2xl flex flex-col relative z-50 p-6">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-xl font-bold text-slate-800">我的旅程</h2>
                    <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600">
                        <i class="ph-bold ph-x text-xl"></i>
                    </button>
                </div>
                <button
                    @click="$emit('create-trip')"
                    class="w-full py-3 mb-3 border-2 border-dashed border-teal-400 text-teal-600 rounded-xl font-bold hover:bg-teal-50 flex items-center justify-center gap-2"
                >
                    <i class="ph-bold ph-plus-circle"></i> 建立新旅程
                </button>
                <button
                    @click="$emit('show-template')"
                    class="w-full py-3 mb-6 bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-xl font-bold hover:from-pink-600 hover:to-orange-600 flex items-center justify-center gap-2 shadow-lg transition-all transform hover:scale-105"
                >
                    <i class="ph-bold ph-sparkle"></i> 載入預設行程模板
                </button>
                <div class="flex-1 overflow-y-auto space-y-3 hide-scroll">
                    <div
                        v-for="trip in tripList"
                        :key="trip.id"
                        class="p-4 rounded-xl border transition relative group"
                        :class="
                            currentTripId === trip.id
                                ? 'bg-teal-50 border-teal-500 shadow-sm'
                                : 'bg-slate-50 border-transparent hover:bg-slate-100'
                        "
                    >
                        <div @click="$emit('switch-trip', trip.id)" class="cursor-pointer">
                            <div class="font-bold text-slate-800">{{ trip.destination || '未命名旅程' }}</div>
                            <div class="text-xs text-slate-400 mt-1">
                                {{ trip.startDate }} • {{ trip.daysCount }} 天
                            </div>
                        </div>

                        <!-- 雲端功能按鈕區 -->
                        <div class="mt-3 flex gap-2" @click.stop>
                            <!-- A: 上傳雲端 -->
                            <button
                                @click="$emit('upload', trip.id)"
                                :disabled="isUploading"
                                class="flex-1 py-2 px-3 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                            >
                                <i
                                    v-if="isUploading && currentTripId === trip.id"
                                    class="ph-bold ph-spinner animate-spin"
                                ></i>
                                <i v-else class="ph-bold ph-cloud-arrow-up"></i>
                                上傳雲端
                            </button>

                            <!-- B: 同步 -->
                            <button
                                v-if="getTripCloudStatus(trip.id)"
                                @click="$emit('sync', trip.id)"
                                :disabled="isSyncing"
                                class="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                            >
                                <i
                                    v-if="isSyncing && currentTripId === trip.id"
                                    class="ph-bold ph-spinner animate-spin"
                                ></i>
                                <i v-else class="ph-bold ph-arrows-clockwise"></i>
                                同步
                            </button>

                            <!-- C: 分享邀請碼 -->
                            <button
                                v-if="getTripCloudStatus(trip.id)"
                                @click="$emit('invite', trip.id)"
                                class="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5"
                            >
                                <i class="ph-bold ph-share-network"></i>
                                分享
                            </button>
                        </div>

                        <button
                            v-if="tripList.length > 1"
                            @click.stop="$emit('delete-trip', trip.id)"
                            class="absolute right-3 top-3 text-slate-300 hover:text-red-500 p-1"
                        >
                            <i class="ph-bold ph-trash"></i>
                        </button>
                    </div>
                </div>

                <!-- 清除所有本地資料 -->
                <div class="mt-4 pt-4 border-t border-slate-200">
                    <button
                        @click="$emit('clear-local')"
                        class="w-full py-2 px-3 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5"
                    >
                        <i class="ph-bold ph-trash"></i>
                        清除所有本地端資料
                    </button>
                </div>
            </div>
            <!-- 背景遮罩 -->
            <div class="flex-1 bg-black/50 backdrop-blur-sm z-40" @click="$emit('close')"></div>
        </div>
    </transition>
</template>

<script setup lang="ts">
import type { TripMeta } from '../types';

defineProps<{
    open: boolean;
    tripList: TripMeta[];
    currentTripId: string | null;
    isUploading: boolean;
    isSyncing: boolean;
    getTripCloudStatus: (tripId: string) => any;
}>();

defineEmits<{
    (e: 'close'): void;
    (e: 'create-trip'): void;
    (e: 'show-template'): void;
    (e: 'switch-trip', id: string): void;
    (e: 'upload', id: string): void;
    (e: 'sync', id: string): void;
    (e: 'invite', id: string): void;
    (e: 'delete-trip', id: string): void;
    (e: 'clear-local'): void;
}>();
</script>


