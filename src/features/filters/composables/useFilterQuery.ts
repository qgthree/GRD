import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFiltersStore } from '@/stores/filtersStore'
import {
  compactFilterQueryUpdates,
  queryValueFromList,
  selectedFilterQueryValues,
  type FilterQueryKey
} from '@/utils/query'

export const useFilterQuery = () => {
  const route = useRoute()
  const router = useRouter()
  const filtersStore = useFiltersStore()

  const selectedValues = (key: FilterQueryKey) => computed(() => selectedFilterQueryValues(route.query, key))

  const updateQuery = (updates: Partial<Record<FilterQueryKey, string | undefined>>) => {
    if (filtersStore.status !== 'hidden') {
      filtersStore.prepareFilterHistoryEntry(route.fullPath)
    }

    void router.replace({
      query: {
        ...route.query,
        ...compactFilterQueryUpdates(updates)
      }
    })
  }

  const toggleQueryValue = (key: FilterQueryKey, value: string) => {
    const selected = selectedFilterQueryValues(route.query, key)
    const nextValues = selected.includes(value)
      ? selected.filter((selectedValue) => selectedValue !== value)
      : [...selected, value]

    updateQuery({
      [key]: queryValueFromList(nextValues)
    })
  }

  return {
    route,
    selectedValues,
    toggleQueryValue,
    updateQuery
  }
}
