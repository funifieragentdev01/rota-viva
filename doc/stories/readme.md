# Rota Viva — Stories: Guia de Criação

Este documento registra os padrões, decisões e aprendizados acumulados na criação das histórias interativas da Rota Viva. Deve ser lido antes de escrever qualquer nova história.

---

## 1. Estrutura de Pastas e Nomenclatura de Arquivos

```
doc/stories/
  mel/          # Histórias da Rota do Mel
  pesca/        # Histórias da Rota da Pesca
  readme.md     # Este arquivo
```

### Convenção de nomes de arquivo

O sufixo do nome identifica **rota + módulo + número** da história:

| Partes | Significado |
|---|---|
| `m` | indica que é uma história de módulo (prefixo fixo) |
| `a`–`g` | letra do módulo (A, B, C, D, E, F, G) |
| `in` | Módulo Início (único sem letra) |
| `1` ou `2` | número da história dentro do módulo |

**Exemplos:**
- `story-ma1.json` — Rota do Mel, Módulo A, história 1
- `story-mc2.json` — Rota do Mel, Módulo C, história 2
- `story-in1.json` — Módulo Início, história 1
- `story-pb1.json` — Rota da Pesca, Módulo B, história 1

Cada história tem 3 arquivos:
- `story-{id}.md` — roteiro narrativo com tabela de cenas
- `story-{id}.json` — JSON de configuração para importar no Studio
- `capa-{id}.jpeg` — imagem de capa

---

## 2. Padrão de IDs no JSON

Para evitar conflitos de `_id` entre histórias no banco de dados, seguimos este padrão:

| Objeto | Padrão | Exemplo |
|---|---|---|
| Story | `{id}` | `"ma1"` |
| Cena | `{id}_s{N}` | `"ma1_s1"`, `"ma1_s2"` |
| Personagem | `{id}_c{N}` | `"ma1_c1"`, `"ma1_c2"` |

**Regras:**
- O `N` das cenas segue a ordem de `position` (1, 2, 3...), **não** a ordem de criação
- Todos os campos de referência cruzada usam este padrão: `story_id`, `first_scene_id`, `next_scene_id` nas cenas, `next_scene_id` nas opções de decisão, e `character_id` nos diálogos

---

## 3. Estrutura do JSON

Cada arquivo JSON tem três seções obrigatórias:

```json
{
  "story": { ... },
  "characters": [ ... ],
  "scenes": [ ... ]
}
```

### Campos obrigatórios da story

```json
{
  "_id": "ma1",
  "title": "...",
  "synopsis": "...",
  "cover_image": "...",
  "aspect_ratio": "9:16",
  "subtitle_font_size": 22,
  "default_scene_duration": 6,
  "passing_score": 28,
  "genre": "Drama",
  "show_cover_first": true,
  "first_scene_id": "ma1_s1",
  "background_audio": { "loop": true, "volume": 0.25, "url": "..." },
  "status": "active"
}
```

### Campos obrigatórios de cada cena

```json
{
  "_id": "ma1_s1",
  "story_id": "ma1",
  "title": "...",
  "type": "scene" | "decision" | "end",
  "position": 1,
  "transition": "fade",
  "transition_duration": 300,
  "media_mode": "image",
  "media": { "type": "image", "url": "...", "duration": 12 },
  "description": "Prompt visual completo para geração de imagem com IA",
  "subtitles_enabled": true,
  "background_audio": { "loop": false, "volume": 1 },
  "dialogues": [ ... ]
}
```

- Cenas `type: "scene"` têm `next_scene_id`
- Cenas `type: "decision"` têm `decision: { prompt, interaction_type, options: [{label, next_scene_id, score}] }`
- Cenas `type: "end"` têm `end_label` e `end_score`

---

## 4. Tipos de Cena

| Tipo | Função | Campos extras |
|---|---|---|
| `scene` | Cena narrativa pura. Avança automaticamente ou por botão. | `next_scene_id` |
| `decision` | Pausa para escolha do jogador. Pode ter diálogos antes das opções. | `decision { prompt, options[] }` |
| `end` | Cena final. Exibe pontuação + label. | `end_label`, `end_score` |

---

## 5. Regras de Cadência (Direção de Cena)

Estas regras foram estabelecidas a partir da análise da história `ma1` como referência de qualidade.

### 5.1 Regra das transições

**Nunca coloque duas decisões em sequência direta.** Entre toda decisão e a próxima decisão deve existir pelo menos uma cena `type: "scene"` mostrando a consequência da escolha anterior.

```
✅ CORRETO:  decision → scene (consequência) → decision
❌ ERRADO:   decision → decision
```

### 5.2 Regra dos diálogos por tipo de cena

