"use client";

import { cloneElement, ReactElement, useCallback, useMemo } from "react";
import useSWR from "swr";
import CalendarHeatmap, {
  ReactCalendarHeatmapValue,
} from "react-calendar-heatmap";
import useApi from "@/hooks/useApi";
import { AggregatedVoteStats } from "@/lib/types/stats";
import { getHeatmapColorClass } from "@/lib/heatmap";

import "react-calendar-heatmap/dist/styles.css";

export function VotingCalendarHeatmap() {
  const api = useApi();

  const { data: voteStatsData } = useSWR<
    AggregatedVoteStats,
    unknown,
    string | null
  >("/kmc/stats/votes?lastNDays=365", (url) =>
    api.get(url).then((res) => res.data),
  );

  const votingHistory = useMemo(() => {
    if (voteStatsData) {
      return voteStatsData.upvotes.history
        .map((h) => {
          return {
            date: h.date,
            count: h.count,
          };
        })
        .filter((h) => h.count > 0);
    }

    return [];
  }, [voteStatsData]);

  const maxCount = useMemo(
    () => votingHistory.reduce((m, h) => Math.max(m, h.count), 0),
    [votingHistory],
  );

  const getHistoryColor = useCallback(
    (value?: ReactCalendarHeatmapValue<string>) =>
      getHeatmapColorClass(value?.count ?? 0, maxCount),
    [maxCount],
  );

  const renderDayElement = useCallback(
    (
      element: ReactElement,
      value: ReactCalendarHeatmapValue<string> | undefined,
    ) => {
      if (!value?.date) return element;
      return cloneElement(
        element,
        undefined,
        <title>{`${value.date}: ${value.count}`}</title>,
      );
    },
    [],
  );

  return (
    <CalendarHeatmap
      startDate={new Date(new Date().setFullYear(new Date().getFullYear() - 1))}
      endDate={new Date()}
      values={votingHistory}
      classForValue={getHistoryColor}
      transformDayElement={renderDayElement as never}
    />
  );
}
