/* BeatMarker — main.js */

const ppro = require('premierepro');
const fs   = require('fs');

// ── Internacionalização ───────────────────────────────────────────────────────
const LANG = (navigator.language || 'en').startsWith('pt') ? 'pt' : 'en';

const STRINGS = {
  pt: {
    // UI estática
    clipHint:    'Selecione um clip .WAV no painel do projeto',
    clipHint2:   'e clique em ANALISAR CLIPE SELECIONADO',
    bpmLabel:    'BPM · 4/4',
    btnAnalyze:  'ANALISAR CLIPE SELECIONADO',
    btnApply:    'CRIAR MARKERS NO CLIPE',
    btnClear:    'REMOVER MARKERS',
    logShow:     'mostrar log ▾',
    logHide:     'esconder log ▴',
    createdBy:   'criado por',
    ready:       'Pronto',
    // Estados dos botões
    analyzing:   'ANALISANDO...',
    creating:    'CRIANDO...',
    removing:    'REMOVENDO...',
    // Status
    statusGetting:  'Obtendo clip selecionado...',
    statusReading:  'Lendo arquivo...',
    statusDetecting:'Detectando beats...',
    statusDone:     'Análise concluída ✓',
    statusCreating: 'Criando markers...',
    statusCreated:  n  => `${n} markers criados ✓`,
    statusAdjusting:'Ajustando beat 1...',
    statusAdjusted: 'Beat 1 ajustado ✓',
    statusRemoving: 'Removendo markers...',
    statusRemoved:  n  => `${n} markers removidos ✓`,
    statusNone:     'Nenhum marker encontrado.',
    // Erros
    errNoProject:   'Nenhum projeto aberto.',
    errSelectClip:  'Selecione um clip no painel Project.',
    errNotMedia:    'Item selecionado não é um clip de mídia.',
    errCastFail:    'Não foi possível converter para ClipProjectItem.',
    errFormat:      ext => `Formato não suportado: ${ext}. Use um arquivo .WAV.`,
    errNoMarkers:   'Não foi possível obter markers do clip.',
    errNoAccess:    'Não foi possível acessar o clip.',
    errNoDelete:    'Erro: método de delete não encontrado',
    errBundle:      'Erro: bundle não carregado',
    // Log
    logBundleOk:    'analysis-bundle carregado.',
    logBundleFail:  msg => `✗ Falha ao carregar analysis-bundle: ${msg}`,
    logClip:        name => `Clip: ${name}`,
    logPath:        path => `Path: ${path}`,
    logSize:        mb   => `Tamanho: ${mb} MB`,
    logBeats:       (bpm, n, s) => `✓ BPM: ${bpm} | ${n} beats em ${s}s`,
    logCreated:     (n, bpm)    => `✓ ${n} markers criados. BPM: ${bpm}`,
    logRecolored:   off  => `✓ Cores atualizadas (offset=${off})`,
    logRemoved:     n    => `✓ ${n} markers removidos.`,
    logNoDelete:    '✗ Nenhum método de delete encontrado — veja o log.',
    logMarker:      m    => `marker: ${m}`,
    logCollection:  m    => `collection: ${m}`,
    // Clip sub-info
    subReading:     ext        => `${ext} · lendo arquivo...`,
    subDetecting:   (ext, mb)  => `${ext} · ${mb} MB · detectando beats...`,
    subDone:        (ext, mb, n) => `${ext} · ${mb} MB · ${n} beats`,
  },
  en: {
    clipHint:    'Select a .WAV clip in the Project panel',
    clipHint2:   'then click ANALYZE SELECTED CLIP',
    bpmLabel:    'BPM · 4/4',
    btnAnalyze:  'ANALYZE SELECTED CLIP',
    btnApply:    'CREATE MARKERS ON CLIP',
    btnClear:    'REMOVE MARKERS',
    logShow:     'show log ▾',
    logHide:     'hide log ▴',
    createdBy:   'created by',
    ready:       'Ready',
    analyzing:   'ANALYZING...',
    creating:    'CREATING...',
    removing:    'REMOVING...',
    statusGetting:  'Getting selected clip...',
    statusReading:  'Reading file...',
    statusDetecting:'Detecting beats...',
    statusDone:     'Analysis complete ✓',
    statusCreating: 'Creating markers...',
    statusCreated:  n  => `${n} markers created ✓`,
    statusAdjusting:'Adjusting beat 1...',
    statusAdjusted: 'Beat 1 adjusted ✓',
    statusRemoving: 'Removing markers...',
    statusRemoved:  n  => `${n} markers removed ✓`,
    statusNone:     'No markers found.',
    errNoProject:   'No project open.',
    errSelectClip:  'Select a clip in the Project panel.',
    errNotMedia:    'Selected item is not a media clip.',
    errCastFail:    'Could not convert to ClipProjectItem.',
    errFormat:      ext => `Unsupported format: ${ext}. Use a .WAV file.`,
    errNoMarkers:   'Could not get clip markers.',
    errNoAccess:    'Could not access clip.',
    errNoDelete:    'Error: delete method not found',
    errBundle:      'Error: bundle not loaded',
    logBundleOk:    'analysis-bundle loaded.',
    logBundleFail:  msg => `✗ Failed to load analysis-bundle: ${msg}`,
    logClip:        name => `Clip: ${name}`,
    logPath:        path => `Path: ${path}`,
    logSize:        mb   => `Size: ${mb} MB`,
    logBeats:       (bpm, n, s) => `✓ BPM: ${bpm} | ${n} beats in ${s}s`,
    logCreated:     (n, bpm)    => `✓ ${n} markers created. BPM: ${bpm}`,
    logRecolored:   off  => `✓ Colors updated (offset=${off})`,
    logRemoved:     n    => `✓ ${n} markers removed.`,
    logNoDelete:    '✗ No delete method found — check log.',
    logMarker:      m    => `marker: ${m}`,
    logCollection:  m    => `collection: ${m}`,
    subReading:     ext        => `${ext} · reading file...`,
    subDetecting:   (ext, mb)  => `${ext} · ${mb} MB · detecting beats...`,
    subDone:        (ext, mb, n) => `${ext} · ${mb} MB · ${n} beats`,
  },
};

