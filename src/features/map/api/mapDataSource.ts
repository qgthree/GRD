import type {
  DistrictFeature,
  MapFeatureCollection,
  StateFeature
} from '@/features/map/types'
import { queryTigerGeoJson, tigerWebLayers, type TigerFeature } from '@/features/locations/api/tigerWeb'
import type { Geometry, Position } from 'geojson'

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
const parentBoundarySessionCacheKey = 'grd:tigerweb:states:v5:maxOffset0.01:stateSchema:antimeridian'

const coordinate = (value: string) => Number.parseFloat(value)

const getLongitudeRange = (coordinates: unknown) => {
  let minLongitude = Infinity
  let maxLongitude = -Infinity

  const walk = (value: unknown) => {
    if (!Array.isArray(value)) return

    if (typeof value[0] === 'number') {
      const longitude = value[0]

      minLongitude = Math.min(minLongitude, longitude)
      maxLongitude = Math.max(maxLongitude, longitude)
      return
    }

    value.forEach(walk)
  }

  walk(coordinates)

  return { minLongitude, maxLongitude }
}

const normalizeCoordinateLongitude = (position: Position, centroidLongitude: number) => {
  const [longitude, latitude, ...rest] = position

  if (centroidLongitude < 0 && longitude > 0) {
    return [longitude - 360, latitude, ...rest]
  }

  if (centroidLongitude > 0 && longitude < 0) {
    return [longitude + 360, latitude, ...rest]
  }

  return position
}

const normalizeCoordinatesAcrossAntimeridian = <TCoordinates>(
  coordinates: TCoordinates,
  centroidLongitude: number
): TCoordinates => {
  if (!Array.isArray(coordinates)) return coordinates

  if (typeof coordinates[0] === 'number') {
    return normalizeCoordinateLongitude(coordinates as Position, centroidLongitude) as TCoordinates
  }

  return coordinates.map((coordinateSet: unknown) => {
    return normalizeCoordinatesAcrossAntimeridian(coordinateSet, centroidLongitude)
  }) as TCoordinates
}

const normalizeGeometryAcrossAntimeridian = (geometry: Geometry, centroidLongitude: number): Geometry => {
  if (geometry.type === 'GeometryCollection') {
    return {
      ...geometry,
      geometries: geometry.geometries.map((childGeometry) => {
        return normalizeGeometryAcrossAntimeridian(childGeometry, centroidLongitude)
      })
    }
  }

  const { minLongitude, maxLongitude } = getLongitudeRange(geometry.coordinates)

  if (maxLongitude - minLongitude <= 180) return geometry

  return {
    ...geometry,
    coordinates: normalizeCoordinatesAcrossAntimeridian(geometry.coordinates, centroidLongitude)
  } as Geometry
}

const normalizeStateFeature = (feature: TigerFeature<TigerStateProperties>): StateFeature => ({
  ...feature,
  geometry: normalizeGeometryAcrossAntimeridian(feature.geometry, coordinate(feature.properties.CENTLON)),
  properties: {
    name: feature.properties.NAME || feature.properties.BASENAME,
    stateCode: feature.properties.STATE,
    stateAbbreviation: feature.properties.STUSAB,
    latCent: coordinate(feature.properties.CENTLAT),
    longCent: coordinate(feature.properties.CENTLON)
  }
})

const normalizeCongressionalDistrictFeature = (
  feature: TigerFeature<TigerCongressionalDistrictProperties>,
  stateNamesByCode: Map<string, string>
): DistrictFeature => {
  const stateName = stateNamesByCode.get(feature.properties.STATE) ?? feature.properties.STATE

  return {
    ...feature,
    geometry: normalizeGeometryAcrossAntimeridian(feature.geometry, coordinate(feature.properties.CENTLON)),
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

const getStateNamesByCode = async () => {
  const states = await getStateBoundaries()

  return new Map(states.features.map((feature) => [
    feature.properties.stateCode,
    feature.properties.name
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

  return congressionalDistrictBoundaryRequests.get(stateCode) as Promise<MapFeatureCollection<DistrictFeature>>
}

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
