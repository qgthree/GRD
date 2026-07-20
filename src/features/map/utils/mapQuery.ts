import type { LocationQuery } from 'vue-router'
import type { BoundarySelection } from '@/features/map/types'
import type { District, State } from '@/features/locations/types'
import {
  selectedDistrictGeoidsFromQuery,
  selectedStateNamesFromQuery
} from '@/features/locations/utils/locationQuery'

export const getBoundarySelection = (
  query: LocationQuery,
  locations: { states: State[]; districts: District[] }
): BoundarySelection => {
  const stateIds = selectedStateNamesFromQuery(query, locations.states)
  const districtIds = selectedDistrictGeoidsFromQuery(query, locations.districts)

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
