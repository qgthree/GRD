<script setup lang="ts">
import { useFiltersStore } from '@/stores/filtersStore'
import ModalFrame from '@/components/ModalFrame.vue'
import ResizeTransition from '@/components/ResizeTransition.vue'
import close from '@/assets/images/close.svg'
import FilterTypeSelector from '@/features/filters/components/FilterTypeSelector.vue'
import LocationFilterPanel from '@/features/filters/components/LocationFilterPanel.vue'
import ServiceFilterPanel from '@/features/filters/components/ServiceFilterPanel.vue'

const filtersStore = useFiltersStore()
</script>

<template>
  <ModalFrame
    :show="filtersStore.status !== 'hidden'"
    title="Filters"
    max-width="600px"
    @close-modal="filtersStore.toggleFiltersView('hidden')"
  >
    <template #header="{ close: closeModal }">
      <div class="component_header">
        <div class="header-left">Filters</div>
        <div class="header-right">
          <img :src="close" alt="" @click="closeModal" />
        </div>
      </div>
    </template>

    <div class="filter-panel-area">
      <FilterTypeSelector />
      <ResizeTransition v-if="filtersStore.status === 'location'" :duration="280">
        <LocationFilterPanel />
      </ResizeTransition>
      <ServiceFilterPanel v-else />
    </div>
  </ModalFrame>
</template>

<style scoped>
.filter-panel-area {
  display: grid;
  gap: 20px;
  width: 100%;
  padding: 30px;
}
</style>
