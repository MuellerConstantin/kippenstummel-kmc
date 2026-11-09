import { type NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { fetchWebsiteEndpoint, UmamiConfigurationError } from "@/lib/umami";

/**
 * Read-only endpoints of the configured Umami website the KMC may access.
 * Everything else of the Umami API stays hidden behind the BFF.
 */
const ALLOWED_ENDPOINTS = new Set(["stats", "pageviews"]);

function errorResponse(
  status: number,
  code: string,
  path: string,
  message: string,
) {
  return new Response(
    JSON.stringify({
      code,
      timestamp: new Date().toISOString(),
      path,
      message,
    }),
    {
      status,
      headers: { "Content-Type": "application/json" },
    },
  );
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ endpoint: string }> },
) {
  const { endpoint } = await params;
  const path = req.nextUrl.pathname;

  const session = await getServerSession(authOptions);

  if (!session) {
    return errorResponse(
      401,
      "BFF_PROXY_AUTHENICATION_ERROR",
      path,
      "Unauthenticated proxy request",
    );
  }

  if (!ALLOWED_ENDPOINTS.has(endpoint)) {
    return errorResponse(404, "NOT_FOUND_ERROR", path, "Unknown endpoint");
  }

  try {
    const upstream = await fetchWebsiteEndpoint(
      endpoint,
      req.nextUrl.searchParams,
    );

    return new Response(await upstream.text(), {
      status: upstream.status,
      headers: {
        "Content-Type":
          upstream.headers.get("content-type") ?? "application/json",
      },
    });
  } catch (error) {
    console.error("Proxy-Error:", error);

    if (error instanceof UmamiConfigurationError) {
      return errorResponse(
        503,
        "BFF_PROXY_CONFIGURATION_ERROR",
        path,
        "Analytics is not configured",
      );
    }

    return errorResponse(
      500,
      "BFF_PROXY_ERROR",
      path,
      "Unexpected error while proxying request",
    );
  }
}
