# Shoresy TTS

A small, standalone phrase-to-voice website. Type a chirp, press **Speak**, and
the server returns a WAV for immediate playback.

This repository includes its own Qwen runner and setup scripts. It does not
need a separate Draven TTS checkout or installation.

## Windows: easiest setup

You need:

- Windows 10 or 11
- Node.js 22 or newer
- Python 3.11 or 3.12
- An NVIDIA CUDA GPU is strongly recommended. CPU mode is available but slow.

Then:

1. Double-click `Setup Shoresy TTS.cmd` once.
2. To enable voice matching, add an authorized `reference.wav` and its exact
   `transcript.txt` to `voice-reference/`.
3. Double-click `Start Shoresy TTS.cmd`.
4. Open `http://127.0.0.1:3000`.

Setup creates a project-local `.venv`, installs the pinned Python packages,
downloads a checksum-verified project-local copy of SoX, and automatically uses
the official CUDA 12.8 PyTorch wheel when it detects an NVIDIA GPU. The first
spoken line downloads the selected Qwen model weights from Hugging Face, so it
takes longer than later lines.

Without both reference files, the app still works using Qwen's `Ryan` preset
with a Shoresy-inspired delivery instruction. It is not a direct voice match
in that fallback mode.

## macOS and Linux

Install Node.js 22+, Python 3.11+, and SoX first. Then run:

```bash
npm install
npm run setup:tts:unix
npm run dev:lan
```

The local setup uses the official
[Qwen3-TTS package](https://github.com/QwenLM/Qwen3-TTS) and defaults to the
official [1.7B Base model](https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base)
for reference-audio voice cloning.

## Let other people use it

`Start Shoresy TTS.cmd` binds the site to all local network interfaces. Other
devices can open `http://YOUR-COMPUTER-IP:3000` while the server is running.
Only the server computer needs the model and Python runtime; visitors need only
a browser.

Opening that port to the public internet also exposes an expensive GPU endpoint
with no built-in accounts or rate limit. Put authentication and rate limiting
in front of it before public port forwarding.

For a separately hosted frontend, set `SHORESY_TTS_API_URL` to a GPU-backed
endpoint that accepts `POST {"phrase":"..."}` and returns `audio/wav`. Set
`SHORESY_TTS_API_TOKEN` if that endpoint expects a bearer token. A static or
Cloudflare-only frontend cannot run the local Python model by itself.

## Voice configuration

The default behavior is automatic:

- Both `voice-reference/reference.wav` and `voice-reference/transcript.txt`
  present: use the 1.7B Base clone model.
- Reference missing: use the 1.7B CustomVoice model and `Ryan` preset.

If matching model folders already exist under `models/`, the server uses them
instead of the Hugging Face cache. The entire `models/` directory is ignored by
Git.

Optional environment overrides:

| Variable | Purpose |
| --- | --- |
| `QWEN_TTS_MODE` | Force `clone` or `custom`. |
| `QWEN_TTS_REF_WAV` | Reference WAV path. |
| `QWEN_TTS_REF_TEXT` | Literal transcript or transcript-file path. |
| `QWEN_TTS_PYTHON` | Python executable; defaults to the project `.venv`. |
| `QWEN_TTS_SCRIPT` | Runner path; defaults to `tts/qwen_voice.py`. |
| `QWEN_TTS_MODEL` | CustomVoice model ID or local directory. |
| `QWEN_TTS_CLONE_MODEL` | Base clone model ID or local directory. |
| `QWEN_TTS_DEVICE` | Device such as `auto`, `cpu`, or `cuda:0`. |
| `QWEN_TTS_DTYPE` | `auto`, `float32`, `float16`, or `bfloat16`. |
| `QWEN_TTS_ATTN` | Attention implementation; defaults to `eager`. |
| `QWEN_TTS_SOX_DIR` | Optional custom directory containing `sox`. |
| `QWEN_TTS_TORCH_INDEX_URL` | Override the PyTorch wheel index used during setup. |
| `SHORESY_TTS_API_URL` | Optional remote WAV-generation endpoint. |
| `SHORESY_TTS_API_TOKEN` | Optional bearer token for the remote endpoint. |

## Checks

```powershell
npm run lint
npm test
```

The standalone runner can also be checked directly:

```powershell
.venv\Scripts\python.exe tts\qwen_voice.py --check
```

## Project structure

- `app/` - the page and `/api/speak` route.
- `build/` - shared local/remote TTS runtime and Vite middleware.
- `tts/` - the bundled Qwen command-line runner.
- `scripts/` - Windows and Unix setup scripts.
- `voice-reference/` - ignored local voice-reference files and instructions.
- `public/` - brand imagery, fonts, and paper textures.
- `tests/` - rendered-HTML smoke tests.

## Privacy and rights boundary

The public repository excludes reference audio, transcripts, source video,
generated audio, model weights, environment files, caches, screenshots, and
machine-specific paths. Use only voice material you are authorized to process.
This is an unofficial fan project and is not affiliated with the show, its
cast, producers, distributors, or rights holders.

## Asset sources and licensing

These assets are used by an unaffiliated fan interface. Their presence does
not imply permission for every form of redistribution or commercial use.

| Local file | Source |
| --- | --- |
| `public/brand/shoresy-logo.png` | Official Shoresy store header asset: `https://www.letterkenny.tv/cdn/shop/files/updated-shoresy-logo.png?v=1759798809` |
| `public/brand/shore-69-jersey.png` | Official Shoresy store product image: `https://www.letterkenny.tv/cdn/shop/files/s69blujer1.png?v=1784123900&width=1000` |
| `public/brand/shoresy-season-3-key-art-full.jpg` | Hulu Press Shoresy Season 3 key art: `https://press.hulu.com/storage/uploads/1B/ED/1BED8CA0-A215-D3D6-93DA-CD857CEE5F87/shoresy_s3_ta_p67_2000x3000.jpg` |
| `public/fonts/Oswald-wght.ttf` | Oswald from the official Google Fonts repository, licensed under the SIL Open Font License in `public/fonts/Oswald-OFL.txt`. |
| `public/textures/ticket-blue-paper.png` | Original generated Carolina-blue paper scan; its prompt is stored beside it and embedded in the PNG metadata. |
| `public/textures/ticket-ivory-paper.png` | Original generated ivory paper scan; its prompt is stored beside it and embedded in the PNG metadata. |

Confirm that show photography and marks are cleared for the intended use before
redistributing them.
