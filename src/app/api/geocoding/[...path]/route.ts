import { type NextRequest } from "next/server";
import { LRUCache } from "lru-cache";

export const runtime = "nodejs";

const BASE_URL = "https://nominatim.openstreetmap.org";
const USER_AGENT =
  "Kippenstummel Management Console/1.0 (info@mueller-constantin.de)";

const geocodeCache = new LRUCache<
  string,
  {
    status: number;
    headers: [string, string][];
    body: ArrayBuffer;
  }
>({
  max: 1000,
  ttl: 1000 * 60 * 60 * 24 * 30, // 30 days
});

function cacheKey(req: NextRequest, targetUrl: URL) {
  return [
    req.method,
    targetUrl.toString(),
    req.headers.get("accept") ?? "",
  ].join("|");
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(req, params);
}

export async function HEAD(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(req, params);
}

async function proxyRequest(
  req: NextRequest,
  params: Promise<{ path: string[] }>,
) {
  const { path } = await params;

  const backendUrl = BASE_URL;
  const cleanPath = path?.join("/") || "";
  const targetUrl = new URL(`${backendUrl}/${cleanPath}`);

  req.nextUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.append(key, value);
  });

  targetUrl.searchParams.sort();

  const key = cacheKey(req, targetUrl);

  if (req.method === "GET") {
    const cached = geocodeCache.get(key);

    if (cached) {
      const headers = new Headers(cached.headers);
      headers.set("X-Cache", "HIT");

      return new Response(cached.body, {
        status: cached.status,
        headers,
      });
    }
  }

  const requestHeaders = new Headers(req.headers);

  requestHeaders.delete("accept-encoding");
  requestHeaders.set("accept-encoding", "identity");
  requestHeaders.set("user-agent", USER_AGENT);

  [
    "host",
    "connection",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailers",
    "transfer-encoding",
    "upgrade",
  ].forEach((header) => requestHeaders.delete(header));

  const couldHaveBody = req.method !== "GET" && req.method !== "HEAD";

  const fetchOptions: RequestInit = {
    method: req.method,
    headers: requestHeaders,
    body: couldHaveBody ? req.body : undefined,
    redirect: "manual",
    // @ts-expect-error: Not available for browser fetch type
    duplex: couldHaveBody ? "half" : undefined,
    cache: "no-store",
  };

  try {
    const upstream = await fetch(targetUrl, fetchOptions);
    const upstreamHeaders = new Headers(upstream.headers);

    upstreamHeaders.delete("content-encoding");
    upstreamHeaders.delete("content-length");
    upstreamHeaders.set("X-Cache", "MISS");

    [
      "connection",
      "keep-alive",
      "transfer-encoding",
      "upgrade",
      "proxy-authenticate",
      "proxy-authorization",
      "te",
      "trailers",
    ].forEach((header) => upstreamHeaders.delete(header));

    const bodyBuffer =
      req.method === "HEAD" ? null : await upstream.arrayBuffer();

    if (req.method === "GET" && bodyBuffer && upstream.ok) {
      geocodeCache.set(key, {
        status: upstream.status,
        headers: [...upstreamHeaders.entries()],
        body: bodyBuffer,
      });
    }

    return new Response(bodyBuffer, {
      status: upstream.status,
      headers: upstreamHeaders,
    });
  } catch (error) {
    console.error("Proxy-Error:", error);

    return new Response(
      JSON.stringify({
        code: "GEOCODING_PROXY_ERROR",
        timestamp: new Date().toISOString(),
        path: targetUrl.pathname,
        message: "Unexpected error while proxying request",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
