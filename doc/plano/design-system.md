# Design System — Rota Viva

**Versão:** 0.3.0
**Data:** 2026-03-30
**Autor:** Jarvis

---

## 0. Identidade Visual — Sistema de Design Rota Viva

O Rota Viva é um programa do **Ministério da Integração e do Desenvolvimento Regional (MIDR)** e segue a **Identidade Visual do Governo Federal Brasileiro** como base em todos os contextos — landing page, telas de entrada do PWA e app de cada rota.

### 0.1 Como o sistema funciona

O design é **um único sistema com variações de ênfase por rota** — não paletas independentes:

```
BASE GOVERNO FEDERAL
(verde + amarelo + azul + vermelho + branco + geométrico)
        │
        ├── Landing page → paleta equilibrada, todas as cores
        │
        ├── Rota do Mel  → mesma base, AMARELO como cor primária de destaque
        │
        └── Rota da Pesca → mesma base, AZUL como cor primária de destaque
```

**Decorações geométricas** (círculos, retângulos, pirâmides) estão presentes nos **três contextos** — não são exclusivas da landing page.

### 0.2 Paleta base — Governo Federal

| Cor | Nome | Hex | Presença nas variações |
|-----|------|-----|----------------------|
| Verde Brasil | Campo verde da bandeira | `#009C3B` | Landing + Mel + Pesca |
| Amarelo Brasil | Losango amarelo | `#FFDF00` | Landing + **primário Mel** + suporte Pesca |
| Azul Brasil | Esfera celeste | `#1351B4` | Landing + suporte Mel + **primário Pesca** |
| Vermelho acento | Acento pontual | `#EF3E42` | Landing + Mel + Pesca (sempre discreto) |
| Branco | Fundo principal | `#FFFFFF` | Landing + Mel + Pesca |
| Preto editorial | Texto sobre fundo claro | `#222222` | Landing + Mel + Pesca |

### 0.3 Variações por contexto

| Contexto | Cor primária de destaque | Cor de suporte | Fundo |
|----------|--------------------------|----------------|-------|
| **Landing page** | Amarelo `#FFDF00` (CTA principal) | Verde + Azul equilibrados | Branco `#FFFFFF` |
| **Rota do Mel** | Amarelo `#FFDF00` | Verde `#009C3B` | Branco `#FFFFFF` |
| **Rota da Pesca** | Azul `#1351B4` | Verde `#009C3B` | Branco `#FFFFFF` |

> O vermelho `#EF3E42` e o verde `#009C3B` aparecem nos três contextos, sempre como acento ou suporte — nunca como cor dominante.

### 0.4 Elementos decorativos geométricos

Formas geométricas **inspiradas na bandeira do Brasil** — presentes em todos os contextos (landing, app Mel, app Pesca). Aparecem nos cantos de seções/telas, parcialmente cortadas pela borda.

| Forma | Cor base | Contexto de ênfase |
|-------|----------|--------------------|
| Círculo grande | Azul `#1351B4` | Todos; maior destaque na Pesca |
| Retângulo | Amarelo `#FFDF00` | Todos; maior destaque no Mel |
| Círculo médio | Verde `#009C3B` | Todos |
| Quadrado/triângulo pequeno | Vermelho `#EF3E42` | Todos (discreto) |
| Pirâmide / triângulo | Verde ou Amarelo | Separadores de seção |

> Em cada rota, as formas na **cor primária da rota** ficam maiores/mais visíveis; as demais ficam em tamanho suporte. Isso cria a sensação de "puxar para o amarelo" (Mel) ou "puxar para o azul" (Pesca) sem quebrar o sistema.

### 0.5 Referências visuais

| Arquivo | O que mostra |
|---------|-------------|
| `doc/assets/midr-banner.png` | Padrão geométrico e paleta base do MIDR — referência canônica |
| `doc/assets/hero-apicultor.png` | Aplicação correta da landing: foto real + formas geométricas + botão amarelo |

---

## 1. Princípio Central

> **Um app, muitos mundos.**

O Rota Viva é um único codebase PWA que atende todas as rotas. A identidade visual de cada rota é 100% configurável via Funifier Studio — cores, imagens, textos, sons. Nenhum elemento visual é hardcoded para uma rota específica.

---

## 2. Arquitetura de Temas

### 2.1 Quando cada tema se aplica

| Contexto | Tema | Fonte |
|----------|------|-------|
| Landing page | **Base Governo Federal** — paleta equilibrada | Seção 0 deste documento |
| Tela de Login / Cadastro | **Base Governo Federal** — paleta equilibrada | Hardcoded no CSS base |
| Seleção de perfil no cadastro | Cards com preview de cada rota (amarelo Mel / azul Pesca) | `rota_info` (Central) |
| Após login (toda a experiência) | **Tema da rota** — variação de ênfase (ver Seção 0.3) | `theme__c` (gamificação da rota) |

### 2.2 Fluxo de carregamento do tema

```
Login bem-sucedido
    │
    ▼
Frontend recebe JWT + apiKey da rota
    │
    ▼
GET /v3/database/theme__c (token da rota)
    │
    ├── Sucesso → aplica tema + salva em localStorage
    │
    └── Falha → usa tema em cache (localStorage)
              └── Sem cache → usa tema neutro (fallback)
    │
    ▼
Injeta variáveis CSS no :root via JavaScript
    │
    ▼
Toda a UI se adapta automaticamente
```

### 2.3 Persistência e cache

- Tema salvo em `localStorage` com chave `rv_theme_{apiKey}`
- Ao reconectar, compara `theme.version` para atualizar somente se mudou
- Offline: sempre usa cache local — experiência visual preservada

---

## 3. Estrutura do `theme__c`

Custom collection na gamificação de cada rota. **Um único documento** com `_id: "default"`.

As cores seguem a paleta do Governo Federal (Seção 0), com `primary` sendo a **cor de destaque da rota** — amarelo para Mel, azul para Pesca. As demais cores da paleta base permanecem presentes como `accent`, bordas e decorações.

### Exemplo: Rota do Mel (ênfase amarelo)

