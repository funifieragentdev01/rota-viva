# Rota Viva — Backlog de Implementação
**Criado:** 2026-04-12

Itens pendentes de implementação no app, em ordem de discussão (prioridade a definir).

---

## 1. Termos e Política na Gamificação Central

**O que:** Mover a aceitação de Termos de Uso e Política de Privacidade para dentro da gamificação (ex.: challenge ou ação ao aceitar), em vez de ser apenas um modal isolado na tela de login.

**Por que:** Registrar a aceitação como um evento rastreável na plataforma Funifier, vinculado ao player.

**Referência no roadmap anterior:** item 1.7 do `bmad-review-2026-04-11.md`

---

## 2. Baú (chest) — Visual e Fluxo Completo

**O que:** Implementar o overlay visual completo da lição do tipo `chest` na trilha.

**Fluxo esperado:**
1. Usuário toca na bolinha do baú na trilha
2. Popup padrão abre (título + botão "Desafio")
3. Entra na tela de coleta de evidência (foto / vídeo / localização)
4. Ao enviar: animação de baú abrindo + destaque "+3 coins!"
5. Opção: "Publicar no feed da galeria"
6. Rodapé social: "X produtores já fizeram isso" + 3 posts de outros usuários (CD5 — influência social)
7. Dispara `logAction('complete_lesson', { type: 'chest', score: 1 })`

**Recompensa já configurada no Funifier:** challenge `licao_de_bau` → +10 XP + 3 coins.

**O que falta implementar:**
- Overlay de abertura do baú (animação)
- Toast "+3 coins" em destaque
- Rodapé social com posts de outros usuários
- Trigger do challenge após completar

---

## 3. Topo da Galeria Estilo Stories

**O que:** Carrossel horizontal no topo do feed da galeria, estilo Instagram Stories, mostrando avatares dos produtores/entidades em destaque.

---

### Estrutura das coleções relevantes

**`post__c`**
```json
{
  "_id": "69d65afe28fe032bb2503d9c",
  "player": "69549486168",
  "player_name": "Ricardo Lopes Costa",
  "media_type": "image",
  "media_url": "https://...",
  "description": "...",
  "created": "2026-04-08T13:41:18.338Z"
}
```

**`post_like__c`**
```json
{ "_id": "...", "post": "69d480bc52fe0c34f38dedf6", "player": "69549486168" }
```

**`post_comment__c`**
```json
{
  "_id": "...", "post": "69dd92d79d58a5339b00520f",
  "player": "69549486168", "player_name": "...",
  "text": "...", "created": "2026-04-14T20:16:52.973Z"
}
```

---

### Campos obrigatórios no player

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `extra.weight` | inteiro | Peso do perfil. Default: `1`. Admin ajusta manualmente no Studio. |
| `extra.fixed_slot` | boolean | `true` → aparece sempre no carrossel, independente de posts recentes. Usar para MIDR, FADEX, e outros perfis institucionais fixos. |
| `extra.route` | string | `mel` ou `pesca` — filtra o carrossel por rota do usuário logado. |

**Tabela de referência de pesos:**

| Perfil | `extra.weight` | `extra.fixed_slot` |
|--------|---------------|-------------------|
| MIDR / FADEX | 100 | `true` |
| Cooperativa / Associação | 10 | `false` |
| Produtor ativo | 1–5 (admin ajusta) | `false` |
| Produtor novo (default) | 1 | `false` |

---

### Algoritmo do carrossel de Stories

**Score de ranking por perfil:**
```
score = extra.weight × (posts_últimos_30_dias + 1)
```

**Regras de exibição:**
1. **Slot fixo** (`extra.fixed_slot: true`): sempre aparece no carrossel, mesmo sem posts recentes. Score calculado com multiplicador 10.000 para garantir posição no topo. Ordenados entre si por `extra.weight DESC`.
2. **Slots dinâmicos**: perfis com ao menos 1 post nos últimos 7 dias. Ordenados por score DESC.
3. **Ausentes**: perfis sem posts nos últimos 7 dias E sem `fixed_slot: true` não aparecem no carrossel.
4. **Limite:** máximo 20 perfis exibidos.

