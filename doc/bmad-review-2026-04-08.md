# Review de Produto — Rota Viva
## Sessão de UX + Gamificação — 2026-04-08

**Participantes:** Ricardo Lopes Costa (CTO/Founder), Claude (Arquiteto/Dev)

---

## Contexto

Revisão das telas `/dashboard` e `/profile`, correção do Bottom Nav, e auditoria completa da gamificação com foco em motivação real do usuário.

**Premissa central:** o usuário não deve precisar pensar. Toda tela deve ter uma ação óbvia a fazer a seguir.

---

## 1. Diagnóstico — Problemas atuais

### Bottom Nav (crítico)
- O nav está **duplicado em cada página** como HTML estático, sem nenhum componente compartilhado
- O botão "Perfil" em `/dashboard` e `/trail` não tem `ng-click` — é um botão morto
- Qualquer mudança no nav exige editar 4+ arquivos
- **Fix obrigatório:** transformar em diretiva AngularJS `<bottom-nav active="'home'">` com controller próprio

### `/dashboard` — problemas de UX
- **Botão "Sair" na tela principal**: erro grave de UX. O usuário nunca deve pensar em sair na tela principal. Confunde, intimida, e cria caminho de fuga desnecessário
- **Card de debug visível** (Rota, Perfil, ID): dado de desenvolvimento exposto para o usuário final. Remover
- **Nenhuma ação clara de continuação**: o card "Trilha de Aprendizado" é genérico. Não diz qual é a próxima lição. O usuário tem que navegar para descobrir onde parou — isso exige esforço cognitivo desnecessário
- **Galeria é um card opcional**: deveria ser um convite social, não um item de menu
- **Streak e XP ficam escondidos** em um card secundário, sem destaque visual suficiente

### `/profile` — problemas de UX
- Página vazia demais: só avatar, nome, stats e logout
- Falta estrutura de menu para as funções que o usuário espera encontrar ali (senha, termos, excluir conta)
- Stats (pontos e streak) fazem mais sentido na home/trail do que no perfil — no perfil o usuário quer ver **conquistas**, não apenas números

---

## 2. Estratégia UX — "Avançar sem pensar"

### Referências de sucesso

| App | O usuário abre e... | Ação principal |
|-----|---------------------|----------------|
| **Duolingo** | Vê a trilha com a próxima bolinha piscando | Toca e começa a lição |
| **Instagram** | Vê o feed da comunidade | Rola e consome |
| **Rota Viva** | Deveria ver as duas coisas + saber o que fazer | ? |

### O papel de cada tela

```
/dashboard  → "Central do dia" — o que devo fazer AGORA?
/trail      → "Minha jornada" — onde estou e qual é o próximo passo?
/gallery    → "Minha comunidade" — o que está acontecendo?
/profile    → "Minha conta" — quem sou e minhas configurações
```

O `/dashboard` precisa ser o **Daily Briefing** — uma tela que responde em menos de 2 segundos:
1. Como estou? (streak + XP)
2. O que faço agora? (continuar trilha — próxima lição específica)
3. O que está acontecendo? (preview de 3 posts recentes da galeria)

---

## 3. Redesign do `/dashboard`

### Layout proposto

```
┌────────────────────────────────────┐
│  [Logo rota]  Bom dia, João! 🍯   │  ← header personalizado
├────────────────────────────────────┤
│  🔥 5 dias   ⭐ 1.240 favos       │  ← streak + XP na mesma linha, compacto
├────────────────────────────────────┤
│  ┌──────────────────────────────┐  │
│  │  Continuar Trilha             │  │  ← Card primário, cor forte, grande
│  │  Módulo 2 · Lição 4           │  │
│  │  "Manejo do Apiário"          │  │  ← título da próxima lição específica
│  │                               │  │
│  │  [▶ CONTINUAR]                │  │  ← botão primário, cor da rota
│  └──────────────────────────────┘  │
├────────────────────────────────────┤
│  Nível: Explorador                 │  ← barra de nível compacta
│  [████████████░░░░░] → Apicultor  │
├────────────────────────────────────┤
│  Da Comunidade                     │  ← título da seção galeria
│  ┌──────┐ ┌──────┐ ┌──────┐  →   │  ← 3 fotos miniatura horizontais
│  │ foto │ │ foto │ │ foto │      │  ← toque abre a galeria
│  └──────┘ └──────┘ └──────┘      │
└────────────────────────────────────┘
   [Início]  [Trilha]  [Galeria]  [Perfil]
```

