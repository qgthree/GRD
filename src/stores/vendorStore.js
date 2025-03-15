import { defineStore } from 'pinia';
import { useLocationStore } from '@/stores/locationStore';

export const useVendorStore = defineStore('vendorStore', {
  state: () => ({
    vendors: [
      {
        "id": 1,
        "company_name": "Global Relief Logistics",
        "region": ["Global"],
        "subsectors": ["Disaster Logistics & Supply Chain", "Emergency Telecommunications"],
        "country_location": ["USA", "GBR", "DEU"],
        "city_/_subsidiary_location": "New York, USA",
        "primary_contact(s)": "Emma Carter",
        "phone": "+1 212-555-1010",
        "url": "https://globalrelieflogistics.com",
        "previously_used": true,
        "isVisible": false
      },
      {
        "id": 2,
        "company_name": "AquaSafe Purification",
        "region": ["Africa"],
        "subsectors": ["Water Filtration & Supply", "Sanitation & Hygiene Solutions"],
        "country_location": ["KEN", "ZAF"],
        "city_/_subsidiary_location": "Nairobi, Kenya",
        "primary_contact(s)": "James Ndlovu",
        "phone": "+254 20 555-2020",
        "url": "https://aquasafepurification.com",
        "previously_used": true,
        "isVisible": false
      },
      {
        "id": 3,
        "company_name": "RapidMed International",
        "region": ["MENAE"],
        "subsectors": ["Emergency Medical Response", "Field Hospitals"],
        "country_location": ["ARE", "SAU"],
        "city_/_subsidiary_location": "Dubai, UAE",
        "primary_contact(s)": "Dr. Aisha Al-Farsi",
        "phone": "+971 4 555-3030",
        "url": "https://rapidmedintl.com",
        "previously_used": true,
        "isVisible": false
      },
      {
        "id": 4,
        "company_name": "CrisisCom Networks",
        "region": ["Global"],
        "subsectors": ["Emergency Telecommunications", "Cybersecurity & Data Protection"],
        "country_location": ["USA", "AUS"],
        "city_/_subsidiary_location": "Los Angeles, USA",
        "primary_contact(s)": "Mark Robertson",
        "phone": "+1 310-555-4040",
        "url": "https://crisiscomnetworks.com",
        "previously_used": false,
        "isVisible": false
      },
      {
        "id": 5,
        "company_name": "ShelterNow Solutions",
        "region": ["ALAC"],
        "subsectors": ["Temporary Shelter Solutions", "Emergency Construction & Engineering"],
        "country_location": ["BRA", "MEX"],
        "city_/_subsidiary_location": "São Paulo, Brazil",
        "primary_contact(s)": "Ana Mendes",
        "phone": "+55 11 555-5050",
        "url": "https://shelternow.com",
        "previously_used": true,
        "isVisible": false
      },
      {
        "id": 6,
        "company_name": "MedSupply Global",
        "region": ["Global"],
        "subsectors": ["Emergency Medical Response", "Disease Prevention & Vaccination"],
        "country_location": ["USA", "FRA", "CAN"],
        "city_/_subsidiary_location": "Toronto, Canada",
        "primary_contact(s)": "Dr. Laura Chen",
        "phone": "+1 416-555-6060",
        "url": "https://medsupplyglobal.com",
        "previously_used": true,
        "isVisible": false
      },
      {
        "id": 7,
        "company_name": "RescueTech Drones",
        "region": ["Africa", "MENAE"],
        "subsectors": ["Search & Rescue Operations", "Structural Damage Assessment"],
        "country_location": ["NGA", "EGY"],
        "city_/_subsidiary_location": "Lagos, Nigeria",
        "primary_contact(s)": "Samuel Okoro",
        "phone": "+234 1 555-7070",
        "url": "https://rescuetechdrones.com",
        "previously_used": false,
        "isVisible": false
      },
      {
        "id": 8,
        "company_name": "Relief Energy Systems",
        "region": ["MENAE"],
        "subsectors": ["Renewable Energy & Power Supply", "Crisis Management Consulting"],
        "country_location": ["JOR", "TUR"],
        "city_/_subsidiary_location": "Amman, Jordan",
        "primary_contact(s)": "Omar Haddad",
        "phone": "+962 6 555-8080",
        "url": "https://reliefenergy.com",
        "previously_used": true,
        "isVisible": false
      }
    ],
    filteredVendors: [],
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
            vendor.country_location.includes(country.ISO3) ||
            // vendors that claim to operate globally
            vendor.region && vendor.region.includes('Global') ||
            // vendors that claim to operate in the region
            vendor.region && vendor.region.includes(country.region)
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
            vendor.country_location.includes(country.ISO3) ||
            // vendors that claim to operate globally
            vendor.region && vendor.region.includes('Global') ||
            // if there are no countries listed, it means the vendor claims to serve all of a region, including this country
            vendor.region && !vendor.country_location && vendor.region.includes(country.region)
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
          vendor.country_location.includes(country.ISO3) ||
          // vendors that claim to operate globally
          vendor.region && vendor.region.includes('Global') ||
          // vendors that claim to operate in a specific region
          vendor.region && vendor.region.includes(region)
        );
      }
      if (!region.includes('Global')) {
        return this.filteredVendors.filter(checker).length;
      }
      else {
        return this.filteredVendors.filter(vendor => vendor.region.includes('Global')).length;
      }
    },
    countryVendorCount(ISO3) {
      let country = useLocationStore().countries.find(ctr => ctr.ISO3 === ISO3);
      if (country) {
        let count = this.filteredVendors.filter(vendor =>
          // vendors that claim to operate in a specific country
          vendor.country_location && vendor.country_location.includes(country.ISO3) ||
          // vendors that claim to operate globally
          vendor.region && vendor.region.includes('Global') ||
          // vendors that claim to operate in a specific region (must not also name countries)
          vendor.region && !vendor.country_location && vendor.region.includes(country.region)
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
          vendor.country_location && vendor.country_location.includes(countries[i].name) ||
          // vendors that claim to operate globally
          vendor.region && vendor.region.includes('Global') ||
          // vendors that claim to operate in a specific region (must not also name countries)
          vendor.region && !vendor.country_location && vendor.region.includes(countries[i].region)
        ).length;
        countries[i].vendorCount = count;
      }
    }
    */
  }
});
