# Arquitetura Técnica — Rota Viva

**Versão:** 0.3.0
**Data:** 2026-03-26
**Autores:** Ricardo Lopes Costa + Jarvis

---

## Histórico de Versões

| Versão | Data | Alteração |
|--------|------|-----------|
| 0.1.0 | 2026-03-26 | Criação inicial |
| 0.2.0 | 2026-03-26 | Segurança do `basic_token` via Find, tratamento de token expirado (online/offline), armazenamento de mídia (fotos S3 + vídeos DO Spaces), recuperação de senha com email/telefone opcionais, push notifications |
| 0.3.0 | 2026-03-26 | Troca de armazenamento de vídeos: DigitalOcean Spaces → Cloudflare Stream (HLS, adaptive bitrate, upload direto) |

---

## 1. Visão Geral

O Rota Viva utiliza uma arquitetura **multi-gamificação** na plataforma Funifier:

```
[App PWA — URL única]
        │
        ▼
[Gamificação Central — roteadora]
 • Registro de todos os jogadores (nome, CPF, senha, perfil)
 • Roteamento para gamificação da rota
 • Actionlog de login (tracking de acessos)
 • Custom page rota__c (config das rotas)
 • Sem mecânicas de jogo próprias
        │
        ├──▶ [Colmeia Viva — Rota do Mel — PI]       BD isolado, mecânicas próprias
        └──▶ [Rio em Movimento — Pesca Artesanal — AP] BD isolado, mecânicas próprias
```

Cada gamificação de rota é **completamente isolada** — banco de dados próprio, mecânicas próprias, identidade visual própria. A Central serve apenas como ponto de entrada, autenticação e roteamento.

---

## 2. Gamificações Funifier

### 2.1 Gamificações das Rotas

Duas gamificações criadas na conta dedicada:

| Gamificação | Nome | Perfil vinculado |
|-------------|------|-----------------|
| Rota do Mel | Colmeia Viva | apicultor |
| Pesca Artesanal | Rio em Movimento | pescador |

**Configuração de segurança em cada rota:**
- Criar um **App** na área de Segurança do Studio
- Scope: `read_all, write_all, delete_all, database`
- Gerar **Basic token**: `Basic ` + base64(apiKey + ":")
- Este token é usado **apenas server-side** (dentro das triggers da Central) para criar jogadores na rota — nunca exposto ao cliente

### 2.2 Gamificação Central

Uma gamificação "Central" que funciona como roteador.

**Custom Object `rota__c`** — cadastro das rotas disponíveis:

| Campo | Tipo | Visibilidade | Descrição |
|-------|------|-------------|-----------|
| `_id` | String | Pública | Identificador da rota (ex: `mel`, `pesca`) |
| `title` | String | Pública | Nome da rota (ex: "Colmeia Viva") |
| `image` | String | Pública | URL da imagem/ícone da rota |
| `intro` | String | Pública | Texto de introdução da rota |
| `profile` | String | Pública | Perfil vinculado: `apicultor` ou `pescador` |
| `api_key` | String | Pública | API Key da gamificação da rota (retornada ao cliente no login) |
| `basic_token` | String | **Privada — server-side only** | Token de integração — nunca exposto ao cliente (ver seção 3) |

**Ação `login`** — registrada como actionlog a cada login bem-sucedido.

**Jogadores na Central:**
- `_id` = CPF sanitizado (ver seção 5)
- `extra.profile` = `apicultor` ou `pescador`
- `extra.name` = nome completo
- `extra.email` = email (opcional)
- `extra.phone` = telefone (opcional)
- Senha BCrypt (gerenciada pela trigger de signup)

---

## 3. Segurança do `basic_token`

O `basic_token` armazenado na `rota__c` dá acesso completo à gamificação da rota. Ele é necessário server-side (nas triggers) mas **nunca deve ser exposto ao cliente**.

### Estratégia: Find com `$project`

Criar um **PreparedAggregate** (Find) na Central chamado `rota_info` que consulta `rota__c` com projeção que exclui `basic_token`:

```json
// Find: rota_info
// Collection: rota__c
[
  { "$project": {
      "_id": 1,
      "title": 1,
      "image": 1,
      "intro": 1,
      "profile": 1,
      "api_key": 1
      // basic_token: excluído intencionalmente
  }}
]
```

**Uso:**
- **Endpoint público de listagem de rotas** → usa `GET /v3/find/rota_info` — retorna apenas campos seguros
- **Triggers internas** → acessam `rota__c` diretamente via `database` (acesso server-side, não exposto)

