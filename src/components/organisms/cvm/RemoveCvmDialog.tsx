import React, { useCallback, useState } from "react";
import { DialogProps, Heading } from "react-aria-components";
import { Dialog } from "@/components/atoms/Dialog";
import { Button } from "@/components/atoms/Button";
import useApi from "@/hooks/useApi";
import { Spinner } from "@/components/atoms/Spinner";
import { useSWRConfig } from "swr";

interface RemoveCvmDialogProps extends Omit<DialogProps, "children"> {
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

export function RemoveCvmDialog(props: RemoveCvmDialogProps) {
  const { mutate } = useSWRConfig();
  const { cvm } = props;

  const api = useApi();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDelete = useCallback(
    async (close: () => void) => {
      setIsLoading(true);
      setError(null);

      try {
        await api.delete(`/kmc/cvms/${cvm.id}`);
        mutate((key: string) => /^.*\/kmc\/cvms.*$/.test(key), null);
        close();
      } catch {
        setError("An unexpected error occurred, please retry!");
      } finally {
        setIsLoading(false);
      }
    },
    [api, cvm, mutate],
  );

  return (
    <Dialog {...props}>
      {({ close }) => (
        <>
          <Heading
            slot="title"
            className="my-0 text-xl leading-6 font-semibold"
          >
            Remove CVM
          </Heading>
          <div className="mt-4 flex flex-col gap-4">
            <div>
              Are you sure you want to remove this CVM? This action is
              irreversible.
            </div>
            {error && <p className="text-center text-red-500">{error}</p>}
            <div className="flex justify-start gap-4">
              <Button
                variant="secondary"
                onPress={() => close()}
                className="w-full"
              >
                Cancel
              </Button>
              <Button
                onPress={() => onDelete(close)}
                className="flex w-full justify-center"
              >
                {!isLoading && <span>Confirm</span>}
                {isLoading && <Spinner />}
              </Button>
            </div>
          </div>
        </>
      )}
    </Dialog>
  );
}
