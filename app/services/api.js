angular.module('rotaViva')

.factory('ApiService', function($http, $q, CPFService) {
    var api = {};
    var baseUrl = CONFIG.API_URL;
    var centralKey = CONFIG.CENTRAL_API_KEY;
    var publicToken = CONFIG.PUBLIC_TOKEN;

    function trailHeaders() {
        var t = localStorage.getItem('rv_token');
        return { headers: { 'Authorization': t, 'Content-Type': 'application/json' } };
    }

    // === Auth ===

    api.signup = function(data) {
        var payload = {
            _id: CPFService.sanitize(data.cpf),
            name: data.name.trim(),
            password: data.password,
            profile: data.profile
        };
        if (data.email && data.email.trim()) payload.email = data.email.trim();
        if (data.phone && data.phone.trim()) payload.phone = data.phone.trim();

        // Código de convite — capturado na página /mel ou /pesca
        var refBy = localStorage.getItem('rv_ref');
        if (refBy) {
            payload.ref_by = refBy;
            localStorage.removeItem('rv_ref'); // consome o código após usar
        }

        return $http.put(baseUrl + '/v3/database/signup__c', payload, {
            headers: { 'Authorization': publicToken }
        }).then(function(res) { return res.data; });
    };

    api.login = function(cpf, password) {
        return $http.post(baseUrl + '/v3/pub/' + centralKey + '/login', {
            cpf: CPFService.sanitize(cpf),
            password: password
        }).then(function(res) { return res.data; });
    };

    // === Public ===

    api.getRoutes = function() {
        return $http.post(baseUrl + '/v3/find/rota_info', {}, {
            headers: { 'Authorization': publicToken }
        }).then(function(res) { return res.data; });
    };

    api.getTheme = function(apiKey, token) {
        return $http.get(baseUrl + '/v3/database/theme__c?q=_id:\'default\'', {
            headers: { 'Authorization': token }
        }).then(function(res) {
            var data = res.data;
            return Array.isArray(data) ? data[0] : data;
        });
    };

    api.getFaqs = function() {
        return $http.get(baseUrl + '/v3/database/faq__c?sort=order:1&q=active:true', {
            headers: { 'Authorization': publicToken }
        }).then(function(res) {
            return Array.isArray(res.data) ? res.data : [];
        });
    };

    // === Trail (folder endpoints) ===

    api.folderInside = function(folderId) {
        var body = folderId ? { folder: folderId } : {};
        return $http.post(baseUrl + '/v3/folder/inside', body, trailHeaders()).then(function(res) {
            return res.data || {};
        });
    };

    api.folderProgress = function(folderId, playerId) {
        var body = { player: playerId };
        if (folderId) body.folder = folderId;
        return $http.post(baseUrl + '/v3/folder/progress', body, trailHeaders()).then(function(res) {
            return res.data || {};
        });
    };

    api.folderBreadcrumb = function(folderId) {
        return $http.post(baseUrl + '/v3/folder/breadcrumb', { folder: folderId }, trailHeaders()).then(function(res) {
            return res.data || [];
        });
    };

    api.dbGet = function(collection, id) {
        var url = baseUrl + '/v3/database/' + collection + '?strict=true&q=_id:\'' + id + '\'';
        return $http.get(url, trailHeaders()).then(function(res) {
            var data = res.data;
            if (Array.isArray(data)) return data[0] || null;
            return data;
        });
    };

    api.folderLog = function(itemId, playerId, percent) {
        var body = { item: itemId, player: playerId, status: 'done', finished: new Date().toISOString() };
        if (percent !== undefined) body.percent = percent;
        return $http.post(baseUrl + '/v3/folder/log', body, trailHeaders());
    };

    // === Player ===

    api.getPlayerStatus = function() {
        return $http.get(baseUrl + '/v3/player/me/status', trailHeaders()).then(function(res) {
            return res.data || {};
        });
    };

    api.logAction = function(actionId, attributes) {
        return $http.post(baseUrl + '/v3/action/log',
            { actionId: actionId, attributes: attributes || {} },
            trailHeaders()
        );
    };

    api.getActionLogs = function(playerId, limit) {
        var url = baseUrl + '/v3/database/action_log?strict=true&sort=time:-1&limit=' + (limit || 30) + '&q=userId:\'' + playerId + '\'';
        return $http.get(url, trailHeaders()).then(function(res) {
            return Array.isArray(res.data) ? res.data : [];
        });
    };

    // === Gallery ===

    api.getGalleryPosts = function(limit, skip) {
        return $http.post(
            baseUrl + '/v3/find/gallery_posts',
            { skip: skip || 0, limit: limit || 20 },
            trailHeaders()
        ).then(function(res) {
            return Array.isArray(res.data) ? res.data : [];
        });
    };

    api.getStoriesBar = function() {
        return $http.post(baseUrl + '/v3/find/stories_bar', {}, trailHeaders())
            .then(function(res) { return Array.isArray(res.data) ? res.data : []; });
    };

    api.likePost = function(postId, playerId) {
        return $http.post(baseUrl + '/v3/database/post_like__c', {
            post:    postId,
            player:  playerId,
            created: { '$date': new Date().toISOString() }
        }, trailHeaders()).then(function(res) { return res.data; });
    };

    api.unlikePost = function(postId, playerId) {
        return $http.delete(
            baseUrl + '/v3/database/post_like__c?q=post:\'' + postId + '\',player:\'' + playerId + '\'',
            trailHeaders()
        );
    };

    api.createPost = function(data) {
        return $http.post(baseUrl + '/v3/database/post__c', data, trailHeaders())
            .then(function(res) { return res.data; });
    };

    api.deletePost = function(postId) {
        return $http.delete(
            baseUrl + '/v3/database/post__c?q=_id:\'' + postId + '\'',
            trailHeaders()
        );
    };

    api.getComments = function(postId) {
        var url = baseUrl + '/v3/database/post_comment__c?sort=created:1&q=post:\'' + postId + '\'';
        return $http.get(url, trailHeaders()).then(function(res) {
            return Array.isArray(res.data) ? res.data : [];
        });
    };

    api.addComment = function(postId, playerId, playerName, playerPhoto, text) {
        return $http.post(baseUrl + '/v3/database/post_comment__c', {
            post:         postId,
            player:       playerId,
            player_name:  playerName,
            player_photo: playerPhoto || '',
            text:         text,
            created:      { '$date': new Date().toISOString() }
        }, trailHeaders()).then(function(res) { return res.data; });
    };

    // Converte base64 para Blob reutilizável
    function base64ToBlob(base64Data, filename) {
        var byteString = atob(base64Data.split(',')[1]);
        var mimeString = base64Data.split(',')[0].split(':')[1].split(';')[0];
        var ab = new ArrayBuffer(byteString.length);
        var ia = new Uint8Array(ab);
        for (var i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
        return new Blob([ab], { type: mimeString });
    }

    function uploadHeaders() {
        var t = localStorage.getItem('rv_token');
        // Funifier upload aceita o token como Bearer ou raw — tenta raw primeiro
        // Se o token já começa com "Basic" ou "Bearer", usa como está
        return { 'Authorization': t, 'Content-Type': undefined };
    }

    function parseUploadUrl(res) {
        var d = res.data;
        if (!d) return null;
        // Handle string responses
        if (typeof d === 'string' && d.startsWith('http')) return d;
        // Array of upload objects
        var uploads = d.uploads || d.files || (Array.isArray(d) ? d : []);
        if (uploads.length > 0) {
            var u = uploads[0];
            return (typeof u === 'string') ? u : (u.url || u.original || (u.image && u.image.original && u.image.original.url) || null);
        }
        // Video-specific fields
        if (d.video_url) return d.video_url;
        if (d.video && d.video.url) return d.video.url;
        if (d.video && d.video.original && d.video.original.url) return d.video.original.url;
        // Direct URL field
        if (d.url) return d.url;
        // Funifier image object
        if (d.image && d.image.original && d.image.original.url) return d.image.original.url;
        if (d.original && d.original.url) return d.original.url;
        return null;
    }

    // Upload de imagem ou vídeo via FormData — retorna URL pública
    // Nota: não existe /v3/upload/video — usa /v3/upload/file para qualquer arquivo
    api.uploadMedia = function(file, isVideo) {
        var formData = new FormData();
        formData.append('file', file, file.name || (isVideo ? 'video.mp4' : 'photo.jpg'));
        formData.append('extra', JSON.stringify({ session: isVideo ? 'videos' : 'images', playerId: '' }));

        var endpoint = isVideo ? '/v3/upload/file' : '/v3/upload/image';
        return $http.post(baseUrl + endpoint, formData, {
            headers: uploadHeaders(),
            transformRequest: angular.identity
        }).then(parseUploadUrl);
    };

    // Upload de foto de perfil (base64) — retorna URL pública
    api.uploadProfilePhoto = function(base64Data, playerId) {
        var blob = base64ToBlob(base64Data);
        var formData = new FormData();
        formData.append('file', blob, 'profile-' + playerId + '-' + Date.now() + '.jpg');
        formData.append('extra', JSON.stringify({ session: 'images', playerId: playerId }));

        return $http.post(baseUrl + '/v3/upload/image', formData, {
            headers: uploadHeaders(),
            transformRequest: angular.identity
        }).then(parseUploadUrl);
    };

    // === Prova de Campo (Galeria ↔ Trilha) ===

    api.getProvasDeCampo = function(lessonId, limit) {
        return $http.post(
            baseUrl + '/v3/find/provas_de_campo',
            { lesson_id: lessonId, limit: limit || 3 },
            trailHeaders()
        ).then(function(res) { return Array.isArray(res.data) ? res.data : []; });
    };

    api.countProvasDeCampo = function(lessonId) {
        return $http.post(
            baseUrl + '/v3/find/count_provas',
            { lesson_id: lessonId },
            trailHeaders()
        ).then(function(res) {
            var data = res.data;
            if (Array.isArray(data) && data.length > 0) return data[0].total || 0;
            return 0;
        });
    };

    // Publica um Diário na Galeria dos Saberes com metadados da lição
    api.publishDiario = function(payload) {
        return $http.post(baseUrl + '/v3/database/post__c', payload, trailHeaders())
            .then(function(res) { return res.data; });
    };

    // === Challenges / Badges ===

    // Retorna todos os challenges com nome e URL do badge
    api.getChallenges = function() {
        return $http.get(baseUrl + '/v3/challenge?fields=challenge,badge,description', trailHeaders()).then(function(res) {
            return Array.isArray(res.data) ? res.data : [];
        });
    };

    // Busca dados frescos do player autenticado
    api.getPlayer = function() {
        return $http.get(baseUrl + '/v3/player/me', trailHeaders())
            .then(function(res) { return res.data; });
    };

    // Atualiza dados do player autenticado — servidor extrai _id do token
    api.updatePlayer = function(data) {
        return $http.put(baseUrl + '/v3/player/me', data, trailHeaders())
            .then(function(res) { return res.data; });
    };

    // === Passaporte Digital ===

    api.getProgramas = function() {
        return $http.get(baseUrl + '/v3/database/programa__c?sort=order:1&q=active:true', trailHeaders())
            .then(function(res) { return Array.isArray(res.data) ? res.data : []; });
    };

    api.countEmitidos = function() {
        return $http.post(baseUrl + '/v3/find/count_emitidos', {}, trailHeaders())
            .then(function(res) {
                var data = res.data;
                if (Array.isArray(data) && data.length > 0) return data[0].total || 0;
                return 0;
            });
    };

    api.getReferralCount = function(refCode) {
        return $http.post(
            baseUrl + '/v3/find/referral_count',
            { ref_code: refCode },
            trailHeaders()
        ).then(function(res) {
            var data = res.data;
            if (Array.isArray(data) && data.length > 0) return data[0].total || 0;
            return 0;
        });
    };

    // Cria solicitação de contato com agente (coleção contato_agente__c)
    api.solicitarContato = function(data) {
        return $http.post(baseUrl + '/v3/database/contato_agente__c', data, trailHeaders())
            .then(function(res) { return res.data; });
    };

    // Verifica se já existe contato pendente/em_atendimento do player para um programa
    api.getContatoPendente = function(playerId, programaId) {
        var url = baseUrl + '/v3/database/contato_agente__c?strict=true&q=player:\'' + playerId + '\',programa_id:\'' + programaId + '\'';
        return $http.get(url, trailHeaders()).then(function(res) {
            var list = Array.isArray(res.data) ? res.data : [];
            return list.find(function(c) { return c.status !== 'atendido'; }) || null;
        });
    };

    // === Search ===

    api.searchTags = function(query) {
        return $http.post(
            baseUrl + '/v3/find/search_tags',
            { query: query },
            trailHeaders()
        ).then(function(res) { return Array.isArray(res.data) ? res.data : []; });
    };

    api.searchPlayers = function(query) {
        return $http.post(
            baseUrl + '/v3/find/search_players',
            { query: query },
            trailHeaders()
        ).then(function(res) { return Array.isArray(res.data) ? res.data : []; });
    };

    // === Relacionamentos (Item I — Marcação de Pessoas) ===

    // Busca o tipo de relacionamento já registrado entre dois players
    api.getRelacionamento = function(playerId, mentionedId) {
        var id = playerId + '__' + mentionedId;
        var url = baseUrl + '/v3/database/relacionamento__c?strict=true&q=_id:\'' + id + '\'';
        return $http.get(url, trailHeaders()).then(function(res) {
            var data = Array.isArray(res.data) ? res.data : [];
            return data.length > 0 ? data[0] : null;
        });
    };

    // Salva (cria ou atualiza) o relacionamento entre dois players
    api.saveRelacionamento = function(playerId, mentionedId, tipo, mentionedName) {
        var payload = {
            _id:            playerId + '__' + mentionedId,
            player:         playerId,
            mentioned:      mentionedId,
            tipo:           tipo,
            mentioned_name: mentionedName || '',
            created:        { '$date': new Date().toISOString() }
        };
        return $http.post(baseUrl + '/v3/database/relacionamento__c', payload, trailHeaders())
            .then(function(res) { return res.data; });
    };

    // Busca texto legal (terms/privacy) da coleção legal__c
    api.getLegal = function(slug) {
        return $http.get(baseUrl + '/v3/database/legal__c?q=slug:\'' + slug + '\'', trailHeaders())
            .then(function(res) {
                var data = Array.isArray(res.data) ? res.data : [];
                return data.length > 0 ? data[0] : null;
            });
    };

    // === História Interativa (Item L) ===

    api.getStory = function(storyId) {
        return $http.get(baseUrl + "/v3/database/story?strict=true&q=_id:'" + storyId + "'", trailHeaders())
            .then(function(res) {
                var data = Array.isArray(res.data) ? res.data : [];
                return data.length > 0 ? data[0] : null;
            });
    };

    api.getStoryCharacters = function(storyId) {
        return $http.post(baseUrl + '/v3/database/story_character/aggregate?strict=true',
            [{ $match: { story_id: storyId } }], trailHeaders())
            .then(function(res) { return Array.isArray(res.data) ? res.data : []; });
    };

    api.getStoryScenes = function(storyId) {
        return $http.post(baseUrl + '/v3/database/story_scene/aggregate?strict=true',
            [{ $match: { story_id: storyId } }, { $sort: { position: 1 } }], trailHeaders())
            .then(function(res) { return Array.isArray(res.data) ? res.data : []; });
    };

    return api;
});
