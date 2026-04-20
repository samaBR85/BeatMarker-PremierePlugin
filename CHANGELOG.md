# BeatMarker — Changelog

---

## v1.2.0 — MP3 Support

### New features
- **MP3 support** — plugin now accepts `.WAV` and `.MP3` files (format auto-detected by magic bytes, not extension)
- UI hints and error messages updated to mention both formats

### Technical
- MP3 decoded via `js-mp3` (pure JS, no WASM) bundled with esbuild
- Encoder delay read from the Xing/LAME header of each MP3 file
- Additional js-mp3 MDCT startup delay (2070 samples @ 44100 Hz) stripped before beat detection
- Timing calibrated against `mpg123-decoder` reference — final offset: **0 frames** at any frame rate
- WASM-based decoders (`mpg123-decoder`, even single-threaded) crash Premiere Pro — js-mp3 is the only viable approach in UXP

---

## v1.1.0 — Beat Selection & Confidence Indicator

### New features
- **BPM Confidence Indicator** — color-coded bar (green/yellow/red) with a randomized Whiplash-inspired phrase after analysis
- **Beat selection** — tap the 1 2 3 4 buttons to choose which beat positions to mark (all on by default, minimum 1)
- **Phase shift with selective beats** — when fewer than 4 beats are active, phase shift cycles colors within the active set only (markers stay at same timestamps, colors rotate)

### Fixes & improvements
- UI spacing and typography improvements
- `line-height: 1.6` on italic/small text to prevent UXP descender clipping
- Beat box toggle uses inline styles to override UXP's CSS specificity quirks

---

## v1.0.0 — Initial release

- BPM detection from WAV files (any sample rate, PCM 8/16/24-bit + float32)
- Colored markers on source clip: 🔴 beat 1, 🔵 beats 2 & 4, 🟡 beat 3
- Phase adjustment (◀ ▶) to shift the beat grid without re-analyzing
- Remove markers (deletes all `[BM]*` markers from selected clip)
- Bilingual UI — English and Portuguese (PT-BR), auto-detected from system locale
- Marker naming convention: `[BM] {globalIndex}` stores beat index for correct recoloring at any offset
