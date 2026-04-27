# Melhorias — 2026-04-25

---

## 4. Video auto-play e auto-finish — `/jarvis/rota-viva/app/pages/video`

### Comportamento atual

O usuário entra na tela do vídeo, precisa apertar play manualmente, e após assistir 90% do vídeo aparece o botão "Avançar" que ele precisa clicar para registrar a conclusão e voltar à trilha.

### Comportamento desejado

1. **Auto-play:** o vídeo começa a tocar automaticamente ao entrar na tela
2. **Auto-finish:** quando o vídeo termina, `markDone()` é chamado automaticamente — celebração + retorno à trilha sem interação do usuário

O botão "Avançar" permanece como **fallback manual**: se o usuário assistiu 90% mas não terminou o vídeo (saiu antes do final), ele pode avançar manualmente. O fluxo principal passa a ser automático.

### Considerações técnicas

**Autoplay em browsers:** browsers modernos bloqueiam autoplay de vídeo sem mute em desktop. Em mobile (contexto do PWA), o autoplay funciona desde que haja interação prévia do usuário — garantida pelo clique na lição na trilha. O plano é implementar sem `mute=1` para não prejudicar o áudio educacional. Em desktop, o vídeo simplesmente não inicia sozinho (comportamento aceitável — público-alvo é mobile).

**Infraestrutura existente:** o `VideoCtrl` já tem toda a estrutura necessária:
- YouTube: `onStateChange` com estado `1` (playing) e progress check por interval
- Vimeo: listener `timeupdate` com threshold de 90%
- `markDone()` já implementado com folder/log, action log, confetti, toast XP, vibração e volta automática à trilha após 2,5s

### Mudanças em `video.js`

**1. Autoplay — YouTube:** adicionar `autoplay=1` na URL de embed:
```javascript
// ANTES:
'https://www.youtube.com/embed/' + yid + '?rel=0&enablejsapi=1&origin=...'
// DEPOIS:
'https://www.youtube.com/embed/' + yid + '?rel=0&enablejsapi=1&autoplay=1&origin=...'
```

**2. Autoplay — Vimeo:** adicionar `autoplay=1` na URL de embed:
```javascript
// ANTES:
'https://player.vimeo.com/video/' + vid + '?portrait=0&title=0&byline=0'
// DEPOIS:
'https://player.vimeo.com/video/' + vid + '?portrait=0&title=0&byline=0&autoplay=1'
```

**3. Auto-finish — YouTube:** em `onStateChange`, estado `0` = vídeo terminou → chamar `markDone()`:
```javascript
onStateChange: function(e) {
    if (e.data === 0) {                             // NOVO: ended → auto-finish
        $scope.$apply(function() { $scope.markDone(); });
    } else if (e.data === 1) startProgressCheck();  // existente
    else stopProgressCheck();                        // existente
}
```

**4. Auto-finish — Vimeo:** adicionar listener `ended` no player:
```javascript
player.on('ended', function() {
    $scope.$apply(function() { $scope.markDone(); });
});
// listener timeupdate existente permanece (para mostrar botão Avançar como fallback)
```

### Mudanças em `video.html`

Nenhuma mudança estrutural. O botão "Avançar" permanece exatamente como está — ele aparece aos 90% como fallback.

### Arquivos alterados

- `app/pages/video/video.js` — 4 mudanças cirúrgicas: 2 URLs de embed + 2 event listeners

---

## 5. Redesign do Cartão do Produtor — `/jarvis/rota-viva/app/pages/profile`

### Análise do design atual

O cartão atual tem fundo laranja/âmbar, bordas arredondadas e layout de app de fidelidade. Os problemas:
- Estética informal — não transmite credencial profissional
- CPF mascarado (`***.***.***-**`) — em documentos oficiais o CPF é exibido completo
- Verso fraco — só QR code, pontos e nível (não há dados da atividade produtiva)
- Muito espaço vazio — documentos oficiais são densos em informação

