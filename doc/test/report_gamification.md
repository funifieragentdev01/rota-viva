**Relatório Consolidado de Testes**

PWA Rota Viva × Plataforma Funifier

*Integração de Gamificação — Análise de Bugs e Divergências*

| Data | 23 de abril de 2026 |
| :---- | :---- |
| **Ambiente testado** | https://rotaviva.app — PWA emulado em iPhone 14 e Pixel 5 |
| **Versão do App** | v1.5.1 |
| **Instância Funifier** | Rota Pesca (API Key: 69c58d4de6650e26dad215b2) |
| **Origem** | Consolidação de 3 sessões independentes de teste automatizado |
| **Destinatário** | Equipe de desenvolvimento — PWA Rota Viva e configuração Funifier |

# **1\. Resumo Executivo**

Três sessões independentes de teste automatizado foram executadas sobre o PWA Rota Viva, todas no dia 23/04/2026, utilizando diferentes ferramentas (agent-browser com iPhone 14, Claude Code com Pixel 5, e automação MCP direta no Funifier). Os resultados convergem para o mesmo diagnóstico: o sistema de gamificação está operando de forma parcial a inexistente, dependendo da sessão e do fluxo.

Dos fluxos de recompensa esperados, apenas a emissão do Passaporte Digital (Cartão do Pescador) concedeu XP de forma consistente em uma das sessões. Todos os demais desafios — onboarding, lições, checkpoints, login diário e publicação na galeria — apresentaram falhas, seja por bug no payload enviado pelo PWA, seja por ausência de triggers configurados no Funifier, seja por divergência entre a chave de atributo enviada e a esperada pelos challenges.

## **1.1 Estado atual da gamificação**

| Evento / Challenge | XP esperado | XP registrado | Status |
| :---- | ----- | ----- | ----- |
| Onboarding concluído (explorador\_da\_rota) | 50 XP | 0 XP | **FALHA** |
| Passaporte emitido (produtor\_registrado) | 30 XP | 30 XP | **OK** |
| Lição tipo baú (licao\_de\_bau) | 10 XP \+ 3 coins | 0 | **FALHA** |
| Checkpoint / cartoon (checkpoint) | coins variáveis | 0 | **FALHA** |
| Login diário (presenca\_diaria) | 10 XP / 7 dias | 0 | **FALHA** |
| Publicar post na Galeria (publish\_post) | sem recompensa definida | — | **FALHA** |

## **1.2 Problemas identificados por severidade**

| Severidade | Qtde. | Natureza |
| ----- | ----- | :---- |
| **CRÍTICO** | **3** | Bloqueadores de gamificação (PWA e/ou Funifier) |
| **ALTO** | **2** | Integração de dados e rastreamento de eventos |
| **MÉDIO** | **3** | UX / navegação / renderização |

## **1.3 Principais causas-raiz**

1. Divergência de action ID no onboarding: o PWA envia 'onboarding\_complete', mas o Funifier tem 'complete\_onboarding' cadastrado.

2. Ausência de triggers na instância Rota Pesca para processar action\_logs e conceder challenges automaticamente.

3. Filtros de challenges com operator: 40 (contém atributo) não disparam — mesmo quando o payload corrige a chave de 'lesson\_type' para 'type'.

4. Actions relevantes para engajamento (login, publish\_post) não são enviadas pelo PWA em nenhum momento.

5. Bugs de navegação e renderização na UI (botão do passaporte, botão '+' da galeria, drag-and-drop sem texto, botão de conclusão de lição ausente).

# **2\. Metodologia**

Três sessões de teste foram executadas de forma independente, por ferramentas diferentes, no mesmo dia e contra o mesmo ambiente. Essa independência é relevante porque todas as três chegaram ao mesmo conjunto de falhas críticas, reduzindo significativamente a probabilidade de ruído ou erro de execução.

