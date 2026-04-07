angular.module('rotaViva')

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
            input_text: '#0A1929',
            text: '#0A1929',
            text_muted: '#2A4A6B',
            text_faint: '#7A9BBF',
            text_on_primary: '#FFFFFF',
            success: '#2E7D32',
            error: '#C62828',
            warning: '#E65100'
        }
    };

    var COLOR_MAP = {
        primary: '--color-primary',
        primary_dark: '--color-primary-dark',
        primary_light: '--color-primary-light',
        accent: '--color-accent',
        bg: '--color-bg',
        background: '--color-bg',
        background_gradient: '--color-bg-gradient',
        surface: '--color-surface',
        card: '--color-card',
        card_border: '--color-card-border',
        input_bg: '--color-input-bg',
        input_text: '--color-input-text',
        text: '--color-text',
        text_muted: '--color-text-muted',
        text_faint: '--color-text-faint',
        text_on_primary: '--color-text-on-primary',
        success: '--color-success',
        error: '--color-error',
        warning: '--color-warning',
        nav_bg: '--color-nav-bg',
        nav_text: '--color-nav-text'
    };

    service.apply = function(theme, animate) {
        var root = document.documentElement;
        var c = (theme && theme.colors) || {};

        if (animate) {
            document.body.classList.add('theme-transitioning');
            document.body.classList.remove('theme-ready');
        }

        Object.keys(COLOR_MAP).forEach(function(key) {
            if (c[key]) root.style.setProperty(COLOR_MAP[key], c[key]);
        });

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
});
