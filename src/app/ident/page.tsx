"use client";

import { Button } from "@/components/atoms/Button";
import { Modal } from "@/components/atoms/Modal";
import { DeleteIdentDialog } from "@/components/organisms/ident/DeleteIdentDialog";
import { IdentTable } from "@/components/organisms/ident/IdentTable";
import { Trash } from "lucide-react";
import { useState } from "react";
import { DialogTrigger } from "react-aria-components";

export default function Ident() {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selected, setSelected] = useState<
    | {
        identity: string;
        createdAt?: string;
        updatedAt?: string;
        credibility: number;
      }[]
    | null
  >(null);

  return (
    <div className="flex grow flex-col">
      <div className="mx-auto flex w-full max-w-screen-2xl grow flex-col gap-4 p-4">
        <div className="flex justify-start">
          <Button
            onPress={() => setShowDeleteDialog(true)}
            isDisabled={!selected || selected.length === 0}
          >
            <div className="flex items-center gap-2">
              <Trash className="h-4 w-4" />
              <div>Delete</div>
            </div>
          </Button>
          <DialogTrigger
            isOpen={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
          >
            <Modal>
              <DeleteIdentDialog idents={selected || []} />
            </Modal>
          </DialogTrigger>
        </div>
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Issued Identities
          </h4>
          <IdentTable onSelect={setSelected} />
        </div>
      </div>
    </div>
  );
}
