# Plano: Diretiva `duo-trail` — Trilha Reutilizável Funifier

**Data:** 2026-04-12  
**Status:** Planejamento concluído — pronto para implementação  
**Apps afetados:** rota-viva, tutor, e futuros apps Funifier

---

## 1. Por que criar esta diretiva

### Problema atual

A trilha estilo Duolingo (S-curve, cartoon checkpoints, chest, sticky module) existe hoje em dois apps:

| App | Arquivo | Linhas de JS | Fonte dos cartoons |
|-----|---------|-------------|-------------------|
| rota-viva | `pages/trail/trail.js` | 451 | Estático — `img/characters/{routeId}/trail/{n}.png` |
| tutor | `pages/trail/trail.js` | 1090 | Dinâmico — `v3/database/profile__c → variations[].url` |

As implementações já divergem. O tutor acumulou 1090 linhas porque misturou lógica de trilha com geração de quiz via IA, captura de evidência e chat. A cada novo app, o risco de divergência aumenta — bugs corrigidos num lugar precisam ser replicados manualmente nos outros (ex: o bug do `position: fixed` sobrescrito por `.app-page > *` que foi corrigido só no tutor na sessão de hoje).

### Por que abstrair agora

Temos **2 implementações reais** com **necessidades distintas**. Isso nos dá o contrato de configuração sem especulação. Uma terceira implementação seria pura divergência, sem ganho.

---

## 2. Decisões de design (fechadas)

| # | Decisão | Escolha | Motivo |
|---|---------|---------|--------|
| 1 | **Fetch de dados** | Host passa `trail-modules[]` pré-carregado | Diretiva sem dependência de API. Cada app tem padrão de fetch diferente (N+1 no rota-viva, endpoint único no tutor). |
| 2 | **Posicionamento do sticky module** | `position: sticky` (padrão rota-viva) | Mais simples. Sem race condition de JS para setar `top`. Funciona naturalmente no document flow. |
| 3 | **Template** | Arquivo separado `duo-trail.html` | Fácil manutenção. Sempre servido via HTTP (Live Server / nginx). |

---

## 3. Contrato de dados — `trail-modules[]`

O host é responsável por fornecer `trail-modules` como um array de módulos **completamente enriquecidos**: cor resolvida, lições com progresso aninhadas, content type e content ID de cada lição já extraídos.

### Estrutura esperada

```js
[
  {
    _id: 'mod-abc',
    title: 'Módulo 1: Introdução',
    color: '#FF9600',       // resolvido pelo host (extra.color || paleta default)
    percent: 75,            // progresso do jogador neste módulo
    position: 0,            // ordem de exibição
    lessons: [
      {
        _id: 'lesson-xyz',
        title: 'O que é mel?',
        contentType: 'video',   // 'video' | 'quiz' | 'reading' | 'cartoon' | 'chest' | ...
        contentId: 'vid-123',   // ID do conteúdo no Funifier
        percent: 100,
        is_unlocked: true,
        position: 0
      },
      {
        _id: 'lesson-ck1',
        title: 'Checkpoint 1',
        contentType: 'cartoon', // ← diretiva detecta e não cria bolinha para este
        contentId: 'quiz-456',
        percent: 0,
        is_unlocked: true,
        position: 1
      }
    ]
  },
  ...
]
```

### Responsabilidade do host para montar esse array

**rota-viva (padrão atual — N+1 calls):**
```js
// 1. Busca módulos do subject com progresso
ApiService.folderProgress(subjectId, playerId).then(function(data) {
    var modules = data.items.filter(i => i.folder !== false);

    // 2. Para cada módulo, busca lições com progresso (paralelo)
    var promises = modules.map(function(mod, idx) {
        var color = (mod.extra && mod.extra.color) || MODULE_COLORS[idx % MODULE_COLORS.length];
        return ApiService.folderProgress(mod._id, playerId).then(function(lessonData) {
            return {
                _id: mod._id,
                title: mod.title,
                color: color,
                percent: mod.percent || 0,
                position: mod.position || idx,
                lessons: lessonData.items.filter(i => i.folder !== false).map(function(l) {
                    var firstContent = (l.items || [])[0] || {};
                    return {
                        _id: l._id,
                        title: l.title,
                        contentType: firstContent.type || '',
                        contentId: firstContent.content || firstContent._id || '',
                        percent: l.percent || 0,
                        is_unlocked: l.is_unlocked !== false,
                        position: l.position || 0
                    };
                })
            };
        });
    });

    $q.all(promises).then(function(enrichedModules) {
        $scope.trailModules = enrichedModules; // passa para a diretiva
    });
});
```

