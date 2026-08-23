import {
  GeocodedAddress,
  GeocodedAddressComponents,
} from "@/lib/types/geocoding";

interface NominatimReverseResult {
  display_name?: string;
  address?: {
    amenity?: string;
    house_number?: string;
    road?: string;
    neighbourhood?: string;
    suburb?: string;
    city_district?: string;
    city?: string;
    town?: string;
    village?: string;
    hamlet?: string;
    municipality?: string;
    county?: string;
    state?: string;
    postcode?: string;
    country?: string;
    country_code?: string;
  };
}

function toComponents(
  address: NonNullable<NominatimReverseResult["address"]>,
): GeocodedAddressComponents {
  return {
    amenity: address.amenity,
    houseNumber: address.house_number,
    road: address.road,
    neighbourhood: address.neighbourhood,
    suburb: address.suburb,
    cityDistrict: address.city_district,
    city: address.city,
    town: address.town,
    village: address.village,
    hamlet: address.hamlet,
    municipality: address.municipality,
    county: address.county,
    state: address.state,
    postcode: address.postcode,
    country: address.country,
    countryCode: address.country_code,
  };
}

/**
 * Maps a raw Nominatim reverse response body into the application's own
 * address model.
 */
export function toGeocodedAddress(body: string): GeocodedAddress | null {
  let parsed: NominatimReverseResult;

  try {
    parsed = JSON.parse(body) as NominatimReverseResult;
  } catch {
    return null;
  }

  if (!parsed.display_name || !parsed.address) {
    return null;
  }

  return {
    displayName: parsed.display_name,
    address: toComponents(parsed.address),
  };
}
