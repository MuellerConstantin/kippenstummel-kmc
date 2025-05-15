"use client";

import dynamic from "next/dynamic";
import useSWR from "swr";
import useApi from "@/hooks/useApi";

const Kpi = dynamic(
  () =>
    import("@/components/molecules/visualizations/Kpi").then((mod) => mod.Kpi),
  {
    ssr: false,
  },
);

const LineChart = dynamic(
  () =>
    import("@/components/molecules/visualizations/LineChart").then(
      (mod) => mod.LineChart,
    ),
  {
    ssr: false,
  },
);

export default function Stats() {
  const api = useApi();

  const { data, isLoading, error } = useSWR<
    {
      registrations: {
        count: number;
        countImported: number;
        countRegistered: number;
        totalLast7Days: number;
        registrationHistory: {
          date: string;
          count: number;
        }[];
      };
      votes: {
        count: number;
        totalLast7Days: number;
        voteHistory: {
          date: string;
          count: number;
          upvotes: number;
          downvotes: number;
        }[];
      };
    },
    unknown,
    string | null
  >("/kmc/stats", (url) => api.get(url).then((res) => res.data));

  return (
    <div className="flex grow flex-col">
      <div className="mx-auto flex w-full max-w-screen-2xl grow flex-col gap-8 p-4">
        <section className="flex w-full flex-col gap-4">
          <h1 className="text-2xl font-semibold text-green-600">
            CVM Registration Statistics
          </h1>
          <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <div className="h-48 w-full">
              <Kpi
                title="Total CVMs"
                value={data?.registrations.count || 0}
                loading={isLoading}
                errored={!!error}
              />
            </div>
            <div className="h-48 w-full">
              <Kpi
                title="Total CVMs Imported"
                value={data?.registrations.countImported || 0}
                loading={isLoading}
                errored={!!error}
              />
            </div>
            <div className="h-48 w-full">
              <Kpi
                title="Total CVMs Registered"
                value={data?.registrations.countRegistered || 0}
                loading={isLoading}
                errored={!!error}
              />
            </div>
            <div className="h-48 w-full">
              <Kpi
                title="Total CVMs Registered Last 7 Days"
                value={data?.registrations.totalLast7Days || 0}
                loading={isLoading}
                errored={!!error}
              />
            </div>
          </div>
          <div>
            <LineChart
              title="CVMs Registered Last Days"
              values={{
                x:
                  data?.registrations.registrationHistory.map((r) => r.date) ||
                  [],
                y:
                  data?.registrations.registrationHistory.map((r) => r.count) ||
                  [],
              }}
              loading={isLoading}
              errored={!!error}
            />
          </div>
        </section>
        <section className="flex w-full flex-col gap-4">
          <h1 className="text-2xl font-semibold text-green-600">
            CVM Voting Statistics
          </h1>
          <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <div className="h-48 w-full">
              <Kpi
                title="Total Votes"
                value={data?.votes.count || 0}
                loading={isLoading}
                errored={!!error}
              />
            </div>
            <div className="h-48 w-full">
              <Kpi
                title="Total Votes Last 7 Days"
                value={data?.votes.totalLast7Days || 0}
                loading={isLoading}
                errored={!!error}
              />
            </div>
          </div>
          <div>
            <LineChart
              title="CVMs Votes Last Days"
              values={{
                x: data?.votes.voteHistory.map((r) => r.date) || [],
                y: data?.votes.voteHistory.map((r) => r.count) || [],
              }}
              loading={isLoading}
              errored={!!error}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
