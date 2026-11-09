"use client";

import { useCallback, useMemo, cloneElement, ReactElement } from "react";
import useSWR from "swr";
import useApi from "@/hooks/useApi";
import CalendarHeatmap, {
  ReactCalendarHeatmapValue,
} from "react-calendar-heatmap";
import { getHeatmapColorClass } from "@/lib/heatmap";
import type { UmamiPageviews } from "@/lib/types/analytics";
import {
  dailySeriesParams,
  mergePageviews,
  toDailySeries,
} from "@/lib/analytics";

import "react-calendar-heatmap/dist/styles.css";

const DAYS = 365;

export function VisitCalendarHeatmap() {
  const api = useApi();

  // Fixed on mount, otherwise every render would yield a new key.
  const urls = useMemo(
    () => dailySeriesParams(DAYS).map((params) => `/umami/pageviews?${params}`),
    [],
  );

  const { data } = useSWR<UmamiPageviews, unknown, string[]>(urls, (urls) =>
    Promise.all(
      urls.map((url) => api.get<UmamiPageviews>(url).then((res) => res.data)),
    ).then(mergePageviews),
  );

  const dailyViews = useMemo(
    () => toDailySeries(data?.sessions ?? [], DAYS),
    [data],
  );

  const maxCount = useMemo(
    () => dailyViews.reduce((m, h) => Math.max(m, h.count), 0),
    [dailyViews],
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
      values={dailyViews}
      classForValue={getHistoryColor}
      transformDayElement={renderDayElement as never}
    />
  );
}
