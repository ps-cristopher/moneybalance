import { computed, ref } from 'vue'

export const supportedLocales = ['es', 'en'] as const
export type Locale = typeof supportedLocales[number]

const STORAGE_KEY = 'locale'
const storedLocale = typeof window === 'undefined' ? null : window.localStorage.getItem(STORAGE_KEY)

export const locale = ref<Locale>(storedLocale === 'en' ? 'en' : 'es')

const messages = {
  es: {
    language: 'Idioma', english: 'Inglés', spanish: 'Español',
    summary: 'Resumen', incomes: 'Ingresos', expenses: 'Gastos', debts: 'Deudas', futureExpenses: 'Gastos futuros',
    darkMode: 'Modo oscuro', welcome: '¡Bienvenido!', accept: 'Aceptar',
    welcomeDescription: 'Balancash es tu asistente para controlar tus finanzas. Registra ingresos, gastos y deudas de forma sencilla, organízalos por categorías y revisa gráficas que muestran la evolución de tu dinero. Con un balance siempre actualizado, podrás tomar mejores decisiones y alcanzar tus metas financieras.',
    privacyDescription: 'Tus datos están seguros y solo tú puedes verlos. Balancash guarda toda la información directamente en tu dispositivo. No necesitas crear una cuenta ni compartir datos personales. Solo recuerda usar siempre el mismo navegador y dispositivo para acceder a tu información.',
    getStarted: 'Para empezar a usar la app ingresa tu nombre', chooseLanguage: 'Elige tu idioma',
    createdBy: 'Creado por', month: 'Mes', year: 'Año', search: 'Buscar',
    months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    incomeTypes: ['Salario', 'Extra'], expenseTypes: ['Fijo', 'Suscripción', 'Pago único', 'Retiro de efectivo'], amountTypes: ['Fija', 'Variable'], debtTypes: ['TDC', 'Préstamo', 'Otro'],
  },
  en: {
    language: 'Language', english: 'English', spanish: 'Spanish',
    summary: 'Summary', incomes: 'Income', expenses: 'Expenses', debts: 'Debts', futureExpenses: 'Future expenses',
    darkMode: 'Dark mode', welcome: 'Welcome!', accept: 'Continue',
    welcomeDescription: 'Balancash is your assistant for managing your finances. Easily track income, expenses, and debts, organize them by category, and review charts that show how your money changes over time. With an up-to-date balance, you can make better decisions and reach your financial goals.',
    privacyDescription: 'Your data is secure and only you can see it. Balancash stores all information directly on your device. You do not need to create an account or share personal data. Just remember to use the same browser and device to access your information.',
    getStarted: 'To get started, enter your name', chooseLanguage: 'Choose your language',
    createdBy: 'Created by', month: 'Month', year: 'Year', search: 'Search',
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    incomeTypes: ['Salary', 'Extra'], expenseTypes: ['Fixed', 'Subscription', 'One-time payment', 'Cash withdrawal'], amountTypes: ['Fixed', 'Variable'], debtTypes: ['Credit card', 'Loan', 'Other'],
  },
} as const

type MessageKey = Exclude<keyof typeof messages.es, 'months' | 'incomeTypes' | 'expenseTypes' | 'amountTypes' | 'debtTypes'>

export const t = (key: MessageKey) => messages[locale.value][key]

export const useI18n = () => ({
  locale,
  t,
  messages: computed(() => messages[locale.value]),
  setLocale: (newLocale: Locale) => {
    locale.value = newLocale
    window.localStorage.setItem(STORAGE_KEY, newLocale)
    document.documentElement.lang = newLocale
  },
})

export const getLocaleMessages = () => messages[locale.value]

if (typeof document !== 'undefined') {
  document.documentElement.lang = locale.value
}
