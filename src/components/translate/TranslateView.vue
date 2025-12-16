<template>
    <div class="p-5 h-full flex flex-col justify-center items-center gap-5 pb-32 plan-surface">
        <div class="w-full max-w-md space-y-4">
            <div class="w-full">
                <a href="https://translate.google.com/?op=images" target="_blank" class="block w-full">
                    <button type="button"
                        class="w-full rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 hover:from-amber-500 hover:via-orange-600 hover:to-rose-600 shadow-md text-left">
                        <div class="flex items-center justify-between w-full px-4 py-4">
                            <div class="text-left">
                                <div class="text-[11px] text-white/80 mb-1">拍照翻譯</div>
                                <div class="text-xl font-extrabold leading-tight text-white">
                                    餐廳菜單 / 看板快速翻譯
                                </div>
                                <div class="text-[11px] text-white/80 mt-0.5">
                                    適合菜單、地鐵看板、路標等需要拍照的情境
                                </div>
                            </div>
                            <div class="flex items-center justify-center w-10 h-10 rounded-full bg-white/15 text-white">
                                <i class="ph-duotone ph-camera-plus text-2xl"></i>
                            </div>
                        </div>
                    </button>
                </a>
            </div>

            <Card padding="md">
                <div class="flex flex-col gap-3">
                    <div class="flex items-center justify-between">
                        <div class="text-xs font-semibold text-slate-500 flex items-center gap-1">
                            <i class="ph-bold ph-user-focus text-slate-400"></i>
                            <span>我的語言與翻譯語言（僅儲存在本機）</span>
                        </div>
                        <div v-if="myTranslateCountry || myTranslateLangCode"
                            class="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                            {{ myTranslateCountry || '未設定國家' }} ·
                            {{ (myTranslateLangCode || 'en').toUpperCase() }}
                        </div>
                    </div>
                    <div class="space-y-3">
                        <div>
                            <label class="text-xs text-slate-500 block mb-1">
                                我的語言代碼（例如：zh-TW / en / ja）
                            </label>
                            <input v-model="myBaseLangCode"
                                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-300 font-mono"
                                placeholder="例如：zh-TW（預設為中文繁體）" />
                            <p class="text-[10px] text-slate-400 mt-1">
                                這代表「我」平常使用的語言，預設為中文繁體 (zh-TW)。
                            </p>
                        </div>

                        <div class="pt-1 border-t border-slate-100 space-y-2">
                            <div>
                                <label class="text-xs text-slate-500 block mb-1">
                                    翻譯語言代碼（例如：en / ja / ko）
                                </label>
                                <input v-model="myTranslateLangCode"
                                    class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-300 font-mono"
                                    placeholder="例如：en（預設為英文）" />
                            </div>

                            <div class="flex flex-wrap gap-2">
                                <button v-for="c in quickCountryOptions" :key="c.key" type="button"
                                    @click="applyCountryShortcut(c)"
                                    class="px-2 py-0.5 rounded-full text-[11px] border border-slate-200 text-slate-500 hover:border-teal-300 hover:text-teal-600 bg-white/60">
                                    {{ c.label }} · {{ c.langCode }}
                                </button>
                            </div>
                            <p class="text-[10px] text-slate-400">
                                偵測到翻譯語言：
                                <span class="font-semibold text-teal-600">{{ detectedLangLabel }}</span>
                                （僅影響下方兩個翻譯按鈕的網址）
                            </p>
                        </div>
                    </div>
                </div>
            </Card>

            <div class="w-full grid grid-cols-1 gap-3 mt-0.5">
                <a :href="translateFromMeToTarget" target="_blank" class="block w-full">
                    <button type="button"
                        class="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-left">
                        <div class="flex items-center justify-between w-full px-4 py-4">
                            <div class="text-left">
                                <div class="text-[11px] text-emerald-50 mb-1">我的語言 → 翻譯語言</div>
                                <div class="text-xl font-bold flex items-center gap-1 text-white">
                                    <span>{{ myBaseLangCodeUpper }}</span>
                                    <i class="ph-bold ph-arrow-right text-sm"></i>
                                    <span>{{ targetLangCodeUpper }}</span>
                                </div>
                            </div>
                            <div class="flex items-center justify-center w-10 h-10 rounded-full bg-white/15 text-white">
                                <i class="ph-duotone ph-arrow-square-out text-2xl"></i>
                            </div>
                        </div>
                    </button>
                </a>

                <a :href="translateFromTargetToMe" target="_blank" class="block w-full">
                    <button type="button"
                        class="w-full rounded-2xl border-2 border-slate-200 hover:border-emerald-300 bg-white text-left">
                        <div class="flex items-center justify-between w-full px-4 py-4">
                            <div class="text-left">
                                <div class="text-[11px] text-slate-500 mb-1">翻譯語言 → 我的語言</div>
                                <div class="text-xl font-bold flex items-center gap-1 text-slate-800">
                                    <span>{{ targetLangCodeUpper }}</span>
                                    <i class="ph-bold ph-arrow-right text-sm"></i>
                                    <span>{{ myBaseLangCodeUpper }}</span>
                                </div>
                            </div>
                            <div
                                class="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-400">
                                <i class="ph-duotone ph-arrow-square-out text-2xl"></i>
                            </div>
                        </div>
                    </button>
                </a>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import Card from '../ui/Card.vue';

