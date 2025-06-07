import { createCache } from "cache-manager";

export const memoryCache = createCache({ ttl: 10000, refreshThreshold: 0 });
