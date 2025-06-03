"use client";

import { useCallback, useMemo } from "react";
import useSWR from "swr";
import { Cigarette, Fingerprint, ListTodo, ChartArea } from "lucide-react";
import CalendarHeatmap, {
  ReactCalendarHeatmapValue,
} from "react-calendar-heatmap";
import useApi from "@/hooks/useApi";
import { ListBox, ListBoxItem } from "@/components/atoms/ListBox";

import "react-calendar-heatmap/dist/styles.css";

function Sidebar() {
  const navigation = useMemo(() => {
    return {
      scopes: [
        {
          name: "CVMs",
          icon: Cigarette,
          path: `/cvms`,
        },
        {
          name: "Ident",
          icon: Fingerprint,
          path: `/ident`,
        },
        {
          name: "Jobs",
          icon: ListTodo,
          path: `/jobs`,
        },
        {
          name: "Stats",
          icon: ChartArea,
          path: `/stats`,
        },
      ],
    };
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <h5 className="text-sm font-semibold text-gray-500 uppercase dark:text-gray-400">
        Management Console
      </h5>
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="text-sm font-semibold text-gray-900 dark:text-white">
            Scopes
          </div>
          <ListBox className="space-y-1">
            {navigation["scopes"].map((item) => (
              <ListBoxItem
                id={`stats-sidebar-${item.name}`}
                key={item.name}
                href={item.path}
              >
                <div className="inline-flex items-center space-x-2">
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </div>
              </ListBoxItem>
            ))}
          </ListBox>
        </div>
      </div>
    </div>
  );
}

function ScopeCard(props: {
  title: string;
  href: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <a href={props.href}>
      <div className="flex h-32 flex-col rounded-md border border-slate-200 bg-slate-50 p-4 text-slate-800 hover:cursor-pointer hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-slate-200 p-2 text-2xl dark:bg-slate-700">
            {props.icon}
          </div>
          <div>
            <div className="text-lg font-semibold">{props.title}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {props.description}
            </div>
          </div>
        </div>
      </div>
    </a>
  );
}

export default function Home() {
  const api = useApi();

  const { data } = useSWR<
    {
      cvms: {
        total: number;
        averageScore: number;
        imports: {
          total: number;
          totalLast7Days: number;
          history: {
            date: string;
            count: number;
          }[];
        };
        registrations: {
          total: number;
          totalLast7Days: number;
          history: {
            date: string;
            count: number;
          }[];
        };
      };
      votes: {
        total: number;
        upvotes: {
          total: number;
          totalLast7Days: number;
          history: {
            date: string;
            count: number;
          }[];
        };
        downvotes: {
          total: number;
          totalLast7Days: number;
          history: {
            date: string;
            count: number;
          }[];
        };
      };
      idents: {
        total: number;
        averageCredibility: number;
        totalNewLast7Days: number;
        newHistory: {
          date: string;
          count: number;
        }[];
      };
      jobs: {
        total: number;
        differentTypes: number;
        statusCounts: {
          running: number;
          completed: number;
          failed: number;
        };
        totalRunLast7Days: number;
        runHistory: {
          date: string;
          count: number;
        }[];
      };
    },
    unknown,
    string | null
  >("/kmc/stats?lastNDays=365", (url) => api.get(url).then((res) => res.data));

  const registrationHistory = useMemo(() => {
    if (data) {
      return data?.cvms.registrations.history
        .map((h) => {
          return {
            date: h.date,
            count: h.count,
          };
        })
        .filter((h) => h.count > 0);
    }

    return [];
  }, [data]);

  const votingHistory = useMemo(() => {
    if (data) {
      return data?.votes.upvotes.history
        .map((h) => {
          return {
            date: h.date,
            count: h.count,
          };
        })
        .filter((h) => h.count > 0);
    }

    return [];
  }, [data]);

  const getHistoryColor = useCallback(
    (value?: ReactCalendarHeatmapValue<string>) => {
      if (!value) {
        return "fill-slate-100 dark:fill-slate-900";
      }

      if (value.count > 10) {
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

  return (
    <div className="flex grow flex-col">
      <div className="mx-auto flex w-full max-w-screen-2xl grow flex-col gap-4 p-4">
        <div className="flex w-full grow flex-col gap-4 lg:flex-row lg:gap-8">
          <div className="w-full min-w-[15rem] shrink-0 space-y-4 md:w-fit">
            <Sidebar />
          </div>
          <div className="flex w-full flex-col space-y-4">
            <h1 className="text-md font-bold text-slate-600 md:text-3xl dark:text-slate-400">
              Kippenstummel Management Console (KMC)
            </h1>
            <section className="w-full space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Activity
                </h2>
                <hr className="my-2 border-slate-200 dark:border-slate-700" />
              </div>
              <div className="flex w-full max-w-screen-md flex-col gap-1 overflow-hidden">
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Registration Activity
                </div>
                <CalendarHeatmap
                  startDate={
                    new Date(
                      new Date().setFullYear(new Date().getFullYear() - 1),
                    )
                  }
                  endDate={new Date()}
                  values={registrationHistory}
                  classForValue={getHistoryColor}
                />
              </div>
              <div className="flex w-full max-w-screen-md flex-col gap-1 overflow-hidden">
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Voting Activity
                </div>
                <CalendarHeatmap
                  startDate={
                    new Date(
                      new Date().setFullYear(new Date().getFullYear() - 1),
                    )
                  }
                  endDate={new Date()}
                  values={votingHistory}
                  classForValue={getHistoryColor}
                />
              </div>
            </section>
            <section className="w-full space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Scopes
                </h2>
                <hr className="my-2 border-slate-200 dark:border-slate-700" />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <ScopeCard
                  title="CVMs"
                  href="/cvms"
                  description="Manage, track, and monitor Cigarette Vending Machines (CVMs)."
                  icon={<Cigarette />}
                />
                <ScopeCard
                  title="Ident"
                  href="/ident"
                  description="See all issued Identifications and track their usage and credibility."
                  icon={<Fingerprint />}
                />
                <ScopeCard
                  title="Jobs"
                  href="/jobs"
                  description="See all submitted Jobs and track their progress and status."
                  icon={<ListTodo />}
                />
                <ScopeCard
                  title="Stats"
                  href="/stats"
                  description="Overview of all important platform and content statistics."
                  icon={<ChartArea />}
                />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
