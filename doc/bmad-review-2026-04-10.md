# BMAD Review — 2026-04-10 — Rota Viva: Planejamento de Ajustes Finos

**Data:** 2026-04-10
**Participantes:** Ricardo Lopes Costa + Party Mode (Sally/UX, Yu-kai Chou/Gamificação, Mr.Beast/Viral, Mary/Produto, Tec/Funifier, Victor/Inovação)
**Arquivo de saída:** `/jarvis/rota-viva/doc/bmad-review-2026-04-10.md`

---

## Contexto — O que já está bem

Antes de detalhar os ajustes, o time validou as seguintes decisões como acertadas:

- **3 botões no menu (Trilha, Galeria, Perfil):** simplificação correta. Menos é mais para o público de baixa literacia digital.
- **Trilha integrada:** colocar aulas, quizzes, escuta ativa (Essay) e coleta de evidências (DIY) em um único fluxo contínuo foi a decisão certa. O usuário não precisa saber que está "respondendo uma pesquisa do Ministério".
- **Galeria estilo Instagram:** reduz curva de aprendizado. O feed já é familiar.
- **Identidade visual do governo:** o escudo do MIDR na landing transmite credibilidade institucional — ativo real para o público desconfiado.
- **UX do Duolingo para a trilha:** o caminho em S com bolinhas e progresso visual é o padrão mais testado para engajamento em aprendizagem mobile.
- **Influência social contextualizada na trilha:** mostrar posts de outros produtores no momento das atividades DIY é um uso sofisticado de CD5 (Social Influence) do Octalysis.
- **Conteúdo:** o time julgou que o conteúdo das 7 módulos cadastrados para ambas as rotas está muito bom.

**Visão estratégica confirmada:** o app deve evoluir para se tornar o **"Passaporte Digital do Produtor Rural Brasileiro"** — não apenas um app de aprendizagem gamificada, mas um serviço essencial que conecta o produtor informal ao Estado. Nenhum app no governo federal faz isso hoje de forma acessível para este público.

---

## Inventário de Personagens Existentes

### Mel — `/app/img/characters/mel/`

#### Front (personagens de frente, uso em landing/login)
| Arquivo | Descrição |
|---------|-----------|
| `front/abelha.png` | Abelha mascote de frente, sem objetos — uso: onboarding, loading |
| `front/apicultor.png` | Apicultor adulto de frente — uso: landing, cadastro |
| `front/filho-apicultor.png` | Filho do apicultor de frente — uso: landing, seção jovem multiplicador |

#### Trail (imagens da trilha)
| # | Arquivo | Descrição | Uso sugerido |
|---|---------|-----------|-------------|
| 1 | `trail/1.png` | Apicultor homem negro, uniforme completo, smoker na mão, sentado em toco | Início de módulo, estado neutro/pronto |
| 2 | `trail/2.png` | Abelha mascote pequena voando, simpática | Módulo ativo, feedback leve, separador |
| 3 | `trail/3.png` | Menino afro, fantasia abelha, segurando colher de mel, sentado em toco | Neutro/ativo, quiz |
| 4 | `trail/4.png` | Mulher apicultora, uniforme, oferecendo dinheiro | Recompensa — XP ganho, baú aberto |
| 5 | `trail/5.png` | Pote de mel com colher (objeto, sem personagem) | Decorativo, separador de módulo |
| 6 | `trail/6.png` | Menino fantasia abelha, deitado lendo livro sobre abelhas | Lição de vídeo/leitura em andamento |
| 7 | `trail/7.png` | Homem apicultor negro, recebendo dinheiro | Recompensa — XP, Gotas de Mel |
| 8 | `trail/8.png` | Menina cacheada, fantasia abelha, deitada lendo livro | Lição de vídeo/leitura em andamento |
| 9 | `trail/9.png` | Apicultor homem, sentado em toco, lendo documento CAF | Perfil do produtor, lição sobre políticas |
| 10 | `trail/10.png` | Abelha com óculos, lendo "Livro sobre Abelhas" | Lição de conteúdo, módulo de conhecimento |
| 11 | `trail/11.png` | Menina fantasia abelha, deitada lendo livro | Lição de vídeo/leitura (variação escura) |
| 12 | `trail/12.png` | Pote de mel com tampa (objeto) | Decorativo |
| 13 | `trail/13.png` | Menina cacheada, fantasia abelha, segurando colher de mel | Neutra/ativa |
| 14 | `trail/14.png` | Menino afro, fantasia abelha, carregando abelha mascote | Companheiro, início de módulo afetivo |
| 15 | `trail/15.png` | Dois apicultores (homem + mulher) segurando certificado CAF juntos | Certificação, conclusão de trilha, CAF no perfil |
| 16 | `trail/16.png` | Abelha mascote com moeda/cristal nas costas | **Cristal/moeda especial** — baú, recompensa surpresa |
| 17 | `trail/17.png` | Menina cacheada, fantasia abelha, segurando troféu dourado | **Vitória/conquista** — trilha completa, nível atingido |
| 18 | `trail/18.png` | Apicultor homem, sentado em toco, usando celular | App/tecnologia, onboarding do app |
| 19 | `trail/19.png` | Menino afro, fantasia abelha, pensativo, com balde azul | Pensamento, dúvida, quiz sem resposta ainda |
| 20 | `trail/20.png` | Apicultor mulher, segurando quadro de favo de mel | Trabalho de campo, lição DIY |
| 21 | `trail/21.png` | Apicultor homem negro, lendo documento CAF (variação de 9) | Documentos, políticas públicas |
| 22 | `trail/22.png` | Menino afro, fantasia abelha, deitado lendo livro | Leitura (variação) |
| 23 | `trail/23.png` | Apicultor mulher, sentada, usando celular | App/tecnologia (variação feminina) |
| 24 | `trail/24.png` | Menina cacheada, fantasia abelha, comendo mel | Recompensa sutil, relaxamento pós-lição |
| 25 | `trail/25.png` | Apicultor homem, segurando quadro de favo (variação de 20) | Trabalho de campo |

---

### Pesca — `/app/img/characters/pesca/`

#### Front (personagens de frente)
| Arquivo | Descrição |
|---------|-----------|
| `front/peixe.png` | Peixe mascote de frente — uso: onboarding, loading |
| `front/pescador.png` | Pescador adulto de frente — uso: landing, cadastro |
| `front/filho-pescador.png` | Filho do pescador de frente — uso: landing, seção jovem multiplicador |