### Decisão de design: Proposta 2

**Frente:** fundo branco/cinza claro, foto do produtor à esquerda com moldura, logo MIDR + ROTA VIVA, dados do produtor (nome, CPF completo, rota, município), impressão digital gráfica como elemento de segurança, banner "DADOS DO PRODUTOR VERIFICADOS", barra inferior com `MIDR | ROTA VIVA | data de emissão`.

**Por quê a Proposta 2 e não a 1 (azul escuro)?**
A Proposta 1 tem estética de fintech/banco — bonita, mas não lida como "documento oficial". A Proposta 2 replica a linguagem visual de documentos do Estado (CNH, carteira profissional, RG): fundo claro institucional, layout denso de informação, elemento de segurança biométrico (impressão digital). Qualquer pessoa que veja instantaneamente reconhece como credencial.

**Verso:** dados da atividade produtiva específicos para cada rota — esse é o diferencial que transforma o cartão de badge em credencial profissional:

| Campo | Rota do Mel | Rota da Pesca |
|-------|-------------|---------------|
| Registro profissional | CAF | RGP |
| Cooperativa | nome da cooperativa | nome da cooperativa |
| Município de operação | município | município |
| Código de rastreabilidade | `ref` do player | `ref` do player |
| QR Code | QR de verificação | QR de verificação |

### CPF sem mascaramento

O código atual usa `_maskCpf(playerId)` que formata como `***.***.***-**`. Alterar para exibir o CPF completo formatado como `XXX.XXX.XXX-XX`. Isso alinha com o comportamento de documentos reais e com a solicitação do usuário.

### Limitações do modelo de dados atual e plano em fases

**Fase 1 (implementar agora):** usar os dados já coletados no passaporte:
- Frente: nome, CPF completo, rota, município (`passaporte.municipio`)
- Verso: CAF ou RGP, nome da cooperativa (`passaporte.cooperativa_nome`), município, código de rastreabilidade (`player.extra.ref`)

**Fase 2 (evolução futura):** adicionar campos específicos por rota ao formulário do passaporte:
- Rota do Mel: número de colmeias atual, principais floradas, práticas de manejo
- Rota da Pesca: número de embarcações, principais pesqueiros, espécies trabalhadas

Esses campos aparecerão no verso do cartão quando preenchidos.

### Impressão digital — elemento gráfico

A impressão digital no design é um **elemento gráfico** (SVG ou imagem), não dados biométricos reais. Serve como símbolo de autenticação/verificação, igual ao que documentos usam como holografia ou marca d'água.

### Arquivos a alterar

- `app/pages/profile/profile.js` — remover `_maskCpf`, expor CPF formatado completo no scope
- `app/pages/profile/profile.html` — redesign da seção do cartão (frente e verso)
- `app/styles/` ou CSS inline — novos estilos para o cartão (branco, layout documento)

---

## 3. Controle de acesso às funcionalidades de IA no formulário de Story

### O que é

Os botões que disparam recursos de Inteligência Artificial (geração de imagens, vídeos e áudios) no formulário de edição de story agora só são exibidos para usuários com permissão de acesso à página `/studio/ai` no Funifier Studio — o mesmo padrão de controle de acesso usado em outros módulos (request, widget, challenge, trigger, etc.).

### Padrão adotado

Idêntico ao implementado em `request/list.js` e demais controladores do Studio:

**Controller** (`form.js`):
```js
$scope.isAiEnabled = function () {
  return Marketplace.acl.checkAccess({ type: 'page', object: '/studio/ai', operation: 'read' });
};
```

**Template** (`form.html`): cada botão de IA recebe `ng-if="isAiEnabled()"` (ou combinado com condições existentes via `&&`).

### Botões protegidos

