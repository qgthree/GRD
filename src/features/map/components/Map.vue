<script setup lang="ts">
import L from "leaflet";
import { watch, onMounted, onUnmounted } from "vue";
import "leaflet/dist/leaflet.css";
import { useVendorStore } from '@/stores/vendorStore';
import { useMapSettingsStore } from "@/stores/mapSettingsStore";
import { useRouter, useRoute } from "vue-router";
import type { LocationQuery } from "vue-router";
import type {
  CountryFeature,
  LeafSettings,
  RegionFeature
} from "@/features/map/types";
import { useMapData } from "@/features/map/composables/useMapData";
import { createBoundaryLayer } from "@/features/map/utils/mapLayers";
import { getBoundarySelection, mapBoundaryQueryKeys } from "@/features/map/utils/mapQuery";
import {
  findBoundaryStyle,
  setBoundaryViewport,
  setFeatureViewport,
  setDefaultViewport
} from "@/features/map/utils/mapViewport";
import {
  createVendorDensityBuckets,
  findVendorDensityBucket,
  type VendorDensityBucket
} from "@/features/map/utils/vendorDensity";

const router = useRouter();
const route = useRoute();
const vendorStore = useVendorStore();
const { leafSettings } = useMapSettingsStore() as { leafSettings: LeafSettings };
const {
  parentBoundaries,
  loadParentBoundaries,
  loadChildBoundariesForRegions,
  loadChildBoundariesForCountries
} = useMapData();

// Leaflet owns these objects outside Vue reactivity. Keeping them as plain
// variables avoids unnecessary proxying and makes cleanup direct.
let map: L.Map;
let boundaryLayerGroup: L.LayerGroup;

const initializeMap = () => {
  map = L.map("map", leafSettings.mapOptions);

  // The base tile layer is stable; route changes only swap the GeoJSON overlay.
  L.tileLayer(leafSettings.url, {
    id: 'cartodb voyager',
    minZoom: leafSettings.minZoom,
    maxZoom: leafSettings.maxZoom
  }).addTo(map);

  // All route-selected GeoJSON layers live in this group. Clearing the group is
  // more reliable than tracking individual layers during async route changes.
  boundaryLayerGroup = L.layerGroup().addTo(map);
};

const clearBoundaryLayers = () => {
  boundaryLayerGroup.clearLayers();
}

const setBoundaryLayer = (layer: L.GeoJSON) => {
  clearBoundaryLayers();
  boundaryLayerGroup.addLayer(layer);
}

const getBoundaryStyle = (boundaryName: string) => findBoundaryStyle(leafSettings.region, boundaryName);

// Some disputed GeoJSON claim areas have blank ISO codes. Excluding them keeps
// those shapes from becoming invalid routes like ?country=+.
const hasCountryCode = (feature: CountryFeature) => {
  return Boolean(feature.properties.ISO3.trim());
}

const selectionKey = (selection: ReturnType<typeof getBoundarySelection>) => {
  if (selection.type === 'parent' || selection.type === 'child') {
    return `${selection.type}:${selection.id}`
  }

  if (selection.type === 'parent-list' || selection.type === 'child-list') {
    return `${selection.type}:${selection.ids.join(',')}`
  }

  return selection.type
}

const isCurrentSelection = (expectedSelectionKey: string) => {
  return selectionKey(getBoundarySelection(route.query, mapBoundaryQueryKeys)) === expectedSelectionKey
}

const createParentBoundaries = (features: RegionFeature[]) => {
  // Parent boundary layers render the broadest selectable geography. This
  // component decides what a click should do in the app.
  return createBoundaryLayer({
    features,
    settings: leafSettings,
    map,
    getBoundaryStyle,
    getStyleKey: (feature) => feature.properties.BHA_REGION,
    getLabel: (feature) => feature.properties.BHA_REGION,
    getDetail: (feature) => `${vendorStore.regionVendorCount(feature.properties.BHA_REGION)} vendors`,
    getHoverGroupKey: (feature) => feature.properties.BHA_REGION,
    onFeatureClick: (feature) => router.push({
      path: '/map',
      query: {
        ...route.query,
        region: feature.properties.BHA_REGION,
        country: undefined
      }
    })
  })
}

const createChildBoundaries = (features: CountryFeature[], densityBuckets?: VendorDensityBucket[]) => {
  const childBoundaries = features.filter(hasCountryCode)

  // Child boundary layers receive app behavior through callbacks for the same
  // reason: the utility should not import router or stores directly.
  return createBoundaryLayer({
    features: childBoundaries,
    settings: leafSettings,
    getBoundaryStyle,
    interactive: childBoundaries.length > 1,
    getStyleKey: (feature) => feature.properties.BHA_Reg,
    getLabel: (feature) => feature.properties.USG_Name,
    getDetail: (feature) => `${vendorStore.countryVendorCount(feature.properties.ISO3) ?? 0} vendors`,
    // Single-region views pass density buckets so country fills become a
    // simple vendor-presence heatmap. Other country views use the base fill.
    getFillOpacity: densityBuckets
      ? (feature) => {
        const vendorCount = vendorStore.countryVendorCount(feature.properties.ISO3) ?? 0
        return findVendorDensityBucket(densityBuckets, vendorCount)?.fillOpacity ?? leafSettings.features.lightOpacity
      }
      : undefined,
    onFeatureClick: (feature) => router.push({
      path: '/map',
      query: {
        ...route.query,
        region: undefined,
        country: feature.properties.ISO3
      }
    })
  })
}

