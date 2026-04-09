angular.module('rotaViva')

.controller('TrailCtrl', function($scope, $location, $routeParams, $timeout, AuthService, ApiService, ThemeService) {
    var session = AuthService.getSession();
    var playerId = (session.player || {})._id;
    var route = session.route || {};
    var routeId = route._id
        || (route.profile === 'pescador' ? 'pesca' : null)
        || (route.profile === 'apicultor' ? 'mel' : null)
        || 'mel';
    var theme = ThemeService.load(session.apiKey) || {};

    if (theme && theme.colors) ThemeService.apply(theme, false);

    $scope.level = 'root';
    $scope.title = theme.labels ? theme.labels.missions_title : 'Trilhas';
    $scope.loading = true;
    $scope.trailItems = [];
    $scope.trailLoading = false;
    $scope.selectedLesson = null;
    $scope.activeModule = null;

    var MODULE_COLORS = ['#FF9600', '#CE82FF', '#00CD9C', '#1CB0F6', '#FF4B4B', '#FFC800'];
    var ROUTE_NAMES = { mel: 'Rota do Mel', pesca: 'Rota da Pesca' };

    var CHARACTERS = {
        mel:   ['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25'],
        pesca: ['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31']
    };
    var charList = CHARACTERS[routeId] || CHARACTERS.mel;
    var charBasePath = 'img/characters/' + routeId + '/trail/';

    var folderId = $routeParams.folderId || null;

    $scope.playerPoints = 0;
    $scope.playerStreak = 0;
    if (playerId) {
        ApiService.getPlayerStatus(playerId).then(function(status) {
            $scope.playerPoints = Math.floor(status.total_points || 0);
        }).catch(function() {});

        ApiService.getActionLogs(playerId, 60).then(function(logs) {
            if (!logs || logs.length === 0) return;
            var days = {};
            logs.forEach(function(log) {
                var d = new Date(log.time);
                days[d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate()] = true;
            });
            var check = new Date();
            var streak = 0;
            var todayKey = check.getFullYear() + '-' + (check.getMonth() + 1) + '-' + check.getDate();
            if (!days[todayKey]) check.setDate(check.getDate() - 1);
            while (true) {
                var key = check.getFullYear() + '-' + (check.getMonth() + 1) + '-' + check.getDate();
                if (days[key]) { streak++; check.setDate(check.getDate() - 1); } else break;
            }
            $scope.playerStreak = streak;
        }).catch(function() {});
    }

    function init() {
        if (folderId) {
            loadSubjectTrail(folderId);
        } else {
            loadRootFolder();
        }
    }

    function loadRootFolder() {
        $scope.loading = true;
        ApiService.folderInside(null).then(function(data) {
            var items = data.items || [];
            var rootFolder = items.find(function(i) {
                return i.folder !== false && i.type === 'subject';
            });
            if (!rootFolder) {
                rootFolder = items.find(function(i) { return i.folder !== false; });
            }
            if (rootFolder) {
                $location.path('/trail/' + rootFolder._id).replace();
            } else {
                $scope.loading = false;
                $scope.level = 'subject';
                $scope.trailItems = [];
                $scope.trailLoading = false;
            }
        }).catch(function() {
            $scope.loading = false;
            $scope.level = 'subject';
            $scope.trailItems = [];
            $scope.trailLoading = false;
        });
    }

    function loadSubjectTrail(subjectId) {
        $scope.level = 'subject';
        $scope.trailLoading = true;
        $scope.title = ROUTE_NAMES[routeId] || 'Trilha';

        ApiService.dbGet('folder', subjectId).then(function(folder) {
            if (folder && folder.subject) $scope.title = folder.subject;
        }).catch(function() {});

        ApiService.folderProgress(subjectId, playerId).then(function(data) {
            var items = data.items || [];
            var modules = items.filter(function(i) { return i.folder !== false; });

            if (modules.length === 0) {
                $scope.trailItems = [];
                $scope.trailLoading = false;
                $scope.loading = false;
                return;
            }

            var pending = modules.length;
            var allItems = [];

            modules.forEach(function(mod, modIdx) {
                var color = (mod.extra && mod.extra.color) || MODULE_COLORS[modIdx % MODULE_COLORS.length];

                allItems.push({
                    _type: 'module',
                    _id: mod._id,
                    title: mod.title,
                    color: color,
                    percent: mod.percent || 0,
                    position: mod.position || modIdx,
                    _lessonCount: 0
                });

                ApiService.folderProgress(mod._id, playerId).then(function(lessonData) {
                    var lessonItems = lessonData.items || [];
                    var lessons = lessonItems.filter(function(i) { return i.folder !== false; });
                    var moduleHeader = allItems.find(function(i) { return i._id === mod._id; });
                    if (moduleHeader) moduleHeader._lessonCount = lessons.length;

                    lessons.forEach(function(lesson, lIdx) {
                        var contentItems = lesson.items || [];
                        var firstContent = contentItems.length > 0 ? contentItems[0] : {};
                        var contentType = firstContent.type || '';
                        var contentId = firstContent.content || firstContent._id || '';

                        allItems.push({
                            _type: 'lesson',
                            _id: lesson._id,
                            title: lesson.title,
                            moduleColor: color,
                            moduleId: mod._id,
                            lessonIndex: lIdx,
                            position: lesson.position || lIdx,
                            percent: lesson.percent || 0,
                            is_unlocked: lesson.is_unlocked !== false,
                            contentType: contentType,
                            contentId: contentId,
                            icon: 'fa-play'
                        });
                    });

                    pending--;
                    if (pending === 0) finalizeTrail(allItems);
                }).catch(function() {
                    pending--;
                    if (pending === 0) finalizeTrail(allItems);
                });
            });

            $scope.loading = false;
        }).catch(function() {
            $scope.trailItems = [];
            $scope.trailLoading = false;
            $scope.loading = false;
        });
    }

    function finalizeTrail(items) {
        var modules = items.filter(function(i) { return i._type === 'module'; })
            .sort(function(a, b) { return (a.position || 0) - (b.position || 0); });

        var flat = [];
        var globalLessonIdx = 0;
        var charIdx = 0;

        modules.forEach(function(mod, modIdx) {
            mod.moduleIndex = modIdx;
            flat.push(mod);
            var lessons = items.filter(function(i) { return i._type === 'lesson' && i.moduleId === mod._id; })
                .sort(function(a, b) { return (a.position || 0) - (b.position || 0); });

            lessons.forEach(function(l, idx) {
                l.lessonIndex = idx;
                l.globalIndex = globalLessonIdx;
                l.icon = getLessonIcon(l);
                globalLessonIdx++;

                if (l.globalIndex % 4 === 2) {
                    var prevItem = flat.length > 0 ? flat[flat.length - 1] : null;
                    if (!prevItem || prevItem._type !== 'module') {
                        var charName = charList[charIdx % charList.length];
                        l._charImg = charBasePath + charName + '.png';
                        l._charName = charName;
                        charIdx++;
                    }
                }

                flat.push(l);
            });
        });

        var firstModule = flat.find(function(i) { return i._type === 'module'; });
        if (firstModule) $scope.activeModule = firstModule;

        $scope.trailItems = flat;
        $scope.trailLoading = false;
        $scope.$applyAsync();

        $timeout(function() {
            setupModuleScrollObserver();
            for (var i = 0; i < flat.length; i++) {
                if (flat[i]._type === 'lesson' && flat[i].is_unlocked && flat[i].percent < 100) {
                    var el = document.getElementById('trail-item-' + flat[i]._id);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    break;
                }
            }
        }, 350);
    }

    function setupModuleScrollObserver() {
        var lastModuleId = null;

        // Measure real header and sticky box heights, position sticky box correctly
        var headerEl = document.querySelector('.trail-header');
        var stickyEl = document.querySelector('.duo-sticky-module');
        var headerH = headerEl ? headerEl.offsetHeight : 68;
        var stickyH = stickyEl ? stickyEl.offsetHeight : 60;
        if (stickyEl) stickyEl.style.top = headerH + 'px';

        // Threshold = bottom edge of sticky box.
        // A module divider becomes current the moment it disappears behind the sticky box.
        var threshold = headerH + stickyH;

        // Pre-build ordered list of module items (same order as DOM dividers)
        var moduleItems = $scope.trailItems.filter(function(i) { return i._type === 'module'; });

        function updateActiveModule() {
            if (!moduleItems.length) return;

            // Select dividers by class only — no attribute dependency
            var dividers = document.querySelectorAll('.duo-module-divider');
            if (!dividers.length) return;

            // Find the index of the last divider whose top is at/above the threshold.
            // "Last" = deepest one scrolled past = current module.
            var activeIdx = 0; // default: first module
            dividers.forEach(function(el, idx) {
                if (el.getBoundingClientRect().top <= threshold) activeIdx = idx;
            });

            var activeItem = moduleItems[activeIdx];
            if (!activeItem) return;
            if (activeItem._id === lastModuleId) return;
            lastModuleId = activeItem._id;

            if ($scope.$$phase) {
                $scope.activeModule = activeItem;
            } else {
                $scope.$apply(function() { $scope.activeModule = activeItem; });
            }
        }

        window.addEventListener('scroll', updateActiveModule, { passive: true });
        document.addEventListener('scroll', updateActiveModule, { passive: true });
        $scope.$on('$destroy', function() {
            window.removeEventListener('scroll', updateActiveModule);
            document.removeEventListener('scroll', updateActiveModule);
        });
        updateActiveModule();
    }

    var CONTENT_ICONS = {
        'quiz':    'fa-star',
        'review':  'fa-trophy',
        'video':   'fa-play',
        'reading': 'fa-book-open',
        'mission': 'fa-wrench',
        'diy':     'fa-camera',
        'essay':   'fa-comment',
        'chest':   'fa-gem',
        'listen':  'fa-headphones'
    };

    function getLessonIcon(lesson) {
        var typeIcon = CONTENT_ICONS[lesson.contentType];
        if (typeIcon) return typeIcon;
        if (!lesson.is_unlocked) return 'fa-lock';
        if (lesson.percent >= 100) return 'fa-check';
        return 'fa-star';
    }

    $scope.getCharacterStyle = function(item) {
        if (!item._charImg) return { display: 'none' };
        var xOffset = Math.sin(item.lessonIndex * 0.8) * 70;
        var style = { position: 'absolute', top: '-80px' };
        if (xOffset >= 0) {
            style.right = 'auto';
            style.left = '-230px';
        } else {
            style.left = 'auto';
            style.right = '-230px';
        }
        return style;
    };

    $scope.isChest = function(item) {
        return item._type === 'lesson' && item.contentType === 'chest';
    };

    $scope.getBubbleStyle = function(item) {
        if (item._type !== 'lesson') return {};
        var xOffset = Math.sin(item.lessonIndex * 0.8) * 70;
        return { 'margin-left': 'calc(50% - 36px + ' + xOffset + 'px)' };
    };

    $scope.getBubbleClass = function(item) {
        if (!item.is_unlocked) return 'duo-bubble duo-locked';
        if (item.percent >= 100) return 'duo-bubble duo-done';
        return 'duo-bubble duo-active';
    };

    $scope.getBubbleDynamic = function(item) {
        if (!item.is_unlocked) return {};
        return { 'background': item.moduleColor };
    };

    $scope.selectLesson = function(item, $event) {
        $event.stopPropagation();
        if ($scope.selectedLesson && $scope.selectedLesson._id === item._id) {
            $scope.selectedLesson = null;
        } else {
            $scope.selectedLesson = item;
        }
    };

    function lessonCtx(item) {
        return { lesson: item._id, module: item.moduleId || '', lessonTitle: item.title || '' };
    }

    $scope.startLesson = function(item) {
        if (!item.is_unlocked) return;

        if ((item.contentType === 'quiz' || item.contentType === 'review') && item.contentId) {
            $location.path('/quiz/' + item.contentId).search(lessonCtx(item));
            return;
        }
        if (item.contentType === 'video') {
            var vid = item.contentId || item._foldContentId;
            if (vid) { $location.path('/video/' + vid).search(lessonCtx(item)); return; }
        }
        if (item.contentType === 'reading' && item.contentId) {
            $location.path('/reading/' + item.contentId).search(lessonCtx(item));
            return;
        }
        if (item.contentType === 'mission' && item.contentId) {
            $location.path('/quiz/' + item.contentId).search(lessonCtx(item));
            return;
        }
        if (item.contentType === 'chest' && item.contentId) {
            $location.path('/quiz/' + item.contentId).search(lessonCtx(item));
            return;
        }

        ApiService.folderProgress(item._id, playerId).then(function(data) {
            var items = data.items || [];
            var content = items.find(function(c) { return c.folder === false; });
            if (content) {
                var ctx = lessonCtx(item);
                if (content.type === 'quiz' && content.content) {
                    $location.path('/quiz/' + content.content).search(ctx);
                } else if (content.type === 'video' && content.content) {
                    $location.path('/video/' + content.content).search(ctx);
                } else if (content.type === 'reading' && content.content) {
                    $location.path('/reading/' + content.content).search(ctx);
                } else if (content.type === 'mission' && content.content) {
                    $location.path('/quiz/' + content.content).search(ctx);
                } else {
                    alert('Tipo de conteúdo não suportado ainda.');
                }
            }
        });
    };

    $scope.goBack = function() { $location.path('/dashboard'); };
    $scope.goHome = function() { $location.path('/dashboard'); };
    $scope.goGallery = function() { $location.path('/gallery'); };

    init();
});
