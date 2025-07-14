import {
  type LayerProps,
  createElementObject,
  createTileLayerComponent,
  withPane,
} from "@react-leaflet/core";
import Leaflet from "leaflet";
import "@maplibre/maplibre-gl-leaflet";

export interface MapLibreTileLayerProps
  extends Leaflet.LeafletMaplibreGLOptions,
    LayerProps {
  url: string;
  minZoom?: number;
  maxZoom?: number;
}

export const MapLibreTileLayer = createTileLayerComponent<
  Leaflet.MaplibreGL,
  MapLibreTileLayerProps
>(
  function createTileLayer({ url, ...options }, context) {
    const layer = Leaflet.maplibreGL({
      style: url,
      ...withPane(options, context),
    });
    return createElementObject(layer, context);
  },
  function updateTileLayer(layer, props, prevProps) {
    const { url, attribution } = props;
    if (url != null && url !== prevProps.url) {
      layer.getMaplibreMap().setStyle(url);
    }

    if (attribution != null && attribution !== prevProps.attribution) {
      layer.options.attribution = attribution;
    }
  },
);
