import L from 'leaflet'
import type { BoundaryStyleSetting, LeafSettings, MapFeature } from '@/features/map/types'
import { heatmapBoundaryColor } from '@/features/map/utils/mapViewport'

interface BoundaryLayerOptions<TFeature extends MapFeature<any>> {
  features: TFeature[]
  settings: LeafSettings
  getStyleKey: (feature: TFeature) => string
  getLabel: (feature: TFeature) => string
  getDetail?: (feature: TFeature) => string
  getFillOpacity?: (feature: TFeature) => number
  getBoundaryStyle: (name: string) => BoundaryStyleSetting | undefined
  interactive?: boolean
  onFeatureClick?: (feature: TFeature) => void
}

type BoundaryGeoJsonOptions<TFeature extends MapFeature<any>> = L.GeoJSONOptions<TFeature['properties']> & L.PolylineOptions

const fallbackBoundaryStyle: BoundaryStyleSetting = {
  name: '',
  color: heatmapBoundaryColor,
  center: [25, 10],
  zoom: 1
}

const tooltipText = <TFeature extends MapFeature<any>>(
  feature: TFeature,
  options: Pick<BoundaryLayerOptions<TFeature>, 'getDetail' | 'getLabel'>
) => {
  const detail = options.getDetail?.(feature)

  if (!detail) {
    return `<span class="tip-title">${options.getLabel(feature)}</span>`
  }

  return `<span class="tip-title">${options.getLabel(feature)}</span><br /><span>${detail}</span>`
}

export const createBoundaryLayer = <TFeature extends MapFeature<any>>(
  options: BoundaryLayerOptions<TFeature>
) => {
  const isInteractive = options.interactive ?? true
  // A caller can provide per-feature opacity for special modes like density
  // maps; otherwise every feature uses the standard resting opacity.
  const getRestingFillOpacity = (feature: TFeature) => {
    return options.getFillOpacity?.(feature) ?? options.settings.features.lightOpacity
  }

  const layerOptions: BoundaryGeoJsonOptions<TFeature> = {
    interactive: isInteractive,
    bubblingMouseEvents: false,
    smoothFactor: 0,
    style: (feature) => {
      const typedFeature = feature as TFeature
      const boundaryStyle = options.getBoundaryStyle(options.getStyleKey(typedFeature)) ?? fallbackBoundaryStyle

      return {
        color: boundaryStyle.color,
        weight: options.settings.features.weight,
        opacity: options.settings.features.mediumOpacity,
        fillColor: boundaryStyle.color,
        fillOpacity: getRestingFillOpacity(typedFeature)
      }
    },
    onEachFeature: (feature, layer) => {
      const typedFeature = feature as TFeature

      if (!isInteractive) return

      layer.bindTooltip(tooltipText(typedFeature, options))

      layer.on('click', () => {
        options.onFeatureClick?.(typedFeature)
      })
    }
  }

  return L.geoJSON(options.features, layerOptions)
}
