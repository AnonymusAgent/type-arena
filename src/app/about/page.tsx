import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About, Contact & FAQ",
  description: "Learn about Type Arena, contact the team and read answers to frequently asked questions about our typing games and leaderboards.",
};

const FAQ = [
  { q: "Is Type Arena free?", a: "Yes. Every game, test and drill is free. Coins only buy cosmetic items — gameplay is never pay-to-win." },
  { q: "Do I need an account?", a: "No. Guests can play everything. An account is only required to permanently save XP, coins, achievements, statistics and leaderboard rank." },
  { q: "How is WPM calculated?", a: "Words per minute = (correct characters ÷ 5) ÷ (elapsed minutes). This is the standard definition used by professional typing tests." },
  { q: "Does it work on phones?", a: "Yes. Every game adapts to touch screens and small viewports, with large touch targets and a bottom navigation bar." },
  { q: "Can I use it in a classroom?", a: "Absolutely. Alphabet Adventure and Practice Mode were built with students in mind, and progress is tracked per account." },
];

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-16">
      <h1 className="text-3xl font-black sm:text-4xl">About Type Arena</h1>
      <p className="mt-4 text-[var(--muted)]">
        Type Arena is an original competitive typing platform built around one idea: practice is more effective when it feels like a game. We combine a
        professional typing trainer, an arcade, a racing game and a social leaderboard into a single fast, accessible web app.
      </p>
      <p className="mt-3 text-[var(--muted)]">
        Everything here — the games, the artwork, the branding and the progression systems — is our own work.
      </p>

      <h2 id="contact" className="mt-10 text-2xl font-black">
        Contact
      </h2>
      <p className="mt-2 text-[var(--muted)]">
        Support: <a className="text-[#a78bfa]" href="mailto:support@typearena.gg">support@typearena.gg</a> · Press:{" "}
        <a className="text-[#a78bfa]" href="mailto:press@typearena.gg">press@typearena.gg</a>
      </p>

      <h2 id="faq" className="mt-10 text-2xl font-black">
        FAQ
      </h2>
      <dl className="mt-4 space-y-3">
        {FAQ.map((f) => (
          <div key={f.q} className="panel rounded-2xl p-4">
            <dt className="font-bold">{f.q}</dt>
            <dd className="mt-1 text-sm text-[var(--muted)]">{f.a}</dd>
          </div>
        ))}
      </dl>

      <section className="panel mt-10 rounded-2xl p-5">
        <h2 className="font-black">Built by Webloom Inc.</h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
          Type Arena is designed, engineered and operated by <strong className="text-[var(--text)]">Webloom Inc.</strong> All game logic, artwork, branding
          and progression systems are original works of Webloom Inc.
        </p>
        <p className="mt-3 font-mono text-[11px] text-[var(--muted)]">© {new Date().getFullYear()} Webloom Inc. All rights reserved.</p>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
          }),
        }}
      />
    </div>
  );
}
