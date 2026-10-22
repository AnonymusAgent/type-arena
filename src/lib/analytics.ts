/**
 * Optional Google Analytics 4 support.
 *
 * No GA4 property is hard-coded: set NEXT_PUBLIC_GA_MEASUREMENT_ID to a real `G-XXXXXXX` ID.
 * The tag only loads after the visitor grants analytics consent. Events never contain
 * personal data (no usernames, emails, session tokens or raw keystrokes).
 */

const RAW_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ?? "";
export const GA_MEASUREMENT_ID = /^G-[A-Z0-9]{6,}$/i.test(RAW_ID) ? RAW_ID : "";
export const GA_ENABLED = GA_MEASUREMENT_ID.length > 0;

type GtagFn = (command: string, ...args: unknown[]) => void;

export function gtag(...args: unknown[]) {
  if (typeof window === "undefined") return;
  const w = window as unknown as { gtag?: GtagFn; dataLayer?: unknown[] };
  if (typeof w.gtag === "function") w.gtag(...(args as [string, ...unknown[]]));
}

type EventParams = Record<string, string | number | boolean>;

/** Fire a GA4 event. A no-op when the tag has not been loaded (consent not granted / no ID). */
export function trackEvent(name: string, params: EventParams = {}) {
  if (!GA_ENABLED) return;
  gtag("event", name, params);
}

/** Privacy-safe page_view for App Router client-side navigation. */
export function trackPageView(path: string) {
  if (!GA_ENABLED) return;
  gtag("event", "page_view", { page_path: path });
}
