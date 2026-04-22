# Especificação da Landing Page — Rota Viva

**Versão:** 1.0.0
**Data:** 2026-03-30
**Autor:** Jarvis (com contribuições conceituais de Mr. Beast, Yu-Kai Chou e Copywriter do Sertão)

---

## O que é o Rota Viva

O **Rota Viva** é um aplicativo mobile (PWA) de aprendizado gamificado voltado para produtores rurais brasileiros. O projeto é uma iniciativa do **Ministério da Integração e do Desenvolvimento Regional (MIDR)**, executada pela FADEX e UFPI, e atende dois públicos em regiões distintas:

- **Apicultores do Piauí** — trilha *Colmeia Viva*, com foco em apicultura sustentável, regularização da produção e acesso a mercados
- **Pescadores artesanais do Amapá** — trilha *Rio em Movimento*, com foco em pesca responsável, organização econômica e políticas públicas do setor

O app funciona no celular, sem necessidade de download, e opera offline — pensado para produtores em áreas remotas com conexão instável. A experiência é construída em trilhas de aprendizado com vídeos curtos, quizzes e missões de campo, usando mecânicas de gamificação (pontos, conquistas, ranking) para manter o engajamento.

A meta é alcançar **25.000 produtores** no lançamento previsto para **Maio de 2026**.

---

## 1. Contexto e Objetivo

A landing page do Rota Viva é o **único ponto de entrada público** do projeto. Um único domínio atende todos os perfis — apicultores do Piauí e pescadores do Amapá chegam na mesma URL.

| Parâmetro | Valor |
|-----------|-------|
| Domínio | único (a definir) |
| Rotas atendidas | Colmeia Viva (Mel / Piauí) + Rio em Movimento (Pesca / Amapá) |
| CTA principal | **"Comece agora"** → abre PWA (tela de cadastro/login) |
| Público primário | O próprio produtor (apicultor ou pescador) — acesso direto |
| Meta de usuários | 25.000 produtores |
| Lançamento | Maio 2026 |

### 1.1 O que a página precisa fazer

1. **Identificar o visitante** — ele entende em 3 segundos que a página é para ele
2. **Criar desejo** — mostrar o benefício concreto, não a ferramenta
3. **Remover fricção** — um único botão, sem formulário de captura prévia
4. **Ativar** — levar ao cadastro no PWA com contexto claro de qual rota escolher

---

## 2. Estratégia de Copy

### 2.1 Princípios (Copywriter do Sertão)

- **Produtor como herói** — nunca como beneficiário passivo de projeto
- **Zero jargão de edital** — banido: "fortalecimento de capacidades", "protagonismo", "empoderamento", "beneficiários"
- **Concreto > abstrato** — sempre: "aprenda a emitir a NF-e" em vez de "regularize sua atividade"
- **Linguagem de conversa** — como se um parceiro de confiança explicasse, não uma instituição
- **Urgência real** — prazo de lançamento (Maio/2026), vagas limitadas por rota, números reais quando disponíveis

### 2.2 Princípios de gancho (Mr. Beast)

- **Headline = benefício concreto + número real + quem se beneficia**
  - Modelo: `[Quem você é] pode [resultado específico] [em quanto tempo / com quê]`
  - Exemplo Mel: *"Apicultor do Piauí: aprenda a vender mel com nota fiscal em 15 dias"*
  - Exemplo Pesca: *"Pescador do Amapá: descubra os programas que pagam para você pescar melhor"*
- **Padrão de interrupção visual** — imagem real de produtor trabalhando, não ilustração genérica
- **FOMO com prazo real** — mencionar abertura em Maio/2026 como evento, não como "em breve"
- **Prova social imediata** — número de produtores inscritos (dinâmico, atualizar após lançamento) ou depoimento de piloto

### 2.3 Ativação de Core Drives (Yu-Kai Chou — Octalysis)

