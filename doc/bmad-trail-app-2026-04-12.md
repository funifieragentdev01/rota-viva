# Rota Viva — Backlog de Implementação
**Criado:** 2026-04-12

Itens pendentes de implementação no app, em ordem de discussão (prioridade a definir).

---

## 1. Termos e Política na Gamificação Central

**O que:** Mover a aceitação de Termos de Uso e Política de Privacidade para dentro da gamificação (ex.: challenge ou ação ao aceitar), em vez de ser apenas um modal isolado na tela de login.

**Por que:** Registrar a aceitação como um evento rastreável na plataforma Funifier, vinculado ao player.

**Referência no roadmap anterior:** item 1.7 do `bmad-review-2026-04-11.md`

---

## 2. Baú (chest) — Visual e Fluxo Completo

**O que:** Implementar o overlay visual completo da lição do tipo `chest` na trilha.

**Fluxo esperado:**
1. Usuário toca na bolinha do baú na trilha
2. Popup padrão abre (título + botão "Desafio")
3. Entra na tela de coleta de evidência (foto / vídeo / localização)
4. Ao enviar: animação de baú abrindo + destaque "+3 coins!"
5. Opção: "Publicar no feed da galeria"
6. Rodapé social: "X produtores já fizeram isso" + 3 posts de outros usuários (CD5 — influência social)
7. Dispara `logAction('complete_lesson', { type: 'chest', score: 1 })`

**Recompensa já configurada no Funifier:** challenge `licao_de_bau` → +10 XP + 3 coins.

**O que falta implementar:**
- Overlay de abertura do baú (animação)
- Toast "+3 coins" em destaque
- Rodapé social com posts de outros usuários
- Trigger do challenge após completar

---

## 3. Topo da Galeria Estilo Stories

**O que:** Carrossel horizontal no topo do feed da galeria, estilo Instagram Stories, mostrando avatares dos produtores/entidades em destaque.

**Algoritmo de destaque (a definir pesos exatos):**
- **Ministério (MIDR/FADEX):** sempre aparece primeiro, peso máximo
- **Cooperativas e associações:** peso alto — aparecem logo após o ministério
- **Produtores ativos com muitos seguidores/likes/comentários:** peso médio
- **Produtores novos ou sem engajamento:** peso baixo ou ausentes do carrossel

**Alcance de uma postagem:**
- O algoritmo de peso define para quantas pessoas o post é exibido no feed
- Entidade com peso alto → post aparece para todos os usuários
- Produtor novo → post aparece apenas para seguidores diretos ou região

**O que implementar:**
- Componente Stories no topo do feed (scroll horizontal, avatares circulares)
- API de ranking de usuários baseada nos pesos acima
- Lógica de filtragem de feed por relevância (não apenas cronológica)

---

## 4. Alterar Senha (logado)

**O que:** Fluxo simples para o usuário alterar a própria senha dentro do app, já autenticado.

**Onde:** Perfil → Conta → "Alterar senha"

**Fluxo:**
```
Modal: Senha atual + Nova senha + Confirmar nova senha
→ PUT /v3/player/password?player=me&old_password=X&new_password=Y
```

**Endpoint:** já existe no Funifier. Sem dependência de email.

---

## 5. Entrar Sem Senha — OTP via SMS ou WhatsApp

**O que:** Permitir login e recuperação de senha via código OTP enviado por SMS ou WhatsApp, sem depender de email (a maioria dos produtores não tem email cadastrado).

**Fluxo de recuperação de senha (área pública):**
```
Tela 1: Informe seu CPF
  → Verifica se tem email:
    COM email → código enviado por email → campo código + nova senha
    SEM email → OTP por WhatsApp/SMS → campo código + nova senha
```

**Fluxo de login sem senha (futuro):**
```
Tela login → "Entrar com código" → informa CPF/telefone
→ Recebe OTP → digita código → autenticado
```

**Arquitetura planejada (OTP via WhatsApp/n8n):**
1. App → envia `phone` para webhook n8n (via token admin)
2. n8n → gera OTP 6 dígitos, salva em `POST /v3/database/otp_reset__c` com TTL 10 min, envia via WhatsApp API
3. App → usuário insere OTP
4. App → valida via `POST /v3/database/otp_reset__c?q=phone:'X'&code:'Y'` (token admin)
5. Se válido → n8n usa token admin para `PUT /v3/player/password` e invalida OTP

**Dependências:** WhatsApp Business API (ou Twilio) + n8n (já existe no projeto).

**MVP sem OTP (curto prazo):** usuário sem email → botão "Falar com suporte" → WhatsApp do MIDR/FADEX.

---

## 6. Loja de Dicas

**O que:** Produtor gasta coins para comprar dicas de campo fornecidas por outros produtores experientes ou pelo MIDR.

**Fluxo:**
1. Usuário acessa a loja (aba futura ou dentro do perfil)
2. Vê itens disponíveis — cada um mostra custo em coins e preview da dica
3. Clica "Resgatar" → Funifier debita coins e libera conteúdo
4. Conteúdo: vídeo, texto ou link de boas práticas

**API Funifier:**
```
POST /v3/virtualgoods/catalog   → cria catálogo "Loja de Dicas"
POST /v3/virtualgoods/item      → cadastra cada dica com custo em coins
POST /v3/virtualgoods/item/{id}/redeem → usuário resgata
```

**Primeira dica a cadastrar:** vídeo `https://www.instagram.com/reels/DWK7V3PkzB3` (custo: 10 coins)

**Depende de:** Fase B completa (baú gerando coins, usuários acumulando saldo).

---

## 7. PWA — Progressive Web App

**O que:** Transformar o app em PWA para que o usuário possa instalar no celular como app nativo, sem precisar da Play Store.

**O que implementar:**
- `manifest.json` com nome, ícones, cores e `display: standalone`
- Service Worker para cache de assets estáticos (HTML, CSS, JS, imagens)
- Prompt de instalação ("Adicionar à tela inicial") no primeiro acesso
- Ícone do app na tela inicial (192x192 e 512x512 — usar logo Rota Viva)

**Notificações push:**
- Registrar Service Worker com `PushManager`
- Backend de push: Firebase Cloud Messaging (FCM) ou similar
- Casos de uso: "Você tem uma nova lição disponível", "Sua sequência está em risco", "Novo post na galeria"
- Requer opt-in explícito do usuário (permissão de notificação)

**Compatibilidade:** funciona em Android (Chrome). iOS tem suporte parcial (sem push até iOS 16.4+).


