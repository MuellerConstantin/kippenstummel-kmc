"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Leaflet from "leaflet";
import { TileLayer, useMapEvents } from "react-leaflet";

const LeafletMapContainer = dynamic(
  () =>
    import("./LeafletMapContainer").then(
      (module) => module.LeafletMapContainer,
    ),
  { ssr: false },
);

interface LeafletMapEventHandlerProps {
  onZoomStart?: (event: Leaflet.LeafletEvent) => void;
  onZoomEnd?: (event: Leaflet.LeafletEvent) => void;
  onMoveStart?: (event: Leaflet.LeafletEvent) => void;
  onMoveEnd?: (event: Leaflet.LeafletEvent) => void;
  onLocationFound?: (event: Leaflet.LeafletEvent) => void;
  onLocationError?: (event: Leaflet.LeafletEvent) => void;
}

function LeafletMapEventHandler(params: LeafletMapEventHandlerProps) {
  useMapEvents({
    zoomstart: (event) => params.onZoomStart?.(event),
    zoomend: (event) => params.onZoomEnd?.(event),
    movestart: (event) => params.onMoveStart?.(event),
    moveend: (event) => params.onMoveEnd?.(event),
    locationfound: (event) => params.onLocationFound?.(event),
    locationerror: (event) => params.onLocationError?.(event),
  });

  return null;
}

export interface LeafletMapProps {
  children?: React.ReactNode;
  tileLayerUrl: string;
  tileLayerAttribution: string;
  center?: [number, number];
  zoom?: number;
  minZoom?: number;
  maxZoom?: number;
  className?: string;
  onReady?: (map: Leaflet.Map) => void;
  onZoomStart?: (event: Leaflet.LeafletEvent) => void;
  onZoomEnd?: (event: Leaflet.LeafletEvent) => void;
  onMoveStart?: (event: Leaflet.LeafletEvent) => void;
  onMoveEnd?: (event: Leaflet.LeafletEvent) => void;
  onLocationFound?: (event: Leaflet.LeafletEvent) => void;
  onLocationError?: (event: Leaflet.LeafletEvent) => void;
}

export function LeafletMap(props: LeafletMapProps) {
  const [map, setMap] = useState<Leaflet.Map | null>(null);

  const {
    className,
    tileLayerUrl,
    tileLayerAttribution,
    center,
    zoom,
    minZoom,
    maxZoom,
    onReady,
  } = props;

  useEffect(() => {
    if (map) {
      onReady?.(map);
    }
  }, [map, onReady]);

  return (
    <div className={`relative flex h-full w-full ${className}`}>
      <LeafletMapContainer
        ref={setMap}
        center={center}
        zoom={zoom}
        minZoom={minZoom}
        maxZoom={maxZoom}
        closePopupOnClick={false}
      >
        <TileLayer attribution={tileLayerAttribution} url={tileLayerUrl} />
        <LeafletMapEventHandler
          onZoomStart={props.onZoomStart}
          onZoomEnd={props.onZoomEnd}
          onMoveStart={props.onMoveStart}
          onMoveEnd={props.onMoveEnd}
          onLocationFound={props.onLocationFound}
          onLocationError={props.onLocationError}
        />
        {props.children}
      </LeafletMapContainer>
    </div>
  );
}
