"use client";

import { useCallback, useMemo, useState } from "react";
import useSWR from "swr";
import useApi from "@/hooks/useApi";
import { Kpi } from "@/components/molecules/visualizations/Kpi";
import { LineChart } from "@/components/molecules/visualizations/LineChart";
import { DensityMap } from "@/components/molecules/visualizations/DensityMap";
import { AggregatedVoteStats, CvmDensityStatsPoint } from "@/lib/types/stats";

interface CvmVotingDensityMapProps {
  nDaysAgo?: number;
}

function CvmVotingDensityMap({ nDaysAgo = 7 }: CvmVotingDensityMapProps) {
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
      `lastVotedAt>=${new Date(Date.now() - nDaysAgo * 24 * 60 * 60 * 1000).toISOString()}`,
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
      title="CVM Voting Density"
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

export interface VotingStatisticsSectionProps {
  lastNDays?: number;
}

export function VotingStatisticsSection({
  lastNDays,
}: VotingStatisticsSectionProps) {
  const api = useApi();

  const voteStatsUrl = useMemo(() => {
    const searchParams = new URLSearchParams();

    if (lastNDays) {
      searchParams.set("lastNDays", String(lastNDays));
    }

    return `/kmc/stats/votes?${searchParams.toString()}`;
  }, [lastNDays]);

  const {
    data: voteStatsData,
    isLoading: isVoteStatsLoading,
    error: voteStatsError,
  } = useSWR<AggregatedVoteStats, unknown, string | null>(voteStatsUrl, (url) =>
    api.get(url).then((res) => res.data),
  );

  return (
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
              x: voteStatsData?.upvotes.history.map((r) => r.date) || [],
              y: voteStatsData?.upvotes.history.map((r) => r.count) || [],
              lineColor: "#65a30d",
              name: "Upvotes",
            },
            {
              x: voteStatsData?.downvotes.history.map((r) => r.date) || [],
              y: voteStatsData?.downvotes.history.map((r) => r.count) || [],
              lineColor: "#dc2626",
              name: "Downvotes",
            },
          ]}
          loading={isVoteStatsLoading}
          errored={!!voteStatsError}
        />
      </div>
      <div className="col-span-6 h-96 w-full">
        <CvmVotingDensityMap nDaysAgo={lastNDays} />
      </div>
    </div>
  );
}
