import type {
  CountryFeature,
  MapFeatureCollection,
  RegionFeature
} from '@/features/map/types'

type CountryRegionIndex = Record<string, string>

const mapDataPaths = {
  parentBoundaries: '/map-data/regions.json',
  countryIndex: '/map-data/countries/index.json',
  childBoundariesByRegion: (region: string) => `/map-data/countries/${encodeURIComponent(region)}.json`
}

const fetchJson = async <TData>(path: string) => {
  const response = await fetch(path)

  if (!response.ok) {
    throw new Error(`Unable to load map data from ${path}`)
  }

  return response.json() as Promise<TData>
}

// These small module-level request caches mirror what a future API client cache
// would do: load each map asset once, then reuse it for later route changes.
let parentBoundaryRequest: Promise<MapFeatureCollection<RegionFeature>> | null = null
let countryRegionIndexRequest: Promise<CountryRegionIndex> | null = null
const childBoundaryRequests = new Map<string, Promise<MapFeatureCollection<CountryFeature>>>()

export const getParentBoundaries = async () => {
  parentBoundaryRequest ??= fetchJson<MapFeatureCollection<RegionFeature>>(mapDataPaths.parentBoundaries)
    .catch((caughtError) => {
      parentBoundaryRequest = null
      throw caughtError
    })

  return parentBoundaryRequest
}

const getCountryRegionIndex = async () => {
  countryRegionIndexRequest ??= fetchJson<CountryRegionIndex>(mapDataPaths.countryIndex)
    .catch((caughtError) => {
      countryRegionIndexRequest = null
      throw caughtError
    })

  return countryRegionIndexRequest
}

export const getChildBoundariesForRegions = async (regions: string[]) => {
  const uniqueRegions = [...new Set(regions.filter(Boolean))]
  const collections = await Promise.all(uniqueRegions.map(async (region) => {
    if (!childBoundaryRequests.has(region)) {
      childBoundaryRequests.set(
        region,
        fetchJson<MapFeatureCollection<CountryFeature>>(mapDataPaths.childBoundariesByRegion(region))
          .catch((caughtError) => {
            childBoundaryRequests.delete(region)
            throw caughtError
          })
      )
    }

    return childBoundaryRequests.get(region) as Promise<MapFeatureCollection<CountryFeature>>
  }))

  return {
    features: collections.flatMap((collection) => collection.features)
  }
}

export const getChildBoundariesForCountries = async (countryCodes: string[]) => {
  const countryRegionIndex = await getCountryRegionIndex()
  const requestedCountryCodes = new Set(countryCodes)
  const regions = countryCodes
    .map((countryCode) => countryRegionIndex[countryCode])
    .filter((region): region is string => Boolean(region))
  const childBoundaries = await getChildBoundariesForRegions(regions)

  return {
    features: childBoundaries.features.filter((feature) => requestedCountryCodes.has(feature.properties.ISO3))
  }
}