| Drive | Como ativar na landing |
|-------|----------------------|
| **Epic Meaning** — "faço parte de algo maior" | Mostrar o mapa do Brasil com as rotas; "25.000 produtores construindo o futuro da apicultura/pesca no Brasil" |
| **Social Influence** — vejo quem já está lá | Contador ao vivo de inscritos; depoimento curto de produtor real (foto + nome + cidade) |
| **Scarcity** — posso perder a janela | "Abertura oficial: Maio 2026 — cadastro antecipado aberto agora" |
| **Accomplishment** — quero ver o progresso | Preview do caminho em S (bolinha da trilha) para mostrar como a jornada funciona |
| **Unpredictability** — o que vou encontrar? | "Cada lição tem uma surpresa — missões de campo com recompensas em [créditos]" |

> **Créditos:** valor a ser preenchido quando definido. Placeholder nos textos: `[X créditos]`.

---

## 3. Arquitetura da Página

A página tem estrutura única com **duas seções de rota** embutidas — o visitante rola e encontra a seção do seu perfil. Não há página separada por rota; o PWA lida com a diferenciação após o cadastro.

```
┌─────────────────────────────────────┐
│  SEÇÃO 0 — Hero                     │  ← identidade imediata + split de rota
├─────────────────────────────────────┤
│  SEÇÃO 1 — Como funciona            │  ← 3 passos simples
├─────────────────────────────────────┤
│  SEÇÃO 1b — Prova social (rápida)   │  ← contador + 1 depoimento (conversão antecipada)
├─────────────────────────────────────┤
│  SEÇÃO 2 — Para quem é              │  ← cards Mel + Pesca com âncoras
├─────────────────────────────────────┤
│  SEÇÃO 3 — Rota do Mel              │  ← foto apicultor + benefícios específicos
├─────────────────────────────────────┤
│  SEÇÃO 4 — Rota da Pesca            │  ← foto pescador + benefícios específicos
├─────────────────────────────────────┤
│  SEÇÃO 5 — O que você conquista     │  ← badges, certificado, ranking (novo)
├─────────────────────────────────────┤
│  SEÇÃO 6 — Jovem Multiplicador      │  ← público secundário com CTA próprio (novo)
├─────────────────────────────────────┤
│  SEÇÃO 7 — CTA final + FAQ          │  ← fechar objeções + botão
└─────────────────────────────────────┘
```

### Decisão sobre as imagens hero

As imagens `prompt-2-v2.png` (apicultor) e `prompt-3-v2.png` (pescador) foram criadas em par — mesmo layout, mesmo headline, formas geométricas idênticas, botão amarelo (Mel) / azul (Pesca).

**Estratégia adotada: hero único + imagem por seção de rota.**
- **SEÇÃO 0 (hero global):** usa `prompt-2-v2.png` (apicultor) como imagem padrão — mais universal visualmente, tom quente
- **SEÇÃO 3 (Rota do Mel):** usa `prompt-2-v2.png` como header da seção
- **SEÇÃO 4 (Rota da Pesca):** usa `prompt-3-v2.png` como header da seção

**Por que não carrossel:** ambas as imagens têm o mesmo headline — o carrossel não acrescentaria informação nova. Público com menor literacia digital tende a não perceber slides adicionais no mobile. Carrosséis reduzem conversão por não direcionar a ação.

---

## 4. Detalhamento por Seção

---

### SEÇÃO 0 — Hero

**Objetivo:** Em 3 segundos o produtor entende que a página é para ele, escolhe sua rota e clica no CTA.

#### Layout

```
[LOGO ROTA VIVA]    [MIDR] [FADEX] [UFPI]          [Entrar]

─────────────────────────────────────────────────────────────
HEADLINE PRINCIPAL (H1)
SUBHEADLINE (H2)

┌──────────────────────┐   ┌──────────────────────┐
│  🐝 Sou apicultor    │   │  🐟 Sou pescador      │
│  (Piauí)             │   │  (Amapá)              │
└──────────────────────┘   └──────────────────────┘

[Descobrir minha rota]  ← botão primário, amarelo

✔ Mais de 5.000 produtores inscritos  |  Gratuito  |  Sem download
─────────────────────────────────────────────────────────────
[Foto: apicultor com quadro de mel — prompt-2-v2.png — full bleed]
```

> **Comportamento dos botões de identidade:** clicar em "Sou apicultor" faz scroll suave para `#rota-mel`; "Sou pescador" para `#rota-pesca`. O botão "Descobrir minha rota" leva para `[PWA_URL]/cadastro` sem parâmetro de rota (usuário escolhe dentro do app).

