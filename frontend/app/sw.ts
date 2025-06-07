import { CacheOnly, Serwist } from "serwist";
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry } from "serwist";

declare const __SW_MANIFEST: (string | PrecacheEntry)[] | undefined;

const serwist = new Serwist({
  precacheEntries: __SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    ...defaultCache,
    {
      matcher: ({ request }) => request.mode === 'navigate',
      handler: new CacheOnly(),
    },
  ],
});

serwist.addEventListeners();