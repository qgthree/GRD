import type { LocationQuery, LocationQueryValue } from 'vue-router'

export type QueryValue = LocationQueryValue | LocationQueryValue[] | null | undefined

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
