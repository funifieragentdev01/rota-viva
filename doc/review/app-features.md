# Especificação de Funcionalidades — App Rota Viva (PWA)

**Versão:** 1.1.0
**Data:** 2026-04-06

> Este documento especifica as funcionalidades do PWA Rota Viva: fluxo de cada tela, comportamento offline, regras de negócio e critérios de aceite. Para conteúdo pedagógico (trilhas, lições, questões), ver `trilhas.md`. Para visual e temas, ver `design-system.md`.
>
> **v1.1.0 — Revisão de UX (2026-04-06):** simplificação do menu de 5 para 4 itens; Diário e Escuta Ativa integrados como tipos de lição na Trilha (DIY e Essay); Ranking substituído pela barra de top users na Galeria; Galeria promovida a item fixo do menu; navegação direta para trilha raiz; telefone obrigatório no cadastro. Ver `doc/bmad-review-2026-04-06.md` para o histórico completo da decisão.

---

## Sistema de Pontos e Recompensas

Antes das features, é necessário entender os quatro tipos de pontos — cada um com propósito distinto:

| Moeda | Sigla | Quem ganha | Como | Para que serve |
|-------|-------|-----------|------|----------------|
| Pontos de Trilha | XP | Todos | Completar lições (video, quiz, DIY, essay) | Subir de nível, progressão |
| Gotas de Mel / Peixes | ML / ESP | Todos | Lições longas, publicar na Galeria, streak longa | Moeda temática — futura loja |
| Pontos de Voz | VOZ | Todos | Completar lições do tipo Essay | Mede participação na escuta; relatório MIDR |
| Pontos de Campo | CPO | Multiplicadores | Onboarding de novos produtores | Certificação + bolsa FADEX |

> Recompensas externas (certificado FADEX/UFPI, bolsa Multiplicador) são gerenciadas fora do app. O app emite o badge e registra o marco; a FADEX processa o benefício.

---

## Arquitetura de Navegação

```
Bottom Nav (fixo em todas as telas pós-login)
├── 🏠  Início     → Home screen (XP, streak, card "continue")
├── 🗺️  Trilha     → Trilha raiz da rota (caminho em S) — entra direto, sem tela de lista
├── 🌿  Galeria    → Feed estilo Instagram da comunidade
└── 👤  Perfil     → Perfil, badges, certificados
```

> **Decisão v1.1.0:** menu simplificado de 5 para 4 itens.
> - **Diário do Produtor** integrado como tipo de lição `DIY` dentro da Trilha
> - **Escuta Ativa** integrada como tipo de lição `Essay` dentro da Trilha
> - **Ranking** substituído pela barra de top users no topo da Galeria (ver seção 5)
> - **Galeria** promovida de feature secundária para item fixo do menu

---

## 1. Home Screen (Tela Inicial)

**Propósito:** responder "o que faço agora?" em 2 segundos. A ação principal (continuar a trilha) é sempre o elemento dominante.

### Layout e componentes

| Zona | Componente | Conteúdo |
|------|-----------|---------|
| Topo | Header | Nome da rota + XP total + streak (ícone de raio) |
| Bloco 1 | Card "Continue" | Próxima bolinha da trilha ativa — ícone do tipo, título da lição, botão "Continuar" |
| Bloco 2 | Cards "Hoje" | 1–3 cards menores: Escuta Ativa disponível, missão pendente, ou publicação nova na Galeria |
| Bloco 3 | Preview Galeria | Faixa horizontal: 3 últimas publicações da comunidade (foto, nome, cidade, votos) |
| Rodapé | Bottom Nav | 5 tabs |

### Regras de negócio

- Card "Continue" sempre mostra a **próxima ação não completada** na trilha — nunca uma já concluída
- Se não há trilha ativa: exibir onboarding suave ("Escolha sua primeira trilha")
- Cards "Hoje": prioridade → Escuta Ativa ativa > Missão de campo com deadline > Publicação nova
- Máximo 3 cards em "Hoje" — sem scroll nessa zona
- Preview Galeria: cache offline; se vazio exibir ilustração com "Seja o primeiro a publicar"

### Comportamento offline

- Todo o conteúdo da Home carrega do cache local
- Badge de sincronização pendente (ícone nuvem com relógio) se há dados não sincronizados
- Botão "Continuar" funciona offline se a lição já foi baixada

---

## 2. Trilhas (Caminho em S)

