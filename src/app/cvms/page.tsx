"use client";

import { useState } from "react";
import { Import } from "lucide-react";
import { CvmList } from "@/components/organisms/cvm/CvmList";
import { CvmMap } from "@/components/organisms/map/CvmMap";
import { Button } from "@/components/atoms/Button";
import { CvmImportDialog } from "@/components/organisms/cvm/CvmImportDialog";
import { DialogTrigger } from "react-aria-components";
import { Modal } from "@/components/atoms/Modal";
import { Cvm } from "@/lib/types/cvm";

export default function Cvms() {
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [selectedCvm, setSelectedCvm] = useState<Cvm | null>(null);

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
          <DialogTrigger
            isOpen={showImportDialog}
            onOpenChange={setShowImportDialog}
          >
            <Modal className="max-w-2xl">
              <CvmImportDialog />
            </Modal>
          </DialogTrigger>
        </div>
        <div className="flex w-full grow flex-col gap-4 lg:flex-row">
          <div className="w-full space-y-4 md:w-fit">
            <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Registered CVMs
            </h4>
            <CvmList onClick={(cvm) => setSelectedCvm(cvm || null)} />
          </div>
          <div className="flex w-full flex-col space-y-4">
            <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              CVM Map
            </h4>
            <div className="flex h-0 min-h-[20rem] grow flex-col overflow-hidden rounded-md">
              <div className="relative flex grow flex-col">
                <CvmMap selectedCvm={selectedCvm} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
