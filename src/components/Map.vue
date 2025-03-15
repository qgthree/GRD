<script setup>
import L from "leaflet";
import { watch, onMounted, ref } from "vue";
import "leaflet/dist/leaflet.css";
import regionData from "@/assets/data/regions.json";
import countryData from "@/assets/data/admin0.json";
import { useVendorStore } from '@/stores/vendorStore';
import { useMapSettingsStore } from "@/stores/mapSettingsStore";
import { useRouter, useRoute } from "vue-router";

// vue variables
const router = useRouter(); // Import the router
const route = useRoute(); // Import the route

// pinia data
const vendorStore = useVendorStore();
const { leafSettings } = useMapSettingsStore();

// Map Variables
let map = ref(null); // Reference to the map at the setup level
let shapes;
let countryFeatures;
let region = (reg) => { return leafSettings.region.find((item) => item.name == reg) };
let regions;
let countries;

// ----------------- Map Initialization -----------------
const initializeMap = () => {
  // Setting initial zoom and positioning of the map
  map = L.map("map", leafSettings.mapOptions);

  // Adding map layer and zoom settings
  L.tileLayer(leafSettings.url, {
    id: 'cartodb voyager',
    minZoom: leafSettings.minZoom,
    maxZoom: leafSettings.maxZoom
  }).addTo(map);
};

// Highlight a given region
const highlightArea = (area, mapInstance) => {
  mapInstance.eachLayer((layer) => {
    if (layer.feature && layer.feature.properties.BHA_REGION === area) {
      layer.setStyle({
        fillOpacity: leafSettings.features.mediumOpacity
      });
    }
  });
};

// Reset highlight of a given region
const resetHighlight = (area, mapInstance) => {
  mapInstance.eachLayer((layer) => {
    if (layer.feature && layer.feature.properties.BHA_REGION === area) {
      layer.setStyle({
        fillOpacity: leafSettings.features.lightOpacity
      });
    }
  });
};

// Layer settings for region views
const regionLayer = (features) => {
  return L.geoJSON(features, {
    style: (feature) => ({
      color: region(feature.properties.BHA_REGION).color,
      weight: 0.8,
      opacity: leafSettings.features.mediumOpacity,
      fillColor: region(feature.properties.BHA_REGION).color,
      fillOpacity: leafSettings.features.lightOpacity
    }),
    onEachFeature: (feature, layer) => {
      if (vendorStore.filteredVendors && !vendorStore.loading) {
        layer.bindTooltip('<span class="tip-title">' + feature.properties.BHA_REGION + '</span><br /><span>' + vendorStore.regionVendorCount(feature.properties.BHA_REGION) + ' vendors' + '</span>');
      }
      // Highlighting when a user hovers over a region
      layer.on("mouseover", (e) => {
        highlightArea(feature.properties.BHA_REGION, map);
      });

      layer.on("mouseout", (e) => {
        resetHighlight(feature.properties.BHA_REGION, map);
      });

      layer.on("click", (e) => {
        resetHighlight(feature.properties.BHA_REGION, map);
        router.push({
          path: '/map',
          query: { region: feature.properties.BHA_REGION }
        });
      });
    }
  });
};

// Layer Settings for country views
const countryLayer = (features) => {
  return L.geoJSON(features, {
    style: (feature) => ({
      color: region(feature.properties.BHA_Reg).color,
      weight: 0.8,
      opacity: leafSettings.features.mediumOpacity,
      fillColor: region(feature.properties.BHA_Reg).color,
      fillOpacity: leafSettings.features.lightOpacity
    }),
    onEachFeature: (feature, layer) => {
      layer.bindTooltip('<span class="tip-title">' + feature.properties.USG_Name + '</span>');
      layer.bindTooltip('<span class="tip-title">' + feature.properties.USG_Name + '</span><br /><span>' + vendorStore.countryVendorCount(feature.properties.ISO3) + ' vendors' + '</span>');
      if (features[1]) {
        layer.on("mouseover", (e) => {
          layer.setStyle({fillOpacity: leafSettings.features.heavyOpacity});
        });

        layer.on("mouseout", (e) => {
          layer.setStyle({fillOpacity: leafSettings.features.lightOpacity});
        });

        layer.on("click", (e) => {
          layer.setStyle({fillOpacity: leafSettings.features.lightOpacity});
          router.push({
            path: '/map',
            query: { country: feature.properties.ISO3 }
          });
        });
      }
    }
  });
};

// function to update map layers, center, and zoom
const updateMap = (query) => {
  // map is set to home
  if (!query || query && !query.region && !query.country) {
    shapes = regionLayer(regionData.features);
    map.setView(leafSettings.mapCenter, leafSettings.mapZoom);
  }
  // two or more regions are selected
  else if (query.region && query.region.includes(",")) {
    regions = regionData.features.filter((feature) => query.region.includes(feature.properties.BHA_REGION));
    shapes = regionLayer(regions);
    map.setView(leafSettings.mapCenter, leafSettings.mapZoom);
  }
  // a single region is selected
  else if (query.region) {
    countryFeatures = countryData.features.filter((feature) => feature.properties.BHA_Reg == query.region);
    shapes = countryLayer(countryFeatures);
    map.setView(region(query.region).center, region(query.region).zoom);
  }
  // multiple countries are selected
  else if (query.country && query.country.includes(",")) {
    countries = countryData.features.filter((feature) => query.country.includes(feature.properties.ISO3));
    shapes = countryLayer(countries);
    if ((countries.every((feature) => feature.properties.BHA_Reg === countries[0].properties.BHA_Reg))) {
      map.setView(region(countries[0].properties.BHA_Reg).center, region(countries[0].properties.BHA_Reg).zoom);
    }
    else {
      map.setView(leafSettings.mapCenter, leafSettings.mapZoom);
    }
  }
  // a single country is selected
  else if (query.country) {
    countries = countryData.features.find((feature) => feature.properties.ISO3 === query.country);
    shapes = countryLayer(countries);
    const zoom = map.getBoundsZoom(shapes.getBounds(), false, [200,200]);
    map.setView([countries.properties.LAT_CENT, countries.properties.LONG_CENT], zoom);
  }

  shapes.addTo(map);
};

// Perform when component is first mounted
onMounted(() => {
  initializeMap();
  updateMap(route.query);
});

// Perform when route changes
watch(() => route.query, (newQuery, oldQuery) => {
  // remove current shape layer
  if (shapes) { map.removeLayer(shapes) }
  // update map view
  updateMap(newQuery);
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



