import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CookieSettings from "./cookie-settings";
import { SITE_OWNER, SUPPORT_EMAIL } from "@/lib/site";

type Section = { heading: string; body?: string[]; list?: string[] };

type Doc = {
  title: string;
  description: string;
  updated: string;
  intro: string;
  sections: Section[];
};

const DOCS: Record<string, Doc> = {
  privacy: {
    title: "Privacy Policy",
    description: "How Type Arena collects, uses and protects data, including cookies, Google AdSense advertising and your privacy choices.",
    updated: "22 October 2026",
    intro: `Type Arena is operated by ${SITE_OWNER} This policy explains what we store, why we store it, and the control you have over advertising, analytics and your account data. It covers the website at type-arena-silk.vercel.app and any custom domain that serves the same application.`,
    sections: [
      {
        heading: "1. Information we store",
        body: [
          "We keep the minimum amount of data needed to run the service. You can play every typing game and take the typing test without an account.",
        ],
        list: [
          "Account data (only if you sign up): username, email address and a password stored as a salted scrypt hash — never in plain text.",
          "Gameplay data: the results you submit (WPM, accuracy, score, duration, game slug), plus XP, coins, achievements, streaks and leaderboard position.",
          "Social data you create: friend connections, challenges and notification records.",
          "Preferences kept in your browser: theme, sound, local best scores, weak-key analysis and your cookie choice.",
        ],
      },
      {
        heading: "2. Cookies and local storage",
        body: [
          "One essential cookie keeps you signed in: ta_session (SameSite=Lax, Secure over HTTPS) with a companion ta_session_x cookie for embedded contexts. Both are carriers for a random session token; the database remains the single source of truth. They are required for authentication and cannot be disabled while you remain logged in.",
          "Preferences and your consent decision are stored in your browser's localStorage (ta_theme, ta_sound, ta_key_errors, ta_consent), not in cookies. Clearing site data removes them.",
          "Advertising and analytics cookies are described in sections 3 and 4. They are only used after you give permission through our consent prompt or the Cookie Settings page.",
        ],
      },
      {
        heading: "3. Advertising (Google AdSense)",
        body: [
          "Type Arena is free and funded by advertising. We use Google AdSense to display a small number of clearly labelled ads between content sections. Ads never appear inside an active typing test, a game interface, its controls or its results analysis.",
          "When you consent to advertising, Google and its partners may use cookies and similar technologies to serve and measure ads. Third-party vendors, including Google, use cookies to serve ads based on your prior visits to this and other websites. Google's use of advertising cookies enables it and its partners to serve ads to you based on your visit to this site and/or other sites on the Internet.",
          "You can opt out of personalised advertising at any time from Google Ads Settings (https://adssettings.google.com) and review industry opt-outs at https://www.aboutads.info/choices/ and, in Europe, https://www.youronlinechoices.eu/. In the European Economic Area, the United Kingdom and Switzerland, Google requires a Google-certified consent management platform for ads; the consent message presented on this site is used to obtain and record your choice before any ad request is made.",
          "If you decline advertising, no AdSense script is loaded and no ad is requested or displayed. You can change your decision at any time on the Cookie Settings page.",
        ],
      },
      {
        heading: "4. Analytics",
        body: [
          "If a Google Analytics 4 property is configured for this deployment, it loads only after you grant analytics consent. It records page views and aggregate interaction events such as a game start or a completed typing test. We send anonymous, non-identifying values only: game slug, WPM, accuracy and duration. We never send usernames, email addresses, passwords, authentication tokens, raw keystrokes or other account identifiers.",
        ],
      },
      {
        heading: "5. How we use data",
        list: [
          "To authenticate you and keep you signed in.",
          "To calculate and display results, XP, achievements, challenges and leaderboards.",
          "To keep the site secure, prevent automated score submission and fix errors.",
          "To measure aggregate usage so we can improve the games and the typing test.",
          "To serve advertising that funds the service, and to measure its performance in aggregate.",
        ],
      },
      {
        heading: "6. Sharing and processors",
        body: [
          "We do not sell your personal data. Data is shared only with service providers that operate the site: a managed PostgreSQL host for storage, Vercel for hosting and delivery, and — with your consent — Google for advertising and analytics. Those providers process data under their own terms and privacy policies.",
        ],
      },
      {
        heading: "7. Retention and deletion",
        body: [
          `Account and gameplay data are kept while your account exists. You can request deletion of your account and associated data by emailing ${SUPPORT_EMAIL}. Some anonymised aggregate records (for example total session counts) may remain. Consent choices stay in your browser until you change them or clear site data.`,
        ],
      },
      {
        heading: "8. Your rights",
        body: [
          "Depending on where you live, you may have the right to access, correct, export or delete your personal data, to object to processing, and to withdraw consent at any time. Advertising and analytics consent can be changed on the Cookie Settings page without affecting essential functionality. For any other request, contact us and we will respond within the time required by applicable law.",
        ],
      },
      {
        heading: "9. Children",
        body: [
          "Type Arena is not directed at children under 13 and we do not knowingly collect personal data from them. If you believe a child has created an account, contact us and we will remove it. No personalised advertising is requested without consent, regardless of age.",
        ],
      },
      {
        heading: "10. Changes and contact",
        body: [
          `We may update this policy as the service or the law changes; the "last updated" date above will change with it. Questions about privacy can be sent to ${SUPPORT_EMAIL}.`,
        ],
      },
    ],
  },
  terms: {
    title: "Terms of Service",
    description: "The rules for using Type Arena, including accounts, acceptable use, advertising and intellectual property.",
    updated: "22 October 2026",
    intro: `These terms are an agreement between you and ${SITE_OWNER} for use of Type Arena. By using the site you accept them. If you do not agree, please do not use the service.`,
    sections: [
      {
        heading: "1. The service",
        body: [
          "Type Arena is a free browser-based typing platform offering typing tests, practice drills, games and competitive features. It is provided as-is and may change, be suspended or be discontinued at any time. No purchase is required; coins and cosmetic items have no monetary value and cannot be exchanged for cash.",
        ],
      },
      {
        heading: "2. Accounts",
        body: [
          "You may play as a guest. An account is only needed to persist XP, coins, achievements and leaderboard positions. Keep your password safe and do not share your account. We may suspend accounts that break these terms.",
        ],
      },
      {
        heading: "3. Fair play",
        list: [
          "Do not cheat, script, automate or use input emulation to produce scores.",
          "Scores produced by automation may be removed and accounts may be suspended.",
          "Usernames must be respectful; reported names are reviewed by moderators.",
          "Do not attempt to bypass access controls, scrape services at scale or attack the site.",
        ],
      },
      {
        heading: "4. Advertising",
        body: [
          "The service is supported by advertising. Ads are labelled and kept outside active gameplay. You agree not to click ads artificially, use automated browsing to inflate impressions, or encourage others to click ads. Visitors who decline advertising consent will not be served ads.",
        ],
      },
      {
        heading: "5. Intellectual property",
        body: [
          "All software, game logic, artwork, branding and written content on Type Arena are the property of Webloom Inc. and may not be reproduced or redistributed without written permission. Third-party names and trademarks belong to their owners.",
        ],
      },
      {
        heading: "6. Availability and disclaimers",
        body: [
          "The service is provided without warranties of any kind to the extent permitted by law. We do not guarantee uninterrupted availability, error-free operation or any particular typing improvement. Leaderboards and statistics are provided for entertainment and practice.",
        ],
      },
      {
        heading: "7. Limitation of liability",
        body: [
          "To the maximum extent permitted by law, Webloom Inc. is not liable for indirect, incidental or consequential damages, or for any loss of data, arising from use of the service. Nothing in these terms limits liability that cannot be limited by law.",
        ],
      },
      {
        heading: "8. Changes and contact",
        body: [
          `We may update these terms; continued use after a change means you accept the updated version. Questions can be sent to ${SUPPORT_EMAIL}.`,
        ],
      },
    ],
  },
  cookies: {
    title: "Cookie Settings",
    description: "Review and change your cookies and advertising consent for Type Arena, and see exactly which technologies we use.",
    updated: "22 October 2026",
    intro:
      "You are in control of everything that is not strictly required to run Type Arena. Essential sign-in cookies are always active; analytics and advertising are optional and off until you opt in.",
    sections: [
      {
        heading: "What is stored",
        list: [
          "Essential — ta_session / ta_session_x: keeps you signed in. Always active while logged in. Set by Type Arena, stored server-side.",
          "Preferences — localStorage (ta_theme, ta_sound, ta_key_errors): remembers appearance, sound and your practice weak keys. Set only in your browser.",
          "Analytics — optional. Loads Google Analytics 4 only if a measurement ID is configured and you grant analytics consent.",
          "Advertising — optional. Loads Google AdSense only after advertising consent, which lets Google and its partners set advertising cookies to serve and measure ads.",
        ],
      },
      {
        heading: "Change your choice",
        body: [
          "Use the controls below to grant or withdraw consent. Withdrawing advertising consent stops new ad requests; a previously loaded Google script may remain until you reload the page. You can also clear all site data in your browser to start fresh.",
        ],
      },
      {
        heading: "More information",
        body: [
          "Our Privacy Policy explains the legal basis, retention and your rights. Google's advertising controls are available at https://adssettings.google.com, with industry opt-outs at https://www.aboutads.info/choices/ and https://www.youronlinechoices.eu/.",
        ],
      },
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(DOCS).map((doc) => ({ doc }));
}

export async function generateMetadata({ params }: { params: Promise<{ doc: string }> }): Promise<Metadata> {
  const { doc } = await params;
  const d = DOCS[doc];
  return d
    ? {
        title: d.title,
        description: d.description,
        alternates: { canonical: `/legal/${doc}` },
      }
    : { title: "Not found" };
}

export default async function LegalPage({ params }: { params: Promise<{ doc: string }> }) {
  const { doc } = await params;
  const d = DOCS[doc];
  if (!d) notFound();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-16">
      <nav aria-label="Breadcrumb" className="mb-4 text-xs text-[var(--muted)]">
        <Link href="/">Home</Link> / <span className="text-[var(--text)]">{d.title}</span>
      </nav>
      <h1 className="text-3xl font-black sm:text-4xl">{d.title}</h1>
      <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-[var(--muted)]">Last updated {d.updated}</p>
      <p className="mt-5 text-sm leading-relaxed text-[var(--muted)]">{d.intro}</p>

      {doc === "cookies" && <CookieSettings />}

      <div className="mt-8 space-y-8">
        {d.sections.map((section) => (
          <section key={section.heading} aria-labelledby={`h-${section.heading.replace(/\W+/g, "-")}`}>
            <h2 id={`h-${section.heading.replace(/\W+/g, "-")}`} className="text-xl font-black">
              {section.heading}
            </h2>
            {section.body?.map((p) => (
              <p key={p} className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                {p}
              </p>
            ))}
            {section.list && (
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-[var(--muted)]">
                {section.list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-4 border-t border-[var(--border)] pt-5 text-sm">
        <Link href="/legal/privacy" className="text-[var(--brand)] underline underline-offset-2">
          Privacy Policy
        </Link>
        <Link href="/legal/terms" className="text-[var(--brand)] underline underline-offset-2">
          Terms of Service
        </Link>
        <Link href="/legal/cookies" className="text-[var(--brand)] underline underline-offset-2">
          Cookie Settings
        </Link>
        <a href={`mailto:${SUPPORT_EMAIL}`} className="text-[var(--brand)] underline underline-offset-2">
          Contact
        </a>
      </div>

      <p className="mt-6 font-mono text-[11px] leading-relaxed text-[var(--muted)]">
        © {new Date().getFullYear()} {SITE_OWNER}. Type Arena is a product of {SITE_OWNER}. {SUPPORT_EMAIL}
      </p>
    </div>
  );
}
