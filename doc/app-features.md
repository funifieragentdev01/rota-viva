# Especificação de Funcionalidades — App Rota Viva (PWA)

**Versão:** 1.0.0
**Data:** 2026-03-31

> Este documento especifica as funcionalidades do PWA Rota Viva: fluxo de cada tela, comportamento offline, regras de negócio e critérios de aceite. Para conteúdo pedagógico (trilhas, lições, questões), ver `trilhas.md`. Para visual e temas, ver `design-system.md`.

---

## Sistema de Pontos e Recompensas

Antes das features, é necessário entender os quatro tipos de pontos — cada um com propósito distinto:

| Moeda | Sigla | Quem ganha | Como | Para que serve |
|-------|-------|-----------|------|----------------|
| Pontos de Trilha | XP | Todos | Completar lições, missões, diário | Subir de nível, progressão |
| Gotas de Mel / Peixes | ML / ESP | Todos | Missões longas, publicar na Galeria, streak longa | Moeda temática — futura loja |
| Pontos de Voz | VOZ | Todos | Responder Escuta Ativa | Mede participação na escuta; relatório MIDR |
| Pontos de Campo | CPO | Multiplicadores | Onboarding de novos produtores | Certificação + bolsa FADEX |

> Recompensas externas (certificado FADEX/UFPI, bolsa Multiplicador) são gerenciadas fora do app. O app emite o badge e registra o marco; a FADEX processa o benefício.

---

## Arquitetura de Navegação

```
Bottom Nav (fixo em todas as telas pós-login)
├── 🏠  Início     → Home screen
├── 🗺️  Trilha     → Tela da trilha ativa (caminho em S)
├── 📓  Diário     → Diário do Produtor
├── 🏆  Ranking    → Ranking por município
└── 👤  Perfil     → Perfil, badges, certificados
```

Features acessíveis via Home ou contexto (não no nav fixo):
- 📷 **Registrar** — submissão de evidência ad-hoc
- 🎙️ **Escuta Ativa** — instrumentos disponíveis (badge no ícone quando há novo)
- 🌿 **Galeria de Saberes** — acessível via Home ou tab dentro de Perfil/Comunidade

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

**Propósito:** visualizar a progressão nas trilhas e acessar cada lição/conteúdo. Para especificação do conteúdo de cada trilha, ver `trilhas.md`.

### Layout e componentes

| Componente | Descrição |
|-----------|-----------|
| Header | Nome da rota, XP, streak |
| Card de contexto | "SEÇÃO X, UNIDADE Y — [Título da lição atual]" |
| Caminho em S | Bolinhas circulares conectadas por linha curva — uma por conteúdo |
| Bolinha | Ícone do tipo (fa-video, fa-star, fa-camera, fa-headphones) + estado (ativa, completa, bloqueada) |
| Mascote | Personagem posicionado na bolinha atual |
| Estrelas | 0–3 estrelas abaixo de bolinhas completadas |

### Estados de bolinha

| Estado | Visual | Ação ao tocar |
|--------|--------|--------------|
| Completa | Cor sólida da rota + estrelas abaixo | Abre conteúdo para revisão |
| Ativa | Cor sólida + borda pulsando | Abre o conteúdo |
| Bloqueada | Cinza escuro, ícone cadeado | Toast: "Complete a lição anterior primeiro" |

### Conteúdo por tipo de bolinha

| `folder_content_type` | Abre | Comportamento |
|----------------------|------|---------------|
| `video` | Player de vídeo embutido | Concede XP ao assistir ≥ 80% |
| `quiz` | Sequência de questões (tipos variados) | XP proporcional ao acerto; VOZ points para ESSAY |
| `mission` | Tela de missão de campo (DIY_PROJECT) | Upload de foto + texto; avaliação por IA ou manual |
| `listen` | Player de áudio + questões LISTEN/LISTEN_AND_ORDER | XP ao completar |

### Comportamento offline

