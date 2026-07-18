import L from 'leaflet'
import type { BoundaryStyleSetting, LeafSettings, MapFeature } from '@/features/map/types'

interface BoundaryLayerOptions<TFeature extends MapFeature<any>> {
  features: TFeature[]
  settings: LeafSettings
  getStyleKey: (feature: TFeature) => string
  getLabel: (feature: TFeature) => string
  getDetail?: (feature: TFeature) => string
  getHoverGroupKey?: (feature: TFeature) => string
  getBoundaryStyle: (name: string) => BoundaryStyleSetting | undefined
  map?: L.Map
  interactive?: boolean
  onFeatureClick?: (feature: TFeature) => void
}

const fallbackBoundaryStyle: BoundaryStyleSetting = {
  name: '',
  color: '#999',
  center: [25, 10],
  zoom: 1
}

const featureLayer = <TFeature extends MapFeature<any>>(layer: L.Layer) => {
  return layer as L.Layer & { feature?: TFeature }
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

const setGroupOpacity = <TFeature extends MapFeature<any>>(
  map: L.Map,
  groupKey: string,
  fillOpacity: number,
  getHoverGroupKey: (feature: TFeature) => string
) => {
  map.eachLayer((layer) => {
    const feature = featureLayer<TFeature>(layer).feature

    if (feature && getHoverGroupKey(feature) === groupKey) {
      ;(layer as L.Path).setStyle({ fillOpacity })
    }
  })
}

export const createBoundaryLayer = <TFeature extends MapFeature<any>>(
  options: BoundaryLayerOptions<TFeature>
) => {
  const isInteractive = options.interactive ?? true

  return L.geoJSON(options.features, {
    style: (feature) => {
      const boundaryStyle = options.getBoundaryStyle(options.getStyleKey(feature as TFeature)) ?? fallbackBoundaryStyle

      return {
        color: boundaryStyle.color,
        weight: options.settings.features.weight,
        opacity: options.settings.features.mediumOpacity,
        fillColor: boundaryStyle.color,
        fillOpacity: options.settings.features.lightOpacity
      }
    },
    onEachFeature: (feature, layer) => {
      const typedFeature = feature as TFeature
      const hoverGroupKey = options.getHoverGroupKey?.(typedFeature)

      layer.bindTooltip(tooltipText(typedFeature, options))

      if (!isInteractive) return

      layer.on('mouseover', () => {
        if (hoverGroupKey && options.map) {
          setGroupOpacity<TFeature>(
            options.map,
            hoverGroupKey,
            options.settings.features.mediumOpacity,
            options.getHoverGroupKey
          )
          return
        }

        ;(layer as L.Path).setStyle({ fillOpacity: options.settings.features.heavyOpacity })
      })

      layer.on('mouseout', () => {
        if (hoverGroupKey && options.map) {
          setGroupOpacity<TFeature>(
            options.map,
            hoverGroupKey,
            options.settings.features.lightOpacity,
            options.getHoverGroupKey
          )
          return
        }

        ;(layer as L.Path).setStyle({ fillOpacity: options.settings.features.lightOpacity })
      })

      layer.on('click', () => {
        if (hoverGroupKey && options.map) {
          setGroupOpacity<TFeature>(
            options.map,
            hoverGroupKey,
            options.settings.features.lightOpacity,
            options.getHoverGroupKey
          )
        }
        else {
          ;(layer as L.Path).setStyle({ fillOpacity: options.settings.features.lightOpacity })
        }

        options.onFeatureClick?.(typedFeature)
      })
    }
  })
}
