angular.module('rotaViva')

// === CPF Sanitization ===
.factory('CPFService', function() {
    return {
        sanitize: function(cpf) {
            if (!cpf) return '';
            var digits = cpf.replace(/\D/g, '');
            var num = Number(digits);
            return String(num);
        },
        format: function(cpf) {
            var d = cpf.replace(/\D/g, '').padStart(11, '0');
            return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        },
        validate: function(cpf) {
            var d = cpf.replace(/\D/g, '');
            if (d.length !== 11) return false;
            if (/^(\d)\1{10}$/.test(d)) return false;
            // Dígitos verificadores
            for (var t = 9; t < 11; t++) {
                var sum = 0;
                for (var i = 0; i < t; i++) {
                    sum += parseInt(d.charAt(i)) * ((t + 1) - i);
                }
                var digit = ((10 * sum) % 11) % 10;
                if (parseInt(d.charAt(t)) !== digit) return false;
            }
            return true;
        }
    };
})

// === Auth Service ===
.factory('AuthService', function($q, $location) {
    var service = {};

    service.isLoggedIn = function() {
        return !!localStorage.getItem('rv_token');
    };

    service.isTokenExpired = function() {
        var expiresAt = localStorage.getItem('rv_token_expires_at');
        if (!expiresAt) return true;
        return new Date(expiresAt).getTime() < Date.now();
    };

    service.requireAuth = function() {
        if (!service.isLoggedIn()) {
            return $q.reject('not_logged_in');
        }
        if (service.isTokenExpired()) {
            service.logout();
            return $q.reject('token_expired');
        }
        return $q.resolve(true);
    };

    service.saveSession = function(data) {
        localStorage.setItem('rv_token', data.token);
        localStorage.setItem('rv_token_expires_at', data.token_expires_at);
        localStorage.setItem('rv_api_key', data.api_key);
        localStorage.setItem('rv_route', JSON.stringify(data.route));
        localStorage.setItem('rv_player', JSON.stringify(data.player));
    };

    service.getSession = function() {
        try {
            return {
                token: localStorage.getItem('rv_token'),
                tokenExpiresAt: localStorage.getItem('rv_token_expires_at'),
                apiKey: localStorage.getItem('rv_api_key'),
                route: JSON.parse(localStorage.getItem('rv_route') || '{}'),
                player: JSON.parse(localStorage.getItem('rv_player') || '{}')
            };
        } catch (e) {
            return {};
        }
    };

    service.logout = function() {
        var keys = ['rv_token', 'rv_token_expires_at', 'rv_api_key', 'rv_route', 'rv_player'];
        keys.forEach(function(k) { localStorage.removeItem(k); });
        $location.path('/login');
    };

    return service;
})

// === API Service ===
.factory('ApiService', function($http, $q, CPFService) {
    var api = {};
    var baseUrl = CONFIG.API_URL;
    var centralKey = CONFIG.CENTRAL_API_KEY;
    var publicToken = CONFIG.PUBLIC_TOKEN;

    // Signup
    api.signup = function(data) {
        var payload = {
            _id: CPFService.sanitize(data.cpf),
            name: data.name.trim(),
            password: data.password,
            profile: data.profile
        };
        if (data.email && data.email.trim()) payload.email = data.email.trim();
        if (data.phone && data.phone.trim()) payload.phone = data.phone.trim();

        return $http.put(baseUrl + '/v3/database/signup__c', payload, {
            headers: { 'Authorization': publicToken }
        }).then(function(res) {
            return res.data;
        });
    };

    // Login
    api.login = function(cpf, password) {
        return $http.post(baseUrl + '/v3/pub/' + centralKey + '/login', {
            cpf: CPFService.sanitize(cpf),
            password: password
        }).then(function(res) {
            return res.data;
        });
    };

    // List routes (public)
    api.getRoutes = function() {
        return $http.post(baseUrl + '/v3/find/rota_info', {}, {
            headers: { 'Authorization': publicToken }
        }).then(function(res) {
            return res.data;
        });
    };

    return api;
});