#### Trail (imagens da trilha)
| # | Arquivo | Descrição | Uso sugerido |
|---|---------|-----------|-------------|
| 1 | `trail/1.png` | Pescador homem negro, uniforme azul, sentado com vara de pescar | Início de módulo, estado neutro/pronto |
| 2 | `trail/2.png` | Peixe mascote pequeno azul, simpático | Módulo ativo, feedback leve, separador |
| 3 | `trail/3.png` | Menina azul, sentada com peixe mascote no colo | Companheira, módulo afetivo |
| 4 | `trail/4.png` | Menino deitado lendo "Livro sobre Peixes" | Lição de vídeo/leitura |
| 5 | `trail/5.png` | Pescador homem, lendo documento CAF sentado | Perfil, políticas públicas |
| 6 | `trail/6.png` | Peixe mascote azul com moedas saindo (cofrinho aberto) | **Baú/Cristal** — recompensa |
| 7 | `trail/7.png` | Menino azul, segurando peixe mascote (frente) | Companheiro, início de módulo |
| 8 | `trail/8.png` | Dois pescadores (homem negro + mulher) com cesta de peixes | **Cooperação/comunidade** — lição coletiva |
| 9 | `trail/9.png` | Pescador mulher, vara de pescar + dinheiro | Recompensa |
| 10 | `trail/10.png` | Peixe com óculos lendo livro | Lição de conhecimento |
| 11 | `trail/11.png` | Menino azul, segurando peixe com moedas | Recompensa, Cristais |
| 12 | `trail/12.png` | Menina deitada lendo "Livro sobre Peixes" | Leitura/estudo |
| 13 | `trail/13.png` | Pescador homem negro lendo certificado CAF sentado | Certificação |
| 14 | `trail/14.png` | Peixe mascote como cofrinho com moeda entrando | **Cristal/moeda** — ganho de ponto |
| 15 | `trail/15.png` | Pescador mulher, vara + dinheiro (variação) | Recompensa |
| 16 | `trail/16.png` | Menina azul, segurando peixe (frente, variação) | Companheira |
| 17 | `trail/17.png` | Pescador homem negro, vara + dinheiro | Recompensa |
| 18 | `trail/18.png` | Peixe mascote cofrinho com moedas caindo | **Cristal/moeda especial** — baú |
| 19 | `trail/19.png` | Menino azul, segurando peixe (frente) | Companheiro (variação) |
| 20 | `trail/20.png` | Menina segurando peixe cofrinho rosa | Economia/cristal |
| 21 | `trail/21.png` | Menina azul, segurando peixe com moedas | Recompensa |
| 22 | `trail/22.png` | Pescador mulher, maço de dinheiro | Recompensa grande |
| 23 | `trail/23.png` | Pescador mulher, segurando certificado CAF | Certificação, perfil |
| 24 | `trail/24.png` | Menina azul, segurando troféu dourado | **Vitória/conquista** |
| 25 | `trail/25.png` | Pescador homem negro usando celular | App/tecnologia |
| 26 | `trail/26.png` | Menina azul, troféu dourado (variação) | Vitória |
| 27 | `trail/27.png` | Peixe com óculos lendo livro (variação) | Estudo |
| 28 | `trail/28.png` | Menino sentado com vara de pescar e boia | Neutro/pronto |
| 29 | `trail/29.png` | Menino azul, troféu dourado | Vitória |
| 30 | `trail/30.png` | Pescador homem (vermelho/laranja), segurando dinheiro | Recompensa |
| 31 | `trail/31.png` | Menino azul, troféu (variação) | Vitória |

---

## Personagens a Gerar (Novas Cenas Necessárias)

O inventário atual tem lacunas para alguns estados de tela fundamentais. Abaixo estão as cenas que Ricardo precisa gerar, organizadas por rota:

### Cenas necessárias — Mel

| ID | Cena | Uso no app | Descrição para geração |
|----|------|-----------|------------------------|
| MEL-NEW-01 | **Boas-vindas/aceno** | Onboarding tela 1, pós-login | Abelha mascote acenando com uma asa/mão, expressão feliz e acolhedora. Pose similar ao `trail/2.png` mas com braço levantado em aceno. |
| MEL-NEW-02 | **Erro/ops** | Feedback de quiz errado | Menino ou menina, fantasia de abelha, olhos grandes, expressão de surpresa/tristeza leve (sem ser dramático). Mãos na cabeça ou ombros caídos. |
| MEL-NEW-03 | **Incentivo/vamos lá** | Entre módulos, incentivo de streakl | Apicultor ou menino apontando para frente com expressão animada. Tipo "você consegue, vai!" |
| MEL-NEW-04 | **Pensativo/pergunta** | Personagem especial na trilha (a cada 5 lições) quando o tipo é quiz | Abelha mascote (ou menino fantasia abelha) com balão de interrogação ao lado, dedo no queixo, olhando para cima pensativa. |
| MEL-NEW-05 | **Tirando foto/campo** | Feedback de lição DIY, galeria | Apicultor ou menina no campo, segurando smartphone fazendo foto de um favo ou planta. |
| MEL-NEW-06 | **Streak em risco** | Notificação push, modal de streak | Abelha mascote com expressão preocupada/urgente, com pequena chama ao lado ou relógio. |
| MEL-NEW-07 | **Sonhando/imaginando** | Tela de Loja de Dicas (Cristais) | Menino fantasia abelha deitado olhando para cima com nuvem de pensamento mostrando um pote de mel ou diploma. |
| MEL-NEW-08 | **Baú aberto** | Lição tipo baú na trilha | Apicultor/menino em frente a um baú de madeira aberto com raios de luz saindo, expressão de surpresa feliz. O baú deve ter visual que combine com a identidade (dourado/mel). |

### Cenas necessárias — Pesca

| ID | Cena | Uso no app | Descrição para geração |
|----|------|-----------|------------------------|
| PESCA-NEW-01 | **Boas-vindas/aceno** | Onboarding tela 1, pós-login | Peixe mascote acenando com uma nadadeira, expressão feliz. Pose similar ao `trail/2.png` mas acenando. |
| PESCA-NEW-02 | **Erro/ops** | Feedback de quiz errado | Menino ou menina azul, olhos grandes, expressão de surpresa/tristeza leve. Mãos na cabeça ou ombros caídos. |
| PESCA-NEW-03 | **Incentivo/vamos lá** | Entre módulos, incentivo de streak | Pescador ou menino apontando para frente, expressão animada. |
| PESCA-NEW-04 | **Pensativo/pergunta** | Personagem especial na trilha (quiz a cada 5 lições) | Peixe mascote com balão de interrogação, dedo no queixo (nadadeira no queixo), olhando para cima. |
| PESCA-NEW-05 | **Tirando foto/campo** | Feedback de lição DIY, galeria | Pescador ou menina segurando smartphone fazendo foto de um peixe ou rede. |
| PESCA-NEW-06 | **Streak em risco** | Notificação push, modal de streak | Peixe mascote com expressão preocupada/urgente, com pequena chama ou relógio ao lado. |
| PESCA-NEW-07 | **Sonhando/imaginando** | Tela de Loja de Dicas (Cristais) | Menino azul deitado olhando para cima com nuvem de pensamento mostrando troféu ou barco. |
| PESCA-NEW-08 | **Baú aberto** | Lição tipo baú na trilha | Pescador/menino em frente a baú de madeira aberto com raios de luz, expressão de surpresa feliz. Baú com visual azul/pesca. |

> **Nota de geração:** todas as cenas devem manter o estilo isométrico 3D flat já estabelecido — fundo branco ou transparente, paleta mel (amarelo/dourado/branco) ou pesca (azul/branco), personagens com proporções chibi (cabeça grande). Não misturar estilos entre personagens existentes e novos.

---

## Mapeamento de Personagens por Tela/Contexto (Guia de Uso)

