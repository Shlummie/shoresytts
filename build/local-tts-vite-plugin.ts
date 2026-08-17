import { generateSpeechWav, TtsServiceError } from "./tts-runtime";

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

function sendJson(
  response: { statusCode: number; setHeader: Function; end: Function },
  status: number,
  body: Record<string, string>,
) {
  response.statusCode = status;
  response.setHeader("content-type", "application/json; charset=utf-8");
  response.end(JSON.stringify(body));
}

export function localTtsMiddleware() {
  return {
    name: "shoresytts-local-tts",
    configureServer(server: { middlewares: { use: Function } }) {
      server.middlewares.use(
        "/api/speak",
        async (request: any, response: any, next: Function) => {
          if (request.method !== "POST") {
            next();
            return;
          }

          try {
            const body = JSON.parse(await readBody(request));
            const phrase =
              typeof body.phrase === "string" ? body.phrase.trim() : "";

            if (!phrase) {
              sendJson(response, 400, {
                error: "Give Shoresy a line first.",
              });
              return;
            }
            if (phrase.length > 500) {
              sendJson(response, 400, {
                error: "Keep it under 500 characters.",
              });
              return;
            }

            const audio = await generateSpeechWav(phrase);
            response.statusCode = 200;
            response.setHeader("cache-control", "no-store");
            response.setHeader("content-type", "audio/wav");
            response.end(audio);
          } catch (error) {
            if (error instanceof TtsServiceError) {
              console.error("Qwen TTS request failed:", error.message);
              sendJson(response, error.status, {
                error: error.clientMessage,
              });
              return;
            }

            console.error("Qwen TTS request failed:", error);
            sendJson(response, 500, {
              error: "The voice runner is unavailable.",
            });
          }
        },
      );
    },
  };
}
