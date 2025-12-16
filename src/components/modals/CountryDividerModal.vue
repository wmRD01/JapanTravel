<template>
    <transition name="fade">
        <div v-if="open" class="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="$emit('close')"></div>
            <div
                class="relative bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 space-y-4 animate-fade-in"
                @click.stop
            >
                <div class="space-y-1">
                    <p class="text-lg font-bold text-blue-500">
                        {{ isEditing ? '編輯國家分隔' : '插入國家分隔' }}
                    </p>
                    <p class="text-xs text-slate-500">設定國家</p>
                </div>
                <div class="space-y-3">
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">國家名稱</label>
                        <input
                            :value="countryName"
                            @input="$emit('update:countryName', ($event.target as HTMLInputElement).value)"
                            @keyup.enter="$emit('save')"
                            @keyup.esc="$emit('close')"
                            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-300"
                            placeholder="例如：日本"
                            autofocus
                        />
                    </div>
                    <div>
                        <label
                            class="block text-sm font-medium text-slate-700 mb-1"
                            title="國家代碼(選擇可以更精準抓取天氣)"
                        >
                            國家代碼(選擇可以更精準抓取天氣)
                        </label>
                        <select
                            :value="countryCode"
                            @change="$emit('update:countryCode', ($event.target as HTMLSelectElement).value)"
                            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-300"
                            title="國家代碼(選擇可以更精準抓取天氣)"
                        >
                            <option value="">不選擇國家代碼</option>
                            <option value="JP">JP - 日本</option>
                            <option value="TW">TW - 台灣</option>
                            <option value="VN">VN - 越南</option>
                            <option value="KR">KR - 韓國</option>
                            <option value="CN">CN - 中國</option>
                            <option value="US">US - 美國</option>
                            <option value="TH">TH - 泰國</option>
                            <option value="SG">SG - 新加坡</option>
                            <option value="MY">MY - 馬來西亞</option>
                            <option value="ID">ID - 印尼</option>
                            <option value="PH">PH - 菲律賓</option>
                            <option value="HK">HK - 香港</option>
                            <option value="MO">MO - 澳門</option>
                        </select>
                    </div>
                    <!-- 插入位置選擇（僅插入時顯示） -->
                    <div v-if="!isEditing && showInsertPosition" class="pt-2 border-t border-slate-100 space-y-2">
                        <div class="flex items-center justify-between">
                            <p class="text-sm font-semibold text-slate-700">插入位置</p>
                            <p class="text-[11px] text-slate-400">選擇要插入在上方</p>
                        </div>
                        <div class="max-h-48 overflow-y-auto space-y-2 pr-1">
                            <button
                                v-for="(item, idx) in items"
                                :key="getItemKey(item, idx)"
                                @click="$emit('select-insert-position', idx)"
                                :class="[
                                    'w-full text-left rounded-xl border px-3 py-2 transition flex flex-col gap-0.5',
                                    selectedInsertIndex === idx
                                        ? 'border-blue-400 bg-blue-50/80 text-blue-700 shadow-sm'
                                        : 'border-slate-200 text-slate-600 hover:border-blue-200 hover:bg-blue-50/60'
                                ]"
                            >
                                <div class="text-xs font-semibold">插入在此行程上方</div>
                                <div class="text-[11px] text-slate-500 truncate">
                                    {{ idx + 1 }}. {{ item.activity || item.region || '未命名行程' }}
                                </div>
                            </button>
                        </div>
                        <button
                            @click="$emit('select-insert-position', items.length)"
                            :class="[
                                'w-full rounded-xl border px-3 py-2 transition text-left',
                                selectedInsertIndex === items.length
                                    ? 'border-blue-400 bg-blue-50/80 text-blue-700 shadow-sm'
                                    : 'border-slate-200 text-slate-600 hover:border-blue-200 hover:bg-blue-50/60'
                            ]"
                        >
                            <div class="text-xs font-semibold">插入在當天最後</div>
                            <div class="text-[11px] text-slate-500">目前行程</div>
                        </button>
                    </div>
                </div>
                <div class="flex gap-3 pt-1">
                    <button
                        @click="$emit('close')"
                        class="flex-1 h-11 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition"
                    >
                        取消
                    </button>
                    <button
                        @click="$emit('save')"
                        class="flex-1 h-11 rounded-xl bg-blue-500 text-white font-semibold hover:bg-blue-600 shadow-sm transition"
                    >
                        儲存
                    </button>
                </div>
            </div>
        </div>
    </transition>
</template>

<script setup lang="ts">
import type { DayItem } from '../types/index';

interface Props {
    open: boolean;
    isEditing: boolean;
    countryName: string;
    countryCode: string;
    showInsertPosition?: boolean;
    items?: DayItem[];
    selectedInsertIndex?: number;
    getItemKey?: (item: DayItem, idx: number) => string;
}

defineProps<Props>();

defineEmits<{
    'update:countryName': [value: string];
    'update:countryCode': [value: string];
    'select-insert-position': [index: number];
    close: [];
    save: [];
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

@keyframes fade-in {
    from {
        opacity: 0;
        transform: scale(0.95);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}

.animate-fade-in {
    animation: fade-in 0.2s ease-out;
}
</style>

