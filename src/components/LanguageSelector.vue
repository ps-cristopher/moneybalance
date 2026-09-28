<script setup lang="ts">
import SelectButton from 'primevue/selectbutton'
import { computed } from 'vue'
import { useI18n, type Locale } from '@/i18n'

const { locale, setLocale, t } = useI18n()

const options = computed(() => [
  { label: 'ES', value: 'es' },
  { label: 'EN', value: 'en' },
])
</script>

<template>
  <div class="language-selector" :aria-label="t('language')">
    <i class="pi pi-globe" aria-hidden="true"></i>
    <span class="sr-only">{{ t('language') }}</span>
    <SelectButton
      :model-value="locale"
      :options="options"
      option-label="label"
      option-value="value"
      size="small"
      :aria-label="t('language')"
      @update:model-value="setLocale($event as Locale)"
    />
  </div>
</template>

<style scoped>
.language-selector { display: flex; align-items: center; gap: .5rem; font-weight: 700; }
</style>
