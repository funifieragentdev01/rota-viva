// ─── Rota Viva Service Worker ────────────────────────────────────────────────
// Versão deve ser sincronizada com CONFIG.VERSION em config.js.
// Mudar CACHE_VERSION força reinstalação e limpeza dos caches antigos.

var CACHE_VERSION = 'rv-v1.5.1';
var API_CACHE     = 'rv-api-v1.5.1';

// ── App shell: pré-cacheado no install ──────────────────────────────────────
// Inclui todos os JS/CSS versionados + templates HTML (sem versão) + assets core.
// Atualizar esta lista ao adicionar novos arquivos.
var SHELL_ASSETS = [
    '/',
    '/index.html',
    // Config + App
    '/config.js?v=1.4.15',
    '/app.js?v=1.5.1',
    // CSS
    '/css/style.css?v=1.5.1',
    '/directives/duo-trail/duo-trail.css?v=1.4.15',
    // Services
    '/services/cpf.js?v=1.4.15',
    '/services/sound.js?v=1.4.15',
    '/services/theme.js?v=1.4.15',
    '/services/auth.js?v=1.4.15',
    '/services/api.js?v=1.5.1',
    // Directives + Components
    '/directives/duo-trail/duo-trail.js?v=1.4.15',
    '/directives/question/question.js?v=1.4.15',
    '/directives/question/question.html',
    '/directives/gallery/gallery-carousel.js?v=1.5.1',
    '/directives/story/story.js?v=1.5.1',
    '/directives/story/story.html',
    '/components/bottom-nav/bottom-nav.js?v=1.4.15',
    // Pages JS
    '/pages/landing/landing.js?v=1.4.15',
    '/pages/rota/rota.js?v=1.4.15',
    '/pages/onboarding/onboarding.js?v=1.4.15',
    '/pages/login/login.js?v=1.4.15',
    '/pages/signup/signup.js?v=1.4.15',
    '/pages/dashboard/dashboard.js?v=1.4.15',
    '/pages/trail/trail.js?v=1.5.1',
    '/pages/gallery/gallery.js?v=1.5.1',
    '/pages/profile/profile.js?v=1.4.15',
    '/pages/quiz/quiz.js?v=1.4.15',
    '/pages/video/video.js?v=1.4.15',
    '/pages/reading/reading.js?v=1.4.15',
    '/pages/story/story.js?v=1.5.1',
    // Pages HTML (AngularJS busca sem versão via $http)
    '/pages/landing/landing.html',
    '/pages/rota/rota.html',
    '/pages/onboarding/onboarding.html',
    '/pages/login/login.html',
    '/pages/signup/signup.html',
    '/pages/dashboard/dashboard.html',
    '/pages/trail/trail.html',
    '/pages/gallery/gallery.html',
    '/pages/profile/profile.html',
    '/pages/quiz/quiz.html',
    '/pages/video/video.html',
    '/pages/reading/reading.html',
    '/pages/story/story.html',
    '/components/bottom-nav/bottom-nav.html',
    // Audio
    '/audio/beep.mp3',
    '/audio/magic-sound.mp3',
    '/audio/wrong.mp3',
    // Imagens core
    '/img/icon-192.png',
    '/img/icon-512.png',
    '/img/logo-midr.png'
];

