import { useI18n } from 'vue-i18n'
import { watch } from 'vue'
import { useStore } from '@/stores/store'

export default function useLocale() {
  const { locale: storeLocale, setLocale } = useStore()
  const { t, locale } = useI18n()

  watch(storeLocale, (value) => {
    locale.value = value
  }, { immediate: true })

  watch(locale, (value) => {
    if (storeLocale.value !== value) {
      setLocale(value)
    }
  })

  const localeOptions = [
    { label: 'Español', value: 'es' },
    { label: 'English', value: 'en' }
  ]

  return { t, locale: storeLocale, localeOptions }
}