| Sessão | Dispositivo | Ferramenta | Player de teste |
| :---- | :---- | :---- | :---- |
| **Sessão A** | iPhone 14 (emulado) | Agent Browser \+ Funifier MCP | 11144477735 (Teste Rota Viva) |
| **Sessão B** | Pixel 5 (emulado) | Claude Code \+ agent-browser \+ Funifier MCP | 12345678909 (João Pedro Teste) |
| **Sessão C** | iPhone 14 (emulado) | Agent Browser \+ HAR capture \+ Funifier MCP | 12312757311 (Teste Pesca Codex) |

Em todas as sessões foram validados: cadastro, login, onboarding, navegação na trilha, reprodução de lições (vídeo e cartoon), quiz, emissão do Cartão do Pescador, publicação e interações na Galeria de Saberes, e consultas diretas ao Funifier para validação de action\_log, challenge\_log, challenge\_progress, player\_status e achievement.

# **3\. Issues Identificadas**

Cada issue abaixo contém descrição, evidência, impacto e correção proposta. Issues são numeradas por severidade (críticas primeiro) e cruzadas com as sessões em que foram confirmadas.

## **3.1 ISSUE-001 — Action ID invertido no onboarding**

| Severidade | CRÍTICO |
| :---- | :---- |
| **Tipo** | Integração PWA → Funifier |
| **Confirmado em** | Sessões A, B e C |

### **Descrição**

Ao concluir o onboarding, o PWA envia para o Funifier um action log com actionId 'onboarding\_complete'. Essa action não existe cadastrada na plataforma — a action correta, conforme a configuração do Funifier, é 'complete\_onboarding' (verbo \+ substantivo na ordem inversa). O servidor responde com HTTP 500 e mensagem 'action onboarding\_complete does not exist', e nenhum ponto é concedido. A UI do PWA, contudo, exibe a animação de '+50 XP' como se o evento tivesse sido bem-sucedido, criando feedback visual falso para o usuário.

### **Evidência (captura de rede)**

POST https://service2.funifier.com/v3/action/log?v=1.5.1

REQUEST:  
{  
  "actionId": "onboarding\_complete",  
  "userId": "12345678909",  
  "attributes": { "route": "pesca" }  
}

RESPONSE: HTTP 500  
{  
  "message": "action onboarding\_complete does not exist",  
  "statusCode": 500,  
  "data": null  
}

### **Verificação no Funifier**

action\_log WHERE userId=12345678909 AND actionId=complete\_onboarding  
  → 0 documentos

achievement WHERE player=12345678909 AND item=explorador\_da\_rota  
  → 0 documentos

### **Impacto**

* 50 XP da conquista 'Explorador da Rota' jamais são creditados.

* Todos os usuários recebem feedback visual falso ao concluir o onboarding.

* A progressão inicial do jogador fica travada em 0 XP, impedindo o alcance do primeiro nível ('Pescador Aprendiz' requer 50 XP).

### **Correção proposta**

Localizar, no código do fluxo de onboarding do PWA (provavelmente em pages/onboarding/onboarding.js ou equivalente Angular), a chamada a /v3/action/log e alterar o actionId de 'onboarding\_complete' para 'complete\_onboarding'.

## **3.2 ISSUE-002 — Ausência de triggers / filtros de challenge não disparam**

| Severidade | CRÍTICO |
| :---- | :---- |
| **Tipo** | Configuração Funifier (motor de desafios) |
| **Confirmado em** | Sessões A e B |

### **Descrição**

A instância 'Rota Pesca' do Funifier não possui triggers configurados para processar os action\_logs recebidos e conceder os challenges associados. Uma verificação direta via MCP confirmou: 0 triggers e 0 schedulers na instância Rota Pesca (a instância 'Rota Viva Main' possui apenas 2 triggers, ambos relacionados ao signup).

Além disso, os challenges 'licao\_de\_bau' e 'checkpoint' utilizam operator: 40 (contém atributo) com filtros como { param: 'attributes.type', operator: 1, value: 'bau' }. Mesmo quando um action\_log é inserido manualmente com a chave e o valor corretos, o challenge não dispara — sugerindo que, além da ausência de triggers, o filtro aninhado pode ter incompatibilidade de versão com o motor de desafios.

### **Teste de validação realizado**

