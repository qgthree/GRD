import { defineStore } from 'pinia';
import { useLocationStore } from '@/stores/locationStore';

export const useVendorStore = defineStore('vendorStore', {
  state: () => ({
    vendors: null,
    filteredVendors: null,
    loading: false,
    error: null,
    show: true
  }),
  actions: {

    // removed vendor fetch

    async updateVendors(query) {
      const services = !query[0].services ? false : query[0].services.split(",");
      const regions = !query[0].region ? false : query[0].region.split(",");
      const countries = !query[0].country ? false : query[0].country.split(",");
      let urlFilteredVendors = [];

      // filter for services provided in url
      if (!services) {
        urlFilteredVendors = this.vendors;
      }
      else {
        const checker = (vendor) => {
          return services.some(service =>
            vendor.subsectors.join(',').toLowerCase().includes(service.toLowerCase())
          );
        }
        urlFilteredVendors = this.vendors.filter(checker);
      }

      // filter for regions provided in url
      if (regions) {
        const countryList = useLocationStore().countries.filter(country => regions.includes(country.region));
        const checker = (vendor) => {
          return countryList.some(country =>
            // vendors that claim to operate in at least one country that falls within the region
            vendor.country_location.split(", ").includes(country.name) ||
            // vendors that claim to operate globally
            vendor.region && vendor.region.split(", ").includes('Global') ||
            // vendors that claim to operate in the region
            vendor.region && vendor.region.split(", ").includes(country.region)
          );
        }
        urlFilteredVendors = urlFilteredVendors.filter(checker);
      }

      // filter for countries provided in url
      if (countries) {
        const countryList = useLocationStore().countries.filter(country => countries.includes(country.ISO3));
        const checker = (vendor) => {
          return countryList.some(country =>
            // vendors that claim to operate in the countries provided in url filtering
            vendor.country_location.split(", ").includes(country.name) ||
            // vendors that claim to operate globally
            vendor.region && vendor.region.split(", ").includes('Global') ||
            // if there are no countries listed, it means the vendor claims to serve all of a region, including this country
            vendor.region && !vendor.country_location && vendor.region.split(", ").includes(country.region)
          );
        }
        urlFilteredVendors = urlFilteredVendors.filter(checker);
      }

      return this.filteredVendors = urlFilteredVendors;
    },
    toggleVendors() {
      this.show = !this.show;
    },
    regionVendorCount(region) {
      const countryList = useLocationStore().countries.filter(country => region === country.region);
      const checker = (vendor) => {
        return countryList.some(country =>
          // vendors that claim to operate in at least one country that falls within the region
          vendor.country_location.split(", ").includes(country.name) ||
          // vendors that claim to operate globally
          vendor.region && vendor.region.split(", ").includes('Global') ||
          // vendors that claim to operate in a specific region
          vendor.region && vendor.region.split(", ").includes(region)
        );
      }
      if (region !== 'Global') {
        return this.filteredVendors.filter(checker).length;
      }
      else {
        return this.filteredVendors.filter(vendor => vendor.region === 'Global').length;
      }
    },
    countryVendorCount(ISO3) {
      let country = useLocationStore().countries.find(ctr => ctr.ISO3 === ISO3);
      if (country) {
        let count = this.filteredVendors.filter(vendor =>
          // vendors that claim to operate in a specific country
          vendor.country_location && vendor.country_location.split(", ").includes(country.name) ||
          // vendors that claim to operate globally
          vendor.region && vendor.region.split(", ").includes('Global') ||
          // vendors that claim to operate in a specific region (must not also name countries)
          vendor.region && !vendor.country_location && vendor.region.split(", ").includes(country.region)
        ).length;
        country.vendorCount = count;
        return count;
      }
    }
    /*
    countCountryVendors() {
      let countries = useLocationStore().countries;
      let i = 0
      let len = countries.length
      for (; i < len; i++) {
        let count = this.filteredVendors.filter(vendor =>
          // vendors that claim to operate in a specific country
          vendor.country_location && vendor.country_location.split(", ").includes(countries[i].name) ||
          // vendors that claim to operate globally
          vendor.region && vendor.region.split(", ").includes('Global') ||
          // vendors that claim to operate in a specific region (must not also name countries)
          vendor.region && !vendor.country_location && vendor.region.split(", ").includes(countries[i].region)
        ).length;
        countries[i].vendorCount = count;
      }
    }
    */
  }
});
