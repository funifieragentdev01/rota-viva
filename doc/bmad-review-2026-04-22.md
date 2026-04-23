# A. MELHORIAS NO FUNIFER STUDIO

## DIRETIVA STORY DO FUNIFIER STUDIO
O codigo da diretiva story do funifier studio esta em:
/funifier/funifier-studio/app/views/directives/story.html
/funifier/funifier-studio/app/scripts/directives/story.js

- Na diretiva de story, quando chega a hora de apresentar o diálogo de decisão, com as opções para usuário escolher, eu gostaria que subisse uma div com a pergunta e opcoes de decisao, debaixo até o meio da tela onde está sendo apresentada a imagem ou vídeo da story (parecido com essa tela aqui /jarvis/rota-viva/doc/assets/issue/decision-over-image.png ou com o que é feito na pagina de publicacao na galeria no app rota viva /jarvis/rota-viva/app/pages/gallery/gallery.html), para o usuário saber que ele precisa fazer uma escolha. Pois como esta atualmente com a opção aparecendo embaixo da imagem, isso não está ficando claro. 

- Na diretiva de story, o volume do áudio de background da história é dinâmico, definido na configuração da história. Mas o áudio dos diálogos não deve seguir o mesmo volume. Pois a ideia é que o administrador possa definir por exemplo que o áudio de background fique baixo, para que o áudio dos diálogos fique mais audível. Então eu gostaria de confirmar com você, que o volume do áudio dos diálogos independente, do volume do áudio do background. E talvez seja interessante poder definir também na configuração da história, o volume do áudio dos diálogos. O que acha?

- Na diretiva de story, precisa incluir um botao de stop e play, para o usuario conseguir parar a cena (audios e video) quando quiser e poder continuar quando quiser. Da mesma forma que temos isso em videos no Netflix ou YouTube. 

### Decisões de implementação (2026-04-23)

**A1 — Overlay de decisão:**
- Implementado como `.story-decision-overlay` dentro de `.story-media-inner` (position: absolute, bottom: 0)
- Fundo com gradient escuro (transparent → rgba 0,0,0,0.88) para legibilidade sem perder contexto visual
- Botões com glass-morphism (backdrop-filter blur) sobre a imagem
- Pattern: bottom-sheet sobre mídia, mantém contexto visual ativo durante a escolha

**A2 — Volume independente dos diálogos:**
- Confirmado: `story-dialogue-audio` e `story-bg-audio` são elementos separados — já independentes
- Adicionado suporte ao campo `dialog_volume` no objeto story: `el.volume = safeVolume(story.dialog_volume, 1.0)`
- Campo `dialog_volume` (0–1) deve ser adicionado na UI do Funifier Studio como slider no config da história

**A3 — Stop/Play:**
- Botão `.story-playpause-btn` (circular, glass, bottom-left sobre a mídia) com ícone pause/play
- `$scope.togglePlayback()` pausa/retoma todos os áudios ativos + `<video>` da cena
- Timer de cena respeita `$scope.isPaused` — não avança enquanto pausado
- `isPaused` é resetado para `false` ao navegar para nova cena

---

# B. MELHORIAS NO APP ROTA VIVA

## DIRETIVA DUO-TRAIL
O codigo da diretiva duo-trail do app rota viva esta em:
/jarvis/rota-viva/app/directives/duo-trail/duo-trail.html
/jarvis/rota-viva/app/directives/duo-trail/duo-trail.js

- Na diretiva de duo-trail, quando uma licao do tipo "cartoon" flutuante estiver desbloqueada e o usuário não tiver feito ainda, precisa colocar uma marcação especial, talvez uma certinha em cima do cartão, apontando para ele, ou algum outro tipo de marcação especial, pra deixar claro que o usuário precisa clicar ali, e interagir com aquele cartoon. 

## VIDEO DE DIFERENTES FONTES
- Para o conteúdo do tipo vídeo, configurar a origem do vídeo se vem do YouTube ou Vimeo. E ajustar a apresentação, e o evento que observa finalização do vídeo, para concluir a atividade, na trilha do app. Atualmente este e' o JSON de um video registrado na colecao "video__c": 
{
    "_id": "69d7ab7e28fe032bb2524456",
    "description": "MDA explica os principais programas do governo para a agricultura familiar: CAF, PRONAF, PAA, PNAE e ATER.",
    "title": "Você Tem Direitos — Conheça os Programas",
    "url": "https://www.youtube.com/watch?v=NxKNwHkSCkI"
}

Estes videos sao configurados dentro do Funifier Studio, na pagina "Video" que foi criada na colecao "studio_page". Voce pode acessar acessar a estrutura desta pagina de administracao para fazer os ajustes necessarios, lendo o conteudo desta pagina no endpoint /v3/database/studio_page, usando este token de acesso Basic NjljNThkMjRlNjY1MGUyNmRhZDIxNTM3OjY5YzU5MWEyZTY2NTBlMjZkYWQyMmNmNw==

