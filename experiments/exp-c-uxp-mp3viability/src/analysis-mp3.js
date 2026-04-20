/**
 * analysis-mp3.js — pipeline WAV + MP3 para UXP (BeatMarker v1.2)
 *
 * Entrada: ArrayBuffer do arquivo (WAV ou MP3)
 * Saída:   { bpm: string, beats: number[] }
 *
 * MP3 decoder: mpg123-decoder (single-threaded WASM inline — sem workers)
 * WAV decoder: pure JS via DataView
 * Beat detection: music-tempo
 */

import { MPEGDecoder } from 'mpg123-decoder';
import MusicTempo from 'music-tempo';

const TARGET_SR = 44100;

// ── WAV decoder ─────────────────────────────────────────────────────────────

function decodeWav(arrayBuffer) {
  const view = new DataView(arrayBuffer);

  const riff = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3));
  const wave = String.fromCharCode(view.getUint8(8), view.getUint8(9), view.getUint8(10), view.getUint8(11));
  if (riff !== 'RIFF' || wave !== 'WAVE') throw new Error('Arquivo não é um WAV válido');

  let offset = 12;
  let audioFormat, numChannels, sampleRate, bitsPerSample, dataOffset, dataSize;

  while (offset < arrayBuffer.byteLength - 8) {
    const chunkId = String.fromCharCode(
      view.getUint8(offset), view.getUint8(offset + 1),
      view.getUint8(offset + 2), view.getUint8(offset + 3)
    );
    const chunkSize = view.getUint32(offset + 4, true);
    if (chunkId === 'fmt ') {
      audioFormat   = view.getUint16(offset + 8,  true);
      numChannels   = view.getUint16(offset + 10, true);
      sampleRate    = view.getUint32(offset + 12, true);
      bitsPerSample = view.getUint16(offset + 22, true);
    } else if (chunkId === 'data') {
      dataOffset = offset + 8;
      dataSize   = chunkSize;
      break;
    }
    offset += 8 + chunkSize;
    if (chunkSize % 2 !== 0) offset++;
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
        sample = view.getFloat32(byteOffset, true);
      } else if (bitsPerSample === 16) {
        sample = view.getInt16(byteOffset, true) / 32768;
      } else if (bitsPerSample === 24) {
        const b0 = view.getUint8(byteOffset);
        const b1 = view.getUint8(byteOffset + 1);
        const b2 = view.getUint8(byteOffset + 2);
        let val = (b2 << 16) | (b1 << 8) | b0;
        if (val & 0x800000) val |= ~0xFFFFFF;
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

// ── MP3 decoder ─────────────────────────────────────────────────────────────

async function decodeMp3(arrayBuffer) {
  const decoder = new MPEGDecoder();
  await decoder.ready;

  const { channelData, samplesDecoded, sampleRate } = decoder.decode(new Uint8Array(arrayBuffer));
  decoder.free();

  // Mix stereo to mono if needed
  let mono;
  if (channelData.length === 1) {
    mono = channelData[0];
  } else {
    mono = new Float32Array(samplesDecoded);
    for (let i = 0; i < samplesDecoded; i++) {
      let sum = 0;
      for (let c = 0; c < channelData.length; c++) sum += channelData[c][i];
      mono[i] = sum / channelData.length;
    }
  }

  return { mono, sampleRate };
}

// ── Resample ─────────────────────────────────────────────────────────────────

function resample(mono, srcRate) {
  if (srcRate === TARGET_SR) return mono;
  const ratio = srcRate / TARGET_SR;
  const outLen = Math.floor(mono.length / ratio);
  const out = new Float32Array(outLen);
  for (let i = 0; i < outLen; i++) {
    const pos  = i * ratio;
    const idx  = Math.floor(pos);
    const frac = pos - idx;
    const a    = mono[idx]     ?? 0;
    const b    = mono[idx + 1] ?? 0;
    out[i]     = a + frac * (b - a);
  }
  return out;
}

// ── Format detection ─────────────────────────────────────────────────────────

function detectFormat(buffer) {
  const view = new Uint8Array(buffer, 0, 4);
  if (view[0] === 0x52 && view[1] === 0x49 && view[2] === 0x46 && view[3] === 0x46) return 'wav';
  if (view[0] === 0x49 && view[1] === 0x44 && view[2] === 0x33) return 'mp3'; // ID3 tag
  if (view[0] === 0xFF && (view[1] & 0xE0) === 0xE0) return 'mp3';            // sync word
  return 'unknown';
}

// ── Public API ───────────────────────────────────────────────────────────────

export async function analyzeAudio(input) {
  // UXP returns a proxy ArrayBuffer — copy to native before processing
  const byteLength = input.byteLength ?? input.length;
  const nativeBuffer = new ArrayBuffer(byteLength);
  new Uint8Array(nativeBuffer).set(new Uint8Array(input));

  const fmt = detectFormat(nativeBuffer);
  let mono, sampleRate;

  if (fmt === 'wav') {
    ({ mono, sampleRate } = decodeWav(nativeBuffer));
  } else if (fmt === 'mp3') {
    ({ mono, sampleRate } = await decodeMp3(nativeBuffer));
  } else {
    throw new Error('Formato não suportado. Use WAV ou MP3.');
  }

  const resampled = resample(mono, sampleRate);
  const mt = new MusicTempo(resampled, { sampleRate: TARGET_SR });

  return {
    bpm:   mt.tempo,   // string in music-tempo v1.x
    beats: mt.beats,
  };
}