**Propósito:** experiência central de aprendizado. O usuário entra direto na trilha raiz da sua rota — sem tela de lista de trilhas. Toda a jornada de conhecimento, registros de campo e escuta do Ministério acontece aqui.

> **Navegação direta:** ao tocar em "Trilha" no menu, o app busca automaticamente o primeiro folder com `parent: null` e `type: 'subject'` da gamificação da rota e abre esse folder diretamente. Sem tela intermediária.

### Layout e componentes

| Componente | Descrição |
|-----------|-----------|
| Header | Nome da rota, XP, streak |
| Sticky module box | Box do módulo corrente, preso abaixo do header — atualiza conforme o scroll (ver comportamento abaixo) |
| Caminho em S | Bolinhas circulares conectadas por linha curva — uma por lição |
| Bolinha | Ícone do tipo de lição + estado (ativa, completa, bloqueada) |
| Personagem mascote | Aparece a cada 5 bolinhas globais na inflexão da curva S |
| Estrelas | 0–3 estrelas abaixo de bolinhas completadas |

### Estados de bolinha

| Estado | Visual | Ação ao tocar |
|--------|--------|--------------|
| Completa | Cor sólida da rota + estrelas abaixo | Abre conteúdo para revisão |
| Ativa | Cor sólida + borda pulsando | Abre o conteúdo |
| Bloqueada | Cinza escuro, ícone cadeado | Toast: "Complete a lição anterior primeiro" |

### Tipos de lição (bolinhas)

| `folder_content_type` | Ícone | Abre | Comportamento |
|----------------------|-------|------|---------------|
| `video` | `fa-play` | Player de vídeo embutido | Concede XP ao assistir ≥ 80% |
| `quiz` | `fa-star` | Sequência de questões (true/false, múltipla escolha, ouvir e ordenar) | XP proporcional ao acerto |
| `diy` | `fa-camera` | Tela de registro com câmera | Usuário tira foto do seu ambiente/produção + texto curto; concede XP + VOZ ao sincronizar; substitui o Diário do Produtor como feature separada |
| `essay` | `fa-comment` | Formulário de resposta aberta | Pergunta do Ministério (máx. 5 por instrumento); feedback positivo, sem gabarito; concede VOZ points; substitui a Escuta Ativa como feature separada |

### Comportamento do Sticky Module Box (estilo Duolingo)

O módulo corrente é determinado pelo **scroll**, não pelo progresso do usuário:

1. Cada módulo tem um **divisor de texto simples** no flow da trilha: `— Título do Módulo —`
2. Um **sticky box** único fica colado logo abaixo do header, com título e cor do módulo visível no momento
3. Um `IntersectionObserver` monitora os divisores: quando um divisor entra na zona superior da viewport (cruzando o sticky box), o sticky box atualiza para aquele módulo
4. Scroll para baixo → próximo módulo vira corrente; scroll para cima → módulo anterior volta a ser corrente

### Posicionamento do Personagem Mascote

- Um personagem aparece a cada **5 lições globais** (contagem global, não por módulo), posicionado na inflexão da curva S
- Nunca inserido quando o item anterior no array for um divisor de módulo (evita sobreposição visual)
- Personagem fica no lado oposto da curva em relação à bolinha

### Comportamento offline

- Bolinhas e estado de progressão: sempre disponível offline (cache)
- Conteúdo de vídeo: requer download prévio ou conexão; exibe aviso se offline
- Quiz, DIY e essay: funcionam offline; resultado sincroniza ao reconectar
- XP e progresso: concedidos localmente, confirmados após sync

---

## 3. Registrar Evidência via Lição DIY

> **v1.1.0:** o registro de evidências de campo passou a ser uma lição do tipo `DIY` dentro da Trilha, e não mais uma feature ad-hoc separada. O produtor registra foto + texto no contexto de uma atividade de campo definida pela equipe de conteúdo. Ao concluir, pode optar por publicar na Galeria.

### Fluxo (dentro de uma lição DIY na Trilha)

```
1. Usuário toca na bolinha 📷 na trilha
2. Popup com título da lição e botão "Começar"
3. Tela de registro abre com câmera ativa
4. Usuário captura foto (ou faz upload da galeria) — obrigatório
5. Campo de texto: descrição curta (≤ 280 chars) — obrigatório
6. Botão "Registrar" → salva localmente + envia quando tiver conexão
7. Confirmação: animação de XP ganho + pergunta "Quer publicar na Galeria?"
   └── Sim → entra na fila de aprovação para a Galeria
   └── Não → fica apenas como evidência privada no AAGE
```

