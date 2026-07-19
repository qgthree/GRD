import type { LocationQuery } from 'vue-router'
import type { BoundarySelection } from '@/features/map/types'
import { selectedQueryValues } from '@/utils/query'

interface BoundaryQueryKeys {
  stateKey: string
  districtKey: string
}

export const mapBoundaryQueryKeys = {
  stateKey: 'state',
  districtKey: 'district'
}

export const getBoundarySelection = (
  query: LocationQuery,
  keys: BoundaryQueryKeys
): BoundarySelection => {
  const stateIds = selectedQueryValues(query, keys.stateKey)
  const districtIds = selectedQueryValues(query, keys.districtKey)

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