| Tipo de cena | Mínimo de diálogos | Ideal |
|---|---|---|
| Cena de abertura | 2 | 2–3 |
| Cena narrativa de transição | 2 | 3 |
| Cena de decisão | 1 | 2 |
| Cena de decisão emocional importante | 2 | 3 |
| Cena final (end) | 2 | 3 |

**Por que isso importa:** 1 diálogo em 12–15s de imagem deixa a cena vazia. O jogador vê a imagem desaparecer antes de sentir o personagem. O segundo diálogo é o que cria emoção.

### 5.3 Regra da abertura

As primeiras 2 cenas devem:
1. Estabelecer o mundo/ambiente (narrador)
2. Revelar a personalidade do protagonista (fala ou pensamento do personagem)

Nunca abrir com apenas narração impessoal. O jogador precisa sentir quem é o protagonista antes da primeira decisão.

### 5.4 Regra dos momentos de peso

A decisão mais dramática da história (geralmente o ponto de virada do segundo ato) precisa do maior número de diálogos antes da pergunta. O jogador deve sentir o peso antes de escolher. Se uma decisão vale emocionalmente mais do que as outras, ela precisa de mais respiro narrativo, não menos.

### 5.5 Regra dos finais

Toda cena `type: "end"` deve ter pelo menos 3 diálogos:
1. A consequência imediata (o que aconteceu)
2. O que isso significa para o personagem
3. A moral/aprendizado para o jogador

O final bom deve fazer o jogador sentir que conquistou algo. O final neutro deve deixar claro o próximo passo. O final ruim nunca pune — ensina.

### 5.6 Loop educativo

Se o jogador não sabe responder uma decisão, pode existir uma cena de explicação que retorna para a mesma decisão. Esse loop deve:
- Ter diálogos que se encerram com "agora que você entende..." para sinalizar o retorno intencional
- Nunca repetir a imagem da cena de decisão — o loop deve ter imagem própria (diferente)

---

## 6. Sistema de Pontuação

### Scoring por tipo de escolha

| Tipo de escolha | Score sugerido |
|---|---|
| Escolha correta e bem preparada | 10 |
| Escolha correta mas subótima | 6–8 |
| Escolha incorreta mas recuperável | 1–5 |
| Desistência / escolha ruim | 0 |
| Bônus por final bom (`end_score`) | 10 |
| Bônus por final neutro (`end_score`) | 5 |
| Bônus por final ruim (`end_score`) | 0 |

### Cálculo do passing_score

O `passing_score` é o número de pontos necessário para ganhar 3 estrelas.

```
Max score = soma de todos os scores do melhor caminho + end_score do final bom
passing_score = ~70% do max score (arredondado)
```

**Exemplo (ma1):**
- Melhor caminho: 10 (CAF) + 10 (custeio) + 10 (anotações) + 10 (end_score) = 40
- passing_score = 28 (70% de 40)

### Cálculo de estrelas (feito em StoryCtrl)

```
3 estrelas: score >= passing_score
2 estrelas: score >= passing_score * 0.58
1 estrela:  score < passing_score * 0.58
```

---

## 7. Personagens

### 7.1 Padrão de vozes (ElevenLabs / OpenAI TTS)

| Tipo de personagem | voice_profile sugerido |
|---|---|
| Homem adulto | `onyx` |
| Mulher adulta | `shimmer` |
| Homem jovem / técnico | `alloy` |
| Mulher jovem / criança | `nova` |
| Narrador neutro | sem `character_id` (sem avatar, tom externo) |

### 7.2 Narrador vs. personagem

- Diálogos **sem** `character_id` = narrador (sem avatar na tela, tom de voz externo)
- Diálogos **com** `character_id` = personagem (exibe avatar do personagem)
- O narrador fala sempre em 3ª pessoa sobre o protagonista
- Os personagens falam sempre em 1ª pessoa

### 7.3 Personagens canônicos

Os personagens abaixo aparecem em **todo o app** (histórias, trilha, galeria, perfil) e devem manter **sempre o mesmo nome, descrição e visual**. Personagens secundários (atendentes, técnicos, agentes) podem ser criados por história, mas os canônicos são fixos.

#### Rota do Mel — Família Costa

| Personagem | Nome completo | Idade | Descrição | `voice_profile` |
|---|---|---|---|---|
| Apicultor | **Seu Zé** (José Costa) | 52 anos | Pele curtida de sol, chapéu de palha, roupa simples de campo. Sério, experiente, acolhedor. Aprendeu sozinho e quer deixar algo maior para os filhos. | `onyx` |
| Esposa | **Dona Maria** (Maria Costa) | 48 anos | Vestido florido, cabelos compridos presos. Participativa na gestão do apiário, determinada e prática. É ela quem faz as contas. | `shimmer` |
| Filho | **Pedro** (Pedro Costa) | 19 anos | Cabelos curtos, camiseta e chapéu. Curioso e um pouco impaciente — quer modernizar o apiário e aprender rápido. | `alloy` |
| Filha | **Ana** (Ana Costa) | 14 anos | Tranças, vestidinho simples, olhos grandes. Encantada com as abelhas. Faz as perguntas que todo iniciante precisaria fazer. | `nova` |
| Mascote | **Belinha** | — | Abelha animada, expressiva. Aparece em momentos lúdicos e de celebração dentro do app. | — |

