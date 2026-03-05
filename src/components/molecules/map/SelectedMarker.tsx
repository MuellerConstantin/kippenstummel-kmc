import { MapPin } from "lucide-react";
import { Cvm } from "@/lib/types/cvm";
import { Marker } from "react-map-gl/maplibre";
import { useState } from "react";
import { CvmDetailsDialog } from "@/components/organisms/cvm/CvmDetailsDialog";
import { RemoveCvmDialog } from "@/components/organisms/cvm/RemoveCvmDialog";
import { AnimatedDialogModal } from "../AnimatedDialogModal";
import { LocationMarkerPopup } from "./LocationMarkerPopup";

interface SelectedMarkerProps {
  cvm: Cvm;
  onDelete?: () => void;
}

export function SelectedMarker(props: SelectedMarkerProps) {
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
          <MapPin className="h-[32px] w-[32px] fill-[#EA4335] text-[#A52714]" />
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
          onConfirm={() => {
            setShowPopup(false);
            setShowDetailsDialog(false);
            setShowDeleteDialog(false);
            props.onDelete?.();
          }}
        />
      </AnimatedDialogModal>
    </>
  );
}
