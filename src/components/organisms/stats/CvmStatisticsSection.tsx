"use client";

import { useCallback, useMemo, useState } from "react";
import useSWR from "swr";
import useApi from "@/hooks/useApi";
import { Kpi } from "@/components/molecules/visualizations/Kpi";
import { LineChart } from "@/components/molecules/visualizations/LineChart";
import { DensityMap } from "@/components/molecules/visualizations/DensityMap";
import { AggregatedCvmStats, CvmDensityStatsPoint } from "@/lib/types/stats";
import { filteredScope, fixedScope } from "@/lib/stats-scope";

interface CvmRegistrationDensityMapProps {
  nDaysAgo?: number;
}

function CvmRegistrationDensityMap({
  nDaysAgo = 7,
}: CvmRegistrationDensityMapProps) {
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
    const now = new Date();
    const startDate = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() - nDaysAgo + 1,
      ),
    );

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
      `createdAt>=${startDate.toISOString()} and imported==false`,
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
      scope={filteredScope(nDaysAgo)}
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

export interface CvmStatisticsSectionProps {
  lastNDays?: number;
}

export function CvmStatisticsSection({ lastNDays }: CvmStatisticsSectionProps) {
  const api = useApi();

  const cvmStatsUrl = useMemo(() => {
    const searchParams = new URLSearchParams();

    if (lastNDays) {
      searchParams.set("lastNDays", String(lastNDays));
    }

    return `/kmc/stats/cvms?${searchParams.toString()}`;
  }, [lastNDays]);

  const {
    data: cvmStatsData,
    isLoading: isCvmStatsLoading,
    error: cvmStatsError,
  } = useSWR<AggregatedCvmStats, unknown, string | null>(cvmStatsUrl, (url) =>
    api.get(url).then((res) => res.data),
  );

  const filtered = filteredScope(lastNDays ?? 7);
  const allTime = fixedScope("All time");

  return (
    <div className="grid w-full grid-cols-12 gap-4">
      <div className="col-span-12 h-48 w-full md:col-span-6 lg:col-span-3">
        <Kpi
          title="Total CVMs"
          scope={allTime}
          value={cvmStatsData?.total || 0}
          loading={isCvmStatsLoading}
          errored={!!cvmStatsError}
        />
      </div>
      <div className="col-span-12 h-48 w-full md:col-span-6 lg:col-span-3">
        <Kpi
          title="CVM Registrations"
          scope={filtered}
          value={cvmStatsData?.registrations.totalLastNDays || 0}
          loading={isCvmStatsLoading}
          errored={!!cvmStatsError}
        />
      </div>
      <div className="col-span-12 h-48 w-full md:col-span-6 lg:col-span-3">
        <Kpi
          title="CVM Imports"
          scope={filtered}
          value={cvmStatsData?.imports.totalLastNDays || 0}
          loading={isCvmStatsLoading}
          errored={!!cvmStatsError}
        />
      </div>
      <div className="col-span-12 h-48 w-full md:col-span-6 lg:col-span-3">
        <Kpi
          title="Average CVM Score"
          scope={allTime}
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
          scope={filtered}
          traces={[
            {
              x: cvmStatsData?.registrations.history.map((r) => r.date) || [],
              y: cvmStatsData?.registrations.history.map((r) => r.count) || [],
              lineColor: "#65a30d",
              name: "Registrations",
            },
            {
              x: cvmStatsData?.imports.history.map((r) => r.date) || [],
              y: cvmStatsData?.imports.history.map((r) => r.count) || [],
              lineColor: "#f59e0b",
              name: "Imports",
            },
          ]}
          loading={isCvmStatsLoading}
          errored={!!cvmStatsError}
        />
      </div>
      <div className="col-span-6 h-96 w-full">
        <CvmRegistrationDensityMap nDaysAgo={lastNDays} />
      </div>
    </div>
  );
}
