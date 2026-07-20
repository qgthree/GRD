<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import CollapseTransition from '@/components/CollapseTransition.vue'
import { useFilterQuery } from '@/features/filters/composables/useFilterQuery'
import { useLocationStore } from '@/stores/locationStore'
import { useFiltersStore } from '@/stores/filtersStore'
import type { District } from '@/features/locations/types'
import { sortDistricts } from '@/features/locations/utils/districtSorting'

type LocationFilterMode = 'state' | 'district'
type DistrictGroup = {
  state: string
  districts: District[]
}

const locationStore = useLocationStore()
const filtersStore = useFiltersStore()
const { route, selectedValues, toggleQueryValue, updateQuery } = useFilterQuery()

const selectedStates = selectedValues('state')
const selectedDistricts = selectedValues('district')

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

watch(() => [route.query.district, route.query.state], ([districtQuery, stateQuery]) => {
  if (districtQuery) {
    filtersStore.setLocationMode('district')
    return
  }

  if (stateQuery) {
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
      class="selectorLeft"
      :class="{ active: filtersStore.locationMode === 'state' }"
      type="button"
      @click="setLocationMode('state')">
      Filter By State
    </button>
    <div class="selectorCenter">
      <label class="switch">
        <input
          type="checkbox"
          :checked="filtersStore.locationMode === 'district'"
          @change="setLocationMode(filtersStore.locationMode === 'state' ? 'district' : 'state')" />
        <span class="slider"></span>
      </label>
    </div>
    <button
      class="selectorRight"
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
        @change="toggleQueryValue('state', state)" />
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
          <span class="district-state-title">
            <span>{{ group.state }}</span>
            <span v-if="selectedDistrictCountForState(group.districts)" class="selected-count">
              {{ selectedDistrictCountForState(group.districts) }}
            </span>
          </span>
          <span aria-hidden="true">{{ filtersStore.isDistrictStateOpen(group.state) ? '−' : '+' }}</span>
        </button>
      </h3>
      <CollapseTransition>
        <div v-show="filtersStore.isDistrictStateOpen(group.state)" class="district-state-body filter-options">
          <label class="filter-option" v-for="district in group.districts" :key="`${district.geoid}-${district.name}`">
            <input
              type="checkbox"
              :checked="selectedDistricts.includes(district.geoid)"
              @change="toggleQueryValue('district', district.geoid)" />
            <span>{{ district.name }}</span>
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
.district-state-group {
  overflow: hidden;
}
.state-options {
  padding: 14px;
}
.district-state-group h3 {
  margin-bottom: 0;
}
.district-state-group h3 button {
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
.district-state-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.selected-count {
  display: inline-grid;
  place-items: center;
  min-width: 20px;
  height: 20px;
  border-radius: 999px;
  background-color: #651D32;
  color: #fff;
  font-size: 12px;
  line-height: 1;
}
.filter-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 12px 18px;
  padding: 2px 0 10px;
}
.district-state-body.filter-options {
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
