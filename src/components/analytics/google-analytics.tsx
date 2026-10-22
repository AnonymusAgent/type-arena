"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { GA_ENABLED, GA_MEASUREMENT_ID, trackPageView } from "@/lib/analytics";
import { useConsent } from "@/components/consent/consent-provider";

/**
 * Optional GA4 integration, consent-gated and App-Router aware.
 * If no measurement ID is configured this component renders nothing at all.
 */
export default function GoogleAnalytics() {
  const { ready, consent } = useConsent();
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  const active = GA_ENABLED && ready && consent?.analytics === true;

  useEffect(() => {
    if (!active || !pathname) return;
    if (lastPath.current === null) {
      lastPath.current = pathname; // initial page_view is sent by gtag config
      return;
    }
    if (lastPath.current !== pathname) {
      lastPath.current = pathname;
      trackPageView(pathname);
    }
  }, [active, pathname]);

  if (!active) return null;

  return (
    <>
      <Script
        id="ga4-loader"
        async
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script id="ga4-config" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}', { anonymize_ip: true, send_page_view: true });`}
      </Script>
    </>
  );
}
