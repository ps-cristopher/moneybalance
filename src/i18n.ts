import { createI18n } from 'vue-i18n'
import es from './locales/es'
import en from './locales/en'
import { LOCALE_STORAGE_KEY } from './constants'

const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY) || 'es'

const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: 'es',
  messages: { es, en }
})

export default i18n
