angular.module('rotaViva')

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
});