#### Rota da Pesca — Família Lopes

| Personagem | Nome completo | Idade | Descrição | `voice_profile` |
|---|---|---|---|---|
| Pescador | **Seu Raimundo** (Raimundo Lopes) | 50 anos | Pescador experiente, pele queimada de sol e rio, mãos calejadas. Conhece as águas como ninguém. Sério e digno. | `onyx` |
| Esposa | **Dona Graça** (Graça Lopes) | 46 anos | Extrovertida, forte. Gerencia a parte comercial da pesca e a vida da família. Boa de conselho. | `shimmer` |
| Filho | **Lucas** (Lucas Lopes) | 18 anos | Aprendiz de pescador, sonha em profissionalizar o negócio. Questionador e com vontade de crescer. | `alloy` |
| Filha | **Júlia** (Júlia Lopes) | 13 anos | Adora o rio e os peixes. Curiosa e animada, observadora. Aprende rápido. | `nova` |
| Mascote | **Pintado** | — | Peixe animado e expressivo. Aparece em momentos lúdicos dentro do app. | — |

**Regras para uso dos canônicos nas histórias:**
- Sempre usar os mesmos nomes — nunca renomear Seu Zé para José ou Dona Maria para Maria
- `avatar_thumbnail` e `reference_image` devem apontar para os mesmos assets em todas as histórias (quando gerados)
- Personagens secundários (atendentes, técnicos, vizinhos) são livres por história, mas os canônicos são imutáveis
- A **primeira história de cada rota** deve mostrar os 4 membros da família juntos, pois é o desejo do cliente evidenciar o envolvimento familiar

---

## 8. Imagens e Mídia

### Campo `description`

O campo `description` de cada cena serve como **prompt completo para geração de imagem com IA** (Midjourney, DALL-E, Firefly, etc.). Deve ser detalhado o suficiente para produzir a imagem sem contexto adicional.

Cenas ainda sem imagem gerada devem ter `"url": ""` e a descrição começando com `TODO —`.

### Aspect ratio padrão

- Histórias: `"9:16"` (vertical, mobile-first)
- Capa: imagem vertical, no estilo do desenho animado definido para a rota

### Estilo visual

- Rota do Mel: estilo cartoon inspirado em **Gravity Falls** — paleta quente (amarelo-dourado, verde-caatinga, laranja do sertão), traços expressivos, personagens com personalidade marcada
- Rota da Pesca: estilo cartoon inspirado em **Gravity Falls** — paleta fria e tropical (azul-rio, verde-ribeirinha, dourado do sol refletido na água), mesmo nível de expressividade

---

## 9. Mapa das Histórias

### Rota do Mel

| Arquivo | Módulo | Tema central | Status |
|---|---|---|---|
| `story-in1.json` | Início | Biologia das abelhas + O negócio do mel | ✅ Concluído |
| `story-in2.json` | Início | Um dia na vida do apicultor | ✅ Concluído |
| `story-ma1.json` | A | CAF, PRONAF e acesso a crédito | ✅ Concluído |
| `story-ma2.json` | A | PAA, PNAE e venda institucional | ✅ Concluído |
| `story-mb1.json` | B | Calendário apícola e manejo das colmeias | ✅ Concluído |
| `story-mb2.json` | B | Extração e processamento com qualidade | ✅ Concluído |
| `story-mc1.json` | C | SIM, SIE e SIF — qual certificação você precisa? | ✅ Concluído |
| `story-mc2.json` | C | Certificação orgânica e rotulagem | ✅ Concluído |
| `story-md1.json` | D | Quanto vale o seu mel? Precificação correta | ✅ Concluído |
| `story-md2.json` | D | Onde vender? Canais e nota fiscal | ✅ Concluído |
| `story-me1.json` | E | Varroa, loque e saúde das colmeias | ✅ Concluído |
| `story-me2.json` | E | O apicultor como guardião da Caatinga | ✅ Concluído |
| `story-mf1.json` | F | CMDR, associações e sua voz no campo | ✅ Concluído |
| `story-mf2.json` | F | Audiência pública e incidência política | ✅ Concluído |
| `story-mg1.json` | G | Seus direitos como participante do Rota Viva | ✅ Concluído |
| `story-mg2.json` | G | Uso correto dos recursos públicos | ✅ Concluído |

### Rota da Pesca

