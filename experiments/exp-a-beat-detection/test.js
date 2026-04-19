/**
 * Exp-A: Beat Detection — laboratório Node.js
 *
 * Uso: node test.js <caminho-do-mp3>
 * Exemplo: node test.js "D:\PROJETOS\audio.mp3"
 *
 * Saída: BPM detectado + lista de timestamps de cada batida (em segundos)
 */

import { MPEGDecoder } from 'mpg123-decoder';
import MusicTempo from 'music-tempo';
import { readFile } from 'fs/promises';
import { resolve } from 'path';

// ── Argumentos ────────────────────────────────────────────────────────────────

const audioPath = process.argv[2];
if (!audioPath) {
  console.error('Uso: node test.js <caminho-do-mp3>');
  process.exit(1);
}

const absPath = resolve(audioPath);
console.log('\n=== BeatMarker Exp-A: Beat Detection ===');
console.log('Arquivo:', absPath);
console.log('');

// ── Pipeline principal ────────────────────────────────────────────────────────

async function main() {
  // 1. Ler bytes do arquivo
  console.log('[1/3] Lendo arquivo...');
  const mp3Bytes = await readFile(absPath);
  console.log(`      ${(mp3Bytes.length / 1024 / 1024).toFixed(2)} MB lidos.`);

  // 2. Decodificar MP3 → PCM Float32
  console.log('[2/3] Decodificando MP3 para PCM...');
  const t0decode = Date.now();

  const decoder = new MPEGDecoder();
  await decoder.ready;

  let chunks = [];
  let sampleRate = 0;
  let totalSamples = 0;

  // Decodificar em chunks de 512 KB para não estourar memória
  const CHUNK = 512 * 1024;
  let offset = 0;
  while (offset < mp3Bytes.length) {
    const { channelData, samplesDecoded, sampleRate: sr } =
      decoder.decode(mp3Bytes.subarray(offset, offset + CHUNK));
    if (sr) sampleRate = sr;
    if (samplesDecoded > 0) {
      const nCh = channelData.length;
      const monoChunk = new Float32Array(samplesDecoded);
      for (let i = 0; i < samplesDecoded; i++) {
        let sum = 0;
        for (let c = 0; c < nCh; c++) sum += channelData[c][i];
        monoChunk[i] = sum / nCh;
      }
      chunks.push(monoChunk);
      totalSamples += samplesDecoded;
    }
    offset += CHUNK;
  }
  decoder.free();

  const durationSec = totalSamples / sampleRate;
  const tDecode = Date.now() - t0decode;
  console.log(`      sampleRate: ${sampleRate} Hz | duração: ${durationSec.toFixed(2)}s | tempo: ${tDecode}ms`);

  // Concatenar todos os chunks numa Float32Array contínua
  console.log('[3/3] Detectando batidas (music-tempo)...');
  const t0beat = Date.now();

  const mono = new Float32Array(totalSamples);
  let pos = 0;
  for (const ch of chunks) { mono.set(ch, pos); pos += ch.length; }
  chunks = null; // liberar memória

  const mt = new MusicTempo(mono, { sampleRate });
  const tBeat = Date.now() - t0beat;

  // ── Resultado ─────────────────────────────────────────────────────────────

  const { tempo, beats } = mt;

  console.log('');
  console.log('=== RESULTADO ===');
  console.log(`BPM detectado : ${tempo}`);
  console.log(`Batidas totais: ${beats.length}`);
  console.log(`Tempo análise : ${tBeat}ms`);
  console.log('');

  // Mostrar primeiras 16 batidas
  const preview = beats.slice(0, 16);
  console.log('Primeiras 16 batidas (segundos):');
  preview.forEach((t, i) => {
    const beat = (i % 4) + 1;
    console.log(`  [${String(i + 1).padStart(3)}] ${t.toFixed(4)}s  →  batida ${beat}`);
  });

  // Espaçamento médio entre batidas (sanidade)
  if (beats.length > 1) {
    const gaps = beats.slice(1).map((t, i) => t - beats[i]);
    const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    const impliedBpm = 60 / avgGap;
    console.log('');
    console.log(`Espaçamento médio: ${avgGap.toFixed(4)}s → BPM implícito: ${impliedBpm.toFixed(2)}`);
  }

  // Salvar resultado completo em JSON para inspeção
  const outPath = absPath.replace(/\.[^.]+$/, '') + '_beats.json';
  const { writeFile } = await import('fs/promises');
  await writeFile(outPath, JSON.stringify({ bpm: tempo, beats }, null, 2));
  console.log('');
  console.log(`JSON completo salvo em: ${outPath}`);
}

main().catch(err => {
  console.error('\n✗ ERRO:', err.message);
  console.error(err.stack);
  process.exit(1);
});
