import { useMemo, useCallback } from "react";
import Leaflet from "leaflet";
import { Marker, useMap } from "react-leaflet";
import LeafletDivIcon from "@/components/organisms/leaflet/LeafletDivIcon";

interface ClusterMarkerProps {
  count: number;
  position: Leaflet.LatLng;
}

export function ClusterMarker(props: ClusterMarkerProps) {
  const map = useMap();

  const outerClasses = useMemo(() => {
    let outerClasses = "";

    if (props.count < 10) {
      outerClasses = "bg-green-400 dark:bg-green-600";
    } else if (props.count < 100) {
      outerClasses = "bg-amber-300 dark:bg-amber-600";
    } else {
      outerClasses = "bg-orange-300 dark:bg-orange-600";
    }

    return outerClasses;
  }, [props.count]);

  const innerClasses = useMemo(() => {
    let outerClasses = "";

    if (props.count < 10) {
      outerClasses = "bg-green-600 dark:bg-green-800 text-white";
    } else if (props.count < 100) {
      outerClasses = "bg-amber-500 dark:bg-amber-800 text-white";
    } else {
      outerClasses = "bg-orange-500 dark:bg-orange-800 text-white";
    }

    return outerClasses;
  }, [props.count]);

  const formattedCount = useMemo(() => {
    if (props.count < 1000) return props.count.toString();
    if (props.count < 1_000_000)
      return (props.count / 1000).toFixed(props.count < 10_000 ? 1 : 0) + "K";
    if (props.count < 1_000_000_000)
      return (props.count / 1_000_000).toFixed(1) + "M";
    if (props.count < 1_000_000_000_000)
      return (props.count / 1_000_000_000).toFixed(1) + "B";

    return (props.count / 1_000_000_000).toFixed(1) + "B+";
  }, [props.count]);

  const handleClick = useCallback(() => {
    const newZoom = Math.min(map.getZoom() + 1, map.getMaxZoom());

    map.flyTo(Leaflet.latLng(props.position), newZoom);
  }, [map, props.position]);

  return (
    <Marker
      position={Leaflet.latLng(props.position)}
      icon={LeafletDivIcon({
        source: (
          <div
            className={`${outerClasses} box-border h-fit w-fit rounded-[20px] p-[3px]`}
          >
            <div
              className={`${innerClasses} flex h-[32px] w-[32px] items-center justify-center rounded-full`}
            >
              <span className="text-center font-sans text-[12px] leading-[30px]">
                {formattedCount}
              </span>
            </div>
          </div>
        ),
        size: Leaflet.point(32, 32),
        anchor: Leaflet.point(16, 16),
      })}
      eventHandlers={{ click: handleClick }}
    />
  );
}
