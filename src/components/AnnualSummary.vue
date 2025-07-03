<script setup lang="ts">
import type { ICustomDate, INextMonth } from '@/types';
import { useStore } from '@/stores/store';
import Divider from 'primevue/divider';
import AmountItem from '@/components/SummaryTable/AmountItem.vue';
import { computed, ref } from 'vue';
import { STATIC_PAYMENT_TYPE_VALUE, SUSCRIPTION_PAYMENT_TYPE_VALUE } from '@/constants';
import { periodIncludesCustomDate, isSameDate, isStatictExpenseOrSuscription } from '@/utils';

const props = defineProps<{
  selectedDate: ICustomDate,
  class?: string,
}>();

const { months, incomes, expenses, debts } = useStore();

const nextTwelveMonths = computed<INextMonth[]>(() => {
  let month = props.selectedDate.month - 1;
  let year = props.selectedDate.year;

  return Array(12).fill(null).map(() => {
    month++;
    if (month > 12) {
      month = 1;
      year++;
    }

    return {
      month: month,
      year: year,
      label: `${months[month - 1].label}`,
    };
  });
});

const nextYearsByTwelveMonths = computed(() => {
  return nextTwelveMonths.value.reduce((acc: {year: number, colspan: number}[], date: INextMonth) => {
    if (!acc.find((addedDate) => addedDate.year === date.year)) {
      acc.push({
        year: date.year,
        colspan: nextTwelveMonths.value.filter((month) => month.year === date.year).length
      })
    }

    return acc
  }, [])
});

const nextTwelveMonthsExpenses = computed(() => {
  return nextTwelveMonths.value.map((date) => {
    const expensesToAdd = expenses.filter((expense) => {
      const expenseMonth = expense.date?.month || 0
      const expenseYear = expense.date?.year || 0
      const isStaticPaymentType = expense.type?.value === STATIC_PAYMENT_TYPE_VALUE || expense.type?.value === SUSCRIPTION_PAYMENT_TYPE_VALUE
      const isInSelectedDate = (expenseMonth === date.month && expenseYear === date.year)

      return isStaticPaymentType || isInSelectedDate
    }, 0)

    const totalExpensesAmount = expensesToAdd.reduce((acc, expense) => acc + expense.amount, 0)

    const debtsToAdd = debts.filter((debt) => {
      const isInDebtPeriod = periodIncludesCustomDate({
        startedAt: debt.startedAt,
        endedAt: debt.endedAt,
      }, date)

      return isInDebtPeriod
    }, 0)

    const totalDebtsAmount = debtsToAdd.reduce((acc, debt) => acc + debt.amount, 0)

    const incomeAmount = incomes.reduce((acc, income) => {
      const isInIncomePeriod = periodIncludesCustomDate({
        startedAt: income.startedAt,
        endedAt: income.endedAt,
      }, date)

      return income.type?.value === STATIC_PAYMENT_TYPE_VALUE || isInIncomePeriod ? acc + income.amount : acc
    }, 0)

    const totalAmountToPay = totalDebtsAmount + totalExpensesAmount

    return {
      date: date,
      amountToPay: totalAmountToPay,
      income: incomeAmount,
      availabeToSave: incomeAmount - totalAmountToPay,
      expenses: expensesToAdd,
      debts: debtsToAdd,
    }
  });
});

const isShowingContent = ref(false);

const toggleContent = () => {
  isShowingContent.value = !isShowingContent.value;
};
</script>

