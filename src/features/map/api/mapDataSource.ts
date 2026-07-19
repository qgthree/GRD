import type {
  CountryFeature,
  MapFeatureCollection,
  RegionFeature
} from '@/features/map/types'
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

let parentBoundaryRequest: Promise<MapFeatureCollection<RegionFeature>> | null = null
const congressionalDistrictBoundaryRequests = new Map<string, Promise<MapFeatureCollection<CountryFeature>>>()
const parentBoundarySessionCacheKey = 'grd:tigerweb:states:v2:maxOffset0.0005:miFull'
const highFidelityStateBoundaryCodes = new Set(['26'])

const coordinate = (value: string) => Number.parseFloat(value)

const normalizeStateFeature = (feature: TigerFeature<TigerStateProperties>): RegionFeature => ({
  ...feature,
  properties: {
    BHA_REGION: feature.properties.NAME || feature.properties.BASENAME,
    STATE: feature.properties.STATE,
    STUSAB: feature.properties.STUSAB,
    LAT_CENT: coordinate(feature.properties.CENTLAT),
    LONG_CENT: coordinate(feature.properties.CENTLON)
  }
})

const normalizeCongressionalDistrictFeature = (
  feature: TigerFeature<TigerCongressionalDistrictProperties>,
  stateNamesByCode: Map<string, string>
): CountryFeature => {
  const stateName = stateNamesByCode.get(feature.properties.STATE) ?? feature.properties.STATE

  return {
    ...feature,
    properties: {
      BHA_Reg: stateName,
      ISO3: feature.properties.GEOID,
      USG_Name: feature.properties.NAME || `${stateName} Congressional District ${feature.properties.CD119}`,
      LAT_CENT: coordinate(feature.properties.CENTLAT),
      LONG_CENT: coordinate(feature.properties.CENTLON),
      CD119: feature.properties.CD119
    }
  }
}

const readSessionCache = <TData>(key: string) => {
  try {
    const cachedData = window.sessionStorage.getItem(key)

    return cachedData ? JSON.parse(cachedData) as TData : null
  }
  catch {
    return null
  }
}

const writeSessionCache = (key: string, data: unknown) => {
  try {
    window.sessionStorage.setItem(key, JSON.stringify(data))
  }
  catch {
    // Cache writes are a performance optimization. Private browsing or storage
    // quota limits should not block the map from rendering.
  }
}

const getHighFidelityStateBoundary = async (stateCode: string) => {
  const collection = await queryTigerGeoJson<TigerStateProperties>(tigerWebLayers.states, {
    where: `STATE='${stateCode}'`,
    outFields: 'STATE,NAME,BASENAME,STUSAB,CENTLAT,CENTLON',
    maxAllowableOffset: undefined,
    geometryPrecision: '5'
  })

  const feature = collection.features[0]

  return feature ? normalizeStateFeature(feature) : null
}

const applyHighFidelityStateBoundaryOverrides = async (features: RegionFeature[]) => {
  const overrides = await Promise.all([...highFidelityStateBoundaryCodes].map(getHighFidelityStateBoundary))
  const overridesByStateCode = new Map(overrides
    .filter((feature): feature is RegionFeature => Boolean(feature))
    .map((feature) => [feature.properties.STATE, feature]))

  return features.map((feature) => overridesByStateCode.get(feature.properties.STATE) ?? feature)
}

export const getParentBoundaries = async () => {
  parentBoundaryRequest ??= Promise.resolve(readSessionCache<MapFeatureCollection<RegionFeature>>(parentBoundarySessionCacheKey))
    .then((cachedBoundaries) => {
      if (cachedBoundaries) return cachedBoundaries

      return queryTigerGeoJson<TigerStateProperties>(tigerWebLayers.states, {
        outFields: 'STATE,NAME,BASENAME,STUSAB,CENTLAT,CENTLON',
        maxAllowableOffset: '0.0005',
        geometryPrecision: '5'
      })
        .then((collection) => {
          const features = collection.features.map(normalizeStateFeature)

          return applyHighFidelityStateBoundaryOverrides(features)
        })
        .then((features) => {
          const sortedFeatures = features.sort((firstFeature, secondFeature) => {
            return firstFeature.properties.BHA_REGION.localeCompare(secondFeature.properties.BHA_REGION)
          })
          const boundaries = { features: sortedFeatures }

          writeSessionCache(parentBoundarySessionCacheKey, boundaries)
          return boundaries
        })
    })
    .catch((caughtError) => {
      parentBoundaryRequest = null
      throw caughtError
    })

  return parentBoundaryRequest
}

const getStateNamesByCode = async () => {
  const states = await getParentBoundaries()

  return new Map(states.features.map((feature) => [
    feature.properties.STATE,
    feature.properties.BHA_REGION
  ]))
}

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

  return congressionalDistrictBoundaryRequests.get(stateCode) as Promise<MapFeatureCollection<CountryFeature>>
}

export const getChildBoundariesForRegions = async (regions: string[]) => {
  const uniqueRegions = [...new Set(regions.filter(Boolean))]
  const parentBoundaries = await getParentBoundaries()
  const stateCodes = parentBoundaries.features
    .filter((feature) => uniqueRegions.includes(feature.properties.BHA_REGION))
    .map((feature) => feature.properties.STATE)
  const districtCollections = await Promise.all(stateCodes.map(getCongressionalDistrictBoundariesForStateCode))

  return {
    features: districtCollections.flatMap((collection) => collection.features)
  }
}

export const getChildBoundariesForCountries = async (countryCodes: string[]) => {
  const requestedCountryCodes = new Set(countryCodes)
  const stateCodes = [...new Set(countryCodes.map((countryCode) => countryCode.slice(0, 2)))]
  const districtCollections = await Promise.all(stateCodes.map(getCongressionalDistrictBoundariesForStateCode))

  return {
    features: districtCollections
      .flatMap((collection) => collection.features)
      .filter((feature) => requestedCountryCodes.has(feature.properties.ISO3))
  }
}
