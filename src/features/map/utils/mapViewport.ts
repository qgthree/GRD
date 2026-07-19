import L from 'leaflet'
import type { BoundaryStyleSetting, DistrictFeature, LeafSettings } from '@/features/map/types'

export const heatmapBoundaryColor = '#651D32'
export const alaskaStateName = 'Alaska'

const alaskaViewport = {
  center: [64.2, -152.2],
  zoom: 4
}

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

// Home and multi-state selections use the broad default view.
export const setDefaultViewport = (map: L.Map, settings: LeafSettings) => {
  map.setView(asMapCenter(settings.mapCenter), settings.mapZoom)
}

// Alaska crosses the antimeridian, so bounds fitting can pick an awkward world
// view. Use one stable state viewport whenever Alaska is the selected target.
export const setAlaskaViewport = (map: L.Map) => {
  map.setView(asMapCenter(alaskaViewport.center), alaskaViewport.zoom)
}

// Single-feature selections zoom to the selected layer bounds with a small
// padding point, then center on the feature's stored centroid.
export const setFeatureViewport = (map: L.Map, feature: DistrictFeature | undefined, layer: L.GeoJSON) => {
  if (!feature) return

  const zoom = map.getBoundsZoom(layer.getBounds(), false, L.point(200, 200))
  map.setView([feature.properties.latCent, feature.properties.longCent], zoom)
}
