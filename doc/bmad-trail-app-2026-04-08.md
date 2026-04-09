# Plano de Implementação — Trilha no App Rota Viva
## Sessão de Planejamento — 2026-04-08

**Participantes:** Ricardo Lopes Costa (CTO/Founder), Claude (Arquiteto/Dev)

---

## 1. Estado atual do app (diagnóstico)

### O que já funciona
| Componente | Status |
|------------|--------|
| Trilha S-curve (bolinhas) | ✅ Funcional |
| Conteúdo tipo `video` (YouTube embed) | ✅ Funcional (bug: não navega de volta) |
| Conteúdo tipo `quiz` com perguntas | ✅ Parcial — ver tabela abaixo |
| Conteúdo tipo `mission` (DIY_PROJECT) | ✅ Funcional |
| Progress tracking via `folder/log` | ✅ Funcional |
| Bottom nav + navegação | ✅ v1.4.0 |

### Tipos de questão — suporte atual vs necessário

| Tipo Funifier | Nome no app | Rota Viva atual | Tutor | Ação necessária |
|---------------|-------------|-----------------|-------|-----------------|
| `MULTIPLE_CHOICE` (one_answer) | Escolha Única | ✅ | ✅ | — |
| `MULTIPLE_CHOICE` (multiple_answers) | Múltipla Escolha | ✅ | ✅ | — |
| `TRUE_FALSE` | Verdadeiro/Falso | ✅ | ✅ | — |
| `ESSAY` | Digitar Texto | ✅ | ✅ (com IA) | — |
| `DIY_PROJECT` | Foto/Vídeo | ✅ básico | ✅ completo | Melhorar feedback |
| `LISTEN` | Ouvir e Responder | ❌ | ✅ | **Portar do tutor** |
| `LISTEN_AND_ORDER` | Ouvir e Ordenar | ❌ | ✅ | **Portar do tutor** |
| `MATCHING` | Associação | ❌ | ✅ | **Portar do tutor** |
| `SELECT_MISSING_WORDS` | Completar Lacunas | ❌ | ✅ | **Portar do tutor** |
| `DRAG_AND_DROP_INTO_TEXT` | Arrastar Palavras | ❌ | ✅ | **Portar do tutor** |
| `SHORT_ANSWER` | Digitar Resposta | ✅ parcial | ✅ | Ajustar validação |
| `SPEAK` | Leitura em Voz Alta | ❌ | ✅ (STT+AI) | Ver decisão D1 |

---

## 2. Bugs críticos a corrigir

### B1 — Vídeo não volta para a trilha após conclusão ⚠️ CRÍTICO

**Situação atual:** o usuário clica "Concluir Vídeo", a ação é registrada mas a tela fica parada. Precisa clicar no botão voltar manualmente.

**Comportamento esperado (Duolingo):**
1. Usuário assiste o vídeo
2. Clica "Avançar" (renomear botão)
3. Registra `folder/log` + `logAction`
4. Mostra celebração (confetti + toast XP) igual ao quiz
5. Após 2-3 segundos, navega de volta para `/trail`

**Implementação:**
```js
// video.js — após markDone():
$scope.markDone = function() {
    $scope.completed = true;
    // ... registros existentes ...

    // Celebração
    if (typeof window.confetti === 'function') { /* ... */ }
    SoundService.play('levelup');
    if (navigator.vibrate) navigator.vibrate([80, 50, 80]);
    showXpToast(10); // vídeo = 10 favos

    // Volta para a trilha após 2.5s
    $timeout(function() { window.history.back(); }, 2500);
};
```

**Arquivos:** `pages/video/video.js`, `pages/video/video.html`

---

### B2 — LISTEN não funciona (sem botão de áudio)

**Situação atual:** questões do tipo `LISTEN` e `LISTEN_AND_ORDER` têm o campo `speechText` mas o quiz não renderiza o botão de alto-falante — exibe a pergunta como texto normal.

**Como o tutor resolve:** `getStyle()` detecta o tipo e mostra botão 🔊 ao invés do texto da pergunta. `speakTTS()` usa a Web Speech API (`SpeechSynthesis`) para ler o `speechText` em voz alta.

**Implementação:** portar `getStyle()`, `speakTTS()`, e o bloco LISTEN do HTML do tutor para o rota-viva. Sem STT (reconhecimento de voz) — só TTS (síntese de voz). A resposta ainda é por escolha (MULTIPLE_CHOICE) ou ordenação (LISTEN_AND_ORDER).

---

## 3. Tipos de questão a portar do tutor

> Código base: `/jarvis/tutor/app/pages/quiz/`
> O tutor usa a mesma stack AngularJS 1.8 + Funifier. Portar é copiar e adaptar ao CSS do rota-viva.

### Sprint 3-A: Ouvir (LISTEN + LISTEN_AND_ORDER)