| Arquivo | Módulo | Tema central | Status |
|---|---|---|---|
| `story-pin1.json` | Início | Piracema, defeso e o negócio da pesca artesanal | ✅ Concluído |
| `story-pin2.json` | Início | Um dia na vida do pescador artesanal | ✅ Concluído |
| `story-pa1.json` | A | RGP, Seguro-Defeso e direitos do pescador | ✅ Concluído |
| `story-pa2.json` | A | PRONAF Pesca, PAA e acesso a crédito | ✅ Concluído |
| `story-pb1.json` | B | Pescando com responsabilidade e boas práticas de captura | ✅ Concluído |
| `story-pb2.json` | B | Do barco à mesa — conservação e rastreabilidade do pescado | ✅ Concluído |
| `story-pc1.json` | C | Inspeção sanitária do pescado — DIPOA, SIF e SIE | ✅ Concluído |
| `story-pc2.json` | C | Rastreabilidade, rotulagem e certificação sustentável | ✅ Concluído |
| `story-pd1.json` | D | Quanto vale o seu pescado? Precificação correta | ✅ Concluído |
| `story-pd2.json` | D | Onde vender? Canais, nota fiscal e cooperativa | ✅ Concluído |
| `story-pe1.json` | E | Pesca seletiva, tamanhos mínimos e espécies protegidas | ✅ Concluído |
| `story-pe2.json` | E | O pescador como guardião das águas e das RESEX | ✅ Concluído |
| `story-pf1.json` | F | Colônia, FEPA-AP e sua voz nos rios | ✅ Concluído |
| `story-pf2.json` | F | Audiência pública e o pescador como política pública | ✅ Concluído |
| `story-pg1.json` | G | Seus direitos como participante do Rota Viva | ✅ Concluído |
| `story-pg2.json` | G | Integridade e uso correto dos recursos públicos | ✅ Concluído |

---

## 10. Checklist de Qualidade

Antes de marcar uma história como concluída, verificar:

- [ ] Todos os `_id` seguem o padrão `{id}`, `{id}_sN`, `{id}_cN`
- [ ] Todos os `story_id` nos personagens e cenas batem com o `_id` da story
- [ ] Todas as referências de `next_scene_id` e `character_id` apontam para IDs existentes no JSON
- [ ] Nenhuma decisão segue diretamente outra decisão sem cena de transição
- [ ] Nenhuma cena tem menos de 2 diálogos (exceto decisões simples)
- [ ] A cena de abertura tem pelo menos 2 diálogos, sendo um do protagonista
- [ ] A decisão mais emocional da história tem 2+ diálogos antes da pergunta
- [ ] Todos os finais têm `end_label` e `end_score` definidos
- [ ] `passing_score` calculado como ~70% do max score do melhor caminho
- [ ] Todas as cenas têm `description` completo para geração de imagem com IA
- [ ] Cenas sem imagem têm `"url": ""` e description começando com `TODO —`



---


Eu gerei este JSON /jarvis/rota-viva/doc/stories/mel/story-ma1.json e importei ele na lista de story. Mas apesar de aparentemente a estrutura de dialogos dentro do JSON estar correta, quando eu importei, o nome do personagem em cada dialogo na aba de Cenas da pagina de editar story, nao esta sendo corretamente marcado no campo de select do personagem na caixa de cada dialogo das cenas. O que esta errado aqui? O JSON gerado pelo export gera esta estrutura aqui /jarvis/rota-viva/doc/stories/story-modelo.json --- Onde esta o erro? E' na estrutura JSON que eu gerei, ou o erro e' na pagina de editar story?

Encontrei o problema. No story-ma1.json os diálogos usam character_id: "ma1_c1", mas ao importar, o servidor cria os personagens com novos IDs MongoDB (ex: 69eXXX...). O import remapeia next_scene_id entre cenas, mas não remapeia character_id dentro dos diálogos. O erro está na lógica de importação (e também na de duplicação). Preciso construir um charIdMap igual ao idMap das cenas e aplicar em cada dialogue.character_id. Precisa corrigir executeImport e executeDuplicate no list.js: Read 1 file (ctrl+o to expand). O problema está claro: tanto executeImport quanto executeDuplicate criam personagens e cenas em paralelo, então o charIdMap não está pronto quando as cenas são criadas. Preciso tornar a sequência serial (personagens → cenas) e remapear dialogue.character_id. Vou reescrever ambas as funções. 

PROMPT
Interior da agência bancária do Banco do Nordeste. Ambiente simples, balcão de atendimento. A atendente @img4 confere o CAF de Seu Zé @img3 e sorri. Ela abre uma pasta com folhetos do PRONAF e começa a explicar as modalidades disponíveis. Seu Zé escuta com atenção, segurando seus documentos. Cena transmite oportunidade, clareza e esperança.. A imagem deve ficar com o estilo do desenho Gravity Falls dessa forma @img2