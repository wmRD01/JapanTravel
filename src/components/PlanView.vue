<template>
    <div :key="currentDayIdx" class="p-4 pb-32 sm:pb-24 plan-surface">
        <!-- 航班卡片 (登機證樣式) -->
        <div class="mb-6">
            <div
                v-if="currentDay.flight"
                class="relative bg-gradient-to-r from-blue-600 to-teal-500 rounded-2xl text-white shadow-lg overflow-hidden"
            >
                <div
                    class="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full z-10"
                    style="background: #666666"
                ></div>
                <div
                    class="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full z-10"
                    style="background: #666666"
                ></div>
                <div class="p-4 relative z-0">
                    <button
                        @click="$emit('toggle-flight-card')"
                        class="absolute top-2 right-2 text-white/50 hover:text-white hover:bg-white/20 rounded-full p-1 transition"
                    >
                        <i class="ph-bold ph-x"></i>
                    </button>
                    <div class="flex justify-between items-center mb-1 pt-2">
                        <!-- 出發 -->
                        <div class="flex flex-col items-center w-1/3">
                            <input
                                :value="currentDay.flight.startTime"
                                @input="$emit('update:flight', { ...currentDay.flight, startTime: ($event.target as HTMLInputElement).value })"
                                type="time"
                                class="text-2xl font-black bg-transparent border-b border-white/30 w-full text-center text-white placeholder-white/50 focus:outline-none focus:border-white font-mono p-0"
                            />
                            <div class="text-[9px] opacity-60 mt-1">起飛 (當地時間)</div>
                            <input
                                :value="currentDay.flight.startAirport"
                                @input="$emit('update:flight', { ...currentDay.flight, startAirport: ($event.target as HTMLInputElement).value })"
                                class="text-sm font-bold opacity-90 bg-transparent border-none text-center w-full text-teal-100 placeholder-white/50 focus:ring-0 uppercase p-0"
                                placeholder="TPE"
                            />
                        </div>
                        <!-- 資訊 -->
                        <div class="flex flex-col items-center justify-center w-1/3 px-2">
                            <i class="ph-fill ph-airplane text-2xl mb-1 transform rotate-90"></i>
                            <input
                                :value="currentDay.flight.number"
                                @input="$emit('update:flight', { ...currentDay.flight, number: ($event.target as HTMLInputElement).value })"
                                class="text-[10px] font-mono tracking-widest opacity-80 bg-transparent border-none text-center w-full text-white placeholder-white/50 focus:ring-0 uppercase p-0"
                                placeholder="BR198"
                            />
                            <div class="w-full h-0.5 bg-white/30 rounded-full mt-1"></div>
                        </div>
                        <!-- 抵達 -->
                        <div class="flex flex-col items-center w-1/3">
                            <input
                                :value="currentDay.flight.endTime"
                                @input="$emit('update:flight', { ...currentDay.flight, endTime: ($event.target as HTMLInputElement).value })"
                                type="time"
                                class="text-2xl font-black bg-transparent border-b border-white/30 w-full text-center text-white placeholder-white/50 focus:outline-none focus:border-white font-mono p-0"
                            />
                            <div class="relative w-full mt-0.5">
                                <select
                                    :value="currentDay.flight.arrivalOffset"
                                    @change="$emit('update:flight', { ...currentDay.flight, arrivalOffset: Number(($event.target as HTMLSelectElement).value) })"
                                    class="appearance-none bg-black/20 text-white text-[9px] rounded border-none w-full py-0.5 px-1 text-center focus:ring-0 cursor-pointer hover:bg-black/30"
                                >
                                    <option value="0" class="text-slate-800">同日抵達</option>
                                    <option value="1" class="text-slate-800">+1天 (隔日)</option>
                                    <option value="-1" class="text-slate-800">-1天 (前日)</option>
                                </select>
                                <div
                                    v-if="currentDay.flight.arrivalOffset != 0"
                                    class="absolute -top-8 right-0 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded shadow font-bold animate-pulse"
                                >
                                    {{ currentDay.flight.arrivalOffset > 0 ? '+1' : '-1' }}
                                </div>
                            </div>
                            <input
                                :value="currentDay.flight.endAirport"
                                @input="$emit('update:flight', { ...currentDay.flight, endAirport: ($event.target as HTMLInputElement).value })"
                                class="text-sm font-bold opacity-90 bg-transparent border-none text-center w-full text-teal-100 placeholder-white/50 focus:ring-0 uppercase p-0"
                                placeholder="NRT"
                            />
                        </div>
                    </div>
                </div>
            </div>
            <button
                v-else
                @click="$emit('toggle-flight-card')"
                class="w-full py-3 border-2 border-dashed border-slate-300 rounded-2xl text-slate-400 hover:border-teal-400 hover:text-teal-500 hover:bg-teal-50/50 transition flex items-center justify-center gap-2 group"
            >
                <i class="ph-bold ph-airplane-tilt text-lg group-hover:scale-110 transition-transform"></i>
                <span class="text-sm font-bold">新增當日航班資訊</span>
            </button>
        </div>

        <!-- 重新同步天氣按鈕 -->
        <div class="mb-6 flex justify-center">
            <button
                @click="$emit('reload-day-weather')"
                :disabled="isDayWeatherLoading"
                :class="[
                    'flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition shadow-sm',
                    isDayWeatherLoading
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-teal-500 to-blue-500 text-white hover:from-teal-600 hover:to-blue-600 hover:shadow-md'
                ]"
                title="重新同步當天所有行程的天氣"
            >
                <i v-if="isDayWeatherLoading" class="ph-bold ph-spinner animate-spin"></i>
                <i v-else class="ph-bold ph-cloud-arrow-down"></i>
                <span>{{ isDayWeatherLoading ? '同步中...' : '重新同步天氣' }}</span>
            </button>
        </div>

        <!-- 新增國家區塊（顯著位置，手機友善） -->
        <div class="mb-4">
            <button
                @click="$emit('show-insert-country-divider-modal', currentDay.items.length)"
                class="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-teal-500 text-white font-semibold py-3 shadow-md hover:shadow-lg active:scale-[0.99] transition text-sm"
                title="新增國家區塊"
            >
                <i class="ph-bold ph-flag text-base"></i>
                <span>新增國家區塊</span>
            </button>
        </div>

        <div class="relative pl-4 border-l-2 border-teal-100 space-y-8 pr-3">
            <template v-for="(item, idx) in currentDay.items" :key="getItemKey(item, idx)">
                <!-- 國家區塊 -->
                <div v-if="item.type === 'country-divider' || item.isCountryDivider" class="relative group">
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
                                    @click="$emit('move-item-up', idx)"
                                    :disabled="idx === 0"
                                    :class="[
                                        'rounded transition',
                                        idx === 0
                                            ? 'text-slate-300 cursor-not-allowed'
                                            : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50'
                                    ]"
                                    title="上移"
                                >
                                    <i class="ph-bold ph-caret-up text-xs"></i>
                                </button>
                                <button
                                    @click="$emit('move-item-down', idx)"
                                    :disabled="idx === currentDay.items.length - 1"
                                    :class="[
                                        'rounded transition',
                                        idx === currentDay.items.length - 1
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
                                <span class="text-lg font-bold text-slate-800 ml-3"
                                    >{{ item.country || item.activity }}</span
                                >
                            </div>
                            <!-- 操作按鈕 -->
                            <div class="flex items-center gap-2">
                                <button
                                    @click="$emit('start-edit-country-divider', item)"
                                    class="text-blue-500 hover:text-blue-700 p-1 rounded transition"
                                    title="編輯國家"
                                >
                                    <i class="ph-bold ph-pencil"></i>
                                </button>
                                <button
                                    @click="$emit('remove-country-divider', idx)"
                                    class="text-red-400 hover:text-red-600 p-1 rounded transition"
                                    title="刪除國家區塊"
                                >
                                    <i class="ph-bold ph-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- 一般旅程項目 -->
                <div v-else class="relative group">
                    <div
                        class="absolute -left-[21px] top-3 w-3 h-3 rounded-full border-2 border-white shadow-sm"
                        :class="getDotColor(item.type)"
                    ></div>
                    <div
                        class="bg-white p-3 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
                    >
                        <div class="flex flex-col gap-2">
                            <div class="flex items-start gap-3">
                                <!-- 上下移動按鈕 -->
                                <div class="flex flex-col gap-0.5 pt-1 flex-shrink-0">
                                    <button
                                        @click="$emit('move-item-up', idx)"
                                        :disabled="idx === 0"
                                        :class="[
                                            'p-0.5 rounded transition',
                                            idx === 0
                                                ? 'text-slate-300 cursor-not-allowed'
                                                : 'text-slate-400 hover:text-teal-600 hover:bg-teal-50'
                                        ]"
                                        title="上移"
                                    >
                                        <i class="ph-bold ph-caret-up text-xs"></i>
                                    </button>
                                    <button
                                        @click="$emit('move-item-down', idx)"
                                        :disabled="idx === currentDay.items.length - 1"
                                        :class="[
                                            'p-0.5 rounded transition',
                                            idx === currentDay.items.length - 1
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
                                            @input="$emit('update:item', { idx, field: 'time', value: ($event.target as HTMLInputElement).value })"
                                            type="time"
                                            class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-0"
                                        />
                                        <button @click="openTimePickerFromEvent" class="time-picker-button">
                                            <span class="time-picker-period">
                                                {{ getTimePeriod(item.time) }}
                                            </span>
                                            <span class="time-picker-time">
                                                {{ item.time || '選擇時間 🕒' }}
                                            </span>
                                        </button>
                                    </div>
                                    <select
                                        :value="item.type"
                                        @change="$emit('update:item', { idx, field: 'type', value: ($event.target as HTMLSelectElement).value })"
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
                                        @input="$emit('update:item', { idx, field: 'activity', value: ($event.target as HTMLInputElement).value })"
                                        class="block w-full font-bold text-slate-800 bg-transparent border-none p-0 focus:ring-0"
                                        placeholder="行程名稱..."
                                    />
                                    <div class="flex items-center gap-1 mt-1">
                                        <i class="ph-fill ph-map-pin text-teal-400 text-xs"></i>
                                        <input
                                            :value="item.location"
                                            @input="$emit('update:item', { idx, field: 'location', value: ($event.target as HTMLInputElement).value })"
                                            class="flex-1 text-xs text-slate-500 bg-transparent border-none p-0 focus:ring-0 truncate"
                                            placeholder="輸入地點 (例如: 新宿)"
                                        />
                                    </div>
                                    <div class="flex items-start gap-1 mt-1">
                                        <i class="ph-bold ph-info text-orange-400 text-xs mt-0.5"></i>
                                        <div class="flex-1 min-w-0">
                                            <button @click="$emit('start-edit-note', item)" class="w-full text-left">
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
                                        :href="getGoogleMapLink(item.location)"
                                        target="_blank"
                                        class="text-teal-500 hover:bg-teal-50 p-1 rounded"
                                        ><i class="ph-bold ph-navigation-arrow"></i
                                    ></a>
                                    <button
                                        @click="$emit('remove-item', idx)"
                                        class="text-red-300 hover:text-red-500 p-1 rounded"
                                    >
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
                                            <!-- 載入中顯示載入圖示，否則顯示地圖圖示 -->
                                            <i
                                                v-if="isItemWeatherLoading(item)"
                                                class="ph-bold ph-spinner text-teal-500 text-xs flex-shrink-0 animate-spin"
                                            ></i>
                                            <i
                                                v-else
                                                class="ph-bold ph-map-pin text-teal-500 text-xs flex-shrink-0"
                                            ></i>
                                            <input
                                                :value="item.region"
                                                @input="$emit('update:item', { idx, field: 'region', value: ($event.target as HTMLInputElement).value })"
                                                :disabled="isItemWeatherLoading(item) || isDayWeatherLoading"
                                                @blur="$emit('item-region-change', item)"
                                                @keyup.enter="$emit('item-region-change', item)"
                                                :class="[
                                                'flex-1 text-xs border rounded-lg px-2 py-1.5 pr-8 transition min-w-0',
                                                isItemWeatherLoading(item) || isDayWeatherLoading
                                                    ? 'bg-slate-100 border-slate-300 text-slate-400 cursor-not-allowed'
                                                    : 'bg-slate-50 border-slate-200 text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500'
                                            ]"
                                                placeholder="設定地區（例如：東京、大阪）"
                                            />
                                            <!-- 刪除按鈕 - 載入中時隱藏 -->
                                            <button
                                                v-if="item.region && !isItemWeatherLoading(item) && !isDayWeatherLoading"
                                                @mousedown.prevent
                                                @click.stop="$emit('clear-item-region', item)"
                                                class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition p-0.5 z-10 flex-shrink-0"
                                                title="清除地區"
                                            >
                                                <i class="ph-bold ph-x text-sm"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <!-- 天氣預報顯示 - 固定寬度，不會遮擋刪除按鈕 -->
                                    <div class="flex-shrink-0 w-[100px]">
                                        <!-- 載入中狀態 -->
                                        <div
                                            v-if="isItemWeatherLoading(item) || (isDayWeatherLoading && item.region?.trim())"
                                            class="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg px-2 py-1.5 border border-slate-200"
                                        >
                                            <div class="flex items-center gap-1.5 justify-center">
                                                <i
                                                    class="ph-bold ph-spinner text-teal-500 text-xs animate-spin"
                                                ></i>
                                                <span class="text-xs text-slate-500">載入中...</span>
                                            </div>
                                        </div>
                                        <!-- 天氣資訊顯示 -->
                                        <div
                                            v-else-if="itemWeatherDisplay(item)"
                                            class="bg-gradient-to-br from-teal-50 to-blue-50 rounded-lg px-2 py-1.5 border border-teal-100"
                                        >
                                            <div class="flex items-center gap-2">
                                                <!-- 左側：天氣圖案和度數 -->
                                                <div class="flex flex-col items-center flex-shrink-0">
                                                    <!-- 天氣圖案（左上） -->
                                                    <i
                                                        :class="[
                                                                'ph-duotone',
                                                                itemWeatherDisplay(item)?.icon || 'ph-sun',
                                                                'text-base text-teal-600'
                                                            ]"
                                                    ></i>
                                                    <!-- 度數（左下） -->
                                                    <span
                                                        class="text-xs font-bold text-slate-800 leading-tight mt-0.5"
                                                    >
                                                        {{ itemWeatherDisplay(item)?.temp || '--' }}
                                                    </span>
                                                </div>
                                                <!-- 右側：文字說明 -->
                                                <div class="flex-1 min-w-0 text-left">
                                                    <span
                                                        class="text-[9px] text-slate-600 leading-tight block whitespace-normal break-words"
                                                    >
                                                        {{ itemWeatherDisplay(item)?.label || '' }}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div
                                            v-else
                                            class="bg-slate-50 rounded-lg px-2 py-1.5 border border-slate-200"
                                        >
                                            <div class="flex items-center gap-1.5">
                                                <i
                                                    class="ph-bold ph-cloud-slash text-slate-300 text-sm flex-shrink-0"
                                                ></i>
                                                <span class="text-[10px] text-slate-400 truncate">未設定</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- 智慧推薦區 (僅美食，使用 Geoapify) -->
                            <div
                                v-if="item.type === 'food'"
                                class="p-2 bg-orange-50 rounded-lg border border-orange-100/50 mt-1"
                            >
                                <div class="flex items-center justify-between mb-1">
                                    <p class="text-[10px] font-bold text-orange-400 flex items-center gap-1">
                                        <i class="ph-fill ph-fork-knife"></i> 美食推薦
                                    </p>
                                </div>

                                <div class="flex items-center gap-2 mb-1">
                                    <button
                                        @click="$emit('search-nearby', item, idx)"
                                        class="text-[10px] text-teal-600 hover:text-teal-800 flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-teal-100 shadow-sm"
                                        :disabled="!item.location"
                                    >
                                        <i
                                            v-if="isSearchingRecs && searchTargetIndex === `${currentDayIdx}-${idx}`"
                                            class="ph-bold ph-spinner animate-spin"
                                        ></i>
                                        <i v-else class="ph-bold ph-magnifying-glass"></i>
                                        搜尋
                                    </button>
                                    <span v-if="!item.location" class="text-[9px] text-slate-400 italic"
                                        >請先輸入地點 (例如: 澀谷)</span
                                    >
                                </div>

                                <div
                                    v-if="recommendationsMap[`${currentDayIdx}-${idx}`] && recommendationsMap[`${currentDayIdx}-${idx}`].length > 0"
                                    class="flex flex-wrap gap-2"
                                >
                                    <button
                                        v-for="rec in recommendationsMap[`${currentDayIdx}-${idx}`]"
                                        :key="rec.name"
                                        @click="$emit('apply-recommendation', item, rec)"
                                        class="text-[10px] px-2 py-1.5 bg-white border border-orange-200 rounded-lg text-slate-600 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition shadow-sm flex flex-col items-start gap-0.5 max-w-[120px] truncate"
                                    >
                                        <span class="font-bold truncate w-full text-left">{{ rec.name }}</span>
                                        <span class="text-[9px] text-slate-400 truncate"
                                            >{{ rec.location }}</span
                                        >
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
            <button
                @click="$emit('add-item')"
                class="flex items-center gap-2 text-teal-400 hover:text-teal-600 text-sm font-medium px-2 py-1"
            >
                <div class="w-2 h-2 bg-teal-300 rounded-full"></div>
                <i class="ph-bold ph-plus"></i> 新增行程
            </button>
        </div>
        <div class="mt-12 pt-6 border-t border-slate-200 text-center">
            <button
                @click="$emit('remove-current-day')"
                class="text-xs text-red-300 hover:text-red-500 flex items-center justify-center gap-1 mx-auto"
            >
                <i class="ph-bold ph-trash"></i> 刪除這一天
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Day, DayItem } from '../types/index';

