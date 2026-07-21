import { vendors as localVendors } from '@/features/vendors/data/vendors'
import type { Vendor } from '@/features/vendors/types'

// This is the future swap point for vendor data from an external API.
export const getVendors = async (): Promise<Vendor[]> => {
  return localVendors.map((vendor) => ({
    ...vendor,
    state: [...vendor.state],
    subsectors: [...vendor.subsectors],
    district_location: [...vendor.district_location]
  }))
}
