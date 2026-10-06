"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { calcWpm, consistency } from "@/lib/progression";
import { useApp } from "../providers";
import { GameResult } from "./types";
import { HudRow, ProgressBar, Stat } from "./hud";

export type TextCoreProps = {
  text: string;
  durationSec?: number; // 0 = type-until-complete
  onFinish: (r: GameResult) => void;
  accent?: string;
  label?: string;
};

export default function TextCore({ text, durationSec = 0, onFinish, accent = "#c5fb56", label }: TextCoreProps) {
  const { play } = useApp();
  const [typed, setTyped] = useState("");
  const [started, setStarted] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [keystrokes, setKeystrokes] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const samples = useRef<number[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const finishedRef = useRef(false);

  useEffect(() => {
    setTyped("");
    setStarted(null);
    setKeystrokes(0);
    setMistakes(0);
    samples.current = [];
    finishedRef.current = false;
    inputRef.current?.focus();
  }, [text]);

  const elapsed = started ? (now - started) / 1000 : 0;
  const remaining = durationSec ? Math.max(0, durationSec - elapsed) : 0;

  const correct = useMemo(() => {
    let c = 0;
    for (let i = 0; i < typed.length; i++) if (typed[i] === text[i]) c++;
    return c;
  }, [typed, text]);

  const incorrect = typed.length - correct;
  const accuracy = keystrokes ? Math.max(0, ((keystrokes - mistakes) / keystrokes) * 100) : 100;
  const wpm = calcWpm(correct, elapsed || 0.001);

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const secs = Math.max(1, elapsed);
    const finalWpm = Math.round(calcWpm(correct, secs));
    const acc = Math.round(accuracy * 10) / 10;
    play("finish");
    onFinish({
      wpm: finalWpm,
      accuracy: acc,
      score: Math.round(finalWpm * 10 * (acc / 100)),
      errors: mistakes,
      chars: typed.length,
      durationSec: Math.round(secs),
      won: acc >= 90 && finalWpm >= 35,
      extra: {
        correctChars: correct,
        incorrectChars: incorrect,
        cpm: Math.round((correct / secs) * 60),
        consistency: Math.round(consistency(samples.current)),
        words: Math.round(correct / 5),
      },
    });
  }, [accuracy, correct, elapsed, incorrect, mistakes, onFinish, play, typed.length]);

  useEffect(() => {
    const id = setInterval(() => {
      setNow(Date.now());
      if (started) samples.current.push(calcWpm(correct, Math.max(0.5, (Date.now() - started) / 1000)));
    }, 500);
    return () => clearInterval(id);
  }, [started, correct]);

  useEffect(() => {
    if (durationSec && started && remaining <= 0) finish();
  }, [durationSec, remaining, started, finish]);

  const handleChange = (value: string) => {
    if (finishedRef.current) return;
    if (!started) setStarted(Date.now());
    if (value.length > typed.length) {
      const idx = value.length - 1;
      setKeystrokes((k) => k + 1);
      if (value[idx] !== text[idx]) {
        setMistakes((m) => m + 1);
        play("error");
      } else {
        play("key");
      }
    }
    setTyped(value.slice(0, text.length));
    if (value.length >= text.length && !durationSec) setTimeout(finish, 30);
  };

  const progress = (typed.length / text.length) * 100;

  return (
    <div className="space-y-4">
      <HudRow>
        <Stat label="WPM" value={Math.round(wpm)} accent={accent} />
        <Stat label="Accuracy" value={`${accuracy.toFixed(1)}%`} />
        <Stat label="Errors" value={mistakes} />
        <Stat label="Correct" value={correct} />
        <Stat label="Wrong" value={incorrect} />
        <Stat label={durationSec ? "Time Left" : "Time"} value={durationSec ? `${Math.ceil(remaining)}s` : `${elapsed.toFixed(0)}s`} />
      </HudRow>

      <ProgressBar value={durationSec ? ((durationSec - remaining) / durationSec) * 100 : progress} color={accent} label="Test progress" />

      <div
        className="typing-field relative cursor-text rounded-xl p-4 text-lg leading-relaxed sm:p-6 sm:text-2xl"
        onClick={() => inputRef.current?.focus()}
      >
        <p className="whitespace-pre-wrap break-words font-mono" aria-label={label ?? "Text to type"}>
          {text.split("").map((ch, i) => {
            const state = i < typed.length ? (typed[i] === ch ? "ok" : "bad") : i === typed.length ? "cur" : "idle";
            return (
              <span
                key={i}
                className={
                  state === "ok"
                    ? "text-[#c5fb56]"
                    : state === "bad"
                      ? "rounded bg-rose-500/30 text-rose-300 underline decoration-wavy"
                      : state === "cur"
                        ? "caret rounded bg-[#c5fb56]/35 text-[var(--text)]"
                        : "text-[var(--muted)]"
                }
              >
                {ch}
              </span>
            );
          })}
        </p>
        <input
          ref={inputRef}
          value={typed}
          onChange={(e) => handleChange(e.target.value)}
          className="absolute inset-0 h-full w-full cursor-text opacity-0"
          aria-label="Typing area — type the displayed text"
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
        />
      </div>
      <p className="text-center text-xs text-[var(--muted)]">Tap the text box to bring up the keyboard on touch devices.</p>
      <div className="flex justify-center gap-2">
        <button className="btn btn-ghost" onClick={() => finish()} disabled={!started}>
          Finish early
        </button>
      </div>
    </div>
  );
}
