import { useStore } from "@/stores/store"
import type { ICustomDate, IMonth, IYear, Month } from "@/types"
import { computed, ref } from "vue"

export default function useDateFilters() {
  const {
    months,
    years,
  } = useStore()

  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()
  const selectedMonth = ref<IMonth>({value: currentMonth, label: months[currentMonth - 1].label})
  const selectedYear = ref<IYear>({value: currentYear, label: `${currentYear}`})
  const monthsToRender = months.filter(month => month.value >= currentMonth - 1)
  const yearsToRender = years.filter(year => year.value >= currentYear)

  const selectedDate = computed<ICustomDate>(() => ({ month: selectedMonth.value?.value as Month, year: selectedYear.value?.value }))

  return {
    selectedMonth,
    selectedYear,
    monthsToRender,
    yearsToRender,
    selectedDate,
  }
}