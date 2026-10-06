"use client";

import Link from "next/link";
import { useState } from "react";
import { useApp } from "@/components/providers";

type Friend = { id: number; username: string; avatar: string; bestWpm: number; accuracy: number; country: string };

export default function FriendsPanel({ initial }: { initial: Friend[] }) {
  const { toast } = useApp();
  const [friends, setFriends] = useState<Friend[]>(initial);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const act = async (body: Record<string, unknown>) => {
    setBusy(true);
    const res = await fetch("/api/friends", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return toast(data.error ?? "Something went wrong.", "error");
    const list = await fetch("/api/friends").then((r) => r.json());
    setFriends(list.friends ?? []);
    toast(data.message ?? "Done!", "success");
  };

  return (
    <section className="panel rounded-2xl p-5">
      <h2 className="mb-3 font-black">Friends</h2>
      <div className="flex gap-2">
        <label className="sr-only" htmlFor="friend">
          Friend username
        </label>
        <input
          id="friend"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Add by username (try NovaKeys)"
          className="h-11 min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 text-sm outline-none"
        />
        <button className="btn btn-primary text-sm" disabled={busy || !name.trim()} onClick={() => act({ username: name.trim() })}>
          Add
        </button>
      </div>
      <ul className="mt-4 space-y-2">
        {friends.map((f) => (
          <li key={f.id} className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--panel)] p-3">
            <span className="text-2xl">{f.avatar}</span>
            <Link href={`/players/${f.id}`} className="min-w-0 flex-1 truncate font-bold hover:text-[#a78bfa]">
              {f.username}
            </Link>
            <span className="text-xs text-[var(--muted)]">
              {Math.round(f.bestWpm)} WPM · {f.accuracy.toFixed(0)}%
            </span>
            <button className="btn btn-ghost !min-h-9 text-xs" onClick={() => act({ action: "challenge", friendId: f.id })}>
              ⚔️ Challenge
            </button>
            <button className="btn btn-ghost !min-h-9 text-xs" onClick={() => act({ action: "remove", friendId: f.id })}>
              Remove
            </button>
          </li>
        ))}
        {friends.length === 0 && <li className="text-sm text-[var(--muted)]">No friends yet. Add a player above to compare stats and send challenges.</li>}
      </ul>
    </section>
  );
}
