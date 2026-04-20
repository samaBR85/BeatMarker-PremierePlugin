# UXP Plugin Development — Reference Bible

> Technical reference based on the development of BeatMarker, a UXP plugin for Adobe Premiere Pro. Everything here has been **confirmed in production** — this is not official documentation, it's what actually works.

---

## 1. What is UXP

**Unified Extensibility Platform** — Adobe's modern runtime for plugins in Premiere Pro, Photoshop, InDesign and other apps. Replaces CEP (Chrome Embedded Framework) and ExtendScript.

- Based on a proprietary JavaScript runtime (not V8, not full Node.js)
- Supports HTML + CSS + vanilla JS for UI
- Accesses native app APIs via specific modules (`premierepro`, `photoshop`, etc.)
- Distributed as `.ccx` files

> ⚠️ **Never use CEP or ExtendScript documentation as reference** — the APIs are completely different.

---

## 2. Manifest (exact format)

```json
{
  "manifestVersion": 5,
  "id": "com.yourdomain.yourplugin",
  "name": "PluginName",
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
      "id": "my-panel",
      "label": "My Plugin",
      "minimumSize": { "width": 220, "height": 200 },
      "maximumSize": { "width": 2000, "height": 2000 },
      "preferredDockedSize":   { "width": 260, "height": 400 },
      "preferredFloatingSize": { "width": 260, "height": 400 }
    }
  ]
}
```

### Manifest pitfalls

| ❌ Wrong | ✅ Correct |
|---|---|
| `"app": "PPRO"` | `"app": "premierepro"` (lowercase) |
| `"host": [{ ... }]` | `"host": { ... }` (object, not array) |
| missing `"main"` | `"main": "index.html"` is required |
| missing `launchProcess` | required for `shell.openExternal()` |
| missing `localFileSystem` | required for `fs.readFile()` |

---

## 3. What exists and what does NOT exist in UXP

### ✅ Available

```js
require('premierepro')         // Premiere Pro API
require('fs')                  // filesystem — Promise-based only
require('uxp')                 // UXP APIs (shell, storage, etc.)
require('uxp').shell.openExternal('https://...')  // open external links
navigator.language             // system locale
fetch('https://...')           // HTTP requests (not file://)
TextDecoder / TextEncoder      // available
BigInt                         // available
```

### ❌ NOT available

```js
new Worker(...)                // typeof Worker === 'undefined'
AudioContext / webkitAudioContext
require('child_process')
fs.readFileSync                // "Route not found" — use async fs.readFile
fetch('file://...')            // blocked by sandbox
WebAssembly with pthreads      // crashes the host app immediately
SharedArrayBuffer              // not available
uxp.versions                   // returns {} — useless for version detection
```

### ⚠️ Available but with different behavior

```js
// CSS variables sometimes don't resolve for background-color
// Use inline styles for critical colors:
element.style.backgroundColor = '#027aff'; // ✅
// instead of: background-color: var(--accent); // ⚠️ may not work

// fs.readFile returns a UXP proxy ArrayBuffer, not a native one
// Always copy to a native ArrayBuffer before processing:
const raw = await fs.readFile(path);
const buf = new ArrayBuffer(raw.byteLength ?? raw.length);
new Uint8Array(buf).set(new Uint8Array(raw));
```

---

## 4. Filesystem

```js
const fs = require('fs');

// Reading — ALWAYS async, NEVER readFileSync
const raw = await fs.readFile('/absolute/path/to/file.wav');

// raw is a UXP proxy ArrayBuffer — copy to native before processing
const byteLength = raw.byteLength ?? raw.length;
const nativeBuffer = new ArrayBuffer(byteLength);
new Uint8Array(nativeBuffer).set(new Uint8Array(raw));

// Writing
await fs.writeFile('/path/to/file.json', JSON.stringify(data));
```

Required in manifest:
```json
"requiredPermissions": { "localFileSystem": "fullAccess" }
```

---

## 5. Premiere Pro APIs

### Project and selection

```js
const ppro = require('premierepro');

const project = await ppro.Project.getActiveProject();
if (!project) throw new Error('No project open.');

const selection = await ppro.ProjectUtils.getSelection(project);
const items = await selection.getItems();  // ProjectItem[]

const clipItem = items[0];
// clipItem.type === 1  →  media clip
// clipItem.type === 2  →  bin/folder
// clipItem.name        →  item name

// REQUIRED before accessing source markers:
const clipPI = ppro.ClipProjectItem.cast(clipItem);
const mediaPath = await clipPI.getMediaFilePath();
```

### Source markers (ClipProjectItem)

