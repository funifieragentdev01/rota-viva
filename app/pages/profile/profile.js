angular.module('rotaViva')

.controller('ProfileCtrl', function($scope, $location, $timeout, AuthService, ApiService, ThemeService) {
    var session = AuthService.getSession();
    var player = session.player || {};
    var playerId = player._id;
    var theme = ThemeService.load(session.apiKey) || {};

    if (theme && theme.colors) ThemeService.apply(theme, false);

    $scope.theme = theme;
    $scope.playerName = player.name || 'Produtor';
    $scope.playerPhoto = (player.image && player.image.original && player.image.original.url) || player.photo || null;
    $scope.playerPoints = 0;
    $scope.playerStreak = 0;
    $scope.uploadingPhoto = false;
    $scope.editingName = false;
    $scope.editName = '';

    var route = session.route || {};
    var ROUTE_NAMES = { mel: 'Rota do Mel', pesca: 'Rota da Pesca' };
    var routeId = route._id || (route.profile === 'apicultor' ? 'mel' : null) || (route.profile === 'pescador' ? 'pesca' : null) || 'mel';
    $scope.routeName = ROUTE_NAMES[routeId] || 'Rota Viva';

    // ─── Stats ─────────────────────────────────────────────────────────────────
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
            var todayKey = check.getFullYear() + '-' + (check.getMonth() + 1) + '-' + check.getDate();
            if (!days[todayKey]) check.setDate(check.getDate() - 1);
            var streak = 0;
            while (true) {
                var key = check.getFullYear() + '-' + (check.getMonth() + 1) + '-' + check.getDate();
                if (days[key]) { streak++; check.setDate(check.getDate() - 1); } else break;
            }
            $scope.playerStreak = streak;
        }).catch(function() {});
    }

    // ─── Foto de perfil ────────────────────────────────────────────────────────
    function compressImage(file, callback) {
        var maxPx = 512;
        var reader = new FileReader();
        reader.onload = function(e) {
            var img = new Image();
            img.onload = function() {
                var size = Math.min(img.width, img.height, maxPx);
                var canvas = document.createElement('canvas');
                canvas.width = size; canvas.height = size;
                var sx = (img.width  - size) / 2;
                var sy = (img.height - size) / 2;
                canvas.getContext('2d').drawImage(img, sx, sy, size, size, 0, 0, size, size);
                callback(canvas.toDataURL('image/jpeg', 0.85));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    $scope.triggerPhotoUpload = function() {
        document.getElementById('profile-photo-input').click();
    };

    $scope.onPhotoSelected = function(inputEl) {
        var file = inputEl.files && inputEl.files[0];
        if (!file) return;
        $scope.$apply(function() { $scope.uploadingPhoto = true; });

        compressImage(file, function(dataUrl) {
            // compressImage é callback nativo → precisa de $apply para o preview
            $scope.$apply(function() { $scope.playerPhoto = dataUrl; });

            // $http retorna promise Angular → callbacks já estão no digest, sem $apply
            ApiService.uploadProfilePhoto(dataUrl, playerId).then(function(url) {
                if (url) {
                    $scope.playerPhoto = url;
                    var imgEntry = { url: url, size: 0, width: 0, height: 0, depth: 0 };
                    var imgObj = { small: imgEntry, medium: imgEntry, original: imgEntry };
                    return ApiService.updatePlayer(playerId, {
                        name: $scope.playerName,
                        image: imgObj
                    }).then(function() {
                        player.image = imgObj;
                        player.photo = url;
                        localStorage.setItem('rv_player', JSON.stringify(player));
                    });
                }
            }).catch(function() {
                // Upload falhou: preview local fica, mas não persiste no servidor
            }).finally(function() {
                $scope.uploadingPhoto = false; // já no digest — sem $apply
            });
        });
    };

    // ─── Editar nome ───────────────────────────────────────────────────────────
    $scope.startEditName = function() {
        $scope.editName = $scope.playerName;
        $scope.editingName = true;
        $timeout(function() {
            var el = document.getElementById('profile-name-input');
            if (el) el.focus();
        });
    };

    $scope.saveName = function() {
        var name = ($scope.editName || '').trim();
        if (!name) { $scope.editingName = false; return; }
        $scope.playerName = name;
        $scope.editingName = false;
        ApiService.updatePlayer(playerId, { name: name }).then(function() {
            player.name = name;
            localStorage.setItem('rv_player', JSON.stringify(player));
        }).catch(function() {});
    };

    $scope.cancelEditName = function() {
        $scope.editingName = false;
        $scope.editName = '';
    };

    // ─── Logout ────────────────────────────────────────────────────────────────
    $scope.logout = function() {
        AuthService.logout();
        $location.path('/login');
    };

    // ─── Navegação ─────────────────────────────────────────────────────────────
    $scope.goHome   = function() { $location.path('/dashboard'); };
    $scope.goTrail  = function() { $location.path('/trail'); };
    $scope.goGallery = function() { $location.path('/gallery'); };
});
