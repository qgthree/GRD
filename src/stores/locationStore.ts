import { defineStore } from 'pinia';
import { getDistricts, getStates } from '@/features/locations/api/locationDataSource';
import type { District, State } from '@/features/locations/types';

export const useLocationStore = defineStore('locationStore', {
  state: () => ({
    states: [] as State[],
    districts: [] as District[],
    loading: false,
    error: null as string | null
  }),
  actions: {
    async loadStates() {
      if (this.states.length || this.loading) return;

      this.loading = true;
      this.error = null;

      try {
        this.states = await getStates();
      }
      catch (caughtError) {
        this.error = caughtError instanceof Error ? caughtError.message : 'Unable to load states';
      }
      finally {
        this.loading = false;
      }
    },

    async loadDistricts() {
      if (this.districts.length || this.loading) return;

      this.loading = true;
      this.error = null;

      try {
        this.states = await getStates();
        this.districts = await getDistricts();
      }
      catch (caughtError) {
        this.error = caughtError instanceof Error ? caughtError.message : 'Unable to load congressional districts';
      }
      finally {
        this.loading = false;
      }
    }
  }
});
