export interface State {
  name: string;
  code: string;
  abbreviation: string;
}

export interface District {
  name: string;
  geoid: string;
  state: string;
  stateAbbreviation: string;
  districtCode: string;
  type: string;
  vendorCount?: number;
}
