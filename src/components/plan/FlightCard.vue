<template>
    <div class="mb-6">
        <div
            v-if="flight"
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
                    @click="$emit('toggle')"
                    class="absolute top-2 right-2 text-white/50 hover:text-white hover:bg-white/20 rounded-full p-1 transition"
                >
                    <i class="ph-bold ph-x"></i>
                </button>
                <div class="flex justify-between items-center mb-1 pt-2">
                    <!-- 出發 -->
                    <div class="flex flex-col items-center w-1/3">
                        <input
                            :value="flight.startTime"
                            @input="updateFlight('startTime', ($event.target as HTMLInputElement).value)"
                            type="time"
                            class="text-2xl font-black bg-transparent border-b border-white/30 w-full text-center text-white placeholder-white/50 focus:outline-none focus:border-white font-mono p-0"
                        />
                        <div class="text-[9px] opacity-60 mt-1">起飛 (當地時間)</div>
                        <input
                            :value="flight.startAirport"
                            @input="updateFlight('startAirport', ($event.target as HTMLInputElement).value)"
                            class="text-sm font-bold opacity-90 bg-transparent border-none text-center w-full text-teal-100 placeholder-white/50 focus:ring-0 uppercase p-0"
                            placeholder="TPE"
                        />
                    </div>
                    <!-- 資訊 -->
                    <div class="flex flex-col items-center justify-center w-1/3 px-2">
                        <i class="ph-fill ph-airplane text-2xl mb-1 transform rotate-90"></i>
                        <input
                            :value="flight.number"
                            @input="updateFlight('number', ($event.target as HTMLInputElement).value)"
                            class="text-[10px] font-mono tracking-widest opacity-80 bg-transparent border-none text-center w-full text-white placeholder-white/50 focus:ring-0 uppercase p-0"
                            placeholder="BR198"
                        />
                        <div class="w-full h-0.5 bg-white/30 rounded-full mt-1"></div>
                    </div>
                    <!-- 抵達 -->
                    <div class="flex flex-col items-center w-1/3">
                        <input
                            :value="flight.endTime"
                            @input="updateFlight('endTime', ($event.target as HTMLInputElement).value)"
                            type="time"
                            class="text-2xl font-black bg-transparent border-b border-white/30 w-full text-center text-white placeholder-white/50 focus:outline-none focus:border-white font-mono p-0"
                        />
                        <div class="relative w-full mt-0.5">
                            <select
                                :value="flight.arrivalOffset"
                                @change="updateFlight('arrivalOffset', Number(($event.target as HTMLSelectElement).value))"
                                class="appearance-none bg-black/20 text-white text-[9px] rounded border-none w-full py-0.5 px-1 text-center focus:ring-0 cursor-pointer hover:bg-black/30"
                            >
                                <option value="0" class="text-slate-800">同日抵達</option>
                                <option value="1" class="text-slate-800">+1天 (隔日)</option>
                                <option value="-1" class="text-slate-800">-1天 (前日)</option>
                            </select>
                            <div
                                v-if="flight.arrivalOffset != 0"
                                class="absolute -top-8 right-0 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded shadow font-bold animate-pulse"
                            >
                                {{ flight.arrivalOffset > 0 ? '+1' : '-1' }}
                            </div>
                        </div>
                        <input
                            :value="flight.endAirport"
                            @input="updateFlight('endAirport', ($event.target as HTMLInputElement).value)"
                            class="text-sm font-bold opacity-90 bg-transparent border-none text-center w-full text-teal-100 placeholder-white/50 focus:ring-0 uppercase p-0"
                            placeholder="NRT"
                        />
                    </div>
                </div>
            </div>
        </div>
        <button
            v-else
            @click="$emit('toggle')"
            class="w-full py-3 border-2 border-dashed border-slate-300 rounded-2xl text-slate-400 hover:border-teal-400 hover:text-teal-500 hover:bg-teal-50/50 transition flex items-center justify-center gap-2 group"
        >
            <i class="ph-bold ph-airplane-tilt text-lg group-hover:scale-110 transition-transform"></i>
            <span class="text-sm font-bold">新增當日航班資訊</span>
        </button>
    </div>
</template>

<script setup lang="ts">
import type { Flight } from '../types/index';

interface Props {
    flight: Flight | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    toggle: [];
    'update:flight': [flight: Flight];
}>();

const updateFlight = (field: keyof Flight, value: any) => {
    if (!props.flight) return;
    emit('update:flight', { ...props.flight, [field]: value });
};
</script>