#### Copy

**Headline (H1):**
> *Regularize. Organize. Venda mais.*

**Subheadline (H2):**
> *O programa do Governo Federal para apoiar o produtor rural no acesso a crédito, regularização e mercado. No celular, mesmo sem internet.*

**Nota de urgência (abaixo do CTA):**
> Abertura em Maio de 2026 — cadastre-se agora para entrar na primeira turma.

**Botão CTA:**
> **Descobrir minha rota** — é gratuito

#### Visual
- Foto `doc/assets/prompt-2-v2.png` — full bleed, overlay rgba(0,0,0,0.30)
- Logos MIDR, FADEX, UFPI visíveis no topo (ao lado do logo Rota Viva) — sinal de confiança antes do scroll
- Botão CTA: Amarelo Brasil `#FFDF00`, texto `#222222`, `border-radius: 8px`
- Botões de identidade ("Sou apicultor" / "Sou pescador"): outline branco, sem preenchimento — clique faz scroll até a rota
- **Formas geométricas nos cantos** (parcialmente cortadas, conforme `prompt-2-v2.png`):
  - Canto esquerdo: círculo azul `#1351B4`
  - Canto superior direito: retângulo amarelo `#FFDF00`
  - Canto inferior direito: círculo verde `#009C3B`
  - Canto superior esquerdo: quadrado vermelho `#EF3E42`

---

### SEÇÃO 1 — Como funciona

**Objetivo:** Remover dúvida de complexidade. "É simples, faço do celular."

#### Layout — 3 cards horizontais (desktop) / empilhados (mobile)

```
┌──────────┐  ┌──────────┐  ┌──────────┐
│ 1. Entre │  │ 2. Escolha│  │3. Aprenda│
│  no app  │  │ sua rota  │  │ e ganhe  │
└──────────┘  └──────────┘  └──────────┘
```

#### Copy por card

**Card 1 — Entre no app**
- Ícone: celular
- Título: *Cadastre-se em 2 minutos*
- Texto: *Só precisa do seu nome e CPF. Nenhum download — funciona direto no celular.*

**Card 2 — Escolha sua rota**
- Ícone: mapa com pin
- Título: *Apicultura ou pesca?*
- Texto: *Escolha a trilha da sua atividade. O conteúdo é todo pensado para a sua realidade.*

**Card 3 — Aprenda e ganhe**
- Ícone: troféu / estrela
- Título: *Complete lições, ganhe recompensas*
- Texto: *Vídeos curtos, quizzes e missões de campo. Cada tarefa concluída rende [X créditos] e abre novas portas.*

---

### SEÇÃO 1b — Prova Social (rápida)

**Objetivo:** Converter quem já foi convencido pelo hero antes de entrar nas seções longas. Apresentar a prova social **antes** do conteúdo de rota aumenta a confiança de quem ainda está em dúvida.

#### Layout

```
[N] produtores já se inscreveram — Piauí · Amapá

[Foto] "[Depoimento curto — 1 frase]"
       — Nome, apicultor/pescador, Cidade – UF

[Mapa simplificado do Brasil destacando Piauí e Amapá]
```

#### Copy

**Contador:**
> **[N] produtores já se inscreveram**
> Piauí · Amapá · e crescendo

*Pré-lançamento: "Seja um dos primeiros 25.000 produtores a entrar"*

**Depoimento único (o mais forte disponível):**
> *"[1 frase, benefício concreto, linguagem de conversa]"*
> — Foto + **[Nome]**, apicultor/pescador, [Cidade] – [UF]

**Mapa:**
- Mapa esquemático do Brasil com os dois estados destacados (PI em amarelo, AP em azul)
- Legenda: *"10 municípios. 2 estados. Uma só missão."*
- Objetivo: ativar Epic Meaning — o visitante percebe que faz parte de um movimento maior

---

### SEÇÃO 2 — Para quem é

**Objetivo:** Split visual claro — o visitante clica na sua rota e desce direto para a seção específica.

#### Layout — 2 cards lado a lado (ou empilhados no mobile)

