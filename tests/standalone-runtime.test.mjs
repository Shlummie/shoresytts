import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function read(path) {
  return readFile(new URL(path, root), "utf8");
}

test("ships an in-repository TTS runtime with no Draven dependency", async () => {
  const [runtime, route, middleware, runner, requirements, windowsSetup] =
    await Promise.all([
      read("build/tts-runtime.ts"),
      read("app/api/speak/route.ts"),
      read("build/local-tts-vite-plugin.ts"),
      read("tts/qwen_voice.py"),
      read("requirements-tts.txt"),
      read("scripts/setup-tts.ps1"),
    ]);

  const shippedRuntime = [
    runtime,
    route,
    middleware,
    runner,
    requirements,
    windowsSetup,
  ].join("\n");

  assert.doesNotMatch(shippedRuntime, /draventts|DRAVEN_TTS_ROOT/i);
  assert.match(runtime, /\.venv/);
  assert.match(runtime, /tts["',\s]+qwen_voice\.py/);
  assert.match(runtime, /Qwen3-TTS-12Hz-1\.7B-Base/);
  assert.match(runtime, /models/);
  assert.match(runtime, /SHORESY_TTS_API_URL/);
  assert.match(route, /generateSpeechWav/);
  assert.match(middleware, /generateSpeechWav/);
  assert.match(runner, /generate_voice_clone/);
  assert.match(requirements, /^qwen-tts==0\.1\.1$/m);
  assert.match(requirements, /^torch==2\.9\.1$/m);
  assert.match(windowsSetup, /download\.pytorch\.org\/whl\/cu128/);
  assert.match(
    windowsSetup,
    /8072CC147CF1A3B3713B8B97D6844BB9389E211AB9E1101E432193FAD6AE6662/,
  );
});

test("keeps reference and generated voice material out of Git", async () => {
  const ignore = await read(".gitignore");

  assert.match(ignore, /\/voice-reference\/\*/);
  assert.match(ignore, /\*\.wav/);
  assert.match(ignore, /\*\.mp4/);
  assert.match(ignore, /\/\.venv\//);
  assert.match(ignore, /\/models\//);
});
