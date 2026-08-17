[CmdletBinding()]
param(
  [string]$PythonCommand = ""
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$VenvDir = Join-Path $ProjectRoot ".venv"
$VenvPython = Join-Path $VenvDir "Scripts\python.exe"
$Requirements = Join-Path $ProjectRoot "requirements-tts.txt"
$Runner = Join-Path $ProjectRoot "tts\qwen_voice.py"
$SoxVersion = "14.4.2"
$SoxRoot = Join-Path $ProjectRoot ".tools\sox"
$SoxDir = Join-Path $SoxRoot "sox-$SoxVersion"
$SoxExe = Join-Path $SoxDir "sox.exe"
$SoxArchive = Join-Path $SoxRoot "sox-$SoxVersion-win32.zip"
$SoxUrl = "https://downloads.sourceforge.net/project/sox/sox/$SoxVersion/sox-$SoxVersion-win32.zip"
$SoxSha256 = "8072CC147CF1A3B3713B8B97D6844BB9389E211AB9E1101E432193FAD6AE6662"
$TorchIndexUrl = $env:QWEN_TTS_TORCH_INDEX_URL
$ExpectCuda = $false

function Invoke-Checked {
  param([string]$Command, [string[]]$Arguments)
  & $Command @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "Command failed with exit code $LASTEXITCODE`: $Command"
  }
}

function Test-PythonCandidate {
  param([string]$Command, [string[]]$PrefixArgs)
  try {
    & $Command @PrefixArgs -c "import sys; raise SystemExit(0 if sys.version_info >= (3, 11) else 1)" 2>$null
    return $LASTEXITCODE -eq 0
  } catch {
    return $false
  }
}

if ($PythonCommand) {
  $Launcher = $PythonCommand
  $LauncherArgs = @()
} elseif ((Get-Command py -ErrorAction SilentlyContinue) -and (Test-PythonCandidate "py" @("-3.12"))) {
  $Launcher = "py"
  $LauncherArgs = @("-3.12")
} elseif ((Get-Command py -ErrorAction SilentlyContinue) -and (Test-PythonCandidate "py" @("-3.11"))) {
  $Launcher = "py"
  $LauncherArgs = @("-3.11")
} elseif ((Get-Command python -ErrorAction SilentlyContinue) -and (Test-PythonCandidate "python" @())) {
  $Launcher = "python"
  $LauncherArgs = @()
} else {
  throw "Python 3.11 or newer is required. Install Python, then run this script again."
}

if (-not (Test-Path -LiteralPath $VenvPython)) {
  Write-Host "Creating project Python environment..."
  Invoke-Checked $Launcher ($LauncherArgs + @("-m", "venv", $VenvDir))
}

if (-not (Test-Path -LiteralPath $SoxExe)) {
  Write-Host "Downloading the project-local SoX audio tool..."
  New-Item -ItemType Directory -Force -Path $SoxRoot | Out-Null
  Invoke-WebRequest -Uri $SoxUrl -OutFile $SoxArchive -UserAgent "ShoresyTTS-Setup/1.0"

  $ActualSoxSha256 = (Get-FileHash -LiteralPath $SoxArchive -Algorithm SHA256).Hash
  if ($ActualSoxSha256 -ne $SoxSha256) {
    Remove-Item -LiteralPath $SoxArchive -Force
    throw "SoX download did not match the pinned SHA-256 checksum."
  }

  Expand-Archive -LiteralPath $SoxArchive -DestinationPath $SoxRoot -Force
  Remove-Item -LiteralPath $SoxArchive -Force
}

if (-not (Test-Path -LiteralPath $SoxExe)) {
  throw "Project-local SoX setup failed: $SoxExe was not created."
}

Write-Host "Installing the standalone Qwen TTS runtime..."
Invoke-Checked $VenvPython @("-m", "pip", "install", "--upgrade", "pip")

if (-not $TorchIndexUrl -and (Get-Command nvidia-smi -ErrorAction SilentlyContinue)) {
  $TorchIndexUrl = "https://download.pytorch.org/whl/cu128"
  $ExpectCuda = $true
  Write-Host "NVIDIA GPU detected. Installing the official CUDA 12.8 PyTorch build..."
} elseif ($TorchIndexUrl -match "/cu\d+") {
  $ExpectCuda = $true
}

if ($TorchIndexUrl) {
  Invoke-Checked $VenvPython @(
    "-m", "pip", "install",
    "torch==2.9.1", "torchaudio==2.9.1",
    "--index-url", $TorchIndexUrl
  )
}

Invoke-Checked $VenvPython @("-m", "pip", "install", "-r", $Requirements)

$env:Path = "$SoxDir$([IO.Path]::PathSeparator)$env:Path"
Write-Host "Checking the runtime (the first import can take a minute)..."
Invoke-Checked $VenvPython @($Runner, "--check")

if ($ExpectCuda) {
  Invoke-Checked $VenvPython @(
    "-c",
    "import torch; raise SystemExit(0 if torch.cuda.is_available() else 1)"
  )
}

Write-Host "Standalone TTS setup complete. Model weights download automatically on first use."
