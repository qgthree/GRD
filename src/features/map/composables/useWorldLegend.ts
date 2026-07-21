import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMapSettingsStore } from '@/stores/mapSettingsStore'
import { useVendorStore } from '@/stores/vendorStore'
import { useLocationStore } from '@/stores/locationStore'
import { getBoundarySelection } from '@/features/map/utils/mapQuery'
import { findBoundaryStyle, heatmapBoundaryColor } from '@/features/map/utils/mapViewport'
import { createVendorDensityBuckets } from '@/features/map/utils/vendorDensity'
import type { District } from '@/features/locations/types'
import { sortDistricts } from '@/features/locations/utils/districtSorting'
import { stateQueryValue } from '@/features/locations/utils/locationQuery'
import { compactFilterQueryUpdates } from '@/utils/query'

export const useWorldLegend = () => {
  // Gather stores and router state here so the component receives a legend view
  // model instead of knowing how map selection, vendors, and routing fit together.
  const { leafSettings } = useMapSettingsStore()
  const vendorStore = useVendorStore()
  const locationStore = useLocationStore()
  const route = useRoute()
  const router = useRouter()

  // The URL is the source of truth for the geography represented by the legend.
  const activeSelection = computed(() => getBoundarySelection(route.query, locationStore))

  // State styles give legend rows the same colors used by the map layer.
  const stateStyles = computed(() => {
    return locationStore.states.map((state) => findBoundaryStyle(leafSettings.boundaryStyles, state.name))
  })

  // Visible state rows depend on selection: all states in country view, one
  // state in state view, or the selected subset in multi-state view.
  const visibleStates = computed(() => {
    const selection = activeSelection.value

    if (selection.type === 'state') {
      return stateStyles.value.filter((state) => state.name === selection.id)
    }

    if (selection.type === 'state-list') {
      return stateStyles.value.filter((state) => selection.ids.includes(state.name))
    }

    return stateStyles.value
  })
  // A single selected state switches the density scale from states to districts.
  const selectedState = computed(() => {
    const selection = activeSelection.value

    if (selection.type !== 'state') return

    return stateStyles.value.find((state) => state.name === selection.id)
  })
  // A single district does not need a density scale; the legend body shows its
  // direct vendor count instead.
  const selectedDistrict = computed(() => {
    const selection = activeSelection.value

    if (selection.type !== 'district') return

    return locationStore.districts.find((district) => district.geoid === selection.id)
  })
  // Multi-district selection buckets should only consider selected districts,
  // not every district in the state or country.
  const selectedDistricts = computed(() => {
    const selection = activeSelection.value

    if (selection.type !== 'district-list') return []

    return sortDistricts(locationStore.districts.filter((district) => selection.ids.includes(district.geoid)))
  })
  const districtVendorCount = (district: District) => vendorStore.districtVendorCount(district.geoid) ?? 0

  const districtVendorCounts = (districts: District[]) => districts.map(districtVendorCount)

  // Census encodes at-large districts as zero; user-facing labels should say so.
  const formatDistrictCode = (districtCode: string) => {
    const districtNumber = Number(districtCode)

    return districtNumber > 0 ? String(districtNumber) : 'At Large'
  }
  // Single-district titles identify the exact selected congressional district.
  const selectedDistrictLabel = computed(() => {
    if (!selectedDistrict.value) return

    return `${selectedDistrict.value.stateAbbreviation} Congressional District ${formatDistrictCode(selectedDistrict.value.districtCode)}`
  })

  // Legend titles describe the geography represented by the buckets, not just
  // the current viewport. This keeps selected-district views from implying that
  // unselected states or districts are part of the density scale.
  const legendTitle = computed(() => {
    const selection = activeSelection.value

    if (selectedDistrictLabel.value) return selectedDistrictLabel.value

    if (selection.type === 'state') {
      const abbreviation = locationStore.states.find((state) => state.name === selection.id)?.abbreviation
      return abbreviation ? `${abbreviation} Cong. District Vendors` : 'Cong. District Vendors'
    }

    if (selectedDistricts.value.length) {
      const [firstDistrict] = selectedDistricts.value
      const allSelectedDistrictsShareState = selectedDistricts.value.every((district) => {
        return district.stateAbbreviation === firstDistrict?.stateAbbreviation
      })

      if (firstDistrict && allSelectedDistrictsShareState) {
        return `${firstDistrict.stateAbbreviation} Selected District Vendors`
      }

      return 'Selected District Vendors'
    }

    if (selection.type === 'state-list') {
      return 'Selected State Vendors'
    }

    return 'U.S. State Vendors'
  })
  // Density buckets use the same geography named in the title. This is the core
  // guardrail that keeps the legend from describing unselected shapes.
  const densityBuckets = computed(() => {
    const selection = activeSelection.value

    if (selectedDistricts.value.length) {
      return createVendorDensityBuckets(districtVendorCounts(selectedDistricts.value))
    }

    if (selection.type !== 'state') {
      const stateCounts = visibleStates.value.map((state) => vendorStore.stateVendorCount(state.name))
      return createVendorDensityBuckets(stateCounts)
    }

    // In a single-state view, the map shades every district in that state.
    const selectedStateDistricts = locationStore.districts
      .filter((district) => district.state === selection.id)

    return createVendorDensityBuckets(districtVendorCounts(sortDistricts(selectedStateDistricts)))
  })
  // The map helper builds buckets light-to-dark; the legend reads better with
  // the highest vendor presence first.
  const densityLegendBuckets = computed(() => [...densityBuckets.value].reverse())
  // State-specific district heatmaps use that state's color; country and
  // selected-district heatmaps use the shared heatmap color.
  const densityLegendColor = computed(() => selectedState.value?.color ?? heatmapBoundaryColor)

  // The single-district body uses a count instead of a bucketed scale.
  const selectedDistrictVendorCount = computed(() => {
    if (!selectedDistrict.value) return 0

    return districtVendorCount(selectedDistrict.value)
  })
  // The fallback state-list body still shows the old global-vendor note.
  const globalVendorCount = computed(() => vendorStore.stateVendorCount('Global'))
  const stateVendorCount = (stateName: string) => vendorStore.stateVendorCount(stateName)

  // Legend state clicks use the same URL state as map clicks and filters.
  const selectState = (stateName: string) => {
    void router.push({
      query: {
        ...route.query,
        ...compactFilterQueryUpdates({
          state: stateQueryValue(stateName, locationStore.states),
          district: undefined
        })
      }
    })
  }

  return {
    densityLegendBuckets,
    densityLegendColor,
    globalVendorCount,
    legendTitle,
    route,
    selectState,
    selectedDistrict,
    selectedDistrictVendorCount,
    stateVendorCount,
    visibleStates
  }
}
