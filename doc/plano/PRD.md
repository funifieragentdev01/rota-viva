# PRD — Rota Viva
## Product Requirements Document

**Versão:** 0.2.0
**Data:** 2026-03-26
**Autores:** Jarvis (AI Dev) + Ricardo Lopes Costa (CTO/Founder)
**Origem:** `/ideias/rota-viva.md` (levantamento completo — Etapas 1-8)
**Documentos técnicos derivados:** ver seção 14

---

## Histórico de Versões

| Versão | Data | Alteração |
|--------|------|-----------|
| 0.1.0 | 2026-03-26 | Criação inicial |
| 0.2.0 | 2026-03-26 | Adição de Epics, critérios de aceite, Out of Scope, Suposições/Dependências, NFRs, Stakeholders, Integrações. Arquitetura e Stack movidos para `architecture.md`. |

---

## 1. Visão Geral

O **Rota Viva** é um aplicativo PWA gamificado para engajamento de produtores rurais — apicultores no Piauí e pescadores artesanais no Amapá — em processos de aprendizagem, escuta ativa e registro de evidências, como parte do programa federal Rotas de Integração Nacional/Regional (MIDR).

**Cliente:** Ministério da Integração e do Desenvolvimento Regional (MIDR), executado pela FADEX em parceria com a UFPI.
**Plataforma:** Funifier (backend de gamificação) + PWA offline-first (frontend).
**Contrato:** 12 meses, até 25.000 participantes, dois territórios (PI e AP).

---

## 2. Problema

Produtores rurais em territórios vulneráveis têm acesso fragmentado a políticas públicas, baixa organização produtiva e pouca visibilidade institucional. O desafio é engajá-los de forma contínua e sustentada em processos digitais, em um contexto de:

- **Conectividade limitada e intermitente** (zonas rurais do Piauí e Amapá)
- **Literacia digital variável** — de jovens familiarizados com smartphone a produtores mais velhos com primeiro acesso
- **Desconfiança histórica** com programas governamentais ("promessa que não chega")
- **Tempo escasso** — rotinas produtivas e domésticas intensas
- **Dispersão territorial** — 10 municípios em dois estados

Sem um instrumento digital especializado, o projeto não consegue coletar evidências verificáveis de participação nem gerar os dados qualitativos exigidos pelo MIDR para prestação de contas.

---

## 3. Objetivos Estratégicos

| OE | Dimensão | Foco | Trilha correspondente |
|----|----------|------|----------------------|
| OE1 | Cultural/Epistêmica | Compreensão e uso de instrumentos públicos | Trilha A |
| OE2 | Social | Fixação de jovens no campo | Trilha B |
| OE3 | Social | Cooperação intergeracional | Trilha C |
| OE5 | Social | Mobilização, lideranças e participação social | Trilha F |
| OE6 | Econômica | Renda, autonomia produtiva e organização econômica | Trilha D |
| OE7 | Territorial | Sustentabilidade socioambiental e boas práticas sanitárias | Trilha E |
| OE8 | Governança | Integridade, conduta e canal de encaminhamento | Trilha G |

---

## 4. Público-Alvo e Personas

### Persona 1 — Produtor Rural (público principal)

| Atributo | Apicultor — Piauí | Pescador Artesanal — Amapá |
|----------|-------------------|---------------------------|
| Território | 5 municípios do Piauí | 5 municípios do Amapá |
| Faixa etária | Variada (jovens a idosos) | Variada, maioria adultos |
| Conectividade | Intermitente — uso via smartphone | Intermitente — uso via smartphone |
| Literacia digital | Baixa a média | Baixa a média |
| Motivação principal | Acesso a políticas públicas, regularização, preço justo | Formalização, acesso a benefícios, valorização da atividade |
| Barreira principal | Desconfiança com tecnologia e governo; tempo escasso | Informalidade, invisibilidade produtiva |
| Identidade | Guardião de conhecimento ancestral; orgulho do território | Guardião dos rios; identidade cultural forte |

### Persona 2 — Jovem Multiplicador (agente de campo digital)

- **Perfil:** 18–35 anos, filho ou jovem produtor, mais familiarizado com tecnologia
- **Motivação:** protagonismo, renda/bolsa, perspectiva de futuro no campo
- **Papel no app:** forma-se na Trilha do Multiplicador, depois capacita produtores presencialmente e registra onboardings via app
- **Diferencial no app:** acesso restrito a trilha, painel e certificação especial (Abelha-Rainha / Arrais)

