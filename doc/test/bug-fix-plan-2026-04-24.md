# Bug Fix Plan — Rota Viva Gamification & Security
**Data:** 2026-04-24
**Escopo:** Rota do Mel (gamificação primária). Após validação, migrar para Rota da Pesca e novas rotas.
**Prioridade 1:** Sistema de ações, pontuação e triggers
**Prioridade 2:** Segurança

---

## Diagnóstico consolidado

### Causa-raiz dos challenges não disparando

O motor de challenges do Funifier avalia automaticamente toda chamada a `POST /v3/action/log`. **Não é necessário criar triggers para avaliação de challenges.** O problema real é uma combinação de bugs no payload enviado pelo PWA:

| Bug | Arquivo | Impacto |
|-----|---------|---------|
| actionId errado: `onboarding_complete` → deve ser `complete_onboarding` | `onboarding.js:108` | Challenge `explorador_da_rota` (50 XP) nunca dispara |
| Chave errada: `lesson_type` → deve ser `type` | `reading.js`, `video.js`, `quiz.js`, `story.js` | Challenges `licao_de_bau` e `checkpoint` nunca disparam |
| Valor errado no challenge: filtro `type='bau'` → deve ser `type='chest'` | Funifier — challenge `licao_de_bau` | Challenge não reconhece o tipo correto |
| Valor errado no story: `type='story'` → deve ser `type='cartoon'` | `story.js:56` | Challenge `checkpoint` não dispara para histórias interativas |
| Action `login` nunca enviada | Auth Module no Funifier (ausência de rastreamento) | Challenge `presenca_diaria` (10 XP/7 dias) inoperante |
| Action `publish_post` nunca enviada após POST na Galeria | `gallery.js` | Engajamento de galeria não rastreado |
| Nenhum action `complete_module` enviado | Trigger ausente | Progressão por módulo sem rastreamento |

### Por que o teste manual falhou
O time de QA inseriu action_logs via `POST /v3/database/action_log` (endpoint de banco de dados bruto), que não passa pelo motor de challenges. O endpoint correto é `POST /v3/action/log`. O `produtor_registrado` funcionou porque o PWA usa o endpoint correto para o passaporte.

---

## Plano de correção — Prioridade 1 (Gamificação)

### Frente A — Funifier (configuração da plataforma)

#### A1 — Corrigir filtro do challenge `licao_de_bau`
**O quê:** Mudar `"value": "bau"` → `"value": "chest"` na regra de filtro do challenge.
**Por quê:** O tipo real do conteúdo no `folder_content_type` é `chest` (Baú de Recompensa), não `bau`.
**Endpoint:** `PUT /v3/database/challenge` com `_id: 'licao_de_bau'`
**Status:** ✅ Aplicado em 2026-04-24

#### A2 — Atualizar Auth Module para rastrear action `login`
**O quê:** Adicionar `manager.getActionManager().track(log)` no Auth Module "Auth Master" após autenticação bem-sucedida.
**Por quê:** A action `login` nunca é enviada pelo PWA. O challenge `presenca_diaria` depende exclusivamente dela. Registrar no backend é mais confiável do que adicionar chamada no frontend.
**Endpoint:** `POST /v3/auth/module` com `_id: '69e1374c9d58a5339b06fd15'`
**Status:** ✅ Aplicado em 2026-04-24

#### A3 — Criar trigger `complete_module` via folder_progress
**O quê:** Trigger Groovy em `entity: folder_progress`, `event: after_create`. Detecta quando um módulo atinge 100% e loga a action `complete_module`.
**Por quê:** A action `complete_module` está cadastrada no Funifier mas nunca é disparada. O trigger detecta isso automaticamente sem alteração no PWA.
**Detalhe:** Inclui deduplicação — verifica se `complete_module` já foi logado para o mesmo `module_id + player` antes de disparar novamente.
**Endpoint:** `POST /v3/trigger`
**Status:** ✅ Aplicado em 2026-04-24

#### A4 — Adicionar atributo `type` ao schema da action `complete_lesson` (se necessário)
**O quê:** Adicionar `{"name": "type", "type": "String"}` aos atributos registrados da action `complete_lesson`.
**Por quê:** Schema atual tem `lesson_id`, `lesson_title`, `module_id`, `route` mas não `type`. Necessário se o Funifier validar atributos contra o schema antes de avaliar challenges.
**Nota:** Testar após A1–A3. Se challenges dispararem sem esta etapa, é desnecessária.

---

### Frente B — PWA (código do aplicativo)

