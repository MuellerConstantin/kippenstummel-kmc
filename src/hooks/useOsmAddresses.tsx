import { GeoCoordinates } from "@/lib/types/geo";
import { useCallback, useMemo } from "react";
import useSWR from "swr";
import axios from "axios";
import pLimit from "p-limit";
import { Cvm } from "@/lib/types/cvm";

interface UseOsmAddressesProps {
  cvms: Cvm[] | null;
}

type OsmAddress = {
  place_id: number;
  licence: string;
  osm_type: "node" | "way" | "relation";
  osm_id: number;
  lat: string;
  lon: string;
  class: string;
  type: string;
  place_rank: number;
  importance: number;
  addresstype: string;
  name: string;
  display_name: string;
  address: {
    amenity?: string;
    road?: string;
    neighbourhood?: string;
    suburb?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    ISO3166_2_lvl4?: string;
    postcode?: string;
    country?: string;
    country_code?: string;
  };
  boundingbox: [
    string, // south latitude
    string, // north latitude
    string, // west longitude
    string, // east longitude
  ];
};

export function useOsmAddresses({ cvms }: UseOsmAddressesProps) {
  const limit = pLimit(3);

  const fetchOsmAddress = useCallback(async (key: GeoCoordinates) => {
    const url = "/api/geocoding/reverse";

    return await axios.get<OsmAddress>(url, {
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

  const { data: osmAddresses } = useSWR<
    (OsmAddress | null)[],
    unknown,
    ["osmAddresses", GeoCoordinates[]] | null
  >(
    cvms
      ? [
          "osmAddresses",
          cvms.map((cvm) => ({
            latitude: cvm.latitude,
            longitude: cvm.longitude,
          })) || [],
        ]
      : null,
    (key) =>
      Promise.allSettled(
        key[1].map((coords) => limit(() => fetchOsmAddress(coords))),
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
    return osmAddresses?.map((addr) => {
      if (!addr) return null;

      const { road, city, town, village, postcode } = addr.address ?? {};
      return [road, postcode, city || town || village]
        .filter(Boolean)
        .join(", ");
    });
  }, [osmAddresses]);

  return formattedAddresses;
}