**Aggregate MongoDB (Public Endpoint — coleção `player`):**
```json
[
  { "$match": { "extra.route": "{{route}}", "active": true } },
  { "$lookup": {
      "from": "post__c",
      "localField": "_id",
      "foreignField": "player",
      "pipeline": [
        { "$match": {
            "created": { "$gte": { "$dateSubtract": { "startDate": "$$NOW", "unit": "day", "amount": 30 } } }
        }},
        { "$sort": { "created": -1 } },
        { "$limit": 1 },
        { "$project": { "created": 1, "media_url": 1, "_id": 0 } }
      ],
      "as": "last_post"
  }},
  { "$addFields": {
    "last_post_data": { "$arrayElemAt": ["$last_post", 0] },
    "weight": { "$ifNull": ["$extra.weight", 1] },
    "fixed_slot": { "$ifNull": ["$extra.fixed_slot", false] }
  }},
  { "$match": {
    "$or": [
      { "fixed_slot": true },
      { "last_post_data": { "$exists": true } }
    ]
  }},
  { "$addFields": {
    "score": {
      "$cond": [
        "$fixed_slot",
        { "$multiply": ["$weight", 10000] },
        "$weight"
      ]
    }
  }},
  { "$sort": { "score": -1 } },
  { "$limit": 20 },
  { "$project": {
    "_id": 1, "name": 1, "photo": 1,
    "weight": 1, "fixed_slot": 1,
    "last_post_created": "$last_post_data.created",
    "last_post_media": "$last_post_data.media_url",
    "score": 1
  }}
]
```

---

### Indicador visual de "novo" vs "já visto"

- **Borda colorida (gradiente da rota):** perfil tem post mais recente que a última vez que o usuário abriu esse perfil.
- **Borda cinza:** perfil já visto (ou sem post novo).
- **Rastreamento:** `localStorage` no browser. Chave: `rv_stories_seen_{authorPlayerId}`, valor: timestamp da última visualização.
- **Lógica:** ao abrir o Stories de um perfil, salva `Date.now()` na chave. Na renderização do carrossel, compara `last_post_created` (vindo do aggregate) com o `lastSeenAt` do localStorage — se o post é mais recente, borda colorida.
- **MVP:** todos aparecem no carrossel (vistos e não vistos), pois o volume inicial de posts é baixo. Ocultar vistos é V2.

---

### Algoritmo de relevância do feed de posts

**V1 (MVP) — Cronológico reverso:**
- Ordenação simples por `created DESC`, filtrado por rota.
- Sem personalização.

**V2 — Score de relevância por post:**

```
relevance_score = author_weight × (total_likes + 1) × recency_score
```

Onde `recency_score`:
- Post < 24h → `3`
- Post entre 24h e 7 dias → `2`
- Post > 7 dias → `1`

**Aggregate MongoDB para V2 (coleção `post__c`):**
```json
[
  { "$match": { "active": true } },
  { "$lookup": {
      "from": "post_like__c",
      "localField": "_id", "foreignField": "post",
      "as": "likes_data"
  }},
  { "$lookup": {
      "from": "post_comment__c",
      "localField": "_id", "foreignField": "post",
      "as": "comments_data"
  }},
  { "$lookup": {
      "from": "player",
      "localField": "player", "foreignField": "_id",
      "pipeline": [{ "$project": { "weight": { "$ifNull": ["$extra.weight", 1] } } }],
      "as": "author_data"
  }},
  { "$addFields": {
    "total_likes": { "$size": "$likes_data" },
    "total_comments": { "$size": "$comments_data" },
    "author_weight": { "$ifNull": [{ "$arrayElemAt": ["$author_data.weight", 0] }, 1] },
    "hours_since": {
      "$divide": [{ "$subtract": ["$$NOW", "$created"] }, 3600000]
    }
  }},
  { "$addFields": {
    "recency_score": {
      "$cond": [{ "$lte": ["$hours_since", 24] }, 3,
        { "$cond": [{ "$lte": ["$hours_since", 168] }, 2, 1] }]
    }
  }},
  { "$addFields": {
    "relevance_score": {
      "$multiply": ["$author_weight", { "$add": ["$total_likes", 1] }, "$recency_score"]
    }
  }},
  { "$sort": { "relevance_score": -1 } },
  { "$limit": 15 }
]
```