### Regras de comportamento

- **Se o usuário não tem trilha iniciada**: card primário mostra "Começar Trilha" em vez de "Continuar"
- **Se completou todas as lições**: card primário mostra "Trilha concluída! 🎉" com badge e convite para a galeria
- **Streak em risco** (passou das 22h sem atividade): card de streak fica vermelho pulsando com aviso "Sua sequência está em risco!"
- **Preview da galeria**: se sem conexão, mostra cache; se vazio, mostra ilustração "Seja o primeiro"

---

## 4. Redesign do `/profile`

### Layout proposto

```
┌────────────────────────────────────┐
│              [Avatar]              │  ← toque para trocar foto
│           João Silva               │  ← toque para editar nome
│           Rota do Mel              │
├────────────────────────────────────┤
│  🏆 1.240 pts  🔥 5 dias  ⭐ Nível 3  │  ← stats compactos
├────────────────────────────────────┤
│  [Badge 1] [Badge 2] [Badge 3]     │  ← conquistas (desbloqueadas + bloqueadas em cinza)
│  [Badge 4] [Badge 5] [Badge ?]     │
├────────────────────────────────────┤
│  ─── Conta ─────────────────────  │
│  👤  Editar perfil            >   │
│  🔒  Alterar senha            >   │
│  📄  Termos de uso            >   │
│  🔐  Política de privacidade  >   │
│  ─── Zona de perigo ──────────── │
│  🗑️  Excluir conta            >   │
│  🚪  Sair                     >   │
└────────────────────────────────────┘
```

### Notas de implementação

- Badges desbloqueados: cor cheia + animação suave ao abrir a tela
- Badges bloqueados: silhueta cinza com cadeado — criam antecipação
- "Alterar senha" e "Excluir conta" abrem modais inline, não navegam para nova página
- Itens do menu são `<button>` fullwidth estilo lista, não cards

---

## 5. Bottom Nav como diretiva

### Problema
4 páginas com nav duplicado em HTML + funções `goHome`, `goTrail`, `goGallery`, `goPerfil` repetidas em cada controller.

### Solução: diretiva `<bottom-nav>`

```html
<!-- uso em cada página -->
<bottom-nav active="'home'"></bottom-nav>
<bottom-nav active="'trail'"></bottom-nav>
<bottom-nav active="'gallery'"></bottom-nav>
<bottom-nav active="'profile'"></bottom-nav>
```

```js
// components/bottom-nav/bottom-nav.js
angular.module('rotaViva').directive('bottomNav', function($location) {
    return {
        restrict: 'E',
        scope: { active: '@' },
        templateUrl: 'components/bottom-nav/bottom-nav.html',
        link: function(scope) {
            scope.go = function(path) { $location.path(path); };
        }
    };
});
```

Benefícios:
- Mudança em 1 arquivo reflete em todas as páginas
- `active` define qual tab fica destacada
- Elimina 4×4 = 16 funções de navegação duplicadas nos controllers

---

## 6. Auditoria de Gamificação

### O que já existe ✅

| Elemento | Status | Qualidade |
|----------|--------|-----------|
| XP (total_points) | ✅ | Funcional mas sem feedback visual ao ganhar |
| Streak diário | ✅ | Funcional mas sem animação |
| Níveis (level_progress) | ✅ | Mostrado mas sem celebração de subida |
| Top users na Galeria | ✅ | Substitui leaderboard punitivo — correto |
| Like/Unlike | ✅ | 1 like por usuário — correto |
| Comentários | ✅ | Funcional |
| Baú (chest) | ✅ | Tipo de lição existente |
| Tipos DIY/Essay | ✅ | Implementados na trilha |

