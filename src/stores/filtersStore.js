import { defineStore } from 'pinia';

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