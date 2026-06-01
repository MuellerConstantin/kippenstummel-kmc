"use client";

import { useMemo } from "react";
import useSWR from "swr";
import useApi from "@/hooks/useApi";
import { Kpi } from "@/components/molecules/visualizations/Kpi";
import { LineChart } from "@/components/molecules/visualizations/LineChart";
import { AggregatedIdentStats } from "@/lib/types/stats";

export interface IdentStatisticsSectionProps {
  lastNDays?: number;
}

export function IdentStatisticsSection({
  lastNDays,
}: IdentStatisticsSectionProps) {
  const api = useApi();

  const identStatsUrl = useMemo(() => {
    const searchParams = new URLSearchParams();

    if (lastNDays) {
      searchParams.set("lastNDays", String(lastNDays));
    }

    return `/kmc/stats/idents?${searchParams.toString()}`;
  }, [lastNDays]);

  const {
    data: identStatsData,
    isLoading: isIdentStatsLoading,
    error: identStatsError,
  } = useSWR<AggregatedIdentStats, unknown, string | null>(
    identStatsUrl,
    (url) => api.get(url).then((res) => res.data),
  );

  return (
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
  );
}
