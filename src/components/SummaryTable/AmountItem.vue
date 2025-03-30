<script setup lang="ts">
import { formatCurrency } from '@/utils';

const props = defineProps<{
  amount: number,
  isCurrency?: boolean
}>();
</script>

<template>
  <div class="w-full grid place-content-end">
    {{ props.isCurrency ? formatCurrency(props.amount) : props.amount }}
  </div>
</template>
