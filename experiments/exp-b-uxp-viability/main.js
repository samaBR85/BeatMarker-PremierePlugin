/* Exp-B: UXP Viability — 4 testes independentes */

const { storage } = require('uxp');
const ppro = require('premierepro');

const LOG_PATH = 'D:\\Claude Code\\BeatMarker-plugin\\experiments\\exp-b-uxp-viability\\logs\\beatmarker-log.txt';

// ── Log helper ────────────────────────────────────────────────────────────────

const logEl = document.getElementById('log');

function log(msg, cls = '') {
  const line = document.createElement('span');
  if (cls) line.className = cls;
  line.textContent = msg + '\n';
  logEl.appendChild(line);
  logEl.scrollTop = logEl.scrollHeight;
}

function sep(label) {
  log('─── ' + label + ' ' + '─'.repeat(Math.max(0, 30 - label.length)), 'sep');
}

document.getElementById('btn-clear').onclick = () => {
  logEl.innerHTML = '';
};

document.getElementById('btn-copy').onclick = () => {
  const text = logEl.innerText;
  const ta = document.getElementById('log-text');
  ta.style.display = 'block';
  ta.value = text;
  ta.focus();
  ta.select();
};

// ── Utilidade: primeiro ProjectItem que seja clipe de mídia ───────────────────

async function findFirstMediaItem() {
  const project = await ppro.Project.getActiveProject();
  if (!project) return null;
  return searchItem(project.rootItem);
}

async function searchItem(item, depth) {
  if (!item) return null;
  depth = depth || 0;
  const indent = '  '.repeat(depth);
  log(indent + '"' + item.name + '" type=' + item.type, 'info');

  // Tentar getItems em qualquer tipo — bins respondem, clipes não
  if (typeof item.getItems === 'function') {
    try {
      const children = await item.getItems();
      if (children && children.length > 0) {
        for (const child of children) {
          const found = await searchItem(child, depth + 1);
          if (found) return found;
        }
        return null; // entrou mas não achou clipe nos filhos
      }
    } catch(e) {
      log(indent + '  getItems() erro: ' + e.message, 'fail');
    }
  }

  // type 2 = bin, type 3 = root — nunca retornar como clipe
  if (item.type === 2 || item.type === 3) return null;
  // Qualquer outro tipo em profundidade > 0 é candidato a clipe
  if (depth > 0) return item;
  return null;
}

// ── Teste 1: Essentia.js WASM ─────────────────────────────────────────────────

document.getElementById('btn-t1').onclick = async () => {
  sep('TESTE 1 — Essentia.js WASM');
  log('✗ DESABILITADO — Essentia.js usa Emscripten pthreads (SharedArrayBuffer)', 'fail');
  log('  que trava/crasha o Premiere Pro. Bloqueador confirmado.', 'fail');
  log('  Próximo passo: avaliar web-audio-beat-detector (JS puro, sem WASM).', 'info');
};

// ── Teste 2: Marker API ───────────────────────────────────────────────────────

