# Rota Viva — Planejamento de Correções e Gamificação
**Data:** 2026-04-11  
**Sessão:** Review de bugs, ajustes de UX e design completo da gamificação

---

## PARTE 1 — BUGS & AJUSTES

### 1.1 Botão Voltar na Trilha
**Problema:** O botão ← no header da trilha leva para `/home`, que não existe mais.  
**Decisão:** Remover o botão completamente.  
**Arquivo:** `pages/trail/trail.html` e/ou CSS (esconder o botão de voltar).

---

### 1.2 Personagem tampando título do módulo
**Decisão:** Ignorar. Deixar como está.

---

### 1.3 Passaporte Digital — Redesign Completo

**Problema:** O design atual parece um formulário genérico, não um documento oficial.

**Nova proposta aprovada:**

**Estado inicial (sem passaporte criado):**
- Card com borda tracejada na cor da rota
- Ícone de documento + texto "Passaporte Digital"
- Subtítulo: "Sua credencial de acesso aos programas do governo"
- Botão: "Criar meu Passaporte →"

**Modal de criação (onboarding do passaporte):**
- Slide 1: Personagem segurando documento + explicação do que é o passaporte
  - "Seu Passaporte Digital é uma credencial que facilita seu acesso aos programas do governo federal."
  - "Com ele, os agentes do MIDR identificam sua situação e podem te encaminhar para o programa certo."
- Slide 2: Formulário de dados
  - Nome completo (já preenchido do perfil)
  - CPF (já preenchido, mascarado)
  - Telefone/WhatsApp (já preenchido)
  - Email (opcional, já preenchido se existir)
  - Endereço / Município (texto livre)
  - Localização GPS (botão "Usar minha localização")
  - CAF (mel) ou RGP (pesca): Sim / Não / Não sei
  - PRONAF: Sim / Não / Não sei
  - Cooperativa/Associação: Sim / Não → se Sim, nome da coop
- Botão: "Emitir meu Passaporte"

**Estado completo — Visualização como ID card:**

```
┌─────────────────────────────────────────────┐
│  FRENTE                                      │
│  [Logo MIDR]     ROTA VIVA — PASSAPORTE     │
│                  DIGITAL DO PRODUTOR         │
│  [Foto]  Nome: JÚLIA REIS TEIXEIRA          │
│          CPF: ***.456.789-**                │
│          Perfil: Apicultora — Piauí         │
│          Município: Floriano                │
│          CAF: Sim  |  PRONAF: Não sei       │
│          Emitido em: 11/04/2026             │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│  VERSO                                       │
│  Cooperativa: Não informada                 │
│  WhatsApp: (89) 9****-****                  │
│                                              │
│  [QR CODE — encode: ref code do player]     │
│                                              │
│  Compartilhe com agentes MIDR/FADEX/UFPI    │
└─────────────────────────────────────────────┘
```

**QR Code:** Codifica o `extra.ref` do player (já existe). Pode ser lido por agentes de campo com qualquer leitor de QR, abrindo o perfil público do produtor no futuro.

**Implementação:**
- Gerar QR code client-side com biblioteca `qrcode.js` (CDN, ~10kb)
- Card flip CSS (frente/verso com animação de rotação no toque)
- Salva em `player.extra` os campos do passaporte
- Action `complete_passport` disparada ao emitir
- Campos salvos: `passaporte_municipio`, `passaporte_lat`, `passaporte_lng`, `passaporte_caf`, `passaporte_rgp`, `passaporte_pronaf`, `passaporte_cooperativa`, `passaporte_cooperativa_nome`, `passaporte_emitido_em`

---

### 1.4 "Zona de Perigo" → Fundir em "Conta"

**Problema:** "Zona de perigo" é jargão de developer, inadequado para pescadores e apicultores.  
**Decisão:** Remover o label "Zona de Perigo". Fundir "Sair" e "Excluir conta" na seção "Conta", junto com Termos e Privacidade.  
**Referência:** Nubank, iFood, Mercado Livre — todos usam esse padrão sem label separado.

---

### 1.5 Bottom Nav — Ícones Maiores e Destaque