Foram inseridos manualmente action\_logs corretos para complete\_onboarding, complete\_passport e complete\_lesson (type=cartoon). Resultado: actions gravadas na coleção action\_log, mas nenhum challenge concedido automaticamente e nenhum ponto atribuído.

### **Impacto**

* Mesmo que o PWA corrija todos os action IDs, os challenges ainda não serão concedidos.

* Jogadores nunca avançam de nível — ficam permanentemente em 'Iniciante' (exceto pelo challenge 'produtor\_registrado', que foi observado funcionando em uma das sessões).

* Toda a progressão de XP e coins via trilha educacional está bloqueada — este é o principal mecanismo de recompensa do app.

### **Correção proposta**

* Configurar triggers na instância Rota Pesca para processar os action\_logs dos eventos: complete\_onboarding, complete\_passport, complete\_lesson (com distinção por tipo), login e invite\_accepted.

* Investigar, junto ao suporte da Funifier, o comportamento do operator: 40 com filtros aninhados em attributes. Se houver incompatibilidade, considerar refatorar os challenges para usar campos diretos com operator: 1 (igual), ou splitar em múltiplas actions específicas (ex.: complete\_lesson\_bau, complete\_lesson\_cartoon).

* Comparar a configuração funcional do challenge 'produtor\_registrado' (que funciona) com os que falham, para identificar o padrão estrutural que diferencia.

## **3.3 ISSUE-003 — Action 'login' nunca é rastreada**

| Severidade | CRÍTICO |
| :---- | :---- |
| **Tipo** | Integração PWA → Funifier |
| **Confirmado em** | Sessão B |

### **Descrição**

O PWA não registra nenhum evento de login no Funifier. A action 'login' está cadastrada na plataforma, e o challenge 'presenca\_diaria' (que exige 7 logins consecutivos e concede 10 XP) depende exclusivamente dela. Como a action nunca é enviada, o challenge é estruturalmente impossível de ser conquistado.

### **Verificação**

action\_log WHERE actionId=login → 0 documentos (coleção inteira)  
join\_log WHERE player=12345678909 → 0 documentos

### **Impacto**

* Challenge 'presenca\_diaria' completamente inoperante.

* Sem rastreabilidade de sessões no backend — métricas de retenção, DAU e frequência de uso indisponíveis no Funifier.

### **Correção proposta**

Ao concluir com sucesso a chamada POST /v3/auth/player, adicionar uma chamada POST /v3/action/log com actionId: 'login' e attributes contendo a rota do usuário.

POST /v3/action/log  
{  
  "actionId": "login",  
  "userId": "\<cpf\>",  
  "attributes": { "route": "pesca" }  
}

## **3.4 ISSUE-004 — Atributo 'lesson\_type' enviado em vez de 'type'**

| Severidade | ALTO |
| :---- | :---- |
| **Tipo** | Integração / Contrato de dados |
| **Confirmado em** | Sessões B e C |

### **Descrição**

Ao concluir lições, o PWA envia o tipo da lição no atributo 'lesson\_type', mas os challenges no Funifier filtram por 'attributes.type'. O mismatch da chave por si só já impediria o disparo dos challenges — mesmo se o motor de desafios estivesse funcionando corretamente (ver ISSUE-002).

### **Evidência**

// O que o PWA envia:  
{  
  "actionId": "complete\_lesson",  
  "userId": "12345678909",  
  "attributes": {  
    "lesson\_type": "bau",  
    "lesson\_id": "...",  
    "score": 100  
  }  
}

// O que o challenge espera:  
{ "param": "attributes.type", "operator": 1, "value": "bau" }

### **Impacto**

* Challenges 'licao\_de\_bau' e 'checkpoint' não disparariam nem mesmo se o motor de desafios estivesse funcionando corretamente.

* Dados de progresso na trilha ficam inconsistentes entre PWA e Funifier.

### **Correção proposta**

Alterar o payload de complete\_lesson no PWA para usar 'type' em vez de 'lesson\_type' como chave do atributo. Manter 'lesson\_id' e 'score' como estão.

