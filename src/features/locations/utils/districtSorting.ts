import type { District } from '@/features/locations/types'

type DistrictSortFields = Pick<District, 'districtCode' | 'geoid' | 'name' | 'state'>

const districtNumber = (districtCode: string) => {
  const parsedDistrictCode = Number(districtCode)

  return Number.isFinite(parsedDistrictCode) ? parsedDistrictCode : Number.POSITIVE_INFINITY
}

// Sort districts the way users read them: state first, then at-large/1/2/3...
// Numeric comparison avoids display bugs such as District 10 appearing before 2.
export const compareDistricts = (
  firstDistrict: DistrictSortFields,
  secondDistrict: DistrictSortFields
) => {
  const stateOrder = firstDistrict.state.localeCompare(secondDistrict.state)
  if (stateOrder) return stateOrder

  const districtOrder = districtNumber(firstDistrict.districtCode) - districtNumber(secondDistrict.districtCode)
  if (districtOrder) return districtOrder

  return firstDistrict.name.localeCompare(secondDistrict.name) || firstDistrict.geoid.localeCompare(secondDistrict.geoid)
}

export const sortDistricts = <TDistrict extends DistrictSortFields>(districts: TDistrict[]) => {
  return [...districts].sort(compareDistricts)
}
