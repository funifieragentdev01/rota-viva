# Review de Produto — Rota Viva
## Sessão BMAD Party Mode — 2026-04-06

**Participantes:** Ricardo Lopes Costa (CTO/Founder), John (PM), Sally (UX), Tec (Funifier), Yu-kai Chou (Gamification), Winston (Architect), Amelia (Dev)

---

## Contexto

Revisão de UX e estrutura de navegação do PWA Rota Viva (`v0.4.0`), com foco em simplificação para o público-alvo: produtores rurais com literacia digital baixa a média (apicultores no Piauí e pescadores no Amapá).

**Premissa central:** o app precisa ser tão intuitivo quanto Duolingo e Instagram — aplicativos que o público-alvo já usa.

---

## Decisões Tomadas

### 1. Simplificação do Menu Principal

**De:** 5 itens (Início, Trilha, Diário, Ranking, Perfil)
**Para:** 4 itens (Início, Trilha, Galeria, Perfil)

**Racional:**
- As duas funcionalidades principais do app são a trilha de aprendizado (estilo Duolingo) e a galeria de conteúdo comunitário (estilo Instagram)
- Diário e Escuta Ativa entram como tipos de lição dentro da própria trilha (DIY e Essay), eliminando a necessidade de tabs separadas
- Ranking é substituído pela lista de usuários mais reconhecidos no topo do feed da Galeria (comportamento de Stories do Instagram)
- Resultado: menos cognitive load, menos letramento digital exigido

> **Yu-kai Chou:** "A redução preserva CD3 (Galeria) e CD2 (Trilha) como protagonistas. O top users horizontal é uma reinterpretação de CD5 (Influência Social) sem o efeito negativo de leaderboard punitivo."

---

### 2. Navegação Direta na Trilha

**Mudança:** ao tocar em "Trilha" no menu, o usuário entra diretamente na trilha raiz de sua rota — sem tela de lista de trilhas.

**Implementação:**
- Nenhuma configuração manual de ID necessária. Quando o usuário toca em "Trilha", o `TrailCtrl` consulta a API Funifier e encontra automaticamente o primeiro folder com `parent: null` e `type: 'subject'` — esse é o folder raiz da rota.
- `TrailCtrl` redireciona imediatamente para `/trail/:id` com o ID descoberto.
- Toda a estrutura de aprendizado fica dentro de uma única trilha com múltiplos módulos.

**Estrutura da trilha (tipos de lição):**

| Tipo | Ícone | O que é | Substitui |
|------|-------|---------|-----------|
| `video` | `fa-play` | Vídeo de conteúdo | — |
| `quiz` | `fa-star` | Questões (true/false, múltipla escolha, ouvir e ordenar) | — |
| `diy` | `fa-camera` | Foto + texto do ambiente do produtor | Diário do Produtor |
| `essay` | `fa-comment` | Resposta aberta a perguntas do Ministério | Escuta Ativa |

> **Tec:** "`DIY_PROJECT` e `ESSAY` já são tipos nativos no Funifier. O roteamento já existe no `QuizCtrl`. Precisamos apenas adicionar as rotas de view dedicadas ou estender o controlador para tratar esses tipos adequadamente."

> **Tec:** "Sem necessidade de configuração manual de ID. A API Funifier já permite filtrar folders por `parent: null` e `type: subject`. O controller infere o folder raiz automaticamente em runtime — funciona para qualquer rota sem nenhuma config adicional."

---

### 3. Galeria de Saberes — Estilo Instagram

**Modelo:** feed vertical contínuo estilo Instagram.

**Funcionalidades:**
- Posts com foto, vídeo curto, texto e hashtags
- Curtir, comentar e compartilhar
- **Top da comunidade (substitui Ranking):** lista horizontal no topo do feed, estilo Stories, com os usuários mais reconhecidos da semana — sem exposição de números de pontos
- **Perfil oficial do Ministério:** o MIDR/FADEX pode ter um perfil verificado que publica posts destacados no feed, substituindo a necessidade de tela de notificações institucionais

> **Sally:** "O perfil do Ministério como conta verificada com destaque no feed é elegante — o produtor consome a informação no mesmo lugar onde vê o conteúdo da comunidade, sem precisar entender o que é uma 'notificação do governo'."

---

### 4. Bug Fix — Personagem Sobreposto ao Header do Módulo

**Problema identificado** (ver `assets/issue/bug-trilha.png`): o terceiro personagem (de cima para baixo) sobrepõe o box do título do módulo seguinte ("Criando um Apiário").

**Causa:** a lógica atual insere personagem quando `(idx - 2) % 4 === 0` dentro de cada módulo, sem verificar se o próximo item no flat array é um module header.

**Solução:**
- Mudar para contagem global: inserir personagem quando `globalLessonIdx % 5 === 2` (a cada 5 lições globais, a partir da terceira)
- Nunca inserir personagem em uma lição se o item imediatamente anterior no flat array for um module header

---

### 5. Bug Fix — Sticky Module Header (comportamento Duolingo)

**Referência:** `assets/issue/duolingo-module-transition.png`

**Comportamento Duolingo a replicar:**
- O box do módulo corrente fica **preso (sticky)** no topo da tela, logo abaixo do header, enquanto as bolinhas daquele módulo desfilam por baixo
- Os módulos futuros são exibidos apenas como **texto separador simples** (ex: `— Criando um Apiário —`)
- Conforme o usuário faz scroll para baixo, quando o separador do próximo módulo chega à zona sticky, o box atualiza para o título daquele módulo — o próximo vira o corrente
- Conforme o usuário faz scroll para cima, o módulo anterior volta a ser o corrente
- **O módulo ativo é determinado exclusivamente pelo scroll**, independentemente do progresso do usuário

