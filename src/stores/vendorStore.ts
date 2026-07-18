import { defineStore } from 'pinia';
import { useLocationStore } from '@/stores/locationStore';
import { getVendors } from '@/features/vendors/api/vendorDataSource';
import type { Vendor, VendorQuery } from '@/features/vendors/types';
import {
  vendorProvidesService,
  vendorServesCountry,
  vendorServesRegion
} from '@/features/vendors/utils/vendorCoverage';

const queryList = (value: VendorQuery[keyof VendorQuery]) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  return value ? value.split(',').filter(Boolean) : [];
}

export const useVendorStore = defineStore('vendorStore', {
  state: () => ({
    // Loaded through a data source so local seed data can become API data later.
    vendors: [] as Vendor[],
    filteredVendors: [] as Vendor[],
    loading: false,
    error: null as string | null,
    show: true
  }),
  actions: {
    async loadVendors() {
      if (this.vendors.length || this.loading) return;

      this.loading = true;
      this.error = null;

      try {
        this.vendors = await getVendors();
      }
      catch (caughtError) {
        this.error = caughtError instanceof Error ? caughtError.message : 'Unable to load vendors';
      }
      finally {
        this.loading = false;
      }
    },

    async updateVendors(query: VendorQuery[]) {
      await useLocationStore().loadCountries();
      await this.loadVendors();

      // Route watchers pass query objects in an array today. The first item is
      // the active query state used to filter the local vendor list.
      const activeQuery = query[0] ?? {};
      const services = queryList(activeQuery.services);
      const regions = queryList(activeQuery.region);
      const countries = queryList(activeQuery.country);
      let urlFilteredVendors: Vendor[] = [];

      // Start with all vendors unless the URL asks for specific services.
      if (!services.length) {
        urlFilteredVendors = this.vendors;
      }
      else {
        const checker = (vendor: Vendor) => {
          return services.some(service =>
            vendorProvidesService(vendor, service)
          );
        }
        urlFilteredVendors = this.vendors.filter(checker);
      }

      // Region filters include vendors that serve any country in the selected
      // regions, vendors that name the region, and global vendors.
      if (regions.length) {
        const countryList = useLocationStore().countries.filter(country => regions.includes(country.region));
        const checker = (vendor: Vendor) => {
          return regions.some(region => vendorServesRegion(vendor, region, countryList));
        }
        urlFilteredVendors = urlFilteredVendors.filter(checker);
      }

      // Country filters are narrower, but still include global vendors and
      // region-wide vendors when they do not list countries individually.
      if (countries.length) {
        const countryList = useLocationStore().countries.filter(country => countries.includes(country.ISO3));
        const checker = (vendor: Vendor) => {
          return countryList.some(country => vendorServesCountry(vendor, country));
        }
        urlFilteredVendors = urlFilteredVendors.filter(checker);
      }

      return this.filteredVendors = urlFilteredVendors;
    },
    toggleVendors() {
      this.show = !this.show;
    },
    regionVendorCount(region: string) {
      // Tooltip counts should reflect the already-filtered vendor list so map
      // counts stay aligned with the visible vendor panel.
      const countryList = useLocationStore().countries.filter(country => region === country.region);
      const checker = (vendor: Vendor) => {
        return vendorServesRegion(vendor, region, countryList);
      }
      if (!region.includes('Global')) {
        return this.filteredVendors.filter(checker).length;
      }
      else {
        return this.filteredVendors.filter(vendor => vendor.region.includes('Global')).length;
      }
    },
    countryVendorCount(ISO3: string) {
      // Country counts are computed without mutating the country store.
      const country = useLocationStore().countries.find(ctr => ctr.ISO3 === ISO3);
      if (country) {
        return this.filteredVendors.filter(vendor => vendorServesCountry(vendor, country)).length;
      }
    }
  }
});
