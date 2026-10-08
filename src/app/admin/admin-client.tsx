"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/components/providers";

type Game = { id: number; slug: string; name: string; category: string; difficulty: string; featured: boolean; published: boolean; players: number; rating: number; icon: string };

type Props = {
  stats: { users: number; sessions: number; avgWpm: number; games: number };
  players: { id: number; username: string; email: string; xp: number; bestWpm: number; gamesPlayed: number; isDemo: boolean; country: string }[];
  recent: { id: number; gameSlug: string; wpm: number; accuracy: number; score: number }[];
  achievements: { code: string; name: string; goal: number; metric: string }[];
  challenges: { id: number; title: string; period: string; goal: number }[];
  tournaments: { id: number; name: string; period: string; entrants: number; status: string }[];
};

const TABS = ["Games", "Users", "Scores", "Achievements", "Challenges", "Tournaments"];

export default function AdminClient({ stats, players, recent, achievements, challenges, tournaments }: Props) {
  const { toast, user } = useApp();
  const [tab, setTab] = useState("Games");
  const [games, setGames] = useState<Game[]>([]);
  const [form, setForm] = useState({ slug: "", name: "", category: "Arcade", difficulty: "Medium", engine: "stream", icon: "🎮", description: "" });

  const load = () => fetch("/api/admin/games").then((r) => r.json()).then((d) => setGames(d.games ?? []));
  useEffect(() => {
    void load();
  }, []);

  const guard = () => {
    if (!user?.isAdmin) {
      toast("Admin access required. Log in with the operator account.", "error");
      return false;
    }
    return true;
  };

  const create = async () => {
    if (!guard()) return;
    const res = await fetch("/api/admin/games", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const d = await res.json();
    if (!res.ok) return toast(d.error ?? "Failed", "error");
    toast("Game created.", "success");
    setForm({ ...form, slug: "", name: "" });
    void load();
  };

  const patch = async (id: number, body: Record<string, unknown>) => {
    if (!guard()) return;
    const res = await fetch("/api/admin/games", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...body }) });
    if (!res.ok) return toast("Update failed (admin only).", "error");
    void load();
  };

  const remove = async (id: number) => {
    if (!guard()) return;
    const res = await fetch(`/api/admin/games?id=${id}`, { method: "DELETE" });
    if (!res.ok) return toast("Delete failed (admin only).", "error");
    toast("Game removed.", "success");
    void load();
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Users", stats.users],
          ["Sessions", stats.sessions],
          ["Avg WPM", stats.avgWpm],
          ["Games", stats.games],
        ].map(([l, v]) => (
          <div key={String(l)} className="panel rounded-2xl p-4">
            <p className="text-[10px] font-bold uppercase text-[var(--muted)]">{l}</p>
            <p className="text-2xl font-black">{String(v)}</p>
          </div>
        ))}
      </div>

      <div className="-mx-3 overflow-x-auto px-3 scrollbar-thin sm:mx-0 sm:px-0">
        <div className="flex gap-2">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              aria-pressed={tab === t}
              className={`whitespace-nowrap rounded-xl border px-4 py-2 text-xs font-bold ${tab === t ? "border-[#7c5cff] bg-[#7c5cff]/15 text-[#c4b5fd]" : "border-[var(--border)] bg-[var(--panel)]"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {tab === "Games" && (
        <div className="space-y-4">
          <section className="panel rounded-2xl p-4">
            <h2 className="mb-3 font-black">Add a game</h2>
            <div className="grid gap-2 sm:grid-cols-3">
              {(["slug", "name", "icon", "description"] as const).map((k) => (
                <div key={k}>
                  <label htmlFor={k} className="text-[10px] font-bold uppercase text-[var(--muted)]">
                    {k}
                  </label>
                  <input
                    id={k}
                    value={form[k]}
                    onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                    className="mt-1 h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 text-sm"
                  />
                </div>
              ))}
              <div>
                <label htmlFor="engine" className="text-[10px] font-bold uppercase text-[var(--muted)]">
                  engine
                </label>
                <select id="engine" value={form.engine} onChange={(e) => setForm({ ...form, engine: e.target.value })} className="mt-1 h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 text-sm">
                  {["stream", "falling", "text", "race", "memory"].map((e) => (
                    <option key={e}>{e}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="difficulty" className="text-[10px] font-bold uppercase text-[var(--muted)]">
                  difficulty
                </label>
                <select id="difficulty" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} className="mt-1 h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 text-sm">
                  {["Easy", "Medium", "Hard", "Expert"].map((e) => (
                    <option key={e}>{e}</option>
                  ))}
                </select>
              </div>
            </div>
            <button className="btn btn-primary mt-3" onClick={create}>
              Create game
            </button>
          </section>

          <section className="panel overflow-x-auto rounded-2xl p-4 scrollbar-thin">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-[var(--muted)]">
                  <th className="py-2">Game</th>
                  <th>Category</th>
                  <th>Difficulty</th>
                  <th>Players</th>
                  <th>Featured</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {games.map((g) => (
                  <tr key={g.id} className="border-t border-[var(--border)]">
                    <td className="py-2 font-semibold">
                      {g.icon} {g.name}
                    </td>
                    <td>{g.category}</td>
                    <td>{g.difficulty}</td>
                    <td>{g.players.toLocaleString()}</td>
                    <td>{g.featured ? "⭐" : "—"}</td>
                    <td className="space-x-1 py-2">
                      <button className="btn btn-ghost !min-h-8 text-[11px]" onClick={() => patch(g.id, { featured: !g.featured })}>
                        Toggle featured
                      </button>
                      <button className="btn btn-ghost !min-h-8 text-[11px]" onClick={() => patch(g.id, { published: !g.published })}>
                        {g.published ? "Unpublish" : "Publish"}
                      </button>
                      <button className="btn btn-ghost !min-h-8 text-[11px]" onClick={() => remove(g.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      )}

      {tab === "Users" && (
        <section className="panel overflow-x-auto rounded-2xl p-4 scrollbar-thin">
          <table className="w-full min-w-[620px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-[var(--muted)]">
                <th className="py-2">User</th>
                <th>Email</th>
                <th>XP</th>
                <th>Best WPM</th>
                <th>Games</th>
                <th>Source</th>
                <th>Moderation</th>
              </tr>
            </thead>
            <tbody>
              {players.map((p) => (
                <tr key={p.id} className="border-t border-[var(--border)]">
                  <td className="py-2 font-semibold">{p.username}</td>
                  <td className="text-[var(--muted)]">{p.email}</td>
                  <td>{p.xp.toLocaleString()}</td>
                  <td>{Math.round(p.bestWpm)}</td>
                  <td>{p.gamesPlayed}</td>
                  <td>{p.isDemo ? "demo" : "production"}</td>
                  <td>
                    <button className="btn btn-ghost !min-h-8 text-[11px]" onClick={() => toast(`Flagged ${p.username} for username review.`, "success")}>
                      Flag username
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {tab === "Scores" && (
        <section className="panel rounded-2xl p-4">
          <ul className="space-y-2 text-sm">
            {recent.map((s) => (
              <li key={s.id} className="flex justify-between rounded-xl border border-[var(--border)] bg-[var(--panel)] p-3">
                <span className="font-semibold">{s.gameSlug}</span>
                <span className="text-[var(--muted)]">
                  {Math.round(s.wpm)} WPM · {s.accuracy.toFixed(0)}% · {s.score} pts
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {tab === "Achievements" && (
        <section className="panel rounded-2xl p-4">
          <ul className="grid gap-2 sm:grid-cols-2">
            {achievements.map((a) => (
              <li key={a.code} className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-3 text-sm">
                <strong>{a.name}</strong> — goal {a.goal} ({a.metric})
              </li>
            ))}
          </ul>
        </section>
      )}

      {tab === "Challenges" && (
        <section className="panel rounded-2xl p-4">
          <ul className="space-y-2 text-sm">
            {challenges.map((c) => (
              <li key={c.id} className="flex justify-between rounded-xl border border-[var(--border)] bg-[var(--panel)] p-3">
                <span>
                  <strong>{c.title}</strong> <span className="text-[var(--muted)]">({c.period})</span>
                </span>
                <span className="text-[var(--muted)]">goal {c.goal}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {tab === "Tournaments" && (
        <section className="panel rounded-2xl p-4">
          <ul className="space-y-2 text-sm">
            {tournaments.map((t) => (
              <li key={t.id} className="flex justify-between rounded-xl border border-[var(--border)] bg-[var(--panel)] p-3">
                <span>
                  <strong>{t.name}</strong> <span className="text-[var(--muted)]">({t.period})</span>
                </span>
                <span className="text-[var(--muted)]">
                  {t.entrants.toLocaleString()} entrants · {t.status}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