```json
{
    "_id": "default",
    "version": "1.0.0",

    "colors": {
        "primary": "#FFDF00",
        "primary_dark": "#C9B000",
        "primary_light": "#FFFBE0",
        "accent": "#009C3B",
        "accent_secondary": "#1351B4",
        "decoration_red": "#EF3E42",
        "background": "#FFFFFF",
        "background_gradient": "none",
        "surface": "#FFFFFF",
        "card": "#FFFFFF",
        "card_border": "rgba(255, 223, 0, 0.35)",
        "input_bg": "rgba(0, 0, 0, 0.04)",
        "text": "#222222",
        "text_muted": "#555555",
        "text_faint": "#999999",
        "text_on_primary": "#222222",
        "success": "#009C3B",
        "error": "#EF3E42",
        "warning": "#FFDF00"
    },

    "images": {
        "logo": "https://s3.amazonaws.com/.../rota-mel-logo.png",
        "logo_small": "https://s3.amazonaws.com/.../rota-mel-logo-sm.png",
        "background_pattern": "https://s3.amazonaws.com/.../mel-pattern.png",
        "mascot": "https://s3.amazonaws.com/.../abelha-mascot.png",
        "mascot_happy": "https://s3.amazonaws.com/.../abelha-happy.png",
        "mascot_sad": "https://s3.amazonaws.com/.../abelha-sad.png",
        "onboarding": [
            "https://s3.amazonaws.com/.../mel-onboard-1.png",
            "https://s3.amazonaws.com/.../mel-onboard-2.png",
            "https://s3.amazonaws.com/.../mel-onboard-3.png"
        ],
        "empty_state": "https://s3.amazonaws.com/.../mel-empty.png",
        "level_badge": "https://s3.amazonaws.com/.../mel-badge-{level}.png"
    },

    "labels": {
        "welcome": "Bem-vindo à Colmeia!",
        "welcome_back": "A Colmeia sentiu sua falta!",
        "missions_title": "Missões do Apiário",
        "diary_title": "Diário do Apicultor",
        "gallery_title": "Galeria de Saberes",
        "ranking_title": "Ranking da Colmeia",
        "points_name": "Mel",
        "points_unit": "ML",
        "level_prefix": "Apicultor",
        "streak_message": "dias seguidos cuidando da colmeia!",
        "empty_missions": "Nenhuma missão hoje. Descanse, apicultor!",
        "offline_banner": "Modo offline — suas ações serão sincronizadas"
    },

    "sounds": {
        "success": "https://s3.amazonaws.com/.../mel-success.mp3",
        "levelup": "https://s3.amazonaws.com/.../mel-levelup.mp3",
        "notification": "https://s3.amazonaws.com/.../mel-notification.mp3",
        "badge_earned": "https://s3.amazonaws.com/.../mel-badge.mp3"
    },

    "meta": {
        "emoji": "🐝",
        "narrative_name": "Colmeia Viva",
        "description": "Apicultura sustentável no Piauí",
        "mascot_name": "Mel"
    }
}
```

### 3.1 Exemplo: Rota da Pesca (ênfase azul)

```json
{
    "_id": "default",
    "version": "1.0.0",

    "colors": {
        "primary": "#1351B4",
        "primary_dark": "#0D3A80",
        "primary_light": "#DDEEFF",
        "accent": "#009C3B",
        "accent_secondary": "#FFDF00",
        "decoration_red": "#EF3E42",
        "background": "#FFFFFF",
        "background_gradient": "none",
        "surface": "#FFFFFF",
        "card": "#FFFFFF",
        "card_border": "rgba(19, 81, 180, 0.2)",
        "input_bg": "rgba(0, 0, 0, 0.04)",
        "text": "#222222",
        "text_muted": "#555555",
        "text_faint": "#999999",
        "text_on_primary": "#FFFFFF",
        "success": "#009C3B",
        "error": "#EF3E42",
        "warning": "#FFDF00"
    },

    "labels": {
        "welcome": "Bem-vindo ao Rio!",
        "welcome_back": "O rio sentiu sua falta!",
        "missions_title": "Missões da Maré",
        "diary_title": "Diário do Pescador",
        "gallery_title": "Galeria de Saberes",
        "ranking_title": "Ranking do Rio",
        "points_name": "Peixes",
        "points_unit": "PX",
        "level_prefix": "Pescador",
        "streak_message": "dias seguidos navegando!",
        "empty_missions": "Nenhuma missão hoje. A maré está calma, pescador!",
        "offline_banner": "Modo offline — suas ações serão sincronizadas"
    },

    "meta": {
        "emoji": "🐟",
        "narrative_name": "Rio em Movimento",
        "description": "Pesca artesanal sustentável no Amapá",
        "mascot_name": "Piaba"
    }
}
```

---

## 4. CSS Variables — Mapeamento

O frontend aplica o tema injetando variáveis CSS no `:root`. Todo componente referencia variáveis — nunca cores literais.

### 4.1 Variáveis base (tema neutro — landing page e pré-login)

Paleta base do Governo Federal, equilibrada. Nenhuma cor de rota específica assume o papel primário.

```css
:root {
    /* Cores — base Governo Federal */
    --color-primary: #FFDF00;         /* Amarelo Brasil — CTA principal */
    --color-primary-dark: #C9B000;
    --color-primary-light: #FFFBE0;
    --color-accent: #009C3B;          /* Verde Brasil */
    --color-accent-secondary: #1351B4;/* Azul Brasil */
    --color-decoration-red: #EF3E42;  /* Vermelho acento */
    --color-bg: #FFFFFF;
    --color-bg-gradient: none;
    --color-surface: #FFFFFF;
    --color-card: #FFFFFF;
    --color-card-border: rgba(0, 0, 0, 0.1);
    --color-input-bg: rgba(0, 0, 0, 0.04);
    --color-text: #222222;
    --color-text-muted: #555555;
    --color-text-faint: #999999;
    --color-text-on-primary: #222222; /* texto escuro sobre amarelo */
    --color-success: #009C3B;
    --color-error: #EF3E42;
    --color-warning: #FFDF00;

    /* Imagens */
    --img-background: none;
    --img-logo: none;

    /* Tipografia */
    --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    --font-size-xs: 11px;
    --font-size-sm: 13px;
    --font-size-md: 16px;
    --font-size-lg: 20px;
    --font-size-xl: 28px;

    /* Espaçamento */
    --spacing-xs: 4px;
    --spacing-sm: 8px;
    --spacing-md: 16px;
    --spacing-lg: 24px;
    --spacing-xl: 32px;

    /* Bordas */
    --radius-sm: 8px;
    --radius-md: 12px;
    --radius-lg: 16px;
    --radius-full: 50%;
}
```

### 4.2 Aplicação dinâmica via JavaScript

