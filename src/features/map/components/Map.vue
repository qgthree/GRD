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
import { createCountryLayer, createRegionLayer } from "@/features/map/utils/mapLayers";
import { getMapSelection } from "@/features/map/utils/mapQuery";
import {
  findRegionSetting,
  setCountryViewport,
  setDefaultViewport,
  setRegionViewport
} from "@/features/map/utils/mapViewport";

const router = useRouter();
const route = useRoute();
const vendorStore = useVendorStore();
const { leafSettings } = useMapSettingsStore() as { leafSettings: LeafSettings };
const { data: mapData, loadMapData } = useMapData();

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

const getRegion = (regionName: string) => findRegionSetting(leafSettings.region, regionName);

const createRegions = (features: RegionFeature[]) => {
  // Region layers know how to render regions, while this component decides what
  // a click should do in the app.
  return createRegionLayer({
    features,
    map,
    settings: leafSettings,
    getRegion,
    getVendorCount: (regionName) => vendorStore.regionVendorCount(regionName),
    onRegionClick: (regionName) => router.push({ path: '/map', query: { region: regionName } })
  })
}

const createCountries = (features: CountryFeature[]) => {
  // Country layers receive app behavior through callbacks for the same reason:
  // the utility should not import router or stores directly.
  return createCountryLayer({
    features,
    settings: leafSettings,
    getRegion,
    getVendorCount: (countryCode) => vendorStore.countryVendorCount(countryCode),
    onCountryClick: (countryCode) => router.push({ path: '/map', query: { country: countryCode } })
  })
}

const renderMapSelection = (query: LocationQuery) => {
  // Route watchers can run before async map data has loaded.
  if (!mapData.value) return;

  const selection = getMapSelection(query);

  removeActiveLayer();

  if (selection.type === 'home') {
    // No URL selection means the user sees all BHA regions.
    setActiveLayer(createRegions(mapData.value.regions.features));
    setDefaultViewport(map, leafSettings);
    return;
  }

  if (selection.type === 'regions') {
    // Multiple selected regions still use region shapes and the broad map view.
    const selectedRegions = mapData.value.regions.features.filter((feature) => {
      return selection.regionNames.includes(feature.properties.BHA_REGION);
    })

    setActiveLayer(createRegions(selectedRegions));
    setDefaultViewport(map, leafSettings);
    return;
  }

  if (selection.type === 'region') {
    // One selected region drills into the countries inside that region.
    const selectedCountries = mapData.value.countries.features.filter((feature) => {
      return feature.properties.BHA_Reg === selection.regionName;
    })

    setActiveLayer(createCountries(selectedCountries));
    setRegionViewport(map, getRegion(selection.regionName), leafSettings);
    return;
  }

  if (selection.type === 'countries') {
    // Multiple selected countries show country shapes. If they are all in one
    // region, zoom to that region; otherwise return to the broad map view.
    const selectedCountries = mapData.value.countries.features.filter((feature) => {
      return selection.countryCodes.includes(feature.properties.ISO3);
    })

    setActiveLayer(createCountries(selectedCountries));

    const firstCountry = selectedCountries[0];
    const allCountriesShareRegion = selectedCountries.every((feature) => {
      return feature.properties.BHA_Reg === firstCountry?.properties.BHA_Reg;
    })

    if (firstCountry && allCountriesShareRegion) {
      setRegionViewport(map, getRegion(firstCountry.properties.BHA_Reg), leafSettings);
      return;
    }

    setDefaultViewport(map, leafSettings);
    return;
  }

  // One selected country becomes a one-item array for layer creation, then uses
  // the specific country's bounds/centroid for the viewport.
  const selectedCountry = mapData.value.countries.features.find((feature) => {
    return feature.properties.ISO3 === selection.countryCode;
  })
  const selectedCountries = selectedCountry ? [selectedCountry] : [];
  const countryLayer = createCountries(selectedCountries);

  setActiveLayer(countryLayer);
  setCountryViewport(map, selectedCountry, countryLayer);
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
