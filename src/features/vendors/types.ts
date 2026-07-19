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

// These fields mirror the current URL query filters.
export interface VendorQuery {
  services?: string | string[] | null;
  state?: string | string[] | null;
  district?: string | string[] | null;
}
