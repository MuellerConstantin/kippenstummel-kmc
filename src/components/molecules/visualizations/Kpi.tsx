"use client";

import createPlotlyComponent from "react-plotly.js/factory";
import Plotly from "plotly.js/lib/core";
import Indicator from "plotly.js/lib/indicator";
import { useAppSelector } from "@/store";

Plotly.register([Indicator]);

const Plot = createPlotlyComponent(Plotly);

export interface KpiProps {
  title: string;
  value: number;
  loading: boolean;
  errored: boolean;
}

export function Kpi(props: KpiProps) {
  const darkMode = useAppSelector((state) => state.theme.darkMode);

  return (
    <div className="flex h-full w-full flex-col gap-2 overflow-hidden rounded-md border border-slate-200 bg-slate-100 p-2 shadow dark:border-slate-700 dark:bg-slate-900">
      <h5 className="truncate font-semibold text-slate-900 dark:text-slate-100">
        {props.title}
      </h5>
      {props.loading ? (
        <div className="w-full grow animate-pulse rounded-md bg-slate-300 dark:bg-slate-700" />
      ) : props.errored ? (
        <div className="w-full grow rounded-md bg-red-300 dark:bg-red-800" />
      ) : (
        <div className="w-full grow overflow-hidden rounded-md">
          <Plot
            useResizeHandler
            className="h-full w-full"
            data={[
              {
                type: "indicator",
                mode: "number",
                value: props.value,
                number: {
                  font: {
                    color: darkMode ? "#f1f5f9" : "#0f172a",
                  },
                },
              },
            ]}
            layout={{
              autosize: true,
              margin: { t: 0, b: 0, l: 0, r: 0 },
              paper_bgcolor: darkMode ? "#0f172a" : "#f1f5f9",
              font: {
                color: darkMode ? "#f1f5f9" : "#0f172a",
              },
            }}
            config={{ responsive: true }}
          />
        </div>
      )}
    </div>
  );
}
