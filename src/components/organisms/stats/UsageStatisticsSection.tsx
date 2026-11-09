"use client";

import { useState, useCallback, useMemo } from "react";
import { Kpi } from "@/components/molecules/visualizations/Kpi";
import { LineChart } from "@/components/molecules/visualizations/LineChart";
import { filteredScope, fixedScope } from "@/lib/stats-scope";
import useSWR from "swr";
import useApi from "@/hooks/useApi";
import { DensityMap } from "@/components/molecules/visualizations/DensityMap";
import { UsageLOcationDensityStatsPoint } from "@/lib/types/stats";
import { buildDensityTrace } from "@/lib/visualization";
import { isSameViewport } from "@/lib/geo";
import type { UmamiPageviews, UmamiStats } from "@/lib/types/analytics";
import {
  dailySeriesParams,
  mergePageviews,
  rangeParams,
  startOfDay,
  toDailySeries,
} from "@/lib/analytics";

interface UsageLocationDensityMapProps {
  nDaysAgo?: number;
}

function UsageLocationDensityMap({
  nDaysAgo = 7,
}: UsageLocationDensityMapProps) {
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
      setViewport((current) =>
        isSameViewport(current, data) ? current : data,
      );
    },
    [],
  );

  const usageLocationDensityUrl = useMemo(() => {
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
    searchParams.set("lastNDays", String(nDaysAgo));

    return `/kmc/stats/usage-density?${searchParams.toString()}`;
  }, [viewport, nDaysAgo]);

  const { data, error } = useSWR<
    UsageLOcationDensityStatsPoint[],
    unknown,
    string | null
  >(usageLocationDensityUrl, (url) => api.get(url).then((res) => res.data), {
    keepPreviousData: true,
  });

  const visualizationData = useMemo(
    () => [buildDensityTrace(data ?? [])],
    [data],
  );

  return (
    <DensityMap
      title="Usage Location Density"
      scope={filteredScope(nDaysAgo)}
      errored={!!error}
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

interface UsageStatisticsSectionProps {
  lastNDays?: number;
}

export function UsageStatisticsSection({
  lastNDays = 7,
}: UsageStatisticsSectionProps) {
  const api = useApi();

  const fetcher = useCallback(
    (url: string) => api.get(url).then((res) => res.data),
    [api],
  );

  // Ranges are fixed on mount, otherwise every render would yield a new key.
  const { todayUrl, monthUrl, yearUrl } = useMemo(() => {
    const now = new Date();

    return {
      todayUrl: `/umami/stats?${rangeParams(startOfDay(now))}`,
      monthUrl: `/umami/stats?${rangeParams(new Date(now.getFullYear(), now.getMonth(), 1))}`,
      yearUrl: `/umami/stats?${rangeParams(new Date(now.getFullYear(), 0, 1))}`,
    };
  }, []);

  const dailyUrls = useMemo(
    () =>
      dailySeriesParams(lastNDays).map(
        (params) => `/umami/pageviews?${params}`,
      ),
    [lastNDays],
  );

  const today = useSWR<UmamiStats, unknown, string>(todayUrl, fetcher);
  const month = useSWR<UmamiStats, unknown, string>(monthUrl, fetcher);
  const year = useSWR<UmamiStats, unknown, string>(yearUrl, fetcher);
  const daily = useSWR<UmamiPageviews, unknown, string[]>(dailyUrls, (urls) =>
    Promise.all(urls.map(fetcher)).then(mergePageviews),
  );

  const dailyVisitors = useMemo(
    () => toDailySeries(daily.data?.sessions ?? [], lastNDays),
    [daily.data, lastNDays],
  );

  return (
    <div className="grid w-full grid-cols-12 gap-4">
      <div className="col-span-12 h-48 md:col-span-6 lg:col-span-3">
        <Kpi
          title="Views Today"
          scope={fixedScope("Today")}
          value={today.data?.pageviews ?? 0}
          loading={today.isLoading}
          errored={!!today.error}
        />
      </div>
      <div className="col-span-12 h-48 md:col-span-6 lg:col-span-3">
        <Kpi
          title="Views this Month"
          scope={fixedScope("This month")}
          value={month.data?.pageviews ?? 0}
          loading={month.isLoading}
          errored={!!month.error}
        />
      </div>
      <div className="col-span-12 h-48 md:col-span-6 lg:col-span-3">
        <Kpi
          title="Views this Year"
          scope={fixedScope("This year")}
          value={year.data?.pageviews ?? 0}
          loading={year.isLoading}
          errored={!!year.error}
        />
      </div>
      <div className="col-span-12 h-96 w-full">
        <LineChart
          title="Unique Visitors"
          scope={filteredScope(lastNDays)}
          traces={[
            {
              x: dailyVisitors.map((d) => d.date),
              y: dailyVisitors.map((d) => d.count),
              lineColor: "#65a30d",
              name: "Unique Visitors",
            },
          ]}
          yAxis={{
            rangemode: "tozero",
          }}
          loading={daily.isLoading}
          errored={!!daily.error}
        />
      </div>
      <div className="col-span-6 h-96 w-full">
        <UsageLocationDensityMap nDaysAgo={lastNDays} />
      </div>
    </div>
  );
}
