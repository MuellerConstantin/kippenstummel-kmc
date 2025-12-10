import { type NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";

export async function GET(req: NextRequest) {
  return proxyRequest(req);
}

export async function POST(req: NextRequest) {
  return proxyRequest(req);
}

export async function PUT(req: NextRequest) {
  return proxyRequest(req);
}

export async function DELETE(req: NextRequest) {
  return proxyRequest(req);
}

export async function PATCH(req: NextRequest) {
  return proxyRequest(req);
}

export async function HEAD(req: NextRequest) {
  return proxyRequest(req);
}

async function proxyRequest(req: NextRequest) {
  const session = await getServerSession(authOptions);

  const backendUrl = process.env.ACKEE_API_URL;
  const targetUrl = new URL(backendUrl!);

  if (!session) {
    return new Response(
      JSON.stringify({
        code: "BFF_PROXY_AUTHENICATION_ERROR",
        timestamp: new Date().toISOString(),
        path: targetUrl.pathname,
        message: "Unauthenticated proxy request",
      }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  req.nextUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.append(key, value);
  });

  const requestHeaders = new Headers(req.headers);

  requestHeaders.delete("accept-encoding");
  requestHeaders.set("accept-encoding", "identity");
  requestHeaders.append(
    "authorization",
    `Bearer ${process.env.ACKEE_API_TOKEN}`,
  );

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

    return new Response(upstream.body, {
      status: upstream.status,
      headers: upstreamHeaders,
    });
  } catch (error) {
    console.error("Proxy-Error:", error);

    return new Response(
      JSON.stringify({
        code: "BFF_PROXY_ERROR",
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
