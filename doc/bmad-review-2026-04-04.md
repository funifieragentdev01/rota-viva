# Revisão BMAD — Rota Viva

**Data:** 2026-04-04
**Versão do app:** 0.7.8
**Participantes:** John (PM), Sally (UX), Winston (Architect), Yu-Kai Chou (Gamification), Mr.Beast (GTM)
**Modo:** Party Mode — cada agente rodou como subagente independente

---

## Estado Atual do Projeto

**Documentação:**
- PRD v0.2.0, Architecture v0.5.0, App Features v1.0.0, Landing Page v1.0.0, Trilhas v0.4.0

**Implementado (v0.7.8):**
- Auth flow (CPF login), landing page, dashboard, trail navigation, video player, quiz framework, theming system, service worker, API integration
- 7 views: landing, login, signup, dashboard, trail, video, quiz
- 8 controllers, 4 services (CPF, Theme, Auth, API)

**Parcial:**
- Diário & ranking referenciados mas não conectados
- Video/quiz content loading mínimo

**Não construído:**
- Gallery (feed social), Active Listening, Registro de Evidência, Young Multiplier dashboard, Push Notifications, IndexedDB/sync offline, pipeline de compressão de foto, display de pontos/XP/streak/nível

**Pendências de negócio:**
- XP thresholds por nível indefinidos
- ML/ESP valores por ação indefinidos
- CPO meta de certificação indefinida
- Definição de streak (dia corrido vs 24h) indefinida
- 5 municípios do PI não confirmados
- SLA de moderação de vídeo indefinido
- URL do PWA e domínio indefinidos

---

## Avaliação por Agente

---

### 📋 John (Product Manager)

O projeto está em risco sério de não entregar o que importa até maio de 2026.

#### O Gap Real Entre Docs e Implementação

O problema não é só o que está não construído. O problema é o que está parcial, porque parcial mente sobre o progresso real.

Diário e Ranking "referenciados mas não totalmente conectados" — isso é quase zero em termos de valor entregue. Um produtor rural no Piauí não vai usar um app onde ele registra algo e não vê feedback. A ausência de feedback é a morte de qualquer sistema de gamificação.

Mas antes de falar de features, a pergunta que ninguém está perguntando:

**Por que 25.000 usuários até maio?** De onde vem esse número? O MIDR/FADEX tem esse dado ou foi uma meta bonita para o contrato? Porque se não temos a resposta, estamos construindo sem saber o que é sucesso.

#### O Critical Path Real

O que um apicultor do Piauí precisa fazer no dia 1 para que o projeto seja considerado um sucesso?

1. **Fazer login** (ok)
2. **Completar ao menos 1 trilha** (framework existe mas conteúdo real não está lá)
3. **Registrar uma evidência** (não construído)
4. **Ver que ganhou XP/ponto** (valores de ML/ESP por ação estão indefinidos)

Se os valores de XP por ação estão indefinidos, a gamificação não existe. É só uma casca bonita. O produtor vai completar uma trilha e nada acontece de forma significativa.

Critical path até maio:

**Abril (as 4 semanas mais importantes):**
- Semana 1-2: Definir os valores de XP/ML/ESP com o cliente. Sem isso, nada mais importa. Fazer uma sessão de trabalho com FADEX, não mandar e-mail.
- Semana 2-3: Registrar Evidência funcionando end-to-end. Essa é a feature que prova valor — o produtor documenta o que fez, recebe reconhecimento.
- Semana 3-4: Ranking real e Diário com streak funcionando. São os dois maiores motivadores de retorno diário.

**Maio (semanas finais):**
- Conteúdo real nas trilhas (vídeos, quizzes com os 14 tipos)
- Testes com usuários reais no campo — não beta em Teresina, campo mesmo
- Push Notifications (se der tempo — mas não é crítico para lançamento)

#### Riscos

**Risco 1: As pendências indefinidas vão explodir em abril.** XP thresholds, ML/ESP, CPO certification goal, definição de streak — essas não são "pendências de documentação". São decisões de negócio que bloqueiam desenvolvimento. Se o cliente (MIDR/FADEX) não tomar essas decisões nas próximas 2 semanas, vamos chegar em maio com um produto que não tem coerência interna.

