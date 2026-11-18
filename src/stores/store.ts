import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import { getYearsForSelect } from '@/utils'
import {
  INCOME_TYPES,
  MONTHS,
  DARK_MODE_STORAGE_KEY,
  INCOMES_LOCAL_STORAGE_KEY,
  EXPENSE_TYPES, AMOUNT_TYPES,
  EXPENSES_LOCAL_STORAGE_KEY,
  DEBT_TYPES,
  DEBTS_LOCAL_STORAGE_KEY,
  USER_INFO_STORAGE_KEY,
  FUTURE_EXPENSES_LOCAL_STORAGE_KEY,
  PAID_ITEMS_STORAGE_KEY
} from '@/constants'
import { buildExportFile, mergeById, mergeFutureExpense } from '@/dataTransfer'
import type { IExportData, IExportFile, IMergeCount } from '@/dataTransfer'
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
  IUserInfo,
  IYear
} from '@/types'

const START_YEAR = 2024
const END_YEAR = 2034

export const useStore = defineStore('store', () => {
  const isDarkMode = useStorage<boolean>(DARK_MODE_STORAGE_KEY, false)
  const userInfo = useStorage<IUserInfo>(USER_INFO_STORAGE_KEY, {
    name: null, 
  })
  const incomeTypes = ref<IIncomeType[]>(INCOME_TYPES)
  const expenseTypes = ref<IExpenseType[]>(EXPENSE_TYPES)
  const amountTypes = ref<IAmountType[]>(AMOUNT_TYPES)
  const debtTypes = ref<IDebtType[]>(DEBT_TYPES)
  const months = ref<IMonth[]>(MONTHS)
  const years = ref<IYear[]>(getYearsForSelect(START_YEAR, END_YEAR))
  const incomes = useStorage<IIncome[]>(INCOMES_LOCAL_STORAGE_KEY, [])
  const expenses = useStorage<IExpense[]>(EXPENSES_LOCAL_STORAGE_KEY, [])
  const debts = useStorage<IDebt[]>(DEBTS_LOCAL_STORAGE_KEY, [])
  const futureExpenses = useStorage<IFutureExpense[]>(FUTURE_EXPENSES_LOCAL_STORAGE_KEY, [])
  const paidItems = useStorage<Record<string, boolean>>(PAID_ITEMS_STORAGE_KEY, {})

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

  const exportData = (): IExportFile => buildExportFile({
    incomes: incomes.value,
    expenses: expenses.value,
    debts: debts.value,
    futureExpenses: futureExpenses.value,
    paidItems: paidItems.value,
    userInfo: userInfo.value,
    isDarkMode: isDarkMode.value,
  })

  const importData = (data: Partial<IExportData>): IMergeCount => {
    const total: IMergeCount = { created: 0, updated: 0, unchanged: 0 }
    // Arrays are updated in place because views keep references to them.
    const mergeInto = <T extends { id: string }>(
      list: T[],
      incoming: T[] | undefined,
      mergeItem?: (currentItem: T, incomingItem: T) => T,
    ) => {
      const { items, ...count } = mergeById(list, incoming ?? [], mergeItem)
      list.splice(0, list.length, ...items)
      total.created += count.created
      total.updated += count.updated
      total.unchanged += count.unchanged
    }

    mergeInto(incomes.value, data.incomes)
    mergeInto(expenses.value, data.expenses)
    mergeInto(debts.value, data.debts)
    mergeInto(futureExpenses.value, data.futureExpenses, mergeFutureExpense)
    if (data.paidItems) {
      paidItems.value = { ...paidItems.value, ...data.paidItems }
    }
    if (data.userInfo) {
      userInfo.value = data.userInfo
    }
    if (data.isDarkMode !== undefined) {
      isDarkMode.value = data.isDarkMode
    }

    return total
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
    paidItems,
    userInfo,
    setUser,
    exportData,
    importData
  }
})
