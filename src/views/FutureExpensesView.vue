<script setup lang="ts">
import Divider from 'primevue/divider'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Select from 'primevue/select'
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'
import Message from 'primevue/message'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import AmountItem from '@/components/SummaryTable/AmountItem.vue'
import { computed, ref } from 'vue'
import { useStore } from '@/stores/store'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import useSearchFilter from '@/hooks/useSearchFilter'
import type { IFutureExpense, IFutureSubExpense } from '@/types'

const toast = useToast()
const confirm = useConfirm()
const {
  futureExpenses,
  updateFutureExpense,
  removeFutureExpense,
  setFutureExpenses,
} = useStore()

const isOpenModal = ref(false)
const isEditMode = ref(false)
const editingExpenseId = ref<string | null>(null)
const errorMessage = ref<string | null>(null)
const expenseName = ref<string | null>(null)
const selectedPriority = ref<number | null>(null)
const subExpenses = ref<IFutureSubExpense[]>([])

const modalHeader = computed(() => isEditMode.value ? 'Editar gasto futuro' : 'Nuevo gasto futuro')
const totalAmount = computed(() => {
  return subExpenses.value.reduce((acc, item) => acc + item.amount, 0)
})

const sortedFutureExpenses = computed(() => {
  return [...futureExpenses].sort((a, b) => a.priority - b.priority)
})

const { searchText, filteredItems: filteredFutureExpenses } = useSearchFilter(sortedFutureExpenses)

const priorityOptions = computed(() => {
  const size = futureExpenses.length + (isEditMode.value ? 0 : 1)
  return Array.from({ length: size }, (_, index) => ({
    value: index + 1,
    label: `Prioridad ${index + 1}`,
  }))
})

const showSuccess = (summary: string, detail: string) => {
  toast.add({ severity: 'success', summary, detail, life: 5000 })
}

const normalizePriorities = (items: IFutureExpense[]) => {
  return [...items]
    .sort((a, b) => a.priority - b.priority)
    .map((item, index) => ({ ...item, priority: index + 1 }))
}

const getPriorityBounded = (priority: number, maxPriority: number) => {
  return Math.max(1, Math.min(priority, maxPriority))
}

const insertFutureExpenseWithPriority = (items: IFutureExpense[], newItem: IFutureExpense) => {
  const boundedPriority = getPriorityBounded(newItem.priority, items.length + 1)
  const shiftedItems = items.map((item) => {
    if (item.priority >= boundedPriority) {
      return { ...item, priority: item.priority + 1 }
    }
    return { ...item }
  })

  return normalizePriorities([
    ...shiftedItems,
    {
      ...newItem,
      priority: boundedPriority,
    },
  ])
}

const clearForm = () => {
  expenseName.value = null
  selectedPriority.value = null
  subExpenses.value = []
  errorMessage.value = null
}

const cancelSave = () => {
  clearForm()
  isEditMode.value = false
  editingExpenseId.value = null
  isOpenModal.value = false
}

const openCreateModal = () => {
  clearForm()
  isEditMode.value = false
  editingExpenseId.value = null
  selectedPriority.value = futureExpenses.length + 1
  isOpenModal.value = true
}

const addSubExpense = () => {
  subExpenses.value.push({
    id: Math.random().toString(36).substring(2, 9),
    name: '',
    amount: 0,
  })
}

const removeSubExpense = (id: string) => {
  subExpenses.value = subExpenses.value.filter((item) => item.id !== id)
}

const edit = (futureExpense: IFutureExpense) => {
  clearForm()
  isEditMode.value = true
  editingExpenseId.value = futureExpense.id
  expenseName.value = futureExpense.name
  selectedPriority.value = futureExpense.priority
  subExpenses.value = futureExpense.subExpenses.map((subExpense) => ({ ...subExpense }))
  isOpenModal.value = true
}

const remove = (futureExpense: IFutureExpense) => {
  confirm.require({
    message: '¿Estás seguro de eliminar este gasto futuro?',
    header: 'Confirmación',
    icon: 'pi pi-exclamation-triangle',
    rejectProps: {
      label: 'No',
      severity: 'secondary',
      outlined: true,
    },
    acceptProps: {
      label: 'Sí, eliminar',
      severity: 'danger',
    },
    accept: () => {
      removeFutureExpense(futureExpense)
      setFutureExpenses(normalizePriorities(futureExpenses))
      showSuccess('Eliminación exitosa', 'Se ha eliminado tu gasto futuro')
    },
    reject: () => {
      return
    },
  })
}

const showErrorMessage = (message: string = 'Todos los campos son requeridos') => {
  errorMessage.value = message
}

