

**RELATÓRIO DE**

**ANÁLISE DE SEGURANÇA**

**Plataforma Funifier**

*Frontend PWA, scripts operacionais e gamificações integradas*

| Documento | Relatório de Análise de Segurança |
| :---- | :---- |
| **Escopo** | Frontend PWA, scripts e gamificações Funifier |
| **Classificação** | Confidencial – uso interno |
| **Data de emissão** | 23 de abril de 2026 |
| **Versão** | 1.0 |

# **1\. Resumo Executivo**

A exposição geral da plataforma é classificada como ALTA. Os principais riscos estão concentrados em autenticação, autorização e gestão de credenciais: foi identificado bypass prático de senha no fluxo Funifier, senha master fixa na gamificação Rota do Mel, roles excessivamente permissivas na configuração de segurança e tokens Basic hardcoded em scripts operacionais do repositório.

Durante a análise, não foram executadas ações destrutivas nem chamadas a endpoints que pudessem alterar estado. O acesso às três gamificações (Central, Rota do Mel e Rota da Pesca) foi realizado exclusivamente em modo leitura. Arquivos MCP e credenciais temporárias não foram tratados como alvo de auditoria.

| Risco mais urgente Comprometimento de conta e abuso da API autenticada, combinando bypass de autenticação com roles de leitura, escrita e exclusão amplas. A correção deste vetor é prioritária e precede qualquer outra ação remediativa. |
| :---- |

# **2\. Escopo da Análise**

Os artefatos e superfícies a seguir foram avaliados:

* Frontend PWA localizado no diretório app/

* Scripts operacionais localizados no diretório scripts/

* Configuração de headers HTTP no arquivo app/\_headers

* Dependências do projeto avaliadas via npm audit

* Gamificações Funifier analisadas em modo leitura: Central, Rota do Mel e Rota da Pesca

## **Limitações conhecidas**

* O arquivo app/config.js é referenciado por index.html, porém não existe no repositório local. Os valores de CONFIG.API\_URL, CONFIG.PUBLIC\_TOKEN e CONFIG.CENTRAL\_API\_KEY não puderam ser auditados estaticamente.

* Não foram executados testes de exploração ativa de login, exclusão, upload ou escrita, dado o risco de efeitos colaterais em ambiente produtivo.

# **3\. Metodologia**

A avaliação combinou revisão estática de código, inspeção de configuração das gamificações Funifier, consulta somente-leitura aos recursos de backend e execução de npm audit com a flag \--omit=dev. As referências adotadas foram OWASP Top 10, OWASP ASVS e boas práticas consolidadas de AppSec, com foco específico em Broken Access Control, Identification and Authentication Failures, Injection e Security Misconfiguration.

# **4\. Achados de Segurança**

Cada achado é apresentado com classificação de severidade, categoria OWASP correspondente, localização afetada, evidência, descrição técnica, cenário de exploração, impacto, correção recomendada e impacto estimado da correção.

| CRÍTICA | 4.1  Bypass de autenticação e senha master fixa |
| :---: | :---- |

| Categoria | OWASP A07 – Identification and Authentication Failures / ASVS V2 |
| :---- | :---- |
| **Tipo de evidência** | Configuração e observação backend em modo leitura |
| **Local afetado** | Funifier Central (public endpoint login), Rota do Mel (Auth Master) e Security das três gamificações |

**Evidência**

No endpoint de login, a validação BCrypt da senha da Central está comentada. Na Rota do Mel, o auth module aceita o valor 123456 como senha master. Nas configurações de security, aparecem as flags requirePassword=false e createPlayerIfDontExist=true.

**Descrição técnica**

O fluxo atual confia na autenticação da rota, mas a Central não valida a senha antes do roteamento. Na Rota do Mel, qualquer conta pode ser autenticada utilizando a senha fixa. Na Rota da Pesca, a configuração indica autenticação fraca em função de requirePassword=false.

**Possível exploração**

Um atacante que possua apenas o CPF de um usuário pode realizar login informando senha arbitrária ou o valor 123456 e receber um Bearer token válido da rota correspondente.

**Impacto**

Tomada de conta completa, acesso a dados pessoais (PII), escrita e exclusão de dados devido aos escopos amplos das roles associadas.

**Correção recomendada**

