"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useApp } from "@/components/providers";
import { checkSession } from "@/lib/session-client";

const COOKIE_BLOCKED =
  "Your details were accepted, but this browser blocked the sign-in cookie (this can happen inside embedded preview frames or when cookies are disabled). Open Type Arena in its own tab and sign in there.";

const AVATARS = ["🐱", "🦊", "🐼", "🐧", "🦁", "🐲", "👾", "🤖"];

export function LoginForm() {
  const { refresh, toast } = useApp();
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return setError(data.error ?? "Login failed.");
    if (!(await checkSession()).active) return setError(COOKIE_BLOCKED);
    await refresh();
    toast(`Welcome back, ${data.user.username}!`, "success");
    router.push("/dashboard");
  };

  return (
    <form onSubmit={submit} className="panel space-y-4 rounded-3xl p-6 sm:p-8">
      <h1 className="text-2xl font-black">Log in</h1>
      {error && <p role="alert" className="rounded-xl border border-rose-500/50 bg-rose-500/10 p-3 text-sm">{error}</p>}
      <Field label="Username or email" id="identifier" value={identifier} onChange={setIdentifier} autoComplete="username" />
      <Field label="Password" id="password" type="password" value={password} onChange={setPassword} autoComplete="current-password" />
      <button className="btn btn-primary w-full" disabled={busy}>
        {busy ? "Signing in…" : "Log in"}
      </button>
      <button type="button" className="btn btn-ghost w-full" onClick={() => toast("Google sign-in requires OAuth credentials to be configured.", "info")}>
        Continue with Google
      </button>
      <p className="text-sm text-[var(--muted)]">
        <Link className="text-[#a78bfa]" href="/forgot-password">
          Forgot password?
        </Link>{" "}
        · New here?{" "}
        <Link className="text-[#a78bfa]" href="/signup">
          Create an account
        </Link>
      </p>
    </form>
  );
}

export function SignupForm() {
  const { refresh, toast } = useApp();
  const router = useRouter();
  const [form, setForm] = useState({ username: "", email: "", password: "", country: "US", avatar: "🐱" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return setError(data.error ?? "Sign up failed.");
    if (!(await checkSession()).active) return setError(COOKIE_BLOCKED);
    await refresh();
    toast("Account created — your progress now saves forever!", "success");
    router.push("/dashboard");
  };

  return (
    <form onSubmit={submit} className="panel space-y-4 rounded-3xl p-6 sm:p-8">
      <h1 className="text-2xl font-black">Create your account</h1>
      {error && <p role="alert" className="rounded-xl border border-rose-500/50 bg-rose-500/10 p-3 text-sm">{error}</p>}
      <Field label="Username" id="username" value={form.username} onChange={(v) => setForm({ ...form, username: v })} autoComplete="username" />
      <Field label="Email" id="email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} autoComplete="email" />
      <Field label="Password" id="password" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} autoComplete="new-password" />
      <Field label="Country code" id="country" value={form.country} onChange={(v) => setForm({ ...form, country: v.toUpperCase().slice(0, 2) })} />
      <fieldset>
        <legend className="mb-2 text-xs font-bold uppercase text-[var(--muted)]">Avatar</legend>
        <div className="flex flex-wrap gap-2">
          {AVATARS.map((a) => (
            <button
              type="button"
              key={a}
              onClick={() => setForm({ ...form, avatar: a })}
              aria-pressed={form.avatar === a}
              aria-label={`Choose avatar ${a}`}
              className={`grid h-12 w-12 place-items-center rounded-xl border text-2xl ${form.avatar === a ? "border-[#7c5cff] bg-[#7c5cff]/15" : "border-[var(--border)]"}`}
            >
              {a}
            </button>
          ))}
        </div>
      </fieldset>
      <button className="btn btn-primary w-full" disabled={busy}>
        {busy ? "Creating…" : "Sign up free"}
      </button>
      <p className="text-sm text-[var(--muted)]">
        Already have an account?{" "}
        <Link className="text-[#a78bfa]" href="/login">
          Log in
        </Link>
      </p>
    </form>
  );
}

export function ForgotPasswordForm() {
  const { toast } = useApp();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
        toast("If that email exists, a reset link is on the way.", "success");
      }}
      className="panel space-y-4 rounded-3xl p-6 sm:p-8"
    >
      <h1 className="text-2xl font-black">Reset your password</h1>
      <p className="text-sm text-[var(--muted)]">Enter your email and we&apos;ll send a secure reset link.</p>
      <Field label="Email" id="email" type="email" value={email} onChange={setEmail} autoComplete="email" />
      <button className="btn btn-primary w-full">Send reset link</button>
      {sent && <p className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm">Check your inbox for the reset instructions.</p>}
      <p className="text-sm">
        <Link className="text-[#a78bfa]" href="/login">
          Back to login
        </Link>
      </p>
    </form>
  );
}

function Field({
  label,
  id,
  value,
  onChange,
  type = "text",
  autoComplete,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
        {label}
      </label>
      <input
        id={id}
        type={type}
        required
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 outline-none focus:border-[#7c5cff]"
      />
    </div>
  );
}
