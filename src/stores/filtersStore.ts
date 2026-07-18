import { defineStore } from 'pinia';

type FilterStatus = 'hidden' | 'location' | 'sector'

// Tracks which filter panel should be visible. The string values map directly to
// the current filter UI modes.
export const useFiltersStore = defineStore('filterStore', {
  state: () => ({
    status: 'hidden' as FilterStatus
  }),
  actions: {
    toggleFiltersView(status: FilterStatus) {
      this.status = status;
    }
  }
});