---

### Gamificação do alcance (Yu-kai Chou — CD2 + CD6)

O ranking do carrossel deve ser comunicado ao produtor como progressão visível:

> "Você está entre os produtores em destaque desta semana. Continue publicando para aparecer para mais produtores."

Usar buckets discretos de alcance (comunicados ao usuário):

| Bucket | Critério | Alcance no feed |
|--------|----------|-----------------|
| 🏛️ Autoridade | `extra.fixed_slot: true` | Aparece para todos os usuários da rota |
| 🤝 Destaque | `weight ≥ 5` E ≥ 3 posts/30 dias | Aparece para todos da rota |
| 🌿 Ativo | ≥ 1 post/30 dias | Aparece para usuários do mesmo município |
| 🌱 Novo | sem posts recentes | Apenas seguidores diretos (V2) |

---

### O que implementar

- [ ] Campo `extra.fixed_slot` e `extra.weight` nos players institucionais (Studio)
- [ ] Public Endpoint Funifier com o aggregate de ranking do Stories bar
- [ ] Componente Stories no topo do feed: scroll horizontal, avatares circulares, borda colorida/cinza
- [ ] `localStorage` para rastreamento de "visto" por perfil (`rv_stories_seen_{playerId}`)
- [ ] Feed V1: ordenação cronológica reversa com filtro de rota (já implementado parcialmente)
- [ ] Feed V2: Public Endpoint com aggregate de relevância (backlog)

---

## 4. Alterar Senha (logado)

**O que:** Fluxo simples para o usuário alterar a própria senha dentro do app, já autenticado.

**Onde:** Perfil → Conta → "Alterar senha"

**Fluxo:**
```
Modal: Senha atual + Nova senha + Confirmar nova senha
→ PUT /v3/player/password?player=me&old_password=X&new_password=Y
```

**Endpoint:** já existe no Funifier. Sem dependência de email.

---

## 5. Entrar Sem Senha — OTP via SMS ou WhatsApp

**O que:** Permitir login e recuperação de senha via código OTP enviado por SMS ou WhatsApp, sem depender de email (a maioria dos produtores não tem email cadastrado).

**Fluxo de recuperação de senha (área pública):**
```
Tela 1: Informe seu CPF
  → Verifica se tem email:
    COM email → código enviado por email → campo código + nova senha
    SEM email → OTP por WhatsApp/SMS → campo código + nova senha
```

**Fluxo de login sem senha (futuro):**
```
Tela login → "Entrar com código" → informa CPF/telefone
→ Recebe OTP → digita código → autenticado
```

**Arquitetura planejada (OTP via WhatsApp/n8n):**
1. App → envia `phone` para webhook n8n (via token admin)
2. n8n → gera OTP 6 dígitos, salva em `POST /v3/database/otp_reset__c` com TTL 10 min, envia via WhatsApp API
3. App → usuário insere OTP
4. App → valida via `POST /v3/database/otp_reset__c?q=phone:'X'&code:'Y'` (token admin)
5. Se válido → n8n usa token admin para `PUT /v3/player/password` e invalida OTP

**Dependências:** WhatsApp Business API (ou Twilio) + n8n (já existe no projeto).

**MVP sem OTP (curto prazo):** usuário sem email → botão "Falar com suporte" → WhatsApp do MIDR/FADEX.

---

## 6. Loja de Dicas

**O que:** Produtor gasta coins para comprar dicas de campo fornecidas por outros produtores experientes ou pelo MIDR.

