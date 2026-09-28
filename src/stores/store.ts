import { computed } from 'vue'
import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import { getYearsForSelect } from '@/utils'
import {
  DARK_MODE_STORAGE_KEY,
  INCOMES_LOCAL_STORAGE_KEY,
  EXPENSES_LOCAL_STORAGE_KEY,
  DEBTS_LOCAL_STORAGE_KEY,
  USER_INFO_STORAGE_KEY,
  FUTURE_EXPENSES_LOCAL_STORAGE_KEY
} from '@/constants'
import { getLocaleMessages } from '@/i18n'
import type {
  IAmountType,
  IDebt,
  IFutureExpense,
  IDebtType,
  IExpense,
  IExpenseType,
  IIncome,
  IIncomeType,
  IMonth,
  IUserInfo
} from '@/types'

const START_YEAR = 2024
const END_YEAR = 2034

export const useStore = defineStore('store', () => {
  const isDarkMode = useStorage<boolean>(DARK_MODE_STORAGE_KEY, false)
  const userInfo = useStorage<IUserInfo>(USER_INFO_STORAGE_KEY, {
    name: null, 
  })
  const localizedOptions = <T extends IIncomeType | IExpenseType | IAmountType | IDebtType | IMonth>(labels: readonly string[]) =>
    labels.map((label, index) => ({ value: index + 1, label }) as T)

  const months = computed<IMonth[]>(() => localizedOptions<IMonth>(getLocaleMessages().months))
  const incomeTypes = computed<IIncomeType[]>(() => localizedOptions<IIncomeType>(getLocaleMessages().incomeTypes))
  const expenseTypes = computed<IExpenseType[]>(() => localizedOptions<IExpenseType>(getLocaleMessages().expenseTypes))
  const amountTypes = computed<IAmountType[]>(() => localizedOptions<IAmountType>(getLocaleMessages().amountTypes))
  const debtTypes = computed<IDebtType[]>(() => localizedOptions<IDebtType>(getLocaleMessages().debtTypes))
  const years = getYearsForSelect(START_YEAR, END_YEAR)
  const incomes = useStorage<IIncome[]>(INCOMES_LOCAL_STORAGE_KEY, [])
  const expenses = useStorage<IExpense[]>(EXPENSES_LOCAL_STORAGE_KEY, [])
  const debts = useStorage<IDebt[]>(DEBTS_LOCAL_STORAGE_KEY, [])
  const futureExpenses = useStorage<IFutureExpense[]>(FUTURE_EXPENSES_LOCAL_STORAGE_KEY, [])

  const setDarkMode = (value: boolean) => {
    isDarkMode.value = value
  }

  const addIncome = (income: IIncome) => {
    incomes.value.push(income)
  }

  const updateIncome = (updatedIncome: IIncome) => {
    const index = incomes.value.findIndex(i => i.id === updatedIncome.id)
    if (index !== -1) {
      incomes.value[index] = updatedIncome
    }
  }

  const removeIncome = (income: IIncome) => {
    const incomeIndex = incomes.value.findIndex((i) => i.id === income.id)
    incomes.value.splice(incomeIndex, 1)
  }

  const addExpense = (expense: IExpense) => {
    expenses.value.push(expense)
  }

  const updateExpense = (updatedExpense: IExpense) => {
    const index = expenses.value.findIndex(e => e.id === updatedExpense.id)
    if (index !== -1) {
      expenses.value[index] = updatedExpense
    }
  }

  const removeExpense = (expense: IExpense) => {
    const expenseIndex = expenses.value.findIndex((i) => i.id === expense.id)
    expenses.value.splice(expenseIndex, 1)
  }

  const addDebt = (debt: IDebt) => {
    debts.value.push(debt)
  }

  const updateDebt = (updatedDebt: IDebt) => {
    const index = debts.value.findIndex((d) => d.id === updatedDebt.id)
    if (index !== -1) {
      debts.value[index] = updatedDebt
    }
  }

  const removeDebt = (debt: IDebt) => {
    const debtIndex = debts.value.findIndex((i) => i.id === debt.id)
    debts.value.splice(debtIndex, 1)
  }


  const addFutureExpense = (futureExpense: IFutureExpense) => {
    futureExpenses.value.push(futureExpense)
  }

  const updateFutureExpense = (updatedFutureExpense: IFutureExpense) => {
    const index = futureExpenses.value.findIndex((e) => e.id === updatedFutureExpense.id)
    if (index !== -1) {
      futureExpenses.value[index] = updatedFutureExpense
    }
  }

  const removeFutureExpense = (futureExpense: IFutureExpense) => {
    const expenseIndex = futureExpenses.value.findIndex((e) => e.id === futureExpense.id)
    futureExpenses.value.splice(expenseIndex, 1)
  }

  const setFutureExpenses = (newFutureExpenses: IFutureExpense[]) => {
    futureExpenses.value = newFutureExpenses
  }

  const setUser = (user: IUserInfo) => {
    userInfo.value = user
  }

  return {
    isDarkMode,
    setDarkMode,
    incomeTypes,
    months,
    years,
    incomes,
    addIncome,
    updateIncome,
    removeIncome,
    expenseTypes,
    amountTypes,
    expenses,
    addExpense,
    updateExpense,
    removeExpense,
    debtTypes,
    debts,
    addDebt,
    updateDebt,
    removeDebt,
    futureExpenses,
    addFutureExpense,
    updateFutureExpense,
    removeFutureExpense,
    setFutureExpenses,
    userInfo,
    setUser
  }
})
