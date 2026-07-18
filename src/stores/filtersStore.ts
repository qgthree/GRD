import { defineStore } from 'pinia';

// Tracks which filter panel should be visible. The string values map directly to
// the current filter UI modes.
export const useFiltersStore = defineStore('filterStore', {
  state: () => ({
    status: 'hidden'
  }),
  actions: {
    toggleFiltersView(status) {
      this.status = status;
    }
  }
});
