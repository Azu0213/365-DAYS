// Service Worker for 365 Days Flooring
const CACHE_NAME = '365-flooring-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/catalog.html',
  '/styles.css',
  '/script.js',
  '/data/materials.json',
  // Cache some critical images
  '/catalog/images/MAT001_sample.jpg',
  '/catalog/images/MAT001_label.jpg',
  '/catalog/images/MAT002_sample.jpg',
  '/catalog/images/MAT002_label.jpg'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});