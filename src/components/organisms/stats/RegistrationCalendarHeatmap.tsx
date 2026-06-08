"use client";

import { cloneElement, ReactElement, useCallback, useMemo } from "react";
import useSWR from "swr";
import CalendarHeatmap, {
  ReactCalendarHeatmapValue,
} from "react-calendar-heatmap";
import useApi from "@/hooks/useApi";
import { AggregatedCvmStats } from "@/lib/types/stats";
import { getHeatmapColorClass } from "@/lib/heatmap";

import "react-calendar-heatmap/dist/styles.css";

export function RegistrationCalendarHeatmap() {
  const api = useApi();

  const { data: cvmStatsData } = useSWR<
    AggregatedCvmStats,
    unknown,
    string | null
  >("/kmc/stats/cvms?lastNDays=365", (url) =>
    api.get(url).then((res) => res.data),
  );

  const registrationHistory = useMemo(() => {
    if (cvmStatsData) {
      return cvmStatsData.registrations.history
        .map((h) => {
          return {
            date: h.date,
            count: h.count,
          };
        })
        .filter((h) => h.count > 0);
    }

    return [];
  }, [cvmStatsData]);

  const maxCount = useMemo(
    () => registrationHistory.reduce((m, h) => Math.max(m, h.count), 0),
    [registrationHistory],
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
      values={registrationHistory}
      classForValue={getHistoryColor}
      transformDayElement={renderDayElement as never}
    />
  );
}