- Bolinhas e estado de progressão: sempre disponível offline (cache)
- Conteúdo de vídeo: requer download prévio ou conexão; exibe aviso se offline
- Quiz e missão: funcionam offline; resultado sincroniza ao reconectar
- XP e progresso: concedidos localmente, confirmados após sync

---

## 3. Registrar — Submissão de Evidência (Ad-hoc)

**Propósito:** permitir que o produtor registre uma evidência de ação de campo espontânea — não atrelada a uma lição específica. Alimenta o AAGE (base de dados do projeto) e pode ser encaminhada para a Galeria de Saberes.

> **Distinção importante:** a `mission` bolinha dentro da trilha é uma evidência *contextual* com rubrica definida pela lição. O "Registrar" é uma evidência *espontânea*, sem rubrica fixa.

### Fluxo

```
1. Usuário toca no ícone 📷 (na Home ou via atalho)
2. Tela de registro abre com câmera ativa
3. Usuário captura foto (ou faz upload da galeria) — obrigatório
4. Campo de texto: descrição curta (≤ 280 chars) — obrigatório
5. Campo opcional: vídeo ≤ 60s (gravação ou upload)
6. Seleção de categoria: lista das trilhas ativas + "Geral"
7. Botão "Registrar" → salva localmente + envia quando tiver conexão
8. Confirmação: animação de XP ganho + pergunta "Quer publicar na Galeria?"
   └── Sim → entra na fila de aprovação para a Galeria
   └── Não → fica apenas como evidência privada no AAGE
```

### Regras de negócio

- Foto é obrigatória — sem foto não há envio
- Vídeo é opcional; se enviado, passa por aprovação antes de aparecer na Galeria
- Usuário pode registrar múltiplas vezes por dia — sem limite
- Todos os registros vão para o AAGE independentemente da escolha de publicar na Galeria
- XP concedido imediatamente ao salvar offline; confirmado após sync

### Comportamento offline

- Foto, texto e vídeo salvos localmente (IndexedDB / cache)
- Ícone de "pendente de sync" na entrada do diário até a sincronização
- Sync automático ao reconectar — sem ação do usuário

### Critérios de aceite

- [ ] Foto capturada ou importada é comprimida antes de salvar (max 1MB)
- [ ] Registro salvo offline aparece na lista com indicador de pendente
- [ ] Após sync, indicador de pendente desaparece
- [ ] XP é concedido ao salvar (offline) e não duplicado ao sincronizar
- [ ] Vídeos enviados para Galeria não aparecem publicamente antes de aprovação do admin

---

## 4. Escuta Ativa

**Propósito:** coletar dados qualitativos sobre os territórios para subsidiar decisões de política pública (relatório MIDR/AAGE). É fundamentalmente diferente do quiz de conhecimento — não tem resposta certa ou errada, e o produtor está sendo *ouvido*, não *avaliado*.

> **Por que feature separada e não quiz dentro da trilha:** ciclo de vida próprio (publicado/arquivado pelo admin independentemente das trilhas), pode ser sazonal, gera VOZ points (moeda separada do XP), e misturá-lo com quizzes cria confusão de UX — o produtor precisa entender que aqui sua opinião importa, não seu conhecimento.

### Fluxo

```
1. Badge vermelho aparece no ícone 🎙️ quando há instrumento novo
2. Usuário abre a Escuta Ativa
3. Tela mostra o instrumento ativo: título, tema, quantidade de perguntas (máx. 5)
4. Usuário responde pergunta por pergunta
   └── Feedback visual por resposta: animação de "obrigado", não de "certo/errado"
5. Ao concluir: animação de VOZ points ganhos + mensagem de reconhecimento
   ("Sua voz chegou até quem decide. Obrigado.")
6. Instrumento arquivado — não aparece mais como disponível
```

### Estrutura de um instrumento

