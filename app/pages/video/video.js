angular.module('rotaViva')

.controller('VideoCtrl', function($scope, $http, $routeParams, $location, $sce, AuthService, ApiService, ThemeService) {
    var session = AuthService.getSession();
    var token = session.token;
    var baseUrl = CONFIG.API_URL;
    var videoId = $routeParams.videoId;
    var playerId = (session.player || {})._id;
    var theme = ThemeService.load(session.apiKey) || {};

    if (theme && theme.colors) ThemeService.apply(theme, false);

    $scope.loading = true;
    $scope.title = '';
    $scope.embedUrl = null;
    $scope.completed = false;
    $scope.themeColor = (theme.colors && theme.colors.primary) || '#FF9600';
    var folderContentId = null;

    function setVideo(title, url) {
        $scope.title = title || 'Vídeo';
        $scope.rawEmbedUrl = toEmbedUrl(url);
        $scope.embedUrl = $sce.trustAsResourceUrl($scope.rawEmbedUrl);
        console.log('[Video] Embed URL:', $scope.rawEmbedUrl);
    }

    function toEmbedUrl(url) {
        if (!url) return '';
        var match = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
        if (match && match[1]) return 'https://www.youtube.com/embed/' + match[1] + '?rel=0';
        return url;
    }

    function init() {
        ApiService.dbGet('video__c', videoId).then(function(data) {
            if (data && data.url) {
                setVideo(data.title, data.url);
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
                console.error('[Video] No video data for:', videoId);
                $scope.loading = false;
            }
        }).catch(function() {
            console.error('[Video] Failed to load:', videoId);
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
        $scope.completed = true;
        if (folderContentId && playerId) {
            ApiService.folderLog(folderContentId, playerId, 100).then(function() {
                console.log('[Video] folder/log OK:', folderContentId);
            }).catch(function(err) {
                console.warn('[Video] folder/log error:', err);
            });
        }
        if (playerId) {
            ApiService.logAction('complete_lesson', playerId, {
                lesson_type: 'video',
                lesson_id: videoId,
                score: 100
            }).catch(function(err) {
                console.warn('[Video] action/log error:', err);
            });
        }
    };

    $scope.goBack = function() { window.history.back(); };

    init();
});
