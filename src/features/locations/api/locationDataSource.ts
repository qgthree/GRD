import type { District, State } from '@/features/locations/types'
import { queryTigerJson, tigerWebLayers } from '@/features/locations/api/tigerWeb'

interface TigerStateProperties {
  STATE: string
  NAME: string
  BASENAME: string
  STUSAB: string
}

interface TigerCongressionalDistrictProperties {
  GEOID: string
  STATE: string
  CD119: string
  NAME: string
  BASENAME: string
}

let statesRequest: Promise<State[]> | null = null
let congressionalDistrictsRequest: Promise<District[]> | null = null

export const getStates = async (): Promise<State[]> => {
  statesRequest ??= queryTigerJson<TigerStateProperties>(tigerWebLayers.states, {
    outFields: 'STATE,NAME,BASENAME,STUSAB',
    orderByFields: 'NAME'
  })
    .then((states) => states.map((state) => ({
      name: state.NAME || state.BASENAME,
      code: state.STATE,
      abbreviation: state.STUSAB
    })))
    .catch((caughtError) => {
      statesRequest = null
      throw caughtError
    })

  return statesRequest
}

export const getDistricts = async (): Promise<District[]> => {
  congressionalDistrictsRequest ??= Promise.all([
    getStates(),
    queryTigerJson<TigerCongressionalDistrictProperties>(tigerWebLayers.congressionalDistricts119, {
      outFields: 'GEOID,STATE,CD119,NAME,BASENAME',
      orderByFields: 'STATE,CD119'
    })
  ])
    .then(([states, districts]) => {
      const stateNamesByCode = new Map(states.map((state) => [state.code, state.name]))
      const stateAbbreviationsByCode = new Map(states.map((state) => [state.code, state.abbreviation]))

      return districts.map((district) => {
        const stateName = stateNamesByCode.get(district.STATE) ?? district.STATE
        const stateAbbreviation = stateAbbreviationsByCode.get(district.STATE) ?? district.STATE

        return {
          name: district.NAME || `${stateName} Congressional District ${district.CD119}`,
          geoid: district.GEOID,
          state: stateName,
          stateAbbreviation,
          districtCode: district.CD119,
          type: '119th Congressional District'
        }
      })
    })
    .catch((caughtError) => {
      congressionalDistrictsRequest = null
      throw caughtError
    })

  return congressionalDistrictsRequest
}
