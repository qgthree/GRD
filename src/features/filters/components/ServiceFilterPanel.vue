<script setup lang="ts">
import { computed } from 'vue'
import { useFilterQuery } from '@/features/filters/composables/useFilterQuery'
import {
  isNaicsCodeChecked,
  isNaicsCodeImpliedByDescendant,
  naicsBuckets,
  sortNaicsCodes,
  toggleNaicsSelection
} from '@/features/naics/utils/naicsCodes'
import { useFiltersStore } from '@/stores/filtersStore'
import { queryValueFromList } from '@/utils/query'
import type { NaicsCode } from '@/features/naics/types'

type NaicsBucket = (typeof naicsBuckets)[number]

const { selectedValues, updateQuery } = useFilterQuery()
const filtersStore = useFiltersStore()

const selectedServices = selectedValues('services')
const excludedServices = selectedValues('servicesExclude')

const isNaicsChecked = (code: NaicsCode) => {
  return isNaicsCodeChecked(code.code, selectedServices.value, excludedServices.value)
}

const isNaicsImpliedByDescendant = (code: NaicsCode) => {
  return isNaicsCodeImpliedByDescendant(code.code, selectedServices.value)
}

const selectedCountsByBucketLevel = computed(() => {
  return new Map(naicsBuckets.map((bucket) => [
    bucket.level,
    bucket.codes.filter((code) => isNaicsChecked(code)).length
  ]))
})

const selectedNaicsCountForBucket = (bucket: NaicsBucket) => {
  return selectedCountsByBucketLevel.value.get(bucket.level) ?? 0
}

const updateServices = (selectedCodes: string[], excludedCodes: string[]) => {
  updateQuery({
    services: queryValueFromList(sortNaicsCodes(selectedCodes)),
    servicesExclude: queryValueFromList(sortNaicsCodes(excludedCodes))
  })
}

const toggleNaicsCode = (code: NaicsCode) => {
  const nextSelection = toggleNaicsSelection(code.code, selectedServices.value, excludedServices.value)

  updateServices(nextSelection.selectedCodes, nextSelection.excludedCodes)
}

</script>

<template>
  <div class="naics-buckets">
    <section
      class="naics-bucket"
      v-for="bucket in naicsBuckets"
      :key="bucket.level"
    >
      <button
        class="naics-bucket-heading"
        type="button"
        :aria-expanded="filtersStore.isNaicsBucketOpen(bucket.level)"
        @click="filtersStore.toggleNaicsBucket(bucket.level)"
      >
        <span class="filter-bucket-title">
          <span>{{ bucket.title }}</span>
          <span v-if="selectedNaicsCountForBucket(bucket)" class="filter-selected-count">
            {{ selectedNaicsCountForBucket(bucket) }}
          </span>
        </span>
        <small>{{ bucket.description }}</small>
      </button>
      <div v-if="filtersStore.isNaicsBucketOpen(bucket.level)" class="filter-options">
        <label
          class="filter-option"
          :class="{ implied: isNaicsImpliedByDescendant(code) }"
          v-for="code in bucket.codes"
          :key="code.code"
        >
          <input
            type="checkbox"
            :checked="isNaicsChecked(code)"
            @change="toggleNaicsCode(code)" />
          <span>{{ code.code }} {{ code.title }}</span>
        </label>
      </div>
    </section>
  </div>
</template>

<style scoped>
.naics-buckets {
  display: grid;
  gap: 12px;
}
.naics-bucket {
  background-color: #f4f4f5;
  border-radius: 10px;
  color: #000;
}
.naics-bucket-heading {
  appearance: none;
  border: 0;
  display: grid;
  gap: 2px;
  width: 100%;
  padding: 14px;
  background: transparent;
  color: #651D32;
  cursor: pointer;
  font: inherit;
  font-weight: 600;
  text-align: left;
}
.naics-bucket-heading small {
  color: rgba(0, 0, 0, 0.62);
  font-size: 14px;
  font-weight: 400;
}
.filter-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 12px 18px;
  padding: 2px 14px 14px;
}
.filter-option {
  color: #111;
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: start;
  gap: 9px;
  text-align: left;
  line-height: 1.2;
  cursor: pointer;
}
.filter-option span {
  text-align: left;
}
.filter-option.implied {
  color: #651D32;
  font-weight: 400;
}
</style>
