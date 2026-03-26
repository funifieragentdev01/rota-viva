# Arquitetura Técnica — Rota Viva

**Versão:** 0.1.0
**Data:** 2026-03-26
**Autores:** Ricardo Lopes Costa + Jarvis

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

Duas gamificações criadas na conta "Project Management" (ou conta dedicada):

| Gamificação | Nome | Perfil vinculado |
|-------------|------|-----------------|
| Rota do Mel | Colmeia Viva | apicultor |
| Pesca Artesanal | Rio em Movimento | pescador |

**Configuração de segurança em cada rota:**
- Criar um **App** na área de Segurança do Studio
- Scope: `read_all, write_all, delete_all, database`
- Gerar **Basic token**: `Basic ` + base64(apiKey + ":")
- Este token é usado pela Central para criar jogadores e autenticar na rota

### 2.2 Gamificação Central

Uma gamificação "Central" que funciona como roteador:

**Custom Object `rota__c`** — cadastro das rotas disponíveis:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `_id` | String | Identificador da rota (ex: `mel`, `pesca`) |
| `title` | String | Nome da rota (ex: "Colmeia Viva") |
| `image` | String | URL da imagem/ícone da rota |
| `intro` | String | Texto de introdução da rota |
| `profile` | String | Perfil vinculado: `apicultor` ou `pescador` |
| `api_key` | String | API Key da gamificação da rota |
| `basic_token` | String | Basic token de integração da rota |

**Ação `login`** — registrada como actionlog a cada login bem-sucedido, para tracking na Central.

**Jogadores na Central** — contêm:
- `_id` = CPF sanitizado (ver seção 4)
- `extra.profile` = `apicultor` ou `pescador`
- `extra.name` = nome completo
- Senha BCrypt (gerenciada pela trigger de signup)

---

## 3. Stack Técnica

| Camada | Tecnologia |
|--------|-----------|
| Backend | Funifier Platform (API REST, triggers, schedulers, public endpoints) |
| Frontend | PWA offline-first (HTML/CSS/JS, AngularJS ou vanilla) |
| Hospedagem | Netlify |
| Repo | github.com/funifieragentdev01/rota-viva |
| Domínio | A definir |

---

## 4. Sanitização de CPF

O CPF é usado como `_id` / `username` do jogador. Antes de qualquer requisição (cadastro ou login), o frontend deve sanitizar:

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

**Por que:**
- Remove inconsistências de formatação (com/sem pontos e traços)
- Garante unicidade — o mesmo CPF sempre gera o mesmo ID independente de como foi digitado
- Converte para número e volta para string para remover zeros iniciais, criando um ID seguro e consistente

**Regra:** Esta sanitização deve ser aplicada **sempre** que o CPF for usado — no cadastro, no login, e em qualquer busca por jogador.

---

## 5. Fluxo de Cadastro

```
[Usuário]                    [PWA Frontend]              [Central]                    [Rota]
    │                              │                         │                          │
    │  Preenche: nome, CPF,        │                         │                          │
    │  senha, perfil               │                         │                          │
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
    │                              │                         │     perfil escolhido     │
    │                              │                         │  6. POST /v3/player na   │
    │                              │                         │     gamificação da rota   │
    │                              │                         │     usando Basic token    │
    │                              │                         │────────────────────────▶ │
    │                              │                         │  7. Remover dados        │◀─ Player criado na rota
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
    "profile": "apicultor"
}
```

**Trigger cria player na Central:**
```json
{
    "_id": "12345678900",
    "name": "João da Silva",
    "password": "$2a$10$...",
    "extra": {
        "name": "João da Silva",
        "profile": "apicultor"
    }
}
```

**Trigger cria player na rota (POST /v3/player com Basic token da rota):**
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

---

## 6. Fluxo de Login

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
    │                              │                         │     profile              │
    │                              │                         │  4. POST /v3/auth com    │
    │                              │                         │     login=CPF, pwd=senha │
    │                              │                         │     usando apiKey da rota│
    │                              │                         │────────────────────────▶ │
    │                              │                         │◀────────────────────────│ JWT
    │                              │                         │  5. Registrar actionlog  │
    │                              │                         │     "login" na Central   │
    │                              │                         │  6. Retornar resposta    │
    │                              │◀────────────────────────│                          │
    │  Recebe: JWT da rota,        │                         │                          │
    │  apiKey, dados da rota       │                         │                          │
    │◀─────────────────────────────│                         │                          │
    │                              │                         │                          │
    │  A partir daqui, TODAS as    │                         │                          │
    │  chamadas usam apiKey+JWT    │                         │                          │
    │  da rota diretamente         │                         │                          │
```

**Requisição do frontend:**
```json
POST /v3/pub/{centralApiKey}/login
{
    "cpf": "12345678900",
    "password": "senha123"
}
```

**Resposta do endpoint público:**
```json
{
    "success": true,
    "token": "Bearer eyJhbGciOi...",
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

**O frontend armazena localmente:**
- `token` (JWT da rota) — para autenticar chamadas
- `api_key` (da rota) — para direcionar chamadas à gamificação correta
- `route` — dados visuais (título, imagem) para personalizar a UI

**A partir do login, o frontend trabalha 100% com a gamificação da rota.** Nenhuma chamada adicional à Central é necessária durante a sessão.

---

## 7. Segurança

| Aspecto | Implementação |
|---------|--------------|
| Senha | BCrypt na trigger (nunca trafega em texto para o banco) |
| Token público (signup/login) | Basic token com scope mínimo (role `public`) |
| Token de integração (Central→Rota) | Basic token com scope completo, armazenado na `rota__c` |
| JWT do jogador | Emitido pela gamificação da rota; expiração configurável |
| CPF | Sanitizado antes de qualquer uso; armazenado como número-string sem formatação |
| Dados sensíveis no signup__c | Removidos pela trigger após processamento |

---

## 8. Offline-First

| Aspecto | Estratégia |
|---------|-----------|
| Service Worker | Cache de assets (HTML/CSS/JS) + cache de dados de trilhas e missões |
| Ações offline | Fila local de ações (quiz, evidências, diário, escuta ativa) — sincroniza ao reconectar |
| Login offline | JWT armazenado localmente; funciona até expirar |
| Rankings | Requerem conexão — mostrar "última atualização" com dados em cache |
| Sync de conflitos | Last-write-wins para dados do jogador; append-only para actionlogs |

---

## 9. Expansão para novas rotas

Para adicionar uma nova rota (ex: Rota do Açaí):

1. Criar nova gamificação no Funifier Studio
2. Criar App com Basic token
3. Cadastrar nova entrada na `rota__c` da Central com apiKey, token e perfil
4. Adicionar novo perfil no formulário de cadastro do PWA
5. **Zero alteração** na Central, nas triggers, ou nos endpoints públicos

A arquitetura é escalável para 13+ rotas sem interdependência.

---

*Documento técnico derivado do PRD v0.2.0 — seção 14.*