Faz os ajustes necessarios nesta pagina de administracao, e tambem dentro do app, na pagina onde os videos sao apresentados para o usuario em /jarvis/rota-viva/app/pages/video

### Decisões de implementação (2026-04-23)

**B1 — Marcador cartoon pendente:**
- Estilo sutil: glow animado (drop-shadow âmbar pulsante) + seta `▼` com bounce acima do cartoon
- Classe `duo-cartoon-pending` aplicada quando `is_unlocked && percent < 100`
- Seta: elemento `.duo-cartoon-pending-arrow` com `fas fa-chevron-down` + animação `duo-arrow-bounce`
- Animações somem automaticamente quando `percent >= 100` (classe `duo-cartoon-done` assume)

**B2 — Vídeo multi-origem:**
- Campo `source` no objeto `video__c` como primário (`"youtube"` | `"vimeo"` | `"cloudflare"` | `"direct"`)
- Fallback: detecção automática por URL (regex para vimeo.com / youtu.be / youtube.com)
- YouTube: IFrame API existente, mantido sem alteração
- Vimeo: Vimeo Player SDK carregado sob demanda, evento `timeupdate` para threshold 90%, portrait automático (`isPortrait = true`)
- Cloudflare/Direct: stub para adição futura sem tocar código existente
- Vídeos verticais (9:16): classe `.video-responsive-portrait` aplicada via `ng-class` quando `isPortrait = true`
- Decisão: campo `source` no `video__c` é suficiente — a trilha não precisa conhecer a origem, recebe o objeto completo

**Roadmap de fontes:**
| source | Status |
|--------|--------|
| youtube | ✅ Implementado |
| vimeo | ✅ Implementado |
| cloudflare | 🔜 Próxima fase |
| direct | ✅ Fallback |

---

# C. OUTRAS MELHORIAS

Depois de pronto usar estes dois videos iniciais de cada rota. 
  - Rota do Mel: https://vimeo.com/1185677422
  - Rota da Pesca: https://vimeo.com/1185678041 

- Quando excluir uma conta de usuario de uma rota, precisa excluir da gamificacao central tambem. Senao a pessoa nao consegue se cadastrar novamente. 

- Quando excluir um usuario precisa excluir todos os registros vinculados a ele em cascata. Atualmente nao esta excluindo tudo. 

- Tela de cadastro de usuario no app /signup esta sem contraste nos campos. Como o background é escuro, os campos ficam quase invisíveis. Deveria seguir o mesmo estilo dos inputs da tela de login. 

- Testar se cada ação realizada dentro do app está registrando action log. Verificar se cada action log está gerando pontos XP. Verificar se ao completar o desafio do baú a pessoa ganha pontos XP + moedas. Verificar se estas duas informações estão sendo apresentadas corretamente na barra de status no topo do app. 

- Testar o app em vários dispositivos, pois o Leonardo testou no celular dele e não conseguiu rodar o vídeo. Então precisa saber em quais outros dispositivos o app precisa de ajustes.

---

## DIRETIVA DE STORY
O codigo da diretiva story do funifier studio esta em:
/funifier/funifier-studio/app/views/directives/story.html
/funifier/funifier-studio/app/scripts/directives/story.js

Na diretiva de story precisamos fazer alguns ajustes na funcionalidade de dialogos de decisao. Veja aqui nesta imagem como esta este dialogo de decisao /jarvis/rota-viva/doc/assets/issue/cena-decisao.png. O que voces acham disso?

1. Ajuste este css para 
.story-decision-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.88) 12%);
    padding: 36px 16px 16px;
    z-index: 20;
    animation: storySlideUp 0.25s ease-out;
}

2. .story-decision-prompt usar font-size: 22px. 

3. Eu tambem gostaria que o texto da pergunta da decisao e das opcoes seja lido com tts do browser. Talvez ler de forma automatica a pergunta. E ler as respostas, quando o usuario passar o mouse sobre a resposta. O que voces acham?

4. Eu tambem acho que o .story-decision-overlay poderia ficar um pouco mais alto. Pois ele ainda esta muito baixo. O que acham?

5. O botao de stop/play esta cobrindo as opcoes de decisao. Precisa ajustar isso. Eu acho que deveriamos usar o modelo da amazon prime video, onde o botao de play e stop aparece quando eu passo o mouse sobre a imagem ou video, bem como a barra de progresso do tempo que esta percorrendo, e o titulo da historia no topo. Veja aqui nesta imagem /jarvis/rota-viva/doc/assets/issue/amazon-prime-video.png. O que voce acha? 

