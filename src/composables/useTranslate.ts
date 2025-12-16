import { computed, ref } from 'vue';

/**
 * 管理翻譯捷徑所需的狀態與連結
 * - myTranslateCountry, myTranslateLangCode
 * - translateFromChToMy, translateFromMyToCh
 */
export function useTranslate() {
    const myTranslateCountry = ref('');
    const myTranslateLangCode = ref('en');

    const translateFromMyToCh = computed(() =>
        `https://translate.google.com/?sl=${myTranslateLangCode.value || 'en'}&tl=zh-TW&op=translate`
    );

    const translateFromChToMy = computed(() =>
        `https://translate.google.com/?sl=zh-TW&tl=${myTranslateLangCode.value || 'en'}&op=translate`
    );

    return {
        myTranslateCountry,
        myTranslateLangCode,
        translateFromChToMy,
        translateFromMyToCh,
    };
}

