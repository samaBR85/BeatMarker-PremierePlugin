/**
 * Testa o pipeline js-mp3 + music-tempo diretamente (igual ao que roda no plugin).
 * Usage: node test-mp3.js "arquivo.mp3"
 */
const fs = require('fs');
const path = require('path');
const Mp3 = require('./node_modules/js-mp3');
const Mp3Frame = require('./node_modules/js-mp3/src/frame');
const MusicTempo = require('./node_modules/music-tempo');

const filePath = process.argv[2];
if (!filePath) { console.error('Usage: node test-mp3.js arquivo.mp3'); process.exit(1); }

const buf = fs.readFileSync(filePath);
const arrayBuffer = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);

// ── Encoder delay reader (igual ao analysis.js) ──────────────────────────────
function getMp3EncoderDelay(arrayBuffer) {
  const data = new Uint8Array(arrayBuffer);
  let i = 0;
  if (data[0] === 0x49 && data[1] === 0x44 && data[2] === 0x33) {
    const id3Size = ((data[6] & 0x7F) << 21) | ((data[7] & 0x7F) << 14) |
                   ((data[8] & 0x7F) << 7)  |  (data[9] & 0x7F);
    i = 10 + id3Size;
  }
  while (i < Math.min(data.length - 4, 32768)) {
    if (data[i] === 0xFF && (data[i + 1] & 0xE0) === 0xE0) break;
    i++;
  }
  if (i >= data.length - 4) return 1105;
  const version  = (data[i + 1] >> 3) & 3;
  const chanMode = (data[i + 3] >> 6) & 3;
  const isMono   = chanMode === 3;
  const sideInfo = (version === 3) ? (isMono ? 17 : 32) : (isMono ? 9 : 17);
  const xOff = i + 4 + sideInfo;
  if (xOff + 120 >= data.length) return 1105;
  const tag = String.fromCharCode(data[xOff], data[xOff+1], data[xOff+2], data[xOff+3]);
  if (tag !== 'Xing' && tag !== 'Info') return 1105;
  const flags = (data[xOff+4] << 24) | (data[xOff+5] << 16) | (data[xOff+6] << 8) | data[xOff+7];
  let lOff = xOff + 8;
  if (flags & 1) lOff += 4;
  if (flags & 2) lOff += 4;
  if (flags & 4) lOff += 100;
  if (flags & 8) lOff += 4;
  if (lOff + 27 >= data.length) return 1105;
  const lTag = String.fromCharCode(data[lOff], data[lOff+1], data[lOff+2], data[lOff+3]);
  if (lTag !== 'LAME' && lTag !== 'Lavc') return 1105;
  const encoderDelay = ((data[lOff + 21] << 4) | (data[lOff + 22] >> 4)) & 0xFFF;
  return encoderDelay > 0 ? encoderDelay : 1105;
}

// ── js-mp3 decoder (igual ao analysis.js) ────────────────────────────────────
const decoder = Mp3.newDecoder(arrayBuffer);
const nch = decoder.frame.header.numberOfChannels();
const sampleRate = decoder.sampleRate;
const totalFrames = decoder.frameStarts.length;
const SAMPLES_PER_FRAME = 1152;
const FRAME_STEP = 2;

const mono = new Float32Array(Math.ceil(totalFrames * SAMPLES_PER_FRAME / FRAME_STEP));
let writePos = 0;

function storeFrame(frame) {
  const pcmBytes = frame.decode();
  const view = new DataView(pcmBytes.buffer, pcmBytes.byteOffset, pcmBytes.byteLength);
  const n = pcmBytes.byteLength / (nch * 2);
  for (let i = 0; i < n; i += FRAME_STEP) {
    let sum = 0;
    for (let c = 0; c < nch; c++) sum += view.getInt16((i * nch + c) * 2, true) / 32768;
    mono[writePos++] = sum / nch;
  }
}

decoder.source.seek(decoder.frameStarts[0]);
let prevFrame = null;
while (true) {
  const result = Mp3Frame.read(decoder.source, decoder.source.pos, prevFrame);
  if (result.err) break;
  prevFrame = result.f;
  storeFrame(prevFrame);
}

const encoderDelay = getMp3EncoderDelay(arrayBuffer);
const JS_MP3_STARTUP = 2070;
const delaySamples = Math.ceil((encoderDelay + JS_MP3_STARTUP) / FRAME_STEP);
const rawMono = mono.subarray(0, writePos);
const strippedMono = mono.subarray(delaySamples, writePos);

console.log(`File: ${path.basename(filePath)}`);
console.log(`sampleRate (native): ${sampleRate} Hz`);
console.log(`sampleRate (after FRAME_STEP=2): ${sampleRate / FRAME_STEP} Hz`);
console.log(`Total stored samples (raw): ${writePos}`);
console.log(`Encoder delay: ${encoderDelay} + JS_MP3_STARTUP: ${JS_MP3_STARTUP} → strip ${delaySamples} stored samples`);
console.log(`Total samples after strip: ${strippedMono.length}`);
console.log(`Duration after strip: ${(strippedMono.length / (sampleRate / FRAME_STEP)).toFixed(3)}s`);
console.log(`Expected duration (from mpg123): 176.450s`);

// ── Resample ──────────────────────────────────────────────────────────────────
const srcRate = sampleRate / FRAME_STEP;
const TARGET_SR = 44100;
const ratio = srcRate / TARGET_SR;
const outLen = Math.floor(strippedMono.length / ratio);
const resampled = new Float32Array(outLen);
for (let i = 0; i < outLen; i++) {
  const pos = i * ratio;
  const idx = Math.floor(pos);
  const frac = pos - idx;
  resampled[i] = (strippedMono[idx] ?? 0) + frac * ((strippedMono[idx+1] ?? 0) - (strippedMono[idx] ?? 0));
}
console.log(`Resampled length: ${resampled.length} samples @ 44100 Hz`);
console.log(`Resampled duration: ${(resampled.length / TARGET_SR).toFixed(3)}s`);

// ── Beat detection ────────────────────────────────────────────────────────────
console.log('Running beat detection...');
const mt = new MusicTempo(resampled);
const beats = mt.beats;
const bpm = parseFloat(mt.tempo);
console.log('─'.repeat(40));
console.log(`BPM:     ${bpm.toFixed(2)}`);
console.log(`Beats:   ${beats.length}`);
console.log(`First 8: ${beats.slice(0, 8).map(b => b.toFixed(4)).join(', ')}`);
console.log('─'.repeat(40));
console.log(`\nFor comparison, mpg123-decoder first 8:`);
console.log(`0.3200, 0.8200, 1.3200, 1.8200, 2.3200, 2.8200, 3.3200, 3.8200`);
console.log(`\nOffset (first beat): ${(beats[0] - 0.3200).toFixed(4)}s`);
console.log(`Offset in samples @ 44100: ${Math.round((beats[0] - 0.3200) * 44100)}`);
console.log(`Offset in frames @ 30fps:  ${((beats[0] - 0.3200) * 30).toFixed(2)}`);