#### B1 — `onboarding.js:108` — actionId errado
```javascript
// ANTES:
ApiService.logAction('onboarding_complete', playerId, { route: routeId });
// DEPOIS:
ApiService.logAction('complete_onboarding', playerId, { route: routeId });
```
**Status:** ✅ Aplicado em 2026-04-24

#### B2 — `reading.js:118-122` — chave e valor errados
```javascript
// ANTES:
ApiService.logAction('complete_lesson', playerId, {
    lesson_type: 'reading',
    lesson_id: readingId,
    score: 100
})
// DEPOIS:
ApiService.logAction('complete_lesson', playerId, {
    type: 'chest',
    lesson_id: readingId,
    score: 100
})
```
**Status:** ✅ Aplicado em 2026-04-24

#### B3 — `video.js:211-215` — chave e valor errados
```javascript
// ANTES:
ApiService.logAction('complete_lesson', playerId, {
    lesson_type: 'video',
    lesson_id: videoId,
    score: 100
})
// DEPOIS:
ApiService.logAction('complete_lesson', playerId, {
    type: 'chest',
    lesson_id: videoId,
    score: 100
})
```
**Nota:** Vídeo é apresentado como baú na trilha → `type: 'chest'` para ativar `licao_de_bau`.
**Status:** ✅ Aplicado em 2026-04-24

#### B4 — `quiz.js:800-809` — chave errada, falta `type` no non-cartoon
```javascript
// ANTES (cartoon):  { lesson_type: 'cartoon', type: 'cartoon', lesson_id, score }
// DEPOIS (cartoon): { type: 'cartoon', lesson_id, score }

// ANTES (non-cartoon):  { lesson_type: 'quiz', lesson_id: quizId, score }
// DEPOIS (non-cartoon): { type: 'chest', lesson_id: quizId, score }
```
**Status:** ✅ Aplicado em 2026-04-24

#### B5 — `story.js:54-62` — `type` com valor errado
```javascript
// ANTES:  { lesson_type: 'cartoon', type: 'story', story_id, lesson_id, score }
// DEPOIS: { type: 'cartoon', story_id, lesson_id, score }
```
**Status:** ✅ Aplicado em 2026-04-24

#### B6 — `gallery.js` — action `publish_post` ausente
```javascript
// Adicionar no .then() após createPost() retornar com sucesso:
if (playerId && created && created._id) {
    ApiService.logAction('publish_post', playerId, {
        post_id: created._id,
        route: routeId
    }).catch(function() {});
}
```
**Status:** ✅ Aplicado em 2026-04-24

---

## Mapeamento de tipos de conteúdo → `type` na action `complete_lesson`

| `folder_content_type._id` | Título no Studio | `type` enviado | Challenge ativado |
|--------------------------|-----------------|----------------|-------------------|
| `chest` | Baú de Recompensa | `chest` | `licao_de_bau` (10 XP + 3 coins) |
| `video` | Vídeo | `chest` | `licao_de_bau` (10 XP + 3 coins) |
| `quiz` | Quiz | `chest` | `licao_de_bau` (10 XP + 3 coins) |
| `diy` | Coleta de Evidências | `chest` | `licao_de_bau` (10 XP + 3 coins) |
| `essay` | Escuta Ativa | `chest` | `licao_de_bau` (10 XP + 3 coins) |
| `cartoon` | Cartoon Interativo | `cartoon` | `checkpoint` (coins variáveis) |

**Racional:** Na trilha do app, todos os conteúdos não-cartoon são apresentados visualmente como baús. O challenge `licao_de_bau` premia toda lição regular concluída, independente do tipo interno de conteúdo.

---

## Plano de correção — Prioridade 2 (Segurança)

A implementar APÓS validação completa da gamificação.