**LISTEN** — botão 🔊 + resposta por escolha múltipla:
```html
<!-- quiz.html — bloco LISTEN -->
<div class="quiz-listen-area" ng-if="isListen()">
    <button class="quiz-listen-btn" ng-click="speakTTS()" ng-class="{'speaking': isSpeaking}">
        <i class="fas fa-volume-high"></i>
        <span ng-if="!isSpeaking">Ouvir</span>
        <span ng-if="isSpeaking">Reproduzindo...</span>
    </button>
    <p class="quiz-listen-hint">Ouça e escolha a resposta correta</p>
</div>
```

```js
// quiz.js
$scope.isListen = function() {
    var q = $scope.current();
    return q && (q.type === 'LISTEN' || q.type === 'LISTEN_AND_ORDER');
};

$scope.isSpeaking = false;
$scope.speakTTS = function() {
    var q = $scope.current();
    if (!q || !q.speechText) return;
    window.speechSynthesis.cancel();
    var utt = new SpeechSynthesisUtterance(q.speechText);
    utt.lang = q.ttsLang || 'pt-BR';
    $scope.isSpeaking = true;
    utt.onend = function() { $scope.$apply(function() { $scope.isSpeaking = false; }); };
    window.speechSynthesis.speak(utt);
};
```

**LISTEN_AND_ORDER** — ouve o texto, depois arrasta itens para ordenar (igual a `MATCHING` mas com drag-and-drop vertical). Ver design no tutor.

---

### Sprint 3-B: Associação (MATCHING)

Campo `choices` com pares `{left: "...", right: "..."}`. O app embaralha a coluna da direita e o usuário seleciona via dropdown ou drag.

```html
<div class="quiz-matching" ng-if="current().type === 'MATCHING'">
    <div class="quiz-match-pair" ng-repeat="pair in matchPairs">
        <div class="quiz-match-left">{{pair.left}}</div>
        <select class="quiz-match-select" ng-model="pair.selected"
                ng-options="opt for opt in matchOptions">
            <option value="">Escolher...</option>
        </select>
    </div>
</div>
```

---

### Sprint 3-C: Completar Lacunas (SELECT_MISSING_WORDS)

Texto com `[[opções|correto]]` nos campos. Renderiza dropdowns inline no texto.

---

### Sprint 3-D: Arrastar Palavras (DRAG_AND_DROP_INTO_TEXT)

Banco de palavras embaixo + slots `[___]` no texto. Toque na palavra preenche o próximo slot vazio. Toque no slot remove a palavra.

---

## 4. Novo tipo de conteúdo: Leitura

### Especificação

O app precisa suportar uma lição do tipo **Leitura** — texto formatado com imagens e infográficos, como um artigo de blog simplificado.

**Coleção Funifier proposta:** `reading__c`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `_id` | string | ID automático |
| `title` | string | Título da leitura |
| `body` | string (HTML) | Conteúdo em HTML: `<h2>`, `<p>`, `<img>`, `<ul>` |
| `cover_image` | string (URL) | Imagem de capa |
| `estimated_time` | number | Tempo estimado em minutos |
| `references` | string | Fontes / links opcionais |

**Rota:** `/reading/:id`

**Comportamento:**
1. Usuário abre a lição de leitura
2. Rola o texto até o fim
3. Botão "Avançar" aparece ao chegar no final (ou após X segundos)
4. Registra conclusão + celebração + volta para trilha (igual ao vídeo)

**Ícone na trilha:** `fa-book-open`

**Decisão necessária (D-R1):** aprovamos a coleção `reading__c` com esses campos?

---

## 5. Tipo Missão — melhorias necessárias

O tipo `mission` (DIY_PROJECT) já funciona no quiz. Precisa de melhorias para o app:

### M1 — Localização GPS
Para lições do tipo **Diário > Localização** (mapear onde está o apiário/pesqueiro):

```js
// Capturar geolocalização
$scope.getLocation = function() {
    navigator.geolocation.getCurrentPosition(function(pos) {
        $scope.$apply(function() {
            $scope.locationData = {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
                accuracy: pos.coords.accuracy
            };
        });
    }, function(err) {
        // Fallback: campo de texto para endereço manual
    });
};
```

A localização é enviada como texto no campo `answer` junto com a foto:
`"lat:-6.1234,lng:-42.5678,accuracy:15m"`

### M2 — Gravação de vídeo curto (Diário)
O campo `evidenceTypes` pode incluir `["video"]`. Usar `<input type="file" accept="video/*" capture="environment">`. Upload via `ApiService.uploadMedia(file, true)`.

---

## 6. LGPD — Atualização dos Termos e Privacidade

Os modais de Termos e Privacidade no `/profile` precisam ser atualizados.

### Termos de Uso — adicionar:
```
Coleta de conteúdo gerado pelo usuário:
Ao usar o Rota Viva, você pode enviar fotos, vídeos, gravações de voz e sua 
localização geográfica como parte das atividades de aprendizado ("Diário", 
"Missão de Campo"). Ao enviar estes conteúdos, você autoriza o Rota Viva e 
o Ministério do Desenvolvimento Agrário (MDA) a:
- Armazenar e processar o conteúdo para fins de avaliação do aprendizado
- Usar o conteúdo de forma anonimizada em relatórios do projeto
- Publicar fotos e vídeos (com seu nome ou de forma anônima, conforme sua 
  preferência) na galeria pública do app e em materiais de comunicação do projeto
Você pode revogar esta autorização a qualquer momento através das configurações 
do seu perfil.
```

