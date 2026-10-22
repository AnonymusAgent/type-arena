/**
 * Central site configuration.
 *
 * Public identifiers only — never put secrets in a `NEXT_PUBLIC_*` variable,
 * because Next.js inlines them into the client bundle.
 */

const FALLBACK_SITE_URL = "https://type-arena-silk.vercel.app";

function normaliseUrl(value: string | undefined, fallback: string) {
  const raw = value?.trim();
  if (!raw) return fallback;
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    return new URL(withProtocol).origin;
  } catch {
    return fallback;
  }
}

/** Canonical production origin. Set NEXT_PUBLIC_SITE_URL to override (e.g. a custom domain). */
export const SITE_URL = normaliseUrl(process.env.NEXT_PUBLIC_SITE_URL, FALLBACK_SITE_URL);

export const SITE_NAME = "Type Arena";
export const SITE_OWNER = "Webloom Inc.";
export const SUPPORT_EMAIL = "support@typearena.gg";

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}
