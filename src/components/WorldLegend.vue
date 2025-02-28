<script setup>
import { useMapSettingsStore } from "@/stores/mapSettingsStore";
import { useVendorStore } from '@/stores/vendorStore';
import { useRoute } from "vue-router";

const { leafSettings } = useMapSettingsStore();
const vendorStore = useVendorStore();
</script>

<template>
  <div class="legend">
    <div class="component_header">
      <div>Regions<span v-if="useRoute().query.services" style="font-style: italic;"> (filtered)</span></div>
    </div>
    <div class="component_body">
      <div class="legend-region" v-for="region in leafSettings.region" :key="region.name">
        <div class="color_container">
          <div class="legend-region_color" :style="{ 'background-color': region.color }"></div>
        </div>
        <div class="legend-region_name">{{ region.name }}</div>
        <div class="vendorCount">{{ vendorStore.regionVendorCount(region.name) }} vendors</div>
      </div>
      <div class="note">Totals include {{ vendorStore.regionVendorCount("Global") }} vendors listed as "Global"</div>
    </div>
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
}
.legend-region {
  display: grid;
  grid-template-columns: 20% 30% 1fr;
  align-items: center;
  margin: 6px 0px;
}
.legend-region > .color_container {
  display: inline-flex;
  justify-content: flex-start;
}
.legend-region_color {
  width: 30px;
  height: 15px;
  background-color: #7b7b7b;
  opacity: 0.4;
}
.legend-region_name {
  display: inline-flex;
  width: 70px;
  justify-content: flex-start;
}
.vendorCount {
  display: inline-flex;
  justify-content: flex-end;
}
.note {
  color: #651D32;
  margin-top: 15px;
  font-style: italic;
}
</style>
