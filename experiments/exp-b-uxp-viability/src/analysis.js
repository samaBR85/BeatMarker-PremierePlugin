/**
 * analysis.js — pipeline de beat detection para UXP
 * Decoders puros JS (sem WASM, sem workers):
 *   WAV  — decoder próprio via DataView
 *   MP3  — js-mp3 com pre-alocação (sem concatBuffers O(n²))
 * Entrada: ArrayBuffer do arquivo WAV ou MP3
 * Saída:   { bpm, beats }
 */

import MusicTempo from 'music-tempo';
import Mp3 from 'js-mp3';
import Mp3Frame from 'js-mp3/src/frame';

function decodeWav(arrayBuffer) {
  const view = new DataView(arrayBuffer);

  // Validar header RIFF/WAVE
  const riff = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3));
  const wave = String.fromCharCode(view.getUint8(8), view.getUint8(9), view.getUint8(10), view.getUint8(11));
  if (riff !== 'RIFF' || wave !== 'WAVE') throw new Error('Arquivo não é um WAV válido');

  // Ler fmt chunk — procurar pelo chunk "fmt " (pode não ser sempre em offset 12)
  let offset = 12;
  let audioFormat, numChannels, sampleRate, bitsPerSample, dataOffset, dataSize;

  while (offset < arrayBuffer.byteLength - 8) {
    const chunkId = String.fromCharCode(
      view.getUint8(offset), view.getUint8(offset+1),
      view.getUint8(offset+2), view.getUint8(offset+3)
    );
    const chunkSize = view.getUint32(offset + 4, true);

    if (chunkId === 'fmt ') {
      audioFormat  = view.getUint16(offset + 8,  true); // 1=PCM, 3=float
      numChannels  = view.getUint16(offset + 10, true);
      sampleRate   = view.getUint32(offset + 12, true);
      bitsPerSample= view.getUint16(offset + 22, true);
    } else if (chunkId === 'data') {
      dataOffset = offset + 8;
      dataSize   = chunkSize;
      break;
    }
    offset += 8 + chunkSize;
    if (chunkSize % 2 !== 0) offset++; // word-align
  }

  if (!sampleRate || !dataOffset) throw new Error('WAV sem chunks fmt/data válidos');

  const numSamples = Math.floor(dataSize / (numChannels * bitsPerSample / 8));
  const mono = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    let sum = 0;
    for (let c = 0; c < numChannels; c++) {
      const byteOffset = dataOffset + (i * numChannels + c) * (bitsPerSample / 8);
      let sample = 0;
      if (audioFormat === 3 && bitsPerSample === 32) {
        // IEEE 754 float
        sample = view.getFloat32(byteOffset, true);
      } else if (bitsPerSample === 16) {
        sample = view.getInt16(byteOffset, true) / 32768;
      } else if (bitsPerSample === 24) {
        const b0 = view.getUint8(byteOffset);
        const b1 = view.getUint8(byteOffset + 1);
        const b2 = view.getUint8(byteOffset + 2);
        let val = (b2 << 16) | (b1 << 8) | b0;
        if (val & 0x800000) val |= ~0xFFFFFF; // sign extend
        sample = val / 8388608;
      } else if (bitsPerSample === 8) {
        sample = (view.getUint8(byteOffset) - 128) / 128;
      }
      sum += sample;
    }
    mono[i] = sum / numChannels;
  }

  return { mono, sampleRate };
}

/**
 * Resample mono Float32Array de srcRate → TARGET_SR usando interpolação linear.
 * music-tempo tem parâmetros internos calibrados para 44100 Hz; normalizar
 * qualquer sample rate para 44100 garante detecção correta de BPM.
 */
const TARGET_SR = 44100;

function resample(mono, srcRate) {
  if (srcRate === TARGET_SR) return mono;
  const ratio = srcRate / TARGET_SR;
  const outLen = Math.floor(mono.length / ratio);
  const out = new Float32Array(outLen);
  for (let i = 0; i < outLen; i++) {
    const pos = i * ratio;
    const idx = Math.floor(pos);
    const frac = pos - idx;
    const a = mono[idx] ?? 0;
    const b = mono[idx + 1] ?? 0;
    out[i] = a + frac * (b - a); // interpolação linear
  }
  return out;
}