| Contexto | Rota Mel | Rota Pesca |
|----------|---------|------------|
| Landing page — hero | `front/apicultor.png` + `front/abelha.png` | `front/pescador.png` + `front/peixe.png` |
| Landing page — seção jovem | `front/filho-apicultor.png` | `front/filho-pescador.png` |
| Onboarding tela 1 (boas-vindas) | `MEL-NEW-01` (abelha acenando) | `PESCA-NEW-01` (peixe acenando) |
| Onboarding tela 2 (trilha) | `trail/2.png` (abelha voando) | `trail/2.png` (peixe) |
| Onboarding tela 3 (galeria) | `MEL-NEW-05` (tirando foto) | `PESCA-NEW-05` (tirando foto) |
| Onboarding tela 4 (notificações) | `trail/18.png` (celular) | `trail/25.png` (celular) |
| Início de módulo (box superior) | `trail/1.png` ou `trail/3.png` | `trail/1.png` ou `trail/28.png` |
| Personagem na trilha — a cada 5 lições — padrão | Alterna entre: `trail/2.png`, `trail/14.png`, `trail/3.png` | Alterna entre: `trail/2.png`, `trail/7.png`, `trail/3.png` |
| Personagem na trilha — a cada 5 lições — quiz especial | `MEL-NEW-04` (interrogação) | `PESCA-NEW-04` (interrogação) |
| Personagem na trilha — a cada 5 lições — vídeo do feed | `MEL-NEW-05` (câmera) ou `trail/18.png` | `PESCA-NEW-05` (câmera) ou `trail/25.png` |
| Baú (lição especial) | `MEL-NEW-08` (baú aberto) + `trail/16.png` (cristal) | `PESCA-NEW-08` (baú aberto) + `trail/18.png` (cristal) |
| Quiz correto — feedback positivo | `trail/17.png` (troféu) | `trail/24.png` ou `trail/29.png` (troféu) |
| Quiz errado — feedback negativo | `MEL-NEW-02` (ops) | `PESCA-NEW-02` (ops) |
| Lição de vídeo/leitura em andamento | `trail/6.png` ou `trail/8.png` | `trail/4.png` ou `trail/12.png` |
| Lição DIY — pronto para fotografar | `trail/20.png` (campo) | `trail/8.png` (cooperação/campo) |
| Lição Essay — pergunta aberta | `trail/19.png` (pensativo) | `MEL-NEW-04` adaptado |
| Conclusão de módulo | `trail/17.png` (troféu) | `trail/24.png` (troféu) |
| Conclusão de trilha completa | `trail/15.png` (certificado duplo) | `trail/13.png` ou `trail/23.png` (certificado) |
| Nível atingido | `trail/17.png` (troféu) + animação | `trail/24.png` (troféu) + animação |
| Recompensa XP/moeda | `trail/4.png` ou `trail/7.png` | `trail/9.png` ou `trail/17.png` |
| Cristal ganho | `trail/16.png` (abelha com cristal) | `trail/14.png` ou `trail/18.png` (cofrinho) |
| Loja de dicas (Cristais) | `MEL-NEW-07` (sonhando) | `PESCA-NEW-07` (sonhando) |
| Streak em risco | `MEL-NEW-06` (urgência) | `PESCA-NEW-06` (urgência) |
| Incentivo de retorno | `MEL-NEW-03` (apontando/vamos lá) | `PESCA-NEW-03` (apontando/vamos lá) |
| Perfil — CAF/documentos | `trail/9.png` ou `trail/21.png` | `trail/5.png` ou `trail/13.png` |
| Perfil — certificado concluído | `trail/15.png` | `trail/23.png` |

---

## Elementos Especiais da Trilha — Definição Completa

A trilha tem 4 tipos de elementos visuais além das bolinhas padrão:

### 1. Bolinhas (Lições)
Representam cada lição. O ícone dentro da bolinha indica o tipo:

| Tipo | Ícone | O que é | Comportamento |
|------|-------|---------|--------------|
| `video` | `fa-play` | Vídeo educativo | Libera próxima lição após ≥ 90% assistido |
| `quiz` | `fa-star` | Sequência de questões | XP proporcional ao acerto; estrelas 1-3 |
| `diy` | `fa-camera` | Coleta de evidência de campo (foto + texto) | Concede XP + publica na Galeria (opcional) |
| `essay` | `fa-comment` | Pergunta aberta do Ministério (Escuta Ativa) | Concede VOZ points; sem gabarito |

**Estrelas (0–3) abaixo das bolinhas completadas:**
- 3 estrelas = completou sem erros (quiz) ou enviou evidência completa (DIY/Essay)
- 2 estrelas = completou com 1–2 erros ou parcialmente
- 1 estrela = completou com dificuldade / mínimo aceitável
- Usuário pode refazer lições antigas para subir de 1 para 3 estrelas (Completionist Milestone — Yu-kai CD2)
- Nunca mostrar a média de estrelas de outros usuários — evita efeito negativo de comparação

### 2. Baús (Lições Especiais de Cristais)
- São lições do tipo DIY especial, marcadas visualmente como um baú dourado (mel) ou azul (pesca) na trilha
- Ao completar, abrem um overlay de recompensa surpresa com animação (CD7 — Unpredictability)
- Sempre premiam com **Cristais** (nova moeda, ver seção de gamificação)
- Quantidade de Cristais é aleatória dentro de um range configurável (ex: 5–15 Cristais)
- Aparecem máx. 1x por módulo — não em toda bolinha
- Visual: a bolinha do baú tem ícone diferente (`fa-treasure-chest` ou ícone customizado de baú) e borda dourada pulsante
- Personagem usado: `MEL-NEW-08` / `PESCA-NEW-08` (baú aberto) + `trail/16.png` mel ou `trail/18.png` pesca (moedas/cristais)

### 3. Personagens Especiais (a cada 5 lições globais)
Aparecem na inflexão da curva S, no lado oposto da bolinha. Nunca depois de um divisor de módulo.

**Tipos de aparição do personagem especial (a definir no cadastro de cada módulo):**

| Tipo | Descrição | Personagem | O que o app pede |
|------|-----------|-----------|-----------------|
| **Padrão** | Personagem aparece como "mascote de apoio" sem interação | Varia (ver tabela acima) | Nenhuma ação — apenas presença motivacional |
| **Quiz rápido** | Personagem aparece com balão de interrogação; abre quiz de 1 pergunta surpresa | `MEL-NEW-04` / `PESCA-NEW-04` | 1 questão curta, recompensa: +10 XP bônus |
| **Vídeo do feed** | Personagem aparece com câmera; mostra um post em destaque da Galeria da comunidade | `trail/18` mel / `trail/25` pesca | Usuário vê o post e pode curtir — ativa CD5 Social Influence |
| **Eco da Rota (CD7)** | Mensagem surpresa de outro produtor (~20% das aparições) | Mascote simples + balão de fala | Lê a mensagem, clica "Curtir essa mensagem" |
| **Dica de Cristal** | Personagem segurando cristal — convida para a Loja de Dicas | `trail/16` mel / `trail/14-18` pesca | Botão: "Ver dicas disponíveis" ou "Continuar trilha" |

**Regras de seleção do tipo:**
- O tipo de aparição de cada posição de personagem é configurado no cadastro do módulo no Funifier Studio
- Sugestão de distribuição: 50% Padrão, 20% Quiz rápido, 20% Vídeo do feed, 10% Eco da Rota

