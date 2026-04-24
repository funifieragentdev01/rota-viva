angular.module('rotaViva')

.factory('AuthService', function($q, $location, ThemeService) {
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
        if (!service.isLoggedIn()) return $q.reject('not_logged_in');
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
        localStorage.clear();
        sessionStorage.clear();
        ThemeService.reset();
        $location.path('/login');
    };

    service.deleteAccount = function() {
        var token = localStorage.getItem('rv_token');
        return $q(function(resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open('DELETE', CONFIG.API_URL + '/v3/player/me');
            xhr.setRequestHeader('Authorization', token);
            xhr.onload = function() {
                if (xhr.status >= 200 && xhr.status < 300) {
                    service.logout();
                    resolve();
                } else {
                    reject(xhr.status);
                }
            };
            xhr.onerror = function() { reject('network_error'); };
            xhr.send();
        });
    };

    return service;
});