**Fluxo:**
1. Usuário acessa a loja (aba futura ou dentro do perfil)
2. Vê itens disponíveis — cada um mostra custo em coins e preview da dica
3. Clica "Resgatar" → Funifier debita coins e libera conteúdo
4. Conteúdo: vídeo, texto ou link de boas práticas

**API Funifier:**
```
POST /v3/virtualgoods/catalog   → cria catálogo "Loja de Dicas"
POST /v3/virtualgoods/item → cadastra cada dica com custo em coins
POST /v3/virtualgoods/item/{id}/redeem → usuário resgata
```

**Primeira dica a cadastrar:** vídeo `https://www.instagram.com/reels/DWK7V3PkzB3` (custo: 10 coins)

**Depende de:** Fase B completa (baú gerando coins, usuários acumulando saldo).

---

## 7. PWA — Progressive Web App

**O que:** Transformar o app em PWA para que o usuário possa instalar no celular como app nativo, sem precisar da Play Store.

**O que implementar:**
- `manifest.json` com nome, ícones, cores e `display: standalone`
- Service Worker para cache de assets estáticos (HTML, CSS, JS, imagens)
- Prompt de instalação ("Adicionar à tela inicial") no primeiro acesso
- Ícone do app na tela inicial (192x192 e 512x512 — usar logo Rota Viva)


### Status atual vs. necessário (Tec)

| Item | Status | Ação necessária |
|------|--------|----------------|
| `manifest.json` com ícones e metadados | Existe (sw.js referenciado) | Validar com Lighthouse; adicionar `display: standalone`, `theme_color` |
| Service Worker — cache de assets estáticos | Existe (sw.js) | Revisar estratégia: Cache-first para assets, Network-first para API `/v3/` |
| Service Worker — cache de dados da API | Não implementado | Interceptar chamadas `/v3/` e armazenar respostas no cache |
| IndexedDB — fila de sync offline | Não implementado | Armazenar DIY, Essay, Quiz concluídos offline; sync ao reconectar |
| Background Sync API | Não implementado | Disparar sync automaticamente quando conexão retornar |
| Web Push (VAPID) | Não implementado | Configurar VAPID keys no Funifier Studio; service worker recebe push |
| Install prompt (Add to Home Screen) | Não implementado | Custom banner na 2ª-3ª visita |
| Offline indicator | Não implementado | Banner discreto no topo quando offline |

### Web Push — Tipos de Notificação

| Trigger | Mensagem | Horário |
|---------|---------|---------|
| Streak em risco (24h sem atividade) | "Sua sequência está em risco! Abra o app." | 19h |
| Nova lição desbloqueada | "Nova lição disponível: [título]" | Imediato |
| Nova lição Essay | "O Ministério quer ouvir você sobre [tema]" | 10h |
| Top da Galeria semanal | "Você está no top 3 desta semana!" | Segunda 8h |
| Inatividade 7 dias | "[Nome], o apiário / o rio está esperando." | 10h |
| Baú disponível (CD7) | "Tem um baú te esperando na trilha!" | Imediato |

**Máximo:** 1 notificação por dia por usuário. Prioridade: Essay > Streak > Inatividade.
**iOS:** Web Push apenas iOS 16.4+. Comunicar no onboarding.

**Notificações push:**
- Registrar Service Worker com `PushManager`
- Backend de push: Firebase Cloud Messaging (FCM) ou similar
- Casos de uso: "Você tem uma nova lição disponível", "Sua sequência está em risco", "Novo post na galeria"
- Requer opt-in explícito do usuário (permissão de notificação)

### Install Prompt (Add to Home Screen)

```
[Banner discreto — bottom sheet]
┌─────────────────────────────────────────┐
│ [ícone do app]  Rota do Mel   │
│   Funciona sem internet!  │
│  [Adicionar à tela inicial]  [Agora não]│
└─────────────────────────────────────────┘
```

- Aparece na 2ª visita (nunca na 1ª)
- "Funciona sem internet" é o hook certo para o público rural
- Ao fechar "Agora não": nunca mais mostrar automaticamente (salvar flag)

