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

    <div class="filters-modal">
      <FilterTypeSelector />
      <div class="filter-panel-area">
        <ResizeTransition v-if="filtersStore.status === 'location'" :duration="280">
          <LocationFilterPanel />
        </ResizeTransition>
        <ServiceFilterPanel v-else />
      </div>
    </div>
  </ModalFrame>
</template>

<style scoped>
.filters-modal {
  max-height: calc(100vh - 104px);
  width: 100%;
  padding: 30px;
  background-color: #fff;
}
.filter-panel-area {
  padding: 20px 0px;
  background-color: #fff;
}
</style>
