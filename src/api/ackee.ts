import { createClient, cacheExchange, fetchExchange } from "urql";

export const client = createClient({
  url: "/api/bff/ackee",
  exchanges: [cacheExchange, fetchExchange],
});
