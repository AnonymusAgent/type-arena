"use client";

import Script from "next/script";
import { ADSENSE_LIVE, adsenseScriptSrc } from "@/lib/adsense";
import { useConsent } from "@/components/consent/consent-provider";

/**
 * Loads the official AdSense tag exactly once for the whole app.
 *
 * - Rendered from the root layout, so client-side navigation never re-injects it.
 * - Gated on advertising consent, so no request is made before the visitor opts in.
 * - `afterInteractive` keeps it off the critical path (it does not block game start or input).
 * - Only ever loads in `live` mode (production + enabled + real publisher ID).
 */
export default function AdSenseScript() {
  const { ready, consent } = useConsent();

  if (!ADSENSE_LIVE || !ready || !consent?.ads) return null;

  return (
    <Script
      id="google-adsense"
      async
      strategy="afterInteractive"
      crossOrigin="anonymous"
      src={adsenseScriptSrc()}
      // Same URL/key across route changes, so Next.js de-duplicates the tag.
    />
  );
}