**Risco 2: Os 5 municípios do PI não confirmados.** Isso é operacional — tem produtor rural real que vai usar o app nesses municípios? Se não sabemos quem são, como vamos testar? Como vamos fazer onboarding?

**Risco 3: Offline-first está não construído.** Produtor rural em área remota, conectividade ruim — e o app não funciona offline. Esse não é um detalhe técnico. É o core da proposta de valor para o público-alvo.

**Risco 4: Galeria Social não construída.** Preocupa menos tecnicamente, mas muito estrategicamente. A Galeria é o que vai fazer o app viral dentro das comunidades.

#### Recomendação

**Próxima ação imediata:** Agendar sessão de trabalho com FADEX nos próximos 5 dias para fechar as decisões de negócio pendentes. Não é reunião de status — é sessão de decisão com pauta clara: valores de XP, municípios confirmados, definição de streak, meta de CPO.

**Corte de escopo para maio:** Push Notifications e Young Multiplier Dashboard saem do MVP. Active Listening entra como versão simplificada.

**Métrica de sucesso:** No lugar de "25.000 usuários cadastrados", propor "5.000 usuários com ao menos 3 sessões + 1 evidência registrada nos primeiros 30 dias". Quantidade de cadastro é vanity metric. Engajamento real é o que prova que a gamificação funciona.

---

### 🎨 Sally (UX Designer)

Imagine Dona Maria, 52 anos, apicultora no interior do Piauí. Ela nunca teve smartphone antes de 2023. O sobrinho configurou o aparelho. Hoje ela abre o Rota Viva pela primeira vez, 3G instável, dedos calejados de trabalho — e precisa entender o que fazer.

#### O que está funcionando

A trilha S-curve é a decisão certa. O modelo Duolingo cria um caminho visual claro: "estou aqui, vou pra lá." Para a Dona Maria, isso é muito mais intuitivo do que um menu com 8 opções. A hierarquia de pastas por trás é invisível pra ela — ela só vê o progresso.

O login por CPF também é acerto. Sem precisar inventar username ou lembrar email. CPF ela sabe. É familiar.

Dark theme com laranja/dourado funciona bem para uso em campo — menos reflexo de tela com sol.

#### O que está faltando e é crítico

**1. Registro de Evidências** — o coração funcional do app. Se o produtor não consegue registrar uma ação (tirar foto da colmeia, anotar produção), o app não tem valor prático imediato. É o que justifica o download e o retorno. Sem isso, tudo vira conteúdo passivo.

**2. Diário do Produtor** — a mecânica de streak é poderosa para esse perfil de usuário. Hábito diário, senso de conquista gradual. Mas precisa ser simples: data, campo de texto curto, talvez uma foto. Se for complexo, Dona Maria abandona na segunda entrada.

**3. Galeria / Feed Social** — componente de pertencimento. "Outros produtores como eu estão aqui." Para públicos com pouca experiência digital, ver rostos e histórias similares reduz a ansiedade de uso. É validação social concreta.

#### Riscos de UX

**Risco 1 — Onboarding inexistente.** Com 7 views construídas, não há menção a uma tela de boas-vindas ou tutorial. Para um usuário de 45+ com literacia digital limitada, jogar direto no dashboard sem orientação vai gerar abandono nas primeiras 3 interações. Precisa de pelo menos um tour de 3 passos ou tooltips contextuais na primeira sessão.

**Risco 2 — Offline sem feedback claro.** O service worker existe, mas o usuário sabe quando está offline? Um banner discreto "Você está offline — conteúdo salvo disponível" evita frustração e constrói confiança no app. Sem isso, a Dona Maria vai achar que o app "quebrou" quando a antena piora.

**Risco 3 — Complexidade do signup.** Signups com muitos campos são assassinos de conversão para esse público. Se pedir mais do que CPF + nome + senha + cidade, vai perder usuários antes de entrar.

**Risco 4 — Acessibilidade tátil.** Botões e ícones precisam de no mínimo 44x44px. Dedos calejados têm menos precisão tátil.

#### Próximos passos priorizados

1. **Registro de Evidências** — fluxo: abrir câmera → tirar foto → campo de texto opcional → confirmar. Mínimo viável.
2. **Diário** — campo de entrada diária, streak counter visível, histórico simples.
3. **Onboarding de primeira sessão** — 3 telas, sem texto longo, ícones grandes.
4. **Banner de status offline** — uma linha de CSS/JS, impacto enorme na percepção de confiabilidade.
5. **Galeria** — pode ser o último, mas antes do lançamento público.

