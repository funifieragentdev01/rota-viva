# Plano de Conteúdo das Trilhas — Rota Viva
## Sessão de Planejamento — 2026-04-08 | Atualizado 2026-04-08

**Participantes:** Ricardo Lopes Costa (CTO/Founder), Claude (Arquiteto/Dev)

---

## 1. Estrutura de trilhas — definição final

O app tem **4 trilhas**, cada uma com todos os módulos dentro:

| Trilha | Público | Instância Funifier |
|--------|---------|-------------------|
| **Rota do Mel** | Apicultores do Piauí | Token Mel |
| **Rota da Pesca** | Pescadores do Amapá | Token Pesca |
| **Multiplicador do Mel** | Técnicos/multiplicadores Mel | Token Mel (perfil diferente) |
| **Multiplicador da Pesca** | Técnicos/multiplicadores Pesca | Token Pesca (perfil diferente) |

Cada trilha é **linear** (Duolingo-style): o usuário percorre Início → Módulo A → B → ... → G, um módulo de cada vez.

### Módulos dentro de cada trilha

```
Início — Conheça a Profissão      (obrigatório antes de A–G)
Módulo A — Programas do Governo
Módulo B — Boas Práticas Produtivas
Módulo C — Qualidade e Certificação
Módulo D — Venda Justa
Módulo E — Associativismo
Módulo F — Saúde e Segurança
Módulo G — Meio Ambiente
```

---

## 2. Tipos de conteúdo das lições

### 1 — Vídeo
- Vertical estilo Instagram Reels, 3–5 minutos
- Armazenado na coleção customizada `video__c` (campo `url` = link YouTube)
- YouTube Shorts (vertical 9:16) como formato principal
- Enquanto vídeos próprios não existem: usar vídeos públicos do MDA/Embrapa no YouTube

### 2 — Leitura
- Texto com fotos e infográficos
- Coleção customizada `reading__c` a ser criada (ver Sprint 3-C)
- Inclui narração de áudio do texto (TTS automático via Web Speech API)
- Máx. 800 palavras, mín. 2 imagens por lição

### 3 — Avaliação de Conhecimento
Quiz com **~10 questões** seguindo a progressão de dificuldade do Duolingo:

| Tipo | Nome no app | Suporte app | Quando usar |
|------|-------------|-------------|-------------|
| `MULTIPLE_CHOICE` (one) | Escolha Única | ✅ v1.0 | Sempre |
| `MULTIPLE_CHOICE` (multiple) | Múltipla Escolha | ✅ v1.0 | Conceitos com múltiplas respostas válidas |
| `TRUE_FALSE` | Verdadeiro/Falso | ✅ v1.0 | Verificação rápida de fatos |
| `LISTEN` | Ouvir e Responder | ✅ v1.4.3 | 1× por avaliação mínimo |
| `LISTEN_AND_ORDER` | Ouvir e Ordenar | ✅ v1.4.3 | Sequências, processos |
| `MATCHING` | Associação | ✅ v1.4.4 | Equipamento↔função, termo↔definição |
| `SELECT_MISSING_WORDS` | Completar Lacunas | ✅ v1.4.4 | Frases com vocabulário técnico |
| `DRAG_AND_DROP_INTO_TEXT` | Arrastar Palavras | ✅ v1.4.4 | Ordenar palavras em frase |
| `ESSAY` | Digitar Texto | ✅ v1.0 | Reflexão livre |
| `SHORT_ANSWER` | Digitar Resposta | ✅ v1.0 | Resposta curta objetiva |

> Imagens nas perguntas: usar `<img>` no campo `question` (HTML suportado)

### 4 — Escuta Ativa
Quiz com **perguntas pessoais** para coletar dados do produtor — **obrigatório em todos os módulos**:

| Tipo | Exemplo |
|------|---------|
| `SHORT_ANSWER` | "Quantos litros de mel você produz por semana?" |
| `SHORT_ANSWER` | "Você está vinculado a alguma cooperativa ou associação? Qual?" |
| `ESSAY` | "Explique como, quando e com quem você aprendeu a produzir mel." |
| `MULTIPLE_CHOICE` | Perguntas sobre realidade local, desafios, recursos disponíveis |
| `TRUE_FALSE` | Verificar situação de regularização, certificação, etc. |

> A Escuta Ativa coleta dados para o MDA sobre o perfil real dos produtores. Deve estar em **todos os módulos**, com 3–5 questões direcionadas ao tema do módulo.

### 5 — Missão
Tarefa específica de campo — uma por módulo (quando aplicável):

| Tipo | Descrição | Implementação |
|------|-----------|---------------|
| **Cadastro CAF** | Usuário informa número CAF; sistema valida via API do governo | ⚠️ Requer integração API — Sprint futura |
| **Foto de documento** | Alternativa ao CAF: tirar foto do cartão/documento de regularização | ✅ DIY_PROJECT foto |

> **D-C5 aberta:** integração com API CAF do governo — implementar na Fase 1 como foto do documento; substituir por validação real quando API disponível.

### 6 — Diário
Quiz com coleta de evidências visuais/geográficas — **obrigatório em todos os módulos**. Recompensa: cristal no baú.

| Tipo | Exemplo | Status app |
|------|---------|------------|
| **Tirar Foto** (DIY_PROJECT) | "Tire uma foto do seu apiário" / "Tire uma foto dos peixes que pescou hoje" | ✅ v1.0 |
| **Fazer Vídeo** (DIY_PROJECT) | "Grave um vídeo das pessoas trabalhando no apiário" | ⚠️ Desafio: upload em zona rural com baixa conectividade |
| **Localização GPS** | "Mostre no mapa onde está sua produção" | ⏳ Sprint 3-C (Leaflet.js) |

> **Atenção:** "Fazer Vídeo" tem risco de falha em zonas rurais com baixa conectividade. Implementar com compressão local + upload em background quando houver sinal. Considerar limitar a vídeos curtos (máx. 30s) antes de fazer upload.

---

## 3. Estrutura padrão de módulos

### Regras obrigatórias
- **Vídeo e Quiz são lições separadas** — cada um aparece como uma bolinha distinta na trilha, com ícone próprio
- **Quiz de Avaliação: sempre 10 questões** (exceto Escuta Ativa e Diário)
- **Todo módulo deve ter**: 1 Escuta Ativa + 1 Diário (baú) + 1 Revisão Geral (última lição)
- **Revisão Geral** = Quiz de 10 questões cobrindo todo o conteúdo do módulo, sem material novo

### Ícones na trilha por tipo de lição
| Ícone app | Tipo de lição | Font Awesome |
|-----------|---------------|-------------|
| 📺 | Vídeo | `fa-play` |
| 📖 | Leitura | `fa-book-open` |
| ⭐ | Avaliação (Quiz) | `fa-star` |
| 💬 | Escuta Ativa | `fa-comment` |
| 📦 | Diário (Baú) | `fa-gem` |
| 🏆 | Revisão Geral | `fa-trophy` (ou `fa-rotate`) |
| 🔧 | Missão | `fa-wrench` |

### Estrutura padrão — Módulo Início (11 lições)
> O Início é o "Orientation" do app — maior que os demais para criar base completa de propósito, conhecimento, carreira e campo. 3 Vídeos + 4 Quizzes + 1 Leitura + Escuta + Diário + Revisão.

| # | Ícone | Tipo | Questões |
|---|-------|------|----------|
| 1 | 📺 | Vídeo | — |
| 2 | ⭐ | Quiz de Avaliação | 10 |
| 3 | 📺 | Vídeo | — |
| 4 | ⭐ | Quiz de Avaliação | 10 |
| 5 | 📺 | Vídeo | — |
| 6 | ⭐ | Quiz de Avaliação | 10 |
| 7 | 📖 | Leitura | — |
| 8 | ⭐ | Quiz de Avaliação | 10 |
| 9 | 💬 | Escuta Ativa | 4–5 |
| 10 | 📦 | Diário (Baú) | — |
| 11 | 🏆 | Revisão Geral | 10 |

### Estrutura padrão — Módulos A–G (9 lições)
> Módulos temáticos com conteúdo mais denso: inclui Leitura como aprofundamento.

| # | Ícone | Tipo | Questões |
|---|-------|------|----------|
| 1 | 📺 | Vídeo | — |
| 2 | ⭐ | Quiz de Avaliação | 10 |
| 3 | 📺 | Vídeo | — |
| 4 | ⭐ | Quiz de Avaliação | 10 |
| 5 | 📖 | Leitura | — |
| 6 | ⭐ | Quiz de Avaliação | 10 |
| 7 | 💬 | Escuta Ativa | 4–5 |
| 8 | 📦 | Diário (Baú) | — |
| 9 | 🏆 | Revisão Geral | 10 |

---

## 4. Estado atual do Funifier (conteúdo de teste)

### Rota do Mel
**Estrutura existente (teste — a limpar):**
```
Início
  └── Boas-Vindas
        ├── 0.1 — O que é apicultura (Vídeo)       [conteúdo de teste]
        ├── 0.1 — O que é apicultura (Quiz)         [conteúdo de teste]
        └── 0.5 — Mapa do Mel: registre seu apiário (Missão) [conteúdo de teste]
```

