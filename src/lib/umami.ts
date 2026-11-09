/*
 * Server-side access to the Umami API. Self-hosted Umami has no API keys, so
 * the KMC logs in with a dedicated (ideally view-only) Umami user and caches
 * the resulting bearer token. The token is renewed once Umami rejects it.
 *
 * @see {@link https://umami.is/docs/api/authentication | Umami API authentication}
 */

const globalForUmami = globalThis as unknown as {
  kippenstummelUmamiToken?: Promise<string>;
};

export class UmamiConfigurationError extends Error {}

function getApiUrl(): string {
  const apiUrl = process.env.UMAMI_API_URL;

  if (!apiUrl) {
    throw new UmamiConfigurationError("UMAMI_API_URL is not set");
  }

  return apiUrl.replace(/\/$/, "");
}

async function login(): Promise<string> {
  const username = process.env.UMAMI_USERNAME;
  const password = process.env.UMAMI_PASSWORD;

  if (!username || !password) {
    throw new UmamiConfigurationError(
      "UMAMI_USERNAME or UMAMI_PASSWORD is not set",
    );
  }

  const res = await fetch(`${getApiUrl()}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Umami login failed with status ${res.status}`);
  }

  const { token } = (await res.json()) as { token: string };

  return token;
}

function getToken(renew = false): Promise<string> {
  if (renew || !globalForUmami.kippenstummelUmamiToken) {
    const pending = login();

    // Don't keep a failed login cached, the next request should retry it.
    pending.catch(() => {
      if (globalForUmami.kippenstummelUmamiToken === pending) {
        delete globalForUmami.kippenstummelUmamiToken;
      }
    });

    globalForUmami.kippenstummelUmamiToken = pending;
  }

  return globalForUmami.kippenstummelUmamiToken;
}

/**
 * Sends a GET request to an endpoint of the configured website, e.g.
 * `stats` resolves to `/api/websites/<UMAMI_WEBSITE_ID>/stats`.
 */
export async function fetchWebsiteEndpoint(
  endpoint: string,
  searchParams: URLSearchParams,
): Promise<Response> {
  const websiteId = process.env.UMAMI_WEBSITE_ID;

  if (!websiteId) {
    throw new UmamiConfigurationError("UMAMI_WEBSITE_ID is not set");
  }

  const targetUrl = new URL(
    `${getApiUrl()}/websites/${encodeURIComponent(websiteId)}/${endpoint}`,
  );

  searchParams.forEach((value, key) => {
    targetUrl.searchParams.append(key, value);
  });

  const send = async (token: string) =>
    fetch(targetUrl, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

  const res = await send(await getToken());

  if (res.status === 401) {
    return send(await getToken(true));
  }

  return res;
}
