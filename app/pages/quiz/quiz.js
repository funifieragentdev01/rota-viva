angular.module('rotaViva')

.controller('QuizCtrl', function($scope, $http, $routeParams, $location, AuthService, ApiService, ThemeService) {
    var session = AuthService.getSession();
    var token = session.token;
    var baseUrl = CONFIG.API_URL;
    var quizId = $routeParams.quizId;
    var playerId = (session.player || {})._id;
    var theme = ThemeService.load(session.apiKey) || {};

    if (theme && theme.colors) ThemeService.apply(theme, false);

    $scope.quizTitle = '';
    $scope.questions = [];
    $scope.currentIndex = 0;
    $scope.loading = true;
    $scope.finished = false;
    $scope.score = 0;
    $scope.quizLogId = null;
    $scope.lessonFolderId = null;
    $scope.tfAnswer = null;
    $scope.form = { essayAnswer: '' };
    $scope.diyPhotoData = null;

    function authHeaders() {
        return { 'Authorization': token, 'Content-Type': 'application/json' };
    }

    $http.get(baseUrl + '/v3/database/quiz?q=_id:\'' + quizId + '\'', {
        headers: { 'Authorization': token }
    }).then(function(res) {
        var quizzes = res.data || [];
        if (quizzes.length > 0) $scope.quizTitle = quizzes[0].title || 'Quiz';

        return $http.get(baseUrl + '/v3/database/question?sort=position:1&q=quiz:\'' + quizId + '\'', {
            headers: { 'Authorization': token }
        });
    }).then(function(res) {
        var rawQuestions = res.data || [];

        $scope.questions = rawQuestions.map(function(q) {
            var choices = q.choices || q.alternatives || [];
            var type = q.type || 'MULTIPLE_CHOICE';
            var isMultiSelect = (q.select === 'multiple_answers');
            return {
                _id: q._id,
                text: q.question || q.title || q.prompt || '',
                type: type,
                select: q.select || 'one_answer',
                isMultiSelect: isMultiSelect,
                correctAnswer: q.correctAnswer,
                totalLines: q.totalLines || 5,
                evidenceTypes: q.evidenceTypes || [],
                rubric: q.rubric || '',
                options: choices.map(function(c, idx) {
                    return {
                        answer: c.label || String.fromCharCode(65 + idx),
                        text: c.answer || c.label || c.description || c.title || '',
                        correct: !!(c.gradeCheck || c.correct || (c.grade && c.grade > 0)),
                        selected: false
                    };
                }),
                answered: false,
                correct: false,
                correctLabel: ''
            };
        });

        return $http.post(baseUrl + '/v3/quiz/start', {
            quiz: quizId,
            player: playerId
        }, { headers: authHeaders() });
    }).then(function(res) {
        var logData = res.data || {};
        $scope.quizLogId = logData._id || (logData.log && logData.log._id) || null;
        $scope.loading = false;
    }).catch(function(err) {
        console.error('[Quiz] Load error:', err);
        $scope.loading = false;
    });

    $http.get(baseUrl + '/v3/database/folder_content?q=content:\'' + quizId + '\'', {
        headers: { 'Authorization': token }
    }).then(function(res) {
        var fcs = res.data || [];
        if (fcs.length > 0) $scope.lessonFolderId = fcs[0]._id;
    }).catch(function() {});

    $scope.current = function() {
        return $scope.questions[$scope.currentIndex] || null;
    };

    $scope.selectOption = function(q, opt) {
        if (q.answered) return;
        if (q.isMultiSelect) {
            opt.selected = !opt.selected;
        } else {
            q.options.forEach(function(o) { o.selected = false; });
            opt.selected = true;
        }
    };

    $scope.selectTF = function(val) {
        if ($scope.current() && $scope.current().answered) return;
        $scope.tfAnswer = val;
    };

    $scope.canConfirm = function() {
        var q = $scope.current();
        if (!q) return false;
        if (q.type === 'TRUE_FALSE') return $scope.tfAnswer !== null;
        if (q.type === 'ESSAY' || q.type === 'SHORT_ANSWER') return ($scope.form.essayAnswer || '').trim().length > 0;
        if (q.type === 'DIY_PROJECT') return ($scope.form.essayAnswer || '').trim().length > 0 || $scope.diyPhotoData;
        return q.options && q.options.some(function(o) { return o.selected; });
    };

    $scope.checkAnswer = function(q) {
        if (q.answered) return;
        q.answered = true;

        if (q.type === 'TRUE_FALSE') {
            q.correct = ($scope.tfAnswer === q.correctAnswer);
            if (!q.correct) q.correctLabel = 'A resposta certa era: ' + (q.correctAnswer ? 'Verdadeiro' : 'Falso');
            if (q.correct) $scope.score++;
            logAnswer(q, [$scope.tfAnswer ? 'true' : 'false']);

        } else if (q.type === 'ESSAY' || q.type === 'SHORT_ANSWER') {
            q.correct = true;
            $scope.score++;
            logAnswer(q, [$scope.form.essayAnswer]);

        } else if (q.type === 'DIY_PROJECT') {
            q.correct = true;
            $scope.score++;
            logAnswer(q, [$scope.form.essayAnswer || '(foto enviada)']);

        } else if (q.isMultiSelect) {
            var selectedOpts = q.options.filter(function(o) { return o.selected; });
            var correctOpts = q.options.filter(function(o) { return o.correct; });
            var allCorrectSelected = correctOpts.every(function(o) { return o.selected; });
            var noWrongSelected = selectedOpts.every(function(o) { return o.correct; });
            q.correct = allCorrectSelected && noWrongSelected;
            if (!q.correct) {
                var correctTexts = correctOpts.map(function(o) { return o.text; });
                q.correctLabel = 'Respostas corretas: ' + correctTexts.join(', ');
            }
            if (q.correct) $scope.score++;
            logAnswer(q, selectedOpts.map(function(o) { return o.answer; }));

        } else {
            var selected = q.options.find(function(o) { return o.selected; });
            q.correct = selected && selected.correct;
            if (!q.correct) {
                var correctOpt = q.options.find(function(o) { return o.correct; });
                if (correctOpt) q.correctLabel = 'Resposta correta: ' + correctOpt.text;
            }
            if (q.correct) $scope.score++;
            if (selected) logAnswer(q, [selected.answer]);
        }

        playSound(q.correct ? 'correct' : 'wrong');
    };

    function playSound(type) {
        try {
            if (type === 'correct') new Audio('audio/beep.mp3').play();
        } catch(e) {}
    }

    function logAnswer(q, answerArr) {
        if (!$scope.quizLogId) return;
        $http.post(baseUrl + '/v3/question/log/bulk', [{
            quiz: quizId,
            quiz_log: $scope.quizLogId,
            question: q._id,
            answer: answerArr,
            player: playerId
        }], { headers: authHeaders() }).catch(function() {});
    }

    $scope.next = function() {
        if ($scope.currentIndex < $scope.questions.length - 1) {
            $scope.currentIndex++;
            $scope.tfAnswer = null;
            $scope.form.essayAnswer = '';
            $scope.diyPhotoData = null;
        } else {
            $scope.finished = true;

            var scorePercent = $scope.questions.length > 0
                ? Math.round(($scope.score / $scope.questions.length) * 100) : 0;

            if ($scope.quizLogId) {
                $http.post(baseUrl + '/v3/quiz/finish', {
                    quiz_log: $scope.quizLogId
                }, { headers: authHeaders() }).catch(function() {});
            }

            if ($scope.lessonFolderId) {
                ApiService.folderLog($scope.lessonFolderId, playerId, scorePercent).catch(function(err) {
                    console.warn('[Quiz] folder/log error:', err);
                });
            }

            if (playerId) {
                ApiService.logAction('complete_lesson', playerId, {
                    lesson_type: 'quiz',
                    lesson_id: quizId,
                    score: scorePercent
                }).catch(function(err) {
                    console.warn('[Quiz] action/log error:', err);
                });
            }
        }
    };

    $scope.goBack = function() { window.history.back(); };

    $scope.progressPercent = function() {
        if ($scope.questions.length === 0) return 0;
        return Math.round((($scope.currentIndex + ($scope.current() && $scope.current().answered ? 1 : 0)) / $scope.questions.length) * 100);
    };

    $scope.diyTakePhoto = function() {
        var input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.capture = 'environment';
        input.onchange = function(e) {
            var file = e.target.files[0];
            if (!file) return;
            var reader = new FileReader();
            reader.onload = function(ev) {
                $scope.$apply(function() { $scope.diyPhotoData = ev.target.result; });
            };
            reader.readAsDataURL(file);
        };
        input.click();
    };
});