**Decisão:**
- Ícones: aumentar de ~24px para 28px
- Labels: aumentar de 10px para 12px, bold
- Item ativo: pílula colorida de fundo (como Duolingo), não apenas troca de cor
- Implementar em `components/bottom-nav/`

---

### 1.6 Ícones de Pontuação no Header da Trilha

**Problema:** Troféu 🏆 para XP é semanticamente errado (troféu = ranking, não ponto acumulado).

**Decisão por rota:**
- **XP (Rota do Mel):** ícone de favo de mel — SVG inline ou `fa-honeycomb` se disponível, fallback `fa-star`
- **XP (Rota da Pesca):** ícone de gota d'água — `fa-droplet`
- **Cristais (ambas as rotas):** ícone de gema — `fa-gem`

**Header da trilha atualizado:**
```
[← Rota do Mel]          [🍯 0]  [💎 0]
```
- Dois contadores: XP temático + Cristais
- Os dois Point Types precisam estar configurados no Studio

---

### 1.7 Termos e Política — Mover para Gamificação Central

**Problema:** Os documentos `legal__c` estão dentro das gamificações das rotas, mas são genéricos (valem para todas as rotas).

**Solução:**
1. Criar coleção `legal__c` na gamificação central com os documentos (copiar conteúdo de mel)
2. Criar/verificar Studio Page de administração de `legal__c` na gamificação central (copiar de mel)
3. Adicionar endpoint público na central: `GET /v3/database/legal__c` com `publicToken` central
4. Atualizar `api.getLegal()` para usar `publicToken` da central em vez do token da rota
5. O `publicToken` da central deve ser adicionado ao `config.js` como `CONFIG.CENTRAL_PUBLIC_TOKEN`

---

### 1.8 Recuperar Senha (área pública) e Alterar Senha (área privada)

#### Análise dos endpoints (leitura de `PlayerRest.java`)

**Endpoint 1 — Solicitar código de recuperação:**
```
GET /v3/player/password/change?player={CPF}
Authorization: {publicToken ou qualquer token}
```
- Busca o player pelo CPF
- **Se tem email:** gera código com `Guid.shortTimeMillis()`, salva na coleção `password_change__c` com expiração de 5h, envia por email
- **Se NÃO tem email:** retorna erro `"player does not have email to send your code"`
- Resposta de sucesso: `{ "message": "check your email and use the code generated to update your password", "sent_to": "email@..." }`

**Endpoint 2 — Trocar senha com código (recuperação):**
```
PUT /v3/player/password?player={CPF}&code={CODIGO}&new_password={NOVA}
Authorization: {qualquer token}
```
- Valida código na coleção `password_change__c` (não expirado)
- Se válido: atualiza senha com BCrypt, remove código

**Endpoint 3 — Trocar senha com senha atual (logado):**
```
PUT /v3/player/password?player=me&old_password={ANTIGA}&new_password={NOVA}
Authorization: {token do usuário logado}
```
- Valida senha antiga com BCrypt
- Se válida: atualiza senha

#### Problema: usuário sem email

Muitos produtores podem ter cadastrado apenas telefone. Se não tiver email, o fluxo de recuperação por código não funciona.

**Decisão:**
- **Área privada (alterar senha):** usa Endpoint 3 (old_password + new_password). Sem dependência de email. ✅
- **Área pública (recuperar senha):**
  - Usuário informa CPF
  - App tenta `GET /v3/player/password/change?player={CPF}`
  - Se sucesso → tela "Verifique seu email e insira o código recebido"
  - Se erro de email → mensagem: "Você não tem email cadastrado. Para recuperar sua senha, entre em contato com o suporte pelo WhatsApp: [número]"
  - Após inserir código → nova senha → Endpoint 2

#### Fluxo de recuperação (área pública — `/login` → "Esqueci minha senha"):
```
Tela 1: Informe seu CPF
  → CPF + botão "Enviar código"
  → Chama GET /v3/player/password/change?player={CPF}

Tela 2a (tem email): "Código enviado para ***@gmail.com"
  → Campo código + nova senha + confirmar senha
  → Chama PUT /v3/player/password?player={CPF}&code={CODE}&new_password={NOVA}

Tela 2b (sem email): "Você não tem email cadastrado."
  → Botão WhatsApp do suporte
```

