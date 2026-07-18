import { defineStore } from 'pinia';
import { countries } from '@/data/countries';

// Country metadata is local data for now. Clone each record into state so any
// UI-specific additions do not mutate the imported source array.
export const useLocationStore = defineStore('locationStore', {
  state: () => ({
    updated: false,
    countries: countries.map((country) => ({ ...country }))
  })
});
