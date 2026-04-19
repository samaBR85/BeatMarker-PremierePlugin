/* BeatMarker — main.js */

const ppro        = require('premierepro');
const fs          = require('fs');

// ── UI refs ───────────────────────────────────────────────────────────────────
const clipNameEl    = document.getElementById('clip-name');
const clipSubEl     = document.getElementById('clip-sub');
const bpmValEl      = document.getElementById('bpm-val');
const statusEl      = document.getElementById('status');
const progressWrap  = document.getElementById('progress-wrap');
const logEl         = document.getElementById('log');
const btnAnalyze    = document.getElementById('btn-analyze');
const btnApply      = document.getElementById('btn-apply');
const btnClear      = document.getElementById('btn-clear-markers');
const btnPrev       = document.getElementById('btn-prev');
const btnNext       = document.getElementById('btn-next');
const btnLogToggle  = document.getElementById('btn-log-toggle');

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
  btnLogToggle.textContent = logVisible ? 'esconder log ▴' : 'mostrar log ▾';
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
  log('analysis-bundle carregado.', 'ok');
} catch (e) {
  log('✗ Falha ao carregar analysis-bundle: ' + e.message, 'fail');
  setStatus('Erro: bundle não carregado', 'fail');
}

// ── BOTÃO: Analisar ───────────────────────────────────────────────────────────
btnAnalyze.onclick = async () => {
  if (!analyzeAudio) { setStatus('Erro: bundle não carregado', 'fail'); return; }

  btnAnalyze.disabled = true;
  btnAnalyze.innerHTML = '<span class="spinner"></span>ANALISANDO...';
  btnApply.disabled = true;
  btnClear.disabled = true;
  btnPrev.disabled  = true;
  btnNext.disabled  = true;
  setProgress(true);
  setStatus('Obtendo clip selecionado...', 'info');
  bpmValEl.textContent = '--';

  state = null;

  try {
    // 1. Clip selecionado
    const project = await ppro.Project.getActiveProject();
    if (!project) throw new Error('Nenhum projeto aberto.');

    const selection = await ppro.ProjectUtils.getSelection(project);
    const items = await selection.getItems();
    if (!items || items.length === 0) throw new Error('Selecione um clip no painel Project.');

    const clipItem = items[0];
    if (clipItem.type !== 1) throw new Error('Item selecionado não é um clip de mídia.');

    const clipPI = ppro.ClipProjectItem.cast(clipItem);
    if (!clipPI) throw new Error('Não foi possível converter para ClipProjectItem.');

    const mediaPath = await clipPI.getMediaFilePath();
    const ext = mediaPath.split('.').pop().toLowerCase();
    if (ext !== 'wav') {
      throw new Error('Formato não suportado: ' + ext.toUpperCase() + '. Use um arquivo .WAV.');
    }

    clipNameEl.textContent = clipItem.name;
    clipSubEl.textContent  = ext.toUpperCase() + ' · lendo arquivo...';
    clipSubEl.style.display = '';
    document.getElementById('clip-hint').style.display = 'none';
    log('Clip: ' + clipItem.name, 'info');
    log('Path: ' + mediaPath, 'info');

    // 2. Ler arquivo
    setStatus('Lendo arquivo...', 'info');
    const raw = await fs.readFile(mediaPath);
    const mb = ((raw.byteLength ?? raw.length) / 1024 / 1024).toFixed(1);
    log('Tamanho: ' + mb + ' MB', 'info');
    clipSubEl.textContent = ext.toUpperCase() + ' · ' + mb + ' MB · detectando beats...';

    // 3. Analisar
    setStatus('Detectando beats...', '');
    const t0 = Date.now();
    const result = await analyzeAudio(raw);
    const bpm   = parseFloat(result.bpm);
    const beats = result.beats;
    const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
    log('✓ BPM: ' + bpm.toFixed(1) + ' | ' + beats.length + ' beats em ' + elapsed + 's', 'ok');

    // 4. Salvar estado
    state = { clipItem, clipPI, mediaPath, bpm, beats, offset: 0 };

    // 5. Atualizar UI
    bpmValEl.textContent  = bpm.toFixed(1);
    clipSubEl.textContent = ext.toUpperCase() + ' · ' + mb + ' MB · ' + beats.length + ' beats';
    setStatus('Análise concluída ✓', 'ok');

    btnApply.disabled = false;

  } catch (err) {
    log('✗ ' + err.message, 'fail');
    setStatus(err.message, 'fail');
    clipNameEl.textContent  = 'Selecione um clip .WAV no painel do projeto';
    clipSubEl.textContent   = '';
    clipSubEl.style.display = 'none';
  } finally {
    setProgress(false);
    btnAnalyze.disabled  = false;
    btnAnalyze.textContent = 'ANALISAR CLIPE SELECIONADO';
  }
};

