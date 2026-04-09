angular.module('rotaViva')

.controller('QuizCtrl', function($scope, $http, $routeParams, $location, $timeout, AuthService, ApiService, SoundService, ThemeService) {
    var session = AuthService.getSession();
    var token = session.token;
    var baseUrl = CONFIG.API_URL;
    var quizId = $routeParams.quizId;
    var playerId = (session.player || {})._id;
    var theme = ThemeService.load(session.apiKey) || {};

    // Lesson context passed from trail.js via query params
    var lessonId    = $location.search().lesson || null;
    var moduleId    = $location.search().module || null;
    var lessonTitle = decodeURIComponent($location.search().lessonTitle || '');
    var routeId     = (session.route && session.route.profile === 'pescador') ? 'pesca' : 'mel';
    var charBasePath = 'img/characters/' + routeId + '/trail/';
    $scope.charImg = charBasePath + '1.png';

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
    $scope.showConfetti = false;
    $scope.scorePercent = 0;
    $scope.isSpeaking = false;
    $scope.locationData = null;
    $scope.locationError = null;
    $scope.locationLoading = false;
    var leafletMap = null;

    // SPEAK state
    $scope.speakTranscript = '';
    $scope.speakStatus = 'idle'; // idle | listening | done | error | unsupported
    $scope.speakError = '';
    var speakRecognition = null;

    // Prova de Campo
    $scope.provasDeCampo = [];
    $scope.provasDeCampoCount = 0;
    $scope.provasDeCampoLoading = false;
    $scope.provasDeCampoLoaded = false;
    $scope.hadDiario = false;

    function authHeaders() {
        return { 'Authorization': token, 'Content-Type': 'application/json' };
    }

    // ── Array helpers ───────────────────────────────────────────────────────

    function shuffleArray(arr) {
        for (var i = arr.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
        }
        return arr;
    }

    function parseMissingWords(mw) {
        var text = mw.text || '';
        var blanks = mw.blanks || [];
        var segments = [];
        var regex = /\[\[(\w+)\]\]/g;
        var lastIdx = 0, mwm;
        while ((mwm = regex.exec(text)) !== null) {
            if (mwm.index > lastIdx) segments.push({ type: 'text', text: text.substring(lastIdx, mwm.index) });
            var blankId = mwm[1];
            var blank = null;
            for (var bi = 0; bi < blanks.length; bi++) { if (blanks[bi].id === blankId) { blank = blanks[bi]; break; } }
            segments.push({ type: 'blank', id: blankId, options: blank ? shuffleArray((blank.options || []).slice()) : [], correctOptionId: blank ? blank.correctOptionId : '' });
            lastIdx = regex.lastIndex;
        }
        if (lastIdx < text.length) segments.push({ type: 'text', text: text.substring(lastIdx) });
        return segments;
    }

    function parseDragDrop(dd) {
        var targets = dd.targets || [];
        var pool = shuffleArray((dd.optionsPool || []).slice());
        var slots = [];
        for (var si = 0; si < targets.length; si++) slots.push(null);

        // Parse the text field (e.g. "Abelhas [[1]] e [[2]] a colmeia") into segments
        // so the template can render inline blanks
        var text = dd.text || dd.sentence || '';
        var segments = [];
        var re = /\[\[(\d+)\]\]/g;
        var lastIdx = 0, m;
        // Build a map from target id to index
        var targetIdxMap = {};
        for (var ti = 0; ti < targets.length; ti++) targetIdxMap[targets[ti].id] = ti;
        while ((m = re.exec(text)) !== null) {
            if (m.index > lastIdx) segments.push({ type: 'text', text: text.substring(lastIdx, m.index) });
            var slotIdx = targetIdxMap[m[1]];
            segments.push({ type: 'blank', slotIdx: (slotIdx !== undefined ? slotIdx : segments.length) });
            lastIdx = m.index + m[0].length;
        }
        if (lastIdx < text.length) segments.push({ type: 'text', text: text.substring(lastIdx) });

        return { slots: slots, available: pool, targets: targets, segments: segments };
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
            var speechText = (q.extra && q.extra.speechText) || q.speechText || '';
            var ttsLang = (q.extra && q.extra.ttsLang) || q.ttsLang || 'pt-BR';
            var model = q.model || {};

            var options = choices.map(function(c, idx) {
                return {
                    answer: c.label || String.fromCharCode(65 + idx),
                    text: c.answer || c.label || c.description || c.title || '',
                    correct: !!(c.gradeCheck || c.correct || (c.grade && c.grade > 0)),
                    selected: false
                };
            });

            // LISTEN_AND_ORDER: shuffled available + empty selected sequence
            var listenAvail = [];
            var listenSelected = [];
            if (type === 'LISTEN_AND_ORDER') {
                listenAvail = shuffleArray(options.slice());
            }

            // MATCHING: left/right pairs from model.matching
            var matchLeft = [], matchRight = [], matchAnswers = {}, matchCorrect = [];
            if (type === 'MATCHING' && model.matching) {
                var matchSolutions = model.matching.solutions || {};
                matchLeft = (model.matching.left || []).map(function(item) {
                    return { id: item.id, text: item.text, correctRightId: matchSolutions[item.id] || '' };
                });
                matchRight = shuffleArray((model.matching.right || []).slice());
            }

            // SELECT_MISSING_WORDS: parsed segments from model.missingWords
            var mwSegments = [], mwAnswers = {}, mwCorrect = {};
            if (type === 'SELECT_MISSING_WORDS' && model.missingWords) {
                mwSegments = parseMissingWords(model.missingWords);
            }

            // DRAG_AND_DROP_INTO_TEXT: slots + word pool from model.dragDropText
            var ddSlots = [], ddAvailable = [], ddTargets = [], ddSlotCorrect = [], ddSegments = [];
            if (type === 'DRAG_AND_DROP_INTO_TEXT' && model.dragDropText) {
                var ddParsed = parseDragDrop(model.dragDropText);
                ddSlots = ddParsed.slots;
                ddAvailable = ddParsed.available;
                ddTargets = ddParsed.targets;
                ddSegments = ddParsed.segments;
            }

            // For DragDrop and SelectMissingWords, the `question` field holds the sentence
            // template ([[1]] / [[b1]] etc.), so the human-readable title comes from `title`.
            var displayText = (type === 'DRAG_AND_DROP_INTO_TEXT' || type === 'SELECT_MISSING_WORDS')
                ? (q.title || q.question || q.prompt || '')
                : (q.question || q.title || q.prompt || '');

            return {
                _id: q._id,
                text: displayText,
                type: type,
                select: q.select || 'one_answer',
                isMultiSelect: isMultiSelect,
                correctAnswer: q.correctAnswer,
                totalLines: q.totalLines || 5,
                evidenceTypes: q.evidenceTypes || [],
                rubric: q.rubric || '',
                speechText: speechText,
                ttsLang: ttsLang,
                model: model,
                options: options,
                listenAvail: listenAvail,
                listenSelected: listenSelected,
                matchLeft: matchLeft,
                matchRight: matchRight,
                matchAnswers: matchAnswers,
                matchCorrect: matchCorrect,
                mwSegments: mwSegments,
                mwAnswers: mwAnswers,
                mwCorrect: mwCorrect,
                ddSlots: ddSlots,
                ddAvailable: ddAvailable,
                ddTargets: ddTargets,
                ddSlotCorrect: ddSlotCorrect,
                ddSegments: ddSegments,
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

    // ── LISTEN helpers ──────────────────────────────────────────────────────

    $scope.isListen = function() {
        var q = $scope.current();
        return q && (q.type === 'LISTEN' || q.type === 'LISTEN_AND_ORDER');
    };

    $scope.speakTTS = function() {
        var q = $scope.current();
        if (!q || !q.speechText) return;
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        var utt = new SpeechSynthesisUtterance(q.speechText);
        utt.lang = q.ttsLang || 'pt-BR';
        utt.rate = 0.9;
        $scope.isSpeaking = true;
        utt.onend = function() { $scope.$apply(function() { $scope.isSpeaking = false; }); };
        utt.onerror = function() { $scope.$apply(function() { $scope.isSpeaking = false; }); };
        window.speechSynthesis.speak(utt);
    };

    // ── SPEAK helpers ───────────────────────────────────────────────────────

    $scope.startSpeakRecord = function() {
        var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) {
            $scope.speakStatus = 'unsupported';
            return;
        }
        var q = $scope.current();
        var lang = (q.model && q.model.speak && q.model.speak.lang) || 'pt-BR';

        speakRecognition = new SR();
        speakRecognition.lang = lang;
        speakRecognition.continuous = false;
        speakRecognition.interimResults = false;
        speakRecognition.maxAlternatives = 1;

        speakRecognition.onstart = function() {
            $scope.$apply(function() {
                $scope.speakStatus = 'listening';
                $scope.speakError = '';
            });
        };

        speakRecognition.onresult = function(event) {
            var transcript = event.results[0][0].transcript;
            $scope.$apply(function() {
                $scope.speakTranscript = transcript;
                $scope.speakStatus = 'done';
            });
        };

        speakRecognition.onerror = function(event) {
            $scope.$apply(function() {
                $scope.speakStatus = 'error';
                if (event.error === 'not-allowed') {
                    $scope.speakError = 'Permissão de microfone negada. Verifique as configurações do navegador.';
                } else if (event.error === 'no-speech') {
                    $scope.speakError = 'Nenhuma fala detectada. Tente novamente.';
                } else {
                    $scope.speakError = 'Erro no reconhecimento. Tente novamente.';
                }
            });
        };

        speakRecognition.onend = function() {
            $scope.$apply(function() {
                if ($scope.speakStatus === 'listening') {
                    $scope.speakStatus = $scope.speakTranscript ? 'done' : 'idle';
                }
                speakRecognition = null;
            });
        };

        try { speakRecognition.start(); } catch(e) {
            $scope.speakStatus = 'error';
            $scope.speakError = 'Não foi possível iniciar o microfone.';
        }
    };

    $scope.stopSpeakRecord = function() {
        if (speakRecognition) {
            try { speakRecognition.stop(); } catch(e) {}
            speakRecognition = null;
        }
    };

    $scope.retrySpeakRecord = function() {
        $scope.speakTranscript = '';
        $scope.speakStatus = 'idle';
        $scope.speakError = '';
    };

    // ── DRAG_AND_DROP_INTO_TEXT helpers ──────────────────────────────────────

    // ── GPS location (DIY_PROJECT + location evidenceType) ──────────────────

    $scope.needsLocation = function() {
        var q = $scope.current();
        return q && q.type === 'DIY_PROJECT' && q.evidenceTypes && q.evidenceTypes.indexOf('location') >= 0;
    };

    $scope.getLocation = function() {
        if (!navigator.geolocation) {
            $scope.locationError = 'Seu dispositivo não suporta GPS.';
            return;
        }
        $scope.locationLoading = true;
        $scope.locationError = null;
        navigator.geolocation.getCurrentPosition(
            function(pos) {
                $scope.$apply(function() {
                    $scope.locationData = {
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude,
                        accuracy: Math.round(pos.coords.accuracy)
                    };
                    $scope.locationLoading = false;
                });
                // Initialize Leaflet map after DOM is updated
                $timeout(function() {
                    var mapEl = document.getElementById('quiz-location-map');
                    if (!mapEl || !window.L) return;
                    if (leafletMap) { leafletMap.remove(); leafletMap = null; }
                    leafletMap = L.map('quiz-location-map', { zoomControl: true }).setView(
                        [$scope.locationData.lat, $scope.locationData.lng], 15
                    );
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    }).addTo(leafletMap);
                    var icon = window.L.divIcon({
                        className: '',
                        html: '<div class="quiz-map-pin"><i class="fas fa-map-pin"></i></div>',
                        iconSize: [32, 40],
                        iconAnchor: [16, 40]
                    });
                    L.marker([$scope.locationData.lat, $scope.locationData.lng], { icon: icon }).addTo(leafletMap);
                }, 200);
            },
            function() {
                $scope.$apply(function() {
                    $scope.locationError = 'Não foi possível obter sua localização. Verifique se o GPS está ativado.';
                    $scope.locationLoading = false;
                });
            },
            { enableHighAccuracy: true, timeout: 15000 }
        );
    };

    // ── Prova de Campo ──────────────────────────────────────────────────────

    // Fetch community posts when landing on a DIY_PROJECT question
    $scope.$watch('currentIndex', function() {
        var q = $scope.current();
        if (q && q.type === 'DIY_PROJECT' && lessonId) {
            $scope.provasDeCampoLoading = true;
            $scope.provasDeCampoLoaded = false;
            $scope.provasDeCampo = [];
            ApiService.getProvasDeCampo(lessonId, 3).then(function(posts) {
                $scope.provasDeCampo = posts;
            }).catch(function() {
                $scope.provasDeCampo = [];
            }).finally(function() {
                $scope.provasDeCampoLoading = false;
                $scope.provasDeCampoLoaded = true;
            });
            ApiService.countProvasDeCampo(lessonId).then(function(count) {
                $scope.provasDeCampoCount = count;
            }).catch(function() {});
        } else {
            $scope.provasDeCampoLoading = false;
            $scope.provasDeCampoLoaded = false;
        }
    });

    // Publish Diário to Galeria dos Saberes after DIY_PROJECT submission
    function publishDiario() {
        if (!lessonId || !playerId) return;
        $scope.hadDiario = true;

        var evidenceType = $scope.diyPhotoData ? 'photo'
            : $scope.locationData ? 'location' : 'text';

        var post = {
            player:  playerId,
            text:    'Completei: ' + (lessonTitle || 'Diário'),
            created: new Date().toISOString(),
            extra: {
                lesson_id:    lessonId,
                module_id:    moduleId || '',
                lesson_title: lessonTitle,
                route:        routeId,
                evidence_type: evidenceType
            }
        };

        if ($scope.locationData) {
            post.extra.lat = $scope.locationData.lat;
            post.extra.lng = $scope.locationData.lng;
        }

        if ($scope.diyPhotoData) {
            // Upload photo first, then create post with URL
            var blob = dataURItoBlob($scope.diyPhotoData);
            ApiService.uploadMedia(blob, false).then(function(url) {
                console.log('[Diário] upload url:', url);
                if (url) post.image = url;
                ApiService.publishDiario(post).then(function(r) {
                    console.log('[Diário] published:', r);
                }).catch(function(e) { console.warn('[Diário] publish error:', e); });
                // Refresh Prova de Campo after publishing
                $timeout(function() {
                    ApiService.getProvasDeCampo(lessonId, 3).then(function(posts) {
                        $scope.provasDeCampo = posts;
                        $scope.provasDeCampoCount = ($scope.provasDeCampoCount || 0) + 1;
                    }).catch(function() {});
                }, 1500);
            }).catch(function(e) {
                console.warn('[Diário] upload error, publishing without image:', e);
                ApiService.publishDiario(post).catch(function() {});
            });
        } else {
            ApiService.publishDiario(post).catch(function() {});
        }
    }

    function dataURItoBlob(dataURI) {
        var byteString = atob(dataURI.split(',')[1]);
        var mime = dataURI.split(',')[0].split(':')[1].split(';')[0];
        var ab = new ArrayBuffer(byteString.length);
        var ia = new Uint8Array(ab);
        for (var i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
        return new Blob([ab], { type: mime });
    }

    $scope.ddAddToSlot = function(word) {
        var q = $scope.current();
        if (!q || q.answered) return;
        for (var i = 0; i < q.ddSlots.length; i++) {
            if (!q.ddSlots[i]) {
                q.ddSlots[i] = word;
                var idx = q.ddAvailable.indexOf(word);
                if (idx > -1) q.ddAvailable.splice(idx, 1);
                return;
            }
        }
    };

    $scope.ddRemoveFromSlot = function(slotIdx) {
        var q = $scope.current();
        if (!q || q.answered) return;
        var word = q.ddSlots[slotIdx];
        if (word) {
            q.ddSlots[slotIdx] = null;
            q.ddAvailable.push(word);
        }
    };

    // LISTEN_AND_ORDER: tap item from bank → moves to sequence
    $scope.listenOrderAdd = function(item) {
        var q = $scope.current();
        if (!q || q.answered) return;
        var idx = q.listenAvail.indexOf(item);
        if (idx === -1) return;
        q.listenAvail.splice(idx, 1);
        q.listenSelected.push(item);
    };

    // LISTEN_AND_ORDER: tap item in sequence → moves back to bank
    $scope.listenOrderRemove = function(item) {
        var q = $scope.current();
        if (!q || q.answered) return;
        var idx = q.listenSelected.indexOf(item);
        if (idx === -1) return;
        q.listenSelected.splice(idx, 1);
        q.listenAvail.push(item);
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
        if (q.type === 'DIY_PROJECT') {
            var needsLoc = $scope.needsLocation();
            var hasEvidence = ($scope.form.essayAnswer || '').trim().length > 0 || !!$scope.diyPhotoData;
            var hasEvidence2 = needsLoc ? (hasEvidence || !!$scope.locationData) : hasEvidence;
            return hasEvidence2 && !!$scope.form.diaryConsent;
        }
        if (q.type === 'LISTEN_AND_ORDER') return q.listenAvail.length === 0 && q.listenSelected.length > 0;
        if (q.type === 'MATCHING') return q.matchLeft.length > 0 && q.matchLeft.every(function(l) { return !!q.matchAnswers[l.id]; });
        if (q.type === 'SELECT_MISSING_WORDS') return q.mwSegments.filter(function(s) { return s.type === 'blank'; }).every(function(s) { return !!q.mwAnswers[s.id]; });
        if (q.type === 'DRAG_AND_DROP_INTO_TEXT') return q.ddSlots.length > 0 && q.ddSlots.every(function(s) { return !!s; });
        if (q.type === 'SPEAK') return $scope.speakTranscript.trim().length > 0;
        return q.options && q.options.some(function(o) { return o.selected; });
    };

    $scope.checkAnswer = function(q) {
        if (q.answered) return;
        q.answered = true;

        if (q.type === 'LISTEN_AND_ORDER') {
            var allMatch = q.listenSelected.length === q.options.length &&
                q.listenSelected.every(function(item, i) { return item.text === q.options[i].text; });
            q.correct = allMatch;
            if (!q.correct) {
                q.correctLabel = 'Ordem correta: ' + q.options.map(function(o) { return o.text; }).join(' → ');
            }
            if (q.correct) $scope.score++;
            logAnswer(q, q.listenSelected.map(function(o) { return o.answer; }));

        } else if (q.type === 'MATCHING') {
            var matchOk = 0;
            q.matchLeft.forEach(function(l, i) {
                var isOk = q.matchAnswers[l.id] === l.correctRightId;
                q.matchCorrect[i] = isOk;
                if (isOk) matchOk++;
            });
            q.correct = matchOk === q.matchLeft.length;
            if (!q.correct) q.correctLabel = 'As associações corretas estão marcadas acima';
            if (q.correct) $scope.score++;
            logAnswer(q, q.matchLeft.map(function(l) { return l.id + ':' + (q.matchAnswers[l.id] || ''); }));

        } else if (q.type === 'SELECT_MISSING_WORDS') {
            var blanks = q.mwSegments.filter(function(s) { return s.type === 'blank'; });
            var mwOk = 0;
            blanks.forEach(function(s) {
                var isOk = q.mwAnswers[s.id] === s.correctOptionId;
                q.mwCorrect[s.id] = isOk;
                if (isOk) mwOk++;
            });
            q.correct = mwOk === blanks.length;
            if (!q.correct) q.correctLabel = 'As lacunas corretas estão destacadas acima';
            if (q.correct) $scope.score++;
            logAnswer(q, blanks.map(function(s) { return s.id + ':' + (q.mwAnswers[s.id] || ''); }));

        } else if (q.type === 'DRAG_AND_DROP_INTO_TEXT') {
            var ddOk = 0;
            q.ddSlots.forEach(function(slot, i) {
                var target = q.ddTargets[i];
                var accepted = target && (target.acceptedOptionIds || (target.correctOptionId ? [target.correctOptionId] : []));
                var isOk = !!(slot && accepted && accepted.indexOf(slot.id) !== -1);
                q.ddSlotCorrect[i] = isOk;
                if (isOk) ddOk++;
            });
            q.correct = ddOk === q.ddSlots.length && q.ddSlots.length > 0;
            if (!q.correct) q.correctLabel = 'As palavras corretas estão destacadas acima';
            if (q.correct) $scope.score++;
            logAnswer(q, q.ddSlots.map(function(s) { return s ? s.id : ''; }));

        } else if (q.type === 'TRUE_FALSE') {
            q.correct = ($scope.tfAnswer === q.correctAnswer);
            if (!q.correct) q.correctLabel = 'A resposta certa era: ' + (q.correctAnswer ? 'Verdadeiro' : 'Falso');
            if (q.correct) $scope.score++;
            logAnswer(q, [$scope.tfAnswer ? 'true' : 'false']);

        } else if (q.type === 'SPEAK') {
            var speakModel = (q.model && q.model.speak) || {};
            var evalType = speakModel.evaluationType || 'always_correct';
            if (evalType === 'keywords' && speakModel.keywords && speakModel.keywords.length > 0) {
                var transcript = ($scope.speakTranscript || '').toLowerCase();
                q.correct = speakModel.keywords.some(function(kw) {
                    return transcript.indexOf(kw.toLowerCase()) !== -1;
                });
                if (!q.correct) {
                    q.correctLabel = 'Resposta esperada incluía: ' + speakModel.keywords.join(', ');
                }
            } else {
                q.correct = true;
            }
            if (q.correct) $scope.score++;
            logAnswer(q, [$scope.speakTranscript]);

        } else if (q.type === 'ESSAY' || q.type === 'SHORT_ANSWER') {
            q.correct = true;
            $scope.score++;
            logAnswer(q, [$scope.form.essayAnswer]);

        } else if (q.type === 'DIY_PROJECT') {
            q.correct = true;
            $scope.score++;
            var answers = [];
            if ($scope.form.essayAnswer) answers.push($scope.form.essayAnswer);
            if ($scope.locationData) answers.push('lat:' + $scope.locationData.lat + ',lng:' + $scope.locationData.lng + ',acc:' + $scope.locationData.accuracy + 'm');
            if (!answers.length) answers.push('(evidência enviada)');
            logAnswer(q, answers);
            if ($scope.form.diaryConsent) publishDiario();

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

        // Feedback sensorial
        if (q.correct) {
            SoundService.play('correct');
            if (navigator.vibrate) navigator.vibrate(80);
        } else {
            SoundService.play('wrong');
            if (navigator.vibrate) navigator.vibrate([60, 40, 60]);
        }
    };

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
        // Stop any ongoing TTS
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        $scope.isSpeaking = false;

        if ($scope.currentIndex < $scope.questions.length - 1) {
            $scope.currentIndex++;
            $scope.tfAnswer = null;
            $scope.form.essayAnswer = '';
            $scope.diyPhotoData = null;
            $scope.locationData = null;
            $scope.locationError = null;
            if (leafletMap) { leafletMap.remove(); leafletMap = null; }
            $scope.speakTranscript = '';
            $scope.speakStatus = 'idle';
            $scope.speakError = '';
            if (speakRecognition) { try { speakRecognition.stop(); } catch(e) {} speakRecognition = null; }
        } else {
            $scope.scorePercent = $scope.questions.length > 0
                ? Math.round(($scope.score / $scope.questions.length) * 100) : 0;

            $scope.finished = true;

            if ($scope.quizLogId) {
                $http.post(baseUrl + '/v3/quiz/finish', {
                    quiz_log: $scope.quizLogId
                }, { headers: authHeaders() }).catch(function() {});
            }

            if ($scope.lessonFolderId) {
                ApiService.folderLog($scope.lessonFolderId, playerId, $scope.scorePercent).catch(function(err) {
                    console.warn('[Quiz] folder/log error:', err);
                });
            }

            if (playerId) {
                ApiService.logAction('complete_lesson', playerId, {
                    lesson_type: 'quiz',
                    lesson_id: quizId,
                    score: $scope.scorePercent
                }).catch(function() {});
            }

            // Celebração
            if ($scope.scorePercent >= 70) {
                triggerCelebration();
                SoundService.play('levelup');
                if (navigator.vibrate) navigator.vibrate([80, 50, 80, 50, 120]);
            }

            // Toast de XP
            var xp = Math.round($scope.score * 10);
            if (xp > 0) {
                $timeout(function() { showXpToast(xp); }, 300);
            }
        }
    };

    function triggerCelebration() {
        $scope.showConfetti = true;
        if (typeof window.confetti === 'function') {
            window.confetti({
                particleCount: 120,
                spread: 80,
                origin: { y: 0.5 },
                colors: ['#FF9600', '#1a5632', '#FFC800', '#00CD9C', '#1CB0F6']
            });
            $timeout(function() {
                window.confetti({
                    particleCount: 60,
                    spread: 60,
                    origin: { x: 0.1, y: 0.6 }
                });
                window.confetti({
                    particleCount: 60,
                    spread: 60,
                    origin: { x: 0.9, y: 0.6 }
                });
            }, 400);
        }
        $timeout(function() { $scope.showConfetti = false; }, 3000);
    }

    function showXpToast(points) {
        var el = document.createElement('div');
        el.className = 'xp-toast';
        el.textContent = '+' + points + ' favos';
        document.body.appendChild(el);
        $timeout(function() {
            if (el.parentNode) el.parentNode.removeChild(el);
        }, 1900);
    }

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