```javascript
function applyTheme(theme) {
    var root = document.documentElement;
    var c = theme.colors || {};

    if (c.primary) root.style.setProperty('--color-primary', c.primary);
    if (c.primary_dark) root.style.setProperty('--color-primary-dark', c.primary_dark);
    if (c.primary_light) root.style.setProperty('--color-primary-light', c.primary_light);
    if (c.accent) root.style.setProperty('--color-accent', c.accent);
    if (c.background) root.style.setProperty('--color-bg', c.background);
    if (c.background_gradient) root.style.setProperty('--color-bg-gradient', c.background_gradient);
    if (c.card) root.style.setProperty('--color-card', c.card);
    if (c.card_border) root.style.setProperty('--color-card-border', c.card_border);
    if (c.text) root.style.setProperty('--color-text', c.text);
    if (c.text_muted) root.style.setProperty('--color-text-muted', c.text_muted);
    if (c.text_faint) root.style.setProperty('--color-text-faint', c.text_faint);
    if (c.text_on_primary) root.style.setProperty('--color-text-on-primary', c.text_on_primary);
    if (c.surface) root.style.setProperty('--color-surface', c.surface);

    // Background pattern
    if (theme.images && theme.images.background_pattern) {
        root.style.setProperty('--img-background', 'url(' + theme.images.background_pattern + ')');
    }
}
```

### 4.3 Regra de ouro

> **Nenhum componente deve referenciar uma cor literal.** Sempre usar `var(--color-*)`.
>
> ❌ `color: #F5C200;`
> ✅ `color: var(--color-primary);`

---

## 5. Componentes do Design System

### 5.1 Tokens visuais

| Token | Uso | Variável CSS |
|-------|-----|-------------|
| Primary | Botões, links, ícones ativos, destaques | `--color-primary` |
| Primary Dark | Headers, status bar, sombras | `--color-primary-dark` |
| Primary Light | Hover, badges leves, tags | `--color-primary-light` |
| Accent | Conquistas, estrelas, XP, destaques dourados | `--color-accent` |
| Background | Fundo de todas as telas | `--color-bg` |
| Card | Background de cards, modais | `--color-card` |
| Card Border | Bordas sutis dos cards | `--color-card-border` |
| Text | Texto principal (escuro sobre fundo claro) | `--color-text` |
| Text Muted | Texto secundário, labels | `--color-text-muted` |
| Text Faint | Placeholders, hints | `--color-text-faint` |
| Text On Primary | Texto sobre botão/fundo primário (branco p/ azul, escuro p/ amarelo) | `--color-text-on-primary` |
| Success | Missão completa, validação OK | `--color-success` |
| Error | Erros, validação falha | `--color-error` |

### 5.2 Componentes reutilizáveis

| Componente | Descrição | Consome do tema |
|-----------|-----------|-----------------|
| `Button` | Primário, outline, danger | colors.primary |
| `Card` | Container com blur e borda | colors.card, card_border |
| `Input` | Campo de formulário | colors.input_bg, card_border |
| `Header` | Topo com logo e título | images.logo, labels.* |
| `BottomNav` | Navegação inferior (5 tabs) | colors.primary |
| `MissionCard` | Card de missão/desafio | colors.*, images.mascot |
| `ProgressBar` | Barra de XP/progresso | colors.primary, accent |
| `Badge` | Conquista/badge | colors.accent, images.level_badge |
| `EmptyState` | Tela sem conteúdo | images.empty_state, labels.empty_* |
| `Toast` | Notificação in-app | colors.success/error/warning |
| `OfflineBanner` | Indicador de modo offline | labels.offline_banner |

### 5.3 Mascote

O mascote aparece em momentos-chave da experiência:

| Momento | Imagem | Expressão |
|---------|--------|-----------|
| Boas-vindas (onboarding) | `mascot` | Neutro/amigável |
| Missão completa | `mascot_happy` | Celebrando |
| Streak quebrado / inatividade | `mascot_sad` | Triste |
| Tela vazia (sem missões) | `mascot` | Relaxado |
| Level up | `mascot_happy` | Animado |

---

## 6. Tipografia e Ícones

### Tipografia

- **Font family:** System fonts (nenhuma web font — performance em 2G/3G)
- **Hierarquia:** XL (títulos) → LG (subtítulos) → MD (corpo) → SM (labels) → XS (hints)
- **Peso:** 700 (títulos), 600 (subtítulos/botões), 400 (corpo)

### Ícones

**Font Awesome 6 Free** — versão Solid (`fas`). Ícones monocromáticos, sem gradiente, sem borda, com cor 100% controlada via CSS (`color: var(--color-primary)`).

**Por que Font Awesome e não emojis nativos:**
- Emojis do sistema operacional têm gradientes, sombras e múltiplas cores — quebram a consistência visual das paletas chapadas dos temas
- Font Awesome solid é flat por definição — se comporta como um glifo, herda qualquer cor do CSS
- Renderização 100% consistente entre Android e iOS (emojis variam por fabricante)
- Funciona offline após o primeiro carregamento — Font Awesome pode ser carregado via CDN e cacheado pelo Service Worker, ou bundlado junto com os assets do PWA

**Carregamento:**
```html
<!-- Via CDN (cacheado pelo Service Worker após primeira visita) -->
<link rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
```

**Uso nos templates:**
```html
<!-- Cor herda do tema via CSS variable -->
<i class="fas fa-trophy" style="color: var(--color-accent)"></i>

<!-- Tamanho controlado por classe ou font-size -->
<i class="fas fa-leaf fa-lg"></i>
```

**Ícones por contexto:**

| Contexto | Ícone FA | Classe |
|---------|---------|--------|
| Dashboard / Home | Folha / casa | `fa-leaf` / `fa-house` |
| Trilhas e missões | Mapa / rota | `fa-map` / `fa-route` |
| Diário do Produtor | Caderno | `fa-book-open` |
| Galeria de Saberes | Imagens | `fa-images` |
| Ranking / Território | Pódio / troféu | `fa-ranking-star` / `fa-trophy` |
| Perfil / usuário | Pessoa | `fa-circle-user` |
| Conquista / badge | Medalha | `fa-medal` |
| Notificação | Sino | `fa-bell` |
| Compartilhar | Seta de compartilhamento | `fa-share-nodes` |
| Offline / sync | Nuvem com seta | `fa-cloud-arrow-up` |
| Escuta ativa | Microfone / voz | `fa-microphone` |
| Certificação / Multiplicador | Certificado | `fa-certificate` |
| Rota do Mel (temático) | Abelha | `fa-bee` (FA Pro) → usar SVG custom no MVP |
| Pesca Artesanal (temático) | Peixe | `fa-fish` |
| Políticas públicas / governo | Edifício | `fa-building-columns` |
| Renda / acesso a mercado | Moeda / cifrão | `fa-coins` |
| Organização / cooperação | Aperto de mão | `fa-handshake` |
| Progresso / XP | Barra de progresso | `fa-chart-line` |