document.getElementById('btn-t2').onclick = async () => {
  sep('TESTE 2 — Marker API');

  try {
    log('Obtendo projeto ativo...', 'info');
    const project = await ppro.Project.getActiveProject();
    if (!project) {
      log('✗ Nenhum projeto aberto.', 'fail');
      return;
    }
    log('Projeto: ' + project.name, 'info');

    log('project.path: ' + project.path, 'info');

    // Usar a sequence ativa para testar markers (não depende de seleção no Project panel)
    log('Obtendo sequence ativa...', 'info');
    const seq = await project.getActiveSequence();
    if (!seq) { log('✗ Nenhuma sequence ativa.', 'fail'); return; }
    log('Sequence: "' + seq.name + '"', 'info');

    // Teste A: ProjectUtils.getSelection
    log('Testando ProjectUtils.getSelection...', 'info');
    try {
      const selection = await ppro.ProjectUtils.getSelection(project);
      log('✓ getSelection: ' + JSON.stringify(selection) + ' count=' + (selection?.length ?? 'n/a'), 'ok');
    } catch(e) {
      log('✗ ProjectUtils.getSelection: ' + e.message, 'fail');
    }

    // Teste B: Markers API com TickTime
    log('Verificando ppro.Markers e ppro.TickTime...', 'info');
    const Markers = ppro.Markers;
    const TickTime = ppro.TickTime;
    log('ppro.Markers: ' + typeof Markers, 'info');
    log('ppro.TickTime: ' + typeof TickTime, 'info');
    if (!Markers) { log('✗ ppro.Markers não existe — bloqueador.', 'fail'); return; }

    log('Obtendo Markers da sequence...', 'info');
    let seqMarkers;
    try {
      seqMarkers = await Markers.getMarkers(seq);
      log('✓ Markers.getMarkers(seq) OK [' + typeof seqMarkers + ']', 'ok');
    } catch(e) {
      log('✗ Markers.getMarkers: ' + e.message, 'fail');
      return;
    }

    log('Criando marker via Transaction...', 'info');
    try {
      const startTime = TickTime
        ? TickTime.createWithSeconds(0)
        : { ticks: '0' };
      const duration = TickTime
        ? TickTime.createWithSeconds(1)
        : { ticks: '254016000000' };

      // executeTransaction é na instância project, não na classe ppro.Project
      await project.executeTransaction(async (compoundAction) => {
        const addAction = seqMarkers.createAddMarkerAction(
          '[BM-TEST]', 'Comment', startTime, duration, 'beatmarker-exp-b'
        );
        compoundAction.addAction(addAction);
      }, 'BeatMarker Exp-B');

      log('✓ Marker criado!', 'ok');

      // Ler marker criado e testar cor
      const allMarkers = await seqMarkers.getMarkers();
      log('Total markers na sequence: ' + (allMarkers?.length ?? 'n/a'), 'info');
      if (allMarkers?.length > 0) {
        const m = allMarkers[allMarkers.length - 1];
        log('Último marker: name="' + m.name + '" comments="' + m.comments + '"', 'info');

        try {
          await project.executeTransaction(async (ca) => {
            const colorAction = m.createSetColorIndexAction(3);
            ca.addAction(colorAction);
          }, 'BeatMarker set color');
          log('✓ createSetColorIndexAction(3) OK', 'ok');
          log('  getColorIndex(): ' + m.getColorIndex(), 'ok');
        } catch(ce) {
          log('✗ createSetColorIndexAction: ' + ce.message, 'fail');
        }
      }
    } catch(e) {
      log('✗ Transaction falhou: ' + e.message, 'fail');
      log('  ' + (e.stack || ''), 'fail');
    }

  } catch (err) {
    log('✗ ERRO no Teste 2: ' + err.message, 'fail');
    log('  ' + (err.stack || ''), 'fail');
  }
};

// ── Teste 3: Leitura de arquivo via uxp.storage ───────────────────────────────

