"use client";

import { Link } from "@/components/atoms/Link";
import { Modal } from "@/components/atoms/Modal";
import { PreReleaseInfoDialog } from "./PreReleaseInfoDialog";
import { TriangleAlert as TriangleAlertIcon } from "lucide-react";
import { useState } from "react";

export default function PreReleaseBanner() {
  const [showInfoDialog, setShowInfoDialog] = useState(false);

  return (
    <>
      <div className="border-b border-b-amber-600 bg-amber-300 text-amber-600 dark:border-b-amber-200 dark:bg-amber-600 dark:text-amber-200">
        <div className="flex items-center justify-center p-2">
          <div className="flex flex-wrap justify-center gap-1 text-center text-xs">
            <div>
              <TriangleAlertIcon className="inline-block h-4 w-4 align-text-bottom" />
              &nbsp; This is an unofficial preview version.
            </div>
            <Link
              variant="secondary"
              className="cursor-pointer"
              onPress={() => setShowInfoDialog(true)}
            >
              Learn more
            </Link>
          </div>
        </div>
      </div>
      <Modal isOpen={showInfoDialog} onOpenChange={setShowInfoDialog}>
        <PreReleaseInfoDialog />
      </Modal>
    </>
  );
}
