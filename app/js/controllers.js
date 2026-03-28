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

    // Hero assets (rotate between mel and pesca)
    $scope.heroVideos = [
        'https://s3.amazonaws.com/funifier/games/69c58d85e6650e26dad2166f/landing/69c7ebaedf494d3199c02dda_original_hero-mel.mp4',
        'https://s3.amazonaws.com/funifier/games/69c58d85e6650e26dad2166f/landing/69c7ebb1df494d3199c02e38_original_hero-pesca.mp4'
    ];
    $scope.heroImages = [
        'https://s3.amazonaws.com/funifier/games/69c58d85e6650e26dad2166f/landing/69c7eba2df494d3199c02c23_original_hero-mel.png',
        'https://s3.amazonaws.com/funifier/games/69c58d85e6650e26dad2166f/landing/69c7eba4df494d3199c02c81_original_hero-pesca.png'
    ];
    $scope.currentHero = 0;

    // Set hero video src after DOM renders
    $timeout(function() {
        var vid = document.getElementById('hero-video');
        if (vid) {
            vid.src = $scope.heroVideos[$scope.currentHero];
            vid.load();
        }
    }, 100);

    // FOMO counters
    $scope.fomoItems = [
        { label: 'Colmeia Viva — vagas de Fundador disponíveis', icon: 'fa-seedling', color: '#F5C200' },
        { label: 'Rio em Movimento — vagas de Fundador disponíveis', icon: 'fa-fish', color: '#005CAB' }
    ];

    // Espelho de dores
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

    // FAQ — carregado da API (faq__c na Central)
    $scope.faqs = [];
    ApiService.getFaqs().then(function(data) {
        $scope.faqs = data.map(function(f) {
            return { q: f.question, a: f.answer, open: false };
        });
    }).catch(function() {
        // Fallback estático
        $scope.faqs = [
            { q: 'O app é gratuito?', a: 'Sim, 100% gratuito. O Rota Viva é um programa do Governo Federal (MIDR) e não cobra nada do produtor.' },
            { q: 'Preciso baixar alguma coisa?', a: 'Não. O Rota Viva funciona direto no navegador do celular, como um site.' },
            { q: 'Funciona sem internet?', a: 'Sim! Após o primeiro acesso, o app funciona offline.' }
        ];
    });

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

    // Texto em botão: escuro pro amarelo, branco pro azul
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
                primary: '#F5C200', primary_dark: '#C49B00', primary_light: '#FFF3B0',
                accent: '#C49B00', background: '#FFFDF5', surface: '#FFFFFF',
                card: '#FFFFFF', card_border: 'rgba(245, 194, 0, 0.25)',
                input_bg: 'rgba(0, 0, 0, 0.04)',
                text: '#1A1208', text_muted: '#5C4A1A', text_faint: '#9E8B5A',
                text_on_primary: '#1A1208'
            };
        }
        if (routeId === 'pesca') {
            return {
                primary: '#005CAB', primary_dark: '#003D75', primary_light: '#DDEEFF',
                accent: '#003D75', background: '#F5F9FF', surface: '#FFFFFF',
                card: '#FFFFFF', card_border: 'rgba(0, 92, 171, 0.15)',
                input_bg: 'rgba(0, 0, 0, 0.04)',
                text: '#0A1929', text_muted: '#2A4A6B', text_faint: '#7A9BBF',
                text_on_primary: '#FFFFFF'
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

                    // Aplicar tema retornado pelo login (server-side)
                    if (data.theme) {
                        ThemeService.save(data.api_key, data.theme);
                        ThemeService.apply(data.theme, true);
                    } else {
                        // Fallback: tema em cache
                        var cachedTheme = ThemeService.load(data.api_key);
                        if (cachedTheme) {
                            ThemeService.apply(cachedTheme, true);
                        }
                    }

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
.controller('DashboardCtrl', function($scope, $location, AuthService, ThemeService) {
    var session = AuthService.getSession();
    $scope.player = session.player || {};
    $scope.route = session.route || {};
    $scope.theme = ThemeService.load(session.apiKey) || {};

    if ($scope.theme && $scope.theme.colors) {
        ThemeService.apply($scope.theme, false);
    }

    $scope.goTrail = function() {
        $location.path('/trail');
    };

    $scope.logout = function() {
        AuthService.logout();
    };
})

// === Trail Controller ===
.controller('TrailCtrl', function($scope, $location, $routeParams, $timeout, AuthService, ApiService, ThemeService) {
    var session = AuthService.getSession();
    var token = session.token;
    var playerId = (session.player || {})._id;
    var theme = ThemeService.load(session.apiKey) || {};

    if (theme && theme.colors) ThemeService.apply(theme, false);

    $scope.level = 'root'; // root | subject
    $scope.title = theme.labels ? theme.labels.missions_title : 'Trilhas';
    $scope.loading = true;
    $scope.subjects = [];
    $scope.trailItems = [];
    $scope.trailLoading = false;
    $scope.selectedLesson = null;

    var MODULE_COLORS = ['#FF9600', '#CE82FF', '#00CD9C', '#1CB0F6', '#FF4B4B', '#FFC800'];
    var SUBJECT_COLORS = ['#005CAB', '#F5C200', '#009B3A', '#D02020', '#CE82FF', '#00CD9C'];

    var folderId = $routeParams.folderId || null;

    function init() {
        if (folderId) {
            loadSubjectTrail(folderId);
        } else {
            loadSubjects();
        }
    }

    function loadSubjects() {
        $scope.level = 'root';
        $scope.title = theme.labels ? theme.labels.missions_title : 'Trilhas';

        ApiService.getTrailFolders('root', token).then(function(folders) {
            $scope.subjects = folders;

            folders.forEach(function(sub) {
                ApiService.getTrailFolders(sub._id, token).then(function(children) {
                    sub._moduleCount = children.length;
                });
            });

            $scope.loading = false;
        }).catch(function() {
            $scope.subjects = [];
            $scope.loading = false;
        });
    }

    function loadSubjectTrail(subjectId) {
        $scope.level = 'subject';
        $scope.trailLoading = true;

        ApiService.getTrailFolders('root', token).then(function(roots) {
            var subject = roots.find(function(r) { return r._id === subjectId; });
            if (subject) $scope.title = subject.title;
        });

        ApiService.getTrailFolders(subjectId, token).then(function(modules) {
            if (modules.length === 0) {
                $scope.trailItems = [];
                $scope.trailLoading = false;
                $scope.loading = false;
                return;
            }

            var pending = modules.length;
            var allItems = [];

            modules.forEach(function(mod, modIdx) {
                var color = (mod.extra && mod.extra.color) || MODULE_COLORS[modIdx % MODULE_COLORS.length];

                allItems.push({
                    _type: 'module',
                    _id: mod._id,
                    title: mod.title,
                    color: color,
                    position: mod.position || modIdx,
                    _lessonCount: 0
                });

                ApiService.getTrailFolders(mod._id, token).then(function(lessons) {
                    var moduleHeader = allItems.find(function(i) { return i._id === mod._id; });
                    if (moduleHeader) moduleHeader._lessonCount = lessons.length;

                    lessons.forEach(function(lesson, lIdx) {
                        allItems.push({
                            _type: 'lesson',
                            _id: lesson._id,
                            title: lesson.title,
                            moduleColor: color,
                            moduleId: mod._id,
                            lessonIndex: lIdx,
                            position: lesson.position || lIdx,
                            icon: 'fa-play',
                            _locked: false,
                            _done: false
                        });
                    });

                    pending--;
                    if (pending === 0) finalizeTrail(allItems);
                }).catch(function() {
                    pending--;
                    if (pending === 0) finalizeTrail(allItems);
                });
            });

            $scope.loading = false;
        }).catch(function() {
            $scope.trailItems = [];
            $scope.trailLoading = false;
            $scope.loading = false;
        });
    }

    function finalizeTrail(items) {
        // Sort: modules by position, lessons by their module position then lesson position
        var modules = items.filter(function(i) { return i._type === 'module'; })
            .sort(function(a, b) { return a.position - b.position; });

        var flat = [];
        modules.forEach(function(mod) {
            flat.push(mod);
            var lessons = items.filter(function(i) { return i._type === 'lesson' && i.moduleId === mod._id; })
                .sort(function(a, b) { return a.position - b.position; });
            lessons.forEach(function(l, idx) {
                l.lessonIndex = idx;
                l.icon = getLessonIcon(l, idx);
                flat.push(l);
            });
        });

        $scope.trailItems = flat;
        $scope.trailLoading = false;
        $scope.$applyAsync();
    }

    function getLessonIcon(lesson, idx) {
        if (lesson._locked) return 'fa-lock';
        if (lesson._done) return 'fa-star';
        return 'fa-play';
    }

    $scope.getSubjectColor = function(idx) {
        return SUBJECT_COLORS[idx % SUBJECT_COLORS.length];
    };

    $scope.getSubjectIcon = function(subject) {
        var name = (subject.title || '').toLowerCase();
        var map = {
            'regularização': 'fa-file-invoice', 'regularizacao': 'fa-file-invoice',
            'políticas': 'fa-building-columns', 'politicas': 'fa-building-columns',
            'manejo': 'fa-seedling', 'produção': 'fa-industry', 'producao': 'fa-industry',
            'comercialização': 'fa-coins', 'comercializacao': 'fa-coins',
            'organização': 'fa-handshake', 'organizacao': 'fa-handshake',
            'território': 'fa-map', 'territorio': 'fa-map',
            'saúde': 'fa-heart', 'saude': 'fa-heart',
            'meio ambiente': 'fa-leaf', 'sustentabilidade': 'fa-recycle'
        };
        for (var key in map) {
            if (name.indexOf(key) !== -1) return map[key];
        }
        return 'fa-book';
    };

    $scope.openSubject = function(subject) {
        $location.path('/trail/' + subject._id);
    };

    $scope.getBubbleStyle = function(item) {
        if (item._type !== 'lesson') return {};
        var xOffset = Math.sin(item.lessonIndex * 0.8) * 70;
        return { 'margin-left': 'calc(50% - 28px + ' + xOffset + 'px)' };
    };

    $scope.getBubbleClass = function(item) {
        if (item._locked) return 'duo-bubble duo-locked';
        if (item._done) return 'duo-bubble duo-done';
        return 'duo-bubble duo-active';
    };

    $scope.getBubbleDynamic = function(item) {
        if (item._locked) return {};
        return { 'background': item.moduleColor };
    };

    $scope.selectLesson = function(item, $event) {
        $event.stopPropagation();
        if ($scope.selectedLesson && $scope.selectedLesson._id === item._id) {
            $scope.selectedLesson = null;
        } else {
            $scope.selectedLesson = item;
        }
    };

    $scope.startLesson = function(item) {
        if (item._locked) return;
        ApiService.getTrailContents(item._id, token).then(function(contents) {
            var quiz = contents.find(function(c) { return c.type === 'quiz'; });
            if (quiz && quiz.content) {
                $location.path('/quiz/' + quiz.content);
            }
        });
    };

    $scope.goBack = function() {
        if ($scope.level === 'subject') {
            $location.path('/trail');
        } else {
            $location.path('/dashboard');
        }
    };

    $scope.goHome = function() {
        $location.path('/dashboard');
    };

    // Close popup on body click
    $scope.$on('$destroy', function() {});

    init();
})

// === Quiz Controller (placeholder) ===
.controller('QuizCtrl', function($scope, $routeParams, $location, AuthService, ApiService) {
    var session = AuthService.getSession();
    var token = session.token;
    var quizId = $routeParams.quizId;

    $scope.quizTitle = '';
    $scope.questions = [];
    $scope.currentIndex = 0;
    $scope.loading = true;
    $scope.finished = false;
    $scope.score = 0;

    // Load quiz + questions
    ApiService.getQuiz(quizId, token).then(function(quiz) {
        $scope.quizTitle = quiz.title || 'Quiz';
        return ApiService.getQuestions(quizId, token);
    }).then(function(questions) {
        $scope.questions = questions.map(function(q) {
            return {
                _id: q._id,
                text: q.description || q.title || '',
                type: q.type || 'MULTIPLE_CHOICE',
                options: (q.alternatives || []).map(function(a) {
                    return { text: a.description || a.title || '', correct: !!a.correct, selected: false };
                }),
                answered: false,
                correct: false
            };
        });
        $scope.loading = false;
    }).catch(function() {
        $scope.loading = false;
    });

    $scope.current = function() {
        return $scope.questions[$scope.currentIndex] || null;
    };

    $scope.selectOption = function(q, opt) {
        if (q.answered) return;
        q.options.forEach(function(o) { o.selected = false; });
        opt.selected = true;
    };

    $scope.checkAnswer = function(q) {
        if (q.answered) return;
        q.answered = true;
        var selected = q.options.find(function(o) { return o.selected; });
        q.correct = selected && selected.correct;
        if (q.correct) $scope.score++;
    };

    $scope.next = function() {
        if ($scope.currentIndex < $scope.questions.length - 1) {
            $scope.currentIndex++;
        } else {
            $scope.finished = true;
        }
    };

    $scope.goBack = function() {
        window.history.back();
    };

    $scope.progressPercent = function() {
        if ($scope.questions.length === 0) return 0;
        return Math.round(($scope.currentIndex / $scope.questions.length) * 100);
    };
});
