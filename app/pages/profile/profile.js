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
    $scope.playerLevel = 1;
    $scope.uploadingPhoto = false;
    $scope.editingName = false;
    $scope.editName = '';
    $scope.showModal = null;
    $scope.achievements = [];
    $scope.achievementsLoaded = false;

    var route = session.route || {};
    var ROUTE_NAMES = { mel: 'Rota do Mel', pesca: 'Rota da Pesca' };
    var routeId = route._id || (route.profile === 'apicultor' ? 'mel' : null) || (route.profile === 'pescador' ? 'pesca' : null) || 'mel';
    $scope.routeName = ROUTE_NAMES[routeId] || 'Rota Viva';

    // ─── Stats + conquistas ────────────────────────────────────────────────────
    if (playerId) {
        // Carrega status e catálogo de challenges em paralelo
        var statusPromise = ApiService.getPlayerStatus(playerId);
        var challengesPromise = ApiService.getChallenges();

        statusPromise.then(function(status) {
            $scope.playerPoints = Math.floor(status.total_points || 0);
            var lp = status.level_progress || {};
            $scope.playerLevel = (lp.level || {}).position || 1;

            // Aguarda catálogo de challenges para cruzar com earned + in-progress
            challengesPromise.then(function(allChallenges) {
                // Índice por _id para lookup rápido
                var catalog = {};
                allChallenges.forEach(function(c) { catalog[c._id] = c; });

                var list = [];

                // 1. Badges GANHOS: player.challenges = { challengeId: count }
                var earned = status.challenges || {};
                Object.keys(earned).forEach(function(id) {
                    var def = catalog[id] || {};
                    list.push({
                        _id:    id,
                        name:   def.challenge || def.title || id,
                        image:  def.badgeUrl || null,
                        earned: true,
                        count:  earned[id]
                    });
                });

                // 2. Challenges EM ANDAMENTO: player.challenge_progress (array)
                var inProgress = status.challenge_progress || [];
                inProgress.forEach(function(p) {
                    // Só mostra se não está já na lista de ganhos
                    var alreadyEarned = !!earned[p._id || p.challenge];
                    if (!alreadyEarned) {
                        var def = catalog[p._id || p.challenge] || {};
                        list.push({
                            _id:     p._id || p.challenge,
                            name:    p.name || def.challenge || 'Conquista',
                            image:   p.image || def.badgeUrl || null,
                            earned:  false,
                            percent: p.percent_completed || 0
                        });
                    }
                });

                // Ganhos primeiro, depois em progresso
                list.sort(function(a, b) {
                    return (b.earned ? 1 : 0) - (a.earned ? 1 : 0);
                });

                $scope.achievements = list;
                $scope.achievementsLoaded = true;
            }).catch(function() {
                $scope.achievementsLoaded = true;
            });
        }).catch(function() {
            $scope.achievementsLoaded = true;
        });

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

    // ─── Modal ─────────────────────────────────────────────────────────────────
    // Função no controller evita o bug de child scope do ng-if
    $scope.closeModal = function() {
        $scope.showModal = null;
    };

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
            $scope.$apply(function() { $scope.playerPhoto = dataUrl; });

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
            }).finally(function() {
                $scope.uploadingPhoto = false;
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

    // ─── Excluir conta ─────────────────────────────────────────────────────────
    $scope.deleteAccount = function() {
        $scope.showModal = 'delete-confirm';
    };

    $scope.confirmDeleteAccount = function() {
        $scope.showModal = null;
        $scope.deletingAccount = true;
        AuthService.deleteAccount(playerId).then(function() {
            $location.path('/login');
        }).catch(function() {
            $scope.deletingAccount = false;
            alert('Erro ao excluir conta. Tente novamente.');
        });
    };
});
