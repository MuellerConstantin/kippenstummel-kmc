import { useMemo } from "react";
import useSWR, { SWRConfiguration } from "swr";
import { AxiosError } from "axios";
import { latLonToTile, tileToLatLon } from "@/lib/geo";
import useApi from "./useApi";
import { CvmCluster, Cvm } from "@/lib/types/cvm";
import { ApiError } from "@/lib/types/error";
import { GeoCoordinates } from "@/lib/types/geo";

export interface UseMapViewportCvmDataProps {
  zoom: number;
  bottomLeft: GeoCoordinates;
  topRight: GeoCoordinates;
}

/**
 * This hook is used to fetch the map viewport data and prepare it for the map
 * component.
 *
 * Internally the viewport (bottomLeft and topRight) as well as the zoom level
 * are normalized to support caching.
 *
 * @param props The props passed to the hook.
 * @returns The map viewport data.
 */
export default function useMapCvmViewportData(
  props: UseMapViewportCvmDataProps & SWRConfiguration,
) {
  const { zoom, bottomLeft, topRight } = props;

  const api = useApi();

  const normalizedZoom = useMemo(() => {
    if (zoom == null || zoom == undefined) return undefined;
    return zoom > 18 ? 18 : zoom;
  }, [zoom]);

  /**
   * The normalized bottom left coordinates. The coordinates are normalized
   * to the lower left corner of the tile that contains the given coordinates.
   */
  const normalizedBottomLeft = useMemo(() => {
    if (!bottomLeft || zoom == null || zoom == undefined) return undefined;

    const { x, y, z } = latLonToTile(bottomLeft, zoom);

    const { latitude: normalizedLat, longitude: normalizedLon } = tileToLatLon(
      x,
      y + 1,
      z,
    );

    return [normalizedLat, normalizedLon];
  }, [bottomLeft, zoom]);

  /**
   * The normalized top right coordinates. The coordinates are normalized
   * to the upper right corner of the tile that contains the given coordinates.
   */
  const normalizedTopRight = useMemo(() => {
    if (!topRight || zoom == null || zoom == undefined) return undefined;

    const { x, y, z } = latLonToTile(topRight, zoom);

    const { latitude: normalizedLat, longitude: normalizedLon } = tileToLatLon(
      x + 1,
      y,
      z,
    );

    return [normalizedLat, normalizedLon];
  }, [topRight, zoom]);

  const searchParams = useMemo(() => {
    if (!normalizedBottomLeft || !normalizedTopRight || !normalizedZoom) {
      return null;
    }

    const params = new URLSearchParams({
      bottomLeft: normalizedBottomLeft.join(","),
      topRight: normalizedTopRight.join(","),
      zoom: String(normalizedZoom),
    });

    return params;
  }, [normalizedBottomLeft, normalizedTopRight, normalizedZoom]);

  const { data, isLoading, error } = useSWR<
    (Cvm | CvmCluster)[],
    AxiosError<ApiError>,
    string | null
  >(
    !!searchParams ? `/cvms?${searchParams.toString()}` : null,
    (url) => api.get(url).then((res) => res.data),
    { keepPreviousData: true, ...props },
  );

  const markers = useMemo(
    () => data?.filter((item): item is Cvm => !("cluster" in item)),
    [data],
  );

  const clusters = useMemo(
    () => data?.filter((item): item is CvmCluster => "cluster" in item),
    [data],
  );

  return {
    markers,
    clusters,
    isLoading,
    error,
  };
}
