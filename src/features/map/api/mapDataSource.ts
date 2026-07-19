import type {
  DistrictFeature,
  MapFeatureCollection,
  StateFeature
} from '@/features/map/types'
import { getStates } from '@/features/locations/api/locationDataSource'
import { queryTigerGeoJson, tigerWebLayers, type TigerFeature } from '@/features/locations/api/tigerWeb'

interface TigerStateProperties {
  STATE: string
  NAME: string
  BASENAME: string
  STUSAB: string
  CENTLAT: string
  CENTLON: string
}

interface TigerCongressionalDistrictProperties {
  GEOID: string
  STATE: string
  CD119: string
  NAME: string
  BASENAME: string
  CENTLAT: string
  CENTLON: string
}

let stateBoundaryRequest: Promise<MapFeatureCollection<StateFeature>> | null = null
const congressionalDistrictBoundaryRequests = new Map<string, Promise<MapFeatureCollection<DistrictFeature>>>()
const parentBoundarySessionCacheKey = 'grd:tigerweb:states:v7:maxOffset0.01:stateSchema'

// TIGERweb returns numeric attributes as strings; map features keep centroids
// numeric so Leaflet viewport helpers can use them directly.
const coordinate = (value: string) => Number.parseFloat(value)

// Convert TIGERweb state GeoJSON attributes into the app's map-facing state
// properties.
const normalizeStateFeature = (feature: TigerFeature<TigerStateProperties>): StateFeature => ({
  ...feature,
  properties: {
    name: feature.properties.NAME || feature.properties.BASENAME,
    stateCode: feature.properties.STATE,
    stateAbbreviation: feature.properties.STUSAB,
    latCent: coordinate(feature.properties.CENTLAT),
    longCent: coordinate(feature.properties.CENTLON)
  }
})

// Convert TIGERweb congressional district GeoJSON attributes into the app's
// map-facing district properties, including a readable state name.
const normalizeCongressionalDistrictFeature = (
  feature: TigerFeature<TigerCongressionalDistrictProperties>,
  stateNamesByCode: Map<string, string>
): DistrictFeature => {
  const stateName = stateNamesByCode.get(feature.properties.STATE) ?? feature.properties.STATE

  return {
    ...feature,
    properties: {
      stateName,
      geoid: feature.properties.GEOID,
      name: feature.properties.NAME || `${stateName} Congressional District ${feature.properties.CD119}`,
      latCent: coordinate(feature.properties.CENTLAT),
      longCent: coordinate(feature.properties.CENTLON),
      districtCode: feature.properties.CD119
    }
  }
}

// Read cached state boundary geometry from sessionStorage. Failures are ignored
// because cache access is only a performance optimization.
const readSessionCache = <TData>(key: string) => {
  try {
    const cachedData = window.sessionStorage.getItem(key)

    return cachedData ? JSON.parse(cachedData) as TData : null
  }
  catch {
    return null
  }
}

// Store state boundary geometry for this browser session so returning to the
// country view does not refetch the all-state TIGERweb layer.
const writeSessionCache = (key: string, data: unknown) => {
  try {
    window.sessionStorage.setItem(key, JSON.stringify(data))
  }
  catch {
    // Cache writes are a performance optimization. Private browsing or storage
    // quota limits should not block the map from rendering.
  }
}

// Fetch all state boundary GeoJSON once, at intentionally low fidelity, then
// normalize, sort, and session-cache it for country and state-selection views.
export const getStateBoundaries = async () => {
  stateBoundaryRequest ??= Promise.resolve(readSessionCache<MapFeatureCollection<StateFeature>>(parentBoundarySessionCacheKey))
    .then((cachedBoundaries) => {
      if (cachedBoundaries) return cachedBoundaries

      return queryTigerGeoJson<TigerStateProperties>(tigerWebLayers.states, {
        outFields: 'STATE,NAME,BASENAME,STUSAB,CENTLAT,CENTLON',
        maxAllowableOffset: '0.01',
        geometryPrecision: '4'
      })
        .then((collection) => {
          return collection.features.map(normalizeStateFeature)
        })
        .then((features) => {
          const sortedFeatures = features.sort((firstFeature, secondFeature) => {
            return firstFeature.properties.name.localeCompare(secondFeature.properties.name)
          })
          const boundaries = { features: sortedFeatures }

          writeSessionCache(parentBoundarySessionCacheKey, boundaries)
          return boundaries
        })
    })
    .catch((caughtError) => {
      stateBoundaryRequest = null
      throw caughtError
    })

  return stateBoundaryRequest
}

// Build a lightweight lookup from Census state code to state name without
// loading state geometry. District boundary responses only include the code.
const getStateNamesByCode = async () => {
  const states = await getStates()

  return new Map(states.map((state) => [
    state.code,
    state.name
  ]))
}

// Fetch and memoize congressional district boundary GeoJSON for one state code.
// District selections are grouped by state so each state layer is requested once.
const getCongressionalDistrictBoundariesForStateCode = async (stateCode: string) => {
  if (!congressionalDistrictBoundaryRequests.has(stateCode)) {
    congressionalDistrictBoundaryRequests.set(
      stateCode,
      Promise.all([
        getStateNamesByCode(),
        queryTigerGeoJson<TigerCongressionalDistrictProperties>(tigerWebLayers.congressionalDistricts119, {
          where: `STATE='${stateCode}'`,
          outFields: 'GEOID,STATE,CD119,NAME,BASENAME,CENTLAT,CENTLON'
        })
      ])
        .then(([stateNamesByCode, districts]) => ({
          features: districts.features.map((feature) => normalizeCongressionalDistrictFeature(feature, stateNamesByCode))
        }))
        .catch((caughtError) => {
          congressionalDistrictBoundaryRequests.delete(stateCode)
          throw caughtError
        })
    )
  }

  return congressionalDistrictBoundaryRequests.get(stateCode) as Promise<MapFeatureCollection<DistrictFeature>>
}

// Convert selected state names into Census state codes, fetch those states'
// congressional district boundaries, and return one combined feature collection.
export const getDistrictBoundariesForStates = async (states: string[]) => {
  const uniqueStates = [...new Set(states.filter(Boolean))]
  const stateBoundaries = await getStateBoundaries()
  const stateCodes = stateBoundaries.features
    .filter((feature) => uniqueStates.includes(feature.properties.name))
    .map((feature) => feature.properties.stateCode)
  const districtCollections = await Promise.all(stateCodes.map(getCongressionalDistrictBoundariesForStateCode))

  return {
    features: districtCollections.flatMap((collection) => collection.features)
  }
}

// Fetch congressional district boundaries for the states implied by selected
// district GEOIDs, then return only the requested district features.
export const getDistrictBoundariesForGeoids = async (geoids: string[]) => {
  const requestedGeoids = new Set(geoids)
  const stateCodes = [...new Set(geoids.map((geoid) => geoid.slice(0, 2)))]
  const districtCollections = await Promise.all(stateCodes.map(getCongressionalDistrictBoundariesForStateCode))

  return {
    features: districtCollections
      .flatMap((collection) => collection.features)
      .filter((feature) => requestedGeoids.has(feature.properties.geoid))
  }
}
