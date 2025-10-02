export interface ApiError {
  code: string;
  timestamp: string;
  message: string;
  path: string;
  details?: Record<string, unknown>[];
}