## **3.5 ISSUE-005 — Action 'publish\_post' não é enviada ao publicar na Galeria**

| Severidade | ALTO |
| :---- | :---- |
| **Tipo** | Integração / Rastreamento |
| **Confirmado em** | Sessões B e C |

### **Descrição**

Ao publicar um post na Galeria de Saberes, o PWA chama apenas POST /v3/database/post\_\_c (insert no banco). A chamada complementar ao /v3/action/log com actionId 'publish\_post' nunca é disparada. A action está cadastrada no Funifier e deveria ser rastreada para alimentar desafios futuros e métricas de engajamento.

### **Evidência de rede**

POST https://service2.funifier.com/v3/database/post\_\_c?v=1.5.1 → 201  
\# Nenhuma chamada subsequente a /v3/action/log

### **Impacto**

* Ação de publicação não aparece no action\_log — impossível usá-la como gatilho de challenges futuros sem reprocessamento.

* Métricas de engajamento da Galeria ficam desacopladas da trilha de gamificação.

### **Correção proposta**

Após o POST /v3/database/post\_\_c retornar com sucesso, disparar POST /v3/action/log com actionId 'publish\_post', passando o post\_id retornado e a rota do usuário como attributes.

## **3.6 ISSUE-006 — Botão 'Emitir Cartão do Pescador' navega para Galeria**

| Severidade | MÉDIO |
| :---- | :---- |
| **Tipo** | UX / Navegação |
| **Confirmado em** | Sessão A |

### **Descrição**

Ao clicar em 'Emitir meu Cartão do Pescador' na página de Perfil, o PWA navega para a Galeria de Saberes (URL muda para /gallery) em vez de abrir o modal ou formulário de emissão do passaporte digital. Observação importante: nas sessões B e C, a emissão do cartão funcionou corretamente, sugerindo que o bug pode ser condicional (por exemplo, estado de sessão, cache, ou rota específica do usuário).

### **Impacto**

* Usuários afetados não conseguem emitir o passaporte digital por este caminho.

* Challenge 'produtor\_registrado' (30 XP) fica inacessível para esses usuários — o único challenge que comprovadamente funciona não é conquistado.

### **Correção proposta**

Investigar o handler de click do botão 'Emitir meu Cartão do Pescador' para confirmar que o redirecionamento para /gallery não é efeito de um event listener capturado indevidamente (ex.: navegação bubbling de um elemento-pai). Garantir que o estado de sessão utilizado na condição de abertura do modal esteja correto quando o usuário chega ao Perfil sem passar por determinado fluxo.

## **3.7 ISSUE-007 — Botão '+' da Galeria não responde ao clique**

| Severidade | MÉDIO |
| :---- | :---- |
| **Tipo** | UX / Interação |
| **Confirmado em** | Sessão A |

### **Descrição**

O botão '+' na Galeria de Saberes não dispara nenhuma ação ao ser clicado em uma das sessões, impedindo a criação de novos posts por esse caminho. Nas sessões B e C, a criação de post funcionou — sugerindo novamente um bug condicional que merece investigação.

### **Correção proposta**

Verificar o binding do evento de click do FAB (botão flutuante) na Galeria e garantir que ele seja inicializado corretamente em todos os fluxos de entrada na página (navegação direta, via menu, após login, etc.).

## **3.8 ISSUE-008 — Quiz: drag-and-drop renderiza sem o texto da frase**

| Severidade | MÉDIO |
| :---- | :---- |
| **Tipo** | UI / Renderização |
| **Confirmado em** | Sessão B |

### **Descrição**

No quiz da trilha, questões do tipo DRAG\_AND\_DROP\_INTO\_TEXT renderizam apenas os blanks (espaços para arrastar palavras), sem o texto da frase ao redor. O array ddSegments no scope Angular está vazio (\[\]), impedindo o template de renderizar o contexto da pergunta.

### **Exemplo do comportamento**

Exibido: \[   \] \[   \] \[   \]

Esperado: A pesca garante \[segurança alimentar\], \[renda\] e transmite \[saber\] para as próximas gerações.

