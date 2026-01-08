"use client";

import { useState } from "react";
import { Import } from "lucide-react";
import { CvmList } from "@/components/organisms/cvm/CvmList";
import { CvmMap } from "@/components/organisms/map/CvmMap";
import { Button } from "@/components/atoms/Button";
import { CvmImportDialog } from "@/components/organisms/cvm/CvmImportDialog";
import { Cvm } from "@/lib/types/cvm";
import { AnimatedDialogModal } from "@/components/molecules/AnimatedDialogModal";
import { CvmFilterSection } from "@/components/organisms/cvm/CvmFilterSection";

export default function Cvms() {
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [selectedCvm, setSelectedCvm] = useState<Cvm | null>(null);
  const [filter, setFilter] = useState<string | null>(null);

  return (
    <div className="flex grow flex-col">
      <div className="mx-auto flex w-full max-w-screen-2xl grow flex-col gap-4 p-4">
        <div className="flex justify-start">
          <Button onPress={() => setShowImportDialog(true)}>
            <div className="flex items-center gap-2">
              <Import className="h-4 w-4" />
              <div>Import</div>
            </div>
          </Button>
          <AnimatedDialogModal
            isOpen={showImportDialog}
            onOpenChange={setShowImportDialog}
          >
            <CvmImportDialog />
          </AnimatedDialogModal>
        </div>
        <div className="flex w-full grow flex-col gap-4 lg:flex-row">
          <div className="w-full space-y-4 md:w-fit">
            <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Registered CVMs
            </h4>
            <CvmFilterSection onFilter={(query) => setFilter(query)} />
            <CvmList
              onClick={(cvm) => setSelectedCvm(cvm || null)}
              filter={filter}
            />
          </div>
          <div className="flex w-full flex-col space-y-4">
            <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              CVM Map
            </h4>
            <div className="flex h-0 min-h-[20rem] grow flex-col overflow-hidden rounded-md">
              <div className="relative flex grow flex-col">
                <CvmMap selectedCvm={selectedCvm} filter={filter} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
