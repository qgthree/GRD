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
export interface VendorQuery {
  services?: string | string[] | null;
  region?: string | string[] | null;
  country?: string | string[] | null;
}
