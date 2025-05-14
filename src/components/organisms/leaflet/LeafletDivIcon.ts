import Leaflet, { PointExpression } from "leaflet";
import { ReactNode } from "react";
import { renderToString } from "react-dom/server";

interface divIconValues {
  source: ReactNode;
  anchor: PointExpression;
  className?: string;
}

const LeafletDivIcon = ({ source, anchor, className }: divIconValues) =>
  Leaflet?.divIcon({
    html: renderToString(source),
    iconAnchor: anchor,
    className: `hidden ${className}`,
  });

export default LeafletDivIcon;