**Implementação:**
- Cada módulo renderiza **duas coisas** no HTML:
  1. Um `<div class="duo-module-divider" data-module-id="...">— Título —</div>` na posição do módulo no flow (texto simples, serve como âncora de scroll)
  2. Um `<div class="duo-module-sticky-box">` único e fixo, fora do flow da trilha, que fica sempre colado abaixo do header
- Um `IntersectionObserver` (ou scroll listener) monitora quais `.duo-module-divider` estão na viewport
- Quando um divider entra na zona superior da viewport, o sticky box atualiza seu título e cor para o daquele módulo
- CSS: `.duo-module-sticky-box { position: sticky; top: [altura do trail-header]; z-index: 10; }` dentro do container scrollável da trilha

---

### 6. Campo de Telefone Obrigatório no Cadastro

**Mudança:** o campo "Telefone/WhatsApp" passa de opcional para obrigatório.

**Racional:** para o público-alvo, o WhatsApp é o principal canal de comunicação. O telefone é a única forma confiável de reengajamento e recuperação de conta. O e-mail é opcional e raramente verificado.

**Impacto no código:**
- `views/signup.html`: remover label "opcional", adicionar asterisco `*`
- `js/controllers.js` SignupCtrl: adicionar `phone` na validação obrigatória (linha 298)

> **John:** "Não é só UX — é a única forma de reengajamento real para esse público. Tem que estar na validação do SignupCtrl, não só no HTML."

---

## Plano de Implementação

### Agrupamento de tarefas por área

#### A — Configuração e Rotas
| # | Tarefa | Arquivo | Descrição |
|---|--------|---------|-----------|
| A1 | Rota `/gallery` | `js/app.js` | Adicionar `.when('/gallery', { templateUrl: 'views/gallery.html', controller: 'GalleryCtrl' })` |
| A2 | TrailCtrl — navegação direta | `js/controllers.js` | Quando `folderId` for null, buscar via API o primeiro folder com `parent: null` e `type: 'subject'` e redirecionar para `/trail/:id`. Sem configuração manual — inferido da API. |

#### B — Trilha
| # | Tarefa | Arquivo | Descrição |
|---|--------|---------|-----------|
| B1 | Ícones DIY e Essay | `js/controllers.js` | Adicionar `'diy': 'fa-camera'` e `'essay': 'fa-comment'` no mapa `CONTENT_ICONS` |
| B2 | Fix personagem — contagem global | `js/controllers.js` | Mudar lógica de `(idx - 2) % 4 === 0` para `globalLessonIdx % 5 === 2`, com guard para não inserir quando o item anterior no flat array for um module header |
| B3 | Sticky module header + transição por scroll | `views/trail.html` + `css/style.css` + `js/controllers.js` | Ver detalhamento abaixo |

#### C — Galeria
| # | Tarefa | Arquivo | Descrição |
|---|--------|---------|-----------|
| C1 | View da Galeria | `views/gallery.html` | Feed vertical estilo Instagram + barra horizontal de top users no topo |
| C2 | GalleryCtrl | `js/controllers.js` | Carrega posts, curtidas, top users da semana; paginação infinite scroll |
| C3 | Perfil oficial | Funifier Studio + `js/controllers.js` | Flag `extra.is_official = true` no player do Ministério; posts oficiais recebem badge e prioridade no feed |

#### D — Signup
| # | Tarefa | Arquivo | Descrição |
|---|--------|---------|-----------|
| D1 | Telefone obrigatório — HTML | `views/signup.html` | Mover campo para seção obrigatória, remover label "opcional", adicionar `*` |
| D2 | Telefone obrigatório — validação | `js/controllers.js` SignupCtrl | Adicionar `|| !$scope.form.phone` na validação da linha 298 |

#### E — Menu (bottom-nav)
| # | Tarefa | Arquivo | Descrição |
|---|--------|---------|-----------|
| E1 | Atualizar bottom-nav | `views/trail.html` | 5 → 4 itens: Início, Trilha, Galeria, Perfil |
| E2 | Atualizar bottom-nav | `views/dashboard.html` | Idem |
| E3 | Atualizar bottom-nav | `views/gallery.html` | Novo view já com 4 itens |

---

## Questões em Aberto

| # | Questão | Responsável |
|---|---------|------------|
| Q1 | Os tipos `diy` e `essay` já estão configurados como `folder_content_type` nas lições da trilha no Studio? | Tec verificar |
| Q2 | A tela "Início" é mantida ou eliminada? Consenso do time: manter como painel de estado do dia (XP, streak, card "continue") | Ricardo decidir |
| Q3 | API de posts da Galeria: usar endpoint nativo do Funifier ou endpoint customizado? | Tec avaliar endpoints disponíveis |
| Q4 | Quem publica os posts do perfil oficial do Ministério no feed? Equipe FADEX via Studio? | Ricardo confirmar com FADEX |

---

## Referências

- Imagem bug personagem: `doc/assets/issue/bug-trilha.png`
- Imagem referência Duolingo: `doc/assets/issue/duolingo-module-transition.png`
- PRD: `doc/PRD.md` (v0.2.0)
- App Features: `doc/app-features.md` (v1.1.0)
- Código atual: `app/js/controllers.js`, `app/views/trail.html`, `app/views/signup.html`

---

*Documento gerado em sessão BMAD Party Mode — 2026-04-06*
