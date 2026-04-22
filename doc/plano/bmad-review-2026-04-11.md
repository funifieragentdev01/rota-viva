# Rota Viva — Planejamento e Gamificação
**Última atualização:** 2026-04-12

---

## PARTE 1 — BUGS & AJUSTES (Status)

### ✅ Implementados
- **1.1** Botão ← removido da trilha
- **1.2** Personagem tampando título → decidido ignorar
- **1.3** Passaporte Digital → redesign completo (modal + ID card + QR code + flip + edição + badge de incompleto)
- **1.4** "Zona de Perigo" → fundida em "Conta" (sem label separado)
- **1.5** Bottom Nav → ícones 22px, label bold 600, pílula ativa
- **1.6** Header stats → fa-star (XP) + fa-coins (coins) em trilha, galeria e perfil (4 stats: XP, Moedas, Sequência, Nível)
- **Favicon** → logo do MIDR (`img/logo-midr.png`)
- **Profile stats spacing** → `margin-bottom: 16px` adicionado ao `.profile-stats`
- **Conquistas** → seção mostra TODOS os desafios (earned colorido, locked cinza), clique abre detalhe

### 🔜 Pendentes
- **1.7** Termos/Política → mover para gamificação central (não implementado)
- **1.8** Recuperar Senha → ver planejamento abaixo

---

## PARTE 2 — GAMIFICAÇÃO

### 2.1 Mapeamento Octalysis

| CD | Drive | Implementado |
|----|-------|-------------|
| CD1 | Significado Épico | Branding MIDR/governo, Passaporte Digital, missão nacional |
| CD2 | Realização | XP, Nível, Streak, Challenges/Conquistas, Stars no checkpoint |
| CD3 | Criatividade | Lições DIY (foto de campo), Baú de Coins, Loja de dicas (planejada) |
| CD4 | Propriedade | Perfil, Passaporte Digital (credencial), Coins acumuláveis |
| CD5 | Influência Social | Feed da galeria, posts de outros produtores em lições DIY, Convite com ref code |
| CD6 | Escassez | Lições bloqueadas (desbloqueio sequencial) |
| CD7 | Imprevisibilidade | Baú surpresa, Sons, Checkpoint com recompensa variável |
| CD8 | Perda/Evitação | Streak (medo de perder sequência), FOMO do feed, Sons de erro no quiz |

**Pendente:**
- CD3: Loja de dicas (Fase C)
- CD7: Visual/animação do baú
- CD2: Checkpoint interativo com estrelas reais (B4)

---

### 2.2 Point Types ✅ Configurados (mel + pesca)

| ID | Nome | ShortName | Ícone |
|----|------|-----------|-------|
| `xp` | Experiência | XP | `fa-star` |
| `coins` | Moedas | coins | `fa-coins` |

---

### 2.3 Actions ✅ Configuradas (mel + pesca)

| Action ID | Quando dispara | Atributos |
|-----------|---------------|-----------|
| `login` | A cada login | — |
| `complete_onboarding` | Ao concluir onboarding | — |
| `complete_lesson` | Ao concluir qualquer lição | `lesson` (id), `type` (video/quiz/diy/bau/cartoon), `score` (0–3) |
| `complete_module` | Ao concluir todos os itens de um módulo | `module` (id) |
| `complete_passport` | Ao emitir o Passaporte Digital | — |
| `publish_post` | Ao publicar no feed da galeria | — |
| `invite_accepted` | Quando um convidado completa o onboarding | `invited_player` (id) |

---

### 2.4 Challenges ✅ Configurados (mel + pesca)

| ID | Challenge | Condição | Recompensa |
|----|-----------|----------|-----------|
| `explorador_da_rota` | Explorador da Rota | `complete_onboarding` (1x) | +50 XP (1x) |
| `produtor_registrado` | Produtor Registrado | `complete_passport` (1x) | +30 XP (1x) |
| `licao_de_bau` | Lição de Baú | `complete_lesson type=bau` (cada vez) | +10 XP + 3 coins |
| `checkpoint` | Checkpoint | `complete_lesson type=cartoon` (cada vez) | coins = 3 × score |
| `conector` | Conector | `invite_accepted` count≥3 | +30 XP (1x) |
| `presenca_diaria` | Presença Diária | `login` 7x em 7 dias | +10 XP (semanal) |

