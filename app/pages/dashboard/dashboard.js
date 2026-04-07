angular.module('rotaViva')

.controller('DashboardCtrl', function($scope, $location, AuthService, ThemeService, ApiService) {
    var session = AuthService.getSession();
    $scope.player = session.player || {};
    $scope.route = session.route || {};
    $scope.theme = ThemeService.load(session.apiKey) || {};
    var playerId = ($scope.player || {})._id;

    $scope.totalPoints = 0;
    $scope.levelName = 'Carregando...';
    $scope.levelPosition = 0;
    $scope.levelPercent = 0;
    $scope.nextLevelName = '';
    $scope.nextPoints = 0;
    $scope.totalLevels = 0;
    $scope.streak = 0;
    $scope.statusLoaded = false;

    if ($scope.theme && $scope.theme.colors) ThemeService.apply($scope.theme, false);

    if (playerId) {
        ApiService.getPlayerStatus(playerId).then(function(status) {
            $scope.totalPoints = Math.floor(status.total_points || 0);
            var lp = status.level_progress || {};
            var level = lp.level || {};
            $scope.levelName = level.level || 'Iniciante';
            $scope.levelPosition = level.position || 0;
            $scope.levelPercent = Math.round(lp.percent_completed || 0);
            $scope.nextLevelName = (lp.next_level || {}).level || '';
            $scope.nextPoints = Math.ceil(lp.next_points || 0);
            $scope.totalLevels = lp.total_levels || 0;
            $scope.statusLoaded = true;
        }).catch(function() {
            $scope.levelName = 'Iniciante';
            $scope.statusLoaded = true;
        });

        ApiService.getActionLogs(playerId, 60).then(function(logs) {
            $scope.streak = calculateStreak(logs);
        }).catch(function() {
            $scope.streak = 0;
        });
    }

    function calculateStreak(logs) {
        if (!logs || logs.length === 0) return 0;
        var days = {};
        logs.forEach(function(log) {
            var d = new Date(log.time);
            var key = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
            days[key] = true;
        });
        var today = new Date();
        var streak = 0;
        var check = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        var todayKey = check.getFullYear() + '-' + (check.getMonth() + 1) + '-' + check.getDate();
        if (!days[todayKey]) check.setDate(check.getDate() - 1);
        while (true) {
            var key = check.getFullYear() + '-' + (check.getMonth() + 1) + '-' + check.getDate();
            if (days[key]) { streak++; check.setDate(check.getDate() - 1); } else break;
        }
        return streak;
    }

    $scope.goTrail = function() { $location.path('/trail'); };
    $scope.goGallery = function() { $location.path('/gallery'); };
    $scope.logout = function() { AuthService.logout(); };
});
