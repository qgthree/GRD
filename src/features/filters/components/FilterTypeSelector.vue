<script setup lang="ts">
import { useFiltersStore } from '@/stores/filtersStore';
import { useFilterQuery } from '@/features/filters/composables/useFilterQuery'
import { hasActiveFilterQuery } from '@/utils/query'

const filtersStore = useFiltersStore()
const { route, updateQuery } = useFilterQuery()
</script>

<template>
  <!-- Switches between the two filter modes stored in the filters store. -->
  <div id="filterSelector">
    <button
      class="filterType"
      :class="{ active: filtersStore.status === 'location' }"
      type="button"
      @click="filtersStore.toggleFiltersView('location')">
      Location
    </button>
    <button
      class="filterType"
      :class="{ active: filtersStore.status === 'sector' }"
      type="button"
      @click="filtersStore.toggleFiltersView('sector')">
      Sector
    </button>
    <button
      class="clear-filters"
      type="button"
      :disabled="!hasActiveFilterQuery(route.query)"
      @click="updateQuery({ state: undefined, district: undefined, services: undefined, servicesExclude: undefined })">
      clear all
    </button>
  </div>
</template>

<style scoped>
#filterSelector {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 20px;
  width: 100%;
  text-align: left;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}
.filterType {
  appearance: none;
  border: 0;
  display: inline-flex;
  position: relative;
  background: transparent;
  color: rgba(0, 0, 0, 0.58);
  padding: 5px 0px 5px 0px;
  font-size: 14px;
  font-weight: 300;
  margin-right: 30px;
  text-transform: uppercase;
  cursor: pointer;
}
.filterType:before {
  content: "";
  position: absolute;
  width: 100%;
  height: 1px;
  bottom: -1px;
  background-color: rgb(83, 65, 152);
  visibility: hidden;
  -webkit-transform: scaleX(0);
  transform: scaleX(0);
  -webkit-transition: all 0.2s ease-in-out 0s;
  transition: all 0.2s ease-in-out 0s;
}
.filterType.active {
  font-weight: 400;
  color: rgb(83, 65, 152);
}
.filterType.active:before {
  visibility: visible;
  -webkit-transform: scaleX(1);
  transform: scaleX(1);
}
.clear-filters {
  appearance: none;
  border: 0;
  background: transparent;
  color: rgba(0, 0, 0);
  cursor: pointer;
  font: inherit;
  font-size: 14px;
  font-style: italic;
  font-weight: 300;
  margin-left: auto;
  padding: 5px 0;
}
.clear-filters:disabled {
  cursor: default;
  opacity: 0.45;
}
@media (hover: hover) {
  .filterType:hover:before {
    visibility: visible;
    -webkit-transform: scaleX(1);
    transform: scaleX(1);
  }
  .clear-filters:not(:disabled):hover {
    color: rgba(0, 0, 0, 0.78);
  }
}
</style>
