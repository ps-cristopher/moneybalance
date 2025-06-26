import type { IAmountType, IDebtType, IExpenseType, IIncomeType, IMonth }  from '@/types';
import { Month } from '@/types';

export const MONTHS: IMonth[] = [
  { value: 1, label: 'Enero' },
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' },
]

export const MONTH_LABEL: Record<Month, string> = {
  [Month.JANUARY]: MONTHS[0].label,
  [Month.FEBRUARY]: MONTHS[1].label,
  [Month.MARCH]: MONTHS[2].label,
  [Month.APRIL]: MONTHS[3].label,
  [Month.MAY]: MONTHS[4].label,
  [Month.JUNE]: MONTHS[5].label,
  [Month.JULY]: MONTHS[6].label,
  [Month.AUGUST]: MONTHS[7].label,
  [Month.SEPTEMBER]: MONTHS[8].label,
  [Month.OCTOBER]: MONTHS[9].label,
  [Month.NOVEMBER]: MONTHS[10].label,
  [Month.DECEMBER]: MONTHS[11].label,
}

export const EXTRA_INCOME_TYPE_VALUE = 2;

export const STATIC_PAYMENT_TYPE_VALUE = 1;

export const UNIC_PAYMENT_TYPE_VALUE = 2;

export const SUSCRIPTION_PAYMENT_TYPE_VALUE = 3;

export const INCOME_TYPES: IIncomeType[] = [
  { value: STATIC_PAYMENT_TYPE_VALUE, label: 'Salario' },
  { value: EXTRA_INCOME_TYPE_VALUE, label: 'Extra' },
]

export const EXPENSE_TYPES: IExpenseType[] = [
  { value: STATIC_PAYMENT_TYPE_VALUE, label: 'Fijo' },
  { value: SUSCRIPTION_PAYMENT_TYPE_VALUE, label: 'Suscripción' },
  { value: UNIC_PAYMENT_TYPE_VALUE, label: 'Pago unico' },
  { value: 4, label: 'Retiro de efectivo' },
]

export const AMOUNT_TYPES: IAmountType[] = [
  { value: 1, label: 'Fija' },
  { value: 2, label: 'Variable' },
]

export const DEBT_TYPES: IDebtType[] = [
  { value: 1, label: 'TDC' },
  { value: 2, label: 'Prestamo' },
  { value: 3, label: 'Otro' },
]

export const PAGINATION_ROWS_PER_PAGE = 15

export const PAGINATION_OPTIONS = [5, 15, 30, 50]

export const INCOMES_LOCAL_STORAGE_KEY = 'incomes'

export const EXPENSES_LOCAL_STORAGE_KEY = 'expenses'

export const DEBTS_LOCAL_STORAGE_KEY = 'debts'

export const DARK_MODE_STORAGE_KEY = 'dark-mode'

export const DEBTS_LABEL = 'Deudas'

export const USER_INFO_STORAGE_KEY = 'user-info'

export const SUMMARY_TOUR_STORAGE_KEY = 'summary-tour-seen'