```
┌──────────────────────┐  ┌──────────────────────┐
│  🐝 Rota do Mel      │  │  🐟 Rota da Pesca    │
│  Colmeia Viva        │  │  Rio em Movimento     │
│  Para apicultores    │  │  Para pescadores      │
│  do Piauí            │  │  do Amapá             │
│                      │  │                       │
│  [Ver minha rota ↓]  │  │  [Ver minha rota ↓]  │
└──────────────────────┘  └──────────────────────┘
```

#### Visual
- Card Mel: fundo `#FFFFFF`, borda esquerda `4px solid #FFDF00`, ícone abelha em amarelo `#FFDF00`
- Card Pesca: fundo `#FFFFFF`, borda esquerda `4px solid #1351B4`, ícone peixe em azul `#1351B4`
- Botão "Ver minha rota ↓": outline, cor da borda = cor do card; faz scroll suave até a seção (âncora `#rota-mel` / `#rota-pesca`)

---

### SEÇÃO 3 — Rota do Mel — Colmeia Viva {#rota-mel}

**Objetivo:** Apicultor do Piauí se reconhece, vê benefícios concretos da sua realidade e clica para entrar.

#### Layout

```
[IMAGEM HEADER: prompt-2-v2.png — apicultor com favo, full width, overlay leve]

[HEADLINE ESPECÍFICA MEL]
[SUBHEADLINE]

[5 benefícios concretos]   |  [Preview do caminho em S — screenshot do app]

[Depoimento — produtor real, nome + cidade PI]

[ENTRAR NA COLMEIA]
```

#### Copy

**Headline (H2):**
> *Apicultor do Piauí: seu mel vale mais quando você conhece as regras do jogo.*

**Subheadline:**
> *Vídeos curtos, missões práticas e trilhas de conhecimento — tudo sobre apicultura, políticas públicas e como vender mais, direto no seu celular.*

**5 Benefícios — bullets concretos (não genéricos):**
- ✅ Aprenda a emitir a Nota Fiscal do Produtor Rural — sem sair de casa
- ✅ Descubra como vender seu mel para o governo via PAA e PNAE
- ✅ Entenda o processo de regularização sanitária (SIF/SIM/SISP) passo a passo
- ✅ Conheça os programas de crédito e assistência técnica disponíveis no Piauí
- ✅ Ganhe um certificado oficial de conclusão — emitido por FADEX e UFPI

**Preview do app:**
- Screenshot da trilha (caminho em S com bolinhas) com tema Colmeia Viva
- Legenda: *"Cada bolinha é uma lição. Complete no seu tempo, onde tiver sinal."*

**Depoimento (placeholder):**
> *"Eu não sabia que existia programa para a gente. O app me mostrou em 10 minutos o que demorei anos pra descobrir."*
> — [Nome], apicultor, [Cidade] – PI

**CTA Seção:**
> Botão: **Entrar na Colmeia**
> Cor: `#FFDF00` (Amarelo Brasil) com texto `#222222`
> → abre PWA / cadastro com `?rota=mel`

---

### SEÇÃO 4 — Rota da Pesca — Rio em Movimento {#rota-pesca}

**Objetivo:** Pescador do Amapá se reconhece, vê benefícios concretos da sua realidade e clica para entrar.

#### Layout

```
[IMAGEM HEADER: prompt-3-v2.png — pescador lançando rede, rio ao amanhecer, full width]

[HEADLINE ESPECÍFICA PESCA]
[SUBHEADLINE]

[5 benefícios concretos]   |  [Preview do caminho em S — screenshot do app]

[Depoimento — produtor real, nome + cidade AP]

[ENTRAR NO RIO]
```

#### Copy

**Headline (H2):**
> *Pescador do Amapá: sua pesca tem história e futuro — e o rio te espera.*

**Subheadline:**
> *Trilhas de aprendizado sobre regularização, boas práticas e políticas públicas para pesca artesanal. No celular, mesmo sem sinal.*

**5 Benefícios — bullets concretos (não genéricos):**
- ✅ Entenda como acessar o seguro-defeso e não perder o benefício por falta de documentação
- ✅ Aprenda boas práticas sanitárias para vender seu pescado com mais valor
- ✅ Descubra como formalizar sua atividade e acessar crédito rural
- ✅ Conheça seus direitos no período de piracema e defeso
- ✅ Ganhe um certificado oficial de conclusão — emitido por FADEX e UFPI

