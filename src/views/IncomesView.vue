<script setup lang="ts">
import Divider from 'primevue/divider'
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Select from 'primevue/select';
import Toast from 'primevue/toast';
import ConfirmDialog from 'primevue/confirmdialog';
import Message from 'primevue/message';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import AmountItem from '@/components/SummaryTable/AmountItem.vue';
import { computed, ref } from 'vue';
import { useStore } from '@/stores/store';
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";
import { formatCustomDate, periodIncludesCustomDate } from '@/utils';
import {
  STATIC_PAYMENT_TYPE_VALUE,
  EXTRA_INCOME_TYPE_VALUE,
  PAGINATION_ROWS_PER_PAGE,
  PAGINATION_OPTIONS
} from '@/constants'
import type {
  IIncomeType,
  IIncome,
  IMonth,
  IYear,
  ICustomDate
} from '@/types';
import useDateFilters from '@/hooks/useDateFilters';

const toast = useToast()
const confirm = useConfirm()
const {
  incomeTypes,
  months,
  years,
  incomes,
  addIncome,
  updateIncome,
  removeIncome,
} = useStore()

const {
  selectedMonth,
  selectedYear,
  monthsToRender,
  yearsToRender,
  selectedDate,
} = useDateFilters()

const incomesToRender = computed(() => {
  return incomes.filter(income => {
    const isInIncomePeriod = periodIncludesCustomDate({
      startedAt: income.startedAt,
      endedAt: income.endedAt,
    }, selectedDate.value)

    return income.type?.value === STATIC_PAYMENT_TYPE_VALUE || isInIncomePeriod
  })
})

const modalHeader = computed(() => isEditMode.value ? 'Editar Ingreso' : 'Nuevo Ingreso')

const isOpenModal = ref(false)
const isEditMode = ref(false)
const editingIncomeId = ref<string | null>(null)
const errorMessage = ref<string | null>(null)
const incomeType = ref<IIncomeType | null>(null)
const incomeName = ref<string | null>(null)
const incomeAmount = ref<number | null>(null)
const incomeStartedMonth = ref<IMonth | null>(null)
const incomeStartedYear = ref<IYear | null>(null)
const incomeEndedMonth = ref<IMonth | null>(null)
const incomeEndededYear = ref<IYear | null>(null)

const openCreateModal = () => {
  clearForm()
  isEditMode.value = false
  editingIncomeId.value = null
  isOpenModal.value = true
}

const showSuccess = (summary: string, detail: string) => {
  toast.add({ severity: 'success', summary: summary, detail: detail, life: 5000 })
}

const clearForm = () => {
  incomeType.value = null
  incomeName.value = null
  incomeAmount.value = null
  incomeStartedMonth.value = null
  incomeStartedYear.value = null
  incomeEndedMonth.value = null
  incomeEndededYear.value = null
  errorMessage.value = null
}

const cancelSave = () => {
  clearForm()
  isEditMode.value = false
  editingIncomeId.value = null
  isOpenModal.value = false
}

const edit = (income: IIncome) => {
  isEditMode.value = true
  editingIncomeId.value = income.id
  incomeType.value = income.type
  incomeName.value = income.name
  incomeAmount.value = income.amount
  incomeStartedMonth.value = months.find(m => m.value === income.startedAt?.month) || null
  incomeStartedYear.value = years.find(y => y.value === income.startedAt?.year) || null
  incomeEndedMonth.value = months.find(m => m.value === income.endedAt?.month) || null
  incomeEndededYear.value = years.find(y => y.value === income.endedAt?.year) || null
  errorMessage.value = null
  isOpenModal.value = true
}

const remove = (income: IIncome) => {
  confirm.require({
    message: '¿Estás seguro de eliminar este ingreso?',
    header: 'Confirmación',
    icon: 'pi pi-exclamation-triangle',
    rejectProps: {
      label: 'No',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: 'Sí, eliminar',
      severity: 'danger',
    },
    accept: () => {
      removeIncome(income)
      showSuccess('Eliminación exitosa', 'Se ha eliminado tu ingreso')
    },
    reject: () => {
      return
    }
  });
}

const save = () => {
  errorMessage.value = null

  if (!incomeType.value || !incomeName.value || !incomeAmount.value) {
    errorMessage.value = 'Todos los campos son requeridos'
    return
  }

  let newIncome: IIncome = {
    id: isEditMode.value && editingIncomeId.value ? editingIncomeId.value : Math.random().toString(36).substring(2, 9),
    type: incomeType.value,
    name: incomeName.value,
    amount: incomeAmount.value,
  }

  if (incomeType.value.value === EXTRA_INCOME_TYPE_VALUE) {
    if (!incomeStartedMonth.value || !incomeStartedYear.value || !incomeEndedMonth.value || !incomeEndededYear.value) {
      errorMessage.value = 'Todos los campos son requeridos'
      return
    }

    newIncome = {
      ...newIncome,
      startedAt: {
        month: incomeStartedMonth.value?.value,
        year: incomeStartedYear.value?.value,
      },
      endedAt: {
        month: incomeEndedMonth.value?.value,
        year: incomeEndededYear.value?.value,
      }
    }
  }

  if (isEditMode.value) {
    updateIncome(newIncome)
    showSuccess('Actualización exitosa', 'Se ha actualizado tu ingreso')
  } else {
    addIncome(newIncome)
    showSuccess('Registro exitoso', 'Se ha registrado tu nuevo ingreso')
  }
  cancelSave()
}
</script>

