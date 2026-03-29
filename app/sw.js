var CACHE_NAME = 'rota-viva-v0.4.1';
var ASSETS = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/app.js',
    '/js/services.js',
    '/js/controllers.js',
    '/config.js',
    '/views/landing.html',
    '/views/login.html',
    '/views/signup.html',
    '/views/dashboard.html'
];

var CDN_ASSETS = [
    'https://ajax.googleapis.com/ajax/libs/angularjs/1.8.2/angular.min.js',
    'https://ajax.googleapis.com/ajax/libs/angularjs/1.8.2/angular-route.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Baloo+2:wght@700;800&family=Inter:wght@400;500;600&display=swap'
];

self.addEventListener('install', function(e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            // Cache local assets
            return cache.addAll(ASSETS).then(function() {
                // Cache CDN assets (best effort)
                return Promise.allSettled(
                    CDN_ASSETS.map(function(url) {
                        return fetch(url).then(function(r) {
                            if (r.ok) return cache.put(url, r);
                        });
                    })
                );
            });
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

    // Cache first for everything else (assets + CDN)
    e.respondWith(
        caches.match(e.request).then(function(r) {
            return r || fetch(e.request).then(function(response) {
                // Cache font files and CDN resources on first load
                if (e.request.url.includes('fonts.gstatic.com') ||
                    e.request.url.includes('cdnjs.cloudflare.com')) {
                    var clone = response.clone();
                    caches.open(CACHE_NAME).then(function(cache) {
                        cache.put(e.request, clone);
                    });
                }
                return response;
            });
        })
    );
});
