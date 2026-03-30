# Trilhas de Aprendizado — Rota Viva

**Versão:** 0.4.0
**Data:** 2026-03-29

---

## Como ler este documento

Este documento define a estrutura pedagógica completa do app Rota Viva. A hierarquia de aprendizado segue o modelo Funifier:

```
Trilha (Subject)
  └── Módulo (Module)
        └── Lição (Lesson)  ← 1 lição = 1 conteúdo (ver nota abaixo)
              └── Conteúdo (Content: vídeo OU quiz — não ambos)
                    └── Questões (Questions: múltiplos tipos)
```

> **Decisão arquitetural — 1 lição = 1 conteúdo:** No app, cada lição é representada por uma "bolinha" no caminho em S. O ícone da bolinha indica o tipo de conteúdo:
>
> | `folder_content_type` | Ícone | Descrição |
> |---|---|---|
> | `video` | `fa-video` | Vídeo curto de 3–5 min |
> | `quiz` | `fa-star` | Quiz de conhecimento (MC, VF, ESSAY, etc.) |
> | `mission` | `fa-camera` | Missão de campo: DIY_PROJECT com upload de foto |
> | `game` | `fa-gamepad` | Jogo interativo |
> | `listen` | `fa-headphones` | Exercício de áudio (LISTEN / LISTEN_AND_ORDER) |
>
> Cada lição contém exatamente **1 content item**. Lições com DIY_PROJECT (evidência fotográfica) são separadas em bolinha própria do tipo `mission` — não ficam misturadas no quiz. ESSAY (Escuta Ativa) permanece no quiz por ser texto digitado na mesma sessão. As lições nas Trilhas A–G ainda estão descritas no formato antigo e serão desdobradas no cadastro.

**Trilhas A–G** correspondem aos 7 Objetivos Específicos (OEs) do projeto. Cada trilha existe em duas versões paralelas — uma para a **Rota do Mel (Colmeia Viva / Piauí)** e outra para a **Rota da Pesca (Rio em Movimento / Amapá)**. O conteúdo técnico varia entre rotas; a estrutura pedagógica e a progressão de dificuldade são espelhadas.

**Trilha Especial: Jovem Multiplicador** é compartilhada entre as duas rotas, com adaptações temáticas mínimas.

### Tipos de conteúdo por lição

| Tipo (`folder_content_type`) | Ícone | Descrição | Duração/Formato |
|------------------------------|-------|-----------|-----------------|
| `video` | `fa-video` | Vídeo curto, linguagem simples, close em mãos/rosto real | 3–5 min |
| `quiz` | `fa-star` | 3–5 questões de conhecimento. ESSAY (Escuta Ativa) fica aqui | Variado |
| `mission` | `fa-camera` | Missão de campo: 1 questão DIY_PROJECT com upload de foto | Livre |
| `game` | `fa-gamepad` | Jogo interativo (futuro) | — |
| `listen` | `fa-headphones` | Exercício de escuta LISTEN / LISTEN_AND_ORDER (futuro) | — |

### Tipos de questão no quiz

| Tipo | Código | Tipo Funifier (`Question.java`) | Config especial | Uso preferencial |
|------|--------|---------------------------------|-----------------|-----------------|
| Múltipla escolha (1 resposta) | MC1 | `MULTIPLE_CHOICE` | `select: "one_answer"` | Conceitos, definições, requisitos |
| Múltipla escolha (N respostas) | MCN | `MULTIPLE_CHOICE` | `select: "multiple_answers"` | Listas de documentos, etapas de processo |
| Verdadeiro/Falso | VF | `TRUE_FALSE` | — | Mitos e verdades sobre a atividade |
| Ordenação de etapas | ORD | `LISTEN_AND_ORDER` | `speechText` lê as etapas em voz alta; jogador arrasta para ordenar — ideal para baixa alfabetização | Processos sequenciais (como solicitar X) |
| Imagem correta | IMG | `MULTIPLE_CHOICE` | `one_answer`; URL de imagem nos choices | Identificação visual (animal, planta, documento) |
| Texto livre (Escuta Ativa) | TXT | `ESSAY` | `gradingMode: "ai"`; sempre concede VOZ points (grade positiva fixa) | Experiência pessoal, opinião, dados do território |
| Cenário/Situação | CEN | `MULTIPLE_CHOICE` | `one_answer`; narrativa da situação no campo `question` | Tomada de decisão prática ("O que você faria se...") |
| Evidência de campo | Evidência | `DIY_PROJECT` | `evidenceTypes: ["photo"]`, `gradingMode: "ai"` ou `"manual"`, `rubric` com critério de aceite | Tarefas práticas documentadas com foto |

> **Todos os tipos são nativos do Funifier** — nenhum exige desenvolvimento customizado. Os códigos MC1, MCN, VF, ORD, IMG, TXT, CEN e Evidência são atalhos de leitura deste documento; os valores reais no backend são os `type` constants de `Question.java`.

---

## Matriz Trilha × OE × JTBD do Jogador

| Trilha | OE | Dimensão | Foco | JTBD do produtor |
|--------|----|----------|------|------------------|
| **A** | OE1 | Cultural | Políticas públicas e instrumentos de fomento | "Quero saber quais programas posso acessar" |
| **B** | OE2 | Social | Futuro da atividade — jovens no campo | "Quero ver que existe futuro aqui" |
| **C** | OE3 | Social | Cooperação intergeracional e saberes | "Quero que meu conhecimento seja valorizado" |
| **D** | OE6 | Econômica | Renda, regularização e organização econômica | "Quero regularizar e vender com preço justo" |
| **E** | OE7 | Ambiental | Sustentabilidade, boas práticas, sanidade | "Quero produzir melhor e com mais qualidade" |
| **F** | OE5 | Social | Lideranças, mobilização e participação social | "Quero ter voz e ser referência na minha comunidade" |
| **G** | OE8 | Governança | Integridade, conduta e cidadania | "Quero conhecer meus direitos e deveres" |

---

---

# ROTA DO MEL — COLMEIA VIVA (Piauí)

---

## TRILHA DE INÍCIO — Conheça a Profissão
**Onboarding · OE3 · Desbloqueada primeiro · Obrigatória antes das Trilhas A–G**

**Por que esta trilha:** Esta trilha existe fora do eixo técnico (A–G). Sua função é criar pertencimento emocional antes de qualquer conteúdo burocrático. Quem passa por ela sai sabendo quem é, o que faz e por que vale a pena continuar. Deve ser completada antes das demais trilhas serem desbloqueadas.

---

### Módulo de Boas-Vindas — Conheça a Apicultura
**OE3 · Valorização da profissão**

**Por que este módulo:** Antes de aprender regulamentações e programas, o apicultor precisa se sentir **visto e valorizado** pelo que já sabe e pelo que faz. Este módulo inaugural cumpre três funções: (1) criar pertencimento imediato para o novo usuário; (2) oferecer aos jovens que estão aprendendo com os pais uma base sólida sobre a profissão; (3) ativar orgulho e sentido de identidade antes de qualquer conteúdo técnico. O apicultor sai daqui dizendo: *"minha profissão tem história, técnica e futuro."*

---

#### Lição 0.1 — O que é apicultura e por que ela importa *(vídeo)*
- **Vídeo:** Apicultor veterano (60+) e jovem apicultor (20s) lado a lado no apiário do Piauí. O veterano explica como aprendeu; o jovem conta por que ficou. Foco: "apicultura não é só tirar mel — é guardar natureza e criar futuro."

#### Lição 0.1 — O que é apicultura e por que ela importa *(quiz — todos os tipos)*

> **Nota de implementação:** Este quiz cobre **13 dos 14 tipos de Question** do Funifier, intencionalmente, para validar a renderização completa dos tipos no app. O 14º tipo (DIY_PROJECT) está na bolinha de Missão separada logo abaixo. As questões seguem o tema da lição mas foram escolhidas para exercitar cada tipo.

- **Quiz — 13 questões (uma por tipo):**

  1. **(MULTIPLE_CHOICE · one_answer)** Para que serve a apicultura além de produzir mel?
     - Só mel e cera
     - **Mel, cera, própolis, geleia real e pólen ✓**
     - Apenas mel e própolis
     - Mel e geleia somente

  2. **(MULTIPLE_CHOICE · multiple_answers)** Quais destes são produtos gerados pelas abelhas? *(marque todos que se aplicam)*
     - **Mel ✓**
     - **Própolis ✓**
     - **Cera ✓**
     - **Geleia real ✓**
     - Queijo
     - **Pólen ✓**

  3. **(TRUE_FALSE)** As abelhas são responsáveis pela polinização de mais de 70% das culturas agrícolas do mundo.
     - **Verdadeiro ✓**

  4. **(MATCHING)** Combine o produto apícola com sua descrição:
     - Mel → *Adoçante natural extraído do néctar das flores*
     - Própolis → *Resina com propriedade antimicrobiana e antifúngica*
     - Cera → *Usada na fabricação de velas, cosméticos e impermeabilizantes*
     - Geleia real → *Alimento exclusivo da abelha rainha, rico em proteínas*

  5. **(SHORT_ANSWER)** Como se chama o local onde o apicultor instala e mantém suas colmeias?
     - Resposta aceita: `apiário` (não sensível a maiúsculas)

  6. **(SELECT_MISSING_WORDS)** Complete a frase escolhendo as palavras corretas:
     > "As abelhas produzem [**mel** / cera / própolis] a partir do néctar das flores, e coletam [**pólen** / mel / resina] como fonte de proteína para a colmeia."

  7. **(DRAG_AND_DROP_INTO_TEXT)** Arraste as palavras para completar o texto:
     > "A apicultura é a criação de [**abelhas**] com o objetivo de aproveitar produtos como [**mel**], [**cera**] e [**própolis**], além de contribuir com a [**polinização**] das plantas."
     - Palavras disponíveis: `abelhas` · `mel` · `cera` · `própolis` · `polinização` · `pesticidas` · `colheita`

  8. **(ESSAY — Escuta Ativa)** O que a apicultura representa para você, sua família e sua comunidade? *(5 linhas — grade positiva fixa, ganha VOZ points)*

  9. **(CUSTOM)** Mapa interativo: toque no mapa do Piauí para marcar a região onde você produz mel. Sua marcação alimenta o mapa participativo do mel piauiense no Rota Viva.
     - *Tipo CUSTOM — lógica de mapa no frontend, sem validação de resposta certa/errada. grade = 1.*

  10. **(SPEAK)** Leia em voz alta a frase abaixo. Sua pronúncia será avaliada automaticamente:
      > *"Sou apicultor. Cuido das minhas abelhas com dedicação e produzo mel de qualidade para minha família e minha comunidade."*
      - `gradingMode: "ai"` · rubric: *"Verificar se o jogador leu a frase completa com fluidez mínima."*

  11. **(LISTEN)** Ouça o texto e responda:
      - `speechText`: *"A apicultura contribui para o meio ambiente através da polinização das plantas. Sem as abelhas, muitas culturas agrícolas não conseguiriam se reproduzir e a produção de alimentos seria gravemente afetada."*
      - Pergunta: Qual é o benefício ambiental da apicultura mencionado no áudio?
        - Produção de mel orgânico
        - **Polinização das plantas e contribuição para a produção de alimentos ✓**
        - Redução do uso de agrotóxicos
        - Controle de pragas agrícolas

  12. **(LISTEN_AND_ORDER)** Ouça as etapas da extração do mel e coloque-as na ordem correta:
      - `speechText`: *"Etapa 1: inspecionar as colmeias. Etapa 2: usar o fumigador. Etapa 3: remover os favos. Etapa 4: desopercular os favos. Etapa 5: centrifugar. Etapa 6: filtrar e envasar."*
      - Itens a ordenar (embaralhados no app):
        - Filtrar e envasar → posição 6
        - Usar o fumigador → posição 2
        - Centrifugar → posição 5
        - Inspecionar as colmeias → posição 1
        - Remover os favos → posição 3
        - Desopercular os favos → posição 4

  13. **(PROBLEM_SOLVING)** Um jovem quer começar na apicultura mas não tem recursos para comprar equipamentos nem colmeias. Como você o ajudaria a dar o primeiro passo?
      - `gradingMode: "ai"` · rubric: *"Resposta deve mencionar pelo menos uma estratégia concreta: buscar ATER/EMATER, associar-se a cooperativa como a COOAPI, acessar PRONAF Investimento, ou iniciar com colmeia rústica de baixo custo."*

