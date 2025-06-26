<script setup lang="ts">
import { DEBTS_LABEL, STATIC_PAYMENT_TYPE_VALUE, SUSCRIPTION_PAYMENT_TYPE_VALUE } from '@/constants';
import { useStore } from '@/stores/store';
import type { ICustomDate, IMonth, IYear, Month } from '@/types';
import Card from 'primevue/card';
import Divider from 'primevue/divider';
import Select from 'primevue/select';
import Chart from 'primevue/chart';
import Column from 'primevue/column';
import { computed, ref } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import useTour, { TourStep } from '@/hooks/useTour';
import AmountCard from '@/components/AmountCard.vue';
import SummaryTable from '@/components/SummaryTable/SummaryTable.vue';
import AmountItem from '@/components/SummaryTable/AmountItem.vue';
import AnnualSummary from '@/components/AnnualSummary.vue';
import { formatCurrency, getRemainingAmountToPay, getRemainingPayments, periodIncludesCustomDate } from '@/utils';

const {
  months,
  years,
  incomes,
  expenses,
  debts,
  summaryTourSeen,
  setSummaryTourSeen,
} = useStore()

const currentMonth = new Date().getMonth() + 1
const currentYear = new Date().getFullYear()

const selectedMonth = ref<IMonth>({value: currentMonth, label: months[currentMonth - 1].label})
const selectedYear = ref<IYear>({value: currentYear, label: `${currentYear}`})

const monthsToRender = months.filter(month => month.value >= currentMonth - 1)
const yearsToRender = years.filter(year => year.value >= currentYear)

const selectedDate = computed<ICustomDate>(() => ({ month: selectedMonth.value?.value as Month, year: selectedYear.value?.value }))

const filtersContainer = ref<HTMLElement | null>(null)
const projectionContainer = ref<HTMLElement | null>(null)
const incomesTableContainer = ref<HTMLElement | null>(null)
const suscriptionsTableContainer = ref<HTMLElement | null>(null)
const staticExpensesTableContainer = ref<HTMLElement | null>(null)
const withdrawalsTableContainer = ref<HTMLElement | null>(null)
const debtsTableContainer = ref<HTMLElement | null>(null)

const tourSteps: TourStep[] = [
  {
    message: 'Bienvenido al resumen general de tus finanzas. Aquí encontrarás una visión completa de tus ingresos, gastos y deudas.'
  },
  {
    message: 'Usa estos filtros para seleccionar el mes y el año que deseas revisar.',
    target: filtersContainer,
  },
  {
    message: 'Consulta la proyección anual para anticipar tus gastos y planificar tus ahorros.',
    target: projectionContainer,
  },
  {
    message: 'Aquí se listan tus ingresos para el periodo seleccionado.',
    target: incomesTableContainer,
  },
  {
    message: 'En esta sección puedes revisar todas tus suscripciones registradas.',
    target: suscriptionsTableContainer,
  },
  {
    message: 'Esta tabla muestra tus gastos fijos recurrentes.',
    target: staticExpensesTableContainer,
  },
  {
    message: 'Aquí encontrarás los retiros y otros gastos del mes.',
    target: withdrawalsTableContainer,
  },
  {
    message: 'Por último, revisa el detalle de tus deudas pendientes.',
    target: debtsTableContainer,
  },
]

const { isTourOpen, tourStep, tourStyle, nextTourStep } = useTour(
  tourSteps,
  summaryTourSeen,
  setSummaryTourSeen,
)

const generalExpensesToRender = computed(() => {
  return expenses.filter(expense => {
    const expenseMonth = expense.date?.month || 0
    const expenseYear = expense.date?.year || 0
    const isStaticPaymentType = expense.type?.value === STATIC_PAYMENT_TYPE_VALUE || expense.type?.value === SUSCRIPTION_PAYMENT_TYPE_VALUE
    const isInSelectedDate = (expenseMonth === selectedMonth.value?.value && expenseYear === selectedYear.value?.value)

    return !isStaticPaymentType && isInSelectedDate
  })
})

