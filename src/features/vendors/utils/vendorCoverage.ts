import type { Country } from '@/features/locations/types'
import type { Vendor } from '@/features/vendors/types'

// Service filtering uses a loose substring match because the URL value may come
// from human-readable labels rather than exact stored service names.
export const vendorProvidesService = (vendor: Vendor, service: string) => {
  return vendor.subsectors.join(',').toLowerCase().includes(service.toLowerCase())
}

// A vendor can serve a country directly, globally, or indirectly through an
// entire region when no country-specific list is present.
export const vendorServesCountry = (vendor: Vendor, country: Country) => {
  return (
    vendor.country_location.includes(country.ISO3) ||
    vendor.region.includes('Global') ||
    (vendor.country_location.length === 0 && vendor.region.includes(country.region))
  )
}

// Region matching intentionally accepts vendors that name the region directly or
// name any country inside that region.
export const vendorServesRegion = (vendor: Vendor, region: string, countries: Country[]) => {
  return (
    vendor.region.includes('Global') ||
    vendor.region.includes(region) ||
    countries.some((country) => vendor.country_location.includes(country.ISO3))
  )
}