### O que falta ❌ — priorizado por impacto

#### Prioridade 1 — Feedback imediato (alto impacto, baixo esforço)

| Elemento | Descrição | Implementação |
|----------|-----------|---------------|
| **Vibração** | Pulso curto ao acertar resposta no quiz; padrão duplo ao errar | `navigator.vibrate([80])` / `navigator.vibrate([60, 40, 60])` |
| **Som** | 3 sons: acerto (cheerful beep), erro (soft buzz), level-up (fanfare) | Web Audio API, arquivos .mp3 leves (<30KB cada) |
| **Animação XP** | "+X favos" flutuando e sumindo ao completar lição | CSS keyframe `float-up + fade-out` |
| **Tela de celebração** | Após completar lição: confetti + XP ganho + botão "Próxima" | Nova tela/modal reutilizável |

#### Prioridade 2 — Progressão (médio impacto, médio esforço)

| Elemento | Descrição | Implementação |
|----------|-----------|---------------|
| **Level-up modal** | Ao subir de nível: animação de troféu, novo título, compartilhar | Detectar mudança de nível ao retornar do quiz |
| **Streak milestone** | Celebração em 7, 30, 60 dias de sequência | Badge especial + modal |
| **Badges/conquistas** | Grid no perfil: primeira lição, 10 lições, primeira foto, etc. | `GET /v3/achievement` já disponível no Funifier |
| **Streak em risco** | Card vermelho no dashboard após 22h sem atividade | Lógica baseada no log de ações mais recente |

#### Prioridade 3 — Engajamento social (alto impacto, alto esforço)

| Elemento | Descrição | Implementação |
|----------|-----------|---------------|
| **Notificação de like** | "João curtiu sua publicação" | Push notification via service worker |
| **Challenge semanal** | Missão coletiva: "Toda a comunidade do Mel posta 50 fotos esta semana" | Endpoint customizado Funifier |
| **Loja de recompensas** | Trocar favos/pontos por acesso antecipado a módulos, filtros de foto | Feature nova — requer decisão de produto |
| **Certificado digital** | PDF gerado ao concluir a trilha completa | Backend Funifier + PDF.js |

#### Prioridade 4 — Funcionalidades futuras (baixo impacto imediato)

| Elemento | Descrição |
|----------|-----------|
| Modo offline completo | IndexedDB para quizzes e DIY offline |
| Ranking por município | Leaderboard semanal sem exposição de número |
| Missão de multiplicador | Onboarding de novos produtores com CPO points |

---

## 7. Plano de Implementação Priorizado

### Sprint 1 — Correções estruturais ✅ CONCLUÍDA (2026-04-08)

| # | Tarefa | Status |
|---|--------|--------|
| S1.1 | Diretiva `<bottom-nav>` — Perfil funciona em todas as páginas | ✅ |
| S1.2 | Dashboard redesign: card "CONTINUAR" com próxima lição específica | ✅ |
| S1.3 | Dashboard: removido botão Sair + card de debug | ✅ |
| S1.4 | Dashboard: preview de 3 posts da comunidade | ✅ |
| S1.5 | Profile: menu iOS Settings (editar nome, termos, privacidade, sair, excluir conta) | ✅ |
| S1.6 | Profile: conquistas via `challenge_progress` do player status | ✅ |

**Correções adicionais (2026-04-08):**
- Modal de termos/privacidade: bug de child scope do `ng-if` corrigido com `closeModal()` no controller
- Conquistas: não usa mais `GET /v3/achievement` — usa `status.challenge_progress` (já carregado)
- Excluir conta: implementado com modal de confirmação + `DELETE /v3/player/{id}` no AuthService
- Streak em risco: banner pulsante no dashboard depois das 20h sem atividade

---

### Sprint 2 — Feedback sensorial e celebração

**Versão: 1.5.0 | Data prevista: semana de 2026-04-14**

