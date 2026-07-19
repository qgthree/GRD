export interface Region {
  name: string;
  code: string;
}

export interface Country {
  name: string;
  ISO3: string;
  region: string;
  type: string;
  vendorCount?: number;
}
