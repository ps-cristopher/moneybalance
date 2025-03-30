import { MONTH_LABEL, STATIC_PAYMENT_TYPE_VALUE, SUSCRIPTION_PAYMENT_TYPE_VALUE } from "@/constants"
import type { ICustomDate, ICustomDateRange, IDebt, IExpense, IIncome, IYear } from "@/types"

export const formatCurrency = (value: number) => {
  return value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })
}

export const formatCustomDate = (date?: ICustomDate) => {
  if (!date) {
    return '-'
  }

  return `${MONTH_LABEL[date.month]} - ${date.year}`
}

export const getYearsForSelect = (startYear: number, endYear: number): IYear[] => {
  if (startYear > endYear) {
    throw new Error('Invalid years range')
  }

  return Array(endYear - startYear).fill(0).map((_, i) => ({ value: i + startYear, label: `${i + startYear}` }))
}

export const periodIncludesCustomDate = (
  {
    startedAt,
    endedAt,
  }: ICustomDateRange,
  date: ICustomDate
) => {
  const startedYear = startedAt?.year ?? 0
  const startedMonth = startedAt?.month ?? 0
  const endedYear = endedAt?.year ?? 0
  const endedMonth = endedAt?.month ?? 0

  return (startedYear < date.year || (startedYear === date.year && startedMonth <= date.month)) &&
  (endedYear > date.year || (endedYear === date.year && endedMonth >= date.month))
}

export const isSameDate = (itemDate: ICustomDate | undefined, dateToCompare: ICustomDate) => {
  if (!itemDate) {
    return false
  }

  return itemDate.month === dateToCompare?.month && itemDate?.year === dateToCompare?.year
}

export const isStatictExpenseOrSuscription = (expense: IExpense) => {
  return expense.type.value === STATIC_PAYMENT_TYPE_VALUE || expense.type.value === SUSCRIPTION_PAYMENT_TYPE_VALUE
}

export const getRemainingPayments = (debt: IDebt, date: ICustomDate) => {
  const isPeriodIncludingCustomDate = periodIncludesCustomDate({
    startedAt: debt.startedAt,
    endedAt: debt.endedAt,
  }, date)

  if (isPeriodIncludingCustomDate) {
    const monthsToPay = (debt.endedAt?.year - date.year) * 12 + debt.endedAt?.month - date.month
    return monthsToPay
  }

  return 0
}

export const getRemainingAmountToPay = (debt: IDebt, date: ICustomDate) => {
  return debt.amount * getRemainingPayments(debt, date)
}