### Rota da Pesca
**Estrutura existente (teste — a limpar):**
```
Início
  └── Boas-Vindas
        ├── 0.1 — O que é pesca artesanal (Vídeo)
        ├── 0.1 — O que é pesca artesanal (Quiz)
        ├── 0.2 — Os rios do Amapá (Vídeo)
        ├── 0.2 — Os rios do Amapá (Quiz)
```

**Decisão D-C1 confirmada:** limpar todo o conteúdo de teste APÓS mapear o conteúdo real (vídeos + questões) para não perder estrutura de pastas.

---

## 5. Prioridade de criação de conteúdo

### Fase 1 — MVP (lançamento): Módulo Início completo para Mel e Pesca

**Rota do Mel — Módulo Início (11 lições):**

> O módulo Início é o "Orientation" do app — maior que os demais porque precisa criar a base completa: propósito, conhecimento, carreira e evidência de campo. Duolingo também torna os módulos introdutórios maiores.

| # | Ícone | Tipo | Título | Questões / Tipos usados |
|---|-------|------|--------|------------------------|
| 1 | 📺 | Vídeo | O Mundo Depende de Você | — (3–5min, impacto das abelhas na alimentação humana) |
| 2 | ⭐ | Quiz | Avaliação: O Mundo Depende de Você | 10: MC1, VF, DRAG_AND_DROP (alimentos que dependem de polinização), LISTEN |
| 3 | 📺 | Vídeo | Como Funciona Uma Colmeia | — (rainha, operárias, zangões, divisão de trabalho) |
| 4 | ⭐ | Quiz | Avaliação: Como Funciona Uma Colmeia | 10: MC1, MATCHING (função×tipo de abelha), LISTEN_AND_ORDER (ciclo de vida), VF |
| 5 | 📺 | Vídeo | Um Dia na Vida de Um Apicultor | — (rotina real: madrugada, campo, colheita, venda — lifestyle de autonomia) |
| 6 | ⭐ | Quiz | Avaliação: Um Dia na Vida de Um Apicultor | 10: MC1, VF, SELECT_MISSING_WORDS (preencher rotina do apicultor), ESSAY |
| 7 | 📖 | Leitura | O Negócio do Mel | — (mel, própolis, cosméticos, polinização; números reais de renda no Piauí) |
| 8 | ⭐ | Quiz | Avaliação: O Negócio do Mel | 10: MC1, MATCHING (produto×uso), SHORT_ANSWER ("Quanto você acha que ganha um apicultor?"), DRAG_AND_DROP |
| 9 | 💬 | Escuta Ativa | Minha Trajetória na Apicultura | 4–5: SHORT_ANSWER + ESSAY (coleta de dados MDA) |
| 10 | 📦 | Diário | Meu Apiário no Mapa | GPS + Foto do apiário (baú → cristal) |
| 11 | 🏆 | Revisão | Revisão Geral: Módulo Início | 10: MC1, MATCHING, VF, SELECT_MISSING_WORDS (cobre lições 1–8) |

> **Escuta Ativa — questões sugeridas (lição 9):**
> - "Como você aprendeu sobre apicultura?" (ESSAY)
> - "Quantas colmeias sua família tem hoje?" (SHORT_ANSWER)
> - "O que mais te interessa na apicultura?" (MC1 — coleta perfil MDA)
> - "Você já vendeu mel? Se sim, para quem?" (SHORT_ANSWER)
> - "Qual é seu maior desafio hoje na apicultura?" (SHORT_ANSWER)

> **Missão CAF:** não entra no Módulo Início. Entra no Módulo A (Programas do Governo), onde faz sentido pedagógico. Placeholder Fase 1 = foto do documento CAF.

---

**Rota da Pesca — Módulo Início (11 lições):**

> Espelho da Rota do Mel — mesma estrutura emocional, conteúdo adaptado ao universo da pesca artesanal no Amapá.

| # | Ícone | Tipo | Título | Questões / Tipos usados |
|---|-------|------|--------|------------------------|
| 1 | 📺 | Vídeo | Os Rios do Amapá Dependem de Você | — (impacto da pesca artesanal: alimentação, renda, biodiversidade amazônica) |
| 2 | ⭐ | Quiz | Avaliação: Os Rios do Amapá Dependem de Você | 10: MC1, VF, DRAG_AND_DROP (espécie×habitat: rio/mar/estuário), LISTEN |
| 3 | 📺 | Vídeo | Como Funciona a Pesca Artesanal | — (petrechos: malhadeira, tarrafa, anzol, espinhel; espécies: mapará, dourada, filhote, camarão; defeso) |
| 4 | ⭐ | Quiz | Avaliação: Como Funciona a Pesca Artesanal | 10: MC1, MATCHING (petrecho×tipo de pesca), LISTEN_AND_ORDER (ciclo do dia de pesca), VF |
| 5 | 📺 | Vídeo | Um Dia na Vida de Um Pescador Artesanal | — (sair antes do amanhecer, pesca, retorno, venda — liberdade, natureza, saber tradicional) |
| 6 | ⭐ | Quiz | Avaliação: Um Dia na Vida de Um Pescador Artesanal | 10: MC1, VF, SELECT_MISSING_WORDS (rotina do pescador), ESSAY |
| 7 | 📖 | Leitura | O Negócio do Pescado | — (peixe fresco, seco, defumado, camarão; preços no Amapá; venda direta vs. intermediário; cooperativa) |
| 8 | ⭐ | Quiz | Avaliação: O Negócio do Pescado | 10: MC1, MATCHING (produto×mercado), SHORT_ANSWER ("Quanto você acha que ganha um pescador por mês?"), DRAG_AND_DROP |
| 9 | 💬 | Escuta Ativa | Minha Trajetória na Pesca | 4–5: SHORT_ANSWER + ESSAY + MC1 |
| 10 | 📦 | Diário | Meu Pesqueiro no Mapa | GPS do local de pesca + foto da embarcação ou do pescado do dia (baú → cristal) |
| 11 | 🏆 | Revisão | Revisão Geral: Módulo Início | 10: MC1, MATCHING, VF, SELECT_MISSING_WORDS (cobre lições 1–8) |

> **Escuta Ativa — questões sugeridas (lição 9):**
> - "Como você aprendeu a pescar?" (ESSAY)
> - "Quantos quilos de peixe você pesca por semana em média?" (SHORT_ANSWER)
> - "Você vende direto ao consumidor, em feira ou para intermediário?" (MC1)
> - "Você está registrado na colônia de pescadores?" (MC1: Sim / Não / Não sei o que é)
> - "Qual é seu maior desafio hoje na pesca?" (SHORT_ANSWER)

---

### Módulo A — Programas do Governo

> Objetivo: o produtor descobre que o governo tem programas feitos para ele e aprende os passos concretos para acessá-los. A Missão do Diário é a foto do documento de cadastro (CAF para apicultor, RGP para pescador).

---

**Rota do Mel — Módulo A: Programas do Governo (9 lições):**

*Programas cobertos: CAF (Cadastro do Agricultor Familiar), PRONAF, Garantia-Safra, PAA, PNAE, ATER/Emater-PI, Nota Fiscal de Produtor Rural*

| # | Ícone | Tipo | Título | Questões / Tipos usados |
|---|-------|------|--------|------------------------|
| 1 | 📺 | Vídeo | Você Tem Direitos — Conheça os Programas | — (o CAF é a porta de entrada para crédito, assistência técnica e venda para o governo) |
| 2 | ⭐ | Quiz | Avaliação: Você Tem Direitos | 10: MC1, VF, LISTEN (ouça a descrição e identifique o programa), MATCHING (programa×benefício) |
| 3 | 📺 | Vídeo | CAF e PRONAF: Como Acessar Crédito Rural | — (o que é o CAF, documentos necessários, como tirar; linhas PRONAF para apicultura; onde ir: banco, Emater-PI) |
| 4 | ⭐ | Quiz | Avaliação: CAF e PRONAF | 10: MC1, LISTEN_AND_ORDER (passos para tirar o CAF), MATCHING (documento×finalidade), SELECT_MISSING_WORDS |
| 5 | 📖 | Leitura | Mel na Merenda: PAA, PNAE e ATER | — (como vender mel para o governo via PAA/PNAE; 30% da merenda escolar deve vir da agricultura familiar; assistência técnica gratuita da Emater-PI; Garantia-Safra) |
| 6 | ⭐ | Quiz | Avaliação: PAA, PNAE e ATER | 10: MC1, VF, DRAG_AND_DROP (ordenar os passos para vender para o PNAE), MATCHING |
| 7 | 💬 | Escuta Ativa | Minha Situação com os Programas | 4–5q sobre acesso atual aos programas (coleta de dados MDA) |
| 8 | 📦 | Diário + Missão | Meu CAF | Foto do documento CAF (se já tiver) ou foto dos documentos para tirar + campo com número do CAF |
| 9 | 🏆 | Revisão | Revisão Geral: Módulo A | 10: MC1, MATCHING, VF, SELECT_MISSING_WORDS (cobre todos os programas do módulo) |

