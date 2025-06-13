import { useCallback, useState } from "react";
import Leaflet from "leaflet";
import { Marker, Popup } from "react-leaflet";
import LeafletDivIcon from "@/components/organisms/leaflet/LeafletDivIcon";
import {
  MapPin,
  ChevronUp,
  ChevronDown,
  Equal,
  Copy,
  Check,
} from "lucide-react";
import { Link } from "@/components/atoms/Link";
import { Modal } from "@/components/atoms/Modal";
import { CvmDetailsDialog } from "@/components/organisms/cvm/CvmDetailsDialog";

interface CopyButtonProps {
  text: string;
  disabled?: boolean;
}

function CopyButton(props: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleClick = useCallback(() => {
    navigator.clipboard.writeText(props.text);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1000);
  }, [props.text]);

  return (
    <button
      className="cursor-pointer text-slate-600 hover:text-slate-800 disabled:cursor-not-allowed"
      disabled={props.disabled}
      onClick={handleClick}
    >
      <div className="transition-all duration-300 ease-in-out">
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </div>
    </button>
  );
}

interface LocationMarkerPopupProps {
  position: [number, number];
  score: number;
  onDetails?: () => void;
}

function LocationMarkerPopup(props: LocationMarkerPopupProps) {
  return (
    <Popup
      autoClose={true}
      closeOnClick={false}
      className="relative"
      offset={Leaflet.point(0, -15)}
    >
      {props.score < -100 ? (
        <div className="absolute -top-2 -left-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500">
          <ChevronDown className="h-4 w-4 text-white" />
        </div>
      ) : props.score > 100 ? (
        <div className="absolute -top-2 -left-2 flex h-6 w-6 items-center justify-center rounded-full bg-green-600">
          <ChevronUp className="h-4 w-4 text-white" />
        </div>
      ) : (
        <div className="absolute -top-2 -left-2 flex h-6 w-6 items-center justify-center rounded-full bg-slate-500">
          <Equal className="h-4 w-4 text-white" />
        </div>
      )}
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-center">
          <div className="text-lg font-semibold">
            {(props.score / 100).toFixed(1)}
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-base font-semibold">
            Cigarette Vending Machine
          </div>
          <div className="text-sm font-semibold">Location</div>
          <div className="flex items-center gap-2">
            <div className="text-xs">
              {props.position[0].toFixed(7)} / {props.position[1].toFixed(7)}{" "}
              (lat/lng)
            </div>
            <CopyButton text={`${props.position[0]},${props.position[1]}`} />
          </div>
          <Link className="block cursor-pointer" onPress={props.onDetails}>
            Show details
          </Link>
        </div>
      </div>
    </Popup>
  );
}

interface LocationMarkerProps {
  position: [number, number];
  score: number;
  imported: boolean;
  createdAt: string;
  updatedAt: string;
  selected: boolean;
}

export function LocationMarker(props: LocationMarkerProps) {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      <Marker
        position={Leaflet.latLng(props.position[0], props.position[1])}
        icon={LeafletDivIcon({
          source: (
            <div
              className={`relative z-[50] h-fit w-fit ${props.selected ? "animate-bounce" : ""}`}
            >
              {props.score < -100 ? (
                <div className="absolute top-1 right-1 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-red-500">
                  <ChevronDown className="h-2.5 w-2.5 text-white" />
                </div>
              ) : props.score > 100 ? (
                <div className="absolute top-1 right-1 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-green-600">
                  <ChevronUp className="h-2.5 w-2.5 text-white" />
                </div>
              ) : (
                <div className="absolute top-1 right-1 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-slate-500">
                  <Equal className="h-2.5 w-2.5 text-white" />
                </div>
              )}
              <MapPin className="h-[32px] w-[32px] fill-green-600 text-white" />
            </div>
          ),
          size: Leaflet.point(32, 32),
          anchor: Leaflet.point(16, 32),
        })}
      >
        <LocationMarkerPopup {...props} onDetails={() => setShowDialog(true)} />
      </Marker>
      <Modal isOpen={showDialog} onOpenChange={setShowDialog}>
        <CvmDetailsDialog cvm={props} />
      </Modal>
    </>
  );
}
