<script setup lang="ts">
import ResizeTransition from '@/components/ResizeTransition.vue';
import { useWorldLegend } from '@/features/map/composables/useWorldLegend';
import { selectedFilterQueryValues } from '@/utils/query';
import { computed } from 'vue';

const {
  densityLegendBuckets,
  densityLegendColor,
  legendTitle,
  route,
  selectState,
  selectedDistrict,
  selectedDistrictVendorCount,
  stateVendorCount,
  globalVendorCount,
  visibleStates
} = useWorldLegend();

const hasSectorFilter = computed(() => selectedFilterQueryValues(route.query, 'services').length > 0);
</script>

<template>
  <!-- Legend colors come from the same map settings used by the Leaflet layers. -->
  <div class="legend">
    <h2 class="component_header">
      {{ legendTitle }}
      <span v-if="hasSectorFilter" style="font-style: italic;"> (filtered)</span>
    </h2>
    <ResizeTransition>
      <div class="component_body">
        <div v-if="selectedDistrict" class="district-vendor-count">
          {{ selectedDistrictVendorCount }} vendors
        </div>

        <div v-else-if="densityLegendBuckets.length">
          <div class="legend-density" v-for="bucket in densityLegendBuckets" :key="bucket.label">
            <div
              class="legend-density-color"
              :style="{
                'background-color': densityLegendColor,
                opacity: bucket.fillOpacity
              }" />
            <div class="density-label">{{ bucket.label }}</div>
          </div>
        </div>

        <template v-else>
          <button
            class="legend-state"
            v-for="state in visibleStates"
            :key="state.name"
            type="button"
            @click="selectState(state.name)"
          >
            <div class="legend-state-color" :style="{ 'background-color': state.color }"></div>
            <div class="legend-state-name">{{ state.name }}</div>
            <div class="vendorCount">{{ stateVendorCount(state.name) }} vendors</div>
          </button>
          <!-- Global vendors are counted separately because they appear in every state total. -->
          <div class="note">Totals include {{ globalVendorCount }} vendors listed as "Global"</div>
        </template>
      </div>
    </ResizeTransition>
  </div>
</template>

<style scoped>
.legend {
  display: grid;
  border-radius: 10px;
  width: 280px;
  position: fixed;
  bottom: 50px;
  right: 50px;
  background-color: #fbfbf8;
  color: #1a0033;
  z-index: 500;
  overflow: hidden;
  -webkit-box-shadow: 0px 3px 17px -10px rgba(0,0,0,0.75);
  -moz-box-shadow: 0px 3px 17px -10px rgba(0,0,0,0.75);
  box-shadow: 0px 3px 17px -10px rgba(0,0,0,0.75);
  font-size: 14px;
}
.component_header {
  background-color: rgb(83, 65, 152);
  grid-template-columns: 1fr;
  margin: 0;
}
.legend-state {
  border: 0;
  border-radius: 6px;
  padding: 4px 6px;
  display: grid;
  grid-template-columns: 20% 30% 1fr;
  align-items: center;
  width: 100%;
  margin: 2px 0px;
  background-color: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
}
.legend-state:hover {
  background-color: #eeeeee;
}
.legend-density {
  display: grid;
  grid-template-columns: 20% 1fr;
  align-items: center;
  margin: 6px 0px;
}
.legend-state-color,
.legend-density-color {
  width: 30px;
  height: 15px;
  background-color: #7b7b7b;
  opacity: 0.4;
}
.legend-state-name {
  display: inline-flex;
  width: 70px;
  justify-content: flex-start;
}
.vendorCount {
  display: inline-flex;
  justify-content: flex-end;
}
.density-label {
  text-align: left;
}
.district-vendor-count {
  text-align: left;
}
.note {
  color: rgb(83, 65, 152);
  margin-top: 15px;
  font-style: italic;
}
</style>
