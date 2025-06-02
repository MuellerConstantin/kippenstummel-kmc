"use client";

import createPlotlyComponent from "react-plotly.js/factory";
import Plotly from "plotly.js/lib/core";
import Pie from "plotly.js/lib/pie";
import { useAppSelector } from "@/store";

Plotly.register([Pie]);

const Plot = createPlotlyComponent(Plotly);

export interface PieChartProps {
  title: string;
  data: { labels: string[]; values: number[]; colors: string[] }[];
  loading: boolean;
  errored: boolean;
}

export function PieChart(props: PieChartProps) {
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
            data={props.data.map((d) => ({
              type: "pie",
              labels: d.labels,
              values: d.values,
              marker: { colors: d.colors },
              textinfo: "label+percent",
              hoverinfo: "label+value+percent",
            }))}
            layout={{
              autosize: true,
              margin: { t: 0, b: 0, l: 0, r: 0 },
              paper_bgcolor: darkMode ? "#0f172a" : "#f1f5f9",
              font: {
                color: darkMode ? "#f1f5f9" : "#0f172a",
              },
              showlegend: true,
            }}
            config={{ responsive: true }}
          />
        </div>
      )}
    </div>
  );
}
