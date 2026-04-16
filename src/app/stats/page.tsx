"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import { Kpi } from "@/components/molecules/visualizations/Kpi";
import { LineChart } from "@/components/molecules/visualizations/LineChart";
import { PieChart } from "@/components/molecules/visualizations/PieChart";
import { DensityMap } from "@/components/molecules/visualizations/DensityMap";
import useAckeeClient from "@/hooks/useAckeeClient";
import { gql } from "urql";
import { Select, SelectItem } from "@/components/atoms/Select";
import {
  AggregatedCvmStats,
  AggregatedIdentStats,
  AggregatedJobStats,
  AggregatedVoteStats,
  CvmDensityStatsPoint,
} from "@/lib/types/stats";

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

interface CvmDensityMapProps {
  nDaysAgo?: number;
}

function CvmRegistrationDensityMap({ nDaysAgo = 7 }: CvmDensityMapProps) {
  const api = useApi();

  const [viewport, setViewport] = useState<{
    bottomLeft: { latitude: number; longitude: number };
    topRight: { latitude: number; longitude: number };
    zoom: number;
  }>({
    bottomLeft: { latitude: 47.27, longitude: 5.87 },
    topRight: { latitude: 55.06, longitude: 15.04 },
    zoom: 4,
  });

  const handleViewportChange = useCallback(
    (data: {
      bottomLeft: { latitude: number; longitude: number };
      topRight: { latitude: number; longitude: number };
      zoom: number;
    }) => {
      setViewport(data);
    },
    [],
  );

  const cvmDensityUrl = useMemo(() => {
    const searchParams = new URLSearchParams();

    searchParams.set(
      "bottomLeft",
      `${viewport.bottomLeft.latitude},${viewport.bottomLeft.longitude}`,
    );
    searchParams.set(
      "topRight",
      `${viewport.topRight.latitude},${viewport.topRight.longitude}`,
    );
    searchParams.set("zoom", String(viewport.zoom));
    searchParams.set(
      "filter",
      `createdAt>=${new Date(Date.now() - nDaysAgo * 24 * 60 * 60 * 1000).toISOString()}`,
    );

    return `/kmc/stats/cvms/density?${searchParams.toString()}`;
  }, [viewport, nDaysAgo]);

  const { data: cvmDensityData, error: cvmDensityError } = useSWR<
    CvmDensityStatsPoint[],
    unknown,
    string | null
  >(cvmDensityUrl, (url) => api.get(url).then((res) => res.data), {
    keepPreviousData: true,
  });

  const visualizationData = useMemo(
    () => [
      {
        type: "densitymap" as const,
        lat: cvmDensityData?.map((p) => p.latitude) || [],
        lon: cvmDensityData?.map((p) => p.longitude) || [],
        z: cvmDensityData?.map((p) => p.count) || [],
        colorscale: [
          [0, "rgba(240,253,244,0)"],
          [0.05, "#bbf7d0"],
          [0.15, "#4ade80"],
          [0.4, "#16a34a"],
          [1, "#14532d"],
        ] as Array<[number, string]>,
        showscale: true,
      },
    ],
    [cvmDensityData],
  );

  return (
    <DensityMap
      title="CVM Registration Density"
      errored={!!cvmDensityError}
      onViewportChange={handleViewportChange}
      data={visualizationData}
      layout={{
        map: {
          style: "/tiles/default.json",
          center: { lat: 51.1657, lon: 10.4515 },
          zoom: 4,
        },
      }}
    />
  );
}