document.getElementById('btn-t3').onclick = async () => {
  sep('TESTE 3 — Leitura de arquivo (storage)');

  try {
    // Usar path conhecido do arquivo de áudio no projeto atual
    // (evita depender do searchItem que ainda está em investigação)
    const project = await ppro.Project.getActiveProject();
    const projectDir = project.path.replace(/[^\\\/]+$/, '');
    log('Pasta do projeto: ' + projectDir, 'info');

    // Tentar localizar o MP3 via getActiveSequence + tracks
    const seq = await project.getActiveSequence();
    let mediaPath = null;
    if (seq) {
      const trackProbes = ['audioTracks','getAudioTracks'];
      for (const p of trackProbes) {
        try {
          const tracks = typeof seq[p] === 'function' ? await seq[p]() : seq[p];
          if (tracks && tracks.length > 0) {
            log('tracks[0] type: ' + typeof tracks[0], 'info');
            const clipProbes = ['getItems','clips','getClips'];
            for (const cp of clipProbes) {
              try {
                const clips = typeof tracks[0][cp] === 'function'
                  ? await tracks[0][cp]() : tracks[0][cp];
                log('tracks[0].' + cp + ': ' + JSON.stringify(clips), 'info');
                if (clips && clips.length > 0 && clips[0]) {
                  const mpProbes = ['getMediaPath','mediaPath','filePath','getFilePath'];
                  for (const mp of mpProbes) {
                    try {
                      const p2 = clips[0][mp];
                      const v = typeof p2 === 'function' ? await p2() : p2;
                      if (v) { log('clip.' + mp + ': ' + v, 'info'); mediaPath = v; }
                    } catch(e) {}
                  }
                }
              } catch(e) {}
            }
          }
        } catch(e) {}
      }
    }

    // Com fullAccess no manifest, fs.readFile deve funcionar em path absoluto
    // Pedir seletor para obter o path real do arquivo
    log('Abrindo seletor (selecione o MP3)...', 'info');
    let fileEntry = null;
    try {
      fileEntry = await storage.localFileSystem.getFileForOpening({
        types: ['mp3','wav','aiff','aac']
      });
    } catch(e) {
      log('✗ Seletor cancelado: ' + e.message, 'fail');
      return;
    }
    mediaPath = fileEntry.nativePath;
    log('Arquivo: ' + mediaPath, 'info');

    // Tentativa 1: fs.readFile Promise-based (UXP não usa callbacks)
    log('Tentando fs.readFile (fullAccess)...', 'info');
    try {
      const fs = require('fs');
      // UXP fs é Promise-based, não callback
      const buf = await fs.readFile(mediaPath);
      log('✓ fs.readFile OK — bytes: ' + (buf.length ?? buf.byteLength), 'ok');
      return;
    } catch(e1) {
      log('✗ fs.readFile falhou: ' + e1.message, 'fail');
    }

    // Tentativa 2: fileEntry.read() direto (picker já concede acesso)
    log('Tentando fileEntry.read()...', 'info');
    try {
      const data = await fileEntry.read({ format: storage.formats.binary });
      log('✓ fileEntry.read() OK — bytes: ' + (data.byteLength ?? data.length), 'ok');
      return;
    } catch(e2) {
      log('✗ fileEntry.read() falhou: ' + e2.message, 'fail');
    }

    // Tentativa 3: fileEntry.read() sem opções
    try {
      const data = await fileEntry.read();
      log('✓ fileEntry.read() (sem opts) OK — tipo: ' + typeof data
          + ' tamanho: ' + (data.byteLength ?? data.length ?? data.size ?? '?'), 'ok');
    } catch(e3) {
      log('✗ Todas as leituras falharam — bloqueador grave.', 'fail');
    }
  } catch (err) {
    log('✗ ERRO no Teste 3: ' + err.message, 'fail');
    log('  ' + (err.stack || ''), 'fail');
  }
};

// ── Teste 3b: Decodificação PCM via AudioContext ──────────────────────────────

document.getElementById('btn-t3b').onclick = async () => {
  sep('TESTE 3b — Decodificação PCM (AudioContext)');

  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;

    if (!AudioCtx) {
      log('✗ AudioContext não existe no runtime UXP — bloqueador grave.', 'fail');
      return;
    }
    log('✓ AudioContext: ' + (window.AudioContext ? 'AudioContext' : 'webkitAudioContext'), 'ok');

    const ctx = new AudioCtx();
    log('✓ new AudioContext() OK. sampleRate: ' + ctx.sampleRate + ' Hz', 'ok');

    if (typeof ctx.decodeAudioData !== 'function') {
      log('✗ ctx.decodeAudioData não existe — bloqueador grave.', 'fail');
      await ctx.close();
      return;
    }
    log('✓ ctx.decodeAudioData existe.', 'ok');

    log('Decodificando WAV sintético...', 'info');
    const wav = makeSilentWav(ctx.sampleRate, 1);
    const audioBuffer = await new Promise((resolve, reject) => {
      ctx.decodeAudioData(wav, resolve, reject);
    });

    log('✓ decodeAudioData OK — duração: ' + audioBuffer.duration.toFixed(4) + 's' +
        ', canais: ' + audioBuffer.numberOfChannels +
        ', sampleRate: ' + audioBuffer.sampleRate + ' Hz', 'ok');
    log('✓ getChannelData(): ' +
        (typeof audioBuffer.getChannelData === 'function' ? 'SIM' : 'NÃO'), 'ok');

    await ctx.close();
  } catch (err) {
    log('✗ ERRO no Teste 3b: ' + err.message, 'fail');
    log('  ' + (err.stack || ''), 'fail');
  }
};

// ── Teste 4: Importar beats JSON → markers na sequence ───────────────────────

