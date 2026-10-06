"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import type { GameDef } from "@/lib/games";
import GameArtwork from "@/components/game-artwork";
import type { GameResult } from "./types";
import { useApp } from "../providers";
import { Stat } from "./hud";
import { AchievementDef } from "@/lib/achievements";

const RaceEngine = dynamic(() => import("./race-engine"), { ssr: false });
const StreamEngine = dynamic(() => import("./stream-engine"), { ssr: false });
const FallingEngine = dynamic(() => import("./falling-engine"), { ssr: false });
const TextEngine = dynamic(() => import("./text-engine"), { ssr: false });
const MemoryEngine = dynamic(() => import("./memory-engine"), { ssr: false });

export default function GameRunner({ game }: { game: GameDef }) {
  const { user, play, toast, refresh } = useApp();
  const [phase, setPhase] = useState<"idle" | "playing" | "done">("idle");
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<GameResult | null>(null);
  const [rewards, setRewards] = useState<{ xp: number; coins: number } | null>(null);
  const [saved, setSaved] = useState(false);
  const [unlocked, setUnlocked] = useState<AchievementDef[]>([]);
  const [best, setBest] = useState<number>(0);

  const onFinish = useCallback(
    async (r: GameResult) => {
      setResult(r);
      setPhase("done");
      setBest((b) => Math.max(b, r.score));
      try {
        const res = await fetch("/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...r, gameSlug: game.slug }),
        });
        const data = await res.json();
        setRewards(data.rewards);
        setSaved(Boolean(data.saved));
        setUnlocked((data.unlocked ?? []).filter(Boolean));
        if (data.saved) {
          await refresh();
          if ((data.unlocked ?? []).length) play("achievement");
        } else {
          toast("Playing as guest — sign up to save XP, coins and leaderboard progress.", "info");
        }
        if (typeof window !== "undefined") {
          const key = `ta_best_${game.slug}`;
          const prev = Number(localStorage.getItem(key) ?? 0);
          if (r.score > prev) {
            localStorage.setItem(key, String(r.score));
            toast("New personal best!", "success");
          }
        }
      } catch {
        toast("Could not save your result.", "error");
      }
    },
    [game.slug, play, refresh, toast],
  );

  const start = () => {
    setAttempt((a) => a + 1);
    setResult(null);
    setRewards(null);
    setSaved(false);
    setUnlocked([]);
    setPhase("playing");
    play("start");
  };

  if (phase === "idle") {
    return (
      <div className="game-intro grid lg:grid-cols-[.92fr_1.08fr]">
        <div className="game-intro__art"><GameArtwork game={game} large /></div>
        <div className="game-intro__body flex flex-col justify-center">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[.12em] text-[var(--brand)]">{`// ${game.category} / ${game.difficulty}`}</span>
          <h2 className="mt-2 font-bold">Ready for {game.name}?</h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{game.longDescription}</p>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {game.instructions.map((instruction) => <div key={instruction} className="game-intro__check">{instruction}</div>)}
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <button className="btn btn-primary px-8 text-sm" onClick={start}>▶ START GAME</button>
            {!user && <p className="max-w-[200px] text-xs text-[var(--muted)]">Playing as guest? Sign in to save rewards.</p>}
          </div>
        </div>
      </div>
    );
  }

  if (phase === "done" && result) {
    return (
      <div className="panel slide-up rounded-3xl p-5 sm:p-8">
        <h2 className="text-center text-3xl font-black">{result.won ? "🏆 VICTORY!" : "WELL DONE!"}</h2>
        <p className="mt-1 text-center text-sm text-[var(--muted)]">{game.name} run complete</p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="WPM" value={result.wpm} accent={game.accent} />
          <Stat label="Accuracy" value={`${result.accuracy}%`} />
          <Stat label="Score" value={result.score} />
          <Stat label="Errors" value={result.errors} />
          <Stat label="Characters" value={result.chars} />
          <Stat label="Duration" value={`${result.durationSec}s`} />
          {Object.entries(result.extra ?? {}).slice(0, 6).map(([k, v]) => (
            <Stat key={k} label={k.replace(/([A-Z])/g, " $1")} value={v} />
          ))}
        </div>

        {rewards && (
          <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 text-center">
            {saved ? (
              <div className="flex flex-wrap items-center justify-center gap-3">
                <span className="pop text-lg font-black text-[#a78bfa]">+{rewards.xp} XP</span>
                <span className="pop text-lg font-black text-amber-300">+{rewards.coins} 🪙</span>
                {best > 0 && <span className="text-sm text-[var(--muted)]">Session best score: {best}</span>}
              </div>
            ) : (
              // Guests earn nothing on the server, so never imply the rewards were banked.
              <>
                <p className="text-sm font-bold">
                  This run was worth <span className="text-[#a78bfa]">{rewards.xp} XP</span> and <span className="text-amber-300">{rewards.coins} 🪙</span>
                </p>
                <p className="mt-1 text-xs text-[var(--muted)]">Playing as a guest — create a free account to keep rewards, achievements and leaderboard rank.</p>
                <Link href="/signup" className="btn btn-primary mt-3 text-sm">
                  Create free account
                </Link>
              </>
            )}
          </div>
        )}

        {unlocked.length > 0 && (
          <div className="mt-4 space-y-2">
            {unlocked.map((a) => (
              <div key={a.code} className="pop rounded-2xl border border-amber-400/50 bg-amber-400/10 p-3 text-center">
                <p className="font-black">🏅 Achievement unlocked — {a.name}</p>
                <p className="text-xs text-[var(--muted)]">{a.description}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button className="btn btn-primary" onClick={start}>
            🔁 Retry
          </button>
          <Link className="btn btn-ghost" href="/games">
            🎮 Other games
          </Link>
          <Link className="btn btn-ghost" href="/leaderboards">
            🏆 Leaderboard
          </Link>
          <button
            className="btn btn-ghost"
            onClick={async () => {
              const text = `I scored ${result.score} (${result.wpm} WPM, ${result.accuracy}% accuracy) in ${game.name} on Type Arena!`;
              if (navigator.share) await navigator.share({ title: "Type Arena", text }).catch(() => {});
              else {
                await navigator.clipboard.writeText(text);
                toast("Result copied to clipboard!", "success");
              }
            }}
          >
            📣 Share result
          </button>
          <Link className="btn btn-ghost" href="/multiplayer">
            ⚔️ Challenge a friend
          </Link>
        </div>
      </div>
    );
  }

  const Engine =
    game.engine === "race"
      ? RaceEngine
      : game.engine === "falling"
        ? FallingEngine
        : game.engine === "text"
          ? TextEngine
          : game.engine === "memory"
            ? MemoryEngine
            : StreamEngine;

  return (
    <div className="game-playing panel rounded-2xl p-3 sm:p-5">
      <Engine key={attempt} config={game.config} onFinish={onFinish} />
    </div>
  );
}