---

### 2.5 Personagem/Checkpoint na Trilha (B4)

> **Atualizado 2026-04-12 — cálculo de estrelas redefinido**

#### Estado atual

Na trilha já aparecem imagens de personagens cartoon entre as bolinhas de lições. Hoje são decorativas: posicionadas automaticamente a cada 3 lições (índice % 4 === 2), não clicáveis, sem conteúdo.

#### O que precisa ser implementado (B4)

Transformar os personagens em **checkpoints interativos com conteúdo e recompensa**.

#### Estrutura de dados no Funifier (✅ criado)

- **`folder_content_type`** com `_id: "cartoon"` → registrado em mel e pesca
- **Exemplo criado** (mel + pesca): Checkpoint A em Módulo A com quiz de 3 perguntas
  - Mel: folder `69db8b7dd95d627e2bdbafd0`, quiz `69db8b62d95d627e2bdbafcc`
  - Pesca: folder `69db8b9bd95d627e2bdbafd6`, quiz `69db8b99d95d627e2bdbafd2`

#### Cálculo das 3 estrelas — definição aprovada

> **Decisão:** Score-based, calculado dentro do quiz do próprio checkpoint (não nas lições anteriores).

**Motivação:** Critério por tempo (como no Duolingo) penaliza produtores com menor fluência na leitura — exatamente o público-alvo. Score-based é mais justo e reflete aprendizado real.

| Score | Estrelas | Critério |
|-------|----------|---------|
| 3 | ★★★ | ≥ 80% de acertos no quiz do checkpoint |
| 2 | ★★☆ | 50–79% de acertos |
| 1 | ★☆☆ | < 50% de acertos |

O score é calculado no frontend após o quiz terminar, antes de chamar `logAction('complete_lesson', { type: 'cartoon', score: N })`.

#### Comportamento esperado

| Aspecto | Hoje | Após B4 |
|---------|------|---------|
| Origem do personagem | Posição automática decorativa (índice % 4 === 2) | Folder com `folder_content.type = "cartoon"` cadastrado no Studio |
| Clicável? | Não | Sim — popup padrão de lição |
| Conteúdo | Nenhum | Quiz configurado pelo admin |
| Desbloqueio | Não existe | Padrão Funifier (sequencial) |
| Estrelas abaixo | Decorativas (vazias) | Calculadas: score do quiz do checkpoint |
| Recompensa | Nenhuma | coins = 3 × score (challenge `checkpoint`) |

#### Fluxo do usuário (B4)
1. Toca no personagem na trilha (agora clicável)
2. Popup padrão abre — título + botão "Começar"
3. Abre tela do quiz
4. Após terminar: overlay mostra ★ calculadas + coins ganhos
5. Dispara `complete_lesson` com `type: "cartoon"` e `score: 1|2|3`
6. Botão "Continuar" → trilha, próxima lição desbloqueada

#### O que muda no código do app (trail.js / trail.html)

- Reconhecer `contentType === 'cartoon'` como checkpoint (assim como `contentType === 'chest'`)
- Estrelas abaixo do personagem → calculadas após completar o quiz, não fixas
- Overlay de celebração pós-quiz: mostrar N★ + "+N coins"
- Passar `score` calculado no `logAction('complete_lesson', { type: 'cartoon', score: N })`
- Renderizar o personagem cartoon na bolinha (já existe a lógica de `_charImg`, adaptar para lessons com `contentType === 'cartoon'`)

#### O que o admin configura no Studio

- Abrir o Studio → Trilha → Módulo desejado → "+ Nova Lição" → Tipo: "Checkpoint Interativo"
- Adicionar quiz com 3–5 perguntas de revisão do módulo
- Posicionar o checkpoint entre as lições normais

#### O que NÃO muda
- Lógica de desbloqueio sequencial (já funciona via Funifier)
- Posicionamento visual S-curve das bolinhas

---

### 2.6 Baú na Trilha — Fluxo Completo

**O baú é uma lição do tipo `chest`** com visual especial.