document.getElementById('btn-t4').onclick = async () => {
  sep('TESTE 4 — Importar beats JSON');

  try {
    // 1. Selecionar o JSON de beats
    log('Selecione o arquivo _beats.json gerado pelo Exp-A...', 'info');
    const jsonEntry = await storage.localFileSystem.getFileForOpening({ types: ['json'] });
    log('Arquivo: ' + jsonEntry.nativePath, 'info');

    // 2. Ler e parsear
    const text = await jsonEntry.read({ format: storage.formats.utf8 });
    const { bpm, beats } = JSON.parse(text);
    log('BPM: ' + bpm + ' | Batidas: ' + beats.length, 'info');

    // 3. Obter projeto e sequence ativos
    const project = await ppro.Project.getActiveProject();
    const seq = await project.getActiveSequence();
    if (!seq) { log('✗ Nenhuma sequence ativa.', 'fail'); return; }
    log('Sequence: "' + seq.name + '"', 'info');

    const Markers = ppro.Markers;
    const TickTime = ppro.TickTime;
    const seqMarkers = await Markers.getMarkers(seq);

    // Cores por posição no compasso (index 0–7 do Premiere):
    // 0=Roxo, 1=Vermelho, 2=Laranja, 3=Amarelo, 4=Branco, 5=Azul, 6=Verde, 7=Ciano
    const COLOR = { '1': 1, '2-4': 5, '3': 3 }; // Vermelho, Azul, Amarelo

    log('Criando ' + beats.length + ' markers via transaction...', 'info');
    const BATCH = 50; // transaction por lote para não travar o Premiere
    let created = 0;

    for (let b = 0; b < beats.length; b += BATCH) {
      const slice = beats.slice(b, b + BATCH);
      await project.executeTransaction(async (ca) => {
        for (let i = 0; i < slice.length; i++) {
          const globalIdx = b + i;
          const beatPos = (globalIdx % 4) + 1;
          const role = beatPos === 1 ? '1' : beatPos === 3 ? '3' : '2-4';
          const name = '[BM] ' + beatPos;

          const startTime = TickTime.createWithSeconds(slice[i]);
          const duration = TickTime.createWithSeconds(0);

          const addAction = seqMarkers.createAddMarkerAction(
            name, 'Comment', startTime, duration, 'beatmarker'
          );
          ca.addAction(addAction);
        }
      }, 'BeatMarker import batch ' + (b / BATCH + 1));
      created += slice.length;
      log('  ' + created + '/' + beats.length + ' markers criados...', 'info');
    }

    log('✓ ' + beats.length + ' markers criados!', 'ok');
    log('Agora aplique cores: selecione todos os markers [BM] e verifique visualmente.', 'info');

    // Aplicar cores direto via setColorByIndex() — API do Premiere Pro
    // 0=Verde, 1=Vermelho, 2=Roxo, 3=Laranja, 4=Amarelo, 5=Branco, 6=Azul, 7=Ciano
    log('Aplicando cores...', 'info');
    const allMarkers = await seqMarkers.getMarkers();
    log('Markers encontrados: ' + allMarkers.length, 'info');

    // Aplicar cores: beat 1=Vermelho(1), beat 2=Azul(6), beat 3=Amarelo(4), beat 4=Azul(6)
    // Método correto: createSetColorByIndexAction
    for (let b = 0; b < allMarkers.length; b += BATCH) {
      const slice = allMarkers.slice(b, b + BATCH);
      await project.executeTransaction(async (ca) => {
        for (let i = 0; i < slice.length; i++) {
          const beatPos = ((b + i) % 4) + 1;
          const colorIdx = beatPos === 1 ? 1 : beatPos === 3 ? 4 : 6;
          ca.addAction(slice[i].createSetColorByIndexAction(colorIdx));
        }
      }, 'BeatMarker colors batch ' + (b / BATCH + 1));
    }
    log('✓ Cores aplicadas! BPM: ' + bpm + ' | ' + beats.length + ' markers', 'ok');

  } catch (err) {
    log('✗ ERRO no Teste 4: ' + err.message, 'fail');
    log('  ' + (err.stack || ''), 'fail');
  }
};

// ── Teste 5: Marker no Source (ProjectItem) ───────────────────────────────────

