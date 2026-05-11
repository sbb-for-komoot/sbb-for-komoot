import {watch, onMounted} from 'vue'
import {i18n, SUPPORTED_LOCALES, LOCALE_FLAGS} from '../i18n'
import type {SupportedLocale} from '../i18n'

export type {SupportedLocale}
export {SUPPORTED_LOCALES, LOCALE_FLAGS}

const STORAGE_KEY = 'sbb_locale'

export function useLocale() {
  const locale = i18n.global.locale

  onMounted(async () => {
    const result = await chrome.storage.local.get(STORAGE_KEY) as {sbb_locale?: string}
    if (result.sbb_locale && SUPPORTED_LOCALES.includes(result.sbb_locale as any)) {
      locale.value = result.sbb_locale as SupportedLocale
    }
  })

  watch(locale, (val) => {
    chrome.storage.local.set({[STORAGE_KEY]: val})
  })

  return {locale, supportedLocales: SUPPORTED_LOCALES, flags: LOCALE_FLAGS}
}
