import { defineStore } from 'pinia';
import { useLocationStore } from '@/stores/locationStore';
import {
  vendorProvidesService,
  vendorServesCountry,
  vendorServesRegion
} from '@/features/vendors/utils/vendorCoverage';

export interface Vendor {
  id: number;
  company_name: string;
  region: string[];
  subsectors: string[];
  country_location: string[];
  'city_/_subsidiary_location': string;
  'primary_contact(s)'?: string;
  phone?: string;
  url?: string;
  email?: string;
  previously_used: boolean;
  isVisible: boolean;
}

// These fields mirror the current URL query filters.
interface VendorQuery {
  services?: string;
  region?: string;
  country?: string;
}

export const useVendorStore = defineStore('vendorStore', {
  state: () => ({
    // Local seed data for now; this is the obvious future replacement point for
    // API/database-backed vendor data.
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
    filteredVendors: [] as Vendor[],
    loading: false,
    error: null as string | null,
    show: true
  }),
  actions: {

    // removed vendor fetch

    async updateVendors(query: VendorQuery[]) {
      // Route watchers pass query objects in an array today. The first item is
      // the active query state used to filter the local vendor list.
      const services = !query[0].services ? false : query[0].services.split(",");
      const regions = !query[0].region ? false : query[0].region.split(",");
      const countries = !query[0].country ? false : query[0].country.split(",");
      let urlFilteredVendors: Vendor[] = [];

      // Start with all vendors unless the URL asks for specific services.
      if (!services) {
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
      if (regions) {
        const countryList = useLocationStore().countries.filter(country => regions.includes(country.region));
        const checker = (vendor: Vendor) => {
          return regions.some(region => vendorServesRegion(vendor, region, countryList));
        }
        urlFilteredVendors = urlFilteredVendors.filter(checker);
      }

      // Country filters are narrower, but still include global vendors and
      // region-wide vendors when they do not list countries individually.
      if (countries) {
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