> **Escuta Ativa — questões sugeridas (lição 7):**
> - "Você já tem o CAF (Cadastro do Agricultor Familiar)?" (MC1: Sim / Não / Não sei o que é)
> - "Já acessou alguma linha do PRONAF?" (MC1: Sim / Não / Não sei como fazer)
> - "Recebe assistência técnica da Emater ou similar?" (MC1: Sim / Não / Às vezes)
> - "Você já vendeu mel para o governo (PAA ou merenda escolar)?" (VF)
> - "Qual programa você mais quer aprender a acessar?" (MC1 com as opções dos programas do módulo)

---

**Rota da Pesca — Módulo A: Programas do Governo (9 lições):**

*Programas cobertos: RGP (Registro Geral da Pesca), Colônia de Pescadores, Seguro-Desemprego do Defeso, PRONAF Pesca, PAA, ATER/RURAP (Amapá)*

| # | Ícone | Tipo | Título | Questões / Tipos usados |
|---|-------|------|--------|------------------------|
| 1 | 📺 | Vídeo | Seus Direitos Como Pescador | — (o RGP é a carteira profissional do pescador; colônia de pescadores como acesso a benefícios; visão geral dos programas) |
| 2 | ⭐ | Quiz | Avaliação: Seus Direitos Como Pescador | 10: MC1, VF, LISTEN (identifique o programa), MATCHING (programa×benefício) |
| 3 | 📺 | Vídeo | RGP e o Seguro do Defeso | — (o que é defeso, espécies e períodos no Amapá; como tirar o RGP; seguro-desemprego durante o defeso: valor, como solicitar; importância da filiação à colônia) |
| 4 | ⭐ | Quiz | Avaliação: RGP e Defeso | 10: MC1, LISTEN_AND_ORDER (passos para requerer seguro-defeso), MATCHING (espécie×período de defeso), SELECT_MISSING_WORDS |
| 5 | 📖 | Leitura | PRONAF Pesca, PAA e ATER no Amapá | — (PRONAF Pesca para financiar barco/motor/petrechos; PAA para vender pescado à merenda; RURAP: assistência técnica gratuita no Amapá; como acessar via sindicato, colônia ou MAPA) |
| 6 | ⭐ | Quiz | Avaliação: PRONAF Pesca, PAA e ATER | 10: MC1, VF, DRAG_AND_DROP (ordenar passos para acessar o PRONAF), MATCHING |
| 7 | 💬 | Escuta Ativa | Minha Situação com os Programas | 4–5q sobre acesso atual aos programas |
| 8 | 📦 | Diário + Missão | Meu RGP | Foto do RGP (se já tiver) ou foto dos documentos para requerer + campo com número do RGP |
| 9 | 🏆 | Revisão | Revisão Geral: Módulo A | 10: MC1, MATCHING, VF, SELECT_MISSING_WORDS (cobre todos os programas do módulo) |

> **Escuta Ativa — questões sugeridas (lição 7):**
> - "Você tem RGP (Registro Geral da Pesca)?" (MC1: Sim / Não / Não sei o que é)
> - "É filiado a alguma colônia de pescadores? Qual?" (MC1 + SHORT_ANSWER)
> - "Já recebeu o seguro-desemprego durante o defeso?" (MC1: Sim / Não / Nunca ouvi falar)
> - "Já acessou alguma linha do PRONAF?" (MC1: Sim / Não / Não sei como)
> - "Qual programa você mais quer aprender a acessar?" (MC1 com as opções do módulo)

---

### Módulo B — Boas Práticas Produtivas

> Objetivo: o produtor aprende a fazer o que já faz, só que melhor — com segurança, higiene e qualidade que abrem mercados maiores. Foco em mudança de comportamento prático, não teoria abstrata.

---

**Rota do Mel — Módulo B: Boas Práticas Produtivas (9 lições):**

*Temas: calendário apícola, manejo seguro das colmeias, extração e processamento de mel com qualidade, armazenamento, BPF (Boas Práticas de Fabricação)*

| # | Ícone | Tipo | Título | Questões / Tipos usados |
|---|-------|------|--------|------------------------|
| 1 | 📺 | Vídeo | O Calendário Apícola — Quando Fazer o Quê | — (floradas do Piauí, épocas de manejo, colheita e entressafra; por que o calendário importa para a qualidade do mel) |
| 2 | ⭐ | Quiz | Avaliação: O Calendário Apícola | 10: LISTEN_AND_ORDER (sequência das estações apícolas), MC1, VF, MATCHING (mês×atividade) |
| 3 | 📺 | Vídeo | Manejo das Colmeias com Segurança | — (vestimenta e fumegador; como fazer inspeção; alimentação artificial em escassez; controle de Varroa e traça da cera) |
| 4 | ⭐ | Quiz | Avaliação: Manejo das Colmeias | 10: MATCHING (equipamento×função), MC1, VF, DRAG_AND_DROP (ordenar passos da inspeção) |
| 5 | 📖 | Leitura | Extração e Processamento com Qualidade | — (desopercular → centrifugar → filtrar → decantação; higiene no mel-house; BPF; temperatura e recipientes de armazenamento corretos) |
| 6 | ⭐ | Quiz | Avaliação: Extração e Processamento | 10: MC1, SELECT_MISSING_WORDS (complete as etapas de extração), VF, MATCHING (erro×consequência na qualidade) |
| 7 | 💬 | Escuta Ativa | Minhas Práticas no Apiário | 4–5q sobre práticas atuais do produtor |
| 8 | 📦 | Diário | Meu Manejo de Hoje | Foto de inspeção de colmeia, extração ou armazenamento (baú → cristal) |
| 9 | 🏆 | Revisão | Revisão Geral: Módulo B | 10: MC1, MATCHING, SELECT_MISSING_WORDS, VF (cobre calendário, manejo e processamento) |

> **Escuta Ativa — questões sugeridas (lição 7):**
> - "Com que frequência você realiza o manejo das colmeias?" (MC1: Semanalmente / A cada 15 dias / Mensalmente / Só na colheita)
> - "Você usa equipamento de proteção completo durante o manejo?" (MC1: Sempre / Às vezes / Raramente)
> - "Como você armazena o mel após a colheita?" (SHORT_ANSWER)
> - "Você já teve perda de mel por problemas de armazenamento ou qualidade?" (VF)
> - "Qual é a principal dificuldade no seu processo de produção hoje?" (SHORT_ANSWER)

---

**Rota da Pesca — Módulo B: Boas Práticas Produtivas (9 lições):**

*Temas: boas práticas na captura (seletividade, defeso), conservação do pescado a bordo (gelo, higiene), cadeia do frio, rastreabilidade e inspeção sanitária*

| # | Ícone | Tipo | Título | Questões / Tipos usados |
|---|-------|------|--------|------------------------|
| 1 | 📺 | Vídeo | Pescando com Responsabilidade | — (seletividade: malhas corretas, tamanho mínimo por espécie; respeito ao defeso; descarte correto de capturas acidentais; por que isso protege a renda futura) |
| 2 | ⭐ | Quiz | Avaliação: Pescando com Responsabilidade | 10: MATCHING (espécie×tamanho mínimo de captura), MC1, VF, LISTEN |
| 3 | 📺 | Vídeo | Do Barco à Mesa — Conservação do Pescado | — (higiene a bordo; proporção peixe/gelo; acondicionamento correto; transporte e cadeia do frio; alternativas: peixe seco e defumado) |
| 4 | ⭐ | Quiz | Avaliação: Conservação do Pescado | 10: MC1, LISTEN_AND_ORDER (passos de conservação após captura), VF, DRAG_AND_DROP |
| 5 | 📖 | Leitura | Rastreabilidade e Inspeção Sanitária | — (o que é rastreabilidade e por que abre novos mercados; SIF/SIE para vender em outros estados; cooperativas com DIPOA; primeiros passos para regularização) |
| 6 | ⭐ | Quiz | Avaliação: Rastreabilidade e Inspeção | 10: MC1, VF, MATCHING (certificação×mercado acessível), SELECT_MISSING_WORDS |
| 7 | 💬 | Escuta Ativa | Minhas Práticas na Pesca | 4–5q sobre práticas atuais do produtor |
| 8 | 📦 | Diário | Minha Prática de Hoje | Foto do pescado conservado no gelo / barco limpo / petrechos organizados (baú → cristal) |
| 9 | 🏆 | Revisão | Revisão Geral: Módulo B | 10: MC1, MATCHING, VF, SELECT_MISSING_WORDS (cobre captura, conservação e rastreabilidade) |

> **Escuta Ativa — questões sugeridas (lição 7):**
> - "Você usa gelo no barco durante a pescaria?" (MC1: Sempre / Às vezes / Não uso gelo)
> - "Com que frequência você limpa os petrechos de pesca?" (MC1: Após cada saída / A cada semana / Raramente)
> - "Você respeita o período de defeso das espécies que pesca?" (MC1: Sempre / Às vezes / Não sabia que existia)
> - "Você já perdeu pescado por falta de conservação?" (VF)
> - "Qual é a principal dificuldade no seu processo de produção hoje?" (SHORT_ANSWER)

