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
    $scope.legalTexts = { terms: null, privacy: null };

    // freshPlayer guarda o objeto completo mais recente do servidor (necessário para updatePlayer correto)
    var freshPlayer = angular.copy(player);

    // Refresh player data on load to pick up photo changes made in previous sessions
    if (playerId) {
        ApiService.getPlayer(playerId).then(function(fresh) {
            if (!fresh) return;
            freshPlayer = fresh;
            var freshPhoto = (fresh.image && fresh.image.original && fresh.image.original.url) || fresh.photo || null;
            if (freshPhoto) $scope.playerPhoto = freshPhoto;
            if (fresh.name) $scope.playerName = fresh.name;
            _loadPassaporte(fresh.extra || {});
            _updateShareUrl(fresh.extra || {}, true); // canSave=true: tem o player fresco completo
            localStorage.setItem('rv_player', JSON.stringify(fresh));
        }).catch(function() {
            _loadPassaporte(player.extra || {});
            _updateShareUrl(player.extra || {}, false); // canSave=false: não tem dados suficientes
        });
    } else {
        _loadPassaporte(player.extra || {});
    }

    // Load legal texts
    ApiService.getLegal('terms').then(function(doc) {
        if (doc) $scope.legalTexts.terms = doc;
    }).catch(function() {});
    ApiService.getLegal('privacy').then(function(doc) {
        if (doc) $scope.legalTexts.privacy = doc;
    }).catch(function() {});

    var route = session.route || {};
    var ROUTE_NAMES = { mel: 'Rota do Mel', pesca: 'Rota da Pesca' };
    var routeId = route._id || (route.profile === 'apicultor' ? 'mel' : null) || (route.profile === 'pescador' ? 'pesca' : null) || 'mel';
    $scope.routeName = ROUTE_NAMES[routeId] || 'Rota Viva';
    $scope.isPesca = (routeId === 'pesca');

    // ─── Passaporte Digital ────────────────────────────────────────────────────
    $scope.passaporte = {
        caf: '', rgp: '', pronaf: '', cooperativa: '', cooperativa_nome: '', municipio: ''
    };
    $scope.passaporteComplete = false;
    $scope.savingPassaporte = false;
    $scope.passaporteSaved = false;
    $scope.programas = [];

    function _loadPassaporte(extra) {
        $scope.passaporte = {
            caf:              extra.passaporte_caf              || '',
            rgp:              extra.passaporte_rgp              || '',
            pronaf:           extra.passaporte_pronaf           || '',
            cooperativa:      extra.passaporte_cooperativa      || '',
            cooperativa_nome: extra.passaporte_cooperativa_nome || '',
            municipio:        extra.passaporte_municipio        || ''
        };
        _checkPassaporteComplete();
    }

    function _checkPassaporteComplete() {
        var p = $scope.passaporte;
        var baseComplete = p.pronaf && p.cooperativa && p.municipio;
        var melComplete  = p.caf;
        var pescaComplete = p.rgp;
        $scope.passaporteComplete = !!(baseComplete && ($scope.isPesca ? pescaComplete : melComplete));
    }

    $scope.onPassaporteChange = function() {
        _checkPassaporteComplete();
        // Limpa nome da cooperativa se mudou para Não
        if ($scope.passaporte.cooperativa !== 'sim') {
            $scope.passaporte.cooperativa_nome = '';
        }
    };

    $scope.savePassaporte = function() {
        if ($scope.savingPassaporte) return;
        $scope.savingPassaporte = true;
        $scope.passaporteSaved = false;

        var p = $scope.passaporte;
        var extraUpdate = angular.extend({}, freshPlayer.extra || {}, {
            passaporte_caf:              p.caf,
            passaporte_rgp:              p.rgp,
            passaporte_pronaf:           p.pronaf,
            passaporte_cooperativa:      p.cooperativa,
            passaporte_cooperativa_nome: p.cooperativa_nome,
            passaporte_municipio:        p.municipio
        });
        // Envia o player completo — POST /v3/player faz replace total
        var playerUpdate = angular.extend({}, freshPlayer, { extra: extraUpdate });

        ApiService.updatePlayer(playerId, playerUpdate)
            .then(function() {
                freshPlayer = playerUpdate;
                localStorage.setItem('rv_player', JSON.stringify(playerUpdate));
                _checkPassaporteComplete();
                $scope.passaporteSaved = true;
                // Recompensa se acabou de completar
                if ($scope.passaporteComplete) {
                    ApiService.logAction('passaporte_completo', playerId, { route: routeId });
                }
                $timeout(function() { $scope.passaporteSaved = false; }, 3000);
            })
            .catch(function() {})
            .finally(function() { $scope.savingPassaporte = false; });
    };

    // Carrega programas da rota
    ApiService.getProgramas().then(function(list) {
        $scope.programas = list;
    }).catch(function() {});

    // ─── Compartilhar / Convite ────────────────────────────────────────────────
    $scope.referralCount = 0;
    $scope.shareSuccess = false;

    var appBase = window.location.origin + window.location.pathname;
    var shareUrl = appBase + '#/' + routeId;

    function _updateShareUrl(extra, canSave) {
        var myRef = (extra && extra.ref) || null;

        if (!myRef && canSave) {
            // Usuário criado antes da trigger ter o campo ref — gera agora e salva
            myRef = Math.random().toString(36).substr(2, 8).toUpperCase();
            var extraWithRef = angular.extend({}, freshPlayer.extra || {}, { ref: myRef });
            var playerWithRef = angular.extend({}, freshPlayer, { extra: extraWithRef });
            ApiService.updatePlayer(playerId, playerWithRef).then(function() {
                freshPlayer = playerWithRef;
                localStorage.setItem('rv_player', JSON.stringify(freshPlayer));
            }).catch(function() {});
        }

        shareUrl = myRef
            ? (appBase + '#/' + routeId + '?ref=' + myRef)
            : (appBase + '#/' + routeId);

        if (myRef) {
            ApiService.getReferralCount(myRef).then(function(count) {
                $scope.referralCount = count;
            }).catch(function() {});
        }
    }

    $scope.shareApp = function() {
        var text = 'Estou na ' + $scope.routeName + '! É gratuito e funciona no celular. Vem aprender comigo:';
        if (navigator.share) {
            navigator.share({ title: 'Rota Viva', text: text, url: shareUrl })
                .catch(function() {});
        } else {
            // Fallback: copia link
            _copyToClipboard(shareUrl);
            $scope.shareSuccess = true;
            $timeout(function() { $scope.shareSuccess = false; }, 3000);
        }
    };

    function _copyToClipboard(text) {
        var el = document.createElement('textarea');
        el.value = text;
        el.style.position = 'fixed';
        el.style.opacity = '0';
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
    }

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
                    var playerWithPhoto = angular.extend({}, freshPlayer, {
                        name: $scope.playerName,
                        image: imgObj
                    });
                    return ApiService.updatePlayer(playerId, playerWithPhoto).then(function() {
                        freshPlayer = playerWithPhoto;
                        localStorage.setItem('rv_player', JSON.stringify(freshPlayer));
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
        var playerWithName = angular.extend({}, freshPlayer, { name: name });
        ApiService.updatePlayer(playerId, playerWithName).then(function() {
            freshPlayer = playerWithName;
            localStorage.setItem('rv_player', JSON.stringify(freshPlayer));
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
