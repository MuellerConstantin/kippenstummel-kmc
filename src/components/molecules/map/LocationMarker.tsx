import { MapPin, ChevronUp, ChevronDown, Equal, X } from "lucide-react";
import { Cvm } from "@/lib/types/cvm";
import { Marker } from "react-map-gl/maplibre";
import { useState } from "react";
import { CvmDetailsDialog } from "@/components/organisms/cvm/CvmDetailsDialog";
import { RemoveCvmDialog } from "@/components/organisms/cvm/RemoveCvmDialog";
import { AnimatedDialogModal } from "../AnimatedDialogModal";
import {
  SCORING_DELETION_UPPER_LIMIT,
  SCORING_GOOD_LOWER_LIMIT,
  SCORING_NEUTRAL_LOWER_LIMIT,
} from "@/lib/constants";
import { LocationMarkerPopup } from "./LocationMarkerPopup";

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
          <MapPin className="h-[32px] w-[32px] fill-green-600 text-white dark:text-slate-600" />
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
        <RemoveCvmDialog
          cvm={props.cvm}
          onConfirm={() => setShowPopup(false)}
        />
      </AnimatedDialogModal>
    </>
  );
}