**Preview do app:**
- Screenshot da trilha com tema Rio em Movimento
- Legenda: *"Lições de 5 minutos. Missões que você faz no barco ou em casa."*

**Depoimento (placeholder):**
> *"Nunca tinha pensado que um aplicativo podia ser para pescador de verdade. É diferente do que eu imaginava."*
> — [Nome], pescador, [Cidade] – AP

**CTA Seção:**
> Botão: **Entrar no Rio**
> Cor: `#1351B4` (Azul Brasil) com texto `#FFFFFF`
> → abre PWA / cadastro com `?rota=pesca`

---

### SEÇÃO 5 — O que você conquista

**Objetivo:** Mostrar que o Rota Viva é diferente de um PDF do governo — tem progressão, reconhecimento e recompensas reais. Diferenciar pela experiência gamificada.

#### Layout

```
[TÍTULO DA SEÇÃO]

┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│  🏅 XP   │  │🍯 Gotas  │  │🏆 Badges │  │📜 Certif.│
│  Trilha  │  │  de Mel  │  │Conquistas│  │  Oficial │
└──────────┘  └──────────┘  └──────────┘  └──────────┘

[Ranking por município — mapa pequeno com podium]
```

#### Copy

**Título:**
> *Cada lição completada vale algo de verdade.*

**Cards de recompensa:**

| Ícone | Nome | Descrição |
|-------|------|-----------|
| 🏅 | Pontos de Trilha (XP) | Acumule a cada missão. Sobe de nível e desbloqueia conteúdos novos |
| 🍯 | Gotas de Mel / Peixes | Moeda temática da sua rota — ganha em missões longas e colaborações |
| 🏆 | Badges de conquista | Colecionáveis digitais por marcos: primeira trilha, sequência de dias, missão de campo |
| 📜 | Certificado oficial | Ao concluir as trilhas, receba um certificado emitido por FADEX e UFPI |

**Ranking:**
> *"Quem está produzindo mais conhecimento no seu município?"*
> Acompanhe o ranking por cidade — e ajude o seu município a liderar.

---

### SEÇÃO 6 — Jovem Multiplicador

**Objetivo:** Recrutar o público secundário. Jovens que chegam na página precisam de um caminho claro — e esse papel tem benefícios únicos que os diferencia dos outros usuários.

#### Layout

```
[FOTO: jovem em campo com celular]

[HEADLINE]
[SUBHEADLINE]

[3 diferenciais do papel de Multiplicador]

[QUERO SER MULTIPLICADOR]
```

#### Copy

**Headline (H2):**
> *Você tem entre 18 e 35 anos e quer ter um papel de verdade no campo?*

**Subheadline:**
> *O Rota Viva está selecionando Jovens Multiplicadores — agentes de campo que ajudam outros produtores a usar o app e lideram as comunidades nas trilhas de aprendizado.*

**3 diferenciais:**
- 🌟 Formação especial com trilha exclusiva de Jovem Multiplicador
- 🏅 Badge "Abelha-Rainha" / "Guia do Rio" — reconhecimento dentro do app e na comunidade
- 💼 Possibilidade de remuneração como agente de campo (gerenciado pela FADEX)

**CTA:**
> Botão: **Quero ser Multiplicador**
> Cor: Verde Brasil `#009C3B`, texto `#FFFFFF`
> → abre PWA / cadastro com `?perfil=multiplicador`

> *Vagas limitadas por município. Seleção feita pela equipe do projeto.*

---

### SEÇÃO 7 — CTA Final + FAQ

**Objetivo:** Fechar as últimas objeções e converter quem chegou até aqui sem clicar.

#### CTA Final

```
[HEADLINE DE FECHAMENTO]
[SUBHEADLINE CURTO]

[DESCOBRIR MINHA ROTA — é gratuito]
```

**Headline:**
> *Seu conhecimento tem valor. O Rota Viva te ajuda a provar isso.*

**Subheadline:**
> *Gratuito. No celular. Funciona offline. Feito para quem produz no campo.*

**Botão:**
> **Descobrir minha rota — é gratuito**
> Cor: Amarelo Brasil `#FFDF00`, texto `#222222`

