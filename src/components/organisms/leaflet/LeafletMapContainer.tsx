import React, { useEffect } from "react";
import Leaflet from "leaflet";
import { MapContainer, MapContainerProps } from "react-leaflet";

import "leaflet/dist/leaflet.css";

export interface LeafletMapContainerProps extends MapContainerProps {
  ref?: React.Ref<Leaflet.Map>;
}

export function LeafletMapContainer(props: LeafletMapContainerProps) {
  const { children, ref, ...rest } = props;

  useEffect(() => {
    (async function init() {
      Leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: "images/leaflet/marker-icon-2x.png",
        iconUrl: "images/leaflet/marker-icon.png",
        shadowUrl: "images/leaflet/marker-shadow.png",
      });
    })();
  }, []);

  return (
    <MapContainer ref={ref} className="h-full w-full grow" {...rest}>
      {children}
    </MapContainer>
  );
}