### Política de Privacidade — adicionar:
```
Dados coletados:
- Dados de identificação: nome, CPF (armazenado como hash), telefone, e-mail
- Dados de localização: coordenadas GPS quando você usa a função "Registrar Local"
- Conteúdo gerado: fotos, vídeos e gravações de voz enviados nas atividades
- Dados de uso: progresso nas trilhas, respostas de quizzes, tempo de uso

Base legal (LGPD art. 7º, inciso V): execução de política pública de 
extensão rural pelo MDA. Seus dados são tratados pelo Funifier (processador) 
sob contrato com garantias de segurança. Você tem direito de acesso, 
correção, portabilidade e exclusão dos seus dados — solicite via 
suporte@rotaviva.gov.br ou pela opção "Excluir conta" no app.
```

---

## 7. Plano de sprints técnicos

### Sprint 3-A — Bugs críticos (prioridade máxima)
| # | Tarefa | Esforço | Status |
|---|--------|---------|--------|
| B1 | Video: celebração + navegação automática após conclusão | Baixo | ✅ v1.4.2 |
| B2 | Quiz: suporte a LISTEN + LISTEN_AND_ORDER (TTS + tap-to-select) | Médio | ✅ v1.4.3 |
| B3 | Renomear "Concluir Vídeo" → "Avançar" | Mínimo | ✅ v1.4.2 |

### Sprint 3-B — Novos tipos de questão
| # | Tarefa | Esforço |
|---|--------|---------|
| Q1 | MATCHING (Associação) | Médio |
| Q2 | SELECT_MISSING_WORDS (Completar Lacunas) | Médio |
| Q3 | DRAG_AND_DROP_INTO_TEXT (Arrastar Palavras) | Alto |
| Q4 | SHORT_ANSWER — validação melhorada | Baixo |

### Sprint 3-C — Novo tipo de conteúdo
| # | Tarefa | Esforço |
|---|--------|---------|
| C1 | Página `/reading/:id` (coleção `reading__c`) | Médio |
| C2 | Missão: suporte a localização GPS | Médio |
| C3 | Missão: suporte a vídeo curto (evidenceTypes: video) | Baixo |

### Sprint 3-D — LGPD e perfil
| # | Tarefa | Esforço |
|---|--------|---------|
| L1 | Atualizar texto Termos de Uso no modal | Mínimo |
| L2 | Atualizar texto Política de Privacidade no modal | Mínimo |

---

## 8. Decisões — confirmadas em 2026-04-08

| # | Questão | Decisão |
|---|---------|---------|
| D1 | **SPEAK (leitura em voz alta)** | ✅ Reconhecimento de fala completo: SpeechRecognition (nativo) + fallback Whisper + avaliação GPT-4o-mini. Igual ao tutor. Sprint 3-D. |
| D2 | **Leitura `reading__c`** | ✅ Criar página de administração no Funifier Studio via coleção `studio_page`, modelada igual à página `video__c` existente. Claude implementa via API. |
| D3 | **Vídeo S3/Funifier** | Sem decisão — YouTube suficiente por ora. |
| D4 | **LISTEN_AND_ORDER** | ✅ Tap-to-select (igual ao tutor): itens aparecem embaralhados embaixo, usuário toca para mover para a sequência. Toque no item sequenciado volta ao banco. **Implementado em v1.4.3.** |
| D5 | **Localização GPS** | ✅ Mostrar mapa interativo com Leaflet.js (como Uber). Sprint 3-C. |

## 9. Padrão de quizzes — confirmado em 2026-04-08

- **10 questões por quiz** de conhecimento (padrão Duolingo)
- **Escuta Ativa / Diário:** conforme necessidade pedagógica, sem limite fixo
- **Tipos permitidos na Fase 1 (MVP):** `MULTIPLE_CHOICE`, `TRUE_FALSE`, `ESSAY`, `DIY_PROJECT` (foto), `LISTEN`, `LISTEN_AND_ORDER`
- **Tipos bloqueados até Sprint 3-B:** `MATCHING`, `SELECT_MISSING_WORDS`, `DRAG_AND_DROP_INTO_TEXT`
- **SPEAK:** Sprint 3-D (após Sprint 3-B)

## 10. Status das implementações

