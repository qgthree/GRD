<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useFilterQuery } from '@/features/filters/composables/useFilterQuery'
import { useLocationStore } from '@/stores/locationStore'
import { useFiltersStore } from '@/stores/filtersStore'
import { selectedFilterQueryValues } from '@/utils/query'
import type { District } from '@/features/locations/types'
import {
  districtQueryValue,
  selectedDistrictGeoidsFromQuery,
  selectedStateNamesFromQuery,
  stateQueryValue
} from '@/features/locations/utils/locationQuery'
import { sortDistricts } from '@/features/locations/utils/districtSorting'

type LocationFilterMode = 'state' | 'district'
type DistrictGroup = {
  state: string
  districts: District[]
}

const locationStore = useLocationStore()
const filtersStore = useFiltersStore()
const { route, toggleQueryValue, updateQuery } = useFilterQuery()

const selectedStates = computed(() => selectedStateNamesFromQuery(route.query, locationStore.states))
const selectedDistricts = computed(() => selectedDistrictGeoidsFromQuery(route.query, locationStore.districts))

const states = computed(() => locationStore.states.map((state) => state.name))
const districts = computed(() => {
  const selectableStates = new Set(states.value)

  return sortDistricts(locationStore.districts
    .filter((district) => district.geoid && selectableStates.has(district.state))
  )
})
const districtGroups = computed<DistrictGroup[]>(() => {
  const groups = new Map<string, District[]>()

  districts.value.forEach((district) => {
    const stateDistricts = groups.get(district.state) ?? []
    stateDistricts.push(district)
    groups.set(district.state, stateDistricts)
  })

  return [...groups.entries()]
    .sort(([firstState], [secondState]) => firstState.localeCompare(secondState))
    .map(([state, groupedDistricts]) => ({
      state,
      districts: groupedDistricts
    }))
})

const setLocationMode = (mode: LocationFilterMode) => {
  filtersStore.setLocationMode(mode)

  updateQuery(
    mode === 'state'
      ? { district: undefined }
      : { state: undefined }
  )
}

const selectedDistrictCountForState = (districts: District[]) => {
  return districts.filter((district) => selectedDistricts.value.includes(district.geoid)).length
}

watch(districtGroups, (groups) => {
  if (!groups.length) return

  filtersStore.initializeCollapsedDistrictStates(groups.map((group) => group.state))
}, { immediate: true })

watch(() => route.query, (query) => {
  if (selectedFilterQueryValues(query, 'district').length) {
    filtersStore.setLocationMode('district')
    return
  }

  if (selectedFilterQueryValues(query, 'state').length) {
    filtersStore.setLocationMode('state')
  }
}, { immediate: true })

onMounted(() => {
  void locationStore.loadDistricts()
})
</script>

<template>
  <div id="locationTypeSelector">
    <button
      class="selector-option"
      :class="{ active: filtersStore.locationMode === 'state' }"
      type="button"
      @click="setLocationMode('state')">
      Filter By State
    </button>
    <label class="switch selectorCenter">
      <input
        type="checkbox"
        :checked="filtersStore.locationMode === 'district'"
        @change="setLocationMode(filtersStore.locationMode === 'state' ? 'district' : 'state')" />
      <span class="slider"></span>
    </label>
    <button
      class="selector-option"
      :class="{ active: filtersStore.locationMode === 'district' }"
      type="button"
      @click="setLocationMode('district')">
      Filter By District
    </button>
  </div>

  <div v-if="filtersStore.locationMode === 'state'" class="state-options">
    <label class="filter-option" v-for="state in states" :key="state">
      <input
        type="checkbox"
        :checked="selectedStates.includes(state)"
        @change="toggleQueryValue('state', stateQueryValue(state, locationStore.states))" />
      <span>{{ state }}</span>
    </label>
  </div>

  <div v-else class="district-groups">
    <section class="district-state-group" v-for="group in districtGroups" :key="group.state">
      <h3>
        <button
          type="button"
          :aria-expanded="filtersStore.isDistrictStateOpen(group.state)"
          @click="filtersStore.toggleDistrictState(group.state)">
          <span class="filter-bucket-title">
            <span>{{ group.state }}</span>
            <span v-if="selectedDistrictCountForState(group.districts)" class="filter-selected-count">
              {{ selectedDistrictCountForState(group.districts) }}
            </span>
          </span>
        </button>
      </h3>
      <div v-if="filtersStore.isDistrictStateOpen(group.state)" class="filter-options">
        <label class="filter-option" v-for="district in group.districts" :key="`${district.geoid}-${district.name}`">
          <input
            type="checkbox"
            :checked="selectedDistricts.includes(district.geoid)"
            @change="toggleQueryValue('district', districtQueryValue(district.geoid, locationStore.districts))" />
          <span>{{ district.name }}</span>
        </label>
      </div>
    </section>
  </div>
</template>

<style scoped>
#locationTypeSelector {
  position: relative;
  display: grid;
  grid-template-columns: max-content 70px max-content;
  gap: 10px;
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
.selector-option {
  justify-content: center;
}
#locationTypeSelector .selector-option.active {
  cursor: default;
  color: rgb(83, 65, 152);
  text-shadow: 0.35px 0 currentColor;
}
.district-groups,
.state-options {
  display: grid;
  gap: 12px;
}
.district-state-group,
.state-options {
  background-color: #f4f4f5;
  border-radius: 10px;
  color: #000;
}
.state-options {
  padding: 14px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.district-state-group h3 {
  margin-bottom: 0;
}
.district-state-group h3 button {
  appearance: none;
  display: block;
  width: 100%;
  border: none;
  background: transparent;
  color: #1f1f1f;
  cursor: pointer;
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  padding: 14px;
  text-align: left;
}
.filter-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 12px 18px;
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