#### Lição 0.1 — Missão de Campo
- `fa-camera` · content_type: `mission`

- **Quiz — 1 questão:**

  1. **(DIY_PROJECT)** Fotografe uma colmeia, um apiário ou flores que as abelhas visitam perto da sua casa. Sua foto vai compor o mapa do mel piauiense no Rota Viva!
     - `evidenceTypes: ["photo"]` · `gradingMode: "ai"` · rubric: *"Foto mostra colmeia, flores em contexto apícola ou paisagem de apiário. Aceitar imagens nítidas com contexto reconhecível."*

### Lição 0.2 — A organização da colmeia: como as abelhas trabalham
- **Vídeo:** Apicultor abre uma colmeia com câmera próxima: rainha, operárias, zangões. Linguagem de quintal, sem termos científicos desnecessários.
- **Quiz:**
  - (MC1) Qual é a função da abelha rainha na colmeia? [Produzir mais mel / Defender a colmeia / Pôr ovos e garantir a continuidade da colmeia ✓ / Buscar alimento]
  - (IMG) Qual destas imagens mostra uma abelha rainha? [mostra rainha / operária / zangão — identificar a rainha ✓]
  - (ORD) Coloque em ordem o ciclo de uma colmeia saudável: [Rainha põe ovos / Ovos tornam-se larvas / Operárias alimentam as larvas / Abelhas adultas assumem funções / Colmeia cresce e produz ✓]

### Lição 0.3 — O calendário do apicultor: floradas e safras
- **Vídeo:** Apicultor explica o ano apícola com calendário visual. Destaca as principais floradas do Piauí (angico, jurema, aroeira, marmeleiro). Fala sobre o que fazer em cada época.
- **Quiz:**
  - (MC1) O que é uma "florada"? [Uma flor ornamental / Um período em que as flores estão abertas e oferecem néctar às abelhas ✓ / Um tipo de mel / Uma praga das abelhas]
  - (MCN) Quais são as principais floradas da apicultura piauiense? [Angico ✓ / Pinheiro / Jurema ✓ / Aroeira ✓ / Marmeleiro ✓ / Girassol]
  - (CEN) É época de seca e as flores sumiram. O apicultor nota que as colmeias estão com pouco estoque de mel. O que ele deve fazer? [Esperar passivo / Oferecer alimentação artificial às colmeias ✓ / Vender as colmeias / Retirar o mel que resta]

### Lição 0.4 — Equipamentos essenciais do apicultor
- **Vídeo:** Apicultor apresenta e demonstra cada equipamento: macacão, luvas, fumigador, formão, meleira. Explica para que serve cada um e como cuidar.
- **Quiz:**
  - (IMG) Para que serve este equipamento? [mostra fumigador] [Matar insetos / Espantar as abelhas com fumaça para trabalhar na colmeia com segurança ✓ / Aquecer a colmeia / Purificar o mel]
  - (MCN) Quais equipamentos são obrigatórios para abrir uma colmeia com segurança? [Macacão ✓ / Luvas ✓ / Máscara/véu ✓ / Fumigador ✓ / Microscópio / Termômetro]
  - (TXT — Escuta Ativa) Qual equipamento você ainda não tem e faz falta no seu dia a dia?

### Lição 0.5 — O mel do Piauí no Brasil e no mundo *(3 bolinhas)*

#### Lição 0.5 — Vídeo
- `fa-video` · content_type: `video`
- Técnico do SEBRAE ou da COOAPI mostra o mapa do mel piauiense — um dos maiores produtores do Brasil. Explica a qualidade diferenciada (floradas nativas, baixíssima contaminação química).

#### Lição 0.5 — Quiz
- `fa-star` · content_type: `quiz`
- **Questões:**
  - (MC1) Em relação ao mel, o Piauí é: [Um estado que importa mel / Um dos maiores produtores de mel do Brasil ✓ / Um estado sem tradição apícola / Produtor apenas para consumo local]
  - (VF) O mel do semiárido piauiense tem qualidade diferenciada pela diversidade de floradas nativas e baixo uso de agrotóxicos. [Verdadeiro]
  - (TXT — Escuta Ativa) Quais são as principais dificuldades que você enfrenta para valorizar e vender seu mel hoje?

#### Lição 0.5 — Missão de Campo
- `fa-camera` · content_type: `mission` · 1 questão DIY_PROJECT
- **Questão:** Fotografe seu apiário ou as flores mais comuns perto das suas colmeias. Sua foto entra no mapa do mel piauiense do Rota Viva!
- `evidenceTypes: ["photo"]` · `gradingMode: "ai"` · rubric: *"Foto mostra colmeia, flores ou paisagem de apiário real. Aceitar imagens nítidas de contexto apícola."*

---

## TRILHA A — Conheça os Programas do Governo
**OE1 · Compreensão e uso de instrumentos públicos**

**Por que esta trilha:** O apicultor piauiense historicamente tem acesso fragmentado a políticas de apoio. Muitos não sabem que o CAF abre a porta para crédito, ATER e mercados institucionais. Esta trilha desmistifica a burocracia e transforma instrumentos públicos em ferramentas práticas — diretamente conectada ao desejo consciente de "descobrir quais programas posso acessar" e ao desejo inconsciente de "ser protagonista da política pública, não objeto dela."

---

### Módulo A.1 — Sua Identidade como Produtor

**Por que este módulo:** Antes de acessar qualquer programa, o apicultor precisa estar formalmente identificado como agricultor familiar. O CAF (antigo DAP) é o documento-chave que desbloqueia praticamente todos os demais benefícios.

#### Lição A.1.1 — O que é o CAF (Cadastro da Agricultura Familiar)
- **Vídeo:** Apicultor real explica como o CAF mudou o acesso dele a programas. Cenas: visita à EMATER/IDR, documento em mãos, fala sobre o antes e depois.
- **Quiz:**
  - (MC1) Para que serve o CAF? [opções: só para aposentadoria / para acessar crédito, ATER e mercados institucionais / para pagar menos imposto / não serve para apicultores]
  - (VF) O CAF substitui o antigo DAP (Declaração de Aptidão ao PRONAF). [Verdadeiro]
  - (MC1) Onde você emite o CAF? [EMATER / Cartório / Banco do Brasil / Prefeitura]
  - (TXT — Escuta Ativa) Você já tem o CAF? Se não, qual é a maior dificuldade para conseguir?

#### Lição A.1.2 — Como tirar o CAF: passo a passo
- **Vídeo:** Técnica da EMATER explica o processo com linguagem simples. Mostra os documentos necessários.
- **Quiz:**
  - (ORD) Coloque em ordem: [Reunir documentos / Ir à EMATER / Preencher formulário / Receber o CAF impresso]
  - (MCN) Quais documentos são necessários para o CAF? [RG ✓ / CPF ✓ / Comprovante de imóvel rural ✓ / CNPJ / Passaporte / Declaração de produção ✓]
  - (CEN) João quer pedir o CAF mas não tem escritura da terra — só mora e trabalha lá há 10 anos. O que ele deve fazer? [Desistir / Levar testemunhas e declaração de posse ✓ / Só consegue com escritura / Pedir emprestado o nome de outro]

#### Lição A.1.3 — Nota Fiscal de Produtor Rural
- **Vídeo:** Contador rural explica para que serve a nota fiscal, como emitir e por que ela aumenta o preço do mel.
- **Quiz:**
  - (VF) Sem nota fiscal, não é possível vender para supermercados ou para o governo. [Verdadeiro]
  - (MC1) Onde o apicultor solicita a Nota Fiscal de Produtor Rural? [Receita Federal / Secretaria de Fazenda do Estado (SEFAZ) ✓ / MAPA / Prefeitura]
  - (MC1) Qual é o principal benefício de emitir nota fiscal? [Pagar mais imposto / Ter um número de identificação / Acessar mercados formais e vender por preço justo ✓ / Nenhum benefício]

---

### Módulo A.2 — Registro Sanitário do Mel

**Por que este módulo:** A regularização sanitária é o maior gargalo técnico para o apicultor piauiense. SIF, SIE e SIM confundem. Esta trilha simplifica: explica a diferença, aponta qual é o mais acessível para cada realidade, e desmistifica o processo.