#### Fluxo de alteração (área privada — `/profile`):
```
Seção "Segurança" no perfil (nova entrada no menu Conta):
  → Modal: Senha atual + Nova senha + Confirmar
  → Chama PUT /v3/player/password?player=me&old_password={ANTIGA}&new_password={NOVA}
```

---

## PARTE 2 — GAMIFICAÇÃO

### 2.1 Mapeamento Octalysis — O que já existe

| CD | Drive | Implementado |
|----|-------|-------------|
| CD1 | Significado Épico | Branding MIDR/governo, "Passaporte Digital do Produtor Rural Brasileiro", missão nacional |
| CD2 | Realização | XP, Níveis, Streak, Badges/Conquistas, Stars no personagem/checkpoint, troféu no header |
| CD3 | Criatividade | Lições DIY (foto de campo), Baú de Cristais, Loja de dicas (planejada) |
| CD4 | Propriedade | Perfil, Passaporte Digital (credencial), Cristais acumuláveis |
| CD5 | Influência Social | Feed da galeria, Prova de campo nas lições (posts de outros antes do DIY), Convite com ref code, Contador de convidados |
| CD6 | Escassez | Lições bloqueadas (desbloqueio sequencial) |
| CD7 | Imprevisibilidade | Baú surpresa, Sons, Personagem/checkpoint com recompensa variável |
| CD8 | Perda/Evitação | Streak (medo de perder sequência), FOMO do feed da galeria, Sons de erro no quiz |

**O que ainda falta implementar:**
- CD3: Loja de dicas (gastar Cristais para comprar dicas de outros produtores)
- CD7: Visual/animação do baú, personagem/checkpoint completo
- CD2: Personagem/checkpoint com estrelas refletindo desempenho

---

### 2.2 Tipos de Pontos

#### XP — Experiência
- **Função:** Define o nível do jogador. Só incrementa, nunca decresce.
- **Ícone por rota:**
  - Mel: favo de mel (SVG / `fa-star` fallback)
  - Pesca: gota d'água (`fa-droplet`)
- **Nome no Studio:** `xp` (ou o point type padrão do Funifier)

#### Cristais 💎
- **Função:** Moeda interna. Pode ser acumulada e **gasta** na Loja de Dicas.
- **Ícone:** `fa-gem` (universal para ambas as rotas)
- **Nome no Studio:** `cristais`
- **Diferencial:** Cria economia interna. Produtores com mais cristais têm mais acesso a dicas de outros produtores experientes → incentiva engajamento profundo.

#### Header da trilha (após implementação):
```
[← Rota do Mel]    [🍯 145 xp]  [💎 12]
```

---

### 2.3 Actions a Cadastrar no Studio

| Action ID | Quando dispara | Atributos |
|-----------|---------------|-----------|
| `login` | A cada login | — |
| `complete_onboarding` | Ao concluir onboarding | — |
| `complete_lesson` | Ao concluir qualquer lição | `lesson` (id), `type` (video/quiz/diy/bau/cartoon), `score` (0–3) |
| `complete_module` | Ao concluir todos os itens de um módulo | `module` (id) |
| `complete_passport` | Ao emitir o Passaporte Digital | — |
| `edit_profile` | Ao salvar foto ou nome | — |
| `publish_post` | Ao publicar no feed da galeria | — |
| `invite_accepted` | Quando um convidado completa o onboarding | `invited_player` (id) |

> **Nota:** `complete_lesson` centraliza todos os tipos de lição. Os challenges usam os atributos para diferenciar recompensas. Exemplo: challenge "Baú de Cristais" — condição: `type = bau` → recompensa: +3 Cristais. Challenge "Checkpoint Perfeito" — condição: `type = cartoon AND score = 3` → recompensa: +5 Cristais.

---

### 2.4 Challenges (Badges e Recompensas) a Configurar

