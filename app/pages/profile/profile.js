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
    $scope.playerCoins = 0;
    $scope.playerStreak = 0;
    $scope.playerLevel = 1;
    $scope.playerLevelName = null;
    $scope.pointsToNextLevel = null;
    $scope.uploadingPhoto = false;
    $scope.editingName = false;
    $scope.editName = '';
    $scope.showModal = null;
    $scope.achievements = [];
    $scope.achievementsLoaded = false;
    $scope.selectedChallenge = null;
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
            _loadPassaporte(fresh.extra || {}, fresh);
            _updateShareUrl(fresh.extra || {}, true); // canSave=true: tem o player fresco completo
            localStorage.setItem('rv_player', JSON.stringify(fresh));
        }).catch(function() {
            _loadPassaporte(player.extra || {}, null);
            _updateShareUrl(player.extra || {}, false); // canSave=false: não tem dados suficientes
        });
    } else {
        _loadPassaporte(player.extra || {}, null);
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
    var CARD_TITLES = { mel: 'Cartão do Apicultor', pesca: 'Cartão do Pescador' };
    var routeId = route._id || (route.profile === 'apicultor' ? 'mel' : null) || (route.profile === 'pescador' ? 'pesca' : null) || 'mel';
    $scope.routeName = ROUTE_NAMES[routeId] || 'Rota Viva';
    $scope.cardTitle = CARD_TITLES[routeId] || 'Cartão do Produtor';
    $scope.isPesca = (routeId === 'pesca');
    $scope.routeThemeClass = 'card-theme-' + routeId;  // card-theme-mel | card-theme-pesca
    $scope.totalEmitidos = 0;

    ApiService.countEmitidos(routeId).then(function(count) {
        $scope.totalEmitidos = count;
    }).catch(angular.noop);

    // ─── Passaporte Digital ────────────────────────────────────────────────────
    $scope.passaporte = {
        caf: '', rgp: '', pronaf: '', cooperativa: '', cooperativa_nome: '', municipio: '',
        phone: player.phone || '', email: player.email || '', lat: null, lng: null
    };
    $scope.passaporteEmitido = !!(player.extra && player.extra.passaporte_emitido_em);
    $scope.passaporteEmitidoEm = '';
    $scope.passaporteIncomplete = false;
    $scope.passaporteModal = false;
    $scope.passaporteModalSlide = 1;
    $scope.passaporteFlipped = false;
    $scope.savingPassaporte = false;
    $scope.gettingLocation = false;
    $scope.programas = [];
    $scope.contatoEnviado    = {};   // programaId -> true (enviado nesta sessão)
    $scope.contatoSolicitando = {};  // programaId -> true (loading)
    $scope.contatoSuccess    = null; // nome do programa confirmado

    function _maskCpf(cpf) {
        if (!cpf) return '';
        cpf = String(cpf).replace(/\D/g, '');
        if (cpf.length !== 11) return cpf;
        return '***.' + cpf.substr(3, 3) + '.' + cpf.substr(6, 3) + '-**';
    }
    $scope.passaporteCpf = _maskCpf(playerId);

    // Converte valor salvo (boolean/null ou string legada) para o valor do radio button
    function _boolLoad(v) {
        if (v === true  || v === 'sim')     return true;
        if (v === false || v === 'nao')     return false;
        if (v === null  || v === 'nao_sei') return null;
        return '';
    }

    // Verifica se um campo booleano foi respondido (qualquer opção selecionada)
    function _isSet(v) { return v !== '' && v !== undefined; }

    function _fmtPassaporteOpt(val) {
        if (val === true  || val === 'sim')     return 'Sim';
        if (val === false || val === 'nao')     return 'Não';
        if (val === null  || val === 'nao_sei') return 'Não sei';
        return val || '—';
    }
    $scope.fmtPassaporteOpt = _fmtPassaporteOpt;

    function _loadPassaporte(extra, freshP) {
        $scope.passaporte = {
            caf:              extra.passaporte_caf              || '',
            rgp:              _boolLoad(extra.passaporte_rgp),
            pronaf:           _boolLoad(extra.passaporte_pronaf),
            cooperativa:      _boolLoad(extra.passaporte_cooperativa),
            cooperativa_nome: extra.passaporte_cooperativa_nome || '',
            municipio:        extra.passaporte_municipio        || '',
            phone: (freshP && freshP.phone) || player.phone || '',
            email: (freshP && freshP.email) || player.email || '',
            lat: extra.passaporte_lat || null,
            lng: extra.passaporte_lng || null
        };
        $scope.passaporteEmitido = !!extra.passaporte_emitido_em;
        if (extra.passaporte_emitido_em) {
            $scope.passaporteEmitidoEm = new Date(extra.passaporte_emitido_em).toLocaleDateString('pt-BR');
        }
        _checkPassaporteIncomplete();
        if ($scope.passaporteEmitido) {
            $timeout(function() { _renderPassaporteQr(); });
        }
    }

    function _renderPassaporteQr() {
        var el = document.getElementById('passport-qr');
        if (!el || typeof QRCode === 'undefined') return;
        el.innerHTML = '';
        var ref = (freshPlayer.extra && freshPlayer.extra.ref) || playerId || '';
        if (!ref) return;
        new QRCode(el, {
            text: ref,
            width: 96,
            height: 96,
            colorDark: '#1A1A1A',
            colorLight: '#FFFFFF',
            correctLevel: QRCode.CorrectLevel.M
        });
    }

    function _checkPassaporteIncomplete() {
        if (!$scope.passaporteEmitido) { $scope.passaporteIncomplete = false; return; }
        var p = $scope.passaporte;
        var required = [p.pronaf, p.cooperativa, p.municipio];
        if ($scope.isPesca) required.push(p.rgp); else required.push(p.caf);
        // _isSet trata booleans corretamente: false === "Não" (preenchido), '' === não respondido
        $scope.passaporteIncomplete = required.some(function(v) { return !_isSet(v); });
    }

    $scope.openPassaporteModal = function() {
        $scope.passaporteModal = true;
        $scope.passaporteModalSlide = 1;
    };

    $scope.openPassaporteEdit = function() {
        $scope.passaporteModal = true;
        $scope.passaporteModalSlide = 2;
    };

    $scope.closePassaporteModal = function() {
        $scope.passaporteModal = false;
    };

    $scope.passaporteModalNext = function() {
        $scope.passaporteModalSlide = 2;
    };

    $scope.passaporteModalBack = function() {
        $scope.passaporteModalSlide = 1;
    };

    $scope.togglePassaporteFlip = function() {
        $scope.passaporteFlipped = !$scope.passaporteFlipped;
    };

    $scope.onPassaporteChange = function() {
        if ($scope.passaporte.cooperativa !== true) {
            $scope.passaporte.cooperativa_nome = '';
        }
    };

    $scope.getLocation = function() {
        if (!navigator.geolocation || $scope.gettingLocation) return;
        $scope.gettingLocation = true;
        navigator.geolocation.getCurrentPosition(function(pos) {
            $scope.$apply(function() {
                $scope.passaporte.lat = pos.coords.latitude.toFixed(5);
                $scope.passaporte.lng = pos.coords.longitude.toFixed(5);
                $scope.gettingLocation = false;
            });
        }, function() {
            $scope.$apply(function() { $scope.gettingLocation = false; });
        });
    };

    $scope.emitirPassaporte = function() {
        if ($scope.savingPassaporte) return;
        $scope.savingPassaporte = true;
        var p = $scope.passaporte;
        var extraUpdate = angular.extend({}, freshPlayer.extra || {}, {
            passaporte_caf:              p.caf,
            passaporte_rgp:              _boolLoad(p.rgp),        // garante boolean/null mesmo se vier string
            passaporte_pronaf:           _boolLoad(p.pronaf),
            passaporte_cooperativa:      _boolLoad(p.cooperativa),
            passaporte_cooperativa_nome: p.cooperativa_nome,
            passaporte_municipio:        p.municipio
        });
        if (!extraUpdate.passaporte_emitido_em) {
            extraUpdate.passaporte_emitido_em = new Date().toISOString();
        }
        if (p.lat) extraUpdate.passaporte_lat = p.lat;
        if (p.lng) extraUpdate.passaporte_lng = p.lng;
        var playerUpdate = angular.extend({}, freshPlayer, { extra: extraUpdate });
        ApiService.updatePlayer(playerId, playerUpdate)
            .then(function() {
                freshPlayer = playerUpdate;
                localStorage.setItem('rv_player', JSON.stringify(freshPlayer));
                $scope.passaporteEmitido = true;
                $scope.passaporteEmitidoEm = new Date(extraUpdate.passaporte_emitido_em).toLocaleDateString('pt-BR');
                $scope.passaporte.phone = freshPlayer.phone || p.phone || '';
                $scope.passaporte.email = freshPlayer.email || p.email || '';
                $scope.passaporteModal = false;
                _checkPassaporteIncomplete();
                ApiService.logAction('complete_passport', playerId, { route: routeId });
                $timeout(function() { _renderPassaporteQr(); });
            })
            .catch(function() {})
            .finally(function() { $scope.savingPassaporte = false; });
    };

    // Carrega programas da rota e verifica contatos já enviados
    ApiService.getProgramas().then(function(list) {
        $scope.programas = list;
        // Marca programas com contato já aberto (evita duplicatas entre sessões)
        if (playerId && list.length) {
            list.forEach(function(prog) {
                ApiService.getContatoPendente(playerId, prog._id).then(function(c) {
                    if (c) $scope.contatoEnviado[prog._id] = true;
                }).catch(angular.noop);
            });
        }
    }).catch(function() {});

    // ── CTA: Falar com agente ─────────────────────────────────────────────────
    $scope.solicitarContato = function(prog) {
        if ($scope.contatoEnviado[prog._id] || $scope.contatoSolicitando[prog._id]) return;
        $scope.contatoSolicitando[prog._id] = true;

        var payload = {
            player:         playerId,
            player_name:    $scope.playerName || '',
            phone:          ($scope.passaporte.phone || '').replace(/\D/g, ''),
            municipio:      $scope.passaporte.municipio || '',
            route:          routeId,
            programa_id:    prog._id,
            programa_title: prog.title,
            status:         'pendente',
            created:        new Date().toISOString()
        };

        ApiService.solicitarContato(payload).then(function() {
            $scope.contatoEnviado[prog._id]    = true;
            $scope.contatoSolicitando[prog._id] = false;
            $scope.contatoSuccess = prog.title;
            $timeout(function() { $scope.contatoSuccess = null; }, 5000);
        }).catch(function() {
            $scope.contatoSolicitando[prog._id] = false;
        });
    };

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

    $scope.shareCard = function() {
        var title = $scope.cardTitle || 'Cartão do Produtor';
        var text = 'Este é o meu ' + title + ', emitido pelo MIDR através do programa Rota Viva! Participe você também:';
        if (navigator.share) {
            navigator.share({ title: title, text: text, url: shareUrl }).catch(function() {});
        } else {
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
            $scope.playerLevelName = (lp.level || {}).name || null;
            var nextLvl = lp.nextLevel || lp.next_level || null;
            if (nextLvl && nextLvl.points) {
                var diff = Math.max(0, nextLvl.points - $scope.playerPoints);
                $scope.pointsToNextLevel = diff > 0 ? diff : null;
            } else {
                $scope.pointsToNextLevel = null;
            }
            var wallets = status.wallets || status.virtual_currencies || [];
            wallets.forEach(function(w) {
                if (w.virtualCurrency === 'cristais' || (w.name && w.name.toLowerCase().indexOf('cristal') >= 0)) {
                    $scope.playerCoins = Math.floor(w.balance || 0);
                }
            });

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
                        _id:         id,
                        name:        def.challenge || def.title || id,
                        description: def.description || '',
                        image:       def.badgeUrl || null,
                        earned:      true,
                        count:       earned[id]
                    });
                });

                // 2. Challenges EM ANDAMENTO: player.challenge_progress (array)
                var inProgress = status.challenge_progress || [];
                var inProgressIds = {};
                inProgress.forEach(function(p) {
                    var alreadyEarned = !!earned[p._id || p.challenge];
                    if (!alreadyEarned) {
                        var id = p._id || p.challenge;
                        inProgressIds[id] = true;
                        var def = catalog[id] || {};
                        list.push({
                            _id:         id,
                            name:        p.name || def.challenge || 'Conquista',
                            description: def.description || '',
                            image:       p.image || def.badgeUrl || null,
                            earned:      false,
                            percent:     p.percent_completed || 0
                        });
                    }
                });

                // 3. Challenges NÃO INICIADOS: restante do catálogo
                allChallenges.forEach(function(c) {
                    if (!earned[c._id] && !inProgressIds[c._id]) {
                        list.push({
                            _id:         c._id,
                            name:        c.challenge || c.title || c._id,
                            description: c.description || '',
                            image:       c.badgeUrl || null,
                            earned:      false,
                            percent:     0
                        });
                    }
                });

                // Ganhos primeiro, depois em progresso, depois não iniciados
                list.sort(function(a, b) {
                    var aW = a.earned ? 2 : (a.percent > 0 ? 1 : 0);
                    var bW = b.earned ? 2 : (b.percent > 0 ? 1 : 0);
                    return bW - aW;
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
    $scope.closeModal = function() {
        $scope.showModal = null;
    };

    // ─── Challenge detail ──────────────────────────────────────────────────────
    $scope.openChallengeDetail = function(badge) {
        $scope.selectedChallenge = badge;
    };

    $scope.closeChallengeDetail = function() {
        $scope.selectedChallenge = null;
    };

    // ─── Foto de perfil ────────────────────────────────────────────────────────
    function compressImage(file, callback) {
        var maxPx = 512;
        var reader = new FileReader();
        reader.onload = function(e) {
            var img = new Image();
            img.onload = function() {
                // Center-crop to square using the full image, then scale down to maxPx.
                // Bug fix: previously cropped srcSize=512px from the original large photo
                // (appeared zoomed in). Now srcSize = full smaller dimension of the photo.
                var srcSize = Math.min(img.width, img.height);
                var sx = (img.width  - srcSize) / 2;
                var sy = (img.height - srcSize) / 2;
                var canvas = document.createElement('canvas');
                canvas.width = maxPx; canvas.height = maxPx;
                canvas.getContext('2d').drawImage(img, sx, sy, srcSize, srcSize, 0, 0, maxPx, maxPx);
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
