angular.module('rotaViva')

.controller('GalleryCtrl', function($scope, $location, $timeout, $q, AuthService, ApiService, ThemeService) {
    var session = AuthService.getSession();
    var playerId = (session.player || {})._id;
    var playerName = (session.player || {}).name || 'Produtor';
    var playerPhoto = (session.player || {}).photo || null;
    var isOfficial = !!((session.player || {}).extra && (session.player || {}).extra.is_official);
    var route = session.route || {};
    var routeId = route._id
        || (route.profile === 'pescador' ? 'pesca' : null)
        || (route.profile === 'apicultor' ? 'mel' : null)
        || 'mel';
    var theme = ThemeService.load(session.apiKey) || {};

    if (theme && theme.colors) ThemeService.apply(theme, false);

    $scope.theme = theme;
    $scope.loading = true;
    $scope.posts = [];
    $scope.storiesBar = [];
    $scope.playerPoints = 0;
    $scope.playerCoins = 0;
    $scope.playerStreak = 0;
    $scope.isOfficial = isOfficial;

    // UI state
    $scope.menuPost = null;       // post com menu de 3 pontos aberto
    $scope.commentsPost = null;   // post com painel de comentários aberto
    $scope.comment = { text: '' }; // objeto evita bug de scope do ng-if
    $scope.sendingComment = false;
    $scope.newPost = null;        // null = painel fechado
    $scope.submitting = false;
    $scope.filterTag = null;
    $scope.filterPlayerId = null;
    $scope.filterPlayerName = null;
    $scope.postsToShow = [];

    // Search modal state
    $scope.showSearch = false;
    $scope.searchQuery = '';
    $scope.searchResults = [];
    $scope.searchRecents = [];
    $scope.searchLoading = false;

    var SEARCH_SUGGESTIONS = {
        mel:   ['familia', 'mel', 'colheita', 'apiario', 'pronaf'],
        pesca: ['familia', 'pesca', 'defeso', 'barco', 'pronaf']
    };
    $scope.searchSuggestions = SEARCH_SUGGESTIONS[routeId] || SEARCH_SUGGESTIONS.mel;

    var TIPO_OPTIONS = [
        { value: 'filho',   label: 'Filho(a)'              },
        { value: 'pai',     label: 'Pai'                   },
        { value: 'mae',     label: 'Mãe'                   },
        { value: 'conjuge', label: 'Cônjuge / Companheiro(a)' },
        { value: 'amigo',   label: 'Amigo(a)'              },
        { value: 'colega',  label: 'Colega de produção'    }
    ];
    $scope.tipoOptions = TIPO_OPTIONS;

    $scope.textColors = [
        { value: '#ffffff', label: 'Branco' },
        { value: '#000000', label: 'Preto'  },
        { value: '#FFD700', label: 'Amarelo' },
        { value: '#FF9600', label: 'Laranja' },
        { value: '#4CAF50', label: 'Verde'  }
    ];
    $scope.textBgOptions = [
        { value: 'transparent',         label: 'Sem fundo' },
        { value: 'rgba(0,0,0,0.55)',    label: 'Escuro'    },
        { value: 'rgba(255,255,255,0.6)', label: 'Claro'   }
    ];

    // ─── Player stats ─────────────────────────────────────────────────────────
    if (playerId) {
        ApiService.getPlayerStatus().then(function(status) {
            var cats = status.point_categories || {};
            $scope.playerPoints = Math.floor(cats.xp    || 0);
            $scope.playerCoins  = Math.floor(cats.coins || 0);
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
        var TRUNCATE_LEN = 125;
        var truncated = text.length > TRUNCATE_LEN ? text.slice(0, TRUNCATE_LEN) + '…' : text;
        return angular.extend({}, p, {
            _authorName:     p.author_name   || p.player_name   || 'Produtor',
            _authorPhoto:    p.author_photo  || p.player_photo  || null,
            _municipality:   (p.extra && p.extra.municipality) || p.municipality || '',
            _trailName:      (p.extra && p.extra.trail_name)   || p.trail_name   || '',
            _isOfficial:     !!(p.extra && p.extra.is_official),
            _isTop:          !!(p.extra && p.extra.is_top),
            _likeCount:      p.like_count    || p.likes         || 0,
            _commentCount:   p.comment_count || 0,
            _liked:          !!p.user_liked,
            _isOwner:        !!(playerId && postPlayerId === playerId),
            _timeAgo:        timeAgo(p.created || p.time),
            _captionFull:    parseHashtags(text),
            _captionShort:   parseHashtags(truncated),
            _captionLong:    text.length > TRUNCATE_LEN,
            _captionExpanded: false,
            _captionHtml:    parseHashtags(text),   // kept for compat
            _mentions:       p.mentions      || [],
            _carouselIndex:  0,
            _ctaButton:      p.cta_button    || null,
            _comments:       [],
            _commentsLoaded: false
        });
    }

    $scope.toggleCaption = function(post) {
        post._captionExpanded = !post._captionExpanded;
    };

    // Converte dataUrl para Blob (usado no upload de imagens editadas)
    function dataUrlToBlob(dataUrl) {
        var arr = dataUrl.split(',');
        var mime = arr[0].match(/:(.*?);/)[1];
        var bstr = atob(arr[1]);
        var n = bstr.length;
        var u8arr = new Uint8Array(n);
        while (n--) u8arr[n] = bstr.charCodeAt(n);
        return new Blob([u8arr], { type: mime });
    }

    // ─── Filter helpers ────────────────────────────────────────────────────────
    function updatePostsToShow() {
        var filtered = $scope.posts;
        if ($scope.filterPlayerId) {
            var pid = $scope.filterPlayerId;
            filtered = filtered.filter(function(p) {
                return (p.player || p.player_id) === pid;
            });
        } else if ($scope.filterTag) {
            var tag = $scope.filterTag;
            filtered = filtered.filter(function(p) {
                return p.tags && p.tags.indexOf(tag) >= 0;
            });
        }
        $scope.postsToShow = filtered;
    }

    $scope.$watch('filterTag',      updatePostsToShow);
    $scope.$watch('filterPlayerId', updatePostsToShow);
    $scope.$watch('posts.length',   updatePostsToShow);

    $scope.clearFilter = function() {
        $scope.filterTag = null;
        $scope.filterPlayerId = null;
        $scope.filterPlayerName = null;
    };

    // ─── Load posts ────────────────────────────────────────────────────────────
    ApiService.getGalleryPosts(20, 0).then(function(data) {
        $scope.posts = (data || []).map(normalizePost);
    }).catch(function() {
        $scope.posts = [];
    }).finally(function() {
        $scope.loading = false;
    });

    // ─── Load stories bar ─────────────────────────────────────────────────────
    ApiService.getStoriesBar().then(function(data) {
        var mapped = data.map(function(u) {
            var lastSeen = 0;
            try { lastSeen = parseInt(localStorage.getItem('rv_stories_seen_' + u._id) || '0', 10); } catch(e) {}
            var lastPost = u.last_post_created;
            var hasNew = false;
            if (lastPost) {
                var postTime = (lastPost && lastPost.$date)
                    ? new Date(lastPost.$date).getTime()
                    : new Date(lastPost).getTime();
                hasNew = !isNaN(postTime) && postTime > lastSeen;
            } else {
                hasNew = !!u.fixed_slot;
            }
            return {
                _id:        u._id,
                name:       u.name || 'Produtor',
                photo:      u.photo || null,
                fixed_slot: !!u.fixed_slot,
                hasNew:     hasNew
            };
        });

        // Inject #familia fixed slot at position 2 (after MIDR and FADEX)
        var familiaSlot = {
            _id:           'familia',
            name:          'Família',
            photo:         'img/characters/' + routeId + '/celebration/1.png',
            fixed_slot:    true,
            isFilterSlot:  true,
            filterTag:     'familia',
            hasNew:        true   // always active — never marked as seen
        };
        var insertAt = Math.min(2, mapped.length);
        mapped.splice(insertAt, 0, familiaSlot);

        $scope.storiesBar = mapped;
    }).catch(function() { $scope.storiesBar = []; });

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
        $scope.newPost = {
            // mídia
            mediaFile: null, mediaPreview: null, mediaType: null,
            mediaItems: [],    // [{dataUrl, file}] — suporte a carrossel
            // legenda
            caption: '', charCount: 0,
            // marcações
            mentions: [], showMentionSearch: false, mentionQuery: '', mentionResults: [],
            pendingMention: null, showTipoModal: false,
            // CTA button (F1.2)
            ctaButton: null, showCtaEditor: false,
            ctaLabel: '', ctaUrl: '', ctaPos: { x: 50, y: 80 },
            // Canvas text (F1.3)
            showTextEditor: false, textApplied: false,
            originalPreview: null, textPreview: null,
            textConfig: { text: '', fontSize: 36, color: '#ffffff', bgColor: 'rgba(0,0,0,0.55)', x: 50, y: 50 }
        };
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
        if (isVideo) {
            $scope.newPost.mediaFile = file;
            $scope.newPost.mediaType = 'video';
            $scope.newPost.mediaItems = [];
            $scope.$apply(function() {
                $scope.newPost.mediaPreview = URL.createObjectURL(file);
            });
        } else {
            compressImage(file, function(dataUrl) {
                $scope.$apply(function() {
                    $scope.newPost.mediaItems = [{ file: file, dataUrl: dataUrl }];
                    $scope.newPost.mediaFile = file;
                    $scope.newPost.mediaType = 'image';
                    $scope.newPost.mediaPreview = dataUrl;
                    $scope.newPost.originalPreview = dataUrl;
                });
            });
        }
        inputEl.value = '';
    };

    // Adiciona mais uma foto ao carrossel
    $scope.triggerCarouselAdd = function() {
        document.getElementById('gallery-input-carousel').click();
    };

    $scope.onCarouselFileSelected = function(inputEl) {
        var file = inputEl.files && inputEl.files[0];
        if (!file || !$scope.newPost) return;
        if ($scope.newPost.mediaItems.length >= 10) { inputEl.value = ''; return; }
        compressImage(file, function(dataUrl) {
            $scope.$apply(function() {
                $scope.newPost.mediaItems.push({ file: file, dataUrl: dataUrl });
            });
        });
        inputEl.value = '';
    };

    $scope.removeCarouselItem = function(idx) {
        if (!$scope.newPost) return;
        $scope.newPost.mediaItems.splice(idx, 1);
        if ($scope.newPost.mediaItems.length === 0) {
            $scope.newPost.mediaFile = null;
            $scope.newPost.mediaPreview = null;
            $scope.newPost.mediaType = null;
            $scope.newPost.originalPreview = null;
            $scope.newPost.textApplied = false;
        } else {
            $scope.newPost.mediaFile   = $scope.newPost.mediaItems[0].file;
            $scope.newPost.mediaPreview = $scope.newPost.mediaItems[0].dataUrl;
        }
    };

    $scope.updateCharCount = function() {
        if ($scope.newPost) $scope.newPost.charCount = ($scope.newPost.caption || '').length;
    };

    $scope.removeMedia = function() {
        $scope.newPost.mediaFile = null;
        $scope.newPost.mediaPreview = null;
        $scope.newPost.mediaType = null;
        $scope.newPost.mediaItems = [];
        $scope.newPost.originalPreview = null;
        $scope.newPost.textApplied = false;
        $scope.newPost.ctaButton = null;
        document.querySelectorAll('.gallery-file-input').forEach(function(el) { el.value = ''; });
    };

    // ─── F1.2 — CTA Button ────────────────────────────────────────────────────
    $scope.openCtaEditor = function() {
        if (!$scope.newPost) return;
        $scope.newPost.showCtaEditor = true;
        if ($scope.newPost.ctaButton) {
            $scope.newPost.ctaLabel = $scope.newPost.ctaButton.label;
            $scope.newPost.ctaUrl   = $scope.newPost.ctaButton.url;
            $scope.newPost.ctaPos   = { x: $scope.newPost.ctaButton.pos_x, y: $scope.newPost.ctaButton.pos_y };
        }
    };

    $scope.closeCtaEditor = function() {
        if (!$scope.newPost) return;
        $scope.newPost.showCtaEditor = false;
    };

    $scope.setCtaPos = function($event) {
        if (!$scope.newPost || !$scope.newPost.showCtaEditor) return;
        var el = $event.currentTarget;
        var rect = el.getBoundingClientRect();
        var clientX = $event.touches ? $event.touches[0].clientX : $event.clientX;
        var clientY = $event.touches ? $event.touches[0].clientY : $event.clientY;
        $scope.newPost.ctaPos.x = Math.round(Math.max(5, Math.min(85, ((clientX - rect.left) / rect.width)  * 100)));
        $scope.newPost.ctaPos.y = Math.round(Math.max(5, Math.min(90, ((clientY - rect.top)  / rect.height) * 100)));
    };

    $scope.confirmCta = function() {
        if (!$scope.newPost) return;
        var label = ($scope.newPost.ctaLabel || '').trim();
        var url   = ($scope.newPost.ctaUrl   || '').trim();
        if (!label || !url) return;
        $scope.newPost.ctaButton = {
            label: label, url: url,
            pos_x: $scope.newPost.ctaPos.x,
            pos_y: $scope.newPost.ctaPos.y
        };
        $scope.newPost.showCtaEditor = false;
    };

    $scope.removeCta = function() {
        if (!$scope.newPost) return;
        $scope.newPost.ctaButton = null;
        $scope.newPost.ctaLabel  = '';
        $scope.newPost.ctaUrl    = '';
    };

    // ─── F1.3 — Canvas Text Overlay ───────────────────────────────────────────
    $scope.openTextEditor = function() {
        if (!$scope.newPost || !$scope.newPost.mediaPreview) return;
        $scope.newPost.originalPreview = $scope.newPost.originalPreview || $scope.newPost.mediaPreview;
        $scope.newPost.showTextEditor = true;
        // Renderiza estado atual se já houver texto configurado
        if ($scope.newPost.textConfig.text) {
            $scope.renderTextCanvas();
        }
    };

    $scope.closeTextEditor = function() {
        if (!$scope.newPost) return;
        $scope.newPost.showTextEditor = false;
    };

    $scope.renderTextCanvas = function() {
        if (!$scope.newPost) return;
        var cfg = $scope.newPost.textConfig;
        var base = $scope.newPost.originalPreview || $scope.newPost.mediaPreview;
        if (!base) return;

        var img = new Image();
        img.onload = function() {
            var canvas = document.createElement('canvas');
            canvas.width  = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            if (cfg.text) {
                var fs         = cfg.fontSize;
                var px         = (cfg.x / 100) * img.width;
                var py         = (cfg.y / 100) * img.height;
                var lineHeight = Math.round(fs * 1.35);
                var pad        = fs * 0.35;
                var r          = 8;
                ctx.font         = 'bold ' + fs + 'px Inter, Arial, sans-serif';
                ctx.textAlign    = 'center';
                ctx.textBaseline = 'middle';

                var lines    = cfg.text.split('\n');
                var totalH   = lines.length * lineHeight;
                var startY   = py - totalH / 2 + lineHeight / 2;

                lines.forEach(function(line, i) {
                    var ly = startY + i * lineHeight;
                    var tw = ctx.measureText(line || ' ').width;

                    if (cfg.bgColor !== 'transparent') {
                        ctx.fillStyle = cfg.bgColor;
                        var rx = px - tw / 2 - pad;
                        var ry = ly - fs / 2 - pad * 0.5;
                        var rw = tw + pad * 2;
                        var rh = fs + pad;
                        ctx.beginPath();
                        ctx.moveTo(rx + r, ry);
                        ctx.lineTo(rx + rw - r, ry);
                        ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + r);
                        ctx.lineTo(rx + rw, ry + rh - r);
                        ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - r, ry + rh);
                        ctx.lineTo(rx + r, ry + rh);
                        ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - r);
                        ctx.lineTo(rx, ry + r);
                        ctx.quadraticCurveTo(rx, ry, rx + r, ry);
                        ctx.closePath();
                        ctx.fill();
                    }
                    ctx.fillStyle = cfg.color;
                    ctx.fillText(line, px, ly);
                });
            }

            $scope.$apply(function() {
                $scope.newPost.textPreview = canvas.toDataURL('image/jpeg', 0.92);
            });
        };
        img.src = base;
    };

    $scope.setTextPos = function($event) {
        if (!$scope.newPost || !$scope.newPost.showTextEditor) return;
        var el = $event.currentTarget;
        var rect = el.getBoundingClientRect();
        var clientX = $event.touches ? $event.touches[0].clientX : $event.clientX;
        var clientY = $event.touches ? $event.touches[0].clientY : $event.clientY;
        $scope.newPost.textConfig.x = Math.round(Math.max(10, Math.min(90, ((clientX - rect.left) / rect.width)  * 100)));
        $scope.newPost.textConfig.y = Math.round(Math.max(10, Math.min(90, ((clientY - rect.top)  / rect.height) * 100)));
        $scope.renderTextCanvas();
    };

    $scope.applyTextOverlay = function() {
        if (!$scope.newPost) return;
        var result = $scope.newPost.textPreview || $scope.newPost.mediaPreview;
        $scope.newPost.mediaPreview = result;
        if ($scope.newPost.mediaItems.length > 0) {
            $scope.newPost.mediaItems[0].dataUrl = result;
            $scope.newPost.mediaItems[0].file = null; // upload via dataUrl
        }
        $scope.newPost.textApplied = true;
        $scope.newPost.showTextEditor = false;
    };

    $scope.removeTextOverlay = function() {
        if (!$scope.newPost || !$scope.newPost.originalPreview) return;
        $scope.newPost.mediaPreview = $scope.newPost.originalPreview;
        if ($scope.newPost.mediaItems.length > 0) {
            $scope.newPost.mediaItems[0].dataUrl = $scope.newPost.originalPreview;
        }
        $scope.newPost.textApplied = false;
        $scope.newPost.textPreview = null;
        $scope.newPost.textConfig  = { text: '', fontSize: 36, color: '#ffffff', bgColor: 'rgba(0,0,0,0.55)', x: 50, y: 50 };
    };

    $scope.submitPost = function() {
        if (!$scope.newPost || !$scope.newPost.mediaFile || $scope.submitting) return;
        $scope.submitting = true;

        var trailName = (theme.labels && theme.labels.missions_title) || route.name || '';
        var caption   = $scope.newPost.caption || '';
        var isVideo   = $scope.newPost.mediaType === 'video';

        // Auto-extrair hashtags da legenda
        var tagMatches = caption.match(/#(\w+)/g) || [];
        var tags = tagMatches.map(function(h) { return h.slice(1).toLowerCase(); });

        // Auto-tag #familia quando há marcação familiar
        var mentions = ($scope.newPost.mentions || []).map(function(m) {
            return { player_id: m.player_id, player_name: m.player_name, tipo: m.tipo };
        });
        var hasFamilyMention = mentions.some(function(m) {
            return ['pai', 'mae', 'filho', 'filha'].indexOf(m.tipo) >= 0;
        });
        if (hasFamilyMention && tags.indexOf('familia') < 0) tags.push('familia');

        var buildPayload = function(mediaUrl, mediaType, mediaItems) {
            var payload = {
                player:        playerId,
                player_name:   playerName,
                player_photo:  playerPhoto || '',
                description:   caption,
                trail_name:    trailName,
                media_url:     mediaUrl || '',
                media_type:    mediaType,
                tags:          tags,
                mentions:      mentions,
                created:       { '$date': new Date().toISOString() },
                like_count:    0,
                comment_count: 0
            };
            if (mediaItems && mediaItems.length > 1) payload.media_items = mediaItems;
            if ($scope.newPost.ctaButton) payload.cta_button = $scope.newPost.ctaButton;
            return payload;
        };

        var promise;
        var finalPayload; // captured so the .then callback can merge it

        if (isVideo) {
            promise = ApiService.uploadMedia($scope.newPost.mediaFile, true).then(function(mediaUrl) {
                finalPayload = buildPayload(mediaUrl, 'video', null);
                return ApiService.createPost(finalPayload);
            });
        } else {
            // Upload todas as imagens em paralelo (carrossel ou foto única)
            var uploadPromises = $scope.newPost.mediaItems.map(function(item) {
                if (item.dataUrl && item.dataUrl.startsWith('data:')) {
                    return ApiService.uploadMedia(dataUrlToBlob(item.dataUrl), false);
                }
                return ApiService.uploadMedia(item.file, false);
            });
            promise = $q.all(uploadPromises).then(function(urls) {
                var isCarousel = urls.length > 1;
                var mediaItems = isCarousel
                    ? urls.map(function(u) { return { url: u, type: 'image' }; })
                    : null;
                finalPayload = buildPayload(urls[0], isCarousel ? 'carousel' : 'image', mediaItems);
                return ApiService.createPost(finalPayload);
            });
        }

        promise.then(function(created) {
            // Merge: payload carries all media fields; created carries the server _id
            var postData = angular.extend({}, finalPayload, created || {});
            var p = normalizePost(postData);
            $scope.posts.unshift(p);
            $scope.closeNewPost();
            if (playerId && created && created._id) {
                ApiService.logAction('publish_post', {
                    post_id: created._id,
                    route: routeId
                }).catch(function() {});
            }
        }).catch(function() {
            alert('Erro ao publicar. Verifique sua conexão e tente novamente.');
        }).finally(function() {
            $scope.submitting = false;
        });
    };

    // ─── Search modal ─────────────────────────────────────────────────────────
    function loadRecents() {
        try {
            var raw = localStorage.getItem('rv_search_recent');
            $scope.searchRecents = raw ? JSON.parse(raw) : [];
        } catch(e) { $scope.searchRecents = []; }
    }

    function saveRecent(item) {
        var recents = ($scope.searchRecents || []).filter(function(r) {
            return !(r.type === item.type && r.value === item.value);
        });
        recents.unshift(item);
        if (recents.length > 10) recents = recents.slice(0, 10);
        $scope.searchRecents = recents;
        try { localStorage.setItem('rv_search_recent', JSON.stringify(recents)); } catch(e) {}
    }

    $scope.openSearch = function() {
        loadRecents();
        $scope.showSearch = true;
        $scope.searchQuery = '';
        $scope.searchResults = [];
        $scope.searchLoading = false;
        $timeout(function() {
            var input = document.querySelector('.search-modal-input');
            if (input) input.focus();
        }, 100);
    };

    $scope.closeSearch = function() {
        $scope.showSearch = false;
        $scope.searchQuery = '';
        $scope.searchResults = [];
    };

    var searchTimeout = null;
    $scope.onSearchInput = function() {
        var q = ($scope.searchQuery || '').trim();
        if (!q) { $scope.searchResults = []; $scope.searchLoading = false; return; }
        if (searchTimeout) $timeout.cancel(searchTimeout);
        $scope.searchLoading = true;
        searchTimeout = $timeout(function() {
            if (q.charAt(0) === '#') {
                var tagQ = q.slice(1);
                if (!tagQ) { $scope.searchResults = []; $scope.searchLoading = false; return; }
                ApiService.searchTags(tagQ).then(function(results) {
                    $scope.searchResults = results.map(function(r) {
                        return { type: 'tag', value: r._id, label: '#' + r._id, count: r.count };
                    });
                }).catch(function() {
                    $scope.searchResults = [];
                }).finally(function() { $scope.searchLoading = false; });
            } else {
                ApiService.searchPlayers(q).then(function(players) {
                    $scope.searchResults = players.map(function(p) {
                        var sub = p.profile === 'pescador' ? 'Rota da Pesca' : 'Rota do Mel';
                        if (p.extra && p.extra.municipality) sub = p.extra.municipality + ' · ' + sub;
                        return { type: 'player', value: p._id, label: p.name || p._id, sub: sub, photo: p.image && p.image.original && p.image.original.url || null };
                    });
                }).catch(function() {
                    $scope.searchResults = [];
                }).finally(function() { $scope.searchLoading = false; });
            }
        }, 350);
    };

    $scope.selectSearchResult = function(result) {
        saveRecent(result);
        if (result.type === 'tag') {
            $scope.filterTag = result.value;
            $scope.filterPlayerId = null;
            $scope.filterPlayerName = null;
        } else {
            $scope.filterPlayerId = result.value;
            $scope.filterPlayerName = result.label;
            $scope.filterTag = null;
        }
        $scope.closeSearch();
    };

    $scope.selectSuggestion = function(tag) {
        var result = { type: 'tag', value: tag, label: '#' + tag };
        saveRecent(result);
        $scope.filterTag = tag;
        $scope.filterPlayerId = null;
        $scope.filterPlayerName = null;
        $scope.closeSearch();
    };

    $scope.selectRecent = function(recent) {
        saveRecent(recent); // moves to top
        if (recent.type === 'tag') {
            $scope.filterTag = recent.value;
            $scope.filterPlayerId = null;
            $scope.filterPlayerName = null;
        } else {
            $scope.filterPlayerId = recent.value;
            $scope.filterPlayerName = recent.label;
            $scope.filterTag = null;
        }
        $scope.closeSearch();
    };

    $scope.removeRecent = function($event, idx) {
        $event.stopPropagation();
        $scope.searchRecents.splice(idx, 1);
        try { localStorage.setItem('rv_search_recent', JSON.stringify($scope.searchRecents)); } catch(e) {}
    };

    $scope.clearRecents = function() {
        $scope.searchRecents = [];
        try { localStorage.removeItem('rv_search_recent'); } catch(e) {}
    };

    // ─── Marcação de pessoas (Item I) ─────────────────────────────────────────
    $scope.openMentionSearch = function() {
        if (!$scope.newPost) return;
        $scope.newPost.showMentionSearch = true;
        $scope.newPost.mentionQuery = '';
        $scope.newPost.mentionResults = [];
        $timeout(function() {
            var input = document.querySelector('.mention-search-input');
            if (input) input.focus();
        }, 100);
    };

    $scope.closeMentionSearch = function() {
        if (!$scope.newPost) return;
        $scope.newPost.showMentionSearch = false;
        $scope.newPost.mentionQuery = '';
        $scope.newPost.mentionResults = [];
    };

    var mentionTimeout = null;
    $scope.onMentionInput = function() {
        var q = ($scope.newPost && $scope.newPost.mentionQuery || '').trim();
        if (!q || q.length < 2) {
            if ($scope.newPost) $scope.newPost.mentionResults = [];
            return;
        }
        if (mentionTimeout) $timeout.cancel(mentionTimeout);
        mentionTimeout = $timeout(function() {
            var alreadyMentioned = ($scope.newPost.mentions || []).map(function(m) { return m.player_id; });
            ApiService.searchPlayers(q).then(function(players) {
                if (!$scope.newPost) return;
                $scope.newPost.mentionResults = players
                    .filter(function(p) { return p._id !== playerId && alreadyMentioned.indexOf(p._id) < 0; })
                    .slice(0, 8)
                    .map(function(p) {
                        return {
                            player_id:    p._id,
                            player_name:  p.name || p._id,
                            player_photo: p.image && p.image.original && p.image.original.url || null
                        };
                    });
            }).catch(function() { if ($scope.newPost) $scope.newPost.mentionResults = []; });
        }, 350);
    };

    $scope.selectMentionResult = function(person) {
        if (!$scope.newPost) return;
        ApiService.getRelacionamento(playerId, person.player_id).then(function(rel) {
            if (rel && rel.tipo) {
                $scope.newPost.mentions.push({
                    player_id: person.player_id, player_name: person.player_name,
                    player_photo: person.player_photo, tipo: rel.tipo
                });
                $scope.closeMentionSearch();
            } else {
                $scope.newPost.pendingMention = person;
                $scope.newPost.showTipoModal = true;
                $scope.newPost.showMentionSearch = false;
            }
        }).catch(function() {
            $scope.newPost.pendingMention = person;
            $scope.newPost.showTipoModal = true;
            $scope.newPost.showMentionSearch = false;
        });
    };

    $scope.confirmTipo = function(tipo) {
        if (!$scope.newPost || !$scope.newPost.pendingMention) return;
        var person = $scope.newPost.pendingMention;
        ApiService.saveRelacionamento(playerId, person.player_id, tipo, person.player_name).catch(function() {});
        $scope.newPost.mentions.push({
            player_id: person.player_id, player_name: person.player_name,
            player_photo: person.player_photo, tipo: tipo
        });
        $scope.newPost.pendingMention = null;
        $scope.newPost.showTipoModal = false;
    };

    $scope.cancelTipo = function() {
        if (!$scope.newPost) return;
        $scope.newPost.pendingMention = null;
        $scope.newPost.showTipoModal = false;
    };

    $scope.removeMention = function(idx) {
        if ($scope.newPost && $scope.newPost.mentions) {
            $scope.newPost.mentions.splice(idx, 1);
        }
    };

    // ─── Stories bar ──────────────────────────────────────────────────────────
    $scope.openStories = function(user) {
        if (user.isFilterSlot) {
            // Toggle tag filter — tap again to clear
            $scope.filterTag = ($scope.filterTag === user.filterTag) ? null : user.filterTag;
            return;
        }
        try { localStorage.setItem('rv_stories_seen_' + user._id, Date.now().toString()); } catch(e) {}
        user.hasNew = false;
    };

    // ─── Carrossel — botões prev/next ─────────────────────────────────────────
    $scope.carouselPrev = function(post) {
        if (!post || post._carouselIndex <= 0) return;
        var idx = post._carouselIndex - 1;
        post._carouselIndex = idx;
        if (post._carouselScrollTo) post._carouselScrollTo(idx);
    };

    $scope.carouselNext = function(post) {
        if (!post || !post.media_items) return;
        if (post._carouselIndex >= post.media_items.length - 1) return;
        var idx = post._carouselIndex + 1;
        post._carouselIndex = idx;
        if (post._carouselScrollTo) post._carouselScrollTo(idx);
    };

    // ─── Vídeo no feed — mudo por padrão ─────────────────────────────────────
    $scope.videoMuted = true;
    $scope.toggleVideoMute = function($event) {
        $event.stopPropagation();
        $scope.videoMuted = !$scope.videoMuted;
    };

    // ─── Navegação ─────────────────────────────────────────────────────────────
    $scope.goHome    = function() { $location.path('/dashboard'); };
    $scope.goTrail   = function() { $location.path('/trail'); };
    $scope.goPerfil  = function() { $location.path('/profile'); };

    $scope.$on('$destroy', function() { document.body.style.overflow = ''; });
});