| Achado | Severidade | Ação |
|--------|-----------|------|
| Senha master `123456` no Auth Module + bypass BCrypt | CRÍTICA | Remover senha master do script; restaurar `requirePassword=true` na Security |
| Roles com `write_all` e `delete_all` para players | CRÍTICA | Aplicar least privilege por coleção no Funifier Security |
| Tokens Basic hardcoded em `scripts/*.js` | ALTA | Rotacionar tokens; migrar para variáveis de ambiente |
| IDOR: `deletePost` — sem validação de ownership | ALTA | Fix Java `DatabaseRest.delete` + trigger `post__c/before_delete` (ver S1) |
| IDOR: `updatePlayer` — `_id` enviado pelo cliente | ALTA | Migrar para `PUT /v3/player/me` e `GET /v3/player/me` (ver S2) |
| Aggregates expostos — pipeline completo enviado pelo cliente | ALTA | Migrar para Prepared Aggregates via `POST /v3/find/{slug}` (ver S3) |
| `trustAsHtml` sem sanitização (`app.js`, `reading.js`, `profile.html`) | ALTA | Sanitizar com allowlist antes de renderizar |
| Queries sem escape e regex vulnerável (`api.js:93,423,442`) | MÉDIA | Escapar inputs; limitar tamanho de buscas |
| Token em localStorage + ausência de CSP/HSTS/SRI (`_headers`) | MÉDIA | Adicionar headers de segurança; avaliar HttpOnly cookie |
| Upload sem validação MIME/tamanho server-side | MÉDIA | Validar MIME e tamanho no backend antes de salvar |

---

### S1 — IDOR `deletePost`: Operação lógica via `POST /v3/database/remove_post` + Trigger

**Por que DELETE não funciona e POST funciona:**

`DELETE /v3/database/remove_post` usa o método `delete` do `DatabaseRest.java`, que primeiro consulta a coleção `remove_post` para obter IDs. Como essa coleção é sempre vazia, `ids.size() == 0` e a trigger nunca é chamada.

`POST /v3/database/remove_post` usa o método `insert`, que **já extrai o player do token e já o passa para as triggers** (linhas 196-230 de `DatabaseRest.java`) — sem nenhuma alteração Java necessária:
```java
String player = authBean.getPlayerFromTokenIfExist();
manager.getTriggerManager().execute(null, object, collection, Trigger.EVENT_BEFORE_CREATE, player, null);
// ... insert ...
manager.getTriggerManager().execute(null, o, collection, Trigger.EVENT_AFTER_CREATE, player, null);
```

**Nenhuma alteração em `DatabaseRest.java` é necessária para este fix.**

**Fix 1 — Trigger Funifier: `remove_post / after_create`**

O app faz `POST /v3/database/remove_post` com `{ "post_id": "XXX" }`. O Funifier insere o documento em `remove_post` (gerando `_id` automático) e dispara a trigger com o player do token no contexto. A trigger valida ownership, deleta de `post__c` se autorizado, e remove o próprio registro de `remove_post` para manter a coleção limpa.

```groovy
// item = documento inserido em remove_post: { "_id": "...", "post_id": "XXX" }
// context.player = ID do jogador extraído do token pelo Funifier
String postId        = (String) item.get("post_id")
String requestPlayer = (String) context.get("player")

if (postId == null || requestPlayer == null) return

Map post = manager.getJongoConnection()
    .getCollection("post__c")
    .findOne("{_id:#}", postId)
    .as(Map.class)

if (post == null) return  // post não existe

String postOwner = (String) post.get("player")
if (postOwner != null && postOwner.equals(requestPlayer)) {
    // Owner confirmado — deleta de post__c
    manager.getJongoConnection()
        .getCollection("post__c")
        .remove("{_id:#}", postId)
}
// Limpa o registro temporário em remove_post
manager.getJongoConnection()
    .getCollection("remove_post")
    .remove("{_id:#}", item.get("_id"))
```

**Fix 2 — PWA `api.js`:**
```javascript
// ANTES — DELETE direto em post__c, sem verificação de ownership:
api.deletePost = function(postId) {
    return $http.delete(baseUrl + '/v3/database/post__c?q=_id:\'' + postId + '\'', ...);
};

// DEPOIS — POST na operação lógica; ownership enforced server-side pela trigger:
api.deletePost = function(postId) {
    return $http.post(
        baseUrl + '/v3/database/remove_post',
        { post_id: postId },
        { headers: { 'Authorization': localStorage.getItem('rv_token') } }
    );
};
```

**Escopo de acesso do token após implementação:**
- Player recebe permissão de **escrita** em `remove_post` (operação lógica de solicitação de exclusão)
- Player **não** recebe permissão de DELETE direto em `post__c`
- A trigger é o único agente que executa o delete em `post__c`, somente após validar ownership

**Fluxo completo:**
```
App → POST /v3/database/remove_post  { "post_id": "XXX" }
  → DatabaseRest.insert(collection="remove_post")
      → player = token.player  ← já extraído pelo insert existente
      → trigger after_create(item={post_id:"XXX"}, player_do_token)
          → busca post em post__c
          → post.player == player_do_token? SIM → remove de post__c + limpa remove_post
                                             NÃO → apenas limpa remove_post (sem delete)
      → retorna 200
```

