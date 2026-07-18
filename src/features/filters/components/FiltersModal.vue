<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useFiltersStore } from '@/stores/filtersStore';
import { useLocationStore } from '@/stores/locationStore';
import { useMapSettingsStore } from '@/stores/mapSettingsStore';
import { useVendorStore } from '@/stores/vendorStore';
import close from "@/assets/images/close.svg";
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import FilterTypeSelector from '@/features/filters/components/FilterTypeSelector.vue'

type LocationFilterMode = 'region' | 'country'

const route = useRoute();
const router = useRouter();
const filtersStore = useFiltersStore();
const locationStore = useLocationStore();
const vendorStore = useVendorStore();
const { leafSettings } = useMapSettingsStore();
const locationMode = ref<LocationFilterMode>(route.query.country ? 'country' : 'region');

const queryList = (value: typeof route.query[string]) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean) as string[]
  }

  return value ? value.split(',').filter(Boolean) : []
}

const selectedRegions = computed(() => queryList(route.query.region));
const selectedCountries = computed(() => queryList(route.query.country));
const selectedServices = computed(() => queryList(route.query.services));

const regions = computed(() => leafSettings.region.map((region) => region.name));
const countries = computed(() => {
  return [...locationStore.countries]
    .filter((country) => country.ISO3)
    .sort((firstCountry, secondCountry) => firstCountry.name.localeCompare(secondCountry.name));
})
const services = computed(() => {
  const serviceNames = vendorStore.vendors.flatMap((vendor) => vendor.subsectors);

  return [...new Set(serviceNames)].sort((firstService, secondService) => {
    return firstService.localeCompare(secondService);
  })
})

const updateQuery = (updates: Record<string, string | undefined>) => {
  void router.replace({
    query: {
      ...route.query,
      ...updates
    }
  })
}

const toggleQueryValue = (key: string, value: string) => {
  const selectedValues = queryList(route.query[key]);
  const nextValues = selectedValues.includes(value)
    ? selectedValues.filter((selectedValue) => selectedValue !== value)
    : [...selectedValues, value];

  updateQuery({
    [key]: nextValues.length ? nextValues.join(',') : undefined
  })
}

const setLocationMode = (mode: LocationFilterMode) => {
  locationMode.value = mode;

  updateQuery(
    mode === 'region'
      ? { country: undefined }
      : { region: undefined }
  )
}

onMounted(async () => {
  await Promise.all([
    locationStore.loadCountries(),
    vendorStore.loadVendors()
  ]);
});

watch(() => route.query.country, (countryQuery) => {
  if (countryQuery) {
    locationMode.value = 'country';
  }
});

watch(() => route.query.region, (regionQuery) => {
  if (regionQuery && !route.query.country) {
    locationMode.value = 'region';
  }
});
</script>

<template>
  <!-- Overlay wrapper keeps the filter panel visually separate from the map. -->
  <div class="modal-mask">
    <div id="filters">
      <div class="component_header">
        <div class="header-left">Filters</div>
        <div class="header-right">
          <img :src="close" @click="filtersStore.toggleFiltersView('hidden')" />
        </div>
      </div>
      <div class="component_body">
        <FilterTypeSelector />
        <PerfectScrollbar>
          <div v-if="filtersStore.status === 'location'" class="filter-panel">
            <div id="locationTypeSelector">
              <button
                class="selectorLeft"
                :class="{ active: locationMode === 'region' }"
                type="button"
                @click="setLocationMode('region')">
                Filter By Region
              </button>
              <div class="selectorCenter">
                <label class="switch">
                  <input
                    type="checkbox"
                    :checked="locationMode === 'country'"
                    @change="setLocationMode(locationMode === 'region' ? 'country' : 'region')" />
                  <span class="slider"></span>
                </label>
              </div>
              <button
                class="selectorRight"
                :class="{ active: locationMode === 'country' }"
                type="button"
                @click="setLocationMode('country')">
                Filter By Country
              </button>
            </div>

            <div v-if="locationMode === 'region'" class="filter-options">
              <label class="filter-option" v-for="region in regions" :key="region">
                <input
                  type="checkbox"
                  :checked="selectedRegions.includes(region)"
                  @change="toggleQueryValue('region', region)" />
                <span>{{ region }}</span>
              </label>
            </div>

            <div v-else class="filter-options">
              <label class="filter-option" v-for="country in countries" :key="`${country.ISO3}-${country.name}`">
                <input
                  type="checkbox"
                  :checked="selectedCountries.includes(country.ISO3)"
                  @change="toggleQueryValue('country', country.ISO3)" />
                <span>{{ country.name }}</span>
              </label>
            </div>
          </div>

          <div v-else class="filter-panel">
            <div class="filter-options">
              <label class="filter-option" v-for="service in services" :key="service">
                <input
                  type="checkbox"
                  :checked="selectedServices.includes(service)"
                  @change="toggleQueryValue('services', service)" />
                <span>{{ service }}</span>
              </label>
            </div>
          </div>
        </PerfectScrollbar>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-mask {
  display: grid;
  justify-items: center;
  position: fixed;
  z-index: 9998;
  width: 100%;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  transition: opacity 0.3s ease;
  /* fixes flicker in Chrome when closing modal */
  -webkit-transform: translatez(0);
}

#filters {
    display: grid;
    border-radius: 10px;
    width: 600px;
    position: relative;
    top: 30px;
    height: fit-content;
    max-width: calc(100vw - 60px);
    max-height: calc(100vh - 60px);
    background-color: #fff;
    -webkit-box-shadow: 0px 3px 17px -10px rgba(0,0,0,0.75);
    -moz-box-shadow: 0px 3px 17px -10px rgba(0,0,0,0.75);
    box-shadow: 0px 3px 17px -10px rgba(0,0,0,0.75);
    overflow: hidden;
  }
  .component_header {
    height: 44px;
  }
  .component_body {
    max-height: calc(100vh - 104px);
    width: 100%;
    padding: 30px;
  }
  .ps {
    max-height: calc(100vh - 205px);
    background-color: #fff;
  }

  /* form inputs */
  #locationTypeSelector {
    position: relative;
    display: grid;
    grid-template-columns: 1fr 100px 1fr;
    align-items: center;
    margin: 20px 0px;
  }
  #locationTypeSelector > * {
    display: inline-grid;
    align-items: center;
    justify-items: center;
    cursor: pointer;
  }
  #locationTypeSelector button {
    appearance: none;
    border: none;
    background: transparent;
    color: inherit;
    font: inherit;
  }
  .selectorLeft {
    justify-content: right;
  }
  .selectorRight {
    justify-content: left;
  }
  .selectorLeft.active, .selectorRight.active {
    cursor: default;
    color: #651D32;
    font-weight: 400;
  }
  .filter-panel {
    padding-right: 10px;
  }
  .filter-options {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
    gap: 12px 18px;
    padding-bottom: 10px;
  }
  .filter-option {
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: start;
    gap: 9px;
    line-height: 1.2;
    cursor: pointer;
  }
</style>