#### Lição A.2.1 — Por que o mel precisa de registro sanitário
- **Vídeo:** Médico veterinário da ADAPI/PI explica de forma simples. Foco: "o registro garante que seu mel é seguro e tem mais valor."
- **Quiz:**
  - (MC1) Qual o órgão responsável pela inspeção federal (SIF)? [ANVISA / IBAMA / MAPA ✓ / Prefeitura]
  - (VF) O SIM (Serviço de Inspeção Municipal) permite vender apenas dentro do município. [Verdadeiro]
  - (TXT — Escuta Ativa) Seu mel tem algum tipo de registro sanitário atualmente? Conte como foi o processo ou qual a dificuldade.

#### Lição A.2.2 — SIM, SIE ou SIF: qual é o certo para você?
- **Vídeo:** Comparativo visual dos três selos. Técnico explica: SIM = venda local; SIE = venda no estado; SIF = venda em todo o Brasil e exportação.
- **Quiz:**
  - (IMG) Qual é o selo de inspeção para venda em todo o Brasil? [mostra 3 selos: SIM / SIE / SIF ✓]
  - (CEN) Maria quer vender seu mel para uma rede de supermercados de São Paulo. Qual registro ela precisa? [SIM / SIE / SIF ✓ / Nenhum, pode vender sem registro]
  - (MC1) Para tirar o SIM, o apicultor vai onde? [MAPA em Brasília / ADAPI estadual / Vigilância Sanitária da Prefeitura ✓ / IBAMA]

#### Lição A.2.3 — Boas Práticas Apícolas (BPA) e a IN nº 11/2000
- **Vídeo:** Apicultor certificado mostra sua casa de mel e explica os pontos básicos de higiene exigidos pelo MAPA. Linguagem prática, nada técnico demais.
- **Quiz:**
  - (MCN) Quais práticas são exigidas pela BPA na casa de mel? [Paredes laváveis ✓ / Água potável disponível ✓ / Telhado de palha / Ralos com proteção ✓ / Equipamentos de inox ou material adequado ✓]
  - (VF) Pode-se usar a mesma faca para mexer na cera e no mel pronto para embalar. [Falso]
  - (ORD) Processo correto de extração: [Desopercular os favos / Centrifugar / Decantar / Filtrar / Envasar ✓]

#### Lição A.2.4 — Rotulagem do mel: o que não pode faltar
- **Vídeo:** Designer e técnica do SEBRAE mostram um rótulo correto. Explicam cada campo obrigatório.
- **Quiz:**
  - (MCN) O que é obrigatório no rótulo do mel? [Nome do produto ✓ / Peso líquido ✓ / CNPJ ou CPF do produtor ✓ / Foto do apicultor / Número do lote ✓ / Data de validade ✓]
  - (IMG) Qual destes rótulos está correto? [mostra 3 opções — um sem peso, um sem validade, um completo ✓]

---

### Módulo A.3 — Programas de Crédito e Fomento

**Por que este módulo:** Apicultores raramente sabem que existem linhas de crédito específicas para eles. PRONAF Custeio e Investimento para apicultura, Garantia-Safra, FNE — cada um tem sua janela e condição. Conhecer evita perder prazo.

#### Lição A.3.1 — PRONAF: o crédito da agricultura familiar
- **Vídeo:** Gerente do Banco do Brasil ou BNB explica o PRONAF com exemplos concretos de apicultores do Piauí. Referência real: apicultores da COOAPI (Cooperativa dos Apicultores do Piauí, Picos-PI) que usaram PRONAF para ampliar estrutura.
- **Quiz:**
  - (MC1) O PRONAF é uma linha de crédito para: [grandes fazendeiros / agricultores familiares com CAF ✓ / empresas agroindustriais / cooperativas apenas]
  - (MC1) Qual banco mais oferece o PRONAF no Piauí? [Banco do Brasil e BNB ✓ / Itaú / Nubank / Caixa Econômica Federal]
  - (MC1) O PRONAF Investimento serve para: [pagar dívidas / comprar insumos mensais / adquirir equipamentos e estrutura produtiva ✓ / pagar funcionários]
  - (TXT — Escuta Ativa) Você já tentou acessar alguma linha de crédito? Como foi a experiência?

#### Lição A.3.2 — Garantia-Safra e proteção contra seca
- **Vídeo:** Apicultor do sertão piauiense conta como o Garantia-Safra o salvou após uma seca. Técnico da EMATER explica os critérios.
- **Quiz:**
  - (VF) O Garantia-Safra é um seguro pago pelo governo para proteger o produtor em casos de seca ou excesso de chuva. [Verdadeiro]
  - (MC1) Para ter direito ao Garantia-Safra, o produtor precisa: [ser rico / ter CAF e estar cadastrado antes da perda ✓ / ter mais de 50 colmeias / ter seguro privado]

#### Lição A.3.3 — ATER: assistência técnica gratuita para o apicultor
- **Vídeo:** Técnica da EMATER-PI explica o que é ATER e como solicitar uma visita técnica.
- **Quiz:**
  - (MC1) ATER significa: [Apoio Técnico e Rural / Assistência Técnica e Extensão Rural ✓ / Ajuda Territorial para o Rural / Agência de Tecnologia Rural]
  - (CEN) Seu vizinho apicultor nunca recebeu visita técnica e não sabe como lidar com varroa. O que você indicaria? [Comprar um livro / Procurar a EMATER ou IDR-Piauí para solicitar ATER ✓ / Tentar resolver sozinho / Abandonar as colmeias]

---

### Módulo A.4 — Vender para o Governo

**Por que este módulo:** PAA e PNAE são os maiores mercados acessíveis para o apicultor familiar — e pouquíssimos sabem como participar. Esta é a conexão direta entre aprendizado e renda imediata.

#### Lição A.4.1 — O que é o PAA (Programa de Aquisição de Alimentos)
- **Vídeo:** Apicultor que vende mel pelo PAA conta sua história. Número concreto: quanto recebeu, quantas famílias abasteceu.
- **Quiz:**
  - (MC1) O PAA compra alimentos de: [qualquer empresa / exclusivamente de cooperativas / agricultores familiares com CAF ✓ / supermercados]
  - (VF) O PAA paga preço de mercado justo, geralmente melhor que o atravessador. [Verdadeiro]
  - (MC1) Para participar do PAA, o apicultor precisa obrigatoriamente de: [CNPJ / CAF e registro sanitário ✓ / 5 anos de atividade / ter mais de 10 hectares]

#### Lição A.4.2 — PNAE: mel na merenda escolar
- **Vídeo:** Nutricionista de escola municipal e apicultor parceiro explicam como funciona o PNAE. Foco: "30% da merenda deve vir da agricultura familiar."
- **Quiz:**
  - (MC1) Qual é o percentual mínimo da merenda escolar que deve ser comprado da agricultura familiar? [10% / 20% / 30% ✓ / 50%]
  - (ORD) Como participar do PNAE: [Tirar o CAF / Formar ou entrar em cooperativa/associação / Responder à chamada pública da prefeitura / Entregar os produtos ✓]
  - (TXT — Escuta Ativa) Você sabia que podia vender seu mel para a merenda escolar? O que acha que falta para isso acontecer no seu município?

#### Lição A.4.3 — Chamada Pública: o processo de compra do governo
- **Vídeo:** Técnica da CONAB explica o que é uma chamada pública e como o apicultor deve responder.
- **Quiz:**
  - (MC1) A chamada pública é: [uma reunião / um leilão para o maior preço / um processo de compra governamental sem licitação para agricultura familiar ✓ / uma fila de espera]
  - (VF) Um apicultor pode responder a uma chamada pública individualmente sem ser de uma associação. [Verdadeiro — mas associação tem mais facilidade]
  - (CEN) A prefeitura abriu chamada pública para mel, mas o edital exige nota fiscal e registro sanitário. Maria tem CAF mas ainda não tem registro. O que ela deve fazer? [Desistir / Ignorar o edital / Correr para regularizar o registro sanitário ✓ / Pedir para outro apicultor vender no lugar dela]

---

## TRILHA B — Futuro da Colmeia: Jovens e Inovação
**OE2 · Fixação de jovens no campo**

**Por que esta trilha:** A evasão juvenil é a ameaça silenciosa à continuidade da apicultura familiar piauiense. Esta trilha mostra concretamente que há futuro econômico e de protagonismo na apicultura — usando exemplos reais de jovens que ficaram e prosperaram. O objetivo não é pedagogia, é esperança e orgulho concretos.

---

### Módulo B.1 — Apicultura com Olhos Jovens

#### Lição B.1.1 — Histórias reais: jovens apicultores do Piauí
- **Vídeo:** 2–3 jovens (18–30 anos) contam por que ficaram, o que construíram, quanto faturam. Linguagem direta, sem discurso.
- **Quiz:**
  - (TXT — Escuta Ativa) O que mais te impediria de continuar na apicultura? E o que mais te faria ficar?
  - (VF) A apicultura pode ser uma fonte de renda suficiente para jovens sem precisar ir para a cidade. [Verdadeiro — com evidências do vídeo]

#### Lição B.1.2 — Tecnologia a favor do apicultor
- **Vídeo:** Jovem apicultor mostra como usa smartphone para monitorar colmeias, registrar produção e buscar preços de mercado.
- **Quiz:**
  - (MC1) O app Rota Viva pode ajudar o apicultor a: [só aprender / aprender E registrar produção E acessar programas ✓ / fazer cursos universitários / substituir a EMATER]
  - (MCN) Quais tecnologias já são usadas por apicultores modernos? [Sensores de temperatura nas colmeias ✓ / Aplicativos de monitoramento ✓ / Venda online de mel ✓ / Drones para polinização ✓ / Robôs colhedores de mel]

#### Lição B.1.3 — Novos produtos: além do mel
- **Vídeo:** Apicultor mostra linha de produtos: mel, própolis, pólen, cera para cosméticos. Explica a diferença de preço de cada um.
- **Quiz:**
  - (ORD) Coloque do menor para o maior valor por kg: [mel / própolis / geleia real ✓]
  - (MC1) A cera das colmeias pode ser usada para: [apenas velas / cosméticos, velas, enxertos e impermeabilização ✓ / somente alimentação / nada além de descarte]
  - (TXT — Escuta Ativa) Você já tentou produzir ou vender algum produto além do mel? Qual?

