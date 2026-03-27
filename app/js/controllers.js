angular.module('rotaViva')

// === Main Controller ===
.controller('MainCtrl', function($scope) {
    $scope.loading = false;
})

// === Landing Controller ===
.controller('LandingCtrl', function($scope, $location, $timeout, ApiService, ThemeService, AuthService) {
    // Se já logado, ir pro dashboard
    if (AuthService.isLoggedIn()) {
        $timeout(function() { $location.path('/dashboard'); });
        return;
    }

    $scope.routes = [];
    $scope.loading = true;

    // Dados estáticos do "espelho de dores" (seção 2 da landing)
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

    // Carregar rotas da API
    ApiService.getRoutes().then(function(data) {
        $scope.routes = data;
        $scope.loading = false;
    }).catch(function() {
        // Fallback estático
        $scope.routes = [
            {
                _id: 'mel', profile: 'apicultor', title: 'Colmeia Viva',
                landing: {
                    section_headline: 'Você é apicultor?',
                    hook: 'Você produz mel bom, mas o atravessador ainda dita o preço.',
                    desires: ['Regularize e tire nota fiscal', 'Acesse programas do governo', 'Conecte-se com outros apicultores', 'Seja reconhecido'],
                    cta_label: 'Entrar como Apicultor',
                    bg_tint: 'rgba(245,194,0,0.10)'
                }
            },
            {
                _id: 'pesca', profile: 'pescador', title: 'Rio em Movimento',
                landing: {
                    section_headline: 'Você é pescador?',
                    hook: 'Você pesca há anos, mas sua atividade ainda é informal.',
                    desires: ['Formalize sua atividade', 'Saiba quais benefícios existem', 'Organize-se com outros pescadores', 'Seja reconhecido'],
                    cta_label: 'Entrar como Pescador',
                    bg_tint: 'rgba(0,92,171,0.10)'
                }
            }
        ];
        $scope.loading = false;
    });

    // Ícone da rota
    $scope.routeIcon = function(route) {
        if (route._id === 'mel') return 'fa-seedling';
        if (route._id === 'pesca') return 'fa-fish';
        return 'fa-leaf';
    };

    // Cor primária da rota (para botões e ícones)
    $scope.routeColor = function(route) {
        if (route._id === 'mel') return '#F5C200';
        if (route._id === 'pesca') return '#005CAB';
        return '#4CAF50';
    };

    // Entrar na rota — pré-tematiza e vai pro login/signup
    $scope.enterRoute = function(route) {
        // Montar pré-tema com cores da rota
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

    function _routePreColors(routeId) {
        if (routeId === 'mel') {
            return {
                primary: '#F5C200', primary_dark: '#C49B00', primary_light: '#FFE566',
                accent: '#FFD54F', background: '#1A1208',
                card: 'rgba(60, 40, 10, 0.85)', card_border: 'rgba(245, 166, 35, 0.25)'
            };
        }
        if (routeId === 'pesca') {
            return {
                primary: '#005CAB', primary_dark: '#003D75', primary_light: '#4DA3FF',
                accent: '#00BCD4', background: '#0A1929',
                card: 'rgba(13, 37, 63, 0.85)', card_border: 'rgba(30, 136, 229, 0.25)'
            };
        }
        return {};
    }
})

// === Login Controller ===
.controller('LoginCtrl', function($scope, $location, ApiService, AuthService, ThemeService) {
    $scope.form = { cpf: '', password: '' };
    $scope.error = '';
    $scope.submitting = false;

    // Verificar pré-tema para contexto visual
    var preTheme = ThemeService.getPreTheme();
    $scope.preTheme = preTheme;
    $scope.welcomeText = preTheme ? ('Bem-vindo à ' + (preTheme.title || 'Rota Viva')) : 'Entrar';

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

                    // Carregar e aplicar tema da rota
                    var cachedTheme = ThemeService.load(data.api_key);
                    if (cachedTheme) {
                        ThemeService.apply(cachedTheme, true);
                    }

                    // Tentar carregar tema fresco da API
                    ApiService.getTheme(data.api_key, data.token).then(function(theme) {
                        if (theme) {
                            ThemeService.save(data.api_key, theme);
                            ThemeService.apply(theme, !cachedTheme);
                        }
                    });

                    ThemeService.clearPreTheme();
                    $location.path('/dashboard');
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
})

// === Signup Controller ===
.controller('SignupCtrl', function($scope, $location, ApiService, CPFService, ThemeService) {
    var preTheme = ThemeService.getPreTheme();

    $scope.form = {
        name: '',
        cpf: '',
        password: '',
        confirmPassword: '',
        profile: preTheme ? preTheme.profile : '',
        email: '',
        phone: ''
    };
    $scope.preTheme = preTheme;
    $scope.profileLocked = !!preTheme;
    $scope.routes = [];
    $scope.error = '';
    $scope.success = '';
    $scope.submitting = false;

    // Carregar rotas para o select (quando não vem da landing)
    if (!preTheme) {
        ApiService.getRoutes().then(function(data) {
            $scope.routes = data;
        }).catch(function() {
            $scope.routes = [
                { _id: 'mel', profile: 'apicultor', title: 'Colmeia Viva' },
                { _id: 'pesca', profile: 'pescador', title: 'Rio em Movimento' }
            ];
        });
    }

    $scope.signup = function() {
        $scope.error = '';
        $scope.success = '';

        if (!$scope.form.name || !$scope.form.cpf || !$scope.form.password || !$scope.form.profile) {
            $scope.error = 'Preencha todos os campos obrigatórios.';
            return;
        }

        if (!CPFService.validate($scope.form.cpf)) {
            $scope.error = 'CPF inválido. Verifique os números digitados.';
            return;
        }

        if ($scope.form.password.length < 6) {
            $scope.error = 'Senha deve ter pelo menos 6 caracteres.';
            return;
        }

        if ($scope.form.password !== $scope.form.confirmPassword) {
            $scope.error = 'As senhas não coincidem.';
            return;
        }

        $scope.submitting = true;

        ApiService.signup($scope.form)
            .then(function(data) {
                if (data.status === 'OK') {
                    $scope.success = data.message || 'Cadastro realizado com sucesso!';
                    setTimeout(function() {
                        $scope.$apply(function() {
                            $location.path('/login');
                        });
                    }, 2000);
                } else {
                    $scope.error = data.message || 'Erro no cadastro.';
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
})

// === Dashboard Controller ===
.controller('DashboardCtrl', function($scope, AuthService, ThemeService, ApiService) {
    var session = AuthService.getSession();
    $scope.player = session.player || {};
    $scope.route = session.route || {};
    $scope.theme = ThemeService.load(session.apiKey) || {};

    // Carregar tema fresco se online
    if (session.apiKey && session.token) {
        ApiService.getTheme(session.apiKey, session.token).then(function(theme) {
            if (theme) {
                ThemeService.save(session.apiKey, theme);
                ThemeService.apply(theme, false);
                $scope.theme = theme;
            }
        });
    }

    $scope.logout = function() {
        AuthService.logout();
    };
});