---

---

### Módulo C — Qualidade e Certificação

> Objetivo: o produtor entende que qualidade não é só "fazer bem feito" — é o passaporte para mercados maiores e preços melhores. O módulo cobre inspeção sanitária, certificação e rotulagem, com foco em passos concretos para quem está começando.

---

**Rota do Mel — Módulo C: Qualidade e Certificação (9 lições):**

*Temas: diferença SIM/SIE/SIF, certificação orgânica (IBD, Ecocert), rotulagem MAPA, rastreabilidade, cooperativas com SIF como caminho viável para o apicultor familiar*

| # | Ícone | Tipo | Título | Questões / Tipos usados |
|---|-------|------|--------|------------------------|
| 1 | 📺 | Vídeo | O Mel de Qualidade Abre Portas | — (o que diferencia mel artesanal de mel industrial no mercado; preço com e sem SIF; supermercados, farmácias e exportação exigem inspeção; cooperativa como caminho mais viável) |
| 2 | ⭐ | Quiz | Avaliação: O Mel de Qualidade Abre Portas | 10: MC1, VF, LISTEN (ouça e identifique o mercado que exige qual certificação), MATCHING (certificação×mercado acessível) |
| 3 | 📺 | Vídeo | Inspeção Sanitária: SIM, SIE e SIF | — (SIM = Municipal, venda no município; SIE = Estadual, venda no estado; SIF = Federal, venda nacional e exportação; quem fiscaliza cada um; cooperativa com SIF como rota prática para o apicultor familiar) |
| 4 | ⭐ | Quiz | Avaliação: Inspeção Sanitária | 10: MC1, LISTEN_AND_ORDER (passos para acessar SIF via cooperativa), MATCHING (sigla×órgão responsável), VF |
| 5 | 📖 | Leitura | Certificação Orgânica e Rotulagem do Mel | — (o que é mel orgânico: sem agrotóxicos na área de voo, sem antibióticos, manejo naturalista; certificadoras: IBD, Ecocert, IMO; custo/benefício; rotulagem obrigatória MAPA: nome do produto, peso, lote, data, produtor/cooperativa, nº SIF/SIE/SIM; rastreabilidade: o que é e por que importa) |
| 6 | ⭐ | Quiz | Avaliação: Certificação e Rotulagem | 10: MC1, SELECT_MISSING_WORDS (complete as informações obrigatórias do rótulo), DRAG_AND_DROP (ordenar os passos de rastreabilidade), VF |
| 7 | 💬 | Escuta Ativa | Minha Situação com Qualidade | 4–5q sobre situação atual de certificação/regularização (coleta de dados MDA) |
| 8 | 📦 | Diário | Meu Mel tem Qualidade | Foto do processo de extração, embalagem ou rótulo do mel (baú → cristal) |
| 9 | 🏆 | Revisão | Revisão Geral: Módulo C | 10: MC1, MATCHING, SELECT_MISSING_WORDS, VF (cobre inspeção, certificação e rotulagem) |

> **Escuta Ativa — questões sugeridas (lição 7):**
> - "Seu mel tem algum tipo de inspeção sanitária (SIM, SIE ou SIF)?" (MC1: Sim, SIM / Sim, SIE / Sim, SIF / Não tenho)
> - "Você vende mel embalado com rótulo?" (MC1: Sim, com rótulo completo / Sim, rótulo simples / Não, vendo a granel)
> - "Você já ouviu falar em certificação orgânica?" (MC1: Sim, já tenho / Sim, mas não sei como obter / Não conhecia)
> - "Qual o maior obstáculo para você ter inspeção sanitária no seu mel?" (SHORT_ANSWER)
> - "Você faz parte de alguma cooperativa que processa ou vende mel?" (MC1: Sim / Não, mas quero / Não tenho interesse)

---

**Rota da Pesca — Módulo C: Qualidade e Certificação (9 lições):**

*Temas: inspeção sanitária do pescado (DIPOA/SIF/SIE), rastreabilidade, rotulagem de pescado, certificação sustentável (MSC), cooperativa como caminho para regularização*

| # | Ícone | Tipo | Título | Questões / Tipos usados |
|---|-------|------|--------|------------------------|
| 1 | 📺 | Vídeo | Pescado com Qualidade: O Que Isso Significa? | — (diferença entre venda informal e venda regularizada; mercados que se abrem: supermercado, restaurante, outras cidades, exportação; por que qualidade = preço melhor; cooperativa como caminho mais prático para o pescador artesanal) |
| 2 | ⭐ | Quiz | Avaliação: Pescado com Qualidade | 10: MC1, VF, LISTEN (identifique o mercado que exige qual certificação), MATCHING (certificação×mercado acessível) |
| 3 | 📺 | Vídeo | Inspeção Sanitária do Pescado: DIPOA, SIF e SIE | — (DIPOA = Departamento de Inspeção de Produtos de Origem Animal, vinculado ao MAPA; SIF para venda interestadual e exportação; SIE para venda dentro do Amapá; cooperativa com DIPOA/SIF como rota viável; papel do RURAP no processo) |
| 4 | ⭐ | Quiz | Avaliação: Inspeção Sanitária | 10: MC1, LISTEN_AND_ORDER (passos para regularizar via cooperativa), MATCHING (sigla×escopo de venda), VF |
| 5 | 📖 | Leitura | Rastreabilidade, Rotulagem e Certificação Sustentável | — (o que é rastreabilidade: saber de onde vem e para onde foi cada lote de pescado; rótulo do pescado: espécie, origem, data de captura, peso, nº lote, nº SIF/SIE; MSC (Marine Stewardship Council): o que é, por que cresce no Brasil, como funciona para pesca artesanal; primeiro passo para o pescador: entrar numa cooperativa com SIF) |
| 6 | ⭐ | Quiz | Avaliação: Rastreabilidade e Rotulagem | 10: MC1, SELECT_MISSING_WORDS (complete o rótulo correto do pescado), VF, MATCHING (informação×obrigatória ou opcional) |
| 7 | 💬 | Escuta Ativa | Minha Situação com Qualidade | 4–5q sobre regularização atual (coleta de dados MDA) |
| 8 | 📦 | Diário | Meu Pescado com Qualidade | Foto do pescado embalado/etiquetado, ou conservado no gelo corretamente, ou barco com higiene (baú → cristal) |
| 9 | 🏆 | Revisão | Revisão Geral: Módulo C | 10: MC1, MATCHING, SELECT_MISSING_WORDS, VF (cobre inspeção, rotulagem e rastreabilidade) |

> **Escuta Ativa — questões sugeridas (lição 7):**
> - "Seu pescado tem algum tipo de inspeção sanitária (SIE ou SIF)?" (MC1: Sim, SIE / Sim, SIF / Não tenho)
> - "Você vende pescado embalado com rótulo?" (MC1: Sim, com rótulo completo / Sim, rótulo simples / Não, vendo sem embalagem)
> - "Você já ouviu falar em certificação MSC (pesca sustentável)?" (MC1: Sim, já tenho / Sim, mas não sei como / Não conhecia)
> - "Qual o maior obstáculo para você ter inspeção sanitária no seu pescado?" (SHORT_ANSWER)
> - "Você faz parte de alguma cooperativa que processa ou vende pescado?" (MC1: Sim / Não, mas quero / Não tenho interesse)

---

---

### Módulo D — Venda Justa

> Objetivo: o produtor para de vender barato por desconhecimento e começa a precificar com base no custo real, entender os canais de venda disponíveis e dar os primeiros passos para regularização fiscal. Foco em mudança de comportamento econômico — da venda informal ao negócio sustentável.

---

**Rota do Mel — Módulo D: Venda Justa (9 lições):**

*Temas: custo de produção e precificação do mel, canais de venda (feiras, PAA/PNAE, supermercado, exportação), nota fiscal de produtor rural, MEI apicultor, cooperativa como intermediária de venda*

