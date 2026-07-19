import { defineStore } from 'pinia';
import { getDistricts, getStates } from '@/features/locations/api/locationDataSource';
import type { District, State } from '@/features/locations/types';

export const useLocationStore = defineStore('locationStore', {
  state: () => ({
    states: [] as State[],
    districts: [] as District[],
    error: null as string | null
  }),
  actions: {
    async loadStates() {
      if (this.states.length) return;

      this.error = null;

      try {
        this.states = await getStates();
      }
      catch (caughtError) {
        this.error = caughtError instanceof Error ? caughtError.message : 'Unable to load states';
      }
    },

    async loadDistricts() {
      if (this.districts.length) return;

      this.error = null;

      try {
        this.states = await getStates();
        this.districts = await getDistricts();
      }
      catch (caughtError) {
        this.error = caughtError instanceof Error ? caughtError.message : 'Unable to load congressional districts';
      }
    }
  }
});
