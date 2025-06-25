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
import { formatCustomDate, getRemainingAmountToPay, getRemainingPayments, periodIncludesCustomDate } from '@/utils';
import {
  PAGINATION_ROWS_PER_PAGE,
  PAGINATION_OPTIONS
} from '@/constants'
import type {
  IDebtType,
  IDebt,
  IMonth,
  IYear,
  ICustomDate
} from '@/types';
import useDateFilters from '@/hooks/useDateFilters';

const toast = useToast()
const confirm = useConfirm()
const {
  debtTypes,
  months,
  years,
  debts,
  addDebt,
  updateDebt,
  removeDebt,
} = useStore()

const {
  selectedMonth,
  selectedYear,
  monthsToRender,
  yearsToRender,
  selectedDate,
} = useDateFilters()

const debtsToRender = computed(() => {
  return debts.filter(debt => {
    const isInDebtPeriod = periodIncludesCustomDate({
      startedAt: debt.startedAt,
      endedAt: debt.endedAt,
    }, selectedDate.value)

    return isInDebtPeriod
  }).map(debt => {
    return {
      ...debt,
      remainingPayments: getRemainingPayments(debt, selectedDate.value),
      remainingAmountToPay: getRemainingAmountToPay(debt, selectedDate.value)
    }
  })
})

const modalHeader = computed(() => isEditMode.value ? 'Editar Deuda' : 'Nueva Deuda')

const isOpenModal = ref(false)
const isEditMode = ref(false)
const editingDebtId = ref<string | null>(null)
const errorMessage = ref<string | null>(null)
const debtType = ref<IDebtType | null>(null)
const debtName = ref<string | null>(null)
const debtAmount = ref<number | null>(null)
const debtStartedMonth = ref<IMonth | null>(null)
const debtStartedYear = ref<IYear | null>()
const debtEndedMonth = ref<IMonth | null>(null)
const debtEndededYear = ref<IYear | null>(null)

const openCreateModal = () => {
  clearForm()
  isEditMode.value = false
  editingDebtId.value = null
  isOpenModal.value = true
}

const showSuccess = (summary: string, detail: string) => {
  toast.add({ severity: 'success', summary: summary, detail: detail, life: 5000 })
}

const clearForm = () => {
  debtType.value = null
  debtName.value = null
  debtAmount.value = null
  debtStartedMonth.value = null
  debtStartedYear.value = null
  debtEndedMonth.value = null
  debtEndededYear.value = null
  errorMessage.value = null
}

const cancelSave = () => {
  clearForm()
  isEditMode.value = false
  editingDebtId.value = null
  isOpenModal.value = false
}

const edit = (debt: IDebt) => {
  isEditMode.value = true
  editingDebtId.value = debt.id
  debtType.value = debt.type
  debtName.value = debt.name
  debtAmount.value = debt.amount
  debtStartedMonth.value = months.find(m => m.value === debt.startedAt.month) || null
  debtStartedYear.value = years.find(y => y.value === debt.startedAt.year) || null
  debtEndedMonth.value = months.find(m => m.value === debt.endedAt.month) || null
  debtEndededYear.value = years.find(y => y.value === debt.endedAt.year) || null
  errorMessage.value = null
  isOpenModal.value = true
}

const remove = (debt: IDebt) => {
  confirm.require({
    message: '¿Estás seguro de eliminar esta deuda?',
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
      removeDebt(debt)
      showSuccess('Eliminación exitosa', 'Se ha eliminado tu deuda')
    },
    reject: () => {
      return
    }
  });
}

