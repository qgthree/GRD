import L from 'leaflet'
import type { BoundaryStyleSetting, CountryFeature, LeafSettings } from '@/features/map/types'

export const heatmapBoundaryColor = '#651D32'

// Leaflet expects a tuple-like LatLngExpression, while the settings store keeps
// centers as simple number arrays for easy data entry.
export const asMapCenter = (center: number[]) => center as L.LatLngExpression

export const findBoundaryStyle = (styles: BoundaryStyleSetting[], name: string) => {
  const storedStyle = styles.find((style) => style.name === name)

  if (storedStyle) return storedStyle

  return {
    name,
    color: heatmapBoundaryColor,
    center: [39, -98],
    zoom: 4
  }
}

// Home and multi-region selections use the broad default view.
export const setDefaultViewport = (map: L.Map, settings: LeafSettings) => {
  map.setView(asMapCenter(settings.mapCenter), settings.mapZoom)
}

// Unknown boundary styles fall back to the default view instead of crashing the map.
export const setBoundaryViewport = (
  map: L.Map,
  boundaryStyle: BoundaryStyleSetting | undefined,
  settings: LeafSettings
) => {
  if (!boundaryStyle) {
    setDefaultViewport(map, settings)
    return
  }

  map.setView(asMapCenter(boundaryStyle.center), boundaryStyle.zoom)
}

// Single-feature selections zoom to the selected layer bounds with a small
// padding point, then center on the feature's stored centroid.
export const setFeatureViewport = (map: L.Map, feature: CountryFeature | undefined, layer: L.GeoJSON) => {
  if (!feature) return

  const zoom = map.getBoundsZoom(layer.getBounds(), false, L.point(200, 200))
  map.setView([feature.properties.LAT_CENT, feature.properties.LONG_CENT], zoom)
}
