<script setup lang="ts">
import { useFiltersStore } from '@/stores/filtersStore';

const filtersStore = useFiltersStore()
</script>

<template>
  <!-- Switches between the two filter modes stored in the filters store. -->
  <div id="filterSelector">
    <button
      class="filterType"
      :class="{ active: filtersStore.status === 'location' }"
      type="button"
      @click="filtersStore.toggleFiltersView('location')">
      Locations
    </button>
    <button
      class="filterType"
      :class="{ active: filtersStore.status === 'sector' }"
      type="button"
      @click="filtersStore.toggleFiltersView('sector')">
      Services
    </button>
  </div>
</template>

<style scoped>
#filterSelector {
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
  color: inherit;
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
  background-color: #651D32;
  visibility: hidden;
  -webkit-transform: scaleX(0);
  transform: scaleX(0);
  -webkit-transition: all 0.2s ease-in-out 0s;
  transition: all 0.2s ease-in-out 0s;
}
.filterType.active {
  font-weight: 400;
  color: #651D32;
}
.filterType.active:before {
  visibility: visible;
  -webkit-transform: scaleX(1);
  transform: scaleX(1);
}
@media (hover: hover) {
  .filterType:hover:before {
    visibility: visible;
    -webkit-transform: scaleX(1);
    transform: scaleX(1);
  }
}
</style>
