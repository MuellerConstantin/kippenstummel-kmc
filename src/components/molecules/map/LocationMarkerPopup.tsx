import {
  MapPin,
  X,
  Check,
  Copy,
  ChevronDown,
  ChevronUp,
  Equal,
} from "lucide-react";
import { Cvm } from "@/lib/types/cvm";
import { Popup } from "react-map-gl/maplibre";
import { Button } from "@/components/atoms/Button";
import { useCallback, useState } from "react";
import { Offset } from "maplibre-gl";
import {
  SCORING_DELETION_UPPER_LIMIT,
  SCORING_GOOD_LOWER_LIMIT,
  SCORING_NEUTRAL_LOWER_LIMIT,
} from "@/lib/constants";

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

export function LocationMarkerPopup(props: LocationMarkerPopupProps) {
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
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="relative z-[50] h-fit w-fit">
              {props.cvm.score <= SCORING_DELETION_UPPER_LIMIT ? (
                <div className="absolute top-1 right-1 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-red-800">
                  <X className="h-2.5 w-2.5 text-white" />
                </div>
              ) : props.cvm.score < SCORING_NEUTRAL_LOWER_LIMIT ? (
                <div className="absolute top-1 right-1 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-red-500">
                  <ChevronDown className="h-2.5 w-2.5 text-white" />
                </div>
              ) : props.cvm.score >= SCORING_GOOD_LOWER_LIMIT ? (
                <div className="absolute top-1 right-1 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-green-600">
                  <ChevronUp className="h-2.5 w-2.5 text-white" />
                </div>
              ) : (
                <div className="absolute top-1 right-1 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-slate-500">
                  <Equal className="h-2.5 w-2.5 text-white" />
                </div>
              )}
              <MapPin className="h-8 w-8 fill-green-600 text-white dark:text-slate-600" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white">
                Cigarette Vending Machine
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Location Info
              </div>
            </div>
          </div>
          <Button onClick={props.onClose} variant="icon">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Score
            </div>
            <div className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-800 dark:bg-slate-800 dark:text-white">
              {props.cvm.score}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Coordinates
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-800 dark:bg-slate-800 dark:text-white">
                {props.cvm.latitude.toFixed(6)},{" "}
                {props.cvm.longitude.toFixed(6)}
              </div>

              <CopyButton
                text={`${props.cvm.latitude},${props.cvm.longitude}`}
              />
            </div>
          </div>
        </div>
        <Button onClick={props.onDetails} className="w-full">
          Show details
        </Button>
      </div>
    </Popup>
  );
}
