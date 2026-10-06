import type { Metadata } from "next";
import Link from "next/link";
import { getLeaderboard, getTournaments } from "@/lib/data";
import { GAMES } from "@/lib/games";
import PageBanner from "@/components/page-banner";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tournaments — Daily, Weekend, Weekly & Monthly",
  description: "Compete in Type Arena tournaments for leaderboard glory and exclusive cosmetic rewards.",
};

export default async function TournamentsPage() {
  const [tournaments, board] = await Promise.all([getTournaments(), getLeaderboard("points", "global", 8)]);
  return (
    <div className="mx-auto w-full max-w-6xl px-3 py-8 sm:px-6 sm:py-12">
      <div className="mb-6"><PageBanner label="EVENTS / THE CIRCUIT" title="Enter. Compete. Repeat." description="Daily, weekend, weekly and monthly tournaments. Free entry. Exclusive cosmetic rewards." glyph="🏅" accent="#f9738b" compact /></div>

      <div className="grid gap-4 lg:grid-cols-2">
        {tournaments.map((t) => {
          const game = GAMES.find((g) => g.slug === t.gameSlug);
          return (
            <article key={t.id} className="card-hover panel rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{game?.icon ?? "🏆"}</span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-black">{t.name}</h2>
                  <p className="text-xs uppercase text-[var(--muted)]">
                    {t.period} · {game?.name ?? t.gameSlug}
                  </p>
                </div>
                <span className="rounded-lg bg-emerald-500/15 px-2 py-1 text-[10px] font-bold uppercase text-emerald-400">{t.status}</span>
              </div>
              <p className="mt-3 text-sm">🎁 Prize: {t.prize}</p>
              <p className="text-xs text-[var(--muted)]">
                👥 {t.entrants.toLocaleString()} entrants · ends {new Date(t.endsAt).toLocaleDateString()}
              </p>
              <Link href={`/games/${t.gameSlug}`} className="btn btn-primary mt-4">
                Play qualifier
              </Link>
            </article>
          );
        })}
      </div>

      <section className="panel mt-8 rounded-2xl p-5">
        <h2 className="mb-3 font-black">Current standings (points)</h2>
        <ol className="space-y-2">
          {board.map((r, i) => (
            <li key={r.id} className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--panel)] p-3">
              <span className="w-7 text-center font-black">{i + 1}</span>
              <span className="text-xl">{r.avatar}</span>
              <Link href={`/players/${r.id}`} className="min-w-0 flex-1 truncate font-bold hover:text-[#a78bfa]">
                {r.username}
              </Link>
              <span className="font-black tabular-nums">{r.score.toLocaleString()} pts</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
