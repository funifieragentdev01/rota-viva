angular.module('rotaViva')

.controller('GalleryCtrl', function($scope, $location, $timeout, AuthService, ApiService, ThemeService) {
    var session = AuthService.getSession();
    var playerId = (session.player || {})._id;
    var playerName = (session.player || {}).name || 'Produtor';
    var playerPhoto = (session.player || {}).photo || null;
    var route = session.route || {};
    var theme = ThemeService.load(session.apiKey) || {};

    if (theme && theme.colors) ThemeService.apply(theme, false);

    $scope.theme = theme;
    $scope.loading = true;
    $scope.posts = [];
    $scope.topUsers = [];
    $scope.playerPoints = 0;
    $scope.playerStreak = 0;

    // UI state
    $scope.menuPost = null;       // post com menu de 3 pontos aberto
    $scope.commentsPost = null;   // post com painel de comentários aberto
    $scope.comment = { text: '' }; // objeto evita bug de scope do ng-if
    $scope.sendingComment = false;
    $scope.newPost = null;        // null = painel fechado
    $scope.submitting = false;

    // ─── Player stats ─────────────────────────────────────────────────────────
    if (playerId) {
        ApiService.getPlayerStatus(playerId).then(function(status) {
            $scope.playerPoints = Math.floor(status.total_points || 0);
        }).catch(function() {});

        ApiService.getActionLogs(playerId, 60).then(function(logs) {
            if (!logs || logs.length === 0) return;
            var days = {};
            logs.forEach(function(log) {
                var d = new Date(log.time);
                days[d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate()] = true;
            });
            var check = new Date();
            var todayKey = check.getFullYear() + '-' + (check.getMonth() + 1) + '-' + check.getDate();
            if (!days[todayKey]) check.setDate(check.getDate() - 1);
            var streak = 0;
            while (true) {
                var key = check.getFullYear() + '-' + (check.getMonth() + 1) + '-' + check.getDate();
                if (days[key]) { streak++; check.setDate(check.getDate() - 1); } else break;
            }
            $scope.playerStreak = streak;
        }).catch(function() {});
    }

    // ─── Helpers ───────────────────────────────────────────────────────────────
    function timeAgo(dateStr) {
        if (!dateStr) return '';
        var diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
        if (diff < 60)    return 'agora';
        if (diff < 3600)  return 'há ' + Math.floor(diff / 60) + ' min';
        if (diff < 86400) {
            var h = Math.floor(diff / 3600);
            return 'há ' + h + (h === 1 ? ' hora' : ' horas');
        }
        var d = Math.floor(diff / 86400);
        return 'há ' + d + (d === 1 ? ' dia' : ' dias');
    }

    function parseHashtags(text) {
        if (!text) return '';
        return text.replace(/(#\w+)/g, '<span class="gallery-hashtag">$1</span>');
    }

    function normalizePost(p) {
        var text = p.description || p.text || '';
        var postPlayerId = p.player || p.player_id || '';
        return angular.extend({}, p, {
            _authorName:   p.author_name   || p.player_name   || 'Produtor',
            _authorPhoto:  p.author_photo  || p.player_photo  || null,
            _municipality: (p.extra && p.extra.municipality) || p.municipality || '',
            _trailName:    (p.extra && p.extra.trail_name)   || p.trail_name   || '',
            _isOfficial:   !!(p.extra && p.extra.is_official),
            _isTop:        !!(p.extra && p.extra.is_top),
            _likeCount:    p.like_count    || p.likes         || 0,
            _commentCount: p.comment_count || 0,
            _liked:        !!p.user_liked,   // vem do aggregate $filter por playerId
            _isOwner:      !!(playerId && postPlayerId === playerId),
            _timeAgo:      timeAgo(p.created || p.time),
            _captionHtml:  parseHashtags(text),
            _comments:     [],
            _commentsLoaded: false
        });
    }

    // ─── Load posts ────────────────────────────────────────────────────────────
    ApiService.getGalleryPosts(playerId, 20, 0).then(function(data) {
        $scope.posts = (data || []).map(normalizePost);
    }).catch(function() {
        $scope.posts = [];
    }).finally(function() {
        $scope.loading = false;
    });

    // ─── Load top users ────────────────────────────────────────────────────────
    ApiService.getTopUsers().then(function(data) {
        var items = Array.isArray(data) ? data : (data.items || data.leaderboard || []);
        $scope.topUsers = items.slice(0, 8).map(function(u) {
            return { _id: u.player || u._id, name: u.player_name || u.name || 'Produtor', photo: u.player_photo || u.photo || null };
        });
    }).catch(function() { $scope.topUsers = []; });

    // ─── Feed actions ──────────────────────────────────────────────────────────
    $scope.toggleLike = function(post) {
        if (!playerId) return;
        var wasLiked = post._liked;
        // Atualiza UI imediatamente (optimistic update)
        post._liked = !wasLiked;
        post._likeCount += post._liked ? 1 : -1;

        if (wasLiked) {
            // Já curtiu → descurtir
            ApiService.unlikePost(post._id, playerId).catch(function() {
                post._liked = true;
                post._likeCount++;
            });
        } else {
            // Não curtiu → curtir
            ApiService.likePost(post._id, playerId).catch(function() {
                post._liked = false;
                post._likeCount--;
            });
        }
    };

    $scope.sharePost = function(post) {
        if (navigator.share) {
            navigator.share({ title: 'Rota Viva', text: post.description || '', url: window.location.origin }).catch(function() {});
        }
    };

    // ─── Menu de 3 pontos ─────────────────────────────────────────────────────
    $scope.openPostMenu = function($event, post) {
        $event.stopPropagation();
        $scope.menuPost = ($scope.menuPost && $scope.menuPost._id === post._id) ? null : post;
    };

    $scope.closeMenu = function() { $scope.menuPost = null; };

    $scope.deletePost = function(post) {
        $scope.menuPost = null;
        if (!confirm('Remover esta publicação?')) return;
        ApiService.deletePost(post._id).then(function() {
            var idx = $scope.posts.indexOf(post);
            if (idx > -1) $scope.posts.splice(idx, 1);
        }).catch(function() {
            alert('Não foi possível remover. Tente novamente.');
        });
    };

    // ─── Comentários ──────────────────────────────────────────────────────────
    $scope.openComments = function(post) {
        if ($scope.commentsPost && $scope.commentsPost._id === post._id) {
            $scope.commentsPost = null;
            $scope.commentText = '';
            return;
        }
        $scope.commentsPost = post;
        $scope.commentText = '';
        if (!post._commentsLoaded) {
            ApiService.getComments(post._id).then(function(data) {
                post._comments = (data || []).map(function(c) {
                    return {
                        _id: c._id,
                        _authorName: c.author_name || c.player_name || 'Produtor',
                        _authorPhoto: c.author_photo || c.player_photo || null,
                        _text: c.text || c.comment || '',
                        _timeAgo: timeAgo(c.created || c.time),
                        _isOwner: c.player === playerId
                    };
                });
                post._commentsLoaded = true;
            }).catch(function() {
                post._comments = [];
                post._commentsLoaded = true;
            });
        }
        $timeout(function() { document.body.style.overflow = 'hidden'; });
    };

    $scope.closeComments = function() {
        $scope.commentsPost = null;
        $scope.comment.text = '';
        document.body.style.overflow = '';
    };

    $scope.sendComment = function() {
        var text = ($scope.comment.text || '').trim();
        if (!text || $scope.sendingComment || !$scope.commentsPost) return;
        $scope.sendingComment = true;
        var post = $scope.commentsPost;

        ApiService.addComment(post._id, playerId, playerName, playerPhoto, text).then(function(c) {
            post._comments.push({
                _id: (c && c._id) || Date.now(),
                _authorName: playerName,
                _authorPhoto: playerPhoto,
                _text: text,
                _timeAgo: 'agora',
                _isOwner: true
            });
            post._commentCount++;
            $scope.comment.text = '';
        }).catch(function() {
            alert('Erro ao enviar comentário. Tente novamente.');
        }).finally(function() {
            $scope.sendingComment = false;
        });
    };

    // ─── Compressão de imagem via canvas ──────────────────────────────────────
    function compressImage(file, callback) {
        var maxPx = 1280;
        var reader = new FileReader();
        reader.onload = function(e) {
            var img = new Image();
            img.onload = function() {
                var w = img.width, h = img.height;
                if (w > maxPx || h > maxPx) {
                    if (w > h) { h = Math.round(h * maxPx / w); w = maxPx; }
                    else       { w = Math.round(w * maxPx / h); h = maxPx; }
                }
                var canvas = document.createElement('canvas');
                canvas.width = w; canvas.height = h;
                canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                callback(canvas.toDataURL('image/jpeg', 0.82));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // ─── Nova publicação ───────────────────────────────────────────────────────
    $scope.openNewPost = function() {
        $scope.newPost = { caption: '', mediaFile: null, mediaPreview: null, mediaType: null, charCount: 0 };
        $timeout(function() { document.body.style.overflow = 'hidden'; });
    };

    $scope.closeNewPost = function() {
        $scope.newPost = null;
        document.body.style.overflow = '';
        document.querySelectorAll('.gallery-file-input').forEach(function(el) { el.value = ''; });
    };

    $scope.triggerCamera  = function() { document.getElementById('gallery-input-camera').click(); };
    $scope.triggerGallery = function() { document.getElementById('gallery-input-gallery').click(); };

    $scope.onFileSelected = function(inputEl) {
        var file = inputEl.files && inputEl.files[0];
        if (!file || !$scope.newPost) return;

        var isVideo = file.type.startsWith('video/');
        $scope.newPost.mediaFile = file;
        $scope.newPost.mediaType = isVideo ? 'video' : 'image';

        if (isVideo) {
            $scope.$apply(function() {
                $scope.newPost.mediaPreview = URL.createObjectURL(file);
            });
        } else {
            compressImage(file, function(dataUrl) {
                $scope.$apply(function() {
                    $scope.newPost.mediaPreview = dataUrl;
                    $scope.newPost._compressedData = dataUrl;
                });
            });
        }
    };

    $scope.updateCharCount = function() {
        if ($scope.newPost) $scope.newPost.charCount = ($scope.newPost.caption || '').length;
    };

    $scope.removeMedia = function() {
        $scope.newPost.mediaFile = null;
        $scope.newPost.mediaPreview = null;
        $scope.newPost.mediaType = null;
        $scope.newPost._compressedData = null;
        document.querySelectorAll('.gallery-file-input').forEach(function(el) { el.value = ''; });
    };

    $scope.submitPost = function() {
        if (!$scope.newPost || !$scope.newPost.mediaFile || $scope.submitting) return;
        $scope.submitting = true;

        var trailName = (theme.labels && theme.labels.missions_title) || route.name || '';
        var file = $scope.newPost.mediaFile;
        var isVideo = $scope.newPost.mediaType === 'video';

        ApiService.uploadMedia(file, isVideo).then(function(mediaUrl) {
            var payload = {
                player:        playerId,
                player_name:   playerName,
                player_photo:  playerPhoto || '',
                description:   $scope.newPost.caption || '',
                trail_name:    trailName,
                media_url:     mediaUrl || '',
                media_type:    $scope.newPost.mediaType,
                created:       new Date().toISOString(),
                like_count:    0,
                comment_count: 0
            };
            return ApiService.createPost(payload).then(function(created) {
                var p = normalizePost(created || payload);
                $scope.posts.unshift(p);
                $scope.closeNewPost();
            });
        }).catch(function() {
            alert('Erro ao publicar. Verifique sua conexão e tente novamente.');
        }).finally(function() {
            $scope.submitting = false;
        });
    };

    // ─── Navegação ─────────────────────────────────────────────────────────────
    $scope.goHome    = function() { $location.path('/dashboard'); };
    $scope.goTrail   = function() { $location.path('/trail'); };
    $scope.goPerfil  = function() { $location.path('/profile'); };

    $scope.$on('$destroy', function() { document.body.style.overflow = ''; });
});
