// Service Worker for Project4Cast PWA
// Using network-first strategy to always get fresh data
const CACHE_NAME = 'project4cast-v1';

// Install event - minimal caching
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Activate immediately
});

// Fetch event - network first, cache as fallback
self.addEventListener('fetch', (event) => {
  // Skip caching for API routes and dynamic content
  if (event.request.url.includes('/api/') || 
      event.request.url.includes('/_next/') ||
      event.request.method !== 'GET') {
    // Always fetch from network for API calls and Next.js internals
    event.respondWith(fetch(event.request));
    return;
  }

  // For static assets, try network first, then cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Only cache successful responses
        if (response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Network failed, try cache as fallback
        return caches.match(event.request);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});



