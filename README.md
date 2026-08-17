# Shoresy TTS

A small local phrase-to-voice page. Type a line at `http://127.0.0.1:3000`
and the local Qwen voice runner returns a WAV for playback.

## What it is

A single-purpose local phrase-to-audio utility for Shoresy fans: type a short
chirp, generate it, and hear it rendered in a Shoresy-inspired voice line.
There are no accounts or cloud inference APIs—just one text field, one Speak
action, generation status, errors, and audio playback inside a Sudbury
Blueberry Bulldogs arena-ticket interface.

The repository does not include voice-reference recordings or transcripts.
Voice matching is available only with a local reference that you are
authorized to use; otherwise the app falls back to the Qwen `Ryan` preset with
a Shoresy-inspired delivery instruction.

## Run it

Prerequisites:

- Node.js `>=22.13.0`
- The existing Draven TTS environment and Qwen models
- An NVIDIA CUDA GPU for the configured inference path

```powershell
npm install
npm run dev -- --hostname 0.0.0.0
```

The page is local-only. Each generation launches the local Qwen runner and may
take a few minutes while the 1.7B model loads.

## How the voice works

By default, the app derives the existing Draven TTS installation from
`%USERPROFILE%` and expects:

- `draventts\venv\Scripts\python.exe`
- `draventts\qwen_voice.py`
- `draventts\models\Qwen3-TTS-12Hz-1.7B-CustomVoice`
- `draventts\models\Qwen3-TTS-12Hz-1.7B-Base`

To use voice matching, place an authorized `reference.wav` and its exact
`transcript.txt` in `voice-reference/`. Both files are ignored by Git. With no
reference present, the app uses the `Ryan` preset with a terse, fast, dry,
confident hockey-room delivery instruction.

If the existing runner lives elsewhere, set `DRAVEN_TTS_ROOT`, or override the
individual `QWEN_TTS_PYTHON`, `QWEN_TTS_SCRIPT`, `QWEN_TTS_MODEL`,
`QWEN_TTS_CLONE_MODEL`, and `QWEN_TTS_SOX_DIR` paths before starting the app.
`QWEN_TTS_MODE=custom` or `QWEN_TTS_MODE=clone` can explicitly select a mode.

## Checks

```powershell
npm run lint
npm test
```

## Project structure

- `app/` — the page and `/api/speak` route.
- `build/` — the local TTS middleware and shared voice resolver.
- `worker/` — the Cloudflare Worker entry for the hosted UI build.
- `db/` and `drizzle/` — Drizzle/D1 schema scaffolding.
- `voice-reference/` — local-only reference setup instructions.
- `public/` — brand imagery, fonts, and paper textures.
- `tests/` — rendered-HTML smoke tests.

## Product and design

The app is deliberately one phrase, one action, and one result. It accepts up
to 500 characters, preserves keyboard and reduced-motion support, and keeps
generation state visible because local inference can be slow.

The full color, typography, layout, and component system is recorded in
[`DESIGN.md`](DESIGN.md). Local design-review captures are intentionally
excluded from the repository.

## Privacy boundary

The repository excludes local reference audio and transcripts, source video,
generated voice output, environment files, dependency/build caches, browser
screenshots, machine-specific tool state, and absolute user-directory paths.

## Asset sources and licensing

These assets are used by a local, unaffiliated fan interface. Their presence
does not imply permission for public redistribution or an official
relationship with the show.

| Local file | Source |
| --- | --- |
| `public/brand/shoresy-logo.png` | Official Shoresy store header asset: `https://www.letterkenny.tv/cdn/shop/files/updated-shoresy-logo.png?v=1759798809` |
| `public/brand/shore-69-jersey.png` | Official Shoresy store product image: `https://www.letterkenny.tv/cdn/shop/files/s69blujer1.png?v=1784123900&width=1000` |
| `public/brand/shoresy-season-3-key-art-full.jpg` | Hulu Press Shoresy Season 3 key art: `https://press.hulu.com/storage/uploads/1B/ED/1BED8CA0-A215-D3D6-93DA-CD857CEE5F87/shoresy_s3_ta_p67_2000x3000.jpg` |
| `public/fonts/Oswald-wght.ttf` | Oswald from the official Google Fonts repository, licensed under the SIL Open Font License in `public/fonts/Oswald-OFL.txt`. |
| `public/textures/ticket-blue-paper.png` | Original generated Carolina-blue paper scan; its prompt is stored beside it and embedded in the PNG metadata. |
| `public/textures/ticket-ivory-paper.png` | Original generated ivory paper scan; its prompt is stored beside it and embedded in the PNG metadata. |

Before publishing or redistributing the show photography and marks, confirm
that they are cleared for the intended use.
