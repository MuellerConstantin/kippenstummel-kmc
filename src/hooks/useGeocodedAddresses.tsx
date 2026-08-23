import { GeoCoordinates } from "@/lib/types/geo";
import { GeocodedAddress } from "@/lib/types/geocoding";
import { useCallback, useMemo } from "react";
import useSWR from "swr";
import axios from "axios";
import pLimit from "p-limit";
import { Cvm } from "@/lib/types/cvm";

interface UseGeocodedAddressesProps {
  cvms: Cvm[] | null;
}

export function useGeocodedAddresses({ cvms }: UseGeocodedAddressesProps) {
  const limit = pLimit(3);

  const fetchGeocodedAddress = useCallback(async (key: GeoCoordinates) => {
    const url = "/api/geocoding/reverse";

    return await axios.get<GeocodedAddress>(url, {
      params: {
        lat: key.latitude,
        lon: key.longitude,
        format: "json",
      },
      headers: {
        Accept: "application/json",
      },
    });
  }, []);

  const { data: geocodedAddresses } = useSWR<
    (GeocodedAddress | null)[],
    unknown,
    ["geocodedAddresses", GeoCoordinates[]] | null
  >(
    cvms
      ? [
          "geocodedAddresses",
          cvms.map((cvm) => ({
            latitude: cvm.latitude,
            longitude: cvm.longitude,
          })) || [],
        ]
      : null,
    (key) =>
      Promise.allSettled(
        key[1].map((coords) => limit(() => fetchGeocodedAddress(coords))),
      ).then((responses) =>
        responses.map((res) =>
          res.status === "fulfilled" ? res.value.data : null,
        ),
      ),
    {
      revalidateOnFocus: false,
      dedupingInterval: 1000 * 60 * 60 * 24, // 24h
    },
  );

  const formattedAddresses = useMemo(() => {
    return geocodedAddresses?.map((addr) => {
      if (!addr) return null;

      const { road, city, town, village, postcode } = addr.address ?? {};
      return [road, postcode, city || town || village]
        .filter(Boolean)
        .join(", ");
    });
  }, [geocodedAddresses]);

  return formattedAddresses;
}
