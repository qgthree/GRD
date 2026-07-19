export interface State {
  name: string;
  code: string;
}

export interface District {
  name: string;
  geoid: string;
  state: string;
  type: string;
  vendorCount?: number;
}
