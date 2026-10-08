"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import TextCore from "@/components/game/text-core";
import { Stat } from "@/components/game/hud";
import { ResultFX } from "@/components/game/game-effects";
import type { GameResult } from "@/components/game/types";
import { CODE_SNIPPETS, makeNumberToken, makeSymbolToken, randomSentence, randomWords } from "@/lib/words";
import { useApp } from "@/components/providers";

const DURATIONS = [15, 30, 60, 120, 300];
const MODES = ["words", "sentences", "paragraph", "numbers", "symbols", "code"] as const;

export default function TypingTestClient() {
  const { toast, refresh, user } = useApp();
  const [duration, setDuration] = useState(60);
  const [custom, setCustom] = useState(45);
  const [useCustom, setUseCustom] = useState(false);
  const [mode, setMode] = useState<(typeof MODES)[number]>("words");
  const [running, setRunning] = useState(false);
  const [nonce, setNonce] = useState(0);
  const [result, setResult] = useState<GameResult | null>(null);

  const activeDuration = useCustom ? Math.max(10, Math.min(900, custom)) : duration;

  const text = useMemo(() => {
    void nonce;
    switch (mode) {
      case "sentences":
        return [randomSentence("general"), randomSentence("business"), randomSentence("technology")].join(" ");
      case "paragraph":
        return [randomSentence("education"), randomSentence("science"), randomSentence("quotes")].join(" ");
      case "numbers":
        return Array.from({ length: 24 }, () => makeNumberToken(["random", "phone", "currency", "dates"][Math.floor(Math.random() * 4)])).join(" ");
      case "symbols":
        return Array.from({ length: 30 }, () => makeSymbolToken(3)).join(" ");
      case "code":
        return Object.values(CODE_SNIPPETS)[Math.floor(Math.random() * Object.keys(CODE_SNIPPETS).length)];
      default:
        return randomWords("common", 180).join(" ");
    }
  }, [mode, nonce]);

  const onFinish = async (r: GameResult) => {
    setResult(r);
    setRunning(false);
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...r, gameSlug: "typing-test" }),
    });
    const data = await res.json();
    if (data.saved) await refresh();
    else toast("Sign up to save your typing test history.", "info");
  };

  if (result) {
    const extra = result.extra ?? {};
    return (
      <div className={`result-panel ${result.won ? "" : "result-panel--lose"} panel rounded-3xl p-5 sm:p-8`}>
        <ResultFX won={result.won} accent="#22d3ee" />
        <h2 className={`result-heading text-center text-3xl font-black sm:text-4xl ${result.won ? "result-heading--win" : "result-heading--lose"}`}>
          {result.won ? "🏆 VICTORY!" : "💀 DEFEAT"}
        </h2>
        <p className="mt-1 text-center text-sm text-[var(--muted)]">
          {activeDuration}s · {mode} mode
        </p>
        <div className="mx-auto mt-6 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="WPM" value={result.wpm} accent="#22d3ee" />
          <Stat label="Accuracy" value={`${result.accuracy}%`} />
          <Stat label="Characters" value={result.chars} />
          <Stat label="Words" value={String(extra.words ?? 0)} />
          <Stat label="Correct chars" value={String(extra.correctChars ?? 0)} />
          <Stat label="Incorrect chars" value={String(extra.incorrectChars ?? 0)} />
          <Stat label="Errors" value={result.errors} />
          <Stat label="CPM" value={String(extra.cpm ?? 0)} />
          <Stat label="Consistency" value={`${extra.consistency ?? 0}%`} />
          <Stat label="Duration" value={`${result.durationSec}s`} />
          <Stat label="Mode" value={mode} />
          <Stat label="Saved" value={user ? "Yes" : "Guest"} />
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            className="btn btn-primary"
            onClick={() => {
              setResult(null);
              setRunning(true);
            }}
          >
            🔁 Retry
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => {
              setNonce((n) => n + 1);
              setResult(null);
              setRunning(true);
            }}
          >
            🆕 New test
          </button>
          <button
            className="btn btn-ghost"
            onClick={async () => {
              const txt = `I typed ${result.wpm} WPM with ${result.accuracy}% accuracy on Type Arena!`;
              if (navigator.share) await navigator.share({ text: txt, title: "Type Arena" }).catch(() => {});
              else {
                await navigator.clipboard.writeText(txt);
                toast("Result copied!", "success");
              }
            }}
          >
            📣 Share result
          </button>
          <Link className="btn btn-ghost" href="/profile">
            📊 View statistics
          </Link>
          <Link className="btn btn-ghost" href="/multiplayer">
            ⚔️ Challenge friend
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="panel rounded-3xl p-4 sm:p-5">
        <fieldset className="mb-4">
          <legend className="mb-2 text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Duration</legend>
          <div className="flex flex-wrap gap-2">
            {DURATIONS.map((d) => (
              <button
                key={d}
                onClick={() => {
                  setDuration(d);
                  setUseCustom(false);
                }}
                aria-pressed={!useCustom && duration === d}
                className={`rounded-xl border px-4 py-2 text-sm font-bold ${
                  !useCustom && duration === d ? "border-[#22d3ee] bg-[#22d3ee]/15 text-[#22d3ee]" : "border-[var(--border)] bg-[var(--panel)]"
                }`}
              >
                {d < 60 ? `${d}s` : `${d / 60}min`}
              </button>
            ))}
            <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3">
              <label htmlFor="custom" className="text-xs font-bold">
                Custom
              </label>
              <input
                id="custom"
                type="number"
                min={10}
                max={900}
                value={custom}
                onChange={(e) => {
                  setCustom(Number(e.target.value));
                  setUseCustom(true);
                }}
                className="h-9 w-20 rounded-lg bg-transparent text-sm outline-none"
              />
              <span className="text-xs text-[var(--muted)]">sec</span>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-2 text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Mode</legend>
          <div className="flex flex-wrap gap-2">
            {MODES.map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setNonce((n) => n + 1);
                }}
                aria-pressed={mode === m}
                className={`rounded-xl border px-4 py-2 text-sm font-bold capitalize ${
                  mode === m ? "border-[#7c5cff] bg-[#7c5cff]/15 text-[#c4b5fd]" : "border-[var(--border)] bg-[var(--panel)]"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      {running ? (
        <div className="panel rounded-3xl p-4 sm:p-6">
          <TextCore key={`${mode}-${nonce}-${activeDuration}`} text={text} durationSec={activeDuration} onFinish={onFinish} accent="#22d3ee" />
        </div>
      ) : (
        <div className="panel rounded-3xl p-8 text-center">
          <p className="text-lg font-bold">
            Ready? {activeDuration}s · {mode}
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">The timer starts the moment you press your first key.</p>
          <button className="btn btn-primary mt-5 px-8" onClick={() => setRunning(true)}>
            ▶ Start test
          </button>
        </div>
      )}
    </div>
  );
}
