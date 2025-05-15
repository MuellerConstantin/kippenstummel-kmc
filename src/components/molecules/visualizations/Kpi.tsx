"use client";

import createPlotlyComponent from "react-plotly.js/factory";
import Plotly from "plotly.js/lib/core";
import Indicator from "plotly.js/lib/indicator";

Plotly.register([Indicator]);

const Plot = createPlotlyComponent(Plotly);

export interface KpiProps {
  title: string;
  value: number;
  loading: boolean;
  errored: boolean;
}

export function Kpi(props: KpiProps) {
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
                type: "indicator",
                mode: "number",
                value: props.value,
              },
            ]}
            layout={{
              autosize: true,
              margin: { t: 0, b: 0, l: 0, r: 0 },
            }}
            config={{ responsive: true }}
          />
        </div>
      )}
    </div>
  );
}
