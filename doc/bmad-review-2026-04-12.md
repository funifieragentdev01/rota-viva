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

**Algoritmo de destaque (a definir pesos exatos):**
- **Ministério (MIDR/FADEX):** sempre aparece primeiro, peso máximo
- **Cooperativas e associações:** peso alto — aparecem logo após o ministério
- **Produtores ativos com muitos seguidores/likes/comentários:** peso médio
- **Produtores novos ou sem engajamento:** peso baixo ou ausentes do carrossel

**Alcance de uma postagem:**
- O algoritmo de peso define para quantas pessoas o post é exibido no feed
- Entidade com peso alto → post aparece para todos os usuários
- Produtor novo → post aparece apenas para seguidores diretos ou região

**O que implementar:**
- Componente Stories no topo do feed (scroll horizontal, avatares circulares)
- API de ranking de usuários baseada nos pesos acima
- Lógica de filtragem de feed por relevância (não apenas cronológica)

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
│       Funciona sem internet!  │
│  [Adicionar à tela inicial]  [Agora não]│
└─────────────────────────────────────────┘
```

- Aparece na 2ª visita (nunca na 1ª)
- "Funciona sem internet" é o hook certo para o público rural
- Ao fechar "Agora não": nunca mais mostrar automaticamente (salvar flag)

### Offline — Estratégia de Cache

```
Recursos estáticos (JS, CSS, HTML, imagens):  Cache-first
Dados da API (/v3/):       Network-first com fallback para cache
Fila de sync (DIY, Essay, Quiz):     IndexedDB local
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
  "phone":     "11999999999",
  "municipio": "Nome do município",
  "route":     "mel",
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

## Geral
- Inclua na pagina /profile na sessao de Conta, apos a politica de privacidade, um item Versao, para mostrar a versao atual do app, ex: "Versao 1.4.8". 

## Question (MULTIPLE_CHOICE)
- Acabei de perceber que a estrutura do JSON das perguntas do tipo "multiple_choice" nao esta correta. O campo "label" deve ser o texto da opcao, e nao o valor, o valor deve ser o "answer". Aqui esta a estrutura errada como esta no banco:

```json
{
    "_id": "69d7a4cc28fe032bb252428f",
    "quiz": "69d7a4cc28fe032bb252428e",
    "type": "MULTIPLE_CHOICE",
    "title": "Qual é o papel principal das abelhas na natureza além de produzir mel?",
    "question": "Qual é o papel principal das abelhas na natureza além de produzir mel?",
    "grade": 1,
    "choices": [
 {
   "answer": "Decompor matéria orgânica",
   "label": "A",
   "grade": 0,
   "extra": {}
 },
 {
   "answer": "Polinizar plantas e culturas agrícolas",
   "label": "B",
   "grade": 1,
   "extra": {}
 },
 {
   "answer": "Controlar pragas de insetos",
   "label": "C",
   "grade": 0,
   "extra": {}
 },
 {
   "answer": "Produzir cera para a indústria",
   "label": "D",
   "grade": 0,
   "extra": {}
 }
    ],
    "i18n": {},
    "techniques": [
 "GT05"
    ],
    "select": "one_answer",
    "shuffle": false,
    "feedbacks": [],
    "gradingMode": "ai",
    "extra": {},
    "requires": []
}
```

E aqui esta a estrutura correta:

```json
{
    "_id": "69d7a4cc28fe032bb252428f",
    "quiz": "69d7a4cc28fe032bb252428e",
    "type": "MULTIPLE_CHOICE",
    "title": "Qual é o papel principal das abelhas na natureza além de produzir mel?",
    "question": "Qual é o papel principal das abelhas na natureza além de produzir mel?",
    "grade": 1,
    "choices": [
 {
   "answer": "A",
   "label": "Decompor matéria orgânica",
   "grade": 0,
   "extra": {}
 },
 {
   "answer": "B",
   "label": "Polinizar plantas e culturas agrícolas",
   "grade": 1,
   "extra": {}
 },
 {
   "answer": "C",
   "label": "Controlar pragas de insetos",
   "grade": 0,
   "extra": {}
 },
 {
   "answer": "D",
   "label": "Produzir cera para a indústria",
   "grade": 0,
   "extra": {}
 }
    ],
    "i18n": {},
    "techniques": [
 "GT05"
    ],
    "select": "one_answer",
    "answerNumbering": "uppercase_letters",
    "shuffle": false,
    "feedbacks": [],
    "model": {},
    "gradingMode": "ai",
    "extra": {},
    "requires": []
}
```

Entao eu preciso da sua ajuda para fazer duas coisas:

1. Montar um comando aggregate que troque o campo "label" pelo campo "answer", e campo "answer" pelo campo "label", em questions do tipo "MULTIPLE_CHOICE". O comando aggregate precisa ser no formato JSON. Aqui esta o exemplo de como deve ser a estrutura do comando aggregate:

```json
{
  "pipeline": [
    {"$match": { "type": "MULTIPLE_CHOICE"}},
    {"$addFields": { 
 "choices.$.label": "$choices.$.answer", 
 "choices.$.answer": "$choices.$.label" }}
  ]
}
```

Eu vou usar o resultado desse comando aggregate para atualizar os questions no banco de dados manualmente.

