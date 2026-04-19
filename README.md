# BeatMarker — Plugin para Adobe Premiere Pro

Plugin UXP que detecta automaticamente as batidas de uma trilha de áudio e cria markers coloridos no source do clipe, diferenciando visualmente o **1**, o **2/4** e o **3** de cada compasso.

## Funcionalidades

- Detecta BPM e posição de cada batida em arquivos WAV
- Cria markers coloridos no source do clipe (não na timeline)
  - Beat **1** → Vermelho
  - Beats **2 e 4** → Azul
  - Beat **3** → Amarelo
- Botões **◀ ▶** para ajustar qual batida é o "1" sem reanalisar
- Botão para remover todos os markers `[BM]` do clipe
- Zero dependências externas em runtime — tudo roda dentro do UXP

## Estrutura

```
plugin/                        ← Plugin pronto para instalar
├── manifest.json
├── index.html
├── main.js
└── analysis-bundle.js         ← Bundle pré-compilado (WAV decoder + music-tempo)

experiments/
├── exp-a-beat-detection/      ← Prova de conceito Node.js (mpg123 + music-tempo)
└── exp-b-uxp-viability/       ← Fonte do analysis-bundle.js
    ├── src/
    │   ├── analysis.js        ← Pipeline principal (WAV decoder + MP3 decoder + resample)
    │   └── stubs/             ← Polyfills para módulos ausentes no UXP
    ├── build.js               ← Config esbuild
    └── package.json
```

## Como usar

1. Abra o **UXP Developer Tool**
2. Adicione o plugin apontando para a pasta `plugin/`
3. Carregue o plugin no Premiere Pro
4. No painel **BeatMarker**: selecione um clipe `.WAV` no painel Project e clique em **ANALISAR CLIPE SELECIONADO**

## Como rebuildar o bundle

```bash
cd experiments/exp-b-uxp-viability
npm install
npm run build
# Copiar o output para o plugin:
copy analysis-bundle.js ..\..\plugin\analysis-bundle.js
```

## Requisitos

- Adobe Premiere Pro 25.0+
- UXP Developer Tool (para desenvolvimento)
- Node.js (apenas para rebuildar o bundle)

## Stack

| Componente | Tecnologia |
|---|---|
| Runtime | UXP (manifestVersion 5) |
| UI | HTML + CSS + JS vanilla |
| Decode WAV | DataView puro JS |
| Decode MP3 | js-mp3 (sem WASM) |
| Beat detection | music-tempo |
| Bundler | esbuild |

## Limitações conhecidas

- Apenas arquivos `.WAV` aceitos na UI (MP3 suportado internamente mas com offset de ~50ms por encoder delay do LAME)
- Apenas compasso 4/4
- Sem suporte a tempo variável

## Créditos

Criado por [samaBR](https://github.com/samaBR85)  
Licenças de terceiros: [music-tempo](https://github.com/killiansheriff/music-tempo) · [js-mp3](https://github.com/nicktindall/js-mp3)
