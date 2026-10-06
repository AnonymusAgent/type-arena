"use client";

import { useMemo, useState } from "react";
import GameCard from "@/components/game-card";
import { CATEGORIES, DIFFICULTY_ORDER, type GameDef } from "@/lib/games";

export default function GamesBrowser({ games, initialSort = "popular" }: { games: GameDef[]; initialSort?: string }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [sort, setSort] = useState(initialSort);

  const list = useMemo(() => {
    let out = games.filter(
      (g) =>
        (cat === "All" || g.category === cat) &&
        (q.trim() === "" || `${g.name} ${g.description} ${g.category}`.toLowerCase().includes(q.toLowerCase())),
    );
    out = [...out].sort((a, b) => {
      if (sort === "newest") return b.createdOrder - a.createdOrder;
      if (sort === "difficulty") return DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty];
      if (sort === "rating") return b.rating - a.rating;
      if (sort === "name") return a.name.localeCompare(b.name);
      return b.players - a.players;
    });
    return out;
  }, [games, q, cat, sort]);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search games…"
          aria-label="Search games"
          className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 text-sm outline-none sm:max-w-sm"
        />
        <label className="sr-only" htmlFor="sort">
          Sort games
        </label>
        <select
          id="sort"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="h-12 rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 text-sm"
        >
          <option value="popular">Most popular</option>
          <option value="newest">Newest</option>
          <option value="difficulty">Easiest first</option>
          <option value="rating">Highest rated</option>
          <option value="name">A → Z</option>
        </select>
      </div>

      <div className="mt-4 -mx-4 overflow-x-auto px-4 pb-2 scrollbar-thin sm:mx-0 sm:px-0">
        <div className="flex gap-2">
          {["All", ...CATEGORIES].map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              aria-pressed={cat === c}
              className={`whitespace-nowrap rounded-xl border px-3 py-2 text-xs font-bold ${
                cat === c ? "border-[var(--brand)] bg-[#c5fb56]/12 text-[var(--brand)]" : "border-[var(--border)] bg-[var(--panel)] text-[var(--muted)]"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-4 text-xs text-[var(--muted)]">{list.length} games</p>
      <div className="mt-3 grid grid-cols-1 gap-3 min-[430px]:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        {list.map((g) => (
          <GameCard key={g.slug} game={g} />
        ))}
      </div>
      {list.length === 0 && <p className="mt-10 text-center text-[var(--muted)]">No games match that search. Try another keyword or category.</p>}
    </div>
  );
}
