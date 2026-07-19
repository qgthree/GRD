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

export const getParentBoundaries = async () => {
  parentBoundaryRequest ??= queryTigerGeoJson<TigerStateProperties>(tigerWebLayers.states, {
    outFields: 'STATE,NAME,BASENAME,STUSAB,CENTLAT,CENTLON'
  })
    .then((collection) => ({
      features: collection.features
        .map(normalizeStateFeature)
        .sort((firstFeature, secondFeature) => {
          return firstFeature.properties.BHA_REGION.localeCompare(secondFeature.properties.BHA_REGION)
        })
    }))
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