| Feature | Sprint | Status |
|---------|--------|--------|
| Video: celebração + auto-navegação | 2 | ✅ v1.4.2 |
| SoundService (correct/wrong/levelup) | 2 | ✅ v1.4.2 |
| Vibração háptica | 2 | ✅ v1.4.2 |
| XP toast + confetti | 2 | ✅ v1.4.2 |
| LISTEN (TTS + MC) | 3-A | ✅ v1.4.3 |
| LISTEN_AND_ORDER (tap-to-select) | 3-A | ✅ v1.4.3 |
| MATCHING | 3-B | ✅ v1.4.4 |
| SELECT_MISSING_WORDS | 3-B | ✅ v1.4.4 |
| DRAG_AND_DROP_INTO_TEXT | 3-B | ✅ v1.4.4 |
| reading__c + página /reading/:id | 3-C | ✅ v1.4.5 |
| GPS + Leaflet map (Diário) | 3-C | ✅ v1.4.5 |
| SPEAK (STT + AI) | 3-D | ⏳ pendente |
| LGPD texts update | 3-D | ⏳ pendente |

---

## 11. Prova de Campo — Galeria dos Saberes conectada às Trilhas

### Conceito

Quando um produtor termina uma lição de **Diário** (DIY_PROJECT), a foto/vídeo/localização enviada é automaticamente marcada com o contexto da lição e publicada na Galeria dos Saberes. Em dois momentos da UX, a comunidade aparece como prova social contextual:

1. **Antes de enviar** — o personagem da trilha apresenta 3 fotos recentes da comunidade que completaram a mesma lição: *"Veja o que outros apicultores fizeram aqui:"*
2. **Depois de enviar** — a tela de conclusão mostra quantas pessoas completaram aquela etapa + as últimas fotos da comunidade

### Por que isso é poderoso para o público rural

Produtores rurais tomam decisões por referência social ("vi meu vizinho fazer"). O Duolingo usa o ranking como prova social de que "outras pessoas estão fazendo"; o Rota Viva usa **evidência fotográfica real** de pessoas da mesma cadeia produtiva — muito mais concreto e confiável para esse público.

---

### Fluxo completo

```
Usuário abre lição de Diário (DIY_PROJECT)
  ↓
[PROVA DE CAMPO — antes]
Personagem da trilha aparece com balão:
"Veja o que outros produtores fizeram nesta etapa:"
Grid 3 fotos da comunidade com mesmo lesson_id
  ↓
Usuário tira foto / registra GPS / escreve texto
  ↓
Usuário clica "Verificar"
  ↓
[PUBLICAÇÃO AUTOMÁTICA]
quiz.js envia a evidência ao Funifier + posta na
coleção post__c com metadados da lição
  ↓
Tela de conclusão do quiz (quiz-finish):
  "Sua contribuição entrou para a Galeria dos Saberes!"
  "X produtores completaram esta etapa"
  Grid últimas 3 fotos da comunidade
  ↓
Volta para a trilha
```

---

### Dados — estrutura do post na Galeria

Quando um DIY_PROJECT é submetido, além do `logAnswer()` normal, o app posta na coleção `post__c` — a **mesma coleção usada pela Galeria dos Saberes**. Os posts da Galeria e as Provas de Campo são o mesmo tipo de documento; o que os diferencia são os campos `extra.lesson_id` e `extra.module_id`.

```json
{
  "player":  "<player_id>",
  "text":    "Completei: Meu Apiário no Mapa",
  "extra": {
    "lesson_id":    "<folder _id da lição>",
    "module_id":    "<folder _id do módulo>",
    "lesson_title": "Meu Apiário no Mapa",
    "route":        "mel",
    "evidence_type": "photo|location|text"
  },
  "image":   "<base64 ou URL da foto, se houver>"
}
```

**Endpoint para postar:** `POST /v3/database/post__c`

**Fetch para exibir (aggregate):** `POST /v3/database/post__c/aggregate?strict=true`
```json
[
  { "$match": { "extra.lesson_id": "<lessonId>" } },
  { "$sort": { "time": -1 } },
  { "$limit": 3 }
]
```

---

### Passagem de contexto da lição para o quiz

**Problema atual:** `trail.js` navega para `/quiz/:quizId` e perde o contexto de lição/módulo.

**Solução:** passar `lessonId` e `moduleId` como query params:

```js
// trail.js — startLesson()
$location.path('/quiz/' + item.contentId).search({
    lesson: item._id,
    module: item.moduleId,
    lessonTitle: item.title
});
```

```js
// quiz.js — no início do controller
var lessonId    = $location.search().lesson || null;
var moduleId    = $location.search().module || null;
var lessonTitle = $location.search().lessonTitle || '';
```

O mesmo padrão se aplica ao navegar para `/video/:id` e `/reading/:id`:

```js
$location.path('/video/' + vid).search({ lesson: item._id, module: item.moduleId });
$location.path('/reading/' + item.contentId).search({ lesson: item._id, module: item.moduleId });
```

---

### Componentes a implementar

#### A. `ApiService.getProvasDeCampo(lessonId, limit)`
```js
api.getProvasDeCampo = function(lessonId, limit) {
    return $http.post(
        baseUrl + '/v3/database/post__c/aggregate?strict=true',
        [
            { '$match': { 'extra.lesson_id': lessonId } },
            { '$sort': { 'time': -1 } },
            { '$limit': limit || 3 }
        ],
        { headers: trailHeaders() }
    ).then(function(res) {
        return Array.isArray(res.data) ? res.data : [];
    });
};
```

