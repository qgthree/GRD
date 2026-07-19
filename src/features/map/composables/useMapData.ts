import { ref } from 'vue'
import {
  getDistrictBoundariesForGeoids,
  getDistrictBoundariesForStates,
  getStateBoundaries
} from '@/features/map/api/mapDataSource'
import type { DistrictFeature, MapFeatureCollection, StateFeature } from '@/features/map/types'

// Owns the loading lifecycle for map data so components do not care whether
// data comes from local public files today or backend requests later.
export const useMapData = () => {
  const stateBoundaries = ref<MapFeatureCollection<StateFeature> | null>(null)
  const error = ref<unknown>(null)
  const isLoading = ref(false)

  // Wrap every map-data request with one loading/error lifecycle so callers do
  // not duplicate that state management.
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

  // Load and retain state boundaries because they are the base layer for the
  // country view and the lookup source for state-scoped district requests.
  const loadStateBoundaries = async () => {
    stateBoundaries.value = await load(getStateBoundaries)
  }

  // Fetch all congressional district boundaries inside the provided state names.
  const loadDistrictBoundariesForStates = async (states: string[]) => {
    return load(() => getDistrictBoundariesForStates(states))
  }

  // Fetch only the congressional district boundaries identified by GEOID.
  const loadDistrictBoundariesForGeoids = async (geoids: string[]) => {
    return load<MapFeatureCollection<DistrictFeature>>(() => getDistrictBoundariesForGeoids(geoids))
  }

  return {
    stateBoundaries,
    error,
    isLoading,
    loadStateBoundaries,
    loadDistrictBoundariesForStates,
    loadDistrictBoundariesForGeoids
  }
}