**`unlikePost` — mesma arquitetura, operação lógica `remove_post_like`:**
App faz `POST /v3/database/remove_post_like` com `{ "like_id": "XXX" }`. Trigger `remove_post_like / after_create` valida `post_like__c.player == context.player` e deleta de `post_like__c` se autorizado.

---

### S2 — IDOR `updatePlayer`: migrar para `PUT /v3/player/me`

**Diagnóstico:**
```javascript
// ATUAL — api.js:368 — _id enviado pelo cliente no body:
api.updatePlayer = function(playerId, data) {
    return $http.post(baseUrl + '/v3/player', angular.extend({ _id: playerId }, data), trailHeaders());
};
```
Com o role `write_all`, um player poderia forjar `_id` de outro player no body e sobrescrever dados alheios.

**Fix — PWA `api.js`:**
```javascript
// DEPOIS — servidor extrai player do token, ignora _id do cliente:
api.updatePlayer = function(data) {
    return $http.put(baseUrl + '/v3/player/me', data, trailHeaders())
        .then(function(res) { return res.data; });
};

// GET próprio player também migra para /me:
api.getPlayer = function() {
    return $http.get(baseUrl + '/v3/player/me', trailHeaders())
        .then(function(res) { return res.data; });
};

// logAction — remover userId do body (Funifier extrai do token):
api.logAction = function(actionId, attributes) {
    return $http.post(baseUrl + '/v3/action/log',
        { actionId: actionId, attributes: attributes || {} },
        trailHeaders()
    );
};
```
Todos os call sites em `profile.js` que passam `playerId` para `updatePlayer` e `getPlayer` precisam remover o parâmetro. `logAction` em todos os controllers: remover o segundo argumento (`playerId`).

---

### S3 — Aggregates expostos: migrar para Prepared Aggregates (`/v3/find/{slug}`)

**Diagnóstico:**
O cliente envia o pipeline MongoDB completo via `POST /v3/database/{col}/aggregate`. Isso:
- Expõe nomes de coleções internas: `post__c`, `post_like__c`, `post_comment__c`, `player`, `relacionamento__c`
- Expõe estrutura de campos: `extra.lesson_id`, `extra.weight`, `extra.fixed_slot`, `extra.ref_by`
- Permite que um atacante substitua o pipeline por um arbitrário e extraia qualquer coleção acessível ao role do player

**Como funciona `POST /v3/find/{slug}` (FindRest.java):**
- O admin cria "Prepared Aggregates" no Funifier Studio com pipelines fixos e placeholders `$param:nome`
- O Funifier automaticamente injeta `context.player` extraído do token (linha 62: `authBean.getPlayerFromTokenIfExist()`)
- O cliente chama `POST /v3/find/{slug}` passando apenas `{ "limit": 20, "skip": 0 }` — sem pipeline
- O pipeline fica server-side, invisível ao cliente

**Prioridade de migração:**

| Função em `api.js` | Coleção | Risco atual | Slug proposto |
|--------------------|---------|-------------|---------------|
| `searchPlayers` | `player/aggregate` com `$regex` livre | **CRÍTICO** — extração em massa de players | `search_players` |
| `getGalleryPosts` | `post__c` + `$lookup` player/likes/comments | **ALTO** — `user_liked` usa playerId do cliente | `gallery_posts` |
| `getStoriesBar` | `post__c` + `$lookup` player | **ALTO** | `stories_bar` |
| `countEmitidos` | `player/aggregate` | **MÉDIO** | `count_emitidos` |
| `getReferralCount` | `player/aggregate` | **MÉDIO** | `referral_count` |
| `searchTags` | `post__c` com `$regex` livre | **MÉDIO** — ReDoS | `search_tags` |
| `getProvasDeCampo` | `post__c` simples | **BAIXO** | `provas_de_campo` |
| `countProvasDeCampo` | `post__c` simples | **BAIXO** | `count_provas` |

**Benefício extra para `gallery_posts`:** hoje o campo `user_liked` usa `playerId` enviado pelo cliente (linha 146 de `api.js`). No Prepared Aggregate, o script Groovy usa `context.player` do token — o cliente não controla mais quem "curtiu".

**O que NÃO precisa migrar (risco baixo):**
- `api.dbGet` — `GET /v3/database/{col}?q=_id:'x'` — filtro simples por ID, não expõe schema
- `api.getActionLogs` — lê action_logs do próprio player com filtro direto
- `api.getComments`, `api.getProgramas`, `api.getLegal` — dados públicos ou leitura simples

