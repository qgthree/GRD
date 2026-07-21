<script setup lang="ts">
import "leaflet/dist/leaflet.css";
import LoadingBars from '@/components/LoadingBars.vue';
import { useBoundaryMap } from '@/features/map/composables/useBoundaryMap';

const { isLoading } = useBoundaryMap();
</script>

<template>
  <div id="map"></div>
  <LoadingBars v-if="isLoading" class="map-loading" role="status" aria-label="Loading map data" />
</template>

<style>
#map {
  position: relative;
  height: 100%;
  width: 100%;
}

.map-loading {
  position: absolute;
  left: 50%;
  bottom: 32px;
  z-index: 500;
  color: var(--color-purple);
  pointer-events: none;
  transform: translateX(-50%);
}

.leaflet-control-attribution {
  display: none;
}

/* Update leaflet tooltip styles (QG) */

.leaflet-tooltip {
	background-color: var(--color-tooltip-background);
	color: #1a0033;
	letter-spacing: 1.3px;
	font-weight: 400;
	line-height: 1.4;
	font-size: 10px;
	text-transform: uppercase;
	border-radius: 16px;
	padding: 8px 12px;
	box-shadow: 0 0 32px -10px rgba(0, 0, 0, .59);
  border-color: var(--color-tooltip-background);
}

.leaflet-tooltip-top:before {
	border-top-color: var(--color-tooltip-background);
}

.leaflet-tooltip-bottom:before {
	border-bottom-color: var(--color-tooltip-background);
}

.leaflet-tooltip-left:before {
	border-left-color: var(--color-tooltip-background);
}

.leaflet-tooltip-right:before {
	border-right-color: var(--color-tooltip-background);
}

.tip-title {
  font-weight: 500;
}
</style>
