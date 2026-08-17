import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { delimiter, join } from "node:path";

import { resolveVoiceConfig, type VoiceConfig } from "./voice-config";

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
      cwd: process.cwd(),
      env: {
        ...process.env,
        PATH: `${soxDir}${delimiter}${process.env.PATH ?? process.env.Path ?? ""}`,
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

function readBody(request: { on: Function }) {
  return new Promise<string>((resolve, reject) => {
    const chunks: Buffer[] = [];
    request.on("data", (chunk: Buffer | string) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });
    request.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    request.on("error", reject);
  });
}

function sendJson(response: { statusCode: number; setHeader: Function; end: Function }, status: number, body: Record<string, string>) {
  response.statusCode = status;
  response.setHeader("content-type", "application/json; charset=utf-8");
  response.end(JSON.stringify(body));
}

export function localTtsMiddleware() {
  return {
    name: "shoresytts-local-tts",
    configureServer(server: { middlewares: { use: Function } }) {
      server.middlewares.use("/api/speak", async (request: any, response: any, next: Function) => {
        if (request.method !== "POST") {
          next();
          return;
        }

        try {
          const body = JSON.parse(await readBody(request));
          const phrase = typeof body.phrase === "string" ? body.phrase.trim() : "";

          if (!phrase) {
            sendJson(response, 400, { error: "Give Shoresy a line first." });
            return;
          }
          if (phrase.length > 500) {
            sendJson(response, 400, { error: "Keep it under 500 characters." });
            return;
          }

          const config = await resolveVoiceConfig();
          if (config.mode === "clone" && (!config.referenceWav || !config.referenceText)) {
            sendJson(response, 503, {
              error: "Clone mode needs a reference WAV and transcript in voice-reference/.",
            });
            return;
          }

          const workDir = await mkdtemp(join(tmpdir(), "shoresytts-"));
          const output = join(workDir, "line.wav");

          try {
            const result = await runPython(buildTtsArgs(config, output, phrase));

            if (result.code !== 0) {
              console.error("Qwen TTS failed:", result.stderr.trim());
              sendJson(response, 502, {
                error: "The local voice model could not make that line.",
              });
              return;
            }

            const audio = await readFile(output);
            response.statusCode = 200;
            response.setHeader("cache-control", "no-store");
            response.setHeader("content-type", "audio/wav");
            response.end(audio);
          } finally {
            await rm(workDir, { recursive: true, force: true });
          }
        } catch (error) {
          console.error("Qwen TTS request failed:", error);
          sendJson(response, 500, { error: "The local voice runner is unavailable." });
        }
      });
    },
  };
}
