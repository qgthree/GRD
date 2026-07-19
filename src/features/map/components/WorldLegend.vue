<script setup lang="ts">
import { computed } from 'vue';
import ResizeTransition from '@/components/ResizeTransition.vue';
import { useMapSettingsStore } from "@/stores/mapSettingsStore";
import { useVendorStore } from '@/stores/vendorStore';
import { useLocationStore } from '@/stores/locationStore';
import { useRoute, useRouter } from "vue-router";
import { getBoundarySelection, mapBoundaryQueryKeys } from '@/features/map/utils/mapQuery';
import { findBoundaryStyle, heatmapBoundaryColor } from '@/features/map/utils/mapViewport';
import { createVendorDensityBuckets } from '@/features/map/utils/vendorDensity';

const { leafSettings } = useMapSettingsStore();
const vendorStore = useVendorStore();
const locationStore = useLocationStore();
const route = useRoute();
const router = useRouter();

const activeSelection = computed(() => getBoundarySelection(route.query, mapBoundaryQueryKeys));
const stateStyles = computed(() => {
  return locationStore.states.map((state) => findBoundaryStyle(leafSettings.boundaryStyles, state.name));
});
const visibleStates = computed(() => {
  const selection = activeSelection.value;

  if (selection.type === 'state') {
    return stateStyles.value.filter((state) => state.name === selection.id);
  }

  if (selection.type === 'state-list') {
    return stateStyles.value.filter((state) => selection.ids.includes(state.name));
  }

  return stateStyles.value;
});
// A single selected state uses the legend for district-level vendor presence.
// Empty or multi-state selections keep the broader state density legend.
const selectedState = computed(() => {
  const selection = activeSelection.value;

  if (selection.type !== 'state') return;

  return stateStyles.value.find((state) => state.name === selection.id);
});
const isStateDensityView = computed(() => {
  const selection = activeSelection.value;

  return selection.type === 'none' || selection.type === 'state-list';
});
const selectedDistrict = computed(() => {
  const selection = activeSelection.value;

  if (selection.type !== 'district') return;

  return locationStore.districts.find((district) => district.geoid === selection.id);
});
const legendTitle = computed(() => {
  if (selectedDistrict.value) return selectedDistrict.value.name;
  if (selectedState.value || isStateDensityView.value) return 'Vendor Presence';

  return 'States';
});
const densityBuckets = computed(() => {
  if (isStateDensityView.value) {
    const stateCounts = visibleStates.value.map((state) => vendorStore.stateVendorCount(state.name));

    return createVendorDensityBuckets(stateCounts);
  }

  if (!selectedState.value) return [];

  const districtCounts = locationStore.districts
    .filter((district) => district.state === selectedState.value?.name)
    .map((district) => vendorStore.districtVendorCount(district.geoid) ?? 0);

  return createVendorDensityBuckets(districtCounts);
});
// The map helper builds buckets light-to-dark; the legend reads better with the
// highest vendor presence first.
const densityLegendBuckets = computed(() => [...densityBuckets.value].reverse());
const densityLegendColor = computed(() => selectedState.value?.color ?? heatmapBoundaryColor);

// Legend state clicks use the same URL state as map clicks and filters.
const selectState = (stateName: string) => {
  void router.push({
    query: {
      ...route.query,
      state: stateName,
      district: undefined,
    },
  });
};
</script>

<template>
  <!-- Legend colors come from the same map settings used by the Leaflet layers. -->
  <div class="legend">
    <div class="component_header">
      <div>
        {{ legendTitle }}
        <span v-if="route.query.services" style="font-style: italic;"> (filtered)</span>
      </div>
    </div>
    <ResizeTransition>
      <div class="component_body">
        <div v-if="selectedDistrict" class="district-vendor-count">
          {{ vendorStore.districtVendorCount(selectedDistrict.geoid) ?? 0 }} vendors
        </div>

        <div v-else-if="densityLegendBuckets.length">
          <div class="legend-density" v-for="bucket in densityLegendBuckets" :key="bucket.label">
            <div
              class="legend-density-color"
              :style="{
                'background-color': densityLegendColor,
                opacity: bucket.fillOpacity
              }">
            </div>
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
            <div class="vendorCount">{{ vendorStore.stateVendorCount(state.name) }} vendors</div>
          </button>
          <!-- Global vendors are counted separately because they appear in every state total. -->
          <div class="note">Totals include {{ vendorStore.stateVendorCount("Global") }} vendors listed as "Global"</div>
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
  background-color: #452145;
  grid-template-columns: 1fr;
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
  color: #651D32;
  margin-top: 15px;
  font-style: italic;
}
</style>