const save = () => {
  errorMessage.value = null

  if (!debtType.value || !debtName.value || !debtAmount.value || !debtStartedMonth.value || !debtStartedYear.value || !debtEndedMonth.value || !debtEndededYear.value) {
    errorMessage.value = 'Todos los campos son requeridos'
    return
  }

  let newDebt: IDebt = {
    id: isEditMode.value && editingDebtId.value ? editingDebtId.value : Math.random().toString(36).substring(2, 9),
    type: debtType.value,
    name: debtName.value,
    amount: debtAmount.value,
    startedAt: {
      month: debtStartedMonth.value?.value,
      year: debtStartedYear.value?.value,
    },
    endedAt: {
      month: debtEndedMonth.value?.value,
      year: debtEndededYear.value?.value,
    }
  }

  if (isEditMode.value) {
    updateDebt(newDebt)
    showSuccess('Actualización exitosa', 'Se ha actualizado tu deuda')
  } else {
    addDebt(newDebt)
    showSuccess('Registro exitoso', 'Se ha registrado tu nueva deuda')
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
      Deudas ({{ debtsToRender.length }})
    </h1>
    <div class="grid grid-cols-2 gap-4">
      <Select v-model="selectedMonth" :options="monthsToRender" optionLabel="label" placeholder="Mes" />
      <Select v-model="selectedYear" :options="yearsToRender" optionLabel="label" placeholder="Año" />
    </div>
  </div>

  <Divider />
  
  <div class="grid place-content-end items-center mb-4 grid-flow-col gap-2">
    <div>
      <Button label="Nueva Deuda" icon="pi pi-plus" @click="openCreateModal" />
    </div>
  </div>

  <div class="mb-4">
    <DataTable
      v-if="debtsToRender.length > 0"
      :value="debtsToRender"
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
        No hay deudas registradas
      </span>
    </div>
  </div>

  <Dialog v-model:visible="isOpenModal" modal :header="modalHeader" class="w-lg" :draggable="false" :closable="false">
    <span class="text-surface-500 dark:text-surface-400 block mb-8">
      {{ isEditMode ? 'Edita los datos de tu deuda.' : 'Agrega los datos de tu nueva deuda.' }}
    </span>
    <div class="grid grid-flow-col grid-cols-4 gap-4 mb-4">
      <label for="username" class="font-semibold grid items-center justify-end">Tipo</label>
      <Select v-model="debtType" class="col-span-3" :options="debtTypes" optionLabel="label" placeholder="Selecciona el tipo de deuda" />
    </div>
    <div class="grid grid-flow-col grid-cols-4 gap-4 mb-4">
      <label for="email" class="font-semibold grid items-center justify-end">Concepto</label>
      <InputText v-model="debtName" class="col-span-3" id="email" autocomplete="off" />
    </div>
    <div class="grid grid-flow-col grid-cols-4 gap-4 mb-4">
      <label for="email" class="font-semibold grid items-center justify-end">Cantidad</label>
      <InputNumber v-model="debtAmount" class="col-span-3" autocomplete="off" inputId="currency-mx" mode="currency" currency="MXN" locale="es-MX" fluid />
    </div>
    <div class="grid grid-flow-col grid-cols-4 gap-4 mb-4">
      <label for="email" class="font-semibold grid items-center justify-end">Inicio</label>
      <div class="grid grid-cols-2 gap-4 col-span-3">
        <Select v-model="debtStartedMonth" :options="months" optionLabel="label" placeholder="Mes" />
        <Select v-model="debtStartedYear" :options="years" optionLabel="label" placeholder="Año" />
      </div>
    </div>
    <div class="grid grid-flow-col grid-cols-4 gap-4 mb-4">
      <label for="email" class="font-semibold grid items-center justify-end">Fin</label>
      <div class="grid grid-cols-2 gap-4 col-span-3">
        <Select v-model="debtEndedMonth" :options="months" optionLabel="label" placeholder="Mes" />
        <Select v-model="debtEndededYear" :options="years" optionLabel="label" placeholder="Año" />
      </div>
    </div>

    <div v-if="errorMessage" class="grid grid-flow-col mb-4">
      <Message icon="pi pi-info-circle" severity="error">{{ errorMessage }}</Message>
    </div>

    <div class="grid grid-flow-col place-content-end gap-2">
      <Button type="button" label="Cancelar" severity="secondary" @click="cancelSave"></Button>
      <Button type="button" label="Guardar" icon="pi pi-save" @click="save"></Button>
    </div>
  </Dialog>
</template>
