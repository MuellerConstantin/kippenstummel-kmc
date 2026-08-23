import Redis from "ioredis";

const READY_TIMEOUT_MS = 2000;

const globalForRedis = globalThis as unknown as {
  kippenstummelRedis?: Redis | null;
  kippenstummelRedisReady?: Promise<void>;
};

function createClient(): Redis | null {
  if (globalForRedis.kippenstummelRedis !== undefined) {
    return globalForRedis.kippenstummelRedis;
  }

  const url = process.env.REDIS_URL;

  if (!url) {
    globalForRedis.kippenstummelRedis = null;
    return null;
  }

  const client = new Redis(url, {
    // Reject commands while disconnected instead of queueing them, so an
    // unreachable Redis degrades to an immediate cache miss rather than
    // stalling the request or growing an unbounded backlog.
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1,
    retryStrategy: (times) => Math.min(times * 200, 5000),
  });

  client.on("error", (error) => {
    console.error("Redis-Error:", error);
  });

  globalForRedis.kippenstummelRedis = client;

  return client;
}

/**
 * Resolves once the initial connection settled, either successfully or not.
 * Awaited only for the very first connect: afterwards commands are issued
 * right away and fail fast while Redis is unavailable.
 */
function awaitInitialConnect(client: Redis): Promise<void> {
  if (globalForRedis.kippenstummelRedisReady) {
    return globalForRedis.kippenstummelRedisReady;
  }

  globalForRedis.kippenstummelRedisReady = new Promise<void>((resolve) => {
    if (client.status === "ready") {
      resolve();
      return;
    }

    const settle = () => {
      clearTimeout(timer);
      client.off("ready", settle);
      client.off("error", settle);
      client.off("end", settle);
      resolve();
    };

    const timer = setTimeout(settle, READY_TIMEOUT_MS);

    client.on("ready", settle);
    client.on("error", settle);
    client.on("end", settle);
  });

  return globalForRedis.kippenstummelRedisReady;
}

/**
 * Returns the shared Redis client or `null` if no `REDIS_URL` is configured.
 * Redis is optional: without it, callers are expected to fall back to their
 * in-memory behaviour.
 */
export async function getRedisClient(): Promise<Redis | null> {
  const client = createClient();

  if (!client) {
    return null;
  }

  await awaitInitialConnect(client);

  return client;
}