### Persona 3 — Gestor de Conteúdo (operador da plataforma)

- **Perfil:** equipe da Frente de Geração de Conteúdo (empresa contratada separadamente)
- **Canal:** Funifier Studio (back-office web, não é o PWA)
- **Papel:** publica e atualiza missões, trilhas e desafios; cura Galeria de Saberes; exporta dados para AAGE
- **Não é jogador** — é operador da plataforma

---

## 5. Escopo — O que está DENTRO

### MVP (Fase 1–2, meses 1–5)

Dois territórios: **Rota do Mel — Piauí** (narrativa: Colmeia Viva) e **Pesca Artesanal — Amapá** (narrativa: Rio em Movimento).

Funcionalidades completas listadas nos Epics EP01–EP11 (seção 7).

### V1.1 (Fase 2–3, meses 3–8)

- Curadoria automática da Galeria de Saberes
- Desafios colaborativos avançados entre municípios
- IA de recomendação de trilhas
- Onboarding adaptativo por perfil de literacia digital

### V2 (Fase 3–4, meses 6–12)

- Análise NLP de respostas de escuta ativa
- Simplificação automática de linguagem de políticas públicas
- Expansão para novas rotas (Açaí, Cacau, etc.)

---

## 6. Escopo — O que está FORA

Os itens abaixo estão **explicitamente fora do escopo** desta contratação:

| Fora do escopo | Motivo |
|---------------|--------|
| App nativo iOS / Android (loja de aplicativos) | PWA cobre os requisitos de conectividade e hardware do público |
| Outras rotas além de Piauí e Amapá | Escopo contratual restrito a estas duas rotas |
| Chat ou mensageria em tempo real entre participantes | Complexidade e moderação fora do prazo; WhatsApp supre essa necessidade |
| Sistema de pagamento ou transferência de benefícios | Benefícios financeiros geridos externamente pela FADEX |
| Módulo de e-commerce ou loja física | Fora da proposta de valor do projeto |
| Web app para participantes em desktop | Público usa exclusivamente smartphone |
| Suporte a múltiplos idiomas | Português brasileiro é o único idioma do público |
| Conteúdo educacional das trilhas | Responsabilidade da Frente de Geração de Conteúdo (empresa separada) |
| Execução de eventos e campanhas externas | Responsabilidade da empresa de Marketing e Comunicação |

---

## 7. Epics e Features

> Cada Epic agrupa funcionalidades relacionadas. Critérios de aceite definem o mínimo para considerar a feature entregue.

---

### EP01 — Autenticação e Onboarding

**Objetivo:** permitir que o produtor acesse o app pela primeira vez de forma simples, segura e com contexto motivacional.

| Feature | Descrição | Critério de aceite | Prioridade |
|---------|-----------|-------------------|-----------|
| Landing Page pública | Apresentação do projeto com CTA de cadastro e vídeo institucional | Página carrega em < 3s; CTA leva ao cadastro | MVP |
| Cadastro | Criação de conta com nome, foto, município e rota | Conta criada na gamificação central; participante redirecionado à rota correta | MVP |
| Login | Autenticação com e-mail e senha | Token JWT emitido; sessão mantida offline | MVP |
| Recuperar / Redefinir senha | Fluxo de reset via e-mail | Link de reset expira em 24h; nova senha funcional | MVP |
| Confirmação de e-mail | Verificação pós-cadastro | Acesso liberado apenas após confirmação | MVP |
| Seleção de Rota | Tela pós-auth para escolha da rota | Participante redirecionado à gamificação correta | MVP |
| Placa dos Fundadores | Interstitial mostrando vagas de Fundador no município | Badge "Fundador" concedido automaticamente aos primeiros 50 por município; contador visível | MVP |
| Termos de Uso e Política de Privacidade (LGPD) | Páginas públicas com aceite no cadastro | Aceite registrado com timestamp; conteúdo conforme LGPD | MVP |

---

### EP02 — Trilhas e Missões

**Objetivo:** entregar a experiência central de aprendizagem gamificada, funcionando offline.

