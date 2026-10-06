"use client";

import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { EngineProps } from "./types";
import { HudRow, ProgressBar, Stat } from "./hud";
import { randomSentence } from "@/lib/words";
import { calcWpm } from "@/lib/progression";
import { useApp } from "../providers";

type Bot = { name: string; icon: string; wpm: number; progress: number; color: string };

const BOT_POOL: Bot[] = [
  { name: "NovaKeys", icon: "🏎️", wpm: 92, progress: 0, color: "#f9738b" },
  { name: "ShiftStorm", icon: "🏍️", wpm: 78, progress: 0, color: "#63e5e4" },
  { name: "MochiTypes", icon: "🚙", wpm: 65, progress: 0, color: "#a78bfa" },
  { name: "ByteBrawler", icon: "🚤", wpm: 85, progress: 0, color: "#fbbf24" },
];

export default function RaceEngine({ config, onFinish }: EngineProps) {
  const { play, user } = useApp();
  const opponents = Number(config.opponents ?? 3);
  const [text] = useState(() => randomSentence("general"));
  const [typed, setTyped] = useState("");
  const [keystrokes, setKeystrokes] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [started, setStarted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [bots, setBots] = useState<Bot[]>(() => BOT_POOL.slice(0, opponents).map((b) => ({ ...b, wpm: b.wpm + Math.round(Math.random() * 20 - 10) })));
  const inputRef = useRef<HTMLInputElement>(null);
  const done = useRef(false);

  useEffect(() => {
    if (countdown <= 0) {
      setStarted(true);
      play("start");
      inputRef.current?.focus();
      return;
    }
    play("countdown");
    const id = setTimeout(() => setCountdown((c) => c - 1), 900);
    return () => clearTimeout(id);
  }, [countdown, play]);

  useEffect(() => {
    if (!started) return;
    const id = setInterval(() => {
      setElapsed((e) => e + 0.1);
      setBots((prev) => prev.map((b) => ({ ...b, progress: Math.min(100, b.progress + ((b.wpm * 5) / 60) * 0.1 * (100 / text.length) * (0.85 + Math.random() * 0.3)) })));
    }, 100);
    return () => clearInterval(id);
  }, [started, text.length]);

  const correct = useMemo(() => {
    let c = 0;
    for (let i = 0; i < typed.length; i++) if (typed[i] === text[i]) c++;
    return c;
  }, [typed, text]);

  const progress = (correct / text.length) * 100;
  const accuracy = keystrokes ? ((keystrokes - mistakes) / keystrokes) * 100 : 100;
  const wpm = calcWpm(correct, Math.max(elapsed, 0.5));
  const multiplier = 1 + Math.min(1.5, Math.floor(combo / 10) * 0.25);

  useEffect(() => {
    if (!started || done.current) return;
    const finishedBots = bots.filter((b) => b.progress >= 100).length;
    if (progress >= 100 || (finishedBots === bots.length && bots.length > 0 && progress < 100 && elapsed > 90)) {
      done.current = true;
      const place = finishedBots + 1;
      const acc = Math.round(accuracy * 10) / 10;
      const finalWpm = Math.round(wpm);
      play(place === 1 ? "victory" : "finish");
      onFinish({ wpm: finalWpm, accuracy: acc, score: Math.round(finalWpm * acc * multiplier) + (place === 1 ? 500 : place === 2 ? 250 : 100), errors: mistakes, chars: typed.length, durationSec: Math.round(elapsed), won: place === 1, extra: { place, bestCombo, multiplier: multiplier.toFixed(2), opponents: bots.length } });
    }
  }, [progress, bots, started, accuracy, wpm, mistakes, typed.length, elapsed, multiplier, bestCombo, onFinish, play]);

  const handle = (value: string) => {
    if (!started || done.current) return;
    if (value.length > typed.length) {
      const idx = value.length - 1;
      setKeystrokes((k) => k + 1);
      if (value[idx] === text[idx]) {
        setCombo((c) => { const n = c + 1; setBestCombo((b) => Math.max(b, n)); if (n % 10 === 0) play("combo"); return n; });
        play("key");
      } else { setMistakes((m) => m + 1); setCombo(0); play("error"); }
    }
    setTyped(value.slice(0, text.length));
  };

  const myCar = user?.equippedVehicle === "spaceship" ? "🚀" : user?.equippedVehicle === "motorcycle" ? "🏍️" : "🏎️";
  const racers = [{ name: user?.username ?? "YOU", icon: myCar, progress, color: "#c5fb56" }, ...bots];

  return (
    <div className="space-y-4">
      <HudRow>
        <Stat label="WPM" value={Math.round(wpm)} accent="#c5fb56" />
        <Stat label="Accuracy" value={`${accuracy.toFixed(0)}%`} />
        <Stat label="Errors" value={mistakes} />
        <Stat label="Boost" value={`×${multiplier.toFixed(2)}`} accent="#63e5e4" />
        <Stat label="Combo" value={combo} />
        <Stat label="Time" value={`${elapsed.toFixed(1)}s`} />
      </HudRow>

      <div className="race-arena" role="img" aria-label={`3D race track. You are ${Math.round(progress)} percent through the race.`}>
        <div className="race-arena__floor" aria-hidden="true" />
        <div className="race-arena__gate" aria-hidden="true" />
        <div className="race-arena__header" aria-hidden="true"><span>TYPE ARENA // CIRCUIT 01</span><span>{started ? "● RACE LIVE" : "● STARTING GRID"}</span></div>
        {racers.map((racer, i) => <div key={racer.name} className="race-arena__lane" style={{ "--lane": i } as CSSProperties} aria-hidden="true"><span className="race-arena__lane-name">{i === 0 ? "YOU" : racer.name}</span><span className="race-arena__car" style={{ left: `${Math.min(95, Math.max(2, racer.progress * .95))}%`, "--car-color": racer.color } as CSSProperties}>{racer.icon}</span></div>)}
        {countdown > 0 && <div className="race-arena__countdown" aria-live="assertive">{countdown}</div>}
      </div>

      <div className="typing-field cursor-text rounded-xl p-4 text-base leading-relaxed sm:p-5 sm:text-lg" onClick={() => inputRef.current?.focus()}>
        <p className="break-words font-mono">{text.split("").map((ch, i) => <span key={i} className={i < typed.length ? typed[i] === ch ? "text-[#c5fb56]" : "bg-rose-500/30 text-rose-300" : i === typed.length ? "caret bg-[#c5fb56]/35" : "text-[var(--muted)]"}>{ch}</span>)}</p>
      </div>
      <input ref={inputRef} value={typed} onChange={(e) => handle(e.target.value)} placeholder={started ? "Type here to move your car…" : "Race starts in a moment…"} aria-label="Race typing input" autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false} className="h-14 w-full rounded-xl border border-[var(--border)] bg-[var(--panel-solid)] px-4 font-mono text-base outline-none focus:border-[var(--brand)]" />
      <ProgressBar value={progress} color="#c5fb56" label="Your race progress" />

      <div className="race-telemetry" aria-label="Racer progress">
        {racers.map((racer, i) => <div key={racer.name} className="race-telemetry__row"><span className="truncate font-semibold" style={{ color: i === 0 ? "var(--brand)" : "var(--muted)" }}>{i === 0 ? "YOU" : racer.name}</span><div className="race-telemetry__bar" role="progressbar" aria-label={`${racer.name} progress`} aria-valuenow={Math.round(racer.progress)} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${racer.progress}%`, background: racer.color, boxShadow: `0 0 10px ${racer.color}` }} /></div><span className="text-right font-mono text-[var(--muted)]">{Math.round(racer.progress)}%</span></div>)}
      </div>
    </div>
  );
}
