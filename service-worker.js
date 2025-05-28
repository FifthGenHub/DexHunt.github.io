// Basic service worker for DexHunt PWA
const CACHE_NAME = 'dexhunt-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/favicon-32x32.png',
  '/favicon.ico',
  '/manifest.json',
  // Add more assets as needed
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).catch(() => {
        // Fallback for failed requests (e.g., offline)
        if (event.request.destination === 'image') {
          return new Response('', { status: 404, statusText: 'Image not found' });
        }
        return new Response('Offline', { status: 503, statusText: 'Offline' });
      });
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
});
