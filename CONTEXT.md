# BeatMarker — Context

> Everything needed to understand, continue, or recreate this project from scratch.

---

## What it is

**BeatMarker** is a UXP plugin for Adobe Premiere Pro that detects the BPM and beat positions of a WAV or MP3 audio file and creates colored markers directly on the source clip in the Project panel. Built for video editors who cut to the beat — music videos, trailers, reels, sync edits.

- **Author:** samaBR ([@samaBR85](https://github.com/samaBR85))
- **Repo:** https://github.com/samaBR85/BeatMarker-PremierePlugin
- **Current version:** 1.2.0
- **Plugin ID (Adobe Exchange):** `8b52c087`
- **License:** GPL v3

---

## Repository structure

```
BeatMarker-PremierePlugin/
│
├── plugin/                        ← Ready-to-load plugin (load this in UDT)
│   ├── manifest.json              ← UXP manifest v5
│   ├── index.html                 ← Panel UI (HTML + CSS)
│   ├── main.js                    ← All logic: UXP, Premiere API, i18n
│   └── analysis-bundle.js        ← Pre-compiled bundle (WAV decoder + music-tempo)
│
├── experiments/
│   ├── exp-a-beat-detection/      ← Node.js proof of concept (WAV)
│   ├── exp-b-uxp-viability/       ← Bundle source (esbuild) — WAV + MP3
│   │   ├── src/
│   │   │   ├── analysis.js        ← WAV + MP3 decode + resample + beat detection
│   │   │   └── stubs/             ← Polyfills for UXP missing modules
│   │   ├── build.js               ← esbuild config
│   │   └── package.json
│   └── exp-c-uxp-mp3viability/    ← MP3 viability POC (Node.js + mpg123-decoder)
│       ├── src/
│       │   ├── test-node.js       ← Node.js POC (mpg123-decoder)
│       │   └── check-delay.js     ← Xing/LAME header inspector
│       └── package.json
│
├── screenshots/                   ← Usage screenshots
├── assets/                        ← Icon source files
├── docs/
│   └── DEVELOPMENT.md             ← Technical reference (confirmed production patterns)
├── SPEC.md                        ← Full technical spec + v1.1 features
├── CONTEXT.md                     ← This file
├── INSTALL.md                     ← End-user installation guide
└── README.md
```

---

## How the plugin works

1. User selects a `.WAV` or `.MP3` clip in the Premiere Pro Project panel
2. Clicks **ANALYZE SELECTED CLIP** → plugin reads the file via `fs.readFile`, detects format (WAV/MP3), decodes in pure JS, resamples to 44100 Hz, runs `music-tempo` beat detection
3. Displays BPM, beat count, and a **confidence indicator** (coefficient of variation of beat intervals)
4. User optionally toggles which beats to mark (1, 2, 3, 4) via clickable beat boxes
5. Clicks **CREATE MARKERS ON CLIP** → plugin creates markers via Premiere's transaction API, colored by beat position
6. User can use **◀ ▶** to shift which beat is considered "1" (phase adjustment)
7. **REMOVE MARKERS** deletes all `[BM]*` markers from the selected clip

---

## Marker color system

| Beat | Color | Premiere color index |
|------|-------|----------------------|
| 1 — Downbeat | 🔴 Red `#d53a3a` | 1 |
| 2 & 4 — Backbeats | 🔵 Blue `#4084e5` | 6 |
| 3 — Secondary downbeat | 🟡 Yellow `#d7ab2f` | 4 |

Marker colors are fixed — Premiere Pro does not expose a color picker API for plugin-created markers.

---

## Marker naming convention

Markers are named `[BM] {globalIdx}` where `globalIdx` is the index of the beat in the original `beats` array (0-based). This is intentional:

- Storing the global index (not the position 1–4) allows `recolorMarkers` to correctly recalculate beat position for any offset: `pos = ((globalIdx + offset) % 4) + 1`
- The `[BM]` prefix is used to identify and filter plugin markers for recolor and delete operations

---

## Beat selection + phase shift behavior

- `activeBeats` — a `Set<number>` initialized to `{1,2,3,4}`, min 1 active
- Beat boxes are clickable; use **inline styles** to toggle visual state (CSS class selectors lose to ID selectors with `!important`)
- On **CREATE MARKERS**: beats pre-filtered before the transaction loop using `beatsWithPos.filter(({ pos }) => activeBeats.has(pos))`
- On **phase shift (◀ ▶)**:
  - If all 4 beats active: recolor using `(globalIdx + offset) % 4 + 1`
  - If selective beats: cycle colors through `sortedActiveBeats[(markerIndex + offset) % activeBeats.size]` — markers stay at the same timestamps, only colors cycle within the active set

---

## BPM Confidence Indicator

Calculated from the coefficient of variation (CV) of beat intervals:

```js
function calculateConfidence(beats) {
  if (beats.length < 4) return 0;
  const intervals = [];
  for (let i = 1; i < beats.length; i++) intervals.push(beats[i] - beats[i - 1]);
  const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const variance = intervals.reduce((a, b) => a + (b - mean) ** 2, 0) / intervals.length;
  const cv = Math.sqrt(variance) / mean;
  return Math.max(0, Math.min(100, Math.round((1 - cv / 0.2) * 100)));
}
```

| Level | Range | Color |
|-------|-------|-------|
| High | >85% | `#34c759` |
| Medium | 60–85% | `#d7ab2f` |
| Low | <60% | `#d53a3a` |

Phrases are Whiplash/music culture references — always displayed in English regardless of UI language. Only the subtitles are translated.

---

## i18n

- Language detected via `navigator.language` → `'pt'` or `'en'`
- All strings in a `STRINGS` object with `pt` and `en` keys
- `const T = STRINGS[LANG]` — used throughout
- Confidence phrases (quotes) always in English; subtitles localized

---

## Tech stack

| Component | Technology |
|---|---|
| Runtime | UXP manifest v5 |
| UI | HTML + CSS + vanilla JS |
| WAV decoding | Pure JS (DataView) — PCM 8/16/24-bit + float32 |
| MP3 decoding | `js-mp3` (pure JS, no WASM) — bundled via esbuild |
| Beat detection | music-tempo |
| Bundler | esbuild |
| i18n | Auto-detected via `navigator.language` |

### Why no WASM / Web Workers / AudioContext
All three crash or are unavailable in UXP. See `docs/DEVELOPMENT.md` section 3 and 9.

> **v1.2 lesson:** `mpg123-decoder` (single-threaded WASM) still crashes Premiere Pro on analysis. The only safe MP3 decoder for UXP is `js-mp3` (100% pure JS).

---

## Key UXP constraints (confirmed in production)

- `fs.readFile` is async only — `readFileSync` throws "Route not found"
- `fs.readFile` returns a UXP proxy ArrayBuffer — copy to native before processing
- Max ~50 actions per `executeTransaction` — always batch
- Marker getters: always use `marker.getName()`, never `marker.name` (returns undefined)
- CSS: ID selectors with `!important` beat class selectors with `!important` — use inline styles for dynamic state
- `line-height` must be ≥ 1.5 on italic/small text to avoid descender clipping in UXP
- `continue` inside transaction callbacks can be unreliable — pre-filter arrays instead

---

## manifest.json (current)

```json
{
  "manifestVersion": 5,
  "id": "8b52c087",
  "name": "BeatMarker",
  "version": "1.2.0",
  "main": "index.html",
  "host": {
    "app": "premierepro",
    "minVersion": "25.0"
  },
  "requiredPermissions": {
    "localFileSystem": "fullAccess",
    "launchProcess": { "schemes": ["https", "http"], "extensions": [] }
  },
  "entrypoints": [{
    "type": "panel",
    "id": "beatmarker-panel",
    "label": "BeatMarker",
    "minimumSize": { "width": 220, "height": 200 },
    "maximumSize": { "width": 2000, "height": 2000 },
    "preferredDockedSize":   { "width": 260, "height": 300 },
    "preferredFloatingSize": { "width": 260, "height": 300 }
  }]
}
```

---

## Development workflow

```bash
# Load plugin for testing
# 1. Open UXP Developer Tool
# 2. Add Plugin → select plugin/manifest.json
# 3. Load in Premiere Pro

# Rebuild analysis bundle (only if analysis.js was modified)
cd experiments/exp-b-uxp-viability
npm install
npm run build
copy analysis-bundle.js ..\..\plugin\analysis-bundle.js
```

---

## Distribution

- **GitHub releases:** tag `vX.Y.Z`, attach `.ccx`
- **Adobe Exchange:** listing ID `8b52c087` at developer.adobe.com (submission pending — `HOSTAPP_VERSION_INVALID` error under investigation)
- **Install:** double-click `.ccx` with Premiere closed

---

## Known limitations

- WAV and MP3 only (4/4 time signature)
- No variable tempo support (rubato, ritardando)
- Marker colors are fixed — no API to change them
- Adobe Exchange submission blocked by `HOSTAPP_VERSION_INVALID` validation error (manifest format appears correct — may be an Exchange bug)

---

## v1.2.0 changelog

- **MP3 support** — WAV and MP3 files both accepted; format auto-detected by magic bytes
- **MP3 timing correction** — encoder delay read from Xing/LAME header; additional js-mp3 MDCT startup delay (2070 samples) stripped; calibrated to 0-frame offset vs mpg123-decoder reference
- **Pure JS MP3 decoder** (`js-mp3`) — WASM-based decoders (including single-threaded `mpg123-decoder`) crash Premiere Pro; js-mp3 is the only viable approach in UXP
- Updated UI hints and error messages to mention both formats

---

## v1.1.0 changelog

- BPM Confidence Indicator with color-coded bar, randomized phrase, localized subtitle
- Beat selection — toggle individual beats (1–4) before creating markers
- Phase shift with selective beats cycles colors within active set (not full 4-beat grid)
- UI spacing and typography improvements
