# PRD — Rota Viva
## Product Requirements Document

**Versão:** 0.1.0
**Data:** 2026-03-26
**Autor:** Jarvis (AI Dev) + Ricardo Lopes Costa (CTO/Founder)
**Origem:** `/ideias/rota-viva.md` (levantamento completo — Etapas 1-8)

---

## 1. Visão Geral

O **Rota Viva** é um aplicativo PWA gamificado para engajamento de produtores rurais — apicultores no Piauí e pescadores artesanais no Amapá — em processos de aprendizagem, escuta ativa e registro de evidências, como parte do programa federal Rotas de Integração Nacional/Regional.

**Cliente:** Ministério da Integração e do Desenvolvimento Regional (MIDR), executado pela FADEX em parceria com a UFPI.

**Plataforma:** Funifier (backend de gamificação) + PWA offline-first (frontend).

---

## 2. Problema

Produtores rurais em territórios vulneráveis têm acesso fragmentado a políticas públicas, baixa organização produtiva e pouca visibilidade institucional. O desafio é engajá-los de forma contínua e sustentada em processos digitais, num contexto de conectividade limitada, literacia digital variável e desconfiança histórica com programas governamentais.

---

## 3. Objetivos Estratégicos

| OE | Dimensão | Foco |
|----|----------|------|
| OE1 | Cultural/Epistêmica | Compreensão e uso de instrumentos públicos |
| OE2 | Social | Fixação de jovens no campo |
| OE3 | Social | Cooperação intergeracional |
| OE5 | Social | Mobilização, lideranças e participação social |
| OE6 | Econômica | Renda, autonomia produtiva e organização econômica |
| OE7 | Territorial | Sustentabilidade socioambiental e boas práticas sanitárias |
| OE8 | Governança | Integridade, conduta e canal de encaminhamento |

---

## 4. Público-Alvo

- **Produtores rurais** — Apicultores (PI, 5 municípios) e Pescadores artesanais (AP, 5 municípios). Smartphone com conectividade intermitente, literacia digital baixa a média.
- **Jovens Multiplicadores** — Jovens produtores (18-35 anos) que atuam como agentes de campo digitais. Mais familiarizados com tecnologia.
- **Gestores de conteúdo** — Equipe da Frente de Geração de Conteúdo, operam via Funifier Studio.

---

## 5. Arquitetura Funifier

### Multi-Gamificação (decisão arquitetural)

```
[App PWA Rota Viva — URL única]
        │
        ▼
[Gamificação Central — roteadora]
 • Registro de todos os jogadores
 • Log de acesso
 • Autenticação única (SSO)
 • Sem mecânicas de jogo próprias
        │
        ├──▶ [Colmeia Viva — Rota do Mel — PI]       BD isolado
        ├──▶ [Rio em Movimento — Pesca Artesanal — AP] BD isolado
        └──▶ [Futuras rotas: Açaí, Cacau, etc.]       BD isolado
```

**Fluxo do jogador:**
1. Acessa URL única → login/cadastro na gamificação central
2. Seleciona rota (dropdown)
3. Central redireciona para gamificação específica da rota
4. Experiência 100% da gamificação da rota a partir dali

**Implicação técnica:**
- 3 gamificações Funifier (Central + Mel + Pesca) na mesma conta
- Frontend PWA único que troca de API key conforme a rota
- Jogador existe na Central (auth) + na gamificação da rota (mecânicas)
- Expansível para 13+ rotas sem interdependência

---

## 6. Funcionalidades (MVP — Fase 1, Meses 1-3)

| # | Funcionalidade | Descrição | Gamif. | IA |
|---|----------------|-----------|--------|-----|
| F1 | Trilhas de conhecimento | 7 trilhas temáticas com missões curtas | ✅ | ✅ parcial |
| F2 | Escuta ativa gamificada | Questionários interativos → dados para MIDR | ✅ | ❌ MVP |
| F3 | Diário do Produtor | Registro diário de atividade (texto + foto), streak | ✅ | ✅ |
| F4 | Guia de Políticas Públicas | Conteúdo interativo sobre programas gov. | ✅ | ❌ MVP |
| F5 | Ranking de municípios | Leaderboard coletivo por município | ✅ | ❌ |
| F6 | Galeria de Saberes | Compartilhamento de boas práticas | ✅ | ✅ |
| F7 | Perfil do Produtor | Avatar, níveis temáticos, badges, conquistas | ✅ | ❌ |
| F8 | Notificações push | Alertas contextualizados | ✅ parcial | ❌ MVP |
| F10 | Canal de conduta | Canal seguro e anônimo (OE8) | ✅ parcial | ❌ |
| F11 | Trilha do Multiplicador | Formação especial para agentes de campo | ✅ | ❌ MVP |
| F12 | Painel do Multiplicador | Dashboard de acompanhamento de onboardings | ✅ | ❌ |

---

## 7. Narrativas por Rota

### Rota do Mel — Piauí: *Colmeia Viva*
- Progressão: Aprendiz do Mel → Guardião da Colmeia
- Metáfora: cada missão = célula do favo; município = colmeia
- Multiplicador: "Abelha-Rainha"
- Visual: hexágonos, abelhas, flores do cerrado, mel dourado

### Pesca Artesanal — Amapá: *Rio em Movimento*
- Progressão: Aprendiz das Águas → Guardião do Rio
- Metáfora: cada missão = nó da rede; município = rede coletiva
- Multiplicador: "Arrais"
- Visual: redes, peixes, rios, canoas, manguezais

---

## 8. Métricas de Sucesso

| Métrica | Meta |
|---------|------|
| Usuários cadastrados | 25.000 |
| Municípios ativos | 10 (5 PI + 5 AP) |
| Retenção D30 | > 25% |
| Conclusão de trilha | > 60% das iniciadas |
| Streak médio | > 7 dias |

---

## 9. Restrições Técnicas

- **Offline-first obrigatório** — conectividade intermitente
- **UX extremamente simples** — zero curva de aprendizado
- **Conteúdo como dependência** — MVP depende da Frente de Conteúdo
- **Integrações**: AAGE (evidências), Frente de Comunicação, Ciência de Dados
- **Prazo**: MVP em 3 meses
- **Escala**: até 25.000 usuários

---

## 10. Stack Técnica

- **Backend**: Funifier Platform (API REST, triggers, schedulers, database)
- **Frontend**: PWA (HTML/CSS/JS), offline-first com Service Worker
- **Hospedagem**: Netlify (frontend) — URL: `rota-viva-funifier.netlify.app` (provisório)
- **Repo**: `github.com/funifieragentdev01/rota-viva`
- **Gamificações**: 3 instâncias Funifier (Central + Mel + Pesca) na conta dedicada

---

## 11. Documentos Derivados (a criar)

- [ ] `doc/architecture.md` — Arquitetura técnica detalhada (multi-gamificação, auth flow, offline sync)
- [ ] `doc/game-design.md` — Design de gamificação completo (pontos, níveis, badges, desafios)
- [ ] `doc/ux-screens.md` — Inventário de telas e fluxos UX
- [ ] `doc/api-spec.md` — Especificação de endpoints e collections
- [ ] `doc/content-spec.md` — Estrutura de conteúdo das trilhas e missões

---

*Documento originado do levantamento completo em `/ideias/rota-viva.md` (Etapas 1-8 do Processo Funifier).*