Dessa forma, mesmo que alguém com token público acesse o Find, nunca terá acesso ao `basic_token`.

---

## 4. Stack Técnica

| Camada | Tecnologia |
|--------|-----------|
| Backend | Funifier Platform (API REST, triggers, schedulers, public endpoints) |
| Frontend | PWA offline-first — AngularJS + HTML/CSS |
| Hospedagem PWA | Netlify |
| Armazenamento de fotos | Funifier Upload (S3 nativo) |
| Armazenamento de vídeos | Cloudflare Stream (ver seção 10) |
| Repo | github.com/funifieragentdev01/rota-viva |
| Domínio | A definir |

---

## 5. Sanitização de CPF

O CPF é usado como `_id` / `username` do jogador. Antes de qualquer requisição, o frontend sanitiza:

```javascript
function sanitizeCPF(cpf) {
    // 1. Remover caracteres especiais (pontos, traços, espaços)
    var digits = cpf.replace(/\D/g, '');
    // 2. Converter para número (remove zeros à esquerda)
    var num = Number(digits);
    // 3. Converter de volta para string
    return String(num);
}

// Exemplos:
// "012.345.678-90" → "12345678990" (sem zero à esquerda)
// "123.456.789-00" → "12345678900"
// "001.234.567-89" → "123456789"
```

**Regra:** Aplicar **sempre** que o CPF for usado — no cadastro, login, busca e recuperação de senha.

---

## 6. Fluxo de Cadastro

```
[Usuário]                    [PWA Frontend]              [Central]                    [Rota]
    │                              │                         │                          │
    │  Preenche: nome, CPF,        │                         │                          │
    │  senha, perfil               │                         │                          │
    │  (email/telefone opcionais)  │                         │                          │
    │─────────────────────────────▶│                         │                          │
    │                              │  sanitizeCPF(cpf)       │                          │
    │                              │  POST signup__c         │                          │
    │                              │  (Basic token público)  │                          │
    │                              │────────────────────────▶│                          │
    │                              │                         │  Trigger before_update:  │
    │                              │                         │  1. Validar obrigatórios │
    │                              │                         │  2. Checar duplicidade   │
    │                              │                         │  3. BCrypt na senha      │
    │                              │                         │  4. Criar player Central │
    │                              │                         │     (_id = CPF sanitiz.) │
    │                              │                         │  5. Buscar rota__c pelo  │
    │                              │                         │     perfil (server-side) │
    │                              │                         │  6. POST /v3/player na   │
    │                              │                         │     rota (Basic token)   │
    │                              │                         │────────────────────────▶ │
    │                              │                         │◀────────────────────────│ Player criado
    │                              │                         │  7. Remover dados        │
    │                              │                         │     sensíveis do signup  │
    │                              │◀────────────────────────│                          │
    │  Sucesso → redireciona       │                         │                          │
    │  para tela de login          │                         │                          │
    │◀─────────────────────────────│                         │                          │
```

**Dados enviados ao `signup__c`:**
```json
{
    "_id": "12345678900",
    "name": "João da Silva",
    "password": "senha123",
    "profile": "apicultor",
    "email": "joao@email.com",
    "phone": "86999991234"
}
```

**Player criado na Central pela trigger:**
```json
{
    "_id": "12345678900",
    "name": "João da Silva",
    "password": "$2a$10$...",
    "extra": {
        "name": "João da Silva",
        "profile": "apicultor",
        "email": "joao@email.com",
        "phone": "86999991234"
    }
}
```

**Player criado na Rota (POST /v3/player com Basic token — server-side):**
```json
{
    "_id": "12345678900",
    "name": "João da Silva",
    "extra": {
        "name": "João da Silva",
        "profile": "apicultor"
    }
}
```

### Tratamento de falha no cadastro (rollback parcial)

O cadastro ocorre em duas etapas: criação na Central (passo 4) e criação na Rota (passo 6). Se o passo 6 falhar, o jogador existe na Central mas não na Rota — estado inconsistente.

**Estratégia de recuperação:**

```
Passo 6 falha
        │
        ▼
Trigger tenta novamente (retry 1x imediato)
        │
   ┌────┴────────────┐
   │                 │
Sucesso         Falha novamente
   │                 │
   ▼                 ▼
Continua    Marcar extra.sync_status = "pending_route"
            Retornar sucesso ao usuário (cadastro da Central OK)
                     │
                     ▼
            No próximo login: trigger detecta sync_status = "pending_route"
            e refaz a criação na Rota antes de continuar
```

