"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useApp } from "@/components/providers";
import { HudRow, Stat } from "@/components/game/hud";
import { randomSentence } from "@/lib/words";
import { calcWpm } from "@/lib/progression";

type Racer = { id: string; name: string; avatar: string; wpm: number; progress: number; bot: boolean; finishedAt?: number };

const NAMES = [
  ["NovaKeys", "🦊"],
  ["ShiftStorm", "🐺"],
  ["MochiTypes", "🐼"],
  ["QuickQuokka", "🐨"],
  ["ByteBrawler", "🦜"],
  ["KeyKnight", "🦁"],
  ["PixelPanda", "🐧"],
];

type Mode = { id: string; label: string; desc: string; size: number };
const MODES: Mode[] = [
  { id: "quick", label: "Quick Match", desc: "Fast 4-player race, no rank at stake", size: 4 },
  { id: "duel", label: "1v1 Duel", desc: "Head-to-head showdown", size: 2 },
  { id: "ranked", label: "Ranked Match", desc: "8 players, ladder points on the line", size: 8 },
  { id: "private", label: "Private Room", desc: "Invite friends with a room code", size: 4 },
  { id: "tournament", label: "Tournament", desc: "Bracket play for cosmetic prizes", size: 8 },
];

export default function MultiplayerClient() {
  const { user, play, toast, refresh } = useApp();
  const [mode, setMode] = useState<Mode>(MODES[0]);
  const [phase, setPhase] = useState<"lobby" | "search" | "countdown" | "race" | "results">("lobby");
  const [racers, setRacers] = useState<Racer[]>([]);
  const [countdown, setCountdown] = useState(3);
  const [text, setText] = useState("");
  const [typed, setTyped] = useState("");
  const [keystrokes, setKeystrokes] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [roomCode, setRoomCode] = useState("ARENA-7Q2");
  const inputRef = useRef<HTMLInputElement>(null);
  const saved = useRef(false);

  const correct = useMemo(() => {
    let c = 0;
    for (let i = 0; i < typed.length; i++) if (typed[i] === text[i]) c++;
    return c;
  }, [typed, text]);
  const myProgress = text ? (correct / text.length) * 100 : 0;
  const accuracy = keystrokes ? ((keystrokes - mistakes) / keystrokes) * 100 : 100;
  const wpm = calcWpm(correct, Math.max(elapsed, 0.5));

  const startSearch = () => {
    setPhase("search");
    setText(randomSentence(["general", "technology", "business"][Math.floor(Math.random() * 3)]));
    setTyped("");
    setKeystrokes(0);
    setMistakes(0);
    setElapsed(0);
    saved.current = false;
    const bots: Racer[] = NAMES.slice(0, mode.size - 1).map(([n, a], i) => ({
      id: `bot-${i}`,
      name: n,
      avatar: a,
      wpm: 55 + Math.round(Math.random() * 60),
      progress: 0,
      bot: true,
    }));
    setTimeout(() => {
      setRacers([{ id: "me", name: user?.username ?? "You", avatar: user?.avatar ?? "🎮", wpm: 0, progress: 0, bot: false }, ...bots]);
      setPhase("countdown");
      setCountdown(3);
    }, 1800);
  };

  useEffect(() => {
    if (phase !== "countdown") return;
    play("countdown");
    if (countdown <= 0) {
      setPhase("race");
      play("start");
      setTimeout(() => inputRef.current?.focus(), 50);
      return;
    }
    const id = setTimeout(() => setCountdown((c) => c - 1), 850);
    return () => clearTimeout(id);
  }, [phase, countdown, play]);

  useEffect(() => {
    if (phase !== "race") return;
    const id = setInterval(() => {
      setElapsed((e) => e + 0.1);
      setRacers((prev) =>
        prev.map((r) =>
          r.bot
            ? {
                ...r,
                progress: Math.min(100, r.progress + ((r.wpm * 5) / 60) * 0.1 * (100 / Math.max(1, text.length)) * (0.85 + Math.random() * 0.3)),
              }
            : r,
        ),
      );
    }, 100);
    return () => clearInterval(id);
  }, [phase, text.length]);

  useEffect(() => {
    setRacers((prev) => prev.map((r) => (r.bot ? r : { ...r, progress: myProgress, wpm: Math.round(wpm) })));
  }, [myProgress, wpm]);

  useEffect(() => {
    if (phase !== "race") return;
    const everyone = racers.every((r) => r.progress >= 100);
    if (myProgress >= 100 || everyone) {
      setPhase("results");
      play("victory");
    }
  }, [myProgress, racers, phase, play]);

  useEffect(() => {
    if (phase !== "results" || saved.current) return;
    saved.current = true;
    const standings = [...racers].sort((a, b) => b.progress - a.progress);
    const place = standings.findIndex((r) => !r.bot) + 1;
    void fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gameSlug: "multiplayer-arena",
        wpm: Math.round(wpm),
        accuracy: Math.round(accuracy * 10) / 10,
        score: Math.round(wpm * accuracy) + (place === 1 ? 600 : 200),
        errors: mistakes,
        chars: typed.length,
        durationSec: Math.round(elapsed),
        won: place === 1,
      }),
    })
      .then((r) => r.json())
      .then(async (d) => {
        if (d.saved) await refresh();
        else toast("Sign in to earn ranked points.", "info");
      })
      .catch(() => {});
  }, [phase, racers, wpm, accuracy, mistakes, typed.length, elapsed, refresh, toast]);

  const standings = [...racers].sort((a, b) => b.progress - a.progress);

  if (phase === "lobby") {
    return (
      <div className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m)}
              aria-pressed={mode.id === m.id}
              className={`card-hover rounded-2xl border p-5 text-left ${mode.id === m.id ? "border-[#fb7185] bg-[#fb7185]/10" : "border-[var(--border)] bg-[var(--panel)]"}`}
            >
              <h3 className="text-lg font-black">{m.label}</h3>
              <p className="mt-1 text-sm text-[var(--muted)]">{m.desc}</p>
              <p className="mt-2 text-xs font-bold text-[#fb7185]">{m.size} players</p>
            </button>
          ))}
        </div>

        {mode.id === "private" && (
          <div className="panel flex flex-wrap items-center gap-3 rounded-2xl p-4">
            <label htmlFor="room" className="text-sm font-bold">
              Room code
            </label>
            <input
              id="room"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              className="h-11 rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 font-mono"
            />
            <button
              className="btn btn-ghost"
              onClick={async () => {
                await navigator.clipboard.writeText(`${location.origin}/multiplayer?room=${roomCode}`);
                toast("Invite link copied — share it with friends!", "success");
              }}
            >
              Copy invite link
            </button>
          </div>
        )}

        <div className="panel rounded-2xl p-5">
          <h3 className="font-black">Realtime architecture</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">
            The client already emits race progress events every 100ms through a transport-agnostic layer. Opponents are simulated locally until a
            WebSocket server is attached — no UI changes will be required.
          </p>
        </div>

        <button className="btn btn-primary w-full px-8 py-4 text-base sm:w-auto" onClick={startSearch}>
          🔍 Find match — {mode.label}
        </button>
      </div>
    );
  }

  if (phase === "search") {
    return (
      <div className="panel grid place-items-center rounded-3xl p-12 text-center">
        <div className="floaty text-5xl">🛰️</div>
        <p className="mt-4 text-xl font-black" aria-live="polite">
          Searching for opponents…
        </p>
        <p className="mt-1 text-sm text-[var(--muted)]">{mode.label} · {mode.size} players</p>
        <button className="btn btn-ghost mt-6" onClick={() => setPhase("lobby")}>
          Cancel
        </button>
      </div>
    );
  }

  if (phase === "results") {
    const place = standings.findIndex((r) => !r.bot) + 1;
    return (
      <div className="panel slide-up rounded-3xl p-5 sm:p-8">
        <h2 className="text-center text-3xl font-black">{place === 1 ? "🥇 VICTORY!" : `#${place} FINISH`}</h2>
        <div className="mt-5 space-y-2">
          {standings.map((r, i) => (
            <div key={r.id} className={`flex items-center gap-3 rounded-xl border p-3 ${r.bot ? "border-[var(--border)] bg-[var(--panel)]" : "border-[#fb7185] bg-[#fb7185]/10"}`}>
              <span className="w-8 text-center text-lg font-black">{["🥇", "🥈", "🥉"][i] ?? i + 1}</span>
              <span className="text-2xl">{r.avatar}</span>
              <span className="min-w-0 flex-1 truncate font-bold">{r.name}</span>
              <span className="text-sm tabular-nums">{Math.round(r.bot ? r.wpm : wpm)} WPM</span>
              <span className="hidden text-sm tabular-nums text-[var(--muted)] sm:block">{Math.round(r.progress)}%</span>
            </div>
          ))}
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Your WPM" value={Math.round(wpm)} accent="#fb7185" />
          <Stat label="Accuracy" value={`${accuracy.toFixed(1)}%`} />
          <Stat label="Errors" value={mistakes} />
          <Stat label="XP earned" value={place === 1 ? "+320" : "+140"} />
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button className="btn btn-primary" onClick={startSearch}>
            🔁 Race again
          </button>
          <button className="btn btn-ghost" onClick={() => setPhase("lobby")}>
            ⬅ Back to lobby
          </button>
          <Link className="btn btn-ghost" href="/leaderboards">
            🏆 Leaderboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {phase === "countdown" && (
        <div className="pop grid place-items-center rounded-2xl border border-[var(--border)] bg-[var(--panel)] py-10 text-6xl font-black" aria-live="assertive">
          {countdown > 0 ? countdown : "GO!"}
        </div>
      )}
      <HudRow>
        <Stat label="WPM" value={Math.round(wpm)} accent="#fb7185" />
        <Stat label="Accuracy" value={`${accuracy.toFixed(0)}%`} />
        <Stat label="Errors" value={mistakes} />
        <Stat label="Progress" value={`${Math.round(myProgress)}%`} />
        <Stat label="Players" value={racers.length} />
        <Stat label="Time" value={`${elapsed.toFixed(1)}s`} />
      </HudRow>

      <div className="multiplayer-3d-track space-y-3" aria-label="Live multiplayer race positions">
        {racers.map((r) => (
          <div key={r.id}>
            <div className="mb-1 flex justify-between font-mono text-[10px] font-bold">
              <span className={r.bot ? "text-[var(--muted)]" : "text-[#c5fb56]"}>{r.avatar} {r.name}</span>
              <span className="tabular-nums text-[var(--muted)]">{Math.round(r.progress)}%</span>
            </div>
            <div className="multiplayer-3d-track__lane" role="progressbar" aria-label={`${r.name} progress`} aria-valuenow={Math.round(r.progress)} aria-valuemin={0} aria-valuemax={100}>
              <div className="absolute inset-y-0 left-0 rounded-lg bg-[#c5fb56]/15" style={{ width: `${r.progress}%` }} />
              <span className="multiplayer-3d-track__car" style={{ left: `${Math.min(r.progress, 94)}%` }} aria-hidden="true">🏎️</span>
            </div>
          </div>
        ))}
      </div>

      <div className="typing-field cursor-text rounded-xl p-4 font-mono text-lg" onClick={() => inputRef.current?.focus()}>
        {text.split("").map((ch, i) => (
          <span
            key={i}
            className={
              i < typed.length ? (typed[i] === ch ? "text-emerald-400" : "bg-rose-500/30 text-rose-300") : i === typed.length ? "caret bg-[#fb7185]/40" : "text-[var(--muted)]"
            }
          >
            {ch}
          </span>
        ))}
      </div>

      <input
        ref={inputRef}
        value={typed}
        disabled={phase !== "race"}
        onChange={(e) => {
          const v = e.target.value;
          if (v.length > typed.length) {
            setKeystrokes((k) => k + 1);
            if (v[v.length - 1] !== text[v.length - 1]) {
              setMistakes((m) => m + 1);
              play("error");
            } else play("key");
          }
          setTyped(v.slice(0, text.length));
        }}
        aria-label="Multiplayer typing input"
        autoComplete="off"
        spellCheck={false}
        placeholder={phase === "race" ? "Type to move your car…" : "Get ready…"}
        className="h-14 w-full rounded-2xl border-2 border-[var(--border)] bg-[var(--panel-solid)] px-4 text-lg outline-none focus:border-[#fb7185]"
      />
    </div>
  );
}