| Feature | Descrição | Critério de aceite | Prioridade |
|---------|-----------|-------------------|-----------|
| Lista de Trilhas | 7 trilhas temáticas + Trilha do Multiplicador (restrita) | Progresso por trilha visível; estados corretos (bloqueada/disponível/completa) | MVP |
| Detalhe da Trilha | Missões da trilha com estados e XP total | Missões com pré-requisitos respeitados; badge de conclusão visível | MVP |
| Execução de Missão — Padrão | Conteúdo (texto/vídeo) + quiz ou evidência | Funciona offline; ação registrada ao reconectar; máx. 3 telas por missão | MVP |
| Execução de Missão — Relâmpago (CD7) | Missão 24h com XP dobrado, sem anúncio prévio | Timer visível; badge exclusivo gerado ao concluir; missão desaparece após 24h | MVP |
| Resultado — Padrão | XP + animação + sugestão de próxima missão | Feedback visual imediato; XP atualizado em tempo real | MVP |
| Resultado — Nível Atingido | Celebração especial + CTA de compartilhamento | Cartão visual gerado automaticamente com nível e nome temático | MVP |
| Resultado — Marco Intermediário (L1.5 / L2.5) | Badge surpresa sem ser nível formal | Badge gerado sem alteração de mecânicas; mensagem temática personalizada | MVP |
| Resultado — Eco da Rota (CD7) | Mensagem de outro produtor (~20% dos resultados) | Seleção aleatória de mensagens curadas pelo admin; nunca repete consecutivamente | MVP |
| Submissão de Evidência | Upload de foto + descrição como prova de ação de campo | Funciona offline; sincroniza ao reconectar; XP concedido após sync | MVP |
| Missão de Vídeo | Gravação/upload de vídeo ≤ 60s como evidência | Autorização de uso integrada ao cadastro; vídeo disponível na Galeria após aprovação | MVP |

---

### EP03 — Gamificação e Progressão

**Objetivo:** implementar o motor de engajamento com economia de pontos, progressão e recompensas.

| Feature | Descrição | Critério de aceite | Prioridade |
|---------|-----------|-------------------|-----------|
| Sistema de pontos (XP / ML / ESP / VOZ / CPO) | 4 categorias de pontos por rota | Cálculo automático; cap de 80 XP/dia; histórico consultável | MVP |
| Níveis e marcos de progressão | L0–L5 + marcos intermediários L1.5 e L2.5 | Progressão calculada corretamente; marcos não alteram mecânicas; celebração visual em todos | MVP |
| Badges e conquistas | Badges temáticos por marco, trilha, streak e comportamento inesperado (CD7) | Badge concedido imediatamente; visível no perfil; bloqueados aparecem em cinza | MVP |
| Streak diária | Contador de dias consecutivos; não zera com 1 dia de ausência (zera após 3 dias) | Streak atualizada corretamente; animação de flame; bônus no 7º dia | MVP |
| Loja de Conteúdo | Itens desbloqueáveis com moeda temática (ML / ESP) | Saldo correto; item desbloqueado imediatamente após compra; histórico de transações | MVP |
| Baú do Território (CD7) | Overlay surpresa ao atingir combinação de ações | Trigger configurável no Funifier; aparece máx. 1x/semana por participante | MVP |

---

### EP04 — Escuta Ativa

**Objetivo:** coletar dados qualitativos e quantitativos dos territórios de forma gamificada, sem que o participante sinta que está sendo "pesquisado".

| Feature | Descrição | Critério de aceite | Prioridade |
|---------|-----------|-------------------|-----------|
| Instrumento de Escuta Ativa | Formulário gamificado (máx. 5 perguntas), feedback visual por resposta | Funciona offline; dados sincronizados para AAGE ao reconectar; pontos VOZ concedidos | MVP |
| Trigger CD7 por resposta | Badge surpresa ao mencionar palavras-chave específicas | Lista de palavras-chave configurável no admin; badge concedido automaticamente | MVP |

---

### EP05 — Galeria de Saberes e Diário do Produtor

**Objetivo:** ativar CD3 (Empoderamento Criativo) permitindo que participantes produzam e compartilhem conhecimento.

| Feature | Descrição | Critério de aceite | Prioridade |
|---------|-----------|-------------------|-----------|
| Feed da Galeria | Lista de boas práticas compartilhadas, filtráveis por trilha e território | Carrega offline com cache; votação funcional | MVP |
| Publicar na Galeria | Texto + foto ou vídeo; XP e ML/ESP ao publicar | Publicação aparece no feed após envio; funciona offline com sync | MVP |
| Votação e destaque | Comunidade vota nas práticas; top 3 semanal recebe bônus | Voto registrado 1x por participante por publicação; bônus calculado automaticamente | MVP |
| Diário do Produtor — Histórico | Histórico cronológico de registros com streak própria | Streak do diário independente da streak de missões | MVP |
| Diário do Produtor — Novo Registro | Texto ≤ 280 caracteres + foto opcional; funciona offline | Sincronização automática ao reconectar; XP concedido após sync | MVP |

