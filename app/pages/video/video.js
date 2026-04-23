angular.module('rotaViva')

.controller('VideoCtrl', function($scope, $http, $routeParams, $location, $timeout, $sce, AuthService, ApiService, SoundService, ThemeService) {
    var session = AuthService.getSession();
    var token = session.token;
    var baseUrl = CONFIG.API_URL;
    var videoId = $routeParams.videoId;
    var playerId = (session.player || {})._id;
    var subjectId = $location.search().subject || null; // parent subject folder (for cache bust)
    var theme = ThemeService.load(session.apiKey) || {};

    if (theme && theme.colors) ThemeService.apply(theme, false);

    $scope.loading = true;
    $scope.title = '';
    $scope.embedUrl = null;
    $scope.completed = false;
    $scope.celebrating = false;
    $scope.videoReady = false;   // true after 90% watched
    $scope.themeColor = (theme.colors && theme.colors.primary) || '#FF9600';
    var folderContentId = null;
    var ytPlayer = null;
    var progressInterval = null;

    function detectSource(url, source) {
        if (source && source !== 'unknown') return source;
        if (!url) return 'direct';
        if (/vimeo\.com/.test(url)) return 'vimeo';
        if (/youtu\.be|youtube\.com/.test(url)) return 'youtube';
        return 'direct';
    }

    function setVideo(title, url, source) {
        $scope.title = title || 'Vídeo';
        var src = detectSource(url, source);
        $scope.videoSource = src;

        if (src === 'youtube') {
            var yid = extractYouTubeId(url);
            $scope.rawVideoId = yid;
            $scope.isPortrait = false;
            $scope.embedUrl = $sce.trustAsResourceUrl(
                'https://www.youtube.com/embed/' + yid + '?rel=0&enablejsapi=1&origin=' + encodeURIComponent(window.location.origin)
            );
            initYouTubePlayer(yid);
        } else if (src === 'vimeo') {
            var vid = extractVimeoId(url);
            $scope.isPortrait = true;
            $scope.embedUrl = $sce.trustAsResourceUrl(
                'https://player.vimeo.com/video/' + vid + '?portrait=0&title=0&byline=0'
            );
            initVimeoPlayer();
        } else {
            $scope.isPortrait = false;
            $scope.embedUrl = $sce.trustAsResourceUrl(url);
            $scope.videoReady = true;
        }
    }

    function extractYouTubeId(url) {
        if (!url) return '';
        var m = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
        return m ? m[1] : '';
    }

    function extractVimeoId(url) {
        if (!url) return '';
        var m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
        return m ? m[1] : '';
    }

    function initVimeoPlayer() {
        function tryAttach() {
            var iframe = document.querySelector('.video-responsive iframe');
            if (!iframe || !window.Vimeo || !window.Vimeo.Player) {
                $timeout(tryAttach, 400);
                return;
            }
            var player = new window.Vimeo.Player(iframe);
            player.on('timeupdate', function(data) {
                if (!$scope.videoReady && data.percent >= 0.9) {
                    $scope.$apply(function() { $scope.videoReady = true; });
                }
            });
        }

        if (!document.getElementById('vimeo-player-api')) {
            var tag = document.createElement('script');
            tag.id = 'vimeo-player-api';
            tag.src = 'https://player.vimeo.com/api/player.js';
            tag.onload = function() { $timeout(tryAttach, 400); };
            document.head.appendChild(tag);
        } else {
            $timeout(tryAttach, 500);
        }
    }

    function initYouTubePlayer(videoId) {
        function createPlayer() {
            if (!window.YT || !window.YT.Player) return;
            var iframe = document.querySelector('.video-responsive iframe');
            if (!iframe) {
                $timeout(createPlayer, 300);
                return;
            }
            ytPlayer = new window.YT.Player(iframe, {
                events: {
                    onStateChange: function(e) {
                        // State 1 = playing
                        if (e.data === 1) startProgressCheck();
                        else stopProgressCheck();
                    }
                }
            });
        }

        if (window.YT && window.YT.Player) {
            $timeout(createPlayer, 500);
        } else {
            // Load IFrame API if not already loading
            if (!document.getElementById('yt-iframe-api')) {
                var tag = document.createElement('script');
                tag.id = 'yt-iframe-api';
                tag.src = 'https://www.youtube.com/iframe_api';
                document.head.appendChild(tag);
            }
            window.onYouTubeIframeAPIReady = function() {
                $timeout(createPlayer, 500);
            };
        }
    }

    function startProgressCheck() {
        stopProgressCheck();
        progressInterval = setInterval(function() {
            if (!ytPlayer || typeof ytPlayer.getCurrentTime !== 'function') return;
            var current = ytPlayer.getCurrentTime();
            var duration = ytPlayer.getDuration();
            if (duration > 0 && current / duration >= 0.9) {
                $scope.$apply(function() { $scope.videoReady = true; });
                stopProgressCheck();
            }
        }, 2000);
    }

    function stopProgressCheck() {
        if (progressInterval) { clearInterval(progressInterval); progressInterval = null; }
    }

    $scope.$on('$destroy', function() { stopProgressCheck(); });

    function init() {
        ApiService.dbGet('video__c', videoId).then(function(data) {
            if (data && data.url) {
                setVideo(data.title, data.url, data.source);
                $scope.loading = false;
            } else {
                loadFromFolderContent();
            }
        }).catch(function() {
            loadFromFolderContent();
        });
    }

    function loadFromFolderContent() {
        ApiService.dbGet('folder_content', videoId).then(function(fc) {
            if (fc && fc.extra && fc.extra.url) {
                setVideo(fc.title, fc.extra.url);
                $scope.loading = false;
            } else if (fc && fc.content) {
                ApiService.dbGet('video__c', fc.content).then(function(v) {
                    if (v && v.url) setVideo(v.title || fc.title, v.url);
                    $scope.loading = false;
                }).catch(function() { $scope.loading = false; });
            } else {
                $scope.loading = false;
            }
        }).catch(function() {
            $scope.loading = false;
        });
    }

    $http.get(baseUrl + '/v3/database/folder_content?q=content:\'' + videoId + '\'', {
        headers: { 'Authorization': token }
    }).then(function(res) {
        var fcs = res.data || [];
        if (fcs.length > 0) {
            folderContentId = fcs[0]._id;
        } else {
            $http.get(baseUrl + '/v3/database/folder_content?q=_id:\'' + videoId + '\'', {
                headers: { 'Authorization': token }
            }).then(function(res2) {
                var fcs2 = res2.data || [];
                if (fcs2.length > 0) folderContentId = fcs2[0]._id;
            }).catch(function() {});
        }
    }).catch(function() {});

    $scope.markDone = function() {
        if ($scope.completed) return;
        $scope.completed = true;
        $scope.celebrating = true;

        // Registrar conclusão
        if (folderContentId && playerId) {
            ApiService.folderLog(folderContentId, playerId, 100).catch(function(err) {
                console.warn('[Video] folder/log error:', err);
            });
        }
        if (playerId) {
            ApiService.logAction('complete_lesson', playerId, {
                lesson_type: 'video',
                lesson_id: videoId,
                score: 100
            }).catch(function() {});
        }

        // Invalida cache da trilha para refletir progresso ao voltar
        if (subjectId) {
            try { localStorage.removeItem('rv_trail_cache_' + playerId + '_' + subjectId); } catch(e) {}
        }

        // Celebração igual ao quiz
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

        // Toast XP
        var el = document.createElement('div');
        el.className = 'xp-toast';
        el.textContent = '+10 favos';
        document.body.appendChild(el);
        $timeout(function() { if (el.parentNode) el.parentNode.removeChild(el); }, 1900);

        // Volta para a trilha após celebração
        $timeout(function() {
            window.history.back();
        }, 2500);
    };

    $scope.goBack = function() { window.history.back(); };

    init();
});