Isso garante que o usuário não fica bloqueado — ele consegue fazer login e a sincronização é completada de forma transparente.

---

## 7. Fluxo de Login

```
[Usuário]                    [PWA Frontend]              [Central - Endpoint Público]  [Rota]
    │                              │                         │                          │
    │  Informa: CPF, senha         │                         │                          │
    │─────────────────────────────▶│                         │                          │
    │                              │  sanitizeCPF(cpf)       │                          │
    │                              │  POST /v3/pub/{key}/    │                          │
    │                              │  login                  │                          │
    │                              │────────────────────────▶│                          │
    │                              │                         │  1. Buscar player pelo   │
    │                              │                         │     CPF na Central       │
    │                              │                         │  2. Ler extra.profile    │
    │                              │                         │  3. Buscar rota__c pelo  │
    │                              │                         │     profile (server-side)│
    │                              │                         │  4. Checar sync_status   │
    │                              │                         │     (ver seção 6)        │
    │                              │                         │  5. POST /v3/auth com    │
    │                              │                         │     login=CPF, pwd=senha │
    │                              │                         │     usando apiKey da rota│
    │                              │                         │────────────────────────▶ │
    │                              │                         │◀────────────────────────│ JWT
    │                              │                         │  6. Registrar actionlog  │
    │                              │                         │     "login" na Central   │
    │                              │                         │  7. Retornar resposta    │
    │                              │◀────────────────────────│  (sem basic_token)       │
    │  Recebe: JWT, api_key,       │                         │                          │
    │  dados públicos da rota      │                         │                          │
    │◀─────────────────────────────│                         │                          │
```

**Resposta do endpoint público (campos retornados ao cliente):**
```json
{
    "success": true,
    "token": "Bearer eyJhbGciOi...",
    "token_expires_at": "2026-04-02T10:30:00Z",
    "api_key": "69ab...",
    "route": {
        "title": "Colmeia Viva",
        "image": "https://...",
        "profile": "apicultor"
    },
    "player": {
        "_id": "12345678900",
        "name": "João da Silva"
    }
}
```

**O frontend armazena localmente (localStorage):**
- `token` — JWT da rota
- `token_expires_at` — timestamp de expiração (ISO 8601)
- `api_key` — da rota, para chamadas diretas
- `route` — dados visuais
- `player` — dados básicos do usuário

**A partir do login, o frontend trabalha 100% com a gamificação da rota.** Nenhuma chamada à Central é necessária durante a sessão.

---

## 8. Tratamento de Token Expirado (Online e Offline)

### Comportamento geral

O frontend armazena `token_expires_at` junto com o JWT. Antes de qualquer requisição autenticada, verificar se o token ainda é válido:

```javascript
function isTokenExpired() {
    var expiresAt = localStorage.getItem('token_expires_at');
    if (!expiresAt) return true;
    return new Date(expiresAt).getTime() < Date.now();
}
```

### Cenário: Online com token expirado

```
Requisição falha com 401
    │
    ▼
Limpar token e dados de sessão do localStorage
    │
    ▼
Redirecionar para tela de Login com mensagem "Sua sessão expirou"
```

### Cenário: Offline com token expirado

O app não deve bloquear o participante pelo fato de estar offline — ele pode não ter conectividade para renovar o token.

**Regra:** enquanto offline, o app continua funcionando normalmente para todas as funcionalidades offline (trilhas em cache, diário, evidências em fila). O token expirado só é verificado no momento de sync.

```
Modo offline + token expirado
    │
    ▼
App continua funcionando (leitura de cache, ações em fila local)
    │
    ▼
Conectividade restaurada
    │
    ▼
Tentar sync da fila de ações
    │
Falha com 401 (token expirado confirmado pelo servidor)
    │
    ▼
Pausar sync — redirecionar para Login
    │
    ▼
Após login bem-sucedido (novo token)
    │
    ▼
Retomar sync da fila com novo token
```

**Fila de ações offline:** cada item da fila armazena os dados da ação mas **não** o token — o token usado no sync é sempre o token válido no momento da sincronização.

---

## 9. Recuperação de Senha

### Contexto do projeto

No Rota Viva, apenas `nome`, `CPF`, `senha` e `perfil` são obrigatórios no cadastro. `email` e `telefone` são **opcionais**. Isso cria três cenários de recuperação:

### Cenário 1 — Participante tem email cadastrado

Segue o padrão nativo Funifier documentado em `patterns.md`:

```
Passo 1: GET /v3/player/password/change?player={CPF_sanitizado}
         Authorization: Basic {token}
         → Funifier envia código de recuperação por email

Passo 2: PUT /v3/player/password?player={CPF_sanitizado}&code={codigo}&new_password={nova}
         Authorization: Basic {token}
```

### Cenário 2 — Participante tem telefone cadastrado (sem email)

O código de recuperação é gerado server-side e enviado via SMS ou WhatsApp por um serviço externo (ex: Twilio, Z-API, ou outro que o projeto já utilize):

```
Passo 1: Usuário informa CPF na tela "Esqueci minha senha"
Passo 2: Endpoint público busca player na Central pelo CPF
Passo 3: Verifica se extra.phone existe
Passo 4: Gera código temporário (6 dígitos, expira em 15 min) e armazena em custom collection phone_reset__c
Passo 5: Envia código via WhatsApp/SMS para o telefone cadastrado
Passo 6: Usuário informa código + nova senha
Passo 7: Trigger valida código, aplica BCrypt na nova senha, remove o registro de phone_reset__c
```

### Cenário 3 — Participante não tem email nem telefone cadastrado

```
Tela "Esqueci minha senha" detecta que o participante
não tem email nem telefone cadastrado
        │
        ▼
Exibir mensagem:
"Para recuperar sua senha, entre em contato com nossa central:
📞 [número do projeto — a definir pela FADEX]
Tenha em mãos seu CPF."
```

A central (operada pela FADEX ou pelo suporte do projeto) verifica a identidade do participante e realiza o reset via trigger server-side usando o padrão `change_password__c` documentado em `patterns.md`.

### Formulário de cadastro — campo adicional recomendado

Para maximizar a cobertura de recuperação automática, adicionar ao formulário de cadastro:

```
Nome *
CPF *
Senha *
Perfil (Apicultor / Pescador) *
─────────────────────────────
Email          (opcional — "para recuperar sua senha")
Telefone/WhatsApp  (opcional — "para recuperar sua senha")
```

Texto de apoio: *"Informe pelo menos um contato para poder recuperar sua senha caso esqueça."*

---

## 10. Armazenamento de Mídia

### Fotos (evidências, perfil, Galeria de Saberes)

Usar o **Upload nativo do Funifier** que envia arquivos diretamente para S3.

```
Frontend → POST /v3/upload (multipart/form-data)
         → Funifier envia para S3
         → Retorna URL pública do arquivo
         → Frontend armazena URL no campo do documento
```

**Modo offline:** foto é armazenada localmente (IndexedDB ou File API) e enviada ao reconectar. A ação associada (evidência, publicação na Galeria) fica na fila de sync até o upload ser concluído.

### Vídeos (Missão de Vídeo, Galeria de Saberes)

Vídeos de até 60 segundos gravados em smartphone. Usar **Cloudflare Stream**.

**Por que Cloudflare Stream:**
- Transcodificação automática para HLS com adaptive bitrate — fundamental para participantes com conexão 2G/3G instável
- Upload direto do browser via TUS protocol (sem proxy Funifier) — menor latência e menos dependências
- Player nativo embutível com iframe ou SDK JS — zero esforço de integração no PWA
- Custo escalonável (~$5/1000 min armazenado + $1/1000 min entregue) — adequado ao volume do projeto
- Sem gestão de CDN, buckets ou permissões de armazenamento — infraestrutura totalmente gerenciada

**Fluxo de upload de vídeo:**

```
Frontend captura vídeo (≤ 60s)
        │
        ▼
Compressão leve no browser (MediaRecorder API com bitrate reduzido)
        │
        ▼
Solicitação de upload: POST /client_v4/accounts/{id}/stream/direct_upload
(chamada server-side via trigger Funifier para não expor API token)
        │
        ▼
Retorna URL de upload one-time (TUS) + videoId
        │
        ▼
Frontend faz upload direto para Cloudflare via TUS (resumível)
        │
        ▼
videoId armazenado no documento da missão/galeria na gamificação
        │
        ▼
Exibição via <stream> tag ou iframe embed (player Cloudflare nativo)
```

