import { countries as localCountries } from '@/data/countries'
import type { Country } from '@/features/locations/types'

// This is the future swap point for country metadata from an external API.
export const getCountries = async (): Promise<Country[]> => {
  return localCountries.map((country) => ({ ...country }))
}
