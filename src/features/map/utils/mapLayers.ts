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
  getHoverGroupKey?: (feature: TFeature) => string
  getBoundaryStyle: (name: string) => BoundaryStyleSetting | undefined
  map?: L.Map
  interactive?: boolean
  onFeatureClick?: (feature: TFeature) => void
}

const fallbackBoundaryStyle: BoundaryStyleSetting = {
  name: '',
  color: heatmapBoundaryColor,
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
  getFillOpacity: (feature: TFeature) => number,
  getHoverGroupKey: (feature: TFeature) => string
) => {
  map.eachLayer((layer) => {
    const feature = featureLayer<TFeature>(layer).feature

    if (feature && getHoverGroupKey(feature) === groupKey) {
      ;(layer as L.Path).setStyle({ fillOpacity: getFillOpacity(feature) })
    }
  })
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

  return L.geoJSON(options.features, {
    interactive: isInteractive,
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
      const hoverGroupKey = options.getHoverGroupKey?.(typedFeature)

      layer.bindTooltip(tooltipText(typedFeature, options))

      if (!isInteractive) return

      layer.on('mouseover', () => {
        // Density maps already use fill opacity to communicate data. Do not
        // overwrite that encoding just to show hover state.
        if (options.getFillOpacity) return

        if (hoverGroupKey && options.map) {
          setGroupOpacity<TFeature>(
            options.map,
            hoverGroupKey,
            () => options.settings.features.mediumOpacity,
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
            getRestingFillOpacity,
            options.getHoverGroupKey
          )
          return
        }

        ;(layer as L.Path).setStyle({ fillOpacity: getRestingFillOpacity(typedFeature) })
      })

      layer.on('click', () => {
        if (hoverGroupKey && options.map) {
          setGroupOpacity<TFeature>(
            options.map,
            hoverGroupKey,
            getRestingFillOpacity,
            options.getHoverGroupKey
          )
        }
        else {
          ;(layer as L.Path).setStyle({ fillOpacity: getRestingFillOpacity(typedFeature) })
        }

        options.onFeatureClick?.(typedFeature)
      })
    }
  })
}