document.getElementById('btn-t5').onclick = async () => {
  sep('TESTE 5 — Marker no Source (ProjectItem)');

  try {
    const project = await ppro.Project.getActiveProject();

    // 1. Obter item selecionado no painel Project
    log('Obtendo seleção no painel Project...', 'info');
    const selection = await ppro.ProjectUtils.getSelection(project);
    const items = await selection.getItems();
    log('Itens selecionados: ' + items.length, 'info');
    if (!items || items.length === 0) {
      log('✗ Nenhum item selecionado. Selecione o clipe no painel Project.', 'fail');
      return;
    }

    const clip = items[0];
    log('Clip: type=' + clip.type + ' name=' + clip.name, 'info');
    if (clip.type !== 1) {
      log('✗ Item não é clipe de mídia (type=' + clip.type + ', esperado 1)', 'fail');
      return;
    }

    // 2. Tentar via TrackItem na sequence
    log('Tentando via TrackItem na sequence...', 'info');
    const seq = await project.getActiveSequence();
    if (!seq) { log('✗ Nenhuma sequence ativa.', 'fail'); return; }

    const seqProto = Object.getOwnPropertyNames(Object.getPrototypeOf(seq));
    log('seq proto: ' + seqProto.join(', '), 'info');

    const audioTrackCount = await seq.getAudioTrackCount();
    log('Audio tracks: ' + audioTrackCount, 'info');

    let trackItem = null;
    for (let t = 0; t < audioTrackCount; t++) {
      const track = await seq.getAudioTrack(t);
      if (t === 0) log('track proto: ' + Object.getOwnPropertyNames(Object.getPrototypeOf(track)).join(', '), 'info');
      // ClipProjectItem.cast() para converter ProjectItem → ClipProjectItem
      log('Tentando ClipProjectItem.cast(clip)...', 'info');
      let clipPI;
      try {
        clipPI = ppro.ClipProjectItem.cast(clip);
        log('cast OK: ' + typeof clipPI, 'info');
        if (clipPI) {
          const castProto = Object.getOwnPropertyNames(Object.getPrototypeOf(clipPI));
          log('castProto: ' + castProto.join(', '), 'info');
        }
      } catch(e) {
        log('cast erro: ' + e.message, 'fail');
        return;
      }

      const clipMarkers2 = await ppro.Markers.getMarkers(clipPI);
      log('✓ Markers obtidos do source.', 'ok');

      // Selecionar JSON de beats
      log('Selecione o arquivo _beats.json...', 'info');
      const { storage } = require('uxp');
      const jsonEntry = await storage.localFileSystem.getFileForOpening({ types: ['json'] });
      const text = await jsonEntry.read({ format: storage.formats.utf8 });
      const { bpm, beats } = JSON.parse(text);
      log('BPM: ' + bpm + ' | Batidas: ' + beats.length, 'info');

      // Criar markers em lotes de 50
      const BATCH = 50;
      let created = 0;
      for (let b = 0; b < beats.length; b += BATCH) {
        const slice = beats.slice(b, b + BATCH);
        await project.executeTransaction(async (ca) => {
          for (let i = 0; i < slice.length; i++) {
            const beatPos = ((b + i) % 4) + 1;
            ca.addAction(clipMarkers2.createAddMarkerAction(
              '[BM] ' + beatPos, 'Comment',
              ppro.TickTime.createWithSeconds(slice[i]),
              ppro.TickTime.createWithSeconds(0),
              'beatmarker'
            ));
          }
        }, 'BeatMarker source batch ' + (b / BATCH + 1));
        created += slice.length;
        log('  ' + created + '/' + beats.length + ' markers criados...', 'info');
      }
      log('✓ ' + beats.length + ' markers criados no source!', 'ok');

      // Aplicar cores por índice
      log('Aplicando cores...', 'info');
      const allSourceMarkers = await clipMarkers2.getMarkers();
      for (let b = 0; b < allSourceMarkers.length; b += BATCH) {
        const slice = allSourceMarkers.slice(b, b + BATCH);
        await project.executeTransaction(async (ca) => {
          for (let i = 0; i < slice.length; i++) {
            const beatPos = ((b + i) % 4) + 1;
            const colorIdx = beatPos === 1 ? 1 : beatPos === 3 ? 4 : 6;
            ca.addAction(slice[i].createSetColorByIndexAction(colorIdx));
          }
        }, 'BeatMarker source colors ' + (b / BATCH + 1));
      }
      log('✓ Cores aplicadas! BPM: ' + bpm + ' | ' + beats.length + ' markers no source.', 'ok');
      log('Abra o clipe no Source Monitor para verificar.', 'info');
      return;
      log('Track ' + t + ': ' + trackItems.length + ' items', 'info');
      for (const item of trackItems) {
        const pi = await item.getProjectItem();
        if (pi && pi.name === clip.name) {
          trackItem = item;
          log('✓ TrackItem encontrado no track ' + t, 'ok');
          break;
        }
      }
      if (trackItem) break;
    }

    if (!trackItem) {
      log('✗ Clipe não encontrado em nenhum track. Coloque o clipe na timeline primeiro.', 'fail');
      return;
    }

    const tiProto = Object.getOwnPropertyNames(Object.getPrototypeOf(trackItem));
    log('TrackItem proto: ' + tiProto.join(', '), 'info');

    log('Tentando Markers.getMarkers(trackItem)...', 'info');
    const clipMarkers = await ppro.Markers.getMarkers(trackItem);
    log('clipMarkers: ' + clipMarkers + ' (type=' + typeof clipMarkers + ')', 'info');
    if (!clipMarkers) {
      log('✗ Markers.getMarkers(trackItem) também retornou null.', 'fail');
      return;
    }

    // 3. Criar 1 marker de teste no source às 5s
    log('Criando marker no source às 5s...', 'info');
    const startTime = ppro.TickTime.createWithSeconds(5);
    const duration  = ppro.TickTime.createWithSeconds(0);

    await project.executeTransaction(async (ca) => {
      const addAction = clipMarkers.createAddMarkerAction(
        '[BM-SOURCE-TEST]', 'Comment', startTime, duration, 'bm-source-test'
      );
      ca.addAction(addAction);
    }, 'BeatMarker source test');
    log('✓ Marker criado no source!', 'ok');

    // 4. Ler de volta e colorir
    const sourceMarkers = await clipMarkers.getMarkers();
    log('Markers no source: ' + sourceMarkers.length, 'info');
    if (sourceMarkers.length > 0) {
      const last = sourceMarkers[sourceMarkers.length - 1];
      await project.executeTransaction(async (ca) => {
        ca.addAction(last.createSetColorByIndexAction(1)); // Vermelho
      }, 'BeatMarker source color');
      log('✓ Cor aplicada (Vermelho)!', 'ok');
      log('Abra o clipe no Source Monitor e verifique o marker às 5s.', 'info');
    }

  } catch (err) {
    log('✗ ERRO no Teste 5: ' + err.message, 'fail');
    log('  ' + (err.stack || ''), 'fail');
  }
};