---

### 🏗️ Winston (Architect)

A fundação está sólida, mas há três lacunas que podem derrubar o produto em produção com 25k usuários.

#### O que está correto

A decisão de multi-gamification com DBs isolados por rota (Mel, Pesca) é a decisão certa para o longo prazo. Evita contaminação de dados entre rotas e permite escalar verticalmente cada uma. A escolha de Cloudflare Stream para vídeo HLS com adaptive bitrate é exatamente o que se precisa para conectividade instável no campo.

O padrão network-first para assets locais e cache-first para CDN no Service Worker está correto.

#### Gap Crítico 1: Não existe persistência offline real

Ter Service Worker sem IndexedDB é teatro. O SW pode cachear assets estáticos, mas sem IndexedDB não tem:

- Progresso de quiz salvo quando cai a conexão no meio da trilha
- Ações do usuário enfileiradas para sync posterior
- Estado da missão local enquanto offline

**O que construir:** IndexedDB com estrutura simples — três stores:

```
pending_actions  → ações aguardando sync (log de trilha, quiz, foto)
cached_content   → conteúdo de trilha baixado para offline
user_state       → progresso local do usuário
```

A sync queue precisa de retry com backoff exponencial e timestamp de criação para detectar conflitos.

#### Gap Crítico 2: Upload de foto sem pipeline de compressão

Produtores rurais com iPhone antigo ou Android entry-level vão tentar upload de foto de 8MB em rede 3G. Sem compressão client-side:

- Upload que demora 3+ minutos e falha na metade
- Custo de S3 inflado
- UX que parece quebrado

**O que construir:** Canvas API para redimensionar antes do upload. Regra simples: max 1280px no lado maior, qualidade JPEG 0.82. Reduz de 8MB para ~200KB sem perda visual perceptível.

Fluxo completo: captura → compressão canvas → armazenamento em IndexedDB (pending) → upload quando conectado → confirmação.

#### Gap Crítico 3: Sem estratégia de degradação para dependências externas

A arquitetura depende de Funifier API, Cloudflare Stream, S3. Quando a Funifier API fica lenta, o app trava.

**O que construir:** Timeout agressivo no ApiService (máximo 8 segundos), fallback para conteúdo cacheado quando a API não responde, feedback visual claro para o usuário.

#### Roadmap Técnico para Maio 2026

**Semanas 1-2:** IndexedDB + Sync Queue. Desbloqueia tudo offline.
**Semanas 3-4:** Pipeline de foto + Gallery feed. O feed social com likes/comentários é o mecanismo de retenção mais poderoso para comunidade rural. Mas só funciona se o upload de foto funcionar de verdade.
**Semana 5:** Offline quiz/mission completion. Com o IndexedDB no lugar, vira implementação, não arquitetura.
**Semana 6:** Load testing + ajuste de timeouts. 25k usuários requer pelo menos um teste de carga simulado.

#### Decisão Arquitetural Pendente: Push Notifications

Web Push (VAPID) para iOS só funciona a partir do iOS 16.4+ com o app adicionado à tela inicial. **Recomendação: não incluir push no MVP de maio.** É infraestrutura adicional, e o risco de implementar errado é alto. Lançar sem, medir o engajamento orgânico, adicionar push em segunda fase.

**Resumo:** Construa o IndexedDB agora. Tudo o mais pode ser incrementado. Sem persistência offline real, você tem um app que parece moderno mas quebra na primeira fazenda com sinal fraco.

---

### 🎮 Yu-Kai Chou (Gamification — Octalysis)

#### Análise Octalysis

**O que está bem:**

**Core Drive 2 — Development & Accomplishment** está bem coberto: trilha S-curve com estrelas por lição, níveis temáticos ("Apicultor Nível 3"), XP de progressão, certificado FADEX/UFPI. A trilha estilo Duolingo reduz a paralisia de escolha e cria sensação de progresso constante.

**Core Drive 5 — Social Influence & Relatedness** tem trabalho real: ranking municipal coletivo (decisão brilhante), Galeria de Práticas com feed social, badge "Abelha-Rainha" para Multiplicadores.