**tutor (padrão atual — endpoint único):**
```js
// 1. Carrega profile__c para imagens dos cartoons E folder para lições — em paralelo
$q.all([
    ApiService.getFolderProgress(folderId, playerId),
    ApiService.dbGet('profile__c', childId)
]).then(function(results) {
    var items = results[0].data.items || [];
    var profileData = results[1].data || {};
    $scope.cartoonImages = (profileData.variations || []).map(v => v.url);

    var modules = items.filter(i => i.folder !== false);
    // ... enrich modules com cores e lições ...
    $scope.trailModules = enrichedModules;
});
```

O ponto chave: o host resolve a race condition dos cartoons antes de passar os dados à diretiva.

---

## 4. Interface da diretiva (API pública)

### Uso no HTML do host

```html
<duo-trail
    trail-modules="trailModules"
    cartoon-images="cartoonImages"
    chest-image="'img/icon/trail/chest.png'"
    score-key="'rv_cartoon_scores'"
    on-lesson-start="handleLessonStart(lesson)">
</duo-trail>
```

### Atributos de entrada

| Atributo | Tipo | Obrigatório | Default | Descrição |
|----------|------|-------------|---------|-----------|
| `trail-modules` | `Object[]` | Sim | — | Array de módulos enriquecidos (ver seção 3) |
| `cartoon-images` | `string[]` | Não | `[]` | URLs de imagens que aparecem como cartoon checkpoints. Cycling — se tiver 3 URLs e 5 cartoons, usa as URLs em loop. |
| `chest-image` | `string` | Não | `'img/icon/trail/chest.png'` | Caminho da imagem do baú |
| `score-key` | `string` | Não | `'duo_cartoon_scores'` | Chave de localStorage para guardar estrelas dos cartoons |
| `on-lesson-start` | `function(lesson)` | Sim | — | Callback quando jogador clica em Começar/Revisar/Desafio |

### O objeto `lesson` recebido no callback

```js
$scope.handleLessonStart = function(lesson) {
    // Propriedades disponíveis:
    // lesson._id          — ID da lição no Funifier
    // lesson.contentType  — 'video' | 'quiz' | 'reading' | 'cartoon' | 'chest'
    // lesson.contentId    — ID do conteúdo referenciado
    // lesson.is_unlocked  — boolean
    // lesson.percent      — 0-100
    // lesson.moduleColor  — cor do módulo pai

    if (!lesson.is_unlocked) return;
    if (lesson.contentType === 'quiz')    $location.path('/quiz/'    + lesson.contentId);
    if (lesson.contentType === 'video')   $location.path('/video/'   + lesson.contentId);
    if (lesson.contentType === 'reading') $location.path('/reading/' + lesson.contentId);
    // cartoon e chest: diretiva chama o callback com o lesson completo — host decide.
};
```

---

## 5. O que a diretiva gerencia internamente

A diretiva tem seu próprio controller isolado (não o controller do host). Ela gerencia:

### 5.1 buildTrail — montar o array `trailItems` (flat)

Recebe `trail-modules[]`, itera:
- Empurra header de módulo com `_type: 'module'`
- Para cada lição:
  - `contentType === 'cartoon'` → não adiciona ao flat, anexa como `._cartoon` na lição anterior. Atribui `_charImg` ciclando por `cartoonImages`.
  - `contentType === 'chest'` → adiciona ao flat, renderiza como baú
  - Outros → adiciona ao flat com `lessonIndex` (contador que ignora cartoons, usado para o S-curve)
- Atribui caracteres decorativos a lições a cada 4 posições (`globalIndex % 4 === 2`), também de `cartoonImages`

### 5.2 S-curve

```js
xOffset = Math.sin(lessonIndex * 0.8) * 70;  // px
```

### 5.3 Stone connectors

`assignStoneConnectors(flat)` — calcula ângulo e comprimento das linhas entre bolhas consecutivas com base nas posições calculadas.

### 5.4 Sticky module box

`setupModuleScrollObserver()`:
- Detecta qual `.duo-module-divider` cruzou o threshold enquanto o usuário scrolla
- Atualiza `activeModule` no scope da diretiva
- `position: sticky; top: headerH` — JS mede o header do host e seta o `top` corretamente

O seletor do header precisa ser configurável pois cada app tem um seletor diferente. Atributo opcional `header-selector` (default: `'.trail-header'` para rota-viva; tutor usaria `'.app-header'`).

**Atributo adicionado ao contrato:**

| `header-selector` | `string` | Não | `'.trail-header'` | Seletor CSS do header fixo do host. Usado para calcular o `top` do sticky module. |

### 5.5 Popup de lição

`selectedLesson` gerenciado internamente. Click fora fecha. Click em Começar invoca `on-lesson-start`.

### 5.6 Cartoon scores

Lidos de `localStorage[score-key]` no buildTrail. **Escritos pelo host** após completion de quiz cartoon — host chama `localStorage.setItem(scoreKey, stars)` e re-passa `trail-modules` atualizado (ou a diretiva expõe um método `refreshScores()` via binding — a definir na implementação).

