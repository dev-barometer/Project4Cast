// Service Worker for Project4Cast PWA
// Network-first. Static cache name so installs are idempotent across page loads.
// Bump CACHE_VERSION when shipping a deliberate SW change.

const CACHE_VERSION = 'v2';
const CACHE_NAME = `project4cast-${CACHE_VERSION}`;

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);

  if (
    url.pathname.includes('/api/') ||
    url.pathname.includes('/_next/') ||
    url.pathname === '/version.json'
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('text/html')) {
          return response;
        }
        if (
          response.status === 200 &&
          url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)
        ) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() =>
        caches.match(event.request).then(
          (cachedResponse) => cachedResponse || new Response('Offline', { status: 503 })
        )
      )
  );
});
