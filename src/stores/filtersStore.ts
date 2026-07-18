import { defineStore } from 'pinia';

type FilterStatus = 'hidden' | 'location' | 'sector'
type LocationFilterMode = 'region' | 'country'

// Tracks which filter panel should be visible. The string values map directly to
// the current filter UI modes.
export const useFiltersStore = defineStore('filterStore', {
  state: () => ({
    status: 'hidden' as FilterStatus,
    locationMode: 'region' as LocationFilterMode,
    collapsedCountryRegions: [] as string[],
    countryRegionsHaveInitialized: false
  }),
  actions: {
    toggleFiltersView(status: FilterStatus) {
      this.status = status;
    },
    setLocationMode(mode: LocationFilterMode) {
      this.locationMode = mode;
    },
    initializeCollapsedCountryRegions(regions: string[]) {
      if (this.countryRegionsHaveInitialized) return;

      this.collapsedCountryRegions = regions;
      this.countryRegionsHaveInitialized = true;
    },
    toggleCountryRegion(region: string) {
      this.collapsedCountryRegions = this.collapsedCountryRegions.includes(region)
        ? this.collapsedCountryRegions.filter((collapsedRegion) => collapsedRegion !== region)
        : [...this.collapsedCountryRegions, region];
    },
    isCountryRegionOpen(region: string) {
      return !this.collapsedCountryRegions.includes(region);
    }
  }
});
