# BeatMarker — Spec Técnico

> Plugin UXP para Adobe Premiere Pro: detecção automática de batidas em trilhas de áudio com markers coloridos por posição no compasso.

---

## 1. Visão geral

BeatMarker analisa um clipe de áudio selecionado no painel Project, detecta as batidas e cria markers coloridos no **source do clipe** (ClipProjectItem), diferenciando visualmente o **1**, o **2/4** e o **3** de cada compasso.

- **Cross-platform** (Windows + macOS) com build único — mesmo `.ccx` nas duas plataformas
- **Zero dependências em runtime** — toda análise roda em JS puro dentro do UXP
- **Simples**: sem jargão musical, sem configuração, sem setup

---

## 2. Fluxo de uso

1. Selecionar clipe `.WAV` no painel Project
2. Clicar em **ANALISAR CLIPE SELECIONADO** → detecta BPM e beats
3. Conferir BPM exibido na UI
4. Clicar em **CRIAR MARKERS NO CLIPE** → markers coloridos criados no source
5. Se o beat "1" caiu no lugar errado: usar **◀ ▶** para deslocar a numeração sem reanalisar
6. Para refazer: **REMOVER MARKERS** (funciona com qualquer clipe selecionado no Project)

---

## 3. Cores dos markers

| Posição | Cor | colorIndex Premiere |
|---|---|---|
| Beat 1 | Vermelho | 1 |
| Beats 2 e 4 | Azul | 6 |
| Beat 3 | Amarelo | 4 |

Marcadores identificados pelo prefixo `[BM]` no nome.

---

## 4. Requisitos funcionais (MVP — implementado)

- [x] Pegar clipe selecionado no Project panel
- [x] Detectar BPM e posições de cada batida (WAV, qualquer sample rate)
- [x] Assumir 4/4 e classificar beats em 1/2/3/4
- [x] Criar markers no source do clipe com cores fixas por posição
- [x] Controle ◀ ▶ para deslocar numeração ±1 sem reanalisar
- [x] Exibir BPM detectado na UI
- [x] Botão REMOVER MARKERS — remove todos os `[BM]*` do clipe selecionado
- [x] Indicador de progresso durante análise e operações

### Fora de escopo

- Markers na timeline (sequence) — apenas source
- Compassos além de 4/4
- Tempo variável (rubato)
- Análise em batch
- Seletores de cor customizáveis

---

## 5. Arquitetura

```
plugin/
├── manifest.json          ← UXP manifest v5
├── index.html             ← UI (HTML + CSS + JS vanilla)
├── main.js                ← Lógica UXP + Premiere API
└── analysis-bundle.js     ← WAV decoder + music-tempo (bundle CJS)

experiments/exp-b-uxp-viability/   ← fonte do bundle
├── src/
│   ├── analysis.js        ← analyzeAudio() — entry point
│   └── stubs/             ← polyfills para esbuild
├── build.js               ← config esbuild
└── package.json           ← deps: js-mp3, music-tempo, esbuild
```

### Pipeline de análise

```
fs.readFile(mediaPath)        [UXP fs, Promise-based]
    ↓ Uint8Array
copyToNativeArrayBuffer()     [UXP retorna proxy — necessário copiar]
    ↓ ArrayBuffer nativo
detectFormat()                [magic bytes: RIFF=WAV, ID3/sync=MP3]
    ↓
decodeWav() ou decodeMp3()    [pure JS, sem WASM]
    ↓ Float32Array mono + sampleRate
resample(→ 44100 Hz)          [interpolação linear]
    ↓
MusicTempo(resampled)         [music-tempo]
    ↓
{ bpm: string, beats: number[] }   [beats em segundos]
```

### Pipeline de markers

```
beats[]  →  (index % 4) + 1  →  beatPos  →  colorIdx
    ↓ lotes de 50 por executeTransaction
createAddMarkerAction('[BM] N', 'Comment', TickTime, duration=0, 'beatmarker')
    ↓
createSetColorByIndexAction(colorIdx)
```

---

## 6. APIs Premiere Pro (UXP) — referência

### Padrões confirmados

```js
// Seleção
const project = await ppro.Project.getActiveProject();
const selection = await ppro.ProjectUtils.getSelection(project);
const items = await selection.getItems();
const clipPI = ppro.ClipProjectItem.cast(items[0]); // ← OBRIGATÓRIO antes de getMarkers

// Markers no source
const clipMarkers = await ppro.Markers.getMarkers(clipPI);
const allMarkers  = await clipMarkers.getMarkers();

// Criar marker
ca.addAction(clipMarkers.createAddMarkerAction(name, 'Comment', TickTime, duration, guid));

// Colorir
ca.addAction(marker.createSetColorByIndexAction(colorIdx)); // ← método correto

// Renomear
ca.addAction(marker.createSetNameAction(name));

// Deletar (confirmado: createRemoveMarkerAction na collection)
ca.addAction(clipMarkers.createRemoveMarkerAction(marker));

// Getters (prototype — não propriedades diretas)
marker.getName()     // ✅    marker.name       // ❌ undefined
marker.getStart()    // ✅    marker.colorIndex  // ❌ undefined

// Transactions (máx ~50 actions por lote)
await project.executeTransaction(async (ca) => { ca.addAction(...); }, 'Undo label');

// Filesystem
const raw = await require('fs').readFile(absolutePath); // Promise-based, NÃO readFileSync

// Links externos
require('uxp').shell.openExternal('https://...');  // requer launchProcess no manifest
```