// ── Teste 6: Beat Detection dentro do UXP ────────────────────────────────────

document.getElementById('btn-t6').onclick = async () => {
  sep('TESTE 6 — Beat Detection dentro do UXP');

  try {
    // 1. Carregar o bundle de análise
    log('Carregando analysis-bundle.js...', 'info');
    let analyzeAudio;
    try {
      const bundle = require('./analysis-bundle.js');
      analyzeAudio = bundle.analyzeAudio;
      // guardar referência ao bundle para testDecoderInit
      window._analysisBundle = bundle;
      log('✓ Bundle carregado. analyzeAudio: ' + typeof analyzeAudio, 'ok');
    } catch(e) {
      log('✗ Falha ao carregar bundle: ' + e.message, 'fail');
      return;
    }

    // 2. Obter o clipe selecionado no Project panel
    log('Obtendo clipe selecionado...', 'info');
    const project = await ppro.Project.getActiveProject();
    const selection = await ppro.ProjectUtils.getSelection(project);
    const items = await selection.getItems();
    if (!items || items.length === 0) {
      log('✗ Nenhum item selecionado no Project panel.', 'fail');
      return;
    }
    const clip = items[0];
    const clipPI = ppro.ClipProjectItem.cast(clip);
    if (!clipPI) { log('✗ Item não é um clipe de mídia.', 'fail'); return; }

    // 3. Obter o path do arquivo de áudio
    const mediaPath = await clipPI.getMediaFilePath();
    log('Path: ' + mediaPath, 'info');

    // 4. Ler o arquivo via fs
    log('Lendo arquivo...', 'info');
    const fs = require('fs');
    const t0read = Date.now();
    const raw = await fs.readFile(mediaPath);
    log('raw type: ' + Object.prototype.toString.call(raw), 'info');
    log('raw.length: ' + raw.length + ' | raw.byteLength: ' + raw.byteLength, 'info');

    // Converter para Uint8Array independente do tipo retornado
    let mp3Buffer;
    if (raw instanceof Uint8Array) {
      mp3Buffer = raw;
    } else if (raw instanceof ArrayBuffer) {
      mp3Buffer = new Uint8Array(raw);
    } else if (raw && raw.buffer instanceof ArrayBuffer) {
      mp3Buffer = new Uint8Array(raw.buffer, raw.byteOffset, raw.byteLength);
    } else {
      mp3Buffer = new Uint8Array(raw);
    }
    log('Lido: ' + (mp3Buffer.length / 1024 / 1024).toFixed(2) + ' MB em ' + (Date.now() - t0read) + 'ms', 'info');

    // 5. Detectar formato e analisar
    const magic = String.fromCharCode(mp3Buffer[0], mp3Buffer[1], mp3Buffer[2], mp3Buffer[3]);
    const fmt = magic.startsWith('RIFF') ? 'WAV'
              : (magic.startsWith('ID3') || (mp3Buffer[0] === 0xFF && (mp3Buffer[1] & 0xE0) === 0xE0)) ? 'MP3'
              : 'desconhecido';
    log('Formato detectado: ' + fmt + ' (' + magic.replace(/[^\x20-\x7E]/g, '?') + ')', 'info');

    log('Chamando analyzeAudio...', 'info');
    log('(WAV ~1s | MP3 ~5–8s — aguarde)', 'info');
    const t0 = Date.now();
    const { bpm, beats } = await analyzeAudio(mp3Buffer);
    const elapsed = Date.now() - t0;

    log('✓ BPM: ' + bpm, 'ok');
    log('✓ Beats: ' + beats.length + ' em ' + elapsed + 'ms', 'ok');
    log('Primeiros 4 beats: ' + beats.slice(0, 4).map(b => b.toFixed(3) + 's').join(', '), 'info');

    // 6. Criar markers no source (ClipProjectItem)
    log('Criando markers no source...', 'info');
    const clipMarkers = await ppro.Markers.getMarkers(clipPI);
    const BATCH = 50;
    let created = 0;
    for (let b = 0; b < beats.length; b += BATCH) {
      const slice = beats.slice(b, b + BATCH);
      await project.executeTransaction(async (ca) => {
        for (let i = 0; i < slice.length; i++) {
          const beatPos = ((b + i) % 4) + 1;
          ca.addAction(clipMarkers.createAddMarkerAction(
            '[BM] ' + beatPos, 'Comment',
            ppro.TickTime.createWithSeconds(slice[i]),
            ppro.TickTime.createWithSeconds(0),
            'beatmarker'
          ));
        }
      }, 'BeatMarker batch ' + (b / BATCH + 1));
      created += slice.length;
      log('  ' + created + '/' + beats.length + ' markers criados...', 'info');
    }

    // 7. Aplicar cores
    log('Aplicando cores...', 'info');
    const allMarkers = await clipMarkers.getMarkers();
    for (let b = 0; b < allMarkers.length; b += BATCH) {
      const slice = allMarkers.slice(b, b + BATCH);
      await project.executeTransaction(async (ca) => {
        for (let i = 0; i < slice.length; i++) {
          const beatPos = ((b + i) % 4) + 1;
          const colorIdx = beatPos === 1 ? 1 : beatPos === 3 ? 4 : 6;
          ca.addAction(slice[i].createSetColorByIndexAction(colorIdx));
        }
      }, 'BeatMarker colors ' + (b / BATCH + 1));
    }
    log('✓ Pipeline completo! BPM: ' + bpm + ' | ' + beats.length + ' markers no source.', 'ok');
    log('Abra o clipe no Source Monitor para verificar.', 'info');

  } catch (err) {
    log('✗ ERRO no Teste 6: ' + err.message, 'fail');
    log('  ' + (err.stack || ''), 'fail');
  }
};

// ── WAV sintético ─────────────────────────────────────────────────────────────

function makeSilentWav(sampleRate, numSamples) {
  const bitsPerSample = 16;
  const numChannels = 1;
  const byteRate = sampleRate * numChannels * bitsPerSample / 8;
  const blockAlign = numChannels * bitsPerSample / 8;
  const dataSize = numSamples * blockAlign;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);
  const write = (off, str) => { for (let i = 0; i < str.length; i++) view.setUint8(off + i, str.charCodeAt(i)); };
  write(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  write(8, 'WAVE');
  write(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  write(36, 'data');
  view.setUint32(40, dataSize, true);
  return buffer;
}
