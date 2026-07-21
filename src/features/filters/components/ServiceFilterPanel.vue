<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useFilterQuery } from '@/features/filters/composables/useFilterQuery'
import close from '@/assets/images/close.svg'
import { loadNaicsCodes } from '@/features/naics/api/naicsDataSource'
import {
  isNaicsCodeChecked,
  isNaicsCodeImpliedByDescendant,
  sortNaicsCodes,
  toggleNaicsSelection
} from '@/features/naics/utils/naicsCodes'
import { createNaicsBuckets } from '@/features/naics/utils/naicsCatalog'
import { useFiltersStore } from '@/stores/filtersStore'
import { queryValueFromList } from '@/utils/query'
import type { NaicsCode } from '@/features/naics/types'
import type { NaicsBucket } from '@/features/naics/utils/naicsCatalog'

const minSearchCharacters = 2
const maxSearchResults = 10
const maxSearchResultsPerBucket = 2

const { selectedValues, updateQuery } = useFilterQuery()
const filtersStore = useFiltersStore()
const searchTerm = ref('')
const isSearchDropdownOpen = ref(false)
const searchPanel = ref<HTMLElement | null>(null)
const naicsBuckets = ref<NaicsBucket[]>([])
const isNaicsLoading = ref(false)

const selectedServices = selectedValues('services')
const excludedServices = selectedValues('servicesExclude')
const normalizedSearchTerm = computed(() => searchTerm.value.trim().toLowerCase())
const isSearching = computed(() => normalizedSearchTerm.value.length >= minSearchCharacters)
const showSearchDropdown = computed(() => {
  return isSearchDropdownOpen.value && isSearching.value
})

const isNaicsChecked = (code: NaicsCode) => {
  return isNaicsCodeChecked(code.code, selectedServices.value, excludedServices.value)
}

const isNaicsImpliedByDescendant = (code: NaicsCode) => {
  return isNaicsCodeImpliedByDescendant(code.code, selectedServices.value)
}

const selectedCountsByBucketLevel = computed(() => {
  return new Map(naicsBuckets.value.map((bucket) => [
    bucket.level,
    bucket.codes.filter((code) => isNaicsChecked(code)).length
  ]))
})

const selectedNaicsCountForBucket = (bucket: NaicsBucket) => {
  return selectedCountsByBucketLevel.value.get(bucket.level) ?? 0
}

const searchResultBuckets = computed(() => {
  if (!isSearching.value) return []

  // Search is a temporary picker mode, separate from the one-open-bucket
  // accordion. Results depend only on the search text so checking a box does
  // not reshuffle the dropdown while the user is acting on it.
  const buckets: NaicsBucket[] = []
  let remainingResults = maxSearchResults

  for (const bucket of naicsBuckets.value) {
    if (!remainingResults) break

    const codes = bucket.codes
      .filter((code) => {
        return `${code.code} ${code.title}`.toLowerCase().includes(normalizedSearchTerm.value)
      })
      .slice(0, Math.min(maxSearchResultsPerBucket, remainingResults))

    if (!codes.length) continue

    buckets.push({ ...bucket, codes })
    remainingResults -= codes.length
  }

  return buckets
})

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

const scrollBucketToTop = async (heading: HTMLElement) => {
  // Bucket contents scroll in the modal body, so align the opened bucket with
  // that container instead of the page.
  const scrollContainer = heading.closest<HTMLElement>('.modal-content')
  const bucket = heading.closest<HTMLElement>('.naics-bucket')

  if (!scrollContainer || !bucket) return

  await nextTick()

  const containerBounds = scrollContainer.getBoundingClientRect()
  const bucketBounds = bucket.getBoundingClientRect()

  scrollContainer.scrollTo({
    top: scrollContainer.scrollTop + bucketBounds.top - containerBounds.top,
    behavior: 'auto'
  })
}

const toggleNaicsBucket = (bucket: NaicsBucket, event: MouseEvent) => {
  const isOpening = !filtersStore.isNaicsBucketOpen(bucket.level)
  const currentBucketIndex = naicsBuckets.value.findIndex((naicsBucket) => naicsBucket.level === bucket.level)
  const openBucketIndex = naicsBuckets.value.findIndex((naicsBucket) => (
    naicsBucket.level === filtersStore.openNaicsBucketLevel
  ))
  // When a bucket above the clicked one collapses, the clicked heading can move
  // out of view. Jump only for that accordion-specific case.
  const shouldJumpToTop = isOpening && openBucketIndex > -1 && openBucketIndex < currentBucketIndex

  filtersStore.toggleNaicsBucket(bucket.level)

  if (shouldJumpToTop) {
    void scrollBucketToTop(event.currentTarget as HTMLElement)
  }
}

const openSearchDropdown = () => {
  isSearchDropdownOpen.value = true
}

const closeSearchDropdown = () => {
  isSearchDropdownOpen.value = false
}

const closeSearchDropdownOnOutsideClick = (event: MouseEvent) => {
  if (!isSearchDropdownOpen.value || !(event.target instanceof Node)) return

  // The dropdown is a floating layer attached to the search panel. Keep it open
  // for clicks inside that layer and close it for any other modal click.
  if (searchPanel.value?.contains(event.target)) return

  closeSearchDropdown()
}

