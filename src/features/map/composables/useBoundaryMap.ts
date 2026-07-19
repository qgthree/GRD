import L from 'leaflet'
import { onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter, type LocationQuery } from 'vue-router'
import { useVendorStore } from '@/stores/vendorStore'
import { useMapSettingsStore } from '@/stores/mapSettingsStore'
import { useMapData } from '@/features/map/composables/useMapData'
import { createBoundaryLayer } from '@/features/map/utils/mapLayers'
import { getBoundarySelection, mapBoundaryQueryKeys } from '@/features/map/utils/mapQuery'
import {
  alaskaStateName,
  findBoundaryStyle,
  setAlaskaViewport,
  setDefaultViewport,
  setFeatureViewport
} from '@/features/map/utils/mapViewport'
import {
  createVendorDensityBuckets,
  findVendorDensityBucket,
  type VendorDensityBucket
} from '@/features/map/utils/vendorDensity'
import type {
  DistrictFeature,
  LeafSettings,
  StateFeature
} from '@/features/map/types'

type BackgroundClickTarget =
  | { type: 'country' }
  | { type: 'state'; stateName: string }
  | null

export const useBoundaryMap = () => {
  // Route, vendor, settings, and geometry stores are intentionally gathered
  // here so Map.vue can stay a small shell around the Leaflet surface.
  const router = useRouter()
  const route = useRoute()
  const vendorStore = useVendorStore()
  const { leafSettings } = useMapSettingsStore() as { leafSettings: LeafSettings }
  const {
    stateBoundaries,
    isLoading,
    loadStateBoundaries,
    loadDistrictBoundariesForStates,
    loadDistrictBoundariesForGeoids
  } = useMapData()

  // Leaflet owns these objects outside Vue reactivity. Keeping them as plain
  // variables avoids unnecessary proxying and makes cleanup direct.
  let map: L.Map
  let boundaryLayerGroup: L.LayerGroup
  let backgroundClickTarget: BackgroundClickTarget = null

  // Create the Leaflet instance and the one layer group that all boundary
  // selections will replace.
  const initializeMap = () => {
    map = L.map('map', leafSettings.mapOptions)

    // The base tile layer is stable; route changes only swap the GeoJSON overlay.
    L.tileLayer(leafSettings.url, {
      id: 'cartodb voyager',
      minZoom: leafSettings.minZoom,
      maxZoom: leafSettings.maxZoom
    }).addTo(map)

    // All route-selected GeoJSON layers live in this group. Clearing the group is
    // more reliable than tracking individual layers during async route changes.
    boundaryLayerGroup = L.layerGroup().addTo(map)

    // A click on map background moves the selection up one geography level.
    // Boundary feature clicks do not bubble here because mapLayers disables it.
    map.on('click', handleBackgroundClick)
  }

  // Remove the previous route-selected GeoJSON layer before drawing the next one.
  const clearBoundaryLayers = () => {
    boundaryLayerGroup?.clearLayers()
  }

  // Swap in one fully prepared boundary layer.
  const setBoundaryLayer = (layer: L.GeoJSON) => {
    clearBoundaryLayers()
    boundaryLayerGroup.addLayer(layer)
  }

  // Background clicks are contextual: districts go up to their state when that
  // parent state is unambiguous, while states go up to the country view.
  const handleBackgroundClick = () => {
    if (!backgroundClickTarget) return

    if (backgroundClickTarget.type === 'state') {
      void router.push({
        path: '/map',
        query: {
          ...route.query,
          state: backgroundClickTarget.stateName,
          district: undefined
        }
      })
      return
    }

    void router.push({
      path: '/map',
      query: {
        ...route.query,
        state: undefined,
        district: undefined
      }
    })
  }

  // Fit the viewport to a rendered Leaflet GeoJSON layer.
  const fitBoundaryLayer = (layer: L.GeoJSON) => {
    const bounds = layer.getBounds()

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40] })
    }
  }

  // Fit the viewport from raw state features when we do not want to render
  // those features, such as selected districts within one state.
  const fitBoundaryFeatures = (features: StateFeature[]) => {
    const bounds = L.geoJSON(features).getBounds()

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40] })
    }
  }

  // State views normally fit the district layer; Alaska gets a fixed viewport
  // because bounds fitting crosses the antimeridian awkwardly.
  const setStateViewport = (stateName: string, layer: L.GeoJSON) => {
    if (stateName === alaskaStateName) {
      setAlaskaViewport(map)
      return
    }

    fitBoundaryLayer(layer)
  }

  // Multi-district selections within one state use the state's outline only to
  // choose a viewport, not as a rendered background layer.
  const setStateBoundaryViewport = (stateBoundary: StateFeature) => {
    if (stateBoundary.properties.name === alaskaStateName) {
      setAlaskaViewport(map)
      return
    }

    fitBoundaryFeatures([stateBoundary])
  }

  // Single-district selections fit to the district, except Alaska's at-large
  // district gets the same stable Alaska viewport as the state.
  const setDistrictViewport = (feature: DistrictFeature | undefined, layer: L.GeoJSON) => {
    if (feature?.properties.stateName === alaskaStateName) {
      setAlaskaViewport(map)
      return
    }

    setFeatureViewport(map, feature, layer)
  }

  // Boundary styles come from settings, with mapViewport supplying the fallback.
  const getBoundaryStyle = (boundaryName: string) => findBoundaryStyle(leafSettings.boundaryStyles, boundaryName)

  // Defensive check: district selections need Census GEOIDs to become valid routes.
  const hasDistrictGeoid = (feature: DistrictFeature) => {
    return Boolean(feature.properties.geoid.trim())
  }

  // Census encodes at-large districts as zero; user-facing labels should say so.
  const formatDistrictCode = (districtCode: string) => {
    const districtNumber = Number(districtCode)

    return districtNumber > 0 ? String(districtNumber) : 'At Large'
  }

  // Tooltips in district maps should be short and scoped to the state.
  const formatDistrictTooltipLabel = (feature: DistrictFeature) => {
    return `${feature.properties.stateName} District ${formatDistrictCode(feature.properties.districtCode)}`
  }

  // Async district geometry can resolve after the user changes filters. This
  // stable key lets us discard stale responses before replacing the map layer.
  const selectionKey = (selection: ReturnType<typeof getBoundarySelection>) => {
    if (selection.type === 'state' || selection.type === 'district') {
      return `${selection.type}:${selection.id}`
    }

    if (selection.type === 'state-list' || selection.type === 'district-list') {
      return `${selection.type}:${selection.ids.join(',')}`
    }

    return selection.type
  }

  // Check whether the current route still matches the request that just resolved.
  const isCurrentSelection = (expectedSelectionKey: string) => {
    return selectionKey(getBoundarySelection(route.query, mapBoundaryQueryKeys)) === expectedSelectionKey
  }

  const createStateBoundaries = (features: StateFeature[], densityBuckets?: VendorDensityBucket[]) => {
    // State boundary layers render the broadest selectable geography. This
    // composable decides what a click should do in the app.
    return createBoundaryLayer({
      features,
      settings: leafSettings,
      getBoundaryStyle,
      getStyleKey: (feature) => feature.properties.name,
      getLabel: (feature) => feature.properties.name,
      getDetail: (feature) => `${vendorStore.stateVendorCount(feature.properties.name)} vendors`,
      getFillOpacity: densityBuckets
        ? (feature) => {
          const vendorCount = vendorStore.stateVendorCount(feature.properties.name)
          return findVendorDensityBucket(densityBuckets, vendorCount)?.fillOpacity ?? leafSettings.features.lightOpacity
        }
        : undefined,
      onFeatureClick: (feature) => router.push({
        path: '/map',
        query: {
          ...route.query,
          state: feature.properties.name,
          district: undefined
        }
      })
    })
  }

  const createDistrictBoundaries = (features: DistrictFeature[], densityBuckets?: VendorDensityBucket[]) => {
    const districtBoundaries = features.filter(hasDistrictGeoid)

    // District boundary layers receive app behavior through callbacks for the
    // same reason: the shared utility should not import router or stores directly.
    return createBoundaryLayer({
      features: districtBoundaries,
      settings: leafSettings,
      getBoundaryStyle,
      interactive: districtBoundaries.length > 1,
      getStyleKey: (feature) => feature.properties.stateName,
      getLabel: formatDistrictTooltipLabel,
      getDetail: (feature) => `${vendorStore.districtVendorCount(feature.properties.geoid) ?? 0} vendors`,
      getFillOpacity: densityBuckets
        ? (feature) => {
          const vendorCount = vendorStore.districtVendorCount(feature.properties.geoid) ?? 0
          return findVendorDensityBucket(densityBuckets, vendorCount)?.fillOpacity ?? leafSettings.features.lightOpacity
        }
        : undefined,
      onFeatureClick: (feature) => router.push({
        path: '/map',
        query: {
          ...route.query,
          state: undefined,
          district: feature.properties.geoid
        }
      })
    })
  }

  // State density buckets drive the country and selected-state heatmaps.
  const createStateDensityBuckets = (features: StateFeature[]) => {
    return createVendorDensityBuckets(features.map((feature) => {
      return vendorStore.stateVendorCount(feature.properties.name)
    }))
  }

  // District density buckets are always based on the currently visible or
  // selected district features.
  const createDistrictDensityBuckets = (features: DistrictFeature[]) => {
    return createVendorDensityBuckets(features.map((feature) => {
      return vendorStore.districtVendorCount(feature.properties.geoid) ?? 0
    }))
  }

  const renderMapSelection = async (query: LocationQuery, moveViewport = true) => {
    // Route watchers can run before async map data has loaded.
    if (!stateBoundaries.value) return

    const selection = getBoundarySelection(query, mapBoundaryQueryKeys)
    const currentSelectionKey = selectionKey(selection)

    // Synchronous state views can replace the layer immediately. District views
    // load geometry first, then verify the route before replacing anything.
    if (selection.type === 'none') {
      // Country view: shade every state by vendor count.
      backgroundClickTarget = null
      const densityBuckets = createStateDensityBuckets(stateBoundaries.value.features)

      setBoundaryLayer(createStateBoundaries(stateBoundaries.value.features, densityBuckets))
      if (moveViewport) {
        setDefaultViewport(map, leafSettings)
      }
      return
    }

    if (selection.type === 'state-list') {
      // Multi-state filter view: shade only selected states, but keep the
      // broad country viewport so users retain national context.
      backgroundClickTarget = { type: 'country' }
      const selectedStateBoundaries = stateBoundaries.value.features.filter((feature) => {
        return selection.ids.includes(feature.properties.name)
      })

      const densityBuckets = createStateDensityBuckets(selectedStateBoundaries)
      const stateBoundaryLayer = createStateBoundaries(selectedStateBoundaries, densityBuckets)

      setBoundaryLayer(stateBoundaryLayer)
      if (moveViewport) {
        setDefaultViewport(map, leafSettings)
      }
      return
    }

    if (selection.type === 'state') {
      // Single-state view: replace the state shape with all districts in that
      // state, shaded by district vendor count.
      backgroundClickTarget = { type: 'country' }
      const districtBoundaries = await loadDistrictBoundariesForStates([selection.id])
      if (!isCurrentSelection(currentSelectionKey)) return

      const selectedDistrictBoundaries = districtBoundaries.features.filter(hasDistrictGeoid)
      const densityBuckets = createDistrictDensityBuckets(selectedDistrictBoundaries)
      const districtBoundaryLayer = createDistrictBoundaries(selectedDistrictBoundaries, densityBuckets)

      setBoundaryLayer(districtBoundaryLayer)
      if (moveViewport) {
        setStateViewport(selection.id, districtBoundaryLayer)
      }
      return
    }

    if (selection.type === 'district-list') {
      // Selected-district view: render only selected districts. If they all
      // belong to one state, zoom to that state without drawing its fill.
      const districtBoundaries = await loadDistrictBoundariesForGeoids(selection.ids)
      if (!isCurrentSelection(currentSelectionKey)) return

      const selectedDistrictBoundaries = districtBoundaries.features.filter(hasDistrictGeoid)
      const firstDistrictBoundary = selectedDistrictBoundaries[0]
      const allDistrictBoundariesShareState = selectedDistrictBoundaries.every((feature) => {
        return feature.properties.stateName === firstDistrictBoundary?.properties.stateName
      })
      const selectedStateBoundary = firstDistrictBoundary
        ? stateBoundaries.value.features.find((feature) => {
          return feature.properties.name === firstDistrictBoundary.properties.stateName
        })
        : undefined
      backgroundClickTarget = allDistrictBoundariesShareState && firstDistrictBoundary
        ? { type: 'state', stateName: firstDistrictBoundary.properties.stateName }
        : { type: 'country' }
      const densityBuckets = createDistrictDensityBuckets(selectedDistrictBoundaries)
      const districtBoundaryLayer = createDistrictBoundaries(
        selectedDistrictBoundaries,
        densityBuckets
      )

      setBoundaryLayer(districtBoundaryLayer)

      if (allDistrictBoundariesShareState && selectedStateBoundary) {
        if (moveViewport) {
          setStateBoundaryViewport(selectedStateBoundary)
        }
        return
      }

      if (moveViewport) {
        setDefaultViewport(map, leafSettings)
      }
      return
    }

    // Single-district view: render one inert district and fit tightly to it.
    const districtBoundaries = await loadDistrictBoundariesForGeoids([selection.id])
    if (!isCurrentSelection(currentSelectionKey)) return

    const selectedDistrictBoundary = districtBoundaries.features[0]
    const selectedDistrictBoundaries = selectedDistrictBoundary ? [selectedDistrictBoundary] : []
    const districtBoundaryLayer = createDistrictBoundaries(selectedDistrictBoundaries)

    backgroundClickTarget = selectedDistrictBoundary
      ? { type: 'state', stateName: selectedDistrictBoundary.properties.stateName }
      : { type: 'country' }
    setBoundaryLayer(districtBoundaryLayer)
    if (moveViewport) {
      setDistrictViewport(selectedDistrictBoundary, districtBoundaryLayer)
    }
  }

  onMounted(async () => {
    initializeMap()
    // Load after Leaflet initializes so the first render can immediately add
    // the correct route-selected overlay.
    await loadStateBoundaries()
    renderMapSelection(route.query)
  })

  watch(() => route.query, (newQuery) => {
    // The URL is the source of truth for which geography is visible.
    void renderMapSelection(newQuery)
  })

  watch(() => vendorStore.filteredVendors, () => {
    // Service filters can change counts without changing the selected geography.
    void renderMapSelection(route.query, false)
  })

  onUnmounted(() => {
    // Leaflet attaches DOM/event handlers outside Vue, so remove them explicitly.
    clearBoundaryLayers()
    map?.remove()
  })

  return {
    isLoading
  }
}
