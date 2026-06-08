"use client";

import {
  useEffect,
  useState,
  useCallback,
  useMemo,
  cloneElement,
  ReactElement,
} from "react";
import { useEnv } from "@/contexts/RuntimeConfigProvider";
import useAckeeClient from "@/hooks/useAckeeClient";
import { gql } from "urql";
import CalendarHeatmap, {
  ReactCalendarHeatmapValue,
} from "react-calendar-heatmap";
import { getHeatmapColorClass } from "@/lib/heatmap";

import "react-calendar-heatmap/dist/styles.css";

export function VisitCalendarHeatmap() {
  const client = useAckeeClient();

  const ACKEE_DOMAIN_ID = useEnv("NEXT_PUBLIC_ACKEE_DOMAIN_ID");

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
                views(interval: DAILY, type: UNIQUE, limit: 365) {
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
        const views = domain?.statistics?.views ?? [];

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
  }, [client, ACKEE_DOMAIN_ID]);

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
