import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { delimiter, join } from "node:path";

import {
  resolveVoiceConfig,
  type VoiceConfig,
} from "../../../build/voice-config";

export const runtime = "nodejs";

const userProfile = process.env.USERPROFILE ?? "";
const localAppData =
  process.env.LOCALAPPDATA ?? join(userProfile, "AppData", "Local");
const dravenRoot =
  process.env.DRAVEN_TTS_ROOT ??
  join(userProfile, "OneDrive", "Desktop", "files", "projects", "draventts");
const python =
  process.env.QWEN_TTS_PYTHON ??
  join(dravenRoot, "venv", "Scripts", "python.exe");
const script =
  process.env.QWEN_TTS_SCRIPT ?? join(dravenRoot, "qwen_voice.py");
const customModel =
  process.env.QWEN_TTS_MODEL ??
  join(dravenRoot, "models", "Qwen3-TTS-12Hz-1.7B-CustomVoice");
const cloneModel =
  process.env.QWEN_TTS_CLONE_MODEL ??
  join(dravenRoot, "models", "Qwen3-TTS-12Hz-1.7B-Base");
const soxDir =
  process.env.QWEN_TTS_SOX_DIR ??
  join(
    localAppData,
    "Programs",
    "cluely-v2",
    "resources",
    "extra-resources",
    "sox-14.4.1-win32",
  );
const styleInstruction =
  "Shoresy-inspired delivery: terse, fast, dry, confident, rough hockey-room cadence, playful chirp energy. Keep the exact input words. Do not add words, explanations, stage directions, or quotes.";

function runPython(args: string[]) {
  return new Promise<{ code: number | null; stderr: string }>((resolve, reject) => {
    const child = spawn(python, [script, ...args], {
      env: {
        ...process.env,
        PATH: `${soxDir}${delimiter}${process.env.PATH ?? process.env.Path ?? ""}`,
      },
      windowsHide: true,
      cwd: join(process.cwd()),
    });
    child.stdout.resume();
    let stderr = "";
    child.stderr.setEncoding("utf8");
    child.stderr.on("data", (chunk: string) => {
      stderr += chunk;
    });
    child.once("error", reject);
    child.once("close", (code) => resolve({ code, stderr }));
  });
}

function buildTtsArgs(config: VoiceConfig, output: string, text: string) {
  if (config.mode === "clone") {
    return [
      "--mode",
      "clone",
      "--model",
      cloneModel,
      "--language",
      "English",
      "--ref-wav",
      config.referenceWav,
      "--ref-text",
      config.referenceText,
      "--device",
      "cuda:0",
      "--dtype",
      "bfloat16",
      "--attn",
      "eager",
      "--output",
      output,
      text,
    ];
  }

  return [
    "--mode",
    "custom",
    "--model",
    customModel,
    "--language",
    "English",
    "--speaker",
    "Ryan",
    "--instruct",
    styleInstruction,
    "--device",
    "cuda:0",
    "--dtype",
    "bfloat16",
    "--attn",
    "eager",
    "--output",
    output,
    text,
  ];
}

export async function POST(request: Request) {
  let phrase: unknown;

  try {
    ({ phrase } = await request.json());
  } catch {
    return Response.json({ error: "Send a JSON body with a phrase." }, { status: 400 });
  }

  if (typeof phrase !== "string" || !phrase.trim()) {
    return Response.json({ error: "Give Shoresy a line first." }, { status: 400 });
  }

  const text = phrase.trim();
  if (text.length > 500) {
    return Response.json({ error: "Keep it under 500 characters." }, { status: 400 });
  }

  const config = await resolveVoiceConfig();
  if (config.mode === "clone" && (!config.referenceWav || !config.referenceText)) {
    return Response.json(
      {
        error:
          "Clone mode needs a reference WAV and transcript in voice-reference/.",
      },
      { status: 503 },
    );
  }

  const workDir = await mkdtemp(join(tmpdir(), "shoresytts-"));
  const output = join(workDir, "line.wav");

  try {
    const result = await runPython(buildTtsArgs(config, output, text));

    if (result.code !== 0) {
      console.error("Qwen TTS failed:", result.stderr.trim());
      return Response.json(
        { error: "The local voice model could not make that line." },
        { status: 502 },
      );
    }

    const audio = await readFile(output);
    return new Response(audio, {
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "audio/wav",
      },
    });
  } catch (error) {
    console.error("Qwen TTS request failed:", error);
    return Response.json(
      { error: "The local voice runner is unavailable." },
      { status: 500 },
    );
  } finally {
    await rm(workDir, { recursive: true, force: true });
  }
}
