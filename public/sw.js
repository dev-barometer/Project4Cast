// Service Worker for Project4Cast PWA
// Using network-first strategy to always get fresh data
// Cache name includes timestamp to force cache invalidation on updates
const CACHE_NAME = `project4cast-${Date.now()}`;
const VERSION_CHECK_URL = '/version.json';

// Install event - clear old caches and activate immediately
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Activate immediately
  
  // Clear all old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

// Fetch event - always fetch from network, minimal caching
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Always fetch from network for:
  // - API routes
  // - Version check file
  // - Next.js internals
  // - Non-GET requests
  if (url.pathname.includes('/api/') || 
      url.pathname === '/version.json' ||
      url.pathname.includes('/_next/') ||
      event.request.method !== 'GET') {
    event.respondWith(fetch(event.request));
    return;
  }

  // For all other requests, always try network first
  // Only use cache if network completely fails (offline)
  event.respondWith(
    fetch(event.request, { cache: 'no-store' })
      .then((response) => {
        // Don't cache HTML pages - always get fresh content
        if (response.headers.get('content-type')?.includes('text/html')) {
          return response;
        }
        // Only cache static assets as fallback for offline use
        if (response.status === 200 && url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Network failed, try cache as fallback (offline scenario)
        return caches.match(event.request).then((cachedResponse) => {
          return cachedResponse || new Response('Offline', { status: 503 });
        });
      })
  );
});

// Activate event - clean up ALL old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      // Delete ALL caches to ensure fresh content
      return Promise.all(
        cacheNames.map((cacheName) => {
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      // Claim all clients to ensure new service worker takes control immediately
      return self.clients.claim();
    })
  );
});