| Localização | Botão |
|---|---|
| Aba Configurações — capa | "Gerar com IA" (capa da story) |
| Aba Personagens — voz | "Ouvir voz" (preview TTS do personagem) |
| Aba Personagens — avatar | "IA" (gerar avatar com IA) |
| Aba Personagens — imagem de referência | "IA" (gerar imagem de referência com IA) |
| Aba Cenas — toolbar | "Gerar estrutura com IA" |
| Aba Cenas — toolbar | "Continuar a partir desta cena" |
| Aba Cenas — mídia da cena | "Gerar imagem" |
| Aba Cenas — mídia da cena | "Gerar vídeo" |
| Aba Cenas — diálogo | "Gerar áudio" (TTS por diálogo) |
| Modal de imagem da cena | "Gerar com IA" |

### Elementos não protegidos (intencionais)

- **Campos de texto / selects** de configuração (prompt, modelo, duração, etc.) dentro dos modais de IA — os modais só abrem via botões já protegidos, tornando a proteção redundante.
- **Botão "Ouvir TTS"** e **"Ouvir áudio"** nos diálogos — são de reprodução, não de geração com IA (usam o áudio já armazenado ou o TTS nativo do browser).
- **Checkbox `subtitle_karaoke`** — é configuração de comportamento, não dispara IA diretamente.

### Arquivos alterados

- `funifier-studio/app/scripts/controllers/studio/story/form.js` — adição de `$scope.isAiEnabled()`
- `funifier-studio/app/views/studio/story/form.html` — `ng-if="isAiEnabled()"` em 10 pontos

---

## 1. Karaokê de legendas na diretiva `<story>` (highlight de palavras em sincronia com o áudio)

### O que é

Enquanto o personagem fala, cada palavra da legenda é destacada na tela no exato momento em que é pronunciada — como num karaokê. Recurso de alto valor para **educação infantil**: reforça a associação entre o som e a palavra escrita, ajuda na alfabetização e na leitura.

### Por que é viável

O áudio dos diálogos já é gerado pelo backend via OpenAI `tts-1`. Após gerar o MP3, os bytes ainda estão em memória no servidor. A OpenAI também oferece o endpoint de transcrição Whisper (`/v1/audio/transcriptions`) com parâmetro `timestamp_granularities[]=word`, que retorna **timestamps por palavra** com menos de 1 segundo de custo de tempo extra, e custo financeiro irrisório (~$0.006/min de áudio — para uma fala de 3s, frações de centavo).

Tudo acontece no mesmo request de TTS: gera o áudio, transcreve, salva os timestamps junto com a cena. Zero mudança no fluxo do admin.

---

### Análise técnica por camada

#### Backend — `StoryRest.java` (método `generateDialogueTts`)

**Mudança:** Após salvar o MP3, chamar Whisper no mesmo fluxo com os bytes já em memória.

```
// Após: byte[] mp3Bytes = ...

if (story.subtitle_karaoke == true) {
    // Envia mp3Bytes para POST /v1/audio/transcriptions
    // response_format=verbose_json, timestamp_granularities[]=word, language=pt
    // Retorno: { "words": [{ "word": "Olá", "start": 0.10, "end": 0.35 }, ...] }
    List<Map> wordTimestamps = callWhisperWordTimestamps(mp3Bytes);

    // Persiste no documento da cena
    // Atualiza dialogues[dialogueIndex].word_timestamps no story_scene
    updateDialogueWordTimestamps(sceneId, dialogueIndex, wordTimestamps, mf);
}
```

O endpoint Whisper aceita arquivo multipart. Como os bytes já estão em memória, usa-se um `File` temporário (mesmo padrão de `generateImageBytes`).

**Resposta do endpoint TTS passa a incluir:**
```json
{
  "url": "https://cdn.../story-tts-abc.mp3",
  "word_timestamps": [
    { "word": "Olá",      "start": 0.10, "end": 0.35 },
    { "word": "meninos",  "start": 0.38, "end": 0.80 },
    { "word": "hoje",     "start": 0.83, "end": 1.05 }
  ]
}
```

