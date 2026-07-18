import L from 'leaflet'
import type {
  CountryFeature,
  LeafSettings,
  RegionFeature,
  RegionSetting
} from '@/features/map/types'

interface RegionLayerOptions {
  features: RegionFeature[]
  map: L.Map
  settings: LeafSettings
  getRegion: (name: string) => RegionSetting | undefined
  getVendorCount: (regionName: string) => number
  onRegionClick: (regionName: string) => void
}

// Layer helpers receive callbacks instead of importing router/stores. That keeps
// map rendering reusable and prevents circular dependencies.
interface CountryLayerOptions {
  features: CountryFeature[]
  settings: LeafSettings
  getRegion: (name: string) => RegionSetting | undefined
  getVendorCount: (countryCode: string) => number | undefined
  onCountryClick: (countryCode: string) => void
}

const fallbackRegion: RegionSetting = {
  name: '',
  color: '#999',
  center: [25, 10],
  zoom: 1
}

// Leaflet's base Layer type does not expose the GeoJSON feature property, so the
// cast is kept in one helper instead of repeated throughout the file.
const featureLayer = (layer: L.Layer) => layer as L.Layer & { feature?: RegionFeature }

// Region hover effects need to update every polygon that belongs to the same
// BHA region, not only the one polygon under the cursor.
const setRegionOpacity = (map: L.Map, regionName: string, fillOpacity: number) => {
  map.eachLayer((layer) => {
    if (featureLayer(layer).feature?.properties.BHA_REGION === regionName) {
      ;(layer as L.Path).setStyle({ fillOpacity })
    }
  })
}

// Builds the high-level region layer used by the home and multi-region views.
export const createRegionLayer = ({
  features,
  map,
  settings,
  getRegion,
  getVendorCount,
  onRegionClick
}: RegionLayerOptions) => {
  return L.geoJSON(features, {
    style: (feature) => {
      const region = getRegion(feature?.properties.BHA_REGION) ?? fallbackRegion

      return {
        color: region.color,
        weight: settings.features.weight,
        opacity: settings.features.mediumOpacity,
        fillColor: region.color,
        fillOpacity: settings.features.lightOpacity
      }
    },
    onEachFeature: (feature, layer) => {
      const regionName = feature.properties.BHA_REGION

      // Vendor counts are supplied by the caller so this helper does not need
      // to know where vendor data lives.
      layer.bindTooltip(
        `<span class="tip-title">${regionName}</span><br /><span>${getVendorCount(regionName)} vendors</span>`
      )

      layer.on('mouseover', () => {
        setRegionOpacity(map, regionName, settings.features.mediumOpacity)
      })

      layer.on('mouseout', () => {
        setRegionOpacity(map, regionName, settings.features.lightOpacity)
      })

      layer.on('click', () => {
        setRegionOpacity(map, regionName, settings.features.lightOpacity)
        onRegionClick(regionName)
      })
    }
  })
}

// Builds the country layer used when a selected region or country query should
// reveal country-level shapes.
export const createCountryLayer = ({
  features,
  settings,
  getRegion,
  getVendorCount,
  onCountryClick
}: CountryLayerOptions) => {
  // A single selected country is informational; lists of countries are clickable
  // so users can drill into a specific country.
  const isInteractiveList = features.length > 1

  return L.geoJSON(features, {
    style: (feature) => {
      const region = getRegion(feature?.properties.BHA_Reg) ?? fallbackRegion

      return {
        color: region.color,
        weight: settings.features.weight,
        opacity: settings.features.mediumOpacity,
        fillColor: region.color,
        fillOpacity: settings.features.lightOpacity
      }
    },
    onEachFeature: (feature, layer) => {
      const countryCode = feature.properties.ISO3

      // Keep the tooltip binding singular so later calls do not overwrite it.
      layer.bindTooltip(
        `<span class="tip-title">${feature.properties.USG_Name}</span><br /><span>${getVendorCount(countryCode) ?? 0} vendors</span>`
      )

      if (!isInteractiveList) return

      layer.on('mouseover', () => {
        ;(layer as L.Path).setStyle({ fillOpacity: settings.features.heavyOpacity })
      })

      layer.on('mouseout', () => {
        ;(layer as L.Path).setStyle({ fillOpacity: settings.features.lightOpacity })
      })

      layer.on('click', () => {
        ;(layer as L.Path).setStyle({ fillOpacity: settings.features.lightOpacity })
        onCountryClick(countryCode)
      })
    }
  })
}