---

### Módulo B.2 — Meliponicultura: Abelhas Nativas sem Ferrão

#### Lição B.2.1 — O que são as abelhas nativas e por que são o futuro
- **Vídeo:** Pesquisadora da UFPI explica meliponicultura. Foco no mel de tiúba (patrimônio cultural piauiense) e no potencial de preço premium.
- **Quiz:**
  - (VF) O mel de abelhas nativas sem ferrão pode valer até 10 vezes mais que o mel de Apis mellifera. [Verdadeiro]
  - (IMG) Qual destas é uma abelha nativa sem ferrão do Piauí? [fotos de Apis mellifera / tiúba ✓ / maribondo]
  - (TXT — Escuta Ativa) Você conhece algum apicultor que cria abelhas nativas? Como é a experiência dele?

#### Lição B.2.2 — Como começar na meliponicultura
- **Vídeo:** Meliponicultor experiente mostra caixas racionais, locais de instalação e primeiros cuidados.
- **Quiz:**
  - (MC1) A meliponicultura é regulamentada por qual normativa do MAPA? [IN 21/2015 ✓ / Lei 9.605/98 / Decreto 6.514 / Não é regulamentada]
  - (MCN) Quais são vantagens da meliponicultura? [Abelhas não ferroam ✓ / Mel tem valor premium ✓ / Contribui para polinização de culturas ✓ / Produção muito maior que Apis mellifera / Não precisa de nenhum registro]

---

## TRILHA C — Saberes que Ficam: Cooperação Intergeracional
**OE3 · Diálogo entre gerações e preservação do conhecimento tradicional**

**Por que esta trilha:** O conhecimento ancestral sobre apicultura no Piauí — leitura da flora, comportamento das abelhas, ciclos climáticos — não está em nenhum livro. Ele mora nos apicultores mais velhos. Esta trilha valoriza esse saber explicitamente, cria o "encontro" formal entre gerações, e conecta ao desejo inconsciente de ser reconhecido como guardião do conhecimento.

---

### Módulo C.1 — O Saber que Você Já Tem

#### Lição C.1.1 — Conhecimento tradicional: o que é e por que importa
- **Vídeo:** Apicultor veterano (60+) e jovem apicultor conversam. O jovem pergunta, o velho responde. Vídeo emotivo, não didático.
- **Quiz:**
  - (TXT — Escuta Ativa) Qual é o conhecimento sobre apicultura que você aprendeu com seus pais ou avós que nunca viu escrito em lugar nenhum?
  - (VF) O conhecimento tradicional dos apicultores mais velhos tem tanto valor quanto o conhecimento técnico científico. [Verdadeiro]

#### Lição C.1.2 — Calendário floral do Piauí: quando as abelhas têm fartura
- **Vídeo:** Apicultor veterano e biólogo da UFPI explicam as plantas que florescem em cada mês. Filmado em campo, mostrando as plantas reais.
- **Quiz:**
  - (IMG) Qual é a planta que floresce no período de maior produção de mel no sertão piauiense? [marmeleiro / angico / jurema ✓ dependendo do mês / mamona]
  - (MC1) A leitura do calendário floral serve para: [fazer decoração / saber quando colher e quando não colher ✓ / escolher onde morar / nada específico]
  - (TXT — Escuta Ativa) Qual planta do seu território você considera a mais importante para suas abelhas? Por quê?

#### Lição C.1.3 — A Galeria de Saberes: registre e compartilhe
- **Vídeo:** Explicação de como usar a Galeria de Saberes no app para compartilhar fotos, dicas e práticas.
- **Evidência:** Tire uma foto de algo relacionado à sua prática apícola (colmeia, planta, ferramenta) e compartilhe na Galeria com uma legenda.
- **Quiz:**
  - (VF) Compartilhar seu conhecimento na Galeria ajuda outros apicultores e fortalece toda a rede. [Verdadeiro]

---

### Módulo C.2 — Gerações que se Encontram

#### Lição C.2.1 — O Programa Jovem Apicultor: mentoria entre gerações
- **Vídeo:** Apresenta o conceito de mentoria informal dentro das associações. Casos reais de duplas veterano–jovem.
- **Quiz:**
  - (CEN) Um jovem apicultor está desistindo porque perdeu metade das colmeias para varroa. Qual a melhor atitude de um apicultor veterano? [Deixar ele sair / Oferecer mentoria e dividir o que sabe ✓ / Dizer que ele não tem jeito / Comprar as colmeias dele por preço baixo]
  - (TXT — Escuta Ativa) Você já recebeu ou ofereceu mentoria para outro apicultor? Como foi?

---

## TRILHA D — Venda mais, Ganhe Justo
**OE6 · Renda, autonomia produtiva e organização econômica**

**Por que esta trilha:** A maior dor do apicultor piauiense é o "atravessador" — vender barato porque não tem outra saída. Esta trilha ataca este problema de três frentes: calcular o custo real, acessar mercados alternativos e se organizar coletivamente para ganhar escala.

---

### Módulo D.1 — Quanto Vale o Seu Mel

#### Lição D.1.1 — Como calcular o custo real de produção
- **Vídeo:** Técnica do SEBRAE ensina planilha simples de custo. Inclui: insumos, mão de obra, transporte, depreciação de equipamentos.
- **Quiz:**
  - (MC1) O preço mínimo que você deve cobrar pelo seu mel deve cobrir: [só os insumos / só o trabalho / todos os custos de produção E uma margem de lucro ✓ / o preço que o atravessador oferece]
  - (CEN) João calcula que seu mel custa R$ 18/kg para produzir. O atravessador oferece R$ 15/kg. O que João deve fazer? [Aceitar, é o preço de mercado / Verificar outros canais de venda antes de aceitar ✓ / Parar de produzir / Aumentar a produção para compensar]
  - (Evidência) Calcule o custo de produção de 1 kg do seu mel usando a planilha do vídeo. Tire foto da planilha preenchida.

#### Lição D.1.2 — Estratégias de precificação
- **Vídeo:** Apicultor que migrou do atravessador para venda direta conta sua trajetória e os números reais.
- **Quiz:**
  - (MCN) Quais estratégias aumentam o preço do mel? [Embalagem atrativa ✓ / Rótulo com história do produtor ✓ / Certificação de origem ✓ / Vender mais barato que todos / Mel de variedade específica (tiúba, cipó, etc.) ✓]

---

### Módulo D.2 — Canais de Venda

#### Lição D.2.1 — Venda direta: feiras, cestas e WhatsApp
- **Vídeo:** Apicultora mostra como vende diretamente: feira do produtor, grupo de WhatsApp, entrega na cidade.
- **Quiz:**
  - (VF) Vender direto para o consumidor final sempre gera mais renda que vender para o atravessador. [Verdadeiro em geral, mas depende do volume]
  - (TXT — Escuta Ativa) Você já tentou vender seu mel diretamente para o consumidor? Qual foi o maior obstáculo?

#### Lição D.2.2 — Feiras da Agricultura Familiar
- **Vídeo:** Coordenador de feira municipal explica como o produtor pode participar. Requisitos, espaço, custos.
- **Quiz:**
  - (MC1) Para participar de uma feira da agricultura familiar, o produtor geralmente precisa de: [CNPJ / CAF e registro sanitário básico ✓ / Ter mais de 5 funcionários / Somente da vontade, sem documentação]

#### Lição D.2.3 — E-commerce básico: vender mel pela internet
- **Vídeo:** Jovem apicultor mostra como vende pelo Instagram e Mercado Livre. Dicas práticas de foto e descrição do produto.
- **Quiz:**
  - (VF) Para vender mel pela internet, o produto precisa ter nota fiscal e estar regularmente embalado. [Verdadeiro]
  - (MCN) Boas fotos de mel para venda online devem mostrar: [a cor do mel em recipiente transparente ✓ / o rótulo completo ✓ / o apicultor com o produto ✓ / apenas o preço / a colmeia de origem ✓]

---

### Módulo D.3 — Força Coletiva

#### Lição D.3.1 — Por que a associação aumenta sua renda
- **Vídeo:** Presidente de associação de apicultores piauiense explica: como compraram equipamentos juntos, como responderam ao PAA em grupo, quanto cada um ganhou.
- **Quiz:**
  - (MC1) A compra coletiva de insumos pela associação beneficia os membros porque: [o presidente negocia sozinho / em grandes volumes, o preço unitário cai ✓ / o governo paga a diferença / não há benefício real]
  - (TXT — Escuta Ativa) Você faz parte de alguma associação ou cooperativa? O que funciona bem e o que poderia melhorar?

#### Lição D.3.2 — Como criar uma associação de apicultores
- **Vídeo:** Advogado do SEBRAE e presidente de associação piauiense explicam o processo. Referência concreta: COOAPI (Cooperativa dos Apicultores do Piauí, Picos-PI) como modelo de escala — agrega centenas de apicultores familiares, tem SIF federal e exporta mel para Europa e EUA.
- **Quiz:**
  - (MC1) O número mínimo de membros para criar uma associação é: [2 / 5 / 7 ✓ / 20]
  - (ORD) Etapas para criar uma associação: [Reunir pelo menos 7 pessoas interessadas / Elaborar o estatuto / Fazer a assembleia de fundação / Registrar em cartório ✓]

---

## TRILHA E — Cuide da Colmeia, Cuide do Planeta
**OE7 · Sustentabilidade socioambiental e boas práticas sanitárias**

**Por que esta trilha:** Manejo correto e sustentabilidade não são "boa intenção" — são o que garante a continuidade da produção. Apicultores que manejam bem têm abelhas mais saudáveis, mel de mais qualidade e menor custo de produção. O viés ambiental conecta ao desejo inconsciente de "ser guardião da Caatinga."

---

### Módulo E.1 — Saúde das Abelhas