const closeSearchDropdownOnFocusLeave = (event: FocusEvent) => {
  if (!isSearchDropdownOpen.value) return

  const nextFocusedElement = event.relatedTarget
  if (nextFocusedElement instanceof Node && searchPanel.value?.contains(nextFocusedElement)) return

  closeSearchDropdown()
}

const loadNaicsCatalog = async () => {
  if (naicsBuckets.value.length || isNaicsLoading.value) return

  isNaicsLoading.value = true

  try {
    // The sector panel is the first UI that needs the full NAICS catalog. Load
    // it here so the initial app route does not eagerly pull every code.
    naicsBuckets.value = createNaicsBuckets(await loadNaicsCodes())
  }
  finally {
    isNaicsLoading.value = false
  }
}

onMounted(() => {
  void loadNaicsCatalog()
  document.addEventListener('click', closeSearchDropdownOnOutsideClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeSearchDropdownOnOutsideClick)
})

</script>

<template>
  <div
    ref="searchPanel"
    class="sector-search-panel"
    @focusout="closeSearchDropdownOnFocusLeave"
    @keydown.escape.stop.prevent="closeSearchDropdown"
  >
    <div class="sector-search-control">
      <input
        id="sector-search"
        v-model="searchTerm"
        class="sector-search-input"
        type="text"
        role="searchbox"
        aria-label="Search NAICS codes"
        :aria-expanded="showSearchDropdown"
        aria-controls="sector-search-dropdown"
        autocomplete="off"
        autocapitalize="off"
        autocorrect="off"
        spellcheck="false"
        placeholder="Search code or title"
        @focus="openSearchDropdown"
        @input="openSearchDropdown"
      />
      <button
        v-if="searchTerm"
        class="sector-search-clear"
        type="button"
        aria-label="Clear sector search"
        @click="searchTerm = ''"
      >
        <img :src="close" alt="" />
      </button>
    </div>

    <div v-if="showSearchDropdown" id="sector-search-dropdown" class="sector-search-dropdown">
      <p v-if="isNaicsLoading" class="empty-search-results">Loading NAICS codes.</p>
      <template v-else>
        <section
          class="search-result-group"
          v-for="bucket in searchResultBuckets"
          :key="`search-${bucket.level}`"
        >
          <h3>{{ bucket.title }}</h3>
          <div class="filter-options compact">
            <label
              class="filter-option"
              :class="{ implied: isNaicsImpliedByDescendant(code) }"
              v-for="code in bucket.codes"
              :key="`search-${code.code}`"
            >
              <input
                type="checkbox"
                :checked="isNaicsChecked(code)"
                @change="toggleNaicsCode(code)" />
              <span>{{ code.code }} {{ code.title }}</span>
            </label>
          </div>
        </section>
        <p v-if="!searchResultBuckets.length" class="empty-search-results">No matching NAICS codes.</p>
      </template>
    </div>
  </div>

  <p v-if="isNaicsLoading" class="empty-search-results">Loading NAICS codes.</p>
  <div v-else class="naics-buckets">
    <section
      class="naics-bucket"
      v-for="bucket in naicsBuckets"
      :key="bucket.level"
    >
      <button
        class="naics-bucket-heading"
        type="button"
        :aria-expanded="filtersStore.isNaicsBucketOpen(bucket.level)"
        @click="toggleNaicsBucket(bucket, $event)"
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
.sector-search-panel {
  position: relative;
  z-index: 2;
  margin-bottom: 16px;
  padding: 6px 10px;
  background: #fff;
  border: 1px solid #e4e4e7;
  border-radius: 10px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.04);
  text-align: left;
}
.sector-search-control {
  position: relative;
}
.sector-search-input {
  width: 100%;
  border: 0;
  border-radius: 8px;
  background: #fff;
  color: #1f1f1f;
  font: inherit;
  padding: 5px 30px 5px 2px;
}
.sector-search-input:focus {
  outline: none;
}
.sector-search-clear {
  appearance: none;
  position: absolute;
  top: 50%;
  right: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: #dedee1;
  color: #1f1f1f;
  cursor: pointer;
  transform: translateY(-50%);
}
.sector-search-clear img {
  display: block;
  width: 16px;
  height: 16px;
  filter: brightness(0) saturate(100%) invert(11%) sepia(1%) saturate(0%) hue-rotate(319deg) brightness(94%) contrast(90%);
}
.sector-search-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  left: 0;
  display: grid;
  gap: 12px;
  max-height: min(360px, 56dvh);
  padding: 12px;
  overflow: auto;
  overscroll-behavior: none;
  background: #fff;
  border: 1px solid #e4e4e7;
  border-radius: 10px;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.08);
}
.search-result-group {
  display: grid;
  gap: 10px;
}
.search-result-group h3 {
  color: var(--color-purple);
  font-size: 15px;
  font-weight: 600;
  line-height: 1.2;
  margin: 0;
}
.search-result-group .filter-options {
  grid-template-columns: 1fr;
}
.empty-search-results {
  margin: 0;
  color: rgba(0, 0, 0, 0.66);
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
  color: #1f1f1f;
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
.filter-options.compact {
  padding: 0;
}
.filter-option {
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
  color: rgb(83, 65, 152);
  font-weight: 400;
}
</style>
