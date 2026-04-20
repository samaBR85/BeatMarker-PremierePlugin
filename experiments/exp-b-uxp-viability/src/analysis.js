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

  // Descartar samples iniciais para corrigir offset de timing no MP3:
  //   encoderDelay  — delay do encoder (lido do header Xing/LAME, tipicamente 576)
  //   JS_MP3_STARTUP — delay adicional do MDCT/overlap-add do js-mp3 (empiricamente
  //                    medido: 1188 samples @ 44100 Hz ≈ 1 frame + 1 granule de warm-up)
  const encoderDelay = getMp3EncoderDelay(arrayBuffer);
  const JS_MP3_STARTUP = 2070; // samples @ sampleRate nativo
  const delaySamples = Math.ceil((encoderDelay + JS_MP3_STARTUP) / FRAME_STEP);

  return { mono: mono.subarray(delaySamples, writePos), sampleRate: sampleRate / FRAME_STEP };
}

/**
 * Lê o encoder delay do header Xing/LAME embutido no primeiro frame MP3.
 * O LAME (e a maioria dos encoders modernos) armazena o delay em 12 bits
 * no header LAME. Retorna o número de samples a descartar no início.
 * Fallback: 1105 samples (delay padrão do LAME @ 44100 Hz).
 */
function getMp3EncoderDelay(arrayBuffer) {
  const data = new Uint8Array(arrayBuffer);
  let i = 0;

  // Pular tag ID3v2 se presente
  if (data[0] === 0x49 && data[1] === 0x44 && data[2] === 0x33) {
    const id3Size = ((data[6] & 0x7F) << 21) | ((data[7] & 0x7F) << 14) |
                   ((data[8] & 0x7F) << 7)  |  (data[9] & 0x7F);
    i = 10 + id3Size;
  }

  // Encontrar primeiro sync word MP3
  while (i < Math.min(data.length - 4, 32768)) {
    if (data[i] === 0xFF && (data[i + 1] & 0xE0) === 0xE0) break;
    i++;
  }
  if (i >= data.length - 4) return 1105;

  // Tamanho do side information (MPEG1: mono=17, stereo=32 | MPEG2/2.5: mono=9, stereo=17)
  const version    = (data[i + 1] >> 3) & 3;  // 3=MPEG1, 2=MPEG2, 0=MPEG2.5
  const chanMode   = (data[i + 3] >> 6) & 3;  // 3=mono
  const isMono     = chanMode === 3;
  const sideInfo   = (version === 3) ? (isMono ? 17 : 32) : (isMono ? 9 : 17);

  // Xing/Info tag começa após: 4 bytes header + sideInfo bytes
  const xOff = i + 4 + sideInfo;
  if (xOff + 120 >= data.length) return 1105;

  const tag = String.fromCharCode(data[xOff], data[xOff+1], data[xOff+2], data[xOff+3]);
  if (tag !== 'Xing' && tag !== 'Info') return 1105;

  // Flags indicam quais campos opcionais existem antes do header LAME
  const flags = (data[xOff+4] << 24) | (data[xOff+5] << 16) |
                (data[xOff+6] <<  8) |  data[xOff+7];
  let lOff = xOff + 8;
  if (flags & 1) lOff += 4;   // total frames
  if (flags & 2) lOff += 4;   // total bytes
  if (flags & 4) lOff += 100; // TOC
  if (flags & 8) lOff += 4;   // quality

  if (lOff + 27 >= data.length) return 1105;

  const lTag = String.fromCharCode(data[lOff], data[lOff+1], data[lOff+2], data[lOff+3]);
  if (lTag !== 'LAME' && lTag !== 'Lavc') return 1105;

  // Encoder delay: 12 bits mais significativos do par de bytes em lOff+21
  const encoderDelay = ((data[lOff + 21] << 4) | (data[lOff + 22] >> 4)) & 0xFFF;
  return encoderDelay > 0 ? encoderDelay : 1105;
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
