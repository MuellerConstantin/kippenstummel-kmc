"use client";

import {
  useEffect,
  useState,
  useCallback,
  cloneElement,
  ReactElement,
} from "react";
import { useEnv } from "@/contexts/RuntimeConfigProvider";
import useAckeeClient from "@/hooks/useAckeeClient";
import { gql } from "urql";
import CalendarHeatmap, {
  ReactCalendarHeatmapValue,
} from "react-calendar-heatmap";

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
      values={dailyViews}
      classForValue={getHistoryColor}
      transformDayElement={renderDayElement as never}
    />
  );
}
