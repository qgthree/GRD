import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { LocationQueryValue } from 'vue-router'
import { useFiltersStore } from '@/stores/filtersStore'

type QueryValue = LocationQueryValue | LocationQueryValue[] | undefined

const queryList = (value: QueryValue) => {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => Boolean(item))
  }

  return value ? value.split(',').filter(Boolean) : []
}

export const useFilterQuery = () => {
  const route = useRoute()
  const router = useRouter()
  const filtersStore = useFiltersStore()

  const selectedValues = (key: string) => computed(() => queryList(route.query[key]))

  const updateQuery = (updates: Record<string, string | undefined>) => {
    if (filtersStore.status !== 'hidden') {
      filtersStore.prepareFilterHistoryEntry(route.fullPath)
    }

    void router.replace({
      query: {
        ...route.query,
        ...updates
      }
    })
  }

  const toggleQueryValue = (key: string, value: string) => {
    const selected = queryList(route.query[key])
    const nextValues = selected.includes(value)
      ? selected.filter((selectedValue) => selectedValue !== value)
      : [...selected, value]

    updateQuery({
      [key]: nextValues.length ? nextValues.join(',') : undefined
    })
  }

  return {
    route,
    selectedValues,
    toggleQueryValue,
    updateQuery
  }
}