#### Lição E.1.1 — Varroa destructor: a maior ameaça às suas colmeias
- **Vídeo:** Médico veterinário da ADAPI-PI explica varroa com imagens reais. Como identificar, como tratar, quando tratar.
- **Quiz:**
  - (IMG) Qual destas imagens mostra infestação por varroa? [3 imagens de colmeias — 1 saudável, 1 com varroa visível ✓, 1 com loque]
  - (MC1) O momento correto de tratar a varroa é: [quando já perdeu metade das abelhas / quando detectar os primeiros sinais, antes do colapso ✓ / sempre, o ano todo, sem parar / nunca, a varroa se resolve sozinha]
  - (CEN) Ao abrir a colmeia, você encontra abelhas com asas deformadas e pernas tortas. O que provavelmente está acontecendo? [Envenenamento por agrotóxico / Infestação por varroa ✓ / Falta de néctar / Rainha velha]

#### Lição E.1.2 — Loque americana e europeia: prevenção e controle
- **Vídeo:** Técnica do MAPA explica as duas doenças com imagens e o protocolo obrigatório de notificação.
- **Quiz:**
  - (VF) A loque americana é uma doença de notificação obrigatória ao MAPA. [Verdadeiro]
  - (MCN) Como prevenir doenças bacterianas nas colmeias? [Não misturar material de colmeias doentes com saudáveis ✓ / Desinfetar equipamentos regularmente ✓ / Manter colmeias fortes e com rainha jovem ✓ / Usar antibióticos preventivamente sem prescrição / Eliminar favos envelhecidos regularmente ✓]

#### Lição E.1.3 — Uso correto de medicamentos veterinários
- **Vídeo:** Médico veterinário explica quais produtos são permitidos, quais são proibidos e o período de carência antes da colheita.
- **Quiz:**
  - (VF) Pode-se usar qualquer antibiótico no mel durante a produção para garantir qualidade. [Falso — contamina o mel e é ilegal]
  - (MC1) O que é "período de carência" no uso de medicamentos apícolas? [Tempo de espera para o medicamento fazer efeito / Tempo após o tratamento em que o mel NÃO pode ser colhido ✓ / Período proibido para tratar / Tempo mínimo de armazenamento do mel]

---

### Módulo E.2 — Boas Práticas na Casa de Mel

#### Lição E.2.1 — Higiene na extração: do favo ao pote
- **Vídeo:** Filmagem real de uma extração com boas práticas: roupas limpas, equipamentos lavados, ambiente fechado, coagem adequada.
- **Quiz:**
  - (ORD) Processo correto de extração higiênica: [Lavar mãos e equipamentos / Usar EPI limpo / Desopercular em ambiente fechado / Centrifugar / Coar / Decantar 24–48h / Envasar ✓]
  - (VF) O mel pode ser extraído ao ar livre em dias de vento forte sem problemas. [Falso — contamina com poeira e atrai abelhas]

#### Lição E.2.2 — Armazenamento correto do mel
- **Vídeo:** Técnica de qualidade explica temperatura, embalagem e prazo. Mostra o que acontece com mel mal armazenado (fermentação).
- **Quiz:**
  - (MC1) A temperatura ideal para armazenar mel é: [abaixo de 0°C / entre 18–24°C em local seco e arejado ✓ / qualquer temperatura, mel não estraga / acima de 40°C para manter líquido]
  - (VF) O mel cristalizado é mel estragado e deve ser descartado. [Falso — cristalização é natural e pode ser revertida]

---

### Módulo E.3 — O Apicultor e a Caatinga

#### Lição E.3.1 — Flora apícola nativa: conheça e preserve
- **Vídeo:** Biólogo e apicultor caminham pela Caatinga e identificam as principais plantas melíferas: angico, jurema, marmeleiro, velame, cipó-uva.
- **Quiz:**
  - (IMG) Qual é a flor de jurema? [3 fotos de flores — jurema ✓, marmeleiro, angico]
  - (TXT — Escuta Ativa) Qual planta nativa da sua região você considera mais importante para as abelhas? Já notou alguma redução dessa planta?
  - (Evidência) Fotografe uma planta melífera nativa próxima às suas colmeias e identifique-a na Galeria de Saberes.

#### Lição E.3.2 — Apicultura e mudanças climáticas no sertão
- **Vídeo:** Pesquisador da EMBRAPA Meio-Norte fala sobre o impacto das secas prolongadas na apicultura e estratégias de adaptação.
- **Quiz:**
  - (MC1) Uma estratégia para reduzir o impacto da seca nas colmeias é: [abandonar a apicultura / migrar as colmeias para regiões com florada disponível (apicultura migratória) ✓ / alimentar artificialmente o ano todo / não fazer nada]
  - (TXT — Escuta Ativa) Como a seca ou as mudanças do clima afetaram sua produção nos últimos anos?

---

## TRILHA F — Sua Voz Vale: Liderança e Participação
**OE5 · Mobilização, lideranças e participação social**

**Por que esta trilha:** O apicultor que conclui as trilhas A–E já tem conhecimento técnico. Esta trilha ativa o nível seguinte: usar esse conhecimento para influenciar políticas públicas, mobilizar a comunidade e exercer liderança. Conecta ao desejo inconsciente de "ser protagonista da política pública, não apenas objeto dela."

---

### Módulo F.1 — Sua Participação Importa

#### Lição F.1.1 — O que é o Conselho Municipal de Desenvolvimento Rural (CMDR)
- **Vídeo:** Presidente do CMDR de um município piauiense explica o que é, como funciona e como o apicultor pode participar.
- **Quiz:**
  - (MC1) O CMDR tem poder de: [aprovar orçamento federal / definir prioridades de investimento rural no município e influenciar políticas locais ✓ / substituir a prefeitura / prender infratores]
  - (TXT — Escuta Ativa) Existe CMDR ativo no seu município? Você já participou de alguma reunião?

#### Lição F.1.2 — Como participar de audiências públicas
- **Vídeo:** Técnica do MIDR explica o que é uma audiência pública e como o produtor pode se inscrever para falar.
- **Quiz:**
  - (ORD) Para falar em uma audiência pública: [Saber a data e local / Se inscrever com antecedência / Preparar seu depoimento (máx. 3 minutos) / Falar de forma direta e com exemplos concretos ✓]
  - (TXT — Escuta Ativa) Se você pudesse falar para o governo sobre a apicultura no seu município, o que diria?

#### Lição F.1.3 — A Escuta Ativa do Rota Viva: você é fonte de política pública
- **Vídeo:** Coordenadora do projeto explica como as respostas dos apicultores no app chegam diretamente ao MIDR.
- **Quiz:**
  - (VF) As respostas que você dá no app Rota Viva são usadas para embasar decisões de política pública. [Verdadeiro]
  - (TXT — Escuta Ativa) Qual é a demanda mais urgente que os apicultores do seu município têm hoje e que o governo deveria resolver?

---

## TRILHA G — Integridade e Cidadania
**OE8 · Governança, integridade e conduta**

**Por que esta trilha:** Projetos governamentais são alvos de desvios. Esta trilha equipa o produtor para ser não apenas beneficiário, mas guardião da integridade do projeto. Linguagem acessível, sem tom acusatório — foco em direitos e canais.

---

### Módulo G.1 — Seus Direitos como Participante

#### Lição G.1.1 — O que o projeto Rota Viva pode e não pode fazer
- **Vídeo:** Coordenadora do projeto explica o escopo, o que é prometido, o que não é, e os canais de suporte.
- **Quiz:**
  - (VF) O app Rota Viva pode garantir automaticamente acesso ao PAA só por você se cadastrar. [Falso — o app ensina como acessar; o acesso depende de regularização]
  - (MCN) Quais são direitos do participante do Rota Viva? [Acessar o conteúdo gratuitamente ✓ / Receber certificado ao concluir trilhas ✓ / Ter seus dados protegidos ✓ / Receber dinheiro mensalmente / Ser consultado sobre o projeto ✓]

#### Lição G.1.2 — Como e quando denunciar irregularidades
- **Vídeo:** Ouvidor do MIDR explica os canais: ouvidoria online, 0800, app. Linguagem direta.
- **Quiz:**
  - (MC1) O canal oficial de denúncias do Governo Federal é: [delegacia / Ouvidoria do MIDR / Rádio comunitária / Vereador]
  - (VF) Uma denúncia pode ser feita de forma anônima pela ouvidoria. [Verdadeiro]
  - (TXT — Escuta Ativa) Você já usou algum canal de ouvidoria ou denúncia? Como foi?

#### Lição G.1.3 — Uso correto dos recursos públicos
- **Vídeo:** Caso fictício animado: produtor que usou crédito do PRONAF para outra finalidade e as consequências. Linguagem didática, não punitiva.
- **Quiz:**
  - (CEN) João recebeu crédito PRONAF para comprar equipamentos apícolas. Um amigo pede emprestado o dinheiro prometendo devolver. O que João deve fazer? [Emprestar, amigo paga / Usar o dinheiro para o fim declarado no contrato ✓ / Guardar o dinheiro para emergências / Devolver o crédito ao banco]

---

---

# ROTA DA PESCA — RIO EM MOVIMENTO (Amapá)

---

## Módulo de Boas-Vindas — Conheça a Pesca Artesanal
**Onboarding · OE3 · Valorização da profissão**

**Por que este módulo:** Pescadores artesanais do Amapá são guardiões de um conhecimento milenar sobre os rios amazônicos — mas raramente são reconhecidos como tal por programas públicos. Este módulo cria pertencimento imediato, valoriza os saberes já existentes e oferece aos jovens que estão aprendendo com os pais uma base sólida sobre a profissão. O pescador sai daqui dizendo: *"sou um profissional, não só alguém que pescou a vida toda."*

---

### Lição 0.1 — O que é pesca artesanal e por que ela importa
- **Vídeo:** Pescador veterano (60+) e jovem pescador (20s) na beira do rio. O veterano fala sobre o rio como "nossa roça". O jovem conta por que ficou. Foco: "pescador artesanal não é só quem pesca — é quem cuida do rio para as gerações futuras."
- **Quiz:**
  - (VF) A pesca artesanal representa mais de 50% do pescado consumido no Brasil. [Verdadeiro]
  - (MC1) O que diferencia o pescador artesanal do pescador industrial? [O tamanho do peixe / Uso de embarcações e técnicas de pequena escala, voltado ao sustento familiar ✓ / O estado onde mora / Ter carteira profissional]
  - (TXT — Escuta Ativa) Você aprendeu a pescar com quem? Como foi esse aprendizado?