| # | Ícone | Tipo | Título | Questões / Tipos usados |
|---|-------|------|--------|------------------------|
| 1 | 📺 | Vídeo | Quanto Vale o Seu Mel? | — (por que apicultores vendem barato: falta de custo de produção; o que entra no custo: insumos, tempo, transporte, embalagem, depreciação do equipamento; diferença entre preço de custo e preço de venda; margem mínima saudável) |
| 2 | ⭐ | Quiz | Avaliação: Quanto Vale o Seu Mel? | 10: MC1, VF, LISTEN (ouça o relato de um apicultor e identifique se o preço cobre o custo), SELECT_MISSING_WORDS (complete o cálculo de precificação) |
| 3 | 📺 | Vídeo | Onde e Para Quem Vender | — (comparativo de canais: feira livre, venda direta ao consumidor, PAA/PNAE, supermercado local, farmácias/empórios, exportação via cooperativa; qual canal exige qual certificação; como diversificar para não depender de um único comprador) |
| 4 | ⭐ | Quiz | Avaliação: Onde e Para Quem Vender | 10: MC1, MATCHING (canal×requisito mínimo), LISTEN_AND_ORDER (do menor ao maior ticket médio por canal), VF |
| 5 | 📖 | Leitura | Nota Fiscal, MEI e a Cooperativa como Parceira | — (nota fiscal de produtor rural: o que é, como tirar, por que o comprador exige; MEI do apicultor: faturamento máximo, obrigações, vantagens; cooperativa: como ela vende por você com nota fiscal e SIF; diferença entre cooperativa e atravessador) |
| 6 | ⭐ | Quiz | Avaliação: Nota Fiscal, MEI e Cooperativa | 10: MC1, VF, DRAG_AND_DROP (ordenar os passos para emitir nota fiscal de produtor rural), MATCHING (figura jurídica×vantagem) |
| 7 | 💬 | Escuta Ativa | Minha Situação na Venda do Mel | 4–5q sobre canais atuais, preço praticado e regularização fiscal |
| 8 | 📦 | Diário | Meu Registro de Venda | Foto de uma venda realizada: feira, entrega, nota fiscal, embalagem com preço (baú → cristal) |
| 9 | 🏆 | Revisão | Revisão Geral: Módulo D | 10: MC1, MATCHING, SELECT_MISSING_WORDS, VF (cobre precificação, canais e regularização) |

> **Escuta Ativa — questões sugeridas (lição 7):**
> - "Para quem você vende seu mel hoje?" (MC1: Direto ao vizinho/amigo / Feira livre / Atravessador / Cooperativa / PAA ou merenda / Mais de um canal)
> - "Você sabe qual é o custo para produzir 1 kg de mel?" (MC1: Sim, calculo direitinho / Tenho uma ideia / Não sei calcular)
> - "Qual o preço médio que você recebe por kg de mel?" (SHORT_ANSWER)
> - "Você emite nota fiscal ou recibo na venda do mel?" (MC1: Sempre / Às vezes / Nunca / Não sei como)
> - "Qual é o maior obstáculo para você vender mais e por melhor preço?" (SHORT_ANSWER)

---

**Rota da Pesca — Módulo D: Venda Justa (9 lições):**

*Temas: custo de produção na pesca artesanal, precificação do pescado por espécie e forma de apresentação (fresco, seco, defumado), canais de venda, nota fiscal, colônia/cooperativa como intermediária*

| # | Ícone | Tipo | Título | Questões / Tipos usados |
|---|-------|------|--------|------------------------|
| 1 | 📺 | Vídeo | Quanto Vale o Seu Pescado? | — (por que pescadores vendem barato: urgência de venda (peixe estraga), falta de opção, dependência do atravessador; o que entra no custo: combustível, gelo, petrechos, manutenção do barco, tempo; diferença entre preço de custo e preço de venda; como o processamento (seco/defumado) aumenta o valor) |
| 2 | ⭐ | Quiz | Avaliação: Quanto Vale o Seu Pescado? | 10: MC1, VF, LISTEN (identifique se o preço cobre o custo no relato), SELECT_MISSING_WORDS (complete o cálculo de precificação por kg) |
| 3 | 📺 | Vídeo | Onde e Para Quem Vender o Pescado | — (comparativo de canais: feira do peixe, venda direta ao consumidor, restaurantes, PAA/PNAE, supermercado, exportação via cooperativa; peixe fresco vs. seco vs. defumado: margem e prazo; como ter mais de um comprador para não depender do atravessador) |
| 4 | ⭐ | Quiz | Avaliação: Onde e Para Quem Vender | 10: MC1, MATCHING (canal×requisito mínimo), LISTEN_AND_ORDER (do menor ao maior valor agregado por forma de apresentação), VF |
| 5 | 📖 | Leitura | Nota Fiscal, Colônia e a Cooperativa como Parceira | — (nota fiscal de produtor: o que é, como tirar no Amapá, quando o comprador exige; colônia de pescadores: funções além da representação — acesso a benefícios, RGP, assistência; cooperativa com SIF: como ela vende por você, divide os custos e acessa o PAA/PNAE; diferença entre cooperativa e atravessador) |
| 6 | ⭐ | Quiz | Avaliação: Nota Fiscal, Colônia e Cooperativa | 10: MC1, VF, DRAG_AND_DROP (ordenar os passos para acessar o PAA via cooperativa), MATCHING (figura jurídica×vantagem) |
| 7 | 💬 | Escuta Ativa | Minha Situação na Venda do Pescado | 4–5q sobre canais atuais, preço praticado e regularização |
| 8 | 📦 | Diário | Meu Registro de Venda | Foto de uma venda realizada: feira, entrega ao restaurante, embalagem, nota fiscal ou recibo (baú → cristal) |
| 9 | 🏆 | Revisão | Revisão Geral: Módulo D | 10: MC1, MATCHING, SELECT_MISSING_WORDS, VF (cobre precificação, canais e regularização) |

> **Escuta Ativa — questões sugeridas (lição 7):**
> - "Para quem você vende seu pescado hoje?" (MC1: Atravessador / Feira livre / Direto ao consumidor / Restaurante / Cooperativa / PAA)
> - "Você sabe qual é o custo para pescar 1 kg de peixe?" (MC1: Sim, calculo / Tenho uma ideia / Não sei calcular)
> - "Qual o preço médio que você recebe por kg do seu principal peixe?" (SHORT_ANSWER)
> - "Você emite nota fiscal ou recibo na venda do pescado?" (MC1: Sempre / Às vezes / Nunca / Não sei como)
> - "Qual é o maior obstáculo para você vender mais e por melhor preço?" (SHORT_ANSWER)

---

### Módulo E — Associativismo

> Objetivo: o produtor entende por que agir coletivamente é mais forte do que agir sozinho — e aprende a diferença entre colônia, associação e cooperativa, como participar ativamente, e os direitos e deveres de cada membro. Foco em cultura de cooperação e primeiros passos concretos.

---

**Rota do Mel — Módulo E: Associativismo (9 lições):**

*Temas: diferença entre associação e cooperativa, como funciona uma cooperativa apícola (estrutura, decisões, divisão de resultados), direitos e deveres do cooperado, como encontrar e entrar numa cooperativa no Piauí*

| # | Ícone | Tipo | Título | Questões / Tipos usados |
|---|-------|------|--------|------------------------|
| 1 | 📺 | Vídeo | Sozinho Vai Longe — Juntos Chegam Mais Longe | — (por que apicultores isolados vendem mais barato e têm menos acesso a programas; o que muda quando se organiza coletivamente: poder de negociação, acesso a SIF, compra coletiva de insumos, crédito PRONAF coletivo; exemplos reais de cooperativas apícolas do Piauí) |
| 2 | ⭐ | Quiz | Avaliação: Sozinho vs. Coletivo | 10: MC1, VF, LISTEN (ouça o relato e identifique se é associação ou cooperativa), MATCHING (benefício×forma de organização) |
| 3 | 📺 | Vídeo | Como Funciona uma Cooperativa Apícola | — (estrutura: assembleia, conselho de administração, conselho fiscal, diretoria; como são tomadas as decisões; sobras e perdas: como são divididas; diferença entre associação (sem fins lucrativos, não divide resultado) e cooperativa (divide sobras); exemplos do Piauí: COOAPIPI, APIS do Cerrado) |
| 4 | ⭐ | Quiz | Avaliação: Como Funciona uma Cooperativa | 10: MC1, MATCHING (órgão da cooperativa×função), LISTEN_AND_ORDER (fluxo de uma decisão na cooperativa: proposta → assembleia → votação → execução), VF |
| 5 | 📖 | Leitura | Direitos, Deveres e Como Entrar numa Cooperativa | — (direitos do cooperado: voto, acesso a serviços, divisão de sobras, informação; deveres: participar das assembleias, cumprir os estatutos, entregar a produção combinada; como encontrar cooperativas apícolas no Piauí (SENAR-PI, Emater-PI, OCB-PI); documentos para filiação; o que perguntar antes de entrar) |
| 6 | ⭐ | Quiz | Avaliação: Direitos, Deveres e Filiação | 10: MC1, VF, SELECT_MISSING_WORDS (complete os deveres do cooperado), DRAG_AND_DROP (ordenar os passos para se filiar a uma cooperativa) |
| 7 | 💬 | Escuta Ativa | Minha Situação com Associativismo | 4–5q sobre participação atual em organizações coletivas |
| 8 | 📦 | Diário | Minha Participação Coletiva | Foto de reunião, evento da cooperativa/associação, ou foto com outros apicultores do grupo (baú → cristal) |
| 9 | 🏆 | Revisão | Revisão Geral: Módulo E | 10: MC1, MATCHING, SELECT_MISSING_WORDS, VF (cobre associação vs. cooperativa, estrutura e filiação) |