#### B. `ApiService.publishDiario(payload)`
```js
api.publishDiario = function(payload) {
    return $http.post(baseUrl + '/v3/database/post__c', payload, { headers: trailHeaders() });
};
```
*(mesmo endpoint da Galeria dos Saberes — `post__c` é a coleção unificada)*

#### C. `quiz.js` — publicar post após DIY_PROJECT
```js
// Chamado dentro de checkAnswer() após DIY_PROJECT ser respondido:
function publishDiarioPost(q) {
    if (!lessonId || !playerId) return;
    var evidenceType = $scope.diyPhotoData ? 'photo'
        : $scope.locationData ? 'location' : 'text';
    var post = {
        player: playerId,
        text: 'Completei: ' + (lessonTitle || 'Diário'),
        extra: {
            lesson_id: lessonId,
            module_id: moduleId,
            lesson_title: lessonTitle,
            route: session.route && session.route.profile === 'pescador' ? 'pesca' : 'mel',
            evidence_type: evidenceType
        }
    };
    if ($scope.diyPhotoData) post.image = $scope.diyPhotoData;
    ApiService.postProvasDeCampo(post).catch(function() {});
}
```

#### D. `quiz.js` — carregar Provas de Campo antes de exibir DIY_PROJECT
```js
// Quando a questão atual é DIY_PROJECT, carregar provas da comunidade:
$scope.$watch('currentIndex', function() {
    var q = $scope.current();
    $scope.provasDeCampo = [];
    if (q && q.type === 'DIY_PROJECT' && lessonId) {
        ApiService.getProvasDeCampo(lessonId, 3).then(function(posts) {
            $scope.provasDeCampo = posts;
        }).catch(function() {});
    }
});
```

#### E. `quiz.html` — bloco "Prova de Campo" antes do DIY_PROJECT

```html
<!-- Prova de Campo: mostrado acima do DIY_PROJECT quando há posts da comunidade -->
<div class="prova-campo" ng-if="current().type === 'DIY_PROJECT' && provasDeCampo.length > 0">
    <div class="prova-campo-header">
        <img class="prova-campo-char" ng-src="{{charImg}}" alt="">
        <div class="prova-campo-balao">
            Veja o que outros produtores fizeram nesta etapa:
        </div>
    </div>
    <div class="prova-campo-grid">
        <div class="prova-campo-item" ng-repeat="post in provasDeCampo">
            <img ng-if="post.image" ng-src="{{post.image}}" alt="">
            <div ng-if="!post.image" class="prova-campo-no-img">
                <i class="fas fa-map-marker-alt"></i>
            </div>
            <span class="prova-campo-name">{{post.player | firstWord}}</span>
        </div>
    </div>
</div>
```

#### F. `quiz.html` — bloco na tela de conclusão (quiz-finish)

```html
<!-- Prova de Campo: mostrado na tela de conclusão se a trilha tinha DIY -->
<div class="prova-campo-finish" ng-if="finished && provasDeCampo.length > 0 && hadDiario">
    <p class="prova-campo-finish-title">
        <i class="fas fa-users"></i>
        Sua contribuição entrou para a Galeria dos Saberes!
    </p>
    <div class="prova-campo-grid">
        <div class="prova-campo-item" ng-repeat="post in provasDeCampo | limitTo:3">
            <img ng-if="post.image" ng-src="{{post.image}}" alt="">
            <div ng-if="!post.image" class="prova-campo-no-img">
                <i class="fas fa-map-marker-alt"></i>
            </div>
        </div>
    </div>
</div>
```

---

### Imagem do personagem no balão

O personagem a ser exibido na Prova de Campo vem do mesmo conjunto de assets da trilha, usando a rota correta:

```js
// quiz.js — calculado no load
var charBasePath = 'img/characters/' + (routeId || 'mel') + '/trail/';
$scope.charImg = charBasePath + '1.png'; // personagem 1 como narrador padrão
```

---

### Filtro na Galeria dos Saberes (Fase 2)

Depois da Fase 1, a galeria (`/gallery`) ganha um filtro por módulo:

```
Galeria dos Saberes
  [Todos] [Módulo Início] [Módulo A] [Módulo B] ...
```

Permite ao usuário explorar o que a comunidade fez em cada etapa da trilha — incentivo contínuo para completar os módulos seguintes.

---

### Sprint 4 — Prova de Campo

#### Sprint 4-A — MVP (Fase 1)
| # | Tarefa | Esforço |
|---|--------|---------|
| PC1 | `trail.js`: passar `lesson`, `module`, `lessonTitle` como query params ao navegar | Mínimo |
| PC2 | `quiz.js` + `video.js` + `reading.js`: ler query params de contexto | Mínimo |
| PC3 | `ApiService`: `getProvasDeCampo()` e `postProvasDeCampo()` | Baixo |
| PC4 | `quiz.js`: publicar post na galeria após DIY_PROJECT submetido | Baixo |
| PC5 | `quiz.js`: carregar provas ao chegar em questão DIY_PROJECT | Baixo |
| PC6 | `quiz.html`: bloco Prova de Campo com personagem + grid | Médio |
| PC7 | `quiz.html`: bloco na tela de conclusão | Baixo |
| PC8 | CSS: `.prova-campo`, `.prova-campo-grid`, `.prova-campo-balao`, `.prova-campo-char` | Médio |