### 4. Box do Módulo Corrente (Sticky)
- Fica colado abaixo do header, atualiza conforme scroll (IntersectionObserver)
- Mostra: **título do módulo** por padrão
- Ao clicar/tocar no box: expande mostrando a **descrição completa do módulo** + progresso (X de Y lições completas)
- Fecha ao tocar fora ou em um botão "fechar"
- Personagem sugerido para o box expandido: miniatura do personagem correspondente ao módulo (a definir por módulo no Studio)

---

## PRIORIDADE 1 — Landing Page

### Diagnóstico (Sally + Mr.Beast + Victor)

**Problemas identificados:**
- Hero não é mobile-first — texto corrido, botão genérico, sem hook emocional nos primeiros 3 segundos
- Copy institucional ("plataforma de gamificação") não fala com o Job-to-be-Done real do produtor
- Sem prova social visível (número de participantes)
- Sem vídeo de produtor real (o formato que mais converte para este público)
- Não explora o gancho de acesso a programas públicos (CAF, RGP, PRONAF) — a maior motivação real

### Hero Mobile-First (proposta Sally)

```
[Logo Gov pequeno + MIDR — topo, centralizado]
[Foto ou ilustração full-bleed do personagem em campo]
[Overlay gradiente escuro 40% na metade inferior]
[Título grande: "Rota do Mel" / "Rota da Pesca"]
[Subtítulo 1 linha: "Aprenda, registre e cresça com a sua comunidade"]
[Botão grande — cor primária da rota: "Quero participar →"]
[Link secundário menor: "Já tenho conta — Entrar"]
```

**Para desktop:** side-by-side — ilustração à esquerda, texto + CTA à direita. Nunca centralizar texto longo.

### Estrutura de Scroll (micro-hooks — Mr.Beast)

```
[HERO — 100vh mobile]
  ↓
[Prova social: "X produtores do Piauí/Amapá já entraram" — número real, contador animado]
  ↓
[Benefício 1 — visual: "Acesse programas do governo" — ícones CAF, RGP, PRONAF + link info]
  ↓
[Vídeo ≤ 60s — produtor real falando (substituir por ilustração animada se não houver vídeo ainda)]
  ↓
[Benefício 2 — visual: "Trilha de aprendizado gamificada" — screenshot da trilha no celular]
  ↓
[Benefício 3 — visual: "Galeria da comunidade" — screenshot do feed]
  ↓
[Depoimento de produtor (quando disponível) ou citação do MIDR]
  ↓
[CTA final: botão grande + logo gov + "Projeto do MIDR/FADEX/UFPI"]
```

### Copy — Jobs-to-be-Done (Victor)

**Versão Rota do Mel:**
- Título hero: *"Rota do Mel — sua jornada começa aqui"*
- Subtítulo: *"Aprenda apicultura, registre sua produção e descubra os benefícios que você tem direito"*
- Benefício-âncora: *"Tem CAF? Não tem ainda? A gente te orienta."*
- CTA: *"Entrar na Rota do Mel →"*

**Versão Rota da Pesca:**
- Título hero: *"Rota da Pesca — seu rio, sua história"*
- Subtítulo: *"Aprenda pesca artesanal, registre sua produção e acesse programas do governo"*
- Benefício-âncora: *"Tem RGP? Precisa regularizar? A gente te orienta."*
- CTA: *"Entrar na Rota da Pesca →"*

### Personagens na Landing

- **Hero:** usar os personagens `front/apicultor.png` + `front/abelha.png` (mel) e `front/pescador.png` + `front/peixe.png` (pesca) — full-size, sem fundo, lado direito da tela em desktop, centralizado em mobile
- **Seção Jovem Multiplicador:** `front/filho-apicultor.png` / `front/filho-pescador.png`
- **Seção de benefícios:** ícones de documentos (CAF `trail/9.png` mel e `trail/5.png` pesca — em thumbnail pequeno ao lado do texto)

### Mecânica de Convite (Mr.Beast)
- URL com rota pré-selecionada: `rotaviva.gov.br/mel` e `rotaviva.gov.br/pesca`
- Ao compartilhar, o link já abre a landing no contexto correto
- Produtor que convidou ganha +20 XP quando o convidado completa a primeira lição
- Não implementar convite agora — registrar para V1.1

### Placa dos Fundadores (Mary — urgente)
- Interstitial antes do cadastro: "Você é um dos primeiros de [Município]!"
- Contador visível: "Vagas de Fundador restantes: 47 de 50"
- Badge "Fundador" concedido automaticamente aos primeiros 50 por município
- **Esta feature precisa ser implementada antes do lançamento** — a janela de escassez se fecha ao abrir para o público geral

### Como implementar
- Refatorar `/jarvis/rota-viva/app/pages/landing/landing.html` e CSS associado
- Mobile-first: breakpoint único a 768px
- Personagens: `<img>` simples com object-fit, sem dependência de framework externo
- Contador de participantes: chamada real à API Funifier `/v3/player/count` por gamificação
- Testes: verificar em iPhone SE (320px) e Galaxy A (360px) antes de qualquer validação desktop

---

## PRIORIDADE 2 — Onboarding Pós-Primeiro Login

### Proposta (Sally + Mr.Beast)

**Regra:** aparece apenas na primeira sessão após o primeiro login. Nunca mais. Se o usuário fechar, não reabrir. Flag salva em `localStorage` como `rv_onboarding_done: true`.

**4 telas (slides com indicador de progresso e botão "Pular" discreto no topo):**

```
TELA 1 — Boas-vindas
[Personagem: MEL-NEW-01 abelha acenando / PESCA-NEW-01 peixe acenando]
Título: "Bem-vindo, [Nome]!"
Texto: "Sua jornada na Rota do Mel começa agora."
Botão: "Vamos começar →"

TELA 2 — A Trilha
[Personagem: trail/2.png (mascote) + mockup mini de bolinha pulsando]
Título: "Cada bolinha é uma lição"
Texto: "Vídeos, perguntas, fotos de campo — tudo aqui."
Ícones dos 4 tipos de lição com nome curto abaixo
Botão: "Entendi →"

TELA 3 — A Galeria
[Personagem: MEL-NEW-05 / PESCA-NEW-05 (tirando foto)]
Título: "Compartilhe sua produção"
Texto: "Publique fotos e inspire outros produtores da sua região."
Botão: "Legal! →"

TELA 4 — Notificações
[Personagem: trail/18.png mel / trail/25.png pesca (celular)]
Título: "Não perca nenhuma novidade"
Texto: "Ative as notificações para saber quando tem lição nova ou evento especial."
Botão primário: "Ativar notificações" → solicita permissão Web Push
Botão secundário (link): "Agora não"
```

**Recompensa de entrada (Mr.Beast):**
Após a última tela, antes de entrar na trilha:

```
[Overlay de celebração]
[Personagem: trail/17.png mel / trail/24.png pesca (troféu)]
"Você ganhou sua primeira conquista!"
[Badge animado: "Explorador da Rota"]
"+50 XP"
[Botão: "Ver minha trilha →"]
```

### Como implementar
- Nova página/componente: `/jarvis/rota-viva/app/pages/onboarding/`
- Disparado em `app.js` na run phase: se `localStorage.rv_onboarding_done` não existe após login, redirecionar para `/onboarding` antes de `/trail`
- Ao concluir: setar flag, conceder 50 XP via Funifier Action API, redirecionar para `/trail`

