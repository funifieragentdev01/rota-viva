angular.module('rotaViva')

// === Main Controller ===
.controller('MainCtrl', function($scope) {
    $scope.loading = false;
})

// === Login Controller ===
.controller('LoginCtrl', function($scope, $location, ApiService, AuthService, CPFService) {
    $scope.form = { cpf: '', password: '' };
    $scope.error = '';
    $scope.submitting = false;

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
.controller('SignupCtrl', function($scope, $location, ApiService, CPFService) {
    $scope.form = {
        name: '',
        cpf: '',
        password: '',
        confirmPassword: '',
        profile: '',
        email: '',
        phone: ''
    };
    $scope.routes = [];
    $scope.error = '';
    $scope.success = '';
    $scope.submitting = false;

    // Carregar rotas disponíveis
    ApiService.getRoutes().then(function(data) {
        $scope.routes = data;
    }).catch(function() {
        // Fallback estático se API falhar
        $scope.routes = [
            { _id: 'mel', profile: 'apicultor', title: 'Colmeia Viva — Apicultor' },
            { _id: 'pesca', profile: 'pescador', title: 'Rio em Movimento — Pescador' }
        ];
    });

    $scope.signup = function() {
        $scope.error = '';
        $scope.success = '';

        // Validações
        if (!$scope.form.name || !$scope.form.cpf || !$scope.form.password || !$scope.form.profile) {
            $scope.error = 'Preencha todos os campos obrigatórios.';
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
                    // Redirecionar pro login após 2s
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
.controller('DashboardCtrl', function($scope, AuthService) {
    var session = AuthService.getSession();
    $scope.player = session.player || {};
    $scope.route = session.route || {};

    $scope.logout = function() {
        AuthService.logout();
    };
});
