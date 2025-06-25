import React from "react";
import { DialogProps, Heading } from "react-aria-components";
import { Dialog } from "@/components/atoms/Dialog";
import { Button } from "@/components/atoms/Button";
import { TextArea } from "@/components/atoms/TextArea";
import { Spinner } from "@/components/atoms/Spinner";

interface JobInfoDialogProps extends Omit<DialogProps, "children"> {
  job: {
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
    logs?: string[];
    createdAt: string;
    updatedAt: string;
  };
}

export function JobInfoDialog(props: JobInfoDialogProps) {
  return (
    <Dialog {...props}>
      {({ close }) => (
        <>
          <Heading
            slot="title"
            className="my-0 text-xl leading-6 font-semibold"
          >
            Job Info
          </Heading>
          <div className="mt-4 flex flex-col gap-4">
            <div className="space-y-2">
              <div>{`${props.job.queue}/${props.job.name}`}</div>
              <div
                className={`w-fit rounded-md px-1 py-0.5 text-xs text-white capitalize ${props.job.status === "completed" ? "bg-green-600" : props.job.status === "failed" ? "bg-red-600" : "bg-slate-400"}`}
              >
                {props.job.status}
              </div>
            </div>
            <div className="space-y-2">
              <div className="font-semibold text-green-600">Metadata</div>
              <div className="grid grid-cols-[100px_1fr] text-sm">
                <div className="font-semibold">Queue:</div>
                <div>{props.job.queue}</div>

                <div className="font-semibold">Name:</div>
                <div>{props.job.name}</div>

                <div className="font-semibold">Job ID:</div>
                <div>{props.job.jobId}</div>

                <div className="font-semibold">Started At:</div>
                <div>{new Date(props.job.createdAt).toLocaleString()}</div>

                <div className="font-semibold">Finished At:</div>
                <div>
                  {props.job.finishedOn
                    ? new Date(props.job.finishedOn).toLocaleString()
                    : "-"}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="font-semibold text-green-600">Runtime</div>
              <div className="space-y-2 text-sm">
                <div className="font-semibold">Data:</div>
                <TextArea
                  rows={5}
                  isReadOnly
                  value={JSON.stringify(props.job.data)}
                />
              </div>
              {props.job.status === "running" && (
                <div className="space-y-2 text-sm">
                  <div className="font-semibold">Result:</div>
                  <Spinner />
                </div>
              )}
              {props.job.status === "completed" && (
                <div className="space-y-2 text-sm">
                  <div className="font-semibold">Result:</div>
                  <TextArea
                    rows={5}
                    isReadOnly
                    value={JSON.stringify(props.job.result) || "-"}
                  />
                </div>
              )}
              {props.job.status === "failed" && (
                <div className="space-y-2 text-sm">
                  <div className="font-semibold">Error:</div>
                  <TextArea
                    rows={10}
                    isReadOnly
                    value={JSON.stringify(props.job.failedReason) || "-"}
                  />
                </div>
              )}
              <div className="space-y-2 text-sm">
                <div className="font-semibold">Logs:</div>
                <TextArea
                  rows={5}
                  isReadOnly
                  value={props.job.logs?.join("\n") || "-"}
                />
              </div>
            </div>
            <div className="flex justify-start gap-4">
              <Button onPress={close} className="w-full">
                Close
              </Button>
            </div>
          </div>
        </>
      )}
    </Dialog>
  );
}
