<script setup lang="ts">
import type { IDebt, IExpense, IIncome } from '@/types';
import Divider from 'primevue/divider';
import DataTable from 'primevue/datatable';
import { PAGINATION_ROWS_PER_PAGE, PAGINATION_OPTIONS } from '@/constants';
import { ref } from 'vue';
import { RouterLink } from 'vue-router';

const props = withDefaults(
  defineProps<{
    initialOpen?: boolean;
    sortField: string;
    titleLabel: string;
    subTitleLabel?: string;
    emptyStateLabel: string;
    rows: IIncome[] | IExpense[] | IDebt[];
    class?: string;
    iconClass?: string;
    emptyStateLink?: import('vue-router').RouteLocationRaw;
    emptyStateLinkLabel?: string;
  }>(),
  {
    initialOpen: true,
  }
);

const isShowingContent = ref(props.initialOpen);

const toggleContent = () => {
  isShowingContent.value = !isShowingContent.value;
};
</script>

<template>
  <div :class="props.class">
    <button @click="toggleContent" class="grid grid-cols-2 rounded-sm hover:bg-sky-950 hover:text-white p-4 cursor-pointer w-full">
      <div class="text-lg lg:text-xl font-bold grid place-content-start">
        <div>
          <div class="mr-2 inline-block">
            <template v-if="isShowingContent">
              <i class="pi pi-caret-up" style="font-size: 14px;"></i>
            </template>
            <template v-else>
              <i class="pi pi-caret-down" style="font-size: 14px;"></i>
            </template>
          </div>
          <i :class="`pi ${props.iconClass}`" style="font-size: 14px;"></i>
          {{ props.titleLabel }}
        </div>  
      </div>
      <div class="text-lg lg:text-xl font-bold grid place-content-end">
        {{ props.subTitleLabel }}
      </div>
    </button>

    <Divider />

    <Transition name="slide-fade">
      <div v-if="isShowingContent">
        <DataTable
          v-if="props.rows.length > 0"
          :value="props.rows"
          tableStyle="min-width: 50rem"
          stripedRows
          :sort-order="-1"
          :sort-field="props.sortField"
          :paginator="props.rows.length > PAGINATION_OPTIONS[1]"
          :rows="PAGINATION_ROWS_PER_PAGE"
          :rowsPerPageOptions="PAGINATION_OPTIONS"
          row-hover
        >
          <slot name="columns" />
        </DataTable>
        <div v-else class="grid place-content-center">
          <span class="text-gray-500 text-lg">
            <i class="pi pi-info-circle" style="font-size: 16px;"></i>
            {{ props.emptyStateLabel }}
            <RouterLink
              v-if="props.emptyStateLink && props.emptyStateLinkLabel"
              :to="props.emptyStateLink"
              class="text-sky-600 underline ml-1"
            >
              {{ props.emptyStateLinkLabel }}
            </RouterLink>
          </span>
        </div>
      </div>
    </Transition>
  </div>
</template>
