"use client";

import { useEffect, useState } from "react";
import { useEnv } from "@/contexts/RuntimeConfigProvider";
import { Kpi } from "@/components/molecules/visualizations/Kpi";
import { LineChart } from "@/components/molecules/visualizations/LineChart";
import useAckeeClient from "@/hooks/useAckeeClient";
import { gql } from "urql";
import { filteredScope, fixedScope } from "@/lib/stats-scope";

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
    </div>
  );
}