### **Impacto**

* Usuário não consegue entender o que está preenchendo — questão torna-se impossível de responder por lógica.

* Experiência de aprendizado prejudicada nas questões afetadas.

### **Correção proposta**

Revisar o componente de drag-and-drop: o array ddSegments precisa ser populado a partir do texto da questão (parseando tokens {blank}) antes da primeira renderização.

## **3.9 ISSUE-009 — Interface de vídeo não possui botão de conclusão**

| Severidade | MÉDIO |
| :---- | :---- |
| **Tipo** | UX |
| **Confirmado em** | Sessão A |

### **Descrição**

Na interface de vídeo das lições, não há botão explícito de 'Concluir lição' ou similar. A interface exibe apenas os controles padrão do player do YouTube (Play, Hide controls, Share, Watch on YouTube), deixando ambíguo para o usuário como marcar a lição como completa. Isso pode ser um dos motivos pelos quais, na sessão A, o evento complete\_lesson nunca é disparado.

### **Correção proposta**

* Adicionar um botão explícito 'Concluir lição' / 'Marcar como vista' ao final da visualização do vídeo.

* Alternativamente, disparar complete\_lesson automaticamente quando o vídeo atinge X% de progresso (ex.: 90%), usando o evento onStateChange do YouTube Player API.

## **3.10 ISSUE-010 — Checkpoint/cartoon inacessível por conteúdo ausente**

| Severidade | MÉDIO |
| :---- | :---- |
| **Tipo** | Dados / Conteúdo |
| **Confirmado em** | Sessão C |

### **Descrição**

Ao tentar acessar o checkpoint do tipo cartoon, o PWA exibe a mensagem 'História não encontrada'. A lição referenciada (69dba332d95d627e2bdbb7f5) não existe na collection 'story' do Funifier, tornando o checkpoint inacessível por completo. Isso também impede a validação da mecânica de coins variáveis associada ao challenge 'checkpoint'.

### **Correção proposta**

* Criar ou restaurar o documento da story faltante na collection 'story' da instância Rota Pesca.

* Implementar validação no deploy de novos módulos: toda lição do tipo cartoon referenciada em um módulo deve ter documento correspondente em 'story'.

# **4\. Priorização de Correções**

Abaixo está a ordem sugerida de correção, baseada em (a) severidade, (b) custo de correção e (c) dependências entre issues. O plano em duas frentes — PWA e Funifier — pode ser executado em paralelo por times diferentes.

## **4.1 Frente Funifier (configuração da plataforma)**

| \# | Ação | Severidade | Referência |
| ----- | :---- | ----- | :---- |
| **1** | Configurar triggers para processar action\_logs e conceder challenges automaticamente | **CRÍTICO** | ISSUE-002 |
| **2** | Investigar compatibilidade do operator: 40 com filtros aninhados e, se necessário, refatorar challenges 'licao\_de\_bau' e 'checkpoint' | **CRÍTICO** | ISSUE-002 |
| **3** | Restaurar documento da story faltante para o checkpoint cartoon | **MÉDIO** | ISSUE-010 |

## **4.2 Frente PWA (código do aplicativo)**

| \# | Ação | Severidade | Referência |
| ----- | :---- | ----- | :---- |
| **1** | Corrigir actionId de 'onboarding\_complete' para 'complete\_onboarding' | **CRÍTICO** | ISSUE-001 |
| **2** | Adicionar chamada a /action/log com actionId 'login' após autenticação bem-sucedida | **CRÍTICO** | ISSUE-003 |
| **3** | Corrigir chave do atributo em complete\_lesson: 'lesson\_type' → 'type' | **ALTO** | ISSUE-004 |
| **4** | Adicionar chamada a /action/log com actionId 'publish\_post' após criação de post | **ALTO** | ISSUE-005 |
| **5** | Corrigir navegação do botão 'Emitir Cartão do Pescador' | **MÉDIO** | ISSUE-006 |
| **6** | Corrigir binding do botão '+' na Galeria de Saberes | **MÉDIO** | ISSUE-007 |
| **7** | Popular ddSegments antes de renderizar questões DRAG\_AND\_DROP\_INTO\_TEXT | **MÉDIO** | ISSUE-008 |
| **8** | Adicionar botão explícito de conclusão em lições de vídeo (ou dispatch automático por % de progresso) | **MÉDIO** | ISSUE-009 |