---

#### FAQ — 5 perguntas

**1. Isso é mais um programa do governo que vai prometer e não entregar?**
> O Rota Viva é realizado pela FADEX e UFPI com apoio do MIDR — e o app já está funcionando. Você não precisa confiar na promessa: pode entrar, explorar as primeiras lições e ver por você mesmo se vale.

**2. Precisa baixar algum aplicativo?**
> Não. O Rota Viva é um PWA — funciona direto no navegador do celular. Se quiser, pode adicionar na tela inicial como se fosse um app.

**3. Funciona sem internet?**
> Sim. Você pode acessar as lições que já abriu mesmo sem sinal. Quando voltar a ter conexão, o progresso sincroniza automaticamente.

**4. É gratuito mesmo?**
> Sim. O acesso ao Rota Viva é completamente gratuito para produtores rurais.

**5. Preciso ser de uma associação ou cooperativa?**
> Não. Qualquer apicultor ou pescador pode se cadastrar individualmente.

---

### Rodapé

```
Logo Rota Viva

[MIDR — Ministério da Integração e do Desenvolvimento Regional]
[FADEX — Fundação de Apoio ao Desenvolvimento]
[UFPI — Universidade Federal do Piauí]

[Link: Política de Privacidade]  [Link: Termos de Uso]  [Link: Contato]
```

---

## 5. Especificação Visual

### 5.1 Identidade visual — Governo Federal (MIDR)

A landing page segue a **Identidade Visual do Governo Federal Brasileiro** conforme utilizada pelo MIDR. Não usa as paletas de marca das rotas (Mel/Pesca) — essas são exclusivas do app pós-login.

> **Referências visuais obrigatórias:**
> - `doc/assets/midr-banner.png` — padrão geométrico e paleta oficial do MIDR
> - `doc/assets/prompt-2-v2.png` — hero global + header da Seção 3 (apicultor, botão amarelo)
> - `doc/assets/prompt-3-v2.png` — header da Seção 4 (pescador, botão azul)

#### Paleta de cores

| Elemento | Cor | Hex |
|----------|-----|-----|
| Background geral | Branco | `#FFFFFF` |
| Texto principal | Preto editorial | `#222222` |
| Texto secundário | Cinza escuro | `#555555` |
| CTA principal (hero + final) | Amarelo Brasil | `#FFDF00` — texto `#222222` |
| CTA Mel (seção específica) | Amarelo Brasil | `#FFDF00` — texto `#222222` |
| CTA Pesca (seção específica) | Azul Brasil | `#1351B4` — texto `#FFFFFF` |
| Acento / destaques | Verde Brasil | `#009C3B` |
| Link "Entrar" (header) | Azul Brasil | `#1351B4` |

#### Elementos decorativos geométricos

As formas são posicionadas nos cantos da página e em separadores de seção, seguindo o padrão do banner MIDR:

| Forma | Cor | Posição na página |
|-------|-----|------------------|
| Círculo grande | Azul `#1351B4` | Canto esquerdo do hero |
| Retângulo | Amarelo `#FFDF00` | Canto superior direito do hero |
| Círculo médio | Verde `#009C3B` | Canto inferior direito do hero |
| Quadrado pequeno | Vermelho `#EF3E42` | Canto superior esquerdo do hero |
| Variações menores | Verde / Amarelo | Separadores entre seções |

> As formas ficam parcialmente cortadas pela borda da tela — apenas 1/3 a 1/2 da forma é visível, exatamente como no banner MIDR.

#### Tipografia

| Elemento | Valor |
|----------|-------|
| Fonte | `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif` |
| H1 | `clamp(2rem, 5vw, 3.5rem)`, bold, `#222222` |
| H2 | `clamp(1.5rem, 3.5vw, 2.25rem)`, bold, `#222222` |
| Body | `16px` mínimo, `#555555` |
| Botão principal | `18px`, bold |
| Border radius botão | `8px` (retangular — padrão governo, não pill) |
| Padding botão principal | `14px 36px` |

### 5.2 Imagens necessárias

