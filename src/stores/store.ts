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
  USER_INFO_STORAGE_KEY
} from '@/constants'
import type {
  IAmountType,
  IDebt,
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

  const setDarkMode = (value: boolean) => {
    isDarkMode.value = value
  }

  const addIncome = (income: IIncome) => {
    incomes.value.push(income)
  }

  const removeIncome = (income: IIncome) => {
    const incomeIndex = incomes.value.findIndex((i) => i.id === income.id)
    incomes.value.splice(incomeIndex, 1)
  }

  const addExpense = (expense: IExpense) => {
    expenses.value.push(expense)
  }

  const removeExpense = (expense: IExpense) => {
    const expenseIndex = expenses.value.findIndex((i) => i.id === expense.id)
    expenses.value.splice(expenseIndex, 1)
  }

  const addDebt = (debt: IDebt) => {
    debts.value.push(debt)
  }

  const removeDebt = (debt: IDebt) => {
    const debtIndex = debts.value.findIndex((i) => i.id === debt.id)
    debts.value.splice(debtIndex, 1)
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
    removeIncome,
    expenseTypes,
    amountTypes,
    expenses,
    addExpense,
    removeExpense,
    debtTypes,
    debts,
    addDebt,
    removeDebt,
    userInfo,
    setUser
  }
})