---

## PRIORIDADE 3 — Perfil do Produtor (Passaporte Digital)

### Visão Estratégica (Victor + Mary)

O app deve evoluir para ser o **"Passaporte Digital do Produtor Rural Brasileiro"** — o único serviço que conecta o produtor informal ao Estado de forma acessível. Isso aumenta radicalmente o valor percebido e a retenção (o usuário volta porque o app tem dados úteis dele).

### Campos a adicionar no Perfil (Mary — MVP vs V1.1)

#### Seção "Minha Situação" (nova seção na página de Perfil)

**Campos coletados no cadastro ou na primeira sessão (pós-onboarding):**

| Campo | Tipo | Opções | Quem vê |
|-------|------|--------|---------|
| Tem CAF (Cadastro da Agricultura Familiar)? | Radio | Sim / Não / Não sei | Admin + AAGE |
| Tem RGP (Registro Geral da Pesca)? | Radio (só pesca) | Sim / Não / Não sei | Admin + AAGE |
| Acessou alguma linha do PRONAF? | Radio | Sim / Não / Não sei | Admin + AAGE |
| Faz parte de cooperativa ou associação? | Radio | Sim / Não | Admin + AAGE |
| Nome da cooperativa/associação | Texto livre (se Sim acima) | — | Admin + AAGE + MIDR |
| Município | Select (fixo por rota) | Lista dos 10 municípios | Público (ranking) |

> O campo "Nome da cooperativa/associação" é o dado que o MIDR quer descobrir — o governo não tem esse mapa. Este campo é a joia da escuta ativa.

**Gamificação da coleta (Yu-kai):**
- Completar todos os campos = badge "Produtor Registrado" + 30 XP
- Aparece como missão especial no onboarding: *"Complete seu perfil e descubra os programas que você pode acessar"*

#### Seção "Meus Programas" (nova — roteador de políticas)

Cards de programas relevantes para o perfil do usuário, curados pelo admin via Studio:

```
┌─────────────────────────────────────────┐
│  🟢 CAF — Cadastro da Agricultura      │
│  Familiar                               │
│  Você pode ter direito a benefícios    │
│  do PRONAF e outros programas.          │
│  [Saiba como se cadastrar →]            │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│  🔵 RGP — Registro Geral da Pesca      │
│  (apenas Rota da Pesca)                 │
│  Regularize sua atividade e acesse     │
│  o Seguro Defeso.                       │
│  [Saiba como obter →]                   │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│  🟡 PRONAF — Crédito Rural             │
│  Linha de crédito para agricultores    │
│  familiares cadastrados no CAF.         │
│  [Ver condições →]                      │
└─────────────────────────────────────────┘
```

- Cards são gerenciados pelo admin no Funifier Studio (coleção customizada `programa__c`)
- Cada card tem: título, descrição curta, link externo, e filtro por rota (`mel` / `pesca` / `ambos`) e condição (ex: só aparece se `tem_caf = false`)
- Links externos abrem no browser padrão (target="_blank")
- **MVP:** sem integração real com APIs gov — apenas roteamento de informação (links curados)
- **V2:** verificação automática de CAF via API MAPA

#### Personagens na tela de Perfil

- Seção "Minha Situação" sem preenchimento: `trail/9.png` mel / `trail/5.png` pesca (lendo documento)
- Seção "Minha Situação" preenchida com badge: `trail/15.png` mel / `trail/23.png` pesca (certificado)
- Seção "Meus Programas": `trail/21.png` mel / `trail/13.png` pesca (lendo documentos, variação)

### Como implementar
- Adicionar campos em `extra` do player Funifier: `extra.tem_caf`, `extra.tem_rgp`, `extra.tem_pronaf`, `extra.cooperativa_nome`, etc.
- Atualizar via `PUT /v3/player/{id}` com os novos campos
- Nova seção "Minha Situação" na `/pages/profile/profile.html`
- Coleção `programa__c` no Funifier Studio com campos: `title`, `body`, `link`, `rota`, `condicao`
- ApiService: `getProgramas(rota, playerExtra)` para filtrar os cards relevantes

---

## PRIORIDADE 4 — Sistemas de Gamificação Pendentes

### 4a. Thresholds de XP por Nível (Yu-kai)

Progressão logarítmica — difícil no início (mantém engajamento), acelera no meio, exige dedicação no final:

| Nível | Nome — Rota do Mel | Nome — Rota da Pesca | XP necessário | XP acumulado |
|-------|-------------------|---------------------|--------------|-------------|
| L0 | Abelha Novata | Pescador Iniciante | 0 | 0 |
| L1 | Exploradora da Colmeia | Aprendiz do Rio | 300 | 300 |
| L1.5 | Guardiã das Flores ⭐ | Barqueiro do Estuário ⭐ | +300 = 600 | 600 (marco surpresa) |
| L2 | Coletora de Saberes | Mestre de Rede | +400 = 1.000 | 1.000 |
| L2.5 | Rainha em Formação ⭐ | Capitão das Águas ⭐ | +800 = 1.800 | 1.800 (marco surpresa) |
| L3 | Abelha-Rainha | Arrais | +1.200 = 3.000 | 3.000 → abre Trilha do Multiplicador |
| L4 | Mestra Apicultora | Pescador Mestre | +2.000 = 5.000 | 5.000 |
| L5 | Guardiã da Rota | Guia do Rio | +3.000 = 8.000 | 8.000 |

> L1.5 e L2.5 são **marcos intermediários** — concedem badge surpresa sem alterar mecânicas. Nenhum aviso prévio — ativa CD7 (Unpredictability).
> Cap de XP por dia: 80 XP (conforme PRD) — evita grind intenso e distribui engajamento.

**Valor de XP por tipo de lição:**
| Tipo | XP base | Condição para máximo |
|------|---------|---------------------|
| Vídeo | 20 XP | Assistir ≥ 90% |
| Quiz — 3 estrelas | 30 XP | Sem erros |
| Quiz — 2 estrelas | 20 XP | 1-2 erros |
| Quiz — 1 estrela | 10 XP | Completou |
| DIY (evidência) | 25 XP | Foto + texto enviados |
| Essay (escuta ativa) | 15 XP + VOZ points | Qualquer resposta |
| Baú | 0 XP + Cristais | Completar o DIY do baú |

### 4b. Sistema de Cristais (nova moeda)

**O que é:** terceira moeda do app, ganha em momentos especiais (baús, streaks longas, top da galeria). Usada para comprar dicas de outros produtores na "Loja de Dicas".

**Regras de ganho:**
| Evento | Cristais ganhos |
|--------|----------------|
| Abrir Baú | 5–15 (aleatório — CD7) |
| Streak de 7 dias | 5 |
| Streak de 14 dias | 10 |
| Publicação no top 3 semanal da Galeria | 8 |
| Completar trilha inteira (7 módulos) | 20 |
| Badge de nível (L1, L2, L3...) | 10 |
| Completar perfil do produtor | 5 |

**Regras de uso — Loja de Dicas:**
| Item | Custo | Descrição |
|------|-------|-----------|
| Dica de produtor da mesma rota | 10 Cristais | Texto curto de dica prática (ex: "A melhor época para colheita é...") — curada pelo admin |
| Dica de produtor de outra rota | 20 Cristais | Perspectiva cruzada — apicultor lê dica de pescador e vice-versa |
| Eco da Rota | 5 Cristais | Mensagem de motivação de outro produtor |