const T = STRINGS[LANG];

// ── UI refs ───────────────────────────────────────────────────────────────────
const clipNameEl   = document.getElementById('clip-name');
const clipSubEl    = document.getElementById('clip-sub');
const clipHintEl   = document.getElementById('clip-hint');
const bpmValEl     = document.getElementById('bpm-val');
const bpmLabelEl   = document.getElementById('bpm-label');
const statusEl     = document.getElementById('status');
const progressWrap = document.getElementById('progress-wrap');
const logEl        = document.getElementById('log');
const btnAnalyze   = document.getElementById('btn-analyze');
const btnApply     = document.getElementById('btn-apply');
const btnClear     = document.getElementById('btn-clear-markers');
const btnPrev      = document.getElementById('btn-prev');
const btnNext      = document.getElementById('btn-next');
const btnLogToggle = document.getElementById('btn-log-toggle');
const createdByEl  = document.getElementById('created-by');

// ── Aplicar textos traduzidos ─────────────────────────────────────────────────
clipNameEl.textContent   = T.clipHint;
clipHintEl.textContent   = T.clipHint2;
bpmLabelEl.textContent   = T.bpmLabel;
btnAnalyze.textContent   = T.btnAnalyze;
btnApply.textContent     = T.btnApply;
btnClear.textContent     = T.btnClear;
btnLogToggle.textContent = T.logShow;
createdByEl.textContent  = T.createdBy;
statusEl.textContent     = T.ready;

// ── Cores fixas dos markers ───────────────────────────────────────────────────
// beat 1 → Vermelho (1) · beats 2/4 → Azul (6) · beat 3 → Amarelo (4)
const COLOR_BEAT1  = 1;
const COLOR_BEAT24 = 6;
const COLOR_BEAT3  = 4;

// ── Estado ────────────────────────────────────────────────────────────────────
let state = null; // { clipItem, clipPI, mediaPath, bpm, beats, offset }

