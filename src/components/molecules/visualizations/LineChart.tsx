"use client";

import createPlotlyComponent from "react-plotly.js/factory";
import Plotly from "plotly.js/lib/core";
import Scatter from "plotly.js/lib/scatter";
import { useAppSelector } from "@/store";

Plotly.register([Scatter]);

const Plot = createPlotlyComponent(Plotly);

export interface LineChartProps {
  title: string;
  traces: { x: string[]; y: number[]; lineColor: string; name: string }[];
  loading: boolean;
  errored: boolean;
  yAxis?: Partial<Plotly.Layout["yaxis"]>;
  xAxis?: Partial<Plotly.Layout["xaxis"]>;
}

export function LineChart(props: LineChartProps) {
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
            data={props.traces.map((trace) => ({
              type: "scatter",
              mode: "lines+markers",
              x: trace.x,
              y: trace.y,
              line: { color: trace.lineColor, width: 2 },
              name: trace.name,
            }))}
            layout={{
              autosize: true,
              margin: { t: 0, b: 40, l: 40, r: 0 },
              paper_bgcolor: darkMode ? "#0f172a" : "#f1f5f9",
              plot_bgcolor: darkMode ? "#0f172a" : "#f1f5f9",
              font: {
                color: darkMode ? "#f1f5f9" : "#0f172a",
              },
              xaxis: {
                showgrid: false,
                type: "date",
                tickformat: "%Y-%m-%d",
                color: darkMode ? "#f1f5f9" : "#0f172a",
                ...props.xAxis,
              },
              yaxis: {
                showgrid: true,
                gridcolor: darkMode ? "#334155" : "#cbd5e1",
                color: darkMode ? "#f1f5f9" : "#0f172a",
                ...props.yAxis,
              },
            }}
            config={{ responsive: true }}
          />
        </div>
      )}
    </div>
  );
}