### Offline — Estratégia de Cache

```
Recursos estáticos (JS, CSS, HTML, imagens):  Cache-first
Dados da API (/v3/):   Network-first com fallback para cache
Fila de sync (DIY, Essay, Quiz): IndexedDB local
Reconexão:  Background Sync API → flush da fila
```

**Compatibilidade:** funciona em Android (Chrome). iOS tem suporte parcial (sem push até iOS 16.4+).

---

## 8. Cartão do Produtor

**O que:** Redesenho da tela de perfil com o "Cartão do Produtor" como elemento principal (hero), substituindo o bloco de foto + nome editável no topo.

**Motivação (Octalysis):**
- **CD1 — Epic Meaning:** o cartão é emitido pelo MIDR através do Rota Viva — transforma o app em credencial de governo
- **CD2 + CD4 — Development & Ownership:** completude progressiva + identidade de status real
- **CD5 — Social Influence:** compartilhamento da imagem do cartão via WhatsApp gera loop viral

**Nome por rota:**
- Rota do Mel → **Cartão do Apicultor**
- Rota da Pesca → **Cartão do Pescador**
- Rodapé do cartão: "Emitido pelo MIDR através do programa Rota Viva"

**Frente do cartão:**
- Foto de perfil + nome completo + CPF mascarado
- Número de registro único (campo `ref` do player)
- Logo MIDR + "Rota Viva"

**Verso do cartão (flip):**
- Total de pontos acumulados na trilha
- QR code com `ref` do player (link de convite embutido)
- Botão "Compartilhar" → gera imagem PNG do cartão via Canvas API

**Estados do cartão:**
- **Não emitido:** CTA "Emitar Cartão" + "X produtores já emitiram o Cartão do Apicultor" (social proof)
- **Emitido:** card completo com dados
- **Incompleto:** banner "Cartão requer atualização" com lista de campos pendentes

**Mecanismo de retorno:**
- Quando campos obrigatórios estão incompletos após emissão, exibir banner de "atualização pendente" — igual apps de banco digital
- Campos obrigatórios: municipio, cooperativa, pronaf, + caf (mel) ou rgp (pesca)

**Implementação:**
1. Remover bloco foto + nome editável do topo do `profile.html`
2. Promover card para hero, sempre visível (condição `passaporteEmitido` passa a controlar apenas o estado, não a visibilidade)
3. Renomear label "Passaporte Digital" → "Cartão do Apicultor / Pescador" via `routeId`
4. Adicionar botão de compartilhar com Canvas API → gera PNG do card
5. Adicionar contador de produtores que já emitiram (via `dbQuery('player__c', 'extra.passaporte_emitido_em:{$exists:true}')`)

---

## 9. Cache da Trilha

**O que:** Implementar camada de cache para o carregamento da trilha, evitando N+1 chamadas a `folderProgress` a cada acesso.

**Problema:** a trilha atual faz (número de módulos + 1) chamadas paralelas ao `POST /v3/folder/progress` toda vez que o player acessa a trilha. Para 25.000 usuários ativos, isso gera carga excessiva no servidor.

**MVP — Cache no localStorage (implementar agora):**
- Chave: `rv_trail_cache_{playerId}_{subjectId}`
- Valor: `{ trailModules: [...], cachedAt: timestamp }`
- TTL: 5 minutos
- Ao abrir a trilha: lê cache → renderiza imediatamente → verifica staleness em background
- Invalidação: após `logAction('complete_lesson')`, remove cache + pre-warm assíncrono:

```javascript
// No quiz.js, após completar lição:
localStorage.removeItem('rv_trail_cache_' + playerId + '_' + subjectId);
// Pre-warm em background (não bloqueia navegação)
ApiService.folderProgress(subjectId, playerId).then(function(data) {
    localStorage.setItem('rv_trail_cache_' + playerId + '_' + subjectId,
   JSON.stringify({ trailModules: data, cachedAt: Date.now() }));
});
```

