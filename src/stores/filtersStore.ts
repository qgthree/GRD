import { defineStore } from 'pinia';

type FilterStatus = 'hidden' | 'location' | 'sector'
type LocationFilterMode = 'state' | 'district'

// Tracks which filter panel should be visible. The string values map directly to
// the current filter UI modes.
export const useFiltersStore = defineStore('filterStore', {
  state: () => ({
    status: 'hidden' as FilterStatus,
    locationMode: 'state' as LocationFilterMode,
    collapsedDistrictStates: [] as string[],
    districtStatesHaveInitialized: false,
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
    initializeCollapsedDistrictStates(states: string[]) {
      if (this.districtStatesHaveInitialized) return;

      this.collapsedDistrictStates = states;
      this.districtStatesHaveInitialized = true;
    },
    toggleDistrictState(state: string) {
      this.collapsedDistrictStates = this.collapsedDistrictStates.includes(state)
        ? this.collapsedDistrictStates.filter((collapsedState) => collapsedState !== state)
        : [...this.collapsedDistrictStates, state];
    },
    isDistrictStateOpen(state: string) {
      return !this.collapsedDistrictStates.includes(state);
    }
  }
});