#### S2.1 — Vibração no quiz (Baixo esforço)

```js
// quiz.js — ao acertar
if (navigator.vibrate) navigator.vibrate(80);

// quiz.js — ao errar
if (navigator.vibrate) navigator.vibrate([60, 40, 60]);
```

Arquivo: `pages/quiz/quiz.js`

#### S2.2 — Sons: acerto, erro, level-up (Médio esforço)

**Arquivos de áudio disponíveis:**
| Arquivo | Uso |
|---------|-----|
| `app/audio/beep.mp3` | Resposta correta |
| `app/audio/wrong.mp3` | Resposta errada (buscado no freesound.org) |
| `app/audio/magic-sound.mp3` | Level-up / celebração |

**Implementação — `services/sound.js`:**

```js
angular.module('rotaViva').factory('SoundService', function() {
    var sounds = {};
    var enabled = localStorage.getItem('rv_sound') !== 'off';

    function preload(name, src) {
        var audio = new Audio(src);
        audio.preload = 'auto';
        sounds[name] = audio;
    }

    preload('correct', 'audio/beep.mp3');
    preload('wrong',   'audio/wrong.mp3');
    preload('levelup', 'audio/magic-sound.mp3');

    return {
        play: function(name) {
            if (!enabled || !sounds[name]) return;
            sounds[name].currentTime = 0;
            sounds[name].play().catch(function() {});
        },
        toggle: function() {
            enabled = !enabled;
            localStorage.setItem('rv_sound', enabled ? 'on' : 'off');
            return enabled;
        },
        isEnabled: function() { return enabled; }
    };
});
```

Sons por padrão **ligados** (D4 decidido: default ON). Toggle disponível no perfil futuramente.

#### S2.3 — Animação "+X favos" flutuante (Médio esforço)

CSS `@keyframes` injetado dinamicamente no DOM pós-quiz:

```css
@keyframes xp-float {
    0%   { opacity: 1; transform: translateY(0) scale(1); }
    60%  { opacity: 1; transform: translateY(-60px) scale(1.15); }
    100% { opacity: 0; transform: translateY(-90px) scale(0.9); }
}

.xp-toast {
    position: fixed;
    bottom: 120px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--color-primary);
    color: #fff;
    font-weight: 700;
    font-size: 22px;
    padding: 10px 24px;
    border-radius: 40px;
    z-index: 500;
    animation: xp-float 1.8s ease-out forwards;
    pointer-events: none;
}
```

Disparo em `quiz.js` depois de registrar pontuação:

```js
function showXpToast(points) {
    var el = document.createElement('div');
    el.className = 'xp-toast';
    el.textContent = '+' + points + ' favos';
    document.body.appendChild(el);
    setTimeout(function() { el.remove(); }, 1900);
}
```

#### S2.4 — Tela de celebração pós-lição (Alto esforço)

**Tecnologia de animação: Lottie**

O Duolingo usa Lottie (formato JSON, baseado no After Effects/Bodymovin). É a tecnologia certa para animações com fundo transparente.

**Por que Lottie e não Freepik/GIF:**
| | GIF/Freepik | Lottie |
|---|---|---|
| Fundo transparente | ❌ | ✅ |
| Escala sem pixelar | ❌ | ✅ (vetorial) |
| Tamanho de arquivo | Grande | Pequeno (JSON) |
| Personagens animados | Limitado | ✅ Nativo |

