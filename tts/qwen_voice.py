from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path


DEFAULT_CUSTOM_MODEL = "Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice"
DEFAULT_CLONE_MODEL = "Qwen/Qwen3-TTS-12Hz-1.7B-Base"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Standalone Qwen3-TTS runner for Shoresy TTS."
    )
    parser.add_argument("text", nargs="*", help="Text to synthesize.")
    parser.add_argument("--check", action="store_true", help="Check the runtime and exit.")
    parser.add_argument("--mode", choices=["custom", "clone"], default="custom")
    parser.add_argument("--model", default=None, help="Hugging Face model ID or local path.")
    parser.add_argument("--language", default="English")
    parser.add_argument("--speaker", default="Ryan")
    parser.add_argument("--instruct", default="")
    parser.add_argument("--ref-wav", default="")
    parser.add_argument("--ref-text", default="")
    parser.add_argument("--x-vector-only", action="store_true")
    parser.add_argument("--device", default="auto")
    parser.add_argument(
        "--dtype",
        choices=["auto", "float32", "float16", "bfloat16"],
        default="auto",
    )
    parser.add_argument("--attn", default="eager")
    parser.add_argument("--max-new-tokens", type=int, default=2048)
    parser.add_argument("--output", default="line.wav")
    return parser.parse_args()


def load_dependencies():
    try:
        import soundfile as sf
        import torch
        from qwen_tts import Qwen3TTSModel
    except ImportError as exc:
        raise RuntimeError(
            "Missing TTS dependencies. Run `npm run setup:tts` from the project root."
        ) from exc
    return torch, sf, Qwen3TTSModel


def resolve_device(requested: str, torch) -> str:
    if requested != "auto":
        return requested
    return "cuda:0" if torch.cuda.is_available() else "cpu"


def resolve_dtype(requested: str, device: str, torch):
    if requested == "float32":
        return torch.float32
    if requested == "float16":
        return torch.float16
    if requested == "bfloat16":
        return torch.bfloat16
    if device.startswith("cuda"):
        return torch.bfloat16 if torch.cuda.is_bf16_supported() else torch.float16
    return torch.float32


def resolve_model(args: argparse.Namespace) -> str:
    if args.model:
        return args.model
    return DEFAULT_CLONE_MODEL if args.mode == "clone" else DEFAULT_CUSTOM_MODEL


def check_runtime(torch) -> int:
    payload = {
        "ok": True,
        "python": sys.version.split()[0],
        "torch": torch.__version__,
        "cuda_runtime": torch.version.cuda,
        "cuda": bool(torch.cuda.is_available()),
        "device": "cuda:0" if torch.cuda.is_available() else "cpu",
    }
    print(json.dumps(payload))
    return 0


def synthesize(args: argparse.Namespace) -> int:
    torch, sf, model_class = load_dependencies()
    if args.check:
        return check_runtime(torch)

    text = " ".join(args.text).strip()
    if not text:
        raise ValueError("Text is required.")

    device = resolve_device(args.device, torch)
    dtype = resolve_dtype(args.dtype, device, torch)
    model_id = resolve_model(args)
    model = model_class.from_pretrained(
        model_id,
        device_map=device,
        dtype=dtype,
        attn_implementation=args.attn,
    )

    if args.mode == "clone":
        if not args.ref_wav:
            raise ValueError("Clone mode requires --ref-wav.")
        ref_wav = Path(args.ref_wav).expanduser().resolve()
        if not ref_wav.is_file():
            raise FileNotFoundError(f"Reference WAV not found: {ref_wav}")
        if not args.x_vector_only and not args.ref_text.strip():
            raise ValueError("Clone mode requires --ref-text unless --x-vector-only is used.")

        kwargs = {
            "text": text,
            "language": args.language,
            "ref_audio": str(ref_wav),
            "x_vector_only_mode": args.x_vector_only,
            "max_new_tokens": args.max_new_tokens,
        }
        if not args.x_vector_only:
            kwargs["ref_text"] = args.ref_text.strip()
        wavs, sample_rate = model.generate_voice_clone(**kwargs)
    else:
        kwargs = {
            "text": text,
            "language": args.language,
            "speaker": args.speaker,
            "max_new_tokens": args.max_new_tokens,
        }
        if args.instruct:
            kwargs["instruct"] = args.instruct
        wavs, sample_rate = model.generate_custom_voice(**kwargs)

    output = Path(args.output).expanduser().resolve()
    output.parent.mkdir(parents=True, exist_ok=True)
    sf.write(str(output), wavs[0], sample_rate)
    print(str(output))
    return 0


def main() -> int:
    args = parse_args()
    return synthesize(args)


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except KeyboardInterrupt:
        raise SystemExit(130)
    except Exception as exc:
        print(f"TTS error: {exc}", file=sys.stderr)
        raise SystemExit(1)
