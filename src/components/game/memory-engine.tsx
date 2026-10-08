"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EngineProps } from "./types";
import { HudRow, Stat, TypingInput } from "./hud";
import { randomWords } from "@/lib/words";
import { useApp } from "../providers";
import { BurstFX } from "./game-effects";

export default function MemoryEngine({ config, onFinish }: EngineProps) {
  const { play } = useApp();
  const startLength = Number(config.startLength ?? 3);
  const [round, setRound] = useState(1);
  const [sequence, setSequence] = useState<string[]>(() => randomWords("common", startLength));
  const [phase, setPhase] = useState<"show" | "recall">("show");
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [elapsed, setElapsed] = useState(0);
  const [chars, setChars] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [countdown, setCountdown] = useState(4);
  const [hitFlash, setHitFlash] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const over = useRef(false);

  useEffect(() => {
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (phase !== "show") return;
    setCountdown(3 + sequence.length);
    const id = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(id);
          setPhase("recall");
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase, sequence]);

  const finish = useCallback(
    (won: boolean) => {
      if (over.current) return;
      over.current = true;
      const accuracy = attempts ? Math.round(((attempts - mistakes) / attempts) * 1000) / 10 : 100;
      play("finish");
      onFinish({
        wpm: Math.round((chars / 5 / Math.max(1, elapsed)) * 60),
        accuracy,
        score,
        errors: mistakes,
        chars,
        durationSec: elapsed,
        won,
        extra: { round, sequenceLength: sequence.length },
      });
    },
    [attempts, chars, elapsed, mistakes, onFinish, play, round, score, sequence.length],
  );

  const submit = () => {
    setAttempts((a) => a + 1);
    const guess = input.trim().toLowerCase().split(/\s+/);
    const correct = guess.length === sequence.length && guess.every((w, i) => w === sequence[i]);
    if (correct) {
      play("combo");
      setScore((s) => s + sequence.length * 50 * round);
      setChars((c) => c + sequence.join("").length);
      setCelebrate(true);
      window.setTimeout(() => setCelebrate(false), 500);
      const next = round + 1;
      setRound(next);
      setSequence(randomWords("common", startLength + next - 1));
      setPhase("show");
    } else {
      play("error");
      setMistakes((m) => m + 1);
      setHitFlash(true);
      window.setTimeout(() => setHitFlash(false), 400);
      setLives((l) => {
        const nl = l - 1;
        if (nl <= 0) setTimeout(() => finish(false), 0);
        return nl;
      });
      setPhase("show");
    }
    setInput("");
  };

  return (
    <div className="space-y-4">
      <HudRow>
        <Stat label="Round" value={round} accent="#f472b6" />
        <Stat label="Score" value={score} />
        <Stat label="Words" value={sequence.length} />
        <Stat label="Lives" value={"❤️".repeat(Math.max(0, lives))} />
        <Stat label="Time" value={`${elapsed}s`} />
        <Stat label="Mistakes" value={mistakes} />
      </HudRow>

      <div className={`memory-field relative grid min-h-[220px] overflow-hidden place-items-center rounded-xl border border-[var(--border)] p-6 ${hitFlash ? "shake" : ""}`}>
        {hitFlash && <div className="arena-flash arena-flash--hit" aria-hidden="true" />}
        {celebrate && <BurstFX x={50} y={45} tone="cyan" label="CORRECT" />}
        {phase === "show" ? (
          <div className="text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Memorise — hides in {countdown}s</p>
            <p className="flex flex-wrap justify-center gap-3 text-2xl font-black sm:text-3xl">
              {sequence.map((w, i) => (
                <span key={i} className="memory-key">
                  {w}
                </span>
              ))}
            </p>
          </div>
        ) : (
          <p className="text-center text-lg font-bold text-[var(--muted)]">Type the {sequence.length} words in order, separated by spaces.</p>
        )}
      </div>

      <TypingInput value={input} onChange={setInput} disabled={phase === "show"} onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="word1 word2 word3…" />
      <div className="flex justify-center gap-2">
        <button className="btn btn-primary" onClick={submit} disabled={phase === "show"}>
          Submit sequence
        </button>
        <button className="btn btn-ghost" onClick={() => finish(round > 3)}>
          End run
        </button>
      </div>
    </div>
  );
}