// ── Log ───────────────────────────────────────────────────────────────────────
let logVisible = false;
btnLogToggle.onclick = () => {
  logVisible = !logVisible;
  logEl.classList.toggle('visible', logVisible);
  btnLogToggle.textContent = logVisible ? T.logHide : T.logShow;
};

function log(msg, cls = 'info') {
  const line = document.createElement('span');
  line.className = cls;
  line.textContent = msg + '\n';
  logEl.appendChild(line);
  logEl.scrollTop = logEl.scrollHeight;
  while (logEl.childElementCount > 300) logEl.removeChild(logEl.firstChild);
}

function setStatus(msg, cls = '') {
  statusEl.textContent = msg;
  statusEl.className = cls;
}

function setProgress(visible) {
  progressWrap.classList.toggle('visible', visible);
}

// ── Link créditos ─────────────────────────────────────────────────────────────
document.getElementById('link-sama').onclick = () => {
  require('uxp').shell.openExternal('https://github.com/samaBR85');
};

// ── Carregar bundle de análise ────────────────────────────────────────────────
let analyzeAudio = null;
try {
  analyzeAudio = require('./analysis-bundle.js').analyzeAudio;
  log(T.logBundleOk, 'ok');
} catch (e) {
  log(T.logBundleFail(e.message), 'fail');
  setStatus(T.errBundle, 'fail');
}

// ── BOTÃO: Analisar ───────────────────────────────────────────────────────────
btnAnalyze.onclick = async () => {
  if (!analyzeAudio) { setStatus(T.errBundle, 'fail'); return; }

  btnAnalyze.disabled = true;
  btnAnalyze.innerHTML = `<span class="spinner"></span>${T.analyzing}`;
  btnApply.disabled = true;
  btnClear.disabled = true;
  btnPrev.disabled  = true;
  btnNext.disabled  = true;
  setProgress(true);
  setStatus(T.statusGetting, 'info');
  bpmValEl.textContent = '--';

  state = null;

  try {
    const project = await ppro.Project.getActiveProject();
    if (!project) throw new Error(T.errNoProject);

    const selection = await ppro.ProjectUtils.getSelection(project);
    const items = await selection.getItems();
    if (!items || items.length === 0) throw new Error(T.errSelectClip);

    const clipItem = items[0];
    if (clipItem.type !== 1) throw new Error(T.errNotMedia);

    const clipPI = ppro.ClipProjectItem.cast(clipItem);
    if (!clipPI) throw new Error(T.errCastFail);

    const mediaPath = await clipPI.getMediaFilePath();
    const ext = mediaPath.split('.').pop().toLowerCase();
    if (ext !== 'wav') throw new Error(T.errFormat(ext.toUpperCase()));

    clipNameEl.textContent  = clipItem.name;
    clipSubEl.textContent   = T.subReading(ext.toUpperCase());
    clipSubEl.style.display = '';
    clipHintEl.style.display = 'none';
    log(T.logClip(clipItem.name), 'info');
    log(T.logPath(mediaPath), 'info');

    setStatus(T.statusReading, 'info');
    const raw = await fs.readFile(mediaPath);
    const mb = ((raw.byteLength ?? raw.length) / 1024 / 1024).toFixed(1);
    log(T.logSize(mb), 'info');
    clipSubEl.textContent = T.subDetecting(ext.toUpperCase(), mb);

    setStatus(T.statusDetecting, '');
    const t0 = Date.now();
    const result = await analyzeAudio(raw);
    const bpm    = parseFloat(result.bpm);
    const beats  = result.beats;
    const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
    log(T.logBeats(bpm.toFixed(1), beats.length, elapsed), 'ok');

    state = { clipItem, clipPI, mediaPath, bpm, beats, offset: 0 };

    bpmValEl.textContent  = bpm.toFixed(1);
    clipSubEl.textContent = T.subDone(ext.toUpperCase(), mb, beats.length);
    setStatus(T.statusDone, 'ok');

    btnApply.disabled = false;

  } catch (err) {
    log('✗ ' + err.message, 'fail');
    setStatus(err.message, 'fail');
    clipNameEl.textContent   = T.clipHint;
    clipSubEl.textContent    = '';
    clipSubEl.style.display  = 'none';
    clipHintEl.style.display = '';
  } finally {
    setProgress(false);
    btnAnalyze.disabled    = false;
    btnAnalyze.textContent = T.btnAnalyze;
  }
};

