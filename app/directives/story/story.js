/**
 * <rv-story> — Diretiva de reprodução de histórias interativas do Rota Viva.
 *
 * Adaptada da diretiva do Funifier Studio (story.js), substituindo
 * Marketplace.auth por ApiService para funcionar no app standalone.
 *
 * Atributos:
 *   story-id   (@)  _id da história na coleção `story`
 *   on-complete (&)  Callback chamado ao terminar: fn(result)
 *                    result = { story_id, score, passing_score, passed,
 *                               end_label, end_scene_id, decisions_taken }
 *
 * Uso:
 *   <rv-story story-id="{{storyId}}" on-complete="handleEnd(result)"></rv-story>
 */
angular.module('rotaViva')

.directive('rvStory', ['$timeout', '$interval', 'ApiService',
  function ($timeout, $interval, ApiService) {
    return {
      restrict: 'E',
      scope: {
        storyId:    '@',
        onComplete: '&'
      },
      templateUrl: 'directives/story/story.html',
      controller: ['$scope', function ($scope) {

        $scope.isLoading      = true;
        $scope.story          = null;
        $scope.sceneMap       = {};
        $scope.characterMap   = {};
        $scope.scenesList     = [];
        $scope.currentScene   = null;
        $scope.dialogueIndex  = 0;
        $scope.score          = 0;
        $scope.decisionsTaken = [];
        $scope.transitioning  = false;
        $scope.preloaded      = {};
        $scope.showCover      = false;
        $scope.showCoverCast  = false;

        // ── Progress & Timer ──────────────────────────────────────────────
        $scope.sceneElapsed  = 0;
        $scope.sceneDuration = null;
        $scope.sceneIndex    = 0;
        $scope.totalScenes   = 0;
        var _timerInterval   = null;

        function clearTimer() {
          if (_timerInterval) { $interval.cancel(_timerInterval); _timerInterval = null; }
          $scope.sceneElapsed  = 0;
          $scope.sceneDuration = null;
        }

        function startTimer(durationSec) {
          clearTimer();
          $scope.sceneDuration = durationSec;
          $scope.sceneElapsed  = 0;
          _timerInterval = $interval(function () {
            if ($scope.sceneElapsed < durationSec) {
              $scope.sceneElapsed = Math.min($scope.sceneElapsed + 0.1, durationSec);
            }
            if ($scope.sceneElapsed >= durationSec && $scope.allDialoguesDone()) {
              clearTimer();
              $scope.advance();
            }
          }, 100);
        }

        function getSceneDuration(scene) {
          if (!scene || scene.type !== 'scene' || !scene.next_scene_id) return null;
          if (scene.media && scene.media.duration) {
            var d = parseFloat(scene.media.duration);
            if (d > 0) return d;
          }
          var def = $scope.story && $scope.story.default_scene_duration;
          return def ? parseFloat(def) : null;
        }

        function setupVideoAutoAdvance(scene) {
          if (!scene || scene.media.type !== 'video' || scene.type !== 'scene' || !scene.next_scene_id) return;
          $timeout(function () {
            var vid = document.querySelector('.rv-story-media video');
            if (!vid) return;
            var onMeta = function () {
              $scope.$apply(function () { $scope.sceneDuration = vid.duration || null; });
              vid.removeEventListener('loadedmetadata', onMeta);
            };
            vid.addEventListener('loadedmetadata', onMeta);
            vid.addEventListener('timeupdate', function () {
              $scope.$apply(function () { $scope.sceneElapsed = vid.currentTime; });
            });
            vid.addEventListener('ended', function () {
              $scope.$apply(function () { $scope.advance(); });
            });
          }, 200);
        }

        // ── Video-native-audio suppression ────────────────────────────────
        function sceneVideoSuppressesAudio(scene) {
          return scene &&
            scene.media_mode === 'video' &&
            scene.video &&
            scene.video.has_native_audio &&
            !scene.video.override_audio;
        }

        // ── Preload ───────────────────────────────────────────────────────
        function preloadMedia(scene) {
          if (!scene || $scope.preloaded[scene._id]) return;
          $scope.preloaded[scene._id] = true;
          if (scene.media && scene.media.url) {
            if (scene.media.type === 'video') {
              var v = document.createElement('video');
              v.src = scene.media.url; v.preload = 'auto';
            } else {
              var img = new Image(); img.src = scene.media.url;
            }
          }
        }

        function preloadAdjacent(scene) {
          if (!scene) return;
          if (scene.next_scene_id) preloadMedia($scope.sceneMap[scene.next_scene_id]);
          if (scene.decision && scene.decision.options) {
            scene.decision.options.forEach(function (opt) {
              preloadMedia($scope.sceneMap[opt.next_scene_id]);
            });
          }
        }

        // ── Navigation ────────────────────────────────────────────────────
        function goToSceneInternal(scene) {
          if (window.speechSynthesis) window.speechSynthesis.cancel();
          var dialogueAudioEl = document.getElementById('rv-story-dialogue-audio');
          if (dialogueAudioEl) { dialogueAudioEl.onended = null; dialogueAudioEl.pause(); dialogueAudioEl.src = ''; }
          clearTimer();
          $scope.currentScene   = scene;
          $scope.dialogueIndex  = 0;
          $scope.transitioning  = false;

          for (var i = 0; i < $scope.scenesList.length; i++) {
            if ($scope.scenesList[i]._id === scene._id) { $scope.sceneIndex = i + 1; break; }
          }

          playBackgroundAudio(scene);
          if (scene.dialogues && scene.dialogues.length > 0 && !sceneVideoSuppressesAudio(scene)) {
            playDialogueAudio();
          }
          preloadAdjacent(scene);

          if (scene.type === 'end') {
            $timeout(handleEnd, 800);
          } else if (scene.media && scene.media.type === 'video') {
            setupVideoAutoAdvance(scene);
          } else {
            var dur = getSceneDuration(scene);
            if (dur) startTimer(dur);
          }
        }

        $scope.goToScene = function (sceneId) {
          var scene = $scope.sceneMap[sceneId];
          if (!scene) return;
          var duration = scene.transition === 'cut' ? 0 : (scene.transition_duration || 300);
          if (duration > 0) {
            $scope.transitioning = true;
            $timeout(function () { goToSceneInternal(scene); }, duration);
          } else {
            goToSceneInternal(scene);
          }
        };

        // ── Dialogues ─────────────────────────────────────────────────────
        $scope.currentDialogue = function () {
          if (!$scope.currentScene || !$scope.currentScene.dialogues || !$scope.currentScene.dialogues.length) return null;
          return $scope.currentScene.dialogues[$scope.dialogueIndex] || null;
        };

        $scope.hasMoreDialogues = function () {
          if (!$scope.currentScene || !$scope.currentScene.dialogues) return false;
          return $scope.dialogueIndex < ($scope.currentScene.dialogues.length - 1);
        };

        $scope.allDialoguesDone = function () {
          if (!$scope.currentScene) return true;
          var dialogues = $scope.currentScene.dialogues || [];
          return dialogues.length === 0 || $scope.dialogueIndex >= dialogues.length - 1;
        };

        $scope.nextDialogue = function () {
          if ($scope.hasMoreDialogues()) {
            $scope.dialogueIndex++;
            playDialogueAudio();
            if ($scope.sceneDuration && $scope.sceneElapsed >= $scope.sceneDuration && $scope.allDialoguesDone()) {
              clearTimer();
              $timeout(function () { $scope.advance(); }, 300);
            }
          }
        };

        function advanceDialogueIfMore() {
          if ($scope.hasMoreDialogues()) $scope.nextDialogue();
        }

        function playDialogueAudio() {
          var d = $scope.currentDialogue();
          if (!d) return;
          // Suppress dialogue audio when the scene video has native audio
          if (sceneVideoSuppressesAudio($scope.currentScene)) return;

          if (d.audio_url) {
            $timeout(function () {
              var el = document.getElementById('rv-story-dialogue-audio');
              if (!el) return;
              el.src = d.audio_url;
              el.onended = function () { $scope.$apply(function () { advanceDialogueIfMore(); }); };
              el.play();
            }, 80);
          } else if (d.text && window.speechSynthesis) {
            window.speechSynthesis.cancel();
            var utterance = new window.SpeechSynthesisUtterance(d.text);
            utterance.lang = 'pt-BR'; utterance.rate = 1; utterance.pitch = 1;
            utterance.onend = function () { $scope.$apply(function () { advanceDialogueIfMore(); }); };
            window.speechSynthesis.speak(utterance);
          } else {
            $timeout(function () { advanceDialogueIfMore(); }, 600);
          }
        }

        function safeVolume(val, fallback) {
          var v = parseFloat(val);
          return (!isNaN(v) && v >= 0 && v <= 1) ? v : fallback;
        }

        function playStoryBackgroundAudio() {
          if (!$scope.story || !$scope.story.background_audio || !$scope.story.background_audio.url) return;
          $timeout(function () {
            var el = document.getElementById('rv-story-global-audio');
            if (!el) return;
            el.src    = $scope.story.background_audio.url;
            el.loop   = $scope.story.background_audio.loop !== false;
            el.volume = safeVolume($scope.story.background_audio.volume, 0.5);
            el.play();
          }, 80);
        }

        function playBackgroundAudio(scene) {
          $timeout(function () {
            var el = document.getElementById('rv-story-bg-audio');
            if (!el) return;
            // Suppress scene bg audio when video has its own audio track
            if (sceneVideoSuppressesAudio(scene)) {
              el.pause(); el.src = '';
              return;
            }
            if (scene.background_audio && scene.background_audio.url) {
              el.src    = scene.background_audio.url;
              el.loop   = !!scene.background_audio.loop;
              el.volume = safeVolume(scene.background_audio.volume, 1);
              el.play();
            } else {
              el.pause(); el.src = '';
            }
          }, 80);
        }

        // ── Decision ──────────────────────────────────────────────────────
        $scope.chooseOption = function (opt) {
          $scope.score += (opt.score || 0);
          $scope.decisionsTaken.push({
            scene_id:     $scope.currentScene._id,
            option_label: opt.label,
            score:        opt.score || 0
          });
          $scope.goToScene(opt.next_scene_id);
        };

        // ── Advance (type=scene) ──────────────────────────────────────────
        $scope.advance = function () {
          if (!$scope.currentScene || $scope.currentScene.type !== 'scene') return;
          if ($scope.currentScene.next_scene_id) $scope.goToScene($scope.currentScene.next_scene_id);
        };

        // ── Characters ────────────────────────────────────────────────────
        $scope.getCharacter = function (characterId) {
          return characterId ? ($scope.characterMap[characterId] || null) : null;
        };

        $scope.showCast = false;
        $scope.toggleCast = function () { $scope.showCast = !$scope.showCast; };

        $scope.getCastForScene = function () {
          if (!$scope.currentScene || !$scope.currentScene.dialogues) return [];
          var seen = {}, cast = [];
          $scope.currentScene.dialogues.forEach(function (d) {
            if (d.character_id && !seen[d.character_id]) {
              seen[d.character_id] = true;
              var char = $scope.characterMap[d.character_id];
              if (char) cast.push(char);
            }
          });
          return cast;
        };

        // ── Cover screen ──────────────────────────────────────────────────
        $scope.startStory = function () {
          $scope.showCover     = false;
          $scope.showCoverCast = false;
          var firstId = $scope.story && $scope.story.first_scene_id;
          if (firstId && $scope.sceneMap[firstId]) {
            $scope.goToScene(firstId);
          } else if ($scope.scenesList.length > 0) {
            $scope.goToScene($scope.scenesList[0]._id);
          }
        };

        $scope.getAllCast = function () {
          return Object.keys($scope.characterMap).map(function (k) { return $scope.characterMap[k]; });
        };

        $scope.getCoverCastNames = function () {
          var cast = $scope.getAllCast();
          var names = cast.slice(0, 3).map(function (c) { return c.name; }).join(', ');
          return cast.length > 3 ? names + ' +' + (cast.length - 3) : names;
        };

        // ── Aspect ratio ──────────────────────────────────────────────────
        $scope.getMediaPaddingTop = function () {
          var ar = $scope.story && $scope.story.aspect_ratio;
          if (ar === '9:16') return '177.78%';
          if (ar === '1:1')  return '100%';
          return '56.25%'; // default 16:9
        };

        // ── End ───────────────────────────────────────────────────────────
        function handleEnd() {
          var scene = $scope.currentScene;
          $scope.score += (scene.end_score || 0);
          var passed = $scope.story && $scope.story.passing_score
            ? $scope.score >= $scope.story.passing_score
            : null;
          if ($scope.onComplete) {
            $scope.onComplete({
              result: {
                story_id:        $scope.story ? $scope.story._id : null,
                score:           $scope.score,
                passing_score:   $scope.story ? ($scope.story.passing_score || null) : null,
                passed:          passed,
                end_label:       scene.end_label || null,
                end_scene_id:    scene._id,
                decisions_taken: $scope.decisionsTaken
              }
            });
          }
        }

        // ── Stop all playback ─────────────────────────────────────────────
        $scope.stop = function () {
          clearTimer();
          if (window.speechSynthesis) window.speechSynthesis.cancel();
          ['rv-story-dialogue-audio', 'rv-story-bg-audio', 'rv-story-global-audio'].forEach(function (id) {
            var el = document.getElementById(id);
            if (el) { try { el.pause(); el.src = ''; } catch (e) {} }
          });
        };

        // ── Load ──────────────────────────────────────────────────────────
        function load() {
          if (!$scope.storyId) { $scope.isLoading = false; return; }

          ApiService.getStory($scope.storyId).then(function (story) {
            $scope.story = story;
            return ApiService.getStoryCharacters($scope.storyId);
          }).then(function (characters) {
            characters.forEach(function (c) { $scope.characterMap[c._id] = c; });
            return ApiService.getStoryScenes($scope.storyId);
          }).then(function (scenes) {
            scenes.forEach(function (s) { $scope.sceneMap[s._id] = s; });
            $scope.scenesList  = scenes;
            $scope.totalScenes = scenes.length;
            $scope.isLoading   = false;

            playStoryBackgroundAudio();

            if ($scope.story && $scope.story.show_cover_first !== false) {
              $scope.showCover = true;
            } else {
              $scope.startStory();
            }
          }).catch(function (err) {
            console.warn('[rvStory] Erro ao carregar história:', err);
            $scope.isLoading = false;
          });
        }

        $scope.$watch('storyId', function (val) {
          if (val) {
            $scope.stop();
            $scope.sceneMap       = {};
            $scope.characterMap   = {};
            $scope.scenesList     = [];
            $scope.currentScene   = null;
            $scope.score          = 0;
            $scope.decisionsTaken = [];
            $scope.sceneIndex     = 0;
            $scope.totalScenes    = 0;
            $scope.showCover      = false;
            $scope.showCoverCast  = false;
            $scope.isLoading      = true;
            load();
          }
        });

        $scope.$on('$destroy', function () { $scope.stop(); });
      }]
    };
  }
]);
