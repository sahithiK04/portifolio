/**
 * CACHE PURGE SERVICE WORKER
 * Unregisters old caches and ensures visitors get the fresh, static, lag-free portfolio.
 */

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)));
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Always fetch fresh from network
  event.respondWith(fetch(event.request));
});