| Challenge | Condição | Recompensa |
|-----------|----------|-----------|
| Explorador da Rota | `complete_onboarding` (1x) | +50 XP + badge |
| Produtor Registrado | `complete_passport` (1x) | +30 XP + badge |
| Primeira Lição | `complete_lesson` count=1 | +5 XP + badge |
| Aprendiz | `complete_lesson` count=10 | +20 XP + badge |
| Produtor Ativo | `complete_lesson` count=50 | +50 XP + badge |
| Mestre da Rota | `complete_lesson` count=total da trilha | +100 XP + badge |
| Lição de Baú | `complete_lesson type=bau` (cada) | +10 XP + 3 Cristais |
| Checkpoint ★★★ | `complete_lesson type=cartoon score=3` | +5 Cristais |
| Checkpoint ★★ | `complete_lesson type=cartoon score=2` | +3 Cristais |
| Checkpoint ★ | `complete_lesson type=cartoon score=1` | +1 Cristal |
| Fotógrafo do Campo | `publish_post` count=5 | +25 XP + badge |
| Conector | `invite_accepted` count=3 | +30 XP + badge |
| Presença Diária | `login` count=7 (dias) | +10 XP + badge |

---

### 2.5 Personagem/Checkpoint na Trilha

> **Atualizado em 2026-04-11 — alinhamento pós-revisão do screenshot da trilha**

#### O que existe hoje (estado atual)

Na tela da trilha já aparecem **imagens de personagens cartoon** (abelha, apicultor, filho do apicultor) entre as bolinhas de lições, com **3 estrelas decorativas** abaixo de cada um. Estas imagens são geradas pelo app a partir de uma lógica de posicionamento automático — a cada N lições, o app exibe um personagem. Hoje elas são **puramente decorativas**: não são clicáveis, não têm conteúdo associado, não desbloqueiam nada.

Veja screenshot: `doc/assets/issue/v1/bug-trilha.png`

#### O que precisa ser implementado (B4)

Transformar esses personagens decorativos em **elementos interativos da trilha**, funcionando como um **checkpoint com conteúdo** — igual a uma lição, mas com visual e propósito diferente.

**Conceito correto (revisado):**

O personagem/checkpoint é uma **lição cadastrada no Studio com `type: cartoon`**, posicionada pelo admin dentro do módulo entre as lições regulares. O app já renderiza personagens decorativos nessas posições — a mudança é fazer com que o **personagem renderizado corresponda a um folder real cadastrado no Funifier**, com conteúdo (ex: um quiz), lógica de desbloqueio e recompensa.

**Comportamento atual vs. comportamento desejado:**

| Aspecto | Hoje | Após B4 |
|---------|------|---------|
| Origem do personagem | Posição automática no app (decorativo) | Folder `type: cartoon` cadastrado no Studio |
| Clicável? | Não | Sim — abre popup igual às outras lições |
| Conteúdo | Nenhum | Quiz, vídeo, ou leitura curta configurada pelo admin |
| Desbloqueio | Não existe | Desbloqueado após completar as lições anteriores do módulo (padrão Funifier) |
| Estrelas | Decorativas (sempre 3 vazias) | Calculadas com base no desempenho das últimas lições antes do checkpoint |
| Recompensa | Nenhuma | `complete_lesson type=cartoon score=N` → 3×score coins (challenge `checkpoint`) |

**As 3 estrelas — cálculo:**

As estrelas refletem o desempenho do produtor nas lições entre o checkpoint anterior e este:
- ★★★ (score=3): ≥ 80% de acertos nos quizzes do bloco
- ★★☆ (score=2): 50–79% de acertos
- ★☆☆ (score=1): < 50% de acertos (ou bloco sem quiz)
- Lições sem quiz (vídeo, leitura) contam como acerto integral

O score é calculado no frontend no momento em que o produtor abre o checkpoint, usando os logs de progresso já disponíveis via `folderProgress`.

**Fluxo do usuário:**
1. Toca no personagem na trilha (bolinha com imagem do personagem, igual ao que já existe mas agora clicável)
2. Popup padrão abre (igual ao popup das outras lições) — mostra título e botão "Começar"
3. Ao clicar "Começar": abre tela do conteúdo (quiz ou leitura curta configurada pelo admin)
4. Após completar: overlay de celebração mostra as 3 estrelas calculadas + moedas ganhas ("+ N coins")
5. Dispara `complete_lesson` com `type=cartoon` e `score=1|2|3`
6. Botão "Continuar" → volta para a trilha, próxima lição desbloqueada

