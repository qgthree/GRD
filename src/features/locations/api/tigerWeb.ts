import type { Feature, Geometry } from 'geojson'

export const tigerWebBaseUrl =
  import.meta.env.VITE_TIGERWEB_BASE_URL ??
  (import.meta.env.DEV
    ? '/tigerweb/rest/services/TIGERweb/tigerWMS_Current/MapServer'
    : 'https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_Current/MapServer')

export const tigerWebLayers = {
  congressionalDistricts119: 54,
  states: 80
} as const

export type TigerFeature<TProperties> = Feature<Geometry, TProperties>

interface TigerJsonFeature<TProperties> {
  attributes: TProperties
}

interface TigerJsonResponse<TProperties> {
  features?: TigerJsonFeature<TProperties>[]
  error?: {
    message?: string
  }
}

const tigerLayerUrl = (layerId: number, operation = 'query') => {
  return `${tigerWebBaseUrl}/${layerId}/${operation}`
}

const createQueryUrl = (layerId: number, params: Record<string, string | undefined>) => {
  const url = new URL(tigerLayerUrl(layerId), globalThis.location?.origin ?? 'http://localhost')

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined) return

    url.searchParams.set(key, value)
  })

  return url.toString()
}

export const queryTigerGeoJson = async <TProperties>(layerId: number, params: Record<string, string | undefined>) => {
  const requestUrl = createQueryUrl(layerId, {
    where: '1=1',
    outFields: '*',
    returnGeometry: 'true',
    outSR: '4326',
    f: 'geoJSON',
    maxAllowableOffset: '0.01',
    geometryPrecision: '4',
    ...params
  })
  const response = await fetch(requestUrl)

  if (!response.ok) {
    throw new Error(`Unable to load TIGERweb layer ${layerId}`)
  }

  if (!response.headers.get('content-type')?.includes('json')) {
    throw new Error(`TIGERweb returned non-JSON data for ${requestUrl}`)
  }

  return response.json() as Promise<{ features: TigerFeature<TProperties>[] }>
}

export const queryTigerJson = async <TProperties>(layerId: number, params: Record<string, string | undefined>) => {
  const requestUrl = createQueryUrl(layerId, {
    where: '1=1',
    outFields: '*',
    returnGeometry: 'false',
    f: 'json',
    ...params
  })
  const response = await fetch(requestUrl)

  if (!response.ok) {
    throw new Error(`Unable to load TIGERweb layer ${layerId}`)
  }

  if (!response.headers.get('content-type')?.includes('json')) {
    throw new Error(`TIGERweb returned non-JSON data for ${requestUrl}`)
  }

  const data = await response.json() as TigerJsonResponse<TProperties>

  if (data.error) {
    throw new Error(data.error.message ?? `Unable to load TIGERweb layer ${layerId}`)
  }

  return data.features?.map((feature) => feature.attributes) ?? []
}
