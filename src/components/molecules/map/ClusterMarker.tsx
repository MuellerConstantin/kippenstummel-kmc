import { useMemo, useCallback } from "react";
import { GeoCoordinates } from "@/lib/types/geo";
import { Marker, useMap } from "react-map-gl/maplibre";

interface ClusterMarkerProps {
  count: number;
  position: GeoCoordinates;
}

export function ClusterMarker(props: ClusterMarkerProps) {
  const { current: map } = useMap();

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
    if (props.count < 1_000_000) return (props.count / 1000).toFixed(0) + "K";
    if (props.count < 1_000_000_000)
      return (props.count / 1_000_000).toFixed(0) + "M";

    return "1B+";
  }, [props.count]);

  const handleClick = useCallback(() => {
    const newZoom = Math.min(Math.ceil(map!.getZoom()) + 1, map!.getMaxZoom());

    map!.flyTo({
      center: [props.position.longitude, props.position.latitude],
      zoom: newZoom,
    });
  }, [map, props.position]);

  return (
    <Marker
      latitude={props.position.latitude}
      longitude={props.position.longitude}
      onClick={handleClick}
      className="cursor-pointer"
    >
      <div
        className={`${outerClasses} box-border h-fit w-fit rounded-[20px] p-[3px]`}
      >
        <div
          className={`${innerClasses} flex h-[32px] w-[32px] items-center justify-center rounded-full`}
        >
          <span className="text-center font-sans text-[10px] leading-[30px]">
            {formattedCount}
          </span>
        </div>
      </div>
    </Marker>
  );
}
