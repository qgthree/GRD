import { defineStore } from 'pinia';
import { useLocationStore } from '@/stores/locationStore';
import { getVendors } from '@/features/vendors/api/vendorDataSource';
import type { Vendor, VendorQuery } from '@/features/vendors/types';
import {
  vendorProvidesService,
  vendorServesDistrict,
  vendorServesState
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
      const states = queryList(activeQuery.state);
      const districts = queryList(activeQuery.district);
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

      if (states.length) {
        const districtList = useLocationStore().countries.filter(district => states.includes(district.region));
        const checker = (vendor: Vendor) => {
          return states.some(state => vendorServesState(vendor, state, districtList));
        }
        urlFilteredVendors = urlFilteredVendors.filter(checker);
      }

      if (districts.length) {
        const districtList = useLocationStore().countries.filter(district => districts.includes(district.ISO3));
        const checker = (vendor: Vendor) => {
          return districtList.some(district => vendorServesDistrict(vendor, district));
        }
        urlFilteredVendors = urlFilteredVendors.filter(checker);
      }

      return this.filteredVendors = urlFilteredVendors;
    },
    toggleVendors() {
      this.show = !this.show;
    },
    stateVendorCount(state: string) {
      const districtList = useLocationStore().countries.filter(district => state === district.region);
      const checker = (vendor: Vendor) => {
        return vendorServesState(vendor, state, districtList);
      }
      if (!state.includes('Global')) {
        return this.filteredVendors.filter(checker).length;
      }
      else {
        return this.filteredVendors.filter(vendor => vendor.state.includes('Global')).length;
      }
    },
    districtVendorCount(ISO3: string) {
      const district = useLocationStore().countries.find(ctr => ctr.ISO3 === ISO3);
      if (district) {
        return this.filteredVendors.filter(vendor => vendorServesDistrict(vendor, district)).length;
      }
    }
  }
});