**Biblioteca:** `lottie-web` via CDN (60KB gzip)

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.12.2/lottie.min.js"></script>
```

**Animações gratuitas em [LottieFiles.com](https://lottiefiles.com):**
- Confete de celebração → `animations/confetti.json`
- Troféu animado → `animations/trophy.json`
- Check/sucesso → `animations/success.json`

**Uso:** baixar `.json` do LottieFiles e colocar em `app/animations/`

**Implementação — `pages/celebration/` (nova página):**

```
/quiz/{id} → finaliza → /celebration?xp=120&lesson=Manejo+do+Apiário
```

Tela temporária (3s auto-dismiss ou botão "Próxima lição"):
```
┌────────────────────────────────────┐
│        [Lottie confetti]           │
│     🎉 Lição concluída!            │
│    Manejo do Apiário               │
│    +120 favos                      │
│                                    │
│    [████████░░░░] 68% do módulo   │
│                                    │
│    [PRÓXIMA LIÇÃO]                 │
└────────────────────────────────────┘
```

#### S2.5 — Streak em risco no dashboard ✅ JÁ IMPLEMENTADO

Banner vermelho pulsante aparece depois das 20h quando não há atividade no dia.

---

### Sprint 2 — Plano de animações dos personagens

**Situação atual:** imagens estáticas PNG em `img/characters/{rota}/trail/{1..N}.png`

**Abordagem recomendada (2 fases):**

**Fase A — Sprint 2 (CSS animations, rápido):**
Animar os PNGs existentes com CSS puro. Nenhum ativo novo necessário.

```css
/* Personagem idle na trilha */
@keyframes char-idle { 
    0%, 100% { transform: translateY(0); } 
    50% { transform: translateY(-8px); } 
}

/* Celebração pós-lição */
@keyframes char-celebrate {
    0%, 100% { transform: rotate(0deg) scale(1); }
    25% { transform: rotate(-8deg) scale(1.1); }
    75% { transform: rotate(8deg) scale(1.1); }
}
```

**Fase B — Sprint 3/4 (Lottie characters, médio prazo):**
Recriar personagens como vetores e exportar como Lottie JSON. Opções:
1. **LottieFiles Editor** — editor online, importa SVG, adiciona animação básica
2. **Adobe After Effects + Bodymovin** — resultado profissional, igual ao Duolingo
3. **Rive** (rive.app) — alternativa moderna ao Lottie, editor online, exporta para web

**Decisão necessária (D6):** Contratar designer para criar Lottie dos personagens ou usar CSS animations e avançar com as features?

---

### Sprint 3 — Gamificação avançada

| # | Tarefa | Esforço |
|---|--------|---------|
| S3.1 | Level-up modal com animação Lottie | Alto |
| S3.2 | Streak milestone (7, 30, 60 dias) com badge especial | Médio |
| S3.3 | Lottie characters na trilha (requer designer) | Alto |

---

## 8. Decisões a tomar (Ricardo)

| # | Questão | Impacto |
|---|---------|---------|
| D1 | A "loja de recompensas" faz sentido no MVP ou é feature futura? | Alto |
| D2 | O certificado digital é emitido pelo app ou pela FADEX externamente? | Alto |
| D3 | O Dashboard deve buscar a próxima lição da trilha na carga inicial (1 API call extra) ou guardar em cache? | Médio |
| D4 | Sons: habilitar por padrão ou deixar opt-in nas configurações do perfil? | Baixo |
| D5 | O ranking por município retorna? Em qual formato e onde aparece? | Médio |
| D6 | Personagens animados: CSS animations (rápido, visual básico) ou Lottie com designer (médio prazo, visual profissional)? | Alto |

---

## Resumo executivo

**O que está errado hoje:**
- Bottom nav quebrado em 3 das 4 páginas
- Dashboard não responde "o que faço agora?" — exige do usuário descobrir onde parou
- Profile é uma página quase vazia sem utilidade real
- Gamificação tem estrutura (XP, streak, níveis) mas sem feedback sensorial (som, vibração, animação)

**O que precisa acontecer:**
1. Diretiva de nav compartilhada (correção técnica urgente)
2. Dashboard vira "painel do dia" com CTA de continuar trilha como ação dominante
3. Profile vira "central de conta" com conquistas + menu de configurações
4. Feedback sensorial (vibração + som + animação) nos momentos de acerto/conclusão — esse é o maior gap de gamificação hoje

**Princípio orientador:**
> Toda tela deve ter uma ação óbvia. O usuário nunca deve ficar parado sem saber o que fazer a seguir.

---

*Documento gerado em sessão de review — 2026-04-08*