```js
// Always cast first — getMarkers(projectItem) directly returns null
const clipPI = ppro.ClipProjectItem.cast(projectItem);
const clipMarkers = await ppro.Markers.getMarkers(clipPI);

// Read existing markers
const allMarkers = await clipMarkers.getMarkers(); // Marker[]

// Filter by prefix (recommended pattern to identify plugin markers)
const myMarkers = allMarkers.filter(m => m.getName().startsWith('[MY_PLUGIN]'));
```

### Create markers via transaction

```js
await project.executeTransaction(async (ca) => {
  ca.addAction(clipMarkers.createAddMarkerAction(
    '[MY_PLUGIN] label',               // name
    'Comment',                         // type: 'Comment' | 'Chapter' | 'Segmentation' | 'WebLink'
    ppro.TickTime.createWithSeconds(t), // position (seconds)
    ppro.TickTime.createWithSeconds(0), // duration (0 = point marker)
    'my-plugin-guid'                    // guid/tag — free string
  ));
}, 'Undo label here');
```

### Color markers

```js
await project.executeTransaction(async (ca) => {
  ca.addAction(marker.createSetColorByIndexAction(colorIndex));
  // ❌ Do NOT use: createSetColorIndexAction (does not exist)
}, 'Undo label');
```

### Rename markers

```js
if (typeof marker.createSetNameAction === 'function') {
  ca.addAction(marker.createSetNameAction('new name'));
}
```

### Delete markers

```js
// Try multiple methods — the API changes between Premiere versions
const getDeleteAction = (collection, marker) => {
  if (typeof marker.createDeleteMarkerAction     === 'function') return marker.createDeleteMarkerAction();
  if (typeof marker.createRemoveMarkerAction     === 'function') return marker.createRemoveMarkerAction();
  if (typeof collection.createDeleteMarkerAction === 'function') return collection.createDeleteMarkerAction(marker);
  if (typeof collection.createRemoveMarkerAction === 'function') return collection.createRemoveMarkerAction(marker);
  return null;
};
```

### Marker object getters

```js
// Always use getter methods — direct properties return undefined
marker.getName()        // ✅    marker.name        // ❌ undefined
marker.getColorIndex()  // ✅    marker.colorIndex  // ❌ undefined
marker.getStart()       // ✅  → TickTime
marker.getDuration()    // ✅  → TickTime
marker.getComments()    // ✅

// TickTime → ticks (BigInt)
const ticks = marker.getStart().ticks;
// Sort markers safely:
.sort((a, b) => {
  try { return Number(BigInt(a.getStart().ticks) - BigInt(b.getStart().ticks)); }
  catch { return 0; }
});
```

### Transactions — important rules

```js
// Maximum ~50 actions per executeTransaction — more may hang
// Always use batches:
const BATCH = 50;
for (let b = 0; b < items.length; b += BATCH) {
  const slice = items.slice(b, b + BATCH);
  await project.executeTransaction(async (ca) => {
    for (const item of slice) {
      ca.addAction(/* ... */);
    }
  }, 'Undo description — batch ' + (b / BATCH + 1));
}
```

### Premiere native colors (colorIndex)

| Index | Color  | Approx hex |
|-------|--------|------------|
| 0     | Green  | `#4aad4a`  |
| 1     | Red    | `#d53a3a`  |
| 2     | Purple | `#a06db5`  |
| 3     | Orange | `#e8832a`  |
| 4     | Yellow | `#d4a017`  |
| 5     | White  | `#d0d0d0`  |
| 6     | Blue   | `#4084e5`  |
| 7     | Cyan   | `#1ab3a6`  |

---

## 6. External links

```js
// Requires launchProcess in manifest
require('uxp').shell.openExternal('https://github.com/samaBR85');
```

---

## 7. Internationalization (i18n)

```js
// Detect system language
const LANG = (navigator.language || 'en').startsWith('pt') ? 'pt' : 'en';

const T = {
  pt: {
    btnAnalyze:   'ANALISAR CLIPE',
    statusDone:   'Análise concluída ✓',
    errNoProject: 'Nenhum projeto aberto.',
    // ...
  },
  en: {
    btnAnalyze:   'ANALYZE CLIP',
    statusDone:   'Analysis complete ✓',
    errNoProject: 'No project open.',
    // ...
  },
}[LANG];

// Usage
btnAnalyze.textContent = T.btnAnalyze;
setStatus(T.statusDone, 'ok');
```

---

## 8. Bundling with esbuild (for code using npm packages)

When using npm libraries that depend on Node.js modules missing in UXP, use esbuild with stubs:

### build.js

