# UXP Plugin Development — Reference Bible

> Guia de referência técnica baseado no desenvolvimento do BeatMarker, um plugin UXP para Adobe Premiere Pro. Tudo aqui foi **confirmado em produção** — não é documentação oficial, é o que realmente funciona.

---

## 1. O que é UXP

**Unified Extensibility Platform** — o runtime moderno da Adobe para plugins em Premiere Pro, Photoshop, InDesign e outros apps. Substitui o CEP (Chrome Embedded Framework) e o ExtendScript.

- Baseado em um runtime JavaScript proprietário (não é V8, não é Node.js completo)
- Suporta HTML + CSS + JS vanilla para UI
- Acessa APIs nativas do app via módulos específicos (`premierepro`, `photoshop`, etc.)
- Empacotado como `.ccx` para distribuição

> ⚠️ **Nunca use documentação CEP ou ExtendScript como referência** — as APIs são completamente diferentes.

---

## 2. Manifest (formato exato)

```json
{
  "manifestVersion": 5,
  "id": "com.seudominio.seuplugin",
  "name": "NomeDoPlugin",
  "version": "1.0.0",
  "main": "index.html",
  "host": {
    "app": "premierepro",
    "minVersion": "25.0.0"
  },
  "requiredPermissions": {
    "localFileSystem": "fullAccess",
    "launchProcess": {
      "schemes": ["https", "http"],
      "extensions": []
    }
  },
  "entrypoints": [
    {
      "type": "panel",
      "id": "meu-panel",
      "label": "Meu Plugin",
      "minimumSize": { "width": 220, "height": 200 },
      "maximumSize": { "width": 2000, "height": 2000 },
      "preferredDockedSize":   { "width": 260, "height": 400 },
      "preferredFloatingSize": { "width": 260, "height": 400 }
    }
  ]
}
```

### Armadilhas do manifest

| ❌ Errado | ✅ Correto |
|---|---|
| `"app": "PPRO"` | `"app": "premierepro"` (minúsculo) |
| `"host": [{ ... }]` | `"host": { ... }` (objeto, não array) |
| sem `"main"` | `"main": "index.html"` obrigatório |
| sem `launchProcess` | necessário para `shell.openExternal()` |
| sem `localFileSystem` | necessário para `fs.readFile()` |

---

## 3. O que existe e o que NÃO existe no UXP

### ✅ Existe

```js
require('premierepro')         // API do Premiere Pro
require('fs')                  // filesystem — apenas Promise-based
require('uxp')                 // APIs UXP (shell, storage, etc.)
require('uxp').shell.openExternal('https://...')  // abrir links externos
navigator.language             // locale do sistema
fetch('https://...')           // requisições HTTP (não file://)
TextDecoder / TextEncoder      // disponível
BigInt                         // disponível
```

### ❌ NÃO existe

```js
new Worker(...)                // typeof Worker === 'undefined'
AudioContext / webkitAudioContext
require('child_process')
fs.readFileSync                // "Route not found" — usar fs.readFile (async)
fetch('file://...')            // bloqueado pelo sandbox
WebAssembly com pthreads       // crasha o app host imediatamente
SharedArrayBuffer              // não disponível
uxp.versions                   // retorna {} — inútil para detectar versão
```

### ⚠️ Existe mas com comportamento diferente

```js
// CSS variables às vezes não resolvem para background-color
// Use inline styles para cores críticas:
element.style.backgroundColor = '#027aff'; // ✅
// em vez de: background-color: var(--accent); // ⚠️ pode não funcionar

// fs.readFile retorna um ArrayBuffer proxy, não nativo
// Sempre copiar para ArrayBuffer nativo antes de processar:
const raw = await fs.readFile(path);
const buf = new ArrayBuffer(raw.byteLength ?? raw.length);
new Uint8Array(buf).set(new Uint8Array(raw));
```

---

## 4. Filesystem

