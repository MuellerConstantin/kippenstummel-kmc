import { useMemo } from "react";
import useSWR from "swr";
import { AxiosError } from "axios";
import useApi from "@/hooks/useApi";
import { ApiError } from "@/lib/types/error";
import { GeocodedAddress } from "@/lib/types/geocoding";

/**
 * Uncached addresses are resolved upstream at one request per second across the
 * whole application, so a request can sit in that queue for a while: the
 * client's default timeout is too tight for it.
 */
const REQUEST_TIMEOUT_MS = 30000;

export function useCvmAddress(cvmId: string | null) {
  const api = useApi();

  const { data, isLoading, error } = useSWR<
    GeocodedAddress,
    AxiosError<ApiError>,
    string | null
  >(
    cvmId ? `/kmc/cvms/${cvmId}/address` : null,
    (url) =>
      api.get(url, { timeout: REQUEST_TIMEOUT_MS }).then((res) => res.data),
    {
      revalidateOnFocus: false,
      dedupingInterval: 1000 * 60 * 60 * 24, // 24h
    },
  );

  const formatted = useMemo(() => {
    if (!data) {
      return null;
    }

    const { road, city, town, village, hamlet, municipality, postcode } =
      data.address ?? {};

    /*
     * Which field carries the place name depends on how it is classified in
     * OSM. Municipalities that are only an administrative unit — Albstadt,
     * for one — carry none of the settlement fields, so falling back to
     * `municipality` is what keeps the place name from dropping out.
     */
    const locality = city || town || village || hamlet || municipality;

    return [road, postcode, locality].filter(Boolean).join(", ");
  }, [data]);

  return { address: formatted, isLoading, error };
}