### Regras de negócio

- Foto é obrigatória — sem foto não há envio
- Todos os registros vão para o AAGE independentemente da escolha de publicar na Galeria
- XP concedido imediatamente ao salvar offline; confirmado após sync

### Comportamento offline

- Foto e texto salvos localmente (IndexedDB)
- Sync automático ao reconectar — sem ação do usuário

### Critérios de aceite

- [ ] Foto capturada ou importada é comprimida antes de salvar (max 1MB)
- [ ] XP é concedido ao salvar (offline) e não duplicado ao sincronizar
- [ ] Vídeos enviados para Galeria não aparecem publicamente antes de aprovação do admin

---

## 4. Escuta Ativa via Lição Essay

> **v1.1.0:** a Escuta Ativa passou a ser uma lição do tipo `Essay` dentro da Trilha — não mais uma feature separada acessada por ícone. O Ministério configura as perguntas via Funifier Studio como lições `Essay` em posições específicas da trilha. O produtor responde naturalmente no fluxo de aprendizado.

### Comportamento da lição Essay

- Pergunta aberta do Ministério (ex: "Como foi sua safra de mel este ano?")
- Máx. 5 perguntas por lição Essay — nunca mais
- **Sem gabarito:** nenhuma resposta é marcada como certa ou errada
- Feedback sempre positivo: "Obrigado por responder" — nunca "Errado"
- Uma lição Essay só pode ser respondida 1x por usuário
- Respostas enviadas ao AAGE via Funifier com tag `escuta_ativa`
- Concede VOZ points ao completar

### Comportamento offline

- Pode ser respondida offline se a lição já foi carregada
- Respostas salvas localmente e sincronizadas ao reconectar
- VOZ points concedidos após sync

### Critérios de aceite

- [ ] Sem nenhuma indicação visual de "certo" ou "errado" em nenhuma resposta
- [ ] VOZ points aparecem no perfil do usuário após sync
- [ ] Respostas offline sincronizam sem perda de dado

---

## 5. Galeria de Saberes

**Propósito:** item fixo do menu principal (tab 3). Espaço comunitário onde produtores compartilham boas práticas com foto, vídeo curto, texto e hashtags. Modelo de feed estilo Instagram — padrão já familiar ao público. O conteúdo aqui não é do projeto — é *dos produtores*.

> **v1.1.0:** Galeria promovida de feature secundária para tab principal do menu. O Ranking de municípios foi substituído pela barra de top users no topo da Galeria. O perfil oficial do MIDR/FADEX no feed substitui a necessidade de uma tela separada de notificações institucionais.

> **Autorização de uso de imagem:** aceita uma única vez nos Termos de Uso no momento do cadastro. Não há confirmação por publicação — mesmo comportamento do Instagram.

### Layout da tela

```
┌─────────────────────────────────────────┐
│  Header: "Galeria"                       │
├─────────────────────────────────────────┤
│  [Barra de Top Users — scroll horizontal] │  ← substitui Ranking
│  [Avatar] [Avatar] [Avatar] [Avatar]...  │
│   Zé · Mel  Maria · Rio  João · Mel ...  │
├─────────────────────────────────────────┤
│  [Post 1 — oficial MIDR/FADEX]           │  ← destaque visual (badge verificado)
│  [Post 2 — produtor]                     │
│  [Post 3 — produtor]                     │
│  ...scroll infinito...                   │
└─────────────────────────────────────────┘
```

### Barra de Top Users (substitui Ranking)

- Lista horizontal scrollável no topo da tela, estilo Stories do Instagram
- Exibe os **5 usuários mais curtidos da semana** por rota (não por município)
- Cada item: avatar circular + nome curto + rota
- Toque no avatar: abre perfil público simplificado do produtor (nome, município, posts públicos)
- Calculado às segundas-feiras 00h via Funifier; sem exposição de números de pontos
- **Efeito:** produz motivação social (CD5) sem o efeito negativo de leaderboard punitivo

### Perfil Oficial do MIDR/FADEX

- O MIDR/FADEX tem um perfil com flag `extra.is_official = true` no Funifier
- Posts desse perfil recebem badge de verificação (ícone de escudo/estrela) e prioridade no feed
- Equipe FADEX publica via Funifier Studio — sem desenvolvimento adicional no frontend além do estilo visual do badge
- Substitui a necessidade de tela de notificações institucionais separada

### Feed da Galeria

