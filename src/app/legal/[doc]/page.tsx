import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CookieSettings from "./cookie-settings";

const DOCS: Record<string, { title: string; body: string[] }> = {
  privacy: {
    title: "Privacy Policy",
    body: [
      "We store the minimum data needed to run Type Arena: your username, email, hashed password, game results and progression.",
      "Passwords are hashed with scrypt and a unique per-user salt. We never store plain-text passwords.",
      "Guest play stores nothing on our servers; personal bests for guests live only in your browser's local storage.",
      "You can request deletion of your account and all associated data at any time by emailing support@typearena.gg.",
    ],
  },
  terms: {
    title: "Terms of Service",
    body: [
      "Type Arena is provided free of charge for personal and educational use.",
      "Do not cheat, script, or automate gameplay. Scores produced by automation will be removed and accounts may be suspended.",
      "Usernames must be respectful. Reported usernames are reviewed by moderators.",
      "Coins and cosmetic items have no monetary value and cannot be exchanged for cash.",
      "All software, game logic, artwork, branding and written content on Type Arena are the exclusive property of Webloom Inc. and may not be reproduced without written permission.",
      "Attempts to bypass access controls on restricted areas are prohibited and may result in account termination.",
    ],
  },
  cookies: {
    title: "Cookie Settings",
    body: [
      "We use one essential cookie to keep you signed in. It is required for authentication and cannot be disabled while logged in.",
      "Theme and sound preferences are stored in local storage, not cookies.",
      "We do not run third-party advertising or cross-site tracking cookies.",
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(DOCS).map((doc) => ({ doc }));
}

export async function generateMetadata({ params }: { params: Promise<{ doc: string }> }): Promise<Metadata> {
  const { doc } = await params;
  const d = DOCS[doc];
  return d ? { title: d.title, description: `${d.title} for Type Arena.` } : { title: "Not found" };
}

export default async function LegalPage({ params }: { params: Promise<{ doc: string }> }) {
  const { doc } = await params;
  const d = DOCS[doc];
  if (!d) notFound();
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-16">
      <h1 className="text-3xl font-black sm:text-4xl">{d.title}</h1>
      <div className="mt-5 space-y-3 text-[var(--muted)]">
        {d.body.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>
      {doc === "cookies" && <CookieSettings />}

      <p className="mt-10 border-t border-[var(--border)] pt-5 font-mono text-[11px] leading-relaxed text-[var(--muted)]">
        © {new Date().getFullYear()} Webloom Inc. Type Arena is a product of Webloom Inc. · support@typearena.gg
      </p>
    </div>
  );
}