> As dicas são conteúdo curado pelo admin no Studio — o produtor não escreve em tempo real. Isso evita moderação complexa no MVP.

**Funifier:** novo Point Type `CRISTAL` no Studio. Loja implementada como Store com `content_unlock` items.

**Ícone:** cristal hexagonal estilo gema — pode usar emoji 💎 como placeholder até ter arte final.

### 4c. Algoritmo da Barra de Top Users na Galeria

**Score semanal:**
```
Score_bruto = (Likes × 0.4) + (Comentários × 0.3) + (Seguidores × 0.3)

Score_final = Score_bruto × Multiplicador_de_papel
```

**Multiplicadores de papel:**
| Tipo de perfil | Multiplicador | Como definir no Funifier |
|----------------|--------------|--------------------------|
| MIDR/FADEX (oficial) | Slots fixos 1-2 (independente de score) | `extra.is_official = true` |
| Cooperativa/Associação | × 1.5 | `extra.role = 'cooperativa'` |
| Produtor ativo (≥ 3 posts/semana) | × 1.2 | Calculado por trigger semanal |
| Produtor novo (cadastro < 30 dias) | × 1.4 | `createdAt` vs `now` |
| Produtor inativo (< 1 post/semana) | × 0.5 | Calculado por trigger semanal |

**Distribuição dos 10 slots na barra:**
- Slots 1-2: MIDR/FADEX (fixos)
- Slots 3-4: Top cooperativas/associações por Score_final
- Slots 5-8: Top produtores ativos por Score_final
- Slot 9: Produtor novo em destaque ("Novo na comunidade") — rotativo
- Slot 10: Produtor ativo sem muito alcance (score × 2.0 para dar chance)

**Reset:** toda segunda-feira às 00h via Funifier Scheduler.

**Tec — implementação:** Leaderboard customizado com fórmula configurável. Multiplicadores via trigger que atualiza `extra.leaderboard_score` no player semanalmente. O app consome o leaderboard como endpoint normal.

### 4d. Personagem na Trilha — Definição dos 5 Tipos de Aparição

A cada 5 lições globais na trilha, o personagem aparece na inflexão do S. O tipo de cada aparição é configurado no módulo no Studio. Definição final:

| Tipo de aparição | Frequência sugerida | Interação |
|-----------------|-------------------|-----------|
| Mascote motivacional (padrão) | 50% | Nenhuma — apenas presença com mensagem curta |
| Quiz rápido surpresa | 20% | 1 questão; +10 XP bônus se acertar |
| Post do feed (influência social) | 20% | Mostra 1 post da Galeria; usuário pode curtir ali mesmo |
| Eco da Rota (mensagem de produtor) | 10% | Lê mensagem; botão "Curtir essa mensagem" |

**Mensagem motivacional padrão** — o personagem fala uma frase curta (configurável por módulo no Studio):
- Mel: *"Você está indo muito bem, apicultor!"* / *"A colmeia está orgulhosa de você!"*
- Pesca: *"O rio reconhece quem se dedica!"* / *"Você está pescando muito conhecimento!"*

---

## PRIORIDADE 5 — PWA Completo

### Status atual vs. necessário (Tec)

| Item | Status | Ação necessária |
|------|--------|----------------|
| `manifest.json` com ícones e metadados | Existe (sw.js referenciado) | Validar com Lighthouse; adicionar `display: standalone`, `theme_color` |
| Service Worker — cache de assets estáticos | Existe (sw.js) | Revisar estratégia: Cache-first para assets, Network-first para API `/v3/` |
| Service Worker — cache de dados da API | Não implementado | Interceptar chamadas `/v3/` e armazenar respostas no cache |
| IndexedDB — fila de sync offline | Não implementado | Armazenar DIY, Essay, Quiz concluídos offline; sync ao reconectar |
| Background Sync API | Não implementado | Disparar sync automaticamente quando conexão retornar |
| Web Push (VAPID) | Não implementado | Configurar VAPID keys no Funifier Studio; service worker recebe push |
| Install prompt (Add to Home Screen) | Não implementado | Custom banner na 2ª-3ª visita |
| Offline indicator | Não implementado | Banner discreto no topo quando offline |

### Web Push — Tipos de Notificação

| Trigger | Mensagem | Horário |
|---------|---------|---------|
| Streak em risco (24h sem atividade) | "Sua sequência está em risco! Abra o app." | 19h |
| Nova lição desbloqueada | "Nova lição disponível: [título]" | Imediato |
| Nova lição Essay | "O Ministério quer ouvir você sobre [tema]" | 10h |
| Top da Galeria semanal | "Você está no top 3 desta semana!" | Segunda 8h |
| Inatividade 7 dias | "[Nome], o apiário / o rio está esperando." | 10h |
| Baú disponível (CD7) | "Tem um baú te esperando na trilha!" | Imediato |

**Máximo:** 1 notificação por dia por usuário. Prioridade: Essay > Streak > Inatividade.
**iOS:** Web Push apenas iOS 16.4+. Comunicar no onboarding.

### Install Prompt (Add to Home Screen)

```
[Banner discreto — bottom sheet]
┌─────────────────────────────────────────┐
│ [ícone do app]  Rota do Mel             │
│                 Funciona sem internet!  │
│  [Adicionar à tela inicial]  [Agora não]│
└─────────────────────────────────────────┘
```

- Aparece na 2ª visita (nunca na 1ª)
- "Funciona sem internet" é o hook certo para o público rural
- Ao fechar "Agora não": nunca mais mostrar automaticamente (salvar flag)

### Offline — Estratégia de Cache

```
Recursos estáticos (JS, CSS, HTML, imagens):  Cache-first
Dados da API (/v3/):                           Network-first com fallback para cache
Fila de sync (DIY, Essay, Quiz):               IndexedDB local
Reconexão:                                     Background Sync API → flush da fila
```

---

## Considerações Finais do Time

### O que Ricardo está esquecendo (checklist)

| Item | Quem sinalizou | Status |
|------|---------------|--------|
| Fluxo de cadastro — simplificar para 2 etapas (campos obrigatórios → foto opcional depois) | Sally | A discutir |
| Mecânica de convite — URL com rota pré-selecionada + XP por convite | Mr.Beast | Registrar para V1.1 |
| Placa dos Fundadores — implementar antes do lançamento | Mary | Urgente |
| Thresholds de XP — definido acima, faltava implementar | Yu-kai | Resolvido neste doc |
| Evento de lançamento — não é código, é orquestração com FADEX/Marketing | Victor | Alinhar com cliente |
| Trilha do Multiplicador — papel habilitado manualmente pelo admin | Mary | A implementar quando FADEX definir critérios |

### Perguntas abertas (a responder com o cliente)

1. **Municípios do Piauí:** os 5 municípios participantes foram confirmados pela FADEX? (S3 do PRD)
2. **Vídeo institucional:** existe vídeo de produtor real para usar na landing e no onboarding?
3. **Lançamento:** há data definida? Isso impacta quando implementar a Placa dos Fundadores.
4. **Evento de lançamento:** o Secretário do MIDR estará presente? (necesário para CD4 — Ownership e CD8 — Loss Aversion)
5. **Cooperativas:** o MIDR/FADEX tem uma lista parcial de cooperativas para usar como autocomplete no campo de perfil? Ou começa texto livre?
6. **SLA de moderação de vídeo:** quantos dias o admin tem para aprovar vídeos enviados para a Galeria?