**Fluxo:**
1. Bolinha do baú (ícone de baú)
2. Overlay: "Você encontrou um baú!"
3. Conteúdo: coleta de evidência (foto/vídeo/localização)
4. Ao enviar: animação de baú abrindo + "+3 coins!" em destaque
5. Opção: "Publicar no feed da galeria"
6. Rodapé: "X produtores já fizeram isso" + 3 posts de outros usuários (CD5)
7. Dispara `complete_lesson type=bau score=1`

**Status:** Estrutura registrada (challenge + action). Visual/animação — pendente (B5).

---

### 2.7 Ordem de Implementação

#### ✅ Fase A — Bugs & Ajustes (concluída)
Todos os itens implementados (ver seção 1).

#### Fase B — Gamificação (em progresso)
- ✅ B1: Point Types configurados (xp + coins)
- ✅ B2: Actions configuradas (login, complete_onboarding, etc.)
- ✅ B3: Challenges configurados (6 challenges)
- 🔜 **B4**: Checkpoint interativo — conteúdo registrado, implementação no app pendente
- 🔜 **B5**: Baú visual (overlay + animação)
- 🔜 **B6**: Algoritmo do topo da galeria (Stories-style carrossel)

#### Fase C — Loja de Dicas (futura)
Ver seção 2.8.

---

### 2.8 Fase C — Loja de Dicas

**Conceito:** Produtor gasta coins para comprar dicas de campo fornecidas por outros produtores experientes ou pelo MIDR.

**API usada:** `POST /v3/virtualgoods/catalog` + `POST /v3/virtualgoods/item`

**Estrutura:**

```
Catálogo: { "_id": "rewards", "catalog": "Loja de Dicas" }

Item (exemplo):
{
  "catalogId": "rewards",
  "name": "Dica: Como aumentar a produção de mel no verão",
  "description": "Técnica validada por apicultores do Piauí",
  "amount": -1,          // ilimitado
  "active": true,
  "extra": {
    "type": "video",
    "url": "https://www.instagram.com/reels/DWK7V3PkzB3"
  },
  "requires": [{
    "total": 10,
    "type": 0,           // 0 = point type
    "item": "coins",
    "operation": 1       // 1 = deduct
  }]
}
```

**Fluxo:**
1. Usuário acessa a loja (aba futura ou dentro do perfil)
2. Vê itens disponíveis — desbloqueados com coins suficientes
3. Clica "Resgatar" → `POST /v3/virtualgoods/item/{id}/redeem`
4. Funifier debita os coins e retorna o conteúdo

**Primeira dica a cadastrar:** vídeo `https://www.instagram.com/reels/DWK7V3PkzB3` (10 coins)

**Status:** Planejado. Implementar após Fase B completa.

---

## PARTE 3 — RECUPERAÇÃO E ALTERAÇÃO DE SENHA

### 3.1 Endpoints existentes no Funifier

**Solicitar código (email):**
```
GET /v3/player/password/change?player={CPF}
Authorization: {publicToken}
```
- Busca o player pelo CPF
- Se tem email → envia código por email (expira em 5h)
- Se NÃO tem email → retorna erro `"player does not have email to send your code"`

**Trocar senha com código:**
```
PUT /v3/player/password?player={CPF}&code={CODIGO}&new_password={NOVA}
Authorization: {qualquer token}
```

**Trocar senha (logado):**
```
PUT /v3/player/password?player=me&old_password={ANTIGA}&new_password={NOVA}
Authorization: {Bearer token do usuário}
```

### 3.2 Problema: usuário sem email

Muitos produtores cadastram apenas telefone. O fluxo nativo de recuperação por código não funciona sem email.

### 3.3 Plano de implementação

#### Curto prazo — MVP (sem SMS/WhatsApp OTP)

**Área privada (alterar senha — logado):**
```
Perfil → Conta → "Alterar senha"
Modal: Senha atual + Nova senha + Confirmar
→ PUT /v3/player/password?player=me&old_password=X&new_password=Y
```
Sem dependência de email. ✅ Simples de implementar.

**Área pública (recuperar senha — deslogado):**
```
Tela 1: Informe seu CPF
  → GET /v3/player/password/change?player={CPF}

Tela 2a (tem email): "Código enviado para ***@gmail.com"
  → Campo código + nova senha
  → PUT /v3/player/password?player={CPF}&code={CODE}&new_password={NOVA}

Tela 2b (sem email): "Você não tem email cadastrado."
  → Botão "Falar com suporte" → WhatsApp do MIDR/FADEX
```

