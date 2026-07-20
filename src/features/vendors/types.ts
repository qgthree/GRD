import type { LocationQuery } from 'vue-router';

export interface Vendor {
  id: number;
  company_name: string;
  state: string[];
  subsectors: string[];
  district_location: string[];
  'city_/_subsidiary_location': string;
  'primary_contact(s)'?: string;
  phone?: string;
  url?: string;
  email?: string;
  previously_used: boolean;
  isVisible: boolean;
}

// Vendor filters are read from the route query, including compact and legacy keys.
export type VendorQuery = LocationQuery;
