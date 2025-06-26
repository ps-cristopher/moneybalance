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
import { formatCustomDate } from '@/utils';
import {
  PAGINATION_ROWS_PER_PAGE,
  PAGINATION_OPTIONS,
  STATIC_PAYMENT_TYPE_VALUE,
  SUSCRIPTION_PAYMENT_TYPE_VALUE,
} from '@/constants'
import type {
  IExpenseType,
  IExpense,
  IMonth,
  IYear,
  ICustomDate,
  IAmountType,
} from '@/types';
import useDateFilters from '@/hooks/useDateFilters';

const toast = useToast()
const confirm = useConfirm()
const {
  expenseTypes,
  amountTypes,
  months,
  years,
  expenses,
  addExpense,
  updateExpense,
  removeExpense,
} = useStore()

const {
  selectedMonth,
  selectedYear,
  monthsToRender,
  yearsToRender,
} = useDateFilters()

const modalHeader = computed(() => isEditMode.value ? 'Editar Gasto' : 'Nuevo Gasto')

const isOpenModal = ref(false)
const isEditMode = ref(false)
const editingExpenseId = ref<string | null>(null)
const errorMessage = ref<string | null>(null)
const expenseType = ref<IExpenseType | null>(null)
const expenseName = ref<string | null>(null)
const expenseAmount = ref<number | null>(null)
const amountType = ref<IAmountType | null>(null)
const expenseDateMonth = ref<IMonth | null>(null)
const expenseDateYear = ref<IYear | null>(null)

const defaultExpenseType: IAmountType = {...amountTypes[STATIC_PAYMENT_TYPE_VALUE]}

const allExpensesToRender = computed(() => {
  return expenses.filter((expense) => {
    const expenseMonth = expense.date?.month || 0
    const expenseYear = expense.date?.year || 0
    const isStaticPaymentType = expense.type?.value === STATIC_PAYMENT_TYPE_VALUE || expense.type?.value === SUSCRIPTION_PAYMENT_TYPE_VALUE
    const isInSelectedDate = (expenseMonth === selectedMonth.value?.value && expenseYear === selectedYear.value?.value)

    return isStaticPaymentType || isInSelectedDate
  })
})

const isStaticPaymentType = computed(() => {
  return expenseType.value?.value === STATIC_PAYMENT_TYPE_VALUE || expenseType.value?.value === SUSCRIPTION_PAYMENT_TYPE_VALUE
})

const openCreateModal = () => {
  clearForm()
  isEditMode.value = false
  editingExpenseId.value = null
  isOpenModal.value = true
}

const showSuccess = (summary: string, detail: string) => {
  toast.add({ severity: 'success', summary: summary, detail: detail, life: 5000 })
}

const clearForm = () => {
  expenseType.value = null
  expenseName.value = null
  expenseAmount.value = null
  amountType.value = null
  expenseDateMonth.value = null
  expenseDateYear.value = null
  errorMessage.value = null
}

const cancelSave = () => {
  clearForm()
  isEditMode.value = false
  editingExpenseId.value = null
  isOpenModal.value = false
}

const edit = (expense: IExpense) => {
  isEditMode.value = true
  editingExpenseId.value = expense.id
  expenseType.value = expense.type
  expenseName.value = expense.name
  expenseAmount.value = expense.amount
  amountType.value = expense.amountType
  expenseDateMonth.value = months.find(m => m.value === expense.date?.month) || null
  expenseDateYear.value = years.find(y => y.value === expense.date?.year) || null
  errorMessage.value = null
  isOpenModal.value = true
}

const remove = (expense: IExpense) => {
  confirm.require({
    message: '¿Estás seguro de eliminar este gasto?',
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
      removeExpense(expense)
      showSuccess('Eliminación exitosa', 'Se ha eliminado tu gasto')
    },
    reject: () => {
      return
    }
  });
}

const showErrorMessage = (message: string = 'Todos los campos son requeridos') => {
  errorMessage.value = message
}

