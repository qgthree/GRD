import regionData from '@/features/map/data/regions.json'
import countryData from '@/features/map/data/admin0.json'
import type {
  CountryFeature,
  MapFeatureCollection,
  RegionFeature
} from '@/features/map/types'

export interface MapData {
  parentBoundaries: MapFeatureCollection<RegionFeature>
  childBoundaries: MapFeatureCollection<CountryFeature>
}

// This is the swap point for a future API/database-backed map data source.
// For now, it keeps the rest of the app from knowing that the data is local JSON.
export const getMapData = async (): Promise<MapData> => {
  return {
    parentBoundaries: regionData as MapFeatureCollection<RegionFeature>,
    childBoundaries: countryData as MapFeatureCollection<CountryFeature>
  }
}
