"use client";

import { useMemo, useState } from "react";
import { ListBox, ListBoxItem } from "@/components/atoms/ListBox";
import {
  Cigarette,
  Vote,
  Fingerprint,
  ListTodo,
  ChartNoAxesCombined,
  Filter,
} from "lucide-react";
import { Select, SelectItem } from "@/components/atoms/Select";
import { CvmStatisticsSection } from "@/components/organisms/stats/CvmStatisticsSection";
import { VotingStatisticsSection } from "@/components/organisms/stats/VotingStatisticsSection";
import { IdentStatisticsSection } from "@/components/organisms/stats/IdentStatisticsSection";
import { JobStatisticsSection } from "@/components/organisms/stats/JobStatisticsSection";
import { UsageStatisticsSection } from "@/components/organisms/stats/UsageStatisticsSection";

function Sidebar() {
  const navigation = useMemo(() => {
    return {
      content: [
        {
          name: "CVM Statistics",
          icon: Cigarette,
          path: `#section-cvm-stats`,
        },
        {
          name: "Voting Statistics",
          icon: Vote,
          path: `#section-voting-stats`,
        },
      ],
      platform: [
        {
          name: "Ident Statistics",
          icon: Fingerprint,
          path: `#section-ident-stats`,
        },
        {
          name: "Job Statistics",
          icon: ListTodo,
          path: `#section-job-stats`,
        },
        {
          name: "Usage Statistics",
          icon: ChartNoAxesCombined,
          path: `#section-usage-stats`,
        },
      ],
    };
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <h5 className="text-sm font-semibold text-gray-500 uppercase dark:text-gray-400">
        Statistics
      </h5>
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="text-sm font-semibold text-gray-900 dark:text-white">
            Content
          </div>
          <ListBox className="space-y-1">
            {navigation["content"].map((item) => (
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
        <div className="space-y-2">
          <div className="text-sm font-semibold text-gray-900 dark:text-white">
            Platform
          </div>
          <ListBox className="space-y-1">
            {navigation["platform"].map((item) => (
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

export default function Stats() {
  const timespanOptions = useMemo(
    () => [
      {
        label: "Last 24 hours",
        value: "last24Hours",
        filter: { lastNDays: 1 },
      },
      {
        label: "Last 7 Days",
        value: "last7Days",
        filter: { lastNDays: 7 },
      },
      {
        label: "Last 14 Days",
        value: "last14Days",
        filter: { lastNDays: 14 },
      },
      {
        label: "Last 30 Days",
        value: "last30Days",
        filter: { lastNDays: 30 },
      },
      {
        label: "Last 60 Days",
        value: "last60Days",
        filter: { lastNDays: 60 },
      },
      {
        label: "Last 90 Days",
        value: "last90Days",
        filter: { lastNDays: 90 },
      },
    ],
    [],
  );

  const [selectedTimespan, setSelectedTimespan] = useState<string>(
    `timespan-select-last7Days`,
  );

  const selectedTimespanFilter = useMemo(() => {
    const option = timespanOptions.find(
      (option) => `timespan-select-${option.value}` === selectedTimespan,
    );

    return option?.filter || null;
  }, [selectedTimespan, timespanOptions]);

  return (
    <div className="flex grow flex-col gap-4 bg-slate-50 dark:bg-slate-800">
      <div className="mx-auto flex w-full max-w-screen-2xl grow flex-col gap-4">
        <div className="flex w-full grow flex-col lg:flex-row lg:gap-8">
          <div className="w-full min-w-[15rem] shrink-0 space-y-4 overflow-hidden border-r border-slate-200 bg-white p-4 lg:w-[20rem] dark:border-slate-700 dark:bg-slate-800">
            <Sidebar />
          </div>
          <div className="flex w-full flex-col gap-4 p-4">
            <section className="flex flex-col gap-4">
              <Select
                label="Timespan"
                items={timespanOptions}
                selectedKey={selectedTimespan}
                onSelectionChange={(property) =>
                  setSelectedTimespan(property as string)
                }
                className="w-64 max-w-full"
              >
                {timespanOptions.map((option) => (
                  <SelectItem
                    id={`timespan-select-${option.value}`}
                    key={option.value}
                    textValue={option.value}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </Select>
              <p className="flex items-center gap-1.5 pb-2 text-xs text-slate-500 dark:text-slate-400">
                <Filter className="h-3 w-3" />
                The selected timespan only applies to KPIs marked with this
                icon.
              </p>
            </section>
            <section
              id="section-cvm-stats"
              className="flex w-full flex-col gap-4"
            >
              <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                CVM Statistics
              </h1>
              <CvmStatisticsSection
                lastNDays={selectedTimespanFilter?.lastNDays}
              />
            </section>
            <section
              id="section-voting-stats"
              className="flex w-full flex-col gap-4"
            >
              <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Voting Statistics
              </h1>
              <VotingStatisticsSection
                lastNDays={selectedTimespanFilter?.lastNDays}
              />
            </section>
            <section
              id="section-ident-stats"
              className="flex w-full flex-col gap-4"
            >
              <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Ident Statistics
              </h1>
              <IdentStatisticsSection
                lastNDays={selectedTimespanFilter?.lastNDays}
              />
            </section>
            <section
              id="section-job-stats"
              className="flex w-full flex-col gap-4"
            >
              <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Job Statistics
              </h1>
              <JobStatisticsSection
                lastNDays={selectedTimespanFilter?.lastNDays}
              />
            </section>
            <section
              id="section-usage-stats"
              className="flex w-full flex-col gap-4"
            >
              <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Usage Statistics
              </h1>
              <UsageStatisticsSection
                lastNDays={selectedTimespanFilter?.lastNDays}
              />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
