import {
  MapPin,
  ChevronUp,
  ChevronDown,
  Equal,
  X,
  Check,
  Copy,
} from "lucide-react";
import { Cvm } from "@/lib/types/cvm";
import { Marker, Popup } from "react-map-gl/maplibre";
import { Link } from "@/components/atoms/Link";
import { Button } from "@/components/atoms/Button";
import { useCallback, useState } from "react";
import { Offset } from "maplibre-gl";
import { CvmDetailsDialog } from "@/components/organisms/cvm/CvmDetailsDialog";
import { RemoveCvmDialog } from "@/components/organisms/cvm/RemoveCvmDialog";
import { AnimatedDialogModal } from "../AnimatedDialogModal";

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
  cvm: Cvm;
  onDetails?: () => void;
  onClose?: () => void;
}

function LocationMarkerPopup(props: LocationMarkerPopupProps) {
  return (
    <Popup
      longitude={props.cvm.longitude}
      latitude={props.cvm.latitude}
      closeOnClick={false}
      closeButton={false}
      offset={
        {
          top: [0, 0],
          bottom: [0, -36],
          left: [18, -18],
          right: [-18, -18],
          "top-left": [12, -12],
          "top-right": [-12, -12],
          "bottom-left": [12, -32],
          "bottom-right": [-12, -32],
        } as Offset
      }
    >
      <div className="flex flex-col gap-2">
        <div className="flex w-full items-center justify-between gap-2">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="min-w-fit text-sm font-semibold">
              Cigarette Vending Machine
            </div>
          </div>
          <div>
            <Button variant="icon" onPress={props.onClose}>
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
  cvm: Cvm;
}

export function LocationMarker(props: LocationMarkerProps) {
  const [showPopup, setShowPopup] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <>
      <Marker
        latitude={props.cvm.latitude}
        longitude={props.cvm.longitude}
        className="cursor-pointer"
        anchor="bottom"
        onClick={() => setShowPopup(true)}
      >
        <div className="relative z-[50] h-fit w-fit">
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
        {showPopup && (
          <LocationMarkerPopup
            cvm={props.cvm}
            onClose={() => setShowPopup(false)}
            onDetails={() => setShowDetailsDialog(true)}
          />
        )}
      </Marker>
      <AnimatedDialogModal
        isOpen={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
      >
        <CvmDetailsDialog
          cvm={props.cvm}
          onDelete={() => setShowDeleteDialog(true)}
        />
      </AnimatedDialogModal>
      <AnimatedDialogModal
        isOpen={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      >
        <RemoveCvmDialog cvm={props.cvm} />
      </AnimatedDialogModal>
    </>
  );
}
