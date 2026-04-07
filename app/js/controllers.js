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

    // Route-specific character image and title
    var routeId = preTheme ? preTheme.routeId : null;
    // Fallback: detect route from profile name
    if (!routeId && preTheme && preTheme.profile) {
        if (preTheme.profile === 'apicultor') routeId = 'mel';
        if (preTheme.profile === 'pescador') routeId = 'pesca';
    }
    // Fallback: detect from title
    if (!routeId && preTheme && preTheme.title) {
        var t = preTheme.title.toLowerCase();
        if (t.indexOf('mel') >= 0 || t.indexOf('colmeia') >= 0) routeId = 'mel';
        if (t.indexOf('pesca') >= 0 || t.indexOf('rio') >= 0) routeId = 'pesca';
    }
    if (!routeId) {
        var session = AuthService.getSession();
        if (session && session.route && session.route._id) routeId = session.route._id;
    }
    // Last fallback: check stored route in localStorage
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

        if (!$scope.form.name || !$scope.form.cpf || !$scope.form.password || !$scope.form.profile || !$scope.form.phone) {
            $scope.error = 'Preencha todos os campos obrigatórios, incluindo o telefone/WhatsApp.';
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
.controller('DashboardCtrl', function($scope, $location, AuthService, ThemeService, ApiService) {
    var session = AuthService.getSession();
    $scope.player = session.player || {};
    $scope.route = session.route || {};
    $scope.theme = ThemeService.load(session.apiKey) || {};
    var playerId = ($scope.player || {})._id;

    // Gamification state
    $scope.totalPoints = 0;
    $scope.levelName = 'Carregando...';
    $scope.levelPosition = 0;
    $scope.levelPercent = 0;
    $scope.nextLevelName = '';
    $scope.nextPoints = 0;
    $scope.totalLevels = 0;
    $scope.streak = 0;
    $scope.statusLoaded = false;
    $scope.showLevelUp = false;

    if ($scope.theme && $scope.theme.colors) {
        ThemeService.apply($scope.theme, false);
    }

    // Fetch player status (points, level, progress)
    if (playerId) {
        ApiService.getPlayerStatus(playerId).then(function(status) {
            $scope.totalPoints = Math.floor(status.total_points || 0);
            var lp = status.level_progress || {};
            var level = lp.level || {};
            $scope.levelName = level.level || 'Iniciante';
            $scope.levelPosition = level.position || 0;
            $scope.levelPercent = Math.round(lp.percent_completed || 0);
            $scope.nextLevelName = (lp.next_level || {}).level || '';
            $scope.nextPoints = Math.ceil(lp.next_points || 0);
            $scope.totalLevels = lp.total_levels || 0;
            $scope.statusLoaded = true;
        }).catch(function() {
            $scope.levelName = 'Iniciante';
            $scope.statusLoaded = true;
        });

        // Calculate streak from action logs (consecutive days with activity)
        ApiService.getActionLogs(playerId, 60).then(function(logs) {
            $scope.streak = calculateStreak(logs);
        }).catch(function() {
            $scope.streak = 0;
        });
    }

    function calculateStreak(logs) {
        if (!logs || logs.length === 0) return 0;

        // Get unique days with activity (in local timezone)
        var days = {};
        logs.forEach(function(log) {
            var d = new Date(log.time);
            var key = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
            days[key] = true;
        });

        // Count consecutive days ending today or yesterday
        var today = new Date();
        var streak = 0;
        var check = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        // Check if today has activity, if not start from yesterday
        var todayKey = check.getFullYear() + '-' + (check.getMonth() + 1) + '-' + check.getDate();
        if (!days[todayKey]) {
            check.setDate(check.getDate() - 1);
        }

        while (true) {
            var key = check.getFullYear() + '-' + (check.getMonth() + 1) + '-' + check.getDate();
            if (days[key]) {
                streak++;
                check.setDate(check.getDate() - 1);
            } else {
                break;
            }
        }
        return streak;
    }

    $scope.goTrail = function() {
        $location.path('/trail');
    };

    $scope.goGallery = function() {
        $location.path('/gallery');
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
    var route = session.route || {};
    var routeId = route._id
        || (route.profile === 'pescador' ? 'pesca' : null)
        || (route.profile === 'apicultor' ? 'mel' : null)
        || 'mel';
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
    var ROUTE_NAMES = { mel: 'Rota do Mel', pesca: 'Rota da Pesca' };

    // === Character config per route ===
    var CHARACTERS = {
        mel:   ['abelha', 'apicultor', 'filho-apicultor'],
        pesca: ['peixe', 'pescador', 'filho-pescador']
    };
    var LESSONS_PER_CURVE = 8; // Duolingo: ~8 lessons = 1 full S-curve
    var charList = CHARACTERS[routeId] || CHARACTERS.mel;
    var charBasePath = 'img/characters/' + routeId + '/trail/';

    var folderId = $routeParams.folderId || null;

    // Fetch player points and streak for header display
    $scope.playerPoints = 0;
    $scope.playerStreak = 0;
    if (playerId) {
        ApiService.getPlayerStatus(playerId).then(function(status) {
            $scope.playerPoints = Math.floor(status.total_points || 0);
        }).catch(function() {});

        ApiService.getActionLogs(playerId, 60).then(function(logs) {
            if (!logs || logs.length === 0) return;
            var days = {};
            logs.forEach(function(log) {
                var d = new Date(log.time);
                days[d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate()] = true;
            });
            var check = new Date();
            var streak = 0;
            var todayKey = check.getFullYear() + '-' + (check.getMonth() + 1) + '-' + check.getDate();
            if (!days[todayKey]) check.setDate(check.getDate() - 1);
            while (true) {
                var key = check.getFullYear() + '-' + (check.getMonth() + 1) + '-' + check.getDate();
                if (days[key]) { streak++; check.setDate(check.getDate() - 1); } else break;
            }
            $scope.playerStreak = streak;
        }).catch(function() {});
    }

    // Active module for sticky box (scroll-based)
    $scope.activeModule = null;

    function init() {
        if (folderId) {
            loadSubjectTrail(folderId);
        } else {
            loadRootFolder();
        }
    }

    // Find root folder (type: subject, no parent) and redirect directly
    function loadRootFolder() {
        $scope.loading = true;
        ApiService.folderInside(null).then(function(data) {
            var items = data.items || [];
            // Find first folder with type 'subject' (no parent implied by folderInside(null))
            var rootFolder = items.find(function(i) {
                return i.folder !== false && i.type === 'subject';
            });
            // Fallback: first folder of any type
            if (!rootFolder) {
                rootFolder = items.find(function(i) { return i.folder !== false; });
            }
            if (rootFolder) {
                $location.path('/trail/' + rootFolder._id).replace();
            } else {
                // No folders found — show empty state inline
                $scope.loading = false;
                $scope.level = 'subject';
                $scope.trailItems = [];
                $scope.trailLoading = false;
            }
        }).catch(function() {
            $scope.loading = false;
            $scope.level = 'subject';
            $scope.trailItems = [];
            $scope.trailLoading = false;
        });
    }

    // Subject level: Duolingo S-curve with modules and lessons
    function loadSubjectTrail(subjectId) {
        $scope.level = 'subject';
        $scope.trailLoading = true;

        // Set fallback title, then override with folder subject
        $scope.title = ROUTE_NAMES[routeId] || 'Trilha';
        ApiService.dbGet('folder', subjectId).then(function(folder) {
            if (folder && folder.subject) {
                $scope.title = folder.subject;
            }
        }).catch(function() {});

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
        var globalLessonIdx = 0;
        var charIdx = 0; // cycles through charList

        modules.forEach(function(mod, modIdx) {
            mod.moduleIndex = modIdx;
            flat.push(mod);
            var lessons = items.filter(function(i) { return i._type === 'lesson' && i.moduleId === mod._id; })
                .sort(function(a, b) { return (a.position || 0) - (b.position || 0); });

            lessons.forEach(function(l, idx) {
                l.lessonIndex = idx;
                l.globalIndex = globalLessonIdx;
                l.icon = getLessonIcon(l);
                globalLessonIdx++;

                // Character every 5 global lessons (at globalIndex 2, 7, 12, 17...)
                // Guard: never place character if the previous flat item is a module header
                if (l.globalIndex % 5 === 2) {
                    var prevItem = flat.length > 0 ? flat[flat.length - 1] : null;
                    if (!prevItem || prevItem._type !== 'module') {
                        var charName = charList[charIdx % charList.length];
                        l._charImg = charBasePath + charName + '.png';
                        l._charName = charName;
                        charIdx++;
                    }
                }

                flat.push(l);
            });
        });

        // Initialize active module to first module
        var firstModule = flat.find(function(i) { return i._type === 'module'; });
        if (firstModule) $scope.activeModule = firstModule;

        $scope.trailItems = flat;
        $scope.trailLoading = false;
        $scope.$applyAsync();

        // Setup scroll-based sticky module observer after DOM renders
        $timeout(function() {
            setupModuleScrollObserver();

            // Auto-scroll to first available lesson
            for (var i = 0; i < flat.length; i++) {
                if (flat[i]._type === 'lesson' && flat[i].is_unlocked && flat[i].percent < 100) {
                    var el = document.getElementById('trail-item-' + flat[i]._id);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    break;
                }
            }
        }, 350);
    }

    // Scroll observer: updates activeModule based on which module divider is at the top
    function setupModuleScrollObserver() {
        var lastModuleId = null;

        function updateActiveModule() {
            var dividers = document.querySelectorAll('.duo-module-divider[data-mid]');
            if (!dividers.length) return;

            // Measure sticky header height dynamically
            var headerEl = document.querySelector('.trail-header');
            var stickyEl = document.querySelector('.duo-sticky-module');
            var threshold = (headerEl ? headerEl.offsetHeight : 56) +
                            (stickyEl ? stickyEl.offsetHeight : 54) + 8;

            var activeDivider = null;
            dividers.forEach(function(el) {
                if (el.getBoundingClientRect().top <= threshold) {
                    activeDivider = el;
                }
            });

            if (!activeDivider) {
                // Above first divider — first module is active
                activeDivider = dividers[0];
            }

            var mid = activeDivider.getAttribute('data-mid');
            if (mid && mid !== lastModuleId) {
                lastModuleId = mid;
                for (var i = 0; i < $scope.trailItems.length; i++) {
                    if ($scope.trailItems[i]._id === mid) {
                        $scope.$apply(function() {
                            $scope.activeModule = $scope.trailItems[i];
                        });
                        break;
                    }
                }
            }
        }

        window.addEventListener('scroll', updateActiveModule, { passive: true });
        $scope.$on('$destroy', function() {
            window.removeEventListener('scroll', updateActiveModule);
        });

        // Initial call to set correct module on load
        updateActiveModule();
    }

    // Icon per content type (Duolingo style)
    var CONTENT_ICONS = {
        'quiz':    'fa-star',       // ⭐ estrela
        'video':   'fa-play',       // ▶️ play
        'mission': 'fa-wrench',     // 🔧 ferramenta
        'diy':     'fa-camera',     // 📷 registro de campo (substitui Diário)
        'essay':   'fa-comment',    // 💬 escuta ativa (substitui Escuta Ativa)
        'chest':   'fa-gem'         // 💎 baú (timed quiz reward)
    };

    function getLessonIcon(lesson) {
        // Always show content type icon (locked state = gray color, not different icon)
        var typeIcon = CONTENT_ICONS[lesson.contentType];
        if (typeIcon) return typeIcon;
        // Unknown content type: show lock if blocked, check if done, star otherwise
        if (!lesson.is_unlocked) return 'fa-lock';
        if (lesson.percent >= 100) return 'fa-check';
        return 'fa-star';
    }

    // Character positioning — absolute within duo-bubble-wrap (opposite side of curve)
    $scope.getCharacterStyle = function(item) {
        if (!item._charImg) return { display: 'none' };
        var xOffset = Math.sin(item.lessonIndex * 0.8) * 70;
        var style = { position: 'absolute', top: '-80px' };
        if (xOffset >= 0) {
            // Bubble is to the RIGHT → character goes LEFT
            style.right = 'auto';
            style.left = '-230px';
        } else {
            // Bubble is to the LEFT → character goes RIGHT
            style.left = 'auto';
            style.right = '-230px';
        }
        return style;
    };

    $scope.isChest = function(item) {
        return item._type === 'lesson' && item.contentType === 'chest';
    };

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
        return { 'margin-left': 'calc(50% - 36px + ' + xOffset + 'px)' };
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
        if (item.contentType === 'video') {
            // contentId = video__c._id (if linked) or folder_content._id (fallback)
            var vid = item.contentId || item._foldContentId;
            if (vid) { $location.path('/video/' + vid); return; }
        }
        if (item.contentType === 'mission' && item.contentId) {
            $location.path('/quiz/' + item.contentId); // missions use quiz format
            return;
        }
        if (item.contentType === 'chest' && item.contentId) {
            $location.path('/quiz/' + item.contentId); // chest = timed quiz
            return;
        }

        // Fallback: resolve content from folder
        ApiService.folderProgress(item._id, playerId).then(function(data) {
            var items = data.items || [];
            var content = items.find(function(c) { return c.folder === false; });
            if (content) {
                if (content.type === 'quiz' && content.content) {
                    $location.path('/quiz/' + content.content);
                } else if (content.type === 'video' && content.content) {
                    $location.path('/video/' + content.content);
                } else if (content.type === 'mission' && content.content) {
                    $location.path('/quiz/' + content.content);
                } else {
                    alert('Tipo de conteúdo não suportado ainda.');
                }
            }
        });
    };

    $scope.goBack = function() {
        $location.path('/dashboard');
    };

    $scope.goHome = function() {
        $location.path('/dashboard');
    };

    $scope.goGallery = function() {
        $location.path('/gallery');
    };

    init();
})

// === Video Controller ===
.controller('VideoCtrl', function($scope, $http, $routeParams, $location, $sce, AuthService, ApiService, ThemeService) {
    var session = AuthService.getSession();
    var token = session.token;
    var baseUrl = CONFIG.API_URL;
    var videoId = $routeParams.videoId;
    var playerId = (session.player || {})._id;
    var theme = ThemeService.load(session.apiKey) || {};

    if (theme && theme.colors) ThemeService.apply(theme, false);

    $scope.loading = true;
    $scope.title = '';
    $scope.embedUrl = null;
    $scope.completed = false;
    $scope.themeColor = (theme.colors && theme.colors.primary) || '#FF9600';
    var lessonFolderId = null;

    function setVideo(title, url) {
        $scope.title = title || 'Vídeo';
        $scope.rawEmbedUrl = toEmbedUrl(url);
        $scope.embedUrl = $sce.trustAsResourceUrl($scope.rawEmbedUrl);
        console.log('[Video] Embed URL:', $scope.rawEmbedUrl);
    }

    function init() {
        // Try video__c first, then fall back to folder_content
        ApiService.dbGet('video__c', videoId).then(function(data) {
            if (data && data.url) {
                setVideo(data.title, data.url);
                $scope.loading = false;
            } else {
                loadFromFolderContent();
            }
        }).catch(function() {
            loadFromFolderContent();
        });
    }

    function loadFromFolderContent() {
        ApiService.dbGet('folder_content', videoId).then(function(fc) {
            if (fc && fc.extra && fc.extra.url) {
                setVideo(fc.title, fc.extra.url);
                $scope.loading = false;
            } else if (fc && fc.content) {
                ApiService.dbGet('video__c', fc.content).then(function(v) {
                    if (v && v.url) {
                        setVideo(v.title || fc.title, v.url);
                    }
                    $scope.loading = false;
                }).catch(function() { $scope.loading = false; });
            } else {
                console.error('[Video] No video data for:', videoId);
                $scope.loading = false;
            }
        }).catch(function() {
            console.error('[Video] Failed to load:', videoId);
            $scope.loading = false;
        });
    }

    // Convert YouTube URLs to embed format
    function toEmbedUrl(url) {
        if (!url) return '';
        // youtu.be/ID or youtube.com/watch?v=ID
        var match = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
            return 'https://www.youtube.com/embed/' + match[1] + '?rel=0';
        }
        // Already an embed URL or other video
        return url;
    }

    // Find the folder_content record for this video (for folder_log unlock)
    var folderContentId = null;
    $http.get(baseUrl + '/v3/database/folder_content?q=content:\'' + videoId + '\'', {
        headers: { 'Authorization': token }
    }).then(function(res) {
        var fcs = res.data || [];
        if (fcs.length > 0) {
            folderContentId = fcs[0]._id;
            console.log('[Video] Found folder_content by content:', folderContentId);
        } else {
            // videoId might be the folder_content _id itself
            $http.get(baseUrl + '/v3/database/folder_content?q=_id:\'' + videoId + '\'', {
                headers: { 'Authorization': token }
            }).then(function(res2) {
                var fcs2 = res2.data || [];
                if (fcs2.length > 0) {
                    folderContentId = fcs2[0]._id;
                    console.log('[Video] Found folder_content by _id:', folderContentId);
                }
            }).catch(function() {});
        }
    }).catch(function() {});

    $scope.markDone = function() {
        $scope.completed = true;
        // Register folder_log with folder_content._id (same pattern as Tutor)
        if (folderContentId && playerId) {
            ApiService.folderLog(folderContentId, playerId, 100).then(function() {
                console.log('[Video] folder/log OK for folder_content:', folderContentId);
            }).catch(function(err) {
                console.warn('[Video] folder/log error:', err);
            });
        } else {
            console.warn('[Video] No folderContentId or playerId, cannot log completion. videoId=' + videoId);
        }
        // Log action for gamification (points/challenges)
        if (playerId) {
            ApiService.logAction('complete_lesson', playerId, {
                lesson_type: 'video',
                lesson_id: videoId,
                score: 100
            }).catch(function(err) {
                console.warn('[Video] action/log error:', err);
            });
        }
    };

    $scope.goBack = function() {
        window.history.back();
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
    $scope.form = { essayAnswer: '' };  // object to survive ng-if child scopes
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

    // Find the folder_content record for this quiz (for folder_log)
    $http.get(baseUrl + '/v3/database/folder_content?q=content:\'' + quizId + '\'', {
        headers: { 'Authorization': token }
    }).then(function(res) {
        var fcs = res.data || [];
        if (fcs.length > 0) {
            $scope.lessonFolderId = fcs[0]._id; // folder_content._id, NOT folder
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
        if (q.type === 'ESSAY' || q.type === 'SHORT_ANSWER') return ($scope.form.essayAnswer || '').trim().length > 0;
        if (q.type === 'DIY_PROJECT') return ($scope.form.essayAnswer || '').trim().length > 0 || $scope.diyPhotoData;
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
            logAnswer(q, [$scope.form.essayAnswer]);

        } else if (q.type === 'DIY_PROJECT') {
            q.correct = true;
            $scope.score++;
            logAnswer(q, [$scope.form.essayAnswer || '(foto enviada)']);

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

        // Audio feedback
        playSound(q.correct ? 'correct' : 'wrong');
    };

    function playSound(type) {
        try {
            if (type === 'correct') {
                new Audio('audio/beep.mp3').play();
            }
        } catch(e) {}
    }

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
            $scope.form.essayAnswer = '';
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

            // Log action for gamification (points/challenges)
            if (playerId) {
                ApiService.logAction('complete_lesson', playerId, {
                    lesson_type: 'quiz',
                    lesson_id: quizId,
                    score: scorePercent
                }).catch(function(err) {
                    console.warn('[Quiz] action/log error:', err);
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
})

// === Gallery Controller ===
.controller('GalleryCtrl', function($scope, $location, $timeout, AuthService, ApiService, ThemeService) {
    var session = AuthService.getSession();
    var playerId = (session.player || {})._id;
    var theme = ThemeService.load(session.apiKey) || {};

    if (theme && theme.colors) ThemeService.apply(theme, false);

    $scope.theme = theme;
    $scope.loading = true;
    $scope.posts = [];
    $scope.topUsers = [];

    function timeAgo(dateStr) {
        if (!dateStr) return '';
        var diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
        if (diff < 60) return 'agora';
        if (diff < 3600) return Math.floor(diff / 60) + 'min';
        if (diff < 86400) return Math.floor(diff / 3600) + 'h';
        return Math.floor(diff / 86400) + 'd';
    }

    function normalizePost(p) {
        return angular.extend({}, p, {
            _authorName: p.author_name || p.player_name || 'Produtor',
            _authorPhoto: p.author_photo || p.player_photo || null,
            _municipality: (p.extra && p.extra.municipality) || p.municipality || '',
            _hashtag: (p.extra && p.extra.hashtag) || p.hashtag || '',
            _isOfficial: !!(p.extra && p.extra.is_official),
            _isTop: !!(p.extra && p.extra.is_top),
            _likeCount: p.like_count || p.likes || 0,
            _liked: false,
            _timeAgo: timeAgo(p.created || p.time)
        });
    }

    // Load posts
    ApiService.getGalleryPosts(20, 0).then(function(data) {
        $scope.posts = (data || []).map(normalizePost);
    }).catch(function() {
        $scope.posts = [];
    }).finally(function() {
        $scope.loading = false;
    });

    // Load top users
    ApiService.getTopUsers().then(function(data) {
        var items = Array.isArray(data) ? data : (data.items || data.leaderboard || []);
        $scope.topUsers = items.slice(0, 5).map(function(u) {
            return {
                _id: u.player || u._id,
                name: u.player_name || u.name || 'Produtor',
                photo: u.player_photo || u.photo || null
            };
        });
    }).catch(function() {
        $scope.topUsers = [];
    });

    $scope.toggleLike = function(post) {
        post._liked = !post._liked;
        post._likeCount += post._liked ? 1 : -1;
        if (post._liked && playerId) {
            ApiService.likePost(post._id, playerId).catch(function() {
                post._liked = false;
                post._likeCount--;
            });
        }
    };

    $scope.sharePost = function(post) {
        if (navigator.share) {
            navigator.share({
                title: 'Rota Viva',
                text: post.description || post.text || '',
                url: window.location.origin
            }).catch(function() {});
        }
    };

    $scope.openNewPost = function() {
        // TODO: tela de nova publicação
        alert('Em breve: publicar na Galeria!');
    };

    $scope.postMenu = function($event, post) {
        $event.stopPropagation();
    };

    $scope.goHome = function() { $location.path('/dashboard'); };
    $scope.goTrail = function() { $location.path('/trail'); };
    $scope.goPerfil = function() { /* TODO: perfil */ };
});
