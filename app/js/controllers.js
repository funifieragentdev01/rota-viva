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
// Uses Funifier native /v3/folder/* endpoints (same pattern as Tutor)
.controller('TrailCtrl', function($scope, $location, $routeParams, $timeout, AuthService, ApiService, ThemeService) {
    var session = AuthService.getSession();
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

    // Root level: list all subjects (root folders with parent: null)
    function loadSubjects() {
        $scope.level = 'root';
        $scope.title = theme.labels ? theme.labels.missions_title : 'Trilhas';

        ApiService.folderInside(null).then(function(data) {
            var items = data.items || [];
            // Only show folders (subjects), not loose content at root
            $scope.subjects = items.filter(function(i) { return i.folder !== false; });

            // Load module count for each subject
            $scope.subjects.forEach(function(sub) {
                ApiService.folderInside(sub._id).then(function(innerData) {
                    var innerItems = innerData.items || [];
                    sub._moduleCount = innerItems.filter(function(i) { return i.folder !== false; }).length;
                });
            });

            $scope.loading = false;
        }).catch(function() {
            $scope.subjects = [];
            $scope.loading = false;
        });
    }

    // Subject level: Duolingo S-curve with modules and lessons
    function loadSubjectTrail(subjectId) {
        $scope.level = 'subject';
        $scope.trailLoading = true;

        // Get subject title
        ApiService.folderInside(null).then(function(data) {
            var items = data.items || [];
            var subject = items.find(function(i) { return i._id === subjectId; });
            if (subject) $scope.title = subject.title;
        });

        // Get modules with progress
        ApiService.folderProgress(subjectId, playerId).then(function(data) {
            var items = data.items || [];
            var modules = items.filter(function(i) { return i.folder !== false; });

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
                    percent: mod.percent || 0,
                    position: mod.position || modIdx,
                    _lessonCount: 0
                });

                // Get lessons inside each module (with progress)
                ApiService.folderProgress(mod._id, playerId).then(function(lessonData) {
                    var lessonItems = lessonData.items || [];
                    var lessons = lessonItems.filter(function(i) { return i.folder !== false; });
                    var moduleHeader = allItems.find(function(i) { return i._id === mod._id; });
                    if (moduleHeader) moduleHeader._lessonCount = lessons.length;

                    lessons.forEach(function(lesson, lIdx) {
                        // Extract content type from items[] (returned by folder/progress)
                        var contentItems = lesson.items || [];
                        var firstContent = contentItems.length > 0 ? contentItems[0] : {};
                        var contentType = firstContent.type || ''; // video, quiz, mission, etc.
                        var contentId = firstContent.content || firstContent._id || '';

                        allItems.push({
                            _type: 'lesson',
                            _id: lesson._id,
                            title: lesson.title,
                            moduleColor: color,
                            moduleId: mod._id,
                            lessonIndex: lIdx,
                            position: lesson.position || lIdx,
                            percent: lesson.percent || 0,
                            is_unlocked: lesson.is_unlocked !== false,
                            contentType: contentType,
                            contentId: contentId,
                            icon: 'fa-play'
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
        var modules = items.filter(function(i) { return i._type === 'module'; })
            .sort(function(a, b) { return (a.position || 0) - (b.position || 0); });

        var flat = [];
        modules.forEach(function(mod) {
            flat.push(mod);
            var lessons = items.filter(function(i) { return i._type === 'lesson' && i.moduleId === mod._id; })
                .sort(function(a, b) { return (a.position || 0) - (b.position || 0); });
            lessons.forEach(function(l, idx) {
                l.lessonIndex = idx;
                l.icon = getLessonIcon(l);
                flat.push(l);
            });
        });

        $scope.trailItems = flat;
        $scope.trailLoading = false;
        $scope.$applyAsync();

        // Auto-scroll to first available lesson
        $timeout(function() {
            for (var i = 0; i < flat.length; i++) {
                if (flat[i]._type === 'lesson' && flat[i].is_unlocked && flat[i].percent < 100) {
                    var el = document.getElementById('trail-item-' + flat[i]._id);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    break;
                }
            }
        }, 300);
    }

    // Icon per content type (Duolingo style)
    var CONTENT_ICONS = {
        'quiz':    'fa-star',       // ⭐ estrela
        'video':   'fa-play',       // ▶️ play
        'mission': 'fa-wrench'      // 🔧 ferramenta
    };

    function getLessonIcon(lesson) {
        var typeIcon = CONTENT_ICONS[lesson.contentType];
        if (typeIcon) return typeIcon; // always show content type icon
        // Unknown type: lock if blocked, star if open
        if (!lesson.is_unlocked) return 'fa-lock';
        return 'fa-star';
    }

    $scope.getSubjectColor = function(idx) {
        return SUBJECT_COLORS[idx % SUBJECT_COLORS.length];
    };

    $scope.getSubjectIcon = function(subject) {
        // Check saved icon in extra first
        if (subject.extra && subject.extra.icon) return subject.extra.icon;
        var name = (subject.title || '').toLowerCase();
        var map = {
            'regularização': 'fa-file-invoice', 'regularizacao': 'fa-file-invoice',
            'políticas': 'fa-building-columns', 'politicas': 'fa-building-columns',
            'manejo': 'fa-seedling', 'produção': 'fa-industry', 'producao': 'fa-industry',
            'comercialização': 'fa-coins', 'comercializacao': 'fa-coins',
            'organização': 'fa-handshake', 'organizacao': 'fa-handshake',
            'território': 'fa-map', 'territorio': 'fa-map',
            'saúde': 'fa-heart', 'saude': 'fa-heart',
            'meio ambiente': 'fa-leaf', 'sustentabilidade': 'fa-recycle',
            'mel': 'fa-seedling', 'colmeia': 'fa-seedling',
            'pesca': 'fa-fish', 'rio': 'fa-fish',
            'boas-vindas': 'fa-hand-wave', 'introdução': 'fa-hand-wave'
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
        return { 'margin-left': 'calc(50% - 32px + ' + xOffset + 'px)' };
    };

    $scope.getBubbleClass = function(item) {
        if (!item.is_unlocked) return 'duo-bubble duo-locked';
        if (item.percent >= 100) return 'duo-bubble duo-done';
        return 'duo-bubble duo-active';
    };

    $scope.getBubbleDynamic = function(item) {
        if (!item.is_unlocked) return {};
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
        if (!item.is_unlocked) return;

        // Route based on content type already known from trail loading
        if (item.contentType === 'quiz' && item.contentId) {
            $location.path('/quiz/' + item.contentId);
            return;
        }

        // For other types or missing contentId, resolve from folder
        ApiService.folderProgress(item._id, playerId).then(function(data) {
            var items = data.items || [];
            var content = items.find(function(c) { return c.folder === false; });
            if (content) {
                if (content.type === 'quiz' && content.content) {
                    $location.path('/quiz/' + content.content);
                } else if (content.type === 'video') {
                    // TODO: video player route
                    alert('Vídeo em breve!');
                } else if (content.type === 'mission' && content.content) {
                    $location.path('/quiz/' + content.content); // missions use quiz format
                } else {
                    alert('Tipo de conteúdo não suportado ainda.');
                }
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

    init();
})

// === Quiz Controller ===
.controller('QuizCtrl', function($scope, $http, $routeParams, $location, AuthService, ApiService, ThemeService) {
    var session = AuthService.getSession();
    var token = session.token;
    var baseUrl = CONFIG.API_URL;
    var quizId = $routeParams.quizId;
    var playerId = (session.player || {})._id;
    var theme = ThemeService.load(session.apiKey) || {};

    if (theme && theme.colors) ThemeService.apply(theme, false);

    $scope.quizTitle = '';
    $scope.questions = [];
    $scope.currentIndex = 0;
    $scope.loading = true;
    $scope.finished = false;
    $scope.score = 0;
    $scope.quizLogId = null;
    $scope.lessonFolderId = null; // to log folder progress on finish
    $scope.tfAnswer = null;       // TRUE_FALSE selection
    $scope.essayAnswer = '';      // ESSAY / SHORT_ANSWER text
    $scope.diyPhotoData = null;   // DIY_PROJECT photo data URL

    function authHeaders() {
        return { 'Authorization': token, 'Content-Type': 'application/json' };
    }

    // 1. Load quiz info
    $http.get(baseUrl + '/v3/database/quiz?q=_id:\'' + quizId + '\'', {
        headers: { 'Authorization': token }
    }).then(function(res) {
        var quizzes = res.data || [];
        if (quizzes.length > 0) {
            $scope.quizTitle = quizzes[0].title || 'Quiz';
        }

        // 2. Load questions
        return $http.get(baseUrl + '/v3/database/question?sort=position:1&q=quiz:\'' + quizId + '\'', {
            headers: { 'Authorization': token }
        });
    }).then(function(res) {
        var rawQuestions = res.data || [];

        $scope.questions = rawQuestions.map(function(q) {
            var choices = q.choices || q.alternatives || [];
            var type = q.type || 'MULTIPLE_CHOICE';
            var isMultiSelect = (q.select === 'multiple_answers');
            return {
                _id: q._id,
                text: q.question || q.title || q.prompt || '',
                type: type,
                select: q.select || 'one_answer',
                isMultiSelect: isMultiSelect,
                correctAnswer: q.correctAnswer,
                totalLines: q.totalLines || 5,
                evidenceTypes: q.evidenceTypes || [],
                rubric: q.rubric || '',
                options: choices.map(function(c, idx) {
                    return {
                        answer: c.label || String.fromCharCode(65 + idx),
                        text: c.answer || c.label || c.description || c.title || '',
                        correct: !!(c.gradeCheck || c.correct || (c.grade && c.grade > 0)),
                        selected: false
                    };
                }),
                answered: false,
                correct: false,
                correctLabel: ''
            };
        });

        // 3. Start quiz session
        return $http.post(baseUrl + '/v3/quiz/start', {
            quiz: quizId,
            player: playerId
        }, { headers: authHeaders() });
    }).then(function(res) {
        var logData = res.data || {};
        $scope.quizLogId = logData._id || (logData.log && logData.log._id) || null;
        $scope.loading = false;
    }).catch(function(err) {
        console.error('[Quiz] Load error:', err);
        $scope.loading = false;
    });

    // Find the lesson folder that contains this quiz (for folder_log)
    $http.get(baseUrl + '/v3/database/folder_content?q=content:\'' + quizId + '\'', {
        headers: { 'Authorization': token }
    }).then(function(res) {
        var fcs = res.data || [];
        if (fcs.length > 0) {
            $scope.lessonFolderId = fcs[0].folder;
        }
    }).catch(function() {});

    $scope.current = function() {
        return $scope.questions[$scope.currentIndex] || null;
    };

    $scope.selectOption = function(q, opt) {
        if (q.answered) return;
        if (q.isMultiSelect) {
            // Toggle selection (checkboxes)
            opt.selected = !opt.selected;
        } else {
            // Single selection (radio)
            q.options.forEach(function(o) { o.selected = false; });
            opt.selected = true;
        }
    };

    $scope.selectTF = function(val) {
        if ($scope.current() && $scope.current().answered) return;
        $scope.tfAnswer = val;
    };

    // Can the user click "Verificar"?
    $scope.canConfirm = function() {
        var q = $scope.current();
        if (!q) return false;
        if (q.type === 'TRUE_FALSE') return $scope.tfAnswer !== null;
        if (q.type === 'ESSAY' || q.type === 'SHORT_ANSWER') return ($scope.essayAnswer || '').trim().length > 0;
        if (q.type === 'DIY_PROJECT') return ($scope.essayAnswer || '').trim().length > 0 || $scope.diyPhotoData;
        // MULTIPLE_CHOICE (single or multi)
        return q.options && q.options.some(function(o) { return o.selected; });
    };

    $scope.checkAnswer = function(q) {
        if (q.answered) return;
        q.answered = true;

        if (q.type === 'TRUE_FALSE') {
            q.correct = ($scope.tfAnswer === q.correctAnswer);
            if (!q.correct) {
                q.correctLabel = 'A resposta certa era: ' + (q.correctAnswer ? 'Verdadeiro' : 'Falso');
            }
            if (q.correct) $scope.score++;
            logAnswer(q, [$scope.tfAnswer ? 'true' : 'false']);

        } else if (q.type === 'ESSAY' || q.type === 'SHORT_ANSWER') {
            q.correct = true;
            $scope.score++;
            logAnswer(q, [$scope.essayAnswer]);

        } else if (q.type === 'DIY_PROJECT') {
            q.correct = true;
            $scope.score++;
            logAnswer(q, [$scope.essayAnswer || '(foto enviada)']);

        } else if (q.isMultiSelect) {
            // MULTIPLE_CHOICE with multiple_answers
            var selectedOpts = q.options.filter(function(o) { return o.selected; });
            var correctOpts = q.options.filter(function(o) { return o.correct; });
            // All correct selected AND no incorrect selected
            var allCorrectSelected = correctOpts.every(function(o) { return o.selected; });
            var noWrongSelected = selectedOpts.every(function(o) { return o.correct; });
            q.correct = allCorrectSelected && noWrongSelected;
            if (!q.correct) {
                var correctTexts = correctOpts.map(function(o) { return o.text; });
                q.correctLabel = 'Respostas corretas: ' + correctTexts.join(', ');
            }
            if (q.correct) $scope.score++;
            logAnswer(q, selectedOpts.map(function(o) { return o.answer; }));

        } else {
            // MULTIPLE_CHOICE single answer
            var selected = q.options.find(function(o) { return o.selected; });
            q.correct = selected && selected.correct;
            if (!q.correct) {
                var correctOpt = q.options.find(function(o) { return o.correct; });
                if (correctOpt) q.correctLabel = 'Resposta correta: ' + correctOpt.text;
            }
            if (q.correct) $scope.score++;
            if (selected) logAnswer(q, [selected.answer]);
        }
    };

    function logAnswer(q, answerArr) {
        if (!$scope.quizLogId) return;
        $http.post(baseUrl + '/v3/question/log/bulk', [{
            quiz: quizId,
            quiz_log: $scope.quizLogId,
            question: q._id,
            answer: answerArr,
            player: playerId
        }], { headers: authHeaders() }).catch(function() {});
    }

    $scope.next = function() {
        if ($scope.currentIndex < $scope.questions.length - 1) {
            $scope.currentIndex++;
            $scope.tfAnswer = null;
            $scope.essayAnswer = '';
            $scope.diyPhotoData = null;
        } else {
            $scope.finished = true;

            // Calculate score percent
            var scorePercent = $scope.questions.length > 0
                ? Math.round(($scope.score / $scope.questions.length) * 100) : 0;

            // Finish quiz
            if ($scope.quizLogId) {
                $http.post(baseUrl + '/v3/quiz/finish', {
                    quiz_log: $scope.quizLogId
                }, { headers: authHeaders() }).catch(function() {});
            }

            // Log folder progress (lesson completion)
            if ($scope.lessonFolderId) {
                ApiService.folderLog($scope.lessonFolderId, playerId, scorePercent).catch(function(err) {
                    console.warn('[Quiz] folder/log error:', err);
                });
            }
        }
    };

    $scope.goBack = function() {
        window.history.back();
    };

    $scope.progressPercent = function() {
        if ($scope.questions.length === 0) return 0;
        return Math.round((($scope.currentIndex + ($scope.current() && $scope.current().answered ? 1 : 0)) / $scope.questions.length) * 100);
    };

    // DIY_PROJECT: take photo via camera/gallery
    $scope.diyTakePhoto = function() {
        var input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.capture = 'environment';
        input.onchange = function(e) {
            var file = e.target.files[0];
            if (!file) return;
            var reader = new FileReader();
            reader.onload = function(ev) {
                $scope.$apply(function() {
                    $scope.diyPhotoData = ev.target.result;
                });
            };
            reader.readAsDataURL(file);
        };
        input.click();
    };
});