const totalGeneralExpenses = computed(() => {
  return generalExpensesToRender.value.reduce((acc, expense) => acc + expense.amount, 0)
})

const staticExpensesToRender = computed(() => {
  return expenses.filter(expense => expense.type?.value === STATIC_PAYMENT_TYPE_VALUE)
})

const totalStaticExpenses = computed(() => {
  return staticExpensesToRender.value.reduce((acc, expense) => acc + expense.amount, 0)
})

const suscriptionsToRender = computed(() => {
  return expenses.filter(expense => expense.type?.value === SUSCRIPTION_PAYMENT_TYPE_VALUE)
})

const totalSuscriptions = computed(() => {
  return suscriptionsToRender.value.reduce((acc, expense) => acc + expense.amount, 0)
})

const incomesToRender = computed(() => {
  return incomes.filter(income => {
    const isInIncomePeriod = periodIncludesCustomDate({
      startedAt: income.startedAt,
      endedAt: income.endedAt,
    }, selectedDate.value)

    return income.type?.value === STATIC_PAYMENT_TYPE_VALUE || isInIncomePeriod
  })
})

const totalIncomes = computed<number>(() => {
  return incomesToRender.value.reduce((acc, income) => acc + income.amount, 0)
})

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

const totalDebts = computed(() => {
  return debtsToRender.value.reduce((acc, debt) => acc + debt.amount, 0)
})

const allExpensesToRender = computed(() => {
  return expenses.filter((expense) => {
    const expenseMonth = expense.date?.month || 0
    const expenseYear = expense.date?.year || 0
    const isStaticPaymentType = expense.type?.value === STATIC_PAYMENT_TYPE_VALUE || expense.type?.value === SUSCRIPTION_PAYMENT_TYPE_VALUE
    const isInSelectedDate = (expenseMonth === selectedMonth.value?.value && expenseYear === selectedYear.value?.value)

    return isStaticPaymentType || isInSelectedDate
  })
})

const totalALLExpenses = computed(() => {
  return totalGeneralExpenses.value + totalStaticExpenses.value + totalSuscriptions.value
})

const totalToPay = computed<number>(() => {
  return totalDebts.value + totalALLExpenses.value
})

const totalToSave = computed(() => {
  return totalIncomes.value - totalToPay.value
})

const expensesChartData = computed(() => {
  const expensesData = allExpensesToRender.value.reduce((acc, expense) => {
    const expenseType = expense.type?.label || 'Sin Tipo'
    acc[expenseType] = acc[expenseType] ? acc[expenseType] + expense.amount : expense.amount

    return acc
  }, {} as Record<string, number>)

  const debtsData = debtsToRender.value.reduce((acc, debt) => {
    acc[DEBTS_LABEL] = acc[DEBTS_LABEL] ? acc[DEBTS_LABEL] + debt.amount : debt.amount

    return acc
  }, {} as Record<string, number>)

  return {
    labels: Object.keys({...expensesData, ...debtsData}),
    datasets: [
      {
        data: Object.values({...expensesData, ...debtsData}),
        backgroundColor: ['#ff5500', "#5390ff", "#ff308f", "#59b0aa", '#eae300'],
        hoverBackgroundColor: ['#f54a00', "#155dfc", "#e60076", "#59b0aa", '#eae300']
      }
    ]
  }
})

const balanceChartData = computed(() => {
  const balanceData = {
    labels: ['Monto a pagar', 'Disponible / Ahorro'],
    datasets: [
      {
        data: [totalToPay.value, totalToSave.value],
        backgroundColor: ['#ff413c', '#27b54d'],
        hoverBackgroundColor: ['#e7000b', '#00a63e']
      }
    ]
  }

  return balanceData
})
</script>

