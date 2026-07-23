const CACHE_VERSION = "v2";
const SHELL_CACHE = `tesis20-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `tesis20-runtime-${CACHE_VERSION}`;
const CACHE_PREFIX = "tesis20-";
const MAX_RUNTIME_ENTRIES = 60;

const PRECACHE_URLS = [
  "/site.webmanifest",
  "/assets/tesis20-logo.svg",
  "/assets/tesis20-logo.png",
  "/assets/oswald-600.woff2",
  "/assets/roboto.woff2",
];

async function cacheCurrentShell() {
  const cache = await caches.open(SHELL_CACHE);
  const shellResponse = await fetch("/", { cache: "reload" });

  if (shellResponse.ok) {
    await cache.put("/", shellResponse.clone());
    const html = await shellResponse.text();
    const buildAssets = [
      ...html.matchAll(/(?:src|href)=["'](\/build-assets\/[^"']+\.(?:js|css))["']/g),
    ].map((match) => match[1]);

    await Promise.allSettled(buildAssets.map((url) => cache.add(url)));
  }

  await Promise.allSettled(PRECACHE_URLS.map((url) => cache.add(url)));
}

async function trimRuntimeCache(cache) {
  const keys = await cache.keys();
  const excess = keys.length - MAX_RUNTIME_ENTRIES;

  if (excess > 0) {
    await Promise.all(keys.slice(0, excess).map((key) => cache.delete(key)));
  }
}

async function fetchWithTimeout(request, timeout = 5000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    return await fetch(request, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function networkFirstNavigation(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const url = new URL(request.url);
  const cacheKey = new Request(`${url.origin}${url.pathname}`);

  try {
    const response = await fetchWithTimeout(request);
    if (response.ok) {
      await cache.put(cacheKey, response.clone());
      await trimRuntimeCache(cache);
    }
    return response;
  } catch {
    return (
      (await cache.match(cacheKey)) ||
      (await caches.match("/")) ||
      new Response(
        "<!doctype html><html lang=\"es-PE\"><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>Sin conexión | Tesis20</title><body><main><h1>Sin conexión</h1><p>Revisa tu conexión e intenta nuevamente.</p></main></body></html>",
        { headers: { "Content-Type": "text/html; charset=utf-8" }, status: 503 },
      )
    );
  }
}

async function staleWhileRevalidate(event, request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  const update = fetch(request)
    .then(async (response) => {
      if (response.ok) {
        await cache.put(request, response.clone());
        await trimRuntimeCache(cache);
      }
      return response;
    })
    .catch(() => null);

  if (cached) {
    event.waitUntil(update);
    return cached;
  }

  return (await update) || Response.error();
}

self.addEventListener("install", (event) => {
  event.waitUntil(cacheCurrentShell());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith(CACHE_PREFIX) && ![SHELL_CACHE, RUNTIME_CACHE].includes(key))
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  const cacheableDestinations = new Set(["font", "image", "script", "style"]);
  const isManifest = url.pathname === "/site.webmanifest";
  const isHeavyMedia = url.pathname.startsWith("/assets/audio/") || url.pathname.endsWith(".pdf");

  if ((cacheableDestinations.has(request.destination) || isManifest) && !isHeavyMedia) {
    event.respondWith(staleWhileRevalidate(event, request));
  }
});