Layout de feed vertical contínuo, scroll infinito.

**Estrutura de cada post:**

```
┌─────────────────────────────────────────┐
│ [Avatar]  Nome do produtor          ✓   │  ← ✓ aparece apenas em perfis oficiais
│           Município · #hashtag · ···    │  ← município, hashtag, menu (3 pontos)
├─────────────────────────────────────────┤
│                                         │
│         [Foto ou vídeo ≤ 60s]           │  ← mídia full-width
│                                         │
├─────────────────────────────────────────┤
│ ♥ Curtir   💬 Comentar   ↗ Compartilhar │  ← ações
│ 42 curtidas                             │
│ [Nome] Texto da publicação...           │  ← legenda
│ Ver todos os 5 comentários              │
│ há 2 horas                              │  ← timestamp relativo
└─────────────────────────────────────────┘
```

**Badge "Top da Semana":** faixa verde com estrela no canto superior direito da mídia — aplicada automaticamente ao top 3 semanal por município.

**Botão de publicar:** FAB circular com ícone **+** no canto inferior direito, sobre o nav bar — visível somente na tela da Galeria.

### Fluxo de publicação

```
1. Usuário toca no FAB (+)
2. Tela de nova publicação abre
3. Escolhe foto (câmera ou galeria) ou vídeo ≤ 60s — obrigatório
4. Escreve legenda (≤ 280 chars) — opcional
5. Seleciona trilha relacionada — opcional
6. Toca "Publicar"
   └── Foto → publicação direta, aparece no feed imediatamente
   └── Vídeo → entra em fila de moderação; aparece após aprovação do admin
7. Animação de XP + ML/ESP concedidos
```

### Gerenciamento de publicações próprias

- Usuário pode **remover qualquer publicação sua** a qualquer momento
- Acesso: menu de 3 pontos (···) no header do post → "Remover publicação"
- Remoção é imediata e irreversível — sem confirmação de senha
- Post removido some do feed de todos imediatamente

### Comentários

- Qualquer usuário pode comentar em qualquer post
- Autor do post pode remover comentários no seu próprio post
- Comentários não têm limite de caracteres, mas o campo tem placeholder curto: "Deixe um comentário..."
- Moderação: admin pode remover comentários via Funifier Studio

### Regras de negócio

- 1 curtida por usuário por post — tocar novamente descurtir
- Não é possível curtir ou comentar no próprio post
- Vídeos não aparecem no feed antes de aprovação do admin (SLA de moderação: a definir)
- Top 3 semanal por município: baseado em curtidas; calculado às segundas-feiras 00h via Funifier
- Top 3 recebe bônus automático de ML/ESP
- Post denunciado (flag de usuário) é ocultado do feed publicamente e enviado para revisão do admin

### Comportamento offline

- Feed carrega do cache local (última versão sincronizada)
- Nova publicação salva offline e enviada ao reconectar — aparece no feed após sync
- Curtidas e comentários offline sincronizados ao reconectar — sem duplicação
- Banner discreto no topo quando em modo cache: "Conteúdo salvo — reconectando..."

### Critérios de aceite

- [ ] Post com foto aparece no feed do autor imediatamente após envio
- [ ] Post com vídeo aparece somente após aprovação — autor vê indicador "Em revisão" no seu perfil
- [ ] Remoção de post próprio some do feed de todos em < 5 segundos
- [ ] 1 curtida por usuário por post — segundo toque descurtir
- [ ] Badge "Top da Semana" aplicado automaticamente às segundas-feiras
- [ ] Bônus ML/ESP creditado ao autor do post top após cálculo semanal
- [ ] Feed offline funciona com cache; sincroniza ao reconectar sem perda de interações

---

## 6. Perfil

**Propósito:** identidade do produtor dentro do app — nível, badges conquistados, certificados, histórico.

### Componentes

| Componente | Descrição |
|-----------|-----------|
| Avatar + nome | Nome do produtor, cidade, rota |
| Nível temático | Ex: "Apicultor Nível 3" / "Pescador Mestre" com barra de XP |
| Métricas | Trilhas completadas, streak atual, VOZ acumulado |
| Badges | Grid de conquistas — desbloqueadas em destaque, bloqueadas em cinza |
| Certificados | Lista de certificados emitidos (botão de download/compartilhar) |
| Configurações | Notificações, logout, política de privacidade |

### Regras de negócio

