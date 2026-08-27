import { type NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import {
  ThrottledQueue,
  ThrottleOverflowError,
} from "@/lib/utils/throttled-queue";
import { getCachedAddress, setCachedAddress } from "@/lib/geocoding/cache";
import { toGeocodedAddress } from "@/lib/geocoding/nominatim";
import { Cvm } from "@/lib/types/cvm";

export const runtime = "nodejs";

const REVERSE_URL = "https://nominatim.openstreetmap.org/reverse";
const USER_AGENT =
  "Kippenstummel Management Console/1.0 (info@mueller-constantin.de)";

const throttledFetchQueue = new ThrottledQueue<Response>(1000, 100);

function errorResponse(
  path: string,
  status: number,
  code: string,
  message: string,
  headers: Record<string, string> = {},
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
      headers: { "Content-Type": "application/json", ...headers },
    },
  );
}

/**
 * Resolves the address of a registered CVM. The coordinates are looked up from
 * the machine rather than taken from the caller, which keeps this from being a
 * reverse geocoder for arbitrary positions: the set of resolvable coordinates,
 * and with it the cache shared with the web frontend, is bounded by the number
 * of registered machines.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const path = `/api/bff/kmc/cvms/${id}/address`;

  const session = await getServerSession(authOptions);

  if (!session) {
    return errorResponse(
      path,
      401,
      "BFF_PROXY_AUTHENICATION_ERROR",
      "Unauthenticated proxy request",
    );
  }

  const backendUrl = process.env.KIPPENSTUMMEL_API_URL;

  let cvm: Cvm;

  try {
    const lookup = await fetch(
      new URL(`${backendUrl}/kmc/cvms/${encodeURIComponent(id)}`),
      {
        headers: {
          Accept: "application/json",
          authorization: `Bearer ${session.accessToken}`,
        },
        redirect: "manual",
        cache: "no-store",
      },
    );

    if (lookup.status === 404) {
      return errorResponse(
        path,
        404,
        "GEOCODING_CVM_NOT_FOUND",
        "No CVM exists for the given id",
      );
    }

    if (!lookup.ok) {
      return errorResponse(
        path,
        502,
        "GEOCODING_CVM_LOOKUP_ERROR",
        "The CVM could not be looked up",
      );
    }

    cvm = (await lookup.json()) as Cvm;
  } catch (error) {
    console.error("Geocoding-Cvm-Lookup-Error:", error);

    return errorResponse(
      path,
      502,
      "GEOCODING_CVM_LOOKUP_ERROR",
      "The CVM could not be looked up",
    );
  }

  const coordinates = { latitude: cvm.latitude, longitude: cvm.longitude };

  const cached = await getCachedAddress(coordinates);

  if (cached) {
    return new Response(JSON.stringify(cached), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "X-Cache": "HIT",
      },
    });
  }

  const targetUrl = new URL(REVERSE_URL);

  targetUrl.searchParams.set("format", "json");
  targetUrl.searchParams.set("lat", String(coordinates.latitude));
  targetUrl.searchParams.set("lon", String(coordinates.longitude));

  try {
    const upstream = await throttledFetchQueue.enqueue(() =>
      fetch(targetUrl, {
        method: "GET",
        headers: {
          "User-Agent": USER_AGENT,
          Accept: "application/json",
          "Accept-Encoding": "identity",
        },
        redirect: "manual",
        cache: "no-store",
      }),
    );

    const upstreamBody = await upstream.text();

    if (!upstream.ok) {
      return errorResponse(
        path,
        upstream.status,
        "GEOCODING_UPSTREAM_ERROR",
        "Upstream geocoding service returned an error",
      );
    }

    const address = toGeocodedAddress(upstreamBody);

    if (!address) {
      return errorResponse(
        path,
        404,
        "GEOCODING_NOT_FOUND",
        "No address could be resolved for the given CVM",
      );
    }

    await setCachedAddress(coordinates, address);

    return new Response(JSON.stringify(address), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "X-Cache": "MISS",
      },
    });
  } catch (error) {
    if (error instanceof ThrottleOverflowError) {
      return errorResponse(
        path,
        429,
        "GEOCODING_PROXY_THROTTLED",
        `Too many requests. Retry after ${error.retryAfterSecs}s.`,
        { "Retry-After": String(error.retryAfterSecs) },
      );
    }

    console.error("Geocoding-Error:", error);

    return errorResponse(
      path,
      500,
      "GEOCODING_PROXY_ERROR",
      "Unexpected error while resolving the address",
    );
  }
}
