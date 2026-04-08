angular.module('rotaViva')

.controller('DashboardCtrl', function($scope, $location, AuthService, ThemeService, ApiService) {
    var session = AuthService.getSession();
    $scope.player = session.player || {};
    $scope.route = session.route || {};
    $scope.theme = ThemeService.load(session.apiKey) || {};
    var playerId = ($scope.player || {})._id;

    // Saudação baseada no horário
    var hour = new Date().getHours();
    $scope.greeting = hour < 12 ? 'Bom dia,' : hour < 18 ? 'Boa tarde,' : 'Boa noite,';
    $scope.firstName = ($scope.player.name || 'Produtor').split(' ')[0];

    // Stats
    $scope.totalPoints = 0;
    $scope.levelName = '';
    $scope.levelPercent = 0;
    $scope.nextLevelName = '';
    $scope.statusLoaded = false;
    $scope.streak = 0;
    $scope.streakAtRisk = false;

    // Próxima lição
    $scope.nextLesson = null;
    $scope.trailDone = false;
    $scope.nextLessonLoading = true;

    // Galeria preview
    $scope.communityPosts = [];

    if ($scope.theme && $scope.theme.colors) ThemeService.apply($scope.theme, false);

    // ─── Status do player ──────────────────────────────────────────────────────
    if (playerId) {
        ApiService.getPlayerStatus(playerId).then(function(status) {
            $scope.totalPoints = Math.floor(status.total_points || 0);
            var lp = status.level_progress || {};
            var level = lp.level || {};
            $scope.levelName = level.level || 'Iniciante';
            $scope.levelPercent = Math.round(lp.percent_completed || 0);
            $scope.nextLevelName = (lp.next_level || {}).level || '';
            $scope.statusLoaded = true;
        }).catch(function() {
            $scope.levelName = 'Iniciante';
            $scope.statusLoaded = true;
        });

        ApiService.getActionLogs(playerId, 60).then(function(logs) {
            $scope.streak = calculateStreak(logs);
            $scope.streakAtRisk = checkStreakRisk(logs);
        }).catch(function() {});

        loadNextLesson();
        loadCommunityPreview();
    } else {
        $scope.nextLessonLoading = false;
    }

    function calculateStreak(logs) {
        if (!logs || logs.length === 0) return 0;
        var days = {};
        logs.forEach(function(log) {
            var d = new Date(log.time);
            days[d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate()] = true;
        });
        var check = new Date();
        var todayKey = check.getFullYear() + '-' + (check.getMonth() + 1) + '-' + check.getDate();
        if (!days[todayKey]) check.setDate(check.getDate() - 1);
        var streak = 0;
        while (true) {
            var key = check.getFullYear() + '-' + (check.getMonth() + 1) + '-' + check.getDate();
            if (days[key]) { streak++; check.setDate(check.getDate() - 1); } else break;
        }
        return streak;
    }

    function checkStreakRisk(logs) {
        if (!logs || logs.length === 0) return false;
        var now = new Date();
        var todayKey = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();
        var hasActivityToday = logs.some(function(log) {
            var d = new Date(log.time);
            var key = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
            return key === todayKey;
        });
        // Risco: sem atividade hoje depois das 20h
        return !hasActivityToday && now.getHours() >= 20;
    }

    // ─── Próxima lição da trilha ───────────────────────────────────────────────
    function loadNextLesson() {
        $scope.nextLessonLoading = true;
        ApiService.folderInside(null).then(function(data) {
            var items = data.items || [];
            var rootFolder = items.find(function(i) { return i.folder !== false && i.type === 'subject'; });
            if (!rootFolder) rootFolder = items.find(function(i) { return i.folder !== false; });
            if (!rootFolder) { $scope.nextLessonLoading = false; return; }

            return ApiService.folderProgress(rootFolder._id, playerId).then(function(data) {
                var modules = (data.items || [])
                    .filter(function(i) { return i.folder !== false; })
                    .sort(function(a, b) { return (a.position || 0) - (b.position || 0); });

                if (modules.length === 0) { $scope.nextLessonLoading = false; return; }

                // Verifica se toda a trilha está concluída
                var allDone = modules.every(function(m) { return (m.percent || 0) >= 100; });
                if (allDone) {
                    $scope.trailDone = true;
                    $scope.nextLessonLoading = false;
                    return;
                }

                // Primeiro módulo incompleto
                var incompleteModule = modules.find(function(m) { return (m.percent || 0) < 100; });
                if (!incompleteModule) { $scope.nextLessonLoading = false; return; }

                return ApiService.folderProgress(incompleteModule._id, playerId).then(function(lessonData) {
                    var lessons = (lessonData.items || [])
                        .filter(function(i) { return i.folder !== false; })
                        .sort(function(a, b) { return (a.position || 0) - (b.position || 0); });

                    var nextLesson = lessons.find(function(l) {
                        return l.is_unlocked !== false && (l.percent || 0) < 100;
                    });

                    if (nextLesson) {
                        var contentItems = nextLesson.items || [];
                        var firstContent = contentItems.length > 0 ? contentItems[0] : {};
                        $scope.nextLesson = {
                            _id: nextLesson._id,
                            title: nextLesson.title,
                            moduleName: incompleteModule.title,
                            contentType: firstContent.type || '',
                            contentId: firstContent.content || firstContent._id || ''
                        };
                    }
                    $scope.nextLessonLoading = false;
                });
            });
        }).catch(function() {
            $scope.nextLessonLoading = false;
        });
    }

    // ─── Preview da galeria ────────────────────────────────────────────────────
    function loadCommunityPreview() {
        ApiService.getGalleryPosts(playerId, 3, 0).then(function(posts) {
            $scope.communityPosts = posts.filter(function(p) { return !!p.image_url; }).slice(0, 3);
        }).catch(function() {});
    }

    // ─── Navegação ─────────────────────────────────────────────────────────────
    $scope.continueTrail = function() {
        if (!$scope.nextLesson) return;
        var l = $scope.nextLesson;
        if (l.contentType === 'quiz' && l.contentId) { $location.path('/quiz/' + l.contentId); return; }
        if (l.contentType === 'video' && l.contentId) { $location.path('/video/' + l.contentId); return; }
        if (l.contentType === 'mission' && l.contentId) { $location.path('/quiz/' + l.contentId); return; }
        if (l.contentType === 'chest' && l.contentId) { $location.path('/quiz/' + l.contentId); return; }
        $location.path('/trail');
    };

    $scope.goTrail   = function() { $location.path('/trail'); };
    $scope.goGallery = function() { $location.path('/gallery'); };
});