| Campo | Descrição |
|-------|-----------|
| Título | Ex: "Como foi sua safra de mel este ano?" |
| Tema | Vinculado a uma trilha ou "Geral" |
| Perguntas | Máx. 5; tipos: ESSAY, MULTIPLE_CHOICE (sem gabarito), TRUE_FALSE |
| Recompensa | VOZ points definidos pelo admin ao publicar |
| Validade | Data de início e fim — admin define; após fim, arquivado automaticamente |

### Regras de negócio

- Máximo 5 perguntas por instrumento — nunca mais
- Sem gabarito: nenhuma resposta é marcada como certa ou errada
- Feedback é sempre positivo: "Obrigado por responder", nunca "Errado"
- Um instrumento só pode ser respondido 1x por usuário
- Respostas vão para o AAGE via Funifier com tag `escuta_ativa`
- Admin publica e arquiva instrumentos via Funifier Studio — independente das trilhas

### Comportamento offline

- Se instrumento foi carregado antes de ficar offline: pode ser respondido offline
- Respostas salvas localmente e sincronizadas ao reconectar
- VOZ points concedidos após sync

### Critérios de aceite

- [ ] Badge some após o usuário abrir a Escuta Ativa (mesmo sem responder)
- [ ] Instrumento não aparece novamente após ser respondido
- [ ] Sem nenhuma indicação visual de "certo" ou "errado" em nenhuma resposta
- [ ] VOZ points aparecem no perfil do usuário após sync
- [ ] Respostas offline sincronizam sem perda de dado

---

## 5. Galeria de Saberes

**Propósito:** espaço comunitário onde produtores compartilham boas práticas com foto ou vídeo curto. Modelo de feed inspirado no Instagram — padrão já familiar ao público, sem curva de aprendizado. O conteúdo aqui não é do projeto — é *dos produtores*.

> **Autorização de uso de imagem:** aceita uma única vez nos Termos de Uso no momento do cadastro. Não há confirmação por publicação — mesmo comportamento do Instagram, TikTok e similares.

### Feed da Galeria

Layout de feed vertical contínuo, um post por vez, scroll infinito (carrega mais posts ao chegar no fim).

**Estrutura de cada post:**

```
┌─────────────────────────────────────────┐
│ [Foto avatar]  Nome do produtor          │  ← header do post
│               Município · Trilha · ···  │  ← município, trilha, menu (3 pontos)
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

**Filtros:** pills fixas no topo da tela durante o scroll — "Município" e "Trilha". Seleção filtra o feed em tempo real.

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

## 6. Diário do Produtor

**Propósito:** caderno pessoal e privado de acompanhamento da produção. O produtor registra o dia a dia — não para a comunidade, mas para si mesmo. Mantém streak própria independente da trilha. Visível apenas para o próprio produtor.

> **Distinção:** o Diário é o caderno privado. A Galeria é o palco público. Missão de Vídeo e fotos "Reels-style" vão para a Galeria, não para o Diário.

### Fluxo de novo registro

```
1. Usuário abre o Diário (nav) ou toca no campo fixo no rodapé da tela
2. Campo de texto (≤ 280 chars) com placeholder temático
   → Mel: "Como foi hoje no apiário?"
   → Pesca: "Como foi hoje no rio?"
