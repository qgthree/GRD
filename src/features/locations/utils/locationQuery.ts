import type { LocationQuery } from 'vue-router'
import type { District, State } from '@/features/locations/types'
import { selectedFilterQueryValues } from '@/utils/query'

const formatDistrictCode = (districtCode: string) => {
  const parsedDistrictCode = Number(districtCode)

  return parsedDistrictCode > 0 ? String(parsedDistrictCode) : 'AL'
}

export const stateQueryValue = (stateName: string, states: State[]) => {
  return states.find((state) => state.name === stateName)?.abbreviation ?? stateName
}

export const districtQueryValue = (geoid: string, districts: District[]) => {
  const district = districts.find((item) => item.geoid === geoid)

  return district
    ? `${district.stateAbbreviation}-${formatDistrictCode(district.districtCode)}`
    : geoid
}

export const selectedStateNamesFromQuery = (query: LocationQuery, states: State[]) => {
  const statesByAbbreviation = new Map(states.map((state) => [state.abbreviation, state.name]))
  const stateNames = new Set(states.map((state) => state.name))

  return selectedFilterQueryValues(query, 'state').map((value) => {
    return statesByAbbreviation.get(value) ?? (stateNames.has(value) ? value : value)
  })
}

export const selectedDistrictGeoidsFromQuery = (query: LocationQuery, districts: District[]) => {
  const districtsByDisplayCode = new Map(districts.map((district) => [
    `${district.stateAbbreviation}-${formatDistrictCode(district.districtCode)}`,
    district.geoid
  ]))
  const districtGeoids = new Set(districts.map((district) => district.geoid))

  return selectedFilterQueryValues(query, 'district').map((value) => {
    return districtsByDisplayCode.get(value) ?? (districtGeoids.has(value) ? value : value)
  })
}
