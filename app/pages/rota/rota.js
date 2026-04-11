angular.module('rotaViva')

.controller('RotaCtrl', function($scope, $location, $timeout, ThemeService, AuthService) {

    // If already logged in, go to trail
    if (AuthService.isLoggedIn()) {
        $timeout(function() { $location.path('/trail'); });
        return;
    }

    // Determine route from URL path
    var path = $location.path(); // '/mel' or '/pesca'
    var routeId = path.replace('/', '');

    var ROUTES = {
        mel: {
            id: 'mel',
            name: 'Rota do Mel',
            territory: 'Piauí',
            profile: 'apicultor',
            heroPhoto: 'img/hero/mel.jpg',
            primaryColor: '#F5C200',
            primaryDark: '#CC7A00',
            accentColor: '#FF9600',
            textOnPrimary: '#1A1208',
            bgClass: 'rota-mel',
            heroTitle: 'Rota do Mel',
            heroSubtitle: 'Aprenda apicultura, regularize sua produção e acesse os benefícios que você merece.',
            hook: 'Você produz mel bom. Mas o atravessador ainda dita o preço — e os programas do governo parecem feitos para quem já sabe onde procurar.',
            benefits: [
                {
                    icon: 'fa-id-card',
                    title: 'CAF e PRONAF',
                    desc: 'Descubra se você tem direito e como se regularizar para acessar crédito rural.'
                },
                {
                    icon: 'fa-file-invoice',
                    title: 'Nota Fiscal',
                    desc: 'Passo a passo para emitir nota fiscal e vender direto para supermercados e governo.'
                },
                {
                    icon: 'fa-handshake',
                    title: 'Cooperativas',
                    desc: 'Encontre cooperativas e associações da sua região para ganhar escala e preço justo.'
                }
            ],
            mirror: [
                'Você produz mel bom, mas o atravessador compra barato e você não tem como negociar.',
                'Você não sabe exatamente quais programas do governo pode acessar.',
                'Regularizar a produção parece caro e complicado demais.',
                'E você se pergunta se seus filhos vão querer ficar no campo.'
            ],
            steps: [
                { num: '01', title: 'Cadastre-se', desc: 'Crie sua conta em 2 minutos. Só precisa de nome, CPF e telefone.' },
                { num: '02', title: 'Complete a trilha', desc: 'Aprenda apicultura e políticas públicas no seu ritmo, pelo celular, sem precisar de internet.' },
                { num: '03', title: 'Acesse benefícios', desc: 'O app mostra quais programas são para você — CAF, PRONAF, PAA — e como dar o próximo passo.' }
            ],
            faqs: [
                { q: 'Preciso ter CAF para participar?', a: 'Não. Qualquer apicultor pode participar. O app te ajuda a entender o CAF e como obter o seu — passo a passo.', open: false },
                { q: 'É gratuito mesmo?', a: 'Sim, 100% gratuito. O Rota Viva é um programa do Governo Federal (MIDR) em parceria com FADEX e UFPI. Não existe nenhum custo.', open: false },
                { q: 'Funciona sem internet?', a: 'Sim. Após o primeiro acesso, o app funciona offline. Perfeito para zonas rurais com sinal fraco ou intermitente.', open: false },
                { q: 'Ganho algum certificado?', a: 'Sim. Ao completar as trilhas você recebe certificados oficiais de capacitação emitidos pela FADEX e UFPI.', open: false }
            ],
            charHero: 'img/characters/mel/front/apicultor.png',
            charReward: 'img/characters/mel/trail/17.png',
            charDocs: 'img/characters/mel/trail/9.png',
            charField: 'img/characters/mel/trail/20.png',
            charRead: 'img/characters/mel/trail/10.png',
            themeColors: {
                primary: '#FF9600', primary_dark: '#CC7A00', primary_light: '#f5e6c8',
                accent: '#FFD700', background: '#1a2f38', surface: '#152530',
                card: 'transparent', card_border: 'rgba(255,150,0,0.15)',
                input_bg: '#f5e6c8', input_text: '#1A1A1A',
                text: '#FFFFFF', text_muted: 'rgba(255,255,255,0.6)', text_faint: 'rgba(255,255,255,0.3)',
                text_on_primary: '#FFFFFF'
            }
        },
        pesca: {
            id: 'pesca',
            name: 'Rota da Pesca',
            territory: 'Amapá',
            profile: 'pescador',
            heroPhoto: 'img/hero/pesca.jpg',
            primaryColor: '#005CAB',
            primaryDark: '#003F7A',
            accentColor: '#1E88E5',
            textOnPrimary: '#FFFFFF',
            bgClass: 'rota-pesca',
            heroTitle: 'Rota da Pesca',
            heroSubtitle: 'Formalize sua atividade, acesse o seguro-defeso e seja reconhecido como guardião dos rios.',
            hook: 'Você pesca há anos. Mas sua atividade ainda é informal — e o seguro-defeso, que é seu por direito, parece impossível de acessar.',
            benefits: [
                {
                    icon: 'fa-id-card',
                    title: 'RGP e Regularização',
                    desc: 'Obtenha o Registro Geral da Pesca e formalize sua atividade de uma vez por todas.'
                },
                {
                    icon: 'fa-umbrella',
                    title: 'Seguro-Defeso',
                    desc: 'Entenda seus direitos e como acessar o seguro-defeso na próxima temporada de forma simples.'
                },
                {
                    icon: 'fa-fish',
                    title: 'Mercado e Preço Justo',
                    desc: 'Organize-se com outros pescadores para comercializar melhor e sair do ciclo do atravessador.'
                }
            ],
            mirror: [
                'Você pesca há anos, mas sua atividade ainda é informal.',
                'O seguro-defeso é difícil de acessar e os benefícios não chegam.',
                'O pescado vale pouco porque falta organização e infraestrutura.',
                'E o conhecimento dos rios que você tem não é reconhecido por ninguém.'
            ],
            steps: [
                { num: '01', title: 'Cadastre-se', desc: 'Crie sua conta em 2 minutos. Só precisa de nome, CPF e telefone.' },
                { num: '02', title: 'Complete a trilha', desc: 'Aprenda pesca sustentável e seus direitos no seu ritmo, pelo celular.' },
                { num: '03', title: 'Acesse benefícios', desc: 'O app mostra o RGP, seguro-defeso e outros programas disponíveis para você — com o passo a passo.' }
            ],
            faqs: [
                { q: 'Preciso ter RGP para participar?', a: 'Não. Qualquer pescador artesanal pode participar. O app te orienta sobre como obter o RGP.', open: false },
                { q: 'É gratuito mesmo?', a: 'Sim, 100% gratuito. O Rota Viva é um programa do Governo Federal (MIDR) em parceria com FADEX e UFPI.', open: false },
                { q: 'Funciona sem internet?', a: 'Sim. Após o primeiro acesso, o app funciona offline. Perfeito para áreas remotas do Amapá com sinal fraco.', open: false },
                { q: 'Ganho algum certificado?', a: 'Sim. Ao completar as trilhas você recebe certificados oficiais de capacitação emitidos pela FADEX e UFPI.', open: false }
            ],
            charHero: 'img/characters/pesca/front/pescador.png',
            charReward: 'img/characters/pesca/trail/24.png',
            charDocs: 'img/characters/pesca/trail/5.png',
            charField: 'img/characters/pesca/trail/8.png',
            charRead: 'img/characters/pesca/trail/10.png',
            themeColors: {
                primary: '#1E88E5', primary_dark: '#1565C0', primary_light: '#d8e8f0',
                accent: '#4FC3F7', background: '#1a2535', surface: '#152030',
                card: 'transparent', card_border: 'rgba(30,136,229,0.15)',
                input_bg: '#d8e8f0', input_text: '#1A1A1A',
                text: '#FFFFFF', text_muted: 'rgba(255,255,255,0.6)', text_faint: 'rgba(255,255,255,0.3)',
                text_on_primary: '#FFFFFF'
            }
        }
    };

    var data = ROUTES[routeId];

    // Fallback: unknown route → go to landing
    if (!data) {
        $timeout(function() { $location.path('/home'); });
        return;
    }

    $scope.r = data;

    // Captura código de convite da querystring e guarda no localStorage
    var refCode = $location.search().ref;
    if (refCode) {
        localStorage.setItem('rv_ref', refCode);
    }

    $scope.goSignup = function() {
        ThemeService.setPreTheme({
            routeId: data.id,
            profile: data.profile,
            title: data.name,
            colors: data.themeColors
        });
        $location.path('/signup');
    };

    $scope.goLogin = function() {
        ThemeService.setPreTheme({
            routeId: data.id,
            profile: data.profile,
            title: data.name,
            colors: data.themeColors
        });
        $location.path('/login');
    };

    $scope.goBack = function() {
        $location.path('/home');
    };

    $scope.scrollTo = function(id) {
        var el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };
});