const myTranslateCountry = ref('');
// 我的語言代碼（預設中文繁體）
const myBaseLangCode = ref('zh-TW');
// 翻譯語言代碼（預設英文）
const myTranslateLangCode = ref('en');

// 常見國家對應語言代碼（僅本機使用）
const COUNTRY_LANG_MAP: Array<{
    key: string;
    label: string;
    langCode: string;
    keywords: string[];
}> = [
        { key: 'tw', label: '台灣', langCode: 'zh-TW', keywords: ['taiwan', '台灣', 'tw'] },
        { key: 'jp', label: '日本', langCode: 'ja', keywords: ['japan', '日本', 'jp'] },
        { key: 'kr', label: '韓國', langCode: 'ko', keywords: ['korea', '韓國', 'kr', 'south korea'] },
        { key: 'vn', label: '越南', langCode: 'vi', keywords: ['vietnam', '越南', 'vn'] },
        { key: 'th', label: '泰國', langCode: 'th', keywords: ['thailand', '泰國', 'th'] },
        { key: 'us', label: '美國', langCode: 'en', keywords: ['usa', 'us', 'america', '美國'] },
        { key: 'uk', label: '英國', langCode: 'en', keywords: ['uk', 'england', 'britain', '英國'] },
    ];

const quickCountryOptions = COUNTRY_LANG_MAP;

const detectedLangLabel = computed(() => {
    const lang = (myTranslateLangCode.value || 'en').toLowerCase();
    switch (lang) {
        case 'zh-tw':
            return '中文 (繁體, ZH-TW)';
        case 'ja':
            return '日文 (JA)';
        case 'ko':
            return '韓文 (KO)';
        case 'vi':
            return '越南文 (VI)';
        case 'th':
            return '泰文 (TH)';
        case 'en':
        default:
            return '英文 (EN)';
    }
});

const applyCountryShortcut = (c: (typeof COUNTRY_LANG_MAP)[number]) => {
    myTranslateCountry.value = c.label;
    myTranslateLangCode.value = c.langCode;
};

// 根據國家名稱自動推斷語言代碼
watch(
    myTranslateCountry,
    (val) => {
        if (!val) {
            myTranslateLangCode.value = 'en';
            return;
        }
        const normalized = val.toLowerCase();
        const matched = COUNTRY_LANG_MAP.find((entry) =>
            entry.keywords.some((kw) => normalized.includes(kw))
        );
        myTranslateLangCode.value = matched ? matched.langCode : 'en';
    },
    { immediate: true }
);

const myBaseLangCodeUpper = computed(() => (myBaseLangCode.value || 'zh-TW').toUpperCase());
const targetLangCodeUpper = computed(() => (myTranslateLangCode.value || 'en').toUpperCase());

// 我的語言 → 翻譯語言
const translateFromMeToTarget = computed(() =>
    `https://translate.google.com/?sl=${myBaseLangCode.value || 'zh-TW'}&tl=${myTranslateLangCode.value || 'en'
    }&op=translate`
);
// 翻譯語言 → 我的語言
const translateFromTargetToMe = computed(() =>
    `https://translate.google.com/?sl=${myTranslateLangCode.value || 'en'}&tl=${myBaseLangCode.value || 'zh-TW'
    }&op=translate`
);
</script>