**V2 — Cache server-side (backlog futuro):**
- Collection `trail_cache__c` no Funifier: `{ player, subject, data, updated_at }`
- Trigger Funifier em `folder_log` → webhook n8n → recalcula `folderProgress` → salva em `trail_cache__c`
- App lê `trail_cache__c` antes de chamar `folderProgress` diretamente
- Padrão Stale-While-Revalidate: renderiza versão antiga enquanto atualiza em background
- **Vantagem V2:** funciona entre dispositivos, pode ser pré-aquecido para todos os players

**Dependência:** para MVP, nenhuma. Para V2, requer Trigger Funifier + n8n configurado.

---

## 10. Scroll Infinito do Feed (Galeria)

**O que:** Implementar paginação no feed da galeria para suportar 25.000 usuários sem travar, com experiência de scroll contínuo tipo Instagram.

**Backend:** o Funifier já suporta paginação via `Range` header:
```
GET /v3/database/post__c?q=active:true
Range: items=0-14   → retorna posts 0–14
Range: items=15-29  → retorna posts 15–29
```
O header `Content-Range` na resposta indica o total disponível. **Nenhuma mudança no backend é necessária para MVP.**

**Padrão cursor-based (evita duplicatas):**
```javascript
// Guarda _id do último post como cursor
// Próxima página: q=active:true,_id:{$lt:"ultimo_id"}
// Mais estável que offset quando novos posts entram
```

**Implementação no app:**
1. Carregar 15 posts na carga inicial
2. IntersectionObserver no penúltimo item → dispara carga da próxima página
3. Append dos novos posts na lista (não substituir)
4. Spinner de carregamento no rodapé enquanto busca
5. Parar quando `Content-Range` indicar que não há mais itens

**Índice MongoDB (configurar no servidor):**
- `{ active: 1, created: -1 }` — feed cronológico reverso
- `{ route: 1, active: 1, created: -1 }` — feed filtrado por rota

**Score de relevância:**
- **V1 (frontend):** calcular score no app com dados existentes: tipo de conta (ministério > cooperativa > produtor ativo > produtor novo), likes, followers
- **V2 (server-side):** Public Endpoint Funifier customizado + Scheduler recalculando score a cada hora, retornando posts já ordenados por relevância

**Prioridade de implementação:**
1. Paginação com `Range` header (1–2 dias)
2. Índice MongoDB (1 hora de configuração)
3. Cursor-based pagination (substitui Range no V2)
4. Score pré-computado (após ter volume real de dados)

---

## 11. "Programas para você" — Roteador de Políticas Públicas

**Status: Implementado (2026-04-13)**

### Contexto e decisão estratégica

O app é o único ponto de contato digital de muitos produtores rurais com o ecossistema de políticas públicas. Em vez de apenas listar links para sites do governo (que são complexos e frequentemente inacessíveis para o público-alvo), o app atua como **roteador de informação + ponte para um agente humano** que facilita o acesso ao programa.

A decisão de implementar um CTA de "Falar com agente" em vez de um link externo foi tomada por:
1. Sites do governo têm UX ruim para o público rural
2. O produtor já confia no app — o contato humano fecha o ciclo
3. O agente pode qualificar e direcionar com mais eficiência que um link solto
4. Gera dados acionáveis (quantos produtores querem cada programa)

### Framing na UI

Seção chamada **"Programas para você"** na página `/profile`, filtrada por rota (`mel` / `pesca`). Cada card mostra:
- Ícone + título do programa
- Descrição curta (elegibilidade e benefício)
- Botão **"Falar com agente"** (CTA primário)

### Coleção `programa__c`

Campos:
- `_id` — slug único (ex: `pronaf`, `caf`, `rgp`)
- `title` — nome exibido
- `description` — texto curto de elegibilidade/benefício
- `icon` — emoji ou URL
- `link` — URL oficial (exibida como link secundário no card)
- `whatsapp` — número do agente responsável por este programa
- `eligibility` — texto livre (informativo, sem filtro automático no MVP)
- `route` — `mel` | `pesca` | `ambos`
- `order` — ordenação
- `active` — boolean