// CDN — cacheados com best-effort (falhas não bloqueiam instalação)
var CDN_ASSETS = [
    'https://ajax.googleapis.com/ajax/libs/angularjs/1.8.2/angular.min.js',
    'https://ajax.googleapis.com/ajax/libs/angularjs/1.8.2/angular-route.min.js',
    'https://ajax.googleapis.com/ajax/libs/angularjs/1.8.2/angular-sanitize.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js',
    'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

// ── Install: pré-cache do app shell ─────────────────────────────────────────
self.addEventListener('install', function(e) {
    e.waitUntil(
        caches.open(CACHE_VERSION).then(function(cache) {
            // Shell assets são obrigatórios — qualquer falha aborta o install
            return cache.addAll(SHELL_ASSETS).then(function() {
                // CDN é best-effort — falhas individuais são ignoradas
                return Promise.allSettled(
                    CDN_ASSETS.map(function(url) {
                        return fetch(url, { mode: 'cors' }).then(function(r) {
                            if (r.ok) return cache.put(url, r);
                        });
                    })
                );
            });
        })
    );
    // Ativa imediatamente sem esperar abas antigas fecharem
    self.skipWaiting();
});

// ── Activate: limpa caches de versões anteriores ─────────────────────────────
self.addEventListener('activate', function(e) {
    e.waitUntil(
        caches.keys().then(function(keys) {
            return Promise.all(
                keys.filter(function(k) {
                    return k !== CACHE_VERSION && k !== API_CACHE;
                }).map(function(k) { return caches.delete(k); })
            );
        }).then(function() {
            return self.clients.claim();
        })
    );
});

// ── Message: skip-waiting sob demanda (banner de update) ────────────────────
self.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

// ── Fetch: estratégia por tipo de recurso ────────────────────────────────────
self.addEventListener('fetch', function(e) {
    var url = e.request.url;
    var method = e.request.method;

    // Ignora requisições não-GET (POST/PUT/DELETE para a API não são cacheáveis)
    if (method !== 'GET') return;

    // ── 1. API Funifier: Network-first, fallback para cache ──────────────────
    if (url.indexOf('funifier.com') !== -1) {
        e.respondWith(networkFirstWithCache(e.request, API_CACHE));
        return;
    }

    // ── 2. CDN externo (fontes, libs): Cache-first ───────────────────────────
    if (isCdnUrl(url)) {
        e.respondWith(cacheFirst(e.request, CACHE_VERSION));
        return;
    }

    // ── 3. Navegação (hash routing — sempre retorna index.html) ─────────────
    if (e.request.mode === 'navigate') {
        e.respondWith(cacheFirst(new Request('/index.html'), CACHE_VERSION));
        return;
    }

    // ── 4. Assets locais (JS, CSS, HTML, imagens, áudio): Cache-first ───────
    e.respondWith(cacheFirstWithNetworkFallback(e.request));
});

// ── Estratégias ──────────────────────────────────────────────────────────────

// Cache-first: retorna do cache; se ausente, busca na rede e armazena
function cacheFirst(request, cacheName) {
    return caches.match(request).then(function(cached) {
        if (cached) return cached;
        return fetch(request).then(function(response) {
            if (response && response.ok) {
                var clone = response.clone();
                caches.open(cacheName || CACHE_VERSION).then(function(cache) {
                    cache.put(request, clone);
                });
            }
            return response;
        });
    });
}

// Cache-first com fallback: como cacheFirst, mas não rejeita se offline
function cacheFirstWithNetworkFallback(request) {
    return caches.match(request).then(function(cached) {
        if (cached) return cached;
        return fetch(request).then(function(response) {
            if (response && response.ok) {
                var clone = response.clone();
                caches.open(CACHE_VERSION).then(function(cache) {
                    cache.put(request, clone);
                });
            }
            return response;
        }).catch(function() {
            // Offline e não está em cache — retorna index.html como fallback
            return caches.match('/index.html');
        });
    });
}

// Network-first: tenta rede; se falhar, retorna do cache (com update do cache no sucesso)
function networkFirstWithCache(request, cacheName) {
    return fetch(request).then(function(response) {
        if (response && response.ok) {
            var clone = response.clone();
            caches.open(cacheName).then(function(cache) {
                cache.put(request, clone);
            });
        }
        return response;
    }).catch(function() {
        return caches.match(request, { cacheName: cacheName });
    });
}

function isCdnUrl(url) {
    return url.indexOf('googleapis.com') !== -1 ||
           url.indexOf('gstatic.com')    !== -1 ||
           url.indexOf('cdnjs.cloudflare.com') !== -1 ||
           url.indexOf('jsdelivr.net')   !== -1 ||
           url.indexOf('unpkg.com')      !== -1 ||
           url.indexOf('font-awesome')   !== -1;
}
