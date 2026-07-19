import type { LocationQuery } from 'vue-router'
import type { BoundarySelection } from '@/features/map/types'

interface BoundaryQueryKeys {
  stateKey: string
  districtKey: string
}

export const mapBoundaryQueryKeys = {
  stateKey: 'state',
  districtKey: 'district'
}

// Vue Router query values can be strings, arrays, nulls, or undefined.
// The map only needs a clean list of selected ids/names.
const queryList = (value: LocationQuery[string]) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean) as string[]
  }

  return value ? value.split(',').filter(Boolean) : []
}

export const getBoundarySelection = (
  query: LocationQuery,
  keys: BoundaryQueryKeys
): BoundarySelection => {
  const stateIds = queryList(query[keys.stateKey])
  const districtIds = queryList(query[keys.districtKey])

  if (stateIds.length > 1) {
    return { type: 'state-list', ids: stateIds }
  }

  if (stateIds.length === 1) {
    return { type: 'state', id: stateIds[0] }
  }

  if (districtIds.length > 1) {
    return { type: 'district-list', ids: districtIds }
  }

  if (districtIds.length === 1) {
    return { type: 'district', id: districtIds[0] }
  }

  return { type: 'none' }
}
