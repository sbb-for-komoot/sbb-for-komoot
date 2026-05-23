import {createI18n} from 'vue-i18n'
import en from './locales/en'
import fr from './locales/fr'
import de from './locales/de'
import it from './locales/it'

export type SupportedLocale = 'en' | 'fr' | 'de' | 'it'
export const SUPPORTED_LOCALES: SupportedLocale[] = ['en', 'fr', 'de', 'it']
export const LOCALE_FLAGS: Record<SupportedLocale, string> = {
  en: '🇬🇧',
  fr: '🇫🇷',
  de: '🇩🇪',
  it: '🇮🇹',
}

function detectBrowserLocale(): SupportedLocale {
  const lang = navigator.language.slice(0, 2).toLowerCase()
  return (SUPPORTED_LOCALES.includes(lang as SupportedLocale) ? lang : 'en') as SupportedLocale
}

const messageCompiler = (message: unknown) => {
  const source = typeof message === 'string' ? message : String(message ?? '')
  return (ctx: {named: (key: string) => unknown}) =>
    source.replace(/\{(\w+)\}/g, (_, key) => {
      const value = ctx.named(key)
      return value == null ? '' : String(value)
    })
}

export const i18n = createI18n({
  legacy: false,
  locale: detectBrowserLocale(),
  fallbackLocale: 'en',
  messages: {en, fr, de, it},
  messageCompiler: messageCompiler as never,
})
