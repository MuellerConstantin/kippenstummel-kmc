import { LRUCache } from "lru-cache";
import { getRedisClient } from "@/lib/redis";
import { GeoCoordinates } from "@/lib/types/geo";
import { GeocodedAddress } from "@/lib/types/geocoding";

/*
 * Addresses at a fixed coordinate barely change, and the key space is bounded
 * by the number of CVMs rather than by request volume. The TTL is therefore
 * less about correctness than about eventually picking up improved OSM data
 * and letting keys of repositioned CVMs expire.
 */
const TTL_MS = 1000 * 60 * 60 * 24 * 365; // 1 year
const REDIS_KEY_PREFIX = "geocoding:";

/**
 * In-process cache, avoids a Redis roundtrip for recently requested
 * coordinates. Kept small on purpose, Redis is the authoritative layer.
 */
const memoryCache = new LRUCache<string, GeocodedAddress>({
  max: 1000,
  ttl: TTL_MS,
});

/**
 * Keys are derived from the coordinates instead of the upstream request, so
 * the cache stays usable from anywhere a coordinate needs to be resolved. The
 * coordinates are normalised to shield the key space from differing textual
 * representations of the same point.
 */
function cacheKey(coordinates: GeoCoordinates): string {
  return `${coordinates.latitude},${coordinates.longitude}`;
}

/**
 * Returns the cached address for the given coordinates, or `undefined` if it
 * is not cached. An entry that cannot be read back into the current shape is
 * reported as a miss rather than served, so a changed model cannot leak stale
 * documents to callers.
 */
export async function getCachedAddress(
  coordinates: GeoCoordinates,
): Promise<GeocodedAddress | undefined> {
  const key = cacheKey(coordinates);
  const cached = memoryCache.get(key);

  if (cached) {
    return cached;
  }

  const redis = await getRedisClient();

  if (!redis) {
    return undefined;
  }

  try {
    const serialized = await redis.get(`${REDIS_KEY_PREFIX}${key}`);

    if (!serialized) {
      return undefined;
    }

    const address = JSON.parse(serialized) as GeocodedAddress;

    if (!address?.displayName || !address.address) {
      return undefined;
    }

    memoryCache.set(key, address);

    return address;
  } catch (error) {
    console.error("Geocoding-Cache-Read-Error:", error);
    return undefined;
  }
}

export async function setCachedAddress(
  coordinates: GeoCoordinates,
  address: GeocodedAddress,
): Promise<void> {
  const key = cacheKey(coordinates);

  memoryCache.set(key, address);

  const redis = await getRedisClient();

  if (!redis) {
    return;
  }

  try {
    await redis.set(
      `${REDIS_KEY_PREFIX}${key}`,
      JSON.stringify(address),
      "PX",
      TTL_MS,
    );
  } catch (error) {
    console.error("Geocoding-Cache-Write-Error:", error);
  }
}