defineProps<{
    currentDay: Day;
    currentDayIdx: number;
    isDayWeatherLoading: boolean;
    isItemWeatherLoading: (item: DayItem) => boolean;
    itemWeatherDisplay: (item: DayItem) => { temp: string; icon: string; label: string } | null;
    getTimePeriod: (t: string) => string;
    getGoogleMapLink: (loc: string) => string;
    getDotColor: (t: string) => string;
    getItemKey: (item: DayItem, idx: number) => string;
    isSearchingRecs: boolean;
    searchTargetIndex: string;
    recommendationsMap: Record<string, Array<{ name: string; location: string }>>;
}>();

defineEmits<{
    'toggle-flight-card': [];
    'update:flight': [flight: any];
    'reload-day-weather': [];
    'show-insert-country-divider-modal': [index: number];
    'move-item-up': [idx: number];
    'move-item-down': [idx: number];
    'start-edit-country-divider': [item: DayItem];
    'remove-country-divider': [idx: number];
    'update:item': [payload: { idx: number; field: string; value: any }];
    'start-edit-note': [item: DayItem];
    'item-region-change': [item: DayItem];
    'clear-item-region': [item: DayItem];
    'remove-item': [idx: number];
    'add-item': [];
    'remove-current-day': [];
    'search-nearby': [item: DayItem, idx: number];
    'apply-recommendation': [item: DayItem, rec: { name: string; location: string }];
}>();

const openTimePickerFromEvent = (event: Event) => {
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

