import type { UmamiPageviews, UmamiSeriesPoint } from "@/lib/types/analytics";

/** Formats a date as `YYYY-MM-DD` in local time. */
export function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function getTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/** Search params selecting the range from `start` until now. */
export function rangeParams(start: Date, extra: Record<string, string> = {}) {
  return new URLSearchParams({
    startAt: String(start.getTime()),
    endAt: String(Date.now()),
    ...extra,
  }).toString();
}

/**
 * Umami silently switches from daily to monthly buckets once a range spans
 * more than roughly six months, regardless of the requested unit. Longer
 * daily series are therefore split into several requests.
 */
const MAX_DAYS_PER_REQUEST = 180;

/**
 * Search params of a daily series covering today and the `nDays - 1` days
 * before it, split into non-overlapping chunks Umami answers on a daily basis.
 */
export function dailySeriesParams(nDays: number): string[] {
  const today = startOfDay(new Date());
  const timezone = getTimezone();
  const chunks: string[] = [];

  for (let offset = nDays - 1; offset >= 0; offset -= MAX_DAYS_PER_REQUEST) {
    const start = new Date(today);
    start.setDate(today.getDate() - offset);

    const nextOffset = offset - MAX_DAYS_PER_REQUEST;
    const end = new Date(today);
    end.setDate(today.getDate() - nextOffset);

    chunks.push(
      new URLSearchParams({
        startAt: String(start.getTime()),
        endAt: String(nextOffset < 0 ? Date.now() : end.getTime() - 1),
        unit: "day",
        timezone,
      }).toString(),
    );
  }

  return chunks;
}

/** Concatenates the series of several chunked responses. */
export function mergePageviews(responses: UmamiPageviews[]): UmamiPageviews {
  return {
    pageviews: responses.flatMap((r) => r.pageviews),
    sessions: responses.flatMap((r) => r.sessions),
  };
}

/**
 * Umami only returns buckets containing data. This fills the gaps, so that
 * the series contains one entry per day, oldest first.
 */
export function toDailySeries(
  points: UmamiSeriesPoint[],
  nDays: number,
): { date: string; count: number }[] {
  const counts = new Map(points.map((p) => [p.x.slice(0, 10), p.y]));
  const today = startOfDay(new Date());

  return Array.from({ length: nDays }, (_, index) => {
    const day = new Date(today);
    day.setDate(today.getDate() - (nDays - 1 - index));
    const date = toLocalDateString(day);
    return { date, count: counts.get(date) ?? 0 };
  });
}
