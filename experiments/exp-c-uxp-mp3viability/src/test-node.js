/**
 * exp-c — Node.js POC: MP3 decoding + beat detection
 *
 * Usage:
 *   node src/test-node.js <path-to-file.mp3>
 *   node src/test-node.js <path-to-file.wav>   ← WAV still supported
 *
 * Goal: confirm that mpg123-decoder produces PCM float32 data
 * that music-tempo can analyze correctly.
 */

const fs   = require('fs');
const path = require('path');

async function run() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Usage: node src/test-node.js <audio.mp3|audio.wav>');
    process.exit(1);
  }

  const ext = path.extname(filePath).toLowerCase();
  const buf = fs.readFileSync(filePath);
  console.log(`File: ${path.basename(filePath)} (${(buf.length / 1024 / 1024).toFixed(2)} MB)`);

  let channelData, sampleRate;

  // ── MP3 ──────────────────────────────────────────────────────────────────
  if (ext === '.mp3') {
    console.log('Decoder: mpg123-decoder');
    const { MPEGDecoder } = require('mpg123-decoder');
    const decoder = new MPEGDecoder();
    await decoder.ready;

    const { channelData: ch, samplesDecoded, sampleRate: sr } = decoder.decode(new Uint8Array(buf));
    decoder.free();

    channelData = ch[0]; // mono or left channel
    sampleRate  = sr;
    console.log(`Decoded: ${samplesDecoded} samples @ ${sr} Hz`);
    console.log(`Duration: ${(samplesDecoded / sr).toFixed(2)}s`);

  // ── WAV ──────────────────────────────────────────────────────────────────
  } else if (ext === '.wav') {
    console.log('Decoder: built-in WAV parser');
    const result = decodeWav(buf);
    channelData = result.channelData;
    sampleRate  = result.sampleRate;
    console.log(`Decoded: ${channelData.length} samples @ ${sampleRate} Hz`);
    console.log(`Duration: ${(channelData.length / sampleRate).toFixed(2)}s`);

  } else {
    console.error(`Unsupported format: ${ext}`);
    process.exit(1);
  }

  // ── Resample to 44100 if needed ──────────────────────────────────────────
  const TARGET_SR = 44100;
  let samples = channelData;
  if (sampleRate !== TARGET_SR) {
    console.log(`Resampling ${sampleRate} → ${TARGET_SR} Hz...`);
    samples = resample(channelData, sampleRate, TARGET_SR);
  }

  // ── Beat detection ───────────────────────────────────────────────────────
  console.log('Running beat detection...');
  const MusicTempo = require('music-tempo');
  const mt = new MusicTempo(samples);

  const beats  = mt.beats;
  const bpm    = parseFloat(mt.tempo);
  const conf   = calculateConfidence(beats);

  console.log('─'.repeat(40));
  console.log(`BPM:        ${bpm.toFixed(2)}`);
  console.log(`Beats:      ${beats.length}`);
  console.log(`Confidence: ${conf}%`);
  console.log(`First 8:    ${beats.slice(0, 8).map(b => b.toFixed(3)).join(', ')}`);
  console.log('─'.repeat(40));
  console.log('SUCCESS — decoder + beat detection pipeline works!');
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function resample(data, fromSR, toSR) {
  const ratio  = toSR / fromSR;
  const out    = new Float32Array(Math.round(data.length * ratio));
  for (let i = 0; i < out.length; i++) {
    const src = i / ratio;
    const lo  = Math.floor(src);
    const hi  = Math.min(lo + 1, data.length - 1);
    const t   = src - lo;
    out[i]    = data[lo] * (1 - t) + data[hi] * t;
  }
  return out;
}

function decodeWav(buf) {
  const view       = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const numCh      = view.getUint16(22, true);
  const sampleRate = view.getUint32(24, true);
  const bitDepth   = view.getUint16(34, true);

  // Find 'data' chunk
  let offset = 12;
  while (offset < buf.length) {
    const id   = String.fromCharCode(...buf.slice(offset, offset + 4));
    const size = view.getUint32(offset + 4, true);
    if (id === 'data') { offset += 8; break; }
    offset += 8 + size;
  }

  const frames = Math.floor((buf.length - offset) / (numCh * bitDepth / 8));
  const out    = new Float32Array(frames);
  for (let i = 0; i < frames; i++) {
    const pos = offset + i * numCh * (bitDepth / 8);
    let s = 0;
    if (bitDepth === 16) s = view.getInt16(pos, true) / 32768;
    else if (bitDepth === 32) s = view.getFloat32(pos, true);
    else if (bitDepth === 8)  s = (view.getUint8(pos) - 128) / 128;
    out[i] = s;
  }
  return { channelData: out, sampleRate };
}

function calculateConfidence(beats) {
  if (beats.length < 4) return 0;
  const intervals = [];
  for (let i = 1; i < beats.length; i++) intervals.push(beats[i] - beats[i - 1]);
  const mean     = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const variance = intervals.reduce((a, b) => a + (b - mean) ** 2, 0) / intervals.length;
  const cv       = Math.sqrt(variance) / mean;
  return Math.max(0, Math.min(100, Math.round((1 - cv / 0.2) * 100)));
}

run().catch(err => { console.error('ERROR:', err); process.exit(1); });
