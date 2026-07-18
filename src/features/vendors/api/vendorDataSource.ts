import { vendors as localVendors } from '@/features/vendors/data/vendors'
import type { Vendor } from '@/features/vendors/types'

// This is the future swap point for vendor data from an external API.
export const getVendors = async (): Promise<Vendor[]> => {
  return localVendors.map((vendor) => ({
    ...vendor,
    region: [...vendor.region],
    subsectors: [...vendor.subsectors],
    country_location: [...vendor.country_location]
  }))
}
