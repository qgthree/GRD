import type { LocationQuery, LocationQueryValue } from 'vue-router'

export type QueryValue = LocationQueryValue | LocationQueryValue[] | null | undefined
export type FilterQueryKey = 'state' | 'district' | 'services' | 'servicesExclude'

export const filterQueryKeys: Record<FilterQueryKey, string> = {
  state: 's',
  district: 'd',
  services: 'n',
  servicesExclude: 'nx'
}

const legacyFilterQueryKeys: Record<FilterQueryKey, string> = {
  state: 'state',
  district: 'district',
  services: 'services',
  servicesExclude: 'servicesExclude'
}

export const queryList = (value: QueryValue) => {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => Boolean(item))
  }

  return value ? value.split(',').filter(Boolean) : []
}

export const queryValueFromList = (values: string[]) => {
  return values.length ? values.join(',') : undefined
}

export const selectedQueryValues = (query: LocationQuery, key: string) => {
  return queryList(query[key])
}

export const selectedFilterQueryValues = (query: LocationQuery, key: FilterQueryKey) => {
  return [
    ...new Set([
      ...queryList(query[filterQueryKeys[key]]),
      ...queryList(query[legacyFilterQueryKeys[key]])
    ])
  ]
}

export const hasActiveFilterQuery = (query: LocationQuery) => {
  return (Object.keys(filterQueryKeys) as FilterQueryKey[]).some((key) => {
    return selectedFilterQueryValues(query, key).length > 0
  })
}

export const compactFilterQueryUpdates = (updates: Partial<Record<FilterQueryKey, string | undefined>>) => {
  return (Object.keys(updates) as FilterQueryKey[]).reduce<Record<string, string | undefined>>((queryUpdates, key) => {
    queryUpdates[filterQueryKeys[key]] = updates[key]
    queryUpdates[legacyFilterQueryKeys[key]] = undefined

    return queryUpdates
  }, {})
}