```js
const fs = require('fs');

// Leitura — SEMPRE async, NUNCA readFileSync
const raw = await fs.readFile('/caminho/absoluto/arquivo.wav');

// raw é um ArrayBuffer proxy do UXP — copiar para nativo antes de processar
const byteLength = raw.byteLength ?? raw.length;
const nativeBuffer = new ArrayBuffer(byteLength);
new Uint8Array(nativeBuffer).set(new Uint8Array(raw));

// Escrita
await fs.writeFile('/caminho/arquivo.json', JSON.stringify(data));
```

Requer no manifest:
```json
"requiredPermissions": { "localFileSystem": "fullAccess" }
```

---

## 5. APIs do Premiere Pro

### Projeto e seleção

```js
const ppro = require('premierepro');

const project = await ppro.Project.getActiveProject();
if (!project) throw new Error('Nenhum projeto aberto.');

const selection = await ppro.ProjectUtils.getSelection(project);
const items = await selection.getItems();  // ProjectItem[]

const clipItem = items[0];
// clipItem.type === 1  →  clip de mídia
// clipItem.type === 2  →  bin/pasta
// clipItem.name        →  nome do item

// OBRIGATÓRIO antes de acessar markers no source:
const clipPI = ppro.ClipProjectItem.cast(clipItem);
const mediaPath = await clipPI.getMediaFilePath();
```

### Markers no source (ClipProjectItem)

```js
// Sempre fazer cast antes — getMarkers(projectItem) direto retorna null
const clipPI = ppro.ClipProjectItem.cast(projectItem);
const clipMarkers = await ppro.Markers.getMarkers(clipPI);

// Ler markers existentes
const allMarkers = await clipMarkers.getMarkers(); // Marker[]

// Filtrar por prefixo (padrão recomendado para identificar markers do plugin)
const myMarkers = allMarkers.filter(m => m.getName().startsWith('[MEU_PLUGIN]'));
```

### Criar markers via transaction

```js
await project.executeTransaction(async (ca) => {
  ca.addAction(clipMarkers.createAddMarkerAction(
    '[MEU_PLUGIN] label',              // nome
    'Comment',                         // tipo: 'Comment' | 'Chapter' | 'Segmentation' | 'WebLink'
    ppro.TickTime.createWithSeconds(t), // posição (segundos)
    ppro.TickTime.createWithSeconds(0), // duração (0 = marker de ponto)
    'meu-plugin-guid'                   // guid/tag — string livre
  ));
}, 'Undo label aqui');
```

### Colorir markers

```js
await project.executeTransaction(async (ca) => {
  ca.addAction(marker.createSetColorByIndexAction(colorIndex));
  // ❌ NÃO usar: createSetColorIndexAction (não existe)
}, 'Undo label');
```

### Renomear markers

```js
if (typeof marker.createSetNameAction === 'function') {
  ca.addAction(marker.createSetNameAction('novo nome'));
}
```

### Deletar markers

```js
// Tentar múltiplos métodos — a API muda entre versões do Premiere
const getDeleteAction = (collection, marker) => {
  if (typeof marker.createDeleteMarkerAction     === 'function') return marker.createDeleteMarkerAction();
  if (typeof marker.createRemoveMarkerAction     === 'function') return marker.createRemoveMarkerAction();
  if (typeof collection.createDeleteMarkerAction === 'function') return collection.createDeleteMarkerAction(marker);
  if (typeof collection.createRemoveMarkerAction === 'function') return collection.createRemoveMarkerAction(marker);
  return null;
};
```

### Getters do objeto Marker

```js
// Sempre usar os métodos getter — propriedades diretas retornam undefined
marker.getName()        // ✅    marker.name        // ❌ undefined
marker.getColorIndex()  // ✅    marker.colorIndex  // ❌ undefined
marker.getStart()       // ✅  → TickTime
marker.getDuration()    // ✅  → TickTime
marker.getComments()    // ✅

// TickTime → segundos
const ticks = marker.getStart().ticks; // BigInt
// Comparar TickTimes com segurança:
.sort((a, b) => {
  try { return Number(BigInt(a.getStart().ticks) - BigInt(b.getStart().ticks)); }
  catch { return 0; }
});
```

