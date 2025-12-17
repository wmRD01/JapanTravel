<template>
    <div :key="currentDayIdx" class="p-4 pb-32 sm:pb-24 plan-surface">
        <!-- 航班卡片 (登機證樣式) -->
        <div class="mb-6">
            <div v-if="currentDay.flight"
                class="relative bg-gradient-to-r from-blue-600 to-teal-500 rounded-2xl text-white shadow-lg overflow-hidden">
                <div class="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full z-10"
                    style="background: #666666"></div>
                <div class="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full z-10"
                    style="background: #666666"></div>
                <div class="px-4 pt-4 pb-3 relative z-0 space-y-3">
                    <button @click="$emit('toggle-flight-card')"
                        class="absolute top-2 right-2 text-white/50 hover:text-white hover:bg-white/20 rounded-full p-1 transition">
                        <i class="ph-bold ph-x"></i>
                    </button>
                    <!-- 上排：時間與航班號 -->
                    <div class="flex justify-between items-stretch gap-3">
                        <!-- 出發時間 -->
                        <div class="flex flex-col items-start w-1/3 gap-1">
                            <span class="text-[10px] uppercase tracking-widest opacity-80">出發</span>
                            <input :value="currentDay.flight.startTime"
                                @input="$emit('update:flight', { ...currentDay.flight, startTime: ($event.target as HTMLInputElement).value })"
                                type="time"
                                class="font-black bg-transparent border-b border-white/30 w-full text-left text-white placeholder-white/50 focus:outline-none focus:border-white font-mono p-0" />
                            <div class="text-[10px] opacity-70">起飛 (當地時間)</div>
                            <input :value="currentDay.flight.startAirport"
                                @input="$emit('update:flight', { ...currentDay.flight, startAirport: ($event.target as HTMLInputElement).value })"
                                class="font-bold opacity-90 bg-transparent border-none text-left w-full text-teal-100 placeholder-white/50 focus:ring-0 uppercase p-0"
                                placeholder="TPE" />
                        </div>
                        <!-- 中間：航班號 -->
                        <div class="flex flex-col items-center justify-center w-1/3 px-2 gap-1">
                            <i class="ph-fill ph-airplane text-3xl mb-1 transform rotate-90"></i>
                            <span class="text-[10px] uppercase tracking-widest opacity-80">航班</span>
                            <input :value="currentDay.flight.number"
                                @input="$emit('update:flight', { ...currentDay.flight, number: ($event.target as HTMLInputElement).value })"
                                class="text-xs font-mono tracking-[0.3em] opacity-90 bg-transparent border-none text-center w-full text-white placeholder-white/50 focus:ring-0 uppercase p-0"
                                placeholder="BR198" />
                            <div class="w-full h-0.5 bg-white/30 rounded-full mt-1"></div>
                        </div>
                        <!-- 抵達時間 -->
                        <div class="flex flex-col items-end w-1/3 gap-1 text-right">
                            <span class="text-[10px] uppercase tracking-widest opacity-80">抵達</span>
                            <input :value="currentDay.flight.endTime"
                                @input="$emit('update:flight', { ...currentDay.flight, endTime: ($event.target as HTMLInputElement).value })"
                                type="time"
                                class="font-black bg-transparent border-b border-white/30 w-full text-right text-white placeholder-white/50 focus:outline-none focus:border-white font-mono p-0" />
                            <div class="relative w-full mt-0.5">
                                <select :value="currentDay.flight.arrivalOffset"
                                    @change="$emit('update:flight', { ...currentDay.flight, arrivalOffset: Number(($event.target as HTMLSelectElement).value) })"
                                    class="appearance-none bg-black/20 text-white text-[10px] rounded border-none w-full py-0.5 px-2 text-right focus:ring-0 cursor-pointer hover:bg-black/30">
                                    <option value="0" class="text-slate-800">同日抵達</option>
                                    <option value="1" class="text-slate-800">+1天 (隔日)</option>
                                    <option value="-1" class="text-slate-800">-1天 (前日)</option>
                                </select>
                                <div v-if="currentDay.flight.arrivalOffset != 0"
                                    class="absolute -top-8 right-0 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded shadow font-bold animate-pulse">
                                    {{ currentDay.flight.arrivalOffset > 0 ? '+1' : '-1' }}
                                </div>
                            </div>
                            <input :value="currentDay.flight.endAirport"
                                @input="$emit('update:flight', { ...currentDay.flight, endAirport: ($event.target as HTMLInputElement).value })"
                                class="text-sm font-bold opacity-90 bg-transparent border-none text-right w-full text-teal-100 placeholder-white/50 focus:ring-0 uppercase p-0"
                                placeholder="NRT" />
                        </div>
                    </div>

                    <!-- 下排：簡短說明 -->
                    <div class="mt-1 flex justify-between text-[11px] opacity-80 tracking-wide">
                        <span>出發機場 / 航班資訊</span>
                        <span>抵達時間與跨日狀態</span>
                    </div>
                </div>
            </div>
            <button v-else @click="$emit('toggle-flight-card')"
                class="w-full py-3 border-2 border-dashed border-slate-300 rounded-2xl text-slate-400 hover:border-teal-400 hover:text-teal-500 hover:bg-teal-50/50 transition flex items-center justify-center gap-2 group">
                <i class="ph-bold ph-airplane-tilt text-lg group-hover:scale-110 transition-transform"></i>
                <span class="text-sm font-bold">新增當日航班資訊</span>
            </button>
        </div>

        <!-- 重新同步天氣 / 新增國家區塊：同一列左右排版 -->
        <div class="mb-6 flex gap-3">
            <!-- 左：重新同步天氣 -->
            <button @click="$emit('reload-day-weather')" :disabled="isDayWeatherLoading" :class="[
                'flex-1 flex items-center justify-center gap-2 rounded-2xl font-medium text-xs sm:text-sm transition shadow-sm py-2 sm:py-2.5',
                isDayWeatherLoading
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-teal-500 to-blue-500 text-white hover:from-teal-600 hover:to-blue-600 hover:shadow-md'
            ]" title="重新同步當天所有行程的天氣">
                <i v-if="isDayWeatherLoading" class="ph-bold ph-spinner animate-spin"></i>
                <i v-else class="ph-bold ph-cloud-arrow-down"></i>
                <span>{{ isDayWeatherLoading ? '同步中...' : '重新同步天氣' }}</span>
            </button>

            <!-- 右：新增國家區塊（顯著位置，手機友善） -->
            <button @click="$emit('show-insert-country-divider-modal', currentDay.items.length)"
                class="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-teal-500 text-white font-semibold py-2 sm:py-3 shadow-md hover:shadow-lg active:scale-[0.99] transition text-xs sm:text-sm"
                title="新增國家區塊">
                <i class="ph-bold ph-flag text-base"></i>
                <span>新增國家區塊</span>
            </button>
        </div>

        <div class="relative pl-4 border-l-2 border-teal-100 space-y-8 pr-3">
            <template v-for="(item, idx) in currentDay.items" :key="getItemKey(item, idx)">
                <!-- 國家區塊 -->
                <CountryDivider v-if="item.type === 'country-divider' || item.isCountryDivider" :country="item.country"
                    :activity="item.activity" :is-first="idx === 0" :is-last="idx === currentDay.items.length - 1"
                    @move-up="$emit('move-item-up', idx)" @move-down="$emit('move-item-down', idx)"
                    @edit="$emit('start-edit-country-divider', item)" @remove="$emit('remove-country-divider', idx)" />
                <!-- 一般旅程項目 -->
                <ScheduleItem v-else :item="item" :idx="idx" :total-items="currentDay.items.length"
                    :is-weather-loading="isItemWeatherLoading(item)" :is-day-weather-loading="isDayWeatherLoading"
                    :weather-display="itemWeatherDisplay(item)" :get-time-period="getTimePeriod"
                    :get-google-map-link="getGoogleMapLink" :get-dot-color="getDotColor"
                    @move-up="$emit('move-item-up', idx)" @move-down="$emit('move-item-down', idx)"
                    @update:item="(field, value) => $emit('update:item', { idx, field, value })"
                    @start-edit-note="$emit('start-edit-note', item)" @remove="$emit('remove-item', idx)"
                    @region-change="$emit('item-region-change', item)"
                    @clear-region="$emit('clear-item-region', item)" />
                <!-- 美食推薦相關 props 和事件 - 已移除前端功能，保留程式碼 -->
                <!-- :is-searching="isSearchingRecs && searchTargetIndex === `${currentDayIdx}-${idx}`" -->
                <!-- :recommendations="recommendationsMap[`${currentDayIdx}-${idx}`]" -->
                <!-- @search-nearby="$emit('search-nearby', item, idx)" -->
                <!-- @apply-recommendation="(rec) => $emit('apply-recommendation', item, rec)" -->
            </template>
            <button @click="$emit('add-item')"
                class="flex items-center gap-2 text-teal-400 hover:text-teal-600 text-sm font-medium px-2 py-1">
                <div class="w-2 h-2 bg-teal-300 rounded-full"></div>
                <i class="ph-bold ph-plus"></i> 新增行程
            </button>
        </div>
        <div class="mt-12 pt-6 border-t border-slate-200 text-center">
            <button @click="$emit('remove-current-day')"
                class="text-xs text-red-300 hover:text-red-500 flex items-center justify-center gap-1 mx-auto">
                <i class="ph-bold ph-trash"></i> 刪除這一天
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Day, DayItem } from '../types/index';
import CountryDivider from './CountryDivider.vue';
import ScheduleItem from './ScheduleItem.vue';

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
    // 美食推薦相關 props - 已移除前端功能，保留程式碼
    // isSearchingRecs: boolean;
    // searchTargetIndex: string;
    // recommendationsMap: Record<string, Array<{ name: string; location: string }>>;
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
    // 美食推薦相關 emits - 已移除前端功能，保留程式碼
    // 'search-nearby': [item: DayItem, idx: number];
    // 'apply-recommendation': [item: DayItem, rec: { name: string; location: string }];
}>();

</script>