**Programas semeados (Rota do Mel):** CAF, PRONAF, PAA, PNAE, Seguro Safra, ATER

**Programas semeados (Rota da Pesca):** RGP, Seguro Defeso, PRONAF Pesca, PAA Pesca, ATER Pesca

### Coleção `contato_agente__c`

Criada quando o produtor toca em "Falar com agente":

```json
{
  "player":    "cpf_do_produtor",
  "player_name":    "Nome do Produtor",
  "phone": "11999999999",
  "municipio": "Nome do município",
  "route": "mel",
  "programa_id":    "pronaf",
  "programa_title": "PRONAF — Crédito Rural",
  "status":    "pendente",
  "created":   "2026-04-13T..."
}
```

Status flow: `pendente` → `em_atendimento` → `atendido`

Regra anti-spam: se já existe um contato com status `pendente` ou `em_atendimento` para o mesmo player+programa, o botão aparece como "Solicitado" e não cria duplicata.

### Studio — Página de administração de programas

Duas instâncias criadas (uma por rota):
- Slug: `rota-viva-programas`
- CRUD completo: listar, criar, editar e ativar/desativar programas da coleção `programa__c`
- Interface Bootstrap com tabela e modal de formulário
- Disponível no menu do Funifier Studio para cada rota

### Studio — Dashboard do agente

Duas instâncias criadas (uma por rota):
- Slug: `rota-viva-contatos`
- Lista de contatos pendentes com badge de contagem
- Filtro por status (pendente / em_atendimento / atendido)
- Botão "Iniciar atendimento" → muda status para `em_atendimento`
- Link direto para WhatsApp do produtor
- Modal de conclusão com campo de anotações → marca como `atendido`
- Disponível no menu do Funifier Studio para cada rota

### Implementação no app

- `api.js`: `ApiService.solicitarContato(payload)` e `ApiService.getContatoPendente(playerId, programaId)`
- `profile.js`: `$scope.solicitarContato(prog)` com estado `contatoEnviado`, `contatoSolicitando`; pre-check no carregamento para programas já solicitados; toast de confirmação (5s)
- `profile.html`: cards `.programa-card` com `.programa-card-main` (link externo) + `.programa-contato-btn` (CTA) + toast global
- `style.css`: layout flex-column do card, botão de contato full-width, animação fadeInUp do toast

### V2 (não implementado)

- Filtro automático por elegibilidade (ex: ocultar CAF se `tem_caf = true` no perfil)
- Verificação de CAF via API MAPA
- Notificação push quando o agente atualiza o status do contato


---

# BUG

## Profile Photo Zoom
- Na pagina /profile, quando eu vou editar a foto de perfil, se eu uso a opccao de tirar foto com a camera, a foto fica com zoom. Veja na imagem "/jarvis/rota-viva/doc/assets/issue/bug-photo-zoom.jpeg", precisa ajustar isso para pegar a foto normal. Talvez seja por que a resolucao do meu celular seja grande. Sera que da para pegar a foto como aparece na camera em uma resolucao menor? Na hora de salvar coloca ela com a resolucao menor.

## GERAL
Otimo, agora que ja planejamos de forma completa como sera feito essa parte da galeria dos saberes, pode implementar os 5 items abaixo: 

- Na hora de cadastrar uma publicação no feed da galeria dos saberes, você está cadastrando o campo created no JSON da seguinte forma: "created": "2026-04-08T13:41:18.338Z", porém como estamos usando o MongoDB você precisa cadastrar este campo de data no formato BSON da seguinte forma: "created": {“$date”: "2026-04-08T13:41:18.338Z"}. Ajuste isso por favor tanto em “/jarvis/rota-viva/app/pages/gallery” no cadastro da publicação, quanto na questão do tipo “diy” que também faz o cadastro na galeria, acho que através da diretiva de question “/jarvis/rota-viva/app/directives/question”. Ajuste isso, por favor, pois precisamos do campo de data correto para fazer a ordenação dos registros a serem apresentados para o usuário usando um campo de data de criação válido. Faz este mesmo ajuste nas colecoes "post_comment__c" e "post_like__c".