<template>
  <main>
    <Dialog v-model:visible="isTourOpen" :style="tourStyle" modal :draggable="false" :closable="false" class="w-lg">
      <p class="text-surface-500 dark:text-surface-400 mb-4">{{ tourSteps[tourStep].message }}</p>
      <Button class="w-full" type="button" :label="tourStep < tourSteps.length - 1 ? 'Siguiente' : 'Entendido'" @click="nextTourStep" />
    </Dialog>
    <div ref="filtersContainer" class="grid grid-flow-row lg:grid-flow-col gap-2 mb-4 sticky top-0 bg-s z-10 p-5 bg-sky-950">
      <div class="grid items-center justify-start lg:justify-end">
        <h1 class="text-lg lg:text-xl font-semibold text-white">
          <i class="pi pi-chart-line" style="font-size: 14px;"></i>
          Proyección de balance para
        </h1>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <Select v-model="selectedMonth" :options="monthsToRender" optionLabel="label" placeholder="Mes" />
        <Select v-model="selectedYear" :options="yearsToRender" optionLabel="label" placeholder="Año" />
      </div>
    </div>

    <div class="p-5">
      <div class="grid lg:grid-cols-3 gap-4">
        <AmountCard
          :amount="totalIncomes"
          label="Ingresos"
          icon-class="pi-money-bill"
          :date="selectedDate"
          label-class="text-green-600"
        />

        <AmountCard
          :amount="totalToPay"
          label="Monto a Pagar"
          icon-class="pi-wallet"
          :date="selectedDate"
          label-class="text-red-600"
        />

        <AmountCard
          :amount="totalToSave"
          label="Disponible - Ahorro"
          icon-class="pi-arrow-up"
          :date="selectedDate"
          :label-class="totalToSave > 0 ? 'text-green-600' : 'text-red-600'"
        />
      </div>

      <div v-if="totalToPay > 0 && totalToSave > 0" class="grid lg:grid-cols-2 gap-4 mt-5">
        <Card class="grid place-content-center cols-span-2">
          <template #title>
            <div class="grid place-items-center">
              <span class="font-bold">
                <i class="pi pi-chart-pie"></i>
                Balance
              </span>
            </div>
          </template>
          <template #content>
            <div class="grid place-content-center w-full">
              <Chart type="doughnut" :data="balanceChartData" class="w-full" />
            </div>
          </template>
          <template #footer>
            <div class="grid place-items-end">
              <span class="text-xs text-gray-500 p-1">
                <i class="pi pi-calendar" style="font-size: 14px;"></i>
                {{ months[selectedDate.month - 1].label }} {{ selectedDate.year }}
              </span>
            </div>
          </template>
        </Card>

        <Card class="grid place-content-center cols-span-2">
          <template #title>
            <div class="grid place-items-center">
              <span class="font-bold">
                <i class="pi pi-chart-pie"></i>
                Todos los gastos
              </span>
            </div>
          </template>
          <template #content>
            <div class="grid place-content-center w-full">
              <Chart type="doughnut" :data="expensesChartData" class="w-full" />
            </div>
          </template>
          <template #footer>
            <div class="grid place-items-end">
              <span class="text-xs text-gray-500 p-1">
                <i class="pi pi-calendar" style="font-size: 14px;"></i>
                {{ months[selectedDate.month - 1].label }} {{ selectedDate.year }}
              </span>
            </div>
          </template>
        </Card>
      </div>

      <Divider />

      <AnnualSummary
        class="mb-12"
        :selected-date="selectedDate"
        :container-ref="projectionContainer"
      />

      <Divider />

      <SummaryTable
        class="mb-12"
        icon-class="pi-money-bill"
        sort-field="amount"
        title-label="Ingresos"
        empty-state-label="No hay ingresos registrados para la fecha seleccionada"
        :rows="incomesToRender"
        :sub-title-label="formatCurrency(totalIncomes)"
        :container-ref="incomesTableContainer"
      >
          <template #columns>
            <Column field="name" header="Concepto" sortable class="w-1/5"/>
            <Column field="type.label" header="Tipo" sortable class="w-1/5"/>
            <Column field="amount" header="Cantidad" sortable class="w-1/5">
              <template #body="slotProps">
                <AmountItem :amount="slotProps.data.amount" is-currency />
              </template>
            </Column>
            <Column />
            <Column />
        </template>
      </SummaryTable>

      <Divider />

      <SummaryTable
        class="mb-12"
        icon-class="pi-receipt"
        sort-field="amount"
        title-label="Suscripciones"
        empty-state-label="No hay suscripciones registradas para la fecha seleccionada"
        :rows="suscriptionsToRender"
        :sub-title-label="formatCurrency(totalSuscriptions)"
        :container-ref="suscriptionsTableContainer"
      >
        <template #columns>
          <Column field="name" header="Concepto" sortable class="w-1/5"/>
          <Column field="amountType.label" header="Tipo de cantidad" sortable class="w-1/5"/>
          <Column field="amount" header="Cantidad" sortable class="w-1/5">
            <template #body="slotProps">
              <AmountItem :amount="slotProps.data.amount" is-currency />
            </template>
          </Column>
          <Column />
          <Column />
        </template>
      </SummaryTable>

      <Divider />

      <SummaryTable
        class="mb-12"
        icon-class="pi-wallet"
        sort-field="amount"
        title-label="Gastos fijos"
        empty-state-label="No hay gastos registrados para la fecha seleccionada"
        :rows="staticExpensesToRender"
        :sub-title-label="formatCurrency(totalStaticExpenses)"
        :container-ref="staticExpensesTableContainer"
      >
        <template #columns>
          <Column field="name" header="Concepto" sortable class="w-1/5"/>
          <Column field="amountType.label" header="Tipo de cantidad" sortable class="w-1/5"/>
          <Column field="amount" header="Cantidad" sortable class="w-1/5">
            <template #body="slotProps">
              <AmountItem :amount="slotProps.data.amount" is-currency />
            </template>
          </Column>
          <Column />
          <Column />
        </template>
      </SummaryTable>

      <Divider />

      <SummaryTable
        class="mb-12"
        icon-class="pi-wallet"
        sort-field="amount"
        title-label="Retiros y otros gastos"
        empty-state-label="No hay gastos registrados para la fecha seleccionada"
        :rows="generalExpensesToRender"
        :sub-title-label="formatCurrency(totalGeneralExpenses)"
        :container-ref="withdrawalsTableContainer"
      >
        <template #columns>
          <Column field="name" header="Concepto" sortable class="w-1/5"/>
          <Column field="type.label" header="Tipo" sortable class="w-1/5"/>
          <Column field="amount" header="Cantidad" sortable class="w-1/5">
            <template #body="slotProps">
              <AmountItem :amount="slotProps.data.amount" is-currency />
            </template>
          </Column>
          <Column />
          <Column />
        </template>
      </SummaryTable>

      <Divider />

      <SummaryTable
        class="mb-12"
        icon-class="pi-credit-card"
        sort-field="amount"
        title-label="Deudas"
        empty-state-label="No hay deudas registradas para la fecha seleccionada"
        :rows="debtsToRender"
        :sub-title-label="formatCurrency(totalDebts)"
        :container-ref="debtsTableContainer"
      >
        <template #columns>
          <Column field="name" header="Concepto" sortable class="w-1/5"/>
          <Column field="type.label" header="Tipo" sortable class="w-1/5"/>
          <Column field="amount" header="Cantidad" sortable class="w-1/5">
            <template #body="slotProps">
              <AmountItem :amount="slotProps.data.amount" is-currency />
            </template>
          </Column>
          <Column field="remainingPayments" header="Pagos restantes" sortable class="w-1/5">
            <template #body="slotProps">
              <AmountItem :amount="slotProps.data.remainingPayments" />
            </template>
          </Column>
          <Column field="remainingAmountToPay" header="Monto restante" sortable class="w-1/5">
            <template #body="slotProps">
              <AmountItem :amount="slotProps.data.remainingAmountToPay" is-currency />
            </template>
          </Column>
        </template>
      </SummaryTable>
    </div>
  </main>
</template>
