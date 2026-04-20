/**
 * Lê o encoder delay do header Xing/LAME de um arquivo MP3.
 * Usage: node src/check-delay.js "arquivo.mp3"
 */
const fs = require('fs');

const filePath = process.argv[2];
if (!filePath) { console.error('Usage: node src/check-delay.js arquivo.mp3'); process.exit(1); }

const buf = fs.readFileSync(filePath);
const data = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);

let i = 0;

// Pular ID3v2
if (data[0] === 0x49 && data[1] === 0x44 && data[2] === 0x33) {
  const id3Size = ((data[6] & 0x7F) << 21) | ((data[7] & 0x7F) << 14) |
                 ((data[8] & 0x7F) << 7)  |  (data[9] & 0x7F);
  i = 10 + id3Size;
  console.log(`ID3v2 tag: ${id3Size} bytes, first MP3 frame at offset ${i}`);
}

// Encontrar sync word
while (i < Math.min(data.length - 4, 32768)) {
  if (data[i] === 0xFF && (data[i + 1] & 0xE0) === 0xE0) break;
  i++;
}
console.log(`First MP3 frame sync at: ${i}`);

const version  = (data[i + 1] >> 3) & 3;
const chanMode = (data[i + 3] >> 6) & 3;
const isMono   = chanMode === 3;
const sideInfo = (version === 3) ? (isMono ? 17 : 32) : (isMono ? 9 : 17);

console.log(`MPEG version: ${version === 3 ? '1' : version === 2 ? '2' : '2.5'}, ${isMono ? 'Mono' : 'Stereo'}, sideInfo: ${sideInfo} bytes`);

const xOff = i + 4 + sideInfo;
const tag = String.fromCharCode(data[xOff], data[xOff+1], data[xOff+2], data[xOff+3]);
console.log(`Xing/Info tag: "${tag}" at offset ${xOff}`);

if (tag === 'Xing' || tag === 'Info') {
  const flags = (data[xOff+4] << 24) | (data[xOff+5] << 16) | (data[xOff+6] << 8) | data[xOff+7];
  console.log(`Xing flags: 0x${flags.toString(16)} (frames:${!!(flags&1)}, bytes:${!!(flags&2)}, TOC:${!!(flags&4)}, quality:${!!(flags&8)})`);

  let lOff = xOff + 8;
  if (flags & 1) lOff += 4;
  if (flags & 2) lOff += 4;
  if (flags & 4) lOff += 100;
  if (flags & 8) lOff += 4;

  const lTag = String.fromCharCode(data[lOff], data[lOff+1], data[lOff+2], data[lOff+3]);
  console.log(`LAME tag: "${lTag}" at offset ${lOff}`);

  if (lTag === 'LAME' || lTag === 'Lavc') {
    const encoderDelay  = ((data[lOff + 21] << 4) | (data[lOff + 22] >> 4)) & 0xFFF;
    const encoderPadding = ((data[lOff + 22] & 0x0F) << 8) | data[lOff + 23];
    const lameVersion = String.fromCharCode(...data.slice(lOff+4, lOff+9));
    console.log(`LAME version string: "${lameVersion}"`);
    console.log(`Encoder delay:   ${encoderDelay} samples`);
    console.log(`Encoder padding: ${encoderPadding} samples`);
    console.log(`Delay in seconds @ 44100Hz: ${(encoderDelay/44100*1000).toFixed(2)}ms`);
    console.log(`Delay in frames  @ 30fps:   ${(encoderDelay/44100*30).toFixed(2)}`);
    console.log(`Delay in frames  @ 60fps:   ${(encoderDelay/44100*60).toFixed(2)}`);
  }
} else {
  console.log('No Xing/LAME header found — CBR file or non-LAME encoder');
  console.log('Raw bytes at xOff:', Array.from(data.slice(xOff, xOff+8)).map(b => b.toString(16).padStart(2,'0')).join(' '));
}