---

### EP06 — Rankings e Social

**Objetivo:** criar motivação social por pertencimento territorial sem ranking individual punitivo.

| Feature | Descrição | Critério de aceite | Prioridade |
|---------|-----------|-------------------|-----------|
| Ranking de Municípios (por rota) | Leaderboard semanal dos 5 municípios de cada rota; XP coletivo | Reset automático toda segunda-feira; posição do participante destacada | MVP |
| Mecânica de Comeback | Município em último lugar por 2 semanas recebe 1,5x XP por 7 dias | Multiplicador aplicado automaticamente; ícone "em ascensão" visível no ranking | MVP |
| Placar Nacional Piauí × Amapá | Widget comparando XP semanal das duas rotas | Atualizado em tempo real; badge "Orgulho do [Estado]" para rota vencedora | MVP |
| Notificação de virada de liderança | Push quando a rota do participante ultrapassa a outra | Trigger automático; máx. 1 notificação por semana deste tipo | MVP |

---

### EP07 — Multiplicador

**Objetivo:** formar jovens como agentes de campo digitais certificados, com visibilidade pública da certificação.

| Feature | Descrição | Critério de aceite | Prioridade |
|---------|-----------|-------------------|-----------|
| Desbloqueio da Trilha (L3) | Notificação e acesso à Trilha do Multiplicador ao atingir L3 | Acesso liberado apenas para L3+; notificação enviada imediatamente | MVP |
| Trilha do Multiplicador | Missões de formação como agente de campo | Trilha completa com critério de conclusão; roteiro de sessão presencial integrado | MVP |
| Painel do Multiplicador | Dashboard: produtores onboardeados, CPO, progresso até certificação | CPO atualizado em tempo real; meta de certificação visível | MVP |
| Material de Capacitação Presencial | Roteiro, FAQ e QR codes imprimíveis | Disponível offline; QR codes funcionais para onboarding em campo | MVP |
| Tela de Certificação | Animação + título especial + cartão compartilhável | Badge permanente concedido; cartão gerado automaticamente; Hall da Fama atualizado | MVP |
| Hall da Fama dos Multiplicadores | Lista pública de certificados (app + página externa) | Nome, foto, município e data visíveis; atualizado em tempo real | MVP |

---

### EP08 — Eventos Especiais

**Objetivo:** introduzir imprevisibilidade (CD7) e momentos de alto engajamento ao longo do ano.

| Feature | Descrição | Critério de aceite | Prioridade |
|---------|-----------|-------------------|-----------|
| Missão Relâmpago (CD7) | Missão de 24h, XP dobrado, sem anúncio prévio, 1x/semana | Timer conta regressiva; desaparece exatamente às 24h; badge exclusivo por edição | MVP |
| Eco da Rota (CD7) | Mensagem surpresa de outro produtor em ~20% dos resultados de missão | Taxa configurável; pool de mensagens curadas pelo admin; nunca repete consecutivamente | MVP |
| Baú do Território (CD7) | Overlay de recompensa surpresa ao atingir combinação de ações | Combinação configurável; máx. 1x/semana por participante | MVP |
| Desafio Mensal da Autoridade | Missão coletiva com meta e stakes concretos; vídeo da autoridade | Meta coletiva visível a todos; badges de participação e herói ao final | MVP |
| Cerimônia Campeão Semanal | Notificação push para todos anunciando município vencedor + badge semanal | Trigger automático toda segunda-feira; badge "Colmeia de Ouro" / "Rede de Prata" | MVP |
| Devolutiva "Voz que Chegou" | Tela mostrando dados do ciclo + contribuição individual + badge | Badge "Voz Ouvida — Ciclo X" colecionável; publicado pela equipe admin; CTA compartilhar | MVP |

---

### EP09 — Viralização e Crescimento Orgânico

**Objetivo:** gerar crescimento orgânico transformando participantes em divulgadores do projeto.