// ── BOTÃO: Aplicar Markers ────────────────────────────────────────────────────
btnApply.onclick = async () => {
  if (!state) return;

  btnApply.disabled = true;
  btnApply.innerHTML = `<span class="spinner"></span>${T.creating}`;
  setProgress(true);
  setStatus(T.statusCreating, 'info');

  try {
    const project = await ppro.Project.getActiveProject();
    const { clipPI, beats, bpm, offset } = state;

    const clipMarkers = await ppro.Markers.getMarkers(clipPI);
    if (!clipMarkers) throw new Error(T.errNoMarkers);

    const BATCH = 50;
    for (let b = 0; b < beats.length; b += BATCH) {
      const slice = beats.slice(b, b + BATCH);
      await project.executeTransaction(async (ca) => {
        for (let i = 0; i < slice.length; i++) {
          const beatPos = ((b + i + offset) % 4) + 1;
          ca.addAction(clipMarkers.createAddMarkerAction(
            '[BM] ' + beatPos, 'Comment',
            ppro.TickTime.createWithSeconds(slice[i]),
            ppro.TickTime.createWithSeconds(0),
            'beatmarker'
          ));
        }
      }, 'BeatMarker create ' + (b / BATCH + 1));
    }

    const allMarkers = await clipMarkers.getMarkers();
    const bmMarkers  = allMarkers.filter(m => m.getName && m.getName().startsWith('[BM]'));

    for (let b = 0; b < bmMarkers.length; b += BATCH) {
      const slice = bmMarkers.slice(b, b + BATCH);
      await project.executeTransaction(async (ca) => {
        for (let i = 0; i < slice.length; i++) {
          const beatPos = ((b + i) % 4) + 1;
          const colorIdx = beatPos === 1 ? COLOR_BEAT1 : beatPos === 3 ? COLOR_BEAT3 : COLOR_BEAT24;
          ca.addAction(slice[i].createSetColorByIndexAction(colorIdx));
        }
      }, 'BeatMarker colors ' + (b / BATCH + 1));
    }

    log(T.logCreated(beats.length, bpm.toFixed(1)), 'ok');
    setStatus(T.statusCreated(beats.length), 'ok');
    btnClear.disabled = false;
    btnPrev.disabled  = false;
    btnNext.disabled  = false;

  } catch (err) {
    log('✗ ' + err.message, 'fail');
    setStatus(err.message, 'fail');
  } finally {
    setProgress(false);
    btnApply.disabled    = false;
    btnApply.textContent = T.btnApply;
  }
};

// ── Re-colorir com offset ─────────────────────────────────────────────────────
async function recolorMarkers() {
  const project = await ppro.Project.getActiveProject();
  const { clipPI, offset } = state;

  const clipMarkers = await ppro.Markers.getMarkers(clipPI);
  const allMarkers  = await clipMarkers.getMarkers();
  const bmMarkers   = allMarkers
    .filter(m => m.getName && m.getName().startsWith('[BM]'))
    .sort((a, b) => {
      try { return Number(BigInt(a.getStart().ticks) - BigInt(b.getStart().ticks)); }
      catch { return 0; }
    });

  if (bmMarkers.length === 0) { setStatus(T.statusNone, 'warn'); return; }

  const BATCH = 50;
  for (let b = 0; b < bmMarkers.length; b += BATCH) {
    const slice = bmMarkers.slice(b, b + BATCH);
    await project.executeTransaction(async (ca) => {
      for (let i = 0; i < slice.length; i++) {
        const beatPos = ((b + i + offset) % 4) + 1;
        const colorIdx = beatPos === 1 ? COLOR_BEAT1 : beatPos === 3 ? COLOR_BEAT3 : COLOR_BEAT24;
        ca.addAction(slice[i].createSetColorByIndexAction(colorIdx));
        if (typeof slice[i].createSetNameAction === 'function') {
          ca.addAction(slice[i].createSetNameAction('[BM] ' + beatPos));
        }
      }
    }, 'BeatMarker recolor');
  }
  log(T.logRecolored(offset), 'ok');
  setStatus(T.statusAdjusted, 'ok');
}