Reativar a validação BCrypt no login da Central, remover a senha master, ajustar as configurações para requirePassword=true e createPlayerIfDontExist=false, revisar todos os auth modules e invalidar tokens atualmente emitidos.

**Impacto da correção**

Alto. Pode exigir migração e teste do cadastro de players, além de ajustes no fluxo de Single Sign-On existente.

| CRÍTICA | 4.2  Roles e tokens com privilégios excessivos |
| :---: | :---- |

| Categoria | OWASP A01 – Broken Access Control / ASVS V4 |
| :---- | :---- |
| **Tipo de evidência** | Configuração e análise estática |
| **Local afetado** | Security Funifier e app/services/api.js (linha 130\) |

**Evidência**

As roles player e as roles de aplicação possuem permissões read\_all, write\_all, delete\_all e database. O frontend realiza chamadas diretas para /v3/database/\*, endpoints de aggregate e operações de delete.

**Descrição técnica**

Um token de player autenticado detém permissões genéricas demais sobre coleções e operações sensíveis, violando o princípio de privilégio mínimo.

**Possível exploração**

Utilizando o Bearer token obtido pelo aplicativo, um atacante pode consultar a coleção player, executar aggregates, criar posts, alterar dados de outros usuários ou apagar registros.

**Impacto**

IDOR horizontal, vazamento de PII, corrupção e perda de dados em coleções sensíveis.

**Correção recomendada**

Aplicar least privilege por coleção e operação, removendo delete\_all e restringindo write\_all. Mover operações sensíveis para public endpoints autenticados com validação explícita de propriedade do recurso.

**Impacto da correção**

Alto. A mudança altera contratos entre frontend e backend e demanda testes completos dos fluxos sociais, perfil, trilha e passaporte.

| ALTA | 4.3  Segredos Basic hardcoded em scripts operacionais |
| :---: | :---- |

| Categoria | OWASP A02 / A05 |
| :---- | :---- |
| **Tipo de evidência** | Análise estática |
| **Local afetado** | 27 arquivos em scripts/, incluindo cleanup.js (linha 20\) e seed-modulo-a-mel.js (linha 11\) |

**Evidência**

Tokens Basic são persistidos diretamente no código-fonte e utilizados em operações HTTP do tipo PUT e DELETE.

**Descrição técnica**

Tokens não expiráveis armazenados no repositório expõem acesso operacional privilegiado às gamificações Rota do Mel e Rota da Pesca para qualquer agente com acesso ao código.

**Possível exploração**

Um atacante que obtenha uma cópia do repositório pode executar os scripts de seed, patch e cleanup, alterando ou apagando conteúdo em produção.

**Impacto**

Comprometimento total das coleções acessíveis pelos tokens vazados.

**Correção recomendada**

Revogar e rotacionar imediatamente os tokens afetados, migrar as credenciais para variáveis de ambiente ou secret manager, remover os segredos do histórico do repositório e criar tokens com escopo mínimo por tarefa.

**Impacto da correção**

Médio. Os scripts precisarão ser adaptados para carregar credenciais a partir de fontes externas.

| ALTA | 4.4  IDOR e autorização no cliente para dados sociais e de perfil |
| :---: | :---- |

| Categoria | OWASP A01 – Broken Access Control / ASVS V4 |
| :---- | :---- |
| **Tipo de evidência** | Análise estática |
| **Local afetado** | app/services/api.js (linhas 215 e 368\) e app/pages/gallery/gallery.js (linha 282\) |

**Evidência**

A função deletePost(postId) remove registros apenas pelo campo \_id, sem filtrar por dono. A função updatePlayer(playerId, data) aceita o ID diretamente do cliente. Operações de like e comentário também utilizam IDs definidos no lado do cliente.

**Descrição técnica**

É o próprio cliente que decide qual registro e qual player sofrerão a operação. Combinado com as roles amplas, controles puramente visuais como a flag \_isOwner não oferecem proteção real sobre a API.

**Possível exploração**

Através das ferramentas de desenvolvedor do navegador, um usuário pode modificar as chamadas para excluir um post de outro usuário ou atualizar os dados de outro player.

**Impacto**

Alteração indevida de perfil, remoção não autorizada de conteúdo e manipulação do ambiente social da plataforma.

**Correção recomendada**

Validar a posse do recurso no backend. Operações de delete devem filtrar por \_id combinado com player. Atualizações de player devem comparar o subject do token com o playerId informado.

