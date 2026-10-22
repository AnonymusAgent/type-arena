/**
 * Google AdSense configuration.
 *
 * All values here are PUBLIC identifiers (a publisher ID and ad slot IDs are not secrets).
 * They use the `NEXT_PUBLIC_` prefix so the browser can reference the same values that the
 * server uses for `ads.txt` and the verification meta tag.
 *
 * Production ads render only when ALL of the following are true:
 *   1. NODE_ENV is "production"
 *   2. NEXT_PUBLIC_ADSENSE_ENABLED is exactly "true"   (set this in Vercel → Production only)
 *   3. NEXT_PUBLIC_ADSENSE_CLIENT is a real `ca-pub-<16 digits>` publisher ID
 *   4. The individual ad slot ID is a real numeric ID
 *   5. The visitor has granted advertising consent
 *
 * Until those are satisfied the site renders nothing ad-related in production, which prevents
 * accidental invalid traffic before the AdSense account/site is approved.
 */

const PLACEHOLDER_PATTERN = /REPLACE_WITH|^ca-pub-?$/i;
const PUBLISHER_PATTERN = /^ca-pub-\d{16}$/;

function clean(value: string | undefined) {
  return value?.trim() ?? "";
}

export const ADSENSE_CLIENT = clean(process.env.NEXT_PUBLIC_ADSENSE_CLIENT);
export const ADSENSE_SLOTS = {
  home: clean(process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME) || "REPLACE_WITH_HOME_AD_SLOT_ID",
  content: clean(process.env.NEXT_PUBLIC_ADSENSE_SLOT_CONTENT) || "REPLACE_WITH_CONTENT_AD_SLOT_ID",
  results: clean(process.env.NEXT_PUBLIC_ADSENSE_SLOT_RESULTS) || "REPLACE_WITH_RESULTS_AD_SLOT_ID",
} as const;

export type AdSlotName = keyof typeof ADSENSE_SLOTS;

const enabledFlag = process.env.NEXT_PUBLIC_ADSENSE_ENABLED === "true";
const isProduction = process.env.NODE_ENV === "production";
const isTestMode = process.env.NEXT_PUBLIC_ADSENSE_TEST_MODE === "true";

/** True only for a well-formed publisher ID that is not one of the documented placeholders. */
export function isValidPublisherId(value: string = ADSENSE_CLIENT) {
  return PUBLISHER_PATTERN.test(value) && !PLACEHOLDER_PATTERN.test(value);
}

/** True only for a numeric ad slot ID that is not one of the documented placeholders. */
export function isValidSlotId(value: string | undefined) {
  return Boolean(value && /^\d{6,}$/.test(value));
}

/**
 * `live`     — real ads may be requested (production, enabled, configured, consent granted).
 * `disabled` — do nothing at all (the default until real IDs are supplied).
 * `preview`  — show an inert, clearly-labelled development placeholder. Never loads AdSense.
 */
export type AdMode = "live" | "disabled" | "preview";

export function resolveAdMode(): AdMode {
  // Local development and explicit test mode never load AdSense — they show an inert
  // placeholder so placements can be verified without producing invalid traffic.
  if (!isProduction || isTestMode) return "preview";
  return enabledFlag && isValidPublisherId(ADSENSE_CLIENT) ? "live" : "disabled";
}

export const ADSENSE_MODE: AdMode = resolveAdMode();
export const ADSENSE_LIVE = ADSENSE_MODE === "live";

/** Public script URL used by the single site-wide loader. */
export function adsenseScriptSrc() {
  return `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(ADSENSE_CLIENT)}`;
}

export function slotIdFor(name: AdSlotName) {
  return ADSENSE_SLOTS[name];
}

/** Whether a specific placement can request an ad. Checked in the browser as well. */
export function isAdUnitConfigured(name: AdSlotName) {
  return ADSENSE_LIVE && isValidSlotId(ADSENSE_SLOTS[name]);
}

/**
 * The exact seller declaration for /ads.txt.
 *
 * Google's certification authority ID (f08c47fec0942fa0) is a public, fixed identifier —
 * it is the same for every AdSense publisher. Never change it. An owner-supplied
 * ADSENSE_ADS_TXT value takes precedence so a rewritten/expanded file can be dropped in
 * without a code change.
 */
export const GOOGLE_TAG_ID = "f08c47fec0942fa0";

export function adsTxtBody() {
  const custom = process.env.ADSENSE_ADS_TXT?.trim();
  if (custom) return `${custom}\n`;
  if (!isValidPublisherId(ADSENSE_CLIENT)) return null;
  const pubId = ADSENSE_CLIENT.replace(/^ca-/, "");
  return `google.com, ${pubId}, DIRECT, ${GOOGLE_TAG_ID}\n`;
}
