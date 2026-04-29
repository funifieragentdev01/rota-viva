# Rota Viva — Roadmap e Planejamento
**Criado:** 2026-04-16  
**Reunião com o secretário:** 2026-04-22 (em 6 dias)

---

## ÍNDICE

- [Status do backlog anterior](#status-do-backlog-anterior-bmad-review-2026-04-12)
- [A. Créditos e Financiamentos](#a-créditos-e-financiamentos--pedido-do-secretário)
- [FEITO - B. Família no Campo — Pai e Filho](#b-família-no-campo--pai-e-filho--pedido-do-secretário)
- [M. Desafio em Grupo / Família](#m-desafio-em-grupofamília)
- [FEITO - C. Modal de Rota na Tela de Login](#c-modal-de-rota-na-tela-de-login)
- [FEITO - D. Fix: Lição DIY — Concluir sem Aceite](#d-fix-lição-diy--concluir-sem-aceite)
- [E. Trilhas Avançadas — Desbloqueio por Competência](#e-trilhas-avançadas--desbloqueio-por-competência)
- [FEITO - F1. Posts de Imagem Enriquecidos](#f1-posts-de-imagem-enriquecidos)
- [F2. Vídeo no Feed](#f2-vídeo-no-feed)
- [FEITO - G. Hashtags na Galeria](#g-hashtags-na-galeria)
- [FEITO - I. Marcação de Pessoas nas Publicações](#i-marcação-de-pessoas-nas-publicações)
- [J. Exemplos de Desafios DIY Família + Escuta Ativa](#j-exemplos-de-desafios-diy-família--perguntas-de-escuta-ativa)
- [K. Perfil Instagram Rota Viva](#k-perfil-instagram-rota-viva)
- [L. História Interativa — Novo Tipo de Lição](#l-história-interativa--novo-tipo-de-lição)
- [H. Auditoria de Gamificação](#h-auditoria-de-gamificação)
- [Análise Octalysis — Diagnóstico](#análise-octalysis--diagnóstico-atual)
- [Evento de Lançamento Presencial](#evento-de-lançamento-presencial)
- [Horizontes de Implementação](#horizontes-de-implementação)

---

## Status do Backlog Anterior (`bmad-review-2026-04-12`)

Itens herdados — status atualizado:

| # | Item | Status |
|---|------|--------|
| 1 | Termos e Política na Gamificação Central | 🔜 Horizonte 2 |
| 2 | Baú (chest) — Visual e Fluxo Completo | 🔜 Horizonte 1 |
| 3 | Topo da Galeria Estilo Stories | 🔜 Horizonte 1 (ver item G) |
| 4 | Alterar Senha (logado) | 🔜 Horizonte 2 |
| 5 | Entrar Sem Senha — OTP via WhatsApp | 🔜 Horizonte 3 |
| 6 | Loja de Dicas | 🔜 Horizonte 2 (depende do baú) |
| 7 | PWA — Progressive Web App | 🔜 Horizonte 3 |
| 8 | Cartão do Produtor | 🔜 Horizonte 1 (integrado ao item A) |
| 9 | Cache da Trilha | 🔜 Horizonte 2 |
| 10 | Scroll Infinito do Feed (Galeria) | 🔜 Horizonte 2 |
| 11 | "Programas para você" | ✅ Implementado (2026-04-13) |

---

## A. Créditos e Financiamentos — Pedido do Secretário

### Contexto

O secretário quer que o app informe os produtores sobre as linhas de crédito disponíveis, os operadores por região e os mutirões com data. Há duas modalidades principais:

| Modalidade | Origem | Valor máximo |
|-----------|--------|-------------|
| PRONAF A | Fundo de Desenvolvimento Nacional | R$ 50.000 |
| PRONAF B | Fundo de Desenvolvimento Nacional | R$ 35.000 |
| Microcrédito MIDR | Linha própria do ministério | R$ 35.000 |

Operadores regionais variam por estado: no Norte opera o Banco da Amazônia; no Nordeste o Banco do Nordeste (BNB). Cada operador realiza mutirões periódicos para triagem e aprovação de crédito.

### Decisão estratégica: Cartão do Produtor como chave de acesso

O acesso à seção de créditos **só é desbloqueado após a emissão do Cartão do Produtor**. Isso cria dois benefícios simultâneos:
1. O cartão ganha valor instrumental real — não é apenas identidade, é uma chave para políticas públicas
2. O produtor é motivado a completar o perfil para acessar benefícios concretos

O secretário aprovou explicitamente o conceito do Cartão do Produtor Rota Viva.

### Índice Rota Viva — Fator de Avaliação de Crédito

**Funcionalidade para apresentar na reunião (proposta ao MIDR):**

A pontuação do produtor no app Rota Viva compõe um **Índice Rota Viva** que influencia a prioridade na avaliação de crédito pelos operadores.

```
Composição do Índice (0–100):
  ✅ Lições concluídas na trilha     40%
  ✅ Evidências registradas no Diário 30%
  ✅ Participação na Galeria          20%
  ✅ Família cadastrada no programa   10%
```

A bônus de 10% para família é honesto: a família produz junta, e o app registra isso via mídias reais de contas distintas — não é declaração simples.

### Novas coleções necessárias

**`modalidade_credito__c`**
```json
{
  "_id": "pronaf_b",
  "nome": "PRONAF B",
  "descricao": "Fundo de Desenvolvimento Nacional — grupo B",
  "valor_max": 35000,
  "operadores": ["bnb", "banco_amazonia"],
  "routes": ["mel", "pesca"],
  "icone": "🌱",
  "active": true
}
```

**`operador_credito__c`**
```json
{
  "_id": "banco_amazonia",
  "nome": "Banco da Amazônia",
  "estados": ["PA", "AM", "AP", "RO", "RR", "AC", "TO"],
  "whatsapp": "...",
  "site": "..."
}
```

**`mutirao__c`**
```json
{
  "_id": "mutirao_2026_05_pi",
  "titulo": "Mutirão PRONAF — Piauí",
  "data": { "$date": "2026-05-15T08:00:00Z" },
  "local": "Floriano, PI",
  "route": "mel",
  "operador": "bnb",
  "modalidades": ["pronaf_a", "pronaf_b"],
  "vagas": 50,
  "active": true
}
```

**`mutirao_inscricao__c`** — gerado quando produtor toca "Quero participar":
```json
{
  "player": "CPF",
  "player_name": "Nome",
  "mutirao": "mutirao_2026_05_pi",
  "indice_rota_viva": 72,
  "cartao_emitido": true,
  "familia_vinculada": true,
  "status": "inscrito",
  "created": { "$date": "..." }
}
```

### UX — Fluxo completo no Perfil

**Estado 1: Cartão não emitido**
```
PERFIL → seção "Programas para você"
┌─────────────────────────────────────────┐
│  🔒  Créditos e Mutirões                │
│                                         │
│  "Complete o Cartão do Produtor         │
│   para descobrir quais créditos e       │
│   mutirões estão disponíveis para você" │
│                                         │
│  ████░░░░░░  Cartão 40% completo        │
│  Falta: município, cooperativa          │
│  [Completar agora]                      │
└─────────────────────────────────────────┘
```

**Estado 2: Cartão emitido — primeira abertura**
```
┌─────────────────────────────────────────┐
│  🔓 Desbloqueado: Créditos para você!   │
│                                         │
│  "Seu Cartão do Produtor liberou        │
│   acesso aos programas de crédito       │
│   do governo feitos para você."         │
│                                         │
│  [Descobrir meus créditos →]            │
└─────────────────────────────────────────┘
```

**Diagnóstico de elegibilidade (3 perguntas)**
```
PASSO 1/3
Você já tem o CAF (Cadastro de Agricultor Familiar)?
  ○ Sim, já tenho
  ○ Não tenho ainda
  ○ Não sei o que é

PASSO 2/3
Você já acessou alguma linha do PRONAF antes?
  ○ Nunca acessei
  ○ Sim, mas faz mais de 2 anos
  ○ Sim, recentemente

PASSO 3/3
Em qual município você produz?
  [Select com municípios das rotas]

→ [Ver meus créditos]
```

**Resultado: cards personalizados de crédito**
```
🎯 Créditos disponíveis para você

┌────────────────────────────────────────┐
│ 🌱 PRONAF B · Até R$ 35.000            │
│ Operador: Banco do Nordeste (Floriano) │
│                                        │
│ 📅 Mutirão: 15/maio · ⏳ 12 dias      │
│    32 vagas restantes                  │
│                                        │
│ ⭐ Índice Rota Viva: 72/100            │
│    Sua pontuação aumenta sua           │
│    prioridade na avaliação             │
│                                        │
│ [Quero participar do mutirão]          │
│ [Falar com agente]                     │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ 💧 Microcrédito MIDR · Até R$ 35.000   │
│ Linha própria do Ministério            │
│ [Falar com agente]                     │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ 🔒 PRONAF A · Até R$ 50.000            │
│ Requer CAF. Você ainda não tem.        │
│ [Saiba como tirar seu CAF →]           │
└────────────────────────────────────────┘
```

**Bônus família no crédito (quando família vinculada):**
```
┌────────────────────────────────────────┐
│ 👨‍👦 Bônus Família                       │
│                                        │
│ Sua família está no programa!          │
│ Pedidos feitos por famílias de         │
│ produtores têm prioridade adicional    │
│ na avaliação de crédito.               │
└────────────────────────────────────────┘
```

### Divulgação de mutirões na Galeria

Posts do perfil oficial MIDR (badge verificado ✓) divulgam mutirões no feed:

```
[Post oficial MIDR ✓]
[Imagem do mutirão / card visual do evento]

📅 MUTIRÃO PRONAF — PIAUÍ
15 de maio · Floriano, PI
Banco do Nordeste + MIDR

Produtores da Rota do Mel podem acessar
até R$ 35.000 em crédito rural.
32 vagas disponíveis.

#pronaf #creditoral #rotadoMel #mutirao

[Me inscrever]  ← cria mutirao_inscricao__c
                   (exige Cartão do Produtor)
```

### Campo estado e dados de localização no cadastro

Para cruzar o produtor com o operador de crédito correto da sua região, o cadastro precisa incluir o campo **estado**. Avaliação dos campos:

| Campo | Obrigatório | Justificativa |
|-------|-------------|---------------|
| `estado` | **Sim** | Determina qual operador financeiro atende o produtor (Banco da Amazônia no Norte, BNB no Nordeste) |
| `municipio` | **Sim** | Já usado para o leaderboard por município e para mostrar mutirões próximos |
| `endereco_completo` | Não (V2) | Endereço completo não é padrão para produtores rurais (áreas sem CEP definido). Desnecessário para o MVP — estado + município é suficiente para o roteamento de crédito |
| `zona_rural` | Opcional | Flag booleana `extra.zona_rural: true` — pode ser útil para elegibilidade a programas específicos |

**Campos a adicionar no cadastro:**
- `estado` — select com os 26 estados + DF, pré-filtrado para AP e PI (rotas ativas), mas aceita todos
- `municipio` — select dependente do estado selecionado

**Mapeamento `estado` → `operador_credito__c`** (na lógica do diagnóstico de crédito):
```
Norte (AC, AM, AP, PA, RO, RR, TO) → Banco da Amazônia
Nordeste (AL, BA, CE, MA, PB, PE, PI, RN, SE)  → Banco do Nordeste (BNB)
Centro-Oeste, Sudeste, Sul → Banco do Brasil / outros (mapear conforme expansão)
```

**Atualização no fluxo de cadastro:**
- Após o campo `perfil` (apicultor/pescador): adicionar `estado` (select) → `municipio` (select dependente)
- Ambos obrigatórios
- Salvos em `extra.estado` e `extra.municipio` no player (Central e Rota)

### O que implementar

- [ ] Campo `estado` (obrigatório) e `municipio` (obrigatório) no formulário de cadastro
- [ ] Select de município dependente do estado selecionado
- [ ] Salvar `extra.estado` e `extra.municipio` no player na Central e na Rota
- [ ] Lógica de roteamento `estado → operador_credito__c` no diagnóstico de crédito
- [ ] Coleções `modalidade_credito__c`, `operador_credito__c`, `mutirao__c`, `mutirao_inscricao__c` no Studio
- [ ] Seção "Créditos" no Perfil — bloqueada sem Cartão emitido
- [ ] Diagnóstico de elegibilidade: 3 perguntas + lógica de filtro
- [ ] Cards personalizados de crédito por resultado do diagnóstico
- [ ] Card de Mutirão com data, vagas e contagem regressiva
- [ ] Índice Rota Viva: cálculo e exibição no card de crédito
- [ ] Bônus família no card (quando `familia_vinculo__c` ativo)
- [ ] CTA "Me inscrever" em posts de mutirão na galeria (exige cartão)
- [ ] Custom page Studio "Inscrições Mutirão" para gestão dos inscritos

---

## FEITO - B. Família no Campo — Pai e Filho — Pedido do Secretário

### Contexto

O secretário quer ver, na próxima reunião, como o app trata a fixação de jovens no campo por meio de desafios intergeracionais. Ele pediu especificamente: ícones de pai e filho trabalhando juntos, desafios no Diário (DIY com fotos), e um módulo ou seção que trate dessas ações.

### Princípio de design

A mecânica não cria um menu separado — ela está integrada nos três menus existentes: **Trilha**, **Galeria** e **Perfil**. O pai não precisa "achar" onde está o módulo família — ele aparece naturalmente no caminho. Não há novo tipo de lição: tudo usa o DIY_PROJECT existente, enriquecido com configuração de tag pelo administrador.

### 1. Imagens de celebração em todas as conclusões de lição

**Rename:** `img/characters/{rota}/family/` → `img/characters/{rota}/celebration/`

Toda conclusão de quiz (qualquer tipo: vídeo, quiz, DIY, Escuta Ativa) exibe na tela de fim:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[confetti]

[imagem aleatória de /celebration]
  — sorteia 1.png ou 2.png a cada conclusão

[toast de XP: +N XP]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Não há tela separada — a imagem aparece na mesma tela de fim de quiz que já existe, entre o confetti e o toast de XP.

**Imagens disponíveis (após rename):**

| Arquivo | Rota | Cena |
|---------|------|------|
| `img/characters/mel/celebration/1.png` | Mel | Adulto apicultor + criança abelha dando high five |
| `img/characters/mel/celebration/2.png` | Mel | 2 adultos + 2 crianças em círculo com mãos juntas |
| `img/characters/pesca/celebration/1.png` | Pesca | Pescador adulto + criança dando high five |
| `img/characters/pesca/celebration/2.png` | Pesca | 2 adultos + 2 crianças em círculo |

### 2. Tag automática via folder_content.extra.tag

O administrador configura o campo `extra.tag` no `folder_content` da lição no Studio. O frontend lê essa tag no mesmo request que já busca o `folder_content` (quiz.js linha 248) e a inclui automaticamente no post publicado na Galeria ao concluir um DIY.

```
Exemplo de configuração Studio:
  folder_content.extra.tag = "familia"

Resultado no post:
  post__c.tags = ["familia"]
```

Funciona para qualquer tag que o admin queira usar: `"familia"`, `"mutirao"`, `"colheita"`, etc. Sem código novo para cada caso.

**Campos adicionais em `post__c`:**
```json
{
  "tags": ["familia"],
  "mentions": [],
  "cta_button": null
}
```

### 3. Galeria: slot #familia fixo no Stories bar

```
Stories bar no topo da Galeria:
┌──────────────────────────────────────────────────────┐
│ [MIDR]  [FADEX]  [👨‍👦Família]  [ZéMel]  [MariaPesca] │
│  fixo    fixo     FIXO          dinâmicos             │
└──────────────────────────────────────────────────────┘
```

- Ícone: `celebration/1.png` da rota atual
- Label: "Família"
- Borda colorida sempre ativa — nunca marcado como "visto"
- Ao tocar: abre feed filtrado por `tags: "familia"`
- Posição: terceiro slot, sempre após MIDR e FADEX

### 4. Perfil: seção "Minha Família no Rota Viva"

Nova seção entre "Meus Badges" e "Programas para você":

```
┌─────────────────────────────────────────┐
│  👨‍👦  Minha Família no Rota Viva         │
│                                         │
│  "Convide um familiar para entrar no    │
│   Rota Viva e aprendam juntos."          │
│                                         │
│  [Convidar familiar por link]           │
└─────────────────────────────────────────┘
```

Link de convite gerado com `familia_ref=CPF_do_usuário&rota=mel` para rastrear a origem do cadastro.

### O que implementar

- [ ] Renomear pasta `img/characters/mel/family/` → `img/characters/mel/celebration/`
- [ ] Renomear pasta `img/characters/pesca/family/` → `img/characters/pesca/celebration/`
- [ ] Atualizar todas as referências a `family/` no código para `celebration/`
- [ ] Tela de fim de quiz: sortear e exibir imagem aleatória de `/celebration` junto ao confetti e toast XP
- [ ] `quiz.js`: capturar `extra.tag` do `folder_content` response (hoje só guarda `_id`)
- [ ] `publishDiario()`: incluir `tags: [tag]` no post quando tag estiver presente
- [ ] Slot #familia fixo no Stories bar da Galeria
- [ ] Feed filtrado por `tags: "familia"` ao tocar no slot
- [ ] Seção "Minha Família" no Perfil com link de convite
- [ ] Custom page Studio "Família no Rota Viva" para o secretário (posts com tag familia, lições DIY com tag familia configurada)

---

## C. Modal de Rota na Tela de Login

### Problema

A primeira tela que o usuário vê é o login. Se o tema da rota não estiver em cache (`rv_theme_*` no localStorage), a tela de login aparece sem identidade visual — sem cor, sem nome de rota, sem contexto.

### Solução

```
Abre app
  → tem rv_theme_* no localStorage?
     SIM → aplica tema → tela de login normal (comportamento atual)
     NÃO → Modal "Quem é você?" ANTES do login
```

**Modal "Quem é você?":**
```
┌─────────────────────────────────────────┐
│  Bem-vindo ao Rota Viva                 │
│  Programa do MIDR                       │
│                                         │
│  ┌───────────────┐  ┌───────────────┐  │
│  │  🐝            │  │  🐟            │  │
│  │  Sou           │  │  Sou           │  │
│  │  Apicultor     │  │  Pescador      │  │
│  │  Rota do Mel   │  │  Pesca Artesanal│ │
│  │  Piauí         │  │  Amapá         │  │
│  └───────────────┘  └───────────────┘  │
└─────────────────────────────────────────┘
```

- Fundo e cores iguais ao `/home` para as duas opções
- Ao escolher: carrega o tema da rota (`rv_theme_*`) → tela de login com identidade visual
- Modal usa os mesmos dados que já existem em `rota__c` — sem dependência nova

### O que implementar

- [ ] Verificação de `rv_theme_*` no localStorage ao inicializar o app
- [ ] Modal de seleção de rota (igual ao `/home`) antes do formulário de login
- [ ] Ao selecionar rota: chamar endpoint `rota_info` para carregar e cachear o tema antes de mostrar o login

---

## D. Fix: Lição DIY — Concluir sem Aceite

### Problema

Na lição do tipo DIY, o botão "Concluir" só fica habilitado se o usuário marcar o aceite. O aceite não deveria bloquear a conclusão — ele é apenas uma indicação de se o usuário quer publicar na galeria ou não.

### Correção

- Desacoplar o botão "Concluir" da marcação do aceite
- O aceite passa a ser um toggle opcional: "Publicar no feed da Galeria" (padrão: desmarcado)
- Ao concluir sem marcar: lição é registrada, XP concedido, post **não** enviado para a galeria
- Ao concluir com aceite marcado: mesmo comportamento + post enviado para a galeria

### O que implementar

- [ ] Remover validação que bloqueia "Concluir" se aceite não marcado
- [ ] Reposicionar o toggle de aceite como opção de publicação, não como pré-requisito

---

## E. Trilhas Avançadas — Desbloqueio por Competência

### Contexto

Atualmente, o usuário precisa passar por todos os módulos em sequência para avançar. O pedido é permitir desbloqueio de módulos mais avançados sem obrigação de completar todos os anteriores.

### Mecânica proposta: desbloqueio por competência mínima

```
Módulo 1: 10 lições
  → Completou 6/10 (60%)? → "Atalho do Especialista" desbloqueado
  → Atalho leva diretamente ao Módulo 3
  → Badge especial: "Avançado por mérito"
  → Módulo 2 fica disponível como "revisão opcional" (sem cadeado, sem obrigação)
```

**Lógica Octalysis:**
- CD2 (Development): você mostrou competência — o app reconhece isso
- CD3 (Empowerment): você escolhe avançar ou revisar
- CD1 (Epic Meaning): "avançado por mérito" — não é atalho, é reconhecimento

**Threshold sugerido:** 60% de conclusão do módulo anterior para desbloquear salto. Valor configurável no Studio por módulo.

### O que implementar

- [ ] Campo `unlock_threshold` nos módulos (padrão: 100%, configurável para 60% por módulo)
- [ ] Lógica na diretiva `duo-trail`: se `completadas / total_licoes >= threshold` → próximo módulo desbloqueado
- [ ] Visual do "Atalho": bolinha especial com ícone de raio no início do módulo avançado
- [ ] Badge "Avançado por Mérito" no Studio como challenge de desbloqueio

---

## F1. Posts de Imagem Enriquecidos

Todas as funcionalidades são 100% frontend — sem nova infraestrutura. O upload continua via Funifier S3 existente.

**Ordem de implementação:** Carrossel → CTA Button → Canvas Text → Música (V2)

---

### F1.1 — Carrossel de fotos ✅ próximo a implementar

**Estrutura de dados — campo `media_items[]` em `post__c`:**
```json
{
  "media_type": "carousel",
  "media_items": [
    { "url": "https://cdn.../foto1.jpg", "type": "image" },
    { "url": "https://cdn.../foto2.jpg", "type": "image" }
  ]
}
```
Posts com `media_type: "image"` (existentes) não mudam. `media_type: "carousel"` é o novo tipo.

**UX de publicação:**
1. Usuário seleciona primeira foto normalmente
2. Botão **"+ Adicionar foto"** aparece abaixo do preview
3. Pode adicionar até **10 fotos** no total
4. Miniaturas das fotos adicionadas aparecem em linha horizontal com botão × para remover cada uma
5. Ordem pode ser reordenada via drag no preview (opcional V2)
6. Upload: cada foto é enviada individualmente ao `/v3/upload/image`, URLs acumuladas em `media_items[]`

**UX no feed:**
- Swipe horizontal nativo dentro da área da imagem
- Indicador de página: pontos na base (`● ○ ○`)
- Swipe infinito não — stop no primeiro e no último item

**Implementação:**
```javascript
// No submitPost(): quando media_items.length > 1
payload.media_type = 'carousel';
payload.media_items = media_items; // array de { url, type: 'image' }
payload.media_url = media_items[0].url; // thumbnail para o feed antigo

// No feed: índice por post
post._carouselIndex = 0;
// Touch events: swipe left/right atualiza _carouselIndex
```

- [x] Campo `media_items[]` em `post__c`
- [x] Botão "+ Adicionar foto" no fluxo de publicação (até 10)
- [x] Upload paralelo de múltiplas fotos via `$q.all`
- [x] Componente de swipe via CSS `scroll-snap` + diretiva `rvCarousel` para dots
- [x] Indicador de página (pontos)
- [x] `normalizePost()` inicializa `_carouselIndex = 0`

---

### F1.2 — Botão CTA com link sobre a imagem

Essencial para posts oficiais do MIDR: mutirões de crédito, inscrições, eventos. Disponível apenas para players com `extra.is_official = true`.

**Campos em `post__c`:**
```json
"cta_button": {
  "label": "Me inscrever no mutirão",
  "url": "https://...",
  "pos_x": 50,
  "pos_y": 80
}
```
`pos_x` e `pos_y` são percentuais da área da mídia (0–100), permitindo posicionamento responsivo.

**UX de criação (só aparece para `is_official`):**
```
1. Após selecionar imagem, toque em "Adicionar botão CTA"
2. Campo: Texto do botão (máx 40 chars)
3. Campo: URL de destino
4. Arraste o botão sobre o preview da imagem para posicioná-lo
5. [Salvar]
```

**UX de exibição no feed:**
- Botão renderizado `position: absolute` sobre a imagem, em `left: pos_x%`, `top: pos_y%`
- Fundo semitransparente, texto branco, borda arredondada
- Toque → `window.open(url, '_blank')` ou in-app WebView

**Implementação:**
```javascript
// Drag durante criação → captura pos_x, pos_y como % do container
// No feed: ng-if="post.cta_button" → botão absoluto posicionado
```

- [x] Campo `cta_button` em `post__c`
- [x] Botão "Adicionar CTA" visível apenas para `session.player.extra.is_official`
- [x] Tap-to-position no preview (pos_x%, pos_y%)
- [x] Renderização absoluta (`position: absolute; transform: translate(-50%,-50%)`) sobre a imagem no feed
- [x] Toque abre URL (`target="_blank"`)

---

### F1.3 — Texto sobre imagem (Canvas API)

Editor que sobrepõe texto na foto **antes** do upload — a imagem final já contém o texto baked in. Não requer processamento server-side.

**UX de edição:**
```
1. Após selecionar foto → toque em "Adicionar texto"
2. Modal de edição abre com:
   - Campo de texto (máx 100 chars, multiline)
   - Controles: [Tamanho: P M G] [Cor do texto: ⬜ ⬛ 🟡 🟠]
                [Cor de fundo: Transparente | Preto 50% | Branco 50%]
   - Toque na imagem para reposicionar o texto
3. Preview em tempo real via Canvas
4. [Aplicar] → renderiza Canvas como PNG, substitui mediaFile
```

**Implementação (Canvas API):**
```javascript
function applyTextToImage(imgDataUrl, textConfig, callback) {
    var canvas = document.createElement('canvas');
    var img = new Image();
    img.onload = function() {
        canvas.width = img.width;
        canvas.height = img.height;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        // Fundo do texto
        if (textConfig.bgColor !== 'transparent') {
            ctx.fillStyle = textConfig.bgColor;
            // mede o texto para dimensionar o fundo
        }
        ctx.font = textConfig.fontSize + 'px Inter, sans-serif';
        ctx.fillStyle = textConfig.color;
        ctx.fillText(textConfig.text, textConfig.x, textConfig.y);
        callback(canvas.toDataURL('image/jpeg', 0.92));
    };
    img.src = imgDataUrl;
}
```

- [x] Botão "Adicionar texto" no fluxo de publicação após selecionar foto
- [x] Editor com Canvas off-screen + preview em tempo real (`renderTextCanvas()`)
- [x] Controles: texto, tamanho (P=24/M=36/G=52px), cor do texto (5 opções), cor de fundo (sem/escuro/claro)
- [x] Reposicionamento por toque na imagem (atualiza x%, y%)
- [x] "Aplicar" converte Canvas → dataUrl → substitui `mediaPreview` e `mediaItems[0]`
- [x] "Remover" restaura `originalPreview`

---

### F1.4 — Música sobre foto (Backlog V2)

- Biblioteca de músicas royalty-free cadastrada no Studio (`musica__c`)
- `music_url` em `post__c` — player toca ao exibir a foto no feed
- Web Audio API — mix client-side (a imagem não é alterada, o áudio é separado)
- **Dependência bloqueante:** licenciamento das músicas + curadoria de conteúdo
- **Não implementar agora**

---

## F2. Vídeo no Feed

### Decisão de arquitetura: servidor de streaming

**Situação atual:** vídeos sobem via `/v3/upload/video` do Funifier → armazenados no S3 do Funifier → reproduzidos com `<video>` HTML5 direto. **Sem HLS, sem transcoding, sem CDN dedicado.**

**Por que isso vai ser um problema ao escalar:**
- Sem HLS: o player baixa o arquivo inteiro antes de começar (ruim para 4G rural)
- Sem transcoding: usuário envia 1080p, todos os outros baixam 1080p
- Sem CDN: latência alta para usuários distantes do datacenter do Funifier

**Análise de custo para 25.000 → 250.000 usuários**

Premissas: 30% dos usuários sobem vídeo, 10 min/usuário, ~2 MB/min comprimido, ~3 visualizações médias por vídeo.

| Serviço | Inclui HLS | Custo 25k users/mês | Custo 250k users/mês | Observação |
|---------|-----------|---------------------|----------------------|------------|
| **Funifier S3** (atual) | ❌ | ❓ (incluso no plano?) | ❓ | Verificar contrato |
| **Bunny Stream** | ✅ | ~$15 | ~$143 | Mais barato com HLS; PoP em SP |
| **Cloudflare Stream** | ✅ | ~$600 | ~$6.000 | Melhor rede no Brasil; mais caro |
| **AWS S3 + CloudFront** | ❌ | ~$42 | ~$420 | Sem transcoding |
| **AWS S3 + CF + MediaConvert** | ✅ | ~$120 | ~$1.200 | Complexo de manter |
| **Mux** | ✅ | ~$500 | ~$5.000 | Similar ao Cloudflare Stream |

**Recomendação: Bunny Stream**
- Transcoding e HLS automáticos, como Cloudflare Stream — mas 40× mais barato
- CDN com PoP em São Paulo
- API REST simples para upload e playback
- Player HTML5 compatível (usa `<video>` com URL HLS `.m3u8`)
- Desvantagem: rede menor globalmente (irrelevante para um app nacional)

**Plano de migração (quando decidir):**
```
Upload atual:  POST /v3/upload/video → Funifier S3 → URL direto
Upload futuro: POST api.bunny.net/library/{id}/videos → Bunny Stream → HLS URL
               (ou Cloudflare Stream → similar)
```
A migração é no `ApiService.uploadMedia()` e no player do feed — o resto do app não muda.

**Para o MVP:** continuar com S3 do Funifier. Decidir o serviço de streaming antes do lançamento público.

---

### F2.1 — Autoplay de vídeo no feed ✅ próximo (após F1)

Funciona com `<video>` HTML5 atual — não precisa esperar a decisão de streaming.

**Comportamento:**
- Vídeo inicia automaticamente mudo quando 60% visível na viewport
- Vídeo anterior pausa ao sair da viewport
- Ícone 🔇 no canto: toque ativa/desativa áudio globalmente para a sessão
- Não autoplay se o usuário desativou o áudio anteriormente (`localStorage: rv_video_muted`)

**Implementação:**
```javascript
// gallery.js — após carregar o feed
var videoObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
        var video = entry.target.querySelector('video');
        if (!video) return;
        if (entry.isIntersecting) {
            video.muted = $scope.videoMuted;
            video.play().catch(function() {}); // autoplay policy — silencia erro
        } else {
            video.pause();
        }
    });
}, { threshold: 0.6 });

// Observar cada post com media_type === 'video'
```

- [ ] IntersectionObserver nos posts com `media_type: 'video'`
- [ ] Autoplay mudo por padrão
- [ ] Ícone de som no canto superior direito do vídeo
- [ ] Toque no ícone: toggle mute em todos os vídeos + salvar preferência em `localStorage`
- [ ] Pause automático ao sair da viewport
- [ ] `video.play().catch()` para silenciar erros de autoplay policy do browser

---

### F2.2 — Streaming server (Cloudflare Stream ou Bunny Stream)

**Decisão pendente:** verificar o que o Funifier inclui no plano atual e decidir entre Bunny Stream e Cloudflare Stream.

**Quando decidido, a implementação envolve apenas:**
1. Trocar `ApiService.uploadMedia(file, true)` → upload para o novo serviço, retorna stream ID
2. Trocar `<video ng-src="{{post.media_url}}">` → `<video ng-src="{{post._streamUrl}}">` onde `_streamUrl` é a URL HLS do serviço escolhido
3. Salvar `stream_id` em `post__c` além de `media_url` (thumbnail)

- [ ] Decidir serviço (Bunny vs Cloudflare)
- [ ] Criar conta e configurar biblioteca/bucket
- [ ] Atualizar `ApiService.uploadMedia()` para vídeos
- [ ] Atualizar player no feed para usar HLS URL
- [ ] Migrar vídeos existentes (script)

---

### F2.3 — Música sobre vídeo (fora do escopo)

Mixar áudio no vídeo requer re-encoding server-side (FFmpeg). Não é viável client-side de forma confiável. Vídeos já têm áudio próprio. **Não implementar.**

---

## G. Hashtags na Galeria

### UX — Modal de Pesquisa

**Ponto de entrada:** ícone de lupa (🔍) no header da Galeria, ao lado dos stats de XP e moedas. Toque abre a tela de pesquisa em fullscreen (não bottom sheet — o teclado precisa de espaço).

**Estado vazio (sem texto digitado):**
```
┌─────────────────────────────────────────┐
│  ✕   [🔍 Pesquisar...]                  │
│                                         │
│  Sugestões                              │
│  ─────────────────                      │
│  🏷 #familia        → feed filtrado      │
│  🏷 #mel / #pesca   → feed filtrado      │
│  🏷 #colheita       → feed filtrado      │
│  🏷 #pronaf         → feed filtrado      │
│                                         │
│  Recentes           [Limpar tudo]        │
│  ─────────────────                      │
│  🔍  #familia                        ✕  │
│  👤  João Silva — Rota do Mel        ✕  │
│  🔍  #colheita                       ✕  │
└─────────────────────────────────────────┘
```

- Sugestões fixas: hashtags mais relevantes da rota (hardcoded no frontend por `routeId`)
- Recentes: últimas 10 buscas salvas em `localStorage` (`rv_search_recent`)
- Cada item recente tem × para remover individualmente; "Limpar tudo" limpa todos

**Estado com texto digitado — começa com `#`:**
```
[🔍 #familia   ✕]
─────────────────────────────────────────
🏷  #familia          23 publicações
🏷  #familiaapicultora  2 publicações
```
Busca as tags que começam com o texto digitado no banco (`tags[]` em `post__c`). Ao tocar: fecha modal → aplica `filterTag` no feed.

**Estado com texto digitado — texto livre (busca por produtor):**
```
[🔍 João   ✕]
─────────────────────────────────────────
👤  João Silva      Rota do Mel · Floriano, PI
👤  João Araújo     Rota do Mel · Picos, PI
```
Busca players por nome na gamificação (`/v3/player?q=name:*João*&limit=10`). Ao tocar: fecha modal → aplica `filterPlayerId` no feed (mostra só posts desse produtor).

**Estado de resultado no feed:**
- Barra de filtro ativa (já implementada para tags): aparece abaixo do Stories bar
- Para filtro por produtor: mesma barra, mostra "👤 João Silva" com × para limpar
- Feed filtra `postsToShow` pelo critério ativo

**Persistência do histórico:**
```javascript
// localStorage: rv_search_recent
[
  { type: 'tag',    value: 'familia',   label: '#familia'      },
  { type: 'player', value: 'CPF_joao',  label: 'João Silva'    },
  { type: 'tag',    value: 'colheita',  label: '#colheita'     }
]
```
Máximo 10 itens. Novo item sempre no topo; duplicatas são movidas para o topo.

### Auto-detecção de hashtags na legenda

Ao digitar a legenda de um post, `#palavra` é detectada automaticamente e adicionada a `tags[]` no momento de publicar. Não é necessário UI extra — acontece no `submitPost()`.

### #familia como slot permanente

- Slot fixo na 3ª posição do Stories bar (após MIDR e FADEX) — **já implementado**
- Ao tocar: aplica `filterTag = 'familia'` — **já implementado**

### O que implementar

- [x] Campo `tags[]` (array) em `post__c` — incluído no `submitPost()`
- [x] Auto-extração de hashtags do texto da legenda no `submitPost()`
- [x] Ícone de lupa no header da Galeria
- [x] Tela fullscreen de pesquisa com estados: vazio (sugestões + recentes), digitando `#` (tags), digitando texto (produtores)
- [x] Filtro por `filterPlayerId` no feed (posts de um produtor específico)
- [x] Histórico de buscas recentes em `localStorage` (`rv_search_recent`, máx 10)

---

## I. Marcação de Pessoas nas Publicações

### Conceito

Ao criar uma publicação na Galeria, o usuário pode marcar outros produtores do Rota Viva — igual ao Instagram. Na primeira vez que marca uma pessoa, o app pergunta qual é o relacionamento com ela. Essa informação é salva e reutilizada nas próximas marcações.

### Fluxo UX de marcação

```
PUBLICANDO UM POST:
1. Usuário toca em "Marcar pessoas" no fluxo de publicação
2. Campo de busca: digita nome ou CPF do familiar/amigo
3. Lista de sugestões aparece (players da mesma rota)
4. Usuário seleciona a pessoa

   → PRIMEIRA VEZ marcando essa pessoa:
     "Qual é sua relação com [Nome]?"
     ○ Filho / Filha
     ○ Pai / Mãe
     ○ Cônjuge / Companheiro(a)
     ○ Amigo(a)
     ○ Colega de produção
     [Confirmar]
     → Salva em `relacionamento__c`

   → JÁ marcou antes:
     Pula a pergunta — tipo já conhecido

5. Pode adicionar mais pessoas (botão "+")
6. Cada pessoa marcada aparece listada abaixo da imagem
```

**No feed, as marcações aparecem:**
```
[Post]
━━━━━━━━━━━━━━━━━━━━━━━━━━━
[imagem]

♥ Curtir   💬 Comentar   ↗ Compartilhar
42 curtidas
[João] Colhendo mel com a família hoje 🍯
📍 Floriano, PI   #familia #mel
👥 com Pedro (filho) e Maria (amiga)
                              ← marcações visíveis aqui
━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

- Toque no nome da pessoa marcada → abre perfil público simplificado
- A pessoa marcada recebe notificação: "[João] marcou você em uma publicação"

### Modelo de dados

**Coleção `relacionamento__c`** — armazena relacionamentos conhecidos entre players:
```json
{
  "_id": "CPF_origem__CPF_destino",
  "player": "CPF_de_quem_marca",
  "mentioned": "CPF_marcado",
  "tipo": "filho" | "filha" | "pai" | "mae" | "conjuge" | "amigo" | "colega",
  "created": { "$date": "..." }
}
```

- `_id` composto garante unicidade: um player tem apenas um tipo de relacionamento com cada outro
- Se o relacionamento mudar: `PUT` atualiza o registro
- Não depende de `familia_vinculo__c` — funciona para qualquer tipo de relação, familiar ou não

**Campo `mentions[]` em `post__c`**:
```json
"mentions": [
  { "player_id": "CPF1", "player_name": "João", "tipo": "filho" },
  { "player_id": "CPF2", "player_name": "Maria", "tipo": "amigo" },
  { "player_id": "CPF3", "player_name": "Carlos", "tipo": "colega" }
]
```

Máximo de 10 marcações por post. Quando `tipo` for `pai`, `mae`, `filho` ou `filha`, a tag `familia` é adicionada automaticamente a `post.tags[]`.

### Casos de uso

| Caso | Resultado |
|------|-----------|
| Pai marca filho em post de colheita | Tag `familia` auto-aplicada ao post |
| MIDR marca operador de crédito em post de mutirão | Aumenta visibilidade do operador no feed |
| Produtor marca amigo em post de boas práticas | Amigo recebe notificação + descobre o conteúdo |

### O que implementar

- [x] Coleção `relacionamento__c` — leitura e escrita via `ApiService`
- [x] Campo `mentions[]` em `post__c` — incluído no payload de `submitPost()`
- [x] Componente de busca + seleção de pessoas no fluxo de publicação
- [x] Modal "Qual é sua relação?" na primeira marcação de cada pessoa
- [x] Reutilização automática do tipo registrado nas marcações seguintes
- [x] Auto-aplicação de `tag: "familia"` quando tipo for pai/mãe/filho/filha
- [ ] Notificação push para a pessoa marcada — requer infra backend, fora do escopo atual
- [x] Exibição das marcações abaixo da imagem no feed

---

## J. Exemplos de Desafios DIY Família + Perguntas de Escuta Ativa

Esta seção serve como referência de conteúdo para apresentar ao secretário e para a equipe de conteúdo configurar no Studio.

---

### Desafios DIY Família — Rota do Mel (Apicultura)

Cada desafio é uma lição do tipo `diy` com ícone família 👨‍👦. O usuário tira uma foto e escreve uma descrição curta. A foto pode ser publicada na Galeria com tag `#familia`.

| # | Título | Instrução para o usuário | Dica do MIDR |
|---|--------|--------------------------|-------------|
| 1 | **Primeira vez no apiário** | "Traga um familiar até suas colmeias hoje. Fotografe o momento em que ele vê as abelhas de perto pela primeira vez." | "Compartilhar o que você faz com quem você ama fortalece a cadeia produtiva do mel." |
| 2 | **Mãos na massa juntos** | "Ensine alguém da sua família a usar o fumigador com segurança. Registre esse momento." | "A segurança no manejo começa em casa. Cada produtor formado é uma colmeia mais forte." |
| 3 | **Colheita em família** | "Na próxima colheita, peça para um familiar tirar uma foto sua trabalhando. Depois tire uma dele também." | "Registrar a produção é o primeiro passo para acessar crédito. Comece com quem você ama." |
| 4 | **Degustação do mel** | "Fotografe sua família provando o mel que você produziu. Qual foi a reação?" | "O mel que sai das suas colmeias chega na mesa de muitas famílias. Começa pela sua." |
| 5 | **Passando o conhecimento** | "O que você sabe sobre apicultura que seus filhos ainda não sabem? Ensine hoje e registre." | "O saber que fica na família é o patrimônio que nenhuma adversidade tira." |
| 6 | **O futuro da colmeia** | "Mostre para um filho ou sobrinho como você cuida das suas colmeias. O que ele achou?" | "Cada jovem que aprende sobre apicultura é uma geração que fica no campo." |
| 7 | **Dia de trabalho juntos** | "Convide um familiar para trabalhar com você hoje, mesmo que seja por uma hora. Fotografem o trabalho." | "Trabalhar junto fortalece os laços e a produção." |

---

### Desafios DIY Família — Rota da Pesca (Pesca Artesanal)

| # | Título | Instrução para o usuário | Dica do MIDR |
|---|--------|--------------------------|-------------|
| 1 | **Primeira vez no barco** | "Leve um familiar no barco hoje. Fotografe o momento em que ele vê o rio ou o mar com você." | "A pesca artesanal é uma herança. Mostrar para a família é começar a passá-la adiante." |
| 2 | **Consertando as redes juntos** | "Ensine um familiar a consertar a rede. Fotografe as mãos de vocês dois trabalhando." | "As mãos que consertam a rede hoje são as que vão pescar amanhã." |
| 3 | **Conhecendo os peixes** | "Mostre para alguém da sua família os peixes que você capturou hoje. Qual foi o favorito deles?" | "Conhecer o que você produz é o primeiro passo para valorizá-lo." |
| 4 | **Preparando a pescaria** | "Fotografe sua família ajudando a preparar o equipamento de pesca antes de sair." | "Uma pescaria bem preparada começa antes de chegar na água." |
| 5 | **O peixe que alimenta** | "Cozinhe algo com o peixe que você pescou e fotografe sua família comendo juntos." | "Do rio para a mesa da família — essa é a força da pesca artesanal." |
| 6 | **Passando o ofício** | "O que você sabe sobre pesca que seus filhos ainda não sabem? Ensine hoje e registre." | "O conhecimento do pescador é o maior patrimônio do território." |
| 7 | **Cuidando do rio juntos** | "Mostre para um familiar um lugar do rio que você quer preservar. Por que esse lugar é especial?" | "Quem cuida do rio cuida do futuro. E o futuro começa em família." |

---

### Perguntas de Escuta Ativa sobre Família

Lições do tipo `essay` posicionadas na trilha para coletar dados para o MIDR sobre dinâmicas familiares e fixação de jovens no campo.

**Módulo: Família e Futuro no Campo**

| # | Pergunta | Objetivo do MIDR |
|---|----------|-----------------|
| 1 | "Algum membro da sua família trabalha com você na produção? Se sim, quem?" | Mapear estrutura familiar na cadeia produtiva |
| 2 | "Seus filhos ou filhas têm interesse em continuar trabalhando no campo? Como você percebe isso?" | Medir propensão de fixação de jovens |
| 3 | "O que você gostaria de ensinar para a próxima geração sobre sua produção?" | Identificar saberes locais a preservar |
| 4 | "Quais são os maiores desafios para manter sua família unida trabalhando no campo?" | Diagnosticar barreiras à sucessão rural |
| 5 | "Você acredita que seu filho ou filha tem futuro na apicultura / pesca artesanal? Por quê?" | Avaliar percepção de viabilidade econômica intergeracional |
| 6 | "O que mudaria na sua produção se você tivesse mais apoio da sua família?" | Identificar necessidades de suporte familiar |
| 7 | "Você já acessou algum crédito do governo para sua produção? Como foi essa experiência?" | Mapear acesso histórico a crédito |
| 8 | "Se você pudesse pedir uma coisa ao governo para ajudar sua família a ficar no campo, o que seria?" | Qualitativo — dados estratégicos para o MIDR |

> Cada lição Essay usa no máximo 5 dessas perguntas por instrumento. Distribuir ao longo da trilha em pontos estratégicos — não concentrar tudo num único módulo.

---

## K. Perfil Instagram Rota Viva

### Email para cadastro

Seguindo o padrão de aliases Gmail já adotado no projeto:

**`funifier.agent.dev01+rotaviva@gmail.com`**

Todas as notificações chegam na caixa principal `funifier.agent.dev01@gmail.com` — sem criar uma nova conta Google.

**Handle sugerido para o Instagram:** `@rotaviva.midr` ou `@rotavivaoficial`

### Estratégia do canal

O Instagram do Rota Viva tem dois objetivos distintos e simultâneos:

1. **Aquisição:** alcançar produtores que ainda não conhecem o programa e fazê-los baixar o app
2. **Prova social:** mostrar para o secretário, MIDR e parceiros que o programa tem vida pública real

O público-alvo no Instagram **não é o produtor rural** (ele não está no Instagram — está no WhatsApp). O Instagram é para **lideranças comunitárias, técnicos de extensão rural, gestores públicos municipais, jornalistas de agro e parceiros institucionais** que descobrem o programa e levam para as comunidades.

### Categorias de conteúdo

| Categoria | % do feed | Objetivo |
|-----------|-----------|----------|
| 🎬 **Reels** — Bastidores do app e do campo | 35% | Alcance orgânico (Reels têm maior distribuição) |
| 👨‍👦 **Família** — Histórias reais de produtores | 25% | Emoção + compartilhamento |
| 📚 **Educacional** — Dicas de apicultura/pesca | 20% | Autoridade + salvar/compartilhar |
| 🏛️ **Institucional** — Programas, crédito, mutirões | 15% | CTA para o app + inscrições |
| 🎉 **Eventos e Conquistas** — Marcos do programa | 5% | Prova social |

### Calendário de publicações — primeiros 30 dias

**Frequência:** 4 posts/semana no feed + Stories diários

**Melhores horários para o público-alvo:**
- Terça e quinta: 19h–21h (after-work de gestores e técnicos)
- Sábado: 10h–12h (consumo relaxado de manhã)
- Domingo: 16h–18h (planejamento da semana)

---

**SEMANA 1 — Apresentação do programa**

| Dia | Tipo | Conteúdo | Horário |
|-----|------|----------|---------|
| Ter | Reel | "O que é o Rota Viva?" — 30s mostrando o app em uso com trilha + galeria | 19h |
| Qui | Carrossel | "Apicultor ou pescador? O app foi feito para você" — 5 slides com funcionalidades principais | 20h |
| Sáb | Story | Enquete: "Você sabia que pode acessar até R$35.000 em crédito rural?" | 10h |
| Dom | Post | Foto institucional: logo MIDR + mapa das regiões atendidas (PI e AP) | 17h |

**SEMANA 2 — Família e fixação de jovens**

| Dia | Tipo | Conteúdo | Horário |
|-----|------|----------|---------|
| Ter | Reel | "Pai e filho, apicultores. O app que une gerações no campo." — use imagens `family/1.png` animadas | 19h |
| Qui | Carrossel | "7 desafios para fazer com sua família na trilha" — lista dos DIY família | 20h |
| Sáb | Story | Caixa de perguntas: "Seus filhos têm interesse em continuar no campo?" | 11h |
| Dom | Post | Citação: frase poderosa de uma das perguntas de Escuta Ativa sobre família | 16h |

**SEMANA 3 — Crédito e programas do governo**

| Dia | Tipo | Conteúdo | Horário |
|-----|------|----------|---------|
| Ter | Reel | "Você sabia que pode acessar R$35.000 pelo PRONAF B? Veja como o app te ajuda." | 19h |
| Qui | Carrossel | "PRONAF A vs PRONAF B vs Microcrédito MIDR — qual é o seu?" — infográfico | 20h |
| Sáb | Story | Contagem regressiva: "Mutirão PRONAF — X dias — [cidade]" | 10h |
| Dom | Post | Foto do Cartão do Produtor Rota Viva com CTA: "Emita o seu" | 17h |

**SEMANA 4 — Evento de lançamento (semana do evento)**

| Dia | Tipo | Conteúdo | Horário |
|-----|------|----------|---------|
| Seg | Story | "Amanhã começa o Dia da Família do Campo. Estamos chegando em [cidade]!" | 18h |
| Ter | Live | Transmissão ao vivo do evento (15–20 min) — famílias fazendo o primeiro Desafio Legado | 14h |
| Qui | Reel | Compilado do evento: high five dos personagens, famílias no telão, depoimentos | 19h |
| Sáb | Carrossel | "O que aconteceu no lançamento" — fotos do evento com legenda emocional | 10h |
| Dom | Post | Número de famílias cadastradas no evento + CTA para quem não foi | 17h |

### Stories diários (7 dias/semana)

| Tipo | Frequência | Conteúdo |
|------|-----------|----------|
| Bastidores do app | 2x/semana | Screenshots do feed da Galeria com posts reais de produtores |
| Dica do dia | 3x/semana | 1 dica de apicultura ou pesca (15 palavras, visual simples) |
| Enquete / Quiz | 2x/semana | "Você sabia que...?" com verdadeiro/falso sobre PRONAF, mel ou pesca |
| Repost de produtor | 1x/semana | Repostar post real da galeria do app (com permissão implícita nos Termos) |
| Contagem de mutirão | conforme agenda | Sticker de contagem regressiva para mutirões com vagas |

### Como maximizar o canal

1. **Reels são prioridade absoluta** — o algoritmo do Instagram prioriza Reels para alcance orgânico. Toda semana deve ter pelo menos 1 Reel
2. **Carrosséis geram salvamentos** — conteúdo de crédito e elegibilidade vira referência que as pessoas salvam e mandam para amigos: "olha isso aqui"
3. **Bio sempre com link para o app** — `rotaviva.app` ou link de instalação do PWA
4. **Stories com enquetes** colhem dados + aumentam o alcance algorítmico
5. **Repostar produtores reais** da Galeria no Instagram cria o loop: produtor vê que foi repostado → conta para a comunidade → mais produtores baixam o app para aparecer no Instagram do programa

---

## L. História Interativa — Novo Tipo de Lição

### Conceito

A História Interativa é um novo tipo de lição na trilha: o usuário lê uma narrativa ilustrada com personagens, toma decisões em nome do protagonista e vê o rumo da história mudar conforme suas escolhas. Histórias podem terminar bem ou mal. Quanto melhores as decisões — baseadas no conhecimento adquirido nas lições anteriores — maior a recompensa final.

Não é conteúdo obrigatório para avançar na trilha. Funciona como um **jogo de aplicação de conhecimento**: o produtor pratica situações reais do dia a dia antes de enfrentá-las na vida.

> **Conexão com os "cartoons" da trilha:** atualmente, o personagem mascote aparece a cada 5 lições nos pontos de inflexão da curva S como elemento puramente decorativo. Com o tipo `story`, algumas dessas posições passam a hospedar uma história interativa — o mascote deixa de ser decoração e se torna protagonista de um mini-jogo narrativo. Não toda posição de cartoon vira história; a equipe de conteúdo escolhe quais ativar.

### O que já existe no Funifier Studio

O Story admin já está implementado em `/studio/story` com uma base sólida:

| Recurso | Status |
|---------|--------|
| Personagens (`characters`) com imagem e AI generation | ✅ Existe |
| Cenas (`scenes`) com título, descrição, imagem, áudio, posicionamento | ✅ Existe |
| Branching via `next_scenes[]` — cada cena aponta para próximas cenas | ✅ Existe |
| Transição automática ou por botão entre cenas | ✅ Existe |
| Botões com links externos por cena | ✅ Existe |
| Preview ao vivo da história num modal (`<story>` directive) | ✅ Existe |
| Geração de história completa com IA (`/v3/ai/build/story`) | ✅ Existe |
| Geração de imagem por cena com IA (prompt + style) | ✅ Existe |
| Edição raw via CodeMirror (JSON completo) | ✅ Existe |

### O que falta — melhorias no Studio

Lendo o código (`form.js` + `form.html`), identificamos 6 melhorias necessárias para o Rota Viva:

#### 1. Campo `score` nas escolhas de próxima cena

Atualmente `next_scenes[]` tem apenas `scene` (id da próxima cena), `text` (texto do botão de escolha) e `icon`. Falta o `score` — quantos pontos essa escolha vale.

**Adicionar no modal de edição de cena (`editSceneModal`)**, na tabela de `next_scenes`:
```
| Próxima cena | Texto da escolha | Ícone | Score (0–10) | Remover |
```

**No `form.js`** — `addNextScene`:
```javascript
var newNextScene = { scene: '', text: '', icon: '', score: 0 };
```

#### 2. Campo `outcome` nas cenas — marcar finais

Atualmente não há como marcar uma cena como "final bom", "final ruim" ou "final neutro". Isso é necessário para calcular o XP final e mostrar a animação certa na tela de encerramento.

**Adicionar no modal de edição de cena:**
```
Tipo de cena: ○ Normal  ○ Final Bom  ○ Final Ruim  ○ Final Neutro
```

Campo: `outcome: "normal" | "ending_good" | "ending_bad" | "ending_neutral"`

#### 3. Campo `consequence` nas cenas

Texto exibido após o usuário fazer uma escolha, antes de ir para a próxima cena. Explica o impacto da decisão. Fundamental para o aprendizado.

**Exemplo:**
> Cena: "Você usou o agrotóxico na colmeia."
> Consequence (mostrado antes da próxima cena): "As abelhas morreram por intoxicação. Agrotóxicos são proibidos no manejo de colmeias. Veja o que acontece..."

Campo `consequence: string` no modal de edição de cena.

#### 4. Substituir `alert()` por `Notification` service

O `Notification` service já está injetado no controller mas não é usado. Todos os `alert()` do código (`'Saved!'`, `'Deleted!'`, `'Cena removida com sucesso.'`) devem ser substituídos por:
```javascript
Notification.success({ message: $translate.instant('SAVED') });
Notification.error({ message: $translate.instant('ERROR') });
```

#### 5. Campo `video_id` nas cenas (Cloudflare Stream)

Para histórias com cenas em vídeo (V2), cada cena precisa suportar `video_id` do Cloudflare Stream como alternativa à imagem estática.

**Adicionar no modal de edição de cena:**
```
Mídia: ○ Imagem  ○ Vídeo (Cloudflare Stream)
[Campo: video_id quando vídeo selecionado]
```

#### 6. Indicador visual de cenas sem saída (dead ends)

Cenas sem `next_scenes` e sem `outcome` definido são um erro de configuração (o usuário fica preso). Adicionar indicador visual na lista de cenas:

```
⚠️ [Cena X] — sem próxima cena e sem outcome definido
```

Implementado como ng-class na linha da tabela de cenas quando `!item.next_scenes || item.next_scenes.length === 0` e `!item.outcome || item.outcome === 'normal'`.

### Novo tipo de lição `story` no app

**Bolinha na trilha:**

```
    ○ lição normal
    ○ lição normal
   📖 lição história  ← ícone: livro aberto (fa-book-open)
    ○ lição normal
```

- Aparece no lugar de algumas posições de cartoon (posição de inflexão do S)
- Sem cadeado — acesso livre
- Visual diferenciado: bolinha maior, borda animada, brilho (destaque como evento especial)

**Popup de entrada:**
```
Título: "História: O Dia do Mutirão"
"Uma história interativa onde você decide o que fazer"
[Ícone: personagem do cartoon]
[Começar]
```

**Tela de jogo:**
```
[Imagem da cena — full width]
[Texto da narração — parte inferior sobre overlay semitransparente]
[Botões de escolha — bottom-center (configurável por cena)]
```

**Tela de consequência** (após escolha, antes de avançar):
```
[Mesma imagem da cena com leve overlay escuro]
"[texto do consequence]"
[Continuar →]
```

**Tela de encerramento — Final Bom:**
```
[APNG: personagem celebrando]
"🏆 Você fez as escolhas certas!"
"Seu conhecimento fez a diferença."

+150 XP   +2 Coins   Badge "Produtor Decisivo"

[Revisar minhas escolhas]   [Voltar à trilha]
```

**Tela de encerramento — Final Ruim:**
```
[Imagem: personagem reflexivo]
"Suas escolhas levaram a um resultado difícil."
"Mas aprender com os erros é parte do processo."

+30 XP (participação)

[Ver onde errei]   [Tentar novamente]   [Voltar à trilha]
```

A opção "Tentar novamente" permite refa zer a história — incentivando o usuário a buscar o final bom (CD3 + CD2).

### Sistema de pontuação e recompensas

```
Score final = soma dos score individuais de cada escolha feita

Score 0–40%  → Final Ruim    → +30 XP
Score 41–70% → Final Neutro  → +80 XP
Score 71–100%→ Final Bom     → +150 XP + 2 Coins
```

**Integração com a gamificação:**
```javascript
// Ao encerrar a história
logAction('complete_lesson', {
  type: 'story',
  story_id: 'pronaf_simulacao',
  score: 85,          // percentual 0-100
  outcome: 'ending_good'
});
```

Challenge `historia_decisiva` configurado no Studio:
- Trigger: `complete_lesson` com `type: 'story'` e `outcome: 'ending_good'`
- Recompensa: +150 XP + 2 coins + badge "Produtor Decisivo"

### Histórias completas para implementação no Studio

As duas histórias abaixo estão descritas em detalhe suficiente para serem montadas diretamente no Funifier Studio via o admin de histórias (`/studio/story`). Cada cena inclui: ID, texto de narração, descrição de imagem para geração com IA, texto das escolhas com score, texto de consequência e outcome.

---

#### 🍯 "O Dia do Mutirão" — Rota do Mel

**Metadados da história:**
```
_id:         dia_mutirao_mel
title:       O Dia do Mutirão
description: Seu Zé ouviu que haverá um mutirão do PRONAF em Floriano.
             Ele nunca pediu crédito antes. Você vai ajudá-lo a fazer
             as escolhas certas para conseguir financiamento?
route:       mel
```

**Personagens:**
```
seu_ze:
  nome: Seu Zé
  descricao: Apicultor de 52 anos, Floriano, PI. Tem 40 colmeias,
             trabalha sozinho. Nunca pediu crédito mas quer expandir.
  imagem: personagem principal (homem maduro, chapéu de apicultor,
          rosto determinado)

atendente:
  nome: Atendente do Banco
  descricao: Funcionária do Banco do Nordeste, jovem, profissional.
             Paciente com quem não conhece os trâmites.
  imagem: mulher com crachá de banco, sorriso acolhedor

tecnico_ater:
  nome: Técnico da ATER
  descricao: Técnico de extensão rural da EMATER/PI. Conhece bem os
             programas do MIDR. É o elo entre o produtor e o banco.
  imagem: homem com colete de campo, prancheta, olhar atento
```

**Árvore de cenas:**

---

**CENA 1 — `c1_chegada`** *(outcome: normal)*

*Narração:*
> Seu Zé acorda antes do sol nascer. Hoje é dia de mutirão do PRONAF no Banco do Nordeste em Floriano. Ele separou os documentos que encontrou em casa: RG, CPF e comprovante de endereço. Chega ao banco às 7h30, a fila já tem 20 pessoas. Quando chega sua vez, a atendente sorri e pergunta: "Bom dia, senhor! O senhor tem o CAF — o Cadastro da Agricultura Familiar?"

*Descrição de imagem:* Fachada de agência bancária de manhã cedo, fila de produtores rurais com chapéus e sacolas, luz dourada do amanhecer.

*Escolhas:*
- `"Sim, trouxe o CAF"` → cena `c2a_caf_ok` · score: 10
- `"Não sei o que é CAF"` → cena `c2b_sem_caf` · score: 0

---

**CENA 2A — `c2a_caf_ok`** *(outcome: normal)*

*Narração:*
> "Perfeito! Com o CAF o senhor está enquadrado como agricultor familiar e pode acessar o PRONAF B — até R$35.000 para custeio ou investimento na produção. Temos duas opções disponíveis hoje: PRONAF B Custeio, para comprar insumos e materiais desta safra, ou PRONAF B Investimento, para comprar equipamentos e expandir a produção. Qual é o objetivo do senhor?"

*Descrição de imagem:* Interior de agência bancária, balcão de atendimento, atendente mostrando folheto do PRONAF, Seu Zé com expressão atenta.

*Consequência de chegar aqui:* "Você fez certo em trazer o CAF. Sem ele, o acesso ao PRONAF seria impossível neste mutirão."

*Escolhas:*
- `"Quero o custeio — preciso de materiais para esta safra"` → cena `c3a_custeio` · score: 10
- `"Quero o investimento — vou comprar 20 novas colmeias"` → cena `c3b_investimento` · score: 8
- `"Não sei a diferença, pode explicar?"` → cena `c3c_duvida` · score: 6

---

**CENA 2B — `c2b_sem_caf`** *(outcome: normal)*

*Narração:*
> A atendente explica com calma: "O CAF é o Cadastro da Agricultura Familiar — é como um RG do agricultor familiar. Sem ele não consigo fazer o cadastro no PRONAF hoje. Mas não se preocupe! O técnico da ATER aqui do lado pode ajudar o senhor a entender o que precisa." Seu Zé sente o coração apertar. Será que veio à toa?

*Descrição de imagem:* Seu Zé com expressão de surpresa e preocupação no balcão. Atendente apontando para uma sala lateral com placa "ATER".

*Consequência de chegar aqui:* "Não ter o CAF não significa que o dia está perdido. Mas você vai precisar correr."

*Escolhas:*
- `"Vou lá falar com o técnico da ATER"` → cena `c3d_ater` · score: 7
- `"Já era, vou embora"` → cena `c3e_desistiu` · score: 0

---

**CENA 3A — `c3a_custeio`** *(outcome: normal)*

*Narração:*
> "Ótima escolha. O custeio financia esta safra. Para aprovar, preciso de um projeto simples: quantas colmeias o senhor tem, o que vai produzir e como vai pagar. Você tem algo anotado?" Seu Zé abre a sacola. Ele tem um caderno com o número de colmeias, a produção média e os custos — rabiscado, mas está tudo lá.

*Descrição de imagem:* Caderno aberto sobre o balcão com anotações de produção, abelhas desenhadas nas margens.

*Escolhas:*
- `"Tenho minhas anotações aqui — produção, custos, tudo"` → cena `c4a_aprovado` · score: 10
- `"Não tenho nada escrito, guardo tudo na cabeça"` → cena `c4b_sem_projeto` · score: 3

---

**CENA 3B — `c3b_investimento`** *(outcome: normal)*

*Narração:*
> "Para o investimento, o prazo de pagamento é maior — até 10 anos. Mas precisamos de um projeto técnico aprovado pelo técnico da ATER. O senhor já foi lá?" Seu Zé sabe que a ATER fica do outro lado da cidade. Ainda é cedo — dá tempo.

*Descrição de imagem:* Mapa simples de cidade pequena com trajetória marcada entre banco e escritório da ATER.

*Escolhas:*
- `"Vou lá agora, ainda tenho tempo"` → cena `c3d_ater` · score: 8
- `"Não dá tempo, vou pegar o custeio mesmo"` → cena `c3a_custeio` · score: 7

---

**CENA 3C — `c3c_duvida`** *(outcome: normal)*

*Narração:*
> A atendente explica: "Custeio é para gastos da safra atual — compra de materiais, caixas, cera. Você paga em até 2 anos. Investimento é para crescer a produção — equipamentos, mais colmeias. Paga em até 10 anos." Seu Zé pensa em seus planos.

*Descrição de imagem:* Dois caminhos ilustrados: um mostrando material de apicultura (custeio), outro mostrando fileira de novas colmeias (investimento).

*Escolhas:*
- `"Entendi — quero o custeio"` → cena `c3a_custeio` · score: 9
- `"Quero o investimento — vou crescer"` → cena `c3b_investimento` · score: 8

---

**CENA 3D — `c3d_ater`** *(outcome: normal)*

*Narração:*
> O técnico da ATER recebe Seu Zé com atenção. "Calma, não perdeu o dia não. O CAF demora uma semana para sair, mas já posso te ajudar a montar o projeto técnico e te orientar no que trazer pro próximo mutirão." Ele anota tudo que Seu Zé produz e explica quais documentos faltam.

*Descrição de imagem:* Sala simples da ATER, técnico com prancheta orientando Seu Zé, mapa do Piauí na parede ao fundo.

*Escolhas:*
- `"Ótimo! Quando é o próximo mutirão?"` → cena `c4c_proximo_mutirao` · score: 8

*(só uma escolha — avança automaticamente após leitura)*

---

**CENA 3E — `c3e_desistiu`** *(outcome: ending_bad)*

*Narração:*
> Seu Zé sai do banco de cabeça baixa. "Não tem jeito." No caminho para casa, passa pela ATER e vê a placa. Mas decide não entrar — está desanimado. Chega em casa e conta para a família que não conseguiu. A safra seguinte vai ser mais do mesmo: sem recursos para expandir, sem crédito, sem crescimento.

*Consequência:* "A desistência foi o maior erro. A ATER estava logo ali. O produtor que desiste cedo nunca descobre as oportunidades que existem."

*Descrição de imagem:* Seu Zé de costas saindo do banco, ombros caídos, rua vazia de cidade pequena.

*outcome: ending_bad*

---

**CENA 4A — `c4a_aprovado`** *(outcome: ending_good)*

*Narração:*
> A atendente analisa o caderno. "Está aqui tudo que preciso. Com sua produção de 800kg por ano e custo declarado, o senhor tem capacidade de pagamento. Vou encaminhar para análise. Em 5 dias úteis, se aprovado, o valor cai na conta." Seu Zé sai do banco com o protocolo na mão e um sorriso no rosto. Ele veio preparado — e isso fez toda a diferença.

*Consequência:* "Anotar sua produção regularmente foi o que garantiu o crédito. Quem registra, comprova."

*Descrição de imagem:* Seu Zé saindo do banco com papel de protocolo na mão, sorrindo, luz do sol da tarde.

*outcome: ending_good*

---

**CENA 4B — `c4b_sem_projeto`** *(outcome: ending_neutral)*

*Narração:*
> "Sem dados escritos, fica difícil fazer a análise de crédito hoje. Mas não perde a viagem não." A atendente o encaminha para o técnico da ATER, que ajuda a montar o projeto na hora — básico, mas suficiente para uma pré-análise. "Semana que vem você volta com o projeto completo e a gente finaliza." Não foi aprovado hoje, mas está no caminho certo.

*Consequência:* "Sempre anote sua produção. O caderno de campo é o documento mais importante de um produtor."

*Descrição de imagem:* Seu Zé e técnico da ATER sentados na sala, preenchendo formulário juntos.

*outcome: ending_neutral*

---

**CENA 4C — `c4c_proximo_mutirao`** *(outcome: ending_neutral)*

*Narração:*
> "O próximo mutirão é daqui a 45 dias, em Picos." O técnico entrega a lista completa de documentos e já agenda um acompanhamento. "Você vai chegar preparado dessa vez." Seu Zé sai da ATER com uma pasta cheia de orientações. Não conseguiu crédito hoje — mas aprendeu tudo que precisa para conseguir na próxima vez.

*Consequência:* "Saber o que falta é metade do caminho. Na próxima visita, Seu Zé vai chegar preparado."

*Descrição de imagem:* Seu Zé saindo da ATER com pasta de documentos, expressão determinada, pôr do sol ao fundo.

*outcome: ending_neutral*

---

**Mapa da história:**
```
c1_chegada
├── "Tenho o CAF"        (10) → c2a_caf_ok
│     ├── "Custeio"      (10) → c3a_custeio
│     │     ├── "Tenho anotações" (10) → c4a_aprovado    ✅ FINAL BOM
│     │     └── "Só na cabeça"    ( 3) → c4b_sem_projeto ➡ FINAL NEUTRO
│     ├── "Investimento"  ( 8) → c3b_investimento
│     │     ├── "Vou à ATER"      ( 8) → c3d_ater → c4c_proximo_mutirao ➡ FINAL NEUTRO
│     │     └── "Fica o custeio"  ( 7) → c3a_custeio (ver acima)
│     └── "Não sei a diferença"   ( 6) → c3c_duvida
│           ├── "Custeio"         ( 9) → c3a_custeio (ver acima)
│           └── "Investimento"    ( 8) → c3b_investimento (ver acima)
└── "Não sei o que é CAF" ( 0) → c2b_sem_caf
      ├── "Vou à ATER"    ( 7) → c3d_ater → c4c_proximo_mutirao ➡ FINAL NEUTRO
      └── "Vou embora"    ( 0) → c3e_desistiu                    ❌ FINAL RUIM
```

**Pontuação:**
- Score máximo possível: 40 (10+10+10+10)
- Final Bom (≥71%): ≥29 pontos → `ending_good` → +150 XP +2 coins + badge
- Final Neutro (41–70%): 17–28 pontos → `ending_neutral` → +80 XP
- Final Ruim (≤40%): ≤16 pontos → `ending_bad` → +30 XP

---

#### 🐟 "A Pesca e o Defeso" — Rota da Pesca

**Metadados da história:**
```
_id:         pesca_defeso
title:       A Pesca e o Defeso
description: O defeso começou. Maria tem 60 dias sem poder pescar —
             mas isso não significa parar. Você vai ajudá-la a tomar
             as decisões certas para sair mais forte do período de restrição?
route:       pesca
```

**Personagens:**
```
maria:
  nome: Maria
  descricao: Pescadora artesanal de 38 anos, Macapá, AP. Pesca no
             Rio Amazonas há 20 anos. Tem RGP e uma canoa a motor.
             Mãe de dois filhos. Determinada e prática.
  imagem: mulher com roupa de trabalho ribeirinha, expressão forte,
          rio ao fundo

seu_raimundo:
  nome: Seu Raimundo
  descricao: Pescador artesanal de 65 anos, vizinho de Maria.
             Já passou por muitos defesos. Sábio, tranquilo.
             Mentor natural da comunidade.
  imagem: homem idoso com chapéu de palha, sentado na beira do rio,
          consertando rede

agente_defeso:
  nome: Agente do Seguro-Defeso
  descricao: Servidor do INSS responsável pelo cadastramento dos
             pescadores para o seguro-defeso. Jovem, organizado.
  imagem: homem com crachá do INSS, mesa com computador, escritório simples
```

**Árvore de cenas:**

---

**CENA 1 — `d1_inicio`** *(outcome: normal)*

*Narração:*
> É primeira segunda-feira de novembro. Maria acorda e olha para o rio. Sabe que hoje começa o defeso — 60 dias sem pescar, por lei, para proteger a reprodução dos peixes. Seu Raimundo bate na porta: "Maria, você já foi se cadastrar pro seguro-defeso? O prazo é essa semana. Se não cadastrar, fica sem o benefício." O seguro-defeso é equivalente a um salário mínimo por mês durante o período. Maria não sabia que tinha prazo.

*Descrição de imagem:* Beirada do rio de manhã cedo, canoas amarradas, placa "Período de Defeso" fixada no trapiche, Seu Raimundo na porta de Maria.

*Escolhas:*
- `"Já sei — vou hoje mesmo me cadastrar"` → cena `d2a_cadastro_ok` · score: 10
- `"Vou deixar para amanhã, tenho outras coisas para resolver"` → cena `d2b_atraso` · score: 3

---

**CENA 2A — `d2a_cadastro_ok`** *(outcome: normal)*

*Narração:*
> Maria chega ao INSS com o RGP (Registro Geral da Pesca), RG e CPF. O agente verifica os documentos: "Tudo certo, Maria. Você vai receber um salário mínimo por mês durante os próximos dois meses do defeso. O primeiro depósito em 15 dias." Saindo do INSS, Seu Raimundo a espera do lado de fora. "E aí, conseguiu?" "Consegui! Agora, o que faço com esses 60 dias?"

*Consequência de chegar aqui:* "Ter o RGP em dia e agir rápido garantiu o benefício. Cadastros atrasados podem ser negados."

*Descrição de imagem:* Maria sorrindo com papel de comprovante de cadastro na mão, saindo do escritório do INSS.

*Escolhas:*
- `"Vou consertar minhas redes e minha canoa"` → cena `d3a_manutencao` · score: 10
- `"Vou descansar — mereço. Trabalho o ano todo"` → cena `d3b_descanso` · score: 4
- `"Vou fazer as lições da Rota da Pesca no app"` → cena `d3c_aprendizado` · score: 8

---

**CENA 2B — `d2b_atraso`** *(outcome: normal)*

*Narração:*
> No dia seguinte, Maria vai ao INSS. O agente olha o sistema: "Lamento, o prazo para cadastramento encerrou ontem às 18h. Teremos um novo período de recadastramento em 30 dias, mas sem garantia de aprovação retroativa." Maria sente o coração apertar. Sem o seguro-defeso, vai precisar de outra renda nos próximos dois meses.

*Consequência:* "Um dia de atraso custou dois meses de benefício. No defeso, prazos são prazos."

*Descrição de imagem:* Maria com expressão frustrada diante do balcão do INSS, agente mostrando computador com prazo encerrado.

*Escolhas:*
- `"O que posso fazer agora para gerar renda?"` → cena `d3d_renda_alternativa` · score: 7
- `"Vou reclamar com o Seu Raimundo — ele devia ter me avisado antes"` → cena `d3e_culpa` · score: 1

---

**CENA 3A — `d3a_manutencao`** *(outcome: normal)*

*Narração:*
> Seu Raimundo e Maria passam os dias consertando as redes rasgadas, calafetando a canoa e verificando o motor. "Cada nó que você conserta agora é um peixe a mais que você vai pescar depois do defeso," diz Seu Raimundo. Semanas depois, quando o defeso termina, Maria é a primeira a sair — com equipamento em ordem e sem perder tempo com consertos.

*Consequência:* "Manutenção durante o defeso não é perda de tempo. É investimento. Quem cuida do equipamento pesca mais."

*Descrição de imagem:* Maria e Seu Raimundo consertando rede no quintal, ferramentas espalhadas, sol da tarde.

*Escolhas:*
- `"Além de consertar, vou aprender mais sobre o manejo sustentável"` → cena `d4a_preparada` · score: 10

*(avanço automático após leitura)*

---

**CENA 3B — `d3b_descanso`** *(outcome: normal)*

*Narração:*
> As primeiras duas semanas, Maria descansa. Na terceira semana, olha para as redes jogadas no canto. Uma está rasgada. A canoa tem uma rachadura pequena no casco. "Vou consertar depois do defeso," pensa ela. Quando o defeso termina, os consertos levam mais uma semana — e ela começa a nova temporada atrasada.

*Consequência:* "Descanso é importante. Mas o defeso também é o melhor momento para manutenção — sem essa pressa não volta ao trabalho."

*Descrição de imagem:* Canoa virada com rachadura visível no casco, rede rasgada ao lado, dias passando numa sequência.

*Escolhas:*
- `"Ainda dá tempo de consertar antes do fim do defeso"` → cena `d4b_parcial` · score: 5

*(avanço automático)*

---

**CENA 3C — `d3c_aprendizado`** *(outcome: normal)*

*Narração:*
> Maria abre o app da Rota da Pesca e passa os dias do defeso completando lições sobre manejo sustentável, normas do defeso e acesso a crédito. Aprende que o microcrédito do MIDR pode financiar uma rede nova. Quando o defeso termina, ela sabe mais sobre pesca sustentável do que sabia antes — e já tem um plano para a próxima temporada.

*Consequência:* "O defeso não precisa ser parada. Pode ser aula."

*Descrição de imagem:* Maria sentada na beira do rio com o celular, app aberto, pôr do sol dourado no Rio Amazonas.

*Escolhas:*
- `"Enquanto aprendo, também cuido do equipamento"` → cena `d4a_preparada` · score: 9

*(avanço automático)*

---

**CENA 3D — `d3d_renda_alternativa`** *(outcome: normal)*

*Narração:*
> Seu Raimundo sugere: "Você sabe consertar redes. Outros pescadores pagam por isso. E tem o benefício do município para quem perdeu o cadastro — precisa ir à Colônia de Pescadores." Maria age rápido: em dois dias, está consertando redes por encomenda e conseguiu um auxílio emergencial da Colônia. Não é o ideal, mas é o suficiente.

*Consequência:* "A comunidade dos pescadores se apoia. A Colônia de Pescadores existe para isso."

*Descrição de imagem:* Maria consertando rede para vizinho na beira do rio, cédulas dobradas no bolso do avental.

*Escolhas:*
- `"Próximo ano, não erro mais"` → cena `d4c_licao_aprendida` · score: 7

*(avanço automático)*

---

**CENA 3E — `d3e_culpa`** *(outcome: ending_bad)*

*Narração:*
> Maria passa o defeso reclamando. Não conserta as redes. Não busca renda alternativa. Não aprende nada novo. Quando o defeso termina, as redes estão piores, a canoa tem um furo maior e ela começa a temporada sem dinheiro, sem estrutura e com o moral lá embaixo. O Rio continua lá. Mas Maria não estava preparada para aproveitá-lo.

*Consequência:* "A culpa não resolve nada. A ação resolve. Cada dia do defeso é um dia que pode ser usado ou desperdiçado."

*Descrição de imagem:* Maria sentada na beira do rio olhando para a água, expressão vazia, redes emboloradas ao fundo.

*outcome: ending_bad*

---

**CENA 4A — `d4a_preparada`** *(outcome: ending_good)*

*Narração:*
> O apito da embarcação marca o fim do defeso. Maria é a primeira na água. Rede nova, canoa calafetada, motor revisado. E no bolso, o número do agente de crédito do MIDR que conheceu no app. Dois meses depois, ela fecha a melhor temporada dos últimos cinco anos. "O defeso não me parou," conta ela para Seu Raimundo. "Ele me preparou."

*Consequência:* "Quem usa o defeso para se preparar pesca mais quando o defeso termina. Simples assim."

*Descrição de imagem:* Maria na canoa no rio, rede lançada, amanhecer dourado no Amazonas, expressão de satisfação.

*outcome: ending_good*

---

**CENA 4B — `d4b_parcial`** *(outcome: ending_neutral)*

*Narração:*
> Maria conserta o essencial na última semana do defeso. A rachadura da canoa é tampada com improviso — funciona, mas não é a solução ideal. Quando o defeso termina, ela sai para pescar alguns dias depois de todos. A temporada começa com atraso, mas começa. "Da próxima vez, faço diferente," ela pensa.

*Consequência:* "Melhor tarde do que nunca. Mas na pesca, quem chega cedo apanha o peixe. Planejamento faz diferença."

*Descrição de imagem:* Maria na beira do rio terminando de consertar canoa, sol já baixo, outros barcos já saindo ao fundo.

*outcome: ending_neutral*

---

**CENA 4C — `d4c_licao_aprendida`** *(outcome: ending_neutral)*

*Narração:*
> O defeso termina. Maria não recebeu o seguro, mas sobreviveu com os consertos de redes e o auxílio da Colônia. Ela anota no caderno: "Próximo defeso — cadastrar no INSS no primeiro dia. Guardar 1 mês de economia antes do defeso." Já sabe o que precisa. Agora é só não esquecer.

*Consequência:* "Errar uma vez é aprender. Errar duas vezes é descuido. Maria escolheu aprender."

*Descrição de imagem:* Maria escrevendo num caderno à luz de lamparina, expressão determinada, o rio visível pela janela.

*outcome: ending_neutral*

---

**Mapa da história:**
```
d1_inicio
├── "Vou hoje mesmo"         (10) → d2a_cadastro_ok
│     ├── "Consertar redes"  (10) → d3a_manutencao → d4a_preparada  ✅ FINAL BOM
│     ├── "Descansar"        ( 4) → d3b_descanso   → d4b_parcial    ➡ FINAL NEUTRO
│     └── "Estudar no app"   ( 8) → d3c_aprendizado→ d4a_preparada  ✅ FINAL BOM
└── "Deixo para amanhã"      ( 3) → d2b_atraso
      ├── "Buscar renda"     ( 7) → d3d_renda_alt  → d4c_licao      ➡ FINAL NEUTRO
      └── "Culpar os outros" ( 1) → d3e_culpa                       ❌ FINAL RUIM
```

**Pontuação:**
- Score máximo possível: 30 (10+10+10)
- Final Bom (≥71%): ≥22 pontos → `ending_good` → +150 XP +2 coins + badge
- Final Neutro (41–70%): 13–21 pontos → `ending_neutral` → +80 XP
- Final Ruim (≤40%): ≤12 pontos → `ending_bad` → +30 XP

---

**Instruções para montagem no Studio:**

1. Criar nova história em `/studio/story`
2. Criar os personagens na aba "Characters" com as descrições acima (usar IA para gerar as imagens com os prompts fornecidos)
3. Criar cada cena na aba "Scenes" com:
   - `_id` exatamente como definido acima
   - `title` = nome da cena
   - `description` = texto de narração
   - `image_prompt` = descrição de imagem para geração IA
   - `consequence` = texto de consequência (quando existir)
   - `outcome` = `normal` / `ending_good` / `ending_bad` / `ending_neutral`
   - `next_scenes[]` = lista de escolhas com `scene`, `text` e `score`
4. Configurar `transition.type = "button"` para cenas com escolhas, `"auto"` para cenas com uma única saída
5. Testar no preview antes de vincular à trilha

**Cena 2B — Sem CAF:**
> Consequence: "Sem o CAF, não é possível acessar o PRONAF. O CAF é o Cadastro de Agricultor Familiar — documento gratuito emitido pela EMATER."
> "O atendente sugere que o senhor volte após tirar o CAF. O senhor..."

Escolhas:
- "Anoto o que preciso e volto preparado" → Cena 3C (score: 5)
- "Desisto e vai embora" → Final Ruim (score: 0)

**Final Bom:** "Seu Zé saiu do banco com a aprovação do PRONAF B. Com R$25.000, ele vai renovar as colmeias e dobrar a produção de mel."

**Final Neutro:** "Seu Zé aprendeu o que precisa para voltar preparado. Na próxima vez, ele vai chegar com o CAF."

**Final Ruim:** "Sem o crédito, Seu Zé perdeu a oportunidade. A próxima reunião do mutirão só acontece em 6 meses."

---

#### 🐟 "A Pesca e o Defeso" — Rota da Pesca

**Personagens:** Pedro (pescador), Fiscal do IBAMA, Dona Maria (esposa)

**Cena 1 — Início do defeso:**
> "É novembro. O período de defeso começou. Os peixes estão se reproduzindo. Pedro olha para o rio e pensa nos filhos em casa. Seu amigo chama: 'Vamos pescar, ninguém vai ver!'"

Escolhas:
- "Não. Vou respeitar o defeso e acionar o Seguro Defeso" → Cena 2A (score: 10)
- "Vou pescar — a família precisa comer" → Cena 2B (score: 0)

**Cena 2A — Decisão correta:**
> "Pedro acessa o Rota Viva e descobre que tem direito ao Seguro Defeso pelo RGP. Um salário mínimo por mês durante o defeso."

Escolhas:
- "Acesso o benefício pelo app" → Final Bom (score: 10)
- "Não sei como acessar, desisto" → Cena 3B (score: 3)

**Cena 2B — Pescando no defeso:**
> Consequence: "O fiscal do IBAMA aparece. Multa de R$700 por peixe capturado fora do período. O barco é apreendido."
> "Pedro perdeu o barco e ainda vai responder por crime ambiental."
→ Final Ruim

**Final Bom:** "Pedro recebeu o Seguro Defeso, protegeu o rio e os peixes se reproduziram. Na temporada seguinte, a pesca foi melhor do que nunca."

---

### Impacto Octalysis

| Core Drive | Como é ativado |
|-----------|---------------|
| **CD1 — Epic Meaning** | Situações reais com consequências reais para a família do produtor |
| **CD2 — Development** | Score cresce com boas decisões; tentar de novo melhora o resultado |
| **CD3 — Empowerment** | O usuário é o protagonista — suas escolhas determinam o rumo |
| **CD7 — Unpredictability** | Não sabe o final até tomar as decisões — cria tensão narrativa |
| **CD8 — Loss Avoidance** | Final ruim = XP menor, oportunidade perdida na narrativa |

### O que implementar

**No Funifier Studio (`/studio/story`):**
- [ ] Campo `score` (0–10) nos itens de `next_scenes` na tabela de escolhas
- [ ] Campo `outcome` nas cenas: select com "normal / final_bom / final_ruim / final_neutro"
- [ ] Campo `consequence` nas cenas: textarea no modal de edição
- [ ] Campo `video_id` nas cenas: alternativa à imagem para cenas em vídeo (Cloudflare Stream)
- [ ] Substituir todos os `alert()` por `Notification.success/error` (service já injetado)
- [ ] Indicador visual ⚠️ em cenas sem `next_scenes` e sem `outcome` definido

**No app Rota Viva:**
- [ ] Tipo de lição `story` na diretiva `duo-trail` (ícone `fa-book-open`, bolinha maior com brilho)
- [x] Diretiva `<rv-story>` criada em `app/directives/story/story.js` + `story.html` — adaptada do Studio, prefixos `rv-story-*`, FontAwesome, `var(--color-primary)`, `ApiService` substituindo `Marketplace.auth`
- [x] Rota `/story/:storyId` adicionada em `app.js` → `StoryCtrl`
- [x] `trail.js`: tipo `cartoon` redirecionado para `/story/:contentId` (em vez de `/quiz/`)
- [x] `pages/story/story.js` — `StoryCtrl`: lê parâmetros de URL, `handleStoryComplete()` calcula estrelas, salva `rv_cartoon_scores`, chama `logAction`, invalida cache da trilha
- [x] `pages/story/story.html` — tela com header, `<rv-story>`, overlay de conclusão com confetti + estrelas
- [x] `services/api.js`: `getStory()`, `getStoryCharacters()`, `getStoryScenes()` adicionados
- [ ] Tela de consequência entre escolha e próxima cena (nice-to-have — a diretiva já avança automaticamente)
- [ ] Opção "Tentar novamente" no final ruim
- [ ] Challenge `historia_decisiva` no Studio (+150 XP + 2 coins + badge)

---

## M. Desafio em Grupo/Família

> **Status:** Em planejamento — mecânica ainda não aprovada para implementação. Separado do item B para maturar separadamente.

### Contexto

O secretário quer ver desafios onde pai e filho precisam trabalhar juntos. A ideia do "Desafio Duo" foi discutida mas ainda precisa ser simplificada e validada antes de entrar no roadmap de implementação. Este item guarda o planejamento para discussão futura.

### Questões abertas antes de implementar

1. Como garantir que os dois participantes são realmente pai e filho (anti-fraude sem fricção excessiva)?
2. O passo 2 pode ser completado dias depois do passo 1 — como tratar expiração?
3. O post composto (foto A + foto B lado a lado) é desejável ou complica demais a UX?
4. Vale criar a coleção `familia_vinculo__c` antes de ter o Desafio Duo, ou só quando o Duo for implementado?

### Mecânica planejada (rascunho)

**Cenários de vínculo familiar:**

| Cenário | Situação | Comportamento |
|---------|----------|---------------|
| A | Só um dos dois tem conta | DIY individual com convite embutido na tela de celebração |
| B | Os dois têm conta, sem vínculo | Busca por CPF + vinculação voluntária + badge de bônus |
| C | Os dois têm conta e estão vinculados | Desafio Duo completo com post composto e celebração |

**Lição tipo Duo (Cenário C — vinculados):**
```
PASSO 1 (qualquer um dos dois inicia):
  "Mostre como você ensina alguém da família
   a fazer parte do seu trabalho"
  → Foto ou vídeo ≤ 30s

PASSO 2 (o outro completa, a qualquer momento):
  "Mostre o que você aprendeu com sua família hoje"
  → Foto ou vídeo ≤ 30s
```

**Tela de celebração — Duo Completo:**
```
[celebration/2.png — círculo de mãos]

"Legado Completo!"
"Você e [Nome] fizeram isso juntos."

+200 XP · +3 Coins · Badge "Legado do Campo"

[Preview do post composto lado a lado]
[Publicar na Galeria]
```

**Notificações push tipo família:**
```
Tipo 1 — Atividade do familiar: "Seu pai João completou mais uma lição."
Tipo 2 — Marco do familiar:    "Seu filho Pedro completou 20 lições!"
Tipo 3 — Duo aguardando:       "Seu pai completou o Passo 1. Ele está esperando você!"
Tipo 4 — Convite aceito:       "[Nome] entrou no Rota Viva pelo seu convite!"
```

**Coleções necessárias:**
```json
familia_vinculo__c:
{
  "player_a": "CPF_pai",
  "player_b": "CPF_filho",
  "tipo": "pai_filho",
  "status": "ativo",
  "vinculado_em": { "$date": "..." }
}
```

**Anti-fraude:**
- Badge exige dois arquivos de mídia reais de dois CPFs distintos
- Vínculo por CPF é rastreável e cruzável com CAF familiar
- Recompensa moderada (100 XP + 1 badge) — sem incentivo econômico para fraude
- Índice de crédito validado pelo banco, não só pelo app

### O que implementar (quando aprovado)

- [ ] Coleção `familia_vinculo__c` no Studio
- [ ] Campo `extra.familia_ref` no fluxo de cadastro
- [ ] Challenge `desafio_duo_legado` (+200 XP + 3 coins para ambos)
- [ ] Challenge `badge_legado_campo` (vínculo ativo → badge)
- [ ] Tipo de lição `duo` na diretiva `duo-trail`
- [ ] Fluxo Duo Completo: post composto + celebração com `celebration/2.png`
- [ ] Seção "Minha Família" no Perfil ampliada (estado com vínculo + badge Duo)
- [ ] Busca por CPF de familiar + envio de convite de vinculação
- [ ] Geração de link de convite com `familia_ref`
- [ ] Notificações push tipo família (4 tipos)

---

## H. Auditoria de Gamificação

Verificação completa de que os pontos estão sendo registrados corretamente e aparecendo no frontend.

### Checklist de auditoria

**Actions e Triggers:**
- [ ] `logAction('complete_lesson', { type: 'video' })` — dispara corretamente?
- [ ] `logAction('complete_lesson', { type: 'quiz' })` — XP proporcional ao acerto?
- [ ] `logAction('complete_lesson', { type: 'diy' })` — registra após envio da foto?
- [ ] `logAction('complete_lesson', { type: 'essay' })` — VOZ points concedidos?
- [ ] `logAction('complete_lesson', { type: 'chest' })` — challenge `licao_de_bau` disparando?

**Challenges e Recompensas:**
- [ ] Challenges de XP configurados e disparando via actionLog trigger no Studio?
- [ ] Coins do baú (`licao_de_bau`): challenge existe no Studio e frontend dispara trigger?
- [ ] Streak: calculando corretamente (1 ação/dia mantém streak)?
- [ ] Nível temático: threshold de XP por nível definido e aplicado?

**Frontend:**
- [ ] XP exibido no header (trilha, galeria, perfil) atualiza após conclusão?
- [ ] Coins exibidos no header atualizam após ganho?
- [ ] Badges na seção Conquistas do Perfil: earned colorido, locked cinza?
- [ ] Streak exibido corretamente no header?

**Dados:**
- [ ] `folder_log` registrado com campos corretos após cada lição?
- [ ] `action_log` registrado para cada `logAction` chamado?
- [ ] `post__c` com campo `created` no formato BSON `{"$date": "..."}` (já corrigido)?

---

## Análise Octalysis — Diagnóstico Atual

### Score por Core Drive

```
CD1 — Epic Meaning & Calling        ████████░░  8/10
  ✅ Missão MIDR / governo federal — fortíssima
  ✅ Cartão do Produtor emitido pelo ministério
  ✅ Índice Rota Viva influencia crédito real (proposta)
  ⚠️ Falta: conexão explícita entre ação do usuário e política pública no feed

CD2 — Development & Accomplishment  ███████░░░  7/10
  ✅ Trilha estilo Duolingo com progressão clara
  ✅ Sistema XP + nível temático + streak
  ✅ Estrelas por lição
  ⚠️ Falta: trilhas avançadas por competência (item E)
  ⚠️ Falta: confirmação visual de XP após conclusão (auditoria)

CD3 — Empowerment & Feedback        █████░░░░░  5/10
  ✅ DIY — produtor registra e publica
  ✅ Galeria permite expressão criativa
  ✅ Desafio Duo: pai ensina, filho aprende
  ⚠️ Falta: Loja de Dicas (backlog)
  ⚠️ Falta: galeria enriquecida (carrossel, texto sobre imagem)

CD4 — Ownership & Possession        ████░░░░░░  4/10
  ✅ Cartão do Produtor como credencial de identidade
  ✅ Coins acumulados pelo baú
  🔴 CRÍTICO: coins sem destino — Loja de Dicas não implementada
  ⚠️ Badge "Legado do Campo" (novo — a implementar)

CD5 — Social Influence              ██████░░░░  6/10
  ✅ Galeria de Saberes — curtidas, comentários, compartilhamento
  ✅ Stories bar com top usuários (a implementar)
  ✅ Notificações de atividade do familiar (novo)
  ✅ Post composto do Duo Legado na galeria (novo)
  ⚠️ Falta: desafios coletivos por município

CD6 — Scarcity & Impatience         ████░░░░░░  4/10
  ✅ Streak — em risco de perder sequência
  ✅ Mutirão com vagas e contagem regressiva (novo)
  ⚠️ Baú na trilha cria antecipação — visual incompleto
  ❌ Falta: lições Essay com janela de tempo

CD7 — Unpredictability & Curiosity  ████░░░░░░  4/10
  ✅ Baú (chest) — surpresa de recompensa
  ✅ Feed da galeria com variação de conteúdo
  ⚠️ Falta: animação de abertura do baú (item 2 do backlog)
  ❌ Falta: eventos especiais, badges surpresa

CD8 — Loss & Avoidance              █████░░░░░  5/10
  ✅ Streak — medo de perder sequência
  ✅ "Seu pai está te esperando no Passo 2" (novo — CD8 emocional)
  ✅ Mutirão: "32 vagas restantes" — urgência real
  ⚠️ Notificações push planejadas, não implementadas

SCORE GERAL: ~5.4/10

PRIORIDADE DE MELHORIA:
  🔴 CD4 — Concluir o baú (coins precisam de destino)
  🟡 CD3 — Galeria enriquecida, lições Duo
  🟡 CD6 — Mutirão com contagem regressiva
  🟢 CD1 — Índice Rota Viva / crédito (proposta para reunião)
```

---

## Evento de Lançamento Presencial

Em parceria com a agência de publicidade.

### Conceito

**"O Dia da Família do Campo"** — mutirão de cadastro presencial + primeiro Desafio Legado ao vivo.

### Formato

```
MANHÃ — Cadastro e primeiro desafio
  → Famílias chegam ao local (área de produção real ou sede da FADEX/cooperativa)
  → Multiplicadores fazem cadastro presencial de pais e filhos juntos
  → Primeiro Desafio Legado ao vivo: foto/vídeo da família na área de produção
  → Animação APNG high five aparece nos dois celulares ao mesmo tempo
  → Telão exibindo o feed da Galeria em tempo real
  → Famílias veem o próprio post aparecer no telão

TARDE — Primeiro mutirão de crédito integrado
  → Operador financeiro (BNB / Banco da Amazônia) presente para triagem
  → Quem tem Cartão do Produtor completo tem acesso prioritário
  → Demonstração ao vivo: "veja seu Índice Rota Viva e seu crédito disponível"
  → MIDR / FADEX presentes para validar elegibilidade
```

### Material para a agência

| Cena | Por que é poderosa |
|------|-------------------|
| Pai e filho olhando juntos para o celular, vendo a animação aparecer | Momento autêntico — não encenado |
| Família vendo o próprio post no telão da galeria | Pertencimento + orgulho |
| Produtor vendo seu Índice Rota Viva e as linhas de crédito disponíveis | Impacto concreto, tangível |
| Depoimento espontâneo: "Meu filho me ensinou a usar o app" | Inversão de papel — narrativa forte |

### Por que gera conteúdo orgânico

1. Produtores compartilham fotos e vídeos do evento nos grupos de WhatsApp das associações
2. A animação de high five nos dois celulares é visualmente marcante — convida curiosidade
3. Associações repostam → produtores de municípios vizinhos querem saber o que é
4. "Lá tem crédito" → esse é o gatilho de entrada mais poderoso para o público-alvo

### Integração com o Instagram (item K)

Durante o evento, a equipe da agência de publicidade faz a cobertura ao vivo pelo Instagram `@rotaviva.midr`:

- Live transmitida durante o primeiro Desafio Legado ao vivo (15–20 min)
- Stories com cenas das famílias vendo o próprio post no telão
- Reel do evento publicado no mesmo dia (compilado de 30–60s)
- Carrossel "o que aconteceu" publicado 2 dias depois com fotos de alta qualidade

---

## Horizontes de Implementação

### Horizonte 0 — Para a reunião (antes de 2026-04-22) — sem desenvolvimento de frontend

Tudo via configuração no Studio e redes sociais:

- [ ] Criar 7 lições DIY família no Studio (ver exemplos da seção J) para Mel e Pesca
- [ ] Configurar perguntas de Escuta Ativa sobre família no Studio (ver seção J)
- [ ] Cadastrar modalidades de crédito em `programa__c` (PRONAF A, PRONAF B, Microcrédito MIDR)
- [ ] Criar `operador_credito__c` com operadores por estado
- [ ] Criar custom page Studio "Família no Rota Viva" para apresentar ao secretário
- [ ] Criar post de mutirão de exemplo no perfil MIDR na Galeria (com botão CTA)
- [ ] Criar perfil Instagram `@rotaviva.midr` com email `funifier.agent.dev01+rotaviva@gmail.com`
- [ ] Publicar os primeiros 3 posts no Instagram (Semana 1 do calendário)

### Horizonte 1 — Sprint curto (2-3 semanas)

**Família:**
- [ ] Coleção `familia_vinculo__c` + fluxo de vinculação por CPF + link de convite
- [ ] Coleção `relacionamento__c` + fluxo de marcação de pessoas nas publicações (item I)
- [ ] Tipo de lição `duo` na diretiva `duo-trail`
- [ ] Tela de celebração DIY família com APNG `family/1.png`
- [ ] Tela de celebração Duo Completo com APNG `family/2.png` + post composto
- [ ] Slot #familia fixo no Stories bar da Galeria
- [ ] Seção "Minha Família" no Perfil
- [ ] Notificações push tipo família (4 tipos)
- [ ] Sugestão de vínculo familiar ao marcar pai/filho/mãe/filha sem vínculo ativo

**Créditos:**
- [ ] Campo `estado` + `municipio` obrigatórios no cadastro (item A — campo estado)
- [ ] Coleções `mutirao__c` e `mutirao_inscricao__c`
- [ ] Seção "Créditos" no Perfil — bloqueada sem Cartão emitido
- [ ] Diagnóstico de elegibilidade: 3 perguntas + resultado personalizado + roteamento por estado
- [ ] Índice Rota Viva: cálculo e exibição no card de crédito
- [ ] CTA "Me inscrever" em posts de mutirão na galeria

**Outros:**
- [ ] Fix: DIY permite concluir sem aceite (item D)
- [ ] Modal de rota na tela de login (item C)
- [ ] Baú completo: overlay animação + toast coins + rodapé social (backlog item 2)
- [ ] Auditoria completa de gamificação (item H)

### Horizonte 2 — Médio prazo (4-6 semanas)

- [ ] Galeria F1: vídeo autoplay no feed (Cloudflare Stream + IntersectionObserver)
- [ ] Galeria F2: carrossel de fotos + campo `media_items[]`
- [ ] Galeria F3: texto sobre imagem (Canvas API)
- [ ] Galeria F5: botão CTA com link posicionável sobre a imagem (item F — Fase 5)
- [ ] Hashtags: campo `tags[]` + busca por hashtag na galeria (item G)
- [ ] Notificações para pessoas marcadas em posts (item I)
- [ ] **História Interativa — Studio** (item L): score em `next_scenes`, `outcome`, `consequence`, `video_id`, substituir `alert()` por `Notification`, indicador ⚠️ de cenas sem saída
- [x] **História Interativa — App** (item L): diretiva `<rv-story>` criada, rota `/story/:id`, `StoryCtrl`, `trail.js` redireciona `cartoon → /story/`, `logAction` + estrelas implementados
- [ ] **História Interativa — App restante** (item L): "Tentar novamente" no final ruim, challenge `historia_decisiva` no Studio, ícone diferenciado na `duo-trail`
- [ ] Trilhas avançadas: desbloqueio por competência mínima (item E)
- [ ] Stories bar completo com algoritmo de ranking (backlog item 3)
- [ ] Scroll infinito do feed (backlog item 10)
- [ ] Cache da trilha localStorage MVP (backlog item 9)
- [ ] Termos e Política na Gamificação Central (backlog item 1)
- [ ] Alterar Senha logado (backlog item 4)
- [ ] Loja de Dicas — depende do baú completo (backlog item 6)

### Horizonte 3 — Backlog longo prazo

- [ ] Galeria F4: música sobre vídeo/foto
- [ ] PWA completo: IndexedDB, Background Sync, Web Push (backlog item 7)
- [ ] OTP via WhatsApp para login sem senha (backlog item 5)
- [ ] Feed V2: score de relevância server-side (backlog item 10)
- [ ] Desafios coletivos por município (CD5 territorial)
- [ ] Lição Essay com janela de tempo (CD6)
- [ ] Modo offline completo com sync de fila

---

# Credenciais de Acesso

## Token Gamificacao Rota do Mel
Basic NjljNThkMjRlNjY1MGUyNmRhZDIxNTM3OjY5YzU5MWEyZTY2NTBlMjZkYWQyMmNmNw==

## Token Gamificacao Rota da Pesca
Basic NjljNThkNGRlNjY1MGUyNmRhZDIxNWIyOjY5YzU5MWVkZTY2NTBlMjZkYWQyMmRkMQ==

## Rota Viva Gmail Account
Login: rotaviva.app@gmail.com
Senha: Funifier123@

## Rota Viva Instagram Account
Login: rotaviva.app@gmail.com
Senha: Funifier123@
