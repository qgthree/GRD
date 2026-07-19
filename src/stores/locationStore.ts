import { defineStore } from 'pinia';
import { getCountries, getRegions } from '@/features/locations/api/locationDataSource';
import type { Country, Region } from '@/features/locations/types';

export const useLocationStore = defineStore('locationStore', {
  state: () => ({
    regions: [] as Region[],
    countries: [] as Country[],
    loading: false,
    error: null as string | null
  }),
  actions: {
    async loadRegions() {
      if (this.regions.length || this.loading) return;

      this.loading = true;
      this.error = null;

      try {
        this.regions = await getRegions();
      }
      catch (caughtError) {
        this.error = caughtError instanceof Error ? caughtError.message : 'Unable to load states';
      }
      finally {
        this.loading = false;
      }
    },

    async loadCountries() {
      if (this.countries.length || this.loading) return;

      this.loading = true;
      this.error = null;

      try {
        this.regions = await getRegions();
        this.countries = await getCountries();
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
