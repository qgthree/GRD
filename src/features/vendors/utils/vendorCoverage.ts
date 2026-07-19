import type { District } from '@/features/locations/types'
import type { Vendor } from '@/features/vendors/types'

// Service filtering uses a loose substring match because the URL value may come
// from human-readable labels rather than exact stored service names.
export const vendorProvidesService = (vendor: Vendor, service: string) => {
  return vendor.subsectors.join(',').toLowerCase().includes(service.toLowerCase())
}

// A vendor can serve a district directly, globally, or indirectly through an
// entire state when no district-specific list is present.
export const vendorServesDistrict = (vendor: Vendor, district: District) => {
  return (
    vendor.district_location.includes(district.geoid) ||
    vendor.state.includes('Global') ||
    (vendor.district_location.length === 0 && vendor.state.includes(district.state))
  )
}

// State matching accepts vendors that name the state directly or name any
// district inside that state.
export const vendorServesState = (vendor: Vendor, state: string, districts: District[]) => {
  return (
    vendor.state.includes('Global') ||
    vendor.state.includes(state) ||
    districts.some((district) => vendor.district_location.includes(district.geoid))
  )
}
