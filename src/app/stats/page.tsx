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
      cvms: {
        total: number;
        averageScore: number;
        imports: {
          total: number;
          totalLast7Days: number;
          history: {
            date: string;
            count: number;
          }[];
        };
        registrations: {
          total: number;
          totalLast7Days: number;
          history: {
            date: string;
            count: number;
          }[];
        };
      };
      votes: {
        total: number;
        upvotes: {
          total: number;
          totalLast7Days: number;
          history: {
            date: string;
            count: number;
          }[];
        };
        downvotes: {
          total: number;
          totalLast7Days: number;
          history: {
            date: string;
            count: number;
          }[];
        };
      };
    },
    unknown,
    string | null
  >("/kmc/stats", (url) => api.get(url).then((res) => res.data));

  return (
    <div className="flex grow flex-col">
      <div className="mx-auto flex w-full max-w-screen-2xl grow flex-col gap-8 p-4">
        <section className="flex w-full flex-col gap-4">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            CVM Statistics
          </h1>
          <div className="grid w-full grid-cols-12 gap-4">
            <div className="col-span-12 h-48 w-full md:col-span-6 lg:col-span-3">
              <Kpi
                title="Total CVMs"
                value={data?.cvms.total || 0}
                loading={isLoading}
                errored={!!error}
              />
            </div>
            <div className="col-span-12 h-48 w-full md:col-span-6 lg:col-span-3">
              <Kpi
                title="Total CVMs Imported"
                value={data?.cvms.imports.total || 0}
                loading={isLoading}
                errored={!!error}
              />
            </div>
            <div className="col-span-12 h-48 w-full md:col-span-6 lg:col-span-3">
              <Kpi
                title="Total CVMs Registered"
                value={data?.cvms.registrations.total || 0}
                loading={isLoading}
                errored={!!error}
              />
            </div>
            <div className="col-span-12 h-48 w-full md:col-span-6 lg:col-span-3">
              <Kpi
                title="Total CVMs Registered Last 7 Days"
                value={data?.cvms.registrations.totalLast7Days || 0}
                loading={isLoading}
                errored={!!error}
              />
            </div>
            <div className="col-span-12 h-48 w-full md:col-span-6 lg:col-span-3">
              <Kpi
                title="Total CVMs Imported Last 7 Days"
                value={data?.cvms.imports.totalLast7Days || 0}
                loading={isLoading}
                errored={!!error}
              />
            </div>
            <div className="col-span-12 h-48 w-full md:col-span-6 lg:col-span-3">
              <Kpi
                title="Average CVM Score"
                value={
                  data?.cvms.averageScore
                    ? Number((data.cvms.averageScore / 100).toFixed(1))
                    : 0
                }
                loading={isLoading}
                errored={!!error}
              />
            </div>
            <div className="col-span-12 h-96 w-full">
              <LineChart
                title="CVMs Registered Last Days"
                traces={[
                  {
                    x:
                      data?.cvms.registrations.history.map((r) => r.date) || [],
                    y:
                      data?.cvms.registrations.history.map((r) => r.count) ||
                      [],
                    lineColor: "#65a30d",
                    name: "Registrations",
                  },
                  {
                    x: data?.cvms.imports.history.map((r) => r.date) || [],
                    y: data?.cvms.imports.history.map((r) => r.count) || [],
                    lineColor: "#f59e0b",
                    name: "Imports",
                  },
                ]}
                loading={isLoading}
                errored={!!error}
              />
            </div>
          </div>
        </section>
        <section className="flex w-full flex-col gap-4">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Voting Statistics
          </h1>
          <div className="grid w-full grid-cols-12 gap-4">
            <div className="col-span-12 h-48 w-full md:col-span-6 lg:col-span-3">
              <Kpi
                title="Total Votes"
                value={data?.votes.upvotes.total || 0}
                loading={isLoading}
                errored={!!error}
              />
            </div>
            <div className="col-span-12 h-48 w-full md:col-span-6 lg:col-span-3">
              <Kpi
                title="Total Upvotes"
                value={data?.votes.upvotes.totalLast7Days || 0}
                loading={isLoading}
                errored={!!error}
              />
            </div>
            <div className="col-span-12 h-48 w-full md:col-span-6 lg:col-span-3">
              <Kpi
                title="Total Downvotes"
                value={data?.votes.downvotes.totalLast7Days || 0}
                loading={isLoading}
                errored={!!error}
              />
            </div>
            <div className="col-span-12 h-48 w-full md:col-span-6 lg:col-span-3">
              <Kpi
                title="Total Upvotes Last 7 Days"
                value={data?.votes.upvotes.totalLast7Days || 0}
                loading={isLoading}
                errored={!!error}
              />
            </div>
            <div className="col-span-12 h-48 w-full md:col-span-6 lg:col-span-3">
              <Kpi
                title="Total Downvotes Last 7 Days"
                value={data?.votes.downvotes.totalLast7Days || 0}
                loading={isLoading}
                errored={!!error}
              />
            </div>
            <div className="col-span-12 h-96 w-full">
              <LineChart
                title="CVMs Votes Last Days"
                traces={[
                  {
                    x: data?.votes.upvotes.history.map((r) => r.date) || [],
                    y: data?.votes.upvotes.history.map((r) => r.count) || [],
                    lineColor: "#65a30d",
                    name: "Upvotes",
                  },
                  {
                    x: data?.votes.downvotes.history.map((r) => r.date) || [],
                    y: data?.votes.downvotes.history.map((r) => r.count) || [],
                    lineColor: "#dc2626",
                    name: "Downvotes",
                  },
                ]}
                loading={isLoading}
                errored={!!error}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
