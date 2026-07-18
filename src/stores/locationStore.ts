import { defineStore } from 'pinia';
import { getCountries } from '@/features/locations/api/locationDataSource';
import type { Country } from '@/features/locations/types';

export const useLocationStore = defineStore('locationStore', {
  state: () => ({
    countries: [] as Country[],
    loading: false,
    error: null as string | null
  }),
  actions: {
    async loadCountries() {
      if (this.countries.length || this.loading) return;

      this.loading = true;
      this.error = null;

      try {
        this.countries = await getCountries();
      }
      catch (caughtError) {
        this.error = caughtError instanceof Error ? caughtError.message : 'Unable to load countries';
      }
      finally {
        this.loading = false;
      }
    }
  }
});
