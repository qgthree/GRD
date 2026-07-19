import type L from 'leaflet'
import type { Feature, Geometry } from 'geojson'

// Parent geography names come from TIGERweb state boundaries. The string
// fallback keeps the app tolerant if the source changes its labels.
export type RegionName = 'Africa' | 'ALAC' | 'MENAE' | string

export interface RegionProperties {
  BHA_REGION: RegionName
  STATE: string
  STUSAB: string
  LAT_CENT: number
  LONG_CENT: number
}

export interface CountryProperties {
  BHA_Reg: RegionName
  ISO3: string
  USG_Name: string
  LAT_CENT: number
  LONG_CENT: number
  CD119: string
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
export interface BoundaryStyleSetting {
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
  region: BoundaryStyleSetting[]
  mapOptions: L.MapOptions
}

export type BoundarySelection =
  | { type: 'none' }
  | { type: 'parent-list'; ids: string[] }
  | { type: 'parent'; id: string }
  | { type: 'child-list'; ids: string[] }
  | { type: 'child'; id: string }