// ── BOTÕES ◀ ▶ ───────────────────────────────────────────────────────────────
async function shiftOffset(delta) {
  if (!state) return;
  state.offset = (state.offset + delta + 4) % 4;
  btnPrev.disabled = true;
  btnNext.disabled = true;
  setProgress(true);
  setStatus(T.statusAdjusting, 'info');
  try {
    await recolorMarkers();
  } finally {
    btnPrev.disabled = false;
    btnNext.disabled = false;
    setProgress(false);
  }
}

btnPrev.onclick = () => shiftOffset(+1);
btnNext.onclick = () => shiftOffset(-1);

// ── BOTÃO: Remover Markers ────────────────────────────────────────────────────
btnClear.onclick = async () => {
  btnClear.disabled = true;
  btnClear.innerHTML = `<span class="spinner"></span>${T.removing}`;
  setProgress(true);
  setStatus(T.statusRemoving, 'info');

  try {
    const project = await ppro.Project.getActiveProject();
    if (!project) throw new Error(T.errNoProject);

    let clipPI = state?.clipPI;
    if (!clipPI) {
      const selection = await ppro.ProjectUtils.getSelection(project);
      const items = await selection.getItems();
      if (!items || items.length === 0) throw new Error(T.errSelectClip);
      const clipItem = items[0];
      if (clipItem.type !== 1) throw new Error(T.errNotMedia);
      clipPI = ppro.ClipProjectItem.cast(clipItem);
      if (!clipPI) throw new Error(T.errNoAccess);
    }

    const clipMarkers = await ppro.Markers.getMarkers(clipPI);
    const allMarkers  = await clipMarkers.getMarkers();
    const bmMarkers   = allMarkers.filter(m => m.getName && m.getName().startsWith('[BM]'));

    if (bmMarkers.length === 0) {
      setStatus(T.statusNone, 'warn');
      return;
    }

    const m0 = bmMarkers[0];
    const mMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(m0)).filter(k => /delete|remove/i.test(k));
    const cMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(clipMarkers)).filter(k => /delete|remove/i.test(k));
    log(T.logMarker(mMethods.join(', ') || 'none'), 'info');
    log(T.logCollection(cMethods.join(', ') || 'none'), 'info');

    const getDeleteAction = (col, m) => {
      if (typeof m.createDeleteMarkerAction   === 'function') return m.createDeleteMarkerAction();
      if (typeof m.createRemoveMarkerAction   === 'function') return m.createRemoveMarkerAction();
      if (typeof col.createDeleteMarkerAction === 'function') return col.createDeleteMarkerAction(m);
      if (typeof col.createRemoveMarkerAction === 'function') return col.createRemoveMarkerAction(m);
      return null;
    };

    const BATCH = 50;
    let removed = 0;
    for (let b = 0; b < bmMarkers.length; b += BATCH) {
      const slice = bmMarkers.slice(b, b + BATCH);
      await project.executeTransaction(async (ca) => {
        for (const m of slice) {
          const action = getDeleteAction(clipMarkers, m);
          if (action) { ca.addAction(action); removed++; }
        }
      }, 'BeatMarker delete ' + (b / BATCH + 1));
    }

    if (removed > 0) {
      log(T.logRemoved(removed), 'ok');
      setStatus(T.statusRemoved(removed), 'ok');
    } else {
      log(T.logNoDelete, 'fail');
      setStatus(T.errNoDelete, 'fail');
    }

  } catch (err) {
    log('✗ ' + err.message, 'fail');
    setStatus(err.message, 'fail');
  } finally {
    setProgress(false);
    btnClear.disabled    = false;
    btnClear.textContent = T.btnClear;
  }
};
