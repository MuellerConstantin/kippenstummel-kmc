/**
 * Summary of a website for a date range as returned by Umami's (v3)
 * `/websites/:id/stats` endpoint.
 */
export interface UmamiStats {
  pageviews: number;
  visitors: number;
  visits: number;
  bounces: number;
  totaltime: number;
}

export interface UmamiSeriesPoint {
  /** Start of the bucket, in the requested timezone. */
  x: string;
  y: number;
}

/** Response of Umami's `/websites/:id/pageviews` endpoint. */
export interface UmamiPageviews {
  pageviews: UmamiSeriesPoint[];
  sessions: UmamiSeriesPoint[];
}
