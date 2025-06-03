"use client";

import { useState } from "react";
import { Switch } from "@/components/atoms/Switch";
import { JobsTable } from "@/components/organisms/jobs/JobsTable";
import { Button } from "@/components/atoms/Button";
import { DialogTrigger } from "react-aria-components";
import { Modal } from "@/components/atoms/Modal";
import { JobInfoDialog } from "@/components/organisms/jobs/JobInfoDialog";
import { Info } from "lucide-react";

export default function Jobs() {
  const [distinct, setDistinct] = useState(false);
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [selected, setSelected] = useState<
    | {
        jobId: string;
        queue: string;
        name: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: any;
        status: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        result: any;
        failedReason?: string;
        attemptsMade: number;
        timestamp: string;
        finishedOn?: string;
        createdAt: string;
        updatedAt: string;
      }[]
    | null
  >(null);

  return (
    <div className="flex grow flex-col">
      <div className="mx-auto flex w-full max-w-screen-2xl grow flex-col gap-4 p-4">
        <div className="flex justify-start gap-4">
          <Button
            onPress={() => setShowInfoDialog(true)}
            isDisabled={!selected || selected.length === 0}
          >
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              <div>Info</div>
            </div>
          </Button>
          <Switch isSelected={distinct} onChange={setDistinct}>
            Distinct
          </Switch>
          <DialogTrigger
            isOpen={showInfoDialog}
            onOpenChange={setShowInfoDialog}
          >
            <Modal className="max-w-2xl">
              {selected && <JobInfoDialog job={selected![0]} />}
            </Modal>
          </DialogTrigger>
        </div>
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Job History
          </h4>
          <JobsTable distinct={distinct} onSelect={setSelected} />
        </div>
      </div>
    </div>
  );
}
