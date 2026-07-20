import { defineStore } from 'pinia';
import { useLocationStore } from '@/stores/locationStore';
import { getVendors } from '@/features/vendors/api/vendorDataSource';
import type { Vendor, VendorQuery } from '@/features/vendors/types';
import { selectedFilterQueryValues } from '@/utils/query';
import {
  selectedDistrictGeoidsFromQuery,
  selectedStateNamesFromQuery
} from '@/features/locations/utils/locationQuery';
import {
  vendorProvidesService,
  vendorServesDistrict,
  vendorServesState
} from '@/features/vendors/utils/vendorCoverage';

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

    async updateVendors(query: VendorQuery) {
      const locationStore = useLocationStore();

      await locationStore.loadDistricts();
      await this.loadVendors();

      const services = selectedFilterQueryValues(query, 'services');
      const excludedServices = selectedFilterQueryValues(query, 'servicesExclude');
      const states = selectedStateNamesFromQuery(query, locationStore.states);
      const districts = selectedDistrictGeoidsFromQuery(query, locationStore.districts);
      let urlFilteredVendors: Vendor[] = [];

      // Start with all vendors unless the URL asks for specific services.
      if (!services.length) {
        urlFilteredVendors = this.vendors;
      }
      else {
        const checker = (vendor: Vendor) => {
          return services.some(service =>
            vendorProvidesService(vendor, service, excludedServices)
          );
        }
        urlFilteredVendors = this.vendors.filter(checker);
      }

      if (states.length) {
        const districtList = locationStore.districts.filter(district => states.includes(district.state));
        const checker = (vendor: Vendor) => {
          return states.some(state => vendorServesState(vendor, state, districtList));
        }
        urlFilteredVendors = urlFilteredVendors.filter(checker);
      }

      if (districts.length) {
        const districtList = locationStore.districts.filter(district => districts.includes(district.geoid));
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
      const districtList = useLocationStore().districts.filter(district => state === district.state);
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
    districtVendorCount(geoid: string) {
      const district = useLocationStore().districts.find(district => district.geoid === geoid);
      if (district) {
        return this.filteredVendors.filter(vendor => vendorServesDistrict(vendor, district)).length;
      }
    }
  }
});