function CvmDensityMap() {
  const api = useApi();

  const [viewport, setViewport] = useState<{
    bottomLeft: { latitude: number; longitude: number };
    topRight: { latitude: number; longitude: number };
    zoom: number;
  }>({
    bottomLeft: { latitude: 47.27, longitude: 5.87 },
    topRight: { latitude: 55.06, longitude: 15.04 },
    zoom: 4,
  });

  const handleViewportChange = useCallback(
    (data: {
      bottomLeft: { latitude: number; longitude: number };
      topRight: { latitude: number; longitude: number };
      zoom: number;
    }) => {
      setViewport(data);
    },
    [],
  );

  const cvmDensityUrl = useMemo(() => {
    const searchParams = new URLSearchParams();

    searchParams.set(
      "bottomLeft",
      `${viewport.bottomLeft.latitude},${viewport.bottomLeft.longitude}`,
    );
    searchParams.set(
      "topRight",
      `${viewport.topRight.latitude},${viewport.topRight.longitude}`,
    );
    searchParams.set("zoom", String(viewport.zoom));

    return `/kmc/stats/cvms/density?${searchParams.toString()}`;
  }, [viewport]);

  const { data: cvmDensityData, error: cvmDensityError } = useSWR<
    CvmDensityStatsPoint[],
    unknown,
    string | null
  >(cvmDensityUrl, (url) => api.get(url).then((res) => res.data), {
    keepPreviousData: true,
  });

  const visualizationData = useMemo(
    () => [
      {
        type: "densitymap" as const,
        lat: cvmDensityData?.map((p) => p.latitude) || [],
        lon: cvmDensityData?.map((p) => p.longitude) || [],
        z: cvmDensityData?.map((p) => p.count) || [],
        colorscale: [
          [0, "rgba(240,253,244,0)"],
          [0.05, "#bbf7d0"],
          [0.15, "#4ade80"],
          [0.4, "#16a34a"],
          [1, "#14532d"],
        ] as Array<[number, string]>,
        showscale: true,
      },
    ],
    [cvmDensityData],
  );

  return (
    <DensityMap
      title="CVM Density"
      errored={!!cvmDensityError}
      onViewportChange={handleViewportChange}
      data={visualizationData}
      layout={{
        map: {
          style: "/tiles/default.json",
          center: { lat: 51.1657, lon: 10.4515 },
          zoom: 4,
        },
      }}
    />
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

  const cvmStatsUrl = useMemo(() => {
    const searchParams = new URLSearchParams();

    if (selectedTimespanFilter) {
      searchParams.set("lastNDays", String(selectedTimespanFilter.lastNDays));
    }

    return `/kmc/stats/cvms?${searchParams.toString()}`;
  }, [selectedTimespanFilter]);

  const voteStatsUrl = useMemo(() => {
    const searchParams = new URLSearchParams();

    if (selectedTimespanFilter) {
      searchParams.set("lastNDays", String(selectedTimespanFilter.lastNDays));
    }

    return `/kmc/stats/votes?${searchParams.toString()}`;
  }, [selectedTimespanFilter]);

  const identStatsUrl = useMemo(() => {
    const searchParams = new URLSearchParams();

    if (selectedTimespanFilter) {
      searchParams.set("lastNDays", String(selectedTimespanFilter.lastNDays));
    }

    return `/kmc/stats/idents?${searchParams.toString()}`;
  }, [selectedTimespanFilter]);

  const jobStatsUrl = useMemo(() => {
    const searchParams = new URLSearchParams();

    if (selectedTimespanFilter) {
      searchParams.set("lastNDays", String(selectedTimespanFilter.lastNDays));
    }

    return `/kmc/stats/jobs?${searchParams.toString()}`;
  }, [selectedTimespanFilter]);

  const {
    data: cvmStatsData,
    isLoading: isCvmStatsLoading,
    error: cvmStatsError,
  } = useSWR<AggregatedCvmStats, unknown, string | null>(cvmStatsUrl, (url) =>
    api.get(url).then((res) => res.data),
  );

  const {
    data: voteStatsData,
    isLoading: isVoteStatsLoading,
    error: voteStatsError,
  } = useSWR<AggregatedVoteStats, unknown, string | null>(voteStatsUrl, (url) =>
    api.get(url).then((res) => res.data),
  );

  const {
    data: identStatsData,
    isLoading: isIdentStatsLoading,
    error: identStatsError,
  } = useSWR<AggregatedIdentStats, unknown, string | null>(
    identStatsUrl,
    (url) => api.get(url).then((res) => res.data),
  );

  const {
    data: jobStatsData,
    isLoading: isJobStatsLoading,
    error: jobStatsError,
  } = useSWR<AggregatedJobStats, unknown, string | null>(jobStatsUrl, (url) =>
    api.get(url).then((res) => res.data),
  );

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
                    value={cvmStatsData?.total || 0}
                    loading={isCvmStatsLoading}
                    errored={!!cvmStatsError}
                  />
                </div>
                <div className="col-span-12 h-48 w-full md:col-span-6 lg:col-span-3">
                  <Kpi
                    title="CVM Registrations"
                    value={cvmStatsData?.registrations.totalLastNDays || 0}
                    loading={isCvmStatsLoading}
                    errored={!!cvmStatsError}
                  />
                </div>
                <div className="col-span-12 h-48 w-full md:col-span-6 lg:col-span-3">
                  <Kpi
                    title="CVM Imports"
                    value={cvmStatsData?.imports.totalLastNDays || 0}
                    loading={isCvmStatsLoading}
                    errored={!!cvmStatsError}
                  />
                </div>
                <div className="col-span-12 h-48 w-full md:col-span-6 lg:col-span-3">
                  <Kpi
                    title="Average CVM Score"
                    value={
                      cvmStatsData?.averageScore
                        ? Number((cvmStatsData.averageScore / 100).toFixed(1))
                        : 0
                    }
                    loading={isCvmStatsLoading}
                    errored={!!cvmStatsError}
                  />
                </div>
                <div className="col-span-12 h-96 w-full">
                  <LineChart
                    title="CVMs Registered Last Days"
                    traces={[
                      {
                        x:
                          cvmStatsData?.registrations.history.map(
                            (r) => r.date,
                          ) || [],
                        y:
                          cvmStatsData?.registrations.history.map(
                            (r) => r.count,
                          ) || [],
                        lineColor: "#65a30d",
                        name: "Registrations",
                      },
                      {
                        x:
                          cvmStatsData?.imports.history.map((r) => r.date) ||
                          [],
                        y:
                          cvmStatsData?.imports.history.map((r) => r.count) ||
                          [],
                        lineColor: "#f59e0b",
                        name: "Imports",
                      },
                    ]}
                    loading={isCvmStatsLoading}
                    errored={!!cvmStatsError}
                  />
                </div>
                <div className="col-span-6 h-96 w-full">
                  <CvmDensityMap />
                </div>
                <div className="col-span-6 h-96 w-full">
                  <CvmRegistrationDensityMap />
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
                    value={voteStatsData?.upvotes.total || 0}
                    loading={isVoteStatsLoading}
                    errored={!!voteStatsError}
                  />
                </div>
                <div className="col-span-12 h-48 w-full md:col-span-6 lg:col-span-3">
                  <Kpi
                    title="Upvotes"
                    value={voteStatsData?.upvotes.totalLastNDays || 0}
                    loading={isVoteStatsLoading}
                    errored={!!voteStatsError}
                  />
                </div>
                <div className="col-span-12 h-48 w-full md:col-span-6 lg:col-span-3">
                  <Kpi
                    title="Downvotes"
                    value={voteStatsData?.downvotes.totalLastNDays || 0}
                    loading={isVoteStatsLoading}
                    errored={!!voteStatsError}
                  />
                </div>
                <div className="col-span-12 h-96 w-full">
                  <LineChart
                    title="CVMs Voted Last Days"
                    traces={[
                      {
                        x:
                          voteStatsData?.upvotes.history.map((r) => r.date) ||
                          [],
                        y:
                          voteStatsData?.upvotes.history.map((r) => r.count) ||
                          [],
                        lineColor: "#65a30d",
                        name: "Upvotes",
                      },
                      {
                        x:
                          voteStatsData?.downvotes.history.map((r) => r.date) ||
                          [],
                        y:
                          voteStatsData?.downvotes.history.map(
                            (r) => r.count,
                          ) || [],
                        lineColor: "#dc2626",
                        name: "Downvotes",
                      },
                    ]}
                    loading={isVoteStatsLoading}
                    errored={!!voteStatsError}
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
                    value={identStatsData?.total || 0}
                    loading={isIdentStatsLoading}
                    errored={!!identStatsError}
                  />
                </div>
                <div className="col-span-12 h-48 w-full md:col-span-6 lg:col-span-3">
                  <Kpi
                    title="New Idents"
                    value={identStatsData?.totalNewLastNDays || 0}
                    loading={isIdentStatsLoading}
                    errored={!!identStatsError}
                  />
                </div>
                <div className="col-span-12 h-48 w-full md:col-span-6 lg:col-span-3">
                  <Kpi
                    title="Average Credibility"
                    value={identStatsData?.averageCredibility || 0}
                    loading={isIdentStatsLoading}
                    errored={!!identStatsError}
                  />
                </div>
                <div className="col-span-12 h-96 w-full">
                  <LineChart
                    title="New Idents Last Days"
                    traces={[
                      {
                        x: identStatsData?.newHistory.map((r) => r.date) || [],
                        y: identStatsData?.newHistory.map((r) => r.count) || [],
                        lineColor: "#65a30d",
                        name: "New Idents",
                      },
                    ]}
                    loading={isIdentStatsLoading}
                    errored={!!identStatsError}
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
                    value={jobStatsData?.total || 0}
                    loading={isJobStatsLoading}
                    errored={!!jobStatsError}
                  />
                </div>
                <div className="col-span-12 h-48 w-full md:col-span-6 lg:col-span-3">
                  <Kpi
                    title="Job Runs"
                    value={jobStatsData?.totalRunLastNDays || 0}
                    loading={isJobStatsLoading}
                    errored={!!jobStatsError}
                  />
                </div>
                <div className="col-span-12 h-48 w-full md:col-span-6 lg:col-span-3">
                  <Kpi
                    title="Number of Different Job Types"
                    value={jobStatsData?.differentTypes || 0}
                    loading={isJobStatsLoading}
                    errored={!!jobStatsError}
                  />
                </div>
                <div className="col-span-12 h-96 w-full">
                  <LineChart
                    title="Jobs Run Last Days"
                    traces={[
                      {
                        x: jobStatsData?.runHistory.map((r) => r.date) || [],
                        y: jobStatsData?.runHistory.map((r) => r.count) || [],
                        lineColor: "#65a30d",
                        name: "Jobs Run",
                      },
                    ]}
                    loading={isJobStatsLoading}
                    errored={!!jobStatsError}
                  />
                </div>
                <div className="col-span-12 h-96 w-full md:col-span-6">
                  <PieChart
                    title="Jobs Run Status"
                    data={[
                      {
                        labels: ["Completed", "Failed", "Running", "Orphaned"],
                        values: [
                          jobStatsData?.statusCounts.completed || 0,
                          jobStatsData?.statusCounts.failed || 0,
                          jobStatsData?.statusCounts.running || 0,
                          jobStatsData?.statusCounts.orphaned || 0,
                        ],
                        colors: ["#16a34a", "#dc2626", "#94a3b8", "#eab308"],
                      },
                    ]}
                    loading={isJobStatsLoading}
                    errored={!!jobStatsError}
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
