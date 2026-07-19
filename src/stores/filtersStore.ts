import { defineStore } from 'pinia';

type FilterStatus = 'hidden' | 'location' | 'sector'
type LocationFilterMode = 'state' | 'district'

// Tracks which filter panel should be visible. The string values map directly to
// the current filter UI modes.
export const useFiltersStore = defineStore('filterStore', {
  state: () => ({
    status: 'hidden' as FilterStatus,
    locationMode: 'state' as LocationFilterMode,
    collapsedCountryRegions: [] as string[],
    countryRegionsHaveInitialized: false,
    filterHistoryEntryPrepared: false
  }),
  actions: {
    toggleFiltersView(status: FilterStatus) {
      this.status = status;

      if (status === 'hidden') {
        this.filterHistoryEntryPrepared = false;
      }
    },
    prepareFilterHistoryEntry(currentPath: string) {
      if (this.filterHistoryEntryPrepared || typeof window === 'undefined') return;

      // Filter changes use router.replace while the modal is open. Push a
      // duplicate starting URL once so those replacements edit only the modal's
      // working history entry and the prior map state remains behind it.
      window.history.pushState(window.history.state, '', currentPath);
      this.filterHistoryEntryPrepared = true;
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
