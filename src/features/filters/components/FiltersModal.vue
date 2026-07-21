<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import { useFiltersStore } from '@/stores/filtersStore'
import ModalFrame from '@/components/ModalFrame.vue'
import close from '@/assets/images/close.svg'
import FilterTypeSelector from '@/features/filters/components/FilterTypeSelector.vue'

const filtersStore = useFiltersStore()
// Panels carry the heavier location and NAICS selector code. Load only the
// active panel after the modal needs it.
const LocationFilterPanel = defineAsyncComponent(() => import('@/features/filters/components/LocationFilterPanel.vue'))
const ServiceFilterPanel = defineAsyncComponent(() => import('@/features/filters/components/ServiceFilterPanel.vue'))
</script>

<template>
  <ModalFrame
    :show="filtersStore.status !== 'hidden'"
    title="Filters"
    max-width="900px"
    @close-modal="filtersStore.toggleFiltersView('hidden')"
  >
    <template #header="{ close: closeModal }">
      <div class="component_header">
        <span class="header-left">Filters</span>
        <button class="header-right icon-button" type="button" aria-label="Close filters" @click="closeModal">
          <img :src="close" alt="" />
        </button>
      </div>
    </template>

    <template #before-content>
      <div class="filter-tabs-area">
        <FilterTypeSelector />
      </div>
    </template>

    <div class="filter-panel-area">
      <LocationFilterPanel v-if="filtersStore.status === 'location'" />
      <ServiceFilterPanel v-else />
    </div>
  </ModalFrame>
</template>

<style scoped>
.filter-tabs-area {
  padding: 30px 30px 0;
}
.filter-panel-area {
  display: grid;
  width: 100%;
  padding: 30px;
}
</style>