**O que muda no código do app (trail.js / trail.html):**
- Reconhecer folders com `type: cartoon` como checkpoints (hoje apenas `type: bau` é tratado diferente)
- Renderizar esses folders com a imagem do personagem (já existe a lógica de `_charImg`)
- Tornar as estrelas abaixo do personagem calculadas (não fixas/decorativas)
- Após completar o conteúdo do cartoon: mostrar overlay de estrelas + coins
- Passar atributo `score` calculado no `logAction('complete_lesson', ...)`

**O que muda no Studio (admin):**
- Criar folders dentro dos módulos com `extra.type: cartoon` (ou `subject: cartoon`)
- Configurar o conteúdo (quiz/leitura) dentro desse folder
- As estrelas e recompensas são calculadas e disparadas pelo app automaticamente

**Não muda:**
- A lógica de desbloqueio sequencial (já funciona via Funifier)
- O visual das bolinhas/posicionamento na trilha S-curve (já existe)
- A imagem do personagem (já é gerenciada pelo app por rota/contexto)

---

### 2.6 Baú na Trilha — Fluxo Completo

**O baú é uma lição do tipo `bau`** (variação de DIY com visual especial).

**Fluxo do usuário:**
1. Toca na bolinha do baú (ícone de baú na trilha)
2. Overlay de abertura: personagem surpreso + "Você encontrou um baú!"
3. Conteúdo: coleta de evidência (foto / vídeo / localização GPS)
   - Pergunta configurável pelo admin (ex: "Fotografe suas colmeias hoje")
   - Espaço para texto/observações
4. Ao enviar: animação de baú abrindo + "+3 Cristais!" em destaque
5. Opção: "Publicar no feed da galeria" (checkbox pré-ativado)
6. Rodapé: "X produtores já fizeram isso" + 3 posts de outros usuários (CD5 — influência social)
7. Dispara `complete_lesson` com `type=bau` e `score=1`

**Cadastro no Studio:**
- Folder com `type: bau`
- Campo `content` = pergunta/instrução para o produtor
- Mesma estrutura de DIY, mas com flag visual especial

---

### 2.7 Ordem de Implementação

#### Fase A — Bugs & Ajustes (próxima sessão)
1. Remover botão voltar da trilha
2. Bottom nav — ícones maiores + destaque ativo
3. Header trilha — trocar ícone XP + adicionar Cristais
4. "Zona de perigo" → fundir em "Conta"
5. Passaporte Digital — redesign completo (modal + ID card + QR code)
6. Recuperar senha na tela de login
7. Alterar senha no perfil
8. Termos/Política → gamificação central

#### Fase B — Gamificação (sessão seguinte)
1. Configurar Point Types no Studio (XP já existe, criar `cristais`)
2. Configurar Actions no Studio (lista da seção 2.3)
3. Configurar Challenges no Studio (lista da seção 2.4)
4. Implementar visual do cartoon/checkpoint na trilha (tela dedicada + estrelas)
5. Implementar visual do baú (overlay + animação)
6. Algoritmo do topo da galeria (carrossel estilo Stories)

#### Fase C — Loja de Dicas (futura)
- Interface para trocar Cristais por dicas de outros produtores
- Depende de acúmulo orgânico de Cristais pelos usuários

---

## NOTAS TÉCNICAS

### QR Code
- Biblioteca: `qrcode.js` (CDN, sem dependência de build)
- Encode: `player.extra.ref` (código de convite já existente)
- Render: canvas element dentro do card verso do passaporte

### GPS no Passaporte
- `navigator.geolocation.getCurrentPosition()` 
- Salva `passaporte_lat` e `passaporte_lng` em `player.extra`
- Exibido no ID card como "Localização verificada ✓" (não exibe coordenadas brutas)

### Cristais no Funifier
- Criar Point Type com `_id: cristais` no Studio de cada rota
- O mesmo `logAction` já dispara os challenges — o Studio calcula e atribui os pontos automaticamente
- Para exibir no header: `ApiService.getPlayerStatus()` já retorna todos os point types em `total_points` — precisa checar se retorna por tipo separado

### Recuperação de senha sem email
- Se `GET /v3/player/password/change` retornar erro de email → mostrar botão WhatsApp com número do suporte
- Número do suporte: a definir pelo cliente (FADEX/UFPI)
