import { MapPin } from "lucide-react";
import { Cvm } from "@/lib/types/cvm";
import { Marker } from "react-map-gl/maplibre";

interface SelectedMarkerProps {
  cvm: Cvm;
}

export function SelectedMarker(props: SelectedMarkerProps) {
  return (
    <Marker
      anchor="bottom"
      latitude={props.cvm.latitude}
      longitude={props.cvm.longitude}
    >
      <div className="relative z-[50] h-fit w-fit">
        <MapPin className="h-[36px] w-[36px] fill-[#EA4335] text-[#A52714]" />
      </div>
    </Marker>
  );
}