---

## Ordem de Execução — Sprint Plan

| Fase | Itens | Estimativa de sessões |
|------|-------|----------------------|
| **Sprint 1** | Landing page (hero mobile + scroll + copy) | 1-2 sessões |
| **Sprint 2** | Onboarding pós-login (4 telas + recompensa entrada) | 1 sessão |
| **Sprint 3** | Perfil do produtor (campos CAF/RGP/cooperativa + "Meus Programas") | 1-2 sessões |
| **Sprint 4a** | Configurar XP thresholds e Cristais no Funifier Studio | 1 sessão |
| **Sprint 4b** | Baú na trilha (visual + overlay de cristais) | 1 sessão |
| **Sprint 4c** | Estrelas nas bolinhas (visual + lógica de score) | 1 sessão |
| **Sprint 4d** | Personagem na trilha — tipos de aparição (quiz, feed, eco) | 1 sessão |
| **Sprint 4e** | Algoritmo da Galeria (Leaderboard + slots fixos) | 1 sessão |
| **Sprint 5a** | Push notifications (VAPID + Funifier config) | 1 sessão |
| **Sprint 5b** | Offline queue (IndexedDB + Background Sync) | 2 sessões |
| **Sprint 5c** | Install prompt (custom banner A2HS) | 1 sessão |
| **Sprint 5d** | Lighthouse audit + manifest.json final | 1 sessão |

**Antes do Sprint 1:** gerar as imagens de personagens faltantes (MEL-NEW-01 a 08 e PESCA-NEW-01 a 08).

---

Tenho duas coisas que eu quero discutir antes de começarmos a implementar:

1. Bugs e Ajustes
2. Gamificacao

Quero sua opiniao a respeito dos items abaixo. Quero saber o que voce acha e como pensa em planejar cada uma das coisas abaixo.

# BUGS E AJUSTES

## Termos e Politica
- Eu falei para colocar os termos e politica dentro da gamificacao de cada rota, mas como estes dois documentos sao genericos, eu acho melhor incliur eles na gamificacao central. Entao eu acho que voce pode criar a pagina customizada de administracao destes documentos dentro da gamificacao central, copia estas paginas de administracao que estao na colecao "studio_page" da gamificacao da rota do mel e coloca na gamificacao central, bem como o conteudo da colecao "legal__c". E cria um endpoint publico na gamificacao central para acessar estes documentos, como esta sendo feito para o FAQ e cadastro de usuario na landing. Tem que ver como esta sendo feito la. Como podemos fazer isso?

## Navigation
- Acho que podemos aumentar o tamanho dos icones e titulos da bottom nav, ja que temos apenas 3 items? 
- Acho que podemos deixar mais destacado qual a opcao da navbar esta selecionada. 

## Tela Trilha
- O botão de sair da trilha ainda leva para a home. Que não existe mais. /jarvis/rota-viva/doc/assets/issue/bug-voltar.jpeg
- O boneco esta tampando o título da seção. /jarvis/rota-viva/doc/assets/issue/bug-module.jpeg
- Aqui tem que colocar um favo de mel como ícone da pontuação. E precisa tb adicionar os cristais que você comentou que ganha. /jarvis/rota-viva/doc/assets/issue/bug-points.jpeg

## Tela Profile
- Nao gostei dessa estrutura para passaporte. Nao se parece com um passaporte. /jarvis/rota-viva/doc/assets/issue/bug-passport.jpeg
- Acho que este nome “zona de perigo” ficou ruim. E' assim que outros apps fazem? /jarvis/rota-viva/doc/assets/issue/bug-danger.jpeg

## Outras Coisa
- Faltou a opcao de recuperar senha na pagina publica /landing. E a opcao de alterar senha na pagina /profile.

---

# GAMIFICATION