#### Sprint 4-B — Galeria por módulo (Fase 2)
| # | Tarefa | Esforço |
|---|--------|---------|
| PC9 | `gallery.js`: filtro por módulo/lição no feed | Médio |
| PC10 | `gallery.html`: tabs de módulos | Médio |
| PC11 | Contagem de produtores por lição (badge na trilha) | Alto |

---

## 12. Status das implementações — atualizado

| Feature | Sprint | Status |
|---------|--------|--------|
| Video: celebração + auto-navegação | 2 | ✅ v1.4.2 |
| SoundService (correct/wrong/levelup) | 2 | ✅ v1.4.2 |
| Vibração háptica | 2 | ✅ v1.4.2 |
| XP toast + confetti | 2 | ✅ v1.4.2 |
| LISTEN (TTS + MC) | 3-A | ✅ v1.4.3 |
| LISTEN_AND_ORDER (tap-to-select) | 3-A | ✅ v1.4.3 |
| MATCHING | 3-B | ✅ v1.4.4 |
| SELECT_MISSING_WORDS | 3-B | ✅ v1.4.4 |
| DRAG_AND_DROP_INTO_TEXT | 3-B | ✅ v1.4.4 |
| reading__c + página /reading/:id | 3-C | ✅ v1.4.5 |
| GPS + Leaflet map (Diário) | 3-C | ✅ v1.4.5 |
| SPEAK (SpeechRecognition + keyword eval) | 3-D | ✅ v1.4.8 |
| LGPD texts update | 3-D | ⏳ pendente |
| Prova de Campo — MVP | 4-A | ✅ v1.4.7 |
| Galeria filtrada por módulo | 4-B | ⏳ pendente |

---

---

## 13. Redesign do Baú — Fluxo Completo da Tarefa de Campo

### 13.1 Ícone e tipo de lição

O ícone **baú** (`fa-treasure-chest` / `🪙`) representa qualquer lição do tipo `DIY_PROJECT`. É o único tipo de lição que envolve:
- prova social (Prova de Campo)
- execução de tarefa de campo (foto e/ou GPS)
- consentimento de publicação no feed
- ganho de cristais

### 13.2 Posicionamento da Prova de Campo — decisão de design

**Implementação atual (v1.4.6):** a Prova de Campo aparece na **mesma tela** da tarefa DIY_PROJECT, logo acima dos controles de câmera/GPS. O usuário vê as fotos dos outros e, rolando para baixo, chega nos controles. É efetivamente "antes de agir", mas numa tela só.

**Decisão revisada (Sprint 5-A):** separar em telas distintas para dar mais peso a cada momento:

```
┌─────────────────────────────────────┐
│  TELA 1 — Introdução da tarefa      │
│  (narração do personagem)           │
│  → título + instrução da atividade  │
│                                     │
│  [se existem posts]                 │
│    Prova de Campo: grid de fotos    │
│    "Veja o que outros fizeram →"    │
│  [se vazio]                         │
│    Balão pioneiro                   │
│                                     │
│  [ Começar tarefa ]  ← CTA          │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  TELA 2 — Execução da tarefa        │
│  câmera / GPS conforme o tipo       │
│  [ Confirmar ]                      │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  TELA 3 — Consentimento de          │
│  publicação no feed                 │
│                                     │
│  "Quer compartilhar com a           │
│   comunidade?"                      │
│                                     │
│  [ ✓ Publicar no feed ]             │
│  [ Continuar sem publicar ]         │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  TELA 4 — Cristais ganhos           │
│                                     │
│  🔮 +25 cristais                    │
│  "(+bônus por publicar no feed)"    │
│  "Resgate dicas especiais na loja"  │
│                                     │
│  [ Continuar ]                      │
└─────────────────────────────────────┘
```

**Regra de consentimento:**
- Publicar no feed → `extra.published = true` → aparece na Galeria dos Saberes e nas Provas de Campo de outros usuários
- Não publicar → tarefa é registrada, XP e cristais são ganhos normalmente, post NÃO aparece no feed
- Bônus de cristais por publicar: +10 extras (incentivo, não obrigação)

**Regra de cristais na tela 4:**
- O saldo de cristais é atualizado no perfil do usuário
- A notificação "+25 cristais" é celebratória (animação)
- O usuário **não resgata nada agora** — apenas sabe que ganhou
- O resgate acontece na Loja de Dicas (seção separada do app)

---

## 14. Loja de Dicas — Design e Análise Octalysis

### 14.1 Conceito

Uma área dedicada do app onde o usuário gasta cristais para desbloquear **dicas especiais em vídeo** — conteúdo exclusivo que vai além da trilha principal. As dicas são produzidas por produtores experientes ou especialistas, no formato depoimento (60–90s).