// ── BOTÃO: Aplicar Markers ────────────────────────────────────────────────────
btnApply.onclick = async () => {
  if (!state) return;

  btnApply.disabled = true;
  btnApply.innerHTML = '<span class="spinner"></span>CRIANDO...';
  setProgress(true);
  setStatus('Criando markers...', 'info');

  try {
    const project = await ppro.Project.getActiveProject();
    const { clipPI, beats, bpm, offset } = state;

    const clipMarkers = await ppro.Markers.getMarkers(clipPI);
    if (!clipMarkers) throw new Error('Não foi possível obter markers do clip.');

    // Criar markers em lotes de 50
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

    // Aplicar cores
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

    log('✓ ' + beats.length + ' markers criados. BPM: ' + bpm.toFixed(1), 'ok');
    setStatus(beats.length + ' markers criados ✓', 'ok');
    btnClear.disabled = false;
    btnPrev.disabled  = false;
    btnNext.disabled  = false;

  } catch (err) {
    log('✗ ' + err.message, 'fail');
    setStatus(err.message, 'fail');
  } finally {
    setProgress(false);
    btnApply.disabled  = false;
    btnApply.textContent = 'CRIAR MARKERS NO CLIPE';
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
      try {
        return Number(BigInt(a.getStart().ticks) - BigInt(b.getStart().ticks));
      } catch { return 0; }
    });

  if (bmMarkers.length === 0) { setStatus('Nenhum marker [BM] encontrado.', 'warn'); return; }

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
  log('✓ Cores atualizadas (offset=' + offset + ')', 'ok');
  setStatus('Beat 1 ajustado ✓', 'ok');
}

// ── BOTÕES ◀ ▶ ───────────────────────────────────────────────────────────────
async function shiftOffset(delta) {
  if (!state) return;
  state.offset = (state.offset + delta + 4) % 4;
  btnPrev.disabled = true;
  btnNext.disabled = true;
  setProgress(true);
  setStatus('Ajustando beat 1...', 'info');
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
  btnClear.innerHTML = '<span class="spinner"></span>REMOVENDO...';
  setProgress(true);
  setStatus('Removendo markers...', 'info');

  try {
    const project = await ppro.Project.getActiveProject();
    if (!project) throw new Error('Nenhum projeto aberto.');

    // Usar clip do state se disponível, senão pegar a seleção atual
    let clipPI = state?.clipPI;
    if (!clipPI) {
      const selection = await ppro.ProjectUtils.getSelection(project);
      const items = await selection.getItems();
      if (!items || items.length === 0) throw new Error('Selecione um clip no painel Project.');
      const clipItem = items[0];
      if (clipItem.type !== 1) throw new Error('Item selecionado não é um clip de mídia.');
      clipPI = ppro.ClipProjectItem.cast(clipItem);
      if (!clipPI) throw new Error('Não foi possível acessar o clip.');
    }

    const clipMarkers = await ppro.Markers.getMarkers(clipPI);
    const allMarkers  = await clipMarkers.getMarkers();
    const bmMarkers   = allMarkers.filter(m => m.getName && m.getName().startsWith('[BM]'));

    if (bmMarkers.length === 0) {
      setStatus('Nenhum marker encontrado.', 'warn');
      return;
    }

    // Inspecionar métodos de delete disponíveis
    const m0 = bmMarkers[0];
    const mMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(m0))
      .filter(k => /delete|remove/i.test(k));
    const cMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(clipMarkers))
      .filter(k => /delete|remove/i.test(k));
    log('marker: ' + (mMethods.join(', ') || 'nenhum'), 'info');
    log('collection: ' + (cMethods.join(', ') || 'nenhum'), 'info');

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
      log('✓ ' + removed + ' markers removidos.', 'ok');
      setStatus(removed + ' markers removidos ✓', 'ok');
    } else {
      log('✗ Nenhum método de delete encontrado — veja o log.', 'fail');
      setStatus('Erro: método de delete não encontrado', 'fail');
    }

  } catch (err) {
    log('✗ ' + err.message, 'fail');
    setStatus(err.message, 'fail');
  } finally {
    setProgress(false);
    btnClear.disabled  = false;
    btnClear.textContent = 'REMOVER MARKERS';
  }
};
