"use client";

import createPlotlyComponent from "react-plotly.js/factory";
import Plotly from "plotly.js/lib/core";
import Scatter from "plotly.js/lib/scatter";

Plotly.register([Scatter]);

const Plot = createPlotlyComponent(Plotly);

export interface LineChartProps {
  title: string;
  values: { x: string[]; y: number[] };
  loading: boolean;
  errored: boolean;
}

export function LineChart(props: LineChartProps) {
  return (
    <div className="flex h-full w-full flex-col gap-2 overflow-hidden rounded-md border border-slate-200 bg-slate-100 p-2 dark:border-slate-700 dark:bg-slate-900">
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
            style={{ width: "100%", height: "100%" }}
            data={[
              {
                type: "scatter",
                mode: "lines+markers",
                x: props.values.x,
                y: props.values.y,
                line: { color: "#16a34a", width: 2 },
              },
            ]}
            layout={{
              autosize: true,
              margin: { t: 0, b: 40, l: 40, r: 0 },
              xaxis: {
                showgrid: false,
                type: "date",
                tickformat: "%Y-%m-%d",
              },
              yaxis: { showgrid: true },
            }}
            config={{ responsive: true }}
          />
        </div>
      )}
    </div>
  );
}
