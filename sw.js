/**
 * SERVICE WORKER FOR ULTRA-FAST ASSET & FRAME CACHING
 * - Pre-caches all 65 interactive character video frames (frames/center.webp & frame_0..63.webp)
 * - Cache-First strategy for frames: zero network latency on repeat visits, no stutter or lag
 * - Stale-While-Revalidate for core portfolio scripts & styles
 */

const CACHE_NAME = 'sahithi-portfolio-v1';
const FRAME_CACHE_NAME = 'sahithi-frames-v1';

// Generate list of all 65 frames to pre-cache
const FRAME_ASSETS = ['frames/center.webp'];
for (let i = 0; i < 64; i++) {
  FRAME_ASSETS.push(`frames/frame_${i}.webp`);
}

const CORE_ASSETS = [
  './',
  'index.html',
  'style.css',
  'main.js',
  'spiderweb-particles.js',
  'magic-cursor.js',
  'chatbot.css',
  'chatbot.js'
];

// Install: Cache all core assets and pre-cache frames
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)),
      caches.open(FRAME_CACHE_NAME).then((cache) => cache.addAll(FRAME_ASSETS))
    ]).then(() => self.skipWaiting())
  );
});

// Activate: Clean up old caches if version changes
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== FRAME_CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Cache-First for frames (0ms latency, zero lag), Stale-While-Revalidate for others
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. All webp frames: Cache-First (Instant delivery from disk/RAM cache)
  if (url.pathname.includes('/frames/')) {
    event.respondWith(
      caches.open(FRAME_CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        // If not in cache yet, fetch from network and store in frame cache
        try {
          const networkResponse = await fetch(event.request);
          if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        } catch (err) {
          return cachedResponse;
        }
      })
    );
    return;
  }

  // 2. Core assets: Stale-While-Revalidate (Fast render + background update)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