**Impacto da correção**

Médio a alto. Exige a criação de endpoints server-side ou regras específicas no Funifier.

| ALTA | 4.5  HTML confiado sem sanitização forte |
| :---: | :---- |

| Categoria | OWASP A03 – Injection / ASVS V5 |
| :---- | :---- |
| **Tipo de evidência** | Análise estática |
| **Local afetado** | app/app.js (linha 17), app/pages/reading/reading.js (linha 82\) e app/pages/profile/profile.html (linha 529\) |

**Evidência**

Uso de $sce.trustAsHtml e do filtro trustHtml aplicado diretamente a conteúdos provenientes do banco de dados.

**Descrição técnica**

O código realiza bypass explícito do sanitizador nativo do Angular. Caso os campos reading\_\_c ou legal\_\_c sejam alterados por um token comprometido ou por um administrador mal-intencionado, torna-se viável a injeção de XSS armazenado.

**Possível exploração**

Um atacante pode injetar tags script ou manipuladores de evento em conteúdos legais ou de leitura, exfiltrando o rv\_token armazenado em localStorage.

**Impacto**

Sequestro de sessão e execução arbitrária de código no frontend.

**Correção recomendada**

Sanitizar o conteúdo com allowlist antes da renderização, evitar o uso de trustAsHtml e restringir os perfis autorizados a escrever nestas coleções.

**Impacto da correção**

Médio. Pode exigir limpeza do HTML já existente nas coleções e validação visual dos conteúdos migrados.

| MÉDIA | 4.6  Construção insegura de queries e expressões regulares |
| :---: | :---- |

| Categoria | OWASP A03 – Injection / ASVS V5 |
| :---- | :---- |
| **Tipo de evidência** | Análise estática |
| **Local afetado** | app/services/api.js (linhas 93, 423 e 442\) |

**Evidência**

Concatenação direta de variáveis em expressões como q=\_id:'${id}' e q=post:'${postId}'. Expressões regulares enviadas ao MongoDB recebem input do usuário sem tratamento.

**Descrição técnica**

Identificadores e termos de busca não são escapados ou normalizados antes de compor a query enviada ao Funifier e ao MongoDB.

**Possível exploração**

É possível manipular aspas e sintaxe do parâmetro q, ou construir expressões regulares custosas para provocar ReDoS.

**Impacto**

Bypass de filtros, consultas indevidas e degradação de performance do backend.

**Correção recomendada**

Escapar valores de entrada, utilizar pipelines com literais controlados, limitar o tamanho das buscas e tratar caracteres especiais das expressões regulares.

**Impacto da correção**

Baixo a médio.

| MÉDIA | 4.7  Sessão em localStorage e headers de segurança ausentes |
| :---: | :---- |

| Categoria | OWASP A05 – Security Misconfiguration / ASVS V3 e V14 |
| :---- | :---- |
| **Tipo de evidência** | Análise estática e de configuração |
| **Local afetado** | app/services/auth.js (linha 26), app/\_headers (linha 1\) e app/index.html (linha 20\) |

**Evidência**

O Bearer token é persistido em localStorage. O arquivo \_headers define apenas políticas de cache. Recursos carregados via CDN não possuem Subresource Integrity (SRI).

**Descrição técnica**

Um ataque de XSS bem-sucedido pode exfiltrar o token. A ausência de CSP, HSTS, controles de frame, Referrer-Policy e Permissions-Policy reduz significativamente a defesa em profundidade.

**Possível exploração**

Um vetor de XSS ou um ataque de supply-chain contra a CDN permite capturar o token e consumir a API em nome da vítima.

**Impacto**

Sequestro de sessão e abuso das roles amplas associadas ao token.

**Correção recomendada**

Reduzir o escopo e o tempo de vida do token, avaliar a adoção de cookie HttpOnly quando viável, adicionar CSP, SRI, HSTS, X-Frame-Options e Frame-Ancestors, Referrer-Policy e Permissions-Policy.

**Impacto da correção**

Médio. A adoção de CSP pode exigir ajustes em scripts inline e em recursos carregados por CDN.

| MÉDIA | 4.8  Upload com validação insuficiente |
| :---: | :---- |

| Categoria | OWASP ASVS V12 |
| :---- | :---- |
| **Tipo de evidência** | Análise estática |
| **Local afetado** | app/pages/gallery/gallery.html (linha 537), app/pages/gallery/gallery.js (linha 411\) e app/services/api.js (linha 283\) |

