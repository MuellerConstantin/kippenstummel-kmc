"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { ClusterMarker } from "@/components/molecules/map/ClusterMarker";
import { LocationMarker } from "@/components/molecules/map/LocationMarker";
import Map, {
  AttributionControl,
  MapRef,
  NavigationControl,
  ViewStateChangeEvent,
} from "react-map-gl/maplibre";
import { GeoCoordinates } from "@/lib/types/geo";
import { MapLibreEvent } from "maplibre-gl";
import useMapCvmViewportData from "@/hooks/useMapCvmViewportData";
import { SelectedMarker } from "@/components/molecules/map/SelectedMarker";
import { Cvm } from "@/lib/types/cvm";

import "maplibre-gl/dist/maplibre-gl.css";

export interface CvmMapProps {
  selectedCvm: Cvm | null;
}

export function CvmMap(props: CvmMapProps) {
  const mapRef = useRef<MapRef>(null);

  const [zoom, setZoom] = useState<number>();
  const [bottomLeft, setBottomLeft] = useState<GeoCoordinates>();
  const [topRight, setTopRight] = useState<GeoCoordinates>();

  const { markers, clusters } = useMapCvmViewportData({
    zoom: zoom!,
    bottomLeft: bottomLeft!,
    topRight: topRight!,
  });

  const onLoad = useCallback((event: MapLibreEvent) => {
    const mapBounds = event.target.getBounds();
    const mapZoom = Math.ceil(event.target.getZoom());

    setBottomLeft({
      latitude: mapBounds.getSouthWest().lat,
      longitude: mapBounds.getSouthWest().lng,
    });
    setTopRight({
      latitude: mapBounds.getNorthEast().lat,
      longitude: mapBounds.getNorthEast().lng,
    });
    setZoom(mapZoom);
  }, []);

  const onViewStateChanged = useCallback((event: ViewStateChangeEvent) => {
    const mapBounds = event.target.getBounds();
    const mapZoom = Math.ceil(event.target.getZoom());

    setBottomLeft({
      latitude: mapBounds.getSouthWest().lat,
      longitude: mapBounds.getSouthWest().lng,
    });
    setTopRight({
      latitude: mapBounds.getNorthEast().lat,
      longitude: mapBounds.getNorthEast().lng,
    });
    setZoom(mapZoom);
  }, []);

  useEffect(() => {
    if (props.selectedCvm) {
      mapRef.current?.flyTo({
        center: [props.selectedCvm.longitude, props.selectedCvm.latitude],
        zoom: 18,
      });
    }
  }, [props.selectedCvm]);

  return (
    <Map
      ref={mapRef}
      initialViewState={{
        longitude: 8.403653,
        latitude: 49.006889,
        zoom: 14,
      }}
      style={{ flexGrow: 1 }}
      mapStyle="/tiles/default.json"
      minZoom={8}
      maxZoom={19}
      attributionControl={false}
      onLoad={onLoad}
      onZoomEnd={onViewStateChanged}
      onMoveEnd={onViewStateChanged}
      cooperativeGestures
    >
      <AttributionControl compact={false} />
      <NavigationControl />
      {markers
        ?.filter((marker) => marker.id !== props.selectedCvm?.id)
        .map((marker) => <LocationMarker key={marker.id} cvm={marker} />)}
      {clusters?.map((marker, index) => (
        <ClusterMarker
          key={index}
          position={{ latitude: marker.latitude, longitude: marker.longitude }}
          count={marker.count}
        />
      ))}
      {!!props.selectedCvm && <SelectedMarker cvm={props.selectedCvm} />}
    </Map>
  );
}