---

### S4 — Exclusão em cascata de dados do player via `DELETE /v3/player/me` + Trigger

**Fix 1 — `PlayerRest.java` (método `delete`, linha ~1000): adicionar suporte a "me"**

O método `delete` é o único em `PlayerRest.java` que não trata a palavra reservada "me" — todos os outros métodos (`find`, `findStatus`, `resetPlayer`, `findPrincipal`, `updateStatus`) já têm o padrão. A correção é trivial:

```java
// ATUAL:
@DELETE
@Path("/{id}")
public Response delete(@BeanParam AuthBean authBean, @PathParam("id") String id) throws FunifierException {
    FrontController.getInstance(authBean.getApiKey()).getManagerFactory().getPlayerManager().delete(id);
    return Callback.callback(Response.Status.NO_CONTENT.getStatusCode());
}

// DEPOIS:
@DELETE
@Path("/{id}")
public Response delete(@BeanParam AuthBean authBean, @PathParam("id") String id) throws FunifierException {
    if ("me".equals(id)) {
        id = authBean.getPlayerFromTokenIfExist();
    }
    FrontController.getInstance(authBean.getApiKey()).getManagerFactory().getPlayerManager().delete(id);
    return Callback.callback(Response.Status.NO_CONTENT.getStatusCode());
}
```

Com isso, o app chama `DELETE /v3/player/me` — sem expor o ID do player na URL.

**Como `PlayerManager.delete()` dispara as triggers (`PlayerManager.java` linhas 104-133):**

```java
Player player = findById(userId);
// trigger before_delete — item = objeto Player completo, context.player = userId
manager.getTriggerManager().execute(userId, player, Trigger.ENTITY_PLAYER, Trigger.EVENT_BEFORE_DELETE, userId, null);

mongo.delete(userId, jongo);  // ← PlayerDaoMongo.delete() — limpa coleções nativas

// trigger after_delete — item = objeto Player (já removido do banco)
manager.getTriggerManager().execute(userId, player, Trigger.ENTITY_PLAYER, Trigger.EVENT_AFTER_DELETE, userId, null);
```

Importante: `item` na trigger é o **objeto `Player`** (não uma `List<String>`), e `context.player` contém o `userId` como String. Usamos `context.get("player")` para obter o ID de forma segura.

**O que `PlayerDaoMongo.delete()` já limpa automaticamente (coleções nativas do Funifier):**

| Coleção | Filtro |
|---------|--------|
| `authentication`, `notification`, `thing_user_cache`, `view` | `userId` |
| `action_log`, `widget_log`, `question_log`, `quiz_log`, `mystery_box_log` | `userId` / `player` |
| `point`, `purchase`, `principal` | `userId` |
| `player_status`, `player` | `_id` |
| `achievement`, `challenge_progress`, `folder_log` | `player` |
| `team_player`, `lottery_ticket`, `competition_join` | `player` / `linkId` |

**O que a trigger `player / before_delete` precisa adicionar (coleções customizadas do Rota Viva):**

| Coleção | Referência ao player | Descrição |
|---------|---------------------|-----------|
| `post__c` | `player` | Posts publicados na galeria |
| `post_like__c` | `player` | Likes dados pelo player em posts de outros |
| `post_like__c` | `post` (cascata indireta) | Likes de outros players nos posts do player excluído |
| `post_comment__c` | `player` | Comentários feitos pelo player |
| `post_comment__c` | `post` (cascata indireta) | Comentários de outros nos posts do player excluído |
| `relacionamento__c` | `player` e `mentioned` | Vínculos bidirecionais |
| `contato_agente__c` | `player` | Solicitações de contato com agente |
| `signup__c` | `_id` | Registro de onboarding |

**Por que `before_delete`:** a trigger `before_delete` roda antes de `mongo.delete()`. Nesse momento o objeto `Player` ainda existe no banco e pode ser lido. A cascata customizada acontece primeiro; depois `PlayerDaoMongo.delete()` limpa as coleções nativas.

**Trigger Funifier: `player / before_delete`**

