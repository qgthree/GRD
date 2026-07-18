import { ref } from 'vue'
import { getMapData } from '@/features/map/api/mapDataSource'
import type { MapData } from '@/features/map/api/mapDataSource'

// Owns the loading lifecycle for map data so components do not care whether
// data comes from local files today or a backend request later.
export const useMapData = () => {
  const data = ref<MapData | null>(null)
  const error = ref<unknown>(null)
  const isLoading = ref(false)

  const loadMapData = async () => {
    // Reset request state each time this loader runs.
    isLoading.value = true
    error.value = null

    try {
      data.value = await getMapData()
    }
    catch (caughtError) {
      error.value = caughtError
    }
    finally {
      isLoading.value = false
    }
  }

  return {
    data,
    error,
    isLoading,
    loadMapData
  }
}