<template>
  <div :class="props.class">
    <button @click="toggleContent" class="grid grid-cols-1 rounded-sm hover:bg-sky-950 hover:text-white p-4 cursor-pointer w-full">
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
          <i class="pi pi-chart-line" style="font-size: 14px;"></i>
          Proyección anual a partir de {{ months[props.selectedDate.month - 1].label }} {{ props.selectedDate.year }}
        </div>  
      </div>
    </button>

    <Divider />

    <Transition name="slide-fade">
      <div className="overflow-x-auto" v-if="isShowingContent">
        <table>
          <thead>
            <tr>
              <th class="bg-sky-950 text-white rounded-tl-sm min-w-32 p-2 border-r-[1px] border-b-[1px] sticky left-0" scope="col"></th>
              <th
                v-for="(year, index) in nextYearsByTwelveMonths"
                :key="year.year"
                :colspan="year.colspan"
                scope="col"
                :class="[
                  'bg-sky-950 text-white p-2 min-w-32 border-b-[1px]',
                  index === nextYearsByTwelveMonths.length - 1 ? 'rounded-tr-sm' : 'border-r-[1px]'
                ]"
              >
                {{ year.year }}
              </th>
            </tr>
            <tr>
              <th class="bg-sky-950 text-white min-w-32 lg:min-w-50 p-2 border-r-[1px] sticky left-0" scope="col">Gasto / Fecha</th>
              <th class="bg-sky-950 text-white p-2 min-w-32 border-r-[1px] border-b-[1px]" v-for="month in nextTwelveMonths" :key="month.label" scope="col">
                {{ month.label }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="p-2 border-r-[1px] bg-sky-950 text-white font-semibold text-center sticky left-0">Ingresos</td>
              <td
                v-for="nextDate in nextTwelveMonthsExpenses"
                :key="nextDate.date.label"
                class="p-2 border-r-[1px] border-b-[1px] bg-white text-green-600 font-bold"
              >
                <AmountItem :amount="nextDate.income" is-currency />
              </td>
            </tr>
            <tr>
              <td class="p-2 border-r-[1px] bg-sky-950 text-white font-semibold text-center sticky left-0">Gastos</td>
              <td
                v-for="nextDate in nextTwelveMonthsExpenses"
                :key="nextDate.date.label"
                class="p-2 border-r-[1px] border-b-[1px] bg-white text-red-600 font-bold"
              >
                <AmountItem :amount="nextDate.amountToPay" is-currency />
              </td>
            </tr>
            <tr>
              <td class="p-2 border-r-[1px] bg-sky-950 text-white font-semibold text-center sticky left-0">Disponible - Ahorro</td>
              <td
                v-for="nextDate in nextTwelveMonthsExpenses"
                :key="nextDate.date.label"
                class="p-2 border-r-[1px] border-b-[1px] bg-white text-green-600 font-bold"
              >
                <AmountItem :amount="nextDate.availabeToSave" is-currency />
              </td>
            </tr>

            <tr v-for="expense in nextTwelveMonthsExpenses[0].expenses" :key="expense.id">
              <td class="p-2 border-r-[1px] bg-cyan-600 text-white font-semibold text-center sticky left-0">
                {{ expense.name }}
              </td>
              <td
                v-for="nextDate in nextTwelveMonthsExpenses"
                :key="nextDate.date.label"
                :class="[
                  'p-2 border-r-[1px] border-b-[1px] text-cyan-600 font-bold',
                  isSameDate(expense.date, nextDate.date) || isStatictExpenseOrSuscription(expense) ? 'bg-white' : 'bg-zinc-100'
                ]"
              >
                <AmountItem
                  v-if="isSameDate(expense.date, nextDate.date) || isStatictExpenseOrSuscription(expense)"
                  :amount="expense.amount"
                  is-currency
                />
                <div v-else class="w-full h-full text-center">
                  <i class="pi pi-ban"></i>
                </div>
              </td>
            </tr>
            <tr v-for="debt in nextTwelveMonthsExpenses[0].debts" :key="debt.id">
              <td class="p-2 border-r-[1px] bg-amber-500 text-white font-semibold text-center sticky left-0">
                {{ debt.name }}
              </td>
              <td
                v-for="nextDate in nextTwelveMonthsExpenses"
                :key="nextDate.date.label"
                :class="[
                  'p-2 border-r-[1px] border-b-[1px] text-amber-500 font-bold',
                  periodIncludesCustomDate({
                    startedAt: debt.startedAt,
                    endedAt: debt.endedAt,
                  }, nextDate.date) ? 'bg-white' : 'bg-zinc-100'
                ]"
              >
                <AmountItem
                  v-if="
                    periodIncludesCustomDate({
                      startedAt: debt.startedAt,
                      endedAt: debt.endedAt,
                    }, nextDate.date)
                  "
                  :amount="debt.amount"
                  is-currency
                />
                <div v-else class="w-full h-full text-center">
                  <i class="pi pi-ban"></i>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Transition>
  </div>
</template>