- Pode implementar o item “3. Topo da Galeria Estilo Stories” conforme voces planejaram no documento “/jarvis/rota-viva/doc/bmad-review-2026-04-12.md”. 

- Na trilha do projeto “rota-viva” em “/jarvis/rota-viva/app/pages/trail”, temos a lição do tipo escuta ativa, quando está bloqueada mostra um ícone de fone de ouvido “fa-headphones”, quando completa a lição está mostrando um ícone diferente de balão “.fa-comment” Eu quero que mantenha o ícone do fone de ouvido “fa-headphones”. 

- Na trilha quando eu clico em uma bolinha de uma lição, e ele abre o pop up para entrar, o pop up está ficando embaixo de algumas imagens de Cartoon, isso está atrapalhando o usuário a clicar no pop up. Eu acho que precisa ajustar o z-index apenas do pop up ativo, pra ele sempre ficar acima de qualquer outro elemento na diretiva “/jarvis/rota-viva/app/directives/duo-trail”. Assim o usuário vai conseguir clicar no pop up. Veja na imagem “/jarvis/rota-viva/doc/assets/issue/bug-trail-popup.png” que o popup está aparecendo embaixo da imagem do cartoon. 

- Na página “/profile” mostrar os programas bloqueados se o usuário não tiver feito o “cartão do produtor”. Para o usuário ficar com vontade de fazer o cartão. Mostrar na seção de “Programas para você” alguma informação falando que está bloqueado, e só desbloqueia para quem tem o cartão. Quando o usuário cadastrar o cartao a seção de programas para você desbloqueia e mostra a lista de programas. 


## TUTOR
Otimo, agora que voce terminou os ajustes no projeto "rota-viva" preciso que voce apliqu os 4 ajustes abaixo no projeto "tutor":

- No projeto “tutor” aplique na diretiva de “duo-trail” que está em “/jarvis/tutor/app/directives/duo-trail”, esses ajustes do popup ativo ficar sobre o cartoon que você fez no projeto “rota-viva” na diretiva de “duo-trail” que está em “/jarvis/rota-viva/app/directives/duo-trail”. 

- No projeto “tutor” eu quero que você implemente o feed de projetos feitos pela criança, igual o feed do projeto “rota-viva”, que estamos chamando de galeria dos saberes. Incluindo a funcionalidade onde dentro das questões do tipo “diy”, a criança pode falar se quer publicar o trabalho feito, na galeria, para outras crianças verem. 

- No projeto “tutor” tem algo estranho na navegação na trilha na rota da criança. Quando eu acesso a trilha “/child/folder/:id” a partir da home “/child” eu vejo a diretiva duo-trail corretamente, igual na imagem “/jarvis/tutor/doc/issue/trail-from-home.png”, mas quando eu estou fazendo uma lição e clico em voltar na página “/quiz/:id” então eu vejo outra coisa na página “/child/folder/:id”, vejo a seguinte imagem “/jarvis/tutor/doc/issue/trail-from-back.png”. Precisa ajustar isso para ele sempre mostrar a diretiva duo-trail. Pois neste app ele sempre deverá acessar esta página a partir de um folder raiz sem parent.  

- No projeto “tutor” temos a funcionalidade de criar a versão cartoon da criança, e as variações para usar na trilha. Eu quero usar uma referência de imagem do duolingo para gerar a versão cartoon da criança, esta e' a imagem que deve ser usada como referencia para criar a versao cartoon vista de frente "/jarvis/tutor/app/img/ref/front.png", e para gerar as variações do cartoon vista do alto para ser usada na trilha eu quero usar duas referências de imagem, a imagem da versão cartoon da criança (gerada no primeiro passo) + outra referência de imagem de personagem do duolingo com vista aérea, que e' esta imagem aqui "/jarvis/tutor/app/img/ref/trail.png".

---

Marcione, autoridade em espiritualidade