**Core Drive 1 — Epic Meaning & Calling** existe implicitamente — esses produtores rurais têm identidade profunda com seu ofício. O thematic level system capitaliza nisso. O certificado institucional amplifica o sentido de propósito real.

#### Desequilíbrios Críticos

**Core Drive 3 — Empowerment of Creativity & Feedback** está quase ausente. A trilha S-curve é linear por design — não há branching, escolhas, estratégia. Para adultos com experiência profissional real (apicultores com 20 anos de ofício), isso pode ser condescendente. A Galeria de Práticas é o único espaço de expressão e criatividade — ela precisa ser lançada logo.

**Core Drive 7 — Unpredictability & Curiosity** está subdesenvolvido. Streak mechanics e "Top da Semana" tocam nisso, mas de forma leve. Onde está a surpresa? O conteúdo novo que aparece inesperadamente? O badge raro que ninguém sabe como conseguir?

**Core Drive 6 — Scarcity & Impatience** não existe. Algum nível de "conteúdo desbloqueado ao atingir X" cria tensão positiva. Poderia ser mais explícito: "complete o Módulo 3 para desbloquear a trilha do Multiplicador."

#### O Risco Mais Grave: O Abismo da Semana 3

O Rota Viva tem um onboarding forte (trilha clara, primeira conquista rápida) e um objetivo de longo prazo forte (certificado). Mas há um abismo entre semana 2 e semana 8 onde o usuário perde o senso de progresso intermediário.

Os thresholds de XP por nível não estão definidos — isso é uma bomba. Se o intervalo entre "Apicultor Nível 2" e "Apicultor Nível 3" for percebido como injusto, o usuário abandona. Regra de ouro: o tempo para o próximo nível nunca deve exceder 2x o tempo do nível anterior nos primeiros 5 níveis.

A ausência de implementação de streak, ranking e pontos na versão atual significa que o usuário de launch vai ter a experiência mais pobre possível — sem feedback de pontos, sem ranking municipal, sem saber se o streak está ativo.

#### Sobre o Ranking Municipal Coletivo

Decisão de design excepcionalmente boa. Ranking individual em comunidades rurais coesas cria competição destrutiva — o agricultor que lidera vira alvo social, o que está em último sente vergonha pública. Ranking por município transforma a competição em cooperação interna: "precisamos todos estudar para Oeiras subir no ranking." Ativa o Core Drive 5 de forma White Hat pura — pertencimento, não humilhação.

Para 25.000 produtores em comunidades pequenas onde todo mundo se conhece, essa decisão pode ser a diferença entre o produto viralizar organicamente ou criar atrito social.

#### O Papel dos Multiplicadores

**Oportunidade**: Core Drive 5 + Core Drive 2 + Core Drive 1 ativados simultaneamente. O Multiplicador tem status, missão de ensinar, e métricas de impacto.

**Risco**: se o dashboard CPO não entregar feedback real de impacto ("você ajudou 12 produtores esta semana"), o papel vira simbólico e perde poder motivacional rapidamente.

#### Priorização para Launch

1. **Implementar display de XP e pontos** — sem isso, o loop de feedback fundamental está quebrado.
2. **Definir thresholds de XP e implementar level-up** — o momento do level-up é o pico emocional do produto.
3. **Streak visível no dashboard** — baixo custo de implementação, alto impacto na retenção diária.
4. **Galeria de Práticas com submit** — abre o Core Drive 3 que está completamente fechado.
5. **Ranking municipal visível** — a decisão de design mais diferenciada do produto.

Badges e Active Listening podem vir depois. Certificado só no final é aceitável — é mecânica de longo prazo por definição.

**Conclusão:** O design é sólido. A pergunta é "o suficiente do design vai estar visível e funcionando no dia do lançamento para criar o primeiro hábito?" Hoje a resposta é não.

---

### 🔥 Mr.Beast (Go-to-Market)

A estratégia de landing page tem uma boa base conceitual, mas o go-to-market tem um buraco enorme.

#### O que está funcionando

**A split de identidade ("Sou apicultor" / "Sou pescador") é genial.** Personalização de primeiro clique — o produtor se vê na tela imediatamente. CTR de engajamento vai ser alto.

