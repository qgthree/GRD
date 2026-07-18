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
import { getBoundarySelection } from "@/features/map/utils/mapQuery";
import {
  findBoundaryStyle,
  setBoundaryViewport,
  setFeatureViewport,
  setDefaultViewport
} from "@/features/map/utils/mapViewport";

const router = useRouter();
const route = useRoute();
const vendorStore = useVendorStore();
const { leafSettings } = useMapSettingsStore() as { leafSettings: LeafSettings };
const { data: mapData, loadMapData } = useMapData();
const boundaryQueryKeys = {
  parentKey: 'region',
  childKey: 'country'
};

// Leaflet owns these objects outside Vue reactivity. Keeping them as plain
// variables avoids unnecessary proxying and makes cleanup direct.
let map: L.Map;
let activeLayer: L.GeoJSON | null = null;

const initializeMap = () => {
  map = L.map("map", leafSettings.mapOptions);

  // The base tile layer is stable; route changes only swap the GeoJSON overlay.
  L.tileLayer(leafSettings.url, {
    id: 'cartodb voyager',
    minZoom: leafSettings.minZoom,
    maxZoom: leafSettings.maxZoom
  }).addTo(map);
};

const removeActiveLayer = () => {
  if (!activeLayer) return;

  // Remove the previous GeoJSON overlay before drawing the next selection.
  map.removeLayer(activeLayer);
  activeLayer = null;
}

const setActiveLayer = (layer: L.GeoJSON) => {
  // Track one active overlay so route changes can replace it cleanly.
  activeLayer = layer;
  activeLayer.addTo(map);
}

const getBoundaryStyle = (boundaryName: string) => findBoundaryStyle(leafSettings.region, boundaryName);

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
      query: { region: feature.properties.BHA_REGION }
    })
  })
}

const createChildBoundaries = (features: CountryFeature[]) => {
  // Child boundary layers receive app behavior through callbacks for the same
  // reason: the utility should not import router or stores directly.
  return createBoundaryLayer({
    features,
    settings: leafSettings,
    getBoundaryStyle,
    interactive: features.length > 1,
    getStyleKey: (feature) => feature.properties.BHA_Reg,
    getLabel: (feature) => feature.properties.USG_Name,
    getDetail: (feature) => `${vendorStore.countryVendorCount(feature.properties.ISO3) ?? 0} vendors`,
    onFeatureClick: (feature) => router.push({
      path: '/map',
      query: { country: feature.properties.ISO3 }
    })
  })
}

const renderMapSelection = (query: LocationQuery) => {
  // Route watchers can run before async map data has loaded.
  if (!mapData.value) return;

  const selection = getBoundarySelection(query, boundaryQueryKeys);

  removeActiveLayer();

  if (selection.type === 'none') {
    // No URL selection means the user sees all parent boundaries.
    setActiveLayer(createParentBoundaries(mapData.value.parentBoundaries.features));
    setDefaultViewport(map, leafSettings);
    return;
  }

  if (selection.type === 'parent-list') {
    // Multiple selected parent boundaries still use the broad map view.
    const selectedParentBoundaries = mapData.value.parentBoundaries.features.filter((feature) => {
      return selection.ids.includes(feature.properties.BHA_REGION);
    })

    setActiveLayer(createParentBoundaries(selectedParentBoundaries));
    setDefaultViewport(map, leafSettings);
    return;
  }

  if (selection.type === 'parent') {
    // One selected parent boundary drills into its child boundaries.
    const selectedChildBoundaries = mapData.value.childBoundaries.features.filter((feature) => {
      return feature.properties.BHA_Reg === selection.id;
    })

    setActiveLayer(createChildBoundaries(selectedChildBoundaries));
    setBoundaryViewport(map, getBoundaryStyle(selection.id), leafSettings);
    return;
  }

  if (selection.type === 'child-list') {
    // Multiple selected child boundaries show child shapes. If they are all in
    // one parent boundary, zoom to that parent; otherwise use the broad view.
    const selectedChildBoundaries = mapData.value.childBoundaries.features.filter((feature) => {
      return selection.ids.includes(feature.properties.ISO3);
    })

    setActiveLayer(createChildBoundaries(selectedChildBoundaries));

    const firstChildBoundary = selectedChildBoundaries[0];
    const allChildBoundariesShareParent = selectedChildBoundaries.every((feature) => {
      return feature.properties.BHA_Reg === firstChildBoundary?.properties.BHA_Reg;
    })

    if (firstChildBoundary && allChildBoundariesShareParent) {
      setBoundaryViewport(map, getBoundaryStyle(firstChildBoundary.properties.BHA_Reg), leafSettings);
      return;
    }

    setDefaultViewport(map, leafSettings);
    return;
  }

  // One selected child boundary becomes a one-item array for layer creation,
  // then uses its bounds/centroid for the viewport.
  const selectedChildBoundary = mapData.value.childBoundaries.features.find((feature) => {
    return feature.properties.ISO3 === selection.id;
  })
  const selectedChildBoundaries = selectedChildBoundary ? [selectedChildBoundary] : [];
  const childBoundaryLayer = createChildBoundaries(selectedChildBoundaries);

  setActiveLayer(childBoundaryLayer);
  setFeatureViewport(map, selectedChildBoundary, childBoundaryLayer);
}

onMounted(async () => {
  initializeMap();
  // Load after Leaflet initializes so the first render can immediately add the
  // correct route-selected overlay.
  await loadMapData();
  renderMapSelection(route.query);
});

watch(() => route.query, (newQuery) => {
  // The URL is the source of truth for which geography is visible.
  renderMapSelection(newQuery);
});

watch(() => vendorStore.filteredVendors, () => {
  // Service filters can change counts without changing the selected geography.
  renderMapSelection(route.query);
});

onUnmounted(() => {
  // Leaflet attaches DOM/event handlers outside Vue, so remove them explicitly.
  removeActiveLayer();
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
