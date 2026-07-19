<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import CollapseTransition from '@/components/CollapseTransition.vue'
import { useFilterQuery } from '@/features/filters/composables/useFilterQuery'
import { useLocationStore } from '@/stores/locationStore'
import { useMapSettingsStore } from '@/stores/mapSettingsStore'
import { useFiltersStore } from '@/stores/filtersStore'
import type { Country } from '@/features/locations/types'

type LocationFilterMode = 'region' | 'country'
type CountryGroup = {
  region: string
  countries: Country[]
}

const locationStore = useLocationStore()
const filtersStore = useFiltersStore()
const { leafSettings } = useMapSettingsStore()
const { route, selectedValues, toggleQueryValue, updateQuery } = useFilterQuery()

const selectedRegions = selectedValues('region')
const selectedCountries = selectedValues('country')

const regions = computed(() => leafSettings.region.map((region) => region.name))
const countries = computed(() => {
  const selectableRegions = new Set(regions.value)

  return [...locationStore.countries]
    .filter((country) => country.ISO3 && selectableRegions.has(country.region))
    .sort((firstCountry, secondCountry) => firstCountry.name.localeCompare(secondCountry.name))
})
const countryGroups = computed<CountryGroup[]>(() => {
  const groups = new Map<string, Country[]>()

  countries.value.forEach((country) => {
    const regionCountries = groups.get(country.region) ?? []
    regionCountries.push(country)
    groups.set(country.region, regionCountries)
  })

  return [...groups.entries()]
    .sort(([firstRegion], [secondRegion]) => firstRegion.localeCompare(secondRegion))
    .map(([region, groupedCountries]) => ({
      region,
      countries: groupedCountries
    }))
})

const setLocationMode = (mode: LocationFilterMode) => {
  filtersStore.setLocationMode(mode)

  updateQuery(
    mode === 'region'
      ? { country: undefined }
      : { region: undefined }
  )
}

const selectedCountryCountForRegion = (countries: Country[]) => {
  return countries.filter((country) => selectedCountries.value.includes(country.ISO3)).length
}

watch(countryGroups, (groups) => {
  if (!groups.length) return

  filtersStore.initializeCollapsedCountryRegions(groups.map((group) => group.region))
}, { immediate: true })

watch(() => [route.query.country, route.query.region], ([countryQuery, regionQuery]) => {
  if (countryQuery) {
    filtersStore.setLocationMode('country')
    return
  }

  if (regionQuery) {
    filtersStore.setLocationMode('region')
  }
}, { immediate: true })

onMounted(() => {
  void locationStore.loadCountries()
})
</script>

<template>
  <div id="locationTypeSelector">
    <button
      class="selectorLeft"
      :class="{ active: filtersStore.locationMode === 'region' }"
      type="button"
      @click="setLocationMode('region')">
      Filter By Region
    </button>
    <div class="selectorCenter">
      <label class="switch">
        <input
          type="checkbox"
          :checked="filtersStore.locationMode === 'country'"
          @change="setLocationMode(filtersStore.locationMode === 'region' ? 'country' : 'region')" />
        <span class="slider"></span>
      </label>
    </div>
    <button
      class="selectorRight"
      :class="{ active: filtersStore.locationMode === 'country' }"
      type="button"
      @click="setLocationMode('country')">
      Filter By Country
    </button>
  </div>

  <div v-if="filtersStore.locationMode === 'region'" class="region-option-group">
    <div class="region-options">
      <label class="filter-option" v-for="region in regions" :key="region">
        <input
          type="checkbox"
          :checked="selectedRegions.includes(region)"
          @change="toggleQueryValue('region', region)" />
        <span>{{ region }}</span>
      </label>
    </div>
  </div>

  <div v-else class="country-groups">
    <section class="country-region-group" v-for="group in countryGroups" :key="group.region">
      <h3>
        <button
          type="button"
          :aria-expanded="filtersStore.isCountryRegionOpen(group.region)"
          @click="filtersStore.toggleCountryRegion(group.region)">
          <span class="country-region-title">
            <span>{{ group.region }}</span>
            <span v-if="selectedCountryCountForRegion(group.countries)" class="selected-count">
              {{ selectedCountryCountForRegion(group.countries) }}
            </span>
          </span>
          <span aria-hidden="true">{{ filtersStore.isCountryRegionOpen(group.region) ? '−' : '+' }}</span>
        </button>
      </h3>
      <CollapseTransition>
        <div v-show="filtersStore.isCountryRegionOpen(group.region)" class="country-region-body filter-options">
          <label class="filter-option" v-for="country in group.countries" :key="`${country.ISO3}-${country.name}`">
            <input
              type="checkbox"
              :checked="selectedCountries.includes(country.ISO3)"
              @change="toggleQueryValue('country', country.ISO3)" />
            <span>{{ country.name }}</span>
          </label>
        </div>
      </CollapseTransition>
    </section>
  </div>
</template>

<style scoped>
#locationTypeSelector {
  position: relative;
  display: grid;
  grid-template-columns: 130px 70px 130px;
  align-items: center;
  justify-content: start;
  margin: 20px 0;
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
.selectorLeft,
.selectorRight {
  justify-content: center;
}
#locationTypeSelector .selectorLeft.active,
#locationTypeSelector .selectorRight.active {
  cursor: default;
  color: #651D32;
  font-weight: 600;
}
.country-groups,
.region-options {
  display: grid;
  gap: 12px;
}
.country-region-group,
.region-option-group {
  background-color: #f4f4f5;
  border-radius: 10px;
  color: #000;
}
.country-region-group {
  overflow: hidden;
}
.region-option-group {
  padding: 14px;
}
.country-region-group h3 {
  margin-bottom: 0;
}
.country-region-group h3 button {
  appearance: none;
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  width: 100%;
  border: none;
  background: transparent;
  color: #651D32;
  cursor: pointer;
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  padding: 14px;
  text-align: left;
}
.country-region-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.selected-count {
  display: inline-grid;
  place-items: center;
  min-width: 22px;
  height: 22px;
  border-radius: 999px;
  background-color: #651D32;
  color: #fff;
  font-size: 12px;
  line-height: 1;
  padding: 0 7px;
}
.filter-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 12px 18px;
  padding: 2px 0 10px;
}
.country-region-body.filter-options {
  padding: 2px 14px 14px;
}
.filter-option {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: start;
  gap: 9px;
  text-align: left;
  line-height: 1.2;
  cursor: pointer;
}
.filter-option span {
  text-align: left;
}
</style>
