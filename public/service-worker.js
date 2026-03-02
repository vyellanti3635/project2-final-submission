const CACHE_VERSION = "v10";
const STATIC_CACHE = `blog-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `blog-dynamic-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  "/",
  '/css/style.css',
  '/js/main.js',
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/offline",
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  const currentCaches = [STATIC_CACHE, DYNAMIC_CACHE];
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!currentCaches.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  if (url.origin !== location.origin) return;
  
  // Never cache HTML pages - always fetch fresh
  if (request.destination === 'document' || 
      request.headers.get('Accept')?.includes('text/html')) {
    return;
  }
  
  // Cache static assets only
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      
      return fetch(request).then(response => {
        if (response && response.status === 200 && 
            (request.destination === 'style' || 
             request.destination === 'script' || 
             request.destination === 'image')) {
          const cache = caches.open(DYNAMIC_CACHE);
          cache.then(c => c.put(request, response.clone()));
        }
        return response;
      }).catch(() => {
        return caches.match("/offline");
      });
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
