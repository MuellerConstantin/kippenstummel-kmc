import { useCallback, useState } from "react";
import Leaflet from "leaflet";
import { Marker, Popup, useMap } from "react-leaflet";
import LeafletDivIcon from "@/components/organisms/leaflet/LeafletDivIcon";
import {
  MapPin,
  ChevronUp,
  ChevronDown,
  Equal,
  Copy,
  Check,
  X,
} from "lucide-react";
import { Link } from "@/components/atoms/Link";
import { Modal } from "@/components/atoms/Modal";
import { CvmDetailsDialog } from "@/components/organisms/cvm/CvmDetailsDialog";
import { Button } from "@/components/atoms/Button";
import { RemoveCvmDialog } from "@/components/organisms/cvm/RemoveCvmDialog";

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
  cvm: {
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
  };
  onDetails?: () => void;
}

function LocationMarkerPopup(props: LocationMarkerPopupProps) {
  const map = useMap();

  return (
    <Popup
      autoClose={true}
      closeOnClick={false}
      closeButton={false}
      className="relative"
      offset={Leaflet.point(0, -15)}
    >
      {props.cvm.score < -8 ? (
        <div className="absolute -top-2 -left-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-800">
          <X className="h-4 w-4 text-white" />
        </div>
      ) : props.cvm.score < 0 ? (
        <div className="absolute -top-2 -left-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500">
          <ChevronDown className="h-4 w-4 text-white" />
        </div>
      ) : props.cvm.score >= 5 ? (
        <div className="absolute -top-2 -left-2 flex h-6 w-6 items-center justify-center rounded-full bg-green-600">
          <ChevronUp className="h-4 w-4 text-white" />
        </div>
      ) : (
        <div className="absolute -top-2 -left-2 flex h-6 w-6 items-center justify-center rounded-full bg-slate-500">
          <Equal className="h-4 w-4 text-white" />
        </div>
      )}
      <div className="flex flex-col gap-2">
        <div className="flex w-full items-center justify-between gap-2">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="text-base font-semibold">
              Cigarette Vending Machine
            </div>
          </div>
          <div>
            <Button variant="icon" onPress={() => map.closePopup()}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center">
            <div className="text-lg font-semibold">{props.cvm.score}</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm font-semibold">Location</div>
            <div className="flex items-center gap-2">
              <div className="text-xs">
                {props.cvm.latitude.toFixed(7)} /{" "}
                {props.cvm.longitude.toFixed(7)} (lat/lng)
              </div>
              <CopyButton
                text={`${props.cvm.latitude},${props.cvm.longitude}`}
              />
            </div>
            <Link className="block cursor-pointer" onPress={props.onDetails}>
              Show details
            </Link>
          </div>
        </div>
      </div>
    </Popup>
  );
}

interface LocationMarkerProps {
  cvm: {
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
  };
  selected: boolean;
}

export function LocationMarker(props: LocationMarkerProps) {
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <>
      <Marker
        position={Leaflet.latLng(props.cvm.latitude, props.cvm.longitude)}
        icon={LeafletDivIcon({
          source: (
            <div
              className={`relative z-[50] h-fit w-fit ${props.selected ? "animate-bounce" : ""}`}
            >
              {props.cvm.score < -8 ? (
                <div className="absolute top-1 right-1 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-red-800">
                  <X className="h-2.5 w-2.5 text-white" />
                </div>
              ) : props.cvm.score < 0 ? (
                <div className="absolute top-1 right-1 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-red-500">
                  <ChevronDown className="h-2.5 w-2.5 text-white" />
                </div>
              ) : props.cvm.score >= 5 ? (
                <div className="absolute top-1 right-1 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-green-600">
                  <ChevronUp className="h-2.5 w-2.5 text-white" />
                </div>
              ) : (
                <div className="absolute top-1 right-1 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-slate-500">
                  <Equal className="h-2.5 w-2.5 text-white" />
                </div>
              )}
              <MapPin className="h-[36px] w-[36px] fill-green-600 text-white dark:text-slate-600" />
            </div>
          ),
          size: Leaflet.point(32, 32),
          anchor: Leaflet.point(16, 32),
        })}
      >
        <LocationMarkerPopup
          {...props}
          onDetails={() => setShowDetailsDialog(true)}
        />
      </Marker>
      <Modal isOpen={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <CvmDetailsDialog
          cvm={props.cvm}
          onDelete={() => setShowDeleteDialog(true)}
        />
      </Modal>
      <Modal isOpen={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <RemoveCvmDialog cvm={props.cvm} />
      </Modal>
    </>
  );
}