**Evidência**

O atributo accept é aplicado apenas no lado do cliente. O upload envia o arquivo diretamente ao Funifier. Não há limite local de tamanho, validação por magic bytes ou política explícita de tipo.

**Descrição técnica**

O controle sobre o que é enviado depende inteiramente do navegador e da API remota, sem validação intermediária.

**Possível exploração**

Envio de arquivos excessivamente grandes, tipos inesperados ou conteúdo ativo, caso o backend venha a servi-lo publicamente.

**Impacto**

Abuso de armazenamento, negação de serviço via upload e potencial servimento de conteúdo inseguro.

**Correção recomendada**

Implementar validação server-side de MIME, extensão e tamanho, reprocessar imagens, definir limites para vídeo e produzir mensagens de erro consistentes.

**Impacto da correção**

Baixo a médio. Arquivos que hoje são aceitos passarão a ser rejeitados quando não atenderem aos critérios.

# **5\. Priorização de Correções**

A ordem a seguir reflete a criticidade e a dependência entre as correções. Recomenda-se executar as ações de forma sequencial, validando cada etapa antes de avançar.

1. Corrigir a autenticação: remover a senha master, reativar a validação BCrypt, definir requirePassword=true e invalidar tokens atualmente emitidos.

2. Reduzir o escopo das roles Funifier, eliminando delete\_all e write\_all dos perfis de player.

3. Revogar e rotacionar os tokens Basic hardcoded, removendo os segredos do histórico do repositório.

4. Implementar autorização server-side para posts, perfil, comentários, likes e formulários de contato.

5. Remover o uso de trustAsHtml ou sanitizar conteúdo HTML com allowlist restrita.

6. Endurecer os headers HTTP, adotar CSP e SRI, e revisar o armazenamento da sessão.

7. Corrigir a construção de queries e expressões regulares, além da validação de uploads.

# **6\. Conclusão**

O projeto apresenta uma boa separação visual entre frontend e backend Funifier. No entanto, a segurança atual depende excessivamente de lógica executada no lado do cliente e de tokens com escopo amplo. O risco mais urgente é o comprometimento de conta combinado com abuso de API autenticada.

A execução de npm audit \--omit=dev não retornou vulnerabilidades conhecidas nas dependências de produção. Este é um ponto positivo, mas não substitui as correções estruturais detalhadas neste relatório.

Recomenda-se fortemente o tratamento imediato dos achados classificados como Críticos antes de qualquer nova entrega funcional. Os achados de severidade Alta devem entrar no próximo ciclo de correções, e os de severidade Média devem ser endereçados como parte do hardening contínuo da plataforma.

# **7\. Quadro-Resumo dos Achados**

A tabela consolidada abaixo reúne os achados deste relatório, suas severidades, locais afetados, riscos principais e correções recomendadas de forma resumida.

| Vulnerabilidade | Severidade | Local | Risco principal | Correção resumida |
| :---- | ----- | :---- | :---- | :---- |
| Bypass de autenticação e senha master fixa | **CRÍTICA** | Funifier Login / Auth Master | Tomada de conta | Reativar BCrypt, remover senha master, requirePassword=true |
| Roles e tokens com privilégios excessivos | **CRÍTICA** | Security Funifier / api.js | Leitura, escrita e exclusão amplas | Least privilege por coleção e operação |
| Segredos Basic hardcoded em scripts | **ALTA** | scripts/\*.js | Comprometimento operacional | Rotacionar tokens e mover para secret manager |
| IDOR em dados sociais e de perfil | **ALTA** | api.js, gallery.js | Alterar ou excluir dados alheios | Validar ownership no backend |
| HTML confiado sem sanitização forte | **ALTA** | app.js, reading.js, profile.html | XSS armazenado | Sanitização com allowlist, evitar trustAsHtml |
| Construção insegura de queries e regex | **MÉDIA** | api.js | Bypass de filtro e ReDoS | Escapar valores e limitar input |
| Sessão em localStorage e headers ausentes | **MÉDIA** | auth.js, \_headers, index.html | Roubo de token | CSP, SRI, HSTS, reduzir escopo do token |
| Upload com validação insuficiente | **MÉDIA** | gallery, api.js | Arquivo abusivo | Validação server-side de MIME/tamanho |