### Lição 0.2 — Os rios do Amapá: ecossistema e espécies
- **Vídeo:** Pescador e pesquisador do IEPA (Instituto de Pesquisas Científicas do Amapá) mostram o Rio Araguari, o estuário do Rio Amazonas ou lagos próximos a Macapá. Identificam as espécies mais pescadas: tucunaré, tambaqui, dourada, pirarucu, camarão-regional.
- **Quiz:**
  - (IMG) Qual é esta espécie? [mostra tucunaré / tambaqui / dourada — identificar o tucunaré ✓]
  - (MCN) Quais são as espécies mais pescadas nos rios do Amapá? [Tucunaré ✓ / Tambaqui ✓ / Dourada ✓ / Pirarucu ✓ / Camarão-regional ✓ / Salmão]
  - (TXT — Escuta Ativa) Qual espécie você mais pesca? Em que época do ano ela é mais abundante no seu rio?

### Lição 0.3 — Técnicas tradicionais: como o pescador trabalha
- **Vídeo:** Pescador demonstra ao vivo: tarrafa, malhadeira, espinhel, zagaia e matapi (para camarão). Explica quando usa cada técnica e por que algumas têm restrições ambientais.
- **Quiz:**
  - (IMG) Para que serve este equipamento? [mostra matapi] [Para pescar peixe grande / Para capturar camarão-regional ✓ / Para marcar território / Para armazenar pescado]
  - (MCN) Quais são técnicas de pesca artesanal usadas no Amapá? [Tarrafa ✓ / Malhadeira ✓ / Espinhel ✓ / Zagaia ✓ / Rede de arrasto industrial / Matapi ✓]
  - (CEN) Um pescador percebe que sua malhadeira está retendo muitos peixes pequenos antes da época de reprodução. O que ele deve fazer? [Guardar o peixe / Trocar por malha maior para liberar os filhotes ✓ / Ignorar / Vender antes de outros chegarem]

### Lição 0.4 — Embarcações e equipamentos do pescador artesanal
- **Vídeo:** Pescador mostra sua canoa ou barco, explica os itens de segurança obrigatórios (colete, extintor, sinalização), como conservar o pescado no gelo e os cuidados com o motor.
- **Quiz:**
  - (MC1) Por que o gelo é essencial para o pescador artesanal? [Refresca a bebida / Conserva o pescado e mantém a qualidade para venda ✓ / É exigência do IBAMA / Para fazer drinks]
  - (MCN) Quais itens de segurança são obrigatórios na embarcação? [Colete salva-vidas ✓ / Extintor de incêndio ✓ / Sinalizador visual ✓ / Radar / Âncora ✓]
  - (TXT — Escuta Ativa) Qual é o maior problema ou custo de manutenção da sua embarcação ou equipamento hoje?

### Lição 0.5 — O pescador artesanal como guardião dos rios da Amazônia
- **Vídeo:** Pesquisador do IBAMA-AP e liderança da COOPESCA-AP ou Colônia Z-1 falam sobre o papel do pescador no monitoramento ambiental. Casos reais de pescadores que identificaram mudanças no rio antes dos órgãos oficiais.
- **Quiz:**
  - (VF) Os pescadores artesanais são frequentemente os primeiros a perceber mudanças no ecossistema dos rios, como queda de estoques e contaminação. [Verdadeiro]
  - (MC1) O que é uma RESEX (Reserva Extrativista)? [Uma área proibida para pesca / Uma área protegida onde comunidades tradicionais podem pescar de forma sustentável ✓ / Uma fábrica de peixe / Uma cooperativa de pesca]
  - (Evidência — DIY_PROJECT) Fotografe um ponto do seu rio onde você percebeu mudança nos últimos anos (mais ou menos peixe, assoreamento, lixo). Esta foto alimenta o mapa dos rios do Amapá no Rota Viva! [rubric: "Foto mostra rio, lago, margem ou embarcação em contexto real de pesca artesanal no Amapá. Aceitar imagens nítidas com contexto reconhecível."]

---

## TRILHA A — Conheça os Programas do Governo
**OE1 · Compreensão e uso de instrumentos públicos**

**Por que esta trilha:** O pescador artesanal do Amapá vive na informalidade por falta de informação, não por falta de interesse. Seguro-defeso perdido por não saber o prazo, RGP não renovado por desconhecer o processo, PAA inacessível por falta de CAF — todos são problemas de informação, não de vontade. Esta trilha ataca diretamente o desejo consciente de "formalizar minha atividade e acessar benefícios."

---

### Módulo A.1 — Sua Identidade como Pescador

#### Lição A.1.1 — CAF para pescadores: a porta de entrada
- **Vídeo:** Pescadora artesanal do Amapá conta como o CAF mudou o acesso dela a crédito e ao seguro-defeso.
- **Quiz:**
  - (MC1) O CAF é emitido por: [IBAMA / EMATER ou entidade credenciada ✓ / Cartório / INSS]
  - (VF) O pescador artesanal pode obter o CAF mesmo sem ter terra própria. [Verdadeiro — atividade pesqueira qualifica]
  - (TXT — Escuta Ativa) Você tem CAF? Se não, qual é a maior dificuldade para conseguir?

#### Lição A.1.2 — RGP: Registro Geral da Atividade Pesqueira
- **Vídeo:** Técnico do MAPA/SAP explica o RGP: o que é, quem precisa, onde tirar, quanto custa (gratuito).
- **Quiz:**
  - (MC1) O RGP é emitido por qual órgão? [IBAMA / SAP (Secretaria de Aquicultura e Pesca) do MAPA ✓ / Prefeitura / Colônia de Pescadores]
  - (ORD) Para tirar o RGP: [Reunir documentos (RG, CPF, comprovante de residência) / Ir à unidade do MAPA ou credenciada / Preencher formulário / Aguardar aprovação e retirar carteira ✓]
  - (MCN) Quais documentos são necessários para o RGP? [RG ✓ / CPF ✓ / Comprovante de residência ✓ / Escritura de terra / Declaração de atividade pesqueira ✓ / CNPJ]

#### Lição A.1.3 — Colônia de Pescadores: o que é e por que se filiar
- **Vídeo:** Presidente de uma Colônia do Amapá (ex: Colônia Z-1 de Santana-AP ou Colônia Z-3 de Macapá-AP) explica o papel da Colônia na defesa dos direitos dos pescadores e no acesso ao seguro-defeso. Menciona a FEPA-AP (Federação dos Pescadores do Amapá) como instância estadual de representação.
- **Quiz:**
  - (VF) Estar filiado à Colônia de Pescadores é obrigatório para solicitar o seguro-defeso. [Verdadeiro]
  - (MC1) A Colônia de Pescadores é: [um sindicato de pesca industrial / uma entidade representativa de pescadores artesanais ✓ / um órgão governamental / uma cooperativa de venda]
  - (TXT — Escuta Ativa) Você é filiado à Colônia? O que a Colônia faz bem e o que poderia melhorar no seu município?

---

### Módulo A.2 — Seguro-Defeso: Seu Direito, Seu Sustento

**Por que este módulo:** O seguro-defeso é o maior benefício governamental direto para o pescador artesanal — e o mais perdido por prazo e documentação. Módulo prioritário, com máxima clareza pedagógica.

#### Lição A.2.1 — O que é o seguro-defeso e quem tem direito
- **Vídeo:** Pescador que recebe o seguro-defeso explica em suas próprias palavras. Técnica do MAPA confirma os critérios.
- **Quiz:**
  - (MC1) O seguro-defeso é pago durante: [férias do pescador / o período de proibição da pesca (defeso) para proteger a reprodução dos peixes ✓ / sempre que o pescador quiser / doenças do pescador]
  - (MCN) Para ter direito ao seguro-defeso, o pescador precisa: [ter RGP ativo ✓ / estar filiado à Colônia ✓ / ter CAF ✓ / comprovar que pesca há pelo menos 1 ano ✓ / ter CNPJ / não ter outra renda formal ✓]
  - (VF) O pescador que trabalha com carteira assinada em outra profissão pode receber o seguro-defeso. [Falso]

#### Lição A.2.2 — Períodos de defeso no Amapá: quais espécies e quando
- **Vídeo:** Biólogo do IBAMA/MAPA explica os períodos de defeso aplicáveis ao Amapá. Foco nas espécies principais: dourada, mapará, tucunaré, pirarucu.
- **Quiz:**
  - (IMG) Qual é o pirarucu? [3 fotos de peixes — pirarucu ✓, dourada, tucunaré]
  - (MC1) O defeso da piracema no Amapá ocorre geralmente entre: [janeiro–março / outubro–fevereiro ✓ — checar portaria vigente / maio–agosto / não existe defeso no Amapá]
  - (TXT — Escuta Ativa) Quais espécies você mais pesca? Você já notou redução na quantidade dessas espécies nos rios?

#### Lição A.2.3 — Como solicitar o seguro-defeso: passo a passo
- **Vídeo:** Assistente social walk-through do processo: do cadastro no MAPA ao pagamento no banco.
- **Quiz:**
  - (ORD) Como solicitar o seguro-defeso: [Ter RGP e CAF ativos / Estar filiado à Colônia / Fazer cadastro no MAPA ou Colônia antes do início do defeso / Aguardar análise / Receber via Caixa Econômica Federal ✓]
  - (MC1) O pagamento do seguro-defeso é feito por: [Prefeitura / INSS / Caixa Econômica Federal ✓ / Colônia de Pescadores]
  - (CEN) Pedro não se cadastrou a tempo para o seguro-defeso este ano. O que ele deve fazer para garantir o próximo? [Esperar e tentar no ano que vem sem se preparar / Entrar em contato com a Colônia e MAPA ANTES do próximo período de defeso para garantir o cadastro ✓ / Pedir emprestado para um colega / Reclamar que o governo não avisou]

#### Lição A.2.4 — Documentos e prazos: não perca seu direito
- **Vídeo:** Apresenta checklist visual. Cena de dramatização: pescador que perdeu o prazo vs. pescador que se preparou.
- **Quiz:**
  - (MCN) Documentos necessários para o seguro-defeso: [RGP atualizado ✓ / CAF válido ✓ / Comprovante de filiação à Colônia ✓ / Declaração de que não tem emprego formal ✓ / CNPJ / Passaporte]
  - (Evidência) Fotografe seu RGP ou seu comprovante de filiação à Colônia para registrar no seu Diário do Pescador.

