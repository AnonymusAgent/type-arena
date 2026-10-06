"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/components/providers";
import { levelFromXp } from "@/lib/progression";

type Item = { id: number; slug: string; name: string; icon: string; rarity: string; price: number; unlockLevel: number; kind: string };

const RARITY: Record<string, string> = { common: "#94a3b8", rare: "#38bdf8", epic: "#a855f7", legendary: "#facc15" };

export default function ShopClient() {
  const { user, toast, refresh } = useApp();
  const [items, setItems] = useState<Item[]>([]);
  const [owned, setOwned] = useState<string[]>([]);
  const [kind, setKind] = useState("all");

  const load = async () => {
    const d = await fetch("/api/shop").then((r) => r.json());
    setItems(d.items ?? []);
    setOwned(d.owned ?? []);
  };
  useEffect(() => {
    void load();
  }, [user]);

  const act = async (slug: string, action: "buy" | "equip") => {
    const res = await fetch("/api/shop", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug, action }) });
    const data = await res.json();
    if (!res.ok) return toast(data.error ?? "Action failed.", "error");
    toast(action === "buy" ? "Item unlocked!" : "Item equipped!", "success");
    await Promise.all([load(), refresh()]);
  };

  const kinds = ["all", ...Array.from(new Set(items.map((i) => i.kind)))];
  const list = items.filter((i) => kind === "all" || i.kind === kind);
  const level = user ? levelFromXp(user.xp).level : 1;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {kinds.map((k) => (
          <button
            key={k}
            onClick={() => setKind(k)}
            aria-pressed={kind === k}
            className={`rounded-xl border px-3 py-2 text-xs font-bold capitalize ${kind === k ? "border-[#facc15] bg-[#facc15]/15 text-[#facc15]" : "border-[var(--border)] bg-[var(--panel)]"}`}
          >
            {k}
          </button>
        ))}
        <span className="ml-auto rounded-xl border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-sm font-bold">🪙 {user?.coins ?? 0}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {list.map((i) => {
          const isOwned = owned.includes(i.slug) || i.price === 0;
          const locked = level < i.unlockLevel;
          return (
            <article key={i.id} className="card-hover rounded-2xl border p-4 text-center" style={{ borderColor: `${RARITY[i.rarity]}66` }}>
              <div className="text-4xl">{i.icon}</div>
              <h3 className="mt-2 text-sm font-black">{i.name}</h3>
              <p className="text-[10px] font-bold uppercase" style={{ color: RARITY[i.rarity] }}>
                {i.rarity} · {i.kind}
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">{locked ? `Unlocks at level ${i.unlockLevel}` : isOwned ? "Owned" : `🪙 ${i.price}`}</p>
              <button
                className={`btn mt-3 w-full text-xs ${isOwned ? "btn-ghost" : "btn-primary"}`}
                disabled={locked}
                onClick={() => act(i.slug, isOwned ? "equip" : "buy")}
              >
                {locked ? "Locked" : isOwned ? "Equip" : "Unlock"}
              </button>
            </article>
          );
        })}
      </div>
      {!user && <p className="panel rounded-xl p-4 text-sm">Sign in to spend coins and equip cosmetics. Cosmetics are visual only — never pay-to-win.</p>}
    </div>
  );
}
