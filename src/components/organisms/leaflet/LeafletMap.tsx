"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Leaflet from "leaflet";
import { useMapEvents } from "react-leaflet";

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
  const containerRef = useRef<HTMLDivElement>(null);

  const [map, setMap] = useState<Leaflet.Map | null>(null);

  const { className, center, zoom, minZoom, maxZoom, onReady } = props;

  useEffect(() => {
    if (map) {
      onReady?.(map);
    }
  }, [map, onReady]);

  useEffect(() => {
    if (!map || !containerRef.current) return;

    const observer = new ResizeObserver(() => {
      map.invalidateSize();
    });

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [map]);

  return (
    <div
      ref={containerRef}
      className={`relative flex grow flex-col ${className}`}
    >
      <LeafletMapContainer
        ref={setMap}
        center={center}
        zoom={zoom}
        minZoom={minZoom}
        maxZoom={maxZoom}
        closePopupOnClick={true}
        className="grow"
      >
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
