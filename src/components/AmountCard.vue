<script setup lang="ts">
import type { ICustomDate } from '@/types';
import Card from 'primevue/card';
import { formatCurrency } from '@/utils';

import { getLocaleMessages } from '@/i18n'

const props = defineProps<{
  amount: number,
  label: string,
  labelClass?: string,
  iconClass?: string,
  date: ICustomDate,
}>();
</script>

<template>
  <Card>
    <template #footer>
      <div class="grid place-items-end">
        <span class="text-xs text-gray-500 p-1">
          <i class="pi pi-calendar" style="font-size: 14px;"></i>
          {{ getLocaleMessages().months[props.date.month - 1] }} {{ props.date.year }}
        </span>
      </div>
    </template>
    <template #title>
      <div class="grid place-items-center">
        <span class="font-bold">
          <i :class="`pi ${iconClass}`"></i>
          {{ props.label}}
        </span>
      </div>
    </template>
    <template #content>
      <div :class="`grid place-items-center grid-flow font-bold text-3xl lg:text-4xl py-4 ${props.labelClass}`">
        <span>{{ formatCurrency(props.amount) }}</span>
      </div>
    </template>
  </Card>
</template>
