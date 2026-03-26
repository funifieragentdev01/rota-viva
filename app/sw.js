var CACHE_NAME = 'rota-viva-v1';
var ASSETS = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/app.js',
    '/js/services.js',
    '/js/controllers.js',
    '/config.js'
];

self.addEventListener('install', function(e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll(ASSETS);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', function(e) {
    e.waitUntil(
        caches.keys().then(function(keys) {
            return Promise.all(
                keys.filter(function(k) { return k !== CACHE_NAME; })
                    .map(function(k) { return caches.delete(k); })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', function(e) {
    // Network first for API calls
    if (e.request.url.includes('funifier.com')) {
        e.respondWith(
            fetch(e.request).catch(function() {
                return caches.match(e.request);
            })
        );
        return;
    }
    // Cache first for assets
    e.respondWith(
        caches.match(e.request).then(function(r) {
            return r || fetch(e.request);
        })
    );
});
