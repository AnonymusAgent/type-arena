"use client";

import { useState } from "react";
import { useApp } from "@/components/providers";

export default function CookieSettings() {
  const { toast } = useApp();
  const [analytics, setAnalytics] = useState(false);
  const [personalisation, setPersonalisation] = useState(true);

  return (
    <section className="panel mt-8 rounded-2xl p-5">
      <h2 className="font-black">Manage preferences</h2>
      <ul className="mt-3 space-y-3 text-sm">
        <li className="flex items-center justify-between gap-3">
          <span>Essential (authentication)</span>
          <span className="rounded-lg bg-emerald-500/15 px-2 py-1 text-xs font-bold text-emerald-400">Always on</span>
        </li>
        <li className="flex items-center justify-between gap-3">
          <label htmlFor="analytics">Anonymous analytics</label>
          <input id="analytics" type="checkbox" className="h-6 w-6" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} />
        </li>
        <li className="flex items-center justify-between gap-3">
          <label htmlFor="personalisation">Gameplay personalisation</label>
          <input id="personalisation" type="checkbox" className="h-6 w-6" checked={personalisation} onChange={(e) => setPersonalisation(e.target.checked)} />
        </li>
      </ul>
      <button
        className="btn btn-primary mt-4"
        onClick={() => {
          localStorage.setItem("ta_cookie_prefs", JSON.stringify({ analytics, personalisation }));
          toast("Cookie preferences saved.", "success");
        }}
      >
        Save preferences
      </button>
    </section>
  );
}
