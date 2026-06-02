"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useEnv } from "@/contexts/RuntimeConfigProvider";
import { Kpi } from "@/components/molecules/visualizations/Kpi";
import { LineChart } from "@/components/molecules/visualizations/LineChart";
import useAckeeClient from "@/hooks/useAckeeClient";
import { gql } from "urql";
import { filteredScope, fixedScope } from "@/lib/stats-scope";
import useSWR from "swr";
import useApi from "@/hooks/useApi";
import { DensityMap } from "@/components/molecules/visualizations/DensityMap";
import { UsageLOcationDensityStatsPoint } from "@/lib/types/stats";
import { buildDensityTrace } from "@/lib/visualization";

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
      setViewport(data);
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
                views(interval: DAILY, type: UNIQUE, limit: ${String(lastNDays)}) {
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
  }, [client, ACKEE_DOMAIN_ID, lastNDays]);

  return (
    <div className="grid w-full grid-cols-12 gap-4">
      <div className="col-span-12 h-48 md:col-span-6 lg:col-span-3">
        <Kpi
          title="Views Today"
          scope={fixedScope("Today")}
          value={viewsToday}
          loading={isLoading}
          errored={!!error}
        />
      </div>
      <div className="col-span-12 h-48 md:col-span-6 lg:col-span-3">
        <Kpi
          title="Views this Month"
          scope={fixedScope("This month")}
          value={viewsMonth}
          loading={isLoading}
          errored={!!error}
        />
      </div>
      <div className="col-span-12 h-48 md:col-span-6 lg:col-span-3">
        <Kpi
          title="Views this Year"
          scope={fixedScope("This year")}
          value={viewsYear}
          loading={isLoading}
          errored={!!error}
        />
      </div>
      <div className="col-span-12 h-96 w-full">
        <LineChart
          title="Unique Views"
          scope={filteredScope(lastNDays)}
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
      <div className="col-span-6 h-96 w-full">
        <UsageLocationDensityMap nDaysAgo={lastNDays} />
      </div>
    </div>
  );
}