```js
const esbuild = require('esbuild');
const path = require('path');

esbuild.build({
  entryPoints: ['src/my-entry.js'],
  bundle: true,
  format: 'cjs',
  platform: 'node',
  outfile: 'my-bundle.js',
  inject: [path.resolve(__dirname, 'src/stubs/globals.js')],
  alias: {
    'url':               path.resolve(__dirname, 'src/stubs/url.js'),
    'vm':                path.resolve(__dirname, 'src/stubs/vm.js'),
    'worker_threads':    path.resolve(__dirname, 'src/stubs/worker_threads.js'),
    '@eshaz/web-worker': path.resolve(__dirname, 'src/stubs/web-worker.js'),
  },
  define: { 'process.env.NODE_ENV': '"production"' },
});
```

### Required stubs

**globals.js** — globally injected polyfills:
```js
if (typeof TextDecoder === 'undefined') {
  globalThis.TextDecoder = class TextDecoder {
    decode(buffer) { /* simple implementation */ }
  };
}
if (typeof TextEncoder === 'undefined') {
  globalThis.TextEncoder = class TextEncoder {
    encode(str) { return new Uint8Array([...str].map(c => c.charCodeAt(0))); }
  };
}
```

**url.js** — Node.js `url` module:
```js
export const pathToFileURL = p => p;
export const fileURLToPath = p => p;
```

**vm.js** — Node.js `vm` module:
```js
export const runInNewContext = (code, ctx) => eval(code);
```

**worker_threads.js** — `worker_threads` module:
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

## 9. Pure JS audio decoding

### Why pure JS

| Technology | Problem in UXP |
|---|---|
| WASM with pthreads | Crashes the host app immediately |
| `mpg123-decoder` v1.x | Single-threaded WASM — still crashes Premiere Pro on analysis |
| `AudioContext.decodeAudioData` | Does not exist in UXP |
| Web Workers | `typeof Worker === 'undefined'` |

### WAV decoder

```js
function decodeWav(arrayBuffer) {
  const view = new DataView(arrayBuffer);

  // Validate RIFF/WAVE
  const riff = String.fromCharCode(view.getUint8(0),view.getUint8(1),view.getUint8(2),view.getUint8(3));
  const wave = String.fromCharCode(view.getUint8(8),view.getUint8(9),view.getUint8(10),view.getUint8(11));
  if (riff !== 'RIFF' || wave !== 'WAVE') throw new Error('Invalid WAV file');

  // Walk chunks
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

### MP3 decoder (js-mp3, pure JS)

```js
import Mp3 from 'js-mp3';
import Mp3Frame from 'js-mp3/src/frame';

function decodeMp3(arrayBuffer) {
  const decoder = Mp3.newDecoder(arrayBuffer);
  const nch = decoder.frame.header.numberOfChannels();
  const sampleRate = decoder.sampleRate;
  const FRAME_STEP = 2; // downsample 2:1 within each frame (perf optimization)

  const mono = new Float32Array(Math.ceil(decoder.frameStarts.length * 1152 / FRAME_STEP));
  let writePos = 0;

  decoder.source.seek(decoder.frameStarts[0]);
  let prevFrame = null;
  while (true) {
    const result = Mp3Frame.read(decoder.source, decoder.source.pos, prevFrame);
    if (result.err) break;
    prevFrame = result.f;
    const pcm = result.f.decode();
    const view = new DataView(pcm.buffer, pcm.byteOffset, pcm.byteLength);
    const n = pcm.byteLength / (nch * 2);
    for (let i = 0; i < n; i += FRAME_STEP) {
      let sum = 0;
      for (let c = 0; c < nch; c++) sum += view.getInt16((i * nch + c) * 2, true) / 32768;
      mono[writePos++] = sum / nch;
    }
  }

  // Strip encoder delay + js-mp3 MDCT startup delay
  const encoderDelay  = getMp3EncoderDelay(arrayBuffer); // from Xing/LAME header
  const JS_MP3_STARTUP = 2070; // empirically measured MDCT warm-up samples @ native SR
  const delaySamples  = Math.ceil((encoderDelay + JS_MP3_STARTUP) / FRAME_STEP);

  return { mono: mono.subarray(delaySamples, writePos), sampleRate: sampleRate / FRAME_STEP };
}
```

#### MP3 timing calibration

The `js-mp3` decoder introduces two timing offsets that must be stripped before beat detection:

| Source | Samples (44100 Hz) | Explanation |
|---|---|---|
| Encoder delay | 576 (typical LAME/FFmpeg) | Read from Xing/LAME header — varies per file |
| MDCT startup | 2070 | js-mp3 IMDCT overlap-add warm-up — constant |
| **Total** | **2646** | `(encoderDelay + 2070) / FRAME_STEP` stored samples |

**Calibration method:** compare first beat positions from js-mp3 vs `mpg123-decoder` (reference) on the same file. Iterate `JS_MP3_STARTUP` until offset = 0.00s.

#### Xing/LAME header parser

```js
function getMp3EncoderDelay(arrayBuffer) {
  const data = new Uint8Array(arrayBuffer);
  let i = 0;
  // Skip ID3v2 tag if present
  if (data[0] === 0x49 && data[1] === 0x44 && data[2] === 0x33) {
    const id3Size = ((data[6]&0x7F)<<21)|((data[7]&0x7F)<<14)|((data[8]&0x7F)<<7)|(data[9]&0x7F);
    i = 10 + id3Size;
  }
  // Find first MP3 sync word
  while (i < Math.min(data.length-4, 32768)) {
    if (data[i] === 0xFF && (data[i+1] & 0xE0) === 0xE0) break;
    i++;
  }
  const version  = (data[i+1] >> 3) & 3;
  const isMono   = ((data[i+3] >> 6) & 3) === 3;
  const sideInfo = (version === 3) ? (isMono ? 17 : 32) : (isMono ? 9 : 17);
  const xOff = i + 4 + sideInfo;
  const tag = String.fromCharCode(data[xOff],data[xOff+1],data[xOff+2],data[xOff+3]);
  if (tag !== 'Xing' && tag !== 'Info') return 1105; // fallback
  const flags = (data[xOff+4]<<24)|(data[xOff+5]<<16)|(data[xOff+6]<<8)|data[xOff+7];
  let lOff = xOff + 8;
  if (flags & 1) lOff += 4; if (flags & 2) lOff += 4;
  if (flags & 4) lOff += 100; if (flags & 8) lOff += 4;
  const lTag = String.fromCharCode(data[lOff],data[lOff+1],data[lOff+2],data[lOff+3]);
  if (lTag !== 'LAME' && lTag !== 'Lavc') return 1105;
  const delay = ((data[lOff+21] << 4) | (data[lOff+22] >> 4)) & 0xFFF;
  return delay > 0 ? delay : 1105;
}
```

### Resample (normalize to 44100 Hz)

`music-tempo` has internal parameters calibrated for 44100 Hz — always normalize before passing audio data.

```js
const TARGET_SR = 44100;

