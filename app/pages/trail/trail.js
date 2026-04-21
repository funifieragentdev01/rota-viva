angular.module('rotaViva')

.controller('TrailCtrl', function($scope, $q, $location, $routeParams, AuthService, ApiService, ThemeService) {
    var session  = AuthService.getSession();
    var playerId = (session.player || {})._id;
    var route    = session.route || {};
    var routeId  = route._id
        || (route.profile === 'pescador' ? 'pesca' : null)
        || (route.profile === 'apicultor' ? 'mel'  : null)
        || 'mel';
    var theme = ThemeService.load(session.apiKey) || {};
    if (theme && theme.colors) ThemeService.apply(theme, false);

    // ── Scope state ──────────────────────────────────────────────────────
    $scope.loading      = true;
    $scope.trailModules = null; // null until loaded — <duo-trail> waits for this
    $scope.title        = theme.labels ? theme.labels.missions_title : 'Trilhas';
    $scope.playerPoints = 0;
    $scope.playerCoins  = 0;

    // ── Cartoon images — static paths per route ──────────────────────────
    var CHARACTERS = {
        mel:   ['1','2','3','4','5','6','7','8','9','10','11','12','13',
                '14','15','16','17','18','19','20','21','22','23','24','25'],
        pesca: ['1','2','3','4','5','6','7','8','9','10','11','12','13',
                '14','15','16','17','18','19','20','21','22','23','24','25',
                '26','27','28','29','30','31']
    };
    var charList     = CHARACTERS[routeId] || CHARACTERS.mel;
    var charBasePath = 'img/characters/' + routeId + '/trail/';
    $scope.cartoonImages = charList.map(function(n) { return charBasePath + n + '.png'; });

    // ── Module colour palette (fallback when Funifier extra.color is absent) ──
    var MODULE_COLORS = ['#FF9600', '#CE82FF', '#00CD9C', '#1CB0F6', '#FF4B4B', '#FFC800'];
    var ROUTE_NAMES   = { mel: 'Rota do Mel', pesca: 'Rota da Pesca' };

    var folderId = $routeParams.folderId || null;

    // ── Trail cache (localStorage) ───────────────────────────────────────
    var CACHE_TTL        = 5  * 60 * 1000;  // 5 min  — progresso da trilha
    var ROOT_SUBJECT_TTL = 60 * 60 * 1000;  // 1 hora — subject folder (raramente muda)

    // ── Cache: subject root ID (evita POST /v3/folder/inside repetido) ───
    function _rootKey() { return 'rv_trail_root_' + playerId; }

    function _readRootSubject() {
        try {
            var raw = localStorage.getItem(_rootKey());
            if (!raw) return null;
            var d = JSON.parse(raw);
            return (Date.now() - d.cachedAt < ROOT_SUBJECT_TTL) ? d.subjectId : null;
        } catch(e) { return null; }
    }
    function _writeRootSubject(subjectId) {
        try {
            localStorage.setItem(_rootKey(), JSON.stringify({ subjectId: subjectId, cachedAt: Date.now() }));
        } catch(e) {}
    }

    // ── Cache: trailModules por subjectId (evita N+1 folder/progress) ────
    function _cacheKey(subjectId) { return 'rv_trail_cache_' + playerId + '_' + subjectId; }

    function _readCache(subjectId) {
        try {
            var raw = localStorage.getItem(_cacheKey(subjectId));
            return raw ? JSON.parse(raw) : null;
        } catch(e) { return null; }
    }
    function _writeCache(subjectId, modules) {
        try {
            localStorage.setItem(_cacheKey(subjectId), JSON.stringify({
                trailModules: modules,
                cachedAt: Date.now()
            }));
        } catch(e) {}
    }

    // ── Player stats ─────────────────────────────────────────────────────
    if (playerId) {
        ApiService.getPlayerStatus(playerId).then(function(status) {
            $scope.playerPoints = Math.floor(status.total_points || 0);
            var wallets = status.wallets || status.virtual_currencies || [];
            wallets.forEach(function(w) {
                if (w.virtualCurrency === 'cristais' ||
                    (w.name && w.name.toLowerCase().indexOf('cristal') >= 0)) {
                    $scope.playerCoins = Math.floor(w.balance || 0);
                }
            });
        }).catch(angular.noop);
    }

    // ── Init ─────────────────────────────────────────────────────────────
    if (folderId) {
        loadSubjectTrail(folderId);
    } else {
        loadRootFolder();
    }

    // ── Find subject folder and redirect ─────────────────────────────────
    function loadRootFolder() {
        // Evita POST /v3/folder/inside se já conhecemos o subjectId
        var cachedSubjectId = _readRootSubject();
        if (cachedSubjectId) {
            $location.path('/trail/' + cachedSubjectId).replace();
            return;
        }

        ApiService.folderInside(null).then(function(data) {
            var items = data.items || [];
            var root  = items.find(function(i) { return i.folder !== false && i.type === 'subject'; })
                     || items.find(function(i) { return i.folder !== false; });
            if (root) {
                _writeRootSubject(root._id);
                $location.path('/trail/' + root._id).replace();
            } else {
                $scope.loading      = false;
                $scope.trailModules = [];
            }
        }).catch(function() {
            $scope.loading      = false;
            $scope.trailModules = [];
        });
    }

    // ── Fetch subject → modules → lessons, build trailModules[] ──────────
    function loadSubjectTrail(subjectId) {
        $scope.title = ROUTE_NAMES[routeId] || 'Trilha';

        // ── Cache-first (Stale-While-Revalidate) ────────────────────────
        var cached  = _readCache(subjectId);
        var isStale = !cached || (Date.now() - cached.cachedAt) >= CACHE_TTL;

        if (cached) {
            // Render immediately from cache — no loading flash
            $scope.trailModules = cached.trailModules;
            $scope.loading      = false;
        }

        if (!isStale) return; // Cache is fresh — nothing more to do

        // Stale or missing: fetch from API (background if we already showed cache)
        _fetchTrailFromApi(subjectId);
    }

    function _fetchTrailFromApi(subjectId) {
        ApiService.folderProgress(subjectId, playerId).then(function(data) {
            var modules = (data.items || []).filter(function(i) { return i.folder !== false; });

            if (!modules.length) {
                $scope.loading      = false;
                $scope.trailModules = [];
                _writeCache(subjectId, []);
                return;
            }

            // Fetch lessons for every module in parallel
            var promises = modules.map(function(mod, modIdx) {
                var color = (mod.extra && mod.extra.color) || MODULE_COLORS[modIdx % MODULE_COLORS.length];

                return ApiService.folderProgress(mod._id, playerId).then(function(lessonData) {
                    var lessons = (lessonData.items || []).filter(function(i) { return i.folder !== false; });
                    // Generic folder types — not content-type icons
                    var GENERIC_TYPES = ['lesson', 'module', 'subject', 'quiz', 'folder'];
                    return {
                        _id:      mod._id,
                        title:    mod.title,
                        color:    color,
                        percent:  mod.percent  || 0,
                        position: mod.position || modIdx,
                        lessons:  lessons.map(function(l, lIdx) {
                            var firstContent = (l.items || [])[0] || {};
                            // Prefer lesson's own type for specific interaction types (e.g. 'listen', 'diy')
                            // This prevents the icon from changing when items order changes after completion
                            var lessonType = (l.type && GENERIC_TYPES.indexOf(l.type) === -1) ? l.type : '';
                            var contentType = lessonType || firstContent.type || '';
                            return {
                                _id:         l._id,
                                title:       l.title,
                                contentType: contentType,
                                contentId:   firstContent.content || firstContent._id || '',
                                percent:     l.percent      || 0,
                                is_unlocked: l.is_unlocked !== false,
                                position:    l.position    || lIdx
                            };
                        })
                    };
                }).catch(function() {
                    return { _id: mod._id, title: mod.title, color: color,
                             percent: 0, position: modIdx, lessons: [] };
                });
            });

            $q.all(promises).then(function(enrichedModules) {
                $scope.trailModules = enrichedModules;
                $scope.loading      = false;
                _writeCache(subjectId, enrichedModules); // persist fresh data
            }).catch(function() {
                $scope.loading      = false;
                if (!$scope.trailModules) $scope.trailModules = [];
            });

        }).catch(function() {
            $scope.loading = false;
            if (!$scope.trailModules) $scope.trailModules = [];
        });
    }

    // ── Lesson navigation — called by <duo-trail> via on-lesson-start ─────
    $scope.handleLessonStart = function(lesson) {
        if (!lesson.is_unlocked) return;
        var ctx = {
            lesson:      lesson._id,
            subject:     folderId           || '',  // needed by quiz.js to bust trail cache
            module:      lesson.moduleId    || '',
            lessonTitle: lesson.title       || '',
            contentType: lesson.contentType || ''
        };
        var type = lesson.contentType;
        var id   = lesson.contentId;

        if (type === 'cartoon' && id) {
            $location.path('/story/' + id).search(ctx); return;
        }
        if ((type === 'quiz' || type === 'review' || type === 'mission' ||
             type === 'chest' || type === 'diy' ||
             type === 'essay' || type === 'listen') && id) {
            $location.path('/quiz/' + id).search(ctx); return;
        }
        if (type === 'video' && id) {
            $location.path('/video/' + id).search(ctx); return;
        }
        if (type === 'reading' && id) {
            $location.path('/reading/' + id).search(ctx); return;
        }
    };

    // ── Nav shortcuts ─────────────────────────────────────────────────────
    $scope.goBack    = function() { $location.path('/dashboard'); };
    $scope.goGallery = function() { $location.path('/gallery'); };
});