```groovy
// item    = objeto Player (extraído antes da exclusão por PlayerManager.delete())
// context.player = userId como String
String userId = (String) context.get("player")
if (userId == null) return

def jongo = manager.getJongoConnection()

// 1. Coleta IDs dos posts do player (necessário para cascata indireta)
def postIds = []
jongo.getCollection("post__c")
    .find("{player:#}", userId)
    .projection("{_id:1}")
    .as(Map.class)
    .each { postIds << it.get("_id") }

// 2. Remove likes e comentários de outros players nos posts do player (cascata indireta)
if (postIds) {
    jongo.getCollection("post_like__c").remove("{post: {\$in: #}}", postIds)
    jongo.getCollection("post_comment__c").remove("{post: {\$in: #}}", postIds)
}

// 3. Remove os posts do player
jongo.getCollection("post__c").remove("{player:#}", userId)

// 4. Remove likes e comentários que o player fez em posts de outros
jongo.getCollection("post_like__c").remove("{player:#}", userId)
jongo.getCollection("post_comment__c").remove("{player:#}", userId)

// 5. Remove relacionamentos onde o player é origem ou destino
jongo.getCollection("relacionamento__c").remove("{player:#}", userId)
jongo.getCollection("relacionamento__c").remove("{mentioned:#}", userId)

// 6. Remove solicitações de contato com agente
jongo.getCollection("contato_agente__c").remove("{player:#}", userId)

// 7. Remove registro de onboarding/signup
jongo.getCollection("signup__c").remove("{_id:#}", userId)

// 8. Remove registro da gamification central
FrontController.getInstance("69c58d85e6650e26dad2166f").getManagerFactory().getPlayerManager().delete(userId);

```

**Fluxo completo após implementação:**
```
App → DELETE /v3/player/me
  → PlayerRest.delete(id="me")
      → id = token.player  ← novo: resolve "me"
      → PlayerManager.delete(userId)
          → trigger before_delete(item=Player, context.player=userId)
              → limpa post__c, post_like__c, post_comment__c (direto + cascata)
              → limpa relacionamento__c, contato_agente__c, signup__c
          → PlayerDaoMongo.delete(userId)
              → limpa action_log, achievement, folder_log, point, ...
          → trigger after_delete(item=Player, context.player=userId)
```

---

## Plano de migração para novas rotas

Após validação na Rota do Mel, cada nova rota recebe:

1. **Actions cadastradas:** `complete_lesson`, `complete_module`, `complete_onboarding`, `complete_passport`, `login`, `publish_post`, `invite_accepted` — copiar schema da Rota do Mel
2. **Challenges cadastrados:** `explorador_da_rota`, `produtor_registrado`, `licao_de_bau`, `checkpoint`, `presenca_diaria`, `conector` — mesma estrutura e filtros
3. **Auth Module:** "Auth Master" com rastreamento de login (mesmo script Groovy)
4. **Trigger:** `complete_module` via `folder_progress` (mesmo script Groovy)
5. **Níveis:** Adaptar terminologia ao contexto da rota (ex: "Apicultor Aprendiz", "Pescador Aprendiz")

---

## Sequência de validação recomendada (Rota do Mel)

1. Completar onboarding → verificar `explorador_da_rota` no achievement do player (50 XP)
2. Completar lição de baú (reading/video/quiz) → verificar `licao_de_bau` no achievement (10 XP + 3 coins)
3. Completar cartoon checkpoint → verificar `checkpoint` no achievement (coins variáveis)
4. Fazer login em dias consecutivos → verificar action_log com `actionId: 'login'` e progress de `presenca_diaria`
5. Publicar post na galeria → verificar `publish_post` no action_log
6. Completar todas as lições de um módulo → verificar `complete_module` no action_log

---

## DIRETIVA STORY
O codigo da diretiva story do funifier studio esta em:
/funifier/funifier-studio/app/views/directives/story.html
/funifier/funifier-studio/app/scripts/directives/story.js

Preciso que seja feito um ajuste na diretiva story. Quando o usuário clica na tela onde aparece a imagem ou vídeo, é apresentado o overlay de controles, onde está o botão play/stop. Eu quero discutir com você, como implementar a mesma experiência que temos na tela no Amazon Prime Video! Eu vi que no Amazon Prime Video, ele funciona assim: quando a cena está passando na tela, se eu clico na cena ele mostra o overlay de controles, mas a cena continua tocando, então eu clico no botão stop, e a cena para e ele mostra o botão de play. E em 3 segundos ele esconde o overlay de controles. Eu posso clicar novamente na tela para mostrar outra vez o overlay de controles. Então quando eu clico no botão play, ele volta a tocar a cena, troca o botão para stop, e 3 segundos depois ele esconde o overlay de controles. Entendeu como funciona essa experiência do usuário? Pode implementar dessa forma na diretiva por favor?