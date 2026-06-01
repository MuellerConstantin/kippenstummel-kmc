"use client";

import { useMemo } from "react";
import useSWR from "swr";
import useApi from "@/hooks/useApi";
import { Kpi } from "@/components/molecules/visualizations/Kpi";
import { LineChart } from "@/components/molecules/visualizations/LineChart";
import { PieChart } from "@/components/molecules/visualizations/PieChart";
import { AggregatedJobStats } from "@/lib/types/stats";
import { filteredScope, fixedScope } from "@/lib/stats-scope";

export interface JobStatisticsSectionProps {
  lastNDays?: number;
}

export function JobStatisticsSection({ lastNDays }: JobStatisticsSectionProps) {
  const api = useApi();

  const jobStatsUrl = useMemo(() => {
    const searchParams = new URLSearchParams();

    if (lastNDays) {
      searchParams.set("lastNDays", String(lastNDays));
    }

    return `/kmc/stats/jobs?${searchParams.toString()}`;
  }, [lastNDays]);

  const {
    data: jobStatsData,
    isLoading: isJobStatsLoading,
    error: jobStatsError,
  } = useSWR<AggregatedJobStats, unknown, string | null>(jobStatsUrl, (url) =>
    api.get(url).then((res) => res.data),
  );

  const filtered = filteredScope(lastNDays ?? 7);
  const allTime = fixedScope("All time");

  return (
    <div className="grid w-full grid-cols-12 gap-4">
      <div className="col-span-12 h-48 w-full md:col-span-6 lg:col-span-3">
        <Kpi
          title="Total Job Runs"
          scope={allTime}
          value={jobStatsData?.total || 0}
          loading={isJobStatsLoading}
          errored={!!jobStatsError}
        />
      </div>
      <div className="col-span-12 h-48 w-full md:col-span-6 lg:col-span-3">
        <Kpi
          title="Job Runs"
          scope={filtered}
          value={jobStatsData?.totalRunLastNDays || 0}
          loading={isJobStatsLoading}
          errored={!!jobStatsError}
        />
      </div>
      <div className="col-span-12 h-48 w-full md:col-span-6 lg:col-span-3">
        <Kpi
          title="Number of Different Job Types"
          scope={allTime}
          value={jobStatsData?.differentTypes || 0}
          loading={isJobStatsLoading}
          errored={!!jobStatsError}
        />
      </div>
      <div className="col-span-12 h-96 w-full">
        <LineChart
          title="Jobs Run Last Days"
          scope={filtered}
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
          scope={allTime}
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
  );
}
