import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getChallengeStates, getFriends, getRecentSessions, getUserAchievements, getUserRank } from "@/lib/data";
import ChallengesPanel from "./challenges-panel";
import { levelFromXp } from "@/lib/progression";
import { GAMES } from "@/lib/games";
import { ACHIEVEMENTS } from "@/lib/achievements";
import XpBar from "@/components/xp-bar";
import GameCard from "@/components/game-card";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Dashboard", description: "Your personalised Type Arena dashboard: XP, streak, challenges, recommended practice and recent games." };

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-20 text-center">
        <h1 className="text-3xl font-black">Dashboard</h1>
        <p className="mt-3 text-sm text-[var(--muted)]">Log in to unlock your personalised dashboard with challenges, streaks and recommendations.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/login" className="btn btn-primary">
            Login
          </Link>
          <Link href="/signup" className="btn btn-ghost">
            Sign Up
          </Link>
        </div>
      </div>
    );
  }

  const [sessions, challengeStates, friends, achvs, rank] = await Promise.all([
    getRecentSessions(user.id, 6),
    getChallengeStates(user.id),
    getFriends(user.id),
    getUserAchievements(user.id),
    getUserRank(user.id),
  ]);

  const lvl = levelFromXp(user.xp);
  const lastGame = GAMES.find((g) => g.slug === sessions[0]?.gameSlug) ?? GAMES[0];
  const recommended = user.accuracy < 92 ? "accuracy" : user.bestWpm < 60 ? "speed" : "symbols";

  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-8 sm:px-6 sm:py-12">
      <section className="panel rounded-3xl p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black sm:text-3xl">
              Welcome back, {user.avatar} {user.username}
            </h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Global rank #{rank} · {lvl.title}
            </p>
          </div>
          <div className="flex gap-3">
            <div className="rounded-2xl border border-orange-500/40 bg-orange-500/10 px-4 py-2 text-center">
              <div className="text-xl font-black">🔥 {user.streak}</div>
              <div className="text-[10px] font-bold uppercase text-[var(--muted)]">Day streak</div>
            </div>
            <div className="rounded-2xl border border-amber-400/40 bg-amber-400/10 px-4 py-2 text-center">
              <div className="text-xl font-black">🪙 {user.coins}</div>
              <div className="text-[10px] font-bold uppercase text-[var(--muted)]">Coins</div>
            </div>
          </div>
        </div>
        <div className="mt-5 max-w-xl">
          <XpBar xp={user.xp} />
        </div>
        <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["Best WPM", Math.round(user.bestWpm)],
            ["Avg WPM", Math.round(user.avgWpm)],
            ["Accuracy", `${user.accuracy.toFixed(1)}%`],
            ["Games played", user.gamesPlayed],
          ].map(([l, v]) => (
            <div key={String(l)} className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2">
              <dt className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">{l}</dt>
              <dd className="text-xl font-black">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <ChallengesPanel initial={challengeStates} />

        <div className="space-y-5">
          <section className="panel rounded-2xl p-5">
            <h2 className="mb-2 font-black">Continue playing</h2>
            <GameCard game={lastGame} compact />
          </section>
          <section className="panel rounded-2xl p-5">
            <h2 className="mb-2 font-black">Recommended practice</h2>
            <p className="text-sm text-[var(--muted)]">
              {recommended === "accuracy"
                ? "Your accuracy is below 92% — run the Common Words drill slowly and focus on clean keystrokes."
                : recommended === "speed"
                  ? "Push your top speed with 15-second Speed Sprints and the Home Row drill."
                  : "Speed and accuracy look great — level up your symbol and number rows next."}
            </p>
            <Link href="/practice" className="btn btn-primary mt-3 w-full text-sm">
              Open practice mode
            </Link>
          </section>
          <section className="panel rounded-2xl p-5">
            <h2 className="mb-2 font-black">Friends online</h2>
            <ul className="space-y-2">
              {friends.slice(0, 5).map((f) => (
                <li key={f.id} className="flex items-center gap-2 text-sm">
                  <span>{f.avatar}</span>
                  <Link href={`/players/${f.id}`} className="min-w-0 flex-1 truncate font-semibold hover:text-[#a78bfa]">
                    {f.username}
                  </Link>
                  <span className="h-2 w-2 rounded-full bg-emerald-400" aria-label="online" />
                </li>
              ))}
              {friends.length === 0 && <li className="text-sm text-[var(--muted)]">Add friends from your profile page.</li>}
            </ul>
          </section>
        </div>
      </div>

      <section className="panel mt-5 rounded-2xl p-5">
        <h2 className="mb-3 font-black">Recent games</h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {sessions.map((s) => (
            <div key={s.id} className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--panel)] p-3">
              <span className="text-2xl">{GAMES.find((g) => g.slug === s.gameSlug)?.icon ?? "🎮"}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{GAMES.find((g) => g.slug === s.gameSlug)?.name ?? s.gameSlug}</p>
                <p className="text-xs text-[var(--muted)]">
                  {Math.round(s.wpm)} WPM · {s.accuracy.toFixed(0)}% · +{s.xpEarned} XP
                </p>
              </div>
            </div>
          ))}
          {sessions.length === 0 && <p className="text-sm text-[var(--muted)]">No games yet — jump into the arena!</p>}
        </div>
      </section>

      <section className="panel mt-5 rounded-2xl p-5">
        <h2 className="mb-3 font-black">Recent achievements</h2>
        <div className="flex flex-wrap gap-2">
          {achvs
            .filter((a) => a.unlockedAt)
            .slice(0, 8)
            .map((a) => {
              const def = ACHIEVEMENTS.find((x) => x.code === a.code);
              return (
                <span key={a.id} className="rounded-xl border border-amber-400/50 bg-amber-400/10 px-3 py-2 text-xs font-bold">
                  {def?.icon} {def?.name}
                </span>
              );
            })}
          {achvs.filter((a) => a.unlockedAt).length === 0 && <p className="text-sm text-[var(--muted)]">Play a game to unlock your first achievement.</p>}
        </div>
      </section>
    </div>
  );
}