#### Médio prazo — Login/Recuperação via WhatsApp OTP

**Objetivo:** Permitir login com telefone + código enviado via WhatsApp (sem depender de senha ou email).

**Arquitetura planejada:**
1. **App** → envia `phone` para endpoint de OTP (via n8n webhook com token admin)
2. **n8n** → gera OTP de 6 dígitos, salva em `POST /v3/database/otp_reset__c` com TTL de 10 min, envia via WhatsApp API
3. **App** → usuário insere OTP + nova senha
4. **App** → `POST /v3/database/otp_reset__c?q=phone:'X'&code:'Y'` para validar (via token admin)
5. Se válido → **n8n** usa token admin para `PUT /v3/player/password` e invalida o OTP

**Dependências:**
- WhatsApp Business API (ou Twilio)
- n8n (já existe no projeto)
- Endpoint do agente exposto via webhook

**Número do suporte (a definir pelo cliente FADEX/UFPI)**

### 3.4 Perfil de segurança do usuário

No cadastro, incentivar email opcional: "Email (opcional — usado para recuperação de senha)". Usuários sem email usam o fluxo de suporte WhatsApp até a implementação do OTP.

---

## NOTAS TÉCNICAS

### QR Code (Passaporte)
- Biblioteca: `qrcode.js` (CDN, sem build)
- Encode: `player.extra.ref` (código de convite)
- Render: canvas element dentro do card verso

### GPS no Passaporte
- `navigator.geolocation.getCurrentPosition()`
- Salva `passaporte_lat` e `passaporte_lng` em `player.extra`

### Coins no Funifier
- Point Type `_id: coins` configurado em ambas as rotas
- Carregado via `ApiService.getPlayerStatus()` → `status.wallets` → `virtualCurrency === 'cristais'`
  - **Nota:** O nome interno no Funifier ainda usa `'cristais'` como virtualCurrency ID — o display no app usa "Moedas" / `fa-coins`

### Cartoon Checkpoint — Conteúdo cadastrado
| Campo | Mel | Pesca |
|-------|-----|-------|
| folder_content_type | `cartoon` ✅ | `cartoon` ✅ |
| Quiz ID (Módulo A) | `69db8b62d95d627e2bdbafcc` | `69db8b99d95d627e2bdbafd2` |
| Folder ID (Módulo A) | `69db8b7dd95d627e2bdbafd0` | `69db8b9bd95d627e2bdbafd6` |
| Questões | 3 | 3 |

---

# AJUSTES

## DADOS
- Na tela de "/profile" quando o usuario esta preenchendo os dados do passaporte, os campos passaporte_caf, passaporte_pronaf, passaporte_cooperativa, que estao sendo registrados no campo "extra" do jogador, deveriam ser valores do tipo boolean (true/false) mas estao sendo registrados como string ("sim","nao"), por favor ajuste isso. 

---
Otimo! Aqui estao as implementacoes que voce deve fazer agora:

- Na tela /profile, sessao de **Conquistas**, onde mostra TODOS os desafios, quando eu clico em abrir detalhes, deveria mostrar tambem o campo de descrição do desafio. 

- Pode implementar agora o item "2.5 Personagem/Checkpoint na Trilha (B4)" do documento. Eu acho que o planejamento esta bom. 

---
# PRO VIDA (JUJU)
No exercicio dar o endereco completo: 
Contar 10 a 0, entrar em Alpha. 
Nome completo, Idade, Endereco (que uma pessoa que eu conheco bem)
Juliana Lopes Costa Rocha, 45 anos, 
Park Sul Prime Residence, Guará, Brasília

Cabelos longos claros, rosto fino, feliz e alegre, vaso grande escuro, nao viu familia ou atividade fisica ainda, viu ela na sala, com oculos, ela esta sempre sorrindo.

---

