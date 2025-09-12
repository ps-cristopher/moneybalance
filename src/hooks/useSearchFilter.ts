import { ref, computed, type Ref } from 'vue'

export default function useSearchFilter<T>(items: Ref<T[]>) {
  const searchText = ref('')

  const filteredItems = computed(() => {
    if (!searchText.value) {
      return items.value
    }

    const term = searchText.value.toLowerCase()
    return items.value.filter(item => {
      return JSON.stringify(item).toLowerCase().includes(term)
    })
  })

  return {
    searchText,
    filteredItems,
  }
}
