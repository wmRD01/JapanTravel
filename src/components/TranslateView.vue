<template>
    <div class="p-6 h-full flex flex-col justify-center items-center pb-32 plan-surface">
        <div class="text-center mb-8">
            <h2 class="text-2xl font-bold text-slate-800 mb-2">Google 翻譯捷徑</h2>
            <p class="text-sm text-slate-400">請選擇您需要的翻譯模式</p>
        </div>
        <div class="w-full mb-4">
            <a href="https://translate.google.com/?op=images" target="_blank" class="block w-full">
                <Button
                    variant="gradient"
                    size="lg"
                    full-width
                    class="bg-gradient-to-br from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 p-6"
                >
                    <div class="flex items-center justify-between w-full">
                        <div class="text-left">
                            <div class="text-xs opacity-80 mb-1 tracking-wider">菜單 / 看板</div>
                            <div class="text-2xl font-bold">
                                照相翻譯 <i class="ph-bold ph-camera text-sm"></i>
                            </div>
                        </div>
                        <i class="ph-duotone ph-camera-plus text-3xl opacity-60"></i>
                    </div>
                </Button>
            </a>
        </div>
        <!-- 我的國家/語言 -->
        <div class="w-full space-y-3 mt-6">
            <Card padding="md">
                <div class="flex flex-col gap-3">
                    <div>
                        <label class="text-xs text-slate-500 block mb-1">我的國家（僅本機）</label>
                        <input
                            v-model="myTranslateCountry"
                            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-300"
                            placeholder="例如：Taiwan / Japan"
                        />
                    </div>
                    <div>
                        <label class="text-xs text-slate-500 block mb-1">我的語言代碼（如：en/ja/ko）</label>
                        <input
                            v-model="myTranslateLangCode"
                            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-300"
                            placeholder="例如：en"
                        />
                    </div>
                </div>
            </Card>
            <div class="grid grid-cols-1 gap-3">
                <a :href="translateFromChToMy" target="_blank" class="block w-full">
                    <Button
                        variant="gradient"
                        size="lg"
                        full-width
                        class="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 p-4"
                    >
                        <div class="flex items-center justify-between w-full">
                            <span class="text-left">
                                <div class="text-[11px] opacity-80">我說中文 → 我的語言</div>
                                <div class="text-xl font-bold">
                                    CH <i class="ph-bold ph-arrow-right text-sm"></i>
                                    {{ (myTranslateLangCode || 'en').toUpperCase() }}
                                </div>
                            </span>
                            <i class="ph-duotone ph-arrow-square-out text-2xl opacity-80"></i>
                        </div>
                    </Button>
                </a>
                <a :href="translateFromMyToCh" target="_blank" class="block w-full">
                    <Button
                        variant="secondary"
                        size="lg"
                        full-width
                        class="border-2 hover:border-emerald-300 p-4"
                    >
                        <div class="flex items-center justify-between w-full">
                            <span class="text-left">
                                <div class="text-[11px] text-slate-500">我的語言 → 中文</div>
                                <div class="text-xl font-bold">
                                    {{ (myTranslateLangCode || 'en').toUpperCase() }}
                                    <i class="ph-bold ph-arrow-right text-sm"></i> CH
                                </div>
                            </span>
                            <i class="ph-duotone ph-arrow-square-out text-2xl text-slate-300"></i>
                        </div>
                    </Button>
                </a>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import Button from './ui/Button.vue';
import Card from './ui/Card.vue';

const myTranslateCountry = ref('');
const myTranslateLangCode = ref('en');

const translateFromMyToCh = computed(() =>
    `https://translate.google.com/?sl=${myTranslateLangCode.value || 'en'}&tl=zh-TW&op=translate`
);
const translateFromChToMy = computed(() =>
    `https://translate.google.com/?sl=zh-TW&tl=${myTranslateLangCode.value || 'en'}&op=translate`
);
</script>


