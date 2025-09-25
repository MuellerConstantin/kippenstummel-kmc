import { type NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(req, params);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(req, params);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(req, params);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(req, params);
}

export async function PATCH(
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
  const session = await getServerSession(authOptions);
  const { path } = await params;

  const backendUrl = process.env.KIPPENSTUMMEL_API_URL;
  const cleanPath = path?.join("/") || "";
  const targetUrl = new URL(`${backendUrl}/${cleanPath}`);

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
  requestHeaders.append("authorization", `Bearer ${session.accessToken}`);

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
