"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import useSWR from "swr";
import Leaflet from "leaflet";
import useApi from "@/hooks/useApi";
import { LeafletMap } from "@/components/organisms/leaflet/LeafletMap";
import { ClusterMarker } from "@/components/molecules/map/ClusterMarker";
import { LocationMarker } from "@/components/molecules/map/LocationMarker";
import { MapLibreTileLayer } from "../leaflet/MapLibreTileLayer";

export interface CvmMapProps {
  selectedCvm: {
    id: string;
    longitude: number;
    latitude: number;
    score: number;
  } | null;
}

export function CvmMap(props: CvmMapProps) {
  const api = useApi();

  const [map, setMap] = useState<Leaflet.Map | null>(null);
  const [zoom, setZoom] = useState<number>();
  const [bottomLeft, setBottomLeft] = useState<[number, number]>();
  const [topRight, setTopRight] = useState<[number, number]>();

  const onReady = useCallback((map: Leaflet.Map) => {
    const mapBounds = map.getBounds();

    setBottomLeft([mapBounds.getSouthWest().lat, mapBounds.getSouthWest().lng]);
    setTopRight([mapBounds.getNorthEast().lat, mapBounds.getNorthEast().lng]);
    setZoom(map.getZoom());

    setMap(map);
  }, []);

  const onZoomEnd = useCallback((event: Leaflet.LeafletEvent) => {
    const map = event.target as Leaflet.Map;
    const mapBounds = map.getBounds();

    setBottomLeft([mapBounds.getSouthWest().lat, mapBounds.getSouthWest().lng]);
    setTopRight([mapBounds.getNorthEast().lat, mapBounds.getNorthEast().lng]);
    setZoom(map.getZoom());
  }, []);

  const onMoveEnd = useCallback((event: Leaflet.LeafletEvent) => {
    const map = event.target as Leaflet.Map;
    const mapBounds = map.getBounds();

    setBottomLeft([mapBounds.getSouthWest().lat, mapBounds.getSouthWest().lng]);
    setTopRight([mapBounds.getNorthEast().lat, mapBounds.getNorthEast().lng]);
    setZoom(map.getZoom());
  }, []);

  const { data } = useSWR<
    (
      | {
          id: string;
          latitude: number;
          longitude: number;
          score: number;
          imported: boolean;
          recentlyReported: {
            missing: number;
            spam: number;
            inactive: number;
            inaccessible: number;
          };
          createdAt: string;
          updatedAt: string;
        }
      | {
          id: string;
          cluster: true;
          longitude: number;
          latitude: number;
          count: number;
        }
    )[],
    unknown,
    string | null
  >(
    !!bottomLeft && !!topRight && !!zoom
      ? `/kmc/cvms/within?bottomLeft=${bottomLeft?.[0]},${bottomLeft?.[1]}&topRight=${topRight?.[0]},${topRight?.[1]}&zoom=${zoom}`
      : null,
    (url) => api.get(url).then((res) => res.data),
    { keepPreviousData: true },
  );

  const markers = useMemo(
    () =>
      data?.filter((item) => !("cluster" in item)) as {
        id: string;
        latitude: number;
        longitude: number;
        score: number;
        imported: boolean;
        recentlyReported: {
          missing: number;
          spam: number;
          inactive: number;
          inaccessible: number;
        };
        createdAt: string;
        updatedAt: string;
      }[],
    [data],
  );

  const clusters = useMemo(
    () =>
      data?.filter((item) => "cluster" in item) as {
        id: string;
        cluster: true;
        longitude: number;
        latitude: number;
        count: number;
      }[],
    [data],
  );

  useEffect(() => {
    if (props.selectedCvm) {
      map?.setView(
        [props.selectedCvm.latitude, props.selectedCvm.longitude],
        18,
      );
    }
  }, [props.selectedCvm, map]);

  return (
    <LeafletMap
      center={[49.006889, 8.403653]}
      zoom={14}
      minZoom={6}
      maxZoom={19}
      onReady={onReady}
      onMoveEnd={onMoveEnd}
      onZoomEnd={onZoomEnd}
    >
      <MapLibreTileLayer url="/tiles/default.json" />
      {markers?.map((marker) => (
        <LocationMarker
          key={marker.id}
          cvm={marker}
          selected={marker.id === props.selectedCvm?.id}
        />
      ))}
      {clusters?.map((marker, index) => (
        <ClusterMarker
          key={index}
          position={[marker.latitude, marker.longitude]}
          count={marker.count}
        />
      ))}
    </LeafletMap>
  );
}
