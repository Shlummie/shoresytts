import { access, readFile } from "node:fs/promises";
import { join } from "node:path";

export type VoiceConfig = {
  mode: "custom" | "clone";
  referenceWav: string;
  referenceText: string;
};

const referenceDir =
  process.env.QWEN_TTS_REF_DIR ?? join(process.cwd(), "voice-reference");

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * Resolves the clone transcript to its literal text.
 *
 * `qwen_voice.py` expects `--ref-text` to be the transcript itself, not a
 * file path, so any value that points at an existing file is read here.
 * Anything else is treated as the transcript text already.
 */
async function resolveTranscript(value: string): Promise<string> {
  if (!value) {
    return "";
  }
  if (await exists(value)) {
    return (await readFile(value, "utf8")).trim();
  }
  return value.trim();
}

/**
 * Resolves which voice to use for a line:
 * - `QWEN_TTS_MODE` explicitly forces `clone` or `custom`.
 * - Otherwise, clone mode is used automatically when a reference WAV and
 *   transcript are present (env vars first, then `voice-reference/`).
 * - With no reference, the Shoresy-inspired `custom` preset is the fallback.
 */
export async function resolveVoiceConfig(): Promise<VoiceConfig> {
  const explicitMode = (process.env.QWEN_TTS_MODE ?? "").toLowerCase();

  let referenceWav = process.env.QWEN_TTS_REF_WAV ?? "";
  let referenceText = process.env.QWEN_TTS_REF_TEXT ?? "";

  if (!referenceWav) {
    const repoWav = join(referenceDir, "reference.wav");
    if (await exists(repoWav)) {
      referenceWav = repoWav;
    }
  }
  if (!referenceText) {
    const repoText = join(referenceDir, "transcript.txt");
    if (await exists(repoText)) {
      referenceText = repoText;
    }
  }

  referenceText = await resolveTranscript(referenceText);

  let mode: VoiceConfig["mode"] = "custom";
  if (explicitMode === "clone" || explicitMode === "custom") {
    mode = explicitMode;
  } else if (referenceWav && referenceText) {
    mode = "clone";
  }

  return { mode, referenceWav, referenceText };
}