2. Criar uma diretiva "question" no app em "/jarvis/rota-viva/app/directives" que funcione como a diretiva question do funifier studio que esta funcionando "/funifier/funifier-studio/app/scripts/directives/question.js" e usa da forma correta as estruturas JSON, e aplique na pagina de "/jarvis/rota-viva/app/pages/quiz".


---

Acabei de identificar o mesmo erro do campo "choices.answer" e "choices.label" estarem trocados nas questions do tipo "LISTEN" que tambem esta com a estrutura de JSON errada. Este e' o JSON errado:

```json
{
    "_id": "69d7a4ce28fe032bb2524296",
    "quiz": "69d7a4cc28fe032bb252428e",
    "type": "LISTEN",
    "title": "O que a apicultura no Piauí combina, segundo o texto?",
    "question": "O que a apicultura no Piauí combina, segundo o texto?",
    "grade": 1,
    "choices": [
      {
        "answer": "Produção industrial e exportação",
        "label": "A",
        "grade": 0,
        "extra": {}
      },
      {
        "answer": "Geração de renda e preservação ambiental",
        "label": "B",
        "grade": 1,
        "extra": {}
      },
      {
        "answer": "Turismo rural e agricultura familiar",
        "label": "C",
        "grade": 0,
        "extra": {}
      },
      {
        "answer": "Mel orgânico e cosméticos naturais",
        "label": "D",
        "grade": 0,
        "extra": {}
      }
    ],
    "i18n": {},
    "techniques": [
      "GT05"
    ],
    "shuffle": false,
    "feedbacks": [],
    "speechText": "A apicultura no Piauí combina geração de renda com preservação ambiental, pois as abelhas polinizam a vegetação nativa do cerrado e da caatinga.",
    "gradingMode": "ai",
    "extra": {
      "speechText": "A apicultura no Piauí combina geração de renda com preservação ambiental, pois as abelhas polinizam a vegetação nativa do cerrado e da caatinga.",
      "ttsLang": "pt-BR"
    },
    "requires": []
}
```

E este e' o JSON correto:
```json
{
    "_id": "69d7a4ce28fe032bb2524296",
    "quiz": "69d7a4cc28fe032bb252428e",
    "type": "LISTEN",
    "title": "O que a apicultura no Piauí combina, segundo o texto?",
    "question": "O que a apicultura no Piauí combina, segundo o texto?",
    "grade": 1,
    "choices": [
      {
        "answer": "A",
        "label": "Produção industrial e exportação",
        "grade": 0,
        "extra": {}
      },
      {
        "answer": "B",
        "label": "Geração de renda e preservação ambiental",
        "grade": 1,
        "extra": {}
      },
      {
        "answer": "C",
        "label": "Turismo rural e agricultura familiar",
        "grade": 0,
        "extra": {}
      },
      {
        "answer": "D",
        "label": "Mel orgânico e cosméticos naturais",
        "grade": 0,
        "extra": {}
      }
    ],
    "i18n": {},
    "techniques": [
      "GT05"
    ],
    "answerNumbering": "uppercase_letters",
    "shuffle": false,
    "feedbacks": [],
    "model": {},
    "speechText": "A apicultura no Piauí combina geração de renda com preservação ambiental, pois as abelhas polinizam a vegetação nativa do cerrado e da caatinga.",
    "gradingMode": "ai",
    "extra": {
      "speechText": "A apicultura no Piauí combina geração de renda com preservação ambiental, pois as abelhas polinizam a vegetação nativa do cerrado e da caatinga.",
      "ttsLang": "pt-BR"
    },
    "updated": 1776116896347,
    "requires": []
}
```

Eu ja corrigi o JSON do banco de dados, preciso apenas que voce confira se esta tudo certo no app para este tipo de question, e caso nao esteja corrija por favor. 

--- 

Acabei de ver mais um erro. As questoes podem ter uma imagem para ilustrar a pergunta, e esta imagem nao esta sendo apresentada na questao dentro do app. A diretiva question nao esta considerando a imagem. Mas a diretiva do studio que e' nossa fonte da verdade mostra a imagem. Por favor, corrija isso.

Aqui esta um exemplo do JSON com a imagem:
```json
{
    "_id": "69d7a4cc28fe032bb252428f",
    "quiz": "69d7a4cc28fe032bb252428e",
    "type": "MULTIPLE_CHOICE",
    "title": "Qual é o papel principal das abelhas na natureza além de produzir mel?",
    "question": "Qual é o papel principal das abelhas na natureza além de produzir mel?",
    "grade": 1,
    "choices": [
      {
        "answer": "A",
        "label": "Decompor matéria orgânica",
        "grade": 0,
        "extra": {}
      },
      {
        "answer": "B",
        "label": "Polinizar plantas e culturas agrícolas",
        "grade": 1,
        "extra": {}
      },
      {
        "answer": "C",
        "label": "Controlar pragas de insetos",
        "grade": 0,
        "extra": {}
      },
      {
        "answer": "D",
        "label": "Produzir cera para a indústria",
        "grade": 0,
        "extra": {}
      }
    ],
    "i18n": {},
    "techniques": [
      "GT05"
    ],
    "select": "one_answer",
    "answerNumbering": "uppercase_letters",
    "shuffle": false,
    "feedbacks": [],
    "model": {},
    "gradingMode": "ai",
    "imageUrl": "https://rotaviva.app/img/characters/mel/trail/11.png",
    "extra": {},
    "updated": 1776117834596,
    "requires": []
}
```