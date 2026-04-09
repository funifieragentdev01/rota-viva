angular.module('rotaViva')

.controller('ReadingCtrl', function($scope, $http, $routeParams, $location, $timeout, $sce, AuthService, ApiService, SoundService, ThemeService) {
    var session = AuthService.getSession();
    var token = session.token;
    var baseUrl = CONFIG.API_URL;
    var readingId = $routeParams.readingId;
    var playerId = (session.player || {})._id;
    var theme = ThemeService.load(session.apiKey) || {};

    if (theme && theme.colors) ThemeService.apply(theme, false);

    $scope.loading = true;
    $scope.title = '';
    $scope.body = null;
    $scope.coverImage = null;
    $scope.estimatedTime = 3;
    $scope.completed = false;
    $scope.celebrating = false;
    $scope.readProgress = 0;
    $scope.canAdvance = false;
    $scope.themeColor = (theme.colors && theme.colors.primary) || '#FF9600';
    var folderContentId = null;
    var progressTimer = null;
    var totalReadSeconds = 0;

    // Lookup folder_content ID for logging (same pattern as video.js)
    $http.get(baseUrl + '/v3/database/folder_content?q=content:\'' + readingId + '\'', {
        headers: { 'Authorization': token }
    }).then(function(res) {
        var fcs = res.data || [];
        if (fcs.length > 0) {
            folderContentId = fcs[0]._id;
        } else {
            $http.get(baseUrl + '/v3/database/folder_content?q=_id:\'' + readingId + '\'', {
                headers: { 'Authorization': token }
            }).then(function(res2) {
                var fcs2 = res2.data || [];
                if (fcs2.length > 0) folderContentId = fcs2[0]._id;
            }).catch(function() {});
        }
    }).catch(function() {});

    function startReadingTimer() {
        // "Avançar" unlocks after 70% of estimated reading time
        var targetSeconds = Math.max(30, $scope.estimatedTime * 60 * 0.7);
        progressTimer = setInterval(function() {
            totalReadSeconds++;
            $scope.$apply(function() {
                $scope.readProgress = Math.min(100, Math.round((totalReadSeconds / targetSeconds) * 100));
                if ($scope.readProgress >= 100 && !$scope.canAdvance) {
                    $scope.canAdvance = true;
                }
            });
        }, 1000);

        // Also unlock when user scrolls to bottom of content
        var contentEl = document.querySelector('.reading-body');
        if (contentEl) {
            contentEl.addEventListener('scroll', function() {
                var distFromBottom = contentEl.scrollHeight - contentEl.scrollTop - contentEl.clientHeight;
                if (distFromBottom < 80 && !$scope.canAdvance) {
                    $scope.$apply(function() { $scope.canAdvance = true; });
                }
            }, { passive: true });
        }
        // Also watch window scroll for non-overflow cases
        window.addEventListener('scroll', function onScroll() {
            var distFromBottom = document.documentElement.scrollHeight - window.scrollY - window.innerHeight;
            if (distFromBottom < 80 && !$scope.canAdvance) {
                $scope.$apply(function() { $scope.canAdvance = true; });
                window.removeEventListener('scroll', onScroll);
            }
        }, { passive: true });
    }

    function init() {
        ApiService.dbGet('reading__c', readingId).then(function(data) {
            if (data && data.body) {
                $scope.title = data.title || 'Leitura';
                $scope.body = $sce.trustAsHtml(data.body || '');
                $scope.coverImage = data.cover_image || null;
                $scope.estimatedTime = data.estimated_time || 3;
                $scope.loading = false;
                $timeout(startReadingTimer, 300);
            } else {
                // Try folder_content fallback (may link to reading__c via content field)
                ApiService.dbGet('folder_content', readingId).then(function(fc) {
                    if (fc && fc.content) {
                        return ApiService.dbGet('reading__c', fc.content);
                    }
                    return null;
                }).then(function(r) {
                    if (r && r.body) {
                        $scope.title = r.title || 'Leitura';
                        $scope.body = $sce.trustAsHtml(r.body || '');
                        $scope.coverImage = r.cover_image || null;
                        $scope.estimatedTime = r.estimated_time || 3;
                        $timeout(startReadingTimer, 300);
                    }
                    $scope.loading = false;
                }).catch(function() { $scope.loading = false; });
            }
        }).catch(function() { $scope.loading = false; });
    }

    $scope.markDone = function() {
        if ($scope.completed) return;
        $scope.completed = true;
        $scope.celebrating = true;
        if (progressTimer) clearInterval(progressTimer);

        if (folderContentId && playerId) {
            ApiService.folderLog(folderContentId, playerId, 100).catch(function() {});
        }
        if (playerId) {
            ApiService.logAction('complete_lesson', playerId, {
                lesson_type: 'reading',
                lesson_id: readingId,
                score: 100
            }).catch(function() {});
        }

        SoundService.play('levelup');
        if (navigator.vibrate) navigator.vibrate([80, 50, 80]);

        if (typeof window.confetti === 'function') {
            window.confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.5 },
                colors: ['#FF9600', '#1a5632', '#FFC800', '#00CD9C']
            });
        }

        var el = document.createElement('div');
        el.className = 'xp-toast';
        el.textContent = '+10 favos';
        document.body.appendChild(el);
        $timeout(function() { if (el.parentNode) el.parentNode.removeChild(el); }, 1900);

        $timeout(function() { window.history.back(); }, 2500);
    };

    $scope.goBack = function() {
        if (progressTimer) clearInterval(progressTimer);
        window.history.back();
    };

    $scope.$on('$destroy', function() {
        if (progressTimer) clearInterval(progressTimer);
    });

    init();
});
