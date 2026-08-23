/**
 * The components of a reverse geocoded address.
 */
export interface GeocodedAddressComponents {
  amenity?: string;
  houseNumber?: string;
  road?: string;
  neighbourhood?: string;
  suburb?: string;
  cityDistrict?: string;
  city?: string;
  town?: string;
  village?: string;
  hamlet?: string;
  municipality?: string;
  county?: string;
  state?: string;
  postcode?: string;
  country?: string;
  countryCode?: string;
}

export interface GeocodedAddress {
  /** The full address as one preformatted line, in the local language. */
  displayName: string;
  address: GeocodedAddressComponents;
}
