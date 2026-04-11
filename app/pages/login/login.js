angular.module('rotaViva')

.controller('LoginCtrl', function($scope, $location, ApiService, AuthService, ThemeService) {
    $scope.form = { cpf: '', password: '' };
    $scope.error = '';
    $scope.submitting = false;

    var preTheme = ThemeService.getPreTheme();
    $scope.preTheme = preTheme;
    $scope.welcomeText = preTheme ? ('Bem-vindo à ' + (preTheme.title || 'Rota Viva')) : 'Entrar';

    var routeId = preTheme ? preTheme.routeId : null;
    if (!routeId && preTheme && preTheme.profile) {
        if (preTheme.profile === 'apicultor') routeId = 'mel';
        if (preTheme.profile === 'pescador') routeId = 'pesca';
    }
    if (!routeId && preTheme && preTheme.title) {
        var t = preTheme.title.toLowerCase();
        if (t.indexOf('mel') >= 0 || t.indexOf('colmeia') >= 0) routeId = 'mel';
        if (t.indexOf('pesca') >= 0 || t.indexOf('rio') >= 0) routeId = 'pesca';
    }
    if (!routeId) {
        var session = AuthService.getSession();
        if (session && session.route && session.route._id) routeId = session.route._id;
    }
    if (!routeId) {
        try {
            var storedRoute = JSON.parse(localStorage.getItem('rv_route') || '{}');
            if (storedRoute && storedRoute._id) routeId = storedRoute._id;
        } catch(e) {}
    }

    var ROUTE_CHARS = {
        mel: 'img/characters/mel/front/abelha.png',
        pesca: 'img/characters/pesca/front/peixe.png'
    };
    var ROUTE_DISPLAY_NAMES = {
        mel: 'Rota do Mel',
        pesca: 'Rota da Pesca'
    };

    $scope.routeCharImg = routeId ? ROUTE_CHARS[routeId] : null;
    $scope.routeTitle = routeId ? ROUTE_DISPLAY_NAMES[routeId] : 'Rota Viva';

    $scope.login = function() {
        $scope.error = '';

        if (!$scope.form.cpf || !$scope.form.password) {
            $scope.error = 'Preencha CPF e senha.';
            return;
        }

        $scope.submitting = true;

        ApiService.login($scope.form.cpf, $scope.form.password)
            .then(function(data) {
                if (data.success) {
                    AuthService.saveSession(data);

                    if (data.theme) {
                        ThemeService.save(data.api_key, data.theme);
                        ThemeService.apply(data.theme, true);
                    } else {
                        var cachedTheme = ThemeService.load(data.api_key);
                        if (cachedTheme) ThemeService.apply(cachedTheme, true);
                    }

                    ThemeService.clearPreTheme();
                    // Busca player completo (login não retorna extra) para checar onboarding
                    var playerId = (data.player || {})._id;
                    ApiService.getPlayer(playerId).then(function(fullPlayer) {
                        if (fullPlayer) {
                            // Persiste o player completo com extra na sessão
                            var updated = angular.extend({}, data.player || {}, fullPlayer);
                            localStorage.setItem('rv_player', JSON.stringify(updated));
                        }
                        var extra = (fullPlayer && fullPlayer.extra) || {};
                        $location.path(extra.onboarding_done ? '/trail' : '/onboarding');
                    }).catch(function() {
                        // Se falhar, usa o que tiver na sessão
                        var playerData = data.player || {};
                        var onboardingDone = playerData.extra && playerData.extra.onboarding_done;
                        $location.path(onboardingDone ? '/trail' : '/onboarding');
                    });
                } else {
                    $scope.error = data.message || 'Erro ao fazer login.';
                }
            })
            .catch(function(err) {
                var msg = err.data && err.data.message ? err.data.message : 'Erro de conexão. Tente novamente.';
                $scope.error = msg;
            })
            .finally(function() {
                $scope.submitting = false;
            });
    };
});