**Ícones temáticos customizados (SVG):**
Para ícones muito específicos sem equivalente no FA Free (abelha, favo, rede de pesca, canoa), usar SVG inline ou como `<img>` com cor aplicada via CSS filter ou preenchimento inline. Esses ícones seguem o mesmo estilo flat sem bordas dos personagens cartoon.

---

## 7. Layout e Responsividade

### Grid

- Mobile-first, single column
- Max-width: 480px (centrado em telas maiores)
- Padding lateral: 20px
- Safe area: `env(safe-area-inset-*)` para notch/barra de navegação

### Telas principais (pós-login)

```
┌─────────────────────────┐
│  Header (logo + título) │  ← images.logo + labels.*
├─────────────────────────┤
│                         │
│    Conteúdo principal   │  ← Scrollable
│    (missões, trilha,    │
│     diário, ranking)    │
│                         │
├─────────────────────────┤
│  BottomNav (5 tabs)     │  ← Fixo no rodapé
│  🏠 🎯 📝 🏆 👤       │
└─────────────────────────┘
```

### Background

- Cor sólida `--color-bg` como base
- Opcionalmente `background_pattern` como overlay sutil (opacity 0.05–0.1)
- Gradiente via `background_gradient` para profundidade

---

## 8. Acessibilidade

### Contraste