### 5.7 Auto-scroll

Após buildTrail, scroll automático para a primeira lição disponível (`is_unlocked && percent < 100`).

---

## 6. O que fica no controller do host

| Responsabilidade | rota-viva | tutor |
|-----------------|-----------|-------|
| Fetch de módulos + lições | `ApiService.folderProgress` N+1 | `ApiService.getFolderProgress` único |
| Enriquecer com cores | `extra.color \|\| MODULE_COLORS[i]` | idem |
| Carregar `cartoonImages` | Paths estáticos por routeId | `dbGet('profile__c') → variations` |
| Resolver race condition cartoons | `$q.all([modules, cartoons])` | `$q.all([folderProgress, profile__c])` |
| Stats do jogador (pontos, moedas, streak) | Header próprio | Header próprio |
| Navegar ao iniciar lição | `$location.path('/quiz/' + id)` | Modal ou rota própria |
| Header visual | `.trail-header` com pontos/cristais | `.app-header` escuro |
| Bottom nav | `<bottom-nav>` | Nav global do body |

---

## 7. Estrutura de arquivos

```
app/
  directives/
    duo-trail/
      duo-trail.js    ← definição do módulo 'duoTrail' + diretiva + controller interno
      duo-trail.html  ← template (bubbles, popups, cartoon, chest, sticky module)
      duo-trail.css   ← todos os estilos .duo-* extraídos do style.css do app
```

### `duo-trail.js` — esqueleto

```js
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
        controller: 'DuoTrailCtrl',
        controllerAs: 'trail'
    };
})

.controller('DuoTrailCtrl', function($scope, $timeout) {
    // buildTrail, setupModuleScrollObserver, getBubbleStyle, etc.
    // $scope.trailItems = [];
    // $scope.activeModule = null;
    // $scope.selectedLesson = null;

    $scope.$watch('trailModules', function(modules) {
        if (modules && modules.length > 0) buildTrail(modules);
    });
    // ...
});
```

### No `index.html` do host

```html
<link rel="stylesheet" href="directives/duo-trail/duo-trail.css">
<script src="directives/duo-trail/duo-trail.js"></script>
```

### No módulo Angular do host

```js
angular.module('rotaViva', ['ngRoute', 'ngSanitize', 'duoTrail'])
```

---

## 8. Vantagem do approach de diretiva para o tutor

No tutor, o CSS `.app-page > *` aplica `position: relative; z-index: 1` a todos os filhos diretos de `.app-page`. Isso causava o bug onde `position: fixed` do `.duo-sticky-module` era sobrescrito.

Com a diretiva, o elemento `<duo-trail>` é filho direto de `.app-page`, mas `.duo-sticky-module` fica **dentro do template da diretiva** — é neto, não filho direto. A regra `.app-page > *` **não afeta** elementos dentro do template. O bug desaparece estruturalmente, sem necessidade do override `!important` que foi adicionado como workaround.

---

## 9. Plano de implementação

### Fase 1 — Implementação de referência no rota-viva

1. Criar `app/directives/duo-trail/duo-trail.js` com o módulo `duoTrail` e a diretiva
2. Extrair a lógica de trail do `TrailCtrl` para o `DuoTrailCtrl` interno da diretiva
3. Criar `duo-trail.html` com o template (baseado em `trail.html` atual)
4. Criar `duo-trail.css` extraindo todos os estilos `.duo-*` do `style.css`
5. Simplificar o `TrailCtrl` do rota-viva: passa a montar `trailModules` e implementar `handleLessonStart`
6. Testar — comportamento deve ser idêntico ao atual

### Fase 2 — Migração do tutor

1. Copiar os 3 arquivos da diretiva para `tutor/app/directives/duo-trail/`
2. No `TrailCtrl` do tutor, remover buildTrail, S-curve, scroll observer, stone connectors, popup
3. Usar `$q.all` para resolver `getFolderProgress` + `profile__c` antes de renderizar a diretiva
4. Remover o workaround CSS `!important` do tutor (não mais necessário)
5. Testar

### Fase 3 — Novos apps

Copiar os 3 arquivos. Adicionar `duoTrail` como dependência. Montar `trailModules` no controller. Implementar `handleLessonStart`. Pronto.

---

## 10. O que NÃO entra na diretiva (escopo explicitamente fora)

- Geração de quiz via IA (tutor)
- Captura de evidência (tutor)
- Chat com professor IA (tutor)
- Galeria de posts (rota-viva)
- Onboarding
- Stats do jogador (pontos, moedas, streak) — header é responsabilidade do host
- Sistema de notificações push

---

*Planejamento concluído em 2026-04-12. Decisões abertas: todas fechadas. Próximo passo: implementar Fase 1 no rota-viva.*
