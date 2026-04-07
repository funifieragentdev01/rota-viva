angular.module('rotaViva')

.controller('LandingCtrl', function($scope, $location, $timeout, ApiService, ThemeService, AuthService) {
    if (AuthService.isLoggedIn()) {
        $timeout(function() { $location.path('/dashboard'); });
        return;
    }

    $scope.routes = [];
    $scope.loading = true;

    $scope.heroVideos = [
        'https://s3.amazonaws.com/funifier/games/69c58d85e6650e26dad2166f/landing/69c7ebaedf494d3199c02dda_original_hero-mel.mp4',
        'https://s3.amazonaws.com/funifier/games/69c58d85e6650e26dad2166f/landing/69c7ebb1df494d3199c02e38_original_hero-pesca.mp4'
    ];
    $scope.heroImages = [
        'https://s3.amazonaws.com/funifier/games/69c58d85e6650e26dad2166f/landing/69c7eba2df494d3199c02c23_original_hero-mel.png',
        'https://s3.amazonaws.com/funifier/games/69c58d85e6650e26dad2166f/landing/69c7eba4df494d3199c02c81_original_hero-pesca.png'
    ];
    $scope.currentHero = 0;

    $timeout(function() {
        var vid = document.getElementById('hero-video');
        if (vid) { vid.src = $scope.heroVideos[$scope.currentHero]; vid.load(); }
    }, 100);

    $scope.fomoItems = [
        { label: 'Colmeia Viva — vagas de Fundador disponíveis', icon: 'fa-seedling', color: '#F5C200' },
        { label: 'Rio em Movimento — vagas de Fundador disponíveis', icon: 'fa-fish', color: '#005CAB' }
    ];

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
            { q: 'O app é gratuito?', a: 'Sim, 100% gratuito. O Rota Viva é um programa do Governo Federal (MIDR) e não cobra nada do produtor.' },
            { q: 'Preciso baixar alguma coisa?', a: 'Não. O Rota Viva funciona direto no navegador do celular, como um site.' },
            { q: 'Funciona sem internet?', a: 'Sim! Após o primeiro acesso, o app funciona offline.' }
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
                    hook: 'Você produz mel bom, mas o atravessador ainda dita o preço. Você sabe que pode mais. A Rota do Mel abre esse caminho.',
                    desires: ['Regularize e tire nota fiscal', 'Acesse programas do governo diretamente', 'Conecte-se com outros apicultores', 'Seja reconhecido como produtor de referência'],
                    cta_label: 'Entrar como Apicultor',
                    bg_tint: 'rgba(245,194,0,0.08)'
                }
            },
            {
                _id: 'pesca', profile: 'pescador', title: 'Rio em Movimento',
                landing: {
                    section_headline: 'Você é pescador?',
                    hook: 'Você pesca há anos, mas sua atividade ainda é informal. O seguro-defeso é difícil de acessar e os benefícios não chegam. A Rota da Pesca muda isso.',
                    desires: ['Formalize sua atividade e acesse o seguro-defeso', 'Saiba quais benefícios e programas existem para você', 'Organize-se com outros pescadores para ter mais força', 'Seja reconhecido como guardião dos rios'],
                    cta_label: 'Entrar como Pescador',
                    bg_tint: 'rgba(0,92,171,0.08)'
                }
            }
        ];
        $scope.loading = false;
    });

    $scope.routeIcon = function(route) {
        if (route._id === 'mel') return 'fa-seedling';
        if (route._id === 'pesca') return 'fa-fish';
        return 'fa-leaf';
    };

    $scope.routeColor = function(route) {
        if (route._id === 'mel') return '#F5C200';
        if (route._id === 'pesca') return '#005CAB';
        return '#005CAB';
    };

    $scope.routeTextColor = function(route) {
        if (route._id === 'mel') return '#1A1208';
        return '#FFFFFF';
    };

    $scope.enterRoute = function(route) {
        var preTheme = {
            routeId: route._id,
            profile: route.profile,
            title: route.title,
            colors: _routePreColors(route._id)
        };
        ThemeService.setPreTheme(preTheme);
        $location.path('/signup');
    };

    $scope.goLogin = function() {
        ThemeService.clearPreTheme();
        $location.path('/login');
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
