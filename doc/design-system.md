# Design System — Rota Viva

**Versão:** 0.1.0
**Data:** 2026-03-26
**Autor:** Jarvis

---

## 1. Princípio Central

> **Um app, muitos mundos.**

O Rota Viva é um único codebase PWA que atende todas as rotas. A identidade visual de cada rota é 100% configurável via Funifier Studio — cores, imagens, textos, sons. Nenhum elemento visual é hardcoded para uma rota específica.

---

## 2. Arquitetura de Temas

### 2.1 Quando cada tema se aplica

| Contexto | Tema | Fonte |
|----------|------|-------|
| Tela de Login / Cadastro | **Neutro** (verde natureza) | Hardcoded no CSS base |
| Seleção de perfil no cadastro | Cards com preview de cada rota | `rota_info` (Central) |
| Após login (toda a experiência) | **Tema da rota** | `theme__c` (gamificação da rota) |

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

```json
{
    "_id": "default",
    "version": "1.0.0",

    "colors": {
        "primary": "#F5A623",
        "primary_dark": "#8B6914",
        "primary_light": "#FFD98E",
        "accent": "#FFD54F",
        "background": "#1A1208",
        "background_gradient": "linear-gradient(180deg, #1A1208 0%, #2C1E0A 100%)",
        "card": "rgba(60, 40, 10, 0.85)",
        "card_border": "rgba(245, 166, 35, 0.25)",
        "input_bg": "rgba(255, 255, 255, 0.08)",
        "text": "#FFFFFF",
        "text_muted": "rgba(255, 255, 255, 0.55)",
        "text_faint": "rgba(255, 255, 255, 0.35)",
        "success": "#4CAF50",
        "error": "#FF5252",
        "warning": "#FF9800"
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

### 3.1 Exemplo: Rota da Pesca

```json
{
    "_id": "default",
    "version": "1.0.0",

    "colors": {
        "primary": "#1E88E5",
        "primary_dark": "#0D47A1",
        "primary_light": "#64B5F6",
        "accent": "#00BCD4",
        "background": "#0A1929",
        "background_gradient": "linear-gradient(180deg, #0A1929 0%, #0D2137 100%)",
        "card": "rgba(13, 37, 63, 0.85)",
        "card_border": "rgba(30, 136, 229, 0.25)",
        "input_bg": "rgba(255, 255, 255, 0.08)",
        "text": "#FFFFFF",
        "text_muted": "rgba(255, 255, 255, 0.55)",
        "text_faint": "rgba(255, 255, 255, 0.35)",
        "success": "#4CAF50",
        "error": "#FF5252",
        "warning": "#FF9800"
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

### 4.1 Variáveis base (tema neutro — pré-login)

```css
:root {
    /* Cores */
    --color-primary: #4CAF50;
    --color-primary-dark: #1a5632;
    --color-primary-light: #81C784;
    --color-accent: #FFD54F;
    --color-bg: #0a1a0f;
    --color-bg-gradient: linear-gradient(180deg, #0a1a0f 0%, #122419 100%);
    --color-card: rgba(26, 56, 42, 0.85);
    --color-card-border: rgba(76, 175, 80, 0.25);
    --color-input-bg: rgba(255, 255, 255, 0.08);
    --color-text: #FFFFFF;
    --color-text-muted: rgba(255, 255, 255, 0.55);
    --color-text-faint: rgba(255, 255, 255, 0.35);
    --color-success: #4CAF50;
    --color-error: #FF5252;
    --color-warning: #FF9800;

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

    // Background pattern
    if (theme.images && theme.images.background_pattern) {
        root.style.setProperty('--img-background', 'url(' + theme.images.background_pattern + ')');
    }
}
```

### 4.3 Regra de ouro

> **Nenhum componente deve referenciar uma cor literal.** Sempre usar `var(--color-*)`.
>
> ❌ `color: #F5A623;`
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
| Text | Texto principal (sempre branco) | `--color-text` |
| Text Muted | Texto secundário, labels | `--color-text-muted` |
| Text Faint | Placeholders, hints | `--color-text-faint` |
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

- **Emojis nativos** para a maioria dos elementos (🎯 🏆 📊 📝 🔔)
- **Emoji temático** da rota via `meta.emoji` (🐝 🐟)
- Zero dependência de icon fonts — funciona offline sem CDN

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
- Texto branco sobre fundos escuros é o padrão — cada tema precisa garantir fundo suficientemente escuro
- Botão primário: texto branco sobre `primary` — ao configurar um tema, validar contraste

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

*Documento complementar ao architecture.md v0.3.0 — seção sobre theming.*