> **Escuta Ativa — questões sugeridas (lição 7):**
> - "Você participa de alguma associação ou cooperativa de apicultores?" (MC1: Sim, cooperativa / Sim, associação / Não, mas quero / Não tenho interesse)
> - "Com que frequência você vai a reuniões ou eventos do grupo?" (MC1: Sempre / Às vezes / Raramente / Não participo)
> - "Você vende mel através de uma cooperativa?" (MC1: Sim, toda produção / Parte da produção / Não)
> - "O que te impede de participar mais ou de entrar numa cooperativa?" (SHORT_ANSWER)
> - "Você conhece as cooperativas apícolas que operam no Piauí?" (MC1: Sim, sou filiado / Conheço mas não sou / Não conheço nenhuma)

---

**Rota da Pesca — Módulo E: Associativismo (9 lições):**

*Temas: papel da colônia de pescadores vs. cooperativa, como funciona uma cooperativa pesqueira (estrutura, decisões, divisão de resultados), direitos e deveres do cooperado, cooperativas pesqueiras do Amapá*

| # | Ícone | Tipo | Título | Questões / Tipos usados |
|---|-------|------|--------|------------------------|
| 1 | 📺 | Vídeo | Sozinho no Rio — Juntos no Mercado | — (por que pescadores isolados dependem do atravessador; o que muda ao se organizar: poder de negociação, acesso a SIF, compra coletiva de gelo e combustível, crédito PRONAF coletivo, PAA; exemplos reais de cooperativas pesqueiras do Amapá) |
| 2 | ⭐ | Quiz | Avaliação: Sozinho vs. Coletivo | 10: MC1, VF, LISTEN (identifique se é colônia, associação ou cooperativa), MATCHING (benefício×forma de organização) |
| 3 | 📺 | Vídeo | Colônia, Associação ou Cooperativa — Qual a Diferença? | — (colônia de pescadores: representação profissional, acesso ao RGP e seguro-defeso, não tem fins econômicos; associação: organização civil sem fins lucrativos, não divide resultado; cooperativa: empresa coletiva que divide sobras; quando usar cada uma; é possível estar nas três ao mesmo tempo) |
| 4 | ⭐ | Quiz | Avaliação: Colônia, Associação ou Cooperativa | 10: MC1, MATCHING (tipo de organização×função principal), LISTEN_AND_ORDER (fluxo de uma decisão cooperativa), VF |
| 5 | 📖 | Leitura | Como Funciona uma Cooperativa Pesqueira — Por Dentro | — (estrutura: assembleia geral, conselho de administração, conselho fiscal; sobras: como são calculadas e distribuídas; deveres: participação, entrega da produção combinada, cumprimento do estatuto; direitos: voto, informação, acesso aos serviços; cooperativas do Amapá: COOPEAP, COOPERPESCA-AP; como encontrar via SENAR-AP, RURAP, OCB-AP; documentos para filiação) |
| 6 | ⭐ | Quiz | Avaliação: Cooperativa Pesqueira — Por Dentro | 10: MC1, VF, SELECT_MISSING_WORDS (complete os direitos e deveres do cooperado), DRAG_AND_DROP (ordenar passos para filiação) |
| 7 | 💬 | Escuta Ativa | Minha Situação com Associativismo | 4–5q sobre participação atual em organizações coletivas |
| 8 | 📦 | Diário | Minha Participação Coletiva | Foto de reunião, evento da colônia/cooperativa, ou foto com outros pescadores do grupo (baú → cristal) |
| 9 | 🏆 | Revisão | Revisão Geral: Módulo E | 10: MC1, MATCHING, SELECT_MISSING_WORDS, VF (cobre colônia vs. cooperativa, estrutura e filiação) |

> **Escuta Ativa — questões sugeridas (lição 7):**
> - "Você é filiado a alguma colônia, associação ou cooperativa de pescadores?" (MC1: Sim, colônia / Sim, cooperativa / Sim, associação / Não, nenhuma)
> - "Com que frequência participa de reuniões ou assembleias do grupo?" (MC1: Sempre / Às vezes / Raramente / Não participo)
> - "Você vende pescado através de uma cooperativa?" (MC1: Sim, toda produção / Parte / Não)
> - "O que te impede de participar mais ou de entrar numa cooperativa?" (SHORT_ANSWER)
> - "Você conhece as cooperativas pesqueiras que operam no Amapá?" (MC1: Sim, sou filiado / Conheço mas não sou / Não conheço nenhuma)

---

### Fase 2 — Expansão: concluída (Módulos D e E detalhados)

---

### Módulo F — Saúde e Segurança

> Objetivo: o produtor aprende a proteger a própria saúde e a dos que trabalham com ele — EPIs, riscos específicos da atividade, primeiros socorros no campo e saúde do trabalhador rural. Foco em mudança de comportamento prático, não teoria abstrata.

---

**Rota do Mel — Módulo F: Saúde e Segurança (9 lições):**

*Temas: EPIs obrigatórios na apicultura, riscos de picadas e reações alérgicas, uso seguro do fumegador, ergonomia no transporte de caixas, saúde do trabalhador rural (FUNRURAL, CAT, saúde mental)*

| # | Ícone | Tipo | Título | Questões / Tipos usados |
|---|-------|------|--------|------------------------|
| 1 | 📺 | Vídeo | O Apicultor Protegido Produz Mais | — (por que acidentes são a principal causa de abandono da apicultura; EPIs obrigatórios: macacão, luvas, véu, bota; fumegador: como usar corretamente e com segurança; picadas: o que fazer nas primeiras 24h; sinais de reação alérgica grave — quando ir ao pronto-socorro) |
| 2 | ⭐ | Quiz | Avaliação: O Apicultor Protegido | 10: MC1, MATCHING (EPI×função), VF, LISTEN (ouça o relato e identifique o erro de segurança) |
| 3 | 📺 | Vídeo | Ergonomia e Saúde no Apiário | — (como levantar e transportar caixas sem machucar a coluna; altura ideal das colmeias; organização do apiário para reduzir esforço; calor e hidratação no campo; por que pausas programadas aumentam a produtividade) |
| 4 | ⭐ | Quiz | Avaliação: Ergonomia e Saúde no Apiário | 10: MC1, LISTEN_AND_ORDER (passos corretos para transportar uma caixa pesada), VF, DRAG_AND_DROP (organizar o apiário com distâncias e alturas seguras) |
| 5 | 📖 | Leitura | Direitos do Trabalhador Rural e Saúde Mental | — (FUNRURAL: o que é, como contribuir, benefícios: aposentadoria, auxílio-doença, salário-maternidade; CAT (Comunicação de Acidente de Trabalho): quando e como registrar; saúde mental no campo: isolamento, pressão financeira, sinais de alerta; onde buscar apoio no Piauí: CAPS, UBS, CRAS) |
| 6 | ⭐ | Quiz | Avaliação: Direitos e Saúde Mental | 10: MC1, VF, SELECT_MISSING_WORDS (complete os benefícios do FUNRURAL), MATCHING (situação×ação correta) |
| 7 | 💬 | Escuta Ativa | Minha Saúde e Segurança no Trabalho | 4–5q sobre uso de EPIs, histórico de acidentes e acesso a serviços de saúde |
| 8 | 📦 | Diário | Meu Equipamento de Proteção | Foto usando EPI completo no apiário, ou foto do kit de primeiros socorros, ou foto do apiário organizado com altura segura (baú → cristal) |
| 9 | 🏆 | Revisão | Revisão Geral: Módulo F | 10: MC1, MATCHING, VF, SELECT_MISSING_WORDS (cobre EPIs, ergonomia e direitos do trabalhador) |

> **Escuta Ativa — questões sugeridas (lição 7):**
> - "Você usa EPI completo (macacão, luvas, véu) durante o manejo das colmeias?" (MC1: Sempre / Às vezes / Raramente / Não tenho EPI)
> - "Você já sofreu algum acidente sério relacionado à apicultura?" (MC1: Sim, picadas graves / Sim, acidente físico / Não, nunca)
> - "Você é contribuinte do FUNRURAL?" (MC1: Sim, contribuo regularmente / Já contribuí / Não contribuo / Não sei o que é)
> - "Como você avalia sua saúde mental atualmente — sente estresse ou ansiedade relacionados ao trabalho?" (MC1: Frequentemente / Às vezes / Raramente / Nunca)
> - "Você tem acesso a algum serviço de saúde perto de onde mora?" (MC1: Sim, UBS / Sim, outros / Difícil acesso / Não tenho acesso)

---

**Rota da Pesca — Módulo F: Saúde e Segurança (9 lições):**

*Temas: EPIs e segurança a bordo, riscos de afogamento e coletes salva-vidas, manuseio seguro de petrechos cortantes, saúde do pescador (exposição ao sol, doenças de veiculação hídrica), FUNRURAL e CAT*