Voce estragou o modulo Inicio, veja como ficou "/jarvis/rota-viva/doc/assets/issue/bug-cartoon-2.png", agora aparecem duas bolinhas de licoes do tipo cartoon (isso esta errado, quando for cartoon, tem que aparecer a imagem do cartoon e nao uma bolinha de licao normal). O modulo "Inicio" tinha 11 licoes. Era apenas para voce incluir a mais as 2 novas licoes de cartoon. Era para eu ver exatamente esta imagem "/jarvis/rota-viva/doc/assets/issue/bug-cartoon-1.png" porem com a imagem dos cartoons (o apicultor, a abelha, etc) cinza se estiver bloqueada, e colorido se estiver desbloqueada. Preciso que voce cadastre novamente todo o conteudo do modulo "Inicio". Entao no final vamos ter 13 licoes (as 11 que ja tinham + as 2 de cartoon). Porem teremos o primeiro cartoon na 5a posicao, e o segundo cartoon na 10a posicao. Porem as licoes de cartoon nao vao seguir a ordem de bolinhas igual as outras licoes, as licoes de cartoon deverao ser posicionadas na curva da inflexao da trilha, da forma que esta sendo feita com as imagens de cartoon estaticas (o apicultor, a abelha, etc), entendeu? Ainda bem que nos temos esse conteudo registrado em "/jarvis/rota-viva/scripts/seed-inicio-mel.js" e "/jarvis/rota-viva/scripts/seed-inicio-pesca.js", mas precisa incluir tambem a lissao de revisao final em cada uma das duas. Ou voce guardou o que voce excluiu?

---

# FUNIFIER STUDIO
Preciso fazer os seguintes ajustes no Funifier Studio:

## Folders (/studio/folder)
- Nas paginas "/studio/folder" (/funifier/funifier-studio/app/views/studio/folder/list.html e /funifier/funifier-studio/app/scripts/controllers/studio/folder/list.js) e "/studio/folder/:id/content" (/funifier/funifier-studio/app/views/studio/folder/content/list.html e /funifier/funifier-studio/app/scripts/controllers/studio/folder/content/list.js), temos uma coluna de mover os items para cima ou para baixo, clicando nas setas de cima ou baixo. Eu quero poder clicar sobre o item e arrastar para cima ou para baixo, para qualquer posicao, e quando eu soltar, ele atualizar o campo "position" do item, e faz a requisicao de atualizar o item (que assim o funifier atualiza o index de todos os items). Quero um recurso drag and drop igual temos no posicionamento de tasks aqui na pagina de boards (/funifier/funifier-studio/app/views/studio/pm/board/list.html e /funifier/funifier-studio/app/scripts/controllers/studio/pm/board/list.js). 

- La lista de folders e content "/studio/folder" e "/studio/folder/:id/content", eu gostaria tres colunas "id", "type" e "extra", com o recurso de toogle para exibir/ocultar igual nos temos na pagina de challenges "/funifier/funifier-studio/app/views/studio/challenge/list.html". A coluna de ID vem logo apos o checkbox, e as colunas type e extra vem no final antes da coluna de operations. Na coluna "type" vai mostrar o campo "type" do folder, ou o "type" do content, conforme o item que esta aparecendo.

- Na pagina "/studio/folder/:id/content/:contentId/log/new", alterar o css do botao Salvar para usar o btn-warning ao invez do btn-primary. 

## Folder
- Algumas vezes quando eu edito um folder, por exemplo o titulo dele, a requisicao e' feita, o JSON e' enviado corretamente com o novo titulo, o JSON de resposta tambem e' correto, mas a pagina nao exibe as alteracoes. Eu gostaria que voce investigasse o frontend ("/funifier/funifier-studio/app/scripts/controllers/studio/folder/form.js" e "/funifier/funifier-studio/app/scripts/controllers/studio/folder/content/form.js") e o backend "/funifier/funifier-service/src/main/java/com/funifier/rest/v3/rest/FolderRest.java" eu suspeito que o problema esteja no metodo "insertFolder" do "/funifier/funifier-service/src/main/java/com/funifier/engine/folder/FolderManager.java", quando ele faz uma consulta de todos os folders do mesmo nivel do folder que esta sendo atualizado, para atualizar o campo "position" de todos eles, inclusive o folder que esta sendo atualizado. E esta atualizacao salva o conteudo inteiro do folder. Se a consulta retornar o dado antes de ele ter sido atualizado no banco, ele vai retornar o registro antigo e atualizar a pagina com o registro antigo. Isso pode estar acontecendo com o content tambem. Por favor analise e me diga o que esta acontecendo e como voce planeja corrigir isso, antes de voce implementar a correcao. 