### Transactions — regras importantes

```js
// Máximo ~50 actions por executeTransaction — mais que isso pode travar
// Sempre usar lotes (batches):
const BATCH = 50;
for (let b = 0; b < items.length; b += BATCH) {
  const slice = items.slice(b, b + BATCH);
  await project.executeTransaction(async (ca) => {
    for (const item of slice) {
      ca.addAction(/* ... */);
    }
  }, 'Descrição para o painel Undo — ' + (b / BATCH + 1));
}
```

### Cores nativas do Premiere (colorIndex)

| Index | Cor      | Hex aproximado |
|-------|----------|----------------|
| 0     | Verde    | `#4aad4a`      |
| 1     | Vermelho | `#d53a3a`      |
| 2     | Roxo     | `#a06db5`      |
| 3     | Laranja  | `#e8832a`      |
| 4     | Amarelo  | `#d4a017`      |
| 5     | Branco   | `#d0d0d0`      |
| 6     | Azul     | `#4084e5`      |
| 7     | Ciano    | `#1ab3a6`      |

---

## 6. Links externos

```js
// Requer launchProcess no manifest
require('uxp').shell.openExternal('https://github.com/samaBR85');
```

---

## 7. Internacionalização (i18n)

```js
// Detectar idioma do sistema
const LANG = (navigator.language || 'en').startsWith('pt') ? 'pt' : 'en';

const T = {
  pt: {
    btnAnalyze: 'ANALISAR CLIPE',
    statusDone: 'Análise concluída ✓',
    errNoProject: 'Nenhum projeto aberto.',
    // ...
  },
  en: {
    btnAnalyze: 'ANALYZE CLIP',
    statusDone: 'Analysis complete ✓',
    errNoProject: 'No project open.',
    // ...
  },
}[LANG];

// Uso
btnAnalyze.textContent = T.btnAnalyze;
setStatus(T.statusDone, 'ok');
```

---

## 8. Bundling com esbuild (para código fora do UXP)

Quando usar bibliotecas npm que dependem de módulos Node.js ausentes no UXP, usar esbuild com stubs:

### build.js

```js
const esbuild = require('esbuild');
const path = require('path');

esbuild.build({
  entryPoints: ['src/meu-entry.js'],
  bundle: true,
  format: 'cjs',
  platform: 'node',
  outfile: 'meu-bundle.js',
  inject: [path.resolve(__dirname, 'src/stubs/globals.js')],
  alias: {
    'url':              path.resolve(__dirname, 'src/stubs/url.js'),
    'vm':               path.resolve(__dirname, 'src/stubs/vm.js'),
    'worker_threads':   path.resolve(__dirname, 'src/stubs/worker_threads.js'),
    '@eshaz/web-worker':path.resolve(__dirname, 'src/stubs/web-worker.js'),
  },
  define: { 'process.env.NODE_ENV': '"production"' },
});
```

### Stubs necessários

**globals.js** — polyfills injetados globalmente:
```js
if (typeof TextDecoder === 'undefined') {
  globalThis.TextDecoder = class TextDecoder {
    decode(buffer) { /* implementação simples */ }
  };
}
if (typeof TextEncoder === 'undefined') {
  globalThis.TextEncoder = class TextEncoder {
    encode(str) { return new Uint8Array([...str].map(c => c.charCodeAt(0))); }
  };
}
```

**url.js** — módulo `url` do Node.js:
```js
export const pathToFileURL = p => p;
export const fileURLToPath = p => p;
```

**vm.js** — módulo `vm` do Node.js:
```js
export const runInNewContext = (code, ctx) => eval(code);
```

**worker_threads.js** — módulo `worker_threads`:
```js
export default {};
export const isMainThread = true;
export const parentPort = null;
```

**web-worker.js** — `@eshaz/web-worker`:
```js
export default class FakeWorker {
  constructor(fn) { this._fn = fn; }
  postMessage() {}
  terminate() {}
}
```

