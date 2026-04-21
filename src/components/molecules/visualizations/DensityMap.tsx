"use client";

import { useRef, useEffect, useCallback, useMemo, useState } from "react";
import type { Data, Layout, Config } from "plotly.js";
import { useAppSelector } from "@/store";

export interface DensityMapProps {
  title: string;
  data: Data[];
  layout?: Partial<Layout>;
  config?: Partial<Config>;
  errored: boolean;
  className?: string;
  onViewportChange?: ({
    bottomLeft,
    topRight,
    zoom,
  }: {
    bottomLeft: { latitude: number; longitude: number };
    topRight: { latitude: number; longitude: number };
    zoom: number;
  }) => void;
  maxZoom?: number;
  minZoom?: number;
}

export function DensityMap({
  title,
  data,
  layout,
  config,
  errored,
  className,
  onViewportChange,
  maxZoom = 18,
  minZoom = 1,
}: DensityMapProps) {
  const darkMode = useAppSelector((state) => state.theme.darkMode);

  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const plotlyRef = useRef<typeof import("plotly.js/lib/core") | null>(null);

  const minZoomRef = useRef(minZoom);
  const maxZoomRef = useRef(maxZoom);
  const onViewportChangeRef = useRef(onViewportChange);

  useEffect(() => {
    onViewportChangeRef.current = onViewportChange;
  }, [onViewportChange]);

  useEffect(() => {
    minZoomRef.current = minZoom;
  }, [minZoom]);

  useEffect(() => {
    maxZoomRef.current = maxZoom;
  }, [maxZoom]);

  const tickColor = useMemo(
    () => (darkMode ? "#f1f5f9" : "#0f172a"),
    [darkMode],
  );

  const defaultLayout: Partial<Layout> = useMemo(
    () => ({
      map: {
        style: "/tiles/default.json",
        center: { lat: 51.1657, lon: 10.4515 },
        zoom: 4,
      },
      autosize: true,
      margin: { t: 0, b: 0, l: 0, r: 0 },
      paper_bgcolor: "transparent",
      font: { color: darkMode ? "#f1f5f9" : "#0f172a" },
    }),
    [darkMode],
  );

  const mergedLayout = useMemo(
    () => ({ ...defaultLayout, ...layout }),
    [layout, defaultLayout],
  );
  const mergedConfig: Partial<Config> = useMemo(
    () => ({ responsive: true, ...config }),
    [config],
  );

  const mergedData = useMemo(
    () =>
      data.map((trace) => ({
        ...trace,
        colorbar: {
          ...("colorbar" in trace ? trace.colorbar : {}),
          tickfont: { color: tickColor },
          title: {
            ...("colorbar" in trace ? trace.colorbar?.title : {}),
            font: { color: tickColor },
          },
        },
      })),
    [data, tickColor],
  );

  // Mount plotly plot on initial render
  useEffect(() => {
    if (errored) {
      return;
    }

    (async () => {
      const { default: Plotly } = await import("@/lib/visualization");

      if (!containerRef.current) {
        return;
      }

      plotlyRef.current = Plotly;

      const element = await Plotly.newPlot(
        containerRef.current,
        mergedData,
        mergedLayout,
        mergedConfig,
      );

      setMounted(true);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      element.on("plotly_relayout", (eventData: any) => {
        const coords = eventData["map._derived"]?.coordinates as
          | [number, number][]
          | undefined;
        const zoom = eventData["map.zoom"] as number | undefined;

        if (zoom !== undefined) {
          const clamped = Math.min(
            Math.max(zoom, minZoomRef.current),
            maxZoomRef.current,
          );

          if (clamped !== zoom && containerRef.current && plotlyRef.current) {
            plotlyRef.current.relayout(containerRef.current, {
              "map.zoom": clamped,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any);

            return;
          }
        }

        if (coords && zoom) {
          const lons = coords.map((c) => c[0]);
          const lats = coords.map((c) => c[1]);
          const bottomLeft = {
            latitude: Math.min(...lats),
            longitude: Math.min(...lons),
          };
          const topRight = {
            latitude: Math.max(...lats),
            longitude: Math.max(...lons),
          };

          if (onViewportChangeRef.current) {
            onViewportChangeRef.current({ bottomLeft, topRight, zoom });
          }
        }
      });
    })();

    return () => {
      if (containerRef.current && plotlyRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        plotlyRef.current.purge(containerRef.current);
        setMounted(false);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errored]);

  // Update plotly plot when data or layout changes
  useEffect(() => {
    if (!mounted || !containerRef.current || !plotlyRef.current) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentLayout = (containerRef.current as any).layout;

    plotlyRef.current.react(
      containerRef.current,
      mergedData,
      currentLayout ?? mergedLayout,
      mergedConfig,
    );
  }, [mergedData, mergedLayout, mergedConfig, mounted]);

  const handleResize = useCallback(() => {
    if (!containerRef.current || !plotlyRef.current || !mounted) {
      return;
    }

    plotlyRef.current.Plots.resize(containerRef.current);
  }, [mounted]);

  useEffect(() => {
    const observer = new ResizeObserver(handleResize);

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [handleResize]);

  return (
    <div
      className={`flex h-full w-full flex-col gap-2 overflow-hidden rounded-md border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-900 ${className ?? ""}`}
    >
      <h5 className="truncate font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </h5>
      {errored ? (
        <div className="w-full grow rounded-md bg-red-300 dark:bg-red-800" />
      ) : !data || data.length === 0 ? (
        <div className="w-full grow animate-pulse rounded-md bg-slate-300 dark:bg-slate-700" />
      ) : (
        <div className="w-full grow overflow-hidden rounded-md">
          <div ref={containerRef} className="h-full w-full" />
        </div>
      )}
    </div>
  );
}