### O que NÃO existe no UXP

```
❌ new Worker(...)              → typeof Worker === 'undefined'
❌ AudioContext / decodeAudioData
❌ require('child_process')
❌ fs.readFileSync              → "Route not found"
❌ fetch('file://...')          → bloqueado pelo sandbox
❌ WASM com pthreads            → crasha o Premiere imediatamente
❌ marker.createSetColorIndexAction → usar createSetColorByIndexAction
❌ Markers.getMarkers(projectItem)  → retorna null (usar cast primeiro)
❌ uxp.versions                 → retorna {} sem informações úteis
```

### Manifest (formato exato)

```json
{
  "manifestVersion": 5,
  "id": "com.beatmarker.plugin",
  "name": "BeatMarker",
  "version": "1.0.0",
  "main": "index.html",
  "host": { "app": "premierepro", "minVersion": "25.0.0" },
  "requiredPermissions": {
    "localFileSystem": "fullAccess",
    "launchProcess": { "schemes": ["https", "http"], "extensions": [] }
  }
}
```

> ⚠️ `"app": "premierepro"` em minúsculo — `"PPRO"` não funciona no UDT  
> ⚠️ `"host"` é **objeto**, não array  
> ⚠️ `launchProcess` necessário para `shell.openExternal()`

### Cores nativas (colorIndex)

| Index | Cor      |
|-------|----------|
| 0     | Verde    |
| 1     | Vermelho |
| 2     | Roxo     |
| 3     | Laranja  |
| 4     | Amarelo  |
| 5     | Branco   |
| 6     | Azul     |
| 7     | Ciano    |

---

## 7. Decodificação de áudio

### WAV — decoder puro JS

- Lê header RIFF/WAVE via `DataView`, busca chunks `fmt ` e `data`
- Suporta PCM 8/16/24-bit e IEEE 754 float32
- Qualquer sample rate → resample automático para 44100 Hz
- ~600ms para 25 MB

### MP3 — js-mp3 com correções

**Problema original**: `js-mp3` usa `concatBuffers` O(n²) → pressão de memória → crash no UXP.

**Solução implementada**:
1. Usar `Mp3Frame.read()` diretamente (bypassa `decoder.readFrame()`)
2. Pre-alocar `Float32Array` com tamanho total conhecido
3. Downsample 2:1 **dentro de cada frame** (não pular frames — mantém continuidade temporal)
4. Seek para `frameStarts[0]` com `prevFrame=null` → evita double-decode do frame 1 que corrompe o overlap-add

**Encoder delay MP3**: ~50ms de offset nos beats vs WAV (estrutural do LAME). Aceitável na prática.

### Resample

```js
const TARGET_SR = 44100; // music-tempo calibrado para este valor
function resample(mono, srcRate) {
  if (srcRate === TARGET_SR) return mono;
  const ratio = srcRate / TARGET_SR;
  const out = new Float32Array(Math.floor(mono.length / ratio));
  for (let i = 0; i < out.length; i++) {
    const pos = i * ratio, idx = Math.floor(pos), frac = pos - idx;
    out[i] = (mono[idx] ?? 0) + frac * ((mono[idx+1] ?? 0) - (mono[idx] ?? 0));
  }
  return out;
}
```

### Stubs esbuild (módulos ausentes no UXP)

| Módulo | Stub |
|---|---|
| `url` | `pathToFileURL`, `fileURLToPath` → identity |
| `vm` | `runInNewContext` → `eval()` |
| `worker_threads` | objeto vazio |
| `@eshaz/web-worker` | classe Worker fake síncrona |
| globals | `TextDecoder`, `TextEncoder` injetados via `inject` |

---

## 8. Decisões técnicas e lições aprendidas

| Decisão | Motivo |
|---|---|
| WASM descartado | Crasha o Premiere (SharedArrayBuffer / pthreads) |
| Web Workers descartados | `typeof Worker === 'undefined'` no UXP |
| AudioContext descartado | Não existe no UXP |
| js-mp3 em vez de mpg123-decoder | mpg123 usa WASM → crash |
| `ClipProjectItem.cast()` obrigatório | `Markers.getMarkers(projectItem)` retorna null sem o cast |
| `parseFloat(result.bpm)` | music-tempo retorna `tempo` como **string** |
| Batch de 50 por transaction | Confirmado estável; mais que isso pode travar |
| Cores fixas (sem seletor) | Seletor de cor testado e removido — instabilidade no UXP |
| CSS inline nos beat boxes | CSS variables não resolvem corretamente para background-color no UXP |

---

## 9. Critérios de sucesso

- [x] Análise de WAV em < 5s para música de 3–4 min
- [x] Precisão suficiente para cortes musicais em música popular 4/4
- [x] Zero crashes do Premiere durante uso normal
- [x] Sem jargão musical na UI
- [x] Funciona identicamente em Windows e macOS a partir do mesmo `.ccx`
