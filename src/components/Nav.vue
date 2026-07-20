<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from "vue-router";
import ResizeTransition from '@/components/ResizeTransition.vue';
import { useVendorStore } from '@/stores/vendorStore';
import { useFiltersStore } from '@/stores/filtersStore';
import { useLocationStore } from '@/stores/locationStore';
import { hasActiveFilterQuery, selectedFilterQueryValues } from '@/utils/query';
import { sortDistricts } from '@/features/locations/utils/districtSorting';
import {
  selectedDistrictGeoidsFromQuery,
  selectedStateNamesFromQuery
} from '@/features/locations/utils/locationQuery';
import { getNaicsLabel } from '@/features/naics/utils/naicsCodes';
import home0 from "@/assets/images/home_FILL0.svg";
import home1 from "@/assets/images/home_FILL1.svg";
import filters0 from "@/assets/images/filters_FILL0.svg";
import filters1 from "@/assets/images/filters_FILL1.svg";

const route = useRoute();
const vendorStore = useVendorStore();
const filtersStore = useFiltersStore();
const locationStore = useLocationStore();

const hasActiveFilters = computed(() => {
  return hasActiveFilterQuery(route.query);
});

const formatSummary = (items: string[], fallback: string) => {
  if (!items.length) return fallback;
  if (items.length === 1) return items[0];

  return `${items.slice(0, -1).join(', ')} or ${items.at(-1)}`;
}

const selectedStates = computed(() => selectedStateNamesFromQuery(route.query, locationStore.states));
const selectedDistricts = computed(() => selectedDistrictGeoidsFromQuery(route.query, locationStore.districts));
const selectedServices = computed(() => selectedFilterQueryValues(route.query, 'services'));
const formatDistrictCode = (districtCode: string) => {
  const districtNumber = Number(districtCode)

  return districtNumber > 0 ? String(districtNumber) : 'AL'
}
const selectedDistrictLabels = computed(() => {
  const selectedDistrictGeoids = new Set(selectedDistricts.value)
  const districts = sortDistricts(locationStore.districts.filter((district) => selectedDistrictGeoids.has(district.geoid)))
  const districtLabels = districts.map((district) => {
    return `${district.stateAbbreviation}-${formatDistrictCode(district.districtCode)}`
  })
  const knownDistrictGeoids = new Set(districts.map((district) => district.geoid))
  const unknownDistrictLabels = selectedDistricts.value.filter((geoid) => !knownDistrictGeoids.has(geoid))

  return [...districtLabels, ...unknownDistrictLabels]
});

const locationSummary = computed(() => {
  const selectedLocations = selectedStates.value.length
    ? selectedStates.value
    : selectedDistrictLabels.value;

  return formatSummary(selectedLocations, 'any location');
});

const sectorSummary = computed(() => {
  return formatSummary(selectedServices.value.map(getNaicsLabel), 'any sector');
});
</script>

<template>
  <div class="nav_container">
    <ResizeTransition class="nav_shell" axis="both" :duration="150">
      <nav>
        <div class="nav_img" v-if="!hasActiveFilters" aria-hidden="true">
          <img :src="home1" alt="" />
        </div>
        <router-link class="nav_img" to="/map" aria-label="Clear filters" v-else>
          <img data-fill="0" :src="home0" alt="" />
          <img data-fill="1" :src="home1" alt="" />
        </router-link>
        <div class="nav_details">
          <button class="nav_text_button" type="button" @click="vendorStore.toggleVendors()">Vendors</button>
          <span> serving </span>
          <button class="nav_text_button" type="button" @click="filtersStore.toggleFiltersView('location')">
            {{ locationSummary }}
          </button>
          <span> in </span>
          <button class="nav_text_button" type="button" @click="filtersStore.toggleFiltersView('sector')">
            {{ sectorSummary }}
          </button>
        </div>
        <button class="nav_img" type="button" aria-label="Open filters" @click="filtersStore.toggleFiltersView('location')">
          <img data-fill="0" :src="filters0" alt="" />
          <img data-fill="1" :src="filters1" alt="" />
        </button>
      </nav>
    </ResizeTransition>
  </div>
</template>

<style scoped>
.nav_container {
  width: 100%;
  display: grid;
  grid-gap: 30px;
  justify-items: center;
  position: fixed;
  top: 30px;
  z-index: 1000;
}
nav {
  display: grid;
  grid-template-columns: 50px max-content 50px;
  align-items: center;
  width: fit-content;
  max-width: calc(100vw - 40px);
}
.nav_shell {
  border-radius: 6px;
  max-width: calc(100vw - 40px);
  background-color: #002F6C;
  color: #fff;
  font-size: 18px;
  font-weight: 400;
  z-index: 500;
  text-align: center;
  box-shadow: 0px 3px 17px -10px rgba(0,0,0,0.75);
}
.nav_img {
  appearance: none;
  border: 0;
  display: flex;
  justify-content: center;
  height: 52px;
  padding: 16px 0px;
  width: 50px;
  background: transparent;
  cursor: pointer;
}
.nav_img img[data-fill="0"],
.nav_img:hover > img[data-fill="1"] {
  display: block;
}
.nav_img img[data-fill="1"],
.nav_img:hover > img[data-fill="0"] {
  display: none;
}
.nav_details {
  display: block;
  width: max-content;
  max-width: calc(100vw - 140px);
  padding: 15px 10px;
  margin: 0px;
}
.nav_text_button {
  appearance: none;
  border: 0;
  padding: 0;
  background: transparent;
  color: #fff;
  font: inherit;
  text-decoration: underline;
  cursor: pointer;
}
</style>