const save = () => {
  errorMessage.value = null

  if (!expenseType.value || !expenseName.value || !expenseAmount.value) {
    showErrorMessage()
    return
  }

  if (isStaticPaymentType.value && !amountType.value) {
    showErrorMessage()
    return
  }

  let newExpense: IExpense = {
    id: isEditMode.value && editingExpenseId.value ? editingExpenseId.value : Math.random().toString(36).substring(2, 9),
    type: expenseType.value,
    amountType: isStaticPaymentType.value && amountType.value ? amountType.value : defaultExpenseType,
    name: expenseName.value,
    amount: expenseAmount.value,
  }

  if (!isStaticPaymentType.value) {
    if (!expenseDateMonth.value || !expenseDateYear.value) {
      showErrorMessage()
      return
    }

    newExpense = {
      ...newExpense,
      date: {
        month: expenseDateMonth.value?.value,
        year: expenseDateYear.value?.value,
      }
    }
  }

  if (isEditMode.value) {
    updateExpense(newExpense)
    showSuccess('Actualización exitosa', 'Se ha actualizado tu gasto')
  } else {
    addExpense(newExpense)
    showSuccess('Registro exitoso', 'Se ha registrado tu nuevo gasto')
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
      Gastos ({{ allExpensesToRender.length }})
    </h1>
    <div class="grid grid-cols-2 gap-4">
      <Select v-model="selectedMonth" :options="monthsToRender" optionLabel="label" placeholder="Mes" />
      <Select v-model="selectedYear" :options="yearsToRender" optionLabel="label" placeholder="Año" />
    </div>
  </div>

  <Divider />
  
  <div class="grid place-content-end items-center mb-4 grid-flow-col gap-2">
    <div>
      <Button label="Nuevo Gasto" icon="pi pi-plus" @click="openCreateModal" />
    </div>
  </div>

  <div class="mb-4">
    <DataTable
      v-if="allExpensesToRender.length > 0"
      :value="allExpensesToRender"
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
      <Column field="amountType.label" header="Tipo de cantidad" sortable />
      <Column field="date" header="Fecha" sortable>
        <template #body="slotProps">
          {{ formatCustomDate(slotProps.data.date as ICustomDate) }}
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
        No hay gastos registrados
      </span>
    </div>
  </div>

  <Dialog v-model:visible="isOpenModal" modal :header="modalHeader" class="w-lg" :draggable="false" :closable="false">
    <span class="text-surface-500 dark:text-surface-400 block mb-8">
      {{ isEditMode ? 'Edita los datos de tu gasto.' : 'Agrega los datos de tu nuevo gasto.' }}
    </span>
    <div class="grid grid-flow-col grid-cols-4 gap-4 mb-4">
      <label for="username" class="font-semibold grid items-center justify-end">Tipo</label>
      <Select v-model="expenseType" class="col-span-3" :options="expenseTypes" optionLabel="label" placeholder="Selecciona el tipo de gasto" />
    </div>
    <div class="grid grid-flow-col grid-cols-4 gap-4 mb-4">
      <label for="email" class="font-semibold grid items-center justify-end">Concepto</label>
      <InputText v-model="expenseName" class="col-span-3" id="email" autocomplete="off" />
    </div>
    <div class="grid grid-flow-col grid-cols-4 gap-4 mb-4">
      <label for="email" class="font-semibold grid items-center justify-end">Cantidad</label>
      <InputNumber v-model="expenseAmount" class="col-span-3" autocomplete="off" inputId="currency-mx" mode="currency" currency="MXN" locale="es-MX" fluid />
    </div>
    <template v-if="expenseType && isStaticPaymentType">
      <div class="grid grid-flow-col grid-cols-4 gap-4 mb-4">
        <label for="email" class="font-semibold grid items-center justify-end">Cantidad</label>
        <Select v-model="amountType" class="col-span-3" :options="amountTypes" optionLabel="label" placeholder="Selecciona el tipo de cantidad" />
      </div>
    </template>
    <template v-if="expenseType && !isStaticPaymentType">
      <div class="grid grid-flow-col grid-cols-4 gap-4 mb-4">
        <label for="email" class="font-semibold grid items-center justify-end">Fecha</label>
        <div class="grid grid-cols-2 gap-4 col-span-3">
          <Select v-model="expenseDateMonth" :options="months" optionLabel="label" placeholder="Mes" />
          <Select v-model="expenseDateYear" :options="years" optionLabel="label" placeholder="Año" />
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
