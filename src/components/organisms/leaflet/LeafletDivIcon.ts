import Leaflet, { PointExpression } from "leaflet";
import { ReactNode } from "react";
import { renderToString } from "react-dom/server";

interface divIconValues {
  source: ReactNode;
  anchor?: PointExpression;
  size?: PointExpression;
  className?: string;
}

const LeafletDivIcon = ({ source, anchor, size, className }: divIconValues) =>
  Leaflet?.divIcon({
    html: renderToString(source),
    iconAnchor: anchor,
    iconSize: size,
    className: `hidden ${className}`,
  });

export default LeafletDivIcon;