| Feature | Descrição | Critério de aceite | Prioridade |
|---------|-----------|-------------------|-----------|
| Cartão Compartilhável | Card visual gerado automaticamente com nível, rota e badge | Gerado em PNG; botão "Compartilhar no WhatsApp" (Web Share API) funcional em 1 clique | MVP |
| Compartilhamento de Conquistas | Overlay de celebração com CTA de compartilhamento em todos os momentos significativos | Aparece em: nível atingido, trilha concluída, badge raro, certificação, Devolutiva | MVP |
| Placa dos Fundadores | Badge e placa permanente para os primeiros 50 de cada município | Contador visível no onboarding; placa visível por todos os participantes do município | MVP |

---

### EP10 — Admin e Gestão de Conteúdo (Funifier Studio)

**Objetivo:** habilitar a equipe de conteúdo a operar o app de forma autônoma.

| Feature | Descrição | Critério de aceite | Prioridade |
|---------|-----------|-------------------|-----------|
| Gestão de trilhas e missões | Criar, editar e publicar missões diretamente no Studio | Missão publicada aparece no app em < 5 min | MVP |
| Gestão de eventos (Relâmpago, Desafio) | Configurar eventos especiais com data/hora e meta | Eventos ativam e desativam automaticamente no horário configurado | MVP |
| Curadoria da Galeria | Aprovar publicações, selecionar destaques, pool do Eco da Rota | Publicação aprovada aparece no feed imediatamente | MVP |
| Monitoramento de engajamento | Dashboard: XP, retenção, missões completadas por município | Dados atualizados com delay máximo de 1h | MVP |
| Gestão de Multiplicadores | Visualizar CPO, aprovar certificações | Certificação aprovada dispara badge e Hall da Fama automaticamente | MVP |
| Publicação de Devolutiva | Inserir dados do ciclo para tela "Voz que Chegou" | Tela ativada e notificação enviada ao publicar | MVP |
| Exportação para AAGE | Relatórios de evidências e escuta ativa | Exportação em formato acordado com a AAGE; disponível por município e período | MVP |

---

### EP11 — Integrações Externas

**Objetivo:** garantir interoperabilidade com os sistemas do ecossistema do projeto.

| Integração | Direção | O que trafega | Formato | Responsável pela API | Prioridade |
|-----------|---------|--------------|---------|---------------------|-----------|
| AAGE | Funifier → AAGE | Evidências (foto + metadados), respostas de escuta ativa (VOZ), log de participação | A definir com AAGE | AAGE expõe; Funifier consome via webhook | MVP |
| Push Notifications | Funifier → Participante | Alertas de missão, eventos, reengajamento, cerimônia semanal, Devolutiva | Web Push API | Funifier Notification Service | MVP |
| WhatsApp Share | PWA → WhatsApp | Cartão compartilhável (PNG) | Web Share API | N/A — nativo do navegador | MVP |
| Analytics | PWA → Analytics | Pageviews, eventos de engajamento, funil de onboarding | A definir (ex: Plausible, GA4) | Funifier configura | MVP |

---

## 8. Requisitos Não-Funcionais (NFRs)

### Performance

| Requisito | Meta |
|-----------|------|
| Tempo de carregamento inicial (online) | < 3 segundos em 3G |
| Tempo de carregamento com cache offline | < 1 segundo |
| Tamanho do bundle inicial (JS + CSS) | < 200 KB gzipped |
| Sincronização de dados offline | Automática ao reconectar, transparente para o usuário |

### Disponibilidade

| Requisito | Meta |
|-----------|------|
| Uptime da plataforma Funifier | 99,5% (conforme contrato) |
| Funcionamento offline | 100% das funcionalidades core (trilhas, diário, evidências, escuta ativa) |
| Funcionalidades que requerem conexão | Rankings em tempo real, Placar Nacional, push notifications |

### Segurança

| Requisito | Especificação |
|-----------|--------------|
| Autenticação | JWT com expiração de 7 dias; refresh token automático |
| Sessão offline | Token armazenado localmente com expiração; reautenticação ao reconectar após expiração |
| Comunicação | HTTPS com certificado SSL/TLS válido em todos os endpoints |
| Controle de acesso | RBAC: participante / gestor de conteúdo / admin / Multiplicador |
| Múltiplos dispositivos | Sessão válida em múltiplos dispositivos; logout remoto disponível |

### Conformidade LGPD