- Perfil visível apenas para o próprio usuário (não há perfil público entre produtores)
- Certificado disponível para download somente após conclusão do critério definido pela FADEX
- Badge de Multiplicador ("Abelha-Rainha" / "Guia do Rio") destacado no topo do grid quando conquistado

---

## 7. Jovem Multiplicador

**Propósito:** papel especial para jovens produtores (18–35 anos) selecionados como agentes de campo digitais. Formados pelo app, chegam presencialmente aos produtores mais velhos para facilitar o onboarding.

### Funcionalidades exclusivas

| Feature | Descrição | Recompensa |
|---------|-----------|-----------|
| Trilha do Multiplicador | Trilha especial de formação — técnicas de facilitação + domínio do app | XP + badge progressivo |
| Registrar onboarding | Função de registrar que onboardou um novo produtor (CPF do novo usuário como referência) | CPO points |
| Badge "Abelha-Rainha" / "Guia do Rio" | Concedido ao concluir trilha + atingir meta de CPO | Badge especial no Perfil |
| Dashboard de campo | Mini-dashboard pessoal: produtores onboardados, CPO acumulado, meta restante | — |

### Regras de negócio

- Papel de Multiplicador é habilitado manualmente pelo admin (FADEX) após seleção — não é auto-cadastro
- Onboarding registrado somente se o novo usuário concluir o cadastro e a primeira lição
- CPO não é concedido se o novo usuário abandonar o app em < 24h
- Remuneração (bolsa FADEX) é gerenciada fora do app — o app apenas exibe o CPO acumulado como dado de referência

### Critérios de aceite

- [ ] Trilha do Multiplicador invisível para usuários comuns
- [ ] Registro de onboarding não concede CPO imediatamente — aguarda confirmação do novo usuário
- [ ] Badge "Abelha-Rainha" / "Guia do Rio" aparece no topo do grid de badges do Perfil
- [ ] Dashboard de campo mostra apenas dados do próprio Multiplicador

---

## 8. Notificações Push

**Propósito:** reengajamento de usuários inativos e alertas de eventos com prazo.

| Trigger | Mensagem | Horário |
|---------|---------|---------|
| Streak em risco (24h sem atividade) | "Sua sequência está em risco! Abra o app e mantenha o ritmo." | 19h |
| Nova lição Essay disponível na trilha | "Queremos ouvir você sobre [tema]. Continue sua trilha." | 10h |
| Nova lição desbloqueada | "Nova lição disponível: [título]. Continue sua trilha." | Imediato |
| Top da Galeria (semanal) | "Você está no top 3 da semana no seu município!" | Segunda-feira 8h |
| Inatividade (7 dias) | "[Nome], o apiário / o rio está esperando por você." | 10h |

### Regras de negócio

- Máximo 1 notificação por dia por usuário — se múltiplos triggers no mesmo dia, prioridade: Essay > Streak > Inatividade
- Usuário pode desativar notificações individualmente nas Configurações
- Notificações não enviadas entre 21h e 8h

---

## 9. Cadastro

**Campos obrigatórios:**

| Campo | Tipo | Observação |
|-------|------|------------|
| Nome completo | Texto | — |
| CPF | Numérico | Validado com dígitos verificadores |
| Perfil / Rota | Select ou locked | Locked se veio da landing com rota pré-selecionada |
| Senha | Senha | Mínimo 6 caracteres |
| Confirmar senha | Senha | — |
| **Telefone / WhatsApp** | Tel | **Obrigatório** — principal canal de reengajamento e recuperação de conta para o público-alvo |

**Campos opcionais:**

| Campo | Tipo | Observação |
|-------|------|------------|
| Email | Email | Para recuperação de senha alternativa |

> **v1.1.0:** telefone passou de opcional para obrigatório. Justificativa: para o público-alvo (produtores rurais), WhatsApp é o único canal de comunicação confiável. Email raramente é verificado.

---

## Pendências

| Item | Status |
|------|--------|
| Definir threshold de XP para cada nível temático | ❌ A definir |
| Definir valor de ML/ESP por ação | ❌ A definir |
| Definir meta de CPO para certificação do Multiplicador | ❌ A definir com FADEX |
| Confirmar municípios do Piauí (5 placeholders) | ❌ Aguardando FADEX/MIDR |
| Definir política de moderação de vídeo (SLA de aprovação) | ❌ A definir |
| Parâmetro `?perfil=multiplicador` na URL de cadastro | ❌ A implementar |
| API de posts da Galeria: endpoint nativo Funifier ou customizado? | ❌ Tec avaliar |
