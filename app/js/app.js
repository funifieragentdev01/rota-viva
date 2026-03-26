angular.module('rotaViva', ['ngRoute'])

.filter('capitalize', function() {
    return function(input) {
        if (!input) return '';
        return input.charAt(0).toUpperCase() + input.slice(1);
    };
})

.config(function($routeProvider, $locationProvider) {
    $routeProvider
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
        .otherwise({ redirectTo: '/login' });
})

.run(function($rootScope, $location, AuthService) {
    $rootScope.$on('$routeChangeError', function() {
        $location.path('/login');
    });

    $rootScope.$on('$routeChangeStart', function(event, next) {
        // Se já logado e tentando acessar login/signup, redirecionar pro dashboard
        if (AuthService.isLoggedIn() && (next.$$route && (next.$$route.originalPath === '/login' || next.$$route.originalPath === '/signup'))) {
            event.preventDefault();
            $location.path('/dashboard');
        }
    });
});