---

### Módulo A.3 — Crédito e Fomento para Pescadores

#### Lição A.3.1 — PRONAF Pesca: o crédito para quem pesca
- **Vídeo:** Gerente do BASA (Banco da Amazônia) explica linhas específicas do PRONAF para pesca no Amapá: custeio (compra de insumos) e investimento (compra de barco, motor, rede). Nota: o BASA é o principal banco operador do PRONAF na região Norte/Amapá.
- **Quiz:**
  - (MC1) Com o PRONAF Investimento, um pescador pode comprar: [terra / barco, motor, equipamentos de pesca ✓ / carro particular / imóvel urbano]
  - (TXT — Escuta Ativa) Você já tentou crédito para melhorar sua estrutura de pesca? Como foi?

#### Lição A.3.2 — ATER para pescadores artesanais
- **Vídeo:** Técnica do RURAP (Instituto de Desenvolvimento Rural do Amapá) explica os serviços gratuitos de ATER disponíveis para pescadores: apoio ao RGP, orientação sobre defeso, práticas de conservação.
- **Quiz:**
  - (VF) O serviço de ATER é gratuito para pescadores artesanais com CAF. [Verdadeiro]
  - (MC1) Qual órgão oferece ATER para pescadores no Amapá? [IBAMA / RURAP — Instituto de Desenvolvimento Rural do Amapá ✓ / Colônia apenas / Prefeitura apenas]

---

### Módulo A.4 — Vender para o Governo

#### Lição A.4.1 — PAA para pescadores: vender peixe para o governo
- **Vídeo:** Pescador que vende tambaqui pelo PAA conta como conseguiu, os preços que recebe e a regularidade do pagamento.
- **Quiz:**
  - (VF) Pescadores artesanais podem participar do PAA se tiverem CAF e registro sanitário básico. [Verdadeiro]
  - (TXT — Escuta Ativa) Você já ouviu falar do PAA antes? O que você acha que falta para pescadores do seu município acessar o programa?

#### Lição A.4.2 — PNAE: peixe na merenda escolar
- **Vídeo:** Nutricionista e pescador cooperado explicam como funciona a venda de peixe fresco para escolas públicas do Amapá.
- **Quiz:**
  - (MC1) Para vender peixe para o PNAE, o pescador precisa obrigatoriamente de: [CNPJ próprio / CAF + registro sanitário + associação/cooperativa ✓ / ter mais de 10 anos de atividade / nenhum documento]
  - (CEN) A prefeitura abriu chamada pública para peixe, mas exige inspeção sanitária (SIM). A Colônia ainda não tem SIM. O que o grupo de pescadores deve fazer? [Ignorar o edital / Reclamar que é muita burocracia / Buscar orientação na Vigilância Sanitária para viabilizar o SIM para o grupo ✓ / Vender para atravessador mesmo]

---

## TRILHA B — Futuro nos Rios: Jovens na Pesca
**OE2 · Fixação de jovens no campo**

**Por que esta trilha:** Jovens pescadores do Amapá enfrentam a mesma tensão: ficar nos rios ou ir para Macapá/Belém. Esta trilha mostra que pesca artesanal sustentável pode ser uma carreira com renda, propósito e identidade cultural forte — não uma atividade de subsistência.

---

### Módulo B.1 — Pescadores Jovens que Escolheram Ficar

#### Lição B.1.1 — Histórias reais: jovens pescadores do Amapá
- **Vídeo:** 2–3 jovens (18–30 anos) pescadores contam por que ficaram, o que constroem, sua relação com o Rio Amazonas.
- **Quiz:**
  - (TXT — Escuta Ativa) O que te faria considerar continuar na pesca artesanal? O que poderia tornar essa escolha mais atraente?

#### Lição B.1.2 — Tecnologia e inovação na pesca artesanal
- **Vídeo:** Jovem pescador mostra como usa GPS, apps de previsão climática e grupos de WhatsApp para coordenar a pesca e venda.
- **Quiz:**
  - (MCN) Quais tecnologias podem ajudar o pescador artesanal? [GPS/smartphone para navegação ✓ / Apps de previsão do tempo ✓ / Grupos de venda online ✓ / Robôs de pesca automáticos / Caixas de gelo de isopor ✓ — simples mas eficaz]

#### Lição B.1.3 — Piscicultura: criar peixe como renda complementar
- **Vídeo:** Pescador artesanal que criou um tanque de tambaqui como renda complementar no período de defeso.
- **Quiz:**
  - (VF) A piscicultura em pequena escala pode complementar a renda do pescador durante o defeso. [Verdadeiro]
  - (TXT — Escuta Ativa) Você já pensou em cultivar peixe além de pescar? O que seria necessário para isso na sua realidade?

---

### Módulo B.2 — Valor Cultural da Pesca Artesanal

#### Lição B.2.1 — Pesca artesanal como patrimônio cultural do Amapá
- **Vídeo:** Documentário curto: imagens de pescadores em canoas, técnicas de lançamento de tarrafa, conhecimento dos rios.
- **Quiz:**
  - (TXT — Escuta Ativa) Qual técnica ou conhecimento de pesca você aprendeu com seus pais ou avós que considera um tesouro?

#### Lição B.2.2 — Ecoturismo e pesca esportiva: novas fontes de renda
- **Vídeo:** Pescador que guia turistas explica como transformou seu conhecimento dos rios em renda adicional.
- **Quiz:**
  - (MC1) Para oferecer serviços de turismo de pesca, o pescador precisaria principalmente de: [CNPJ de empresa grande / Conhecimento dos rios + capacitação básica em atendimento + Empreendedor Individual (MEI) ✓ / Não é possível para pescadores artesanais / Ter barco a motor]

---

## TRILHA C — Saberes dos Rios: Cooperação Intergeracional
**OE3 — mesma estrutura da Rota do Mel, adaptada ao contexto da pesca**

### Módulo C.1 — O Saber que Você Já Tem

#### Lição C.1.1 — Conhecimento tradicional dos rios do Amapá
- **Vídeo:** Pescador veterano e jovem percorrem o rio. O veterano ensina sinais de pesca, leitura da água e comportamento dos peixes.
- **Quiz:**
  - (TXT — Escuta Ativa) Qual é o conhecimento sobre os rios que você tem e que aprendeu com seus pais ou avós?

#### Lição C.1.2 — Calendário dos rios: cheias, secas e piracema
- **Vídeo:** Pescador veterano e oceanógrafo explicam os ciclos hidrológicos do Amapá e como eles afetam os peixes.
- **Quiz:**
  - (MC1) A piracema é: [um peixe do Amapá / o período de migração reprodutiva dos peixes ✓ / uma técnica de pesca / um tipo de rede]
  - (TXT — Escuta Ativa) Como os ciclos de cheia e seca afetaram sua pesca nos últimos anos? Houve mudanças em relação ao que seus pais viviam?

---

## TRILHA D — Venda mais, Ganhe Justo
**OE6 — versão Pesca**

### Módulo D.1 — Quanto Vale o Seu Pescado

#### Lição D.1.1 — Custo real de uma pescaria
- **Vídeo:** Pescador e técnico do SEBRAE calculam o custo de uma jornada: combustível, manutenção, gelo, comida, depreciação do barco.
- **Quiz:**
  - (MC1) O preço mínimo que você deve cobrar pelo seu peixe deve cobrir: [só o combustível / todos os custos da pescaria mais margem de lucro ✓ / o preço que o atravessador oferece / nada, peixe não tem custo de produção]
  - (Evidência) Calcule o custo de uma jornada típica de pesca. Registre no Diário do Pescador.

#### Lição D.1.2 — Como o atravessador funciona e como negociar melhor
- **Vídeo:** Pescador veterano explica a lógica do atravessador e como passou a negociar diretamente com um restaurante local.
- **Quiz:**
  - (TXT — Escuta Ativa) Qual percentual do preço final do peixe você acha que fica com o atravessador? O que você acha justo?

---

### Módulo D.2 — Pescado com Valor Agregado

#### Lição D.2.1 — Beneficiamento básico: filetar, defumar, salar
- **Vídeo:** Pescadora demonstra filetagem e defumação. Mostra comparativo de preço por kg: inteiro vs. filé vs. defumado.
- **Quiz:**
  - (MC1) O peixe defumado em relação ao peixe inteiro tem: [preço menor / mesmo preço / preço maior e vida útil mais longa ✓ / só é consumido localmente]
  - (VF) Para vender peixe processado (filé, defumado), é necessário algum registro sanitário. [Verdadeiro]

#### Lição D.2.2 — Cadeia do frio: o que é e por que importa
- **Vídeo:** Técnica da ANVISA explica como o calor destrói o peixe e mata pessoas. Linguagem simples, sem alarmar.
- **Quiz:**
  - (ORD) Processo correto de conservação: [Matar o peixe rapidamente / Eviscerar ainda no barco / Armazenar em gelo imediatamente ✓ / Transportar em caixas de isopor / Vender em no máximo 24–48h]
  - (MC1) A temperatura ideal para conservar peixe fresco é: [temperatura ambiente / entre 0°C e 4°C ✓ / congelado a –18°C para venda imediata / não importa se estiver vivo]

---

## TRILHA E — Guardiões dos Rios: Boas Práticas e Sustentabilidade
**OE7 — versão Pesca**

### Módulo E.1 — Pesca Seletiva e Respeito à Natureza

#### Lição E.1.1 — Tamanho de malha: por que importa para o futuro
- **Vídeo:** Biólogo do ICMBio explica com imagens reais: redes com malha pequena que pegam filhotes vs. malha correta.
- **Quiz:**
  - (VF) Redes com malha menor que o permitido por lei são proibidas porque capturam peixes jovens antes de reproduzirem. [Verdadeiro]
  - (IMG) Qual rede está com malha correta para tambaqui? [3 ilustrações de redes com malhas diferentes]
  - (MC1) Pescar peixe fora do tamanho mínimo é: [permitido se for para consumo próprio / proibido por lei e prejudica a população de peixes ✓ / tolerado pelas colônias / irrelevante]