| Requisito | Especificação |
|-----------|--------------|
| Base legal | Documentada para cada tipo de dado coletado |
| Dados coletados | Nome, foto, município, rota, histórico de ações, respostas de escuta ativa, evidências (fotos/vídeos) |
| Minimização | Coletar apenas o necessário para as funcionalidades; sem rastreamento de geolocalização |
| Canal de atendimento | E-mail de contato LGPD declarado na Política de Privacidade |
| Retenção e descarte | Dados retidos pelo prazo contratual (12 meses) + 90 dias para migração |
| Consentimento de imagem | Aceite explícito no cadastro para uso de foto/vídeo em materiais do projeto |
| ROPA | Registro de atividades de tratamento mantido pela Funifier |

### Acessibilidade

| Requisito | Especificação |
|-----------|--------------|
| Área de toque mínima | 44 × 44px em todos os elementos interativos |
| Contraste de texto | Mínimo WCAG AA (4,5:1 para texto normal) |
| Tamanho de fonte | Mínimo 16px para texto de leitura; escalável com configuração do sistema |
| Compatibilidade | Android 5+ / Chrome 57+; iOS 11.3+ / Safari 11.1+ |

### Comportamento Offline

| Funciona offline | Não funciona offline (requer conexão) |
|-----------------|--------------------------------------|
| Leitura de trilhas e missões (cache) | Rankings em tempo real |
| Execução de quiz (respostas armazenadas localmente) | Placar Nacional PI × AP |
| Submissão de evidências (fila de sync) | Push notifications |
| Diário do Produtor | Loja de conteúdo (compras) |
| Escuta ativa (respostas em fila) | Desafio da Autoridade (contador coletivo) |
| Galeria de Saberes (cache do feed) | — |
| Material de Capacitação Presencial | — |

---

## 9. Integrações Externas — Detalhamento

### 9.1 Integração AAGE

- **O que é:** plataforma de gestão de beneficiários usada pelo projeto Rota Viva
- **Direção:** Funifier envia dados → AAGE recebe
- **Dados enviados:** evidências (foto + metadados: participante, data, GPS se disponível), respostas de escuta ativa (anonimizadas por participante, com VOZ e território), log de participação (ações por município e período)
- **Frequência:** por webhook a cada ação registrada + exportação batch diária
- **Dependência:** AAGE deve disponibilizar endpoint de recebimento e autenticação até o início da Fase 1
- **Responsável por definir o contrato de integração:** FADEX + equipe técnica da AAGE + Funifier

### 9.2 Push Notifications

- **Serviço:** Web Push API (nativo de navegador) via Funifier Notification Service
- **Tipos:** reengajamento (3 dias inativo), evento novo (Relâmpago, Desafio), cerimônia semanal, Devolutiva, nível atingido
- **Opt-in:** solicitado no onboarding; não obrigatório para uso do app
- **Limitação:** iOS suporta Web Push apenas a partir do iOS 16.4 — comunicar aos usuários

### 9.3 WhatsApp Share

- **Mecanismo:** Web Share API nativa do navegador mobile
- **Conteúdo:** PNG do cartão compartilhável (gerado no frontend) + texto padrão com link do app
- **Sem dependência de API do WhatsApp** — funciona via compartilhamento nativo do sistema operacional

---

## 10. Suposições e Dependências

| # | Suposição / Dependência | Impacto se não cumprida | Responsável |
|---|------------------------|------------------------|------------|
| S1 | A Frente de Geração de Conteúdo entregará materiais mínimos das Trilhas A e B até o mês 2 | MVP sem conteúdo não pode ser lançado | FADEX |
| S2 | A AAGE disponibilizará endpoint de integração e especificação técnica até o início do mês 1 | Integração de evidências e escuta ativa não pode ser desenvolvida | FADEX + AAGE |
| S3 | Os 10 municípios participantes serão confirmados pela FADEX/UFPI/MIDR antes do início da Fase 1 | Estrutura de gamificações e rankings não pode ser configurada | FADEX/UFPI |
| S4 | Os instrumentos de escuta ativa serão definidos e aprovados pela UFPI antes do mês 2 | EP04 não pode ser implementado | UFPI |
| S5 | Os smartphones dos participantes suportam PWA (Android 5+ / Chrome 57+ ou iOS 11.3+) | Participantes não conseguem instalar ou usar o app | — (risco a mitigar com evento de campo) |
| S6 | A FADEX definirá os critérios e remuneração dos Jovens Multiplicadores antes do lançamento | Trilha do Multiplicador não pode ser lançada sem clareza sobre o papel | FADEX |
| S7 | A empresa de Marketing terá plano de lançamento e conteúdo externo pronto para a Fase 2 | Viralização não acontece sem ativação externa | Empresa de Marketing |
| S8 | O Secretário/autoridade MIDR gravará vídeo de lançamento do Desafio Mensal até o mês 4 | EP08 Desafio da Autoridade não pode ser executado | MIDR/FADEX |

