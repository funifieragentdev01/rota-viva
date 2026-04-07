angular.module('rotaViva')

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

    var routeId = preTheme ? preTheme.routeId : null;
    if (!routeId && preTheme && preTheme.profile) {
        if (preTheme.profile === 'apicultor') routeId = 'mel';
        if (preTheme.profile === 'pescador') routeId = 'pesca';
    }
    var ROUTE_CHARS = {
        mel: 'img/characters/mel/front/abelha.png',
        pesca: 'img/characters/pesca/front/peixe.png'
    };
    $scope.routeCharImg = routeId ? ROUTE_CHARS[routeId] : null;
    $scope.error = '';
    $scope.success = '';
    $scope.submitting = false;

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
                        $scope.$apply(function() { $location.path('/login'); });
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
});
