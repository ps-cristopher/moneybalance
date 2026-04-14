import { createRouter, createWebHistory } from 'vue-router'
import SummaryView from '@/views/SummaryView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'summary',
      component: SummaryView,
    },
    {
      path: '/incomes',
      name: 'incomes',
      component: () => import('@/views/IncomesView.vue'),
    },
    {
      path: '/expenses',
      name: 'expenses',
      component: () => import('@/views/ExpensesView.vue'),
    },
    {
      path: '/debts',
      name: 'debts',
      component: () => import('@/views/DebtsView.vue'),
    },
  ],
})

export default router