A loja **nunca bloqueia o progresso na trilha**. Todo conteúdo essencial para completar os módulos está na trilha. As dicas são *bonus tracks* — sabedoria de campo que enriquece a prática.

### 14.2 Análise Octalysis — Yu-Kai Chou

#### Prova de Campo

| Core Drive | Intensidade | Justificativa |
|---|---|---|
| CD5 — Social Influence & Relatedness | ★★★★★ | Ver foto real de um par na mesma tarefa: prova social máxima. O contexto da lição específica amplifica o efeito. |
| CD1 — Epic Meaning & Calling | ★★★★☆ | Estado "pioneiro" ativa Chosen One Narrative: "você é especial, o primeiro". |
| CD3 — Empowerment / Creativity | ★★★☆☆ | O produtor expressa a própria realidade (foto do sítio, enxame, peixe). Autoria genuína. |
| CD2 — Development & Accomplishment | ★★★☆☆ | A foto publicada vira artefato real de progresso, não apenas pontos. |

Diagnóstico: mecanismo predominantemente **White Hat** — motivação sustentável, baixo risco de fadiga.

#### Cristais + Loja de Dicas

| Core Drive | Intensidade | Justificativa |
|---|---|---|
| CD4 — Ownership & Possession | ★★★★★ | Saldo crescente transforma o usuário de visitante em proprietário. |
| CD6 — Scarcity & Impatience | ★★★★☆ | Dicas com custo são percebidas como mais valiosas. Paradoxo do preço. |
| CD7 — Unpredictability & Curiosity | ★★★★☆ | "O que está nessa dica?" antes de comprar. Título misterioso ativa CD7. |
| CD3 — Empowerment / Choice | ★★★☆☆ | O usuário escolhe qual dica comprar — agência real. |

**Riscos identificados:**

| Risco | Core Drive afetado | Mitigação |
|---|---|---|
| Conteúdo essencial bloqueado por cristais | CD8 negativo (ansiedade) | Dicas sempre são bonus tracks — nunca pré-requisito |
| Cristais fáceis demais de ganhar | CD6 cai (loja perde tensão) | Calibrar: ~1 dica/semana para usuário ativo |
| Cristais difíceis demais | CD8 negativo (grinding) | Sempre deve haver uma dica "quase alcançável" |
| Público Philanthropist/Explorer | Loja serve Achiever/Player | Dicas precisam ser framed como "sabedoria da comunidade", não como troféu |

#### Loop virtuoso (sistema integrado)

```
Faz tarefa de campo (baú)
        ↓
Publica no feed (consentimento)    ← CD5 Social + CD1 Pioneiro
        ↓
Ganha cristais bônus               ← CD4 Ownership + CD2 Accomplishment
        ↓
Resgata dica especial na loja      ← CD6 Scarcity + CD7 Curiosity
        ↓
Aprende algo que melhora o campo   ← CD1 Epic Meaning (outcome real)
        ↓
Vai melhor na próxima tarefa       → fecha o loop
```

### 14.3 Fontes de cristais

| Ação | Cristais |
|---|---|
| Completar lição (qualquer tipo) | +10 |
| Quiz com nota máxima (≥90%) | +15 |
| Publicar Prova de Campo no feed | +25 |
| Sequência de 3 dias consecutivos | ×1.5 multiplicador do dia |
| Completar módulo inteiro | +50 bônus |

### 14.4 Preço das dicas

| Tier | Preço | Descrição |
|---|---|---|
| Dica Básica | 80 cristais | ~5 dias de uso regular |
| Dica Avançada | 150 cristais | ~10 dias |
| Dica Mestre | 300 cristais | Para usuários dedicados |

Calibração: usuário ativo (faz 1 lição/dia + publica no feed 2×/semana) acumula ~100 cristais/semana → pode resgatar 1 dica básica/semana.

### 14.5 Naming das dicas (ativa CD7)

Títulos devem gerar curiosidade antes de comprar:
- *"Por que minha rainha nunca sai da caixa?"*
- *"O truque dos 3 dias antes da colheita do mel"*
- *"Como um pescador de Bragança dobrou a produção sem gastar mais"*
- *"O erro que 9 em cada 10 apicultores iniciantes cometem"*

### 14.6 Dados — coleção `tip__c`

```json
{
  "_id": "tip_001",
  "title": "O truque dos 3 dias antes da colheita",
  "description": "Apicultor experiente revela o momento exato para colher sem estressar as abelhas.",
  "route": "mel",
  "module": "inicio",
  "price": 80,
  "video_url": "...",
  "thumbnail_url": "...",
  "author_name": "João Ferreira",
  "author_role": "Apicultor há 15 anos",
  "duration_seconds": 75,
  "tags": ["colheita", "bem-estar-animal"],
  "created_at": "...",
  "active": true
}
```

Compras registradas em `tip_purchase__c`:
```json
{
  "player": "player_id",
  "tip": "tip_001",
  "crystals_spent": 80,
  "purchased_at": "..."
}
```