#### Frontend — Formulário de story (`form.js`)

**Mudança em `generateDialogueTts`:** Após receber a resposta, salvar `word_timestamps` no diálogo antes de chamar `saveScene()`.

```js
dialogue.audio_url = res.data.url;
if (res.data.word_timestamps) {
    dialogue.word_timestamps = res.data.word_timestamps;
}
// loadAudioDuration → saveScene (já existente)
```

#### Frontend — Configuração da story (`form.html`, aba Configurações)

Adicionar toggle `subtitle_karaoke`:

```html
<div class="material-switch pull-left">
  <input id="karaokeSwitch" type="checkbox" ng-model="obj.subtitle_karaoke" />
  <label for="karaokeSwitch" class="label-warning"></label>
</div>
<label>Karaokê de legendas
  <small class="text-muted">Destaca cada palavra na legenda em sincronia com o áudio gerado por IA</small>
</label>
```

Só tem efeito na **geração do TTS** — se ligado, o backend chama Whisper. Na exibição, a diretiva verifica a existência de `word_timestamps` (sem precisar checar este flag).

#### Diretiva — `story.js`

**Em `playDialogueAudio()`:** quando o áudio tem `word_timestamps`, adicionar listener `timeupdate` no elemento `<audio>` para atualizar o índice da palavra ativa.

```js
if (d.word_timestamps && d.word_timestamps.length > 0) {
    $timeout(function () {
        var el = document.getElementById('story-dialogue-audio');
        if (!el) return;
        el.addEventListener('timeupdate', function () {
            var ct = el.currentTime;
            var idx = -1;
            for (var i = 0; i < d.word_timestamps.length; i++) {
                if (ct >= d.word_timestamps[i].start && ct < d.word_timestamps[i].end) {
                    idx = i; break;
                }
            }
            $scope.$apply(function () { $scope.activeWordIndex = idx; });
        });
        el.addEventListener('ended', function () {
            $scope.$apply(function () { $scope.activeWordIndex = -1; });
        });
    }, 80);
}
$scope.activeWordIndex = -1;
```

#### Diretiva — `story.html`

**Na legenda (`.story-subtitle-overlay`):** quando `currentDialogue().word_timestamps` existe, renderizar o texto como palavras individuais com destaque; caso contrário, renderizar como texto simples (comportamento atual — **zero regressão**).

```html
<!-- Com karaokê -->
<p ng-if="currentDialogue().word_timestamps" class="story-dialogue-text">
  <span ng-repeat="(wi, wt) in currentDialogue().word_timestamps"
        ng-class="{'story-word-active': activeWordIndex === wi}"
        style="white-space: pre-wrap">{{wt.word}} </span>
</p>

<!-- Sem karaokê (atual) -->
<p ng-if="!currentDialogue().word_timestamps" class="story-dialogue-text">
  {{currentDialogue().text}}
</p>
```

CSS:
```css
.story-word-active {
    color: #f39c12;
    font-weight: bold;
    text-shadow: 0 0 8px rgba(243, 156, 18, 0.7);
}
```

---

### Modelo de dados

Campo novo no objeto `dialogue` dentro de `story_scene`:

```json
{
  "text": "Olá meninos, hoje vamos aprender sobre triângulos!",
  "audio_url": "https://cdn.../story-tts-abc.mp3",
  "word_timestamps": [
    { "word": "Olá",         "start": 0.10, "end": 0.35 },
    { "word": "meninos,",    "start": 0.38, "end": 0.80 },
    { "word": "hoje",        "start": 0.83, "end": 1.05 },
    { "word": "vamos",       "start": 1.08, "end": 1.30 },
    { "word": "aprender",    "start": 1.33, "end": 1.75 },
    { "word": "sobre",       "start": 1.78, "end": 2.00 },
    { "word": "triângulos!", "start": 2.03, "end": 2.60 }
  ]
}
```

