import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getFriends, getRecentSessions, getUserAchievements, getUserRank } from "@/lib/data";
import { levelFromXp } from "@/lib/progression";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { GAMES } from "@/lib/games";
import Sparkline from "@/components/sparkline";
import XpBar from "@/components/xp-bar";
import FriendsPanel from "./friends-panel";
import ProfileSettings from "./profile-settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your Profile — Stats, Achievements & Friends",
  description: "View your typing statistics, WPM history, achievements, friends, streak and progression on Type Arena.",
};

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-20 text-center">
        <h1 className="text-3xl font-black">Your Profile</h1>
        <p className="mt-3 text-sm text-[var(--muted)]">Sign in to see your statistics, achievements, friends and progression.</p>
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

  const [sessions, achvs, friends, rank] = await Promise.all([
    getRecentSessions(user.id, 20),
    getUserAchievements(user.id),
    getFriends(user.id),
    getUserRank(user.id),
  ]);
  const lvl = levelFromXp(user.xp);
  const history = [...sessions].reverse();
  const favourite =
    Object.entries(sessions.reduce<Record<string, number>>((acc, s) => ({ ...acc, [s.gameSlug]: (acc[s.gameSlug] ?? 0) + 1 }), {})).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "type-race";

  return (
    <div className="mx-auto w-full max-w-6xl px-3 py-8 sm:px-6 sm:py-12">
      <section className="panel rounded-3xl p-5 sm:p-7">
        <div className="flex flex-wrap items-center gap-4">
          <span className="grid h-20 w-20 place-items-center rounded-2xl border-2 text-4xl" style={{ borderColor: lvl.color }}>
            {user.avatar}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-black sm:text-3xl">{user.username}</h1>
            <p className="text-sm text-[var(--muted)]">
              {user.title} · {user.country} · Global rank #{rank}
            </p>
            <div className="mt-3 max-w-md">
              <XpBar xp={user.xp} />
            </div>
          </div>
          <div className="rounded-2xl border border-orange-500/40 bg-orange-500/10 px-4 py-3 text-center">
            <div className="text-2xl font-black">🔥 {user.streak}</div>
            <div className="text-[11px] font-bold uppercase text-[var(--muted)]">Day streak</div>
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {[
            ["Best WPM", Math.round(user.bestWpm)],
            ["Avg WPM", Math.round(user.avgWpm)],
            ["Accuracy", `${user.accuracy.toFixed(1)}%`],
            ["Games", user.gamesPlayed],
            ["Wins", user.gamesWon],
            ["Coins", `🪙 ${user.coins}`],
            ["Favourite", GAMES.find((g) => g.slug === favourite)?.name ?? "Type Race"],
          ].map(([l, v]) => (
            <div key={String(l)} className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2">
              <dt className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">{l}</dt>
              <dd className="truncate text-lg font-black">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <section className="panel rounded-2xl p-5">
          <h2 className="mb-3 font-black">WPM history</h2>
          <Sparkline data={history.map((s) => s.wpm)} label="WPM over recent games" />
        </section>
        <section className="panel rounded-2xl p-5">
          <h2 className="mb-3 font-black">Accuracy history</h2>
          <Sparkline data={history.map((s) => s.accuracy)} color="#22c55e" label="Accuracy over recent games" />
        </section>
      </div>

      <section className="panel mt-5 rounded-2xl p-5">
        <h2 className="mb-3 font-black">Recent games</h2>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-[var(--muted)]">
                <th className="py-2">Game</th>
                <th>WPM</th>
                <th>Accuracy</th>
                <th>Score</th>
                <th>XP</th>
                <th>When</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id} className="border-t border-[var(--border)]">
                  <td className="py-2 font-semibold">{GAMES.find((g) => g.slug === s.gameSlug)?.name ?? s.gameSlug}</td>
                  <td>{Math.round(s.wpm)}</td>
                  <td>{s.accuracy.toFixed(1)}%</td>
                  <td>{s.score}</td>
                  <td className="text-[#a78bfa]">+{s.xpEarned}</td>
                  <td className="text-[var(--muted)]">{new Date(s.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {sessions.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-[var(--muted)]">
                    No games yet — <Link className="text-[#a78bfa]" href="/games">pick one</Link>.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <section className="panel rounded-2xl p-5">
          <h2 className="mb-3 font-black">Achievements</h2>
          <div className="flex flex-wrap gap-2">
            {ACHIEVEMENTS.map((a) => {
              const unlocked = achvs.find((x) => x.code === a.code)?.unlockedAt;
              return (
                <span
                  key={a.code}
                  title={`${a.name} — ${a.description}`}
                  className={`rounded-xl border px-3 py-2 text-sm ${unlocked ? "border-amber-400/60 bg-amber-400/10" : "border-[var(--border)] opacity-50"}`}
                >
                  {a.icon} <span className="text-xs font-bold">{a.name}</span>
                </span>
              );
            })}
          </div>
          <Link href="/achievements" className="btn btn-ghost mt-4 text-sm">
            View all achievements
          </Link>
        </section>
        <FriendsPanel initial={friends} />
      </div>

      <ProfileSettings user={{ username: user.username, avatar: user.avatar, country: user.country }} />
    </div>
  );
}
