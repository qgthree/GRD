import type L from 'leaflet'
import type { Feature, Geometry } from 'geojson'

// Region names come from the BHA map data. The string fallback keeps the app
// tolerant if future data adds a region before this type is updated.
export type RegionName = 'Africa' | 'ALAC' | 'MENAE' | string

// The region GeoJSON only needs the BHA region identifier for current styling
// and routing behavior.
export interface RegionProperties {
  BHA_REGION: RegionName
}

// Country features contain many more fields in the source file; this type names
// only the properties the app currently reads.
export interface CountryProperties {
  BHA_Reg: RegionName
  ISO3: string
  USG_Name: string
  LAT_CENT: number
  LONG_CENT: number
}

export type MapFeature<TProperties> = Feature<Geometry, TProperties>

export type RegionFeature = MapFeature<RegionProperties>
export type CountryFeature = MapFeature<CountryProperties>

// Local JSON and future API responses should both satisfy this shape.
export interface MapFeatureCollection<TFeature> {
  features: TFeature[]
}

// These settings are still stored in Pinia, but the explicit type lets map
// helpers work without importing the store directly.
export interface RegionSetting {
  name: RegionName
  color: string
  center: number[]
  zoom: number
}

export interface MapStyleSettings {
  weight: number
  heavyOpacity: number
  mediumOpacity: number
  lightOpacity: number
}

export interface LeafSettings {
  url: string
  mapCenter: number[]
  mapZoom: number
  minZoom: number
  maxZoom: number
  features: MapStyleSettings
  region: RegionSetting[]
  mapOptions: L.MapOptions
}

// Normalized route-query state. Components should use this instead of branching
// directly on raw query string values.
export type MapSelection =
  | { type: 'home' }
  | { type: 'regions'; regionNames: string[] }
  | { type: 'region'; regionName: string }
  | { type: 'countries'; countryCodes: string[] }
  | { type: 'country'; countryCode: string }
