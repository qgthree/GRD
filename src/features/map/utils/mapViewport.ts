import L from 'leaflet'
import type { CountryFeature, LeafSettings, RegionSetting } from '@/features/map/types'

// Leaflet expects a tuple-like LatLngExpression, while the settings store keeps
// centers as simple number arrays for easy data entry.
export const asMapCenter = (center: number[]) => center as L.LatLngExpression

export const findRegionSetting = (regions: RegionSetting[], name: string) => {
  return regions.find((region) => region.name === name)
}

// Home and multi-region selections use the broad default view.
export const setDefaultViewport = (map: L.Map, settings: LeafSettings) => {
  map.setView(asMapCenter(settings.mapCenter), settings.mapZoom)
}

// Unknown regions fall back to the default view instead of crashing the map.
export const setRegionViewport = (map: L.Map, region: RegionSetting | undefined, settings: LeafSettings) => {
  if (!region) {
    setDefaultViewport(map, settings)
    return
  }

  map.setView(asMapCenter(region.center), region.zoom)
}

// Single-country selections zoom to the selected layer bounds with a small
// padding point, then center on the country's stored centroid.
export const setCountryViewport = (map: L.Map, country: CountryFeature | undefined, layer: L.GeoJSON) => {
  if (!country) return

  const zoom = map.getBoundsZoom(layer.getBounds(), false, L.point(200, 200))
  map.setView([country.properties.LAT_CENT, country.properties.LONG_CENT], zoom)
}