Campo novo no objeto `story`:

```json
{
  "subtitle_karaoke": true
}
```

---

### Custo e performance

| Item | Detalhe |
|---|---|
| Custo Whisper | $0.006/min → ~$0.0003 por fala de 3s |
| Latência extra | +300ms a +600ms no request de TTS (transcrição síncrona, mesmos bytes) |
| Armazenamento extra | ~200 bytes por fala (array de timestamps) |
| Regressão | Zero — diretiva só ativa o karaokê se `word_timestamps` existe |

---

### Plano de implementação (sequência sugerida)

1. **Backend** — adicionar método `callWhisperWordTimestamps(byte[] mp3Bytes)` em `StoryRest.java` e chamar dentro de `generateDialogueTts` quando `story.subtitle_karaoke == true`. Retornar `word_timestamps` na resposta.
2. **Frontend admin** — adicionar campo `word_timestamps` em `generateDialogueTts` do `form.js`.
3. **Frontend admin** — adicionar toggle `subtitle_karaoke` na aba de configurações do `form.html`.
4. **Diretiva** — atualizar `playDialogueAudio()` em `story.js` para o listener `timeupdate`.
5. **Diretiva** — atualizar legenda em `story.html` para renderização por palavra.
6. **Port para Rota Viva** — aplicar os mesmos passos 4 e 5 em `/jarvis/rota-viva/app/directives/story/`.
7. **Regenerar áudios** — os diálogos existentes sem `word_timestamps` continuam funcionando normalmente. Para ter karaokê, basta clicar em "Gerar TTS" novamente com a feature ligada.

---

### Observações

- **Whisper é determinístico** para o mesmo arquivo de áudio → rodar novamente retorna os mesmos timestamps. É seguro regenerar.
- **Pontuação nas palavras**: Whisper inclui a pontuação junto da palavra (ex: `"meninos,"` em vez de `"meninos"`). Isso não afeta o highlight — só o texto exibido. Se quiser limpar, basta `word.replaceAll("[^\\w\\s]", "")` antes de salvar.
- **Alinhamento perfeito garantido**: como o Whisper transcreve o próprio arquivo gerado pelo TTS (sem ruído, voz sintética clara), a acurácia dos timestamps é próxima de 100%.
- **Idioma**: passar `language=pt` na chamada Whisper para garantir reconhecimento correto do português.

---

## 2. Supressão de TTS em cenas com vídeo de áudio nativo

### O problema

Ao reproduzir uma cena em modo vídeo cujo vídeo foi gerado com narração embutida (ex: Sora 2 com `generate_audio: true`), o player executava simultaneamente:
- o áudio nativo do vídeo (narração gerada pelo modelo), e
- os áudios TTS dos diálogos da cena

Resultado: dois áudios narrando o mesmo texto ao mesmo tempo.

---

### O que já existe (diretiva — 100% pronto)

Ambas as diretivas (`story.js` do Studio e `story.js` do Rota Viva) já têm a função `sceneVideoSuppressesAudio()`:

```js
function sceneVideoSuppressesAudio(scene) {
  return scene &&
    scene.media_mode === 'video' &&
    scene.video &&
    scene.video.has_native_audio &&
    !scene.video.override_audio;
}
```

E `goToSceneInternal()` já verifica essa função antes de chamar `playDialogueAudio()`:

```js
if (scene.dialogues && scene.dialogues.length > 0 && !sceneVideoSuppressesAudio(scene)) {
  playDialogueAudio();
}
```

A supressão do áudio de fundo da cena (`playBackgroundAudio`) também já checa a mesma função.

**Conclusão: a lógica do player está correta e completa.**

---

### A causa real do bug

O campo `video.has_native_audio` **não estava sendo salvo** no documento MongoDB das cenas existentes. Isso porque as cenas `pin1_s1` e `pin1_s2` foram geradas antes de o campo ser persistido corretamente, ou com uma versão do backend que não o incluía.

