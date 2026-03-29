angular.module('rotaViva', ['ngRoute'])

.filter('capitalize', function() {
    return function(input) {
        if (!input) return '';
        return input.charAt(0).toUpperCase() + input.slice(1);
    };
})

// Cache-busting: append ?v=VERSION to all $http requests to the API
.config(function($httpProvider) {
    $httpProvider.interceptors.push(function() {
        return {
            request: function(config) {
                if (config.url && config.url.indexOf('/v3/') !== -1) {
                    config.url += (config.url.indexOf('?') > -1 ? '&' : '?') + 'v=' + (CONFIG.VERSION || '0');
                }
                return config;
            }
        };
    });
})

.config(function($routeProvider) {
    $routeProvider
        .when('/home', {
            templateUrl: 'views/landing.html',
            controller: 'LandingCtrl'
        })
        .when('/login', {
            templateUrl: 'views/login.html',
            controller: 'LoginCtrl'
        })
        .when('/signup', {
            templateUrl: 'views/signup.html',
            controller: 'SignupCtrl'
        })
        .when('/dashboard', {
            templateUrl: 'views/dashboard.html',
            controller: 'DashboardCtrl',
            resolve: { auth: function(AuthService) { return AuthService.requireAuth(); } }
        })
        .when('/trail', {
            templateUrl: 'views/trail.html',
            controller: 'TrailCtrl',
            resolve: { auth: function(AuthService) { return AuthService.requireAuth(); } }
        })
        .when('/trail/:folderId', {
            templateUrl: 'views/trail.html',
            controller: 'TrailCtrl',
            resolve: { auth: function(AuthService) { return AuthService.requireAuth(); } }
        })
        .when('/quiz/:quizId', {
            templateUrl: 'views/quiz.html',
            controller: 'QuizCtrl',
            resolve: { auth: function(AuthService) { return AuthService.requireAuth(); } }
        })
        .otherwise({ redirectTo: '/home' });
})

.run(function($rootScope, $location, AuthService, ThemeService) {
    $rootScope.CONFIG = CONFIG;
    $rootScope.$on('$routeChangeError', function() {
        $location.path('/login');
    });

    $rootScope.$on('$routeChangeStart', function(event, next) {
        if (!next || !next.$$route) return;
        var path = next.$$route.originalPath;

        // Se logado, redirecionar login/signup pro dashboard
        if (AuthService.isLoggedIn() && (path === '/login' || path === '/signup')) {
            event.preventDefault();
            $location.path('/dashboard');
            return;
        }

        // Aplicar pré-tema se existir (vindo da landing)
        if (path === '/login' || path === '/signup') {
            var pre = ThemeService.getPreTheme();
            if (pre && pre.colors) {
                ThemeService.apply({ colors: pre.colors }, false);
            }
        }

        // Reset tema na landing
        if (path === '/home') {
            ThemeService.reset();
        }
    });

    // Se tem sessão salva, aplicar tema da rota
    if (AuthService.isLoggedIn()) {
        var session = AuthService.getSession();
        if (session.apiKey) {
            var cached = ThemeService.load(session.apiKey);
            if (cached) ThemeService.apply(cached, false);
        }
    }
});
