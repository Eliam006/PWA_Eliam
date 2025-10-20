const STATIC_CACHE = 'app-shell-v2';
const DYNAMIC_CACHE = 'dynamic-cache-v1';

const APP_SHELL_ASSETS = [
  '/',
  '/index.html',
  '/calendar.html',
  '/form.html',
  '/about.html',
  '/style.css',
  '/register.js',
  '/manifest.json',
  '/images/icons/192.png',
  '/images/icons/512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(APP_SHELL_ASSETS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
            .map(key => caches.delete(key))
      );
    })
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  if (APP_SHELL_ASSETS.includes(url.pathname)) {
    event.respondWith(caches.match(request));
    return;
  }

  event.respondWith(
    caches.open(DYNAMIC_CACHE).then(cache => {
      return cache.match(request).then(response => {
        // Si el recurso ya está en cache → se usa
        if (response) return response;

        // Si no está, lo descarga y guarda
        return fetch(request)
          .then(networkResponse => {
            cache.put(request, networkResponse.clone());
            return networkResponse;
          })
      });
    })
  );
});
