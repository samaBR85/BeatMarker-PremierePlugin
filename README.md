# 🥁 BeatMarker

**Plugin UXP para Adobe Premiere Pro** que detecta automaticamente as batidas de uma trilha de áudio e cria markers coloridos no source do clipe — dando ao editor uma referência visual rítmica precisa para cortes sincronizados com a música.

> **Beat detection plugin for Adobe Premiere Pro** — automatically analyzes audio and creates colored beat markers on the source clip for music-synced editing.

---

## ✨ O que faz / What it does

- 🎵 **Detecta BPM e beats** em arquivos WAV com um clique
- 🎨 **Cria markers coloridos** no source do clipe, diferenciando visualmente cada posição do compasso:
  - 🔴 Beat **1** → Vermelho / Red
  - 🔵 Beats **2 e 4** → Azul / Blue
  - 🟡 Beat **3** → Amarelo / Yellow
- ◀ ▶ **Ajuste de fase** — desloca qual beat é o "1" sem reanalisar o áudio
- 🗑️ **Remove markers** com um clique (qualquer clipe selecionado no Project panel)
- 🌐 **Bilíngue** — PT-BR e English, detectado automaticamente pelo idioma do sistema

---

## 🎬 Para quem é isso / Who it's for

Editores de vídeo que cortam no ritmo da música — videoclipes, trailers, reels, cortes sincronizados. Sem necessidade de conhecimento musical. Sem jargão. Funciona em **Windows e macOS** a partir do mesmo instalador.

*Video editors who cut to the beat — music videos, trailers, reels, sync edits. No music theory required. Works on Windows and macOS from the same installer.*

---

## 🚀 Como usar / How to use

**PT-BR**
1. Abra o painel **BeatMarker** no Premiere Pro (`Window → Extensions → BeatMarker`)
2. Selecione um clipe `.WAV` no painel Project
3. Clique em **ANALISAR CLIPE SELECIONADO**
4. Confira o BPM detectado
5. Clique em **CRIAR MARKERS NO CLIPE**
6. Se o beat "1" estiver na posição errada, use **◀ ▶** para ajustar
7. Para refazer: **REMOVER MARKERS**

**English**
1. Open the **BeatMarker** panel in Premiere Pro (`Window → Extensions → BeatMarker`)
2. Select a `.WAV` clip in the Project panel
3. Click **ANALYZE SELECTED CLIP**
4. Check the detected BPM
5. Click **CREATE MARKERS ON CLIP**
6. If beat "1" is in the wrong place, use **◀ ▶** to shift
7. To redo: **REMOVE MARKERS**

---

## 🛠️ Instalação para desenvolvimento / Dev install

### Pré-requisitos / Prerequisites
- Adobe Premiere Pro 25.0+
- [UXP Developer Tool](https://developer.adobe.com/photoshop/uxp/devtool/)

### Passos / Steps

```bash
# Clonar / Clone
git clone https://github.com/samaBR85/beatmarker-plugin.git
cd beatmarker-plugin
```

1. Abrir o **UXP Developer Tool**
2. Clicar em **Add Plugin**
3. Navegar até a pasta `plugin/` e selecionar o `manifest.json`
4. Clicar em **Load** no Premiere Pro

O `analysis-bundle.js` já está pré-compilado na pasta `plugin/` — não é necessário buildar para usar.

---

## 🔨 Rebuildar o bundle / Rebuild the bundle

Necessário apenas se modificar o código de análise de áudio em `experiments/exp-b-uxp-viability/src/`.

```bash
cd experiments/exp-b-uxp-viability
npm install
npm run build

# Copiar para o plugin
# Windows:
copy analysis-bundle.js ..\..\plugin\analysis-bundle.js
# macOS/Linux:
cp analysis-bundle.js ../../plugin/analysis-bundle.js
```

---

## 📁 Estrutura do projeto / Project structure

```
beatmarker-plugin/
│
├── plugin/                        ← Plugin pronto para instalar
│   ├── manifest.json              ← UXP manifest v5
│   ├── index.html                 ← Interface do painel
│   ├── main.js                    ← Lógica UXP + Premiere API + i18n
│   └── analysis-bundle.js        ← Bundle pré-compilado (WAV decoder + music-tempo)
│
├── experiments/
│   ├── exp-a-beat-detection/      ← Prova de conceito Node.js (mpg123 + music-tempo)
│   └── exp-b-uxp-viability/       ← Fonte do analysis-bundle
│       ├── src/
│       │   ├── analysis.js        ← Pipeline: WAV decoder + MP3 decoder + resample + beat detection
│       │   └── stubs/             ← Polyfills para módulos ausentes no UXP
│       ├── build.js               ← Config esbuild
│       └── package.json
│
├── SPEC.md                        ← Spec técnico completo
└── README.md
```

---

## ⚙️ Stack técnica / Tech stack

| Componente | Tecnologia |
|---|---|
| Runtime | UXP (Unified Extensibility Platform) — manifest v5 |
| UI | HTML + CSS + JavaScript vanilla |
| Decode WAV | DataView puro JS — PCM 8/16/24-bit + float32, qualquer sample rate |
| Decode MP3 | js-mp3 (sem WASM) com pré-alocação e downsample por frame |
| Beat detection | music-tempo |
| Bundler | esbuild |
| i18n | Detecção automática via `navigator.language` |

### Por que sem WASM / Why no WASM

| Tecnologia | Problema |
|---|---|
| WASM com pthreads | Crasha o Premiere imediatamente |
| Web Workers | `typeof Worker === 'undefined'` no UXP |
| `AudioContext` | Não existe no UXP |
| `fs.readFileSync` | "Route not found" no UXP |

---

## ⚠️ Limitações conhecidas / Known limitations

- Apenas arquivos `.WAV` aceitos na UI (compasso **4/4** apenas)
- Sem suporte a tempo variável (rubato, acelerando, ritardando)
- MP3 tem offset de ~50ms por encoder delay estrutural do LAME (aceito, WAV é recomendado)

---

## 📄 Licenças de terceiros / Third-party licenses

- [music-tempo](https://github.com/killiansheriff/music-tempo) — MIT
- [js-mp3](https://github.com/nicktindall/js-mp3) — MIT

---

## 👤 Créditos / Credits

Criado por / Created by **[samaBR](https://github.com/samaBR85)**