**Modo offline:** vídeo armazenado localmente (IndexedDB via File API). Upload e sync acontecem ao reconectar via TUS (protocolo de upload resumível — retoma de onde parou). A missão fica com status "pendente de sync" até o upload completar e o Cloudflare Stream confirmar transcodificação.

---

## 11. Push Notifications

Usando **Web Push API** nativa do navegador, configurada via Funifier Notification Service.

### Setup

1. Gerar par de chaves VAPID (uma vez, por gamificação de rota)
2. Registrar Service Worker no PWA com suporte a push
3. No onboarding, solicitar permissão de notificação ao usuário (opt-in explícito)
4. Armazenar `PushSubscription` do browser na gamificação da rota via API Funifier

### Tipos de notificação e gatilhos

| Tipo | Gatilho | Configurado em |
|------|---------|---------------|
| Missão do dia | Scheduler diário (horário a definir) | Funifier Scheduler |
| Reengajamento (3 dias inativo) | Trigger automática após 3 dias sem actionlog | Funifier Trigger |
| Missão Relâmpago disponível | Trigger ao ativar o evento | Funifier Trigger |
| Cerimônia campeão semanal | Scheduler semanal (segunda-feira) | Funifier Scheduler |
| Nível atingido | Trigger pós-evento de level-up | Funifier Trigger |
| Devolutiva "Voz que Chegou" | Ação manual do admin | Funifier Studio |
| Desafio da Autoridade lançado | Ação manual do admin | Funifier Studio |

### Limitação iOS

Web Push só é suportado no iOS a partir do **iOS 16.4** (Safari). Para usuários com iOS mais antigo, notificações push não funcionam. Solução: comunicar no onboarding e usar notificações in-app como fallback.

---

## 12. Segurança — Resumo

| Aspecto | Implementação |
|---------|--------------|
| Senha | BCrypt na trigger — nunca trafega em texto para o banco |
| Token público (signup/login) | Basic token com scope mínimo (role `public`, escrita apenas em `signup__c`) |
| Token de integração Central→Rota | Basic token com scope completo — server-side only, nunca retornado ao cliente |
| Proteção do `basic_token` | PreparedAggregate `rota_info` com `$project` que exclui o campo (seção 3) |
| JWT do jogador | Emitido pela gamificação da rota; expiração de 7 dias |
| Expiração de token | `token_expires_at` armazenado junto com JWT; verificado antes de cada requisição |
| CPF | Sanitizado antes de qualquer uso; armazenado como número-string sem formatação |
| Dados sensíveis no signup__c | Removidos pela trigger após processamento |
| Comunicação | HTTPS em todos os endpoints |

---

## 13. Offline-First — Estratégia Completa

| Recurso | Armazenamento | Sync |
|---------|--------------|------|
| Assets do PWA (HTML/CSS/JS) | Service Worker Cache API | Atualizado a cada deploy |
| Conteúdo de trilhas e missões | Service Worker Cache API | Atualizado quando online |
| Fotos de perfil e Galeria (cache) | Service Worker Cache API | Carrega do cache, atualiza quando online |
| Respostas de quiz | IndexedDB (fila de ações) | Sync ao reconectar |
| Submissão de evidência (foto) | IndexedDB + File/Blob local | Upload + sync ao reconectar |
| Upload de vídeo | IndexedDB + File/Blob local | Upload + sync ao reconectar |
| Registros do Diário do Produtor | IndexedDB (fila de ações) | Sync ao reconectar |
| Respostas de escuta ativa | IndexedDB (fila de ações) | Sync ao reconectar |
| JWT e dados de sessão | localStorage | Não sincronizado — local only |
| Rankings e Placar Nacional | Service Worker Cache (read-only) | Exibe "última atualização: X" |

**Política de conflito:** append-only para actionlogs (sem conflito possível). Last-write-wins para dados de perfil do jogador.

---

## 14. Expansão para Novas Rotas

Para adicionar uma nova rota (ex: Rota do Açaí):

1. Criar nova gamificação no Funifier Studio
2. Criar App com Basic token
3. Cadastrar nova entrada na `rota__c` da Central com `api_key`, `basic_token` e `profile`
4. Criar PreparedAggregate `rota_info` atualizado (ou o `$project` já exclui `basic_token` automaticamente)
5. Adicionar novo perfil no formulário de cadastro do PWA
6. **Zero alteração** na Central, nas triggers, ou nos endpoints públicos

A arquitetura é escalável para 13+ rotas sem interdependência.

---

*Documento técnico derivado do PRD v0.2.0 — seção 14.*
