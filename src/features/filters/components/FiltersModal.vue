<script setup lang="ts">
import { useFiltersStore } from '@/stores/filtersStore'
import { useRoute, useRouter, type LocationQuery } from 'vue-router'
import close from '@/assets/images/close.svg'
import FilterTypeSelector from '@/features/filters/components/FilterTypeSelector.vue'
import LocationFilterPanel from '@/features/filters/components/LocationFilterPanel.vue'
import ServiceFilterPanel from '@/features/filters/components/ServiceFilterPanel.vue'

const filtersStore = useFiltersStore()
const route = useRoute()
const router = useRouter()

// Filter controls replace the current URL while the modal is open. Keeping the
// opening query lets close create one useful browser-history entry afterward.
const openingQuery = { ...route.query }

const querySignature = (query: LocationQuery) => JSON.stringify(
  Object.keys(query)
    .sort()
    .map((key) => {
      const value = query[key]

      return [key, Array.isArray(value) ? [...value].sort() : value]
    }),
)

const closeFilters = async () => {
  const closingQuery = { ...route.query }

  filtersStore.toggleFiltersView('hidden')

  if (querySignature(openingQuery) === querySignature(closingQuery)) return

  // Rebuild history as: previous URL -> final filter URL. This avoids adding a
  // history entry for every checkbox click while still preserving the result.
  await router.replace({ query: openingQuery })
  await router.push({ query: closingQuery })
}
</script>

<template>
  <!-- Overlay wrapper keeps the filter panel visually separate from the map. -->
  <div class="modal-mask">
    <div id="filters">
      <div class="component_header">
        <div class="header-left">Filters</div>
        <div class="header-right">
          <img :src="close" @click="closeFilters" />
        </div>
      </div>
      <div class="component_body">
        <FilterTypeSelector />
        <div class="filter-scroll">
          <LocationFilterPanel v-if="filtersStore.status === 'location'" />
          <ServiceFilterPanel v-else />
        </div>
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
.filter-scroll {
  max-height: calc(100vh - 205px);
  overflow-y: auto;
  background-color: #fff;
}
</style>
