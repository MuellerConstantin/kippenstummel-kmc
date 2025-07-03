import React, { useCallback, useState } from "react";
import { DialogProps, Heading } from "react-aria-components";
import { Dialog } from "@/components/atoms/Dialog";
import { Button } from "@/components/atoms/Button";
import useApi from "@/hooks/useApi";
import { Spinner } from "@/components/atoms/Spinner";
import { useSWRConfig } from "swr";

interface DeleteIdentDialogProps extends Omit<DialogProps, "children"> {
  idents: {
    identity: string;
    createdAt?: string;
    updatedAt?: string;
    credibility: number;
  }[];
}

export function DeleteIdentDialog(props: DeleteIdentDialogProps) {
  const { mutate } = useSWRConfig();
  const { idents } = props;

  const api = useApi();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDelete = useCallback(
    (close: () => void) => {
      setIsLoading(true);
      setError(null);

      Promise.all(
        idents.map((ident) => api.delete(`/kmc/ident/${ident.identity}`)),
      )
        .then(() => {
          mutate((key: string) => /^.*\/kmc\/ident.*$/.test(key), null);
        })
        .then(close)
        .catch(() => setError("An unexpected error occurred, please retry!"))
        .finally(() => {
          setIsLoading(false);
        });
    },
    [api, idents, mutate],
  );

  return (
    <Dialog {...props}>
      {({ close }) => (
        <>
          <Heading
            slot="title"
            className="my-0 text-xl leading-6 font-semibold"
          >
            {props.idents.length > 1 ? "Delete Identities" : "Delete Identity"}
          </Heading>
          <div className="mt-4 flex flex-col gap-4">
            <div>
              Are you sure you want to delete{" "}
              {props.idents.length > 1
                ? `${props.idents.length} idenities`
                : "this identity"}
              ? This action is irreversible.
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
