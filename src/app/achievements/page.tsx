import type { Metadata } from "next";
import Link from "next/link";
import { ACHIEVEMENTS, TIER_COLORS } from "@/lib/achievements";
import { getCurrentUser } from "@/lib/auth";
import { getUserAchievements } from "@/lib/data";
import { levelFromXp } from "@/lib/progression";
import PageBanner from "@/components/page-banner";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Achievements — Unlock Typing Milestones",
  description: "Track every Type Arena achievement: speed milestones, accuracy records, marathon play, daily streaks, perfect runs and multiplayer domination.",
  alternates: { canonical: "/achievements" },
};

export default async function AchievementsPage() {
  const user = await getCurrentUser();
  const owned = user ? await getUserAchievements(user.id) : [];
  const stats: Record<string, number> = user
    ? {
        games: user.gamesPlayed,
        bestWpm: user.bestWpm,
        accuracy: user.accuracy,
        wins: user.gamesWon,
        streak: user.streak,
        perfect: 0,
        level: levelFromXp(user.xp).level,
      }
    : {};

  const unlockedCount = owned.filter((o) => o.unlockedAt).length;

  return (
    <div className="mx-auto w-full max-w-6xl px-3 py-8 sm:px-6 sm:py-12">
      <PageBanner label="TROPHY ROOM / MILESTONES" title="Your progress, immortalized." description="Speed, precision and dedication deserve to be celebrated. Earn every badge in the arena." glyph="✦" accent="#facc15" compact />
      <div className="mb-6 mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-xs font-bold text-[var(--muted)]">{user ? `${unlockedCount} / ${ACHIEVEMENTS.length} UNLOCKED` : "SIGN IN TO TRACK YOUR ACHIEVEMENTS"}</p>
        {!user && <Link href="/signup" className="btn btn-primary">Create free account</Link>}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ACHIEVEMENTS.map((a) => {
          const row = owned.find((o) => o.code === a.code);
          const progress = Math.min(a.goal, row?.progress ?? Math.round(stats[a.metric] ?? 0));
          const unlocked = Boolean(row?.unlockedAt);
          const pct = Math.min(100, (progress / a.goal) * 100);
          return (
            <article
              key={a.code}
              className={`card-hover rounded-2xl border p-5 ${unlocked ? "border-amber-400/50 bg-amber-400/10" : "border-[var(--border)] bg-[var(--panel)]"}`}
            >
              <div className="flex items-start gap-3">
                <span className={`text-3xl ${unlocked ? "" : "opacity-40 grayscale"}`} aria-hidden>
                  {a.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="font-black">{a.name}</h2>
                  <p className="text-xs text-[var(--muted)]">{a.description}</p>
                </div>
                <span className="shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase" style={{ background: `${TIER_COLORS[a.tier]}22`, color: TIER_COLORS[a.tier] }}>
                  {a.tier}
                </span>
              </div>
              <div className="mt-3">
                <div className="mb-1 flex justify-between text-[11px] font-bold text-[var(--muted)]">
                  <span>{unlocked ? "Unlocked ✓" : "Locked"}</span>
                  <span>
                    {progress} / {a.goal}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[var(--panel-solid)]" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label={`${a.name} progress`}>
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: TIER_COLORS[a.tier] }} />
                </div>
                <p className="mt-2 text-[11px] text-[var(--muted)]">
                  Reward: +{a.xpReward} XP · +{a.coinReward} 🪙
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
