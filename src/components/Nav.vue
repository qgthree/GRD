<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from "vue-router";
import ResizeTransition from '@/components/ResizeTransition.vue';
import { useVendorStore } from '@/stores/vendorStore';
import { useFiltersStore } from '@/stores/filtersStore';
import { useLocationStore } from '@/stores/locationStore';
import { compactFilterQueryUpdates, hasActiveFilterQuery, selectedFilterQueryValues } from '@/utils/query';
import { sortDistricts } from '@/features/locations/utils/districtSorting';
import {
  selectedDistrictGeoidsFromQuery,
  selectedStateNamesFromQuery
} from '@/features/locations/utils/locationQuery';
import { loadNaicsTitleMap } from '@/features/naics/api/naicsDataSource';
import home0 from "@/assets/images/home_FILL0.svg";
import home1 from "@/assets/images/home_FILL1.svg";
import filters0 from "@/assets/images/filters_FILL0.svg";
import filters1 from "@/assets/images/filters_FILL1.svg";
import close from "@/assets/images/close.svg";

const route = useRoute();
const router = useRouter();
const vendorStore = useVendorStore();
const filtersStore = useFiltersStore();
const locationStore = useLocationStore();

const hasActiveFilters = computed(() => {
  return hasActiveFilterQuery(route.query);
});

const formatSummary = (items: string[], fallback: string, conjunction = 'and') => {
  if (!items.length) return fallback;
  if (items.length === 1) return items[0];

  if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`;

  return `${items.slice(0, -1).join(', ')}, ${conjunction} ${items.at(-1)}`;
}

const quoteSummaryItems = (items: string[]) => items.map((item) => `"${item}"`)

const selectedStates = computed(() => selectedStateNamesFromQuery(route.query, locationStore.states));
const selectedDistricts = computed(() => selectedDistrictGeoidsFromQuery(route.query, locationStore.districts));
const selectedServices = computed(() => selectedFilterQueryValues(route.query, 'services'));
const excludedServices = computed(() => selectedFilterQueryValues(route.query, 'servicesExclude'));
const selectedSectorTitles = ref<string[]>([]);
const hasLocationFilters = computed(() => selectedStates.value.length > 0 || selectedDistricts.value.length > 0);
const hasSectorFilters = computed(() => selectedServices.value.length > 0 || excludedServices.value.length > 0);
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

const sectorSummary = computed(() => formatSummary(quoteSummaryItems(selectedSectorTitles.value), 'any sector'));

watch(selectedServices, async (services) => {
  if (!services.length) {
    selectedSectorTitles.value = [];
    return;
  }

  const requestedServices = services.join(',');
  const titleMap = await loadNaicsTitleMap(services);

  // Route changes can happen while the async catalog import is in flight. Only
  // apply titles if they still describe the current URL selection.
  if (requestedServices !== selectedServices.value.join(',')) return;

  selectedSectorTitles.value = services.map((service) => titleMap.get(service) ?? service);
}, { immediate: true });

const toggleVendors = () => {
  vendorStore.toggleVendors()
}

const openSectorFilters = () => {
  filtersStore.toggleFiltersView('sector')
}

const openLocationFilters = () => {
  filtersStore.toggleFiltersView('location')
}

const clearLocationFilters = () => {
  void router.push({
    query: {
      ...route.query,
      ...compactFilterQueryUpdates({
        state: undefined,
        district: undefined
      })
    }
  })
}

const clearSectorFilters = () => {
  void router.push({
    query: {
      ...route.query,
      ...compactFilterQueryUpdates({
        services: undefined,
        servicesExclude: undefined
      })
    }
  })
}
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
          <span
            class="nav_text_action"
            role="button"
            tabindex="0"
            @click="toggleVendors"
            @keydown.enter.prevent="toggleVendors"
            @keydown.space.prevent="toggleVendors">
            Vendors
          </span>
          <span class="nav_connector"> for </span>
          <span
            class="nav_text_action"
            role="button"
            tabindex="0"
            @click="openSectorFilters"
            @keydown.enter.prevent="openSectorFilters"
            @keydown.space.prevent="openSectorFilters">
            {{ sectorSummary }}
          </span>
          <button
            v-if="hasSectorFilters"
            class="nav_clear_filter"
            type="button"
            aria-label="Clear sector filter"
            @click="clearSectorFilters">
            <img :src="close" alt="" />
          </button>
          <span class="nav_connector"> across </span>
          <span
            class="nav_text_action"
            role="button"
            tabindex="0"
            @click="openLocationFilters"
            @keydown.enter.prevent="openLocationFilters"
            @keydown.space.prevent="openLocationFilters">
            {{ locationSummary }}
          </span>
          <button
            v-if="hasLocationFilters"
            class="nav_clear_filter"
            type="button"
            aria-label="Clear location filter"
            @click="clearLocationFilters">
            <img :src="close" alt="" />
          </button>
        </div>
        <button class="nav_img" type="button" aria-label="Open filters" @click="openSectorFilters">
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
  grid-template-columns: 54px minmax(0, 1fr) 54px;
  align-items: center;
  width: max-content;
  max-width: min(850px, calc(100vw - 60px));
}
.nav_shell {
  border-radius: 6px;
  background-color: #fff;
  color: #1f1f1f;
  font-size: 20px;
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
  height: 56px;
  padding: 16px 0px;
  width: 54px;
  background: transparent;
  cursor: pointer;
}
.nav_img img {
  width: 24px;
  height: 24px;
  filter: brightness(0) saturate(100%) invert(11%) sepia(1%) saturate(0%) hue-rotate(319deg) brightness(94%) contrast(90%);
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
  min-width: 0;
  padding: 15px 10px;
  margin: 0px;
  line-height: 1.25;
  overflow-wrap: anywhere;
}
.nav_text_action {
  display: inline;
  color: var(--color-purple);
  cursor: pointer;
}
.nav_text_action:focus-visible {
  outline: 2px solid var(--color-purple);
  outline-offset: 2px;
}
.nav_connector {
  color: rgba(0, 0, 0, 0.5);
}
@media (hover: hover) and (pointer: fine) {
  .nav_text_action:hover {
    text-decoration: underline;
  }
}
.nav_clear_filter {
  appearance: none;
  position: relative;
  border: 0;
  display: inline-block;
  width: 18px;
  height: 18px;
  margin-left: 5px;
  border-radius: 999px;
  background: #dedee1;
  color: #1f1f1f;
  cursor: pointer;
  font: inherit;
  font-size: 12px;
  line-height: 18px;
  vertical-align: -3px;
}
.nav_clear_filter img {
  position: absolute;
  top: 50%;
  left: 50%;
  display: block;
  width: 16px;
  height: 16px;
  transform: translate(-50%, -50%);
  filter: brightness(0) saturate(100%) invert(11%) sepia(1%) saturate(0%) hue-rotate(319deg) brightness(94%) contrast(90%);
}
</style>
