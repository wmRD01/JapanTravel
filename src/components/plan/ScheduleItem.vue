<template>
    <div class="relative group">
        <div
            class="absolute -left-[21px] top-3 w-3 h-3 rounded-full border-2 border-white shadow-sm"
            :class="dotColorClass"
        ></div>
        <div class="bg-white p-3 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div class="flex flex-col gap-2">
                <div class="flex items-start gap-3">
                    <!-- 上下移動按鈕 -->
                    <div class="flex flex-col gap-0.5 pt-1 flex-shrink-0">
                        <button
                            @click="$emit('move-up')"
                            :disabled="isFirst"
                            :class="[
                                'p-0.5 rounded transition',
                                isFirst
                                    ? 'text-slate-300 cursor-not-allowed'
                                    : 'text-slate-400 hover:text-teal-600 hover:bg-teal-50'
                            ]"
                            title="上移"
                        >
                            <i class="ph-bold ph-caret-up text-xs"></i>
                        </button>
                        <button
                            @click="$emit('move-down')"
                            :disabled="isLast"
                            :class="[
                                'p-0.5 rounded transition',
                                isLast
                                    ? 'text-slate-300 cursor-not-allowed'
                                    : 'text-slate-400 hover:text-teal-600 hover:bg-teal-50'
                            ]"
                            title="下移"
                        >
                            <i class="ph-bold ph-caret-down text-xs"></i>
                        </button>
                    </div>
                    <!-- 時間輸入塊 -->
                    <div class="flex flex-col items-center w-20 shrink-0 gap-2">
                        <div
                            class="relative flex flex-col items-center justify-center bg-slate-50 border border-slate-200 rounded-xl p-1 w-full h-16 cursor-pointer hover:bg-teal-50 hover:border-teal-200 transition group/time"
                        >
                            <input
                                :value="item.time"
                                @input="updateItem('time', ($event.target as HTMLInputElement).value)"
                                type="time"
                                class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-0"
                            />
                            <button @click="openTimePicker" class="time-picker-button">
                                <span class="time-picker-period">
                                    {{ timePeriod }}
                                </span>
                                <span class="time-picker-time">
                                    {{ item.time || '選擇時間 🕒' }}
                                </span>
                            </button>
                        </div>
                        <select
                            :value="item.type"
                            @change="updateItem('type', ($event.target as HTMLSelectElement).value)"
                            class="text-[10px] bg-white border border-slate-200 rounded-md py-1 px-1 w-full text-center"
                        >
                            <option value="spot">📍 景點</option>
                            <option value="food">🍴 美食</option>
                            <option value="shop">🛍️ 購物</option>
                            <option value="transport">🚇 交通</option>
                            <option value="flight">✈️ 航班</option>
                        </select>
                    </div>
                    <!-- 內容輸入 -->
                    <div class="flex-1 min-w-0 pt-1">
                        <input
                            :value="item.activity"
                            @input="updateItem('activity', ($event.target as HTMLInputElement).value)"
                            class="block w-full font-bold text-slate-800 bg-transparent border-none p-0 focus:ring-0"
                            placeholder="行程名稱..."
                        />
                        <div class="flex items-center gap-1 mt-1">
                            <i class="ph-fill ph-map-pin text-teal-400 text-xs"></i>
                            <input
                                :value="item.location"
                                @input="updateItem('location', ($event.target as HTMLInputElement).value)"
                                class="flex-1 text-xs text-slate-500 bg-transparent border-none p-0 focus:ring-0 truncate"
                                placeholder="輸入地點 (例如: 新宿)"
                            />
                        </div>
                        <div class="flex items-start gap-1 mt-1">
                            <i class="ph-bold ph-info text-orange-400 text-xs mt-0.5"></i>
                            <div class="flex-1 min-w-0">
                                <button @click="$emit('start-edit-note')" class="w-full text-left">
                                    <div
                                        class="w-full bg-orange-50 border border-orange-100 rounded-lg px-3 py-2 text-xs text-orange-700/90 min-h-[44px] max-h-24 overflow-y-auto whitespace-pre-wrap leading-relaxed hover:border-orange-200 hover:bg-orange-50/80 transition"
                                    >
                                        <span v-if="item.note && item.note.trim()">
                                            {{ item.note }}
                                        </span>
                                        <span v-else class="text-orange-300">點擊新增備註...</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-col gap-2">
                        <a
                            v-if="item.location && item.location.trim()"
                            :href="googleMapLink"
                            target="_blank"
                            class="text-teal-500 hover:bg-teal-50 p-1 rounded"
                        >
                            <i class="ph-bold ph-navigation-arrow"></i>
                        </a>
                        <button @click="$emit('remove')" class="text-red-300 hover:text-red-500 p-1 rounded">
                            <i class="ph-bold ph-trash"></i>
                        </button>
                    </div>
                </div>
                <!-- 地區設定與天氣預報 -->
                <div class="mt-3 pt-3 border-t border-slate-100">
                    <div class="flex items-start gap-2">
                        <!-- 地區輸入框區域 -->
                        <div class="flex-1 min-w-0">
                            <div class="relative flex items-center gap-2">
                                <i
                                    v-if="isWeatherLoading"
                                    class="ph-bold ph-spinner text-teal-500 text-xs flex-shrink-0 animate-spin"
                                ></i>
                                <i v-else class="ph-bold ph-map-pin text-teal-500 text-xs flex-shrink-0"></i>
                                <input
                                    :value="item.region"
                                    @input="updateItem('region', ($event.target as HTMLInputElement).value)"
                                    :disabled="isWeatherLoading || isDayWeatherLoading"
                                    @blur="$emit('region-change')"
                                    @keyup.enter="$emit('region-change')"
                                    :class="[
                                        'flex-1 text-xs border rounded-lg px-2 py-1.5 pr-8 transition min-w-0',
                                        isWeatherLoading || isDayWeatherLoading
                                            ? 'bg-slate-100 border-slate-300 text-slate-400 cursor-not-allowed'
                                            : 'bg-slate-50 border-slate-200 text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500'
                                    ]"
                                    placeholder="設定地區（例如：東京、大阪）"
                                />
                                <button
                                    v-if="item.region && !isWeatherLoading && !isDayWeatherLoading"
                                    @mousedown.prevent
                                    @click.stop="$emit('clear-region')"
                                    class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition p-0.5 z-10 flex-shrink-0"
                                    title="清除地區"
                                >
                                    <i class="ph-bold ph-x text-sm"></i>
                                </button>
                            </div>
                        </div>
                        <!-- 天氣預報顯示 -->
                        <div class="flex-shrink-0 w-[100px]">
                            <!-- 載入中狀態 -->
                            <div
                                v-if="isWeatherLoading || (isDayWeatherLoading && item.region?.trim())"
                                class="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg px-2 py-1.5 border border-slate-200"
                            >
                                <div class="flex items-center gap-1.5 justify-center">
                                    <i class="ph-bold ph-spinner text-teal-500 text-xs animate-spin"></i>
                                    <span class="text-xs text-slate-500">載入中...</span>
                                </div>
                            </div>
                            <!-- 天氣資訊顯示 -->
                            <div
                                v-else-if="weatherDisplay"
                                class="bg-gradient-to-br from-teal-50 to-blue-50 rounded-lg px-2 py-1.5 border border-teal-100"
                            >
                                <div class="flex items-center gap-2">
                                    <!-- 左側：天氣圖案和度數 -->
                                    <div class="flex flex-col items-center flex-shrink-0">
                                        <i
                                            :class="[
                                                'ph-duotone',
                                                weatherDisplay.icon || 'ph-sun',
                                                'text-base text-teal-600'
                                            ]"
                                        ></i>
                                        <span class="text-xs font-bold text-slate-800 leading-tight mt-0.5">
                                            {{ weatherDisplay.temp || '--' }}
                                        </span>
                                    </div>
                                    <!-- 右側：文字說明 -->
                                    <div class="flex-1 min-w-0 text-left">
                                        <span class="text-[9px] text-slate-600 leading-tight block whitespace-normal break-words">
                                            {{ weatherDisplay.label || '' }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div v-else class="bg-slate-50 rounded-lg px-2 py-1.5 border border-slate-200">
                                <div class="flex items-center gap-1.5">
                                    <i class="ph-bold ph-cloud-slash text-slate-300 text-sm flex-shrink-0"></i>
                                    <span class="text-[10px] text-slate-400 truncate">未設定</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 智慧推薦區 (僅美食) -->
                <div v-if="item.type === 'food'" class="p-2 bg-orange-50 rounded-lg border border-orange-100/50 mt-1">
                    <div class="flex items-center justify-between mb-1">
                        <p class="text-[10px] font-bold text-orange-400 flex items-center gap-1">
                            <i class="ph-fill ph-fork-knife"></i> 美食推薦
                        </p>
                    </div>

                    <div class="flex items-center gap-2 mb-1">
                        <button
                            @click="$emit('search-nearby')"
                            class="text-[10px] text-teal-600 hover:text-teal-800 flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-teal-100 shadow-sm"
                            :disabled="!item.location"
                        >
                            <i v-if="isSearching" class="ph-bold ph-spinner animate-spin"></i>
                            <i v-else class="ph-bold ph-magnifying-glass"></i>
                            搜尋
                        </button>
                        <span v-if="!item.location" class="text-[9px] text-slate-400 italic">
                            請先輸入地點 (例如: 澀谷)
                        </span>
                    </div>

                    <div
                        v-if="recommendations && recommendations.length > 0"
                        class="flex flex-wrap gap-2"
                    >
                        <button
                            v-for="rec in recommendations"
                            :key="rec.name"
                            @click="$emit('apply-recommendation', rec)"
                            class="text-[10px] px-2 py-1.5 bg-white border border-orange-200 rounded-lg text-slate-600 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition shadow-sm flex flex-col items-start gap-0.5 max-w-[120px] truncate"
                        >
                            <span class="font-bold truncate w-full text-left">{{ rec.name }}</span>
                            <span class="text-[9px] text-slate-400 truncate">{{ rec.location }}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { DayItem } from '../types/index';

interface Props {
    item: DayItem;
    idx: number;
    totalItems: number;
    isWeatherLoading: boolean;
    isDayWeatherLoading: boolean;
    weatherDisplay: { temp: string; icon: string; label: string } | null;
    getTimePeriod: (t: string) => string;
    getGoogleMapLink: (loc: string) => string;
    getDotColor: (t: string) => string;
    isSearching: boolean;
    recommendations?: Array<{ name: string; location: string }>;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    'move-up': [];
    'move-down': [];
    'update:item': [field: string, value: any];
    'start-edit-note': [];
    remove: [];
    'region-change': [];
    'clear-region': [];
    'search-nearby': [];
    'apply-recommendation': [rec: { name: string; location: string }];
}>();

const isFirst = computed(() => props.idx === 0);
const isLast = computed(() => props.idx === props.totalItems - 1);
const timePeriod = computed(() => props.getTimePeriod(props.item.time));
const dotColorClass = computed(() => props.getDotColor(props.item.type));
const googleMapLink = computed(() =>
    props.item.location ? props.getGoogleMapLink(props.item.location) : '#'
);

const updateItem = (field: string, value: any) => {
    emit('update:item', field, value);
};

const openTimePicker = (event: Event) => {
    const container = (event.currentTarget as HTMLElement)?.closest('.relative');
    const timeInput = container?.querySelector('input[type="time"]') as HTMLInputElement;
    if (timeInput) {
        if (timeInput.showPicker) {
            timeInput.showPicker();
        } else {
            timeInput.click();
        }
    }
};
</script>

<style scoped>
.time-picker-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    position: relative;
    z-index: 10;
}

.time-picker-period {
    font-size: 9px;
    font-weight: 500;
    color: rgb(148, 163, 184); /* slate-400 */
}

.time-picker-time {
    font-size: 0.875rem; /* text-sm */
    font-weight: 900;
    color: rgb(51, 65, 85); /* slate-700 */
}
</style>