---

## 11. Métricas de Sucesso

| Métrica | Meta | Baseline | Como medir | Responsável |
|---------|------|----------|-----------|------------|
| Usuários cadastrados | 25.000 | 0 | Funifier Studio → total de jogadores na gamificação central | Funifier |
| Municípios com participação ativa (≥ 50% dos produtores cadastrados) | 10/10 | 0 | Leaderboard por município | Funifier |
| Retenção D30 (retorna ao app em 30 dias após cadastro) | > 25% | n/a | Log de acesso Funifier — cohort por semana de cadastro | Funifier |
| Taxa de conclusão de trilha | > 60% das trilhas iniciadas | n/a | Funifier: challengeCompleted / challengeStarted | Funifier |
| Streak médio | > 7 dias | n/a | Funifier: streak_average por rota | Funifier |
| Instrumentos de escuta ativa respondidos | A definir com MIDR | 0 | Pontos VOZ coletados | UFPI/FADEX |
| Evidências registradas e enviadas ao AAGE | A definir com MIDR | 0 | Webhook de integração Funifier → AAGE | FADEX/AAGE |
| Jovens Multiplicadores certificados | A definir com FADEX | 0 | CPO atingido + badge Abelha-Rainha/Arrais | FADEX |

---

## 12. Stakeholders e Aprovações

| Stakeholder | Papel | Decisões que aprova |
|-------------|-------|---------------------|
| MIDR | Patrocinador / financiador | Objetivos estratégicos, Desafio da Autoridade, uso de dados |
| FADEX | Executor / gestão do projeto | Municípios participantes, critérios dos Multiplicadores, aprovação de fases |
| UFPI | Parceiro acadêmico | Instrumentos de escuta ativa, análise de dados |
| Frente de Geração de Conteúdo | Fornecedor de conteúdo | Materiais das 7 trilhas, guia de políticas públicas |
| Empresa de Marketing e Comunicação | Comunicação e eventos | Lançamento, campanhas externas, eventos, conteúdo externo |
| Funifier | Plataforma e PWA | Arquitetura técnica, configuração de gamificação, desenvolvimento |

---

## 13. Fases e Roadmap

| Fase | Período | Entregas principais |
|------|---------|---------------------|
| Fase 1 — Planejamento e Implantação | Meses 1–3 | Plataforma ativa, configuração da gamificação, MVP do PWA, onboarding funcional, integração AAGE testada |
| Fase 2 — Lançamento e Estabilização | Meses 3–5 | PWA em produção, primeiros ciclos de participação, integrações plenas, V1.1 iniciada |
| Fase 3 — Operação Contínua | Meses 4–11 | Operação sustentada, Desafios mensais, Devolutivas trimestrais, expansão de trilhas e missões |
| Fase 4 — Encerramento | Mês 12 | Dossiê final, devolutiva institucional, plano de continuidade e expansão para novas rotas |

---

## 14. Referências e Documentos Derivados

| Documento | Status | Descrição |
|-----------|--------|-----------|
| `/ideias/rota-viva.md` | ✅ Concluído | Levantamento completo — Etapas 1–8 (gamification brief, design, UX, viralização) |
| `doc/architecture.md` | 🔲 A criar | Arquitetura técnica: multi-gamificação, auth flow, offline sync, stack |
| `doc/game-design.md` | 🔲 A criar | Design de gamificação: pontos, níveis, badges, desafios, economia |
| `doc/ux-screens.md` | 🔲 A criar | Inventário completo de 48 telas e 12 fluxos UX |
| `doc/api-spec.md` | 🔲 A criar | Especificação de endpoints Funifier utilizados e contrato de integração AAGE |
| `doc/content-spec.md` | 🔲 A criar | Estrutura de conteúdo das 7 trilhas e missões (para a Frente de Conteúdo) |
| `doc/lgpd.md` | 🔲 A criar | Documentação LGPD: ROPA, base legal por dado, política de retenção |

---

*PRD v0.2.0 — Originado de `/ideias/rota-viva.md` e revisado com visão de produto, UX e técnica.*
