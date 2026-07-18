import { ref } from 'vue'
import {
  getChildBoundariesForCountries,
  getChildBoundariesForRegions,
  getParentBoundaries
} from '@/features/map/api/mapDataSource'
import type { CountryFeature, MapFeatureCollection, RegionFeature } from '@/features/map/types'

// Owns the loading lifecycle for map data so components do not care whether
// data comes from local public files today or backend requests later.
export const useMapData = () => {
  const parentBoundaries = ref<MapFeatureCollection<RegionFeature> | null>(null)
  const error = ref<unknown>(null)
  const isLoading = ref(false)

  const load = async <TResult>(loader: () => Promise<TResult>) => {
    isLoading.value = true
    error.value = null

    try {
      return await loader()
    }
    catch (caughtError) {
      error.value = caughtError
      throw caughtError
    }
    finally {
      isLoading.value = false
    }
  }

  const loadParentBoundaries = async () => {
    parentBoundaries.value = await load(getParentBoundaries)
  }

  const loadChildBoundariesForRegions = async (regions: string[]) => {
    return load(() => getChildBoundariesForRegions(regions))
  }

  const loadChildBoundariesForCountries = async (countryCodes: string[]) => {
    return load<MapFeatureCollection<CountryFeature>>(() => getChildBoundariesForCountries(countryCodes))
  }

  return {
    parentBoundaries,
    error,
    isLoading,
    loadParentBoundaries,
    loadChildBoundariesForRegions,
    loadChildBoundariesForCountries
  }
}
