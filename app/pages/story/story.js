angular.module('rotaViva')

.controller('StoryCtrl', function($scope, $routeParams, $location, $timeout, AuthService, ApiService, ThemeService) {
    var session  = AuthService.getSession();
    var playerId = (session.player || {})._id;
    var theme    = ThemeService.load(session.apiKey) || {};
    if (theme && theme.colors) ThemeService.apply(theme, false);

    var storyId  = $routeParams.storyId;

    // Lesson context passed from trail.js via query params
    var lessonId    = $location.search().lesson      || null;
    var subjectId   = $location.search().subject     || null;
    var lessonTitle = decodeURIComponent($location.search().lessonTitle || '');

    $scope.storyId        = storyId;
    $scope.lessonTitle    = lessonTitle;
    $scope.showCompletion = false;
    $scope.starsEarned    = 0;
    $scope.scoreDisplay   = 0;
    $scope.confettiItems  = [1,2,3,4,5,6,7,8,9,10,11,12];

    var routeId      = (session.route && session.route.profile === 'pescador') ? 'pesca' : 'mel';
    var charBasePath = 'img/characters/' + routeId + '/trail/';
    $scope.charImg   = charBasePath + '1.png';

    // ── onComplete callback from <rv-story> ──────────────────────────────
    $scope.handleStoryComplete = function(result) {
        var passingScore = result.passing_score || 0;
        var score        = result.score         || 0;
        var stars;

        if (passingScore > 0) {
            stars = score >= passingScore           ? 3
                  : score >= passingScore * 0.58    ? 2
                  : 1;
        } else {
            // No passing score defined — completion always gives 3 stars
            stars = 3;
        }

        $scope.starsEarned  = stars;
        $scope.scoreDisplay = score;

        // Persist stars so trail renders correct star count
        try {
            var savedScores = JSON.parse(localStorage.getItem('rv_cartoon_scores') || '{}');
            if (lessonId) savedScores[lessonId] = stars;
            localStorage.setItem('rv_cartoon_scores', JSON.stringify(savedScores));
        } catch(e) {}

        // Register gamification action
        if (playerId) {
            ApiService.logAction('complete_lesson', playerId, {
                lesson_type: 'cartoon',
                type:        'story',
                story_id:    result.story_id,
                lesson_id:   lessonId,
                score:       stars,
                end_label:   result.end_label   || null,
                passed:      result.passed       !== undefined ? result.passed : null
            }).catch(function() {});

            // Bust trail cache so progress updates on next visit
            if (subjectId) {
                try {
                    localStorage.removeItem('rv_trail_cache_' + playerId + '_' + subjectId);
                } catch(e) {}
            }
        }

        // Show completion overlay (delayed slightly to let story UI settle)
        $timeout(function() {
            $scope.showCompletion = true;
        }, 300);
    };

    // ── Navigation ────────────────────────────────────────────────────────
    $scope.goBack = function() {
        var folderId = $location.search().subject;
        if (folderId) {
            $location.path('/trail/' + folderId).search({});
        } else {
            $location.path('/trail').search({});
        }
    };

    $scope.closeCompletion = function() {
        $scope.goBack();
    };
});
