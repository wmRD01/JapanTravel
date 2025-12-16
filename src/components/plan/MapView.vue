<template>
    <div class="h-full flex flex-col relative">
        <div id="map" class="flex-1 w-full h-full min-h-[360px] bg-slate-200 z-0"></div>
        <div
            v-if="isMapLoading"
            class="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-teal-600"
        >
            <i class="ph-duotone ph-spinner animate-spin text-4xl mb-2"></i>
            <span class="text-xs font-bold">讀取中...</span>
        </div>
        <div
            class="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur rounded-xl p-3 shadow-lg border border-white/50 z-10 flex justify-between items-center"
        >
            <div class="text-sm font-bold text-slate-800">
                📍 {{ locationCount }} 個地點
            </div>
            <div class="flex gap-2">
                <button @click="$emit('reload-map')" class="p-2 bg-teal-100 text-teal-600 rounded-lg">
                    <i class="ph-bold ph-arrows-clockwise"></i>
                </button>
                <button @click="$emit('center-on-user')" class="p-2 bg-blue-500 text-white rounded-lg shadow-md">
                    <i class="ph-bold ph-crosshair"></i>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
interface Props {
    isMapLoading: boolean;
    locationCount: number;
}

defineProps<Props>();

defineEmits<{
    'reload-map': [];
    'center-on-user': [];
}>();
</script>

