"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { LeaderRow } from "@/lib/data";
import { useApp } from "@/components/providers";

const SCOPES = ["global", "country", "friends", "weekly", "monthly", "alltime"];
const METRICS = [
  { id: "wpm", label: "WPM" },
  { id: "accuracy", label: "Accuracy" },
  { id: "xp", label: "XP" },
  { id: "wins", label: "Wins" },
  { id: "games", label: "Games" },
  { id: "points", label: "Points" },
];

const FLAGS: Record<string, string> = {
  US: "🇺🇸", DE: "🇩🇪", JP: "🇯🇵", AU: "🇦🇺", ES: "🇪🇸", BR: "🇧🇷", GB: "🇬🇧", CN: "🇨🇳", CA: "🇨🇦", IN: "🇮🇳", FR: "🇫🇷", SE: "🇸🇪", KR: "🇰🇷", NL: "🇳🇱", MX: "🇲🇽",
};

export default function LeaderboardClient({ initial }: { initial: LeaderRow[] }) {
  const { user } = useApp();
  const [scope, setScope] = useState("global");
  const [metric, setMetric] = useState("wpm");
  const [rows, setRows] = useState<LeaderRow[]>(initial);
  const [friendIds, setFriendIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetch("/api/friends")
      .then((r) => r.json())
      .then((d) => setFriendIds((d.friends ?? []).map((f: { id: number }) => f.id)))
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ metric, scope });
    if (scope === "country" && user) params.set("country", user.country);
    fetch(`/api/leaderboard?${params}`)
      .then((r) => r.json())
      .then((d) => setRows(d.rows ?? []))
      .finally(() => setLoading(false));
  }, [metric, scope, user]);

  const display = scope === "friends" ? rows.filter((r) => friendIds.includes(r.id) || r.id === user?.id) : rows;

  const value = (r: LeaderRow) =>
    metric === "accuracy"
      ? `${r.accuracy.toFixed(1)}%`
      : metric === "xp"
        ? r.xp.toLocaleString()
        : metric === "wins"
          ? r.gamesWon
          : metric === "games"
            ? r.gamesPlayed
            : metric === "points"
              ? r.score.toLocaleString()
              : `${Math.round(r.bestWpm)} WPM`;

  return (
    <div className="space-y-4">
      <div className="-mx-3 overflow-x-auto px-3 scrollbar-thin sm:mx-0 sm:px-0">
        <div className="flex gap-2">
          {SCOPES.map((s) => (
            <button
              key={s}
              onClick={() => setScope(s)}
              aria-pressed={scope === s}
              className={`whitespace-nowrap rounded-xl border px-4 py-2 text-xs font-bold capitalize ${
                scope === s ? "border-[#facc15] bg-[#facc15]/15 text-[#facc15]" : "border-[var(--border)] bg-[var(--panel)] text-[var(--muted)]"
              }`}
            >
              {s === "alltime" ? "All Time" : s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {METRICS.map((m) => (
          <button
            key={m.id}
            onClick={() => setMetric(m.id)}
            aria-pressed={metric === m.id}
            className={`rounded-lg border px-3 py-1.5 text-xs font-bold ${
              metric === m.id ? "border-[#7c5cff] bg-[#7c5cff]/15 text-[#c4b5fd]" : "border-[var(--border)] bg-[var(--panel)] text-[var(--muted)]"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {loading && <p className="text-sm text-[var(--muted)]">Loading rankings…</p>}
      {scope === "friends" && !user && <p className="panel rounded-xl p-4 text-sm">Sign in to see how you rank against your friends.</p>}
      {scope === "country" && !user && <p className="panel rounded-xl p-4 text-sm">Sign in to see the rankings for your country.</p>}
      {(scope === "weekly" || scope === "monthly") && (
        <p className="font-mono text-[11px] text-[var(--muted)]">
          Showing results earned in the last {scope === "weekly" ? "7" : "30"} days only.
        </p>
      )}

      <ol className="panel overflow-hidden rounded-2xl">
        {display.map((r, i) => {
          const me = user?.id === r.id;
          return (
            <li key={r.id} className={`border-b border-[var(--border)] last:border-0 ${me ? "bg-[#7c5cff]/15" : ""}`}>
              <Link href={`/players/${r.id}`} className="flex items-center gap-3 px-3 py-3 hover:bg-[var(--panel)] sm:px-4">
                <span className="w-8 shrink-0 text-center font-black">{i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}</span>
                <span className="text-2xl" aria-hidden>{r.avatar}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-bold">
                    {r.username} {me && <span className="text-xs text-[#a78bfa]">(you)</span>}
                  </span>
                  <span className="block text-xs text-[var(--muted)]">
                    <span aria-hidden>{FLAGS[r.country] ?? "🏳️"}</span> {r.country} · Lv {r.level} · {r.title}
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block font-black tabular-nums">{value(r)}</span>
                  <span className="block text-[11px] text-[var(--muted)]">{r.gamesWon} wins</span>
                </span>
              </Link>
            </li>
          );
        })}
        {display.length === 0 && !loading && <li className="p-6 text-center text-sm text-[var(--muted)]">No players in this view yet.</li>}
      </ol>
    </div>
  );
}
