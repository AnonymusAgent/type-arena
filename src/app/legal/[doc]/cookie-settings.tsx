"use client";

import { useState } from "react";
import { useApp } from "@/components/providers";
import { useConsent } from "@/components/consent/consent-provider";

export default function CookieSettings() {
  const { toast } = useApp();
  const { consent, ready, save, acceptAll, rejectNonEssential } = useConsent();
  // A local draft lets the visitor toggle before saving without a state-syncing effect.
  const [draft, setDraft] = useState<{ analytics: boolean; ads: boolean } | null>(null);
  const analytics = draft?.analytics ?? consent?.analytics === true;
  const ads = draft?.ads ?? consent?.ads === true;

  const changed = ready && consent !== null && (analytics !== consent.analytics || ads !== consent.ads);

  return (
    <section className="panel mt-8 rounded-2xl p-5" aria-labelledby="consent-controls">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="consent-controls" className="font-black">
          Manage preferences
        </h2>
        <span className="rounded-lg border border-[var(--border)] px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-[var(--muted)]">
          {!ready ? "Checking…" : consent ? `Saved ${new Date(consent.updatedAt).toLocaleDateString()}` : "Not set yet"}
        </span>
      </div>

      <ul className="mt-3 space-y-3 text-sm">
        <li className="flex items-center justify-between gap-3">
          <span>
            <span className="font-semibold">Essential (authentication)</span>
            <span className="block text-xs text-[var(--muted)]">Sign-in cookie. Required — cannot be switched off.</span>
          </span>
          <span className="shrink-0 rounded-lg bg-emerald-500/15 px-2 py-1 text-xs font-bold text-emerald-400">Always on</span>
        </li>
        <li className="flex items-center justify-between gap-3">
          <label htmlFor="analytics" className="min-w-0">
            <span className="font-semibold">Analytics</span>
            <span className="block text-xs text-[var(--muted)]">Anonymous Google Analytics 4 page views and gameplay events.</span>
          </label>
          <input
            id="analytics"
            type="checkbox"
            className="h-6 w-6 shrink-0"
            checked={analytics}
            onChange={(e) => setDraft({ analytics: e.target.checked, ads })}
          />
        </li>
        <li className="flex items-center justify-between gap-3">
          <label htmlFor="ads" className="min-w-0">
            <span className="font-semibold">Advertising</span>
            <span className="block text-xs text-[var(--muted)]">Google AdSense, including personalised ads and ad measurement.</span>
          </label>
          <input id="ads" type="checkbox" className="h-6 w-6 shrink-0" checked={ads} onChange={(e) => setDraft({ analytics, ads: e.target.checked })} />
        </li>
      </ul>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          className="btn btn-primary"
          onClick={() => {
            save({ analytics, ads });
            setDraft(null);
            toast("Cookie preferences saved.", "success");
          }}
          disabled={!ready}
        >
          Save preferences
        </button>
        <button
          className="btn btn-ghost"
          onClick={() => {
            acceptAll();
            setDraft(null);
            toast("All optional cookies accepted.", "success");
          }}
        >
          Accept all
        </button>
        <button
          className="btn btn-ghost"
          onClick={() => {
            rejectNonEssential();
            setDraft(null);
            toast("Optional cookies rejected. No ads will be shown.", "success");
          }}
        >
          Essential only
        </button>
      </div>

      {changed && <p className="mt-3 text-xs text-[var(--muted)]">You have unsaved changes. Choose “Save preferences” to apply them.</p>}
    </section>
  );
}
