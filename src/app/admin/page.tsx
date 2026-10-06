import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { desc, sql } from "drizzle-orm";
import { db } from "@/db";
import { achievements, challenges, gameSessions, tournaments, users } from "@/db/schema";
import { ensureSeeded } from "@/lib/data";
import { getAdminUser } from "@/lib/admin";
import { levelFromXp } from "@/lib/progression";
import AdminClient from "./admin-client";
import AdminBar from "./admin-bar";

export const dynamic = "force-dynamic";

// Deliberately generic: this metadata is also emitted on the redirect body for
// unauthenticated visitors, so it must not describe what lives behind the gate.
export const metadata: Metadata = {
  title: "Restricted",
  description: "This area requires authorisation.",
  robots: { index: false, follow: false },
};

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  void searchParams;
  await ensureSeeded();

  // Authoritative guard: resolves the session against the database and requires isAdmin.
  const admin = await getAdminUser();
  if (!admin) redirect("/admin/login?next=/admin");

  const [[userCount], [sessionStats], players, recent, achs, chals, tours] = await Promise.all([
    db.select({ c: sql<number>`count(*)::int` }).from(users),
    db.select({ c: sql<number>`count(*)::int`, avg: sql<number>`coalesce(avg(wpm),0)::float` }).from(gameSessions),
    db.select().from(users).orderBy(desc(users.xp)).limit(40),
    db.select().from(gameSessions).orderBy(desc(gameSessions.createdAt)).limit(25),
    db.select().from(achievements),
    db.select().from(challenges),
    db.select().from(tournaments),
  ]);

  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-6 sm:px-6 sm:py-10">
      <AdminBar admin={{ username: admin.username, avatar: admin.avatar, level: levelFromXp(admin.xp).level }} />
      <div className="mt-6">
        <AdminClient
          stats={{ users: userCount?.c ?? 0, sessions: sessionStats?.c ?? 0, avgWpm: Math.round(sessionStats?.avg ?? 0), games: 16 }}
          players={players.map((p) => ({ id: p.id, username: p.username, email: p.email, xp: p.xp, bestWpm: p.bestWpm, gamesPlayed: p.gamesPlayed, isDemo: p.isDemo, country: p.country }))}
          recent={recent.map((r) => ({ id: r.id, gameSlug: r.gameSlug, wpm: r.wpm, accuracy: r.accuracy, score: r.score }))}
          achievements={achs.map((a) => ({ code: a.code, name: a.name, goal: a.goal, metric: a.metric }))}
          challenges={chals.map((c) => ({ id: c.id, title: c.title, period: c.period, goal: c.goal }))}
          tournaments={tours.map((t) => ({ id: t.id, name: t.name, period: t.period, entrants: t.entrants, status: t.status }))}
        />
      </div>
      <p className="mt-8 text-center font-mono text-[10px] text-[var(--muted)]">
        Restricted system · All actions are performed as <strong>{admin.username}</strong> · <Link href="/" className="text-[var(--brand)] hover:underline">Return to the arena</Link>
      </p>
    </div>
  );
}
