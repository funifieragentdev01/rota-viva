angular.module('rotaViva')

.controller('OnboardingCtrl', function($scope, $location, $timeout, ApiService, AuthService, ThemeService) {

    // Deve ser acessado apenas após login
    if (!AuthService.isLoggedIn()) {
        $location.path('/login');
        return;
    }

    var session = AuthService.getSession();
    var player  = session.player || {};
    var route   = session.route  || {};

    // Se já passou pelo onboarding, vai direto para a trilha
    if (player.extra && player.extra.onboarding_done) {
        $timeout(function() { $location.path('/trail'); });
        return;
    }

    // ── Dados de tema/personagens por rota ──
    var routeId = (route._id || player.profile || '').toLowerCase();
    if (routeId === 'apicultor') routeId = 'mel';
    if (routeId === 'pescador')  routeId = 'pesca';

    var THEMES = {
        mel: {
            primaryColor:  '#FF9600',
            textOnPrimary: '#FFFFFF',
            routeTitle:    'Rota do Mel',
            chars: {
                welcome: 'img/characters/mel/front/abelha.png',
                trail:   'img/characters/mel/trail/2.png',
                gallery: 'img/characters/mel/trail/27.png',
                phone:   'img/characters/mel/trail/18.png',
                reward:  'img/characters/mel/trail/17.png'
            }
        },
        pesca: {
            primaryColor:  '#1E88E5',
            textOnPrimary: '#FFFFFF',
            routeTitle:    'Rota da Pesca',
            chars: {
                welcome: 'img/characters/pesca/front/peixe.png',
                trail:   'img/characters/pesca/trail/2.png',
                gallery: 'img/characters/pesca/trail/33.png',
                phone:   'img/characters/pesca/trail/25.png',
                reward:  'img/characters/pesca/trail/24.png'
            }
        }
    };

    var theme = THEMES[routeId] || THEMES.mel;

    $scope.primaryColor  = theme.primaryColor;
    $scope.textOnPrimary = theme.textOnPrimary;
    $scope.routeTitle    = theme.routeTitle;
    $scope.chars         = theme.chars;
    $scope.playerName    = (player.name || '').split(' ')[0] || 'produtor';

    $scope.slide       = 0;
    $scope.celebrating = false;
    $scope.slideEnter  = false;

    function animateSlide() {
        $scope.slideEnter = false;
        $timeout(function() { $scope.slideEnter = true; }, 30);
    }

    animateSlide();

    $scope.next = function() {
        if ($scope.slide < 3) {
            $scope.slide++;
            animateSlide();
        }
    };

    $scope.skip = function() {
        $scope.slide = 3;
        animateSlide();
    };

    $scope.finish = function() {
        _markDone();
    };

    $scope.goTrail = function() {
        $location.path('/trail');
    };

    function _markDone() {
        var playerId = player._id || player.id;

        // Monta o player completo com extra atualizado
        // O POST /v3/player usa Jongo.save() = replace completo, não merge
        var extraUpdate  = angular.extend({}, player.extra || {}, { onboarding_done: true });
        var playerUpdate = angular.extend({}, player, { extra: extraUpdate });

        ApiService.updatePlayer(playerId, playerUpdate)
            .then(function() {
                // Atualiza player em sessão local
                localStorage.setItem('rv_player', JSON.stringify(playerUpdate));

                // Dispara ação +50 XP no Funifier
                ApiService.logAction('onboarding_complete', playerId, { route: routeId });
            })
            .catch(angular.noop) // Não bloqueia o fluxo se falhar
            .finally(function() {
                $scope.celebrating = true;
            });
    }
});
