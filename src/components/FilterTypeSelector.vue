<script setup>
import { useFiltersStore } from '@/stores/filtersStore';
import { storeToRefs } from 'pinia';
</script>

<template>
  <div id="filterSelector">
    <div
      class="filterType"
      :class="{ active: useFiltersStore().status === 'location' }"
      @click="useFiltersStore().toggleFiltersView('location')">
      Locations
    </div>
    <div
      class="filterType"
      :class="{ active: useFiltersStore().status === 'sector' }"
      @click="useFiltersStore().toggleFiltersView('sector')">
      Services
    </div>
  </div>
</template>

<style scoped>
#filterSelector {
  width: 100%;
  text-align: left;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}
.filterType {
  display: inline-flex;
  position: relative;
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