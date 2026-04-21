angular.module('rotaViva', ['ngRoute', 'ngSanitize', 'duoTrail'])

.filter('capitalize', function() {
    return function(input) {
        if (!input) return '';
        return input.charAt(0).toUpperCase() + input.slice(1);
    };
})

.filter('firstWord', function() {
    return function(input) {
        if (!input) return '';
        return input.split(' ')[0];
    };
})

.filter('trustHtml', function($sce) {
    return function(input) {
        return $sce.trustAsHtml(input || '');
    };
})

// Cache-busting: append ?v=VERSION to all /v3/ API requests
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
            templateUrl: 'pages/landing/landing.html',
            controller: 'LandingCtrl'
        })
        .when('/mel', {
            templateUrl: 'pages/rota/rota.html',
            controller: 'RotaCtrl'
        })
        .when('/pesca', {
            templateUrl: 'pages/rota/rota.html',
            controller: 'RotaCtrl'
        })
        .when('/login', {
            templateUrl: 'pages/login/login.html',
            controller: 'LoginCtrl'
        })
        .when('/onboarding', {
            templateUrl: 'pages/onboarding/onboarding.html',
            controller: 'OnboardingCtrl'
        })
        .when('/signup', {
            templateUrl: 'pages/signup/signup.html',
            controller: 'SignupCtrl'
        })
        .when('/dashboard', {
            templateUrl: 'pages/dashboard/dashboard.html',
            controller: 'DashboardCtrl',
            resolve: { auth: function(AuthService) { return AuthService.requireAuth(); } }
        })
        .when('/trail', {
            templateUrl: 'pages/trail/trail.html',
            controller: 'TrailCtrl',
            resolve: { auth: function(AuthService) { return AuthService.requireAuth(); } }
        })
        .when('/trail/:folderId', {
            templateUrl: 'pages/trail/trail.html',
            controller: 'TrailCtrl',
            resolve: { auth: function(AuthService) { return AuthService.requireAuth(); } }
        })
        .when('/video/:videoId', {
            templateUrl: 'pages/video/video.html',
            controller: 'VideoCtrl',
            resolve: { auth: function(AuthService) { return AuthService.requireAuth(); } }
        })
        .when('/quiz/:quizId', {
            templateUrl: 'pages/quiz/quiz.html',
            controller: 'QuizCtrl',
            resolve: { auth: function(AuthService) { return AuthService.requireAuth(); } }
        })
        .when('/reading/:readingId', {
            templateUrl: 'pages/reading/reading.html',
            controller: 'ReadingCtrl',
            resolve: { auth: function(AuthService) { return AuthService.requireAuth(); } }
        })
        .when('/story/:storyId', {
            templateUrl: 'pages/story/story.html',
            controller: 'StoryCtrl',
            resolve: { auth: function(AuthService) { return AuthService.requireAuth(); } }
        })
        .when('/gallery', {
            templateUrl: 'pages/gallery/gallery.html',
            controller: 'GalleryCtrl',
            resolve: { auth: function(AuthService) { return AuthService.requireAuth(); } }
        })
        .when('/profile', {
            templateUrl: 'pages/profile/profile.html',
            controller: 'ProfileCtrl',
            resolve: { auth: function(AuthService) { return AuthService.requireAuth(); } }
        })
        .otherwise({ redirectTo: '/trail' });
})

.run(function($rootScope, $location, AuthService, ThemeService) {
    $rootScope.CONFIG = CONFIG;

    $rootScope.$on('$routeChangeError', function() {
        $location.path('/login');
    });

    $rootScope.$on('$routeChangeStart', function(event, next) {
        if (!next || !next.$$route) return;
        var path = next.$$route.originalPath;

        if (AuthService.isLoggedIn() && (path === '/login' || path === '/signup')) {
            event.preventDefault();
            $location.path('/trail');
            return;
        }

        if (path === '/login' || path === '/signup') {
            var pre = ThemeService.getPreTheme();
            if (pre && pre.colors) ThemeService.apply({ colors: pre.colors }, false);
        }

        // Reaplica o tema cacheado ao entrar no onboarding (preTheme já foi limpo neste ponto)
        if (path === '/onboarding' && AuthService.isLoggedIn()) {
            var onbSession = AuthService.getSession();
            if (onbSession && onbSession.apiKey) {
                var onbTheme = ThemeService.load(onbSession.apiKey);
                if (onbTheme) ThemeService.apply(onbTheme, false);
            }
        }

        if (path === '/home' || path === '/mel' || path === '/pesca') ThemeService.reset();
    });

    if (AuthService.isLoggedIn()) {
        var session = AuthService.getSession();
        if (session.apiKey) {
            var cached = ThemeService.load(session.apiKey);
            if (cached) ThemeService.apply(cached, false);
        }
    }
})

// MainCtrl — used as ng-controller on <body>
.controller('MainCtrl', function($scope) {
    $scope.loading = false;
});
