"use client";

import { Button } from "@/components/atoms/Button";
import { Spinner } from "@/components/atoms/Spinner";
import { TextArea } from "@/components/atoms/TextArea";
import useApi from "@/hooks/useApi";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback } from "react";
import useSWR from "swr";

interface JobMetadataSectionProps {
  job?: {
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
  isLoading: boolean;
  error: unknown;
}

function JobMetadataSection(props: JobMetadataSectionProps) {
  return (
    <section>
      {props.isLoading ? (
        <div className="space-y-2">
          <div className="font-semibold text-green-600">Metadata</div>
          <div className="grid grid-cols-[100px_1fr] items-center text-sm">
            <div className="font-semibold">Queue:</div>
            <div className="h-3 w-1/6 animate-pulse rounded-md bg-slate-300 dark:bg-slate-700" />

            <div className="font-semibold">Name:</div>
            <div className="h-3 w-1/6 animate-pulse rounded-md bg-slate-300 dark:bg-slate-700" />

            <div className="font-semibold">Job ID:</div>
            <div className="h-3 w-1/6 animate-pulse rounded-md bg-slate-300 dark:bg-slate-700" />

            <div className="font-semibold">Started At:</div>
            <div className="h-3 w-1/6 animate-pulse rounded-md bg-slate-300 dark:bg-slate-700" />

            <div className="font-semibold">Finished At:</div>
            <div className="h-3 w-1/6 animate-pulse rounded-md bg-slate-300 dark:bg-slate-700" />
          </div>
        </div>
      ) : props.error ? (
        <div className="space-y-2">
          <div className="font-semibold text-green-600">Metadata</div>
          <div className="grid grid-cols-[100px_1fr] items-center text-sm">
            <div className="font-semibold">Queue:</div>
            <div className="h-3 w-1/6 rounded-md bg-red-300 dark:bg-red-800" />

            <div className="font-semibold">Name:</div>
            <div className="h-3 w-1/6 rounded-md bg-red-300 dark:bg-red-800" />

            <div className="font-semibold">Job ID:</div>
            <div className="h-3 w-1/6 rounded-md bg-red-300 dark:bg-red-800" />

            <div className="font-semibold">Started At:</div>
            <div className="h-3 w-1/6 rounded-md bg-red-300 dark:bg-red-800" />

            <div className="font-semibold">Finished At:</div>
            <div className="h-3 w-1/6 rounded-md bg-red-300 dark:bg-red-800" />
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="font-semibold text-green-600">Metadata</div>
          <div className="grid grid-cols-[100px_1fr] items-center text-sm">
            <div className="font-semibold">Queue:</div>
            <div>{props.job!.queue}</div>

            <div className="font-semibold">Name:</div>
            <div>{props.job!.name}</div>

            <div className="font-semibold">Job ID:</div>
            <div>{props.job!.jobId}</div>

            <div className="font-semibold">Started At:</div>
            <div>{new Date(props.job!.createdAt).toLocaleString()}</div>

            <div className="font-semibold">Finished At:</div>
            <div>
              {props.job!.finishedOn
                ? new Date(props.job!.finishedOn).toLocaleString()
                : "-"}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

interface JobLogsSectionProps {
  job?: {
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
  isLoading: boolean;
  error: unknown;
}

function JobLogsSection(props: JobLogsSectionProps) {
  return (
    <section>
      <div className="space-y-2">
        <div className="font-semibold text-green-600">Runtime</div>
        <div className="space-y-2 text-sm">
          <div className="font-semibold">Data:</div>
          <TextArea
            rows={5}
            isReadOnly
            value={props.job ? JSON.stringify(props.job.data) : ""}
            isDisabled={props.isLoading || !!props.error}
          />
        </div>
        {props.job?.status === "running" && (
          <div className="space-y-2 text-sm">
            <div className="font-semibold">Result:</div>
            <Spinner />
          </div>
        )}
        {props.job?.status === "completed" && (
          <div className="space-y-2 text-sm">
            <div className="font-semibold">Result:</div>
            <TextArea
              rows={5}
              isReadOnly
              value={props.job ? JSON.stringify(props.job.result) : "-"}
            />
          </div>
        )}
        {props.job?.status === "failed" && (
          <div className="space-y-2 text-sm">
            <div className="font-semibold">Error:</div>
            <TextArea
              rows={10}
              isReadOnly
              value={props.job ? JSON.stringify(props.job.failedReason) : "-"}
            />
          </div>
        )}
        <div className="space-y-2 text-sm">
          <div className="font-semibold">Logs:</div>
          <TextArea
            rows={5}
            isReadOnly
            value={props.job ? props.job.logs?.join("\n") : "-"}
            isDisabled={props.isLoading || !!props.error}
          />
        </div>
      </div>
    </section>
  );
}

export default function JobDetails() {
  const { queue, jobId } = useParams<{ queue: string; jobId: string }>();

  const api = useApi();
  const router = useRouter();

  const { data, isLoading, error } = useSWR<
    {
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
    },
    unknown,
    string | null
  >(`/kmc/jobs/queues/${queue}/runs/${jobId}`, (url) =>
    api.get(url).then((res) => res.data),
  );

  const getBadgeColor = useCallback((status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-600";
      case "failed":
        return "bg-red-600";
      case "orphaned":
        return "bg-yellow-600";
      default:
        return "bg-slate-400";
    }
  }, []);

  return (
    <div className="flex grow flex-col">
      <div className="mx-auto flex w-full max-w-screen-2xl grow flex-col gap-4 p-4 text-slate-800 dark:text-white">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Button onPress={() => router.push("/jobs")} variant="icon">
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 slot="title" className="my-0 text-xl leading-6 font-semibold">
              Job Info
            </h1>
          </div>
          <hr className="border-slate-200 dark:border-slate-700" />
        </div>
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-4 w-1/4 animate-pulse rounded-md bg-slate-300 dark:bg-slate-700" />
            <div className="h-3 w-1/6 animate-pulse rounded-md bg-slate-300 dark:bg-slate-700" />
          </div>
        ) : error ? (
          <div className="space-y-2">
            <div className="h-4 w-1/4 rounded-md bg-red-300 dark:bg-red-800" />
            <div className="h-3 w-1/6 rounded-md bg-red-300 dark:bg-red-800" />
          </div>
        ) : (
          <div className="space-y-2">
            <div>{`${data!.queue}/${data!.name}`}</div>
            <div
              className={`w-fit rounded-md px-1 py-0.5 text-xs text-white capitalize ${getBadgeColor(data!.status)}`}
            >
              {data!.status}
            </div>
          </div>
        )}
        <JobMetadataSection job={data!} isLoading={isLoading} error={error} />
        <JobLogsSection job={data!} isLoading={isLoading} error={error} />
      </div>
    </div>
  );
}