3. Botão de câmera: adiciona foto opcional (não obrigatória)
4. Toca "Registrar"
5. Animação de XP + atualização do contador de streak
6. Entrada aparece no topo do histórico
```

### Histórico

| Componente | Descrição |
|-----------|-----------|
| Timeline | Entradas em ordem cronológica decrescente |
| Card de entrada | Data, texto, foto em miniatura (se houver) |
| Indicador de sync | Ícone de relógio em entradas pendentes de sincronização |
| Streak | Ícone de chama + número de dias consecutivos — no topo da tela |

### Regras de negócio

- Streak do Diário é **independente** da streak de missões de trilha
- Registro conta para a streak do dia apenas 1x (múltiplos registros no mesmo dia = 1 ponto de streak)
- Streak quebra se nenhum registro for feito no dia — notificação push às 19h como lembrete
- Conteúdo é privado — admin não lê entradas individuais (apenas contagens agregadas para métricas)
- Fotos do Diário não vão para a Galeria automaticamente — o usuário decide separadamente

### Comportamento offline

- Novo registro salva imediatamente offline (IndexedDB)
- Streak calculada localmente — não depende de conexão
- Sync automático ao reconectar; XP confirmado após sync
- Histórico completo disponível offline

### Critérios de aceite

- [ ] Streak do Diário e streak de trilha são contadores separados no Perfil
- [ ] Registro salvo offline aparece no histórico com indicador de pendente
- [ ] Após sync, indicador desaparece e XP é confirmado
- [ ] XP não duplicado se o usuário abrir o app offline e online no mesmo dia
- [ ] Notificação push de lembrete às 19h se nenhum registro foi feito no dia

---

## 7. Ranking

**Propósito:** competição saudável entre municípios — não entre indivíduos. Ativa CD6 (Escassez e Impaciência) e CD5 (Influência Social). O foco em município (e não em pessoa) incentiva cooperação interna e reduz comportamento negativo.

### Estrutura

| Tab | Critério | Período |
|-----|---------|---------|
| Município | XP total de todos os produtores do município | Semana atual |
| Trilha | XP total por trilha no município | Semana atual |
| Histórico | Ranking acumulado desde o início | Todo o período |

### Regras de negócio

- Ranking calculado automaticamente pelo Funifier — sem intervenção manual
- Produtor vê seu município destacado na lista (mesmo que não esteja no top)
- Ranking reset semanal às segundas-feiras às 00h
- Municípios com < 5 produtores ativos na semana ficam em categoria separada ("Em formação")

### Critérios de aceite

- [ ] Município do usuário logado sempre visível na lista (com scroll até sua posição se necessário)
- [ ] Reset semanal acontece sem intervenção manual
- [ ] Municípios "Em formação" não competem contra municípios ativos

---

## 8. Perfil

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

## 9. Jovem Multiplicador

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

## 10. Notificações Push

**Propósito:** reengajamento de usuários inativos e alertas de eventos com prazo.

| Trigger | Mensagem | Horário |
|---------|---------|---------|
| Streak em risco (24h sem atividade) | "Sua sequência está em risco! Abra o app e mantenha o ritmo." | 19h |
| Nenhum registro no Diário | "Como foi hoje no campo? Registre no Diário antes de dormir." | 19h |
| Novo instrumento de Escuta Ativa | "Queremos ouvir você sobre [tema]. Leva menos de 2 minutos." | 10h |
| Nova lição desbloqueada | "Nova lição disponível: [título]. Continue sua trilha." | Imediato |
| Top da Galeria (semanal) | "Você está no top 3 da semana no seu município! 🎉" | Segunda-feira 8h |
| Inatividade (7 dias) | "[Nome], o apiário / o rio está esperando por você." | 10h |

### Regras de negócio

- Máximo 1 notificação por dia por usuário — se múltiplos triggers no mesmo dia, prioridade: Escuta Ativa > Streak > Diário > Inatividade
- Usuário pode desativar notificações individualmente nas Configurações
- Notificações não enviadas entre 21h e 8h

---

## Pendências

| Item | Status |
|------|--------|
| Definir threshold de XP para cada nível temático | ❌ A definir |
| Definir valor de ML/ESP por ação | ❌ A definir |
| Definir meta de CPO para certificação do Multiplicador | ❌ A definir com FADEX |
| Definir critério exato de streak do Diário (dia corrido ou 24h?) | ❌ A definir |
| Confirmar municípios do Piauí (5 placeholders) | ❌ Aguardando FADEX/MIDR |
| Definir política de moderação de vídeo (SLA de aprovação) | ❌ A definir |
| Parâmetro `?perfil=multiplicador` na URL de cadastro | ❌ A implementar |