<template>
  <Toast />
  <ConfirmDialog :closable="false" :draggable="false" />
  <div class="grid grid-flow-row lg:grid-flow-col gap-2 mb-4">
    <h1 class="text-3xl font-bold">
      <i class="pi pi-dollar" style="font-size: 22px;"></i>
      Ingresos ({{ incomesToRender.length }})
    </h1>
    <div class="grid grid-cols-2 gap-4">
      <Select v-model="selectedMonth" :options="monthsToRender" optionLabel="label" placeholder="Mes" />
      <Select v-model="selectedYear" :options="yearsToRender" optionLabel="label" placeholder="Año" />
    </div>
  </div>

  <Divider />
  
  <div class="grid place-content-end mb-4">
    <Button label="Nuevo Ingreso" icon="pi pi-plus" @click="openCreateModal" />
  </div>

  <div class="mb-4">
    <DataTable
      v-if="incomesToRender.length > 0"
      :value="incomesToRender"
      tableStyle="min-width: 50rem"
      stripedRows
      :sort-order="-1"
      sort-field="amount"
      paginator
      :rows="PAGINATION_ROWS_PER_PAGE"
      :rowsPerPageOptions="PAGINATION_OPTIONS"
      row-hover
    >
      <Column field="name" header="Concepto" sortable />
      <Column field="type.label" header="Tipo" sortable />
      <Column field="startedAt" header="Inicio" sortable>
        <template #body="slotProps">
          {{ formatCustomDate(slotProps.data.startedAt as ICustomDate) }}
        </template>
      </Column>
      <Column field="endedAt" header="Fin" sortable>
        <template #body="slotProps">
          {{ formatCustomDate(slotProps.data.endedAt as ICustomDate) }}
        </template>
      </Column>
      <Column field="amount" header="Cantidad" sortable>
        <template #body="slotProps">
          <AmountItem :amount="slotProps.data.amount" is-currency />
        </template>
      </Column>
      <Column>
        <template #body="slotProps"">
          <div class="flex gap-2">
            <Button icon="pi pi-pencil" outlined rounded severity="info" @click="edit(slotProps.data)" />
            <Button icon="pi pi-trash" outlined rounded severity="danger" @click="remove(slotProps.data)" />
          </div>
        </template>
      </Column>
    </DataTable>
    <div v-else class="grid place-content-center">
      <span class="text-gray-500 text-lg">
        <i class="pi pi-info-circle" style="font-size: 16px;"></i>
        No hay ingresos registrados
      </span>
    </div>
  </div>

  <Dialog v-model:visible="isOpenModal" modal :header="modalHeader" class="w-lg" :draggable="false" :closable="false">
    <span class="text-surface-500 dark:text-surface-400 block mb-8">
      {{ isEditMode ? 'Edita los datos de tu ingreso.' : 'Agrega los datos de tu nuevo ingreso.' }}
    </span>
    <div class="grid grid-flow-col grid-cols-4 gap-4 mb-4">
      <label for="username" class="font-semibold grid items-center justify-end">Tipo</label>
      <Select v-model="incomeType" class="col-span-3" :options="incomeTypes" optionLabel="label" placeholder="Selecciona el tipo de ingreso" />
    </div>
    <div class="grid grid-flow-col grid-cols-4 gap-4 mb-4">
      <label for="email" class="font-semibold grid items-center justify-end">Concepto</label>
      <InputText v-model="incomeName" class="col-span-3" id="email" autocomplete="off" />
    </div>
    <div class="grid grid-flow-col grid-cols-4 gap-4 mb-4">
      <label for="email" class="font-semibold grid items-center justify-end">Cantidad</label>
      <InputNumber v-model="incomeAmount" class="col-span-3" autocomplete="off" inputId="currency-mx" mode="currency" currency="MXN" locale="es-MX" fluid />
    </div>
    <template v-if="incomeType?.value === EXTRA_INCOME_TYPE_VALUE">
      <div class="grid grid-flow-col grid-cols-4 gap-4 mb-4">
        <label for="email" class="font-semibold grid items-center justify-end">Inicio</label>
        <div class="grid grid-cols-2 gap-4 col-span-3">
          <Select v-model="incomeStartedMonth" :options="months" optionLabel="label" placeholder="Mes" />
          <Select v-model="incomeStartedYear" :options="years" optionLabel="label" placeholder="Año" />
        </div>
      </div>
      <div class="grid grid-flow-col grid-cols-4 gap-4 mb-4">
        <label for="email" class="font-semibold grid items-center justify-end">Fin</label>
        <div class="grid grid-cols-2 gap-4 col-span-3">
          <Select v-model="incomeEndedMonth" :options="months" optionLabel="label" placeholder="Mes" />
          <Select v-model="incomeEndededYear" :options="years" optionLabel="label" placeholder="Año" />
        </div>
      </div>
    </template>

    <div v-if="errorMessage" class="grid grid-flow-col mb-4">
      <Message icon="pi pi-info-circle" severity="error">{{ errorMessage }}</Message>
    </div>

    <div class="grid grid-flow-col place-content-end gap-2">
      <Button type="button" label="Cancelar" severity="secondary" @click="cancelSave"></Button>
      <Button type="button" label="Guardar" icon="pi pi-save" @click="save"></Button>
    </div>
  </Dialog>
</template>
