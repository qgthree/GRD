<script setup lang="ts">
import "leaflet/dist/leaflet.css";
import LoadingBars from '@/components/LoadingBars.vue';
import { useBoundaryMap } from '@/features/map/composables/useBoundaryMap';

const { isLoading } = useBoundaryMap();
</script>

<template>
  <div class="map-shell">
    <div id="map"></div>
    <LoadingBars v-if="isLoading" class="map-loading" role="status" aria-label="Loading map data" />
  </div>
</template>

<style>
.map-shell {
  position: relative;
  height: 100%;
  width: 100%;
}

#map {
  height: 100%;
  width: 100%;
}

.map-loading {
  position: absolute;
  left: 50%;
  bottom: 32px;
  z-index: 500;
  color: #1a0033;
  pointer-events: none;
  transform: translateX(-50%);
}

.leaflet-control-attribution {
  display: none;
}

/* Update leaflet tooltip styles (QG) */

.leaflet-tooltip {
	background-color: #fff7e6;
	color: #1a0033;
	letter-spacing: 1.3px;
	font-weight: 400;
	line-height: 1.4;
	font-size: 10px;
	text-transform: uppercase;
	border-radius: 16px;
	padding: 8px 12px;
	box-shadow: 0 0 32px -10px rgba(0, 0, 0, .59);
  border-color: #fff7e6;
}

.leaflet-tooltip-top:before {
	border-top-color: #fff7e6;
}

.leaflet-tooltip-bottom:before {
	border-bottom-color: #fff7e6;
}

.leaflet-tooltip-left:before {
	border-left-color: #fff7e6;
}

.leaflet-tooltip-right:before {
	border-right-color: #fff7e6;
}

.tip-title {
  font-weight: 500;
}
</style>
