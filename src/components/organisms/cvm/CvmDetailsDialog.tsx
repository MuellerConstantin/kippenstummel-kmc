import React, { useCallback, useState } from "react";
import { DialogProps, Heading } from "react-aria-components";
import { Dialog } from "@/components/atoms/Dialog";
import { Button } from "@/components/atoms/Button";
import { Check, ChevronDown, ChevronUp, Copy, Equal } from "lucide-react";

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

interface CvmDetailsDialogProps extends Omit<DialogProps, "children"> {
  cvm: {
    id: string;
    latitude: number;
    longitude: number;
    score: number;
    imported: boolean;
    recentlyReported: {
      missing: number;
      spam: number;
      inactive: number;
      inaccessible: number;
    };
    createdAt: string;
    updatedAt: string;
  };
}

export function CvmDetailsDialog(props: CvmDetailsDialogProps) {
  return (
    <Dialog {...props}>
      {({ close }) => (
        <>
          <Heading
            slot="title"
            className="my-0 text-xl leading-6 font-semibold"
          >
            CVM Details
          </Heading>
          <div className="mt-4 flex flex-col gap-4">
            <div className="flex flex-col justify-start gap-4">
              <div className="space-y-2">
                <div>Cigarette Vending Machine</div>
                <div className="flex items-center gap-2">
                  <div className="text-xs">
                    {props.cvm.latitude.toFixed(7)} /{" "}
                    {props.cvm.longitude.toFixed(7)} (lat/lng)
                  </div>
                  <CopyButton
                    text={`${props.cvm.latitude},${props.cvm.longitude}`}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="font-semibold text-green-600">Metadata</div>
                <div className="grid grid-cols-[100px_1fr] text-sm">
                  <div className="font-semibold">Score:</div>
                  <div className="flex items-center gap-1">
                    {(props.cvm.score / 100).toFixed(1)}
                    {props.cvm.score < -100 ? (
                      <div className="flex h-3 w-3 items-center justify-center rounded-full bg-red-500">
                        <ChevronDown className="text-white" />
                      </div>
                    ) : props.cvm.score > 100 ? (
                      <div className="flex h-3 w-3 items-center justify-center rounded-full bg-green-600">
                        <ChevronUp className="text-white" />
                      </div>
                    ) : (
                      <div className="flex h-3 w-3 items-center justify-center rounded-full bg-slate-500">
                        <Equal className="text-white" />
                      </div>
                    )}
                  </div>

                  <div className="font-semibold">Imported:</div>
                  <div>{props.cvm.imported ? "Yes" : "No"}</div>

                  <div className="font-semibold">Created At:</div>
                  <div>{new Date(props.cvm.createdAt).toLocaleString()}</div>

                  <div className="font-semibold">Updated At:</div>
                  <div>{new Date(props.cvm.updatedAt).toLocaleString()}</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="font-semibold text-green-600">
                  Recent Reports
                </div>
                <div className="grid grid-cols-[100px_1fr] text-sm">
                  <div className="font-semibold">Missing:</div>
                  <div>
                    {props.cvm.recentlyReported.missing
                      ? `Yes (${props.cvm.recentlyReported.missing})`
                      : "No"}
                  </div>

                  <div className="font-semibold">Spam:</div>
                  <div>
                    {props.cvm.recentlyReported.spam
                      ? `Yes (${props.cvm.recentlyReported.spam})`
                      : "No"}
                  </div>

                  <div className="font-semibold">Inactive:</div>
                  <div>
                    {props.cvm.recentlyReported.inactive
                      ? `Yes (${props.cvm.recentlyReported.inactive})`
                      : "No"}
                  </div>

                  <div className="font-semibold">Inaccessible:</div>
                  <div>
                    {props.cvm.recentlyReported.inaccessible
                      ? `Yes (${props.cvm.recentlyReported.inaccessible})`
                      : "No"}
                  </div>
                </div>
              </div>
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
