#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PYTHON_COMMAND="${PYTHON_COMMAND:-python3}"
TORCH_INDEX_URL="${QWEN_TTS_TORCH_INDEX_URL:-}"
EXPECT_CUDA=0

"$PYTHON_COMMAND" -c 'import sys; raise SystemExit(0 if sys.version_info >= (3, 11) else 1)' || {
  echo "Python 3.11 or newer is required." >&2
  exit 1
}

if ! command -v sox >/dev/null 2>&1; then
  echo "SoX is required. Install it first (for example: sudo apt install sox, or brew install sox)." >&2
  exit 1
fi

if [[ ! -x "$PROJECT_ROOT/.venv/bin/python" ]]; then
  "$PYTHON_COMMAND" -m venv "$PROJECT_ROOT/.venv"
fi
"$PROJECT_ROOT/.venv/bin/python" -m pip install --upgrade pip

if [[ -z "$TORCH_INDEX_URL" ]] && command -v nvidia-smi >/dev/null 2>&1; then
  TORCH_INDEX_URL="https://download.pytorch.org/whl/cu128"
  EXPECT_CUDA=1
  echo "NVIDIA GPU detected. Installing the official CUDA 12.8 PyTorch build..."
elif [[ "$TORCH_INDEX_URL" =~ /cu[0-9]+ ]]; then
  EXPECT_CUDA=1
fi

if [[ -n "$TORCH_INDEX_URL" ]]; then
  "$PROJECT_ROOT/.venv/bin/python" -m pip install \
    torch==2.9.1 torchaudio==2.9.1 \
    --index-url "$TORCH_INDEX_URL"
fi

"$PROJECT_ROOT/.venv/bin/python" -m pip install -r "$PROJECT_ROOT/requirements-tts.txt"
"$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tts/qwen_voice.py" --check

if [[ "$EXPECT_CUDA" -eq 1 ]]; then
  "$PROJECT_ROOT/.venv/bin/python" -c \
    'import torch; raise SystemExit(0 if torch.cuda.is_available() else 1)'
fi

echo "Standalone TTS setup complete. Model weights download automatically on first use."
