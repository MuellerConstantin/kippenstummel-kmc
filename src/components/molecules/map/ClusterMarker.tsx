import { useMemo, useCallback } from "react";
import Leaflet from "leaflet";
import { Marker, useMap } from "react-leaflet";
import LeafletDivIcon from "@/components/organisms/leaflet/LeafletDivIcon";

function formatNumberShort(n: number): string {
  if (n < 1000) return n.toString();
  if (n < 1_000_000) return (n / 1000).toFixed(n < 10_000 ? 1 : 0) + "K";
  if (n < 1_000_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n < 1_000_000_000_000) return (n / 1_000_000_000).toFixed(1) + "B";

  return (n / 1_000_000_000).toFixed(1) + "B";
}

interface ClusterMarkerProps {
  count: number;
  position: [number, number];
}

export function ClusterMarker(props: ClusterMarkerProps) {
  const map = useMap();

  const outerClasses = useMemo(() => {
    let outerClasses = "";

    if (props.count < 10) {
      outerClasses = "bg-green-500 opacity-80";
    } else if (props.count < 100) {
      outerClasses = "bg-amber-500 opacity-80";
    } else {
      outerClasses = "bg-orange-500 opacity-80";
    }

    return outerClasses;
  }, [props.count]);

  const innerClasses = useMemo(() => {
    let innerClasses = "";

    if (props.count < 10) {
      innerClasses = "bg-slate-300 text-slate-800";
    } else if (props.count < 100) {
      innerClasses = "bg-slate-300 text-slate-800";
    } else {
      innerClasses = "bg-slate-300 text-slate-800";
    }

    return innerClasses;
  }, [props.count]);

  const handleClick = useCallback(() => {
    const newZoom = Math.min(map.getZoom() + 1, map.getMaxZoom());

    map.flyTo(Leaflet.latLng(props.position), newZoom);
  }, [map, props.position]);

  return (
    <Marker
      position={Leaflet.latLng(props.position[0], props.position[1])}
      icon={LeafletDivIcon({
        source: (
          <div
            className={`${outerClasses} box-border h-fit w-fit rounded-[20px] p-[3px]`}
          >
            <div
              className={`${innerClasses} h-[30px] w-[30px] rounded-full text-center font-sans text-[12px] leading-[30px]`}
            >
              <span>{formatNumberShort(props.count)}</span>
            </div>
          </div>
        ),
        anchor: Leaflet.point(30, 30),
      })}
      eventHandlers={{ click: handleClick }}
    />
  );
}
