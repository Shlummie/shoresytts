import {
  generateSpeechWav,
  TtsServiceError,
} from "../../../build/tts-runtime";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let phrase: unknown;

  try {
    ({ phrase } = await request.json());
  } catch {
    return Response.json(
      { error: "Send a JSON body with a phrase." },
      { status: 400 },
    );
  }

  if (typeof phrase !== "string" || !phrase.trim()) {
    return Response.json(
      { error: "Give Shoresy a line first." },
      { status: 400 },
    );
  }

  const text = phrase.trim();
  if (text.length > 500) {
    return Response.json(
      { error: "Keep it under 500 characters." },
      { status: 400 },
    );
  }

  try {
    const audio = await generateSpeechWav(text);
    return new Response(audio, {
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "audio/wav",
      },
    });
  } catch (error) {
    if (error instanceof TtsServiceError) {
      console.error("Qwen TTS request failed:", error.message);
      return Response.json(
        { error: error.clientMessage },
        { status: error.status },
      );
    }

    console.error("Qwen TTS request failed:", error);
    return Response.json(
      { error: "The voice runner is unavailable." },
      { status: 500 },
    );
  }
}
