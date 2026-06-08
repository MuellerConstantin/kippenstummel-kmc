"use client";

import { cloneElement, ReactElement, useCallback, useMemo } from "react";
import useSWR from "swr";
import CalendarHeatmap, {
  ReactCalendarHeatmapValue,
} from "react-calendar-heatmap";
import useApi from "@/hooks/useApi";
import { AggregatedVoteStats } from "@/lib/types/stats";

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

  const getHistoryColor = useCallback(
    (value?: ReactCalendarHeatmapValue<string>) => {
      if (!value) {
        return "fill-slate-100 dark:fill-slate-900";
      }

      if (!value.count) {
        return "fill-slate-100 dark:fill-slate-900";
      } else if (value.count > 10) {
        return "fill-[#8cc665]";
      } else if (value.count > 100) {
        return "fill-[#44a340]";
      } else if (value.count > 1000) {
        return "fill-[#1e6823]";
      } else {
        return "fill-[#d6e685]";
      }
    },
    [],
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
