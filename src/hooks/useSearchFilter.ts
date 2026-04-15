import { ref, computed, watch, type Ref } from 'vue'

const DEFAULT_DEBOUNCE_TIME = 300

export default function useSearchFilter<T>(
  items: Ref<T[]>,
  debounceTime = DEFAULT_DEBOUNCE_TIME,
) {
  const searchText = ref('')
  const debouncedSearchText = ref('')

  let debounceTimeout: ReturnType<typeof setTimeout> | null = null

  watch(searchText, (value) => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout)
    }

    debounceTimeout = setTimeout(() => {
      debouncedSearchText.value = value
    }, debounceTime)
  })

  const filteredItems = computed(() => {
    if (!debouncedSearchText.value) {
      return items.value
    }

    const term = debouncedSearchText.value.toLowerCase()
    return items.value.filter(item => {
      return JSON.stringify(item).toLowerCase().includes(term)
    })
  })

  return {
    searchText,
    filteredItems,
  }
}
