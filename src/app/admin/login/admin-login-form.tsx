"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ExternalLink, Info, KeyRound, Lock, RotateCcw, ShieldAlert, User } from "lucide-react";
import { checkSession, isEmbeddedFrame } from "@/lib/session-client";

type Props = { next: string; accessCodeRequired: boolean; signedInAs: string | null };

export default function AdminLoginForm({ next, accessCodeRequired, signedInAs }: Props) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [cookieBlocked, setCookieBlocked] = useState(false);
  const [embedded, setEmbedded] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => setEmbedded(isEmbeddedFrame()), []);

  const standaloneUrl = `/admin/login?next=${encodeURIComponent(next)}`;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setCookieBlocked(false);
    try {
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        cache: "no-store",
        body: JSON.stringify({ identifier, password, accessCode, next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Access denied.");
        setBusy(false);
        return;
      }
      // Make sure the browser really kept the session before leaving this page;
      // otherwise /admin would just send us straight back here.
      const session = await checkSession();
      if (!session.isAdmin) {
        setCookieBlocked(true);
        setBusy(false);
        return;
      }
      // Full navigation so the dashboard is rendered fresh with the new session cookie.
      window.location.replace(typeof data.redirect === "string" ? data.redirect : next);
    } catch {
      setError("Could not reach the arena services. Check your connection and try again.");
      setBusy(false);
    }
  };

  const resetSignIn = async () => {
    setResetting(true);
    await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" }).catch(() => {});
    window.location.replace(standaloneUrl);
  };

  return (
    <form onSubmit={submit} className="panel w-full max-w-md rounded-3xl p-6 sm:p-8" noValidate={false}>
      <span className="inline-flex items-center gap-2 rounded-lg border border-[#c5fb56]/30 bg-[#c5fb56]/10 px-3 py-1.5 font-mono text-[10px] font-bold tracking-wider text-[#c5fb56]">
        <Lock size={12} aria-hidden="true" /> RESTRICTED AREA
      </span>
      <h1 className="mt-5 text-3xl font-bold tracking-tight">Operator sign-in</h1>
      <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
        The Type Arena control panel is password protected. Sign in with an administrator account to continue.
      </p>

      {signedInAs && !cookieBlocked && (
        <p className="mt-5 flex items-start gap-2 rounded-xl border border-[var(--border)] bg-[var(--panel)] p-3 text-sm text-[var(--muted)]">
          <Info size={16} className="mt-0.5 shrink-0 text-[#63e5e4]" aria-hidden="true" />
          <span>
            You&apos;re signed in as <strong className="text-[var(--text)]">{signedInAs}</strong>, which isn&apos;t an administrator account. Signing in below
            will switch accounts.
          </span>
        </p>
      )}

      {error && (
        <p role="alert" className="mt-5 flex items-start gap-2 rounded-xl border border-rose-500/45 bg-rose-500/10 p-3 text-sm text-rose-200">
          <ShieldAlert size={16} className="mt-0.5 shrink-0" aria-hidden="true" /> {error}
        </p>
      )}

      {cookieBlocked && (
        <div role="alert" className="mt-5 rounded-xl border border-amber-400/50 bg-amber-400/10 p-4 text-sm">
          <p className="font-bold text-amber-200">Password accepted, but this browser blocked the sign-in cookie.</p>
          <p className="mt-1.5 leading-relaxed text-[var(--muted)]">
            {embedded
              ? "Type Arena is open inside another site's preview frame, and your browser doesn't allow cookies there."
              : "Cookies appear to be disabled or blocked for this site."}{" "}
            Open the control panel in its own tab to finish signing in.
          </p>
          <a href={standaloneUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary mt-3 w-full text-sm">
            Open in a new tab <ExternalLink size={15} aria-hidden="true" />
          </a>
        </div>
      )}

      <div className="mt-5 space-y-4">
        <label className="block">
          <span className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">Admin username or email</span>
          <span className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 focus-within:border-[#c5fb56]">
            <User size={16} className="shrink-0 text-[var(--muted)]" aria-hidden="true" />
            <input
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              autoComplete="username"
              autoCapitalize="off"
              spellCheck={false}
              aria-label="Admin username or email"
              className="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none"
              placeholder="arena_admin"
            />
          </span>
        </label>

        <label className="block">
          <span className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">Password</span>
          <span className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 focus-within:border-[#c5fb56]">
            <Lock size={16} className="shrink-0 text-[var(--muted)]" aria-hidden="true" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              aria-label="Admin password"
              className="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none"
              placeholder="••••••••"
            />
          </span>
        </label>

        {accessCodeRequired && (
          <label className="block">
            <span className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">Operator key</span>
            <span className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 focus-within:border-[#c5fb56]">
              <KeyRound size={16} className="shrink-0 text-[var(--muted)]" aria-hidden="true" />
              <input
                type="password"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                required
                aria-label="Operator key"
                className="h-12 min-w-0 flex-1 bg-transparent font-mono text-sm outline-none"
                placeholder="ADMIN_ACCESS_CODE"
              />
            </span>
          </label>
        )}
      </div>

      <button className="btn btn-primary mt-6 w-full" disabled={busy || resetting}>
        {busy ? "Verifying…" : "Unlock dashboard"}
      </button>

      {embedded && !cookieBlocked && (
        <p className="mt-3 text-center text-xs text-[var(--muted)]">
          Viewing inside a preview frame?{" "}
          <a href={standaloneUrl} target="_blank" rel="noopener noreferrer" className="font-bold text-[var(--brand)] hover:underline">
            Open in its own tab
          </a>
        </p>
      )}

      <div className="mt-5 border-t border-[var(--border)] pt-4">
        <p className="font-mono text-[10px] leading-relaxed text-[var(--muted)]">
          Demo operator account — <strong className="text-[var(--text)]">arena_admin</strong> / <strong className="text-[var(--text)]">admin1234</strong>. Failed
          attempts are throttled to 5 per 10 minutes.
        </p>
        <button
          type="button"
          onClick={() => void resetSignIn()}
          disabled={resetting}
          className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-xs font-bold text-[var(--muted)] hover:text-[var(--brand)]"
        >
          <RotateCcw size={13} aria-hidden="true" /> {resetting ? "Clearing session…" : "Stuck? Reset sign-in and clear session cookies"}
        </button>
      </div>

      <div className="mt-2 flex items-center justify-between gap-3">
        <Link href="/" className="inline-flex min-h-11 items-center text-xs font-bold text-[var(--brand)] hover:underline">
          ← Back to the arena
        </Link>
        <span className="font-mono text-[10px] text-[var(--muted)]">© {new Date().getFullYear()} Webloom Inc.</span>
      </div>
    </form>
  );
}