**Branding MIDR como trust signal está certo.** Para esse público, governo = credibilidade.

**"É gratuito" no CTA é obrigatório e está correto.** Barreira de custo é fatal para produtor rural com renda variável.

#### O problema real: distribuição

A landing page não importa se ninguém chegar nela.

25 mil produtores rurais no Piauí e Amapá. Idade média 45+. Conectividade irregular. Baixa literacia digital. **Esses caras não vão achar a landing page pelo Google.** Não vão clicar em anúncio no Instagram.

Canais que funcionam para esse público:

1. **Técnicos de campo (EMATER, SENAR, agentes FADEX/UFPI)** — São os influenciadores reais. Um técnico que conhece 200 apicultores e fala "baixa esse aplicativo" vale mais do que qualquer anúncio digital. O go-to-market precisa converter os técnicos primeiro, não os produtores.

2. **Associações e cooperativas** — Reunião de cooperativa com 80 produtores é o "evento de lançamento". Apresentação presencial com QR code na tela.

3. **WhatsApp de grupos rurais** — Esse público usa WhatsApp. Muito. Criar material de compartilhamento (card + mensagem pronta) para circular em grupos de produtores é mais eficaz do que qualquer campanha paga.

4. **Rádio rural** — Piauí e Amapá têm rádio comunitária com alcance real no interior.

#### Riscos de conversão

**Risco 1: A URL.** URL indefinida com lançamento em maio é problema. Precisa de URL curta, memorável, que funcione em QR code e que um técnico de campo consiga falar em voz alta.

**Risco 2: Sem depoimentos reais.** Solução: piloto com 20-30 produtores agora, antes do lançamento oficial. Coleta depoimentos reais, descobre problemas de usabilidade, chega no lançamento com prova social genuína.

**Risco 3: Primeira sessão em 3G.** O momento crítico é o cadastro. Se o produtor tenta se registrar com sinal ruim e o formulário falha, ele abandona e nunca volta.

**Risco 4: Quem vai fazer suporte?** Produtor de 50 anos que trava no cadastro vai ligar para alguém. Se não tiver número de WhatsApp de suporte visível na landing, perde a conversão.

#### Estratégia de lançamento em ondas

- **Fase 0 (agora):** Piloto fechado com 50 produtores selecionados pelos técnicos. Objetivo: depoimentos reais + ajustes de UX.
- **Fase 1 (abril):** Lançamento para técnicos e agentes. Treinamento presencial/online. Material de divulgação pronto (QR code, card de WhatsApp, roteiro para reunião de cooperativa).
- **Fase 2 (maio):** Abertura pública com lançamento em eventos nas capitais (Teresina, Macapá) + rádio + WhatsApp.

**Veredito:** A landing page tem a estrutura certa. O problema não é a página — é que a página é o último passo, e os primeiros passos (distribuição física, conversão de técnicos, piloto real) ainda não existem.

---

## Consenso da Equipe

| Prioridade | Quem pede | Por quê |
|------------|-----------|---------|
| **Definir valores de XP/ML/ESP com FADEX** | John, Yu-Kai | Sem isso, a gamificação é uma casca vazia — o loop de feedback não existe |
| **IndexedDB + Sync Queue** | Winston, Sally | Sem persistência offline real, o app quebra no público-alvo (rural, 3G) |
| **Registro de Evidências** | John, Sally | Feature que prova valor prático imediato para o produtor |
| **Display de pontos, streak, nível** | Yu-Kai, John | O mínimo para que a gamificação funcione no dia 1 |
| **Distribuição física (técnicos, cooperativas, WhatsApp)** | Mr.Beast | Landing page sozinha não alcança 25k produtores rurais |

### Cortes de escopo sugeridos para maio

- Push Notifications → pós-lançamento (Winston, John)
- Young Multiplier Dashboard → pós-lançamento (John)
- Active Listening → versão simplificada (John)

### Discordância produtiva

**Galeria Social:** Sally e Yu-Kai querem ela no lançamento (pertencimento, CD3/CD5). John sugere que pode vir depois do essencial. Winston foca na infraestrutura de foto primeiro. Consenso: pipeline de foto primeiro, depois Galeria básica.

---

*Documento gerado em 2026-04-04 via BMAD Party Mode.*