- Todas as combinações de cor devem manter ratio ≥ 4.5:1 (WCAG AA)
- **Light mode é o padrão do app** — texto escuro (`--color-text`) sobre fundo claro (`--color-bg`). Motivo: acessibilidade para produtores rurais 40–60 anos (cataratas, uso em luz solar direta, baixo letramento digital)
- Botão primário: verificar `text_on_primary` por rota — Colmeia Viva (#F5C200 fundo) usa texto escuro `#1A1208`; Rio em Movimento (#005CAB fundo) usa texto branco `#FFFFFF`
- **Amarelo (#F5C200) nunca como cor de texto sobre fundo branco** — falha WCAG completamente. Amarelo só como background de botão, tag ou elemento decorativo com texto escuro por cima

### Touch targets

- Mínimo 44x44px para todos os elementos interativos
- Espaçamento mínimo 8px entre targets adjacentes

### Público-alvo

- Produtores rurais — muitos com pouca experiência digital
- Fontes grandes (16px mínimo para corpo)
- Textos claros e diretos (evitar jargão técnico)
- Feedback visual forte (cores, animações, sons)

---

## 9. Configuração no Funifier Studio

### Para cada gamificação de rota:

1. Criar custom collection `theme__c`
2. Inserir um documento com `_id: "default"` seguindo a estrutura da seção 3
3. Fazer upload das imagens via `/v3/upload` e usar as URLs S3 nos campos de imagem
4. Fazer upload dos sons da mesma forma

### Para adicionar uma nova rota:

1. Criar gamificação no Studio (já documentado em `architecture.md`)
2. Criar `theme__c` com o tema da nova rota
3. **Zero alteração no código do app** — o tema é carregado dinamicamente

### Validação de tema

O frontend valida campos obrigatórios ao carregar:
- `colors.primary` (obrigatório)
- `colors.background` (obrigatório)
- `meta.narrative_name` (obrigatório)
- Demais campos: fallback para valores do tema neutro

---

## 10. Transição de tema

### Login → Dashboard (momento da troca)

```
Tela de login (tema neutro)
    │
    ▼
Login bem-sucedido → carrega theme__c
    │
    ▼
Fade-out rápido (200ms)
    │
    ▼
Aplica variáveis CSS + troca body class
    │
    ▼
Fade-in com tema da rota (300ms)
    │
    ▼
Dashboard renderiza com identidade visual da rota
```

### Logout (volta ao neutro)

```
Botão "Sair"
    │
    ▼
Limpar variáveis CSS (reset para tema neutro)
    │
    ▼
Redirect para /login
```

---

---

## 11. Identidade Visual e Estilo de Personagens

Esta seção complementa o sistema técnico de temas com as diretrizes criativas que garantem coerência visual em todas as superfícies onde Rota Viva aparece: o app, a landing page, as redes sociais e materiais de campanha.

### 11.0 Base Visual da Área Pública — Identidade MIDR/Governo Federal

A área pública do projeto (landing page, tela de login/cadastro antes da seleção de rota, materiais impressos e cartazes) adota a **identidade visual do MIDR/Governo Federal** como base — não uma identidade "Rota Viva" inventada.

**Por que essa decisão é correta:**
- O produtor rural já conhece esse vocabulário visual — é o mesmo do rádio rural, dos cartazes do PRONAF, dos comunicados do Bolsa Família. Credibilidade imediata, sem construção de marca do zero.
- A identidade do Governo Federal já tem equity com esse público — usar é inteligência estratégica.
- O MIDR é o órgão contratante — alinhar a identidade ao instituto reforça a legitimidade do projeto.
- Frees the route themes (Colmeia Viva, Rio em Movimento) to be fully themselves without competing with a "Rota Viva" umbrella color.

**Paleta MIDR/Governo Federal:**

| Token | Nome | Hex | Uso na área pública |
|-------|------|-----|---------------------|
| `--midr-white` | Branco | `#FFFFFF` | Background principal — toda a landing page |
| `--midr-blue` | Azul MIDR | `#005CAB` | Cabeçalho, links, elementos primários — **mesma cor do tema Rio em Movimento** |
| `--midr-green` | Verde Brasil | `#009B3A` | Destaques, ícones temáticos de natureza |
| `--midr-yellow` | Amarelo Brasil | `#F5C200` | Ícones, destaques de energia — **mesma cor do tema Colmeia Viva** |
| `--midr-red` | Vermelho Brasil | `#D02020` | Alertas, urgência, contrastes visuais |
| `--midr-text` | Cinza escuro | `#1A1A1A` | Texto principal sobre fundo branco |
| `--midr-text-light` | Cinza médio | `#555555` | Texto secundário, subheadlines |

**Alinhamento estratégico de cores — landing → app:**
O amarelo Brasil (`#F5C200`) é a cor primária da seção "Você é apicultor?" na landing E a cor primária do tema Colmeia Viva no app. O azul MIDR (`#005CAB`) é a cor primária da seção "Você é pescador?" na landing E a cor primária do tema Rio em Movimento no app. Isso cria continuidade visual perfeita: o produtor entra na seção da sua rota com uma cor, clica no CTA, e o login/app usa exatamente a mesma cor — como se o tema "já estivesse ativo" desde a landing page. Nenhuma ruptura visual em nenhum momento da jornada.

**Elementos geométricos (padrão MIDR):**
- Círculos sólidos cortados nas bordas/cantos (como no banner do MIDR)
- Retângulos angulados como elementos decorativos
- Aplicados nas cores da paleta acima — sem transparência, sem gradiente
- Ícones Font Awesome Solid na cor `--midr-blue` ou na cor temática da rota (quando dentro de uma seção personalizada)

**Onde esta identidade é aplicada:**
- Landing page (background branco, elementos geométricos MIDR)
- Tela de login/cadastro genérica (antes de o usuário selecionar a rota)
- Materiais impressos e cartazes de campanha
- Redes sociais institucionais do projeto (posts "Rota Viva" sem rota específica)
- Certificados digitais emitidos pelo sistema

**Onde NÃO é aplicada:**
- Qualquer tela dentro do app após o login → domina o tema da rota (Colmeia Viva ou Rio em Movimento)
- Posts de redes sociais que comunicam conquistas específicas de uma rota → usam o tema da rota

### 11.1 Tipografia

A escolha de tipografia afeta diretamente a percepção do projeto — system fonts transmitem indiferença, web fonts transmitem intenção. O custo de performance é irrelevante: Baloo 2 + Inter somam ~90KB, carregam uma vez e ficam permanentemente no cache do Service Worker.

**Display e títulos: Baloo 2** (Google Fonts, open source)
- Pesos: Bold (700), ExtraBold (800)
- Características: rounded, calorosa, forte sem ser agressiva, excelente com acentuação portuguesa
- Por que: transmite movimento e energia — adequado para um produto que celebra conquistas. Usada em apps gamificados de alta adoção (Duolingo, Khan Academy Kids). Humana, não corporativa.

**Interface e corpo: Inter** (Google Fonts, open source)
- Pesos: Regular (400), Medium (500), SemiBold (600)
- Características: projetada para interfaces digitais, legível em 12px em telas de baixa resolução
- Por que: neutralidade que deixa o conteúdo falar. Funciona em qualquer contexto — dentro do app ou em posts de redes sociais.

**Atualizar em `design-system.md` seção 4.1:**
```css
:root {
    --font-display: 'Baloo 2', -apple-system, sans-serif;
    --font-ui:      'Inter', -apple-system, sans-serif;
    /* demais variáveis... */
}
```

**Escala:**

| Nível | Fonte | Tamanho | Peso | Uso |
|-------|-------|---------|------|-----|
| Hero | Baloo 2 | 32px / 800 | ExtraBold | Título de tela principal, hero da landing |
| H1 | Baloo 2 | 24px | Bold | Título de seção |
| H2 | Baloo 2 | 20px | Bold | Nome de missão, subtítulo |
| H3 | Baloo 2 | 17px | Bold | Título de card |
| Body | Inter | 15px | Regular | Descrições, instruções |
| Strong | Inter | 15px | SemiBold | Destaque dentro do texto |
| Label | Inter | 13px | Medium | Labels, legendas, metadados |
| Caption | Inter | 11px | Regular | Timestamps, hints |

---

### 11.2 Estilo de Personagens — Cartoon Flat (Duolingo-inspired)

Os personagens do app são a alma emocional da experiência. Eles aparecem no onboarding, nas conquistas, nos estados do mascote e na landing page ao lado de imagens reais.

**Princípios do estilo:**

| Princípio | Regra | Por que |
|-----------|-------|---------|
| **Flat, sem bordas** | Formas sólidas preenchidas, sem outline/stroke externo | Elimina distorção ao escalar em telas de diferentes resoluções — a imagem continua limpa em qualquer tamanho |
| **Paleta chapada** | Sem gradientes dentro dos personagens — cada área é uma cor sólida | Consistência temática: a paleta do personagem espelha a paleta do tema da rota |
| **Expressões exageradas** | Olhos grandes, expressões claras — alegria, determinação, orgulho, surpresa | Leitura emocional instantânea para baixa literacia digital |
| **Proporção amigável** | Cabeça proporcionalmente maior que o corpo (ratio 1:1.5) | Estilo "cute" acessível, não infantil — convida sem excluir |
| **Acessórios culturais visíveis** | Apicultor: chapéu, veu protetor, fumigador. Pescador: chapéu de palha, rede, remo | Identificação imediata com o universo do produtor |
| **Diversidade representada** | Personagens com traços de diferentes origens — nordeste/norte brasileiro | Inclusão real, não decorativa |

**Personagens por rota:**

| Rota | Personagem principal | Expressões necessárias | Objetos temáticos |
|------|---------------------|----------------------|-------------------|
| Colmeia Viva | Apicultor / Apicultora | Happy, Sad, Neutral, Celebrating, Focused | Fumigador, favo, pote de mel, abelha |
| Rio em Movimento | Pescador / Pescadora | Happy, Sad, Neutral, Celebrating, Focused | Rede, remo, peixe (pirarucu), canoa |

**Estilo de referência:** Duolingo (owl + characters), mas com identidade brasileira/rural — não tecnológica, não urbana.

**Formato de entrega dos assets:**
- PNG com fundo transparente
- Resolução mínima: 400×400px (mascote), 200×200px (ícones de badge)
- Versões: 1x e 2x para telas de alta densidade (Retina)

---

### 11.3 Fotografia Real — Diretrizes

Usada exclusivamente na landing page, campanhas e redes sociais. **Nunca dentro do app** (o app usa cartoon + cores temáticas para garantir consistência visual em qualquer rota).

**Critérios de seleção:**

| Critério | Detalhe |
|----------|---------|
| **Pessoas reais no ambiente real** | Apicultor na roça, pescador no rio — não em estúdio, não com adereços artificiais |
| **Luz natural** | Golden hour (pôr/nascer do sol) para mel, luz azulada da madrugada para pesca — momentos reais do trabalho |
| **Expressão autêntica** | Concentração, orgulho, alegria genuína — não sorriso posado |
| **Foco no rosto e nas mãos** | As mãos que fazem o trabalho são tão importantes quanto o rosto |
| **Território visível no fundo** | Caatinga piauiense, rios e manguezais amapaenses — fundo desfocado mas reconhecível |
| **Sem banco de imagens genérico** | Nunca usar imagens de "agricultor feliz" de stock — a diferença é perceptível e destrói credibilidade |

**Combinação real + cartoon:**
O momento mais poderoso da identidade Rota Viva é quando colocamos o produtor real ao lado de seu "alter ego" cartoon. A foto do pescador real + o cartoon do pescador da sua rota lado a lado cria a ponte emocional entre o mundo real e o mundo do jogo. Essa é a composição central da landing page e das campanhas de lançamento.

---

## 12. Landing Page — Estratégia de Comunicação e Viralização

A landing page **não é uma página de apresentação**. É a primeira peça de marketing do projeto — e o primeiro ponto de viralização. Sua função não é explicar o que o app faz: é fazer o produtor sentir que **as suas dores têm solução e que esse caminho é para ele**.

> **Princípio central:** o produtor não entra no app para ganhar um badge. Ele entra porque acredita que, ao entrar, vai regularizar a produção, acessar o governo, parar de depender do atravessador, mostrar pros filhos que o campo tem futuro. O badge é o instrumento — o desejo é o que move. A landing page vende o desejo, não o instrumento.

> **Regra do MrBeast:** os primeiros 3 segundos decidem tudo. O hero precisa causar reconhecimento emocional imediato — "isso é sobre mim" — antes de qualquer explicação. A viralização começa aqui ou não começa.

---

### 12.1 Anatomia da Landing Page

```
┌──────────────────────────────────────────────────────┐
│  NAVBAR — Logo MIDR + "Rota Viva" + "Já sou          │
│           cadastrado" (link para login)               │
├──────────────────────────────────────────────────────┤
│  HERO — Vídeo real + headline + CTA geral + FOMO     │  Seção 1
│  [Fundo branco, elementos geométricos MIDR nas bordas]│
├──────────────────────────────────────────────────────┤
│  "A GENTE SABE" — Espelho geral das dores            │  Seção 2
├──────────────────────────────────────────────────────┤
│  ══════════════════════════════════════════════════   │
│  SEÇÃO PERSONALIZADA: "Você é apicultor?"            │  Seção 3A
│  [Fundo âmbar suave — pré-sabor do tema Colmeia Viva]│
│  Dores + desejos do apicultor + foto real + mascote  │
│  ➜ CTA "Entrar como Apicultor" → login tematizado   │
│  ══════════════════════════════════════════════════   │
│  SEÇÃO PERSONALIZADA: "Você é pescador?"             │  Seção 3B
│  [Fundo azul-rio suave — pré-sabor do tema Rio]      │
│  Dores + desejos do pescador + foto real + mascote   │
│  ➜ CTA "Entrar como Pescador" → login tematizado    │
│  ══════════════════════════════════════════════════   │
│  [Nova rota: adicionada automaticamente via rota__c] │  Seção 3N
├──────────────────────────────────────────────────────┤
│  COMO O APP CHEGA LÁ — Screenshots como instrumento  │  Seção 4
├──────────────────────────────────────────────────────┤
│  PROVA SOCIAL — Escala, mapa, logos, voz humana      │  Seção 5
├──────────────────────────────────────────────────────┤
│  SEJA UM FUNDADOR — FOMO + CTA final                 │  Seção 6
├──────────────────────────────────────────────────────┤
│  FOOTER — Logos MIDR/FADEX/UFPI, links, contato     │
└──────────────────────────────────────────────────────┘
```

**Princípio arquitetural das seções personalizadas:**
As seções 3A, 3B... são geradas dinamicamente pelo PWA a partir dos dados de `rota__c` na gamificação central (via `GET /v3/find/rota_info`). Para cada rota cadastrada, o app renderiza uma seção. Adicionar a Rota do Açaí no futuro = cadastrar a entrada em `rota__c` com o bloco `landing` configurado. Zero código novo na landing page.

---

### 12.2 Seção 1 — Hero

**Objetivo emocional:** "Isso é sério, é real, e é sobre mim."

**Composição visual:**
- **Fundo:** vídeo loop, mudo, autoplay — cenas reais dos territórios:
  - Mel escorrendo de um favo, abelhas em câmera lenta, mãos de apicultor retirando o mel
  - Pescador lançando a rede no rio ao amanhecer, pirarucu, canoa no igapó
  - 30–45s loop, transição suave entre as cenas
- **Overlay:** gradiente escuro (#000 a 55%) para legibilidade
- **Logo MIDR:** canto superior, pequeno — credibilidade institucional imediata

**Headline — direção de copy:**

A headline não fala do app. Fala do que o produtor quer:

```
Opção A: "Regularize. Organize. Venda mais.
           Apicultores e pescadores artesanais têm uma rota agora."

Opção B: "Seu mel vale mais do que o atravessador paga.
           Descubra como mudar isso."

Opção C: "Você já sabe produzir.
           Agora é hora de ser reconhecido — e recompensado — por isso."
```

**Subheadline:** uma frase que nomeia quem é e o que vai encontrar:
```
"O aplicativo gratuito do MIDR para apicultores do Piauí e pescadores do Amapá
 que querem acessar o governo, organizar a produção e ter futuro no campo."
```

**CTA:** botão grande, âmbar, ação de baixo comprometimento:
```
"Quero saber mais"  →  ou  →  "Descobrir minha rota"
```

**Contador de FOMO** (abaixo do CTA, em tempo real via API):
```
<i class="fas fa-map-marker-alt"></i>  Rota do Mel — Piauí:
  X municípios · YY vagas de Fundador disponíveis

<i class="fas fa-map-marker-alt"></i>  Pesca Artesanal — Amapá:
  X municípios · YY vagas de Fundador disponíveis
```

---

### 12.3 Seções Personalizadas por Rota — "Você é [perfil]?"

Esta é a inovação central da landing page do Rota Viva. Cada rota cadastrada na gamificação central tem sua própria seção na landing page — gerada dinamicamente, tematizada, e com CTA direto para login/cadastro já com o tema da rota ativo.

**Por que isso é uma decisão de marketing de alto nível:**
- A personalização começa antes do cadastro — o produtor já se sente "em casa" antes de criar conta
- Elimina a fricção da "escolha de perfil" no formulário — o usuário clicou em "Sou apicultor", então já sabe qual é ele
- O login/cadastro tematizado mantém a continuidade emocional — não há ruptura visual entre "me interessei" e "estou dentro"
- É escalável: cada nova rota ganha sua seção sem uma linha de código adicional

**Composição visual de cada seção:**

```
┌──────────────────────────────────────────────────────────┐
│  [Fundo: cor primária da rota em baixa opacidade (~10%)] │
│  [Elemento geométrico da rota no canto: hexágono/rede]   │
│                                                           │
│  ┌──────────────────┐   ┌──────────────────────────────┐ │
│  │  [Foto real:     │   │  "Você é apicultor?"          │ │
│  │   apicultor/     │   │  (headline em Baloo 2 bold)   │ │
│  │   pescador       │   │                               │ │
│  │   no trabalho]   │   │  "Você produz mel bom,        │ │
│  │                  │   │   mas ainda depende do        │ │
│  │  [Mascote cartoon│   │   atravessador para vender.   │ │
│  │   da rota ao     │   │   Você sabe que pode          │ │
│  │   lado da foto]  │   │   mais. A Rota do Mel         │ │
│  │                  │   │   abre esse caminho."         │ │
│  └──────────────────┘   │                               │ │
│                          │  ✓ Regularize e tire nota    │ │
│                          │  ✓ Acesse PAA e PNAE         │ │
│                          │  ✓ Conecte-se com outros     │ │
│                          │  ✓ Seja reconhecido          │ │
│                          │                              │ │
│                          │  [CTA: "Entrar como          │ │
│                          │   Apicultor" → cor primária  │ │
│                          │   da rota (âmbar)]           │ │
│                          └──────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

**Fluxo ao clicar no CTA da seção:**

```
Usuário clica em "Entrar como Apicultor"
        │
        ▼
PWA armazena rota selecionada em sessionStorage: { routeId: 'mel', theme: {...} }
        │
        ▼
Aplica tema da rota ANTES de mostrar o formulário de login/cadastro
(mesmas CSS variables que seriam aplicadas após login)
        │
        ▼
Exibe tela de login/cadastro TEMATIZADA:
- Fundo: #1A0E00 (Noite do Sertão)
- Cores: âmbar/mel
- Mascote: abelha animada
- Texto: "Bem-vindo à Colmeia, apicultor!"
        │
        ├── Usuário tem conta → Login → recebe JWT → carrega theme__c da rota → Dashboard
        └── Usuário novo → Cadastro com perfil pré-selecionado (campo perfil = 'apicultor', read-only)
                → Após cadastro → Login automático → Dashboard
```

**Estrutura de dados em `rota__c` — bloco `landing`:**

O campo `landing` em `rota__c` (na gamificação central) alimenta cada seção personalizada:

```json
{
    "_id": "mel",
    "title": "Colmeia Viva",
    "profile": "apicultor",
    "api_key": "69ab...",
    "landing": {
        "section_headline": "Você é apicultor?",
        "hook": "Você produz mel bom, mas o atravessador ainda dita o preço. Você sabe que pode mais.",
        "pain_points": [
            "Dificuldade de acessar o PAA e o PNAE sem atravessador",
            "Regularização sanitária complexa — nota fiscal parece longe",
            "Pouca organização entre apicultores do seu município",
            "Sensação de que seu conhecimento não é reconhecido formalmente"
        ],
        "desires": [
            "Regularize e tire nota fiscal",
            "Acesse programas do governo diretamente",
            "Conecte-se com outros apicultores",
            "Seja reconhecido como produtor de referência"
        ],
        "cta_label": "Entrar como Apicultor",
        "photo_url": "https://cdn.rotaviva.app/landing/apicultor-real.jpg",
        "bg_tint": "rgba(245,194,0,0.10)",
        "geo_element": "hexagono"
    }
}
```

**Atualização necessária na `rota_info` PreparedAggregate** (seção 3 do `architecture.md`):
O bloco `landing` precisa ser adicionado ao `$project` da PreparedAggregate `rota_info`:

```json
[{ "$project": {
    "_id": 1, "title": 1, "image": 1, "intro": 1,
    "profile": 1, "api_key": 1, "landing": 1
}}]
```

---

### 12.5 Seção 2 — "A gente sabe" (Espelho Geral de Dores)

**Objetivo emocional:** "Eles me entendem. Não é mais uma promessa vazia do governo."

Esta seção aparece ANTES das seções personalizadas por rota — é o espelho geral que fala com todos os produtores ao mesmo tempo, antes de ele se identificar com a sua rota. O produtor rural tem desconfiança histórica com programas governamentais. Antes de vender qualquer coisa, a landing precisa mostrar que conhece a realidade dele — sem romantizar, sem condescendência.

**Composição:**
- Headline: "A gente sabe que você já ouviu promessas assim antes."
- Subheadline: "Por isso vamos ser diretos."
- Dois blocos lado a lado — um por rota:

**Bloco Apicultor (Piauí):**
```
Você produz mel bom.
Mas o atravessador compra barato e você não tem como negociar.
Você não sabe exatamente quais programas do governo pode acessar.
Regularizar a produção parece caro e complicado demais.
E você se pergunta se seus filhos vão querer ficar no campo.
```

**Bloco Pescador (Amapá):**
```
Você pesca há anos, mas sua atividade ainda é informal.
O seguro-defeso é difícil de acessar e os benefícios não chegam.
O pescado vale pouco porque falta organização e infraestrutura.
E você sente que o conhecimento dos rios que você tem não é reconhecido por ninguém.
```

**Virada:** após os dois blocos, uma linha de transição:
```
"Rota Viva não resolve tudo. Mas abre o caminho."
```

---

### 12.4 Seção 3 — "O que você vai conseguir" (Resultados Concretos)

**Objetivo emocional:** "Isso é o que eu preciso. Quero isso."

Esta seção não fala de trilhas, missões ou badges. Fala de resultados — o que muda na vida do produtor ao participar. Os badges e as missões aparecem depois, como instrumento. Aqui é a promessa.

**Composição:** lista de resultados concretos com ícone Font Awesome + texto curto por item.

**Para apicultores:**

| Ícone | Resultado |
|-------|-----------|
| `fa-building-columns` | Saber quais programas do governo você tem direito — e como acessar |
| `fa-file-invoice` | Entender como regularizar sua produção e tirar nota fiscal |
| `fa-coins` | Aprender a vender direto para o governo (PAA, PNAE) sem atravessador |
| `fa-users` | Organizar-se com outros apicultores do seu município para ganhar escala |
| `fa-seedling` | Boas práticas de manejo que aumentam a produção sem sair da propriedade |
| `fa-medal` | Ser reconhecido como produtor de referência — dentro e fora do app |
| `fa-heart` | Mostrar pros seus filhos que a apicultura tem futuro |

**Para pescadores:**

| Ícone | Resultado |
|-------|-----------|
| `fa-id-card` | Formalizar a atividade e acessar o seguro-defeso sem burocracia |
| `fa-building-columns` | Saber quais benefícios previdenciários e programas de apoio existem |
| `fa-handshake` | Organizar-se coletivamente para ter mais força na comercialização |
| `fa-fish` | Boas práticas sanitárias que valorizam o pescado e abrem novos mercados |
| `fa-map` | Contribuir para proteger os rios e a biodiversidade do Amapá |
| `fa-medal` | Ser reconhecido como guardião dos rios — com certificação oficial |
| `fa-heart` | Mostrar que ser pescador artesanal é uma profissão com orgulho e futuro |

**Nota de design:** cada item é uma linha com ícone à esquerda (cor primária da rota) e texto curto. Layout de lista vertical no mobile, grid 2 colunas no desktop. Fundo levemente diferente do restante da página para criar uma "zona de promessas".

---

### 12.5 Seção 4 — As Rotas (Real + Cartoon lado a lado)

**Objetivo emocional:** "É sobre mim. Esse apicultor/pescador sou eu."

**Composição — dois cards, um por rota:**

```
┌──────────────────────┬──────────────────────┐
│  [Foto: apicultor    │  [Foto: pescador      │
│   real — rosto,      │   real — rosto,       │
│   mãos, colmeia,     │   rede, rio, canoa,   │
│   luz natural]       │   luz do amanhecer]   │
│                      │                       │
│  [Cartoon mascote    │  [Cartoon mascote     │
│   Colmeia Viva —     │   Rio em Movimento —  │
│   flat, sem bordas]  │   flat, sem bordas]   │
│                      │                       │
│  ROTA DO MEL · PI    │  PESCA ARTESANAL · AP │
│                      │                       │
│  "Fortaleça a        │  "Tece os nós da      │
│  colmeia do seu      │  rede do seu          │
│  município"          │  município"           │
│                      │                       │
│  [CTA: Sou apicultor]│  [CTA: Sou pescador]  │
└──────────────────────┴──────────────────────┘
```

A foto real ancora na realidade. O cartoon ao lado diz: "dentro do app, você tem um alter ego que representa quem você é". A justaposição cria a ponte entre mundo real e mundo do app — sem precisar explicar o conceito.

---

### 12.6 Seção 5 — Como o App Chega Lá (Screenshots como Instrumento)

**Objetivo emocional:** "Parece simples. Eu consigo usar isso."

Só agora mostramos o app — depois que a promessa foi feita e o produtor quer saber como ela se concretiza. As legendas dos screenshots não falam de funcionalidades: falam de como cada tela entrega um dos resultados prometidos na seção 3.

**Composição:** 4 screenshots em mockup de smartphone, cada um com legenda orientada a resultado:

| Screenshot | Legenda orientada a resultado |
|-----------|-------------------------------|
| Guia de Políticas Públicas | "Em minutos, você descobre quais programas do governo são pra você — e como pedir" |
| Trilha de Regularização | "Passo a passo: como tirar nota fiscal e vender para o PAA" |
| Diário do Produtor | "Registre o que produz. Isso vira evidência e te ajuda a acessar mais apoio" |
| Ranking de municípios | "Seu município, organizado. Juntos, vocês têm mais força" |

**Nota:** screenshots com temas aplicados — Colmeia Viva em âmbar/mel, Rio em Movimento em azul/rio. Nunca cores genéricas.

---

### 12.7 Seção 6 — Prova Social

**Objetivo emocional:** "Isso é grande. Isso é real. Eu posso confiar."

O produtor rural desconfia de programas governamentais. A prova social aqui não é técnica — é humana e institucional.

**Composição:**
- **Voz humana primeiro:** depoimento curto de um produtor real (foto + nome + município + fala de 1–2 linhas). Não pode ser genérico. Tem que ser específico: "Aprendi como acessar o PAA. Agora vendo direto pro governo."
- **Números em destaque:**
  ```
  XX.XXX produtores · 10 municípios · 2 territórios · X trilhas de conhecimento
  ```
- **Mapa do Brasil** destacando PI e AP — visual da escala territorial
- **Logos em linha:** MIDR · FADEX · UFPI — nesta ordem (hierarquia institucional)

---

### 12.8 Seção 7 — Seja um Fundador (CTA Final com FOMO)

**Objetivo emocional:** "Se eu não entrar agora, perco minha chance de ser um dos primeiros."

**Composição:**
- **Headline:** "Os primeiros 50 produtores de cada município são Fundadores — para sempre."
- **Explicação:** o que significa (placa permanente no app, badge exclusivo, nunca mais disponível)
- **Contador por município** (tempo real, personalizado se possível por geolocalização):
  ```
  <i class="fas fa-map-marker-alt"></i> [Município detectado]: XX/50 Fundadores · YY vagas
  ```
- **CTA:** "Quero ser Fundador"
- **Rodapé de confiança:** "Gratuito · Sem downloads · Funciona sem internet"

---

### 12.9 Diretrizes de Copy — O que Muda

O erro mais comum em landing pages de projetos governamentais é falar da perspectiva da plataforma ("a plataforma oferece", "o usuário pode acessar"). Rota Viva fala da perspectiva do produtor.

| Princípio | Certo | Errado |
|-----------|-------|--------|
| **Resultado, não funcionalidade** | "Aprenda a acessar o PAA sem atravessador" | "A plataforma oferece trilhas de conhecimento" |
| **Dor antes da solução** | "Você sabe que o atravessador paga pouco" | "Aprimore sua comercialização" |
| **Vocabulário do território** | "sua colmeia", "sua rede", "o rio" | "usuário", "participante", "módulo" |
| **Identidade, não cargo** | "Apicultores do Piauí" | "Produtores rurais beneficiários" |
| **Especificidade** | "50 vagas de Fundador em Laranjal do Jarí" | "Vagas limitadas" |
| **Confiança ganita, não assumida** | "A gente sabe que você já ouviu promessas" | "Cadastre-se e aproveite os benefícios" |

---

### 12.10 Aplicação em Redes Sociais e Campanhas

| Superfície | Regra visual | Regra de conteúdo |
|-----------|-------------|------------------|
| **App pós-login** | Tema da rota (cores + cartoon + sons via theme__c) | Conteúdo da gamificação |
| **App pré-login / landing** | Verde Rota Viva + âmbar + Baloo 2 | Desejos e resultados do produtor |
| **Landing page** | Real + Cartoon + Verde/Âmbar | Pain → Promise → Proof → CTA |
| **Posts Instagram** | Paleta da rota + Baloo 2 bold | Resultado concreto em 1 frase + imagem do território |
| **Stories** | Card compartilhável gerado pelo app | App gera automaticamente — sem trabalho manual |
| **Cartaz presencial** | Foto real de produtor local + logo MIDR + URL | "Venha ser um dos primeiros de [município]" |
| **WhatsApp (cards de conquista)** | Paleta da rota + nome + conquista | App gera no momento da conquista — produtor compartilha sozinho |

**Regra unificadora:** o verde território + âmbar vivo aparecem em toda comunicação externa. Dentro do app, o tema da rota domina. O produtor nunca vê "Rota Viva" no app depois do login — ele vê "Colmeia Viva" ou "Rio em Movimento".

---

*Documento complementar ao architecture.md v0.4.0 — seções de identidade visual, personagens e landing page.*
