# 🥁 BeatMarker

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

**UXP Plugin for Adobe Premiere Pro** that automatically detects beats in an audio track and creates colored markers on the source clip — giving editors a precise visual rhythm reference for music-synced cuts.

---

## ✨ Features

- 🎵 **Detects BPM and beats** in WAV files with one click
- 🎨 **Creates colored markers** on the source clip, visually distinguishing each beat position:
  - 🔴 Beat **1** → Red
  - 🔵 Beats **2 & 4** → Blue
  - 🟡 Beat **3** → Yellow
- ◀ ▶ **Phase adjustment** — shifts which beat is the "1" without re-analyzing
- 🗑️ **Remove markers** with one click (any clip selected in the Project panel)
- 🌐 **Bilingual** — automatically detected from system language (see [Languages](#-languages))

---

## 🎬 Who it's for

Video editors who cut to the beat — music videos, trailers, reels, sync edits. No music theory required. Works on **Windows and macOS** from the same installer.

---

## 🚀 How to use

1. Open the **BeatMarker** panel in Premiere Pro (`Window → Extensions → BeatMarker`)
2. Select a `.WAV` clip in the Project panel
3. Click **ANALYZE SELECTED CLIP**
4. Check the detected BPM
5. Click **CREATE MARKERS ON CLIP**
6. If beat "1" is in the wrong place, use **◀ ▶** to shift
7. To redo: click **REMOVE MARKERS**

---

## 🛠️ Dev install

### Prerequisites
- Adobe Premiere Pro 25.0+
- [UXP Developer Tool](https://developer.adobe.com/photoshop/uxp/devtool/)

### Steps

```bash
git clone https://github.com/samaBR85/BeatMarker-PremierePlugin.git
```

1. Open the **UXP Developer Tool**
2. Click **Add Plugin**
3. Navigate to the `plugin/` folder and select `manifest.json`
4. Click **Load** in Premiere Pro

The `analysis-bundle.js` is pre-compiled inside `plugin/` — no build step needed to run the plugin.

---

## 🔨 Rebuild the bundle

Only needed if you modify the audio analysis code in `experiments/exp-b-uxp-viability/src/`.

```bash
cd experiments/exp-b-uxp-viability
npm install
npm run build

# Copy to plugin:
# Windows:
copy analysis-bundle.js ..\..\plugin\analysis-bundle.js
# macOS/Linux:
cp analysis-bundle.js ../../plugin/analysis-bundle.js
```

---

## 📁 Project structure

```
BeatMarker-PremierePlugin/
│
├── plugin/                        ← Ready-to-install plugin
│   ├── manifest.json              ← UXP manifest v5
│   ├── index.html                 ← Panel UI
│   ├── main.js                    ← UXP logic + Premiere API + i18n
│   └── analysis-bundle.js        ← Pre-compiled bundle (WAV decoder + music-tempo)
│
├── experiments/
│   ├── exp-a-beat-detection/      ← Node.js proof of concept (mpg123 + music-tempo)
│   └── exp-b-uxp-viability/       ← Bundle source
│       ├── src/
│       │   ├── analysis.js        ← Pipeline: WAV decoder + MP3 decoder + resample + beat detection
│       │   └── stubs/             ← Polyfills for modules missing in UXP
│       ├── build.js               ← esbuild config
│       └── package.json
│
├── SPEC.md                        ← Full technical spec
└── README.md
```

---

## ⚙️ Tech stack

| Component | Technology |
|---|---|
| Runtime | UXP (Unified Extensibility Platform) — manifest v5 |
| UI | HTML + CSS + vanilla JavaScript |
| WAV decoding | Pure JS via DataView — PCM 8/16/24-bit + float32, any sample rate |
| MP3 decoding | js-mp3 (no WASM) with pre-allocation and per-frame downsampling |
| Beat detection | music-tempo |
| Bundler | esbuild |
| i18n | Auto-detected via `navigator.language` |

### Why no WASM

| Technology | Problem |
|---|---|
| WASM with pthreads | Crashes Premiere Pro immediately |
| Web Workers | `typeof Worker === 'undefined'` in UXP |
| `AudioContext` | Does not exist in UXP |
| `fs.readFileSync` | "Route not found" in UXP |

---

## 🌐 Languages

The UI language is detected automatically from the system locale — no configuration needed.

| Language | Locale |
|---|---|
| 🇧🇷 Portuguese (PT-BR) | `pt`, `pt-BR` |
| 🇺🇸 English | all other locales |

---

## ⚠️ Known limitations

- Only `.WAV` files are accepted in the UI (**4/4 time signature** only)
- No support for variable tempo (rubato, accelerando, ritardando)
- MP3 has a ~50ms offset due to LAME encoder delay (WAV is recommended)

---

## 📄 License

This project is licensed under the **GNU GPL v3** — any derivative work must also be open source.

### Third-party licenses

- [music-tempo](https://github.com/killiansheriff/music-tempo) — MIT
- [js-mp3](https://github.com/nicktindall/js-mp3) — MIT

---

## 👤 Credits

Created by **[samaBR](https://github.com/samaBR85)**