Saldo de cristais: campo `extra.crystals` no player — atualizado via API da Funifier.

### 14.7 Navegação no app

**Princípio:** bottom nav mantido enxuto — sem novo item de loja. O acesso parte do **saldo de cristais visível no dashboard**.

#### Widget de cristais no dashboard

O saldo aparece como badge/widget no topo do dashboard — visível toda vez que o usuário abre o app. Visibilidade frequente é essencial para o CD4 (Ownership) funcionar: o usuário precisa ver o saldo crescer para sentir que possui algo de valor.

Tocar no saldo abre uma **bottom sheet** (painel que sobe de baixo — padrão mobile consolidado, menos intrusivo que modal centralizada):

```
┌─────────────────────────────────────┐
│  🔮 Seus Cristais                   │
│  ─────────────────────────────────  │
│  Saldo atual: 145 cristais          │
│                                     │
│  Como ganhar mais:                  │
│  📚 Completar qualquer lição  +10   │
│  📸 Publicar no campo         +25   │
│  🏆 Quiz com nota máxima      +15   │
│  🔥 Sequência de dias        ×1.5   │
│                                     │
│  [ Ver dicas especiais → ]          │  ← navega para /shop
└─────────────────────────────────────┘
```

**Por que bottom sheet e não modal:** modais comunicam "informação temporária — feche quando terminar". Quando o destino real é uma página de navegação (`/shop`), a modal cria atrito e inconsistência de padrão. A bottom sheet é o padrão correto para painéis de contexto que podem levar a uma ação.

#### Rota `/shop`

```
/shop
  ├── Header: saldo de cristais atual
  ├── Filtro: [Todas] [Mel] [Pesca] + [Módulo]
  ├── Grid de dicas disponíveis
  │     cada card: thumbnail + título + preço
  │               + estado: [Comprar] | [Ver] (já comprada) | [Faltam N cristais]
  └── Bottom sheet de confirmação de compra → player de vídeo inline
```

#### Acesso secundário via perfil

O perfil também exibe o saldo de cristais e um link "Loja de Dicas" como item de menu — para usuários que procuram o recurso por ali.

---

## 15. Sprint 5 — Baú Redesign + Loja de Cristais

### Sprint 5-A — Redesign do fluxo Baú (DIY_PROJECT)

| # | Tarefa | Arquivo | Esforço |
|---|--------|---------|---------|
| B1 | Separar Prova de Campo em tela própria (antes da tarefa) | `quiz.html` / `quiz.js` | Médio |
| B2 | Tela de consentimento de publicação após tarefa | `quiz.html` / `quiz.js` | Médio |
| B3 | Tela de cristais ganhos com animação | `quiz.html` / `quiz.js` / `style.css` | Médio |
| B4 | `ApiService`: `awardCrystals(amount)` — atualiza `extra.crystals` do player | `api.js` | Baixo |
| B5 | `ApiService`: `getCrystalBalance()` — lê saldo atual | `api.js` | Mínimo |
| B6 | Lógica de bônus: +10 por publicar no feed | `quiz.js` | Mínimo |
| B7 | CSS: telas de consentimento + cristais | `style.css` | Médio |

### Sprint 5-B — Loja de Dicas

| # | Tarefa | Arquivo | Esforço |
|---|--------|---------|---------|
| S1 | Rota `/shop` + controller `ShopCtrl` | `app.js` / `pages/shop/shop.js` | Baixo |
| S2 | `ApiService`: `getTips(route, module)` — lista da `tip__c` | `api.js` | Baixo |
| S3 | `ApiService`: `getPurchasedTips()` — lista `tip_purchase__c` do player | `api.js` | Baixo |
| S4 | `ApiService`: `purchaseTip(tipId, price)` — cria `tip_purchase__c` + desconta cristais | `api.js` | Médio |
| S5 | `shop.html`: grid de dicas + filtros + saldo | `pages/shop/shop.html` | Alto |
| S6 | Bottom sheet de confirmação de compra (não modal) | `shop.html` / `shop.js` | Médio |
| S7 | Player de vídeo inline pós-compra | `shop.html` | Médio |
| S8 | Widget de cristais no dashboard — toque abre bottom sheet com explicação + CTA para loja | `dashboard.html` / `dashboard.js` | Médio |
| S9 | Saldo de cristais + link "Loja de Dicas" no perfil (acesso secundário) | `profile.html` | Baixo |
| S10 | CSS: loja completa | `style.css` | Alto |

### Sprint 5-C — Cristais em outras ações (fontes de renda)

| # | Tarefa | Esforço |
|---|--------|---------|
| C1 | Quiz: +15 cristais ao concluir com ≥90% | Baixo |
| C2 | Lição completa (qualquer): +10 cristais | Baixo |
| C3 | Sequência de dias: multiplicador ×1.5 no dia | Médio |
| C4 | Módulo completo: +50 bônus | Baixo |

---

*Documento gerado em sessão de planejamento — 2026-04-08 | Atualizado 2026-04-08*
