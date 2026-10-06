import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { ensureSeeded, getRecentSessions, getUserAchievements, getUserRank } from "@/lib/data";
import { levelFromXp } from "@/lib/progression";
import { ACHIEVEMENTS } from "@/lib/achievements";
import Sparkline from "@/components/sparkline";
import XpBar from "@/components/xp-bar";
import { GAMES } from "@/lib/games";

export const dynamic = "force-dynamic";

async function load(id: number) {
  await ensureSeeded();
  const [u] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return u ?? null;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const u = await load(Number(id));
  return u
    ? { title: `${u.username} — Player Profile`, description: `${u.username} has a best speed of ${Math.round(u.bestWpm)} WPM across ${u.gamesPlayed} games on Type Arena.` }
    : { title: "Player not found" };
}

export default async function PlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await load(Number(id));
  if (!user) notFound();
  const [sessions, achvs, rank] = await Promise.all([getRecentSessions(user.id, 15), getUserAchievements(user.id), getUserRank(user.id)]);
  const lvl = levelFromXp(user.xp);

  return (
    <div className="mx-auto w-full max-w-5xl px-3 py-8 sm:px-6 sm:py-12">
      <section className="panel rounded-3xl p-5 sm:p-7">
        <div className="flex flex-wrap items-center gap-4">
          <span className="grid h-20 w-20 place-items-center rounded-2xl border-2 text-4xl" style={{ borderColor: lvl.color }}>
            {user.avatar}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-black sm:text-3xl">{user.username}</h1>
            <p className="text-sm text-[var(--muted)]">
              {user.title} · {user.country} · Rank #{rank}
            </p>
            <div className="mt-3 max-w-md">
              <XpBar xp={user.xp} />
            </div>
          </div>
          <Link href="/multiplayer" className="btn btn-primary">
            ⚔️ Challenge player
          </Link>
        </div>
        <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-6">
          {[
            ["Best WPM", Math.round(user.bestWpm)],
            ["Avg WPM", Math.round(user.avgWpm)],
            ["Accuracy", `${user.accuracy.toFixed(1)}%`],
            ["Games", user.gamesPlayed],
            ["Wins", user.gamesWon],
            ["Streak", `🔥 ${user.streak}`],
          ].map(([l, v]) => (
            <div key={String(l)} className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2">
              <dt className="text-[10px] font-bold uppercase text-[var(--muted)]">{l}</dt>
              <dd className="text-lg font-black">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <section className="panel rounded-2xl p-5">
          <h2 className="mb-3 font-black">WPM trend</h2>
          <Sparkline data={[...sessions].reverse().map((s) => s.wpm)} label="WPM trend" />
        </section>
        <section className="panel rounded-2xl p-5">
          <h2 className="mb-3 font-black">Achievements</h2>
          <div className="flex flex-wrap gap-2">
            {achvs.filter((a) => a.unlockedAt).map((a) => {
              const def = ACHIEVEMENTS.find((x) => x.code === a.code);
              return (
                <span key={a.id} className="rounded-xl border border-amber-400/50 bg-amber-400/10 px-3 py-2 text-xs font-bold">
                  {def?.icon} {def?.name}
                </span>
              );
            })}
            {achvs.filter((a) => a.unlockedAt).length === 0 && <p className="text-sm text-[var(--muted)]">No achievements unlocked yet.</p>}
          </div>
        </section>
      </div>

      <section className="panel mt-5 rounded-2xl p-5">
        <h2 className="mb-3 font-black">Recent games</h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {sessions.map((s) => (
            <li key={s.id} className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--panel)] p-3 text-sm">
              <span className="text-xl">{GAMES.find((g) => g.slug === s.gameSlug)?.icon ?? "🎮"}</span>
              <span className="min-w-0 flex-1 truncate font-semibold">{GAMES.find((g) => g.slug === s.gameSlug)?.name ?? s.gameSlug}</span>
              <span className="text-[var(--muted)]">
                {Math.round(s.wpm)} WPM · {s.accuracy.toFixed(0)}%
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
