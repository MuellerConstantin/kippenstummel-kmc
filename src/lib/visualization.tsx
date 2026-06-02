import Plotly from "plotly.js/lib/core";
import Indicator from "plotly.js/lib/indicator";
import Pie from "plotly.js/lib/pie";
import Scatter from "plotly.js/lib/scatter";
import Densitymap from "plotly.js/lib/densitymap";
import createPlotlyComponent from "react-plotly.js/factory";
import type { Data } from "plotly.js";

Plotly.register([Indicator, Pie, Scatter, Densitymap]);

export const Plot = createPlotlyComponent(Plotly);

export default Plotly;

export interface DensityPoint {
  latitude: number;
  longitude: number;
  count: number;
}

// Low-end stops are pushed close to 0 with a smooth alpha ramp so isolated
// points stay visible even when a dense cluster in the same viewport
// amplifies the kernel-density peak by an order of magnitude or more.
const DENSITY_COLORSCALE: Array<[number, string]> = [
  [0, "rgba(187,247,208,0)"],
  [0.003, "rgba(187,247,208,0.4)"],
  [0.04, "rgba(134,239,172,0.75)"],
  [0.15, "#4ade80"],
  [0.4, "#16a34a"],
  [1, "#14532d"],
];

function buildDensityColorbarTicks(maxCount: number): {
  tickvals: number[];
  ticktext: string[];
} {
  if (maxCount <= 0) {
    return { tickvals: [], ticktext: [] };
  }

  const ticks: number[] = [];

  if (maxCount < 10) {
    const step = Math.max(1, Math.ceil(maxCount / 4));
    for (let v = step; v <= maxCount; v += step) {
      ticks.push(v);
    }
    if (ticks[ticks.length - 1] !== maxCount) {
      ticks.push(maxCount);
    }
  } else {
    for (let exp = 0; Math.pow(10, exp) <= maxCount; exp++) {
      ticks.push(Math.pow(10, exp));
    }
    if (ticks[ticks.length - 1] !== maxCount) {
      ticks.push(maxCount);
    }
  }

  return {
    tickvals: ticks.map((v) => Math.log1p(v)),
    ticktext: ticks.map(String),
  };
}

// Counts are log1p-compressed so points with low counts stay visible next to
// large clusters; the colorbar is relabeled back to the original counts so
// the legend stays intuitive.
export function buildDensityTrace(points: DensityPoint[]): Data {
  const counts = points.map((p) => p.count);
  const maxCount = counts.length > 0 ? Math.max(...counts) : 0;
  const { tickvals, ticktext } = buildDensityColorbarTicks(maxCount);

  return {
    type: "densitymap",
    lat: points.map((p) => p.latitude),
    lon: points.map((p) => p.longitude),
    z: counts.map((c) => Math.log1p(c)),
    customdata: counts,
    hovertemplate: "%{customdata}<br>(%{lat:.4f}°, %{lon:.4f}°)<extra></extra>",
    colorscale: DENSITY_COLORSCALE,
    showscale: true,
    colorbar: {
      tickmode: "array",
      tickvals,
      ticktext,
    },
  } as Data;
}