#### Lição E.1.2 — Espécies protegidas do Amapá e RESEX
- **Vídeo:** Agente do IBAMA/ICMBio apresenta as espécies sob proteção especial nos rios do Amapá: pirarucu (manejo comunitário regulado), quelônios, mamíferos aquáticos. Explica as RESEX (Reservas Extrativistas) do Amapá — ex: RESEX Beija-Flor e Brilho de Fogo, RESEX do Rio Cajari — onde pescadores artesanais têm direitos tradicionais garantidos.
- **Quiz:**
  - (IMG) Qual é o boto-cor-de-rosa? [fotos de 3 animais aquáticos — boto ✓, pirarucu, jacaré]
  - (VF) O pirarucu pode ser pescado de forma legal no Amapá através de planos de manejo comunitários. [Verdadeiro]
  - (TXT — Escuta Ativa) Você já observou redução de alguma espécie nos rios da sua região? Qual e quando começou?

#### Lição E.1.3 — Acordos de pesca comunitários
- **Vídeo:** Comunidade ribeirinha do Amapá explica seu Acordo de Pesca: como foi criado, quem definiu as regras, como é fiscalizado.
- **Quiz:**
  - (MC1) Um Acordo de Pesca é: [um contrato com atravessador / uma norma criada pela própria comunidade para proteger seus recursos pesqueiros ✓ / uma lei federal / uma obrigação do IBAMA]
  - (TXT — Escuta Ativa) Existe algum acordo ou regra informal de pesca na sua comunidade? Como ele funciona?

---

### Módulo E.2 — Qualidade Sanitária do Pescado

#### Lição E.2.1 — Como identificar peixe fresco de qualidade
- **Vídeo:** Técnica da ANVISA ensina a inspeção visual: olhos, brânquias, escamas, odor.
- **Quiz:**
  - (IMG) Qual peixe está fresco? [Fotos: olhos brilhantes/brânquias vermelhas ✓ vs. olhos opacos/brânquias marrons]
  - (MCN) Sinais de peixe fresco: [olhos brilhantes e salientes ✓ / brânquias vermelhas ✓ / carne firme ✓ / odor forte de amônia / escamas aderentes ✓]

#### Lição E.2.2 — Higiene no barco e no ponto de venda
- **Vídeo:** Pescador modelo mostra práticas simples: caixas limpas, gelo suficiente, não misturar pescado de dias diferentes.
- **Quiz:**
  - (VF) Guardar peixe novo com peixe de ontem na mesma caixa é uma boa prática. [Falso]
  - (ORD) Boas práticas no barco: [Higienizar o porão antes de sair / Matar o peixe rapidamente / Eviscerar no barco / Lavar com água limpa / Cobrir com gelo ✓]

---

## TRILHAS F e G — Liderança e Integridade (versão Pesca)

*Estrutura idêntica à Rota do Mel, com adaptações contextuais (substituir "apicultor" por "pescador", exemplos do Amapá, canais locais de ouvidoria e CMDR). Instituições de referência no Amapá: RURAP (ATER), FEPA-AP (federação de pescadores), COOPESCA-AP (cooperativa de referência), BASA (crédito PRONAF), Colônias Z-1/Z-3.*

---

---

# TRILHA ESPECIAL — JOVEM MULTIPLICADOR
**Trilha certificadora · Acesso restrito · Ambas as rotas**

**Por que esta trilha:** Os Jovens Multiplicadores são o vetor de expansão do projeto nos territórios. Eles precisam de formação técnica no app, habilidades de facilitação presencial e clareza sobre seu papel formal. O badge "Abelha-Rainha" (Mel) e "Guardião dos Rios" (Pesca) são as conquistas mais prestigiosas do sistema.

---

### Módulo M.1 — Seu Papel como Multiplicador

#### Lição M.1.1 — O que é ser um Jovem Multiplicador
- **Vídeo:** Coordenadora do projeto explica o papel, as responsabilidades e os benefícios. Ex-multiplicador de projeto similar conta sua experiência.
- **Quiz:**
  - (MC1) A principal missão do Multiplicador é: [usar o app sozinho / ajudar outros produtores a instalar e usar o app no campo ✓ / criar conteúdo para redes sociais / fiscalizar o projeto]
  - (TXT) Por que você quer ser Multiplicador? O que espera aprender e contribuir?

#### Lição M.1.2 — Como instalar e configurar o app em outros celulares
- **Vídeo:** Walkthrough completo: instalar PWA, criar conta, selecionar rota, primeiros passos.
- **Evidência:** Instale o app no celular de um familiar ou vizinho produtor. Registre com foto.

#### Lição M.1.3 — Como conduzir uma sessão de capacitação presencial
- **Vídeo:** Roteiro de sessão de 45 minutos. Como apresentar, como responder dúvidas comuns, como lidar com resistência ("não sei mexer em celular").
- **Quiz:**
  - (ORD) Uma boa sessão de capacitação começa com: [Mostrar o app / Perguntar o que os produtores já sabem e o que querem aprender ✓ / Explicar toda a política pública / Pedir para baixar o app primeiro]
  - (CEN) Durante a capacitação, uma produtora de 60 anos diz: "Não adianta, sou velha demais para aprender isso." O que o Multiplicador deve fazer? [Concordar e pular para a próxima pessoa / Mostrar que o app foi feito especialmente para ela, com botões grandes e linguagem simples ✓ / Ignorar e continuar / Chamar outra pessoa para explicar]

---

### Módulo M.2 — Ferramentas do Multiplicador

#### Lição M.2.1 — O Painel do Multiplicador: acompanhe seu time
- **Vídeo:** Demonstração do painel no app: quantos produtores onboardeados, progresso nas trilhas, pontos CPO acumulados.
- **Quiz:**
  - (VF) O Multiplicador ganha Pontos de Campo (CPO) a cada produtor que ele cadastra e acompanha. [Verdadeiro]

#### Lição M.2.2 — Resolução de problemas técnicos no campo
- **Vídeo:** FAQ dos problemas mais comuns: sem internet, senha esquecida, app que não abre, celular sem espaço.
- **Quiz:**
  - (CEN) Um produtor diz que o app não abre porque não tem internet. O que o Multiplicador explica? [Que o app não funciona sem internet / Que o app funciona offline depois da primeira instalação ✓ / Que precisa comprar um plano melhor / Que deve usar outro celular]

---

### Módulo M.3 — Certificação

#### Lição M.3.1 — Badge Abelha-Rainha / Guardião dos Rios: conquiste o reconhecimento
- **Vídeo:** Cerimônia de certificação de multiplicadores. Depoimentos de multiplicadores certificados.
- **Evidência final:** Relatório de campo: número de produtores onboardeados, dificuldades encontradas, sugestões de melhoria.
- **Quiz:**
  - (TXT) Quais foram as maiores dificuldades que você encontrou na capacitação de produtores? O que o app poderia melhorar?

---

---

# Resumo Executivo das Trilhas

## Rota do Mel — Colmeia Viva

| Trilha | Módulos | Lições | Vídeos | Quizzes | Evidências | Escutas Ativas |
|--------|---------|--------|--------|---------|------------|----------------|
| **Início — Conheça a Profissão** *(onboarding)* | 1 | 5+1* | 5 | 5 | 1 | 2 |
| A — Programas do Governo | 4 | 13 | 13 | 13 | 1 | 6 |
| B — Futuro da Colmeia | 2 | 5 | 5 | 5 | 0 | 4 |
| C — Cooperação Intergeracional | 2 | 3 | 3 | 3 | 1 | 3 |
| D — Venda Justa | 3 | 7 | 7 | 7 | 1 | 3 |
| E — Boas Práticas e Sustentabilidade | 3 | 9 | 9 | 9 | 2 | 4 |
| F — Liderança e Participação | 1 | 3 | 3 | 3 | 0 | 3 |
| G — Integridade e Cidadania | 1 | 3 | 3 | 3 | 0 | 2 |
| **TOTAL** | **17** | **48** | **48** | **48** | **6** | **27** |

## Rota da Pesca — Rio em Movimento

| Trilha | Módulos | Lições | Vídeos | Quizzes | Evidências | Escutas Ativas |
|--------|---------|--------|--------|---------|------------|----------------|
| **Início — Conheça a Profissão** *(onboarding)* | 1 | 5+1* | 5 | 5 | 1 | 3 |
| A — Programas do Governo | 4 | 14 | 14 | 14 | 1 | 6 |
| B — Futuro nos Rios | 2 | 5 | 5 | 5 | 0 | 4 |
| C — Cooperação Intergeracional | 1 | 2 | 2 | 2 | 0 | 2 |
| D — Venda Justa | 2 | 5 | 5 | 5 | 1 | 2 |
| E — Guardiões dos Rios | 2 | 7 | 7 | 7 | 1 | 5 |
| F — Liderança (adaptada) | 1 | 3 | 3 | 3 | 0 | 3 |
| G — Integridade (adaptada) | 1 | 3 | 3 | 3 | 0 | 2 |
| **TOTAL** | **14** | **44** | **44** | **44** | **4** | **27** |

> *\* A Lição 0.1 tem quiz com 14 questões (todos os tipos do Funifier) — contada como lição única, mas serve como sandbox de renderização de tipos no app.*

## Trilha Multiplicador (ambas as rotas)

| Módulos | Lições | Vídeos | Quizzes | Evidências | Escutas Ativas |
|---------|--------|--------|---------|------------|----------------|
| 3 | 7 | 7 | 7 | 2 | 2 |

---

## Critérios de Design de Conteúdo

| Critério | Regra |
|----------|-------|
| **Duração dos vídeos** | Máximo 5 minutos. Ideal 3 min. Pessoas reais, não atores. |
| **Linguagem** | Nível de escolaridade fundamental. Sem siglas sem explicação. |
| **Localização** | Filmado no Piauí (Mel) e no Amapá (Pesca) — rostos e paisagens reais do território |
| **Questões de quiz** | Mínimo 3, máximo 5 por lição. Pelo menos 1 Escuta Ativa por módulo. |
| **Dificuldade progressiva** | Trilha A começa com questões VF e MC1. Trilhas D–G incluem mais CEN e ORD. |
| **XP por lição** | Vídeo assistido: +10 XP. Quiz completo: +25 XP. Evidência submetida: +50 XP. Escuta Ativa: +15 VOZ. |
| **Offline-first** | Todo conteúdo de vídeo deve ter versão para download prévia. Quiz funciona offline com sync posterior. |