| # | Ícone | Tipo | Título | Questões / Tipos usados |
|---|-------|------|--------|------------------------|
| 1 | 📺 | Vídeo | O Pescador Seguro Pesca Mais | — (por que acidentes aquáticos são a principal causa de morte de pescadores artesanais; colete salva-vidas: obrigatório por lei, qual usar, como ajustar; riscos no barco: deslizamento, sobrecarga, tempestades; como agir em caso de naufrágio; manuseio seguro de malhadeiras, tarrafas e anzóis) |
| 2 | ⭐ | Quiz | Avaliação: O Pescador Seguro | 10: MC1, MATCHING (risco×ação preventiva), VF, LISTEN (ouça o relato e identifique o erro de segurança) |
| 3 | 📺 | Vídeo | Saúde no Rio — Sol, Água e Lesões | — (proteção solar: câncer de pele é o mais comum entre pescadores; hidratação em embarcações; doenças de veiculação hídrica: leptospirose, hepatite A, esquistossomose — como prevenir; lesões por esforço repetitivo no remo e na rede; ergonomia ao puxar a rede) |
| 4 | ⭐ | Quiz | Avaliação: Saúde no Rio | 10: MC1, LISTEN_AND_ORDER (protocolo de segurança antes de sair para pescar), VF, DRAG_AND_DROP (identificar itens obrigatórios de segurança na embarcação) |
| 5 | 📖 | Leitura | Direitos do Pescador Artesanal e Saúde Mental | — (FUNRURAL para pescadores: como contribuir via colônia, benefícios: aposentadoria especial, auxílio-doença, salário-maternidade; CAT: quando e como registrar acidente de trabalho; saúde mental: isolamento no campo, pressão do defeso sem renda, sinais de alerta; onde buscar apoio no Amapá: CAPS, UBS, CRAS) |
| 6 | ⭐ | Quiz | Avaliação: Direitos e Saúde Mental | 10: MC1, VF, SELECT_MISSING_WORDS (complete os benefícios do FUNRURAL para pescadores), MATCHING (situação×ação correta) |
| 7 | 💬 | Escuta Ativa | Minha Saúde e Segurança no Trabalho | 4–5q sobre uso de EPIs, histórico de acidentes e acesso a serviços de saúde |
| 8 | 📦 | Diário | Minha Segurança no Barco | Foto usando colete salva-vidas na embarcação, ou foto do kit de segurança (colete, sinalizador), ou foto com proteção solar adequada (baú → cristal) |
| 9 | 🏆 | Revisão | Revisão Geral: Módulo F | 10: MC1, MATCHING, VF, SELECT_MISSING_WORDS (cobre segurança a bordo, saúde e direitos) |

> **Escuta Ativa — questões sugeridas (lição 7):**
> - "Você usa colete salva-vidas durante as pescarias?" (MC1: Sempre / Às vezes / Raramente / Não tenho colete)
> - "Você já sofreu algum acidente sério relacionado à pesca?" (MC1: Sim, acidente aquático / Sim, lesão por petrecho / Não, nunca)
> - "Você é contribuinte do FUNRURAL via colônia de pescadores?" (MC1: Sim / Já contribuí / Não / Não sei como)
> - "Como você avalia sua saúde mental atualmente — sente estresse ou ansiedade relacionados ao trabalho?" (MC1: Frequentemente / Às vezes / Raramente / Nunca)
> - "Você tem acesso a algum serviço de saúde perto de onde mora ou trabalha?" (MC1: Sim, UBS / Sim, outros / Difícil acesso / Não tenho acesso)

---

### Módulo G — Meio Ambiente

> Objetivo: o produtor entende que preservar o meio ambiente é preservar a própria fonte de renda — e aprende as obrigações legais básicas (legislação ambiental, licenciamento) e práticas concretas de conservação ligadas à sua atividade. É o módulo final da trilha: encerra com propósito e legado.

---

**Rota do Mel — Módulo G: Meio Ambiente (9 lições):**

*Temas: papel das abelhas na biodiversidade, ameaças (agrotóxicos, desmatamento, fogo), Código Florestal e APP, licenciamento ambiental do apiário, práticas de conservação que aumentam a produção de mel*

