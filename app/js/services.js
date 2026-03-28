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

// === Theme Service ===
.factory('ThemeService', function() {
    var service = {};
    var NEUTRAL_THEME = {
        colors: {
            primary: '#005CAB',
            primary_dark: '#003D75',
            primary_light: '#DDEEFF',
            accent: '#F5C200',
            background: '#F5F9FF',
            background_gradient: 'none',
            surface: '#FFFFFF',
            card: '#FFFFFF',
            card_border: 'rgba(0, 92, 171, 0.15)',
            input_bg: 'rgba(0, 0, 0, 0.04)',
            text: '#0A1929',
            text_muted: '#2A4A6B',
            text_faint: '#7A9BBF',
            text_on_primary: '#FFFFFF',
            success: '#2E7D32',
            error: '#C62828',
            warning: '#E65100'
        }
    };

    // Mapa de cores → CSS variables
    var COLOR_MAP = {
        primary: '--color-primary',
        primary_dark: '--color-primary-dark',
        primary_light: '--color-primary-light',
        accent: '--color-accent',
        background: '--color-bg',
        background_gradient: '--color-bg-gradient',
        surface: '--color-surface',
        card: '--color-card',
        card_border: '--color-card-border',
        input_bg: '--color-input-bg',
        text: '--color-text',
        text_muted: '--color-text-muted',
        text_faint: '--color-text-faint',
        text_on_primary: '--color-text-on-primary',
        success: '--color-success',
        error: '--color-error',
        warning: '--color-warning'
    };

    service.apply = function(theme, animate) {
        var root = document.documentElement;
        var c = (theme && theme.colors) || {};

        if (animate) {
            document.body.classList.add('theme-transitioning');
            document.body.classList.remove('theme-ready');
        }

        // Aplicar cores
        Object.keys(COLOR_MAP).forEach(function(key) {
            if (c[key]) root.style.setProperty(COLOR_MAP[key], c[key]);
        });

        // Background pattern
        if (theme && theme.images && theme.images.background_pattern) {
            root.style.setProperty('--img-background', 'url(' + theme.images.background_pattern + ')');
        }

        if (animate) {
            setTimeout(function() {
                document.body.classList.remove('theme-transitioning');
                document.body.classList.add('theme-ready');
            }, 50);
        }
    };

    service.reset = function() {
        service.apply(NEUTRAL_THEME, false);
        // Limpar inline styles
        var root = document.documentElement;
        Object.values(COLOR_MAP).forEach(function(v) {
            root.style.removeProperty(v);
        });
        root.style.removeProperty('--img-background');
    };

    service.save = function(apiKey, theme) {
        try {
            localStorage.setItem('rv_theme_' + apiKey, JSON.stringify(theme));
        } catch (e) { /* quota */ }
    };

    service.load = function(apiKey) {
        try {
            var stored = localStorage.getItem('rv_theme_' + apiKey);
            return stored ? JSON.parse(stored) : null;
        } catch (e) { return null; }
    };

    // Pré-tematização: salva rota selecionada na landing (sessionStorage)
    service.setPreTheme = function(routeData) {
        try {
            sessionStorage.setItem('rv_pre_theme', JSON.stringify(routeData));
        } catch (e) { /* ok */ }
    };

    service.getPreTheme = function() {
        try {
            var data = sessionStorage.getItem('rv_pre_theme');
            return data ? JSON.parse(data) : null;
        } catch (e) { return null; }
    };

    service.clearPreTheme = function() {
        sessionStorage.removeItem('rv_pre_theme');
    };

    return service;
})

// === Auth Service ===
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
        ThemeService.reset();
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

    // List routes (public) — includes landing data
    api.getRoutes = function() {
        return $http.post(baseUrl + '/v3/find/rota_info', {}, {
            headers: { 'Authorization': publicToken }
        }).then(function(res) {
            return res.data;
        });
    };

    // Get theme from route gamification
    api.getTheme = function(apiKey, token) {
        return $http.get(baseUrl + '/v3/database/theme__c?q=_id:\'default\'', {
            headers: { 'Authorization': token }
        }).then(function(res) {
            var data = res.data;
            return Array.isArray(data) ? data[0] : data;
        });
    };

    return api;
});