Exemplo do estado atual no banco:
```json
"video": {
  "status": "completed",
  "job_id": "video_...",
  "model": "sora-2",
  "url": "https://...",
  "duration_sec": 12
  // ← has_native_audio AUSENTE → sceneVideoSuppressesAudio retorna false → TTS toca
}
```

Estado necessário:
```json
"video": {
  "status": "completed",
  "model": "sora-2",
  "url": "https://...",
  "duration_sec": 12,
  "has_native_audio": true   // ← diretiva suprime TTS ao detectar este campo
}
```

---

### Design completo — dois flags no objeto `video`

| Campo | Tipo | Significado |
|---|---|---|
| `video.has_native_audio` | boolean | O vídeo foi gerado com narração/áudio embutido |
| `video.override_audio` | boolean | Override manual: mesmo com `has_native_audio`, permite TTS (já previsto na função) |

---

### O que falta implementar

#### Peça 1 — Toggle no editor de cena (admin form)

Adicionar, ao lado do preview de vídeo ou dos botões de controle de vídeo, uma checkbox editável:

```html
<!-- Em form.html, dentro do bloco ng-if="selectedScene.video && selectedScene.video.url" -->
<div style="margin-top: 6px; font-size: 12px">
  <label style="font-weight: normal; color: #ccc">
    <input type="checkbox"
           ng-model="selectedScene.video.has_native_audio"
           ng-change="saveScene()" />
    Vídeo tem narração embutida
    <small class="text-muted">(suprime TTS dos diálogos no player)</small>
  </label>
  <label style="font-weight: normal; color: #888; margin-left: 12px"
         ng-if="selectedScene.video.has_native_audio">
    <input type="checkbox" ng-model="selectedScene.video.override_audio" ng-change="saveScene()" />
    Forçar TTS mesmo assim
  </label>
</div>
```

#### Peça 2 — Garantir persistência nas novas gerações (backend)

`StoryRest.java` → `generateSceneVideo()` já persiste `has_native_audio` em `videoState`:

```java
videoState.put("has_native_audio", hasNativeAudio);
```

Onde `hasNativeAudio` vem de `dispatchSoraVideo()`:
```java
result.put("has_native_audio", generateAudio);
```

Ou seja: para **novas** gerações o campo já é salvo corretamente. O problema é apenas com cenas existentes.

---

### Plano de implementação

1. **Admin form** — adicionar o toggle `has_native_audio` / `override_audio` no bloco de vídeo da cena (`form.html`) → permite corrigir cenas existentes sem regenerar vídeo.
2. **Testar** — marcar `pin1_s1` com `has_native_audio: true` no admin, confirmar que TTS não toca.
3. **Verificar** — confirmar que `pin1_s2` (vídeo sem áudio nativo) permanece com `has_native_audio: false` / ausente → TTS toca normalmente.

---

### Casos de uso cobertos

| Cena | `media_mode` | `video.has_native_audio` | Comportamento |
|---|---|---|---|
| Imagem | `image` | n/a | TTS toca normalmente |
| Vídeo sem áudio | `video` | `false` / ausente | TTS toca normalmente |
| Vídeo com áudio | `video` | `true` | TTS **suprimido** |
| Vídeo com áudio + override | `video` | `true` + `override_audio: true` | TTS toca mesmo assim |

---

### Legenda com vídeo nativo

Quando TTS está suprimido, as legendas (`subtitles_enabled`) continuam sendo exibidas com o texto dos diálogos — servem como transcrição/closed caption do vídeo. Não há necessidade de mudar nada na lógica de legendas.

A progressão dos diálogos (qual texto de legenda está visível) avança pelo temporizador da cena, que é controlado pelo `timeupdate` / `ended` do vídeo — correto e independente do TTS.
