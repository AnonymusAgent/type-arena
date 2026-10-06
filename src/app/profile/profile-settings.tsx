"use client";

import { useState } from "react";
import { useApp } from "@/components/providers";

const AVATARS = ["🐱", "🦊", "🐼", "🐧", "🦁", "🐲", "👾", "🤖", "🦉", "🐸"];

export default function ProfileSettings({ user }: { user: { username: string; avatar: string; country: string } }) {
  const { toast, refresh, logout, theme, toggleTheme, sound, toggleSound } = useApp();
  const [avatar, setAvatar] = useState(user.avatar);
  const [country, setCountry] = useState(user.country);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const res = await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ avatar, country }) });
    setSaving(false);
    if (res.ok) {
      await refresh();
      toast("Profile updated.", "success");
    } else toast("Could not update profile.", "error");
  };

  return (
    <section className="panel mt-5 rounded-2xl p-5" id="settings">
      <h2 className="mb-3 font-black">Profile settings</h2>
      <fieldset>
        <legend className="mb-2 text-xs font-bold uppercase text-[var(--muted)]">Avatar</legend>
        <div className="flex flex-wrap gap-2">
          {AVATARS.map((a) => (
            <button
              key={a}
              onClick={() => setAvatar(a)}
              aria-pressed={avatar === a}
              aria-label={`Choose avatar ${a}`}
              className={`grid h-12 w-12 place-items-center rounded-xl border text-2xl ${avatar === a ? "border-[#7c5cff] bg-[#7c5cff]/15" : "border-[var(--border)]"}`}
            >
              {a}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="country" className="block text-xs font-bold uppercase text-[var(--muted)]">
            Country code
          </label>
          <input
            id="country"
            value={country}
            maxLength={2}
            onChange={(e) => setCountry(e.target.value.toUpperCase())}
            className="mt-1 h-11 w-24 rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 uppercase outline-none"
          />
        </div>
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          Save changes
        </button>
        <button className="btn btn-ghost" onClick={toggleTheme}>
          Theme: {theme}
        </button>
        <button className="btn btn-ghost" onClick={toggleSound}>
          Sound: {sound ? "on" : "off"}
        </button>
        <button className="btn btn-ghost" onClick={() => void logout().then(() => location.assign("/"))}>
          Log out
        </button>
      </div>
    </section>
  );
}
