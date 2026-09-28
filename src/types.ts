export enum Month {
  JANUARY = 1,
  FEBRUARY = 2,
  MARCH = 3,
  APRIL = 4,
  MAY = 5,
  JUNE = 6,
  JULY = 7,
  AUGUST = 8,
  SEPTEMBER = 9,
  OCTOBER = 10,
  NOVEMBER = 11,
  DECEMBER = 12,
}

export enum ItemType {
  EXPENSE = 'expense',
  DEBT = 'debt',
}

export enum ViewDefaultActions {
  OPEN_MODAL = 'openModal',
}

export interface IListOption {
  value: number;
  label: string;
}

export type IIncomeType = IListOption

export type IExpenseType = IListOption

export type IAmountType = IListOption

export type IDebtType = IListOption

export type IMonth = IListOption

export type IYear = IListOption

export interface ICustomDate {
  year: number;
  month: Month;
}

export interface ICustomDateRange {
  startedAt?: ICustomDate,
  endedAt?: ICustomDate,
}

export interface IIncome {
  id: string;
  type: IIncomeType;
  name: string;
  amount: number;
  startedAt?: ICustomDate;
  endedAt?: ICustomDate;
}

export interface IExpense {
  id: string;
  name: string;
  amount: number;
  type: IExpenseType;
  amountType: IAmountType;
  date?: ICustomDate;
}

export interface IFutureSubExpense {
  id: string;
  name: string;
  amount: number;
}

export interface IFutureExpense {
  id: string;
  name: string;
  priority: number;
  subExpenses: IFutureSubExpense[];
}

export interface IDebt {
  id: string;
  name: string;
  amount: number;
  type: IDebtType;
  startedAt: ICustomDate;
  endedAt: ICustomDate;
}

export interface IUserInfo {
  name: string | null;
}

export interface INextMonth extends ICustomDate{
  month: Month;
  year: number;
  label: string;
}
