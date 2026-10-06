"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Gift } from "lucide-react";
import { useApp } from "@/components/providers";
import type { ChallengeState } from "@/lib/data";

export default function ChallengesPanel({ initial }: { initial: ChallengeState[] }) {
  const { toast, refresh } = useApp();
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [busy, setBusy] = useState<number | null>(null);

  const claim = async (id: number) => {
    setBusy(id);
    try {
      const res = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ challengeId: id }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? "Could not claim that reward.", "error");
      } else {
        toast(`Reward claimed — +${data.reward.xp} XP, +${data.reward.coins} coins`, "success");
        setItems((prev) => prev.map((c) => (c.id === id ? { ...c, claimed: true } : c)));
        await refresh();
        router.refresh();
      }
    } catch {
      toast("Could not reach the arena services.", "error");
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="panel rounded-2xl p-5 lg:col-span-2">
      <h2 className="mb-3 font-black">Challenges</h2>
      <ul className="space-y-2">
        {items.map((c) => {
          const pct = (c.progress / c.goal) * 100;
          return (
            <li key={c.id} className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-[#c5fb56]/15 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--brand)]">{c.period}</span>
                <p className="min-w-0 flex-1 truncate text-sm font-bold">{c.title}</p>
                <span className="font-mono text-[10px] font-bold text-[var(--brand)]">+{c.xpReward} XP · +{c.coinReward}🪙</span>
              </div>
              <p className="mt-1 text-xs text-[var(--muted)]">{c.description}</p>
              <div
                className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--panel-solid)]"
                role="progressbar"
                aria-valuenow={Math.round(pct)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={c.title}
              >
                <div className="h-full bg-[#63e5e4]" style={{ width: `${Math.min(100, pct)}%` }} />
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <p className="font-mono text-[11px] text-[var(--muted)]">
                  {c.progress} / {c.goal}
                </p>
                {c.claimed ? (
                  <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-[11px] font-bold text-emerald-300">
                    <Check size={12} aria-hidden="true" /> Claimed
                  </span>
                ) : c.complete ? (
                  <button className="btn btn-primary !min-h-9 px-3 text-[11px]" disabled={busy === c.id} onClick={() => void claim(c.id)}>
                    <Gift size={13} aria-hidden="true" /> {busy === c.id ? "Claiming…" : "Claim reward"}
                  </button>
                ) : (
                  <span className="font-mono text-[11px] text-[var(--muted)]">In progress</span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
