export function getHeatmapColorClass(count: number, max: number): string {
  if (!count || count <= 0 || max <= 0) {
    return "fill-slate-100 dark:fill-slate-900";
  }

  const intensity = Math.log1p(count) / Math.log1p(max);

  if (intensity > 5 / 6) return "fill-[#1e6823]";
  if (intensity > 4 / 6) return "fill-[#438136]";
  if (intensity > 3 / 6) return "fill-[#689a4a]";
  if (intensity > 2 / 6) return "fill-[#8cb45e]";
  if (intensity > 1 / 6) return "fill-[#b1cd71]";

  return "fill-[#d6e685]";
}
