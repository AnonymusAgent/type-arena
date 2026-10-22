"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cookie, X } from "lucide-react";
import { useConsent } from "./consent-provider";

/**
 * Non-modal consent prompt. It never covers the typing surface, game controls or the
 * mobile navigation, and it disappears for good once a choice has been stored.
 */
export default function ConsentBanner() {
  const { ready, bannerOpen, acceptAll, rejectNonEssential, openBanner, closeBanner } = useConsent();
  const pathname = usePathname();

  // Do not interrupt an active game/test with the first-visit prompt. It is shown everywhere
  // else, and /legal/cookies always lets the visitor make or change a choice.
  const quietRoute = pathname?.startsWith("/games/") || pathname === "/typing-test" || pathname === "/practice";

  if (!ready || !bannerOpen || quietRoute) return null;

  return (
    <>
      <button
        type="button"
        onClick={openBanner}
        className="sr-only fixed left-3 top-20 z-[76] focus:not-sr-only focus:rounded-lg focus:bg-[var(--panel-solid)] focus:px-3 focus:py-2 focus:text-sm focus:font-bold"
      >
        Cookie settings
      </button>
      <aside
        aria-label="Privacy and cookie choices"
        className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+5.25rem)] z-[45] mx-auto max-w-xl rounded-2xl border border-[var(--border)] bg-[var(--panel-solid)] p-4 shadow-2xl md:inset-x-auto md:bottom-5 md:right-5 md:w-[26rem]"
      >
        <div className="flex items-start gap-3">
          <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[var(--border)] text-[var(--brand)]" aria-hidden="true">
            <Cookie size={16} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold">Your privacy, your call</p>
            <p className="mt-1 text-[12px] leading-relaxed text-[var(--muted)]">
              Essential cookies keep you signed in. With your permission we also use Google AdSense for advertising and anonymous
              analytics to improve the games. Nothing non-essential loads before you choose.{" "}
              <Link href="/legal/privacy" className="text-[var(--brand)] underline underline-offset-2">
                Privacy Policy
              </Link>
              .
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" className="btn btn-primary !min-h-9 !px-3 !text-xs" onClick={acceptAll}>
                Accept all
              </button>
              <button type="button" className="btn btn-ghost !min-h-9 !px-3 !text-xs" onClick={rejectNonEssential}>
                Essential only
              </button>
              <Link href="/legal/cookies" className="inline-flex min-h-9 items-center px-1 text-xs font-bold text-[var(--muted)] underline underline-offset-2">
                Manage
              </Link>
            </div>
          </div>
          <button
            type="button"
            onClick={closeBanner}
            aria-label="Dismiss without accepting (no optional cookies will be set)"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[var(--muted)] hover:text-[var(--text)]"
          >
            <X size={16} />
          </button>
        </div>
      </aside>
    </>
  );
}