const renderMapSelection = async (query: LocationQuery, moveViewport = true) => {
  // Route watchers can run before async map data has loaded.
  if (!parentBoundaries.value) return;

  const selection = getBoundarySelection(query, mapBoundaryQueryKeys);
  const currentSelectionKey = selectionKey(selection);

  // Synchronous region views can replace the layer immediately. Country views
  // load geometry first, then verify the route before replacing anything.
  if (selection.type === 'none') {
    // No URL selection means the user sees all parent boundaries.
    setBoundaryLayer(createParentBoundaries(parentBoundaries.value.features));
    if (moveViewport) {
      setDefaultViewport(map, leafSettings);
    }
    return;
  }

  if (selection.type === 'parent-list') {
    // Multiple selected parent boundaries still use the broad map view.
    const selectedParentBoundaries = parentBoundaries.value.features.filter((feature) => {
      return selection.ids.includes(feature.properties.BHA_REGION);
    })

    setBoundaryLayer(createParentBoundaries(selectedParentBoundaries));
    if (moveViewport) {
      setDefaultViewport(map, leafSettings);
    }
    return;
  }

  if (selection.type === 'parent') {
    // One selected parent boundary drills into its child boundaries.
    const childBoundaries = await loadChildBoundariesForRegions([selection.id])
    // Lazy child-boundary requests can finish after the user has already
    // navigated back out. In that case, keep the newer route's layer intact.
    if (!isCurrentSelection(currentSelectionKey)) return

    const selectedChildBoundaries = childBoundaries.features.filter(hasCountryCode)
    // Build density from the currently filtered vendor counts so service
    // filters are reflected in both the country fills and the legend.
    const densityBuckets = createVendorDensityBuckets(selectedChildBoundaries.map((feature) => {
      return vendorStore.countryVendorCount(feature.properties.ISO3) ?? 0
    }))

    setBoundaryLayer(createChildBoundaries(selectedChildBoundaries, densityBuckets));
    if (moveViewport) {
      setBoundaryViewport(map, getBoundaryStyle(selection.id), leafSettings);
    }
    return;
  }

  if (selection.type === 'child-list') {
    // Multiple selected child boundaries show child shapes. If they are all in
    // one parent boundary, zoom to that parent; otherwise use the broad view.
    const childBoundaries = await loadChildBoundariesForCountries(selection.ids)
    if (!isCurrentSelection(currentSelectionKey)) return

    const selectedChildBoundaries = childBoundaries.features

    setBoundaryLayer(createChildBoundaries(selectedChildBoundaries));

    const firstChildBoundary = selectedChildBoundaries[0];
    const allChildBoundariesShareParent = selectedChildBoundaries.every((feature) => {
      return feature.properties.BHA_Reg === firstChildBoundary?.properties.BHA_Reg;
    })

    if (firstChildBoundary && allChildBoundariesShareParent) {
      if (moveViewport) {
        setBoundaryViewport(map, getBoundaryStyle(firstChildBoundary.properties.BHA_Reg), leafSettings);
      }
      return;
    }

    if (moveViewport) {
      setDefaultViewport(map, leafSettings);
    }
    return;
  }

  // One selected child boundary becomes a one-item array for layer creation,
  // then uses its bounds/centroid for the viewport.
  const childBoundaries = await loadChildBoundariesForCountries([selection.id])
  if (!isCurrentSelection(currentSelectionKey)) return

  const selectedChildBoundary = childBoundaries.features[0]
  const selectedChildBoundaries = selectedChildBoundary ? [selectedChildBoundary] : [];
  const childBoundaryLayer = createChildBoundaries(selectedChildBoundaries);

  setBoundaryLayer(childBoundaryLayer);
  if (moveViewport) {
    setFeatureViewport(map, selectedChildBoundary, childBoundaryLayer);
  }
}

onMounted(async () => {
  initializeMap();
  // Load after Leaflet initializes so the first render can immediately add the
  // correct route-selected overlay.
  await loadParentBoundaries();
  renderMapSelection(route.query);
});

watch(() => route.query, (newQuery) => {
  // The URL is the source of truth for which geography is visible.
  void renderMapSelection(newQuery);
});

watch(() => vendorStore.filteredVendors, () => {
  // Service filters can change counts without changing the selected geography.
  void renderMapSelection(route.query, false);
});

onUnmounted(() => {
  // Leaflet attaches DOM/event handlers outside Vue, so remove them explicitly.
  clearBoundaryLayers();
  map.remove();
});
</script>

<template>
  <div id="map">
  </div>
</template>

<style>
#map {
  height: 100%;
  width: 100%;
}
.leaflet-control-attribution {
  display: none;
}

/* Update leaflet tooltip styles (QG) */

.leaflet-tooltip {
	background-color: #fff7e6;
	color: #1a0033;
	letter-spacing: 1.3px;
	font-weight: 400;
	line-height: 1.4;
	font-size: 10px;
	text-transform: uppercase;
	border-radius: 16px;
	padding: 8px 12px;
	box-shadow: 0 0 32px -10px rgba(0, 0, 0, .59);
  border-color: #fff7e6;
}

.leaflet-tooltip-top:before {
	border-top-color: #fff7e6;
}

.leaflet-tooltip-bottom:before {
	border-bottom-color: #fff7e6;
}

.leaflet-tooltip-left:before {
	border-left-color: #fff7e6;
}

.leaflet-tooltip-right:before {
	border-right-color: #fff7e6;
}

.tip-title {
  font-weight: 500;
}
</style>