| Posição | Descrição | Formato | Tamanho sugerido |
|---------|-----------|---------|------------------|
| Hero background | Foto real de produtor trabalhando — estilo `hero-apicultor.png` | JPEG/WEBP | 1920×1080px |
| Card Mel (Seção 2) | Apicultor / colmeia — foto real | WEBP | 400×300px |
| Card Pesca (Seção 2) | Pescador / rio — foto real | WEBP | 400×300px |
| Preview App Mel | Screenshot do app com tema dourado | PNG | 320×640px |
| Preview App Pesca | Screenshot do app com tema azul | PNG | 320×640px |
| Depoimentos | Foto real dos produtores depoentes | JPEG, arredondada | 80×80px |

> **Fonte de imagens:** prioritariamente fotos reais dos produtores do projeto. Fallback: Freepik (key: `FPSX69b6861d3b45e4591f8e8d354ebf3ec0`, header `x-freepik-api-key`).

### 5.3 Responsividade

- Mobile-first — público usa celular predominantemente
- Breakpoints: `768px` (tablet), `1024px` (desktop)
- Botão CTA: largura 100% no mobile; auto no desktop
- Cards de rota: empilhados no mobile, lado a lado no desktop
- Hero: foto full-bleed em todos os breakpoints; texto sobre overlay
- Fonte mínima: `16px` (leitura ao sol, tela pequena)

### 5.4 Performance

- Lazy load em todas as imagens abaixo do fold
- Fontes do sistema (sem Google Fonts) — zero latência
- Critical CSS inline no `<head>`
- LCP alvo: < 2.5s em 3G (conexão rural)
- Nenhum cookie de rastreamento de terceiro — apenas analytics próprio

---

## 6. Comportamento dos CTAs

| CTA | URL de destino |
|-----|---------------|
| Hero "Descobrir minha rota" | `[PWA_URL]/cadastro` |
| Hero "Sou apicultor" (âncora) | scroll até `#rota-mel` |
| Hero "Sou pescador" (âncora) | scroll até `#rota-pesca` |
| Seção Mel "Entrar na Colmeia" | `[PWA_URL]/cadastro?rota=mel` |
| Seção Pesca "Entrar no Rio" | `[PWA_URL]/cadastro?rota=pesca` |
| Seção Multiplicador "Quero ser Multiplicador" | `[PWA_URL]/cadastro?perfil=multiplicador` |
| Header "Entrar" | `[PWA_URL]/login` |
| Final "Descobrir minha rota" | `[PWA_URL]/cadastro` |

O PWA usa os parâmetros `rota` e `perfil` para pré-selecionar opções na tela de cadastro (não obrigatório — usuário pode alterar).

---

## 7. Analytics e Métricas de Sucesso

| Métrica | Alvo | Medição |
|---------|------|---------|
| Taxa de conversão hero → CTA clicado | > 8% | Click tracking no botão |
| Taxa de cadastro completo | > 60% dos que clicam no CTA | PWA funnel |
| Tempo médio na página | > 45s | Scroll depth |
| Bounce rate | < 65% | Sessões com 1 pageview |
| Acessos mobile | > 80% | User-agent |

---

## 8. Pendências / Placeholders

| Item | Status | Responsável |
|------|--------|-------------|
| Valor dos créditos / Gotas de Mel (`[X créditos]`) | ❌ A definir | Ricardo |
| Depoimentos reais (texto + foto de produtor) | ❌ Após piloto | Equipe de campo |
| Foto para seção Jovem Multiplicador | ❌ A capturar | Equipe de campo |
| URL definitiva do PWA | ❌ A definir | Ricardo |
| Domínio da landing | ❌ A definir | Ricardo |
| Parâmetro `?perfil=multiplicador` implementado no PWA | ❌ A implementar | Dev |
| Contador de inscritos (fonte de dados em tempo real) | ❌ Após lançamento | Funifier / backend |
| Mapa visual dos 10 municípios (PI + AP) | ❌ A criar | Design |
| Screenshot do app com tema Colmeia Viva (Seção 3) | ❌ Após implementação do app | Dev |
| Screenshot do app com tema Rio em Movimento (Seção 4) | ❌ Após implementação do app | Dev |

---

*Documento gerado em 2026-03-30. Atualizar seção 8 conforme itens forem resolvidos.*