/**
 * Decodifica MP3 para Float32Array mono usando js-mp3.
 * Evita o concatBuffers O(n²) do decoder.decode() original:
 * pré-aloca o buffer e processa frame a frame com Frame.read direto.
 * Processa 1 de cada FRAME_STEP frames para ganhar velocidade
 * (IMDCT sequencial mantém o estado correto; apenas o output é pulado).
 */
function decodeMp3(arrayBuffer) {
  const decoder = Mp3.newDecoder(arrayBuffer);
  if (!decoder) throw new Error('MP3 inválido ou formato não suportado');

  const nch       = decoder.frame.header.numberOfChannels();
  const sampleRate = decoder.sampleRate;
  const totalFrames = decoder.frameStarts.length;
  const SAMPLES_PER_FRAME = 1152;
  const FRAME_STEP = 2; // decodifica todos mas grava 1 de cada 2

  // Pre-alocar com downsample 2:1 dentro de cada frame (não pular frames inteiros)
  // Isso mantém a continuidade temporal do sinal enquanto reduz o sampleRate a 22050 Hz
  const mono = new Float32Array(Math.ceil(totalFrames * SAMPLES_PER_FRAME / FRAME_STEP));
  let writePos = 0;

  function storeFrame(frame) {
    const pcmBytes = frame.decode();
    const view = new DataView(pcmBytes.buffer, pcmBytes.byteOffset, pcmBytes.byteLength);
    const n = pcmBytes.byteLength / (nch * 2);
    // Pegar 1 sample a cada FRAME_STEP — downsample real, sem buracos temporais
    for (let i = 0; i < n; i += FRAME_STEP) {
      let sum = 0;
      for (let c = 0; c < nch; c++) sum += view.getInt16((i * nch + c) * 2, true) / 32768;
      mono[writePos++] = sum / nch;
    }
  }

  // newDecoder já decodificou o frame 1 internamente (para ler sampleRate/channels).
  // Rebobinar para frameStarts[0] e decodificar tudo do zero com estado limpo,
  // evitando o double-decode que corrompe o overlap-add e desloca os beats.
  decoder.source.seek(decoder.frameStarts[0]);
  let prevFrame = null; // estado limpo — store[] zerado no primeiro frame

  while (true) {
    const result = Mp3Frame.read(decoder.source, decoder.source.pos, prevFrame);
    if (result.err) break;
    prevFrame = result.f;
    storeFrame(prevFrame);
  }

  return { mono: mono.subarray(0, writePos), sampleRate: sampleRate / FRAME_STEP };
}

/** Detecta o formato pelo magic bytes */
function detectFormat(buffer) {
  const view = new Uint8Array(buffer, 0, 4);
  // RIFF = WAV
  if (view[0] === 0x52 && view[1] === 0x49 && view[2] === 0x46 && view[3] === 0x46) return 'wav';
  // ID3 tag ou sync MP3 (0xFF 0xE*/0xF*)
  if (view[0] === 0x49 && view[1] === 0x44 && view[2] === 0x33) return 'mp3'; // ID3
  if (view[0] === 0xFF && (view[1] & 0xE0) === 0xE0) return 'mp3';            // sync word
  return 'unknown';
}

export async function analyzeAudio(input) {
  // UXP retorna um ArrayBuffer proxy — criar ArrayBuffer nativo copiando os bytes
  const byteLength = input.byteLength ?? input.length;
  const nativeBuffer = new ArrayBuffer(byteLength);
  const dst = new Uint8Array(nativeBuffer);
  const src = (input instanceof Uint8Array) ? input : new Uint8Array(input);
  dst.set(src);

  const fmt = detectFormat(nativeBuffer);
  let mono, sampleRate;
  if (fmt === 'wav') {
    ({ mono, sampleRate } = decodeWav(nativeBuffer));
  } else if (fmt === 'mp3') {
    ({ mono, sampleRate } = decodeMp3(nativeBuffer));
  } else {
    throw new Error('Formato de áudio não suportado (use WAV ou MP3)');
  }

  const resampled = resample(mono, sampleRate);
  const mt = new MusicTempo(resampled, { sampleRate: TARGET_SR });
  const { tempo, beats } = mt;
  return { bpm: tempo, beats };
}
