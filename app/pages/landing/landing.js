angular.module('rotaViva')

.controller('LandingCtrl', function($scope, $location, $timeout, ApiService, ThemeService, AuthService) {
    if (AuthService.isLoggedIn()) {
        $timeout(function() { $location.path('/trail'); });
        return;
    }

    $scope.routes = [];
    $scope.loading = true;
    $scope.routeModal = { show: false, action: null };

    $scope.mirrorMel = [
        'Você produz mel bom.',
        'Mas o atravessador compra barato e você não tem como negociar.',
        'Você não sabe exatamente quais programas do governo pode acessar.',
        'Regularizar a produção parece caro e complicado demais.',
        'E você se pergunta se seus filhos vão querer ficar no campo.'
    ];

    $scope.mirrorPesca = [
        'Você pesca há anos, mas sua atividade ainda é informal.',
        'O seguro-defeso é difícil de acessar e os benefícios não chegam.',
        'O pescado vale pouco porque falta organização e infraestrutura.',
        'E você sente que o conhecimento dos rios que você tem não é reconhecido por ninguém.'
    ];

    $scope.faqs = [];
    ApiService.getFaqs().then(function(data) {
        $scope.faqs = data.map(function(f) {
            return { q: f.question, a: f.answer, open: false };
        });
    }).catch(function() {
        $scope.faqs = [
            { q: 'O app é gratuito?', a: 'Sim, 100% gratuito. O Rota Viva é um programa do Governo Federal (MIDR) e não cobra nada do produtor.', open: false },
            { q: 'Preciso baixar alguma coisa?', a: 'Não. O Rota Viva funciona direto no navegador do celular, como um site. Você pode adicionar na tela inicial do celular para ter acesso rápido.', open: false },
            { q: 'Funciona sem internet?', a: 'Sim! Após o primeiro acesso, o app funciona offline. Perfeito para áreas com sinal fraco.', open: false },
            { q: 'Quem pode participar?', a: 'Apicultores do Piauí e pescadores artesanais do Amapá que fazem parte do programa Rotas de Integração Nacional do MIDR.', open: false }
        ];
    });

    ApiService.getRoutes().then(function(data) {
        $scope.routes = data;
        $scope.loading = false;
    }).catch(function() {
        $scope.routes = [
            {
                _id: 'mel', profile: 'apicultor', title: 'Colmeia Viva',
                landing: {
                    section_headline: 'Você é apicultor?',
                    hook: 'Você produz mel bom, mas o atravessador ainda dita o preço. A Rota do Mel abre o caminho: regularize, acesse o CAF e conecte-se com outros apicultores do Piauí.',
                    desires: [
                        'Regularize e tire nota fiscal da sua produção',
                        'Acesse CAF, PRONAF e outros programas do governo',
                        'Conecte-se com apicultores de toda a região',
                        'Seja reconhecido como produtor de referência'
                    ],
                    cta_label: 'Entrar como Apicultor',
                    bg_tint: 'rgba(245,194,0,0.06)'
                }
            },
            {
                _id: 'pesca', profile: 'pescador', title: 'Rio em Movimento',
                landing: {
                    section_headline: 'Você é pescador?',
                    hook: 'Você pesca há anos, mas sua atividade ainda é informal. A Rota da Pesca muda isso: formalize, acesse o seguro-defeso e ganhe o reconhecimento que você merece.',
                    desires: [
                        'Formalize sua atividade e tire o RGP',
                        'Acesse o seguro-defeso e outros benefícios',
                        'Organize-se com pescadores do Amapá',
                        'Seja reconhecido como guardião dos rios'
                    ],
                    cta_label: 'Entrar como Pescador',
                    bg_tint: 'rgba(0,92,171,0.06)'
                }
            }
        ];
        $scope.loading = false;
    });

    // ── Modal de seleção de rota ──
    $scope.openRouteModal = function(action) {
        $scope.routeModal.show = true;
        $scope.routeModal.action = action; // 'login' | 'signup'
    };

    $scope.closeRouteModal = function() {
        $scope.routeModal.show = false;
    };

    $scope.selectRoute = function(routeId) {
        _applyPreTheme(routeId);
        $scope.closeRouteModal();
        $location.path($scope.routeModal.action === 'login' ? '/login' : '/signup');
    };

    // ── Entrar direto pela rota (hero / seção / CTA final) ──
    $scope.enterRoute = function(routeId) {
        $location.path('/' + routeId);
    };

    function _applyPreTheme(routeId) {
        var titles = { mel: 'Colmeia Viva', pesca: 'Rio em Movimento' };
        var profiles = { mel: 'apicultor', pesca: 'pescador' };
        ThemeService.setPreTheme({
            routeId: routeId,
            profile: profiles[routeId] || routeId,
            title: titles[routeId] || routeId,
            colors: _routePreColors(routeId)
        });
    }

    $scope.routeColor = function(route) {
        if (route._id === 'mel') return '#F5C200';
        if (route._id === 'pesca') return '#005CAB';
        return '#005CAB';
    };

    $scope.routeTextColor = function(route) {
        if (route._id === 'mel') return '#1A1208';
        return '#FFFFFF';
    };

    $scope.scrollTo = function(id) {
        var el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    function _routePreColors(routeId) {
        if (routeId === 'mel') {
            return {
                primary: '#FF9600', primary_dark: '#CC7A00', primary_light: '#f5e6c8',
                accent: '#FFD700', background: '#1a2f38', surface: '#152530',
                card: 'transparent', card_border: 'rgba(255,150,0,0.15)',
                input_bg: '#f5e6c8', input_text: '#1A1A1A',
                text: '#FFFFFF', text_muted: 'rgba(255,255,255,0.6)', text_faint: 'rgba(255,255,255,0.3)',
                text_on_primary: '#FFFFFF'
            };
        }
        if (routeId === 'pesca') {
            return {
                primary: '#1E88E5', primary_dark: '#1565C0', primary_light: '#d8e8f0',
                accent: '#4FC3F7', background: '#1a2535', surface: '#152030',
                card: 'transparent', card_border: 'rgba(30,136,229,0.15)',
                input_bg: '#d8e8f0', input_text: '#1A1A1A',
                text: '#FFFFFF', text_muted: 'rgba(255,255,255,0.6)', text_faint: 'rgba(255,255,255,0.3)',
                text_on_primary: '#FFFFFF'
            };
        }
        return {};
    }
});
