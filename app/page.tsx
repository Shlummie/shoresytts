"use client";

import { useRef, useState, type FormEvent } from "react";

import { chirps } from "./chirps";

export default function Home() {
  const [phrase, setPhrase] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const lastChirp = useRef(-1);

  function pickChirp() {
    let index = Math.floor(Math.random() * chirps.length);
    if (chirps.length > 1 && index === lastChirp.current) {
      index = (index + 1) % chirps.length;
    }
    lastChirp.current = index;
    setPhrase(chirps[index]);
    setError("");
  }

  async function speak(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = phrase.trim();

    if (!text) {
      setError("Give Shoresy a line first.");
      return;
    }

    setBusy(true);
    setError("");
    setStatus("Warming up the room...");

    try {
      const response = await fetch("/api/speak", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ phrase: text }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? "The voice line failed.");
      }

      const blob = await response.blob();
      setAudioUrl((current) => {
        if (current) URL.revokeObjectURL(current);
        return URL.createObjectURL(blob);
      });
      setStatus("Line ready.");
    } catch (requestError) {
      setStatus("");
      setError(
        requestError instanceof Error
          ? requestError.message
          : "The voice line failed.",
      );
    } finally {
      setBusy(false);
    }
  }

  const hasOutput = Boolean(status || error || audioUrl);

  return (
    <main className="arena">
      <div className="photo-field" aria-hidden="true" />
      <div className="jersey-prop" aria-hidden="true" />

      <form
        className={`ticket${busy ? " is-busy" : ""}`}
        onSubmit={speak}
        aria-labelledby="page-title"
      >
        <section className="ticket-identity" aria-label="Ticket identity">
          <span
            className="bulldogs-mark"
            role="img"
            aria-label="Sudbury Blueberry Bulldogs"
          />

          <h1 id="page-title">
            <span>Shoresy</span>
            <em>TTS</em>
          </h1>

          <dl className="ticket-meta" aria-label="Home ticket details">
            <div>
              <dt>League</dt>
              <dd>NOSHO</dd>
            </div>
            <div>
              <dt>Ice</dt>
              <dd>Home</dd>
            </div>
            <div>
              <dt>Shore</dt>
              <dd>69</dd>
            </div>
          </dl>
        </section>

        <div className="ticket-copy">
          <label htmlFor="phrase">Type your chirp</label>
          <textarea
            id="phrase"
            name="phrase"
            value={phrase}
            onChange={(event) => setPhrase(event.target.value)}
            placeholder="Your best chirp..."
            maxLength={500}
            rows={5}
            disabled={busy}
            aria-describedby={hasOutput ? "voice-status" : undefined}
          />
          <button
            className="random-chirp"
            type="button"
            onClick={pickChirp}
            disabled={busy}
          >
            Random chirp
          </button>
        </div>

        <button
          className="ticket-stub"
          type="submit"
          disabled={busy || !phrase.trim()}
        >
          <span className="stub-action">{busy ? "Wait" : "Speak"}</span>
          <span className="stub-note">
            {busy ? "Loading the line" : "Admit one chirp"}
          </span>
        </button>

        {hasOutput && (
          <div className="ticket-output" id="voice-status" aria-live="polite">
            <span className="docket-label">
              {error ? "Penalty box" : status || "Playback"}
            </span>
            {error && <p className="error">{error}</p>}
            {audioUrl && !error && (
              <audio className="audio-player" controls autoPlay src={audioUrl}>
                <track
                  kind="captions"
                  src={`data:text/vtt,${encodeURIComponent(`WEBVTT\n\n00:00.000 --> 00:30.000\n${phrase}`)}`}
                  srcLang="en"
                  label="Your line"
                  default
                />
                Your browser does not support audio playback.
              </audio>
            )}
          </div>
        )}
      </form>
    </main>
  );
}
