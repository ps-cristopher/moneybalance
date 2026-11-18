import type { IDebt, IExpense, IFutureExpense, IIncome, IUserInfo } from '@/types'

export const EXPORT_APP_ID = 'balancash'
export const EXPORT_FORMAT_VERSION = 1

export interface IExportData {
  incomes: IIncome[];
  expenses: IExpense[];
  debts: IDebt[];
  futureExpenses: IFutureExpense[];
  paidItems: Record<string, boolean>;
  userInfo: IUserInfo;
  isDarkMode: boolean;
}

export interface IExportFile {
  app: typeof EXPORT_APP_ID;
  version: number;
  exportedAt: string;
  data: IExportData;
}

export interface IMergeCount {
  created: number;
  updated: number;
  unchanged: number;
}

export interface IMergeResult<T> extends IMergeCount {
  items: T[];
}

export class ImportError extends Error {}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const hasStringId = (value: unknown): value is { id: string } =>
  isObject(value) && typeof value.id === 'string' && value.id.length > 0

const readItemList = <T>(data: Record<string, unknown>, key: string, label: string): T[] => {
  const value = data[key]
  if (value === undefined) return []
  if (!Array.isArray(value)) {
    throw new ImportError(`La sección "${label}" no tiene un formato válido.`)
  }
  value.forEach((item) => {
    if (!hasStringId(item)) {
      throw new ImportError(`Hay elementos sin identificador en la sección "${label}".`)
    }
  })
  return value as T[]
}

export const buildExportFile = (data: IExportData): IExportFile => ({
  app: EXPORT_APP_ID,
  version: EXPORT_FORMAT_VERSION,
  exportedAt: new Date().toISOString(),
  data: JSON.parse(JSON.stringify(data)),
})

/**
 * Validates the raw content of an export file. Sections missing from the file
 * are returned empty / undefined so they leave local data untouched.
 */
export const parseExportFile = (raw: string): Partial<IExportData> => {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new ImportError('El archivo no es un JSON válido.')
  }

  if (!isObject(parsed) || parsed.app !== EXPORT_APP_ID || !isObject(parsed.data)) {
    throw new ImportError('El archivo no es un respaldo de Balancash.')
  }
  if (typeof parsed.version !== 'number' || parsed.version > EXPORT_FORMAT_VERSION) {
    throw new ImportError('El respaldo fue creado con una versión más reciente de la app.')
  }

  const data = parsed.data
  const futureExpenses = readItemList<IFutureExpense>(data, 'futureExpenses', 'Gastos futuros')
  futureExpenses.forEach((futureExpense) => {
    const subExpenses: unknown = futureExpense.subExpenses
    if (subExpenses !== undefined && (!Array.isArray(subExpenses) || !subExpenses.every(hasStringId))) {
      throw new ImportError(`El gasto futuro "${futureExpense.name}" tiene sub-gastos inválidos.`)
    }
  })

  const result: Partial<IExportData> = {
    incomes: readItemList<IIncome>(data, 'incomes', 'Ingresos'),
    expenses: readItemList<IExpense>(data, 'expenses', 'Gastos'),
    debts: readItemList<IDebt>(data, 'debts', 'Deudas'),
    futureExpenses,
  }

  if (isObject(data.paidItems)) {
    result.paidItems = Object.fromEntries(
      Object.entries(data.paidItems).filter(([, value]) => typeof value === 'boolean'),
    ) as Record<string, boolean>
  }
  if (isObject(data.userInfo) && typeof data.userInfo.name === 'string' && data.userInfo.name.trim()) {
    result.userInfo = { name: data.userInfo.name }
  }
  if (typeof data.isDarkMode === 'boolean') {
    result.isDarkMode = data.isDarkMode
  }

  return result
}

/**
 * Merges `incoming` into `current` by id: items with a matching id are updated,
 * the rest are appended. Items that only exist in `current` are kept.
 */
export const mergeById = <T extends { id: string }>(
  current: T[],
  incoming: T[],
  mergeItem: (currentItem: T, incomingItem: T) => T = (_, incomingItem) => incomingItem,
): IMergeResult<T> => {
  const items = [...current]
  const indexById = new Map(items.map((item, index) => [item.id, index]))
  const result = { created: 0, updated: 0, unchanged: 0 }

  incoming.forEach((incomingItem) => {
    const index = indexById.get(incomingItem.id)
    if (index === undefined) {
      indexById.set(incomingItem.id, items.length)
      items.push(incomingItem)
      result.created++
      return
    }
    const merged = mergeItem(items[index], incomingItem)
    if (JSON.stringify(merged) === JSON.stringify(items[index])) {
      result.unchanged++
    } else {
      items[index] = merged
      result.updated++
    }
  })

  return { items, ...result }
}

export const mergeFutureExpense = (current: IFutureExpense, incoming: IFutureExpense): IFutureExpense => ({
  ...incoming,
  subExpenses: mergeById(current.subExpenses ?? [], incoming.subExpenses ?? []).items,
})
