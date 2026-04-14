import Plotly from "plotly.js/lib/core";
import Indicator from "plotly.js/lib/indicator";
import Pie from "plotly.js/lib/pie";
import Scatter from "plotly.js/lib/scatter";
import createPlotlyComponent from "react-plotly.js/factory";

Plotly.register([Indicator, Pie, Scatter]);

export const Plot = createPlotlyComponent(Plotly);
