import React from "react";
import { DialogProps, Heading } from "react-aria-components";
import { Dialog } from "@/components/atoms/Dialog";
import { Button } from "@/components/atoms/Button";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface PreReleaseInfoDialogProps extends Omit<DialogProps, "children"> {}

export function PreReleaseInfoDialog(props: PreReleaseInfoDialogProps) {
  return (
    <Dialog {...props}>
      {({ close }) => (
        <>
          <Heading
            slot="title"
            className="my-0 text-xl leading-6 font-semibold"
          >
            Pre-Release Information
          </Heading>
          <div className="mt-4 flex flex-col gap-4">
            <div className="text-sm">
              This is a preview version of the software. Please note that
              features and content may still change during further development.
              Possible effects:<br></br>
              <br></br>
              <ul className="list-disc">
                <li className="ml-4">New features may be added or removed.</li>
                <li className="ml-4">
                  Data, settings, or accounts may be lost.
                </li>
                <li className="ml-4">
                  Stability and performance may be limited.
                </li>
              </ul>
              <br></br>
              We recommend using this version for testing purposes only and
              creating regular backups of your data.
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
