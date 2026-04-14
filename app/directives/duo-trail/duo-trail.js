/**
 * duoTrail — Reusable Duolingo-style S-curve trail directive
 *
 * Usage:
 *   <duo-trail
 *       trail-modules="trailModules"
 *       cartoon-images="cartoonImages"
 *       chest-image="img/icon/trail/chest.png"
 *       score-key="rv_cartoon_scores"
 *       header-selector=".trail-header"
 *       on-lesson-start="handleLessonStart(lesson)">
 *   </duo-trail>
 *
 * Inputs:
 *   trail-modules    (=)  Array of enriched module objects (see doc/bmad-trail-directive-2026-04-12.md)
 *   cartoon-images   (=?) Array of image URLs used for cartoon checkpoints (cycling)
 *   chest-image      (@?) Path to chest image. Default: 'img/icon/trail/chest.png'
 *   score-key        (@?) localStorage key for cartoon stars. Default: 'duo_cartoon_scores'
 *   header-selector  (@?) CSS selector of host header for sticky positioning. Default: '.trail-header'
 *
 * Output:
 *   on-lesson-start  (&)  Called with { lesson } when the player clicks Começar/Revisar/Desafio.
 *                         The host is responsible for navigation.
 */
angular.module('duoTrail', [])

.directive('duoTrail', function() {
    return {
        restrict: 'E',
        templateUrl: 'directives/duo-trail/duo-trail.html',
        scope: {
            trailModules:   '=',
            cartoonImages:  '=?',
            chestImage:     '@?',
            scoreKey:       '@?',
            headerSelector: '@?',
            onLessonStart:  '&'
        },
        controller: ['$scope', '$timeout', function($scope, $timeout) {

            // ── Internal state ─────────────────────────────────────────────
            $scope.trailItems     = [];
            $scope.trailLoading   = false;
            $scope.activeModule   = null;
            $scope.selectedLesson = null;

            // ── Content-type → icon map ────────────────────────────────────
            var CONTENT_ICONS = {
                'quiz':    'fa-star',
                'review':  'fa-trophy',
                'video':   'fa-play',
                'reading': 'fa-book-open',
                'mission': 'fa-wrench',
                'diy':     'fa-camera',
                'essay':   'fa-comment',
                'chest':   'fa-gem',
                'listen':  'fa-headphones',
                'cartoon': 'fa-star'
            };

            function getLessonIcon(lesson) {
                if (CONTENT_ICONS[lesson.contentType]) return CONTENT_ICONS[lesson.contentType];
                if (!lesson.is_unlocked) return 'fa-lock';
                if ((lesson.percent || 0) >= 100) return 'fa-check';
                return 'fa-star';
            }

            // ── Watch for data from host ───────────────────────────────────
            $scope.$watch('trailModules', function(modules) {
                if (modules !== null && modules !== undefined) buildTrail(modules);
            });

            // ── buildTrail — flatten modules into trailItems ───────────────
            function buildTrail(modules) {
                $scope.trailLoading = true;

                var scoreKey      = $scope.scoreKey      || 'duo_cartoon_scores';
                var cartoonImages = $scope.cartoonImages  || [];

                var cartoonScores = {};
                try { cartoonScores = JSON.parse(localStorage.getItem(scoreKey) || '{}'); } catch(e) {}

                var flat            = [];
                var globalLessonIdx = 0;
                var cartoonCharIdx  = 0;

                var sortedModules = modules.slice().sort(function(a, b) {
                    return (a.position || 0) - (b.position || 0);
                });

                sortedModules.forEach(function(mod, modIdx) {
                    // Module header entry
                    flat.push({
                        _type:       'module',
                        _id:         mod._id,
                        title:       mod.title,
                        color:       mod.color,
                        percent:     mod.percent || 0,
                        moduleIndex: modIdx
                    });

                    var sortedLessons = (mod.lessons || []).slice().sort(function(a, b) {
                        return (a.position || 0) - (b.position || 0);
                    });

                    var displayIdx  = 0;   // S-curve position — cartoons excluded
                    var prevLesson  = null; // last non-cartoon lesson pushed to flat

                    sortedLessons.forEach(function(lesson) {
                        // Build a clean copy — never mutate host data
                        var entry = {
                            _id:         lesson._id,
                            _type:       'lesson',
                            title:       lesson.title,
                            contentType: lesson.contentType || '',
                            contentId:   lesson.contentId   || '',
                            percent:     lesson.percent      || 0,
                            is_unlocked: lesson.is_unlocked !== false,
                            moduleColor: mod.color,
                            moduleId:    mod._id,
                            globalIndex: globalLessonIdx,
                            icon:        getLessonIcon(lesson)
                        };
                        globalLessonIdx++;

                        // Cartoon checkpoint — attach to preceding lesson, don't add to flat
                        if (lesson.contentType === 'cartoon') {
                            var cartoonEntry = angular.extend({}, entry, {
                                lessonIndex:  prevLesson ? prevLesson.lessonIndex : 0,
                                cartoonStars: cartoonScores[lesson._id] !== undefined
                                                ? cartoonScores[lesson._id] : 0
                            });
                            if (cartoonImages.length > 0) {
                                cartoonEntry._charImg = cartoonImages[cartoonCharIdx % cartoonImages.length];
                                cartoonCharIdx++;
                            }
                            if (prevLesson) prevLesson._cartoon = cartoonEntry;
                            return; // do NOT push to flat
                        }

                        // Regular lesson / chest — S-curve index uses display position only
                        entry.lessonIndex = displayIdx;
                        displayIdx++;
                        flat.push(entry);
                        prevLesson = entry;
                    });
                });

                // Activate first module by default
                var firstModule = flat.find(function(i) { return i._type === 'module'; });
                if (firstModule) $scope.activeModule = firstModule;

                $scope.trailItems   = flat;
                $scope.trailLoading = false;

                // After digest: position sticky box + auto-scroll to first available lesson
                $timeout(function() {
                    setupModuleScrollObserver();
                    for (var i = 0; i < flat.length; i++) {
                        var item = flat[i];
                        if (item._type === 'lesson' && item.is_unlocked && (item.percent || 0) < 100) {
                            var el = document.getElementById('trail-item-' + item._id);
                            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            break;
                        }
                    }
                }, 350);
            }

            // ── Sticky module scroll observer ──────────────────────────────
            function setupModuleScrollObserver() {
                var lastModuleId = null;

                var sel      = $scope.headerSelector || '.trail-header';
                var headerEl = document.querySelector(sel);
                var stickyEl = document.querySelector('.duo-sticky-module');
                var headerH  = headerEl ? headerEl.offsetHeight : 68;
                var stickyH  = stickyEl ? stickyEl.offsetHeight : 60;

                if (stickyEl) stickyEl.style.top = headerH + 'px';

                var threshold   = headerH + stickyH;
                var moduleItems = $scope.trailItems.filter(function(i) { return i._type === 'module'; });

                function updateActiveModule() {
                    if (!moduleItems.length) return;
                    var dividers = document.querySelectorAll('.duo-module-divider');
                    if (!dividers.length) return;

                    var activeIdx = 0;
                    dividers.forEach(function(el, idx) {
                        if (el.getBoundingClientRect().top <= threshold) activeIdx = idx;
                    });

                    var activeItem = moduleItems[activeIdx];
                    if (!activeItem || activeItem._id === lastModuleId) return;
                    lastModuleId = activeItem._id;

                    if ($scope.$$phase) {
                        $scope.activeModule = activeItem;
                    } else {
                        $scope.$apply(function() { $scope.activeModule = activeItem; });
                    }
                }

                window.addEventListener('scroll', updateActiveModule, { passive: true });
                document.addEventListener('scroll', updateActiveModule, { passive: true });
                $scope.$on('$destroy', function() {
                    window.removeEventListener('scroll', updateActiveModule);
                    document.removeEventListener('scroll', updateActiveModule);
                });
                updateActiveModule();
            }

            // ── Style helpers ──────────────────────────────────────────────
            $scope.getBubbleStyle = function(item) {
                var xOffset = Math.sin(item.lessonIndex * 0.8) * 70;
                return { 'margin-left': 'calc(50% - 36px + ' + xOffset + 'px)' };
            };

            $scope.getBubbleClass = function(item) {
                if (!item.is_unlocked) return 'duo-bubble duo-locked';
                if ((item.percent || 0) >= 100) return 'duo-bubble duo-done';
                return 'duo-bubble duo-active';
            };

            $scope.getBubbleDynamic = function(item) {
                if (!item.is_unlocked) return {};
                return { background: item.moduleColor };
            };

            $scope.getCartoonFloatStyle = function(item) {
                var xOffset = Math.sin(item.lessonIndex * 0.8) * 70;
                var style = { position: 'absolute', top: '-80px', 'z-index': 20, cursor: 'pointer' };
                if (xOffset >= 0) { style.right = 'auto'; style.left = '-230px'; }
                else              { style.left  = 'auto'; style.right = '-230px'; }
                return style;
            };

            // ── Type helpers ───────────────────────────────────────────────
            $scope.isChest = function(item) {
                return item._type === 'lesson' && item.contentType === 'chest';
            };

            $scope.isCartoon = function(item) {
                return item._type === 'lesson' && item.contentType === 'cartoon';
            };

            // ── Interaction ────────────────────────────────────────────────
            $scope.selectLesson = function(item, $event) {
                $event.stopPropagation();
                $scope.selectedLesson = ($scope.selectedLesson && $scope.selectedLesson._id === item._id)
                    ? null : item;
            };

            $scope.closePopup = function() {
                $scope.selectedLesson = null;
            };

            $scope.startLesson = function(item) {
                if (!item.is_unlocked) return;
                $scope.onLessonStart({ lesson: item });
            };

            // ── Chest image helper ─────────────────────────────────────────
            $scope.getChestImage = function() {
                return $scope.chestImage || 'img/icon/trail/chest.png';
            };
        }]
    };
});