const save = () => {
  errorMessage.value = null

  if (!expenseName.value || !selectedPriority.value) {
    showErrorMessage()
    return
  }

  if (subExpenses.value.length === 0) {
    showErrorMessage('Debes registrar por lo menos un subgasto')
    return
  }

  const invalidSubExpense = subExpenses.value.find((item) => !item.name || item.amount <= 0)
  if (invalidSubExpense) {
    showErrorMessage('Cada subgasto debe tener nombre y una cantidad mayor a 0')
    return
  }

  const currentItems = futureExpenses.filter((item) => item.id !== editingExpenseId.value)

  const newFutureExpense: IFutureExpense = {
    id: isEditMode.value && editingExpenseId.value ? editingExpenseId.value : Math.random().toString(36).substring(2, 9),
    name: expenseName.value,
    priority: selectedPriority.value,
    subExpenses: subExpenses.value.map((item) => ({ ...item })),
  }

  const orderedItems = insertFutureExpenseWithPriority(currentItems, newFutureExpense)

  if (isEditMode.value) {
    updateFutureExpense({
      ...newFutureExpense,
      priority: getPriorityBounded(selectedPriority.value, currentItems.length + 1),
    })
    setFutureExpenses(orderedItems)
    showSuccess('Actualización exitosa', 'Se ha actualizado tu gasto futuro')
  } else {
    setFutureExpenses(orderedItems)
    showSuccess('Registro exitoso', 'Se ha registrado tu nuevo gasto futuro')
  }

  cancelSave()
}

const getTotalByExpense = (futureExpense: IFutureExpense) => {
  return futureExpense.subExpenses.reduce((acc, item) => acc + item.amount, 0)
}
</script>

<template>
  <Toast />
  <ConfirmDialog :closable="false" :draggable="false" />

  <div class="grid grid-flow-row lg:grid-flow-col gap-2 mb-4">
    <h1 class="text-3xl font-bold">
      <i class="pi pi-calendar-clock" style="font-size: 22px;"></i>
      Gastos futuros ({{ futureExpenses.length }})
    </h1>
  </div>

  <Divider />

  <div class="mb-4">
    <div class="flex justify-end mb-2">
      <Button label="Nuevo gasto futuro" icon="pi pi-plus" @click="openCreateModal" />
    </div>
    <InputText v-model="searchText" placeholder="Buscar" class="w-full" />
  </div>

  <div class="mb-4">
    <DataTable
      v-if="filteredFutureExpenses.length > 0"
      :value="filteredFutureExpenses"
      tableStyle="min-width: 50rem"
      stripedRows
      sort-field="priority"
      paginator
      :rows="15"
      :rowsPerPageOptions="[5, 15, 30, 50]"
      row-hover
    >
      <Column field="priority" header="Prioridad" sortable />
      <Column field="name" header="Gasto planeado" sortable />
      <Column header="Subgastos">
        <template #body="slotProps">
          <ul class="list-disc pl-4">
            <li v-for="subExpense in slotProps.data.subExpenses" :key="subExpense.id">
              {{ subExpense.name }}:
              <AmountItem :amount="subExpense.amount" is-currency />
            </li>
          </ul>
        </template>
      </Column>
      <Column field="total" header="Total estimado">
        <template #body="slotProps">
          <AmountItem :amount="getTotalByExpense(slotProps.data)" is-currency />
        </template>
      </Column>
      <Column>
        <template #body="slotProps">
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
        No hay gastos futuros registrados
      </span>
    </div>
  </div>

  <Dialog v-model:visible="isOpenModal" modal :header="modalHeader" class="w-4xl" :draggable="false" :closable="false">
    <span class="text-surface-500 dark:text-surface-400 block mb-8">
      {{ isEditMode ? 'Edita tu gasto planeado.' : 'Agrega un nuevo gasto planeado.' }}
    </span>

    <div class="grid grid-flow-col grid-cols-4 gap-4 mb-4">
      <label class="font-semibold grid items-center justify-end">Nombre</label>
      <InputText v-model="expenseName" class="col-span-3" autocomplete="off" />
    </div>

    <div class="grid grid-flow-col grid-cols-4 gap-4 mb-4">
      <label class="font-semibold grid items-center justify-end">Prioridad</label>
      <Select
        v-model="selectedPriority"
        class="col-span-3"
        :options="priorityOptions"
        optionLabel="label"
        optionValue="value"
        placeholder="Selecciona prioridad"
      />
    </div>

    <div class="mb-4">
      <div class="flex justify-between items-center mb-3">
        <h3 class="text-lg font-semibold">Subgastos</h3>
        <Button label="Agregar subgasto" icon="pi pi-plus" size="small" outlined @click="addSubExpense" />
      </div>

      <div v-if="subExpenses.length === 0" class="text-sm text-gray-500">No hay subgastos agregados.</div>

      <div v-for="subExpense in subExpenses" :key="subExpense.id" class="grid grid-cols-[1fr_220px_48px] gap-2 mb-2 items-center">
        <InputText v-model="subExpense.name" placeholder="Nombre del subgasto" />
        <InputNumber
          v-model="subExpense.amount"
          inputId="currency-mx"
          mode="currency"
          currency="MXN"
          locale="es-MX"
          fluid
        />
        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="removeSubExpense(subExpense.id)" />
      </div>
    </div>

    <div class="mb-5 text-right text-base font-semibold">
      Total estimado:
      <AmountItem :amount="totalAmount" is-currency />
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
