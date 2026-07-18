import type { LocationQuery } from 'vue-router'
import type { MapSelection } from '@/features/map/types'

// Vue Router query values can be strings, arrays, nulls, or undefined.
// The map only needs a clean list of selected ids/names.
const queryList = (value: LocationQuery[string]) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean) as string[]
  }

  return value ? value.split(',').filter(Boolean) : []
}

// The URL decides what geographic selection the map should render.
// Region selections take priority over country selections if both are present.
export const getMapSelection = (query: LocationQuery): MapSelection => {
  const regionNames = queryList(query.region)
  const countryCodes = queryList(query.country)

  if (regionNames.length > 1) {
    return { type: 'regions', regionNames }
  }

  if (regionNames.length === 1) {
    return { type: 'region', regionName: regionNames[0] }
  }

  if (countryCodes.length > 1) {
    return { type: 'countries', countryCodes }
  }

  if (countryCodes.length === 1) {
    return { type: 'country', countryCode: countryCodes[0] }
  }

  return { type: 'home' }
}