Quero discutir sobre os detalhes da gamificacao antes de iniciar as implementacoes. Quero fazer um mapeamento segundo o octalysis de quais elementos de gamificacao ja estao incluidos. Por exemplo, o onboarding (que e' um step by step tutorial); os sons quando o usuario acerta ou erra uma pergunta; as aulas bloqueadas; o FOMO com o feed da galeria, a influencia social com a publicacao do usuario; o convidar amigos; etc. Quero essa analise para termos uma base para decidir quais elementos de gamificacao ainda precisamos implementar. 

Abaixo estao as coisas que eu acho que ainda precisamos resolver.

## Acoes Desejadas
Quais sao as actions que vamos cadastrar no studio? Complete lesson, Complete module, Invite friend, Publish, Edit Profile, etc. Pois isso precisa estar especificado para agente saber o que vai dar pontos aqui na gamificacao. 

## Pontuacao
Quais os tipos de pontos teremos, e quando estes pontos sao atribuidos? Podemos ter pontos XP para o sistema de nivel (que so incrementa) e pontos Cristais para gastar (que podem ser perdidos ou gastos). E quais vao ser os icones destes pontos. Quando tivermos com esses pontos bem definidos, precisamos replicar isso no header do app, para mostrar os tipos de pontos e o streak. 

## Desafios
Quais os challenges que precisamos configurar no studio? Por exemplo, completar licao ganha 5 xp, completar licao do tipo "bau" ganha 10 xp + 3 cristais, completar os dados do passaporte ganha 5 xp, etc. 

## Bau na trilha
O bau e' uma lesson, uma atividade onde o usuario ganha cristais, o conteudo e' um quiz para coleta de evidencias (foto, video, localizacao de gps), e pode ser publicada no feed da galeria. Precisamos definir como sera o fluxo do usuario no bau. Vamos mostrar o que outros usuarios fizeram nesta licao tambem?

## Personagem na trilha
O persogem e' onde temos as 3 estrelinhas. O personagem esta aparecendo a cada 5 licoes. Entao eu preciso definir o que e' o personagem. Ele vai ser mais uma lesson do modulo? Se for, como eu vou cadastrar isso? Defino um tipo diferente de folder? Ao inves de ser um folder do tipo lesson, pode ser um folder do tipo cartoon, e ai eu posso atrelar um conteudo do mesmo jeito, por exemplo um quiz, igual fazemos nos folder do tipo lesson. E ai eu posso colocar estes folders dentro dos modulos, por exemplo a cada 5 folder do tipo lesson. Eu preciso definir o que e' o personagem, e como ele vai ser cadastrado. As estrelas podem estar atreladas ao total de perguntas certas. E talvez estes personagens possam gerar cristais tambem. Preciso definir estes detalhes. 

---

# CONSIDERACOES

Eu preciso definir melhor os tipos de pontos e como eles funcionam. E eu quero que voce registre no documento "/jarvis/rota-viva/doc/bmad-review-2026-04-11.md" este planejamento de correcoes de bugs e gamificacao. Abaixo estao as minhas consideracoes. 

# BUGS & AJUSTES

## Bug voltar na trilha
- Pode simplesmente remover este botao de voltar.

## Personagem tampando o título
- Pode ignorar o personagem tampando o titulo do modulo. Deixa como esta. 

## Passaporte — design
- Ainda nao gostei da sua proposta. Eu acho que poderia ter um marcacao tracejada com um botao "Criar Passaporte" abaixo dela. E isso abre uma modal, explicando o que e' o passaporte, pode colocar uma imagem de algum personagem. Explicar que o passaporte e' uma credencial de identificacao para facilitar o acesso do produtor aos programas do governo. Mostrar que isso e' importante para ele. E para isso ele precisa informar alguns dados pessoais como por exemplo nome, cpf, telefone, email, endereco, localizacao gps, CAF, etc. E quando ele cria, podemos mostrar o documento como uma carteira de motorista digital, que tem a frente do documento e o verso do documento com um qrcode (que pode ser compartilhado depois com autoridades atravez do app rota viva). Na frente temos algumas informacoes e uma cara de documento, cartao do governo, e no verso outras informacoes + qrcode. O que acha? Preciso que o usuario veja vantagem em criar este passaporte. 

## Recuperar e alterar senha
- O topico "Alteração de Senha" no documento "/doc/knowledge/modules/patterns.md" explica como implementa a recuperacao e alteracao de senha, na area publica e privada. Talvez tenha que adaptar alguma coisa, pois um dos fluxos usa email no processo, mas pode ser que o usuario tenha apenas telefone celular. Entao preciso entender como voce pretende fazer isso. Voce pode ler o endpoint de alteracao de senha em "/funifier/funifier-service/src/main/java/com/funifier/rest/v3/rest/PlayerRest.java".

# GAMIFICACAO

## Actions para cadastrar no studio
Eu acho que podemos ter apenas:
- login
- complete_onboarding
- complete_lesson com atributos lesson, type, score (com isso eu consigo substituir todas as outras variacoes de lesson_quiz, lesson_video, lesson_diy, lesson_bau, cartoon)
- complete_module
- complete_passport
- edit_profile
- publish_post
- invite_accepted

Os challenges vao ser configurados assim: ex: complete_lesson type cartoon, score 3, ganha 3 cristais * score. entendeu? 

O que voce acha? Faz estes ajustes e registra este plano de correcoes de bugs e de implementacao da gamificacao no documento "/jarvis/rota-viva/doc/bmad-review-2026-04-11.md"

---



## GERAL
- Colocar a logo do midr para ser o favicon do app.

## PROFILE
- Na pagina "/profile" o item profile-section-title esta muito colado no profile-stats. Precisa incluir um espaco entre eles. 
- Como nos estamos criando os desafios (challenges) eu acho que o usuario precisa saber o que ele precisa fazer para ganhar pontos. Isso pode estar na sessao profile-section. Atualmente so esta mostrando as imagens dos desafios concluidos, mas eu acho que podemos mudar isso para mostrar a imagem de todos os desafios. Os desafios que o usuario ainda nao completou podem ser mostrados com a cor cinza, e os que ele ja completou ficam com a cor original. E se o usuario clicar no icone do desafio ele pode ver mais detalhes sobre o desafio (como por exemplo a image, titulo, descricao). O que acha? 

## B4 — Cartoon/Checkpoint interativo na trilha
Precisa corrigir o item `### 2.5 Personagem/Checkpoint na Trilha` da documentacao "/jarvis/rota-viva/doc/bmad-review-2026-04-11.md" pois alguns pontos estao incorretos, segue abaixo o que precisa ser discutido e corrigido antes de implementar:

- Eu nao gostei da sua proposta de calculo das 3 estrelas, ele esta levando em consideracao as licoes anteriores, mas o certo e' levar em consideracao o desempenho do usuario no Cartoon/Chekpoint igual acontece no duolingo. No duolingo este checkpoint tem um tempo de execucao, por exemplo 1 minuto, e se o usuario fizer em menos de 1 minuto ele ganha 3 estrelas, se fizer em mais de 1 minuto ele ganha 2 estrelas, se fizer em mais de 2 minutos ele ganha 1 estrela. Ou pode ser com base no resultado do quiz. Eu quero discutir esse calculo com voce, antes de iniciar a implementacao, e registrar nossa conclusao no documento de planejamento "/jarvis/rota-viva/doc/bmad-review-2026-04-11.md"

- O que muda no Studio (admin): Criar folder content type "cartoon" igual foi feito para o content type "chest" dentro de "/funifier/funifier-studio/app/scripts/controllers/studio/folder/type/content.js", e depois configurar o conteúdo (cartoon) dentro do folder lesson igual foi feito com o (chest). Use os tokens abaixo para cadastrar o "folder_content_type" -> "folder" (com type lesson, dentro dos modules) -> "folder_content" -> "quiz" -> "question" (tudo igual a estrutura do chest). Entendeu?

## TOKENS
Para cadastrar conteudos nas gamificacoes das duas rotas voce pode usar os tokens abaixo:

- ROTA DO MEL = 'Basic NjljNThkMjRlNjY1MGUyNmRhZDIxNTM3OjY5YzU5MWEyZTY2NTBlMjZkYWQyMmNmNw==';

- ROTA DA PESCA = 'Basic NjljNThkNGRlNjY1MGUyNmRhZDIxNWIyOjY5YzU5MWVkZTY2NTBlMjZkYWQyMmRkMQ==';


## Recuperação de senha sem email
- Voce nao colocou no documento de planejamento "/jarvis/rota-viva/doc/bmad-review-2026-04-11.md" o que discutimos em relacao ao usuario conseguir acessar o app se ele tiver esquecido a senha. Nos discutimos que como o publico alvo pode esquecer a senha com frequencia e eles tem apenas o numero de celular, seria interessante pensar em um fluxo onde o usuario pode se logar com a senha, ou com o numero de celular e um codigo de verificacao enviado para o celular (por sms ou whatsapp). Isso ja e' feito em outros apps. Entao preciso entender como voce pretende fazer isso. Alem disso existe uma documentacao sobre recuperacao e alteracao de senha em "/doc/knowledge/modules/patterns.md" que pode ser util que explica como implementa a recuperacao e alteracao de senha, na area publica e privada. Talvez tenha que adaptar alguma coisa, pois um dos fluxos usa email no processo, mas pode ser que o usuario tenha apenas telefone celular. Entao preciso entender como voce pretende fazer isso. Voce pode ler o endpoint de alteracao de senha em "/funifier/funifier-service/src/main/java/com/funifier/rest/v3/rest/PlayerRest.java". Preciso que este plano de como fazer esse login pelo numero de celular seja incluido no documento de planejamento bem como a forma que sera implementada a recuperacao/alteracao de senha, antes de implementar isso. 

## Fase C — Loja de Dicas (futura)
Para a loja de dicas eu encontrei este video que achei interessante, para colocar como uma primeira dica que o usuario pode resgatar com as coins (https://www.instagram.com/reels/DWK7V3PkzB3); A loja e' cadastrada usando o endpoint "/funifier/funifier-service/src/main/java/com/funifier/rest/v3/rest/VirtualGoodsRest.java". Precisa primeiro criar um catalog, que pode ter o id "rewards" e dentro do catalogo voce pode adicionar os itens da loja. Eu tambem quero isso planejado no documento de planejamento.

---

Pode ajustar a documentacao e remover o que nao for mais relevante ou ja tiver sido implementado por favor.