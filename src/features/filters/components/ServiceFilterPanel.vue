<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useFilterQuery } from '@/features/filters/composables/useFilterQuery'
import { useVendorStore } from '@/stores/vendorStore'

const vendorStore = useVendorStore()
const { selectedValues, toggleQueryValue } = useFilterQuery()

const selectedServices = selectedValues('services')
const services = computed(() => {
  const serviceNames = vendorStore.vendors.flatMap((vendor) => vendor.subsectors)

  return [...new Set(serviceNames)].sort((firstService, secondService) => {
    return firstService.localeCompare(secondService)
  })
})

onMounted(() => {
  void vendorStore.loadVendors()
})
</script>

<template>
  <div class="filter-panel">
    <div class="filter-options">
      <label class="filter-option" v-for="service in services" :key="service">
        <input
          type="checkbox"
          :checked="selectedServices.includes(service)"
          @change="toggleQueryValue('services', service)" />
        <span>{{ service }}</span>
      </label>
    </div>
  </div>
</template>

<style scoped>
.filter-panel {
  padding-right: 10px;
}
.filter-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 12px 18px;
  padding: 2px 0 10px;
}
.filter-option {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: start;
  gap: 9px;
  line-height: 1.2;
  cursor: pointer;
}
</style>
