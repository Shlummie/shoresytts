import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { access, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { delimiter, join } from "node:path";

import { resolveVoiceConfig, type VoiceConfig } from "./voice-config";

const projectRoot = process.cwd();
const defaultPython =
  process.platform === "win32"
    ? join(projectRoot, ".venv", "Scripts", "python.exe")
    : join(projectRoot, ".venv", "bin", "python");
const python = process.env.QWEN_TTS_PYTHON ?? defaultPython;
const script =
  process.env.QWEN_TTS_SCRIPT ?? join(projectRoot, "tts", "qwen_voice.py");
const localCustomModel = join(
  projectRoot,
  "models",
  "Qwen3-TTS-12Hz-1.7B-CustomVoice",
);
const localCloneModel = join(
  projectRoot,
  "models",
  "Qwen3-TTS-12Hz-1.7B-Base",
);
const customModel =
  process.env.QWEN_TTS_MODEL ??
  (existsSync(localCustomModel)
    ? localCustomModel
    : "Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice");
const cloneModel =
  process.env.QWEN_TTS_CLONE_MODEL ??
  (existsSync(localCloneModel)
    ? localCloneModel
    : "Qwen/Qwen3-TTS-12Hz-1.7B-Base");
const device = process.env.QWEN_TTS_DEVICE ?? "auto";
const dtype = process.env.QWEN_TTS_DTYPE ?? "auto";
const attention = process.env.QWEN_TTS_ATTN ?? "eager";
const bundledSoxDir = join(
  projectRoot,
  ".tools",
  "sox",
  "sox-14.4.2",
);
const soxDir = process.env.QWEN_TTS_SOX_DIR?.trim() || bundledSoxDir;
const remoteUrl = process.env.SHORESY_TTS_API_URL?.trim();
const remoteToken = process.env.SHORESY_TTS_API_TOKEN?.trim();
const styleInstruction =
  "Shoresy-inspired delivery: terse, fast, dry, confident, rough hockey-room cadence, playful chirp energy. Keep the exact input words. Do not add words, explanations, stage directions, or quotes.";

export class TtsServiceError extends Error {
  constructor(
    readonly status: number,
    readonly clientMessage: string,
    message = clientMessage,
  ) {
    super(message);
    this.name = "TtsServiceError";
  }
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function buildTtsArgs(config: VoiceConfig, output: string, text: string) {
  const shared = [
    "--language",
    "English",
    "--device",
    device,
    "--dtype",
    dtype,
    "--attn",
    attention,
    "--output",
    output,
  ];

  if (config.mode === "clone") {
    return [
      "--mode",
      "clone",
      "--model",
      cloneModel,
      "--ref-wav",
      config.referenceWav,
      "--ref-text",
      config.referenceText,
      ...shared,
      text,
    ];
  }

  return [
    "--mode",
    "custom",
    "--model",
    customModel,
    "--speaker",
    "Ryan",
    "--instruct",
    styleInstruction,
    ...shared,
    text,
  ];
}

function runPython(args: string[]) {
  return new Promise<{ code: number | null; stderr: string }>(
    (resolve, reject) => {
      const path = process.env.PATH ?? process.env.Path ?? "";
      const child = spawn(python, [script, ...args], {
        cwd: projectRoot,
        env: {
          ...process.env,
          PATH: soxDir ? `${soxDir}${delimiter}${path}` : path,
        },
        windowsHide: true,
      });

      child.stdout.resume();
      let stderr = "";
      child.stderr.setEncoding("utf8");
      child.stderr.on("data", (chunk: string) => {
        stderr += chunk;
      });
      child.once("error", reject);
      child.once("close", (code) => resolve({ code, stderr }));
    },
  );
}

async function generateRemote(text: string): Promise<Buffer> {
  const response = await fetch(remoteUrl!, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(remoteToken ? { authorization: `Bearer ${remoteToken}` } : {}),
    },
    body: JSON.stringify({ phrase: text }),
  });

  if (!response.ok) {
    throw new TtsServiceError(
      502,
      "The hosted voice service could not make that line.",
      `Remote TTS returned ${response.status}.`,
    );
  }

  return Buffer.from(await response.arrayBuffer());
}

async function assertLocalRuntime() {
  if (!(await fileExists(script))) {
    throw new TtsServiceError(
      503,
      "The bundled voice runner is missing.",
      `Missing TTS runner: ${script}`,
    );
  }
  if (!process.env.QWEN_TTS_PYTHON && !(await fileExists(defaultPython))) {
    throw new TtsServiceError(
      503,
      "Run npm run setup:tts once, then try again.",
      `Project Python environment is missing: ${defaultPython}`,
    );
  }
}

export async function generateSpeechWav(text: string): Promise<Buffer> {
  if (remoteUrl) {
    return generateRemote(text);
  }

  await assertLocalRuntime();
  const config = await resolveVoiceConfig();
  if (config.mode === "clone" && (!config.referenceWav || !config.referenceText)) {
    throw new TtsServiceError(
      503,
      "Clone mode needs a reference WAV and transcript in voice-reference/.",
    );
  }

  const workDir = await mkdtemp(join(tmpdir(), "shoresytts-"));
  const output = join(workDir, "line.wav");

  try {
    const result = await runPython(buildTtsArgs(config, output, text));
    if (result.code !== 0) {
      throw new TtsServiceError(
        502,
        "The voice model could not make that line.",
        result.stderr.trim() || `TTS runner exited with code ${result.code}.`,
      );
    }
    return await readFile(output);
  } catch (error) {
    if (error instanceof TtsServiceError) throw error;
    throw new TtsServiceError(
      500,
      "The voice runner is unavailable.",
      error instanceof Error ? error.message : String(error),
    );
  } finally {
    await rm(workDir, { recursive: true, force: true });
  }
}