| # | Ícone | Tipo | Título | Questões / Tipos usados |
|---|-------|------|--------|------------------------|
| 1 | 📺 | Vídeo | O Apicultor é Guardião da Natureza | — (abelhas polinizam 70% dos alimentos que humanos comem; sem abelhas, a agricultura colapsa; desmatamento e agrotóxicos são as maiores ameaças; o apicultor tem interesse direto em conservar: mais floresta = mais néctar = mais mel; exemplos do Cerrado e Caatinga do Piauí) |
| 2 | ⭐ | Quiz | Avaliação: O Apicultor Guardião | 10: MC1, VF, LISTEN (ouça e identifique a ameaça à produção de mel), MATCHING (prática×impacto na biodiversidade) |
| 3 | 📺 | Vídeo | Legislação Ambiental para o Apicultor | — (Código Florestal: o que é APP, Reserva Legal, o que pode e não pode fazer; licenciamento ambiental do apiário: quando é obrigatório, como fazer no Piauí (SEMAR-PI); uso de agrotóxicos nas proximidades: como denunciar, como se proteger; queimadas: proibição e impacto direto na produção) |
| 4 | ⭐ | Quiz | Avaliação: Legislação Ambiental | 10: MC1, MATCHING (área×restrição legal), LISTEN_AND_ORDER (passos para licenciar um apiário), VF |
| 5 | 📖 | Leitura | Práticas de Conservação que Aumentam a Produção | — (plantio de espécies melíferas nativas da Caatinga e Cerrado: aroeira, angico, jurema, marmeleiro; corredores ecológicos: o que são e como criar no sítio; água no apiário: por que as abelhas precisam de fonte próxima; calendário de floradas nativas x produção de mel; CAR (Cadastro Ambiental Rural): o que é e como regularizar) |
| 6 | ⭐ | Quiz | Avaliação: Práticas de Conservação | 10: MC1, SELECT_MISSING_WORDS (complete a lista de plantas melíferas nativas), VF, DRAG_AND_DROP (organizar o apiário com corredores e fonte d'água) |
| 7 | 💬 | Escuta Ativa | Minha Relação com o Meio Ambiente | 4–5q sobre práticas atuais de conservação e situação do CAR |
| 8 | 📦 | Diário | Meu Apiário e a Natureza | Foto do entorno do apiário: vegetação nativa, fonte d'água, corredor ecológico ou planta melífera que o produtor cuida (baú → cristal) |
| 9 | 🏆 | Revisão | Revisão Geral: Módulo G | 10: MC1, MATCHING, SELECT_MISSING_WORDS, VF (cobre papel das abelhas, legislação e práticas de conservação) |

> **Escuta Ativa — questões sugeridas (lição 7):**
> - "Você tem o CAR (Cadastro Ambiental Rural) da sua propriedade?" (MC1: Sim / Está em processo / Não tenho / Não sei o que é)
> - "Existe vegetação nativa preservada ao redor do seu apiário?" (MC1: Sim, bastante / Alguma / Pouca / Quase nenhuma)
> - "Você já teve perda de colmeias por agrotóxicos nas proximidades?" (VF)
> - "Você planta ou preserva espécies melíferas nativas na sua propriedade?" (MC1: Sim, ativamente / Preservo o que já existe / Não, ainda não)
> - "O que você faz para proteger as abelhas e o meio ambiente no seu apiário?" (SHORT_ANSWER)

---

**Rota da Pesca — Módulo G: Meio Ambiente (9 lições):**

*Temas: importância dos rios e estuários do Amapá, ameaças (garimpo, desmatamento de mangue, sobrepesca, lixo aquático), legislação ambiental pesqueira (IBAMA, defeso, tamanho mínimo), práticas de conservação que garantem a pesca no futuro*

| # | Ícone | Tipo | Título | Questões / Tipos usados |
|---|-------|------|--------|------------------------|
| 1 | 📺 | Vídeo | O Pescador é Guardião dos Rios | — (o Amapá tem a maior biodiversidade aquática do Brasil; pesca artesanal sustentável é a que mais preserva o estoque; ameaças: garimpo ilegal (mercúrio nos rios), desmatamento de mangue (berçário dos peixes), sobrepesca com redes de malha fina; o pescador que preserva garante renda para os filhos) |
| 2 | ⭐ | Quiz | Avaliação: O Pescador Guardião | 10: MC1, VF, LISTEN (identifique a ameaça ao estoque pesqueiro), MATCHING (prática×impacto na biodiversidade aquática) |
| 3 | 📺 | Vídeo | Legislação Ambiental para o Pescador | — (defeso: períodos e espécies no Amapá — quem define, por que existe, penalidades por descumprir; tamanho mínimo de captura por espécie: como medir, como devolver; malha mínima das redes: tabela por petrecho; IBAMA: funções, fiscalização, como denunciar pesca ilegal; licença de pesca artesanal: quando é necessária) |
| 4 | ⭐ | Quiz | Avaliação: Legislação Ambiental | 10: MC1, MATCHING (espécie×período de defeso no Amapá), LISTEN_AND_ORDER (protocolo ao capturar peixe abaixo do tamanho mínimo), VF |
| 5 | 📖 | Leitura | Práticas de Conservação que Garantem a Pesca do Futuro | — (pesca seletiva: por que malha correta protege estoques jovens; mangue: o que é, por que não pode ser desmatado, como ele funciona como berçário; sistemas de defeso comunitário (acordos de pesca): o que são, como criar um na sua região; lixo aquático: impacto e como reduzir; voluntariado ambiental: coleta de dados para o IBAMA) |
| 6 | ⭐ | Quiz | Avaliação: Práticas de Conservação | 10: MC1, SELECT_MISSING_WORDS (complete as regras de tamanho mínimo e malha), VF, DRAG_AND_DROP (identificar práticas corretas e incorretas de pesca sustentável) |
| 7 | 💬 | Escuta Ativa | Minha Relação com o Meio Ambiente | 4–5q sobre práticas atuais de conservação e percepção de mudanças no estoque pesqueiro |
| 8 | 📦 | Diário | Meu Rio e Eu | Foto do local de pesca com vegetação preservada, ou foto devolvendo peixe abaixo do tamanho mínimo, ou foto do barco sem lixo / água limpa ao redor (baú → cristal) |
| 9 | 🏆 | Revisão | Revisão Geral: Módulo G | 10: MC1, MATCHING, SELECT_MISSING_WORDS, VF (cobre papel do pescador, legislação e conservação) |

> **Escuta Ativa — questões sugeridas (lição 7):**
> - "Você respeita o período de defeso das espécies que pesca?" (MC1: Sempre / Às vezes / Às vezes pesco mesmo assim / Não sabia que existia)
> - "Você usa malha de rede no tamanho correto para as espécies que captura?" (MC1: Sempre / Às vezes / Não sei qual é o tamanho correto)
> - "Você percebeu redução no volume de peixe nos últimos anos nos seus pesqueiros?" (MC1: Sim, muito / Um pouco / Não percebi diferença)
> - "Existe garimpo ou desmatamento de mangue perto de onde você pesca?" (MC1: Sim, bastante / Algum / Não que eu saiba)
> - "O que você faz para preservar os peixes e os rios onde trabalha?" (SHORT_ANSWER)

---

### Fase 3 — Concluída: Módulos F e G detalhados

### Pendente: Trilhas Multiplicador (Mel e Pesca)

---

## 6. Estratégia de criação de conteúdo

### API-first com scripts (D-C2 confirmado)

Cadastrar lições, quizzes e questões **via API do Funifier** usando scripts Node.js:

```
1. POST /v3/folder           → criar Módulo
2. POST /v3/folder           → criar Lição (parent = módulo)
3. POST /v3/database/quiz    → criar Quiz
4. POST /v3/database/question (bulk) → criar Questões (com model.matching, model.missingWords, etc.)
5. POST /v3/folder_content   → linkar Lição → Quiz
6. POST /v3/database/video__c → criar referência de vídeo
```

**Coleções a verificar antes de criar o script:**
`folder_content_type`, `folder_type`, `folder`, `quiz`, `question`, `video__c`

---

## 7. Decisões abertas

| # | Questão | Impacto |
|---|---------|---------|
| D-C1 | ✅ Limpar todo o conteúdo de teste (após mapear conteúdo real) | Alto |
| D-C2 | ✅ Cadastrar via API com scripts | Médio |
| D-C3 | ✅ Vídeos no YouTube (Shorts verticais) + placeholder MDA/Embrapa na Fase 1 | Alto |
| D-C4 | ✅ ~10 questões por avaliação de conhecimento | Médio |
| D-C5 | ⚠️ Missão CAF: usar foto do documento como placeholder; integrar API gov. futuramente | Alto |
| D-C6 | ⚠️ "Fazer Vídeo" no Diário: implementar com compressão + upload em background | Médio |

---

## 8. Referências

- Estrutura técnica do app: `/jarvis/rota-viva/doc/bmad-trail-app-2026-04-08.md`
- Portal MDA Rota do Mel: `http://portalrotas.avaliacao.org.br/rota/rota-do-mel/12`
- Portal MDA Rota da Pesca: `http://portalrotas.avaliacao.org.br/rota/rota-do-pescado/8`

---

---

## 9. Sugestões de vídeos do YouTube — Módulo Início

> URLs verificadas via yt-dlp em 2026-04-09. Apenas lições do tipo **Vídeo** (lições 1, 3 e 5 de cada rota) precisam de vídeo externo. A lição 7 é Leitura — vídeos listados abaixo são opcionais como material complementar.
>
> **Nota:** não foram encontrados vídeos específicos sobre o Amapá para a Rota da Pesca. O conteúdo abaixo usa vídeos representativos de outras regiões do Brasil como placeholder. O ideal a longo prazo é produzir vídeos próprios (Shorts verticais, 60–90s) com produtores reais das duas rotas.

### Rota do Mel

| Módulo | Lição | Tipo | Título do vídeo | URL | Duração | Obs |
|--------|-------|------|-----------------|-----|---------|-----|
| Início | 1 | Vídeo | ABELHAS Episódio 6 — Polinização agrícola: as abelhas e a produção de alimentos | https://www.youtube.com/watch?v=_PDJpMhwai4 | 1:08 | ★ Recomendado — curto, didático |
| Início | 1 | Alternativa | Mel e a importância vital das abelhas | https://www.youtube.com/watch?v=pRWHF0Afl7o | 6:26 | Mais completo, mas longo para mobile |
| Início | 1 | Alternativa | Polinização: a importância das abelhas | https://www.youtube.com/watch?v=iDh_rFYFM_w | 1:19 | Muito curto, bom como teaser |
| Início | 3 | Vídeo | CICLO de VIDA das ABELHAS 🐝 (Rainhas, Operárias e Zangões) | https://www.youtube.com/watch?v=umKpJligre0 | 5:24 | ★ Recomendado — cobre rainha, operárias e zangões |
| Início | 5 | Vídeo | Vida de Uma Apicultora — Manejo Entressafra (Alice Borges) | https://www.youtube.com/watch?v=yth-9XhIaRw | 1:13 | ★ Recomendado — apicultora real, curto, autêntico |
| Início | 5 | Alternativa | SENAR — Como evitar enxameação nas colmeias | https://www.youtube.com/watch?v=sUjbT9jamUU | 3:30 | SENAR, qualidade institucional |
| Início | 7 | Complementar* | Piauí é o terceiro maior produtor de mel do Brasil | https://www.youtube.com/watch?v=aukyzmO88U4 | 2:32 | ★ Recomendado — contexto regional forte |
| Início | 7 | Complementar* | Piauí lidera produção de mel orgânico no Brasil | https://www.youtube.com/watch?v=L4z9XdjRD1A | 2:53 | Foco em orgânico, bom para leitura |

*Lição 7 é Leitura — vídeo complementar opcional, pode ser linkado no corpo do texto de leitura.

---

### Rota da Pesca

| Módulo | Lição | Tipo | Título do vídeo | URL | Duração | Obs |
|--------|-------|------|-----------------|-----|---------|-----|
| Início | 1 | Vídeo | Projeto Nossa Pesca: conhecer a origem para valorizar a pesca artesanal | https://www.youtube.com/watch?v=ZoscMQ2ojYY | 3:28 | ★ Recomendado — valorização da pesca artesanal, tom correto |
| Início | 3 | Vídeo | PROTOCOLO PESCADOR PROFISSIONAL | https://www.youtube.com/watch?v=rY0OjC43x1M | 5:06 | ★ Recomendado — petrechos e práticas |
| Início | 3 | Alternativa | SCIENCIA — Petrechos de Pesca | https://www.youtube.com/watch?v=6yKUwtX7Guw | 24:53 | Muito longo — usar apenas como referência técnica |
| Início | 5 | Vídeo | Dia do trabalhador: rotina de um pescador artesanal | https://www.youtube.com/watch?v=vK5zh-MEbq0 | 10:02 | ★ Recomendado — rotina real, jornalístico |
| Início | 5 | Alternativa | Rotina de cada dia dos pescadores artesanais de Camocim — CE | https://www.youtube.com/watch?v=KE95TeE7HvE | 12:38 | Autêntico, mas longo para mobile |
| Início | 7 | Complementar* | Beneficiamento e comercialização dos produtos da pesca artesanal | https://www.youtube.com/watch?v=YqrbqvUmGd0 | 25:35 | Técnico e completo — longo, usar como referência |

*Lição 7 é Leitura — vídeo complementar opcional.

---

### Observações gerais

1. **Vídeos ideais para o app são entre 3–7 min** — curtos o suficiente para mobile, longos o suficiente para ensinar algo concreto. Os vídeos de ~1 min são bons como "gancho" emocional na lição 1, mas podem não ser suficientes como conteúdo principal.

2. **Ausência de conteúdo sobre o Amapá**: Não foram encontrados vídeos específicos sobre pesca artesanal no Amapá para as lições de contexto regional. Isso reforça a oportunidade de produzir vídeos próprios com os produtores do programa MDA.

3. **Próximos módulos (A–G)**: Não foram pesquisados vídeos para os módulos A–G ainda. Prioridade é validar o Módulo Início primeiro.

4. **Produção própria recomendada**: Para o lançamento final, o ideal é ter vídeos verticais (Shorts, 60–90s) gravados com os próprios produtores do Piauí e do Amapá. Os vídeos do YouTube listados acima servem como placeholder enquanto o conteúdo próprio não está pronto.

---

*Documento gerado em sessão de planejamento — 2026-04-08 | Atualizado 2026-04-09*