# **5\. Configuração Atual do Funifier (referência)**

O inventário abaixo foi levantado diretamente via MCP contra a instância Rota Pesca. Ele é apresentado como referência contextual para o time — tudo que tem check está configurado corretamente; o bloqueador real está na ausência de triggers.

## **5.1 Actions cadastradas**

* complete\_lesson — Aula concluída

* complete\_module — Módulo concluído

* complete\_onboarding — Onboarding concluído

* complete\_passport — Passaporte Digital emitido

* login — Login do usuário (existente, mas nunca disparada pelo PWA)

* publish\_post — Publicação na galeria (existente, mas nunca disparada pelo PWA)

* invite\_accepted — Convite aceito (não testado)

## **5.2 Challenges cadastrados**

| Challenge | Trigger | Recompensa | Status |
| :---- | :---- | ----- | ----- |
| explorador\_da\_rota | complete\_onboarding | 50 XP | **FALHA** |
| produtor\_registrado | complete\_passport | 30 XP | **OK** |
| licao\_de\_bau | complete\_lesson \+ type=bau | 10 XP \+ 3 coins | **FALHA** |
| checkpoint | complete\_lesson \+ type=cartoon | coins variáveis | **FALHA** |
| presenca\_diaria | login (7 dias consecutivos) | 10 XP | **FALHA** |
| conector | invite\_accepted (3x) | 30 XP | não testado |

## **5.3 Níveis e pontos**

* Níveis: Iniciante (0), Pescador Aprendiz (50), Pescador (150), Pescador Experiente (350), Guardião dos Rios (700)

* Pontos: XP (Experiência) e coins (Moedas)

## **5.4 Triggers e schedulers**

| Instância | Triggers | Schedulers |
| :---- | ----- | ----- |
| **Rota Pesca** | **0** | **0** |
| **Rota Mel** | **0** | **0** |
| **Rota Viva Main** | 2 (apenas signup) | 0 |

Esta é a evidência mais forte de ISSUE-002: mesmo com actions e challenges corretamente cadastrados, sem triggers o motor de desafios não tem como associar os action\_logs recebidos aos challenges configurados.

# **6\. Conclusão**

O PWA Rota Viva apresenta uma base funcional sólida nos fluxos de UX principais — cadastro, login, navegação na trilha, reprodução de conteúdo, galeria de saberes e perfil funcionam em sua maioria. No entanto, a camada de gamificação, que é central para o modelo de engajamento do produto, está efetivamente inoperante para a maioria dos eventos esperados.

As três sessões de teste independentes convergem em um diagnóstico claro: o problema não está em um único ponto isolado, mas em uma combinação de bugs de integração do PWA e configuração incompleta no Funifier. Ambos precisam ser corrigidos em paralelo — corrigir apenas um lado não resolverá a ausência de pontuação. Em particular, o challenge 'produtor\_registrado' é o único que funciona hoje, e serve como referência de que é possível acertar a configuração; o padrão funcional dele deve ser replicado nos demais.

A boa notícia é que todas as correções identificadas são objetivas e localizadas: divergências pontuais de nomenclatura (onboarding\_complete vs complete\_onboarding, lesson\_type vs type), chamadas de action/log faltantes (login, publish\_post), e triggers a serem configurados na instância Funifier. Nenhuma das correções exige reescrita arquitetural.

Recomenda-se priorizar, nesta ordem: (1) configurar triggers no Funifier — sem isso, nenhuma correção no PWA resultará em pontuação; (2) corrigir os actionIds e atributos no PWA; (3) adicionar os dispatches faltantes (login e publish\_post); (4) endereçar os bugs de UX que, embora menos graves, criam pontos de desistência no fluxo do usuário.

—

*Fim do relatório*