function resample(mono, srcRate) {
  if (srcRate === TARGET_SR) return mono;
  const ratio = srcRate / TARGET_SR;
  const out   = new Float32Array(Math.floor(mono.length / ratio));
  for (let i = 0; i < out.length; i++) {
    const pos  = i * ratio;
    const idx  = Math.floor(pos);
    const frac = pos - idx;
    out[i] = (mono[idx] ?? 0) + frac * ((mono[idx+1] ?? 0) - (mono[idx] ?? 0));
  }
  return out;
}
```

---

## 10. Packaging and distribution

### Development (UXP Developer Tool)

1. Open the **UXP Developer Tool**
2. **Add Plugin** → select `manifest.json`
3. **Load** in the Adobe app

### Distribution as `.ccx`

1. In UDT: **`...` → Package** on the plugin entry
2. Generates `PluginName.ccx`
3. Installation: **double-click** the `.ccx` with Premiere closed

### Adobe Exchange (official marketplace)

1. [developer.adobe.com/console](https://developer.adobe.com/console)
2. **New project → Add UXP Plugin**
3. Upload `.ccx` + 512×512px icon + screenshots + privacy policy
4. Adobe review (~days to 2 weeks)

---

## 11. Best practices

### UI

- Use unique, descriptive `id` attributes on HTML elements
- Set UI text via JS (not hardcoded in HTML) to support i18n
- Show inline spinner during long operations: `btn.innerHTML = '<span class="spinner"></span>PROCESSING...'`
- Always restore button text in the `finally` block
- Set `user-select: none` on body — prevents accidental text selection

### Transactions

- Always use `executeTransaction` for any write to the Premiere API
- Maximum 50 actions per transaction
- Always pass a descriptive label (shown in Premiere's Undo panel)
- Never modify the API outside a transaction

### Error handling

- Always wrap API calls in try/catch
- Restore UI state in `finally` (buttons, progress bar)
- Log errors with clear messages — the user cannot see the browser console

### Performance

- Heavy operations (audio decode, analysis) block the UI — always show visual feedback before starting
- Release references to large ArrayBuffers after use
- For large files, analysis can take several seconds — communicate this clearly in the UI

---

## 12. Pre-release checklist

- [ ] `"app": "premierepro"` lowercase in manifest
- [ ] `"host"` is an object, not an array
- [ ] `"main": "index.html"` present
- [ ] Required permissions declared in `requiredPermissions`
- [ ] Unique plugin ID (`com.yourdomain.yourplugin`)
- [ ] Semantic version in manifest (`1.0.0`)
- [ ] Tested on Windows and macOS
- [ ] No unnecessary `console.log` in production
- [ ] User-facing error messages are clear and actionable
- [ ] Pre-compiled bundle included in the plugin folder
