/* eslint-disable @typescript-eslint/no-unused-vars */
const CACHE_NAME = 'my-cache-v2';

const APP_SHELL = [
  "/",
  "/login",
  "/register",
  "/leaderboard",
  "/offlineGame",
  "/offline.html",
  "/brush.png",
  "/circle.png",
  "/eraser.png",
  "/file.svg",
  "/globe.svg",
  "/next.svg",
  "/trash.png",
  "/vercel.svg",
  "/window.svg",
  "/icons/doodly-icon.png"
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      const urlsToCache = APP_SHELL;

      await Promise.all(
        urlsToCache.map(async (url) => {
          try {
            const response = await fetch(url, { credentials: 'include' });
            if (!response.ok) throw new Error(`${url} failed with ${response.status}`);
            await cache.put(url, response);
          } catch (err) {
            console.warn(`Skipping failed cache for: ${url}`, err);
          }
        })
      );
    }).catch((err) => {
      console.error('Install failed:', err);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
});

async function cacheFirstStrategy(request) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request, { credentials: 'include'});
    const responseClone = networkResponse.clone();
    await cache.put(request, responseClone);
    return networkResponse;
  } catch (error) {
    console.error("Cache first strategy failed:", error);
    return caches.match("/offline.html");
  }
}

async function fetchComponents(request) {
  if (request.method !== 'GET') {
    try {
      return await fetch(request); 
    } catch (error) {
      console.error(`Network request failed for ${request.url}:`, error);
      return new Response("Network error", { status: 500 });
    }
  }

  const cache = await caches.open(CACHE_NAME);

  try {
    const response = await fetch(request, { credentials: 'include' });
    const responseClone = response.clone();
    await cache.put(request, responseClone);
    return response;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    return new Response("Offline and not cached", { status: 504 });
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.mode === "navigate") {
    event.respondWith(cacheFirstStrategy(request));
  } else {
    const url = new URL(request.url);
    if (url.pathname.endsWith("/api/game")) {
      event.respondWith(
        fetch(request).catch(() => caches.match("/offlineGame"))
      );
    } else {
      event.respondWith(
        fetchComponents(request).catch((err) => {
          console.error("fetchComponents failed:", err);
          return new Response("Fetch failed", {
            status: 500,
            statusText: "Internal Service Worker Error",
          });
        })
      );
    }
  }
});
