import type L from 'leaflet'
import type { Feature, Geometry } from 'geojson'

// State names come from TIGERweb. The string fallback keeps the app tolerant if
// the source changes its labels.
export type StateName = string

export interface StateProperties {
  name: StateName
  stateCode: string
  stateAbbreviation: string
  latCent: number
  longCent: number
}

export interface DistrictProperties {
  stateName: StateName
  geoid: string
  name: string
  latCent: number
  longCent: number
  districtCode: string
}

export type MapFeature<TProperties> = Feature<Geometry, TProperties>

export type StateFeature = MapFeature<StateProperties>
export type DistrictFeature = MapFeature<DistrictProperties>

// Local JSON and future API responses should both satisfy this shape.
export interface MapFeatureCollection<TFeature> {
  features: TFeature[]
}

// These settings are still stored in Pinia, but the explicit type lets map
// helpers work without importing the store directly.
export interface BoundaryStyleSetting {
  name: StateName
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
  boundaryStyles: BoundaryStyleSetting[]
  mapOptions: L.MapOptions
}

export type BoundarySelection =
  | { type: 'none' }
  | { type: 'state-list'; ids: string[] }
  | { type: 'state'; id: string }
  | { type: 'district-list'; ids: string[] }
  | { type: 'district'; id: string }
