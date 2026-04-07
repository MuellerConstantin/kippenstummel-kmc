"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import useSWR from "swr";
import { ListBox, ListBoxItem } from "@/components/atoms/ListBox";
import { useEnv } from "@/contexts/RuntimeConfigProvider";
import useApi from "@/hooks/useApi";
import {
  Cigarette,
  Vote,
  Fingerprint,
  ListTodo,
  ChartNoAxesCombined,
} from "lucide-react";
import { PieChart } from "@/components/molecules/visualizations/PieChart";
import useAckeeClient from "@/hooks/useAckeeClient";
import { gql } from "urql";
import { Select, SelectItem } from "@/components/atoms/Select";

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

function Sidebar() {
  const navigation = useMemo(() => {
    return {
      content: [
        {
          name: "CVM Statistics",
          icon: Cigarette,
          path: `#section-cvm-stats`,
        },
        {
          name: "Voting Statistics",
          icon: Vote,
          path: `#section-voting-stats`,
        },
      ],
      platform: [
        {
          name: "Ident Statistics",
          icon: Fingerprint,
          path: `#section-ident-stats`,
        },
        {
          name: "Job Statistics",
          icon: ListTodo,
          path: `#section-job-stats`,
        },
        {
          name: "Analytics Statistics",
          icon: ChartNoAxesCombined,
          path: `#section-analytics-stats`,
        },
      ],
    };
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <h5 className="text-sm font-semibold text-gray-500 uppercase dark:text-gray-400">
        Statistics
      </h5>
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="text-sm font-semibold text-gray-900 dark:text-white">
            Content
          </div>
          <ListBox className="space-y-1">
            {navigation["content"].map((item) => (
              <ListBoxItem
                id={`stats-sidebar-${item.name}`}
                key={item.name}
                href={item.path}
              >
                <div className="inline-flex items-center space-x-2">
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </div>
              </ListBoxItem>
            ))}
          </ListBox>
        </div>
        <div className="space-y-2">
          <div className="text-sm font-semibold text-gray-900 dark:text-white">
            Platform
          </div>
          <ListBox className="space-y-1">
            {navigation["platform"].map((item) => (
              <ListBoxItem
                id={`stats-sidebar-${item.name}`}
                key={item.name}
                href={item.path}
              >
                <div className="inline-flex items-center space-x-2">
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </div>
              </ListBoxItem>
            ))}
          </ListBox>
        </div>
      </div>
    </div>
  );
}

interface AnalyticsSectionProps {
  nDaysAgo?: number;
}

function AnalyticsSection({ nDaysAgo = 7 }: AnalyticsSectionProps) {
  const client = useAckeeClient();

  const ACKEE_DOMAIN_ID = useEnv("NEXT_PUBLIC_ACKEE_DOMAIN_ID");

  const [viewsToday, setViewsToday] = useState(0);
  const [viewsMonth, setViewsMonth] = useState(0);
  const [viewsYear, setViewsYear] = useState(0);
  const [dailyViews, setDailyViews] = useState<
    { date: string; count: number }[]
  >([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  function dateFromDaysAgo(daysAgo: number) {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().slice(0, 10);
  }

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    client
      .query(
        gql`
          query ($id: ID!) {
            domain(id: $id) {
              facts {
                viewsToday
                viewsMonth
                viewsYear
              }
              statistics {
                views(interval: DAILY, type: UNIQUE, limit: ${String(nDaysAgo)}) {
                  id
                  count
                }
              }
            }
          }
        `,
        {
          id: ACKEE_DOMAIN_ID,
        },
      )
      .toPromise()
      .then((result) => {
        if (cancelled) return;

        if (result.error) {
          setError(result.error);
          return;
        }

        const domain = result.data?.domain;
        const facts = domain?.facts;
        const views = domain?.statistics?.views ?? [];

        setViewsToday(facts?.viewsToday ?? 0);
        setViewsMonth(facts?.viewsMonth ?? 0);
        setViewsYear(facts?.viewsYear ?? 0);
        setDailyViews(
          views.map((value: { count: number }, index: number) => ({
            date: dateFromDaysAgo(index),
            count: value.count,
          })),
        );
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [client, ACKEE_DOMAIN_ID, nDaysAgo]);

  return (
    <div className="grid w-full grid-cols-12 gap-4">
      <div className="col-span-12 h-48 md:col-span-6 lg:col-span-3">
        <Kpi
          title="Views Today"
          value={viewsToday}
          loading={isLoading}
          errored={!!error}
        />
      </div>
      <div className="col-span-12 h-48 md:col-span-6 lg:col-span-3">
        <Kpi
          title="Views this Month"
          value={viewsMonth}
          loading={isLoading}
          errored={!!error}
        />
      </div>
      <div className="col-span-12 h-48 md:col-span-6 lg:col-span-3">
        <Kpi
          title="Views this Year"
          value={viewsYear}
          loading={isLoading}
          errored={!!error}
        />
      </div>
      <div className="col-span-12 h-96 w-full">
        <LineChart
          title="Unique Views"
          traces={[
            {
              x: dailyViews.map((d) => d.date),
              y: dailyViews.map((d) => d.count),
              lineColor: "#65a30d",
              name: "Unique Views",
            },
          ]}
          yAxis={{
            rangemode: "tozero",
          }}
          loading={isLoading}
          errored={!!error}
        />
      </div>
    </div>
  );
}

export default function Stats() {
  const api = useApi();

  const timespanOptions = useMemo(
    () => [
      {
        label: "Last 7 Days",
        value: "last7Days",
        filter: { lastNDays: 7 },
      },
      {
        label: "Last 30 Days",
        value: "last30Days",
        filter: { lastNDays: 30 },
      },
    ],
    [],
  );

  const [selectedTimespan, setSelectedTimespan] = useState<string>(
    `timespan-select-${timespanOptions[0].value}`,
  );

  const selectedTimespanFilter = useMemo(() => {
    const option = timespanOptions.find(
      (option) => `timespan-select-${option.value}` === selectedTimespan,
    );

    return option?.filter || null;
  }, [selectedTimespan, timespanOptions]);

  const url = useMemo(() => {
    const searchParams = new URLSearchParams();

    if (selectedTimespanFilter) {
      searchParams.set("lastNDays", String(selectedTimespanFilter.lastNDays));
    }

    return `/kmc/stats?${searchParams.toString()}`;
  }, [selectedTimespanFilter]);

  const { data, isLoading, error } = useSWR<
    {
      cvms: {
        total: number;
        averageScore: number;
        imports: {
          total: number;
          totalLastNDays: number;
          history: {
            date: string;
            count: number;
          }[];
        };
        registrations: {
          total: number;
          totalLastNDays: number;
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
          totalLastNDays: number;
          history: {
            date: string;
            count: number;
          }[];
        };
        downvotes: {
          total: number;
          totalLastNDays: number;
          history: {
            date: string;
            count: number;
          }[];
        };
      };
      idents: {
        total: number;
        averageCredibility: number;
        totalNewLastNDays: number;
        newHistory: {
          date: string;
          count: number;
        }[];
      };
      jobs: {
        total: number;
        differentTypes: number;
        statusCounts: {
          running: number;
          completed: number;
          failed: number;
          orphaned: number;
        };
        totalRunLastNDays: number;
        runHistory: {
          date: string;
          count: number;
        }[];
      };
    },
    unknown,
    string | null
  >(url, (url) => api.get(url).then((res) => res.data));

  return (
    <div className="flex grow flex-col gap-4 bg-slate-50 dark:bg-slate-800">
      <div className="mx-auto flex w-full max-w-screen-2xl grow flex-col gap-4">
        <div className="flex w-full grow flex-col lg:flex-row lg:gap-8">
          <div className="w-full min-w-[15rem] shrink-0 space-y-4 overflow-hidden border-r border-slate-200 bg-white p-4 lg:w-[20rem] dark:border-slate-700 dark:bg-slate-800">
            <Sidebar />
          </div>
          <div className="flex w-full flex-col gap-4 p-4">
            <section className="flex flex-col gap-4 md:flex-row">
              <Select
                label="Timespan"
                items={timespanOptions}
                selectedKey={selectedTimespan}
                onSelectionChange={(property) =>
                  setSelectedTimespan(property as string)
                }
                className="w-64 max-w-full"
              >
                {timespanOptions.map((option) => (
                  <SelectItem
                    id={`timespan-select-${option.value}`}
                    key={option.value}
                    textValue={option.value}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </Select>
            </section>
            <section
              id="section-cvm-stats"
              className="flex w-full flex-col gap-4"
            >
              <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
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
                    title="CVM Registrations"
                    value={data?.cvms.registrations.totalLastNDays || 0}
                    loading={isLoading}
                    errored={!!error}
                  />
                </div>
                <div className="col-span-12 h-48 w-full md:col-span-6 lg:col-span-3">
                  <Kpi
                    title="CVM Imports"
                    value={data?.cvms.imports.totalLastNDays || 0}
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
                          data?.cvms.registrations.history.map((r) => r.date) ||
                          [],
                        y:
                          data?.cvms.registrations.history.map(
                            (r) => r.count,
                          ) || [],
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
            <section
              id="section-voting-stats"
              className="flex w-full flex-col gap-4"
            >
              <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
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
                    title="Upvotes"
                    value={data?.votes.upvotes.totalLastNDays || 0}
                    loading={isLoading}
                    errored={!!error}
                  />
                </div>
                <div className="col-span-12 h-48 w-full md:col-span-6 lg:col-span-3">
                  <Kpi
                    title="Downvotes"
                    value={data?.votes.downvotes.totalLastNDays || 0}
                    loading={isLoading}
                    errored={!!error}
                  />
                </div>
                <div className="col-span-12 h-96 w-full">
                  <LineChart
                    title="CVMs Voted Last Days"
                    traces={[
                      {
                        x: data?.votes.upvotes.history.map((r) => r.date) || [],
                        y:
                          data?.votes.upvotes.history.map((r) => r.count) || [],
                        lineColor: "#65a30d",
                        name: "Upvotes",
                      },
                      {
                        x:
                          data?.votes.downvotes.history.map((r) => r.date) ||
                          [],
                        y:
                          data?.votes.downvotes.history.map((r) => r.count) ||
                          [],
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
            <section
              id="section-ident-stats"
              className="flex w-full flex-col gap-4"
            >
              <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Ident Statistics
              </h1>
              <div className="grid w-full grid-cols-12 gap-4">
                <div className="col-span-12 h-48 w-full md:col-span-6 lg:col-span-3">
                  <Kpi
                    title="Total Idents"
                    value={data?.idents.total || 0}
                    loading={isLoading}
                    errored={!!error}
                  />
                </div>
                <div className="col-span-12 h-48 w-full md:col-span-6 lg:col-span-3">
                  <Kpi
                    title="New Idents"
                    value={data?.idents.totalNewLastNDays || 0}
                    loading={isLoading}
                    errored={!!error}
                  />
                </div>
                <div className="col-span-12 h-48 w-full md:col-span-6 lg:col-span-3">
                  <Kpi
                    title="Average Credibility"
                    value={data?.idents.averageCredibility || 0}
                    loading={isLoading}
                    errored={!!error}
                  />
                </div>
                <div className="col-span-12 h-96 w-full">
                  <LineChart
                    title="New Idents Last Days"
                    traces={[
                      {
                        x: data?.idents.newHistory.map((r) => r.date) || [],
                        y: data?.idents.newHistory.map((r) => r.count) || [],
                        lineColor: "#65a30d",
                        name: "New Idents",
                      },
                    ]}
                    loading={isLoading}
                    errored={!!error}
                  />
                </div>
              </div>
            </section>
            <section
              id="section-job-stats"
              className="flex w-full flex-col gap-4"
            >
              <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Job Statistics
              </h1>
              <div className="grid w-full grid-cols-12 gap-4">
                <div className="col-span-12 h-48 w-full md:col-span-6 lg:col-span-3">
                  <Kpi
                    title="Total Job Runs"
                    value={data?.jobs.total || 0}
                    loading={isLoading}
                    errored={!!error}
                  />
                </div>
                <div className="col-span-12 h-48 w-full md:col-span-6 lg:col-span-3">
                  <Kpi
                    title="Job Runs"
                    value={data?.jobs.totalRunLastNDays || 0}
                    loading={isLoading}
                    errored={!!error}
                  />
                </div>
                <div className="col-span-12 h-48 w-full md:col-span-6 lg:col-span-3">
                  <Kpi
                    title="Number of Different Job Types"
                    value={data?.jobs.differentTypes || 0}
                    loading={isLoading}
                    errored={!!error}
                  />
                </div>
                <div className="col-span-12 h-96 w-full">
                  <LineChart
                    title="Jobs Run Last Days"
                    traces={[
                      {
                        x: data?.jobs.runHistory.map((r) => r.date) || [],
                        y: data?.jobs.runHistory.map((r) => r.count) || [],
                        lineColor: "#65a30d",
                        name: "Jobs Run",
                      },
                    ]}
                    loading={isLoading}
                    errored={!!error}
                  />
                </div>
                <div className="col-span-12 h-96 w-full md:col-span-6">
                  <PieChart
                    title="Jobs Run Status"
                    data={[
                      {
                        labels: ["Completed", "Failed", "Running", "Orphaned"],
                        values: [
                          data?.jobs.statusCounts.completed || 0,
                          data?.jobs.statusCounts.failed || 0,
                          data?.jobs.statusCounts.running || 0,
                          data?.jobs.statusCounts.orphaned || 0,
                        ],
                        colors: ["#16a34a", "#dc2626", "#94a3b8", "#eab308"],
                      },
                    ]}
                    loading={isLoading}
                    errored={!!error}
                  />
                </div>
              </div>
            </section>
            <section
              id="section-analytics-stats"
              className="flex w-full flex-col gap-4"
            >
              <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Analytics Statistics
              </h1>
              <AnalyticsSection nDaysAgo={selectedTimespanFilter?.lastNDays} />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