---

## 9. Decodificação de áudio em JS puro

### Por que JS puro

| Tecnologia | Problema no UXP |
|---|---|
| WASM com pthreads | Crasha o app host imediatamente |
| `mpg123-decoder` | Usa WASM → crash |
| `AudioContext.decodeAudioData` | Não existe no UXP |
| Web Workers | `typeof Worker === 'undefined'` |

### Decoder WAV

```js
function decodeWav(arrayBuffer) {
  const view = new DataView(arrayBuffer);

  // Validar RIFF/WAVE
  const riff = String.fromCharCode(view.getUint8(0),view.getUint8(1),view.getUint8(2),view.getUint8(3));
  const wave = String.fromCharCode(view.getUint8(8),view.getUint8(9),view.getUint8(10),view.getUint8(11));
  if (riff !== 'RIFF' || wave !== 'WAVE') throw new Error('Arquivo WAV inválido');

  // Percorrer chunks
  let offset = 12, audioFormat, numChannels, sampleRate, bitsPerSample, dataOffset, dataSize;
  while (offset < arrayBuffer.byteLength - 8) {
    const id   = String.fromCharCode(view.getUint8(offset),view.getUint8(offset+1),view.getUint8(offset+2),view.getUint8(offset+3));
    const size = view.getUint32(offset + 4, true);
    if (id === 'fmt ') {
      audioFormat   = view.getUint16(offset + 8,  true); // 1=PCM, 3=float32
      numChannels   = view.getUint16(offset + 10, true);
      sampleRate    = view.getUint32(offset + 12, true);
      bitsPerSample = view.getUint16(offset + 22, true);
    } else if (id === 'data') {
      dataOffset = offset + 8;
      dataSize   = size;
      break;
    }
    offset += 8 + size + (size % 2 !== 0 ? 1 : 0); // word-align
  }

  const numSamples = Math.floor(dataSize / (numChannels * bitsPerSample / 8));
  const mono = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    let sum = 0;
    for (let c = 0; c < numChannels; c++) {
      const off = dataOffset + (i * numChannels + c) * (bitsPerSample / 8);
      let s = 0;
      if (audioFormat === 3 && bitsPerSample === 32) s = view.getFloat32(off, true);
      else if (bitsPerSample === 16) s = view.getInt16(off, true) / 32768;
      else if (bitsPerSample === 24) {
        const v = view.getUint8(off) | (view.getUint8(off+1) << 8) | (view.getUint8(off+2) << 16);
        s = (v & 0x800000 ? v | ~0xFFFFFF : v) / 8388608;
      } else if (bitsPerSample === 8) s = (view.getUint8(off) - 128) / 128;
      sum += s;
    }
    mono[i] = sum / numChannels;
  }
  return { mono, sampleRate };
}
```

### Resample (normalizar para 44100 Hz)

```js
const TARGET_SR = 44100;

function resample(mono, srcRate) {
  if (srcRate === TARGET_SR) return mono;
  const ratio  = srcRate / TARGET_SR;
  const out    = new Float32Array(Math.floor(mono.length / ratio));
  for (let i = 0; i < out.length; i++) {
    const pos  = i * ratio;
    const idx  = Math.floor(pos);
    const frac = pos - idx;
    out[i] = (mono[idx] ?? 0) + frac * ((mono[idx+1] ?? 0) - (mono[idx] ?? 0));
  }
  return out;
}
```

### Decoder MP3 com js-mp3 (sem O(n²))

O `js-mp3` original usa `concatBuffers` que aloca um novo ArrayBuffer a cada frame — O(n²) — causando crash por pressão de memória. Fix:

```js
import Mp3 from 'js-mp3';
import Mp3Frame from 'js-mp3/src/frame';

function decodeMp3(arrayBuffer) {
  const decoder     = Mp3.newDecoder(arrayBuffer);
  const nch         = decoder.frame.header.numberOfChannels();
  const sampleRate  = decoder.sampleRate;
  const FRAME_STEP  = 2; // downsample 2:1 dentro de cada frame
  const mono = new Float32Array(Math.ceil(decoder.frameStarts.length * 1152 / FRAME_STEP));
  let writePos = 0;

  function storeFrame(frame) {
    const pcm  = frame.decode();
    const view = new DataView(pcm.buffer, pcm.byteOffset, pcm.byteLength);
    const n    = pcm.byteLength / (nch * 2);
    for (let i = 0; i < n; i += FRAME_STEP) {
      let sum = 0;
      for (let c = 0; c < nch; c++) sum += view.getInt16((i * nch + c) * 2, true) / 32768;
      mono[writePos++] = sum / nch;
    }
  }

  // Rebobinar com estado limpo para evitar double-decode do frame 1
  decoder.source.seek(decoder.frameStarts[0]);
  let prevFrame = null;
  while (true) {
    const result = Mp3Frame.read(decoder.source, decoder.source.pos, prevFrame);
    if (result.err) break;
    prevFrame = result.f;
    storeFrame(prevFrame);
  }

  return { mono: mono.subarray(0, writePos), sampleRate: sampleRate / FRAME_STEP };
}
```

**Por que não pular frames inteiros:** pular frames cria buracos temporais no sinal — os beats ficam deslocados. Downsample dentro de cada frame mantém a continuidade temporal.

**Encoder delay MP3:** ~50ms de offset estrutural do encoder LAME. Aceitável para uso prático. WAV é sempre mais preciso.

---

## 10. Empacotamento e distribuição

### Desenvolvimento (UXP Developer Tool)

1. Abrir o **UXP Developer Tool**
2. **Add Plugin** → selecionar `manifest.json`
3. **Load** no app Adobe

### Distribuição como `.ccx`

1. No UDT: **`...` → Package** na entrada do plugin
2. Gera `NomePlugin.ccx`
3. Instalação: **duplo clique** no `.ccx` com o Premiere fechado

### Adobe Exchange (marketplace oficial)

1. [developer.adobe.com/console](https://developer.adobe.com/console)
2. **New project → Add UXP Plugin**
3. Upload do `.ccx` + ícone 512×512px + screenshots + política de privacidade
4. Revisão Adobe (~dias a 2 semanas)

---

## 11. Boas práticas

### UI

- Use `id` únicos e descritivos nos elementos HTML
- Textos da UI via JS (não hardcoded no HTML) para facilitar i18n
- Spinner inline durante operações longas: `btn.innerHTML = '<span class="spinner"></span>PROCESSANDO...'`
- Restaurar texto do botão no `finally` do try/catch
- `user-select: none` no body — evita seleção acidental de texto

### Transações

- Sempre usar `executeTransaction` para qualquer escrita na API do Premiere
- Máximo 50 actions por transaction
- Sempre passar um label descritivo (aparece no painel Undo do Premiere)
- Nunca modificar a API fora de uma transaction

### Erros

- Sempre envolver chamadas de API em try/catch
- Restaurar estado da UI no `finally` (botões, progress bar)
- Logar erros com mensagem clara — o usuário não vê o console

### Performance

- Operações pesadas (decode de áudio, análise) bloqueiam a UI — dar feedback visual antes de iniciar
- Liberar referências a ArrayBuffers grandes após o uso
- `analyzeAudio` pode levar 5–8s para MP3 — comunicar isso na UI

---

## 12. Checklist pré-release

- [ ] `"app": "premierepro"` em minúsculo no manifest
- [ ] `"host"` é objeto, não array
- [ ] `"main": "index.html"` presente
- [ ] Permissões necessárias declaradas em `requiredPermissions`
- [ ] ID do plugin único (`com.seudominio.seuplugin`)
- [ ] Versão semântica no manifest (`1.0.0`)
- [ ] Testado no Windows e macOS
- [ ] Sem `console.log` desnecessários em produção
- [ ] Mensagens de erro úteis para o usuário final
- [ ] Bundle pré-compilado incluído na pasta do plugin
